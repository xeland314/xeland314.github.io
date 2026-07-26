import {
  createTile, buildFullSet, shuffleTiles, canPlaceRight, canPlaceLeft,
  placeRight, placeLeft, chainScore, isClosedChain, findMatchingTiles,
  scoreRemainingTiles,
} from "../core";
import { generatePattern } from "../pattern";
import { layoutTiles } from "../layout";
import type { PipCount, TileSize, TileOrientation, DominoTile, LayoutConfig, LayoutMode } from "../types";
import { renderTileSVG, tileLabel } from "../svg";

export const state = {
  availableTiles: [] as DominoTile[],
  chain: [] as DominoTile[],
  sequence: [] as DominoTile[],
  currentLayout: { mode: "grid", gap: 12, columns: 3 } as LayoutConfig,
};

export function readLayout(): LayoutConfig {
  const mode = (document.getElementById("seq-layout") as HTMLSelectElement)?.value as LayoutMode || "grid";
  const columns = parseInt((document.getElementById("seq-columns") as HTMLInputElement)?.value) || 3;
  const gap = parseInt((document.getElementById("seq-gap") as HTMLInputElement)?.value) || 12;
  const colsWrap = document.getElementById("seq-columns-wrap");
  if (colsWrap) colsWrap.classList.toggle("hidden", mode === "free");
  return { mode, gap, columns };
}

export function renderAvailableTiles() {
  const container = document.getElementById("available-tiles");
  if (!container) return;
  if (state.availableTiles.length === 0) {
    container.innerHTML = '<p class="text-[11.5px] text-[#8b98a3] font-serif italic">No hay fichas. Crea una o genera el juego completo.</p>';
    return;
  }

  container.innerHTML = state.availableTiles.map((tile, i) => {
    const svg = renderTileSVG(tile);
    const label = tileLabel(tile);
    return `
      <div class="flex flex-col items-center gap-1 bg-white border border-[#d3e0e4] rounded-[3px] p-1.5">
        ${svg}
        <span class="text-[9px] text-[#8b98a3] font-mono">${label}</span>
        <div class="flex gap-1">
          <button 
            data-index="${i}" 
            data-side="left"
            class="btn-chain-left font-serif text-[10px] text-[#6b7680] hover:text-[#33393e] cursor-pointer bg-transparent border border-[#d3e0e4] rounded px-1.5 py-0.5 hover:border-[#6b7680] transition-all"
            title="${label} ← izquierda"
          >↩</button>
          <button 
            data-index="${i}" 
            data-side="right"
            class="btn-chain-right font-serif text-[10px] text-[#c4392b] hover:text-[#a32f23] cursor-pointer bg-transparent border border-[#d3e0e4] rounded px-1.5 py-0.5 hover:border-[#c4392b] transition-all"
            title="${label} → derecha"
          >→</button>
          <button 
            data-index="${i}"
            class="btn-delete-tile font-serif text-[10px] text-[#c4392b] hover:text-[#a32f23] cursor-pointer bg-transparent border border-[#d3e0e4] rounded px-1.5 py-0.5 hover:border-[#c4392b] transition-all"
            title="Borrar ficha"
          >✖</button>
        </div>
      </div>
    `;
  }).join("");
}

export function renderChain() {
  const container = document.getElementById("chain-tiles");
  const info = document.getElementById("chain-info");
  if (!container) return;

  if (state.chain.length === 0) {
    container.innerHTML = '<p class="text-[11.5px] text-[#8b98a3] font-serif italic">Haz clic en una ficha para agregarla a la cadena.</p>';
    if (info) info.textContent = "";
    return;
  }

  container.innerHTML = state.chain.map((tile, i) => {
    const svg = renderTileSVG(tile);
    const label = tileLabel(tile);
    return `
      <div class="flex items-center">
        ${i > 0 ? '<span class="text-[#8b98a3] text-[10px] mx-0.5">—</span>' : ""}
        <div class="flex flex-col items-center">
          ${svg}
          <span class="text-[9px] text-[#8b98a3] font-mono mt-0.5">${label}</span>
        </div>
      </div>
    `;
  }).join("");

  if (info) {
    const score = chainScore(state.chain);
    const closed = isClosedChain(state.chain);
    const remaining = state.availableTiles.length;
    info.textContent = `Fichas: ${state.chain.length} · Puntas: ${score} · Cerrada: ${closed ? "Sí" : "No"} · En mano: ${remaining}`;
  }
}

export function updatePreview() {
  const container = document.getElementById("seq-preview");
  if (!container) return;

  state.currentLayout = readLayout();

  if (state.sequence.length === 0) {
    container.innerHTML = '<p class="text-[11.5px] text-[#8b98a3] font-serif italic">Agrega fichas o genera un patrón para ver la vista previa.</p>';
    return;
  }

  const placed = layoutTiles(state.sequence, state.currentLayout);
  const isFree = state.currentLayout.mode === "free";

  const maxX = placed.reduce((m, p) => Math.max(m, p.x), 0) + 48;
  const maxY = placed.reduce((m, p) => Math.max(m, p.y), 0) + 96;

  const tilesHtml = placed.map((p, i) => {
    const svg = renderTileSVG(p.tile);
    const label = tileLabel(p.tile);
    const dragAttr = isFree ? `data-seq-drag="${i}" style="position:absolute;left:${p.x}px;top:${p.y}px;cursor:grab;"` : `style="position:absolute;left:${p.x}px;top:${p.y}px;"`;
    return `
      <div ${dragAttr} class="flex flex-col items-center">
        ${svg}
        <span class="text-[9px] text-[#8b98a3] font-mono mt-0.5">${label}</span>
      </div>
    `;
  }).join("");

  container.innerHTML = `
    <div class="relative bg-white border border-[#e8edef] rounded-[3px] p-4" style="width:${maxX}px;height:${maxY}px;">
      ${tilesHtml}
    </div>
  `;

  if (isFree) initDragHandlers();
}

export function renderOperationsList() {
  const container = document.getElementById("seq-operations");
  if (!container) return;

  if (state.sequence.length === 0) {
    container.innerHTML = "";
    return;
  }

  const isFree = state.currentLayout.mode === "free";

  const rows = state.sequence.map((tile, i) => {
    const label = tileLabel(tile);
    const hiddenBtnClass = tile.isHidden
      ? "bg-[#c4392b] text-white border-[#c4392b]"
      : "text-[#6b7680] border-[#d3e0e4]";
    const hiddenBtnText = tile.isHidden ? "Visible" : "Oculta";

    const freeInputs = isFree ? `
      <input type="number" data-seq-idx="${i}" data-seq-field="x" value="${tile.x ?? 0}" class="seq-free-input w-16 bg-white border border-[#d3e0e4] rounded-[3px] py-1 px-2 font-mono text-[11px] text-[#33393e] focus:outline-2 focus:outline-[#c4392b] focus:outline-offset-1" />
      <input type="number" data-seq-idx="${i}" data-seq-field="y" value="${tile.y ?? 0}" class="seq-free-input w-16 bg-white border border-[#d3e0e4] rounded-[3px] py-1 px-2 font-mono text-[11px] text-[#33393e] focus:outline-2 focus:outline-[#c4392b] focus:outline-offset-1" />
    ` : "";

    return `
      <div class="flex items-center gap-2 py-1.5 px-2 border-b border-[#e8edef] text-[12px]">
        <span class="text-[#8b98a3] font-mono w-5 text-right shrink-0">${i + 1}</span>
        <span class="font-mono text-[#33393e] shrink-0">${label}</span>
        <span class="text-[#8b98a3] font-mono text-[10px] shrink-0">${tile.orientation === "horizontal" ? "H" : "V"} · ${tile.size}</span>
        <div class="flex items-center gap-1 ml-auto shrink-0">
          ${freeInputs}
          <button data-seq-toggle="${i}" class="btn-seq-toggle font-serif text-[9px] ${hiddenBtnClass} border rounded px-1.5 py-0.5 cursor-pointer hover:opacity-80 transition-all">${hiddenBtnText}</button>
          <button data-seq-up="${i}" class="font-serif text-[10px] text-[#6b7680] hover:text-[#33393e] cursor-pointer bg-transparent border border-[#d3e0e4] rounded px-1 py-0.5 hover:border-[#6b7680] transition-all" title="Subir">↑</button>
          <button data-seq-down="${i}" class="font-serif text-[10px] text-[#6b7680] hover:text-[#33393e] cursor-pointer bg-transparent border border-[#d3e0e4] rounded px-1 py-0.5 hover:border-[#6b7680] transition-all" title="Bajar">↓</button>
          <button data-seq-delete="${i}" class="font-serif text-[10px] text-[#c4392b] hover:text-[#a32f23] cursor-pointer bg-transparent border border-[#d3e0e4] rounded px-1 py-0.5 hover:border-[#c4392b] transition-all" title="Eliminar">✖</button>
        </div>
      </div>
    `;
  }).join("");

  container.innerHTML = `
    <div class="bg-white border border-[#d3e0e4] rounded-[3px] mb-1">
      <div class="flex items-center gap-2 py-1 px-2 border-b border-[#e8edef] text-[10px] text-[#8b98a3] uppercase tracking-wider">
        <span class="w-5 text-right shrink-0">#</span>
        <span class="shrink-0">Ficha</span>
        <span class="shrink-0">Conf</span>
        <div class="flex items-center gap-1 ml-auto shrink-0">
          ${isFree ? '<span class="w-16 text-center">X</span><span class="w-16 text-center">Y</span>' : ""}
          <span class="w-12"></span>
          <span class="w-5"></span>
          <span class="w-5"></span>
          <span class="w-5"></span>
        </div>
      </div>
      ${rows}
    </div>
    <p class="text-[10px] text-[#8b98a3] font-mono">${state.sequence.length} fichas en secuencia</p>
  `;
}

export function renderAll() {
  renderAvailableTiles();
  renderChain();
  state.currentLayout = readLayout();
  updatePreview();
  renderOperationsList();
}

function initDragHandlers() {
  import("./DragController").then((m) => m.initDragHandlers());
}

export function initStateManager() {
  document.getElementById("available-tiles")?.addEventListener("click", (e) => {
    const target = e.target as HTMLElement;
    const btn = target.closest<HTMLButtonElement>(".btn-chain-right, .btn-chain-left, .btn-delete-tile");
    if (!btn) return;

    const idx = parseInt(btn.dataset.index!);
    if (isNaN(idx) || idx < 0 || idx >= state.availableTiles.length) return;

    if (btn.classList.contains("btn-delete-tile")) {
      state.availableTiles.splice(idx, 1);
      renderAll();
      return;
    }

    const tile = state.availableTiles[idx];

    if (state.chain.length === 0) {
      state.chain.push(tile);
      state.availableTiles.splice(idx, 1);
      renderAll();
      return;
    }

    if (btn.classList.contains("btn-chain-right") && canPlaceRight(state.chain, tile)) {
      state.chain = placeRight(state.chain, tile);
      state.availableTiles.splice(idx, 1);
      renderAll();
    } else if (btn.classList.contains("btn-chain-left") && canPlaceLeft(state.chain, tile)) {
      state.chain = placeLeft(state.chain, tile);
      state.availableTiles.splice(idx, 1);
      renderAll();
    }
  });

  document.getElementById("seq-operations")?.addEventListener("click", (e) => {
    const target = e.target as HTMLElement;

    const toggleBtn = target.closest<HTMLButtonElement>("[data-seq-toggle]");
    if (toggleBtn) {
      const idx = parseInt(toggleBtn.dataset.seqToggle!);
      if (!isNaN(idx) && state.sequence[idx]) {
        state.sequence[idx].isHidden = !state.sequence[idx].isHidden;
        renderAll();
      }
      return;
    }

    const upBtn = target.closest<HTMLButtonElement>("[data-seq-up]");
    if (upBtn) {
      const idx = parseInt(upBtn.dataset.seqUp!);
      if (!isNaN(idx) && idx > 0 && state.sequence[idx]) {
        [state.sequence[idx - 1], state.sequence[idx]] = [state.sequence[idx], state.sequence[idx - 1]];
        renderAll();
      }
      return;
    }

    const downBtn = target.closest<HTMLButtonElement>("[data-seq-down]");
    if (downBtn) {
      const idx = parseInt(downBtn.dataset.seqDown!);
      if (!isNaN(idx) && idx < state.sequence.length - 1 && state.sequence[idx]) {
        [state.sequence[idx], state.sequence[idx + 1]] = [state.sequence[idx + 1], state.sequence[idx]];
        renderAll();
      }
      return;
    }

    const deleteBtn = target.closest<HTMLButtonElement>("[data-seq-delete]");
    if (deleteBtn) {
      const idx = parseInt(deleteBtn.dataset.seqDelete!);
      if (!isNaN(idx) && state.sequence[idx]) {
        state.sequence.splice(idx, 1);
        renderAll();
      }
      return;
    }
  });

  document.getElementById("seq-operations")?.addEventListener("change", (e) => {
    const target = e.target as HTMLInputElement;
    if (!target.classList.contains("seq-free-input")) return;
    const idx = parseInt(target.dataset.seqIdx!);
    const field = target.dataset.seqField as "x" | "y";
    if (isNaN(idx) || !state.sequence[idx] || !field) return;
    state.sequence[idx][field] = parseInt(target.value) || 0;
    updatePreview();
  });

  document.getElementById("seq-operations")?.addEventListener("input", (e) => {
    const target = e.target as HTMLInputElement;
    if (!target.classList.contains("seq-free-input")) return;
    const idx = parseInt(target.dataset.seqIdx!);
    const field = target.dataset.seqField as "x" | "y";
    if (isNaN(idx) || !state.sequence[idx] || !field) return;
    state.sequence[idx][field] = parseInt(target.value) || 0;
    updatePreview();
  });

  document.getElementById("btn-add-tile")?.addEventListener("click", () => {
    const topSelect = document.getElementById("top-pip") as HTMLSelectElement;
    const bottomSelect = document.getElementById("bottom-pip") as HTMLSelectElement;
    const sizeSelect = document.getElementById("tile-size") as HTMLSelectElement;
    const top = parseInt(topSelect.value) as PipCount;
    const bottom = parseInt(bottomSelect.value) as PipCount;
    const size = sizeSelect.value as TileSize;
    state.availableTiles.push(createTile(top, bottom, "vertical", size));
    renderAvailableTiles();
  });

  document.getElementById("btn-generate-set")?.addEventListener("click", () => {
    state.availableTiles = buildFullSet(6);
    state.chain = [];
    renderAll();
  });

  document.getElementById("btn-shuffle")?.addEventListener("click", () => {
    state.availableTiles = shuffleTiles(state.availableTiles);
    renderAvailableTiles();
  });

  document.getElementById("btn-clear-chain")?.addEventListener("click", () => {
    const returnToAvailable = [...state.chain];
    state.chain = [];
    state.availableTiles = [...state.availableTiles, ...returnToAvailable];
    renderAll();
  });

  document.getElementById("btn-seq-add")?.addEventListener("click", () => {
    const top = parseInt((document.getElementById("seq-top") as HTMLSelectElement).value) as PipCount;
    const bottom = parseInt((document.getElementById("seq-bottom") as HTMLSelectElement).value) as PipCount;
    const size = (document.getElementById("seq-size") as HTMLSelectElement).value as TileSize;
    const orientation = (document.getElementById("seq-orientation") as HTMLSelectElement).value as TileOrientation;
    state.sequence.push(createTile(top, bottom, orientation, size));
    renderAll();
  });

  document.getElementById("btn-clear-sequence")?.addEventListener("click", () => {
    state.sequence = [];
    renderAll();
  });

  ["seq-layout", "seq-columns", "seq-gap"].forEach((id) => {
    document.getElementById(id)?.addEventListener("change", () => {
      state.currentLayout = readLayout();
      updatePreview();
      renderOperationsList();
    });
  });

  const ruleSelect = document.getElementById("pattern-rule") as HTMLSelectElement;
  const paramFraccionTop = document.getElementById("param-fraccion-top");
  const paramFraccionBottom = document.getElementById("param-fraccion-bottom");
  const paramConstante = document.getElementById("param-constante");

  function updateRuleParams() {
    const rule = ruleSelect.value;
    const isFraccion = rule === "fraccion";
    const isConstante = rule === "suma-constante";
    if (paramFraccionTop) paramFraccionTop.classList.toggle("hidden", !isFraccion);
    if (paramFraccionBottom) paramFraccionBottom.classList.toggle("hidden", !isFraccion);
    if (paramConstante) paramConstante.classList.toggle("hidden", !isConstante);
  }

  ruleSelect?.addEventListener("change", updateRuleParams);
  updateRuleParams();

  document.getElementById("btn-generate-pattern")?.addEventListener("click", () => {
    const ruleType = ruleSelect.value;
    const startTop = parseInt((document.getElementById("pattern-start-top") as HTMLSelectElement).value) as PipCount;
    const startBottom = parseInt((document.getElementById("pattern-start-bottom") as HTMLSelectElement).value) as PipCount;
    const length = parseInt((document.getElementById("pattern-length") as HTMLInputElement).value) || 9;
    const hideInput = (document.getElementById("pattern-hide") as HTMLInputElement).value;
    const hideIndices = hideInput ? hideInput.split(",").map(s => parseInt(s.trim())).filter(n => !isNaN(n)) : [];

    let rule: PatternRule;
    switch (ruleType) {
      case "fraccion":
        rule = {
          type: "fraccion",
          topDelta: parseInt((document.getElementById("pattern-top-delta") as HTMLInputElement).value) || 2,
          bottomDelta: parseInt((document.getElementById("pattern-bottom-delta") as HTMLInputElement).value) || 3,
        };
        break;
      case "suma-constante":
        rule = {
          type: "suma-constante",
          delta: parseInt((document.getElementById("pattern-delta") as HTMLInputElement).value) || 1,
        };
        break;
      case "espejo":
        rule = { type: "espejo" };
        break;
      case "encadenado-clasico":
        rule = { type: "encadenado-clasico" };
        break;
      default:
        rule = { type: "fraccion", topDelta: 2, bottomDelta: 3 };
    }

    state.sequence = generatePattern({
      rule,
      length,
      hideIndices,
      startTop,
      startBottom,
    });

    renderAll();
  });

  renderAll();
}
