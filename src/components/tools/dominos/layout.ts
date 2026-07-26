import type { DominoTile, LayoutConfig, PlacedTile, PartialExportConfig, ReadingDirection } from "./types";
import { TILE_DIMENSIONS } from "./types";

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

export function getSubsets(tiles: DominoTile[], config: PartialExportConfig): DominoTile[][] {
  if (config.mode === "seleccion" && config.indices) {
    return [tiles.filter((_, idx) => config.indices!.includes(idx))];
  }
  if (config.mode === "segmentado" && config.segmentSize && config.segmentSize > 0) {
    const chunks: DominoTile[][] = [];
    for (let i = 0; i < tiles.length; i += config.segmentSize) {
      chunks.push(tiles.slice(i, i + config.segmentSize));
    }
    return chunks;
  }
  return [tiles];
}

export function layoutTilesCircular(tiles: DominoTile[], direction: ReadingDirection, radius: number = 120): PlacedTile[] {
  if (tiles.length === 0) return [];
  if (tiles.length === 1) return [{ tile: tiles[0], x: 0, y: 0 }];

  const center = radius + 48;
  const angleStep = (2 * Math.PI) / tiles.length;

  return tiles.map((tile, i) => {
    let angle: number;
    if (direction === "horario") {
      angle = -Math.PI / 2 + i * angleStep;
    } else if (direction === "antihorario") {
      angle = -Math.PI / 2 - i * angleStep;
    } else {
      const col = i % Math.ceil(Math.sqrt(tiles.length));
      const row = Math.floor(i / Math.ceil(Math.sqrt(tiles.length)));
      const dim = TILE_DIMENSIONS[tile.size];
      const tileW = tile.orientation === "horizontal" ? dim.h : dim.w;
      const tileH = tile.orientation === "horizontal" ? dim.w : dim.h;
      return { tile, x: col * (tileW + 12), y: row * (tileH + 12) };
    }

    return {
      tile,
      x: Math.round(center + radius * Math.cos(angle)),
      y: Math.round(center + radius * Math.sin(angle)),
    };
  });
}
