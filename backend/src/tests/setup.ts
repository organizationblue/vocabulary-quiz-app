import { vi } from 'vitest';

vi.mock('../lib/prisma.js', () => ({
    prisma: {
        user: {
            findUnique: vi.fn().mockResolvedValue(null),
            create: vi.fn().mockResolvedValue({ id: 1, nickname: 'test' }),
            upsert: vi.fn().mockResolvedValue({ id: 1, nickname: 'test' }),
        },
        score: {
            create: vi.fn().mockResolvedValue({ id: 1, userId: 1, score: 10 }),
        },
    },
}));