import React from "react";
import type { CodeSlideData } from "../types";
import { Input, Textarea } from "../FormField";
import type { EditorProps } from "../FormField";

export const CodeEditor: React.FC<EditorProps<CodeSlideData>> = ({
  slide,
  updateSlide,
}) => (
  <div className="space-y-4">
    <Input
      label="Título"
      value={slide.title}
      onChange={(v) => updateSlide(slide.id, { title: v })}
    />
    <Input
      label="Lenguaje"
      value={slide.language}
      onChange={(v) => updateSlide(slide.id, { language: v })}
    />
    <Textarea
      label="Código"
      value={slide.code}
      onChange={(v) => updateSlide(slide.id, { code: v })}
      rows={8}
    />
  </div>
);
