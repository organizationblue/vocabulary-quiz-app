import 'dotenv/config';
import express from 'express';
import type { NextFunction, Request, Response } from 'express';
import cors from 'cors';
import { getRandomWord, getRandomWords } from './service/wordService.js';
import { isSupportedLanguage, SUPPORTED_LANGUAGES } from './types/words.js';
import {
    formatZodError,
    getBearerToken,
    hashPassword,
    loginSchema,
    normalizeDisplayName,
    normalizeUsername,
    registerSchema,
    scoreSubmissionSchema,
    signAuthToken,
    toPublicUser,
    verifyAuthToken,
    verifyPassword,
} from './auth.js';
/** https://dev.to/qbentil/swagger-express-documenting-your-nodejs-rest-api-4lj7 */
import swaggerUi from 'swagger-ui-express';
import swaggerJSDoc from 'swagger-jsdoc';
import { prisma } from './lib/prisma.js';
import type { Language } from './types/words.js';

const PORT = process.env.PORT || 8080;
const DEFAULT_SOURCE_LANGUAGE: Language = 'finnish';
const DEFAULT_TARGET_LANGUAGE: Language = 'english';

export const app = express();

// CORS configuration
const corsOptions = {
  origin: [
    'https://vocabulary-quiz-app.onrender.com',  // Render frontend
    'http://localhost:3000',                       // Local development
    'http://localhost:8081',                       // Expo local
    'http://192.168.10.57:8081',                   // Expo on device (adjust IP as needed)
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
app.use((req: Request, res: Response, next) => {
  if (req.method === 'OPTIONS') {
    res.sendStatus(204);
    return;
  }

  next();
});
app.use(express.json());

   // Swagger definition
     const swaggerOptions = {
       swaggerDefinition: {
         openapi: '3.0.0',
         info: {
           title: 'My API',
           version: '1.0.0',
           description: 'API documentation using Swagger',
         },
         servers: [
           {
             url: `http://localhost:${PORT}`,
           },
         ],
         components: {
           schemas: {
            Word: {
              type: 'object',
              properties: {
                prompt: { type: 'string', description: 'Finnish word to translate' },
                answer: { type: 'string', description: 'Correct translation in the requested language' }
              }
            }
           }
         },
       },
       apis: ['./src/app.ts'], // Path to your API docs
     }

   const swaggerDocs = swaggerJSDoc(swaggerOptions);
   app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

const getLanguageSelection = (query: Request['query']) => {
    const sourceLanguage =
        (query.sourceLanguage as string | undefined) ?? DEFAULT_SOURCE_LANGUAGE;
    const targetLanguage =
        (query.targetLanguage as string | undefined) ??
        (query.language as string | undefined) ??
        DEFAULT_TARGET_LANGUAGE;

    return { sourceLanguage, targetLanguage };
};

const getInvalidLanguageMessage = (
    sourceLanguage: string,
    targetLanguage: string
): string | null => {
    if (!isSupportedLanguage(sourceLanguage)) {
        return `Unsupported source language "${sourceLanguage}". Supported: ${SUPPORTED_LANGUAGES.join(', ')}`;
    }

    if (!isSupportedLanguage(targetLanguage)) {
        return `Unsupported target language "${targetLanguage}". Supported: ${SUPPORTED_LANGUAGES.join(', ')}`;
    }

    if (sourceLanguage === targetLanguage) {
        return 'Source and target languages must be different';
    }

    return null;
};

const getAuthenticatedUser = async (req: Request) => {
    const token = getBearerToken(req.headers.authorization);

    if (!token) {
        return null;
    }

    const payload = verifyAuthToken(token);
    const user = await prisma.user.findUnique({
        where: { id: payload.userId },
    });

    if (!user || !user.username) {
        return null;
    }

    return user;
};

type AuthenticatedRequest = Request & {
    authUser?: Awaited<ReturnType<typeof prisma.user.findUnique>>;
};

const requireAuth = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const user = await getAuthenticatedUser(req);

        if (!user) {
            res.status(401).json({
                success: false,
                message: 'Authentication required',
            });
            return;
        }

        req.authUser = user;
        next();
    } catch (error) {
        res.status(401).json({
            success: false,
            message: 'Invalid or expired authentication token',
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
};

/**
 * @openapi
 * /api/auth/register:
 *   post:
 *     summary: Register a new user account
 */
app.post('/api/auth/register', async (req: Request, res: Response) => {
    try {
        const parsed = registerSchema.safeParse(req.body);

        if (!parsed.success) {
            res.status(400).json({
                success: false,
                message: formatZodError(parsed.error),
            });
            return;
        }

        const username = normalizeUsername(parsed.data.username);
        const displayName = normalizeDisplayName(parsed.data.displayName, username);

        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [{ username }, { nickname: username }],
            },
        });

        if (existingUser) {
            res.status(409).json({
                success: false,
                message: 'Username is already taken',
            });
            return;
        }

        const passwordHash = await hashPassword(parsed.data.password);
        const user = await prisma.user.create({
            data: {
                nickname: username,
                username,
                displayName,
                passwordHash,
            },
        });

        const publicUser = toPublicUser(user);
        const token = signAuthToken({
            userId: publicUser.id,
            username: publicUser.username,
        });

        res.status(201).json({
            success: true,
            data: {
                token,
                user: publicUser,
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to register user',
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
});

/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     summary: Log in to an existing user account
 */
app.post('/api/auth/login', async (req: Request, res: Response) => {
    try {
        const parsed = loginSchema.safeParse(req.body);

        if (!parsed.success) {
            res.status(400).json({
                success: false,
                message: formatZodError(parsed.error),
            });
            return;
        }

        const username = normalizeUsername(parsed.data.username);
        const user = await prisma.user.findUnique({
            where: { username },
        });

        if (!user?.passwordHash || !user.username) {
            res.status(401).json({
                success: false,
                message: 'Invalid username or password',
            });
            return;
        }

        const isPasswordValid = await verifyPassword(
            parsed.data.password,
            user.passwordHash
        );

        if (!isPasswordValid) {
            res.status(401).json({
                success: false,
                message: 'Invalid username or password',
            });
            return;
        }

        const publicUser = toPublicUser(user);
        const token = signAuthToken({
            userId: publicUser.id,
            username: publicUser.username,
        });

        res.status(200).json({
            success: true,
            data: {
                token,
                user: publicUser,
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to log in user',
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
});

/**
 * @openapi
 * /api/auth/me:
 *   get:
 *     summary: Get the currently authenticated user
 */
app.get('/api/auth/me', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    try {
        res.status(200).json({
            success: true,
            data: {
                user: toPublicUser(req.authUser!),
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch authenticated user',
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
});

/**
 * @openapi
 * /api/word:
 *   get:
 *     summary: Get a random word
 *     parameters:
 *       - in: query
 *         name: sourceLanguage
 *         schema:
 *           type: string
 *           enum: [finnish, english, swedish, german, spanish]
 *           default: finnish
 *         description: Language shown to the player
 *       - in: query
 *         name: targetLanguage
 *         schema:
 *           type: string
 *           enum: [finnish, english, swedish, german, spanish]
 *           default: english
 *         description: Language the player should translate into
 *     responses:
 *       200:
 *         description: A random word
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Word'
 *       400:
 *         description: Unsupported language
 */
app.get('/api/word', (req: Request, res: Response) => {
  try {
    const { sourceLanguage, targetLanguage } = getLanguageSelection(req.query);
    const invalidLanguageMessage = getInvalidLanguageMessage(sourceLanguage, targetLanguage);

    if (invalidLanguageMessage) {
      res.status(400).json({
        success: false,
        message: invalidLanguageMessage,
      });
      return;
    }

    const word = getRandomWord(sourceLanguage as Language, targetLanguage as Language);
    res.status(200).json({
      success: true,
      data: word,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch word',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});


/**
 * @openapi
 * /api/words:
 *   get:
 *     summary: Get multiple unique random words for a session
 *     parameters:
 *       - in: query
 *         name: count
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Number of unique words to return
 *       - in: query
 *         name: sourceLanguage
 *         schema:
 *           type: string
 *           enum: [finnish, english, swedish, german, spanish]
 *           default: finnish
 *         description: Language shown to the player
 *       - in: query
 *         name: targetLanguage
 *         schema:
 *           type: string
 *           enum: [finnish, english, swedish, german, spanish]
 *           default: english
 *         description: Language the player should translate into
 *     responses:
 *       200:
 *         description: Array of unique random words
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 count:
 *                   type: integer
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Word'
 *       400:
 *         description: Invalid count or unsupported language
 */
app.get('/api/words', (req: Request, res: Response) => {
    try {
        const count = parseInt(req.query.count as string) || 20;
        const { sourceLanguage, targetLanguage } = getLanguageSelection(req.query);

        if (count <= 0) {
            res.status(400).json({
                success: false,
                message: 'Count must be a positive number',
            });
            return;
        }

        const invalidLanguageMessage = getInvalidLanguageMessage(sourceLanguage, targetLanguage);

        if (invalidLanguageMessage) {
            res.status(400).json({
                success: false,
                message: invalidLanguageMessage,
            });
            return;
        }

        const words = getRandomWords(
            count,
            sourceLanguage as Language,
            targetLanguage as Language
        );
        res.status(200).json({
            success: true,
            count: words.length,
            data: words,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch words',
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
});

/**
 * @openapi
 * /api/user:
 *   post:
 *     summary: Create or fetch a user by nickname
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nickname:
 *                 type: string
 *     responses:
 *       200:
 *         description: Existing user fetched
 *       201:
 *         description: New user created
 */
app.post('/api/user', async (req: Request, res: Response) => {
    try {
        const { nickname } = req.body as { nickname: string };

        if (!nickname || nickname.trim().length === 0) {
            res.status(400).json({
                success: false,
                message: 'Nickname is required',
            });
            return;
        }

        const trimmed = nickname.trim();

        const existing = await prisma.user.findUnique({
            where: { nickname: trimmed },
        });

        if (existing) {
            res.status(200).json({
                success: true,
                data: existing,
                returning: true,
            });
            return;
        }

        const user = await prisma.user.create({
            data: { nickname: trimmed },
        });

        res.status(201).json({
            success: true,
            data: user,
            returning: false,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to create or fetch user',
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
});

/**
 * @openapi
 * /api/scores:
 *   get:
 *     summary: Get top saved scores
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *           minimum: 1
 *           maximum: 100
 *       - in: query
 *         name: sourceLanguage
 *         schema:
 *           type: string
 *           enum: [finnish, english, swedish, german, spanish]
 *       - in: query
 *         name: targetLanguage
 *         schema:
 *           type: string
 *           enum: [finnish, english, swedish, german, spanish]
 *     responses:
 *       200:
 *         description: Scoreboard entries ordered by score
 */
app.get('/api/scores', async (req: Request, res: Response) => {
    try {
        let limit = parseInt(req.query.limit as string);
        let sourceLanguage = req.query.sourceLanguage as string | undefined;
        let targetLanguage = req.query.targetLanguage as string | undefined;
        let where = {};

        if (Number.isNaN(limit)) {
            limit = 10;
        }

        if (limit <= 0) {
            res.status(400).json({
                success: false,
                message: 'Limit must be at least 1',
            });
            return;
        }

        if (limit > 100) {
            res.status(400).json({
                success: false,
                message: 'Limit must be at most 100',
            });
            return;
        }

        // Allow querying by only sourceLanguage, only targetLanguage, both, or neither
        if (sourceLanguage && targetLanguage) {
            let error = getInvalidLanguageMessage(
                sourceLanguage,
                targetLanguage
            );
            if (error) {
                res.status(400).json({
                    success: false,
                    message: error,
                });
                return;
            }
            where = { sourceLanguage, targetLanguage };
        } else if (sourceLanguage) {
            where = { sourceLanguage };
        } else if (targetLanguage) {
            where = { targetLanguage };
        }

        let scores = await prisma.score.findMany({
            where,
            orderBy: [{ score: 'desc' }, { createdAt: 'asc' }],
            take: limit,
            include: {
                user: {
                    select: {
                        id: true,
                        nickname: true,
                        username: true,
                        displayName: true,
                    },
                },
            },
        });

        let data = scores.map((entry, index) => ({
            id: entry.id,
            rank: index + 1,
            score: entry.score,
            sourceLanguage: entry.sourceLanguage,
            targetLanguage: entry.targetLanguage,
            createdAt: entry.createdAt,
            user: {
                id: entry.user.id,
                username: entry.user.username ?? entry.user.nickname,
                displayName: entry.user.displayName ?? entry.user.nickname,
            },
        }));

        res.status(200).json({
            success: true,
            count: data.length,
            data,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch scoreboard',
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
});

/**
 * @openapi
 * /api/score:
 *   post:
 *     summary: Save a session score for the authenticated user
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               score:
 *                 type: number
 *               sourceLanguage:
 *                 type: string
 *                 enum: [finnish, english, swedish, german, spanish]
 *               targetLanguage:
 *                 type: string
 *                 enum: [finnish, english, swedish, german, spanish]
 *     responses:
 *       201:
 *         description: Score saved successfully
 *       401:
 *         description: Authentication required
 */
app.post('/api/score', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const parsed = scoreSubmissionSchema.safeParse(req.body);

        if (!parsed.success) {
            res.status(400).json({
                success: false,
                message: formatZodError(parsed.error),
            });
            return;
        }

        const { score, sourceLanguage, targetLanguage } = parsed.data;

        if ((sourceLanguage && !targetLanguage) || (!sourceLanguage && targetLanguage)) {
            res.status(400).json({
                success: false,
                message: 'Both sourceLanguage and targetLanguage must be provided together',
            });
            return;
        }

        if (sourceLanguage && targetLanguage) {
            const invalidLanguageMessage = getInvalidLanguageMessage(
                sourceLanguage,
                targetLanguage
            );

            if (invalidLanguageMessage) {
                res.status(400).json({
                    success: false,
                    message: invalidLanguageMessage,
                });
                return;
            }
        }

        const saved = await prisma.score.create({
            data: {
                userId: req.authUser!.id,
                score,
                sourceLanguage: sourceLanguage ?? null,
                targetLanguage: targetLanguage ?? null,
            },
        });

        res.status(201).json({
            success: true,
            data: saved,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to save score',
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
});

app.use((req: Request, res: Response) => {
    res.status(404).json({
        success: false,
        message: 'Endpoint not found',
    });
});
