export interface VideoFormat {
  id: string;
  label: string;
  width: number;
  height: number;
  fps: number;
}

export const VIDEO_FORMATS: VideoFormat[] = [
  { id: "9-16", label: "9:16 vertical · 1080×1920", width: 1080, height: 1920, fps: 30 },
  { id: "4-5", label: "4:5 · 1080×1350", width: 1080, height: 1350, fps: 30 },
  { id: "1-1", label: "1:1 · 1080×1080", width: 1080, height: 1080, fps: 30 },
  { id: "16-9", label: "16:9 apaisado · 1920×1080", width: 1920, height: 1080, fps: 30 },
];

const STORAGE_KEY = "anim-export-format";

export function getVideoFormat(): VideoFormat {
  if (typeof localStorage === "undefined") return VIDEO_FORMATS[0];
  const saved = localStorage.getItem(STORAGE_KEY);
  return VIDEO_FORMATS.find((f) => f.id === saved) ?? VIDEO_FORMATS[0];
}

export function setVideoFormat(id: string): void {
  if (typeof localStorage !== "undefined") {
    localStorage.setItem(STORAGE_KEY, id);
  }
}

export function wireResolutionSelect(
  selectEl: HTMLSelectElement,
  onChange?: (format: VideoFormat) => void,
): void {
  selectEl.value = getVideoFormat().id;
  selectEl.addEventListener("change", () => {
    setVideoFormat(selectEl.value);
    onChange?.(getVideoFormat());
  });
}