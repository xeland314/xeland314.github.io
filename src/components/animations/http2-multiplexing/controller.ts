import { recordStageToVideo } from "../VideoRecorder";
import { getVideoFormat, wireResolutionSelect } from "../exportOptions";
import {
  buildMuxLines,
  FRAME_ORDER,
  H2_TIMING,
  MODE_FILE,
  type HttpMode,
} from "./sequence";

const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

const MAX_CONSOLE_ROWS = 5;

const COLOR = {
  h1: "#f87171",
  h2: "#38bdf8",
  ok: "#7cfb4c",
  ink: "#e7edf3",
  muted: "#a1a1aa",
} as const;

const LANES = [
  { n: 1, name: "index.html" },
  { n: 2, name: "style.css" },
  { n: 3, name: "app.js" },
] as const;

export function initHttp2Animation(): void {
  const fileNameEl = document.getElementById("fileName");
  const statusBadge = document.getElementById("statusBadge");
  const codeBody = document.getElementById("codeBody");
  const consoleText = document.getElementById("consoleText");
  const btnHttp1 = document.getElementById("btnHttp1") as HTMLButtonElement | null;
  const btnHttp2 = document.getElementById("btnHttp2") as HTMLButtonElement | null;
  const btnPlay = document.getElementById("btnPlay") as HTMLButtonElement | null;
  const playBtn = document.getElementById("playBtn") as HTMLButtonElement | null;
  const resetBtn = document.getElementById("resetBtn") as HTMLButtonElement | null;
  const exportBtn = document.getElementById("exportBtn") as HTMLButtonElement | null;
  const resSelect = document.getElementById("resSelect") as HTMLSelectElement | null;
  const statusText = document.getElementById("statusText");
  const stageEl = document.getElementById("stage");

  const lanes11 = document.getElementById("lanes11");
  const lanesH2 = document.getElementById("lanesH2");
  const blockWarn = document.getElementById("blockWarn");

  if (
    !fileNameEl ||
    !statusBadge ||
    !codeBody ||
    !consoleText ||
    !btnHttp1 ||
    !btnHttp2 ||
    !btnPlay ||
    !lanes11 ||
    !lanesH2 ||
    !blockWarn ||
    !statusText ||
    !stageEl
  ) {
    console.warn("Animación http2: faltan elementos del DOM.");
    return;
  }

  const file = fileNameEl;
  const badge = statusBadge;
  const body = codeBody;
  const consoleEl = consoleText;
  const status = statusText;

  let mode: HttpMode = "http1";
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
    buildMuxLines(mode).forEach((line, idx) => {
      const row = document.createElement("div");
      row.className = "anim-code-line";
      row.dataset.id = String(line.id);
      row.innerHTML = `<span class="anim-ln">${idx + 1}</span><span>${line.html}</span>`;
      body.appendChild(row);
    });
  }

  function lineEl(id: number): Element | null {
    return body.querySelector(`[data-id="${id}"]`);
  }

  function setLineActive(id: number): void {
    clearLines();
    lineEl(id)?.classList.add("anim-h2-line-active");
  }

  function clearLines(): void {
    body.querySelectorAll(".anim-code-line").forEach((el) => {
      el.classList.remove("anim-h2-line-active");
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

  function el<T extends Element = HTMLElement>(id: string): T | null {
    return lanes11.querySelector(`#${id}`) ?? lanesH2.querySelector(`#${id}`);
  }

  function show(id: string, visible: boolean, dim = false): void {
    const node = el(id);
    if (node) node.setAttribute("opacity", visible ? (dim ? "0.25" : "1") : "0");
  }

  function resetAll(): void {
    for (const lane of LANES) {
      show(`req${lane.n}`, false);
      show(`resp${lane.n}`, false);
      const laneGroup = el(`lane${lane.n}`);
      laneGroup?.setAttribute("opacity", "1");
    }
    for (const f of FRAME_ORDER) show(f.elId, false);
    for (const s of ["st1", "st3", "st5"]) show(s, false);
    blockWarn.setAttribute("opacity", "0");
    consoleEl.innerHTML = "";
    clearLines();
    setStatus("ESPERANDO", COLOR.muted);
  }

  function setMode(next: HttpMode): void {
    mode = next;
    btnHttp1.className = next === "http1" ? "ctrl-btn http1 flex-1" : "ctrl-btn flex-1";
    btnHttp2.className = next === "http2" ? "ctrl-btn http2 flex-1" : "ctrl-btn flex-1";
    lanes11.setAttribute("opacity", next === "http1" ? "1" : "0");
    lanesH2.setAttribute("opacity", next === "http2" ? "1" : "0");
    buildLines();
    resetAll();
  }

  async function runHttp1(intro?: string): Promise<void> {
    setStatus("HTTP/1.1 · SECUENCIAL", COLOR.h1);
    if (intro) consolePrint(intro, COLOR.muted);

    for (const lane of LANES) {
      setLineActive(lane.n);
      consolePrint(`conexión #${lane.n} → GET /${lane.name}`, "#93c5fd");
      show(`req${lane.n}`, true);
      await sleep(H2_TIMING.sendPause);

      if (lane.n < 3) blockWarn.setAttribute("opacity", "1");
      consolePrint(`esperando respuesta de /${lane.name}…`, "#fca5a5");
      await sleep(H2_TIMING.respPause);
      blockWarn.setAttribute("opacity", "0");

      show(`resp${lane.n}`, true);
      consolePrint(`200 OK · /${lane.name} descargado`, COLOR.ok);
      await sleep(H2_TIMING.laneDonePause);
      show(`req${lane.n}`, true, true);
      show(`resp${lane.n}`, true, true);
    }
    setLineActive(4);
    setStatus("HTTP/1.1 LISTO (3 CONEXIONES)", COLOR.ok);
    await sleep(H2_TIMING.endPause);
    clearLines();
  }

  async function runHttp2(intro?: string): Promise<void> {
    setStatus("HTTP/2 · MULTIPLEXANDO", COLOR.h2);
    if (intro) consolePrint(intro, COLOR.muted);

    for (const [i, f] of FRAME_ORDER.entries()) {
      show(f.elId, true);
      setLineActive(i < 2 ? 1 : i < 4 ? 2 : 3);
      consolePrint(`frame ${f.label} → conexión única`, "#7dd3fc");
      await sleep(H2_TIMING.framePause);
      if (f.label === "D1") { show("st1", true); consolePrint("Stream 1 completo ✓", COLOR.ok); await sleep(H2_TIMING.streamDonePause); }
      if (f.label === "D3") { show("st3", true); consolePrint("Stream 3 completo ✓", COLOR.ok); await sleep(H2_TIMING.streamDonePause); }
      if (f.label === "D5") { show("st5", true); consolePrint("Stream 5 completo ✓", COLOR.ok); await sleep(H2_TIMING.streamDonePause); }
    }
    setLineActive(4);
    consolePrint("todo viajó en paralelo por 1 socket TCP", "#e9d5ff");
    setStatus("HTTP/2 LISTO (SIN BLOQUEO HTTP)", COLOR.ok);
    await sleep(H2_TIMING.endPause);
    clearLines();
  }

  async function runSelected(): Promise<void> {
    if (mode === "http1") await runHttp1();
    else await runHttp2();
  }

  async function playDemo(): Promise<void> {
    setMode("http1");
    await runHttp1("── HTTP/1.1: una petición por conexión ──");
    setMode("http2");
    await runHttp2("── HTTP/2: frames intercalados por stream ──");
  }

  function setControlsDisabled(disabled: boolean): void {
    [btnHttp1, btnHttp2, btnPlay, playBtn, resetBtn, exportBtn].forEach((btn) => {
      if (btn) btn.disabled = disabled;
    });
  }

  btnHttp1?.addEventListener("click", () => {
    if (busy) return;
    setMode("http1");
  });

  btnHttp2?.addEventListener("click", () => {
    if (busy) return;
    setMode("http2");
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
        fileName: `http2-multiplexing-${fmt.width}x${fmt.height}.webm`,
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
