export interface RoundData {
  numberCards: number[]; // 0-12
  x2Modifier: boolean;
  plusModifiers: number[]; // +2, +4, +6, +8, +10
  isBust: boolean;
}

export interface RoundBreakdown {
  numberSum: number;
  multipliedNumberSum: number;
  plusSum: number;
  flip7Bonus: number;
  total: number;
}

export function calculateRoundBreakdown(data: RoundData): RoundBreakdown {
  const sumOfNumbers = data.numberCards.reduce((acc, val) => acc + val, 0);
  const multipliedSum = data.x2Modifier ? sumOfNumbers * 2 : sumOfNumbers;
  const sumOfPlusModifiers = data.plusModifiers.reduce((acc, val) => acc + val, 0);
  const uniqueNumbers = new Set(data.numberCards);
  const flip7Bonus = uniqueNumbers.size === 7 ? 15 : 0;
  const calculatedTotal = multipliedSum + sumOfPlusModifiers + flip7Bonus;

  return {
    numberSum: sumOfNumbers,
    multipliedNumberSum: multipliedSum,
    plusSum: sumOfPlusModifiers,
    flip7Bonus,
    total: data.isBust ? 0 : calculatedTotal,
  };
}

export function calculateRoundScore(data: RoundData): number {
  return calculateRoundBreakdown(data).total;
}
