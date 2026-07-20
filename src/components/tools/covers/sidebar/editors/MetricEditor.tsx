import React from "react";
import type { MetricSlideData } from "../types";
import { Input } from "../FormField";
import type { EditorProps } from "../FormField";

export const MetricEditor: React.FC<EditorProps<MetricSlideData>> = ({
  slide,
  updateSlide,
}) => (
  <div className="space-y-4">
    <Input
      label="Valor (Grande)"
      value={slide.value}
      onChange={(v) => updateSlide(slide.id, { value: v })}
    />
    <Input
      label="Etiqueta"
      value={slide.label}
      onChange={(v) => updateSlide(slide.id, { label: v })}
    />
    <Input
      label="Tendencia (Opcional)"
      value={slide.trend}
      onChange={(v) => updateSlide(slide.id, { trend: v })}
    />
  </div>
);
