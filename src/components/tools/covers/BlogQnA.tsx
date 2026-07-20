import React from "react";
import { ACCENT_COLORS, getThemeStyles, type ThemeConfig } from "./types";
import { useCanvasScale } from "./useCanvasScale";

interface BlogQnAProps {
  question: string;
  answer: string;
  questionLabel: string;
  answerLabel: string;
  theme: ThemeConfig;
  previewWidth?: number;
  previewHeight?: number;
}

export const BlogQnA: React.FC<BlogQnAProps> = ({
  question,
  answer,
  questionLabel = "Q",
  answerLabel = "A",
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
          {/* Enhanced Background Effects */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {/* Ambient glow orbs */}
            <div
              className={`absolute -top-40 -left-40 w-[600px] h-[600px] ${c.bg}/15 rounded-full blur-[150px]`}
            />
            <div
              className={`absolute -bottom-20 -right-20 w-[500px] h-[500px] ${c.bg}/10 rounded-full blur-[120px]`}
            />
            <div
              className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] ${c.bg}/5 rounded-full blur-[100px]`}
            />

            {/* Subtle grid pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:48px_48px]" />

            {/* Decorative floating shapes */}
            <div
              className={`absolute top-32 right-32 w-24 h-24 border-4 ${c.border}/20 rounded-2xl rotate-12`}
            />
            <div
              className={`absolute bottom-48 left-24 w-16 h-16 ${c.bg}/20 rounded-full blur-sm`}
            />
          </div>

          <div className="relative z-10 w-full max-w-4xl space-y-12">
            {/* Question Section with Glowing Label */}
            <div className="flex gap-8 items-start">
              <div className="relative flex-shrink-0">
                <div
                  className={`absolute inset-0 bg-gradient-to-tr ${c.gradient} rounded-[2rem] blur-2xl opacity-40`}
                />
                <span
                  className={`relative text-[120px] font-black leading-none text-transparent bg-clip-text bg-gradient-to-br ${c.gradient} min-w-[120px] text-center drop-shadow-2xl`}
                >
                  {questionLabel}
                </span>
              </div>
              <h1
                className={`text-6xl font-black ${s.text} tracking-tight leading-tight pt-4 drop-shadow-lg`}
              >
                {question}
              </h1>
            </div>

            {/* Gradient Divider with glow */}
            <div
              className={`h-1.5 w-32 rounded-full bg-gradient-to-r ${c.gradient} ml-32 opacity-80 shadow-lg`}
            />

            {/* Answer Section with Glassmorphism Card */}
            <div className="flex gap-8 items-start">
              <div className="relative flex-shrink-0">
                <div
                  className={`absolute inset-0 ${s.bg || "bg-white/10"} rounded-[2rem] blur-xl opacity-50`}
                />
                <span
                  className={`relative text-[120px] font-bold leading-none ${s.sub} opacity-60 min-w-[120px] text-center drop-shadow-lg`}
                >
                  {answerLabel}
                </span>
              </div>

              {/* Answer content wrapped in a premium glass card */}
              <div
                className={`relative flex-1 pt-4 pl-8 border-l-4 ${c.bg} rounded-r-2xl ${s.bg || "bg-white/5"} py-6 pr-6 backdrop-blur-sm shadow-xl`}
              >
                <p
                  className={`text-4xl font-medium ${s.sub} leading-relaxed drop-shadow-sm`}
                >
                  {answer}
                </p>
              </div>
            </div>
          </div>

          {/* Enhanced Footer Brand */}
          <div className="absolute bottom-12 left-0 right-0 px-20">
            <div
              className={`flex items-center justify-between py-4 px-8 rounded-2xl ${s.bg || "bg-black/20"} border border-white/10 backdrop-blur-md shadow-lg max-w-4xl mx-auto`}
            >
              <div className="flex items-center gap-4">
                <span
                  className={`${s.footer} font-mono text-3xl tracking-[0.2em] font-bold uppercase`}
                >
                  {theme.username}
                </span>
              </div>

              <div className="flex items-center gap-4">
                {/* Decorative tech dots */}
                <div className="flex gap-2">
                  <div
                    className={`w-3 h-3 rounded-full ${c.bg} animate-pulse`}
                  />
                  <div className={`w-3 h-3 rounded-full ${c.bg}/40`} />
                  <div className={`w-3 h-3 rounded-full ${c.bg}/20`} />
                </div>

                {theme.showLogo && (
                  <div
                    className={`p-1.5 rounded-xl bg-gradient-to-tr ${c.gradient} shadow-md`}
                  >
                    <img
                      src={theme.logoImage}
                      alt="Logo"
                      className="w-20 h-20 rounded-lg object-cover border border-white/20"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Corner decorations for framing */}
          <div
            className={`absolute top-8 left-8 w-16 h-16 border-t-4 border-l-4 ${c.border}/30 rounded-tl-2xl`}
          />
          <div
            className={`absolute top-8 right-8 w-16 h-16 border-t-4 border-r-4 ${c.border}/30 rounded-tr-2xl`}
          />
          <div
            className={`absolute bottom-28 left-8 w-16 h-16 border-b-4 border-l-4 ${c.border}/30 rounded-bl-2xl`}
          />
          <div
            className={`absolute bottom-28 right-8 w-16 h-16 border-b-4 border-r-4 ${c.border}/30 rounded-br-2xl`}
          />
        </div>
      </div>
    </div>
  );
};
