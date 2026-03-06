import AsyncStorage from '@react-native-async-storage/async-storage';

export const STORAGE_KEYS = {
    NICKNAME: 'vocabulary_quiz_nickname',
    SEEN_WORDS: 'vocabulary_quiz_seen_words',
} as const;

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