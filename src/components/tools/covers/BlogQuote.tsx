import React from "react";
import { ACCENT_COLORS, getThemeStyles, type ThemeConfig } from "./types";
import { useCanvasScale } from "./useCanvasScale";

interface BlogQuoteProps {
  text: string;
  author: string;
  theme: ThemeConfig;
  previewWidth?: number;
  previewHeight?: number;
}

export const BlogQuote: React.FC<BlogQuoteProps> = ({
  text,
  author,
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
          className={`relative overflow-hidden flex flex-col items-center justify-center p-24 ${s.bg} ${s.text} shadow-2xl origin-top-left`}
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
          </div>

          {/* Large Decorative Quote Marks (Enhanced as background watermarks) */}
          <span
            className={`absolute top-16 left-20 text-[320px] leading-none opacity-10 font-serif ${c.textAccent} blur-[2px] select-none pointer-events-none`}
          >
            “
          </span>
          <span
            className={`absolute bottom-16 right-20 text-[320px] leading-none opacity-10 font-serif ${c.textAccent} blur-[2px] select-none pointer-events-none`}
          >
            ”
          </span>

          {/* Main Content */}
          <div className="relative z-10 flex flex-col items-center text-center max-w-5xl">
            {/* Quote Text with premium typography */}
            <p
              className={`text-6xl font-bold italic ${s.text} mb-16 leading-tight px-10 drop-shadow-lg`}
            >
              {text}
            </p>

            {/* Gradient Divider with glow */}
            <div
              className={`h-1.5 w-32 rounded-full bg-gradient-to-r ${c.gradient} mb-10 opacity-80 shadow-lg`}
            />

            {/* Author with signature pill design */}
            <div className={`relative group`}>
              <div
                className={`absolute inset-0 bg-gradient-to-r ${c.gradient} rounded-full blur-lg opacity-30 group-hover:opacity-50 transition-opacity`}
              />
              <div
                className={`relative px-8 py-3 rounded-full border border-white/10 ${s.bg || "bg-white/5"} backdrop-blur-md shadow-xl`}
              >
                <span
                  className={`text-4xl font-black uppercase tracking-[0.2em] ${c.textAccent} drop-shadow-sm`}
                >
                  — {author}
                </span>
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
