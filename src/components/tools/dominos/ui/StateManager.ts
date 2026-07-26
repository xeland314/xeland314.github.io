import {
  createTile,
} from "../core";
import { generatePattern, generateMatrixPattern } from "../pattern";
import { layoutTiles, getBoundingBox } from "../layout";
import type { PipCount, TileSize, TileOrientation, DominoTile, LayoutConfig, LayoutMode, PatternRule } from "../types";
import { renderTileSVG, tileLabel, renderMatrixHTML } from "../svg";

export const state = {
  sequence: [] as DominoTile[],
  currentLayout: { mode: "grid", gap: 12, columns: 3 } as LayoutConfig,
  matrix: null as DominoTile[][] | null,
};

export function readLayout(): LayoutConfig {
  const mode = (document.getElementById("seq-layout") as HTMLSelectElement)?.value as LayoutMode || "grid";
  const columns = parseInt((document.getElementById("seq-columns") as HTMLInputElement)?.value) || 3;
  const gap = parseInt((document.getElementById("seq-gap") as HTMLInputElement)?.value) || 12;
  const colsWrap = document.getElementById("seq-columns-wrap");
  if (colsWrap) colsWrap.classList.toggle("hidden", mode === "free");
  return { mode, gap, columns };
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
  const bbox = getBoundingBox(placed);
  const ox = bbox.offsetX;
  const oy = bbox.offsetY;

  const tilesHtml = placed.map((p, i) => {
    const svg = renderTileSVG(p.tile);
    const label = tileLabel(p.tile);
    const dragAttr = isFree ? `data-seq-drag="${i}" style="position:absolute;left:${p.x + ox}px;top:${p.y + oy}px;cursor:grab;"` : `style="position:absolute;left:${p.x + ox}px;top:${p.y + oy}px;"`;
    return `
      <div ${dragAttr} class="flex flex-col items-center">
        ${svg}
        <span class="text-[9px] text-[#8b98a3] font-mono mt-0.5">${label}</span>
      </div>
    `;
  }).join("");

  container.innerHTML = `
    <div class="relative bg-white border border-[#e8edef] rounded-[3px] p-4" style="width:${bbox.width}px;height:${bbox.height}px;">
      ${tilesHtml}
    </div>
  `;

  if (isFree) initDragHandlers();
}

function renderMatrix() {
  const container = document.getElementById("seq-preview");
  if (!container) return;

  if (!state.matrix || state.matrix.length === 0) return;

  container.innerHTML = renderMatrixHTML(state.matrix);
}

function buildRule(): PatternRule {
  const ruleType = (document.getElementById("gen-rule") as HTMLSelectElement).value;
  switch (ruleType) {
    case "fraccion":
      return {
        type: "fraccion",
        topDelta: parseInt((document.getElementById("gen-top-delta") as HTMLInputElement).value) || 2,
        bottomDelta: parseInt((document.getElementById("gen-bottom-delta") as HTMLInputElement).value) || 3,
      };
    case "suma-constante":
      return { type: "suma-constante", delta: parseInt((document.getElementById("gen-delta") as HTMLInputElement).value) || 1 };
    case "espejo":
      return { type: "espejo" };
    case "encadenado-clasico":
      return { type: "encadenado-clasico" };
    case "operacion-interna":
      return { type: "operacion-interna", delta: parseInt((document.getElementById("gen-delta") as HTMLInputElement).value) || 2 };
    case "series-alternadas":
      return {
        type: "series-alternadas",
        deltaA: parseInt((document.getElementById("gen-delta-a") as HTMLInputElement).value) || 1,
        deltaB: parseInt((document.getElementById("gen-delta-b") as HTMLInputElement).value) || -1,
      };
    case "lectura-z":
      return { type: "lectura-z", delta: parseInt((document.getElementById("gen-delta") as HTMLInputElement).value) || 1 };
    case "progresion-geometrica":
      return { type: "progresion-geometrica", factor: parseInt((document.getElementById("gen-factor") as HTMLInputElement).value) || 2 };
    case "inversion-polar":
      return { type: "inversion-polar" };
    default:
      return { type: "fraccion", topDelta: 2, bottomDelta: 3 };
  }
}

function buildMatrixRuleFromDOM(prefix: string, ruleType: string): PatternRule {
  const delta = parseInt((document.getElementById(`${prefix}-delta`) as HTMLInputElement)?.value) || 1;
  switch (ruleType) {
    case "fraccion":
      return { type: "fraccion" as const, topDelta: delta, bottomDelta: delta };
    case "suma-constante":
      return { type: "suma-constante" as const, delta };
    case "espejo":
      return { type: "espejo" as const };
    case "encadenado-clasico":
      return { type: "encadenado-clasico" as const };
    case "operacion-interna":
      return { type: "operacion-interna" as const, delta };
    case "series-alternadas":
      return { type: "series-alternadas" as const, deltaA: delta, deltaB: -delta };
    case "lectura-z":
      return { type: "lectura-z" as const, delta };
    case "progresion-geometrica":
      return { type: "progresion-geometrica" as const, factor: delta };
    case "inversion-polar":
      return { type: "inversion-polar" as const };
    default:
      return { type: "suma-constante" as const, delta: 1 };
  }
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
  state.currentLayout = readLayout();
  if (state.matrix) {
    renderMatrix();
  } else {
    updatePreview();
  }
  renderOperationsList();
}

function initDragHandlers() {
  import("./DragController").then((m) => m.initDragHandlers());
}

export function initStateManager() {
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

  document.getElementById("btn-seq-add")?.addEventListener("click", () => {
    const top = parseInt((document.getElementById("seq-top") as HTMLSelectElement).value) as PipCount;
    const bottom = parseInt((document.getElementById("seq-bottom") as HTMLSelectElement).value) as PipCount;
    const size = (document.getElementById("seq-size") as HTMLSelectElement).value as TileSize;
    const orientation = (document.getElementById("seq-orientation") as HTMLSelectElement).value as TileOrientation;
    state.sequence.push(createTile(top, bottom, orientation, size));
    state.matrix = null;
    renderAll();
  });

  document.getElementById("btn-clear-sequence")?.addEventListener("click", () => {
    state.sequence = [];
    state.matrix = null;
    renderAll();
  });

  ["seq-layout", "seq-columns", "seq-gap"].forEach((id) => {
    document.getElementById(id)?.addEventListener("change", () => {
      state.currentLayout = readLayout();
      updatePreview();
      renderOperationsList();
    });
  });

  // Generator mode toggle
  let genMode: "seq" | "matrix" = "seq";
  const btnSeq = document.getElementById("gen-mode-seq");
  const btnMatrix = document.getElementById("gen-mode-matrix");
  const seqParams = document.getElementById("gen-seq-params");
  const matrixParams = document.getElementById("gen-matrix-params");

  function setGenMode(mode: "seq" | "matrix") {
    genMode = mode;
    if (btnSeq && btnMatrix) {
      btnSeq.className = `gen-mode-btn font-serif font-bold text-[11px] py-1.5 px-4 rounded-[3px] cursor-pointer transition-all ${
        mode === "seq" ? "bg-[#33393e] text-white border border-[#33393e]" : "bg-white text-[#6b7680] border border-[#d3e0e4] hover:bg-[#f5f7f8]"
      }`;
      btnMatrix.className = `gen-mode-btn font-serif font-bold text-[11px] py-1.5 px-4 rounded-[3px] cursor-pointer transition-all ${
        mode === "matrix" ? "bg-[#33393e] text-white border border-[#33393e]" : "bg-white text-[#6b7680] border border-[#d3e0e4] hover:bg-[#f5f7f8]"
      }`;
    }
    if (seqParams) seqParams.classList.toggle("hidden", mode !== "seq");
    if (matrixParams) matrixParams.classList.toggle("hidden", mode !== "matrix");
  }

  btnSeq?.addEventListener("click", () => setGenMode("seq"));
  btnMatrix?.addEventListener("click", () => setGenMode("matrix"));

  // Rule param visibility
  const ruleSelect = document.getElementById("gen-rule") as HTMLSelectElement;
  const paramFraccionTop = document.getElementById("param-fraccion-top");
  const paramFraccionBottom = document.getElementById("param-fraccion-bottom");
  const paramDelta = document.getElementById("param-delta");
  const paramFactor = document.getElementById("param-factor");
  const paramDeltaA = document.getElementById("param-delta-a");
  const paramDeltaB = document.getElementById("param-delta-b");

  function updateRuleParams() {
    const rule = ruleSelect.value;
    if (paramFraccionTop) paramFraccionTop.classList.toggle("hidden", rule !== "fraccion");
    if (paramFraccionBottom) paramFraccionBottom.classList.toggle("hidden", rule !== "fraccion");
    if (paramDelta) paramDelta.classList.toggle("hidden", !["suma-constante", "operacion-interna", "lectura-z"].includes(rule));
    if (paramFactor) paramFactor.classList.toggle("hidden", rule !== "progresion-geometrica");
    if (paramDeltaA) paramDeltaA.classList.toggle("hidden", rule !== "series-alternadas");
    if (paramDeltaB) paramDeltaB.classList.toggle("hidden", rule !== "series-alternadas");
  }

  ruleSelect?.addEventListener("change", updateRuleParams);
  updateRuleParams();

  // Unified generate button
  document.getElementById("btn-generate")?.addEventListener("click", () => {
    if (genMode === "matrix") {
      const rowRuleType = (document.getElementById("gen-matrix-row-rule") as HTMLSelectElement).value;
      const colRuleType = (document.getElementById("gen-matrix-col-rule") as HTMLSelectElement).value;
      const rows = parseInt((document.getElementById("gen-matrix-rows") as HTMLInputElement).value) || 4;
      const cols = parseInt((document.getElementById("gen-matrix-cols") as HTMLInputElement).value) || 4;
      const startTop = parseInt((document.getElementById("gen-matrix-start-top") as HTMLSelectElement).value) as PipCount || 0;
      const startBottom = parseInt((document.getElementById("gen-matrix-start-bottom") as HTMLSelectElement).value) as PipCount || 0;
      const hiddenRowRaw = (document.getElementById("gen-matrix-hidden-row") as HTMLInputElement).value;
      const hiddenColRaw = (document.getElementById("gen-matrix-hidden-col") as HTMLInputElement).value;
      const hiddenCell = (hiddenRowRaw !== "" && hiddenColRaw !== "")
        ? { row: parseInt(hiddenRowRaw), col: parseInt(hiddenColRaw) }
        : undefined;

      state.matrix = generateMatrixPattern({
        rows,
        columns: cols,
        rowRule: buildMatrixRuleFromDOM("gen-matrix-row", rowRuleType),
        columnRule: buildMatrixRuleFromDOM("gen-matrix-col", colRuleType),
        hiddenCell,
        startTop,
        startBottom,
      });
    } else {
      const startTop = parseInt((document.getElementById("gen-start-top") as HTMLSelectElement).value) as PipCount;
      const startBottom = parseInt((document.getElementById("gen-start-bottom") as HTMLSelectElement).value) as PipCount;
      const length = parseInt((document.getElementById("gen-length") as HTMLInputElement).value) || 9;
      const hideInput = (document.getElementById("gen-hide") as HTMLInputElement).value;
      const hideIndices = hideInput ? hideInput.split(",").map(s => parseInt(s.trim())).filter(n => !isNaN(n)) : [];

      state.sequence = generatePattern({
        rule: buildRule(),
        length,
        hideIndices,
        startTop,
        startBottom,
      });
      state.matrix = null;
    }

    renderAll();
  });

  renderAll();
}
