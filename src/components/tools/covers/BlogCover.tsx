import React from "react";
import { ACCENT_COLORS, getThemeStyles, type ThemeConfig } from "./types";
import { useCanvasScale } from "./useCanvasScale";

interface BlogCoverProps {
  title: string;
  subtitle: string;
  category: string;
  iconChar?: string;
  theme: ThemeConfig;
}

export const BlogCover: React.FC<BlogCoverProps> = ({
  title,
  subtitle,
  category,
  iconChar = "🚀",
  theme,
}) => {
  const { canvasRef, wrapperRef } = useCanvasScale();
  const c = ACCENT_COLORS[theme.accent] || ACCENT_COLORS.blue;
  const s = getThemeStyles(theme.mode);

  return (
    <div
      className={`flex items-center justify-center ${s.bg} overflow-hidden font-sans w-full`}
    >
      <div ref={wrapperRef} className="relative">
        <div
          ref={canvasRef}
          className={`relative overflow-hidden flex flex-col items-center justify-center p-12 ${s.bg} ${s.text} shadow-2xl origin-top-left`}
          style={{ width: "1080px", height: "1080px", flexShrink: 0 }}
        >
          {/* Background Ambient Blobs */}
          <div
            className={`absolute top-0 left-0 w-[500px] h-[500px] ${c.bg}/10 rounded-full blur-[150px] -translate-x-1/2 -translate-y-1/2 pointer-events-none`}
          />
          <div
            className={`absolute bottom-0 right-0 w-[500px] h-[500px] ${c.bg}/10 rounded-full blur-[150px] translate-x-1/3 translate-y-1/3 pointer-events-none`}
          />

          {/* Pattern Overlay */}
          <div
            className={`absolute inset-0 opacity-[0.07] pointer-events-none`}
            style={{
              backgroundImage: `radial-gradient(${s.overlay} 1px, transparent 1px)`,
              backgroundSize: "40px 40px",
            }}
          />

          <div className="relative z-10 flex flex-col items-center text-center">
            {/* Category Badge */}
            <div
              className={`mb-8 px-6 py-2 rounded-full border ${s.badge} backdrop-blur-md shadow-xl`}
            >
              <span
                className={`${c.textAccent} font-bold tracking-[0.3em] uppercase text-2xl font-mono flex items-center gap-3`}
              >
                <span className={`w-3 h-3 rounded-full ${c.bg}`}></span>
                {category}
              </span>
            </div>

            {/* Main Icon */}
            <div
              className={`mb-12 w-48 h-48 rounded-[3rem] flex items-center justify-center shadow-2xl ${c.shadow} border ${s.iconBg}`}
              style={{
                backdropFilter: "blur(10px)",
              }}
            >
              <span className="text-[100px] filter drop-shadow-lg">{iconChar}</span>
            </div>

            <h1
              className={`text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-br ${c.gradient} mb-8 tracking-tight leading-tight max-w-4xl`}
            >
              {title}
            </h1>

            <div className={`h-2 w-32 ${c.bg} rounded-full mb-10 opacity-80`} />

            <h2
              className={`text-4xl font-bold ${s.sub} max-w-3xl leading-snug tracking-tight`}
            >
              {subtitle}
            </h2>
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
