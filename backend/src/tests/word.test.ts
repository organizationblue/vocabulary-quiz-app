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

describe('Unknown routes', () => {
    it('should return 404 for unknown endpoint', async () => {
        const response = await request(app).get('/api/nonexistent');
        expect(response.status).toBe(404);
        expect(response.body.success).toBe(false);
    });
});