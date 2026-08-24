import { recordStageToVideo } from "../VideoRecorder";
import { getVideoFormat, wireResolutionSelect } from "../exportOptions";
import { buildForkLines, FORK_TIMING } from "./sequence";

const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

const MAX_CONSOLE_ROWS = 6;

const COLOR = {
  green: "#7cfb4c",
  cyan: "#3fd0e0",
  purple: "#c084fc",
  muted: "#a1a1aa",
  gray: "#d1d5db",
} as const;

export function initForkAnimation(): void {
  const statusBadge = document.getElementById("statusBadge");
  const codeBody = document.getElementById("codeBody");
  const consoleText = document.getElementById("consoleText");
  const stateText = document.getElementById("stateText");

  const groupSingle = document.getElementById("groupSingle");
  const groupParent = document.getElementById("groupParent");
  const groupChild = document.getElementById("groupChild");

  const dupArrow = document.getElementById("dupArrow");
  const edgeParent = document.getElementById("edgeParent");
  const edgeChild = document.getElementById("edgeChild");

  const chipParent = document.getElementById("chipParent");
  const chipChild = document.getElementById("chipChild");
  const retParent = document.getElementById("retParent");
  const retChild = document.getElementById("retChild");
  const nodeParent = document.getElementById("nodeParent");
  const nodeChild = document.getElementById("nodeChild");

  const btnPlay = document.getElementById("btnPlay") as HTMLButtonElement | null;
  const resetBtn = document.getElementById("resetBtn") as HTMLButtonElement | null;
  const exportBtn = document.getElementById("exportBtn") as HTMLButtonElement | null;
  const resSelect = document.getElementById("resSelect") as HTMLSelectElement | null;
  const statusText = document.getElementById("statusText");
  const stageEl = document.getElementById("stage");

  if (
    !statusBadge ||
    !codeBody ||
    !consoleText ||
    !stateText ||
    !groupSingle ||
    !groupParent ||
    !groupChild ||
    !dupArrow ||
    !edgeParent ||
    !edgeChild ||
    !chipParent ||
    !chipChild ||
    !retParent ||
    !retChild ||
    !nodeParent ||
    !nodeChild ||
    !btnPlay ||
    !statusText ||
    !stageEl
  ) {
    console.warn("Animación fork: faltan elementos del DOM.");
    return;
  }

  const badge = statusBadge;
  const body = codeBody;
  const consoleEl = consoleText;

  let busy = false;

  function updateExportLabel(): void {
    if (!exportBtn) return;
    const fmt = getVideoFormat();
    exportBtn.textContent = `⬇ Exportar video (${fmt.width}×${fmt.height})`;
  }
  resSelect && wireResolutionSelect(resSelect, updateExportLabel);
  updateExportLabel();

  function buildLines(): void {
    body.innerHTML = "";
    buildForkLines().forEach((line, idx) => {
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
      ?.classList.add("anim-fk-line-active");
  }

  function clearLines(): void {
    body.querySelectorAll(".anim-code-line").forEach((el) => {
      el.classList.remove("anim-fk-line-active");
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

  function setState(text: string): void {
    stateText.textContent = `estado: ${text}`;
  }

  function show(el: SVGElement | HTMLElement, visible: boolean): void {
    el.setAttribute("opacity", visible ? "1" : "0");
  }

  function resetAll(): void {
    show(groupSingle, true);
    show(groupParent, false);
    show(groupChild, false);
    show(edgeParent, false);
    show(edgeChild, false);
    show(chipParent, false);
    show(chipChild, false);
    dupArrow.classList.remove("go");
    retParent.classList.remove("done");
    retChild.classList.remove("done");
    nodeParent.classList.remove("hot");
    nodeChild.classList.remove("hot");
    setState("bash ejecuta ./fork_demo");
    consoleEl.innerHTML = "";
    clearLines();
    setStatus("ESPERANDO", COLOR.muted);
  }

  async function runFork(): Promise<void> {
    setStatus("COMPILANDO Y EJECUTANDO", COLOR.gray);
    consolePrint("$ gcc fork_demo.c -o fork_demo && ./fork_demo", COLOR.gray);
    await sleep(FORK_TIMING.compileRun);

    setLineActive(5);
    consolePrint("antes: un solo proceso");
    await sleep(FORK_TIMING.beforePrint);

    setLineActive(6);
    setStatus("LLAMANDO A FORK()", COLOR.purple);
    setState("fork() duplica al proceso llamador");
    await sleep(FORK_TIMING.forkCall);

    setStatus("DUPLICANDO PROCESO", COLOR.purple);
    dupArrow.classList.add("go");
    await sleep(FORK_TIMING.duplicateAnim / 2);
    show(groupSingle, false);
    show(edgeParent, true);
    show(edgeChild, true);
    show(groupParent, true);
    show(groupChild, true);
    setState("dos procesos idénticos reanudan en la misma línea");
    await sleep(FORK_TIMING.duplicateAnim / 2);
    dupArrow.classList.remove("go");

    setLineActive(8);
    setState("ambos evalúan el valor de retorno de fork()");
    await sleep(FORK_TIMING.branchStep);

    show(chipChild, true);
    show(chipParent, true);
    setState("en el hijo pid==0 · en el padre pid==hijo");
    await sleep(FORK_TIMING.branchStep);

    setLineActive(9);
    consolePrint("hijo: pid=4321", COLOR.cyan);
    nodeChild.classList.add("hot");
    await sleep(FORK_TIMING.branchStep);

    setLineActive(11);
    consolePrint("padre: hijo=4321", COLOR.green);
    consolePrint("(el orden entre padre e hijo puede intercalarse)", COLOR.muted);
    nodeParent.classList.add("hot");
    await sleep(FORK_TIMING.branchStep);

    setLineActive(13);
    retParent.classList.add("done");
    retChild.classList.add("done");
    setStatus("AMBOS TERMINAN CON EXIT 0", COLOR.green);
    setState("return 0 en padre e hijo");
    await sleep(FORK_TIMING.returnStep);

    consolePrint("$ echo $?", COLOR.gray);
    await sleep(FORK_TIMING.echoExit / 2);
    consolePrint("0", COLOR.gray);
    await sleep(FORK_TIMING.echoExit / 2);

    setStatus("DEMO COMPLETA", COLOR.green);
    await sleep(FORK_TIMING.outroPause);
    clearLines();
  }

  function setControlsDisabled(disabled: boolean): void {
    [btnPlay, resetBtn, exportBtn].forEach((btn) => {
      if (btn) btn.disabled = disabled;
    });
  }

  btnPlay?.addEventListener("click", async () => {
    if (busy) return;
    busy = true;
    setControlsDisabled(true);
    try {
      resetAll();
      await runFork();
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

    const scene = async () => {
      resetAll();
      await runFork();
      await sleep(300);
    };

    try {
      await recordStageToVideo(stageEl, scene, {
        width: fmt.width,
        height: fmt.height,
        fps: fmt.fps,
        fileName: `fork-system-call-${fmt.width}x${fmt.height}.webm`,
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

  buildLines();
  resetAll();
}
