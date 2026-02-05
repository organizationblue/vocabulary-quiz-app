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