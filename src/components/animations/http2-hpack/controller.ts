import { recordStageToVideo } from "../VideoRecorder";
import { getVideoFormat, wireResolutionSelect } from "../exportOptions";
import {
  buildHpackLines,
  BYTES_REQUEST_1,
  BYTES_REQUEST_2,
  HEADER_ROWS,
  HPACK_TIMING,
} from "./sequence";

const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

const MAX_CONSOLE_ROWS = 5;

const COLOR = {
  hp: "#a855f7",
  ok: "#7cfb4c",
  muted: "#a1a1aa",
  warn: "#f87171",
} as const;

export function initHpackAnimation(): void {
  const fileNameEl = document.getElementById("fileName");
  const statusBadge = document.getElementById("statusBadge");
  const codeBody = document.getElementById("codeBody");
  const consoleText = document.getElementById("consoleText");
  const btnPlay = document.getElementById("btnPlay") as HTMLButtonElement | null;
  const resetBtn = document.getElementById("resetBtn") as HTMLButtonElement | null;
  const stepBtn = document.getElementById("stepBtn") as HTMLButtonElement | null;
  const exportBtn = document.getElementById("exportBtn") as HTMLButtonElement | null;
  const resSelect = document.getElementById("resSelect") as HTMLSelectElement | null;
  const statusText = document.getElementById("statusText");
  const stageEl = document.getElementById("stage");

  if (
    !fileNameEl ||
    !statusBadge ||
    !codeBody ||
    !consoleText ||
    !btnPlay ||
    !statusText ||
    !stageEl
  ) {
    console.warn("Animación hpack: faltan elementos del DOM.");
    return;
  }

  const file = fileNameEl;
  const badge = statusBadge;
  const body = codeBody;
  const consoleEl = consoleText;
  const status = statusText;

  let busy = false;

  function updateExportLabel(): void {
    if (!exportBtn) return;
    const fmt = getVideoFormat();
    exportBtn.textContent = `⬇ Exportar video (${fmt.width}×${fmt.height})`;
  }
  resSelect && wireResolutionSelect(resSelect, updateExportLabel);
  updateExportLabel();

  function buildLines(): void {
    file.textContent = "hpack_flow.txt";
    body.innerHTML = "";
    buildHpackLines().forEach((line, idx) => {
      const row = document.createElement("div");
      row.className = "anim-code-line";
      row.dataset.id = String(line.id);
      row.innerHTML = `<span class="anim-ln">${idx + 1}</span><span>${line.html}</span>`;
      body.appendChild(row);
    });
  }

  function lineEl(id: number): Element | null {
    return body.querySelector(`[data-id="${id}"]`);
  }

  function setLineActive(id: number): void {
    clearLines();
    lineEl(id)?.classList.add("anim-hp-line-active");
  }

  function clearLines(): void {
    body.querySelectorAll(".anim-code-line").forEach((el) => {
      el.classList.remove("anim-hp-line-active");
    });
  }

  function consolePrint(text: string, color = "#7ee08a"): void {
    const row = document.createElement("div");
    row.className = "anim-row";
    row.style.color = color;
    row.textContent = text;
    consoleEl.appendChild(row);
    const rows = consoleEl.querySelectorAll(".anim-row");
    if (rows.length > MAX_CONSOLE_ROWS) {
      for (let i = 0; i < rows.length - MAX_CONSOLE_ROWS; i++) {
        rows[i].remove();
      }
    }
  }

  function setStatus(text: string, color: string): void {
    badge.textContent = text;
    badge.style.color = color;
    badge.style.borderColor = color;
  }

  function byId(id: string): HTMLElement | null {
    return document.getElementById(id);
  }

  function show(id: string, opacity: string): void {
    byId(id)?.setAttribute("opacity", opacity);
  }

  function highlightRow(id: string, active: boolean): void {
    byId(id)?.setAttribute("opacity", active ? "1" : "0.35");
  }

  function resetAll(): void {
    for (const r of HEADER_ROWS) {
      highlightRow(r.rowId, false);
      show(r.dynId, "0");
    }
    show("chipReq2", "0.25");
    show("barCompactLabel", "0");
    show("savingsText", "0");
    byId("barCompact")?.setAttribute("width", "0");
    consoleEl.innerHTML = "";
    clearLines();
    setStatus("ESPERANDO", COLOR.muted);
  }

  async function phaseRequest1(): Promise<void> {
    setStatus("REQUEST 1 · LITERALES + HUFFMAN", COLOR.hp);
    consolePrint("GET /api/users → headers en texto", "#e9d5ff");
    await sleep(HPACK_TIMING.introPause);

    setLineActive(1);
    consolePrint(":method GET ya existe → índice estático [2]", "#7dd3fc");
    await sleep(HPACK_TIMING.headerStep);

    let line = 2;
    for (const r of HEADER_ROWS) {
      setLineActive(line);
      highlightRow(r.rowId, true);
      consolePrint(`nuevo header → se guarda como ${r.index}`, "#c8ffb0");
      await sleep(HPACK_TIMING.headerStep);
      show(r.dynId, "1");
      await sleep(HPACK_TIMING.tablePause);
      line++;
    }
    setLineActive(5);
    setStatus("TABLA DINÁMICA SINCRONIZADA", COLOR.ok);
    consolePrint("cliente y servidor comparten la misma tabla", COLOR.ok);
    await sleep(HPACK_TIMING.req2Intro);
  }

  async function phaseRequest2(): Promise<void> {
    setStatus("REQUEST 2 · SOLO ÍNDICES", COLOR.hp);
    show("chipReq2", "1");

    let chipLine = 2;
    for (const r of HEADER_ROWS) {
      const chip = byId(r.chipId);
      chip?.setAttribute("transform", "translate(0,-6)");
      consolePrint(`request 2 envía ${r.index} en vez del texto`, "#7dd3fc");
      setLineActive(chipLine);
      await sleep(HPACK_TIMING.chipStep + HPACK_TIMING.chipTablePause);
      chip?.setAttribute("transform", "translate(0,0)");
      chipLine++;
    }
    setLineActive(5);

    const compactWidth = Math.max(
      8,
      Math.round(340 * (BYTES_REQUEST_2 / BYTES_REQUEST_1)),
    );
    byId("barCompact")?.setAttribute("width", String(compactWidth));
    show("barCompactLabel", "1");
    consolePrint(`${BYTES_REQUEST_1} B → ${BYTES_REQUEST_2} B`, COLOR.warn);
    await sleep(HPACK_TIMING.barPause);

    show("savingsText", "1");
    consolePrint("HPACK: tablas compartidas + Huffman ✓", COLOR.ok);
    setStatus("HPACK COMPLETADO", COLOR.ok);
    await sleep(HPACK_TIMING.savingsReveal + HPACK_TIMING.endPause);
    clearLines();
  }

  async function playDemo(): Promise<void> {
    await phaseRequest1();
    await phaseRequest2();
  }

  async function runStepwise(): Promise<void> {
    if (busy) return;
    busy = true;
    setControlsDisabled(true);
    try {
      await phaseRequest1();
    } finally {
      setControlsDisabled(false);
      busy = false;
    }
  }

  function setControlsDisabled(disabled: boolean): void {
    [btnPlay, resetBtn, stepBtn, exportBtn].forEach((btn) => {
      if (btn) btn.disabled = disabled;
    });
  }

  btnPlay?.addEventListener("click", async () => {
    if (busy) return;
    busy = true;
    setControlsDisabled(true);
    try {
      await playDemo();
    } finally {
      setControlsDisabled(false);
      busy = false;
    }
  });

  stepBtn?.addEventListener("click", () => {
    void runStepwise();
  });

  resetBtn?.addEventListener("click", () => {
    if (busy) return;
    resetAll();
  });

  exportBtn?.addEventListener("click", async () => {
    if (busy) return;
    busy = true;
    setControlsDisabled(true);

    const fmt = getVideoFormat();
    status.textContent = `Renderizando ${fmt.width}×${fmt.height} a ${fmt.fps}fps... El navegador puede ralentizarse.`;

    const scene = async () => {
      await playDemo();
      await sleep(300);
    };

    try {
      await recordStageToVideo(stage, scene, {
        width: fmt.width,
        height: fmt.height,
        fps: fmt.fps,
        fileName: `http2-hpack-${fmt.width}x${fmt.height}.webm`,
      });
      status.textContent = `Video descargado ✓ (${fmt.width}×${fmt.height})`;
    } catch (err) {
      console.error("Error exportando video:", err);
      status.textContent = "Error exportando el video.";
    } finally {
      setControlsDisabled(false);
      busy = false;
      setTimeout(() => {
        status.textContent = "";
      }, 3500);
    }
  });

  buildLines();
  resetAll();
}
