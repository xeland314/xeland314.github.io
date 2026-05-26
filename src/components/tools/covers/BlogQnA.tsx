import React from "react";
import { ACCENT_COLORS, getThemeStyles, type ThemeConfig } from "./types";
import { useCanvasScale } from "./useCanvasScale";

interface BlogQnAProps {
  question: string;
  answer: string;
  questionLabel: string;
  answerLabel: string;
  theme: ThemeConfig;
}

export const BlogQnA: React.FC<BlogQnAProps> = ({
  question,
  answer,
  questionLabel = "Q",
  answerLabel = "A",
  theme,
}) => {
  const { canvasRef, wrapperRef } = useCanvasScale();
  const c = ACCENT_COLORS[theme.accent] || ACCENT_COLORS.blue;
  const s = getThemeStyles(theme.mode);

  return (
    <div className="flex items-center justify-center overflow-hidden font-sans w-full h-full aspect-square">
      <div ref={wrapperRef} className="relative">
        <div
          ref={canvasRef}
          data-export-canvas="true"
          className={`relative overflow-hidden flex flex-col items-center justify-center p-20 ${s.bg} ${s.text} shadow-2xl origin-top-left`}
          style={{ width: "1080px", height: "1080px", flexShrink: 0 }}
        >
          <div className="w-full max-w-4xl space-y-12">
            <div className="flex gap-8">
              <span className={`text-[120px] font-black leading-none ${c.textAccent} opacity-40 min-w-[120px] text-center`}>
                {questionLabel}
              </span>
              <h1 className={`text-6xl font-black ${s.text} tracking-tight leading-tight pt-4`}>
                {question}
              </h1>
            </div>

            <div className={`h-1.5 w-32 ${c.bg} rounded-full ml-32 opacity-30`} />

            <div className="flex gap-8">
              <span className={`text-[120px] font-black leading-none ${s.sub} opacity-20 min-w-[120px] text-center`}>
                {answerLabel}
              </span>
              <p className={`text-4xl font-bold ${s.sub} leading-relaxed pt-4`}>
                {answer}
              </p>
            </div>
          </div>

          {/* Footer Brand */}
          <div className="absolute bottom-12 flex items-center gap-4">
            {theme.showLogo && (
              <img
                src={theme.logoImage}
                alt="Logo"
                className={`w-14 h-14 rounded-xl border ${theme.mode === "midnight" || theme.mode === "dark" ? "border-slate-600" : "border-slate-300"} object-cover`}
              />
            )}
            <span className={`${s.footer} font-mono text-xl tracking-[0.2em] font-bold`}>
              {theme.username}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
