import React from "react";
import { ACCENT_COLORS, getThemeStyles, type ThemeConfig } from "./types";
import { useCanvasScale } from "./useCanvasScale";

interface BlogComparisonProps {
  title: string;
  leftTitle: string;
  leftItems: string[];
  rightTitle: string;
  rightItems: string[];
  theme: ThemeConfig;
  previewWidth?: number;
  previewHeight?: number;
}

export const BlogComparison: React.FC<BlogComparisonProps> = ({
  title,
  leftTitle,
  leftItems,
  rightTitle,
  rightItems,
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
          className={`relative overflow-hidden flex flex-col items-center p-16 ${s.bg} shadow-2xl origin-top-left`}
          style={{ width: `${previewWidth}px`, height: `${previewHeight}px`, flexShrink: 0 }}
        >
          {/* Header */}
          <h1 className={`text-6xl font-black mb-16 tracking-tight text-center ${s.text}`}>
            {title}
          </h1>

          <div className="flex w-full h-full max-h-[825px] gap-8 mb-12">
            {/* Left Side */}
            <div className={`flex-1 flex flex-col items-center p-8 rounded-[3rem] ${s.card} border-2 overflow-hidden`}>
              <h2 className={`text-4xl font-black mb-8 ${c.textAccent} uppercase tracking-widest`}>
                {leftTitle}
              </h2>
              <ul className="w-full space-y-4 overflow-y-auto">
                {leftItems.map((item, i) => (
                  <li key={i} className="flex items-start gap-4 text-2xl font-bold">
                    <span className={s.sub}>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* VS Badge */}
            <div className={`absolute top-[55%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-24 h-24 rounded-full ${s.badge.split(' ').pop()} flex items-center justify-center shadow-2xl border-4 ${theme.mode === "midnight" || theme.mode === "dark" ? "border-slate-700" : "border-slate-200"}`}>
               <span className={`text-4xl font-black ${c.textAccent}`}>VS</span>
            </div>

            {/* Right Side */}
            <div className={`flex-1 flex flex-col items-center p-8 rounded-[3rem] ${s.card} border-2 overflow-hidden`}>
              <h2 className={`text-4xl font-black mb-8 ${c.textAccent} uppercase tracking-widest`}>
                {rightTitle}
              </h2>
              <ul className="w-full space-y-4 overflow-y-auto">
                {rightItems.map((item, i) => (
                  <li key={i} className="flex items-start gap-4 text-2xl font-bold">
                    <span className={s.sub}>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Footer Brand */}
          <div className="absolute bottom-10 flex items-center gap-4">
            {theme.showLogo && (
              <img
                src={theme.logoImage}
                alt="Logo"
                className={`w-12 h-12 rounded-lg border ${theme.mode === "midnight" || theme.mode === "dark" ? "border-slate-600" : "border-slate-300"} object-cover`}
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
