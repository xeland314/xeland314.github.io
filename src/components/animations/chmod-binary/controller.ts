import { recordStageToVideo } from "../VideoRecorder";
import { getVideoFormat, wireResolutionSelect } from "../exportOptions";
import {
  bitsToLetters,
  bitsToMode,
  bitsToOctalDigit,
  buildChmodLines,
  CHMOD_TIMING,
  PERM_BITS_644,
  type ChmodGroupId,
} from "./sequence";

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

type Bits = readonly number[];

const GROUP_IDS: ChmodGroupId[] = ["own", "grp", "oth"];

const DERIVED_SUFFIX: Record<ChmodGroupId, string> = {
  own: "Own",
  grp: "Grp",
  oth: "Oth",
};

const GROUP_NAMES: Record<ChmodGroupId, string> = {
  own: "dueño",
  grp: "grupo",
  oth: "otros",
};

const BIT_LABELS = ["r", "w", "x"] as const;

const LS_BEFORE = "-rw-r--r-- 1 user user 120 ago 23 10:00 script.sh";
const LS_AFTER = "-rwxr-xr-x 1 user user 120 ago 23 10:00 script.sh";

export function initChmodAnimation(): void {
  const fileNameEl = document.getElementById("fileName");
  const statusBadge = document.getElementById("statusBadge");
  const codeBody = document.getElementById("codeBody");
  const consoleText = document.getElementById("consoleText");
  const permFullEl = document.getElementById("permFull");
  const noteText = document.getElementById("noteText");

  const btnPlay = document.getElementById("btnPlay") as HTMLButtonElement | null;
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
    !permFullEl ||
    !noteText ||
    !btnPlay ||
    !statusText ||
    !stageEl
  ) {
    console.warn("Animación chmod: faltan elementos del DOM.");
    return;
  }

  const badge = statusBadge;
  const body = codeBody;
  const consoleEl = consoleText;
  const permFull = permFullEl;
  const note = noteText;
  const status = statusText;
  const stage = stageEl;

  let busy = false;

  function updateExportLabel(): void {
    if (!exportBtn) return;
    const fmt = getVideoFormat();
    exportBtn.textContent = `⬇ Exportar video (${fmt.width}×${fmt.height})`;
  }
  resSelect && wireResolutionSelect(resSelect, updateExportLabel);
  updateExportLabel();

  function buildLines(): void {
    fileNameEl.textContent = "script.sh";
    body.innerHTML = "";
    buildChmodLines().forEach((line, idx) => {
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
      ?.classList.add("anim-cb-line-active");
  }

  function clearLines(): void {
    body.querySelectorAll(".anim-code-line").forEach((el) => {
      el.classList.remove("anim-cb-line-active");
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

  function cell(prefix: ChmodGroupId, i: number): HTMLElement | null {
    return document.getElementById(`${prefix}${i}`);
  }

  function triple(bits: Bits, g: number): Bits {
    return bits.slice(g * 3, g * 3 + 3);
  }

  function paintGroups(bits: Bits, opts?: { scan?: number; pulse?: number }): void {
    for (let g = 0; g < GROUP_IDS.length; g++) {
      const t = triple(bits, g);
      for (let b = 0; b < 3; b++) {
        let extra = "";
        if (opts?.scan === g) extra = "scan";
        if (opts?.pulse === g && b === 2) extra = "pulse";
        cell(GROUP_IDS[g], b)?.setAttribute(
          "class",
          `cb-cell ${t[b] === 1 ? "on" : "off"}${extra ? ` ${extra}` : ""}`,
        );
      }
    }
  }

  function updateDerived(bits: Bits): void {
    for (const id of GROUP_IDS) {
      const suffix = DERIVED_SUFFIX[id];
      const t = triple(bits, GROUP_IDS.indexOf(id));
      const bin = document.getElementById(`bin${suffix}`);
      const oct = document.getElementById(`oct${suffix}`);
      if (bin) bin.textContent = `${t[0]}${t[1]}${t[2]}`;
      if (oct) oct.textContent = String(bitsToOctalDigit(t));
    }
  }

  function resetAll(): void {
    paintGroups(PERM_BITS_644);
    updateDerived(PERM_BITS_644);
    permFull.textContent = "-rw-r--r--";
    note.textContent =
      "r=4 · w=2 · x=1 — chmod SUMA bits sobre el modo actual.";
    consoleEl.innerHTML = "";
    clearLines();
    setStatus("ESPERANDO", COLOR.muted);
  }

  async function playDemo(): Promise<void> {
    let bits: number[] = [...PERM_BITS_644];

    setLineActive(1);
    setStatus("LISTANDO PERMISOS", COLOR.gray);
    consolePrint("$ ls -l script.sh", COLOR.gray);
    await sleep(CHMOD_TIMING.introPause);

    consolePrint(LS_BEFORE, COLOR.green);
    setLineActive(2);
    for (let g = 0; g < GROUP_IDS.length; g++) {
      const t = triple(bits, g);
      consolePrint(
        `${GROUP_NAMES[GROUP_IDS[g]]}: ${BIT_LABELS.join("")} → ${t.join("")} (${bitsToOctalDigit(t)})`,
        COLOR.purple,
      );
      paintGroups(bits, { scan: g });
      await sleep(CHMOD_TIMING.groupScan);
    }
    paintGroups(bits);
    consolePrint(`modo actual → ${bitsToMode(bits)}`, COLOR.amber);
    await sleep(CHMOD_TIMING.digitsCompute);

    setLineActive(3);
    setStatus("APLICANDO CHMOD 755", COLOR.purple);
    consolePrint("$ chmod 755 script.sh", COLOR.gray);
    consolePrint("755 = 111 101 101 → suma x en los 3 grupos", COLOR.purple);
    await sleep(CHMOD_TIMING.chmodLine);

    for (let g = 0; g < GROUP_IDS.length; g++) {
      bits[g * 3 + 2] = 1;
      paintGroups(bits, { pulse: g });
      updateDerived(bits);
      consolePrint(
        `${GROUP_NAMES[GROUP_IDS[g]]}: +x → ${bitsToLetters(triple(bits, g))} = ${bitsToOctalDigit(triple(bits, g))}`,
        COLOR.green,
      );
      await sleep(CHMOD_TIMING.xFlip);
    }

    setLineActive(4);
    permFull.textContent = "-rwxr-xr-x";
    consolePrint(LS_AFTER, COLOR.green);
    await sleep(CHMOD_TIMING.permUpdate);

    setLineActive(6);
    consolePrint("$ ./script.sh", COLOR.gray);
    await sleep(CHMOD_TIMING.execDemo);

    consolePrint("hola desde script.sh", COLOR.green);
    setStatus("MODO COMPUTADO", COLOR.green);
    consolePrint(
      "✔ 755: ejecución para todos, escritura solo del dueño",
      COLOR.green,
    );
    note.textContent =
      "755 = agregar ejecución a todos, sin dar escritura a grupo/otros.";
    await sleep(CHMOD_TIMING.outroPause);
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
        fileName: `chmod-binary-${fmt.width}x${fmt.height}.webm`,
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
