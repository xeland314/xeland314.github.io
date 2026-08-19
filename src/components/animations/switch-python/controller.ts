import { DRINKS, META, buildCodeLines, renderAssignLine, type Drink } from "../code/codeLines";
import type { HighlightState } from "./sequence";
import { resolveSequence } from "./sequence";
import { recordStageToVideo } from "../VideoRecorder";
import { getVideoFormat, wireResolutionSelect } from "../exportOptions";

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

const STATE_CLASS: Record<HighlightState, string> = {
  active: "anim-active",
  scan: "anim-scan",
  matched: "anim-matched",
};

const DEFAULT_DRINK: Drink = "limonada";

export function initAnimation(): void {
  const codeBody = document.getElementById("codeBody");
  const consoleText = document.getElementById("consoleText");
  const canEl = document.getElementById("canEl");
  const chuteLabel = document.getElementById("chuteLabel") as HTMLElement | null;
  const statusText = document.getElementById("statusText");
  const stageEl = document.getElementById("stage");

  if (
    !codeBody ||
    !consoleText ||
    !canEl ||
    !chuteLabel ||
    !statusText ||
    !stageEl
  ) {
    console.warn("Animación: faltan elementos del DOM.");
    return;
  }

  const body = codeBody;
  const consoleOut = consoleText;
  const can = canEl;
  const chute = chuteLabel;
  const status = statusText;
  const stage = stageEl;

  const autoBtn = document.getElementById("autoBtn") as HTMLButtonElement | null;
  const exportBtn = document.getElementById("exportBtn") as HTMLButtonElement | null;
  const resSelect = document.getElementById("resSelect") as HTMLSelectElement | null;
  const runBtns = Array.from(
    document.querySelectorAll<HTMLButtonElement>("[data-run]"),
  );

  function updateExportLabel(): void {
    if (!exportBtn) return;
    const fmt = getVideoFormat();
    exportBtn.textContent = `⬇ Exportar video (${fmt.width}×${fmt.height})`;
  }
  resSelect && wireResolutionSelect(resSelect, updateExportLabel);
  updateExportLabel();

  function buildLines(): void {
    body.innerHTML = "";
    for (const line of buildCodeLines(DEFAULT_DRINK)) {
      const row = document.createElement("div");
      row.className = "anim-code-line";
      row.dataset.id = line.id;
      if (line.drink) row.dataset.drink = line.drink;

      const ln = document.createElement("span");
      ln.className = "anim-ln";
      ln.textContent = line.lineNumber === null ? "" : String(line.lineNumber);

      const content = document.createElement("span");
      content.innerHTML = line.html;

      row.appendChild(ln);
      row.appendChild(content);
      body.appendChild(row);
    }
  }

  function updateAssignLine(drink: Drink): void {
    const row = body.querySelector('[data-id="assign"] span:last-child');
    if (row) row.innerHTML = renderAssignLine(drink);
  }

  function lineEl(id: string): HTMLElement | null {
    return body.querySelector(`[data-id="${id}"]`);
  }

  function clearLineStates(): void {
    body.querySelectorAll(".anim-code-line").forEach((el) => {
      el.classList.remove("anim-active", "anim-scan", "anim-matched");
    });
  }

  function resetMachine(): void {
    document.querySelectorAll(".anim-slot").forEach((s) => s.classList.remove("lit"));
    can.classList.remove("drop");
    chute.style.opacity = "1";
    consoleOut.textContent = "";
  }

  async function playSequence(drink: Drink): Promise<void> {
    clearLineStates();
    resetMachine();
    updateAssignLine(drink);

    for (const step of resolveSequence(drink)) {
      if (step.lineId && step.state) {
        lineEl(step.lineId)?.classList.add(STATE_CLASS[step.state]);
      }
      if (step.slot) {
        document
          .querySelector(`.anim-slot[data-drink="${step.slot}"]`)
          ?.classList.add("lit");
        can.textContent = META[step.slot].can;
        chute.style.opacity = "0";
      }
      if (step.dropCan) {
        can.classList.add("drop");
      }
      if (step.console) {
        consoleOut.textContent = step.console;
      }

      await sleep(step.ms);

      if (step.state === "active" || step.state === "scan") {
        lineEl(step.lineId!)?.classList.remove(STATE_CLASS[step.state]);
      }
    }
  }

  let busy = false;
  let autoRunning = false;

  function stopAuto(): void {
    autoRunning = false;
    if (autoBtn) autoBtn.textContent = "▶ Reproducir demo automática";
  }

  function setBusy(value: boolean): void {
    busy = value;
    if (exportBtn) exportBtn.disabled = value;
    if (autoBtn) autoBtn.disabled = value;
    runBtns.forEach((b) => {
      b.disabled = value;
    });
  }

  runBtns.forEach((btn) => {
    btn.addEventListener("click", async () => {
      if (busy) return;
      stopAuto();
      busy = true;
      try {
        await playSequence(btn.dataset.run as Drink);
      } finally {
        busy = false;
      }
    });
  });

  autoBtn?.addEventListener("click", async () => {
    if (autoRunning) {
      stopAuto();
      return;
    }
    if (busy) return;
    autoRunning = true;
    autoBtn.textContent = "■ Detener demo";
    busy = true;
    try {
      while (autoRunning) {
        for (const d of DRINKS) {
          if (!autoRunning) break;
          await playSequence(d);
          await sleep(300);
        }
      }
    } finally {
      busy = false;
    }
  });

  exportBtn?.addEventListener("click", async () => {
    if (busy) return;
    stopAuto();
    setBusy(true);
    const fmt = getVideoFormat();
    status.textContent = `Renderizando ${fmt.width}×${fmt.height} a ${fmt.fps}fps... El navegador puede ralentizarse.`;

    const scene = async () => {
      clearLineStates();
      resetMachine();
      await sleep(300);
      for (const d of DRINKS) {
        await playSequence(d);
        await sleep(350);
      }
      await sleep(300);
    };

    try {
      await recordStageToVideo(stage, scene, {
        width: fmt.width,
        height: fmt.height,
        fps: fmt.fps,
        fileName: `switch-python-bebidas-${fmt.width}x${fmt.height}.webm`,
      });
      status.textContent = `Video descargado ✓ (${fmt.width}×${fmt.height})`;
    } catch (err) {
      console.error("Error exportando video:", err);
      status.textContent = "Error exportando el video.";
    } finally {
      setBusy(false);
      setTimeout(() => {
        status.textContent = "";
      }, 3500);
    }
  });

  buildLines();
  updateAssignLine(DEFAULT_DRINK);
}