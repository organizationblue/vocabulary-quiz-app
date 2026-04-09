import { vi } from 'vitest';

vi.mock('/home/runner/work/vocabulary-quiz-app/vocabulary-quiz-app/backend/src/generated/prisma/client.js', () => ({
    PrismaClient: vi.fn().mockImplementation(() => ({})),
}));

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