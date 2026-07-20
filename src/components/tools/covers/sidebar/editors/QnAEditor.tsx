import React from "react";
import type { QnASlideData } from "../types";
import { Input, Textarea } from "../FormField";
import type { EditorProps } from "../FormField";

export const QnAEditor: React.FC<EditorProps<QnASlideData>> = ({
  slide,
  updateSlide,
}) => (
  <div className="space-y-4">
    <div className="grid grid-cols-2 gap-4">
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
      <div className="space-y-2">
        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">
          Etiqueta R
        </label>
        <div className="flex gap-1">
          {["A", "R", "1", "B"].map((l) => (
            <button
              key={l}
              onClick={() => updateSlide(slide.id, { answerLabel: l })}
              className={`flex-1 py-1 text-xs font-bold rounded border ${
                slide.answerLabel === l
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
            value={["A", "R", "1", "B"].includes(slide.answerLabel) ? "" : slide.answerLabel}
            onChange={(e) => updateSlide(slide.id, { answerLabel: e.target.value })}
            placeholder="..."
            className="w-10 text-center py-1 text-xs font-bold rounded border bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 outline-none focus:border-blue-500"
          />
        </div>
      </div>
    </div>
    <Input
      label="Pregunta"
      value={slide.question}
      onChange={(v) => updateSlide(slide.id, { question: v })}
    />
    <Textarea
      label="Respuesta"
      value={slide.answer}
      onChange={(v) => updateSlide(slide.id, { answer: v })}
      rows={5}
    />
  </div>
);
