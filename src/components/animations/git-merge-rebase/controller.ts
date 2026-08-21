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
  buildGitLines,
  GIT_FILE,
  GIT_TIMING,
  type GitMode,
} from "./sequence";

const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

const MAX_CONSOLE_ROWS = 8;

const COLOR = {
  merge: "#a855f7",
  rebase: "#f05032",
  ok: "#7cfb4c",
  ink: "#e7edf3",
  muted: "#a1a1aa",
} as const;

export function initGitAnimation(): void {
  const fileNameEl = document.getElementById("fileName");
  const statusBadge = document.getElementById("statusBadge");
  const codeBody = document.getElementById("codeBody");
  const consoleText = document.getElementById("consoleText");
  const btnMergeMode = document.getElementById("btnMergeMode") as HTMLButtonElement | null;
  const btnRebaseMode = document.getElementById("btnRebaseMode") as HTMLButtonElement | null;
  const btnPlay = document.getElementById("btnPlay") as HTMLButtonElement | null;
  const statusText = document.getElementById("statusText");
  const stageEl = document.getElementById("stage");

  const pathMain = document.getElementById("pathMain")!;
  const pathFeature = document.getElementById("pathFeature")!;
  const pathMerge = document.getElementById("pathMerge")!;
  const nodeF1 = document.getElementById("nodeF1")!;
  const nodeF2 = document.getElementById("nodeF2")!;
  const nodeMerge = document.getElementById("nodeMerge")!;
  const textF1 = document.getElementById("textF1")!;
  const textF2 = document.getElementById("textF2")!;
  const tagMain = document.getElementById("tagMain")!;
  const tagFeature = document.getElementById("tagFeature")!;
  const textTagFeature = document.getElementById("textTagFeature")!;
  const legendBranch = document.getElementById("legendBranch")!;
  const playBtn = document.getElementById("playBtn") as HTMLButtonElement | null;
  const resetBtn = document.getElementById("resetBtn") as HTMLButtonElement | null;
  const exportBtn = document.getElementById("exportBtn") as HTMLButtonElement | null;
  const resSelect = document.getElementById("resSelect") as HTMLSelectElement | null;

  if (
    !fileNameEl ||
    !statusBadge ||
    !codeBody ||
    !consoleText ||
    !btnMergeMode ||
    !btnRebaseMode ||
    !btnPlay ||
    !pathMain ||
    !pathFeature ||
    !pathMerge ||
    !nodeF1 ||
    !nodeF2 ||
    !nodeMerge ||
    !textF1 ||
    !textF2 ||
    !tagMain ||
    !tagFeature ||
    !textTagFeature ||
    !legendBranch ||
    !statusText ||
    !stageEl
  ) {
    console.warn("Animación git: faltan elementos del DOM.");
    return;
  }

  const file = fileNameEl;
  const badge = statusBadge;
  const body = codeBody;
  const consoleEl = consoleText;
  const stage = stageEl;
  const status = statusText;

  let mode: GitMode = "merge";
  let busy = false;

  function updateExportLabel(): void {
    if (!exportBtn) return;
    const fmt = getVideoFormat();
    exportBtn.textContent = `⬇ Exportar video (${fmt.width}×${fmt.height})`;
  }
  resSelect && wireResolutionSelect(resSelect, updateExportLabel);
  updateExportLabel();

  function buildLines(): void {
    file.textContent = GIT_FILE[mode];
    body.innerHTML = "";
    buildGitLines(mode).forEach((line, idx) => {
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

  function setLineActive(id: number): void {
    clearLines();
    const el = lineEl(id);
    el?.classList.add(
      mode === "merge" ? "anim-git-line-merge" : "anim-git-line-rebase",
    );
  }

  function clearLines(): void {
    body.querySelectorAll(".anim-code-line").forEach((el) => {
      el.classList.remove("anim-git-line-merge", "anim-git-line-rebase");
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

  function resetGraph(): void {
    pathMain.setAttribute("d", "M 35 50 L 115 50 L 195 50");
    pathFeature.setAttribute("d", "M 115 50 C 145 50, 145 110, 175 110 L 255 110");
    pathFeature.setAttribute("stroke", "#a855f7");
    pathMerge.setAttribute("opacity", "0");
    nodeMerge.setAttribute("opacity", "0");
    nodeF1.setAttribute("transform", "translate(175, 110)");
    nodeF2.setAttribute("transform", "translate(255, 110)");
    textF1.textContent = "F1";
    textF2.textContent = "F2";
    tagMain.setAttribute("transform", "translate(195, 22)");
    tagFeature.setAttribute("transform", "translate(255, 134)");
    legendBranch.style.opacity = "1";
    textTagFeature.textContent = "feature";
  }

  function setMode(next: GitMode): void {
    mode = next;
    if (btnMergeMode) {
      btnMergeMode.className =
        next === "merge" ? "ctrl-btn merge flex-1" : "ctrl-btn flex-1";
    }
    if (btnRebaseMode) {
      btnRebaseMode.className =
        next === "rebase" ? "ctrl-btn rebase flex-1" : "ctrl-btn flex-1";
    }
    buildLines();
    resetGraph();
    consoleEl.innerHTML = "";
    setStatus("ESPERANDO", COLOR.muted);
  }

  function resetAll(): void {
    resetGraph();
    consoleEl.innerHTML = "";
    clearLines();
    setStatus("ESPERANDO", COLOR.muted);
  }

  async function runMergeSimulation(intro?: string): Promise<void> {
    setStatus("EJECUTANDO MERGE", COLOR.merge);
    resetGraph();
    consoleEl.innerHTML = "";
    if (intro) consolePrint(intro, COLOR.muted);

    setLineActive(1);
    consolePrint("$ git checkout main", "#3b82f6");
    consolePrint('Switched to branch "main"', "#999");
    await sleep(GIT_TIMING.checkoutPause);

    setLineActive(2);
    consolePrint("$ git merge feature", COLOR.merge);
    setStatus("CREANDO COMMIT DE FUSIÓN", COLOR.merge);
    await sleep(GIT_TIMING.mergePause);

    pathMain.setAttribute("d", "M 35 50 L 115 50 L 195 50 L 315 50");
    pathMerge.setAttribute("opacity", "1");
    await sleep(GIT_TIMING.expandPause);

    nodeMerge.setAttribute("opacity", "1");
    tagMain.setAttribute("transform", "translate(315, 22)");
    playSfx(SFX.merge);
    setLineActive(3);
    consolePrint('Merge made by the "ort" strategy.', COLOR.ok);
    consolePrint("Created merge commit M1 joining main & feature", "#e9d5ff");

    setStatus("MERGE COMPLETADO", COLOR.ok);
    await sleep(GIT_TIMING.mergeNodePause);
    clearLines();
  }

  async function runRebaseSimulation(intro?: string): Promise<void> {
    setStatus("EJECUTANDO REBASE", COLOR.rebase);
    resetGraph();
    consoleEl.innerHTML = "";
    if (intro) consolePrint(intro, COLOR.muted);

    setLineActive(1);
    consolePrint("$ git checkout feature", COLOR.merge);
    await sleep(GIT_TIMING.rebaseCheckoutPause);

    setLineActive(2);
    consolePrint("$ git rebase main", COLOR.rebase);
    setStatus("1. DESPEGANDO COMMITS (F1, F2)", COLOR.rebase);
    playSfx(SFX.rebase);

    nodeF1.setAttribute("transform", "translate(175, 95)");
    nodeF2.setAttribute("transform", "translate(255, 95)");
    tagFeature.setAttribute("transform", "translate(255, 119)");
    pathFeature.setAttribute("stroke", "#5f6c7a");
    await sleep(GIT_TIMING.detachPause);

    setStatus("2. REPLANTANDO F1 EN MAIN", COLOR.rebase);
    setLineActive(3);

    pathMain.setAttribute("d", "M 35 50 L 115 50 L 195 50 L 275 50");
    nodeF1.setAttribute("transform", "translate(275, 50)");
    textF1.textContent = "F1'";
    consolePrint("First, rewinding head to replay your work on top of it...", "#999");
    consolePrint("Applying: F1 -> F1'", "#ffedd5");
    await sleep(GIT_TIMING.replantF1Pause);

    setStatus("3. REPLANTANDO F2 EN MAIN", COLOR.rebase);
    pathMain.setAttribute("d", "M 35 50 L 115 50 L 195 50 L 275 50 L 335 50");
    nodeF2.setAttribute("transform", "translate(335, 50)");
    textF2.textContent = "F2'";
    tagFeature.setAttribute("transform", "translate(335, 22)");
    pathFeature.setAttribute("d", "M 115 50 C 145 50, 145 110, 175 110");

    consolePrint("Applying: F2 -> F2'", "#ffedd5");
    await sleep(GIT_TIMING.replantF2Pause);

    setLineActive(4);
    tagMain.setAttribute("transform", "translate(335, -2)");
    tagFeature.setAttribute("transform", "translate(335, 22)");

    setStatus("REBASE COMPLETO (HISTORIAL LINEAL)", COLOR.ok);
    consolePrint("Successfully rebased and updated refs/heads/feature.", COLOR.ok);
    consolePrint("✔ Sin commits de fusión innecesarios", COLOR.ok);

    await sleep(GIT_TIMING.rebaseEndPause);
    clearLines();
  }

  async function runSelected(): Promise<void> {
    if (mode === "merge") await runMergeSimulation();
    else await runRebaseSimulation();
  }

  async function playDemo(): Promise<void> {
    setMode("merge");
    await runMergeSimulation("── MODO MERGE: fusión con commit M1 ──");
    await sleep(GIT_TIMING.startPause);
    setMode("rebase");
    await runRebaseSimulation("── MODO REBASE: historial lineal sin M1 ──");
  }

  function setControlsDisabled(disabled: boolean): void {
    [
      btnMergeMode,
      btnRebaseMode,
      btnPlay,
      playBtn,
      resetBtn,
      exportBtn,
    ].forEach((btn) => {
      if (btn) btn.disabled = disabled;
    });
  }

  btnMergeMode?.addEventListener("click", () => {
    if (busy) return;
    setMode("merge");
  });

  btnRebaseMode?.addEventListener("click", () => {
    if (busy) return;
    setMode("rebase");
  });

  btnPlay?.addEventListener("click", async () => {
    await unlockAudio();
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
    await unlockAudio();
    if (busy) return;
    busy = true;
    setControlsDisabled(true);
    createAudioSession();
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
        fileName: `git-merge-rebase-${fmt.width}x${fmt.height}.webm`,
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
  resetGraph();
  setStatus("ESPERANDO", COLOR.muted);
}
