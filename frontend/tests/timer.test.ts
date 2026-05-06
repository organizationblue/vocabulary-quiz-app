import { describe, it, expect } from 'vitest';
import {
  WORD_TIME_LIMIT_SECONDS,
  getNextTimeLeft,
  shouldAutoSkip,
} from '../screens/GameScreen';
describe('timer helpers', () => {
  it('uses configured default timer length', () => {
    expect(WORD_TIME_LIMIT_SECONDS).toBe(15);
  });
  it('counts down by one when time remains', () => {
    expect(getNextTimeLeft(15)).toBe(14);
    expect(getNextTimeLeft(2)).toBe(1);
  });
  it('resets timer when it reaches zero', () => {
    expect(getNextTimeLeft(1)).toBe(WORD_TIME_LIMIT_SECONDS);
    expect(getNextTimeLeft(0)).toBe(WORD_TIME_LIMIT_SECONDS);
  });
  it('auto-skip triggers only at 1 second or less', () => {
    expect(shouldAutoSkip(2)).toBe(false);
    expect(shouldAutoSkip(1)).toBe(true);
    expect(shouldAutoSkip(0)).toBe(true);
  });
});