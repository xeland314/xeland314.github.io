import React from "react";
import { ACCENT_COLORS, getThemeStyles, type ThemeConfig } from "./types";
import { useCanvasScale } from "./useCanvasScale";

interface BlogDefinitionProps {
  term: string;
  phonetic: string;
  definition: string;
  theme: ThemeConfig;
}

export const BlogDefinition: React.FC<BlogDefinitionProps> = ({
  term,
  phonetic,
  definition,
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
          className={`relative overflow-hidden flex flex-col items-start justify-center p-24 ${s.bg} ${s.text} shadow-2xl origin-top-left`}
          style={{ width: "1080px", height: "1080px", flexShrink: 0 }}
        >
          <div className="max-w-4xl">
            <h1 className={`text-[120px] font-black tracking-tighter leading-none mb-4 ${s.text}`}>
              {term}
            </h1>
            
            {phonetic && (
              <span className={`text-4xl font-mono ${c.textAccent} block mb-12 italic`}>
                {phonetic}
              </span>
            )}

            <div className={`h-2 w-32 ${c.bg} rounded-full mb-12 opacity-50`} />

            <p className={`text-5xl font-bold ${s.sub} leading-tight`}>
              {definition}
            </p>
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
