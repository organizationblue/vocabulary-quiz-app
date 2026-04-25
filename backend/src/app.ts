import 'dotenv/config';
import express from 'express';
import type { Request, Response } from 'express';
import cors from 'cors';
import { getRandomWord, getRandomWords } from './service/wordService.js';
import { isSupportedLanguage, SUPPORTED_LANGUAGES } from './types/words.js';
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
 *           enum: [finnish, english, swedish]
 *           default: finnish
 *         description: Language shown to the player
 *       - in: query
 *         name: targetLanguage
 *         schema:
 *           type: string
 *           enum: [finnish, english, swedish]
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
 *           enum: [finnish, english, swedish]
 *           default: finnish
 *         description: Language shown to the player
 *       - in: query
 *         name: targetLanguage
 *         schema:
 *           type: string
 *           enum: [finnish, english, swedish]
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
 * /api/score:
 *   post:
 *     summary: Save a session score for a user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nickname:
 *                 type: string
 *               score:
 *                 type: number
 *     responses:
 *       201:
 *         description: Score saved successfully
 *       404:
 *         description: User not found
 */
app.post('/api/score', async (req: Request, res: Response) => {
    try {
        const { nickname, score } = req.body as { nickname: string; score: number };

        if (!nickname || score === undefined) {
            res.status(400).json({
                success: false,
                message: 'Nickname and score are required',
            });
            return;
        }

        const user = await prisma.user.findUnique({
            where: { nickname: nickname.trim() },
        });

        if (!user) {
            res.status(404).json({
                success: false,
                message: 'User not found',
            });
            return;
        }

        const saved = await prisma.score.create({
            data: {
                userId: user.id,
                score,
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
