import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../app.js';
import words from '../data/words.json' with { type: 'json' };

describe('GET /api/word', () => {

    it('should return 200 OK', async () => {
        const response = await request(app).get('/api/word');
        expect(response.status).toBe(200);
    });

    it('should return success: true', async () => {
        const response = await request(app).get('/api/word');
        expect(response.body.success).toBe(true);
    });

    it('should return prompt and answer strings', async () => {
        const response = await request(app).get('/api/word');
        expect(response.body.data).toBeDefined();
        expect(typeof response.body.data.prompt).toBe('string');
        expect(typeof response.body.data.answer).toBe('string');
    });

    it('should return non-empty strings', async () => {
        const response = await request(app).get('/api/word');
        expect(response.body.data.prompt.length).toBeGreaterThan(0);
        expect(response.body.data.answer.length).toBeGreaterThan(0);
    });

    it('should default to Finnish prompts and english answers when no language params are given', async () => {
        const response = await request(app).get('/api/word');
        expect(response.status).toBe(200);
        expect(typeof response.body.data.prompt).toBe('string');
        expect(typeof response.body.data.answer).toBe('string');
    });

    it('should support choosing both source and target languages', async () => {
        const response = await request(app)
            .get('/api/word?sourceLanguage=english&targetLanguage=swedish');
        expect(response.status).toBe(200);
        expect(typeof response.body.data.prompt).toBe('string');
        expect(typeof response.body.data.answer).toBe('string');
        expect(response.body.data.answer.length).toBeGreaterThan(0);
    });

    it('should still support the legacy language query param', async () => {
        const response = await request(app).get('/api/word?language=swedish');
        expect(response.status).toBe(200);
        expect(typeof response.body.data.answer).toBe('string');
    });

    it('should return 400 for an unsupported language', async () => {
        const response = await request(app).get('/api/word?language=german');
        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
    });

    it('should return 400 when source and target languages match', async () => {
        const response = await request(app)
            .get('/api/word?sourceLanguage=english&targetLanguage=english');
        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
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
        const response = await request(app)
            .get('/api/words?count=5&sourceLanguage=swedish&targetLanguage=english');
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

    it('should return 400 for an unsupported language', async () => {
        const response = await request(app).get('/api/words?sourceLanguage=german');
        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
    });

    it('should return 400 when source and target languages match', async () => {
        const response = await request(app)
            .get('/api/words?sourceLanguage=swedish&targetLanguage=swedish');
        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
    });

    it('should return at most all available words when count exceeds word list size', async () => {
        const response = await request(app).get('/api/words?count=9999');
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data.length).toBeLessThanOrEqual(words.length);
        expect(response.body.count).toBe(response.body.data.length);
    });

    it('should return no duplicate words', async () => {
        const response = await request(app).get('/api/words?count=50');
        const prompts = response.body.data.map((w: { prompt: string }) => w.prompt);
        const unique = new Set(prompts);
        expect(unique.size).toBe(prompts.length);
    });

});

describe('Unknown routes', () => {
    it('should return 404 for unknown endpoint', async () => {
        const response = await request(app).get('/api/nonexistent');
        expect(response.status).toBe(404);
        expect(response.body.success).toBe(false);
    });
});
