import React from "react";
import type { ImageSlideData } from "../types";
import { Input, Textarea, Select, ImageUpload } from "../FormField";
import type { EditorProps } from "../FormField";

const SCALE_OPTIONS = [0.75, 1, 1.25, 1.5, 1.75, 2].map((v) => ({
  value: String(v),
  label: `×${v}`,
}));

export const ImageEditor: React.FC<EditorProps<ImageSlideData>> = ({
  slide,
  updateSlide,
}) => (
  <div className="space-y-4">
    <Input
      label="Título"
      value={slide.title}
      onChange={(v) => updateSlide(slide.id, { title: v })}
    />
    <ImageUpload
      label="Imagen"
      value={slide.imageUrl}
      onChange={(v) => updateSlide(slide.id, { imageUrl: v })}
    />
    <Select
      label="Ajuste de Imagen"
      value={slide.imageFit}
      options={[
        { label: "Contener", value: "contain" },
        { label: "Cubrir", value: "cover" },
      ]}
      onChange={(v) => updateSlide(slide.id, { imageFit: v as any })}
    />
    <Select
      label="Escala del caption"
      value={String(slide.fontScale ?? 1)}
      options={SCALE_OPTIONS}
      onChange={(v) => updateSlide(slide.id, { fontScale: parseFloat(v) })}
    />
    <Textarea
      label="Descripción (soporta Markdown)"
      value={slide.caption}
      onChange={(v) => updateSlide(slide.id, { caption: v })}
    />
  </div>
);
