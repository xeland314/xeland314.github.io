import { toCanvas } from "html-to-image";
import { getFontEmbedCSS, waitForFonts } from "./fonts";
import {
  DEFAULT_BITS_PER_SECOND,
  computeExportScale,
  pickMimeType,
} from "./videoExport";

export interface RecordStageOptions {
  width: number;
  height: number;
  fps: number;
  fileName: string;
  backgroundColor?: string;
  bitsPerSecond?: number;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function downloadBlob(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

export async function recordStageToVideo(
  stage: HTMLElement,
  scene: () => Promise<void>,
  options: RecordStageOptions,
): Promise<void> {
  const {
    width: W,
    height: H,
    fps,
    fileName,
    backgroundColor = "#060a0f",
    bitsPerSecond = DEFAULT_BITS_PER_SECOND,
  } = options;

  await waitForFonts();

  // Incrustar las fuentes una sola vez (data URIs) para evitar que
  // html-to-image lea hojas de estilo cross-origin en cada frame.
  const fontEmbedCSS = await getFontEmbedCSS();
  const captureOptions = fontEmbedCSS
    ? { fontEmbedCSS }
    : { skipFonts: true };

  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  canvas.style.position = "fixed";
  canvas.style.top = "0";
  canvas.style.left = "-9999px";
  document.body.appendChild(canvas);

  const ctx = canvas.getContext("2d", { alpha: false });
  if (!ctx) {
    canvas.remove();
    throw new Error("No se pudo obtener el contexto 2d del canvas de grabación.");
  }

  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, 0, W, H);
  const context = ctx;

  const scale = computeExportScale(stage.offsetWidth, W);
  const stageW = stage.offsetWidth;
  const stageH = stage.offsetHeight;

  async function drawFrame(): Promise<void> {
    const shot = await toCanvas(stage, {
      backgroundColor,
      canvasWidth: stageW,
      canvasHeight: stageH,
      pixelRatio: scale,
      ...captureOptions,
    });
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = "high";
    context.fillStyle = backgroundColor;
    context.fillRect(0, 0, W, H);
    const fit = Math.min(W / shot.width, H / shot.height);
    const dw = Math.round(shot.width * fit);
    const dh = Math.round(shot.height * fit);
    context.drawImage(shot, Math.round((W - dw) / 2), Math.round((H - dh) / 2), dw, dh);
    shot.width = 0;
    shot.height = 0;
  }

  // Warm-up: captura el primer frame antes de grabar para fallar rápido.
  try {
    await drawFrame();
  } catch (err) {
    canvas.remove();
    throw new Error(`No se pudo capturar la escena del video: ${String(err)}`);
  }
  const stream = canvas.captureStream(fps);
  const recorder = new MediaRecorder(stream, {
    mimeType: pickMimeType(),
    videoBitsPerSecond: bitsPerSecond,
  });

  const chunks: Blob[] = [];
  recorder.ondataavailable = (e) => {
    if (e.data.size > 0) chunks.push(e.data);
  };

  const done = new Promise<void>((resolve) => {
    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: "video/webm" });
      downloadBlob(blob, fileName);
      canvas.remove();
      resolve();
    };
  });

  let drawing = true;
  (async () => {
    while (drawing) {
      try {
        await drawFrame();
      } catch (err) {
        console.warn("Error capturando frame:", err);
      }
      await new Promise(requestAnimationFrame);
    }
  })();

  recorder.start();

  try {
    await scene();
  } finally {
    drawing = false;
    await sleep(150);
    if (recorder.state === "recording") recorder.stop();
  }

  await done;
}
