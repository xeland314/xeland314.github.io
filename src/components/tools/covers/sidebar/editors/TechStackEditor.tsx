import React from "react";
import type { TechStackSlideData } from "../types";
import { Input, Select } from "../FormField";
import type { EditorProps } from "../FormField";

export const TechStackEditor: React.FC<EditorProps<TechStackSlideData>> = ({
  slide,
  updateSlide,
}) => (
  <div className="space-y-4">
    <Input
      label="Título"
      value={slide.title}
      onChange={(v) => updateSlide(slide.id, { title: v })}
    />
    <Select
      label="Columnas"
      value={slide.cols.toString()}
      options={[
        { label: "2 columnas", value: "2" },
        { label: "3 columnas", value: "3" },
        { label: "4 columnas", value: "4" },
      ]}
      onChange={(v) => updateSlide(slide.id, { cols: parseInt(v) })}
    />
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-500">Herramientas</label>
        <button
          type="button"
          onClick={() =>
            updateSlide(slide.id, {
              items: [...slide.items, { name: "", icon: "🔧" }],
            })
          }
          className="px-3 py-1 text-xs font-bold rounded bg-blue-500 text-white hover:bg-blue-600"
        >
          Añadir
        </button>
      </div>
      {slide.items.map((item, idx) => (
        <div key={idx} className="relative group flex items-center gap-2">
          <input
            type="text"
            value={item.icon}
            onChange={(e) => {
              const newItems = [...slide.items];
              newItems[idx] = { ...newItems[idx], icon: e.target.value };
              updateSlide(slide.id, { items: newItems });
            }}
            className="w-14 text-center bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-2 py-2 text-lg outline-none focus:border-blue-500"
            maxLength={4}
          />
          <input
            type="text"
            value={item.name}
            onChange={(e) => {
              const newItems = [...slide.items];
              newItems[idx] = { ...newItems[idx], name: e.target.value };
              updateSlide(slide.id, { items: newItems });
            }}
            className="flex-1 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500"
            placeholder="Nombre..."
          />
          <button
            type="button"
            onClick={() => {
              const newItems = slide.items.filter((_, i) => i !== idx);
              updateSlide(slide.id, {
                items: newItems.length ? newItems : [{ name: "", icon: "🔧" }],
              });
            }}
            className="flex-shrink-0 w-8 h-8 rounded-full bg-red-500 text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  </div>
);
