import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

export const STORAGE_KEYS = {
    NICKNAME: 'vocabulary_quiz_nickname',
    SEEN_WORDS: 'vocabulary_quiz_seen_words',
    AUTH_TOKEN: 'vocabulary_quiz_auth_token',
    AUTH_USER: 'vocabulary_quiz_auth_user',
} as const;

const canUseSecureStore =
    typeof SecureStore.getItemAsync === 'function' &&
    typeof SecureStore.setItemAsync === 'function' &&
    typeof SecureStore.deleteItemAsync === 'function';

export const getItem = async (key: string): Promise<string | null> => {
    try {
        return await AsyncStorage.getItem(key);
    } catch (error) {
        console.error(`Storage getItem error for key "${key}":`, error);
        return null;
    }
};

export const setItem = async (key: string, value: string): Promise<void> => {
    try {
        await AsyncStorage.setItem(key, value);
    } catch (error) {
        console.error(`Storage setItem error for key "${key}":`, error);
    }
};

export const removeItem = async (key: string): Promise<void> => {
    try {
        await AsyncStorage.removeItem(key);
    } catch (error) {
        console.error(`Storage removeItem error for key "${key}":`, error);
    }
};

export const getSecureItem = async (key: string): Promise<string | null> => {
    if (!canUseSecureStore) {
        return getItem(key);
    }

    try {
        return await SecureStore.getItemAsync(key);
    } catch (error) {
        console.error(`Secure storage getItem error for key "${key}":`, error);
        return getItem(key);
    }
};

export const setSecureItem = async (key: string, value: string): Promise<void> => {
    if (!canUseSecureStore) {
        await setItem(key, value);
        return;
    }

    try {
        await SecureStore.setItemAsync(key, value);
    } catch (error) {
        console.error(`Secure storage setItem error for key "${key}":`, error);
        await setItem(key, value);
    }
};

export const removeSecureItem = async (key: string): Promise<void> => {
    if (!canUseSecureStore) {
        await removeItem(key);
        return;
    }

    try {
        await SecureStore.deleteItemAsync(key);
    } catch (error) {
        console.error(`Secure storage removeItem error for key "${key}":`, error);
        await removeItem(key);
    }
};
