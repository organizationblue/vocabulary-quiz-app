import { describe, it, expect } from 'vitest';
import { calculateWordScore } from '../screens/GameScreen';

describe('calculateWordScore', () => {
    it('returns full score when there are no wrong attempts', () => {
        expect(calculateWordScore(0, 5)).toBe(1);
    });

    it('reduces the score based on wrong attempts', () => {
        expect(calculateWordScore(2, 5)).toBe(0.6);
    });

    it('never returns a negative score', () => {
        expect(calculateWordScore(10, 4)).toBe(0);
    });
});
