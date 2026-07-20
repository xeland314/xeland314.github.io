import React from "react";
import type { StepSlideData } from "../types";
import { Input, Textarea } from "../FormField";
import type { EditorProps } from "../FormField";

export const StepEditor: React.FC<EditorProps<StepSlideData>> = ({
  slide,
  updateSlide,
}) => (
  <div className="space-y-4">
    <Input
      label="Número"
      value={slide.stepNumber}
      onChange={(v) => updateSlide(slide.id, { stepNumber: v })}
    />
    <Input
      label="Título"
      value={slide.title}
      onChange={(v) => updateSlide(slide.id, { title: v })}
    />
    <Textarea
      label="Descripción"
      value={slide.description}
      onChange={(v) => updateSlide(slide.id, { description: v })}
    />
  </div>
);
