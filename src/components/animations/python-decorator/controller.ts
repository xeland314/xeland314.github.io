import { recordStageToVideo } from "../VideoRecorder";
import { getVideoFormat, wireResolutionSelect } from "../exportOptions";
import { buildDecoratorLines, DECORATOR_TIMING } from "./sequence";

const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

const MAX_CONSOLE_ROWS = 5;

const COLOR = {
  wrapper: "#3fd0e0",
  inner: "#ff9736",
  signal: "#7cfb4c",
  muted: "#a1a1aa",
} as const;

export function initDecoratorAnimation(): void {
  const codeBody = document.getElementById("codeBody");
  const consoleBox = document.getElementById("consoleBox");
  const outerBox = document.getElementById("outerBox");
  const innerBox = document.getElementById("innerBox");
  const phaseBefore = document.getElementById("phaseBefore");
  const phaseInner = document.getElementById("phaseInner");
  const phaseAfter = document.getElementById("phaseAfter");
  const timerText = document.getElementById("timerText");
  const progressBar = document.getElementById("progressBar");
  const statusBadge = document.getElementById("statusBadge");
  const statusText = document.getElementById("statusText");
  const stageEl = document.getElementById("stage");

  if (
    !codeBody ||
    !consoleBox ||
    !outerBox ||
    !innerBox ||
    !phaseBefore ||
    !phaseInner ||
    !phaseAfter ||
    !timerText ||
    !progressBar ||
    !statusBadge ||
    !statusText ||
    !stageEl
  ) {
    console.warn("Animación decorador: faltan elementos del DOM.");
    return;
  }

  const body = codeBody;
  const box = consoleBox;
  const outer = outerBox;
  const inner = innerBox;
  const before = phaseBefore;
  const innerPhase = phaseInner;
  const after = phaseAfter;
  const timer = timerText;
  const bar = progressBar;
  const badge = statusBadge;
  const status = statusText;
  const stage = stageEl;

  const playBtn = document.getElementById("playBtn") as HTMLButtonElement | null;
  const resetBtn = document.getElementById(
    "resetBtn",
  ) as HTMLButtonElement | null;
  const exportBtn = document.getElementById(
    "exportBtn",
  ) as HTMLButtonElement | null;
  const resSelect = document.getElementById(
    "resSelect",
  ) as HTMLSelectElement | null;

  function updateExportLabel(): void {
    if (!exportBtn) return;
    const fmt = getVideoFormat();
    exportBtn.textContent = `⬇ Exportar video (${fmt.width}×${fmt.height})`;
  }
  resSelect && wireResolutionSelect(resSelect, updateExportLabel);
  updateExportLabel();

  function buildLines(): void {
    body.innerHTML = "";
    buildDecoratorLines().forEach((line, idx) => {
      const row = document.createElement("div");
      row.className = "anim-code-line";
      row.dataset.id = String(line.id);
      row.innerHTML = `<span class="anim-ln">${idx + 1}</span><span>${line.html}</span>`;
      body.appendChild(row);
    });
  }

  function lineEl(id: number): HTMLElement | null {
    return body.querySelector(`[data-id="${id}"]`);
  }

  function setHighlight(
    id: number,
    type: "wrapper" | "inner" | "signal",
  ): void {
    clearLines();
    const el = lineEl(id);
    if (type === "wrapper") el?.classList.add("anim-dec-line-wrapper");
    else if (type === "inner") el?.classList.add("anim-dec-line-inner");
    else el?.classList.add("anim-active");
  }

  function clearLines(): void {
    body.querySelectorAll(".anim-code-line").forEach((el) => {
      el.classList.remove(
        "anim-active",
        "anim-dec-line-wrapper",
        "anim-dec-line-inner",
      );
    });
  }

  function consolePrint(text: string, color = "#7ee08a"): void {
    const row = document.createElement("div");
    row.className = "anim-row";
    row.style.color = color;
    row.textContent = text;
    const caret = box.querySelector(".anim-caret");
    if (caret) {
      caret.before(row);
    } else {
      box.appendChild(row);
    }
    const rows = box.querySelectorAll(".anim-row");
    if (rows.length > MAX_CONSOLE_ROWS) {
      for (let i = 0; i < rows.length - MAX_CONSOLE_ROWS; i++) {
        rows[i].remove();
      }
    }
  }

  function resetVisuals(): void {
    clearLines();
    outer.className = "anim-dec-outer";
    inner.className = "anim-dec-inner";
    before.className = "anim-dec-phase";
    after.className = "anim-dec-phase";
    innerPhase.textContent = "Función original";
    innerPhase.className = "anim-dec-inner-status";
    timer.textContent = "Δt = 0.00s";
    timer.className = "anim-dec-timer";
    bar.style.width = "0%";
  }

  function resetAll(): void {
    resetVisuals();
    box.querySelectorAll(".anim-row").forEach((el) => el.remove());
  }

  function setStatus(text: string, color: string): void {
    badge.textContent = text;
    badge.style.color = color;
    badge.style.borderColor = color;
  }

  async function playSequence(): Promise<void> {
    resetAll();
    await sleep(DECORATOR_TIMING.startPause);

    // Invocar decorador
    setHighlight(7, "wrapper");
    setStatus("INVOCANDO DECORADOR", COLOR.wrapper);
    consolePrint(">>> procesar_datos()", COLOR.wrapper);
    await sleep(DECORATOR_TIMING.invokePause);

    // 1. Entrar al wrapper (ANTES)
    setHighlight(3, "wrapper");
    outer.classList.add("anim-dec-lit");
    before.classList.add("anim-dec-phase-active");
    setStatus("WRAPPER: ANTES", COLOR.wrapper);
    timer.textContent = "⏱ t0 iniciado...";
    timer.className = "anim-dec-timer anim-dec-timer--hot";
    consolePrint("⏱ [wrapper] t0 = time.time()", COLOR.wrapper);
    await sleep(DECORATOR_TIMING.beforePause);

    // 2. Ejecutar función interna (DURANTE)
    setHighlight(4, "inner");
    inner.classList.add("anim-dec-lit");
    innerPhase.textContent = "⚙ Ejecutando...";
    innerPhase.className = "anim-dec-inner-status anim-dec-inner-status--live";
    setStatus("EJECUTANDO ORIGINAL", COLOR.inner);
    consolePrint("⚡ [procesar_datos] Trabajo pesado...", COLOR.inner);
    bar.style.width = "30%";
    await sleep(Math.round(DECORATOR_TIMING.duringPause / 3));
    bar.style.width = "70%";
    await sleep(Math.round(DECORATOR_TIMING.duringPause / 3));
    bar.style.width = "100%";
    await sleep(Math.round(DECORATOR_TIMING.duringPause / 3));

    // 3. Salir al wrapper (DESPUÉS)
    setHighlight(5, "wrapper");
    inner.classList.remove("anim-dec-lit");
    innerPhase.textContent = "✔ Finalizado";
    innerPhase.className = "anim-dec-inner-status";
    after.classList.add("anim-dec-phase-active");
    setStatus("WRAPPER: DESPUÉS", COLOR.wrapper);
    const elapsed = 0.48;
    timer.textContent = `⏱ Δt = ${elapsed}s`;
    timer.className = "anim-dec-timer anim-dec-timer--hot";
    consolePrint(`⏱ [wrapper] Tiempo transcurrido: ${elapsed}s`, COLOR.signal);
    await sleep(DECORATOR_TIMING.afterPause);

    // Return
    setHighlight(6, "signal");
    setStatus("FINALIZADO", COLOR.signal);
    consolePrint('>>> Resultado: "OK"', COLOR.signal);
    await sleep(DECORATOR_TIMING.donePause);
    clearLines();
  }

  let busy = false;

  function setControlsDisabled(disabled: boolean): void {
    [playBtn, resetBtn, exportBtn].forEach((btn) => {
      if (btn) btn.disabled = disabled;
    });
  }

  playBtn?.addEventListener("click", async () => {
    if (busy) return;
    busy = true;
    setControlsDisabled(true);
    try {
      await playSequence();
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
      await playSequence();
      await sleep(300);
    };

    try {
      await recordStageToVideo(stage, scene, {
        width: fmt.width,
        height: fmt.height,
        fps: fmt.fps,
        fileName: `python-decorador-${fmt.width}x${fmt.height}.webm`,
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