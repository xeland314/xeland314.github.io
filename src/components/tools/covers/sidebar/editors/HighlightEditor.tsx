import React from "react";
import type { HighlightSlideData } from "../types";
import { Input, Textarea, Select, ImageUpload } from "../FormField";
import type { EditorProps } from "../FormField";

export const HighlightEditor: React.FC<EditorProps<HighlightSlideData>> = ({
  slide,
  updateSlide,
}) => (
  <div className="space-y-4">
    <Textarea
      label="Texto / Cita"
      value={slide.text}
      onChange={(v) => updateSlide(slide.id, { text: v })}
      rows={5}
    />
    <Input
      label="Autor"
      value={slide.author}
      onChange={(v) => updateSlide(slide.id, { author: v })}
    />
    <Input
      label="Título del Autor (opcional)"
      value={slide.authorTitle || ""}
      onChange={(v) => updateSlide(slide.id, { authorTitle: v || undefined })}
    />
    <div className="h-px bg-gray-100 dark:bg-gray-700 my-2" />
    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
      Opciones de Testimonio
    </p>
    <ImageUpload
      label="Avatar URL (opcional - activa modo testimonio)"
      value={slide.avatarUrl || ""}
      onChange={(v) => updateSlide(slide.id, { avatarUrl: v || undefined })}
    />
    <Select
      label="Calificación (0 = sin estrellas)"
      value={(slide.rating || 0).toString()}
      options={[
        { label: "Sin estrellas", value: "0" },
        { label: "5 Estrellas", value: "5" },
        { label: "4 Estrellas", value: "4" },
        { label: "3 Estrellas", value: "3" },
        { label: "2 Estrellas", value: "2" },
        { label: "1 Estrella", value: "1" },
      ]}
      onChange={(v) => updateSlide(slide.id, { rating: parseInt(v) || undefined })}
    />
  </div>
);
