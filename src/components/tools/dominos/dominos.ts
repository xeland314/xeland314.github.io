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

let nextId = 0;

export function createTileId(): string {
  return `tile-${nextId++}`;
}

export function resetIdCounter(): void {
  nextId = 0;
}

export function createTile(
  top: PipCount,
  bottom: PipCount,
  orientation: TileOrientation = "vertical",
  size: TileSize = "medium",
): DominoTile {
  return { id: createTileId(), top, bottom, orientation, size };
}

export function isDouble(tile: DominoTile): boolean {
  return tile.top === tile.bottom;
}

export function tileSum(tile: DominoTile): number {
  return tile.top + tile.bottom;
}

export function tileMatchesLeft(a: DominoTile, b: PipCount): boolean {
  return a.bottom === b;
}

export function tileMatchesRight(a: PipCount, b: DominoTile): boolean {
  return a === b.top;
}

export function canChainToRight(chain: DominoTile[], tile: DominoTile): boolean {
  if (chain.length === 0) return true;
  const last = chain[chain.length - 1];
  return last.bottom === tile.top;
}

export function canChainToLeft(chain: DominoTile[], tile: DominoTile): boolean {
  if (chain.length === 0) return true;
  const first = chain[0];
  return tile.bottom === first.top;
}

export function canPlaceRight(chain: DominoTile[], tile: DominoTile): boolean {
  if (chain.length === 0) return true;
  const last = chain[chain.length - 1];
  return last.bottom === tile.top || last.bottom === tile.bottom;
}

export function canPlaceLeft(chain: DominoTile[], tile: DominoTile): boolean {
  if (chain.length === 0) return true;
  const first = chain[0];
  return tile.bottom === first.top || tile.top === first.top;
}

export function flipTile(tile: DominoTile): DominoTile {
  return { ...tile, top: tile.bottom, bottom: tile.top };
}

export function placeRight(chain: DominoTile[], tile: DominoTile): DominoTile[] {
  const last = chain[chain.length - 1];
  if (last.bottom === tile.top) return [...chain, tile];
  if (last.bottom === tile.bottom) return [...chain, flipTile(tile)];
  return chain;
}

export function placeLeft(chain: DominoTile[], tile: DominoTile): DominoTile[] {
  const first = chain[0];
  if (tile.bottom === first.top) return [tile, ...chain];
  if (tile.top === first.top) return [flipTile(tile), ...chain];
  return chain;
}

export function chainScore(chain: DominoTile[]): number {
  if (chain.length === 0) return 0;
  return chain[0].top + chain[chain.length - 1].bottom;
}

export function isClosedChain(chain: DominoTile[]): boolean {
  if (chain.length < 2) return false;
  const first = chain[0];
  const last = chain[chain.length - 1];
  return first.top === last.bottom;
}

export function buildFullSet(maxPip: PipCount = 6): DominoTile[] {
  const tiles: DominoTile[] = [];
  for (let i = 0; i <= maxPip; i++) {
    for (let j = i; j <= maxPip; j++) {
      tiles.push(createTile(i as PipCount, j as PipCount, "vertical", "medium"));
    }
  }
  return tiles;
}

export function shuffleTiles(tiles: DominoTile[]): DominoTile[] {
  const arr = [...tiles];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function findMatchingTiles(
  chain: DominoTile[],
  hand: DominoTile[],
  side: "right" | "left",
): DominoTile[] {
  if (chain.length === 0) return hand;
  return hand.filter((tile) =>
    side === "right" ? canPlaceRight(chain, tile) : canPlaceLeft(chain, tile),
  );
}

export function scoreRemainingTiles(hand: DominoTile[]): number {
  return hand.reduce((sum, tile) => sum + tile.top + tile.bottom, 0);
}

function getPips(value: PipCount, isBottomHalf: boolean): string {
  const offsetY = isBottomHalf ? 100 : 0;
  const left = 25;
  const midX = 50;
  const right = 75;
  const top = 25 + offsetY;
  const midY = 50 + offsetY;
  const bot = 75 + offsetY;
  const color = "#33393e";

  const pips: { cx: number; cy: number }[] = [];

  switch (value) {
    case 1:
      pips.push({ cx: midX, cy: midY });
      break;
    case 2:
      pips.push({ cx: left, cy: top }, { cx: right, cy: bot });
      break;
    case 3:
      pips.push({ cx: left, cy: top }, { cx: midX, cy: midY }, { cx: right, cy: bot });
      break;
    case 4:
      pips.push(
        { cx: left, cy: top }, { cx: right, cy: top },
        { cx: left, cy: bot }, { cx: right, cy: bot },
      );
      break;
    case 5:
      pips.push(
        { cx: left, cy: top }, { cx: right, cy: top },
        { cx: midX, cy: midY },
        { cx: left, cy: bot }, { cx: right, cy: bot },
      );
      break;
    case 6:
      pips.push(
        { cx: left, cy: top }, { cx: left, cy: midY }, { cx: left, cy: bot },
        { cx: right, cy: top }, { cx: right, cy: midY }, { cx: right, cy: bot },
      );
      break;
  }

  return pips.map((p) => `<circle cx="${p.cx}" cy="${p.cy}" r="9" fill="${color}"/>`).join("");
}

export function renderTileSVG(tile: DominoTile): string {
  const dim = TILE_DIMENSIONS[tile.size];
  const isH = tile.orientation === "horizontal";
  const vw = isH ? 200 : 100;
  const vh = isH ? 100 : 200;

  if (tile.isHidden) {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${dim.w}" height="${dim.h}" viewBox="0 0 ${vw} ${vh}" style="pointer-events:none">
  <rect x="2" y="2" width="${vw - 4}" height="${vh - 4}" rx="12" fill="#e8edef" stroke="#cbd5e1" stroke-width="2"/>
  <text x="${vw / 2}" y="${vh / 2 + 14}" text-anchor="middle" font-size="48" font-family="serif" fill="#8b98a3">?</text>
</svg>`;
  }

  const topPipsSVG = getPips(tile.top, false);
  const bottomPipsSVG = getPips(tile.bottom, true);

  const divider = isH
    ? `<line x1="100" y1="2" x2="100" y2="98" stroke="#8b98a3" stroke-width="2"/>`
    : `<line x1="2" y1="100" x2="98" y2="100" stroke="#8b98a3" stroke-width="2"/>`;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${dim.w}" height="${dim.h}" viewBox="0 0 ${vw} ${vh}" style="pointer-events:none">
  <rect x="2" y="2" width="${vw - 4}" height="${vh - 4}" rx="12" fill="#f0f4f8" stroke="#cbd5e1" stroke-width="2"/>
  ${divider}
  ${topPipsSVG}
  ${bottomPipsSVG}
</svg>`;
}

export function renderTileInline(tile: DominoTile): string {
  return renderTileSVG(tile);
}

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
  | { type: "fraccion"; topDelta: number; bottomDelta: number };

export interface PatternGenerationConfig {
  rule: PatternRule;
  length: number;
  hideIndices?: number[];
  startTop?: PipCount;
  startBottom?: PipCount;
}

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
    }

    currentTop = nextTop;
    currentBottom = nextBottom;
  }

  return result;
}

export function layoutTiles(tiles: DominoTile[], config: LayoutConfig): PlacedTile[] {
  if (tiles.length === 0) return [];

  if (config.mode === "free") {
    return tiles.map((tile) => ({
      tile,
      x: tile.x ?? 0,
      y: tile.y ?? 0,
    }));
  }

  const dim = TILE_DIMENSIONS[tiles[0].size];

  if (config.mode === "row") {
    let x = 0;
    return tiles.map((tile) => {
      const placed: PlacedTile = { tile, x, y: 0 };
      const tileW = tile.orientation === "horizontal" ? dim.h : dim.w;
      x += tileW + config.gap;
      return placed;
    });
  }

  if (config.mode === "column") {
    let y = 0;
    return tiles.map((tile) => {
      const placed: PlacedTile = { tile, x: 0, y };
      const tileH = tile.orientation === "horizontal" ? dim.w : dim.h;
      y += tileH + config.gap;
      return placed;
    });
  }

  const cols = config.columns ?? Math.ceil(Math.sqrt(tiles.length));
  return tiles.map((tile, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const tileW = tile.orientation === "horizontal" ? dim.h : dim.w;
    const tileH = tile.orientation === "horizontal" ? dim.w : dim.h;
    return {
      tile,
      x: col * (tileW + config.gap),
      y: row * (tileH + config.gap),
    };
  });
}
