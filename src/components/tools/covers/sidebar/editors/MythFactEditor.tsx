import React from "react";
import type { MythFactSlideData } from "../types";
import { Input, Textarea } from "../FormField";
import type { EditorProps } from "../FormField";

export const MythFactEditor: React.FC<EditorProps<MythFactSlideData>> = ({
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
      label="Mito"
      value={slide.myth}
      onChange={(v) => updateSlide(slide.id, { myth: v })}
      rows={4}
    />
    <Textarea
      label="Realidad"
      value={slide.fact}
      onChange={(v) => updateSlide(slide.id, { fact: v })}
      rows={4}
    />
  </div>
);
