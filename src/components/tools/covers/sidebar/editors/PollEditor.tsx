import React from "react";
import type { PollSlideData } from "../types";
import { Input, Textarea } from "../FormField";
import type { EditorProps } from "../FormField";

export const PollEditor: React.FC<EditorProps<PollSlideData>> = ({
  slide,
  updateSlide,
}) => (
  <div className="space-y-4">
    <div className="space-y-2">
      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">
        Etiqueta P
      </label>
      <div className="flex gap-1">
        {["Q", "P", "1", "A"].map((l) => (
          <button
            key={l}
            onClick={() => updateSlide(slide.id, { questionLabel: l })}
            className={`flex-1 py-1 text-xs font-bold rounded border ${
              slide.questionLabel === l
                ? "bg-blue-500 border-blue-600 text-white"
                : "bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-500"
            }`}
          >
            {l}
          </button>
        ))}
        <input
          type="text"
          maxLength={2}
          value={["Q", "P", "1", "A"].includes(slide.questionLabel) ? "" : slide.questionLabel}
          onChange={(e) => updateSlide(slide.id, { questionLabel: e.target.value })}
          placeholder="..."
          className="w-10 text-center py-1 text-xs font-bold rounded border bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 outline-none focus:border-blue-500"
        />
      </div>
    </div>
    <Input
      label="Pregunta"
      value={slide.question}
      onChange={(v) => updateSlide(slide.id, { question: v })}
    />
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-500">Opciones</label>
        <button
          type="button"
          onClick={() => updateSlide(slide.id, { options: [...slide.options, ""] })}
          className="px-3 py-1 text-xs font-bold rounded bg-blue-500 text-white hover:bg-blue-600"
        >
          Añadir opción
        </button>
      </div>
      {slide.options.map((option, idx) => (
        <div key={idx} className="relative group">
          <Textarea
            label={`Opción ${idx + 1}`}
            value={option}
            onChange={(v) => {
              const newOptions = [...slide.options];
              newOptions[idx] = v;
              updateSlide(slide.id, { options: newOptions });
            }}
            rows={3}
          />
          <button
            type="button"
            onClick={() => {
              const newOptions = slide.options.filter((_, i) => i !== idx);
              updateSlide(slide.id, { options: newOptions.length ? newOptions : [""] });
            }}
            className={`absolute top-3 right-3 w-8 h-8 rounded-full text-white text-xs flex items-center justify-center transition-opacity ${
              slide.options.length > 1
                ? "bg-red-500 opacity-100 hover:bg-red-600"
                : "bg-gray-300 opacity-50 cursor-not-allowed"
            }`}
            disabled={slide.options.length <= 1}
            aria-label="Eliminar opción"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  </div>
);
