export type Language = 'english' | 'swedish' | 'finnish' | 'german' | 'spanish';

export const SUPPORTED_LANGUAGES: Language[] = ['finnish', 'english', 'swedish', 'german', 'spanish'];

export const isSupportedLanguage = (lang: string): lang is Language =>
    SUPPORTED_LANGUAGES.includes(lang as Language);

export interface Word {
    english: string;
    finnish: string;
    swedish: string;
    german: string;
    spanish: string;
}

export interface QuizWord {
    prompt: string;
    answer: string;
}
