import React from "react";
import type { ComparisonSlideData } from "../types";
import { Input, Textarea } from "../FormField";
import type { EditorProps } from "../FormField";

export const ComparisonEditor: React.FC<EditorProps<ComparisonSlideData>> = ({
  slide,
  updateSlide,
}) => (
  <div className="space-y-4">
    <Input
      label="Título Principal"
      value={slide.title}
      onChange={(v) => updateSlide(slide.id, { title: v })}
    />
    <div className="grid grid-cols-2 gap-4">
      <Input
        label="Título Izq."
        value={slide.leftTitle}
        onChange={(v) => updateSlide(slide.id, { leftTitle: v })}
      />
      <Input
        label="Título Der."
        value={slide.rightTitle}
        onChange={(v) => updateSlide(slide.id, { rightTitle: v })}
      />
    </div>
    <Textarea
      label="Items Izq (uno por línea)"
      value={slide.leftItems.join("\n")}
      onChange={(v) => updateSlide(slide.id, { leftItems: v.split("\n") })}
    />
    <Textarea
      label="Items Der (uno por línea)"
      value={slide.rightItems.join("\n")}
      onChange={(v) => updateSlide(slide.id, { rightItems: v.split("\n") })}
    />
  </div>
);
