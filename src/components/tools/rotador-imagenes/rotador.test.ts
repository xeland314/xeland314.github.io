import { describe, it, expect } from 'vitest';
import {
  parseDirection, calculateTotalAngle, normalizeAngle, validateDegrees,
  interpolateAngle, buildAnimationSteps, totalAnimationDuration,
  resolveAngleAtTime, resolveStepAtTime,
} from './rotador';
import type { RotationOperation, AnimationStep } from './rotador';

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

describe('interpolateAngle', () => {
  it('should return from at t=0', () => {
    expect(interpolateAngle(0, 90, 0)).toBe(0);
  });

  it('should return to at t=1', () => {
    expect(interpolateAngle(0, 90, 1)).toBe(90);
  });

  it('should return midpoint at t=0.5', () => {
    expect(interpolateAngle(0, 90, 0.5)).toBe(45);
  });

  it('should clamp t below 0', () => {
    expect(interpolateAngle(0, 90, -0.5)).toBe(0);
  });

  it('should clamp t above 1', () => {
    expect(interpolateAngle(0, 90, 1.5)).toBe(90);
  });

  it('should handle negative angles', () => {
    expect(interpolateAngle(0, -90, 0.5)).toBe(-45);
  });
});

describe('buildAnimationSteps', () => {
  it('should return empty array for no operations', () => {
    expect(buildAnimationSteps([])).toEqual([]);
  });

  it('should build one step for a single operation', () => {
    const ops: RotationOperation[] = [{ degrees: 90, direction: 'cw' }];
    const steps = buildAnimationSteps(ops);
    expect(steps).toHaveLength(2);
    expect(steps[0]).toEqual({ fromAngle: 0, toAngle: 90, duration: 2000, label: 'Paso 1: 90° horario' });
    expect(steps[1]).toEqual({ fromAngle: 90, toAngle: 90, duration: 1500, label: 'Resultado final' });
  });

  it('should chain cumulative angles across steps', () => {
    const ops: RotationOperation[] = [
      { degrees: 90, direction: 'cw' },
      { degrees: 45, direction: 'cw' },
    ];
    const steps = buildAnimationSteps(ops);
    expect(steps).toHaveLength(3);
    expect(steps[0].fromAngle).toBe(0);
    expect(steps[0].toAngle).toBe(90);
    expect(steps[1].fromAngle).toBe(90);
    expect(steps[1].toAngle).toBe(135);
  });

  it('should handle counter-clockwise operations', () => {
    const ops: RotationOperation[] = [{ degrees: 90, direction: 'ccw' }];
    const steps = buildAnimationSteps(ops);
    expect(steps[0].toAngle).toBe(-90);
  });

  it('should respect custom options', () => {
    const ops: RotationOperation[] = [{ degrees: 180, direction: 'cw' }];
    const steps = buildAnimationSteps(ops, { stepDuration: 2000, holdDuration: 500, fps: 60 });
    expect(steps[0].duration).toBe(2000);
    expect(steps[1].duration).toBe(500);
  });
});

describe('totalAnimationDuration', () => {
  it('should return 0 for empty steps', () => {
    expect(totalAnimationDuration([])).toBe(0);
  });

  it('should sum all step durations', () => {
    const steps: AnimationStep[] = [
      { fromAngle: 0, toAngle: 90, duration: 1000, label: 'a' },
      { fromAngle: 90, toAngle: 90, duration: 500, label: 'b' },
    ];
    expect(totalAnimationDuration(steps)).toBe(1500);
  });
});

describe('resolveAngleAtTime', () => {
  const steps: AnimationStep[] = [
    { fromAngle: 0, toAngle: 90, duration: 1000, label: 'step1' },
    { fromAngle: 90, toAngle: 180, duration: 1000, label: 'step2' },
  ];

  it('should return fromAngle at 0ms', () => {
    expect(resolveAngleAtTime(steps, 0)).toBe(0);
  });

  it('should return midpoint of first step at 500ms', () => {
    expect(resolveAngleAtTime(steps, 500)).toBe(45);
  });

  it('should return toAngle of first step at 1000ms', () => {
    expect(resolveAngleAtTime(steps, 1000)).toBe(90);
  });

  it('should interpolate into second step at 1500ms', () => {
    expect(resolveAngleAtTime(steps, 1500)).toBe(135);
  });

  it('should return final angle after all steps', () => {
    expect(resolveAngleAtTime(steps, 3000)).toBe(180);
  });

  it('should return 0 for empty steps', () => {
    expect(resolveAngleAtTime([], 1000)).toBe(0);
  });
});

describe('resolveStepAtTime', () => {
  const steps: AnimationStep[] = [
    { fromAngle: 0, toAngle: 90, duration: 1000, label: 'step1' },
    { fromAngle: 90, toAngle: 180, duration: 1000, label: 'step2' },
  ];

  it('should return first step at 0ms', () => {
    expect(resolveStepAtTime(steps, 0)?.label).toBe('step1');
  });

  it('should return first step at 500ms', () => {
    expect(resolveStepAtTime(steps, 500)?.label).toBe('step1');
  });

  it('should return second step at 1001ms', () => {
    expect(resolveStepAtTime(steps, 1001)?.label).toBe('step2');
  });

  it('should return last step after all steps finish', () => {
    expect(resolveStepAtTime(steps, 5000)?.label).toBe('step2');
  });

  it('should return null for empty steps', () => {
    expect(resolveStepAtTime([], 1000)).toBeNull();
  });
});
