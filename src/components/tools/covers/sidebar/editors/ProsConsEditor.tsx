import React from "react";
import type { ProsConsSlideData } from "../types";
import { Input, Textarea } from "../FormField";
import type { EditorProps } from "../FormField";

export const ProsConsEditor: React.FC<EditorProps<ProsConsSlideData>> = ({
  slide,
  updateSlide,
}) => (
  <div className="space-y-4">
    <Input
      label="Título"
      value={slide.title}
      onChange={(v) => updateSlide(slide.id, { title: v })}
    />
    <Textarea
      label="Pros (uno por línea)"
      value={slide.pros.join("\n")}
      onChange={(v) => updateSlide(slide.id, { pros: v.split("\n") })}
    />
    <Textarea
      label="Contras (uno por línea)"
      value={slide.cons.join("\n")}
      onChange={(v) => updateSlide(slide.id, { cons: v.split("\n") })}
    />
  </div>
);
