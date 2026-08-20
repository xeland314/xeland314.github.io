import { recordStageToVideo } from "../VideoRecorder";
import { getVideoFormat, wireResolutionSelect } from "../exportOptions";
import {
  createAudioSession,
  getAudioStream,
  playSfx,
  unlockAudio,
  SFX,
} from "../audio/sfx";
import {
  buildWithLines,
  buildWithScenario,
  WITH_TIMING,
  type WithScenario,
} from "./sequence";

const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

const MAX_CONSOLE_ROWS = 6;

const COLOR = {
  accent: "#3fd0e0",
  ok: "#7cfb4c",
  warn: "#ff5f57",
  muted: "#a1a1aa",
  ink: "#e7edf3",
} as const;

export function initWithAnimation(): void {
  const codeBody = document.getElementById("codeBody");
  const consoleText = document.getElementById("consoleText");
  const vaultDoor = document.getElementById("vaultDoor");
  const doorTag = document.getElementById("doorTag");
  const doorIcon = document.getElementById("doorIcon");
  const doorTitle = document.getElementById("doorTitle");
  const doorSub = document.getElementById("doorSub");
  const statusPulse = document.getElementById("statusPulse");
  const statusBadge = document.getElementById("statusBadge");
  const statusText = document.getElementById("statusText");
  const stageEl = document.getElementById("stage");

  if (
    !codeBody ||
    !consoleText ||
    !vaultDoor ||
    !doorTag ||
    !doorIcon ||
    !doorTitle ||
    !doorSub ||
    !statusPulse ||
    !statusBadge ||
    !statusText ||
    !stageEl
  ) {
    console.warn("Animación with: faltan elementos del DOM.");
    return;
  }

  const body = codeBody;
  const consoleEl = consoleText;
  const door = vaultDoor;
  const tag = doorTag;
  const icon = doorIcon;
  const title = doorTitle;
  const sub = doorSub;
  const pulse = statusPulse;
  const badge = statusBadge;
  const status = statusText;
  const stage = stageEl;

  const btnNormal = document.getElementById(
    "btnNormal",
  ) as HTMLButtonElement | null;
  const btnError = document.getElementById(
    "btnError",
  ) as HTMLButtonElement | null;
  const playBtn = document.getElementById(
    "playBtn",
  ) as HTMLButtonElement | null;
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
    buildWithLines().forEach((line, idx) => {
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

  function setLineActive(id: number, style: "active" | "accent" | "warn"): void {
    clearLines();
    const el = lineEl(id);
    if (style === "accent") el?.classList.add("anim-with-line-accent");
    else if (style === "warn") el?.classList.add("anim-with-line-warn");
    else el?.classList.add("anim-active");
  }

  function clearLines(): void {
    body.querySelectorAll(".anim-code-line").forEach((el) => {
      el.classList.remove("anim-active", "anim-with-line-accent", "anim-with-line-warn");
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

  function doorOpen(): void {
    door.classList.add("open");
    tag.className = "anim-with-tag open";
    tag.textContent = "🔓 ABIERTO";
    icon.textContent = "🔓";
    title.textContent = "Conexión Establecida";
    title.className = "anim-with-door-title open";
    sub.textContent = "Puerto 5432 · Transacción Activa";
    pulse.className = "anim-with-pulse open";
  }

  function doorError(): void {
    door.classList.remove("open");
    door.classList.add("error-state");
    tag.className = "anim-with-tag error";
    tag.textContent = "⚠️ FALLO EN BLOQUE";
    icon.textContent = "💥";
    title.textContent = "ZeroDivisionError!";
    title.className = "anim-with-door-title error";
    sub.textContent = "Excepción lanzada en ejecución";
    pulse.className = "anim-with-pulse error";
  }

  function resetVisuals(): void {
    door.className = "anim-with-door";
    tag.className = "anim-with-tag closed";
    tag.textContent = "🔒 CERRADO";
    icon.textContent = "🔒";
    title.textContent = "Conexión Inactiva";
    title.className = "anim-with-door-title";
    sub.textContent = "Puerto 5432 · Standby";
    pulse.className = "anim-with-pulse";
  }

  async function runSimulation(
    mode: WithScenario,
    intro?: string,
  ): Promise<void> {
    resetVisuals();
    consoleEl.innerHTML = "";
    if (intro) consolePrint(intro, COLOR.muted);

    const steps = buildWithScenario(mode);

    setLineActive(steps[0].id, steps[0].style);
    setStatus("ENTRANDO A WITH", COLOR.accent);
    consolePrint(">>> with ConexionDB() as db:", COLOR.accent);
    await sleep(WITH_TIMING.withPause);

    setLineActive(steps[1].id, steps[1].style);
    setStatus("__enter__() ACTIVADO", COLOR.ok);
    doorOpen();
    playSfx(SFX.open);
    consolePrint("🔓 [__enter__] Conexión a DB abierta", COLOR.ok);
    await sleep(WITH_TIMING.enterPause);

    setLineActive(steps[2].id, steps[2].style);
    if (mode === "normal") {
      setStatus("EJECUTANDO CONSULTA", COLOR.ok);
      consolePrint("⚡ [db] SELECT * FROM usuarios...", COLOR.ink);
      await sleep(WITH_TIMING.queryPause);
      consolePrint("✔ Consulta completada exitosamente", COLOR.ok);
    } else {
      setStatus("⚠️ EXCEPCION OCURRIDA", COLOR.warn);
      doorError();
      playSfx(SFX.error);
      consolePrint("💥 [error] ZeroDivisionError: division by zero", COLOR.warn);
      await sleep(WITH_TIMING.errorPause);
    }

    setLineActive(steps[3].id, steps[3].style);
    setStatus("__exit__() GARANTIZADO", COLOR.accent);
    resetVisuals();
    playSfx(SFX.close);
    consolePrint("🔒 [__exit__] Cierre seguro de conexión", COLOR.accent);
    await sleep(WITH_TIMING.exitPause);

    if (mode === "error") {
      setStatus("RECURSO A SALVO", COLOR.warn);
      consolePrint("✔ La DB se cerró limpia a pesar del error", COLOR.ok);
    } else {
      setStatus("FINALIZADO OK", COLOR.ok);
    }
    await sleep(WITH_TIMING.endPause);
    clearLines();
  }

  function resetAll(): void {
    resetVisuals();
    consoleEl.innerHTML = "";
    clearLines();
    setStatus("ESPERANDO", COLOR.muted);
  }

  async function playDemo(): Promise<void> {
    await runSimulation("normal", "── CASO 1: FLUJO NORMAL ──");
    await sleep(WITH_TIMING.startPause);
    await runSimulation("error", "── CASO 2: CON EXCEPCIÓN ──");
  }

  let busy = false;

  function setControlsDisabled(disabled: boolean): void {
    [btnNormal, btnError, playBtn, resetBtn, exportBtn].forEach((btn) => {
      if (btn) btn.disabled = disabled;
    });
  }

  btnNormal?.addEventListener("click", async () => {
    await unlockAudio();
    if (busy) return;
    busy = true;
    setControlsDisabled(true);
    try {
      await runSimulation("normal");
    } finally {
      setControlsDisabled(false);
      busy = false;
    }
  });

  btnError?.addEventListener("click", async () => {
    await unlockAudio();
    if (busy) return;
    busy = true;
    setControlsDisabled(true);
    try {
      await runSimulation("error");
    } finally {
      setControlsDisabled(false);
      busy = false;
    }
  });

  playBtn?.addEventListener("click", async () => {
    if (busy) return;
    busy = true;
    setControlsDisabled(true);
    createAudioSession();
    await unlockAudio();
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
    createAudioSession();
    await unlockAudio();

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
        fileName: `with-in-python-${fmt.width}x${fmt.height}.webm`,
        audioStream: getAudioStream() ?? undefined,
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
  resetVisuals();
  setStatus("ESPERANDO", COLOR.muted);
}