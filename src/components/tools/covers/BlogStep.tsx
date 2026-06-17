import React from "react";
import { ACCENT_COLORS, getThemeStyles, type ThemeConfig } from "./types";
import { useCanvasScale } from "./useCanvasScale";

interface BlogStepProps {
  stepNumber: string;
  title: string;
  description: string;
  theme: ThemeConfig;
  previewWidth?: number;
  previewHeight?: number;
}

export const BlogStep: React.FC<BlogStepProps> = ({
  stepNumber,
  title,
  description,
  theme,
  previewWidth = 1080,
  previewHeight = 1080,
}) => {
  const { canvasRef, wrapperRef } = useCanvasScale(previewWidth, previewHeight);
  const c = ACCENT_COLORS[theme.accent] || ACCENT_COLORS.blue;
  const s = getThemeStyles(theme.mode);

  return (
    <div
      className="flex items-center justify-center overflow-hidden font-sans w-full h-full"
    >
      <div ref={wrapperRef} className="relative">
        <div
          ref={canvasRef}
          data-export-canvas="true"
          className={`relative overflow-hidden flex flex-col items-center justify-center p-20 ${s.bg} ${s.text} shadow-2xl origin-top-left`}
          style={{ width: `${previewWidth}px`, height: `${previewHeight}px`, flexShrink: 0 }}
        >
          {/* Background Ambient Blobs */}
          <div
            className={`absolute top-0 left-0 w-[600px] h-[600px] ${c.bg}/10 rounded-full blur-[150px] -translate-x-1/3 -translate-y-1/3 pointer-events-none`}
          />

          <div className="relative z-10 w-full flex flex-col items-start">
            <div className={`mb-12 px-8 py-4 rounded-3xl ${c.bg} shadow-2xl shadow-${theme.accent}-500/40`}>
              <span className="text-6xl font-black text-white font-mono">
                {stepNumber}
              </span>
            </div>

            <h1
              className={`text-7xl font-black mb-12 tracking-tight leading-tight max-w-4xl`}
            >
              {title}
            </h1>

            <div className={`h-2 w-40 ${c.bg} rounded-full mb-12 opacity-80`} />

            <p
              className={`text-4xl font-medium ${s.sub} leading-relaxed max-w-4xl`}
            >
              {description}
            </p>
          </div>

          {/* Footer Brand */}
          <div className="absolute bottom-12 right-20 flex items-center gap-4">
             <span
              className={`${s.footer} font-mono text-xl tracking-[0.2em] font-bold`}
            >
              {theme.username}
            </span>
            {theme.showLogo && (
              <img
                src={theme.logoImage}
                alt="Logo"
                className={`w-14 h-14 rounded-xl border ${theme.mode === "midnight" || theme.mode === "dark" ? "border-slate-600" : "border-slate-300"} object-cover`}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
