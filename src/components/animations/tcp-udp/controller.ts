import { recordStageToVideo } from "../VideoRecorder";
import { getVideoFormat, wireResolutionSelect } from "../exportOptions";
import {
  buildNetLines,
  MODE_FILE,
  NET_TIMING,
  PACKET_FADE_MS,
  PACKET_TRAVEL_MS,
  type NetMode,
} from "./sequence";

const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

const MAX_CONSOLE_ROWS = 6;

const COLOR = {
  tcp: "#3fd0e0",
  udp: "#ff9736",
  ok: "#7cfb4c",
  warn: "#ff5f57",
  muted: "#a1a1aa",
} as const;

export function initNetAnimation(): void {
  const fileNameEl = document.getElementById("fileName");
  const statusBadge = document.getElementById("statusBadge");
  const codeBody = document.getElementById("codeBody");
  const consoleText = document.getElementById("consoleText");

  const clientNode = document.getElementById("clientNode");
  const serverNode = document.getElementById("serverNode");
  const clientState = document.getElementById("clientState");
  const serverState = document.getElementById("serverState");
  const guaranteeText = document.getElementById("guaranteeText");
  const packetArea = document.getElementById("packetArea");

  const btnTcpMode = document.getElementById("btnTcpMode") as HTMLButtonElement | null;
  const btnUdpMode = document.getElementById("btnUdpMode") as HTMLButtonElement | null;
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
    !clientNode ||
    !serverNode ||
    !clientState ||
    !serverState ||
    !guaranteeText ||
    !packetArea ||
    !btnTcpMode ||
    !btnUdpMode ||
    !btnPlay ||
    !statusText ||
    !stageEl
  ) {
    console.warn("Animación tcp-udp: faltan elementos del DOM.");
    return;
  }

  const file = fileNameEl;
  const badge = statusBadge;
  const body = codeBody;
  const consoleEl = consoleText;
  const status = statusText;

  let mode: NetMode = "tcp";
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
    buildNetLines(mode).forEach((line, idx) => {
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
      ?.classList.add(mode === "tcp" ? "anim-net-line-tcp" : "anim-net-line-udp");
  }

  function clearLines(): void {
    body.querySelectorAll(".anim-code-line").forEach((el) => {
      el.classList.remove("anim-net-line-tcp", "anim-net-line-udp");
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

  function setState(el: HTMLElement, text: string, color: string): void {
    el.textContent = text;
    el.style.color = color;
  }

  function resetNodes(): void {
    clientNode.classList.remove("tcp-glow", "ok-glow");
    serverNode.classList.remove("tcp-glow", "ok-glow");
    packetArea.innerHTML = "";

    if (mode === "tcp") {
      setState(clientState, "CLOSED", COLOR.muted);
      setState(serverState, "LISTEN", COLOR.muted);
      guaranteeText.textContent = "Orden, ACK & Retransmisión";
      guaranteeText.style.color = "#22d3ee";
    } else {
      setState(clientState, "UNCONNECTED", COLOR.udp);
      setState(serverState, "STATELESS", COLOR.udp);
      guaranteeText.textContent = "Sin handshake · ultra rápido";
      guaranteeText.style.color = "#fbbf24";
    }
  }

  function createAndAnimatePacket(
    label: string,
    type: "tcp" | "udp",
    direction: "L2R" | "R2L" = "L2R",
    dropMidway = false,
  ): Promise<void> {
    return new Promise((resolve) => {
      const pkt = document.createElement("div");
      pkt.className = `anim-net-packet ${type}`;
      pkt.textContent = label;

      const startX = direction === "L2R" ? 36 : 248;
      const startY = direction === "L2R" ? 62 : 92;

      pkt.style.transform = `translate(${startX}px, ${startY}px)`;
      pkt.style.opacity = "1";
      packetArea.appendChild(pkt);

      requestAnimationFrame(() => {
        setTimeout(() => {
          if (dropMidway) {
            pkt.style.transform = `translate(142px, ${startY + 15}px)`;
            setTimeout(() => {
              pkt.classList.add("lost");
              pkt.classList.remove(type);
              pkt.textContent = "❌ PERDIDO";
              setTimeout(() => {
                pkt.style.opacity = "0";
                setTimeout(() => {
                  pkt.remove();
                  resolve();
                }, PACKET_FADE_MS);
              }, 500);
            }, 320);
          } else {
            const endX = direction === "L2R" ? 248 : 36;
            pkt.style.transform = `translate(${endX}px, ${startY}px)`;
            setTimeout(() => {
              pkt.style.opacity = "0";
              setTimeout(() => {
                pkt.remove();
                resolve();
              }, PACKET_FADE_MS);
            }, PACKET_TRAVEL_MS);
          }
        }, 50);
      });
    });
  }

  async function runTcp(intro?: string): Promise<void> {
    setStatus("INICIANDO HANDSHAKE", COLOR.tcp);
    resetNodes();
    consoleEl.innerHTML = "";
    if (intro) consolePrint(intro, COLOR.muted);

    setLineActive(1);
    consolePrint('$ connect("192.168.1.10:8080")', COLOR.tcp);
    await sleep(NET_TIMING.introPause);

    setLineActive(2);
    setStatus("1/3 · SYN ENVIADO", COLOR.tcp);
    setState(clientState, "SYN-SENT", COLOR.tcp);
    clientNode.classList.add("tcp-glow");
    consolePrint("[C → S] SYN (Seq=100)", COLOR.tcp);
    await createAndAnimatePacket("SYN [Seq=100]", "tcp");

    setState(serverState, "SYN-RCVD", COLOR.tcp);
    serverNode.classList.add("tcp-glow");
    await sleep(NET_TIMING.settlePause);

    setLineActive(3);
    setStatus("2/3 · SYN-ACK RECIBIDO", COLOR.tcp);
    consolePrint("[S → C] SYN-ACK (Seq=300, Ack=101)", COLOR.tcp);
    await createAndAnimatePacket("SYN-ACK [Ack=101]", "tcp", "R2L");

    setState(clientState, "ESTABLISHED", COLOR.ok);
    await sleep(NET_TIMING.settlePause);

    setLineActive(4);
    setStatus("3/3 · ACK CONFIRMADO", COLOR.ok);
    consolePrint("[C → S] ACK (Ack=301)", COLOR.ok);
    await createAndAnimatePacket("ACK [Ack=301]", "tcp");

    serverNode.classList.add("ok-glow");
    clientNode.classList.add("ok-glow");
    setState(serverState, "ESTABLISHED", COLOR.ok);
    consolePrint("✔ CONEXIÓN ESTABLECIDA, a transmitir", COLOR.ok);
    setStatus("ESTABLISHED", COLOR.ok);
    await sleep(NET_TIMING.outroPause);
    clearLines();
  }

  async function runUdp(intro?: string): Promise<void> {
    setStatus("DISPARANDO DATAGRAMAS", COLOR.udp);
    resetNodes();
    consoleEl.innerHTML = "";
    if (intro) consolePrint(intro, COLOR.muted);

    setLineActive(1);
    consolePrint("$ sendto(socket, buffer, len...)", COLOR.udp);
    consolePrint("sin fase de conexión previa…", "#999999");
    await sleep(NET_TIMING.introPause);

    setLineActive(2);
    setStatus("DATAGRAMA 1", COLOR.udp);
    consolePrint("[C → S] UDP #1 (audio en vivo)", COLOR.udp);
    void createAndAnimatePacket("UDP #1 [Audio]", "udp");
    await sleep(NET_TIMING.stepPause);

    setLineActive(3);
    setStatus("DATAGRAMA 2", COLOR.udp);
    consolePrint("[C → S] UDP #2 (video en vivo)", COLOR.udp);
    void createAndAnimatePacket("UDP #2 [Video]", "udp");
    await sleep(NET_TIMING.stepPause);

    setLineActive(4);
    setStatus("PAQUETE 3 PERDIDO", COLOR.warn);
    consolePrint("[C → S] UDP #3 → se perdió en la red", COLOR.warn);
    await createAndAnimatePacket("UDP #3 [Frame]", "udp", "L2R", true);
    await sleep(NET_TIMING.dropExtra);

    setStatus("DATAGRAMA 4 (SIN REENVIAR EL 3)", COLOR.udp);
    consolePrint("[C → S] UDP #4 sin esperar ACK", COLOR.udp);
    await createAndAnimatePacket("UDP #4 [Audio]", "udp");

    consolePrint("✔ terminó sin retransmitir la pérdida", COLOR.udp);
    setStatus("TRANSMISIÓN COMPLETADA", COLOR.udp);
    await sleep(NET_TIMING.outroPause);
    clearLines();
  }

  async function runSelected(): Promise<void> {
    if (mode === "tcp") await runTcp();
    else await runUdp();
  }

  async function playDemo(): Promise<void> {
    setMode("tcp");
    await runTcp("── TCP: conexión confiable con handshake ──");
    setMode("udp");
    await runUdp("── UDP: fire & forget, sin garantías ──");
  }

  function setMode(next: NetMode): void {
    mode = next;
    btnTcpMode.className =
      next === "tcp" ? "ctrl-btn nettcp flex-1" : "ctrl-btn flex-1";
    btnUdpMode.className =
      next === "udp" ? "ctrl-btn netudp flex-1" : "ctrl-btn flex-1";
    buildLines();
    resetNodes();
    consoleEl.innerHTML = "";
    setStatus("ESPERANDO", COLOR.muted);
  }

  function setControlsDisabled(disabled: boolean): void {
    [btnTcpMode, btnUdpMode, btnPlay, playBtn, resetBtn, exportBtn].forEach(
      (btn) => {
        if (btn) btn.disabled = disabled;
      },
    );
  }

  btnTcpMode?.addEventListener("click", () => {
    if (busy) return;
    setMode("tcp");
  });

  btnUdpMode?.addEventListener("click", () => {
    if (busy) return;
    setMode("udp");
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
    resetNodes();
    consoleEl.innerHTML = "";
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
        fileName: `tcp-vs-udp-${fmt.width}x${fmt.height}.webm`,
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
  resetNodes();
  setStatus("ESPERANDO", COLOR.muted);
}
