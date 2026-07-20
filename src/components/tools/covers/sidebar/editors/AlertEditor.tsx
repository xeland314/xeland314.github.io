import React from "react";
import type { AlertSlideData } from "../types";
import { Input, Textarea, Select } from "../FormField";
import type { EditorProps } from "../FormField";

export const AlertEditor: React.FC<EditorProps<AlertSlideData>> = ({
  slide,
  updateSlide,
}) => (
  <div className="space-y-4">
    <Select
      label="Tipo de Alerta"
      value={slide.alertType}
      options={[
        { label: "Info", value: "info" },
        { label: "Aviso", value: "warning" },
        { label: "Error", value: "error" },
        { label: "Éxito", value: "success" },
      ]}
      onChange={(v) => updateSlide(slide.id, { alertType: v as any })}
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
