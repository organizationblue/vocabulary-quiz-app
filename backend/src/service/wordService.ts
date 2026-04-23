import words from '../data/words.json' with { type: 'json'};
import type { Word } from '../types/words.js';

// function for getting a random word from the json file 
export const getRandomWord = (): Word => {
    const randomIndex = Math.floor(Math.random() * words.length);
    return words[randomIndex]!;
};

export const getAllWords = (): Word[] =>{
    return words;
};

export const getWordCount = (): number => {
    return words.length;
};

export const getRandomWords = (count: number): Word[] => {
    const safeCount = Math.max(0, Math.min(count, words.length));
    const shuffled = [...words].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, safeCount);
};
