import { recordStageToVideo } from "../VideoRecorder";
import { getVideoFormat, wireResolutionSelect } from "../exportOptions";
import { buildLinkLines, LINK_TIMING } from "./sequence";

const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

const MAX_CONSOLE_ROWS = 6;

const COLOR = {
  green: "#7cfb4c",
  sky: "#3fd0e0",
  red: "#ff5f57",
  muted: "#a1a1aa",
  gray: "#d1d5db",
} as const;

export function initLinkAnimation(): void {
  const fileNameEl = document.getElementById("fileName");
  const statusBadge = document.getElementById("statusBadge");
  const codeBody = document.getElementById("codeBody");
  const consoleText = document.getElementById("consoleText");

  const rOrig = document.getElementById("rOrig");
  const aOrig = document.getElementById("aOrig");
  const aSym = document.getElementById("aSym");
  const symX = document.getElementById("symX");
  const nlinkChip = document.getElementById("nlinkChip");
  const nlinkText = document.getElementById("nlinkText");
  const catFail = document.getElementById("catFail");
  const catHard = document.getElementById("catHard");
  const moralText = document.getElementById("moralText");

  const btnPlay = document.getElementById("btnPlay") as HTMLButtonElement | null;
  const rmBtn = document.getElementById("rmBtn") as HTMLButtonElement | null;
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
    !rOrig ||
    !aOrig ||
    !aSym ||
    !symX ||
    !nlinkChip ||
    !nlinkText ||
    !catFail ||
    !catHard ||
    !moralText ||
    !btnPlay ||
    !statusText ||
    !stageEl
  ) {
    console.warn("Animación symlink-hardlink: faltan elementos del DOM.");
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
    file.textContent = "links.sh";
    body.innerHTML = "";
    buildLinkLines().forEach((line, idx) => {
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
      ?.classList.add("anim-lnk-line-active");
  }

  function clearLines(): void {
    body.querySelectorAll(".anim-code-line").forEach((el) => {
      el.classList.remove("anim-lnk-line-active");
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

  function setOpacity(el: Element | null, value: string): void {
    el?.setAttribute("opacity", value);
  }

  function resetAll(): void {
    rOrig.setAttribute("opacity", "1");
    rOrig.querySelector("text")?.setAttribute("style", "");
    setOpacity(aOrig, "1");
    aSym.setAttribute("stroke", "#3fd0e0");
    aSym.setAttribute("stroke-dasharray", "5 4");
    setOpacity(symX, "0");
    nlinkText.textContent = "enlaces: 2";
    nlinkChip.setAttribute("stroke", "var(--anim-line)");
    setOpacity(catFail, "0");
    setOpacity(catHard, "0");
    setOpacity(moralText, "0");
    consoleEl.innerHTML = "";
    clearLines();
    setStatus("ESPERANDO", COLOR.muted);
  }

  async function runDelete(intro?: string): Promise<void> {
    if (intro) consolePrint(intro, COLOR.gray);
    setStatus("BORRANDO EL NOMBRE ORIGINAL", COLOR.red);

    setLineActive(4);
    consolePrint("$ rm archivo.txt", COLOR.red);
    await sleep(LINK_TIMING.rmPause);

    consolePrint("rm solo borra la ENTRADA del directorio", "#fbbf24");
    rOrig.setAttribute("opacity", "0.25");
    rOrig.querySelectorAll("text").forEach((t) => {
      t.setAttribute("text-decoration", "line-through");
    });
    setOpacity(aOrig, "0.15");
    await sleep(LINK_TIMING.nlinkPause);

    nlinkText.textContent = "enlaces: 1";
    nlinkChip.setAttribute("stroke", "#fbbf24");
    consolePrint("nlink del inodo #4821 baja de 2 → 1", "#fbbf24");
    setStatus("EL INODO SIGUE VIVO (NLINK=1)", COLOR.green);
    await sleep(LINK_TIMING.symBreak * 0.6);

    setOpacity(symX, "1");
    aSym.setAttribute("stroke", "#ff5f57");
    aSym.setAttribute("stroke-dasharray", "2 5");
    setOpacity(catFail, "1");
    consolePrint("sim.link apunta a una ruta inexistente ✗", COLOR.red);
    setStatus("SYMLINK ROTO · HARDLINK INTACTO", COLOR.green);
    await sleep(LINK_TIMING.symBreak * 0.6 + LINK_TIMING.catPhase);

    setOpacity(catHard, "1");
    consolePrint("$ cat duro.hlk → Hola ✓", COLOR.green);
    await sleep(LINK_TIMING.hardSurvive);

    setOpacity(moralText, "1");
    consolePrint("los datos mueren con el ÚLTIMO hard link", "#e9d5ff");
    setStatus("DATOS INTACTOS · NLINK=1", COLOR.green);
    await sleep(LINK_TIMING.outroPause);
    clearLines();
  }

  async function playDemo(): Promise<void> {
    setStatus("CREANDO LOS TRES NOMBRES", COLOR.sky);

    setLineActive(1);
    consolePrint('$ echo Hola > archivo.txt', COLOR.gray);
    await sleep(LINK_TIMING.introPause * 0.5);

    setLineActive(2);
    consolePrint("hard link → MISMO inodo #4821", COLOR.green);
    await sleep(LINK_TIMING.linkStep);

    setLineActive(3);
    consolePrint("symlink → guarda la RUTA del nombre", COLOR.sky);
    await sleep(LINK_TIMING.linkStep);
    clearLines();

    await runDelete();
  }

  function setControlsDisabled(disabled: boolean): void {
    [btnPlay, rmBtn, resetBtn, exportBtn].forEach((btn) => {
      if (btn) btn.disabled = disabled;
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

  rmBtn?.addEventListener("click", async () => {
    if (busy) return;
    busy = true;
    setControlsDisabled(true);
    try {
      await runDelete("── solo el rm, sin intro ──");
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
        fileName: `symlink-vs-hardlink-${fmt.width}x${fmt.height}.webm`,
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
