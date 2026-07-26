import type { PipCount, DominoTile, LayoutConfig } from "./types";
import { TILE_DIMENSIONS } from "./types";
import { layoutTiles, layoutTilesCircular } from "./layout";

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

export function tileLabel(tile: DominoTile): string {
  if (tile.isHidden) return "?";
  return tile.top === tile.bottom ? `Doble ${tile.top}` : `${tile.top}·${tile.bottom}`;
}

export function renderLayoutHTML(tiles: DominoTile[], config: LayoutConfig): string {
  if (tiles.length === 0) return "";
  const placed = layoutTiles(tiles, config);
  const maxX = placed.reduce((m, p) => Math.max(m, p.x), 0) + 48;
  const maxY = placed.reduce((m, p) => Math.max(m, p.y), 0) + 96;
  const tilesHtml = placed.map((p) => {
    const svg = renderTileSVG(p.tile);
    const label = tileLabel(p.tile);
    return `<div style="position:absolute;left:${p.x}px;top:${p.y}px;" class="flex flex-col items-center">${svg}<span class="text-[9px] text-[#8b98a3] font-mono mt-0.5">${label}</span></div>`;
  }).join("");
  return `<div class="relative bg-white border border-[#e8edef] rounded-[3px] p-4" style="width:${maxX}px;height:${maxY}px;">${tilesHtml}</div>`;
}

export function renderCircularLayoutHTML(tiles: DominoTile[], direction: "horario" | "antihorario" | "lineal", radius: number = 120): string {
  if (tiles.length === 0) return "";
  const placed = layoutTilesCircular(tiles, direction, radius);
  const size = radius * 2 + 144;
  const tilesHtml = placed.map((p) => {
    const svg = renderTileSVG(p.tile);
    const label = tileLabel(p.tile);
    return `<div style="position:absolute;left:${p.x}px;top:${p.y}px;" class="flex flex-col items-center">${svg}<span class="text-[9px] text-[#8b98a3] font-mono mt-0.5">${label}</span></div>`;
  }).join("");
  return `<div class="relative bg-white border border-[#e8edef] rounded-[3px] p-4" style="width:${size}px;height:${size}px;">${tilesHtml}</div>`;
}

export function renderMatrixHTML(matrix: DominoTile[][]): string {
  if (matrix.length === 0 || matrix[0].length === 0) return "";
  const rows = matrix.length;
  const cols = matrix[0].length;
  const dim = TILE_DIMENSIONS.medium;
  const gap = 12;
  const totalW = cols * (dim.w + gap) + gap;
  const totalH = rows * (dim.h + 20 + gap) + gap;

  const tilesHtml = matrix.flatMap((row, r) =>
    row.map((tile, c) => {
      const x = gap + c * (dim.w + gap);
      const y = gap + r * (dim.h + 20 + gap);
      const svg = renderTileSVG(tile);
      const label = tileLabel(tile);
      return `<div style="position:absolute;left:${x}px;top:${y}px;" class="flex flex-col items-center">${svg}<span class="text-[9px] text-[#8b98a3] font-mono mt-0.5">${label}</span></div>`;
    })
  ).join("");

  return `<div class="relative bg-white border border-[#e8edef] rounded-[3px] p-4" style="width:${totalW}px;height:${totalH}px;">${tilesHtml}</div>`;
}
