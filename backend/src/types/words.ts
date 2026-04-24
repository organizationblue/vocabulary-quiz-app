export type Language = 'english' | 'swedish' | 'finnish';

export const SUPPORTED_LANGUAGES: Language[] = ['finnish', 'english', 'swedish'];

export const isSupportedLanguage = (lang: string): lang is Language =>
    SUPPORTED_LANGUAGES.includes(lang as Language);

export interface Word {
    english: string;
    finnish: string;
    swedish: string;
}

export interface QuizWord {
    prompt: string;
    answer: string;
}
