import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        environment: 'node',
        setupFiles: ['src/tests/setup.ts'],
        server: {
            deps: {
                external: ['../generated/prisma/client.js'],
            },
        },
    },
});