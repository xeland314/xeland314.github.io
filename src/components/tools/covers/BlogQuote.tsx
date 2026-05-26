import React from "react";
import { ACCENT_COLORS, getThemeStyles, type ThemeConfig } from "./types";
import { useCanvasScale } from "./useCanvasScale";

interface BlogQuoteProps {
  text: string;
  author: string;
  theme: ThemeConfig;
}

export const BlogQuote: React.FC<BlogQuoteProps> = ({
  text,
  author,
  theme,
}) => {
  const { canvasRef, wrapperRef } = useCanvasScale();
  const c = ACCENT_COLORS[theme.accent] || ACCENT_COLORS.blue;
  const s = getThemeStyles(theme.mode);

  return (
    <div
      className={`flex items-center justify-center overflow-hidden font-sans w-full h-full aspect-square`}
    >
      <div ref={wrapperRef} className="relative">
        <div
          ref={canvasRef}
          data-export-canvas="true"
          className={`relative overflow-hidden flex flex-col items-center justify-center p-24 ${s.bg} ${s.text} shadow-2xl origin-top-left`}
          style={{ width: "1080px", height: "1080px", flexShrink: 0 }}
        >
          {/* Large Quote Mark */}
          <span className={`absolute top-20 left-24 text-[300px] leading-none opacity-20 font-serif ${c.textAccent}`}>
            “
          </span>

          <div className="relative z-10 flex flex-col items-center text-center">
            <p className={`text-6xl font-bold italic ${s.text} mb-16 leading-tight max-w-5xl px-10`}>
              {text}
            </p>
            
            <div className={`h-1.5 w-32 ${c.bg} rounded-full mb-8 opacity-60`} />

            <span className={`text-4xl font-black uppercase tracking-[0.2em] ${c.textAccent}`}>
              — {author}
            </span>
          </div>

          {/* Large Quote Mark Bottom */}
          <span className={`absolute bottom-20 right-24 text-[300px] leading-none opacity-20 font-serif ${c.textAccent}`}>
            ”
          </span>

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
