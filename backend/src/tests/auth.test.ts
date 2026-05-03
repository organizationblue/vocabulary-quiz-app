import { beforeEach, describe, expect, it } from 'vitest';
import {
    hashPassword,
    loginSchema,
    normalizeDisplayName,
    normalizeUsername,
    registerSchema,
    signAuthToken,
    verifyAuthToken,
    verifyPassword,
} from '../auth.js';

describe('auth utilities', () => {
    beforeEach(() => {
        process.env.JWT_SECRET = 'test-secret';
    });

    it('normalizes usernames to lowercase and trims whitespace', () => {
        expect(normalizeUsername('  Test_User  ')).toBe('test_user');
    });

    it('uses the username as the fallback display name', () => {
        expect(normalizeDisplayName(undefined, 'test_user')).toBe('test_user');
        expect(normalizeDisplayName('  Test User  ', 'test_user')).toBe('Test User');
    });

    it('hashes and verifies passwords', async () => {
        const passwordHash = await hashPassword('super-secret-password');

        expect(passwordHash).not.toBe('super-secret-password');
        await expect(
            verifyPassword('super-secret-password', passwordHash)
        ).resolves.toBe(true);
        await expect(verifyPassword('wrong-password', passwordHash)).resolves.toBe(
            false
        );
    });

    it('signs and verifies auth tokens', () => {
        const token = signAuthToken({ userId: 42, username: 'test_user' });

        expect(verifyAuthToken(token)).toMatchObject({
            userId: 42,
            username: 'test_user',
        });
    });

    it('accepts mixed-case usernames and validates registration payloads', () => {
        const result = registerSchema.safeParse({
            username: 'Test_User',
            displayName: 'Test User',
            password: 'super-secret-password',
        });

        expect(result.success).toBe(true);
    });

    it('rejects short passwords for login and registration', () => {
        expect(
            registerSchema.safeParse({
                username: 'test_user',
                password: 'short',
            }).success
        ).toBe(false);

        expect(
            loginSchema.safeParse({
                username: 'test_user',
                password: '',
            }).success
        ).toBe(false);
    });
});
