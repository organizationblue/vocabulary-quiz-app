import express from 'express';
import type { Request, Response } from 'express';
import cors from 'cors';
import { getRandomWord, getRandomWords } from './service/wordService.js';
/** https://dev.to/qbentil/swagger-express-documenting-your-nodejs-rest-api-4lj7 */
import swaggerUi from 'swagger-ui-express';
import swaggerJSDoc from 'swagger-jsdoc';

const PORT = process.env.PORT || 8080;

export const app = express();

app.use(cors());
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
                 english: { type: 'string' },
                 finnish: { type: 'string' }
               }
             }
           }
         },
       },
       apis: ['./src/app.ts'], // Path to your API docs
     }

   const swaggerDocs = swaggerJSDoc(swaggerOptions);
   app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

/**
 * @openapi
 * /api/word:
 *   get:
 *     summary: Get a random word
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
 */
app.get('/api/word', (req: Request, res: Response) => {
  try {
    const word = getRandomWord();

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
 *         description: Invalid count parameter
 */
app.get('/api/word', (req: Request, res: Response) => {
    try {
        const count = parseInt(req.query.count as string) || 20;

        if (count <= 0) {
            res.status(400).json({
                success: false,
                message: 'Count must be a positive number',
            });
            return;
        }

        const words = getRandomWords(count);
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

app.use((req: Request, res: Response) => {
    res.status(404).json({
        success: false,
        message: 'Endpoint not found',
    });
});