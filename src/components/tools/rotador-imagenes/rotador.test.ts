import { describe, it, expect } from 'vitest';
import { parseDirection, calculateTotalAngle, normalizeAngle, validateDegrees } from './rotador';
import type { RotationOperation } from './rotador';

describe('parseDirection', () => {
  it('should return "horario" for "cw"', () => {
    expect(parseDirection('cw')).toBe('horario');
  });

  it('should return "antihorario" for "ccw"', () => {
    expect(parseDirection('ccw')).toBe('antihorario');
  });
});

describe('calculateTotalAngle', () => {
  it('should return 0 for empty operations', () => {
    expect(calculateTotalAngle([])).toBe(0);
  });

  it('should calculate single clockwise operation', () => {
    const ops: RotationOperation[] = [{ degrees: 90, direction: 'cw' }];
    expect(calculateTotalAngle(ops)).toBe(90);
  });

  it('should calculate single counter-clockwise operation', () => {
    const ops: RotationOperation[] = [{ degrees: 90, direction: 'ccw' }];
    expect(calculateTotalAngle(ops)).toBe(-90);
  });

  it('should calculate multiple mixed operations', () => {
    const ops: RotationOperation[] = [
      { degrees: 180, direction: 'cw' },
      { degrees: 90, direction: 'ccw' },
      { degrees: 270, direction: 'cw' },
    ];
    expect(calculateTotalAngle(ops)).toBe(360);
  });

  it('should handle complex concatenated rotations', () => {
    const ops: RotationOperation[] = [
      { degrees: 900, direction: 'cw' },
      { degrees: 770, direction: 'cw' },
    ];
    expect(calculateTotalAngle(ops)).toBe(1670);
  });

  it('should handle zero degrees operation', () => {
    const ops: RotationOperation[] = [{ degrees: 0, direction: 'cw' }];
    expect(calculateTotalAngle(ops)).toBe(0);
  });
});

describe('normalizeAngle', () => {
  it('should return 0 for 0 degrees', () => {
    expect(normalizeAngle(0)).toBe(0);
  });

  it('should return 90 for 90 degrees', () => {
    expect(normalizeAngle(90)).toBe(90);
  });

  it('should return 0 for 360 degrees', () => {
    expect(normalizeAngle(360)).toBe(0);
  });

  it('should return 0 for 720 degrees', () => {
    expect(normalizeAngle(720)).toBe(0);
  });

  it('should return 45 for 405 degrees', () => {
    expect(normalizeAngle(405)).toBe(45);
  });

  it('should handle negative angles', () => {
    expect(normalizeAngle(-90)).toBe(270);
  });

  it('should handle large negative angles', () => {
    expect(normalizeAngle(-360)).toBe(0);
  });

  it('should handle negative angles with remainder', () => {
    expect(normalizeAngle(-270)).toBe(90);
  });

  it('should normalize 1670 degrees correctly', () => {
    expect(normalizeAngle(1670)).toBe(230);
  });
});

describe('validateDegrees', () => {
  it('should return true for valid positive number', () => {
    expect(validateDegrees(90)).toBe(true);
  });

  it('should return true for zero', () => {
    expect(validateDegrees(0)).toBe(true);
  });

  it('should return false for negative number', () => {
    expect(validateDegrees(-10)).toBe(false);
  });

  it('should return false for NaN', () => {
    expect(validateDegrees(NaN)).toBe(false);
  });

  it('should return false for string', () => {
    expect(validateDegrees('90')).toBe(false);
  });

  it('should return false for undefined', () => {
    expect(validateDegrees(undefined)).toBe(false);
  });

  it('should return false for null', () => {
    expect(validateDegrees(null)).toBe(false);
  });
});
