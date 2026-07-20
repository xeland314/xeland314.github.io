import React from "react";
import type { AnnouncementSlideData } from "../types";
import { Input, Textarea, ImageUpload } from "../FormField";
import type { EditorProps } from "../FormField";

export const AnnouncementEditor: React.FC<EditorProps<AnnouncementSlideData>> = ({
  slide,
  updateSlide,
}) => (
  <div className="space-y-4">
    <Input
      label="Badge (ej. NUEVO)"
      value={slide.badge}
      onChange={(v) => updateSlide(slide.id, { badge: v })}
    />
    <Input
      label="Título"
      value={slide.title}
      onChange={(v) => updateSlide(slide.id, { title: v })}
    />
    <Textarea
      label="Subtítulo"
      value={slide.subtitle}
      onChange={(v) => updateSlide(slide.id, { subtitle: v })}
      rows={3}
    />
    <ImageUpload
      label="Imagen (opcional)"
      value={slide.imageUrl || ""}
      onChange={(v) => updateSlide(slide.id, { imageUrl: v || undefined })}
    />
  </div>
);
