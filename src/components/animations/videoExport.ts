export const DEFAULT_BITS_PER_SECOND = 12_000_000;

const MIME_CANDIDATES = [
  "video/webm;codecs=vp9",
  "video/webm;codecs=vp8",
  "video/webm",
];

export function pickMimeType(): string {
  if (typeof MediaRecorder === "undefined") return "video/webm";
  for (const candidate of MIME_CANDIDATES) {
    if (MediaRecorder.isTypeSupported(candidate)) return candidate;
  }
  return "video/webm";
}

export function computeExportScale(
  stageWidth: number,
  targetWidth: number,
): number {
  if (!Number.isFinite(stageWidth) || stageWidth <= 0) return 1;
  return Math.max(1, Math.round(targetWidth / stageWidth));
}
