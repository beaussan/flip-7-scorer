import { describe, it, expect } from 'vitest';
import { calculateRoundScore } from './scoring';

describe('Scoring Logic', () => {
  it('scores basic hand', () => {
    expect(calculateRoundScore({ numberCards: [3, 5, 11], x2Modifier: false, plusModifiers: [], isBust: false })).toBe(19);
  });
  it('scores with x2', () => {
    expect(calculateRoundScore({ numberCards: [3, 5, 11], x2Modifier: true, plusModifiers: [], isBust: false })).toBe(38);
  });
  it('scores with +10', () => {
    expect(calculateRoundScore({ numberCards: [3, 5, 11], x2Modifier: false, plusModifiers: [10], isBust: false })).toBe(29);
  });
  it('scores with x2 and +10', () => {
    expect(calculateRoundScore({ numberCards: [3, 5, 11], x2Modifier: true, plusModifiers: [10], isBust: false })).toBe(48);
  });
  it('x2 does not double bonus cards or Flip 7 bonus', () => {
    expect(calculateRoundScore({ numberCards: [0, 1, 2, 3, 8, 10, 12], x2Modifier: true, plusModifiers: [10], isBust: false })).toBe(97);
  });
  it('scores Flip 7 bonus', () => {
    expect(calculateRoundScore({ numberCards: [0, 1, 2, 3, 8, 10, 12], x2Modifier: false, plusModifiers: [], isBust: false })).toBe(51);
  });
  it('scores maximum possible hand', () => {
    expect(calculateRoundScore({ numberCards: [6, 7, 8, 9, 10, 11, 12], x2Modifier: true, plusModifiers: [10], isBust: false })).toBe(151);
  });
  it('scores 0 on bust', () => {
    expect(calculateRoundScore({ numberCards: [3, 5, 11], x2Modifier: true, plusModifiers: [10], isBust: true })).toBe(0);
  });
});
