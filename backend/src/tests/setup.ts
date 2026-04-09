import { vi } from 'vitest';

vi.mock('../lib/prisma.js', () => ({
    prisma: {
        user: {
            findUnique: vi.fn(),
            create: vi.fn(),
        },
        score: {
            create: vi.fn(),
        },
    },
}));