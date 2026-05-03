import { beforeEach, describe, expect, it, vi } from 'vitest';
import request from 'supertest';
import { app } from '../app.js';
import { hashPassword, signAuthToken } from '../auth.js';
import { prisma } from '../lib/prisma.js';

const mockedPrisma = prisma as unknown as {
    user: {
        findUnique: ReturnType<typeof vi.fn>;
        findFirst: ReturnType<typeof vi.fn>;
        create: ReturnType<typeof vi.fn>;
        upsert: ReturnType<typeof vi.fn>;
    };
    score: {
        create: ReturnType<typeof vi.fn>;
    };
};

describe('authentication routes', () => {
    beforeEach(() => {
        process.env.JWT_SECRET = 'test-secret';
        vi.clearAllMocks();

        mockedPrisma.user.findUnique.mockResolvedValue(null);
        mockedPrisma.user.findFirst.mockResolvedValue(null);
        mockedPrisma.user.create.mockResolvedValue({
            id: 1,
            nickname: 'test_user',
            username: 'test_user',
            displayName: 'Test User',
            passwordHash: 'hash',
            createdAt: new Date('2026-05-03T00:00:00.000Z'),
        });
        mockedPrisma.score.create.mockResolvedValue({
            id: 1,
            userId: 1,
            score: 0.9,
            sourceLanguage: 'english',
            targetLanguage: 'german',
            createdAt: new Date('2026-05-03T00:00:00.000Z'),
        });
    });

    it('registers a new user and returns a token', async () => {
        const response = await request(app).post('/api/auth/register').send({
            username: 'Test_User',
            displayName: 'Test User',
            password: 'super-secret-password',
        });

        expect(response.status).toBe(201);
        expect(response.body.success).toBe(true);
        expect(response.body.data.user.username).toBe('test_user');
        expect(typeof response.body.data.token).toBe('string');
    });

    it('logs in an existing user with valid credentials', async () => {
        const passwordHash = await hashPassword('super-secret-password');

        mockedPrisma.user.findUnique.mockResolvedValue({
            id: 1,
            nickname: 'test_user',
            username: 'test_user',
            displayName: 'Test User',
            passwordHash,
            createdAt: new Date('2026-05-03T00:00:00.000Z'),
        });

        const response = await request(app).post('/api/auth/login').send({
            username: 'test_user',
            password: 'super-secret-password',
        });

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data.user.displayName).toBe('Test User');
        expect(typeof response.body.data.token).toBe('string');
    });

    it('returns the authenticated user for /api/auth/me', async () => {
        const token = signAuthToken({ userId: 1, username: 'test_user' });

        mockedPrisma.user.findUnique.mockResolvedValue({
            id: 1,
            nickname: 'test_user',
            username: 'test_user',
            displayName: 'Test User',
            passwordHash: 'hash',
            createdAt: new Date('2026-05-03T00:00:00.000Z'),
        });

        const response = await request(app)
            .get('/api/auth/me')
            .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data.user.username).toBe('test_user');
    });

    it('saves a score for the authenticated user with a language pair', async () => {
        const token = signAuthToken({ userId: 1, username: 'test_user' });

        mockedPrisma.user.findUnique.mockResolvedValue({
            id: 1,
            nickname: 'test_user',
            username: 'test_user',
            displayName: 'Test User',
            passwordHash: 'hash',
            createdAt: new Date('2026-05-03T00:00:00.000Z'),
        });

        const response = await request(app)
            .post('/api/score')
            .set('Authorization', `Bearer ${token}`)
            .send({
                score: 0.9,
                sourceLanguage: 'english',
                targetLanguage: 'german',
            });

        expect(response.status).toBe(201);
        expect(response.body.success).toBe(true);
        expect(response.body.data.sourceLanguage).toBe('english');
        expect(response.body.data.targetLanguage).toBe('german');
    });
});
