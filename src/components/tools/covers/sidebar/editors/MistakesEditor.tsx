import React from "react";
import type { MistakesSlideData } from "../types";
import { Input, Textarea } from "../FormField";
import type { EditorProps } from "../FormField";

export const MistakesEditor: React.FC<EditorProps<MistakesSlideData>> = ({
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
    <Input
      label="Etiqueta Mal"
      value={slide.badLabel}
      onChange={(v) => updateSlide(slide.id, { badLabel: v })}
    />
    <Textarea
      label="Código Mal"
      value={slide.badCode}
      onChange={(v) => updateSlide(slide.id, { badCode: v })}
      rows={6}
    />
    <Input
      label="Etiqueta Bien"
      value={slide.goodLabel}
      onChange={(v) => updateSlide(slide.id, { goodLabel: v })}
    />
    <Textarea
      label="Código Bien"
      value={slide.goodCode}
      onChange={(v) => updateSlide(slide.id, { goodCode: v })}
      rows={6}
    />
  </div>
);
