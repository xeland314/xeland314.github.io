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
  buildChannelLines,
  buildDemoPlan,
  CHANNEL_CAPACITY,
  CHANNEL_TIMING,
  type ChannelAction,
} from "./sequence";

const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

const MAX_CONSOLE_ROWS = 6;

const COLOR = {
  send: "#7cfb4c",
  recv: "#00add8",
  warn: "#ff5f57",
  muted: "#a1a1aa",
} as const;

type ActorState = "ready" | "active" | "blocked";

export function initChannelsAnimation(): void {
  const codeBody = document.getElementById("codeBody");
  const consoleBox = document.getElementById("consoleBox");
  const boxProd = document.getElementById("boxProd");
  const boxCons = document.getElementById("boxCons");
  const tagProd = document.getElementById("tagProd");
  const tagCons = document.getElementById("tagCons");
  const prodSub = document.getElementById("prodSub");
  const consSub = document.getElementById("consSub");
  const mailbox = document.getElementById("mailbox");
  const slot0 = document.getElementById("slot0");
  const slot1 = document.getElementById("slot1");
  const statusBadge = document.getElementById("statusBadge");
  const statusText = document.getElementById("statusText");
  const stageEl = document.getElementById("stage");

  if (
    !codeBody ||
    !consoleBox ||
    !boxProd ||
    !boxCons ||
    !tagProd ||
    !tagCons ||
    !prodSub ||
    !consSub ||
    !mailbox ||
    !slot0 ||
    !slot1 ||
    !statusBadge ||
    !statusText ||
    !stageEl
  ) {
    console.warn("Animación channels: faltan elementos del DOM.");
    return;
  }

  const body = codeBody;
  const box = consoleBox;
  const prod = { box: boxProd, tag: tagProd, sub: prodSub } as const;
  const cons = { box: boxCons, tag: tagCons, sub: consSub } as const;
  const mail = mailbox;
  const slotEls = [slot0, slot1];
  const badge = statusBadge;
  const status = statusText;
  const stage = stageEl;

  const btnSend = document.getElementById(
    "btnSend",
  ) as HTMLButtonElement | null;
  const btnRecv = document.getElementById(
    "btnRecv",
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

  const buffer: string[] = [];
  let itemCounter = 1;

  function updateExportLabel(): void {
    if (!exportBtn) return;
    const fmt = getVideoFormat();
    exportBtn.textContent = `⬇ Exportar video (${fmt.width}×${fmt.height})`;
  }
  resSelect && wireResolutionSelect(resSelect, updateExportLabel);
  updateExportLabel();

  function buildLines(): void {
    body.innerHTML = "";
    buildChannelLines().forEach((line, idx) => {
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

  function setLineActive(
    id: number,
    style: "send" | "recv" | "blocked",
  ): void {
    clearLines();
    const el = lineEl(id);
    if (style === "recv") el?.classList.add("anim-ch-line-recv");
    else if (style === "blocked") el?.classList.add("anim-ch-line-blocked");
    else el?.classList.add("anim-ch-line-send");
  }

  function clearLines(): void {
    body.querySelectorAll(".anim-code-line").forEach((el) => {
      el.classList.remove(
        "anim-ch-line-send",
        "anim-ch-line-recv",
        "anim-ch-line-blocked",
      );
    });
  }

  function consolePrint(text: string, color = "#7ee08a"): void {
    const row = document.createElement("div");
    row.className = "anim-row";
    row.style.color = color;
    row.textContent = text;
    const caret = box.querySelector(".anim-caret");
    if (caret) {
      caret.before(row);
    } else {
      box.appendChild(row);
    }
    const rows = box.querySelectorAll(".anim-row");
    if (rows.length > MAX_CONSOLE_ROWS) {
      for (let i = 0; i < rows.length - MAX_CONSOLE_ROWS; i++) {
        rows[i].remove();
      }
    }
  }

  function renderBuffer(): void {
    for (let i = 0; i < slotEls.length; i++) {
      const slot = slotEls[i];
      if (i < buffer.length) {
        slot.textContent = buffer[i];
        slot.className = "anim-ch-slot anim-ch-slot-filled";
      } else {
        slot.textContent = "-";
        slot.className = "anim-ch-slot";
      }
    }
    mail.classList.toggle(
      "anim-ch-mailbox-full",
      buffer.length >= CHANNEL_CAPACITY,
    );
  }

  function setStatus(text: string, color: string): void {
    badge.textContent = text;
    badge.style.color = color;
    badge.style.borderColor = color;
  }

  function setProducer(state: ActorState, sent?: string): void {
    prod.box.className =
      state === "active"
        ? "anim-ch-actor anim-ch-active-prod"
        : state === "blocked"
          ? "anim-ch-actor anim-ch-blocked"
          : "anim-ch-actor";
    const color =
      state === "ready" ? COLOR.muted : state === "active" ? COLOR.send : COLOR.warn;
    prod.tag.style.color = color;
    prod.sub.style.color = color;
    if (state === "active") {
      prod.tag.textContent = "PRODUCIENDO";
      prod.sub.textContent = `ch <- "${sent}"`;
    } else if (state === "blocked") {
      prod.tag.textContent = "BLOQUEADO ⏸";
      prod.sub.textContent = "Buffer lleno (esperando lectura)";
    } else {
      prod.tag.textContent = "READY";
      prod.sub.textContent = "go producir(ch)";
    }
  }

  function setConsumer(state: ActorState, received?: string): void {
    cons.box.className =
      state === "active"
        ? "anim-ch-actor anim-ch-active-cons"
        : state === "blocked"
          ? "anim-ch-actor anim-ch-blocked"
          : "anim-ch-actor";
    const color =
      state === "ready" ? COLOR.muted : state === "active" ? COLOR.recv : COLOR.warn;
    cons.tag.style.color = color;
    cons.sub.style.color = color;
    if (state === "active") {
      cons.tag.textContent = "CONSUMIENDO";
      cons.sub.textContent = `recibido = "${received}"`;
    } else if (state === "blocked") {
      cons.tag.textContent = "BLOQUEADO ⏸";
      cons.sub.textContent = "Buffer vacío (esperando datos)";
    } else {
      cons.tag.textContent = "READY";
      cons.sub.textContent = "item := <-ch";
    }
  }

  async function runAction(action: ChannelAction, item?: string): Promise<void> {
    if (action === "send") {
      if (buffer.length < CHANNEL_CAPACITY) {
        const value = item ?? `📦#${itemCounter++}`;
        buffer.push(value);
        playSfx(SFX.send);
        setLineActive(3, "send");
        setProducer("active", value);
        setStatus(`ENVÍO EXITOSO (${buffer.length}/${CHANNEL_CAPACITY})`, COLOR.send);
        consolePrint(`[G1 Productor] ch <- "${value}"`, COLOR.send);
        renderBuffer();
        await sleep(CHANNEL_TIMING.sendAnim);
        setProducer("ready");
        await sleep(CHANNEL_TIMING.clearPause);
        clearLines();
      } else {
        setLineActive(3, "blocked");
        setProducer("blocked");
        playSfx(SFX.blocked);
        setStatus(`G1 BLOQUEADO (CANAL LLENO ${buffer.length}/${CHANNEL_CAPACITY})`, COLOR.warn);
        consolePrint(`⚠️ [G1 Productor] ch <- BLOQUEADO (Buffer ${buffer.length}/${CHANNEL_CAPACITY} lleno)`, COLOR.warn);
        await sleep(CHANNEL_TIMING.blockPause);
        setProducer("ready");
        await sleep(CHANNEL_TIMING.clearPause);
        clearLines();
      }
    } else {
      if (buffer.length > 0) {
        const value = buffer.shift()!;
        playSfx(SFX.recv);
        setLineActive(5, "recv");
        setConsumer("active", value);
        setStatus(`LECTURA EXITOSA (${buffer.length}/${CHANNEL_CAPACITY})`, COLOR.recv);
        consolePrint(`[G2 Consumidor] <-ch recibió "${value}"`, COLOR.recv);
        renderBuffer();
        await sleep(CHANNEL_TIMING.recvAnim);
        setConsumer("ready");
        await sleep(CHANNEL_TIMING.clearPause);
        clearLines();
      } else {
        setLineActive(5, "blocked");
        setConsumer("blocked");
        playSfx(SFX.blocked);
        setStatus(`G2 BLOQUEADO (CANAL VACÍO 0/${CHANNEL_CAPACITY})`, COLOR.warn);
        consolePrint(`⚠️ [G2 Consumidor] <-ch BLOQUEADO (Buffer 0/${CHANNEL_CAPACITY} vacío)`, COLOR.warn);
        await sleep(CHANNEL_TIMING.blockPause);
        setConsumer("ready");
        await sleep(CHANNEL_TIMING.clearPause);
        clearLines();
      }
    }
  }

  function resetAll(): void {
    buffer.length = 0;
    itemCounter = 1;
    clearLines();
    renderBuffer();
    setProducer("ready");
    setConsumer("ready");
    box.querySelectorAll(".anim-row").forEach((el) => el.remove());
    setStatus("ESPERANDO", COLOR.muted);
  }

  async function playDemo(): Promise<void> {
    resetAll();
    await sleep(CHANNEL_TIMING.startPause);

    setLineActive(1, "recv");
    setStatus("CREANDO CANAL", COLOR.recv);
    consolePrint(`ch := make(chan string, ${CHANNEL_CAPACITY})`, COLOR.recv);
    await sleep(CHANNEL_TIMING.initPause);
    clearLines();

    for (const step of buildDemoPlan()) {
      await runAction(step.action, step.item);
    }

    setStatus("FINALIZADO", COLOR.send);
    await sleep(CHANNEL_TIMING.endPause);
  }

  let busy = false;

  function setControlsDisabled(disabled: boolean): void {
    [btnSend, btnRecv, playBtn, resetBtn, exportBtn].forEach((btn) => {
      if (btn) btn.disabled = disabled;
    });
  }

  btnSend?.addEventListener("click", async () => {
    await unlockAudio();
    if (busy) return;
    busy = true;
    btnSend.disabled = true;
    try {
      await runAction("send");
    } finally {
      btnSend.disabled = false;
      busy = false;
    }
  });

  btnRecv?.addEventListener("click", async () => {
    await unlockAudio();
    if (busy) return;
    busy = true;
    btnRecv.disabled = true;
    try {
      await runAction("recv");
    } finally {
      btnRecv.disabled = false;
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
        fileName: `go-channels-${fmt.width}x${fmt.height}.webm`,
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
  resetAll();
}