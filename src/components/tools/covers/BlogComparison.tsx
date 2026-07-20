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
    <div className="flex items-center justify-center overflow-hidden font-sans w-full h-full">
      <div ref={wrapperRef} className="relative">
        <div
          ref={canvasRef}
          data-export-canvas="true"
          className={`relative overflow-hidden flex flex-col items-center p-16 ${s.bg} ${s.text} shadow-2xl origin-top-left`}
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

          {/* Header with Premium Gradient Box */}
          <div className="mb-12 relative group w-full max-w-4xl">
            <div
              className={`absolute inset-0 bg-gradient-to-r ${c.gradient} rounded-3xl blur-xl opacity-40 group-hover:opacity-60 transition-opacity`}
            />
            <div
              className={`relative px-10 py-5 rounded-3xl bg-gradient-to-tr ${c.gradient} shadow-2xl transform hover:scale-[1.01] transition-transform duration-300`}
            >
              <h1
                className={`text-6xl font-black tracking-tight leading-tight text-center text-white drop-shadow-lg`}
              >
                {title}
              </h1>
            </div>
          </div>

          {/* Comparison Columns */}
          <div className="relative flex w-full h-full max-h-[825px] gap-8 mb-12">
            {/* Left Side */}
            <div
              className={`flex-1 flex flex-col items-center p-8 rounded-[3rem] ${s.bg || "bg-white/5"} border-2 ${c.border}/30 backdrop-blur-md overflow-hidden shadow-xl relative`}
            >
              <h2
                className={`text-4xl font-black mb-8 ${c.textAccent} uppercase tracking-widest drop-shadow-sm`}
              >
                {leftTitle}
              </h2>
              <ul className="w-full space-y-3 px-2">
                {leftItems.map((item, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors group/item"
                  >
                    <span
                      className={`mt-2 w-2.5 h-2.5 rounded-full ${c.bg} flex-shrink-0 shadow-lg group-hover/item:scale-125 transition-transform`}
                    />
                    <span
                      className={`text-2xl font-bold ${s.text} leading-snug`}
                    >
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* VS Badge (Elevated and Glowing) */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
              <div
                className={`absolute inset-0 bg-gradient-to-tr ${c.gradient} rounded-full blur-xl opacity-60 animate-pulse`}
              />
              <div
                className={`relative w-28 h-28 rounded-full bg-gradient-to-tr ${c.gradient} flex items-center justify-center shadow-2xl border-4 ${s.bg}`}
              >
                <span className="text-3xl font-black text-white drop-shadow-md tracking-tighter">
                  VS
                </span>
              </div>
            </div>

            {/* Right Side */}
            <div
              className={`flex-1 flex flex-col items-center p-8 rounded-[3rem] ${s.bg || "bg-white/5"} border-2 ${c.border}/30 backdrop-blur-md overflow-hidden shadow-xl relative`}
            >
              <h2
                className={`text-4xl font-black mb-8 ${c.textAccent} uppercase tracking-widest drop-shadow-sm`}
              >
                {rightTitle}
              </h2>
              <ul className="w-full space-y-3 px-2">
                {rightItems.map((item, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors group/item"
                  >
                    <span
                      className={`mt-2 w-2.5 h-2.5 rounded-full ${c.bg} flex-shrink-0 shadow-lg group-hover/item:scale-125 transition-transform`}
                    />
                    <span
                      className={`text-2xl font-bold ${s.text} leading-snug`}
                    >
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Enhanced Footer Brand */}
          <div className="absolute bottom-10 left-0 right-0 px-20">
            <div
              className={`flex items-center justify-between py-4 px-8 rounded-2xl ${s.bg || "bg-black/20"} border border-white/10 backdrop-blur-md shadow-lg max-w-4xl mx-auto`}
            >
              <div className="flex items-center gap-4">
                <span
                  className={`${s.footer} font-mono text-xl tracking-[0.2em] font-bold uppercase`}
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
                      className="w-10 h-10 rounded-lg object-cover border border-white/20"
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
