import React from "react";
import type { DefinitionSlideData } from "../types";
import { Input, Textarea } from "../FormField";
import type { EditorProps } from "../FormField";

export const DefinitionEditor: React.FC<EditorProps<DefinitionSlideData>> = ({
  slide,
  updateSlide,
}) => (
  <div className="space-y-4">
    <Input
      label="Término"
      value={slide.term}
      onChange={(v) => updateSlide(slide.id, { term: v })}
    />
    <Input
      label="Fonética"
      value={slide.phonetic}
      onChange={(v) => updateSlide(slide.id, { phonetic: v })}
    />
    <Textarea
      label="Definición"
      value={slide.definition}
      onChange={(v) => updateSlide(slide.id, { definition: v })}
      rows={5}
    />
  </div>
);
