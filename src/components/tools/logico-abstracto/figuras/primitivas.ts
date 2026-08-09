import type {
  Figure,
  ShapeElement,
  TransformationStep,
  FillPattern,
  ShapeKind,
} from "./types";
import { createElement } from "./figuras";

function cloneFigure(f: Figure): Figure {
  return {
    width: f.width,
    height: f.height,
    elements: f.elements.map((e) => ({ ...e })),
  };
}

/** Rota todos los elementos de la figura (o solo `elementIndex`) `deg` grados. */
export function rotate(
  figure: Figure,
  deg: number,
  elementIndex?: number,
): Figure {
  const next = cloneFigure(figure);
  next.elements.forEach((el, i) => {
    if (elementIndex === undefined || i === elementIndex) {
      el.rotation = (el.rotation + deg) % 360;
      if (el.rotation < 0) el.rotation += 360;
    }
  });
  return next;
}

/** Escala todos los elementos (o solo `elementIndex`) por `factor`. */
export function scale(
  figure: Figure,
  factor: number,
  elementIndex?: number,
): Figure {
  if (factor <= 0) throw new Error("scale: factor debe ser > 0");
  const next = cloneFigure(figure);
  next.elements.forEach((el, i) => {
    if (elementIndex === undefined || i === elementIndex) {
      el.scale = Math.round((el.scale * factor) * 100) / 100;
    }
  });
  return next;
}

/** Traslada todos los elementos (o solo `elementIndex`) por (dx, dy). */
export function translate(
  figure: Figure,
  dx: number,
  dy: number,
  elementIndex?: number,
): Figure {
  const next = cloneFigure(figure);
  next.elements.forEach((el, i) => {
    if (elementIndex === undefined || i === elementIndex) {
      el.x = clamp(el.x + dx, 0, figure.width);
      el.y = clamp(el.y + dy, 0, figure.height);
    }
  });
  return next;
}

/** Cambia el patrón de relleno de todos los elementos (o de `elementIndex`). */
export function shade(
  figure: Figure,
  pattern: FillPattern,
  elementIndex?: number,
): Figure {
  const next = cloneFigure(figure);
  next.elements.forEach((el, i) => {
    if (elementIndex === undefined || i === elementIndex) {
      el.fill = pattern;
    }
  });
  return next;
}

/** Agrega un nuevo elemento del `kind` indicado (no altera los existentes). */
export function addElement(
  figure: Figure,
  kind: ShapeKind,
  position?: { x?: number; y?: number },
): Figure {
  const next = cloneFigure(figure);
  const count = next.elements.length + 1;
  const spacing = figure.width / (count + 1);
  const x = position?.x ?? spacing * count;
  const y = position?.y ?? figure.height / 2;
  next.elements.push(createElement(kind, { x, y }));
  return next;
}

/** Elimina el último elemento (o el índice indicado). */
export function removeElement(figure: Figure, index?: number): Figure {
  const next = cloneFigure(figure);
  const idx = index ?? next.elements.length - 1;
  if (idx < 0 || idx >= next.elements.length) return next;
  next.elements.splice(idx, 1);
  return next;
}

/**
 * Aplica un único paso de transformación a una figura, devolviendo la siguiente.
 * Es la invertida funcional usada por `generar_secuencia`.
 */
export function applyStep(
  figure: Figure,
  step: TransformationStep,
): Figure {
  switch (step.kind) {
    case "rotation":
      return rotate(figure, step.amount, step.elementIndex);
    case "scale":
      return scale(figure, step.amount, step.elementIndex);
    case "translation":
      return translate(figure, step.amount, -step.amount, step.elementIndex);
    case "fill":
      return shade(figure, intToPattern(step.amount), step.elementIndex);
    case "addition":
      return addElement(figure, intToShape(step.amount));
    case "removal":
      return removeElement(figure, step.elementIndex);
    default:
      return cloneFigure(figure);
  }
}

/**
 * Genera la secuencia completa de figuras aplicando los `steps` cíclicamente
 * sobre `base`. Si hay más pasos que figuras solicitadas, se reinicia el ciclo.
 * Devuelve `length` figuras (la primera es `base`).
 */
export function generateSequence(
  base: Figure,
  steps: TransformationStep[],
  length: number,
): Figure[] {
  if (length <= 0) return [];
  if (steps.length === 0) return Array.from({ length }, () => cloneFigure(base));
  const seq: Figure[] = [cloneFigure(base)];
  for (let i = 1; i < length; i++) {
    const step = steps[(i - 1) % steps.length];
    seq.push(applyStep(seq[i - 1], step));
  }
  return seq;
}

/**
 * Genera un distractor "casi correcto" aplicando el paso indicado pero con
 * una alteración: el `amount` se multiplica por `errorFactor` o se usa el paso
 * equivocado de una secuencia de dos reglas (`wrongRuleIndex`).
 */
export function generateDistractor(
  base: Figure,
  steps: TransformationStep[],
  length: number,
  errorFactor = 2,
): Figure {
  if (length <= 0) return cloneFigure(base);
  if (steps.length === 0) return cloneFigure(base);
  const wrongStep: TransformationStep = {
    ...steps[0],
    amount: steps[0].amount * errorFactor,
  };
  return generateSequence(base, [wrongStep], length)[length - 1];
}

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

function intToPattern(n: number): FillPattern {
  const patterns: FillPattern[] = ["none", "solid", "hatched", "dotted", "cross"];
  const idx = ((Math.round(n) % patterns.length) + patterns.length) % patterns.length;
  return patterns[idx];
}

function intToShape(n: number): ShapeKind {
  const shapes: ShapeKind[] = ["circle", "square", "triangle", "dot", "line"];
  const idx = ((Math.round(n) % shapes.length) + shapes.length) % shapes.length;
  return shapes[idx];
}

export function cloneFig(f: Figure): Figure {
  return cloneFigure(f);
}