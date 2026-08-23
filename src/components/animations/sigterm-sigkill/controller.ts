import { recordStageToVideo } from "../VideoRecorder";
import { getVideoFormat, wireResolutionSelect } from "../exportOptions";
import {
  buildSigLines,
  CLEANUP_TASKS,
  MODE_FILE,
  SIG_TIMING,
  type SignalMode,
} from "./sequence";

const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

const MAX_CONSOLE_ROWS = 6;

const COLOR = {
  term: "#3fd0e0",
  kill: "#ff5f57",
  ok: "#7cfb4c",
  muted: "#a1a1aa",
} as const;

const CHIP_X = { term: 30, kernel: 150, app: 262 } as const;

export function initSigAnimation(): void {
  const fileNameEl = document.getElementById("fileName");
  const statusBadge = document.getElementById("statusBadge");
  const codeBody = document.getElementById("codeBody");
  const consoleText = document.getElementById("consoleText");

  const cmdText = document.getElementById("cmdText");
  const appBox = document.getElementById("appBox");
  const appState = document.getElementById("appState");
  const flyArea = document.getElementById("flyArea");
  const exitBadge = document.getElementById("exitBadge");

  const btnTermMode = document.getElementById("btnTermMode") as HTMLButtonElement | null;
  const btnKillMode = document.getElementById("btnKillMode") as HTMLButtonElement | null;
  const btnPlay = document.getElementById("btnPlay") as HTMLButtonElement | null;
  const playBtn = document.getElementById("playBtn") as HTMLButtonElement | null;
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
    !cmdText ||
    !appBox ||
    !appState ||
    !flyArea ||
    !exitBadge ||
    !btnTermMode ||
    !btnKillMode ||
    !btnPlay ||
    !statusText ||
    !stageEl
  ) {
    console.warn("Animación sigterm-sigkill: faltan elementos del DOM.");
    return;
  }

  const file = fileNameEl;
  const badge = statusBadge;
  const body = codeBody;
  const consoleEl = consoleText;
  const status = statusText;

  let mode: SignalMode = "sigterm";
  let busy = false;

  function updateExportLabel(): void {
    if (!exportBtn) return;
    const fmt = getVideoFormat();
    exportBtn.textContent = `⬇ Exportar video (${fmt.width}×${fmt.height})`;
  }
  resSelect && wireResolutionSelect(resSelect, updateExportLabel);
  updateExportLabel();

  function buildLines(): void {
    file.textContent = MODE_FILE[mode];
    body.innerHTML = "";
    buildSigLines(mode).forEach((line, idx) => {
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
      ?.classList.add(
        mode === "sigterm" ? "anim-sig-line-term" : "anim-sig-line-kill",
      );
  }

  function clearLines(): void {
    body.querySelectorAll(".anim-code-line").forEach((el) => {
      el.classList.remove("anim-sig-line-term", "anim-sig-line-kill");
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

  function taskEl(n: number): HTMLElement | null {
    return document.getElementById(`task${n}`);
  }

  function dotEl(n: number): HTMLElement | null {
    return document.getElementById(`dot${n}`);
  }

  function resetAll(): void {
    appBox.className = "anim-sig-app running";
    appState.textContent = "RUNNING";
    appState.style.color = COLOR.muted;
    exitBadge.textContent = "—";
    exitBadge.style.color = COLOR.muted;
    for (const t of CLEANUP_TASKS) {
      taskEl(t.id)?.classList.remove("active", "done", "missed");
      const dot = dotEl(t.id);
      if (dot) dot.textContent = "•";
    }
    flyArea.innerHTML = "";
    cmdText.textContent = mode === "sigterm" ? "$ kill -TERM 4242" : "$ kill -KILL 4242";
    consoleEl.innerHTML = "";
  }

  function setMode(next: SignalMode): void {
    mode = next;
    btnTermMode.className =
      next === "sigterm" ? "ctrl-btn sigterm flex-1" : "ctrl-btn flex-1";
    btnKillMode.className =
      next === "sigkill" ? "ctrl-btn sigkill flex-1" : "ctrl-btn flex-1";
    buildLines();
    resetAll();
    setStatus("ESPERANDO", COLOR.muted);
  }

  function launchChip(kind: "term" | "kill", fromX: number, toX: number): Promise<void> {
    return new Promise((resolve) => {
      const chip = document.createElement("div");
      chip.className = `anim-sig-chip ${kind}`;
      chip.textContent = kind === "term" ? "SIGTERM · 15" : "SIGKILL · 9";
      chip.style.transform = `translateX(${fromX}px)`;
      chip.style.opacity = "1";
      flyArea.appendChild(chip);

      requestAnimationFrame(() => {
        setTimeout(() => {
          chip.style.transform = `translateX(${toX}px)`;
          setTimeout(() => {
            chip.style.opacity = "0";
            setTimeout(() => {
              chip.remove();
              resolve();
            }, 300);
          }, 560);
        }, 40);
      });
    });
  }

  async function runSigterm(intro?: string): Promise<void> {
    setStatus("ENTREGANDO SIGTERM", COLOR.term);
    resetAll();
    if (intro) consolePrint(intro, COLOR.muted);

    setLineActive(1);
    consolePrint("$ kill -TERM 4242 → kernel", COLOR.term);
    await sleep(SIG_TIMING.introPause);
    await launchChip("term", CHIP_X.term, CHIP_X.kernel);

    setLineActive(2);
    consolePrint("kernel entrega la señal al proceso", "#fbbf24");
    await sleep(SIG_TIMING.hopPause);
    await launchChip("term", CHIP_X.kernel, CHIP_X.app);

    setStatus("HANDLER EJECUTANDO LIMPIEZA", COLOR.ok);
    appBox.classList.remove("running");
    appBox.classList.add("closing");
    appState.textContent = "CLOSING…";
    appState.style.color = COLOR.ok;
    await sleep(SIG_TIMING.deliverPause);

    for (const t of CLEANUP_TASKS) {
      setLineActive(t.id + 1);
      const el = taskEl(t.id);
      el?.classList.add("active");
      consolePrint(`handler: ${t.label}…`, "#d1d5db");
      await sleep(SIG_TIMING.taskStep);
      el?.classList.remove("active");
      el?.classList.add("done");
      const dot = dotEl(t.id);
      if (dot) dot.textContent = "✔";
    }

    appState.textContent = "EXITED ✔";
    exitBadge.textContent = "exit 0 · apagado limpio";
    exitBadge.style.color = COLOR.ok;
    consolePrint("✔ proceso terminado con exit 0", COLOR.ok);
    setStatus("APAGADO LIMPIO", COLOR.ok);
    await sleep(SIG_TIMING.exitPause + SIG_TIMING.outroPause);
    clearLines();
  }

  async function runSigkill(intro?: string): Promise<void> {
    setStatus("ENTREGANDO SIGKILL", COLOR.kill);
    resetAll();
    if (intro) consolePrint(intro, COLOR.muted);

    consolePrint("$ kill -KILL 4242 → kernel", COLOR.kill);
    await sleep(SIG_TIMING.introPause);
    await launchChip("kill", CHIP_X.term, CHIP_X.kernel);

    consolePrint("el kernel NO consulta al proceso", "#fbbf24");
    await sleep(SIG_TIMING.hopPause);
    await launchChip("kill", CHIP_X.kernel, CHIP_X.app);

    setStatus("PROCESO ANIQUILADO", COLOR.kill);
    appBox.classList.remove("running");
    appBox.classList.add("dead");
    appState.textContent = "KILLED";
    appState.style.color = COLOR.kill;
    for (const t of CLEANUP_TASKS) {
      const el = taskEl(t.id);
      el?.classList.add("missed");
      const dot = dotEl(t.id);
      if (dot) dot.textContent = "✗";
    }
    await sleep(SIG_TIMING.killFreeze);

    consolePrint("sockets abiertos, buffers sin vaciar…", "#fecaca");
    exitBadge.textContent = "exit 137 (128+9)";
    exitBadge.style.color = COLOR.kill;
    consolePrint("✔ kernel reporta SIGKILL: exit 137", COLOR.ok);
    setStatus("MUERTE INMEDIATA", COLOR.kill);
    await sleep(SIG_TIMING.exitPause + SIG_TIMING.outroPause);
    clearLines();
  }

  async function runSelected(): Promise<void> {
    if (mode === "sigterm") await runSigterm();
    else await runSigkill();
  }

  async function playDemo(): Promise<void> {
    setMode("sigterm");
    await runSigterm("── SIGTERM: pide cerrar con limpieza ──");
    setMode("sigkill");
    await runSigkill("── SIGKILL: el kernel no pregunta ──");
  }

  function setControlsDisabled(disabled: boolean): void {
    [btnTermMode, btnKillMode, btnPlay, playBtn, resetBtn, exportBtn].forEach(
      (btn) => {
        if (btn) btn.disabled = disabled;
      },
    );
  }

  btnTermMode?.addEventListener("click", () => {
    if (busy) return;
    setMode("sigterm");
  });

  btnKillMode?.addEventListener("click", () => {
    if (busy) return;
    setMode("sigkill");
  });

  btnPlay?.addEventListener("click", async () => {
    if (busy) return;
    busy = true;
    setControlsDisabled(true);
    try {
      await runSelected();
    } finally {
      setControlsDisabled(false);
      busy = false;
    }
  });

  playBtn?.addEventListener("click", async () => {
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
    clearLines();
    setStatus("ESPERANDO", COLOR.muted);
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
        fileName: `sigterm-vs-sigkill-${fmt.width}x${fmt.height}.webm`,
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
