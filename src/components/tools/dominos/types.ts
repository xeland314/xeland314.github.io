export type PipCount = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export type TileSize = "small" | "medium" | "large";

export type TileOrientation = "horizontal" | "vertical";

export interface DominoTile {
  id: string;
  top: PipCount;
  bottom: PipCount;
  orientation: TileOrientation;
  size: TileSize;
  isHidden?: boolean;
  x?: number;
  y?: number;
}

export interface DominoSet {
  maxPip: PipCount;
  tiles: DominoTile[];
}

export const TILE_DIMENSIONS: Record<TileSize, { w: number; h: number }> = {
  small: { w: 32, h: 64 },
  medium: { w: 48, h: 96 },
  large: { w: 72, h: 144 },
};

export type LayoutMode = "grid" | "row" | "column" | "free";

export interface LayoutConfig {
  mode: LayoutMode;
  gap: number;
  columns?: number;
}

export interface PlacedTile {
  tile: DominoTile;
  x: number;
  y: number;
}

export type PatternRule =
  | { type: "suma-constante"; delta: number }
  | { type: "espejo" }
  | { type: "encadenado-clasico" }
  | { type: "alternado"; valoresFijos: PipCount[] }
  | { type: "fraccion"; topDelta: number; bottomDelta: number }
  | { type: "operacion-interna"; delta: number }
  | { type: "series-alternadas"; deltaA: number; deltaB: number }
  | { type: "lectura-z"; delta: number }
  | { type: "progresion-geometrica"; factor: number }
  | { type: "inversion-polar" };

export type PatternRuleType = PatternRule["type"];

export type ReadingDirection = "horario" | "antihorario" | "lineal";

export interface PatternGenerationConfig {
  rule: PatternRule;
  length: number;
  hideIndices?: number[];
  startTop?: PipCount;
  startBottom?: PipCount;
  direction?: ReadingDirection;
}

export interface MatrixPatternConfig {
  rows: number;
  columns: number;
  rowRule: PatternRule;
  columnRule: PatternRule;
  hiddenCell?: { row: number; col: number };
  startTop?: PipCount;
  startBottom?: PipCount;
}

export type PartialExportMode = "completa" | "seleccion" | "segmentado";

export interface PartialExportConfig {
  mode: PartialExportMode;
  indices?: number[];
  segmentSize?: number;
}
