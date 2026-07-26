export interface RotationOperation {
  degrees: number;
  direction: "cw" | "ccw";
}

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
