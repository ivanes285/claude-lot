import type { Draw } from '../types';

export function digitSum(d: Draw): number {
  return [...d].reduce((a, c) => a + (+c), 0);
}

export function countEvens(d: Draw): number {
  return [...d].filter(c => +c % 2 === 0).length;
}

export function globalFrequency(draws: Draw[]): number[] {
  const counts = Array(10).fill(0) as number[];
  draws.forEach(d => [...d].forEach(c => counts[+c]++));
  return counts;
}

export function positionFrequency(draws: Draw[], pos: number): number[] {
  const counts = Array(10).fill(0) as number[];
  draws.forEach(d => counts[+d[pos]]++);
  return counts;
}

export function autocorrelation(arr: number[], lag: number): number {
  if (arr.length < lag + 1) return 0;
  const m = arr.reduce((a, b) => a + b, 0) / arr.length;
  let num = 0, den = 0;
  for (let i = 0; i < arr.length; i++) {
    den += (arr[i] - m) ** 2;
    if (i < arr.length - lag) num += (arr[i] - m) * (arr[i + lag] - m);
  }
  return den === 0 ? 0 : num / den;
}

export interface SystemStats {
  totalDraws: number;
  totalDigits: number;
  meanSum: number;
  stdSum: number;
  meanEvens: number;
  meanNumeric: number;
  autocorr1: number;
  repeatedDigitDraws: number;
  sumMin: number;
  sumMax: number;
}

export function computeStats(draws: Draw[]): SystemStats {
  const sums = draws.map(digitSum);
  const n = Math.max(draws.length, 1);
  const meanSum = sums.reduce((a, b) => a + b, 0) / n;
  const variance = sums.reduce((a, b) => a + (b - meanSum) ** 2, 0) / n;

  const evens = draws.map(countEvens);
  const nums = draws.map(d => parseInt(d));

  return {
    totalDraws: draws.length,
    totalDigits: draws.length * 6,
    meanSum: meanSum,
    stdSum: Math.sqrt(variance),
    meanEvens: evens.reduce((a, b) => a + b, 0) / n,
    meanNumeric: nums.reduce((a, b) => a + b, 0) / n,
    autocorr1: autocorrelation(sums, 1),
    repeatedDigitDraws: draws.filter(d => new Set(d).size < 6).length,
    sumMin: sums.length ? Math.min(...sums) : 0,
    sumMax: sums.length ? Math.max(...sums) : 0,
  };
}
