import { describe, it, expect } from 'vitest';
import {
  mod7,
  parseDominoes,
  formatDomino,
  checkHorizontalConstant,
  checkSnakePattern,
  checkAlternatingShift,
  checkFibonacciPattern,
  checkBlockRepeat,
  solveDominoSequence,
  listMatches,
} from './solver';

describe('mod7', () => {
  it('returns positive values for positive numbers', () => {
    expect(mod7(0)).toBe(0);
    expect(mod7(1)).toBe(1);
    expect(mod7(6)).toBe(6);
  });

  it('wraps around 6 -> 7 -> 0', () => {
    expect(mod7(7)).toBe(0);
    expect(mod7(8)).toBe(1);
  });

  it('handles negative numbers safely', () => {
    expect(mod7(-1)).toBe(6);
    expect(mod7(-7)).toBe(0);
    expect(mod7(-8)).toBe(6);
  });
});

describe('parseDominoes', () => {
  it('parses simple dXX notation', () => {
    expect(parseDominoes('d01d12d23')).toEqual([[0, 1], [1, 2], [2, 3]]);
  });

  it('parses repeated tiles', () => {
    expect(parseDominoes('d55d55')).toEqual([[5, 5], [5, 5]]);
  });

  it('ignores invalid pip values (> 6)', () => {
    expect(parseDominoes('d89d01')).toEqual([[0, 1]]);
  });

  it('returns empty array for no matches', () => {
    expect(parseDominoes('abc')).toEqual([]);
    expect(parseDominoes('')).toEqual([]);
  });
});

describe('formatDomino', () => {
  it('formats a domino tuple', () => {
    expect(formatDomino([3, 4])).toBe('d34');
  });

  it('formats a double', () => {
    expect(formatDomino([5, 5])).toBe('d55');
  });
});

describe('checkHorizontalConstant', () => {
  it('returns null for fewer than 2 tiles', () => {
    expect(checkHorizontalConstant([])).toBeNull();
    expect(checkHorizontalConstant([[1, 2]])).toBeNull();
  });

  it('predicts next domino for constant shift', () => {
    const result = checkHorizontalConstant([[0, 1], [1, 2], [2, 3]]);
    expect(result?.nextDomino).toEqual([3, 4]);
    expect(result?.formatted).toBe('d34');
    expect(result?.strategyName).toBe('Horizontal Constant Shift');
    expect(result?.confidence).toBe(0.95);
  });

  it('predicts wrap-around with negative shifts', () => {
    const result = checkHorizontalConstant([[1, 2], [0, 3], [6, 4]]);
    expect(result?.nextDomino).toEqual([5, 5]);
    expect(result?.formatted).toBe('d55');
  });

  it('returns null when shift is not constant', () => {
    expect(checkHorizontalConstant([[0, 0], [1, 1], [3, 3]])).toBeNull();
  });
});

describe('checkSnakePattern', () => {
  it('returns null for fewer than 2 tiles', () => {
    expect(checkSnakePattern([])).toBeNull();
    expect(checkSnakePattern([[1, 2]])).toBeNull();
  });

  it('predicts next domino for flat sequence', () => {
    const result = checkSnakePattern([[0, 1], [2, 3]]);
    expect(result?.nextDomino).toEqual([4, 5]);
    expect(result?.strategyName).toBe('Snake / Zig-Zag Continuous');
    expect(result?.confidence).toBe(0.9);
  });

  it('handles modular wrap in the flat sequence', () => {
    const result = checkSnakePattern([[5, 6], [0, 1]]);
    expect(result?.nextDomino).toEqual([2, 3]);
  });

  it('returns null when steps vary', () => {
    expect(checkSnakePattern([[0, 1], [2, 4]])).toBeNull();
  });
});

describe('checkAlternatingShift', () => {
  it('returns null for fewer than 4 tiles', () => {
    expect(checkAlternatingShift([[0, 0], [1, 1], [2, 2]])).toBeNull();
  });

  it('predicts next domino for alternating deltas', () => {
    const result = checkAlternatingShift([
      [0, 0], [1, 1], [0, 0], [1, 1],
    ]);
    expect(result?.nextDomino).toEqual([0, 0]);
    expect(result?.strategyName).toBe('Alternating Shift');
  });

  it('returns null for constant shifts (delegated elsewhere)', () => {
    expect(checkAlternatingShift([
      [0, 0], [1, 1], [2, 2], [3, 3],
    ])).toBeNull();
  });

  it('returns null for non-alternating patterns', () => {
    expect(checkAlternatingShift([
      [0, 0], [1, 1], [2, 2], [4, 4],
    ])).toBeNull();
  });
});

describe('checkFibonacciPattern', () => {
  it('returns null for fewer than 3 tiles', () => {
    expect(checkFibonacciPattern([])).toBeNull();
    expect(checkFibonacciPattern([[1, 1], [1, 2]])).toBeNull();
  });

  it('predicts next domino for additive series', () => {
    const result = checkFibonacciPattern([[1, 1], [1, 2], [2, 3]]);
    expect(result?.nextDomino).toEqual([3, 5]);
    expect(result?.strategyName).toBe('Additive / Fibonacci');
    expect(result?.confidence).toBe(0.85);
  });

  it('handles modular wrap on addition', () => {
    const result = checkFibonacciPattern([[3, 4], [5, 6], [1, 3]]);
    expect(result?.nextDomino).toEqual([6, 2]);
  });

  it('returns null for non-additive series', () => {
    expect(checkFibonacciPattern([[1, 1], [2, 2], [4, 4]])).toBeNull();
  });
});

describe('checkBlockRepeat', () => {
  it('returns null for fewer than 4 tiles', () => {
    expect(checkBlockRepeat([[0, 0], [1, 1], [2, 2]])).toBeNull();
  });

  it('predicts next domino for periodic repetition', () => {
    const result = checkBlockRepeat([
      [0, 1], [2, 3], [0, 1], [2, 3],
    ]);
    expect(result?.nextDomino).toEqual([0, 1]);
    expect(result?.strategyName).toBe('Periodic Block (p=2)');
  });

  it('predicts next domino for period 3', () => {
    const result = checkBlockRepeat([
      [0, 0], [1, 1], [2, 2], [0, 0], [1, 1], [2, 2],
    ]);
    expect(result?.nextDomino).toEqual([0, 0]);
    expect(result?.strategyName).toBe('Periodic Block (p=3)');
  });

  it('returns null for non-periodic sequences', () => {
    expect(checkBlockRepeat([
      [0, 0], [1, 1], [2, 2], [3, 3],
    ])).toBeNull();
  });
});

describe('solveDominoSequence', () => {
  it('returns null for empty input', () => {
    expect(solveDominoSequence('')).toBeNull();
    expect(solveDominoSequence('abc')).toBeNull();
  });

  it('solves constant shift example d01d12d23', () => {
    const result = solveDominoSequence('d01d12d23');
    expect(result?.nextDomino).toEqual([3, 4]);
    expect(result?.formatted).toBe('d34');
    expect(result?.strategyName).toBe('Horizontal Constant Shift');
    expect(result?.confidence).toBe(0.95);
  });

  it('solves wrap-around example d12d03d64', () => {
    const result = solveDominoSequence('d12d03d64');
    expect(result?.nextDomino).toEqual([5, 5]);
    expect(result?.formatted).toBe('d55');
    expect(result?.strategyName).toBe('Horizontal Constant Shift');
  });

  it('prefers horizontal constant over snake when both apply', () => {
    const result = solveDominoSequence('d01d23d45');
    expect(result?.strategyName).toBe('Horizontal Constant Shift');
    expect(result?.formatted).toBe('d60');
  });

  it('reports snake as an alternative match when flat step applies', () => {
    const matches = listMatches('d01d23d45');
    expect(matches.some((m) => m.strategyName === 'Snake / Zig-Zag Continuous')).toBe(true);
    expect(matches[0].strategyName).toBe('Horizontal Constant Shift');
  });
});

describe('listMatches', () => {
  it('returns all matching strategies', () => {
    const matches = listMatches('d01d12d23');
    expect(matches.length).toBeGreaterThanOrEqual(1);
    expect(matches[0].strategyName).toBe('Horizontal Constant Shift');
  });

  it('returns empty array for empty input', () => {
    expect(listMatches('')).toEqual([]);
  });

  it('contains multiple strategies when several apply', () => {
    const matches = listMatches('d00d00d00d00');
    expect(matches.length).toBeGreaterThan(1);
  });
});
