import { recordStageToVideo } from "../VideoRecorder";
import { getVideoFormat, wireResolutionSelect } from "../exportOptions";
import {
  buildCodeLines,
  fileNameFor,
  YIELD_TIMING,
  type YieldMode,
} from "./sequence";

const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

function setTextColorClass(el: HTMLElement, className: string): void {
  el.className = `font-mono text-[10px] ${className}`;
}

export function initYieldAnimation(): void {
  const codeBody = document.getElementById("codeBody");
  const fileName = document.getElementById("fileName");
  const statusBadge = document.getElementById("statusBadge");
  const ramUsageText = document.getElementById("ramUsageText");
  const consoleText = document.getElementById("consoleText");
  const btnReturn = document.getElementById("btnReturn") as HTMLButtonElement | null;
  const btnYield = document.getElementById("btnYield") as HTMLButtonElement | null;
  const btnPlay = document.getElementById("btnPlay") as HTMLButtonElement | null;
  const exportBtn = document.getElementById("exportBtn") as HTMLButtonElement | null;
  const resSelect = document.getElementById("resSelect") as HTMLSelectElement | null;
  const statusEl = document.getElementById("statusText");
  const stageEl = document.getElementById("stage");

  if (
    !codeBody ||
    !fileName ||
    !statusBadge ||
    !ramUsageText ||
    !consoleText ||
    !statusEl ||
    !stageEl
  ) {
    console.warn("Animación return vs yield: faltan elementos del DOM.");
    return;
  }

  const body = codeBody;
  const fname = fileName;
  const badge = statusBadge;
  const ram = ramUsageText;
  const consoleEl = consoleText;
  const status = statusEl;
  const stage = stageEl;

  const slotEls = [
    document.getElementById("slot0"),
    document.getElementById("slot1"),
    document.getElementById("slot2"),
    document.getElementById("slot3"),
  ];

  let mode: YieldMode = "return";

  function renderCode(): void {
    fname.textContent = fileNameFor(mode);
    body.innerHTML = "";
    buildCodeLines(mode).forEach((line) => {
      const row = document.createElement("div");
      row.className = "anim-code-line";
      row.dataset.line = String(line.id);
      row.innerHTML = `<span class="anim-ln">${line.id}</span><span>${line.html}</span>`;
      body.appendChild(row);
    });
  }

  function clearLines(): void {
    body.querySelectorAll(".anim-code-line").forEach((el) => {
      el.classList.remove("anim-active", "anim-warn-line");
    });
  }

  function setLineActive(lineId: number, isWarn = false): void {
    clearLines();
    const el = body.querySelector<HTMLElement>(`[data-line="${lineId}"]`);
    el?.classList.add(isWarn ? "anim-warn-line" : "anim-active");
  }

  function resetRAM(): void {
    slotEls.forEach((slot) => {
      if (slot) {
        slot.textContent = "-";
        slot.className = "anim-ram-slot";
      }
    });
    ram.textContent = "O(1) · 0 items";
    setTextColorClass(ram, "text-gray-400");
  }

  function clearConsole(): void {
    consoleEl.innerHTML = "";
  }

  function printConsole(text: string, color = "#7ee08a"): void {
    const div = document.createElement("div");
    div.style.color = color;
    div.textContent = text;
    consoleEl.appendChild(div);
  }

  function setStatus(text: string, color: string): void {
    badge.textContent = text;
    badge.style.color = color;
    badge.style.borderColor = color;
  }

  async function simulateReturn(): Promise<void> {
    setStatus("EJECUTANDO", "#ff5f57");
    resetRAM();
    clearConsole();

    setLineActive(1, true);
    await sleep(YIELD_TIMING.defPause);

    setLineActive(2, true);
    ram.textContent = "O(N) · creando lista";
    await sleep(YIELD_TIMING.defPause);

    for (let i = 1; i <= 4; i++) {
      setLineActive(3, true);
      await sleep(YIELD_TIMING.loopPause);

      setLineActive(4, true);
      const slot = slotEls[i - 1];
      if (slot) {
        slot.textContent = String(i);
        slot.className = "anim-ram-slot anim-filled-warn";
      }
      ram.textContent = `O(N) · ${i} items acumulados en RAM`;
      setTextColorClass(ram, "text-red-400 font-semibold");
      await sleep(YIELD_TIMING.appendPause);
    }

    setLineActive(5, true);
    setStatus("RETORNANDO TODO", "#ff5f57");
    await sleep(YIELD_TIMING.returnPause);

    printConsole(">>> lista_completa = obtener_datos()", "#ff8e88");
    printConsole("print(lista_completa)", "#999");
    printConsole("[1, 2, 3, 4]", "#ff8e88");

    setStatus("FINALIZADO", "#ff5f57");
    await sleep(YIELD_TIMING.endPause);
    clearLines();
  }

  async function simulateYield(): Promise<void> {
    setStatus("EJECUTANDO", "#7CFB4C");
    resetRAM();
    clearConsole();

    printConsole(">>> for num in generar_datos():", "#c8ffb0");

    for (let i = 1; i <= 4; i++) {
      setLineActive(2);
      await sleep(YIELD_TIMING.loopPause);

      setLineActive(3);
      setStatus(`YIELD ${i} (PAUSA ⏸)`, "#7CFB4C");

      resetRAM();
      const slot = slotEls[0];
      if (slot) {
        slot.textContent = String(i);
        slot.className = "anim-ram-slot anim-filled-yield";
      }
      ram.textContent = "O(1) · Solo 1 item activo en RAM";
      setTextColorClass(ram, "text-emerald-400 font-semibold");

      await sleep(YIELD_TIMING.yieldPause);

      printConsole(`  print(num) -> ${i}`, "#7CFB4C");
      await sleep(YIELD_TIMING.consumePause);
    }

    resetRAM();
    ram.textContent = "O(1) · Memoria liberada";
    setStatus("FINALIZADO", "#7CFB4C");
    await sleep(YIELD_TIMING.endPause);
    clearLines();
  }

  function applyModeButtons(): void {
    btnReturn?.classList.toggle("anim-yr-active-warn", mode === "return");
    btnYield?.classList.toggle("anim-yr-active-yield", mode === "yield");
  }

  function selectMode(next: YieldMode): void {
    mode = next;
    applyModeButtons();
    renderCode();
    resetRAM();
    clearConsole();
    setStatus("ESPERANDO", "#a1a1aa");
  }

  function updateExportLabel(): void {
    if (!exportBtn) return;
    const fmt = getVideoFormat();
    exportBtn.textContent = `⬇ Exportar video (${fmt.width}×${fmt.height})`;
  }
  resSelect && wireResolutionSelect(resSelect, updateExportLabel);
  updateExportLabel();

  let busy = false;

  function setControlsDisabled(disabled: boolean): void {
    [btnPlay, btnReturn, btnYield, exportBtn].forEach((btn) => {
      if (btn) btn.disabled = disabled;
    });
  }

  btnReturn?.addEventListener("click", () => {
    if (!busy && mode !== "return") selectMode("return");
  });

  btnYield?.addEventListener("click", () => {
    if (!busy && mode !== "yield") selectMode("yield");
  });

  btnPlay?.addEventListener("click", async () => {
    if (busy) return;
    busy = true;
    setControlsDisabled(true);
    try {
      if (mode === "return") {
        await simulateReturn();
      } else {
        await simulateYield();
      }
    } finally {
      setControlsDisabled(false);
      busy = false;
    }
  });

  exportBtn?.addEventListener("click", async () => {
    if (busy) return;
    busy = true;
    setControlsDisabled(true);

    const fmt = getVideoFormat();
    status.textContent = `Renderizando ${fmt.width}×${fmt.height} a ${fmt.fps}fps... El navegador puede ralentizarse.`;

    const scene = async () => {
      selectMode("return");
      await sleep(YIELD_TIMING.modePause);
      await simulateReturn();
      await sleep(350);
      selectMode("yield");
      await sleep(YIELD_TIMING.modePause);
      await simulateYield();
      await sleep(300);
    };

    try {
      await recordStageToVideo(stage, scene, {
        width: fmt.width,
        height: fmt.height,
        fps: fmt.fps,
        fileName: `python-return-vs-yield-${fmt.width}x${fmt.height}.webm`,
      });
      status.textContent = `Video descargado ✓ (${fmt.width}×${fmt.height})`;
    } catch (err) {
      console.error("Error exportando video:", err);
      status.textContent = "Error exportando el video.";
    } finally {
      selectMode("return");
      setControlsDisabled(false);
      busy = false;
      setTimeout(() => {
        status.textContent = "";
      }, 3500);
    }
  });

  renderCode();
  resetRAM();
  applyModeButtons();
}