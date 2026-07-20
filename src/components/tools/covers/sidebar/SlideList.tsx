import React from "react";
import type { SlideData, SlideType } from "../types";
import { SLIDE_TYPE_OPTIONS } from "./types";

interface SlideListProps {
  slides: SlideData[];
  selectedSlideId: string;
  setSelectedSlideId: (id: string) => void;
  addSlide: (type: SlideType) => void;
  removeSlide: (id: string) => void;
  moveSlide: (id: string, direction: "up" | "down") => void;
}

export const SlideList: React.FC<SlideListProps> = ({
  slides,
  selectedSlideId,
  setSelectedSlideId,
  addSlide,
  removeSlide,
  moveSlide,
}) => (
  <div className="space-y-2">
    <div className="space-y-2">
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          onClick={() => setSelectedSlideId(slide.id)}
          className={`group flex items-center gap-3 p-3 rounded-xl cursor-pointer border-2 transition-all ${
            selectedSlideId === slide.id
              ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
              : "border-transparent bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700"
          }`}
        >
          <span className="text-xs font-mono text-gray-400 w-4">{index + 1}</span>
          <span className="flex-1 font-medium capitalize truncate text-sm">
            {slide.type}
          </span>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => { e.stopPropagation(); moveSlide(slide.id, "up"); }}
              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded text-xs"
            >
              ↑
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); moveSlide(slide.id, "down"); }}
              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded text-xs"
            >
              ↓
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); removeSlide(slide.id); }}
              className="p-1 hover:bg-red-100 text-red-500 rounded text-xs"
            >
              ✕
            </button>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export const SlideAdder: React.FC<{ addSlide: (type: SlideType) => void }> = ({
  addSlide,
}) => (
  <select
    className="bg-gray-100 dark:bg-gray-700 text-sm px-2 py-1 rounded-lg outline-none w-full"
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
