export interface RoundData {
  numberCards: number[]; // 0-12
  x2Modifier: boolean;
  plusModifiers: number[]; // +2, +4, +6, +8, +10
  isBust: boolean;
}

export function calculateRoundScore(data: RoundData): number {
  if (data.isBust) return 0;

  const sumOfNumbers = data.numberCards.reduce((acc, val) => acc + val, 0);
  const multipliedSum = data.x2Modifier ? sumOfNumbers * 2 : sumOfNumbers;
  const sumOfPlusModifiers = data.plusModifiers.reduce((acc, val) => acc + val, 0);

  // If there are duplicate number cards, it's a bust in game rules, 
  // but we enforce this via the UI. If exactly 7 unique numbers, get bonus.
  const uniqueNumbers = new Set(data.numberCards);
  const flip7Bonus = uniqueNumbers.size === 7 ? 15 : 0;

  return multipliedSum + sumOfPlusModifiers + flip7Bonus;
}
