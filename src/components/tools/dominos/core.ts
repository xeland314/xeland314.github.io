import type { PipCount, TileSize, TileOrientation, DominoTile } from "./types";

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
