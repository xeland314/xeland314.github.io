import React from "react";
import type { EndSlideData } from "../types";
import { Input, Textarea } from "../FormField";
import type { EditorProps } from "../FormField";

export const EndEditor: React.FC<EditorProps<EndSlideData>> = ({
  slide,
  updateSlide,
}) => (
  <div className="space-y-4">
    <Input
      label="Texto 1"
      value={slide.firstText}
      onChange={(v) => updateSlide(slide.id, { firstText: v })}
    />
    <Input
      label="Texto 2 (Color)"
      value={slide.secondText}
      onChange={(v) => updateSlide(slide.id, { secondText: v })}
    />
    <Textarea
      label="Descripción"
      value={slide.description}
      onChange={(v) => updateSlide(slide.id, { description: v })}
    />

    <div className="h-px bg-gray-100 dark:bg-gray-700 my-2" />

    <div className="flex items-center justify-between mb-2">
      <label className="text-xs font-bold text-gray-500 uppercase">CTAs & Footer</label>
      <div className="flex gap-1">
        <button
          onClick={() =>
            updateSlide(slide.id, {
              likeText: "Like",
              commentText: "Comment",
              saveText: "Save",
              firstText: "Thanks for",
              secondText: "Reading!",
            })
          }
          className="text-[10px] px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded hover:bg-blue-100 dark:hover:bg-blue-900/30 font-bold"
        >
          EN
        </button>
        <button
          onClick={() =>
            updateSlide(slide.id, {
              likeText: "Like",
              commentText: "Comenta",
              saveText: "Guarda",
              firstText: "¡Gracias por",
              secondText: "Leer!",
            })
          }
          className="text-[10px] px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded hover:bg-blue-100 dark:hover:bg-blue-900/30 font-bold"
        >
          ES
        </button>
      </div>
    </div>

    <div className="grid grid-cols-3 gap-2">
      <Input
        label="Like"
        value={slide.likeText}
        onChange={(v) => updateSlide(slide.id, { likeText: v })}
      />
      <Input
        label="Comment"
        value={slide.commentText}
        onChange={(v) => updateSlide(slide.id, { commentText: v })}
      />
      <Input
        label="Save"
        value={slide.saveText}
        onChange={(v) => updateSlide(slide.id, { saveText: v })}
      />
    </div>
    <Input
      label="Footer (Texto final)"
      value={slide.finalText}
      onChange={(v) => updateSlide(slide.id, { finalText: v })}
    />
  </div>
);
