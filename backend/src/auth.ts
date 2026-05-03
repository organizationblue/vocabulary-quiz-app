import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import type { Language } from './types/words.js';

const USERNAME_REGEX = /^[a-z0-9_]+$/i;
const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_SALT_ROUNDS = 10;

export const registerSchema = z.object({
    username: z
        .string()
        .trim()
        .min(3, 'Username must be at least 3 characters long')
        .max(20, 'Username must be at most 20 characters long')
        .regex(
            USERNAME_REGEX,
            'Username may only contain letters, numbers, and underscores'
        ),
    displayName: z
        .string()
        .trim()
        .min(1, 'Display name cannot be empty')
        .max(30, 'Display name must be at most 30 characters long')
        .optional(),
    password: z
        .string()
        .min(
            PASSWORD_MIN_LENGTH,
            `Password must be at least ${PASSWORD_MIN_LENGTH} characters long`
        )
        .max(72, 'Password must be at most 72 characters long'),
});

export const loginSchema = z.object({
    username: z
        .string()
        .trim()
        .min(3, 'Username must be at least 3 characters long')
        .max(20, 'Username must be at most 20 characters long')
        .regex(
            USERNAME_REGEX,
            'Username may only contain letters, numbers, and underscores'
        ),
    password: z.string().min(1, 'Password is required'),
});

export const scoreSubmissionSchema = z.object({
    score: z.number().finite().min(0, 'Score must be zero or greater'),
    sourceLanguage: z.string().trim().optional(),
    targetLanguage: z.string().trim().optional(),
});

export interface AuthTokenPayload {
    userId: number;
    username: string;
}

export interface PublicUser {
    id: number;
    username: string;
    displayName: string;
    createdAt: Date;
}

export interface ScoreSubmission {
    score: number;
    sourceLanguage?: Language;
    targetLanguage?: Language;
}

const getJwtSecret = (): string => {
    const secret = process.env.JWT_SECRET;

    if (!secret) {
        throw new Error('JWT_SECRET environment variable is not set');
    }

    return secret;
};

export const normalizeUsername = (username: string): string =>
    username.trim().toLowerCase();

export const normalizeDisplayName = (
    displayName: string | undefined,
    username: string
): string => displayName?.trim() || username;

export const hashPassword = async (password: string): Promise<string> =>
    bcrypt.hash(password, PASSWORD_SALT_ROUNDS);

export const verifyPassword = async (
    password: string,
    passwordHash: string
): Promise<boolean> => bcrypt.compare(password, passwordHash);

export const signAuthToken = (payload: AuthTokenPayload): string =>
    jwt.sign(payload, getJwtSecret(), { expiresIn: '7d' });

export const verifyAuthToken = (token: string): AuthTokenPayload =>
    jwt.verify(token, getJwtSecret()) as AuthTokenPayload;

export const getBearerToken = (
    authorizationHeader: string | undefined
): string | null => {
    if (!authorizationHeader) {
        return null;
    }

    const [scheme, token] = authorizationHeader.split(' ');

    if (scheme !== 'Bearer' || !token) {
        return null;
    }

    return token;
};

export const formatZodError = (error: z.ZodError): string =>
    error.issues[0]?.message ?? 'Invalid request body';

export const toPublicUser = (user: {
    id: number;
    username: string | null;
    displayName: string | null;
    nickname: string;
    createdAt: Date;
}): PublicUser => ({
    id: user.id,
    username: user.username ?? user.nickname,
    displayName: user.displayName ?? user.nickname,
    createdAt: user.createdAt,
});
