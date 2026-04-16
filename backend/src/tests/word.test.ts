import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../app.js';

describe('GET /api/word', () => {


    it('should return 200 OK', async () => {
        const response = await request(app).get('/api/word');
        expect(response.status).toBe(200);
    });

    it('should return success: true', async () => {
        const response = await request(app).get('/api/word');
        expect(response.body.success).toBe(true);
    });

    it('should return a field with english and finnish strings', async () => {
        const response = await request(app).get('/api/word');
        expect(response.body.data).toBeDefined();
        expect(typeof response.body.data.english).toBe('string');
        expect(typeof response.body.data.finnish).toBe('string');
    });

    it('should return non-empty strings', async () => {
        const response = await request(app).get('/api/word');
        expect(response.body.data.english.length).toBeGreaterThan(0);
        expect(response.body.data.finnish.length).toBeGreaterThan(0);
    });

});

describe('GET /api/words', () => {

    it('should return 20 words by default when no count is given', async () => {
        const response = await request(app).get('/api/words');
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveLength(20);
        expect(response.body.count).toBe(20);
    });

    it('should return the requested number of words when count is given', async () => {
        const response = await request(app).get('/api/words?count=5');
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveLength(5);
        expect(response.body.count).toBe(5);
    });

    it('should return 400 when count is negative', async () => {
        const response = await request(app).get('/api/words?count=-1');
        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
    });

    it('should return at most all available words when count exceeds word list size', async () => {
        const response = await request(app).get('/api/words?count=9999');
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data.length).toBeLessThanOrEqual(277);
        expect(response.body.count).toBe(response.body.data.length);
    });

    it('should return no duplicate words', async () => {
        const response = await request(app).get('/api/words?count=50');
        const englishWords = response.body.data.map((w: { english: string }) => w.english);
        const unique = new Set(englishWords);
        expect(unique.size).toBe(englishWords.length);
    });

});

describe('Unknown routes', () => {
    it('should return 404 for unknown endpoint', async () => {
        const response = await request(app).get('/api/nonexistent');
        expect(response.status).toBe(404);
        expect(response.body.success).toBe(false);
    });
});

describe('GET /api/score', () => {
    it('should return 200 OK', async () => {
        const response = await request(app).get('/api/score');

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
    });

    it('should return scoreboard entries with nickname and score', async () => {
        const response = await request(app).get('/api/score');

        expect(response.body.count).toBeGreaterThan(0);
        expect(response.body.data[0]).toMatchObject({
            nickname: 'test',
            score: 10,
        });
    });

    it('should reject invalid limit values', async () => {
        const response = await request(app).get('/api/score?limit=0');

        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
    });
});
