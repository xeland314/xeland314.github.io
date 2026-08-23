import { recordStageToVideo } from "../VideoRecorder";
import { getVideoFormat, wireResolutionSelect } from "../exportOptions";
import { buildUmaskLines, UMASK_TIMING, type UmaskMode } from "./sequence";

const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

const MAX_CONSOLE_ROWS = 6;

const COLOR = {
  green: "#7cfb4c",
  red: "#ff5f57",
  purple: "#c084fc",
  muted: "#a1a1aa",
  gray: "#d1d5db",
} as const;

type Bits = readonly number[];

const DEFAULT_FILE: Bits = [1, 1, 0, 1, 1, 0, 1, 1, 0];
const DEFAULT_DIR: Bits = [1, 1, 1, 1, 1, 1, 1, 1, 1];

const MASKS: Record<UmaskMode, Bits> = {
  "022": [0, 0, 0, 0, 1, 0, 0, 1, 0],
  "077": [0, 0, 0, 1, 1, 1, 1, 1, 1],
};

const RESULTS_FILE: Record<UmaskMode, Bits> = {
  "022": [1, 1, 0, 1, 0, 0, 1, 0, 0],
  "077": [1, 1, 0, 0, 0, 0, 0, 0, 0],
};

const RESULTS_DIR: Record<UmaskMode, Bits> = {
  "022": [1, 1, 1, 1, 0, 1, 1, 0, 1],
  "077": [1, 1, 1, 0, 0, 0, 0, 0, 0],
};

export function initUmaskAnimation(): void {
  const fileNameEl = document.getElementById("fileName");
  const statusBadge = document.getElementById("statusBadge");
  const codeBody = document.getElementById("codeBody");
  const consoleText = document.getElementById("consoleText");

  const octA = document.getElementById("octA");
  const octB = document.getElementById("octB");
  const octC = document.getElementById("octC");
  const octD = document.getElementById("octD");

  const btnMask022 = document.getElementById("btnMask022") as HTMLButtonElement | null;
  const btnMask077 = document.getElementById("btnMask077") as HTMLButtonElement | null;
  const btnPlay = document.getElementById("btnPlay") as HTMLButtonElement | null;
  const resetBtn = document.getElementById("resetBtn") as HTMLButtonElement | null;
  const exportBtn = document.getElementById("exportBtn") as HTMLButtonElement | null;
  const resSelect = document.getElementById("resSelect") as HTMLSelectElement | null;
  const statusText = document.getElementById("statusText");
  const stageEl = document.getElementById("stage");

  if (
    !fileNameEl ||
    !statusBadge ||
    !codeBody ||
    !consoleText ||
    !octA ||
    !octB ||
    !octC ||
    !octD ||
    !btnMask022 ||
    !btnMask077 ||
    !btnPlay ||
    !statusText ||
    !stageEl
  ) {
    console.warn("Animación umask: faltan elementos del DOM.");
    return;
  }

  const file = fileNameEl;
  const badge = statusBadge;
  const body = codeBody;
  const consoleEl = consoleText;
  const status = statusText;

  let mode: UmaskMode = "022";
  let busy = false;

  function updateExportLabel(): void {
    if (!exportBtn) return;
    const fmt = getVideoFormat();
    exportBtn.textContent = `⬇ Exportar video (${fmt.width}×${fmt.height})`;
  }
  resSelect && wireResolutionSelect(resSelect, updateExportLabel);
  updateExportLabel();

  function buildLines(): void {
    file.textContent = "umask.sh";
    body.innerHTML = "";
    buildUmaskLines().forEach((line, idx) => {
      const row = document.createElement("div");
      row.className = "anim-code-line";
      row.dataset.id = String(line.id);
      row.innerHTML = `<span class="anim-ln">${idx + 1}</span><span>${line.html}</span>`;
      body.appendChild(row);
    });
  }

  function setLineActive(id: number): void {
    clearLines();
    body
      .querySelector(`[data-id="${id}"]`)
      ?.classList.add("anim-um-line-active");
  }

  function clearLines(): void {
    body.querySelectorAll(".anim-code-line").forEach((el) => {
      el.classList.remove("anim-um-line-active");
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

  function cell(prefix: string, i: number): HTMLElement | null {
    return document.getElementById(`${prefix}${i}`);
  }

  function paint(prefix: string, bits: Bits, maskMode = false): void {
    for (let i = 0; i < 9; i++) {
      const el = cell(prefix, i);
      if (!el) continue;
      const state = maskMode
        ? bits[i] === 1
          ? "maskon"
          : "off"
        : bits[i] === 1
          ? "on"
          : "off";
      el.setAttribute("class", `um-cell ${state}`);
    }
  }

  function paintResultRow(prefix: string, result: Bits): void {
    paint(prefix, result);
  }

  function resetAll(): void {
    paint("a", DEFAULT_FILE);
    for (let i = 0; i < 9; i++) cell("b", i)?.setAttribute("class", "um-cell off");
    paint("c", DEFAULT_FILE);
    paint("d", DEFAULT_DIR);
    applyOctals();
    consoleEl.innerHTML = "";
    clearLines();
    setStatus("ESPERANDO", COLOR.muted);
  }

  function applyOctals(): void {
    octA.textContent = "666";
    octB.textContent = mode === "022" ? "022" : "077";
    octC.textContent = mode === "022" ? "644" : "600";
    octD.textContent = mode === "022" ? "755" : "700";
  }

  function setMode(next: UmaskMode): void {
    mode = next;
    btnMask022.className =
      next === "022" ? "ctrl-btn um022 flex-1" : "ctrl-btn flex-1";
    btnMask077.className =
      next === "077" ? "ctrl-btn um077 flex-1" : "ctrl-btn flex-1";
    resetAll();
  }

  async function computeFileCase(): Promise<void> {
    setLineActive(1);
    consolePrint(`$ umask ${mode}`, COLOR.gray);
    await sleep(UMASK_TIMING.introPause);

    setLineActive(2);
    paint("b", MASKS[mode], true);
    consolePrint(`máscara ${mode}: bits que se QUITAN`, COLOR.red);
    await sleep(UMASK_TIMING.maskShow);

    const mask = MASKS[mode];
    const result = RESULTS_FILE[mode];
    for (let g = 0; g < 3; g++) {
      consolePrint(`grupo ${g + 1}: default & ~mask`, COLOR.purple);
      for (let b = 0; b < 3; b++) {
        const i = g * 3 + b;
        if (mask[i] === 1 && DEFAULT_FILE[i] === 1) {
          cell("a", i)?.setAttribute("class", "um-cell off");
        }
        if (result[i] === 1) {
          cell("c", i)?.setAttribute("class", "um-cell on");
        } else {
          cell("c", i)?.setAttribute("class", "um-cell off");
        }
      }
      await sleep(UMASK_TIMING.groupStep);
    }
    consolePrint(`archivo nuevo → ${octC.textContent}`, COLOR.green);
  }

  async function runUmask(intro?: string): Promise<void> {
    if (intro) consolePrint(intro, COLOR.gray);
    setStatus("APLICANDO AND NOT BIT A BIT", COLOR.purple);

    paint("a", DEFAULT_FILE);
    paint("c", DEFAULT_FILE);
    await computeFileCase();
    await sleep(UMASK_TIMING.dirCompute);

    setLineActive(3);
    paint("d", RESULTS_DIR[mode]);
    consolePrint(`directorio nuevo → ${octD.textContent} (x hereda)`, COLOR.green);
    await sleep(UMASK_TIMING.maskSwap);

    setLineActive(4);
    setMode(mode === "022" ? "077" : "022");
    consolePrint(
      `modo privado: umask ${mode === "022" ? "077" : "022"} → nada para otros`,
      COLOR.red,
    );
    await sleep(UMASK_TIMING.secondStep);

    await computeFileCase();
    await sleep(UMASK_TIMING.secondStep);

    setStatus("MÁSCARA COMPUTADA", COLOR.green);
    consolePrint("✔ la máscara resta, jamás añade permisos", COLOR.green);
    await sleep(UMASK_TIMING.outroPause);
    clearLines();
  }

  async function playDemo(): Promise<void> {
    setMode("022");
    await runUmask("── umask 022: el clásico de servidores ──");
  }

  function setControlsDisabled(disabled: boolean): void {
    [btnMask022, btnMask077, btnPlay, resetBtn, exportBtn].forEach((btn) => {
      if (btn) btn.disabled = disabled;
    });
  }

  btnMask022?.addEventListener("click", () => {
    if (busy) return;
    setMode("022");
  });

  btnMask077?.addEventListener("click", () => {
    if (busy) return;
    setMode("077");
  });

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
        fileName: `umask-permissions-${fmt.width}x${fmt.height}.webm`,
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
