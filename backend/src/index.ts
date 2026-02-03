import express from 'express';
import type { Request, Response } from 'express';
import cors from 'cors';
import { getRandomWord } from './service/wordService.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

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

app.use((req: Request, res: Response) => {
    res.status(404).json({
        success: false,
        message: 'Endpoint not found',
    });
});

app.listen(PORT, () => {
    console.log(`Backend server is running on http://localhost:${PORT}`);
})