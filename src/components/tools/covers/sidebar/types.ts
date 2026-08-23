import type { SlideType } from "../types";

export type { CoverSlideData, MarkdownSlideData, ImageSlideData, EndSlideData } from "../types";

export type SocialPreviewMode = "threads" | "facebook" | "tiktok";

export interface EditorProps<T> {
  slide: T;
  updateSlide: (id: string, data: Partial<T>) => void;
}

export const SLIDE_TYPE_OPTIONS: { value: SlideType; label: string }[] = [
  { value: "cover", label: "Portada" },
  { value: "markdown", label: "Markdown" },
  { value: "image", label: "Imagen" },
  { value: "end", label: "Final" },
];
