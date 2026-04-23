import { afterEach, describe, expect, it, vi } from 'vitest';
import words from '../data/words.json' with { type: 'json' };
import { getRandomWord, getRandomWords, getWordCount } from '../service/wordService.js';

describe('wordService', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('getRandomWord', () => {
        it('returns the word at the generated random index', () => {
            vi.spyOn(Math, 'random').mockReturnValue(0);

            expect(getRandomWord()).toEqual(words[0]);
        });
    });

    describe('getRandomWords', () => {
        it('returns the requested number of unique words when count is within range', () => {
            const result = getRandomWords(10);

            expect(result).toHaveLength(10);
            expect(new Set(result.map((word) => `${word.english}:${word.finnish}`)).size).toBe(result.length);
            expect(words).toEqual(expect.arrayContaining(result));
        });

        it('returns an empty array when count is zero', () => {
            expect(getRandomWords(0)).toEqual([]);
        });

        it('returns all available words when count exceeds the word list size', () => {
            const result = getRandomWords(words.length + 10);

            expect(result).toHaveLength(words.length);
            expect(new Set(result.map((word) => `${word.english}:${word.finnish}`)).size).toBe(result.length);
            expect(words).toEqual(expect.arrayContaining(result));
        });

        it('returns an empty array when count is negative', () => {
            expect(getRandomWords(-1)).toEqual([]);
        });
    });

    describe('getWordCount', () => {
        it('returns the total number of available words', () => {
            expect(getWordCount()).toBe(words.length);
        });
    });
});
