import React from "react";
import type { SlideData } from "../types";
import { CoverEditor } from "./editors/CoverEditor";
import { MarkdownEditor } from "./editors/MarkdownEditor";
import { ImageEditor } from "./editors/ImageEditor";
import { EndEditor } from "./editors/EndEditor";

const EDITORS: Record<string, React.FC<any>> = {
  cover: CoverEditor,
  markdown: MarkdownEditor,
  image: ImageEditor,
  end: EndEditor,
};

interface SlideEditorProps {
  slide: SlideData;
  updateSlide: (id: string, data: Partial<SlideData>) => void;
}

export const SlideEditor: React.FC<SlideEditorProps> = ({ slide, updateSlide }) => {
  const Editor = EDITORS[slide.type];

  if (!Editor) {
    return (
      <div className="text-sm text-gray-400 italic p-4">
        Sin editor para <strong>{slide.type}</strong>
      </div>
    );
  }

  return <Editor slide={slide} updateSlide={updateSlide} />;
};
