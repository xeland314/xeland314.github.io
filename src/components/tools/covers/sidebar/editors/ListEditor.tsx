import React from "react";
import type { ListSlideData } from "../types";
import { Input, Textarea, Select } from "../FormField";
import type { EditorProps } from "../FormField";

export const ListEditor: React.FC<EditorProps<ListSlideData>> = ({
  slide,
  updateSlide,
}) => (
  <div className="space-y-4">
    <Input
      label="Título"
      value={slide.title}
      onChange={(v) => updateSlide(slide.id, { title: v })}
    />
    <Select
      label="Tipo de Viñeta"
      value={slide.bulletType}
      options={[
        { label: "Punto", value: "bullet" },
        { label: "Check", value: "check" },
        { label: "Número", value: "number" },
      ]}
      onChange={(v) => updateSlide(slide.id, { bulletType: v as any })}
    />
    <Textarea
      label="Items (uno por línea)"
      value={slide.items.join("\n")}
      onChange={(v) => updateSlide(slide.id, { items: v.split("\n") })}
    />
  </div>
);
