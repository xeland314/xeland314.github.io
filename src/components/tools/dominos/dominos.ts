export type PipCount = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export type TileSize = "small" | "medium" | "large";

export type TileOrientation = "horizontal" | "vertical";

export interface DominoTile {
  id: string;
  top: PipCount;
  bottom: PipCount;
  orientation: TileOrientation;
  size: TileSize;
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

const PIP_PATTERNS: Record<number, { x: number; y: number }[]> = {
  1: [{ x: 0.5, y: 0.5 }],
  2: [
    { x: 0.25, y: 0.25 },
    { x: 0.75, y: 0.75 },
  ],
  3: [
    { x: 0.25, y: 0.25 },
    { x: 0.5, y: 0.5 },
    { x: 0.75, y: 0.75 },
  ],
  4: [
    { x: 0.25, y: 0.25 },
    { x: 0.75, y: 0.25 },
    { x: 0.25, y: 0.75 },
    { x: 0.75, y: 0.75 },
  ],
  5: [
    { x: 0.25, y: 0.25 },
    { x: 0.75, y: 0.25 },
    { x: 0.5, y: 0.5 },
    { x: 0.25, y: 0.75 },
    { x: 0.75, y: 0.75 },
  ],
  6: [
    { x: 0.25, y: 0.25 },
    { x: 0.75, y: 0.25 },
    { x: 0.25, y: 0.5 },
    { x: 0.75, y: 0.5 },
    { x: 0.25, y: 0.75 },
    { x: 0.75, y: 0.75 },
  ],
};

function pipsForHalf(
  count: PipCount,
  offsetX: number,
  offsetY: number,
  halfW: number,
  halfH: number,
  pipR: number,
  color: string,
): string {
  if (count === 0) return "";
  return PIP_PATTERNS[count]
    .map((p) => {
      const cx = offsetX + p.x * halfW;
      const cy = offsetY + p.y * halfH;
      return `<circle cx="${cx}" cy="${cy}" r="${pipR}" fill="${color}"/>`;
    })
    .join("");
}

export function renderTileSVG(tile: DominoTile): string {
  const dim = TILE_DIMENSIONS[tile.size];
  const isH = tile.orientation === "horizontal";
  const W = isH ? dim.h : dim.w;
  const H = isH ? dim.w : dim.h;
  const halfW = isH ? dim.h / 2 : dim.w / 2;
  const halfH = isH ? dim.w : dim.h / 2;
  const pipR = tile.size === "small" ? 2 : tile.size === "medium" ? 3 : 4.5;
  const color = "#33393e";

  const borderWidth = 1;
  const radius = tile.size === "small" ? 3 : tile.size === "medium" ? 4 : 6;

  const topPips = pipsForHalf(tile.top, 0, 0, halfW, halfH, pipR, color);
  const bottomPips = pipsForHalf(tile.bottom, isH ? halfW : 0, isH ? 0 : halfH, halfW, halfH, pipR, color);

  const dividerLine = isH
    ? `<line x1="${halfW}" y1="0" x2="${halfW}" y2="${H}" stroke="#8b98a3" stroke-width="1"/>`
    : `<line x1="0" y1="${halfH}" x2="${W}" y2="${halfH}" stroke="#8b98a3" stroke-width="1"/>`;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect x="${borderWidth / 2}" y="${borderWidth / 2}" width="${W - borderWidth}" height="${H - borderWidth}" rx="${radius}" fill="#f0f4f5" stroke="#8b98a3" stroke-width="${borderWidth}"/>
  ${dividerLine}
  ${topPips}
  ${bottomPips}
</svg>`;
}

export function renderTileInline(tile: DominoTile): string {
  const svg = renderTileSVG(tile);
  return svg;
}
