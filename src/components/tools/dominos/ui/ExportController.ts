import { getSubsets } from "../layout";
import { renderLayoutHTML, tileLabel } from "../svg";
import type { PartialExportConfig } from "../types";
import { state, readLayout } from "./StateManager";
import { toBlob } from "html-to-image";
import JSZip from "jszip";

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function renderExportSelection() {
  const container = document.getElementById("export-selection");
  if (!container) return;
  if (state.sequence.length === 0) {
    container.classList.add("hidden");
    return;
  }
  container.classList.remove("hidden");
  container.innerHTML = `
    <div class="bg-white border border-[#d3e0e4] rounded-[3px] p-2 max-h-[160px] overflow-y-auto">
      <p class="text-[10px] text-[#8b98a3] uppercase tracking-wider mb-1.5 px-1">Selecciona fichas para exportar</p>
      <div class="flex flex-wrap gap-1.5">
        ${state.sequence.map((tile, i) => {
          const label = tileLabel(tile);
          return `
            <label class="flex items-center gap-1 bg-[#f8fafb] border border-[#d3e0e4] rounded px-1.5 py-0.5 cursor-pointer hover:border-[#6b7680] transition-all">
              <input type="checkbox" data-export-idx="${i}" class="export-checkbox w-3 h-3 accent-[#c4392b]" />
              <span class="text-[10px] font-mono text-[#33393e]">${i + 1}. ${label}</span>
            </label>
          `;
        }).join("")}
      </div>
    </div>
  `;
}

export function initExportController() {
  const exportModeSelect = document.getElementById("export-mode") as HTMLSelectElement;
  const exportSegmentWrap = document.getElementById("export-segment-wrap");
  const exportSelectionDiv = document.getElementById("export-selection");

  exportModeSelect?.addEventListener("change", () => {
    const mode = exportModeSelect.value;
    if (exportSegmentWrap) exportSegmentWrap.classList.toggle("hidden", mode !== "segmentado");
    if (mode === "seleccion") {
      renderExportSelection();
    } else {
      exportSelectionDiv?.classList.add("hidden");
    }
  });

  document.getElementById("btn-export")?.addEventListener("click", async () => {
    const btn = document.getElementById("btn-export") as HTMLButtonElement;
    if (!btn || state.sequence.length === 0) return;

    const mode = exportModeSelect.value;
    const ghost = document.getElementById("export-ghost");
    if (!ghost) return;

    btn.disabled = true;
    const originalText = btn.textContent;
    btn.textContent = "Exportando...";

    try {
      let exportConfig: PartialExportConfig;
      if (mode === "seleccion") {
        const checkboxes = document.querySelectorAll<HTMLInputElement>(".export-checkbox:checked");
        const indices = Array.from(checkboxes).map((cb) => parseInt(cb.dataset.exportIdx!)).filter((n) => !isNaN(n));
        if (indices.length === 0) { btn.textContent = originalText; btn.disabled = false; return; }
        exportConfig = { mode: "seleccion", indices };
      } else if (mode === "segmentado") {
        const segSize = parseInt((document.getElementById("export-segment-size") as HTMLInputElement)?.value) || 4;
        exportConfig = { mode: "segmentado", segmentSize: segSize };
      } else {
        exportConfig = { mode: "completa" };
      }

      const subsets = getSubsets(state.sequence, exportConfig);
      const currentLayout = readLayout();
      const blobs: Blob[] = [];

      for (const subset of subsets) {
        const html = renderLayoutHTML(subset, currentLayout);
        ghost.innerHTML = html;
        await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
        const blob = await toBlob(ghost, { pixelRatio: 2 });
        if (blob) blobs.push(blob);
        ghost.innerHTML = "";
      }

      if (blobs.length === 0) return;

      if (blobs.length === 1) {
        downloadBlob(blobs[0], "dominos-layout.png");
      } else {
        const zip = new JSZip();
        blobs.forEach((blob, i) => {
          zip.file(`pregunta-${i + 1}.png`, blob);
        });
        const zipBlob = await zip.generateAsync({ type: "blob" });
        downloadBlob(zipBlob, "set-dominos.zip");
      }
    } catch (err) {
      console.error("Export failed:", err);
    } finally {
      btn.textContent = originalText;
      btn.disabled = false;
    }
  });
}
