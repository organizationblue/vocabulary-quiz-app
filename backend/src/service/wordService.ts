import words from '../data/words.json' with { type: 'json' };
import type { Language, QuizWord, Word } from '../types/words.js';

const getAvailableWords = (sourceLanguage: Language, targetLanguage: Language) =>
    words.filter(
        word =>
            word[sourceLanguage].trim().length > 0 &&
            word[targetLanguage].trim().length > 0
    );

const toQuizWord = (
    word: (typeof words)[number],
    sourceLanguage: Language,
    targetLanguage: Language
): QuizWord => ({
    prompt: word[sourceLanguage],
    answer: word[targetLanguage],
});

export function getRandomWord(): Word;
export function getRandomWord(
    sourceLanguage: Language,
    targetLanguage: Language
): QuizWord;
export function getRandomWord(
    sourceLanguage?: Language,
    targetLanguage?: Language
): QuizWord | Word {
    if (!sourceLanguage || !targetLanguage) {
        const randomIndex = Math.floor(Math.random() * words.length);
        return words[randomIndex]!;
    }

    const availableWords = getAvailableWords(sourceLanguage, targetLanguage);
    const randomIndex = Math.floor(Math.random() * availableWords.length);
    return toQuizWord(availableWords[randomIndex]!, sourceLanguage, targetLanguage);
}

export const getWordCount = (): number => words.length;
export function getRandomWords(count: number): Word[];
export function getRandomWords(
    count: number,
    sourceLanguage: Language,
    targetLanguage: Language
): QuizWord[];
export function getRandomWords(
    count: number,
    sourceLanguage?: Language,
    targetLanguage?: Language
): QuizWord[] | Word[] {
    if (!sourceLanguage || !targetLanguage) {
        const safeCount = Math.max(0, Math.min(count, words.length));
        const shuffled = [...words].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, safeCount);
    }

    const availableWords = getAvailableWords(sourceLanguage, targetLanguage);
    const safeCount = Math.max(0, Math.min(count, availableWords.length));
    const shuffled = [...availableWords].sort(() => Math.random() - 0.5);
    return shuffled
        .slice(0, safeCount)
        .map(word => toQuizWord(word, sourceLanguage, targetLanguage));
}
