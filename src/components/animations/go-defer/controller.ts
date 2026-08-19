import { recordStageToVideo } from "../VideoRecorder";
import { getVideoFormat, wireResolutionSelect } from "../exportOptions";
import {
  buildDeferLines,
  deferLineId,
  DEFER_META,
  DEFER_TIMING,
  PUSH_ORDER,
  POP_ORDER,
  type DeferKind,
} from "./sequence";

const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

const MAX_CONSOLE_ROWS = 4;

export function initDeferAnimation(): void {
  const codeBody = document.getElementById("codeBody");
  const stackTower = document.getElementById("stackTower");
  const stackPhase = document.getElementById("stackPhase");
  const consoleBox = document.getElementById("consoleBox");
  const statusText = document.getElementById("statusText");
  const stageEl = document.getElementById("stage");

  if (
    !codeBody ||
    !stackTower ||
    !stackPhase ||
    !consoleBox ||
    !statusText ||
    !stageEl
  ) {
    console.warn("Animación defer: faltan elementos del DOM.");
    return;
  }

  const body = codeBody;
  const tower = stackTower;
  const phase = stackPhase;
  const box = consoleBox;
  const status = statusText;
  const stage = stageEl;

const playBtn = document.getElementById("playBtn") as HTMLButtonElement | null;
  const resetBtn = document.getElementById(
    "resetBtn",
  ) as HTMLButtonElement | null;
  const exportBtn = document.getElementById(
    "exportBtn",
  ) as HTMLButtonElement | null;
  const resSelect = document.getElementById("resSelect") as HTMLSelectElement | null;

  function updateExportLabel(): void {
    if (!exportBtn) return;
    const fmt = getVideoFormat();
    exportBtn.textContent = `⬇ Exportar video (${fmt.width}×${fmt.height})`;
  }
  resSelect && wireResolutionSelect(resSelect, updateExportLabel);
  updateExportLabel();

  function buildLines(): void {
    body.innerHTML = "";
    let n = 1;
    for (const line of buildDeferLines()) {
      const row = document.createElement("div");
      row.className = "anim-code-line";
      row.dataset.id = line.id;
      if (line.item) row.dataset.item = line.item;

      const ln = document.createElement("span");
      ln.className = "anim-ln";
      ln.textContent = line.type === "blank" ? "" : String(n++);

      const content = document.createElement("span");
      content.innerHTML = line.html;

      row.appendChild(ln);
      row.appendChild(content);
      body.appendChild(row);
    }
  }

  function lineEl(id: string): HTMLElement | null {
    return body.querySelector(`[data-id="${id}"]`);
  }

  function resetAll(): void {
    body.querySelectorAll(".anim-code-line").forEach((el) => {
      el.classList.remove("anim-active", "anim-queued", "anim-firing");
    });
    tower.innerHTML = "";
    box.querySelectorAll(".anim-row").forEach((el) => el.remove());
    phase.textContent = "";
    phase.classList.remove("anim-live");
  }

  function consolePrint(text: string): void {
    const row = document.createElement("div");
    row.className = "anim-row";
    row.innerHTML = `<span class="anim-tok-mut">&gt;&gt;&gt;</span> <span>${text}</span>`;
    const caret = box.querySelector(".anim-caret");
    if (caret) {
      caret.before(row);
    } else {
      box.appendChild(row);
    }
requestAnimationFrame(() => row.classList.add("anim-in"));
    const rows = box.querySelectorAll(".anim-row");
    if (rows.length > MAX_CONSOLE_ROWS) {
      for (let i = 0; i < rows.length - MAX_CONSOLE_ROWS; i++) {
        rows[i].remove();
      }
    }
  }

  async function pushDefer(item: DeferKind, lineId: string): Promise<void> {
    const line = lineEl(lineId);
    line?.classList.add("anim-active");
    await sleep(DEFER_TIMING.lineFlash);
    line?.classList.remove("anim-active");
    line?.classList.add("anim-queued");

    phase.textContent = `agendando defer: ${DEFER_META[item].label}`;
    const el = document.createElement("div");
    el.className = "anim-defer-item";
    el.dataset.item = item;
    el.innerHTML = `<span class="anim-tag"></span><span class="anim-lbl">${DEFER_META[item].label}</span>`;
    tower.appendChild(el);
    await sleep(20);
    el.classList.add("anim-in");
    await sleep(DEFER_TIMING.pushPause);
  }

  async function popDefer(item: DeferKind, lineId: string): Promise<void> {
    const line = lineEl(lineId);
    const el = tower.querySelector<HTMLElement>(`[data-item="${item}"]`);
    line?.classList.remove("anim-queued");
    line?.classList.add("anim-firing");
    el?.classList.add("anim-pop-active");
    phase.textContent = `ejecutando: ${DEFER_META[item].label}`;
    await sleep(DEFER_TIMING.popGlow);
    consolePrint(DEFER_META[item].label);
    await sleep(DEFER_TIMING.consolePrint);
    el?.classList.remove("anim-pop-active");
    el?.classList.add("anim-pop-out");
    await sleep(DEFER_TIMING.popOut);
    el?.remove();
    line?.classList.remove("anim-firing");
    await sleep(DEFER_TIMING.popGap);
  }

  async function playSequence(): Promise<void> {
    resetAll();
    await sleep(DEFER_TIMING.startPause);

    const func = lineEl("func");
    func?.classList.add("anim-active");
    await sleep(DEFER_TIMING.lineFlash);
    func?.classList.remove("anim-active");

    const p1 = lineEl("p1");
    p1?.classList.add("anim-active");
    consolePrint("abriendo pedido");
    await sleep(DEFER_TIMING.printfFlash);
    p1?.classList.remove("anim-active");

    for (const item of PUSH_ORDER) {
      await pushDefer(item, deferLineId(item));
    }

    const p2 = lineEl("p2");
    p2?.classList.add("anim-active");
    consolePrint("procesando pedido...");
    await sleep(DEFER_TIMING.printfFlash);
    p2?.classList.remove("anim-active");

    const close = lineEl("close");
    close?.classList.add("anim-active");
    phase.classList.add("anim-live");
    phase.textContent =
      "return → ejecutando defers en orden inverso (LIFO)";
    await sleep(DEFER_TIMING.returnHighlight);

    for (const item of POP_ORDER) {
      await popDefer(item, deferLineId(item));
    }

    close?.classList.remove("anim-active");
    phase.classList.remove("anim-live");
    phase.textContent = "listo ✓ los defers corren en orden inverso";
    await sleep(DEFER_TIMING.endPause);
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
        fileName: `defer-go-${fmt.width}x${fmt.height}.webm`,
        bitsPerSecond: 8_000_000,
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
