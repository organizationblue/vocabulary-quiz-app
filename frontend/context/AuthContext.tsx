import {
    createContext,
    useContext,
    useEffect,
    useMemo,
    useState,
    type ReactNode,
} from 'react';
import type { AuthenticatedUser, AuthSuccessResponse } from '../types/auth';
import {
    STORAGE_KEYS,
    getSecureItem,
    removeSecureItem,
    setSecureItem,
} from '../utils/storage';

interface AuthContextValue {
    user: AuthenticatedUser | null;
    token: string | null;
    isLoading: boolean;
    login: (username: string, password: string) => Promise<void>;
    register: (
        username: string,
        password: string,
        displayName?: string
    ) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const API_URL = process.env.EXPO_PUBLIC_API_URL;

const parseStoredUser = (value: string | null): AuthenticatedUser | null => {
    if (!value) {
        return null;
    }

    try {
        return JSON.parse(value) as AuthenticatedUser;
    } catch (error) {
        console.error('Failed to parse stored user:', error);
        return null;
    }
};

const getErrorMessage = (fallback: string, payload: unknown): string => {
    if (
        payload &&
        typeof payload === 'object' &&
        'message' in payload &&
        typeof payload.message === 'string'
    ) {
        return payload.message;
    }

    return fallback;
};

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<AuthenticatedUser | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const persistSession = async (
        nextToken: string,
        nextUser: AuthenticatedUser
    ) => {
        setToken(nextToken);
        setUser(nextUser);
        await Promise.all([
            setSecureItem(STORAGE_KEYS.AUTH_TOKEN, nextToken),
            setSecureItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(nextUser)),
        ]);
    };

    const clearSession = async () => {
        setToken(null);
        setUser(null);
        await Promise.all([
            removeSecureItem(STORAGE_KEYS.AUTH_TOKEN),
            removeSecureItem(STORAGE_KEYS.AUTH_USER),
        ]);
    };

    useEffect(() => {
        const hydrateSession = async () => {
            try {
                const [storedToken, storedUserValue] = await Promise.all([
                    getSecureItem(STORAGE_KEYS.AUTH_TOKEN),
                    getSecureItem(STORAGE_KEYS.AUTH_USER),
                ]);

                const storedUser = parseStoredUser(storedUserValue);

                if (!storedToken || !storedUser) {
                    await clearSession();
                    return;
                }

                if (!API_URL) {
                    setToken(storedToken);
                    setUser(storedUser);
                    return;
                }

                try {
                    const response = await fetch(`${API_URL}/api/auth/me`, {
                        headers: {
                            Authorization: `Bearer ${storedToken}`,
                        },
                    });
                    const json = await response.json();

                    if (!response.ok) {
                        await clearSession();
                        console.error('Stored session was rejected:', json.message);
                        return;
                    }

                    const nextUser = (json.data.user ?? storedUser) as AuthenticatedUser;
                    await persistSession(storedToken, nextUser);
                } catch (error) {
                    console.error('Session refresh failed, using stored session:', error);
                    setToken(storedToken);
                    setUser(storedUser);
                }
            } finally {
                setIsLoading(false);
            }
        };

        void hydrateSession();
    }, []);

    const login = async (username: string, password: string) => {
        if (!API_URL) {
            throw new Error('API URL is not configured');
        }

        const response = await fetch(`${API_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
        });
        const json = await response.json();

        if (!response.ok) {
            throw new Error(getErrorMessage('Failed to log in', json));
        }

        await persistSession(
            (json.data as AuthSuccessResponse).token,
            (json.data as AuthSuccessResponse).user
        );
    };

    const register = async (
        username: string,
        password: string,
        displayName?: string
    ) => {
        if (!API_URL) {
            throw new Error('API URL is not configured');
        }

        const response = await fetch(`${API_URL}/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password, displayName }),
        });
        const json = await response.json();

        if (!response.ok) {
            throw new Error(getErrorMessage('Failed to register', json));
        }

        await persistSession(
            (json.data as AuthSuccessResponse).token,
            (json.data as AuthSuccessResponse).user
        );
    };

    const logout = async () => {
        await clearSession();
    };

    const value = useMemo<AuthContextValue>(
        () => ({
            user,
            token,
            isLoading,
            login,
            register,
            logout,
        }),
        [isLoading, token, user]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }

    return context;
}
