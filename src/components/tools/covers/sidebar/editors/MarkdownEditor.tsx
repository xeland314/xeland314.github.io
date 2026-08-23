import React from "react";
import type { MarkdownSlideData } from "../types";
import { Textarea, SliderField } from "../FormField";
import type { EditorProps } from "../FormField";

const HINT = [
  "# / ## — título (el primero se vuelve la caja degradada)",
  "- lista   - [x] tarea   1. numerada",
  "**negrita**   *cursiva*   `código`",
  "> cita   --- separador   | tabla GFM |",
  "```lenguaje ... ``` bloque de código",
].join("\n");

export const MarkdownEditor: React.FC<EditorProps<MarkdownSlideData>> = ({
  slide,
  updateSlide,
}) => (
  <div className="space-y-4">
    <SliderField
      label="Escala de texto"
      value={slide.fontScale ?? 1}
      onChange={(v) => updateSlide(slide.id, { fontScale: v })}
    />
    <Textarea
      label="Contenido (Markdown)"
      value={slide.content}
      onChange={(v) => updateSlide(slide.id, { content: v })}
      rows={14}
    />
    <pre className="text-[10px] leading-relaxed font-mono text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-xl p-3 whitespace-pre-wrap">
{HINT}
    </pre>
  </div>
);
