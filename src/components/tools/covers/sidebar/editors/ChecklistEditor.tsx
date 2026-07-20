import React from "react";
import type { ChecklistSlideData } from "../types";
import { Input } from "../FormField";
import type { EditorProps } from "../FormField";

export const ChecklistEditor: React.FC<EditorProps<ChecklistSlideData>> = ({
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
        <label className="text-sm font-medium text-gray-500">Items</label>
        <button
          type="button"
          onClick={() =>
            updateSlide(slide.id, {
              items: [...slide.items, { text: "", checked: false }],
            })
          }
          className="px-3 py-1 text-xs font-bold rounded bg-blue-500 text-white hover:bg-blue-600"
        >
          Añadir item
        </button>
      </div>
      {slide.items.map((item, idx) => (
        <div key={idx} className="relative group flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              const newItems = [...slide.items];
              newItems[idx] = { ...newItems[idx], checked: !newItems[idx].checked };
              updateSlide(slide.id, { items: newItems });
            }}
            className={`flex-shrink-0 w-8 h-8 rounded-lg border-2 flex items-center justify-center transition-all ${
              item.checked
                ? "bg-blue-500 border-blue-600 text-white"
                : "border-gray-300 dark:border-gray-600"
            }`}
          >
            {item.checked && "✓"}
          </button>
          <div className="flex-1">
            <input
              type="text"
              value={item.text}
              onChange={(e) => {
                const newItems = [...slide.items];
                newItems[idx] = { ...newItems[idx], text: e.target.value };
                updateSlide(slide.id, { items: newItems });
              }}
              className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500"
              placeholder="Texto del item..."
            />
          </div>
          <button
            type="button"
            onClick={() => {
              const newItems = slide.items.filter((_, i) => i !== idx);
              updateSlide(slide.id, {
                items: newItems.length ? newItems : [{ text: "", checked: false }],
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
