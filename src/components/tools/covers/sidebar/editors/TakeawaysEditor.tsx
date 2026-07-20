import React from "react";
import type { TakeawaysSlideData } from "../types";
import { Input, Textarea } from "../FormField";
import type { EditorProps } from "../FormField";

export const TakeawaysEditor: React.FC<EditorProps<TakeawaysSlideData>> = ({
  slide,
  updateSlide,
}) => (
  <div className="space-y-4">
    <Input
      label="Título"
      value={slide.title}
      onChange={(v) => updateSlide(slide.id, { title: v })}
    />
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-500">Puntos Clave</label>
        <button
          type="button"
          onClick={() => updateSlide(slide.id, { items: [...slide.items, ""] })}
          className="px-3 py-1 text-xs font-bold rounded bg-blue-500 text-white hover:bg-blue-600"
        >
          Añadir punto
        </button>
      </div>
      {slide.items.map((item, idx) => (
        <div key={idx} className="relative group">
          <Textarea
            label={`Punto ${idx + 1}`}
            value={item}
            onChange={(v) => {
              const newItems = [...slide.items];
              newItems[idx] = v;
              updateSlide(slide.id, { items: newItems });
            }}
            rows={2}
          />
          <button
            type="button"
            onClick={() => {
              const newItems = slide.items.filter((_, i) => i !== idx);
              updateSlide(slide.id, { items: newItems.length ? newItems : [""] });
            }}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-red-500 text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  </div>
);
