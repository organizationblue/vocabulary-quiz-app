import { vi } from 'vitest';

vi.mock('../lib/prisma.js', () => ({
        prisma: {
            user: {
                findUnique: vi.fn().mockResolvedValue(null),
                findFirst: vi.fn().mockResolvedValue(null),
                create: vi.fn().mockResolvedValue({
                    id: 1,
                    nickname: 'test',
                    username: 'test',
                    displayName: 'Test',
                    passwordHash: 'hash',
                    createdAt: new Date(),
                }),
                upsert: vi.fn().mockResolvedValue({ id: 1, nickname: 'test' }),
            },
            score: {
                create: vi.fn().mockResolvedValue({
                    id: 1,
                    userId: 1,
                    score: 10,
                    sourceLanguage: 'english',
                    targetLanguage: 'finnish',
                    createdAt: new Date(),
                }),
            },
    },
}));
