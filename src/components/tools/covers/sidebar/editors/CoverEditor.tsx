import React from "react";
import type { CoverSlideData } from "../types";
import { Input, Select, ImageUpload } from "../FormField";
import type { EditorProps } from "../FormField";

export const CoverEditor: React.FC<EditorProps<CoverSlideData>> = ({
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
      label="Subtítulo"
      value={slide.subtitle}
      onChange={(v) => updateSlide(slide.id, { subtitle: v })}
    />
    <Input
      label="Categoría"
      value={slide.category}
      onChange={(v) => updateSlide(slide.id, { category: v })}
    />
    <Input
      label="Icono (Emoji)"
      value={slide.iconChar}
      onChange={(v) => updateSlide(slide.id, { iconChar: v })}
    />
    <ImageUpload
      label="Imagen (opcional - reemplaza el icono)"
      value={slide.imageUrl || ""}
      onChange={(v) => updateSlide(slide.id, { imageUrl: v || undefined })}
    />
    {slide.imageUrl && (
      <Select
        label="Ajuste de Imagen"
        value={slide.imageFit || "contain"}
        options={[
          { label: "Contener", value: "contain" },
          { label: "Cubrir", value: "cover" },
        ]}
        onChange={(v) => updateSlide(slide.id, { imageFit: v as any })}
      />
    )}
  </div>
);
