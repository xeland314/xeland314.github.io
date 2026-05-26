import React from "react";
import { ACCENT_COLORS, getThemeStyles, type ThemeConfig } from "./types";
import { useCanvasScale } from "./useCanvasScale";

interface BlogProsConsProps {
  title: string;
  pros: string[];
  cons: string[];
  theme: ThemeConfig;
}

export const BlogProsCons: React.FC<BlogProsConsProps> = ({
  title,
  pros = [],
  cons = [],
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
          className={`relative overflow-hidden flex flex-col items-center p-16 ${s.bg} shadow-2xl origin-top-left`}
          style={{ width: "1080px", height: "1080px", flexShrink: 0 }}
        >
          <h1 className={`text-6xl font-black mb-16 tracking-tight text-center ${s.text}`}>
            {title}
          </h1>

          <div className="grid grid-cols-2 w-full h-full max-h-[600px] gap-8">
            {/* Pros */}
            <div className={`flex flex-col p-10 rounded-[3rem] ${s.card} border-2 border-emerald-500/30 bg-emerald-500/5`}>
              <h2 className="text-4xl font-black mb-10 text-emerald-500 uppercase tracking-widest flex items-center gap-4">
                <span className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center text-2xl">✓</span>
                Pros
              </h2>
              <ul className="space-y-6">
                {pros.map((item, i) => (
                  <li key={i} className={`text-2xl font-bold ${s.sub} leading-tight`}>
                    • {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Cons */}
            <div className={`flex flex-col p-10 rounded-[3rem] ${s.card} border-2 border-rose-500/30 bg-rose-500/5`}>
              <h2 className="text-4xl font-black mb-10 text-rose-500 uppercase tracking-widest flex items-center gap-4">
                <span className="w-10 h-10 rounded-full bg-rose-500 text-white flex items-center justify-center text-2xl">✕</span>
                Contras
              </h2>
              <ul className="space-y-6">
                {cons.map((item, i) => (
                  <li key={i} className={`text-2xl font-bold ${s.sub} leading-tight`}>
                    • {item}
                  </li>
                ))}
              </ul>
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
