import { recordStageToVideo } from "../VideoRecorder";
import { getVideoFormat, wireResolutionSelect } from "../exportOptions";
import { buildChainLines, CHAIN_TIMING, type ChainScene } from "./sequence";

const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

const MAX_CONSOLE_ROWS = 6;

const COLOR = {
  green: "#7cfb4c",
  red: "#ff5f57",
  purple: "#c084fc",
  amber: "#facc15",
  muted: "#a1a1aa",
  gray: "#d1d5db",
} as const;

type NodeState = "idle" | "run" | "skip" | "amber";
type EdgeState = "" | "on" | "cut" | "rescue";
type BadgeState = "zero" | "nonzero" | "muted";

const NODE_IDS = ["nA1", "nA2", "nB1", "nB2", "nB3"] as const;
const EDGE_IDS = ["eA1", "eB1", "eB2"] as const;
const OP_IDS = ["opA1", "opB1", "opB2"] as const;
const BADGE_IDS = ["badgeA1", "badgeB1", "badgeB2"] as const;

const SCENE_TAGS: Record<ChainScene, string> = {
  exito: "escena A · éxito",
  rescate: "escena B · rescate",
  regla: "regla general",
};

const NOTES: Record<ChainScene, string> = {
  exito: "cada comando deja un exit code: 0 éxito · ≠0 fallo.",
  rescate: "&& corta en el primer fallo · || rescata al instante.",
  regla: "&& = «si salió bien, sigue» · || = «si algo falló, actúa».",
};

export function initChainAnimation(): void {
  const fileEl = document.getElementById("fileName");
  const statusBadge = document.getElementById("statusBadge");
  const codeBody = document.getElementById("codeBody");
  const consoleText = document.getElementById("consoleText");

  const sceneTag = document.getElementById("sceneTag");
  const sceneA = document.getElementById("sceneA");
  const sceneB = document.getElementById("sceneB");
  const sceneC = document.getElementById("sceneC");
  const noteText = document.getElementById("noteText");
  const skipTag = document.getElementById("skipTag");

  const btnExito = document.getElementById("btnExito") as HTMLButtonElement | null;
  const btnRescate = document.getElementById("btnRescate") as HTMLButtonElement | null;
  const btnRegla = document.getElementById("btnRegla") as HTMLButtonElement | null;
  const btnPlay = document.getElementById("btnPlay") as HTMLButtonElement | null;
  const resetBtn = document.getElementById("resetBtn") as HTMLButtonElement | null;
  const exportBtn = document.getElementById("exportBtn") as HTMLButtonElement | null;
  const resSelect = document.getElementById("resSelect") as HTMLSelectElement | null;
  const statusText = document.getElementById("statusText");
  const stage = document.getElementById("stage");

  if (
    !fileEl ||
    !statusBadge ||
    !codeBody ||
    !consoleText ||
    !sceneTag ||
    !sceneA ||
    !sceneB ||
    !sceneC ||
    !noteText ||
    !skipTag ||
    !btnPlay ||
    !statusText ||
    !stage
  ) {
    console.warn("Animación and-or-chains: faltan elementos del DOM.");
    return;
  }

  let current: ChainScene = "exito";
  let busy = false;

  function updateExportLabel(): void {
    if (!exportBtn) return;
    const fmt = getVideoFormat();
    exportBtn.textContent = `⬇ Exportar video (${fmt.width}×${fmt.height})`;
  }
  resSelect && wireResolutionSelect(resSelect, updateExportLabel);
  updateExportLabel();

  function buildLines(): void {
    fileEl.textContent = "chain.sh";
    codeBody.innerHTML = "";
    buildChainLines(current).forEach((line, idx) => {
      const row = document.createElement("div");
      row.className = "anim-code-line";
      row.dataset.id = String(line.id);
      row.innerHTML = `<span class="anim-ln">${idx + 1}</span><span>${line.html}</span>`;
      codeBody.appendChild(row);
    });
  }

  function setLineActive(id: number): void {
    clearLines();
    codeBody
      .querySelector(`[data-id="${id}"]`)
      ?.classList.add("anim-ch-line-active");
  }

  function clearLines(): void {
    codeBody.querySelectorAll(".anim-code-line").forEach((el) => {
      el.classList.remove("anim-ch-line-active");
    });
  }

  function consolePrint(text: string, color = "#7ee08a"): void {
    const row = document.createElement("div");
    row.className = "anim-row";
    row.style.color = color;
    row.textContent = text;
    consoleText.appendChild(row);
    const rows = consoleText.querySelectorAll(".anim-row");
    if (rows.length > MAX_CONSOLE_ROWS) {
      for (let i = 0; i < rows.length - MAX_CONSOLE_ROWS; i++) {
        rows[i].remove();
      }
    }
  }

  function setStatus(text: string, color: string): void {
    statusBadge.textContent = text;
    statusBadge.style.color = color;
    statusBadge.style.borderColor = color;
  }

  function setNode(id: string, state: NodeState): void {
    document.getElementById(id)?.setAttribute("class", `ch-nodegroup ${state}`);
  }

  function setEdge(id: string, state: EdgeState): void {
    document
      .getElementById(id)
      ?.setAttribute("class", state ? `ch-edge ${state}` : "ch-edge");
  }

  function setOp(id: string, state: EdgeState): void {
    document
      .getElementById(id)
      ?.setAttribute("class", state ? `ch-op ${state}` : "ch-op");
  }

  function setBadge(id: string, state: BadgeState): void {
    const el = document.getElementById(id);
    if (!el) return;
    el.setAttribute("class", `ch-badge ${state}`);
    el.textContent =
      state === "zero" ? "$? = 0" : state === "nonzero" ? "$? ≠ 0" : "$?";
  }

  function showScene(next: ChainScene): void {
    current = next;
    sceneA.classList.toggle("ch-off", next !== "exito");
    sceneB.classList.toggle("ch-off", next !== "rescate");
    sceneC.classList.toggle("ch-off", next !== "regla");
    sceneTag.textContent = SCENE_TAGS[next];
    noteText.textContent = NOTES[next];
    buildLines();
  }

  function paintSceneButtons(): void {
    if (btnExito)
      btnExito.className = `ctrl-btn flex-1${current === "exito" ? " ch-exito" : ""}`;
    if (btnRescate)
      btnRescate.className = `ctrl-btn flex-1${current === "rescate" ? " ch-rescate" : ""}`;
    if (btnRegla)
      btnRegla.className = `ctrl-btn flex-1${current === "regla" ? " ch-regla" : ""}`;
  }

  function resetNodes(): void {
    NODE_IDS.forEach((id) => setNode(id, "idle"));
    EDGE_IDS.forEach((id) => setEdge(id, ""));
    OP_IDS.forEach((id) => setOp(id, ""));
    BADGE_IDS.forEach((id) => setBadge(id, "muted"));
    skipTag.classList.add("ch-off");
  }

  function resetAll(): void {
    resetNodes();
    consoleText.innerHTML = "";
    clearLines();
    setStatus("ESPERANDO", COLOR.muted);
  }

  function setScene(next: ChainScene): void {
    showScene(next);
    resetNodes();
    paintSceneButtons();
  }

  async function escenaExito(): Promise<void> {
    setLineActive(1);
    consolePrint("$ mkdir proyectos && cd proyectos", COLOR.gray);
    await sleep(CHAIN_TIMING.introPause);

    setNode("nA1", "run");
    setBadge("badgeA1", "zero");
    setStatus("$? = 0", COLOR.green);
    consolePrint("mkdir proyectos → exit 0", COLOR.green);
    await sleep(CHAIN_TIMING.runStep);

    setEdge("eA1", "on");
    setOp("opA1", "on");
    setNode("nA2", "run");
    consolePrint("&& continúa: cd proyectos → exit 0", COLOR.purple);
    await sleep(CHAIN_TIMING.badgeHold);
  }

  async function escenaRescate(): Promise<void> {
    showScene("rescate");
    setLineActive(1);
    consolePrint("$ ping -c1 servidor > /dev/null && …", COLOR.gray);
    await sleep(CHAIN_TIMING.typeStep);

    setNode("nB1", "run");
    setBadge("badgeB1", "nonzero");
    setStatus("$? ≠ 0", COLOR.red);
    consolePrint("ping: host inalcanzable → exit ≠ 0", COLOR.red);
    await sleep(CHAIN_TIMING.runStep);

    setEdge("eB1", "cut");
    setOp("opB1", "cut");
    setNode("nB2", "skip");
    skipTag.classList.remove("ch-off");
    consolePrint('&& corta: echo "conexión OK" se OMITE', COLOR.gray);
    await sleep(CHAIN_TIMING.skipReveal);

    setEdge("eB2", "rescue");
    setOp("opB2", "rescue");
    setNode("nB3", "amber");
    setLineActive(2);
    consolePrint('|| rescata: echo "sin conexión"', COLOR.amber);
    await sleep(CHAIN_TIMING.rescueStep);

    setBadge("badgeB2", "zero");
    setStatus("RESCATADO · $? = 0", COLOR.amber);
    consolePrint("la cadena termina en éxito: $? = 0", COLOR.green);
    await sleep(CHAIN_TIMING.badgeHold);
  }

  async function escenaRegla(): Promise<void> {
    showScene("regla");
    setLineActive(1);
    consolePrint("regla: && exige 0 · || exige ≠ 0", COLOR.purple);
    await sleep(CHAIN_TIMING.ruleShow);

    setStatus("CADENA COMPUTADA", COLOR.green);
    consolePrint("✔ el exit code decide el camino", COLOR.green);
    await sleep(CHAIN_TIMING.outroPause);
  }

  async function playDemo(): Promise<void> {
    setScene("exito");
    await escenaExito();
    await escenaRescate();
    await escenaRegla();
    clearLines();
  }

  function setControlsDisabled(disabled: boolean): void {
    [btnExito, btnRescate, btnRegla, btnPlay, resetBtn, exportBtn].forEach((btn) => {
      if (btn) btn.disabled = disabled;
    });
  }

  btnExito?.addEventListener("click", () => {
    if (busy) return;
    setScene("exito");
  });

  btnRescate?.addEventListener("click", () => {
    if (busy) return;
    setScene("rescate");
  });

  btnRegla?.addEventListener("click", () => {
    if (busy) return;
    setScene("regla");
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
    statusText.textContent = `Renderizando ${fmt.width}×${fmt.height} a ${fmt.fps}fps... El navegador puede ralentizarse.`;

    const demo = async () => {
      await playDemo();
      await sleep(300);
    };

    try {
      await recordStageToVideo(stage, demo, {
        width: fmt.width,
        height: fmt.height,
        fps: fmt.fps,
        fileName: `and-or-chains-${fmt.width}x${fmt.height}.webm`,
      });
      statusText.textContent = `Video descargado ✓ (${fmt.width}×${fmt.height})`;
    } catch (err) {
      console.error("Error exportando video:", err);
      statusText.textContent = "Error exportando el video.";
    } finally {
      setControlsDisabled(false);
      busy = false;
      setTimeout(() => {
        statusText.textContent = "";
      }, 3500);
    }
  });

  setScene("exito");
}
