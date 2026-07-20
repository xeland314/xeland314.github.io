import React from "react";
import type { SlideData } from "../types";
import { CoverEditor } from "./editors/CoverEditor";
import { AnnouncementEditor } from "./editors/AnnouncementEditor";
import { StepEditor } from "./editors/StepEditor";
import { ComparisonEditor } from "./editors/ComparisonEditor";
import { CodeEditor } from "./editors/CodeEditor";
import { ImageEditor } from "./editors/ImageEditor";
import { AlertEditor } from "./editors/AlertEditor";
import { MetricEditor } from "./editors/MetricEditor";
import { ListEditor } from "./editors/ListEditor";
import { HighlightEditor } from "./editors/HighlightEditor";
import { TimelineEditor } from "./editors/TimelineEditor";
import { QnAEditor } from "./editors/QnAEditor";
import { PollEditor } from "./editors/PollEditor";
import { ProsConsEditor } from "./editors/ProsConsEditor";
import { DefinitionEditor } from "./editors/DefinitionEditor";
import { MythFactEditor } from "./editors/MythFactEditor";
import { ChecklistEditor } from "./editors/ChecklistEditor";
import { TechStackEditor } from "./editors/TechStackEditor";
import { MistakesEditor } from "./editors/MistakesEditor";
import { TakeawaysEditor } from "./editors/TakeawaysEditor";
import { EndEditor } from "./editors/EndEditor";

const EDITORS: Record<string, React.FC<any>> = {
  cover: CoverEditor,
  announcement: AnnouncementEditor,
  step: StepEditor,
  comparison: ComparisonEditor,
  code: CodeEditor,
  image: ImageEditor,
  alert: AlertEditor,
  metric: MetricEditor,
  list: ListEditor,
  highlight: HighlightEditor,
  timeline: TimelineEditor,
  qna: QnAEditor,
  poll: PollEditor,
  "pros-cons": ProsConsEditor,
  definition: DefinitionEditor,
  "myth-fact": MythFactEditor,
  checklist: ChecklistEditor,
  "tech-stack": TechStackEditor,
  mistakes: MistakesEditor,
  takeaways: TakeawaysEditor,
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
