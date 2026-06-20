import React from "react";
import { ACCENT_COLORS, getThemeStyles, type ThemeConfig, type TimelineEvent } from "./types";
import { useCanvasScale } from "./useCanvasScale";

interface BlogTimelineProps {
  title: string;
  events: TimelineEvent[];
  theme: ThemeConfig;
  previewWidth?: number;
  previewHeight?: number;
}

export const BlogTimeline: React.FC<BlogTimelineProps> = ({
  title,
  events = [],
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
          className={`relative overflow-hidden flex flex-col items-center p-20 ${s.bg} ${s.text} shadow-2xl origin-top-left`}
          style={{ width: `${previewWidth}px`, height: `${previewHeight}px`, flexShrink: 0 }}
        >

          <div className={`mb-12 px-8 py-4 rounded-3xl ${c.bg} shadow-2xl shadow-${theme.accent}-500/40`}>
            <h1 className={`text-6xl font-black mb-0 tracking-tight text-center ${s.text}`}>
              {title}
            </h1>
          </div>
          <div className="relative w-full max-w-4xl px-10">
            {/* Center Line */}
            <div className={`absolute left-[52px] top-0 bottom-0 w-1.5 ${c.bg} opacity-20 rounded-full`} />

            <div className="space-y-12">
              {events.map((event, i) => (
                <div key={i} className="relative flex items-start gap-10">
                  {/* Dot */}
                  <div className={`z-10 w-14 h-14 rounded-full ${c.bg} shadow-xl border-8 ${theme.mode === 'light' || theme.mode === 'soft' ? 'border-white' : 'border-slate-900'} flex-shrink-0 flex items-center justify-center`}>
                    <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
                  </div>

                  <div className="flex-1 pt-1">
                    <span className={`text-3xl font-mono font-black ${c.textAccent} block mb-2`}>
                      {event.date}
                    </span>
                    <h2 className={`text-4xl font-black ${s.text} mb-3`}>
                      {event.title}
                    </h2>
                    <p className={`text-2xl font-bold ${s.sub} leading-relaxed`}>
                      {event.description}
                    </p>
                  </div>
                </div>
              ))}
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
