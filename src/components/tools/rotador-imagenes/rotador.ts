export interface RotationOperation {
  degrees: number;
  direction: "cw" | "ccw";
}

export type TraceMode = "cumulative" | "direct";

export interface AnimationStep {
  fromAngle: number;
  toAngle: number;
  duration: number;
  label: string;
  traceMode?: TraceMode;
}

export interface AnimationOptions {
  stepDuration: number;
  holdDuration: number;
  fps: number;
}

export const DEFAULT_ANIMATION_OPTIONS: AnimationOptions = {
  stepDuration: 2000,
  holdDuration: 1500,
  fps: 30,
};

export function parseDirection(dir: "cw" | "ccw"): string {
  return dir === "cw" ? "horario" : "antihorario";
}

export function calculateTotalAngle(operations: RotationOperation[]): number {
  return operations.reduce((total, op) => {
    return total + (op.direction === "cw" ? op.degrees : -op.degrees);
  }, 0);
}

export function normalizeAngle(angle: number): number {
  return ((angle % 360) + 360) % 360;
}

export function validateDegrees(degrees: unknown): degrees is number {
  return typeof degrees === "number" && !isNaN(degrees) && degrees >= 0;
}

export function parseDegreesInput(raw: string): number | null {
  const trimmed = raw.trim();
  if (trimmed === "") return null;
  const value = Number(trimmed);
  return validateDegrees(value) ? value : null;
}

export function formatFormula(operations: RotationOperation[]): string {
  if (operations.length === 0) return "0°";

  const terms = operations.map((op) => {
    const signed = op.direction === "cw" ? op.degrees : -op.degrees;
    return signed >= 0 ? `+${signed}°` : `${signed}°`;
  });

  const total = calculateTotalAngle(operations);
  const normalized = normalizeAngle(total);
  const effective = normalized !== total ? ` = ${normalized}° efectivos` : ` = ${total}°`;

  return `${terms.join(" ")}${effective}`;
}

export function interpolateAngle(from: number, to: number, t: number): number {
  const clamped = Math.max(0, Math.min(1, t));
  return from + (to - from) * clamped;
}

export function buildAnimationSteps(
  operations: RotationOperation[],
  options: AnimationOptions = DEFAULT_ANIMATION_OPTIONS,
  includeDirectScene: boolean = false,
): AnimationStep[] {
  if (operations.length === 0) return [];

  const steps: AnimationStep[] = [];
  let prevAngle = 0;

  for (let i = 0; i < operations.length; i++) {
    const cumulative = calculateTotalAngle(operations.slice(0, i + 1));
    const op = operations[i];
    steps.push({
      fromAngle: prevAngle,
      toAngle: cumulative,
      duration: options.stepDuration,
      label: `Paso ${i + 1}: ${op.degrees}° ${parseDirection(op.direction)}`,
      traceMode: "cumulative",
    });
    prevAngle = cumulative;
  }

  steps.push({
    fromAngle: prevAngle,
    toAngle: prevAngle,
    duration: options.holdDuration,
    label: "Resultado final",
    traceMode: "cumulative",
  });

  if (includeDirectScene) {
    const totalAngle = calculateTotalAngle(operations);
    const normalized = normalizeAngle(totalAngle);
    steps.push({
      fromAngle: 0,
      toAngle: normalized,
      duration: options.stepDuration,
      label: "Resultado directo (efectivo)",
      traceMode: "direct",
    });
    steps.push({
      fromAngle: normalized,
      toAngle: normalized,
      duration: options.holdDuration,
      label: "Resultado directo (efectivo)",
      traceMode: "direct",
    });
  }

  return steps;
}

export function totalAnimationDuration(steps: AnimationStep[]): number {
  return steps.reduce((sum, s) => sum + s.duration, 0);
}

export function resolveAngleAtTime(steps: AnimationStep[], elapsedMs: number): number {
  let remaining = elapsedMs;

  for (const step of steps) {
    if (remaining <= step.duration) {
      const t = remaining / step.duration;
      return interpolateAngle(step.fromAngle, step.toAngle, t);
    }
    remaining -= step.duration;
  }

  return steps.length > 0 ? steps[steps.length - 1].toAngle : 0;
}

export function resolveStepAtTime(
  steps: AnimationStep[],
  elapsedMs: number,
): AnimationStep | null {
  let remaining = elapsedMs;

  for (const step of steps) {
    if (remaining <= step.duration) {
      return step;
    }
    remaining -= step.duration;
  }

  return steps.length > 0 ? steps[steps.length - 1] : null;
}
