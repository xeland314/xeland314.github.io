import React from "react";
import type { SlideData, SlideType } from "../types";
import { SLIDE_TYPE_OPTIONS } from "./types";

const TYPE_LABELS: Record<string, string> = Object.fromEntries(
  SLIDE_TYPE_OPTIONS.map((o) => [o.value, o.label])
);

const MD_STRIP = /(^#{1,6}\s|[*`>_~\[\]\-]|\|)/g;

const snippetOf = (slide: SlideData): string => {
  switch (slide.type) {
    case "cover":
      return slide.title;
    case "image":
      return slide.title || "Sin título";
    case "end":
      return `${slide.firstText} ${slide.secondText}`;
    case "markdown": {
      const lines = (slide.content || "").split("\n").filter((l) => l.trim());
      const heading = lines.find((l) => /^#{1,2}\s/.test(l));
      const source = heading || lines[0] || "";
      return source.replace(MD_STRIP, "").trim().slice(0, 34) || "Vacío";
    }
    default:
      return "";
  }
};

interface SlideListProps {
  slides: SlideData[];
  selectedSlideId: string;
  setSelectedSlideId: (id: string) => void;
  addSlide: (type: SlideType) => void;
  removeSlide: (id: string) => void;
  moveSlide: (id: string, direction: "up" | "down") => void;
  duplicateSlide: (id: string) => void;
}

export const SlideList: React.FC<SlideListProps> = ({
  slides,
  selectedSlideId,
  setSelectedSlideId,
  removeSlide,
  moveSlide,
  duplicateSlide,
}) => (
  <div className="space-y-1.5">
    {slides.map((slide, index) => {
      const selected = selectedSlideId === slide.id;
      return (
        <div
          key={slide.id}
          role="button"
          tabIndex={0}
          onClick={() => setSelectedSlideId(slide.id)}
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setSelectedSlideId(slide.id); } }}
          className={`group flex items-center gap-2.5 px-3 py-2 rounded-xl cursor-pointer border transition-all ${
            selected
              ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
              : "border-transparent bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700"
          }`}
        >
          <span className={`text-[10px] font-mono w-4 text-right ${selected ? "text-blue-500 font-bold" : "text-gray-400"}`}>
            {index + 1}
          </span>
          <span className={`w-14 shrink-0 text-[9px] font-black uppercase tracking-wider ${selected ? "text-blue-600 dark:text-blue-400" : "text-gray-400"}`}>
            {TYPE_LABELS[slide.type] || slide.type}
          </span>
          <span className="flex-1 min-w-0 truncate text-xs text-gray-600 dark:text-gray-300">
            {snippetOf(slide)}
          </span>
          <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); duplicateSlide(slide.id); }}
              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded text-[10px]"
              title="Duplicar (Ctrl+D)"
            >
              ⧉
            </button>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); moveSlide(slide.id, "up"); }}
              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded text-[10px]"
              title="Subir"
            >
              ↑
            </button>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); moveSlide(slide.id, "down"); }}
              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded text-[10px]"
              title="Bajar"
            >
              ↓
            </button>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); removeSlide(slide.id); }}
              className="p-1 hover:bg-red-100 text-red-500 rounded text-[10px]"
              title="Eliminar (Supr)"
            >
              ✕
            </button>
          </div>
        </div>
      );
    })}
  </div>
);

export const SlideAdder: React.FC<{ addSlide: (type: SlideType) => void }> = ({
  addSlide,
}) => (
  <select
    className="bg-gray-100 dark:bg-gray-700 text-sm px-2 py-1.5 rounded-lg outline-none w-full mb-2"
    onChange={(e) => {
      if (e.target.value) {
        addSlide(e.target.value as SlideType);
        e.target.value = "";
      }
    }}
  >
    <option value="">+ Añadir diapositiva</option>
    {SLIDE_TYPE_OPTIONS.map((opt) => (
      <option key={opt.value} value={opt.value}>
        {opt.label}
      </option>
    ))}
  </select>
);
