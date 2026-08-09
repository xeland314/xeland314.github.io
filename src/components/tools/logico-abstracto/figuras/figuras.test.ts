import { describe, it, expect } from "vitest";
import {
  createSimpleFigure,
  createRowFigure,
  createElement,
} from "./figuras";
import {
  rotate,
  scale,
  translate,
  shade,
  addElement,
  removeElement,
  applyStep,
  generateSequence,
  generateDistractor,
  cloneFig,
} from "./primitivas";
import { renderFigure, renderSequence } from "./svg";
import type { Figure, TransformationStep } from "./types";

describe("createSimpleFigure", () => {
  it("crea una figura con un único elemento centrado", () => {
    const f = createSimpleFigure("circle");
    expect(f.elements).toHaveLength(1);
    expect(f.elements[0].kind).toBe("circle");
    expect(f.elements[0].x).toBe(50);
    expect(f.elements[0].y).toBe(50);
    expect(f.width).toBe(100);
    expect(f.height).toBe(100);
  });

  it("respeta el patrón de relleno indicado", () => {
    const f = createSimpleFigure("square", "hatched");
    expect(f.elements[0].fill).toBe("hatched");
  });
});

describe("createRowFigure", () => {
  it("distribuye N elementos en fila horizontal", () => {
    const f = createRowFigure("dot", 3);
    expect(f.elements).toHaveLength(3);
    const xs = f.elements.map((e) => e.x);
    expect(xs[0]).toBeLessThan(xs[1]);
    expect(xs[1]).toBeLessThan(xs[2]);
  });

  it("con count=0 produce una sola figura (no vacía)", () => {
    const f = createRowFigure("dot", 0);
    expect(f.elements).toHaveLength(1);
  });
});

describe("rotate", () => {
  it("rota todos los elementos deg grados", () => {
    const f = createSimpleFigure("square");
    const r = rotate(f, 90);
    expect(r.elements[0].rotation).toBe(90);
    expect(r.elements[0]).not.toBe(f.elements[0]);
  });

  it("rota solo el elemento indicado", () => {
    const f = createRowFigure("dot", 3);
    const r = rotate(f, 45, 1);
    expect(r.elements[0].rotation).toBe(0);
    expect(r.elements[1].rotation).toBe(45);
    expect(r.elements[2].rotation).toBe(0);
  });

  it("normaliza rotaciones negativas al rango [0, 360)", () => {
    const f = createSimpleFigure("square");
    f.elements[0].rotation = 10;
    const r = rotate(f, -30);
    expect(r.elements[0].rotation).toBe(340);
  });
});

describe("scale", () => {
  it("escala todos los elementos por el factor", () => {
    const f = createSimpleFigure("circle");
    const s = scale(f, 1.5);
    expect(s.elements[0].scale).toBeCloseTo(1.5, 2);
  });

  it("lanza error con factor <= 0", () => {
    const f = createSimpleFigure("circle");
    expect(() => scale(f, 0)).toThrow();
    expect(() => scale(f, -1)).toThrow();
  });
});

describe("translate", () => {
  it("traslada los elementos y los mantiene dentro del marco", () => {
    const f = createSimpleFigure("circle");
    f.elements[0].x = 95;
    const t = translate(f, 10, 0);
    expect(t.elements[0].x).toBe(100);
  });
});

describe("shade", () => {
  it("cambia el patrón de relleno de todos los elementos", () => {
    const f = createSimpleFigure("square");
    const s = shade(f, "dotted");
    expect(s.elements[0].fill).toBe("dotted");
  });
});

describe("addElement / removeElement", () => {
  it("addElement añade un nuevo elemento del tipo indicado", () => {
    const f = createSimpleFigure("square");
    const a = addElement(f, "dot");
    expect(a.elements).toHaveLength(2);
    expect(a.elements[1].kind).toBe("dot");
  });

  it("removeElement elimina el último por defecto", () => {
    const f = createRowFigure("dot", 3);
    const r = removeElement(f);
    expect(r.elements).toHaveLength(2);
  });

  it("removeElement no elimina nada si el índice está fuera de rango", () => {
    const f = createSimpleFigure("square");
    const r = removeElement(f, 5);
    expect(r.elements).toHaveLength(1);
  });
});

describe("applyStep", () => {
  it("aplica una transformación de rotación como step", () => {
    const f = createSimpleFigure("triangle");
    const step: TransformationStep = { kind: "rotation", amount: 45 };
    const next = applyStep(f, step);
    expect(next.elements[0].rotation).toBe(45);
  });

  it("applyStep con step de addition añade un elemento", () => {
    const f = createSimpleFigure("square");
    const step: TransformationStep = { kind: "addition", amount: 0 };
    const next = applyStep(f, step);
    expect(next.elements).toHaveLength(2);
  });
});

describe("generateSequence", () => {
  it("genera una secuencia aplicando los steps cíclicamente", () => {
    const base = createSimpleFigure("square");
    const steps: TransformationStep[] = [{ kind: "rotation", amount: 90 }];
    const seq = generateSequence(base, steps, 4);
    expect(seq).toHaveLength(4);
    expect(seq[0].elements[0].rotation).toBe(0);
    expect(seq[1].elements[0].rotation).toBe(90);
    expect(seq[2].elements[0].rotation).toBe(180);
    expect(seq[3].elements[0].rotation).toBe(270);
  });

  it("devuelve solo la base si length=1", () => {
    const base = createSimpleFigure("circle");
    const seq = generateSequence(base, [{ kind: "rotation", amount: 10 }], 1);
    expect(seq).toHaveLength(1);
  });

  it("devuelve [] para length=0", () => {
    const base = createSimpleFigure("circle");
    expect(generateSequence(base, [], 0)).toEqual([]);
  });

  it("sin steps, devuelve copias de la base", () => {
    const base = createSimpleFigure("circle");
    const seq = generateSequence(base, [], 3);
    expect(seq).toHaveLength(3);
    expect(seq[0]).not.toBe(base);
    expect(seq[0].elements[0].kind).toBe("circle");
  });

  it("reinicia el ciclo si hay más pasos que figuras solicitadas", () => {
    const base = createSimpleFigure("square");
    const steps: TransformationStep[] = [
      { kind: "rotation", amount: 90 },
      { kind: "rotation", amount: 30 },
    ];
    const seq = generateSequence(base, steps, 4);
    expect(seq[1].elements[0].rotation).toBe(90);
    expect(seq[2].elements[0].rotation).toBe(120);
    expect(seq[3].elements[0].rotation).toBe(210);
  });
});

describe("generateDistractor", () => {
  it("produce una figura distinta a la correcta", () => {
    const base = createSimpleFigure("square");
    const steps: TransformationStep[] = [{ kind: "rotation", amount: 90 }];
    const correct = generateSequence(base, steps, 2)[1];
    const distractor = generateDistractor(base, steps, 2, 2);
    expect(distractor.elements[0].rotation).not.toBe(correct.elements[0].rotation);
  });

  it("sin steps devuelve la base clonada", () => {
    const base = createSimpleFigure("square");
    const d = generateDistractor(base, [], 2);
    expect(d.elements[0].kind).toBe("square");
  });
});

describe("cloneFig", () => {
  it("produce una copia profunda", () => {
    const f = createSimpleFigure("square");
    const c = cloneFig(f);
    expect(c).not.toBe(f);
    expect(c.elements).not.toBe(f.elements);
    expect(c.elements[0]).not.toBe(f.elements[0]);
    expect(c.elements[0].kind).toBe("square");
  });
});

describe("renderFigure", () => {
  it("genera un string SVG válido con viewBox", () => {
    const f = createSimpleFigure("circle");
    const svg = renderFigure(f);
    expect(svg).toContain("<svg");
    expect(svg).toContain("viewBox=\"0 0 100 100\"");
    expect(svg).toContain("<circle");
    expect(svg).toContain("</svg>");
  });

  it("incluye defs cuando hay patrón no sólido", () => {
    const f = createSimpleFigure("square", "hatched");
    const svg = renderFigure(f);
    expect(svg).toContain("<defs>");
    expect(svg).toContain("pattern");
  });
});

describe("renderSequence", () => {
  it("concatena varias figuras horizontalmente", () => {
    const seq = generateSequence(
      createSimpleFigure("square"),
      [{ kind: "rotation", amount: 90 }],
      3,
    );
    const svg = renderSequence(seq);
    expect(svg).toContain("<svg");
    expect((svg.match(/translate\(\d+ 0\)/g) || []).length).toBe(3);
  });

  it("devuelve string vacío para secuencia vacía", () => {
    const figures: Figure[] = [];
    expect(renderSequence(figures)).toBe("");
  });
});