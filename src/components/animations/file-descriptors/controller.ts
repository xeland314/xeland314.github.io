import { recordStageToVideo } from "../VideoRecorder";
import { getVideoFormat, wireResolutionSelect } from "../exportOptions";
import { buildFdLines, FD_STEPS, FD_TIMING, type FdStep } from "./sequence";

const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

const MAX_CONSOLE_ROWS = 6;

const COLOR = {
  orange: "#ff9736",
  green: "#7cfb4c",
  red: "#ff5f57",
  sky: "#3fd0e0",
  muted: "#a1a1aa",
  gray: "#d1d5db",
} as const;

const STEP_LABEL: Record<FdStep, string> = {
  default: "estado: por defecto",
  gt: "cmd > out.txt",
  gtgt: "cmd >> out.txt",
  both: "cmd 2>&1",
};

export function initFdAnimation(): void {
  const fileNameEl = document.getElementById("fileName");
  const statusBadge = document.getElementById("statusBadge");
  const codeBody = document.getElementById("codeBody");
  const consoleText = document.getElementById("consoleText");

  const aOutScreen = document.getElementById("aOutScreen");
  const aErrScreen = document.getElementById("aErrScreen");
  const aOutFile = document.getElementById("aOutFile");
  const aErrFile = document.getElementById("aErrFile");
  const fileBox = document.getElementById("fileBox");
  const appendMark = document.getElementById("appendMark");
  const modeText = document.getElementById("modeText");
  const stateText = document.getElementById("stateText");

  const btnDefault = document.getElementById("btnDefault") as HTMLButtonElement | null;
  const btnGt = document.getElementById("btnGt") as HTMLButtonElement | null;
  const btnGtgt = document.getElementById("btnGtgt") as HTMLButtonElement | null;
  const btnBoth = document.getElementById("btnBoth") as HTMLButtonElement | null;
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
    !aOutScreen ||
    !aErrScreen ||
    !aOutFile ||
    !aErrFile ||
    !fileBox ||
    !appendMark ||
    !modeText ||
    !stateText ||
    !btnDefault ||
    !btnGt ||
    !btnGtgt ||
    !btnBoth ||
    !btnPlay ||
    !statusText ||
    !stageEl
  ) {
    console.warn("Animación file-descriptors: faltan elementos del DOM.");
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
    file.textContent = "fds.sh";
    body.innerHTML = "";
    buildFdLines().forEach((line, idx) => {
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
      ?.classList.add("anim-fd-line-active");
  }

  function clearLines(): void {
    body.querySelectorAll(".anim-code-line").forEach((el) => {
      el.classList.remove("anim-fd-line-active");
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

  function applyStep(step: FdStep): void {
    const dimScreenOut = step === "gt" || step === "gtgt" || step === "both";
    const dimScreenErr = step === "both";

    aOutScreen.classList.toggle("dim", dimScreenOut);
    aErrScreen.classList.toggle("dim", dimScreenErr);
    aOutFile.setAttribute("opacity", dimScreenOut ? "1" : "0");
    aErrFile.setAttribute("opacity", step === "both" ? "1" : "0");
    fileBox.classList.toggle("hot", dimScreenOut);
    appendMark.setAttribute("opacity", step === "gtgt" ? "1" : "0");
    modeText.setAttribute(
      "opacity",
      step === "default" ? "0" : "1",
    );
    modeText.textContent =
      step === "gt"
        ? "vacía · reemplaza"
        : step === "gtgt"
          ? "añade al final +"
          : step === "both"
            ? "stdout + stderr juntos"
            : "";
    stateText.textContent = `estado: ${STEP_LABEL[step]}`;
  }

  function resetAll(): void {
    applyStep("default");
    consoleEl.innerHTML = "";
    clearLines();
    setStatus("ESPERANDO", COLOR.muted);
  }

  function setMode(step: FdStep): void {
    const lineByStep: Record<FdStep, number> = {
      default: 1,
      gt: 2,
      gtgt: 3,
      both: 4,
    };
    setLineActive(lineByStep[step]);
    applyStep(step);
  }

  async function playDemo(): Promise<void> {
    setStatus("RECORRIDO POR LOS 4 ESTADOS", COLOR.orange);

    setLineActive(1);
    applyStep("default");
    consolePrint("fd0←teclado · fd1 y fd2→pantalla", COLOR.gray);
    await sleep(FD_TIMING.introPause);

    for (let i = 1; i < FD_STEPS.length; i++) {
      const step = FD_STEPS[i];
      setLineActive(i + 1);
      applyStep(step);
      if (step === "gt") {
        consolePrint("> reconecta fd1 al archivo (lo trunca)", COLOR.orange);
      } else if (step === "gtgt") {
        consolePrint(">> añade al final sin borrar", COLOR.orange);
      } else {
        consolePrint("2>&1 duplica fd2 hacia donde apunta fd1", COLOR.sky);
      }
      await sleep(FD_TIMING.stepPause + FD_TIMING.settlePause);
    }
    clearLines();

    consolePrint("todo pasó por la tabla de fds del proceso ✓", COLOR.green);
    setStatus("REDIRECCIONES COMPLETAS", COLOR.green);
    await sleep(FD_TIMING.outroPause);
  }

  const modeButtons: Array<[FdStep, HTMLButtonElement | null]> = [
    ["default", btnDefault],
    ["gt", btnGt],
    ["gtgt", btnGtgt],
    ["both", btnBoth],
  ];

  function setControlsDisabled(disabled: boolean): void {
    [...modeButtons.map(([, b]) => b), btnPlay, resetBtn, exportBtn].forEach(
      (btn) => {
        if (btn) btn.disabled = disabled;
      },
    );
  }

  for (const [step, btn] of modeButtons) {
    btn?.addEventListener("click", () => {
      if (busy) return;
      setMode(step);
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
        fileName: `file-descriptors-${fmt.width}x${fmt.height}.webm`,
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
