import React from "react";
import { ACCENT_COLORS, getThemeStyles, type ThemeConfig } from "./types";
import { useCanvasScale } from "./useCanvasScale";

interface BlogPollProps {
  question: string;
  options: string[];
  questionLabel: string;
  theme: ThemeConfig;
  previewWidth?: number;
  previewHeight?: number;
}

export const BlogPoll: React.FC<BlogPollProps> = ({
  question,
  options,
  questionLabel = "Q",
  theme,
  previewWidth = 1080,
  previewHeight = 1080,
}) => {
  const { canvasRef, wrapperRef } = useCanvasScale(previewWidth, previewHeight);
  const c = ACCENT_COLORS[theme.accent] || ACCENT_COLORS.blue;
  const s = getThemeStyles(theme.mode);

  return (
    <div className="flex items-center justify-center overflow-hidden font-sans w-full h-full">
      <div ref={wrapperRef} className="relative">
        <div
          ref={canvasRef}
          data-export-canvas="true"
          className={`relative overflow-hidden flex flex-col items-center justify-center p-20 ${s.bg} ${s.text} shadow-2xl origin-top-left`}
          style={{
            width: `${previewWidth}px`,
            height: `${previewHeight}px`,
            flexShrink: 0,
          }}
        >
          <div className="w-full max-w-4xl space-y-4">
            {/* Question Section */}
            <div className="flex gap-8">
              <span
                className={`text-[120px] font-black leading-none ${c.textAccent} min-w-[120px] text-center`}
              >
                {questionLabel}
              </span>
              <h1
                className={`text-6xl font-black ${s.text} tracking-tight leading-tight pt-4`}
              >
                {question}
              </h1>
            </div>

            <div
              className={`h-1.5 w-32 ${c.bg} rounded-full ml-32 opacity-60`}
            />

            {/* Options Section */}
            <div className="space-y-6 ml-32">
              {options.map((option, index) => (
                <div
                  key={index}
                  className={`flex items-center gap-6 p-8 rounded-2xl ${s.bg} border-2 ${c.border} hover:scale-[1.02] transition-transform`}
                >
                  <span
                    className={`text-3xl font-black ${c.textAccent} opacity-80 min-w-[60px] text-center`}
                  >
                    {String.fromCharCode(65 + index)}
                  </span>
                  <p className={`text-3xl font-bold ${s.text} leading-relaxed`}>
                    {option}
                  </p>
                </div>
              ))}
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
            <span
              className={`${s.footer} font-mono text-xl tracking-[0.2em] font-bold`}
            >
              {theme.username}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
