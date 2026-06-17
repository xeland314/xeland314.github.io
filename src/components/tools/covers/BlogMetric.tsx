import React from "react";
import { ACCENT_COLORS, getThemeStyles, type ThemeConfig } from "./types";
import { useCanvasScale } from "./useCanvasScale";

interface BlogMetricProps {
  value: string;
  label: string;
  trend: string;
  theme: ThemeConfig;
  previewWidth?: number;
  previewHeight?: number;
}

export const BlogMetric: React.FC<BlogMetricProps> = ({
  value,
  label,
  trend,
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
            className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] ${c.bg}/10 rounded-full blur-[150px] pointer-events-none`}
          />

          <div className="relative z-10 flex flex-col items-center text-center">
            <span className={`text-[180px] font-black tracking-tighter leading-none mb-6 text-transparent bg-clip-text bg-gradient-to-br ${c.gradient}`}>
              {value}
            </span>
            
            <h1 className={`text-6xl font-bold ${s.text} mb-8 max-w-4xl uppercase tracking-widest`}>
              {label}
            </h1>

            {trend && (
              <div className={`px-8 py-3 rounded-full bg-black/5 dark:bg-white/10 border border-gray-200 dark:border-gray-700 backdrop-blur-md`}>
                <span className={`text-3xl font-mono font-bold ${trend.includes('+') ? 'text-emerald-500' : trend.includes('-') ? 'text-rose-500' : s.sub}`}>
                  {trend}
                </span>
              </div>
            )}
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
