import { totalAnimationDuration, resolveAngleAtTime, resolveStepAtTime } from "./rotador";
import type { AnimationStep } from "./rotador";

export interface CanvasExportOptions {
  canvasWidth: number;
  canvasHeight: number;
  fps: number;
  bgColor: string;
}

const DEFAULT_EXPORT_OPTIONS: CanvasExportOptions = {
  canvasWidth: 720,
  canvasHeight: 720,
  fps: 30,
  bgColor: "#ffffff",
};

export function drawRotatedImage(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  angle: number,
  canvasW: number,
  canvasH: number,
  bgColor: string,
) {
  ctx.save();
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, canvasW, canvasH);

  ctx.translate(canvasW / 2, canvasH / 2);
  ctx.rotate((angle * Math.PI) / 180);

  const scale = Math.min(canvasW / img.naturalWidth, canvasH / img.naturalHeight) * 0.7;
  const w = img.naturalWidth * scale;
  const h = img.naturalHeight * scale;

  ctx.drawImage(img, -w / 2, -h / 2, w, h);
  ctx.restore();
}

export function drawStepLabel(
  ctx: CanvasRenderingContext2D,
  label: string,
  canvasW: number,
  canvasH: number,
) {
  ctx.save();
  ctx.font = 'bold 14px "Fira Code", monospace';
  ctx.fillStyle = "#8b98a3";
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.fillText(label, 16, canvasH - 32);
  ctx.restore();
}

export function startRotationAnimation(
  canvas: HTMLCanvasElement,
  img: HTMLImageElement,
  steps: AnimationStep[],
  options: Partial<CanvasExportOptions> = {},
): { cancel: () => void } {
  const opts = { ...DEFAULT_EXPORT_OPTIONS, ...options };
  const ctx = canvas.getContext("2d");
  if (!ctx) return { cancel: () => {} };

  canvas.width = opts.canvasWidth;
  canvas.height = opts.canvasHeight;

  const totalDuration = totalAnimationDuration(steps);
  let startTime: number | null = null;
  let rafId = 0;
  let active = true;

  const animate = (timestamp: number) => {
    if (!active) return;
    if (startTime === null) startTime = timestamp;

    const elapsed = timestamp - startTime;
    const currentAngle = resolveAngleAtTime(steps, elapsed);

    const currentStep = resolveStepAtTime(steps, elapsed);
    drawRotatedImage(ctx, img, currentAngle, opts.canvasWidth, opts.canvasHeight, opts.bgColor);
    if (currentStep) {
      drawStepLabel(ctx, currentStep.label, opts.canvasWidth, opts.canvasHeight);
    }

    if (elapsed < totalDuration) {
      rafId = requestAnimationFrame(animate);
    }
  };

  rafId = requestAnimationFrame(animate);

  return {
    cancel: () => {
      active = false;
      cancelAnimationFrame(rafId);
    },
  };
}

export function exportVideo(
  canvas: HTMLCanvasElement,
  img: HTMLImageElement,
  steps: AnimationStep[],
  options: Partial<CanvasExportOptions> = {},
  onProgress?: (progress: number) => void,
): { promise: Promise<void>; cancel: () => void } {
  const opts = { ...DEFAULT_EXPORT_OPTIONS, ...options };
  const totalDuration = totalAnimationDuration(steps);
  const totalFrames = Math.ceil((totalDuration / 1000) * opts.fps);

  canvas.width = opts.canvasWidth;
  canvas.height = opts.canvasHeight;

  const stream = canvas.captureStream(opts.fps);
  const recorder = new MediaRecorder(stream, {
    mimeType: "video/webm;codecs=vp9",
    videoBitsPerSecond: 12_000_000,
  });

  const chunks: Blob[] = [];
  recorder.ondataavailable = (e) => {
    if (e.data.size > 0) chunks.push(e.data);
  };

  let resolveExport!: () => void;
  const promise = new Promise<void>((resolve) => {
    resolveExport = resolve;
  });

  recorder.onstop = () => {
    const blob = new Blob(chunks, { type: "video/webm" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "rotacion-pasos.webm";
    a.click();
    URL.revokeObjectURL(url);
    resolveExport();
  };

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    recorder.start();
    recorder.stop();
    return { promise, cancel: () => {} };
  }

  recorder.start();

  let startTime: number | null = null;
  let rafId = 0;
  let frameCount = 0;
  let active = true;

  const animate = (timestamp: number) => {
    if (!active) return;
    if (startTime === null) startTime = timestamp;

    const elapsed = timestamp - startTime;
    const currentAngle = resolveAngleAtTime(steps, elapsed);
    const currentStep = resolveStepAtTime(steps, elapsed);

    drawRotatedImage(ctx, img, currentAngle, opts.canvasWidth, opts.canvasHeight, opts.bgColor);
    if (currentStep) {
      drawStepLabel(ctx, currentStep.label, opts.canvasWidth, opts.canvasHeight);
    }

    frameCount++;
    onProgress?.(Math.min(Math.floor((frameCount / totalFrames) * 100), 100));

    if (elapsed < totalDuration) {
      rafId = requestAnimationFrame(animate);
    } else {
      setTimeout(() => {
        if (recorder.state === "recording") {
          recorder.stop();
        }
      }, 500);
    }
  };

  rafId = requestAnimationFrame(animate);

  return {
    promise,
    cancel: () => {
      active = false;
      cancelAnimationFrame(rafId);
      if (recorder.state === "recording") {
        recorder.stop();
      }
    },
  };
}

export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}
