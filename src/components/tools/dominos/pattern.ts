import type { PipCount, DominoTile, PatternGenerationConfig, MatrixPatternConfig, PatternRule } from "./types";

function mod7(n: number): PipCount {
  return ((n % 7) + 7) % 7 as PipCount;
}

export function generatePattern(config: PatternGenerationConfig): DominoTile[] {
  const result: DominoTile[] = [];
  let currentTop = config.startTop ?? 0;
  let currentBottom = config.startBottom ?? 0;

  for (let i = 0; i < config.length; i++) {
    const isHidden = config.hideIndices?.includes(i) ?? false;

    let tileTop = currentTop;
    let tileBottom = currentBottom;

    if (config.rule.type === "alternado") {
      tileTop = config.rule.valoresFijos[(i * 2) % config.rule.valoresFijos.length];
      tileBottom = config.rule.valoresFijos[(i * 2 + 1) % config.rule.valoresFijos.length];
    }

    result.push({
      id: `pattern-${i}`,
      top: tileTop,
      bottom: tileBottom,
      orientation: "vertical",
      size: "medium",
      isHidden,
    });

    let nextTop = currentTop;
    let nextBottom = currentBottom;

    switch (config.rule.type) {
      case "fraccion":
        nextTop = mod7(currentTop + config.rule.topDelta);
        nextBottom = mod7(currentBottom + config.rule.bottomDelta);
        break;
      case "suma-constante":
        nextTop = mod7(currentTop + config.rule.delta);
        nextBottom = mod7(currentBottom + config.rule.delta);
        break;
      case "espejo":
        nextTop = currentBottom;
        nextBottom = currentTop;
        break;
      case "encadenado-clasico":
        nextTop = currentBottom;
        nextBottom = mod7(currentBottom + 1);
        break;
      case "alternado":
        nextTop = tileTop;
        nextBottom = tileBottom;
        break;
      case "operacion-interna": {
        const targetSum = mod7(tileTop + tileBottom + config.rule.delta);
        nextTop = mod7(tileTop + 1);
        nextBottom = mod7(targetSum - nextTop);
        break;
      }
      case "series-alternadas": {
        const d = i % 2 === 0 ? config.rule.deltaA : config.rule.deltaB;
        nextTop = mod7(currentTop + d);
        nextBottom = mod7(currentBottom + d);
        break;
      }
      case "lectura-z":
        nextTop = currentBottom;
        nextBottom = mod7(currentBottom + config.rule.delta);
        break;
      case "progresion-geometrica":
        nextTop = mod7(currentTop * config.rule.factor);
        nextBottom = mod7(currentBottom * config.rule.factor);
        break;
      case "inversion-polar":
        nextTop = mod7(6 - currentTop);
        nextBottom = mod7(6 - currentBottom);
        break;
    }

    currentTop = nextTop;
    currentBottom = nextBottom;
  }

  return result;
}

function applyRule(rule: PatternRule, top: PipCount, bottom: PipCount, index: number): [PipCount, PipCount] {
  switch (rule.type) {
    case "fraccion":
      return [mod7(top + rule.topDelta), mod7(bottom + rule.bottomDelta)];
    case "suma-constante":
      return [mod7(top + rule.delta), mod7(bottom + rule.delta)];
    case "espejo":
      return [bottom, top];
    case "encadenado-clasico":
      return [bottom, mod7(bottom + 1)];
    case "alternado":
      return [rule.valoresFijos[(index * 2) % rule.valoresFijos.length], rule.valoresFijos[(index * 2 + 1) % rule.valoresFijos.length]];
    case "operacion-interna": {
      const targetSum = mod7(top + bottom + rule.delta);
      const newTop = mod7(top + 1);
      return [newTop, mod7(targetSum - newTop)];
    }
    case "series-alternadas": {
      const d = index % 2 === 0 ? rule.deltaA : rule.deltaB;
      return [mod7(top + d), mod7(bottom + d)];
    }
    case "lectura-z":
      return [bottom, mod7(bottom + rule.delta)];
    case "progresion-geometrica":
      return [mod7(top * rule.factor), mod7(bottom * rule.factor)];
    case "inversion-polar":
      return [mod7(6 - top), mod7(6 - bottom)];
  }
}

export function generateMatrixPattern(config: MatrixPatternConfig): DominoTile[][] {
  const { rows, columns, rowRule, columnRule, hiddenCell, startTop = 0, startBottom = 0 } = config;
  const matrix: DominoTile[][] = [];

  let colStartTop = startTop;
  let colStartBottom = startBottom;

  for (let r = 0; r < rows; r++) {
    const row: DominoTile[] = [];
    let [rowTop, rowBottom] = [colStartTop, colStartBottom];

    for (let c = 0; c < columns; c++) {
      const isHidden = hiddenCell?.row === r && hiddenCell?.col === c;
      row.push({
        id: `matrix-${r}-${c}`,
        top: rowTop,
        bottom: rowBottom,
        orientation: "vertical",
        size: "medium",
        isHidden,
      });
      [rowTop, rowBottom] = applyRule(rowRule, rowTop, rowBottom, c);
    }

    matrix.push(row);
    [colStartTop, colStartBottom] = applyRule(columnRule, colStartTop, colStartBottom, r);
  }

  return matrix;
}
