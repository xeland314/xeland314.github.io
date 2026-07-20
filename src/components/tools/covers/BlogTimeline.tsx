import React from "react";
import {
  ACCENT_COLORS,
  getThemeStyles,
  type ThemeConfig,
  type TimelineEvent,
} from "./types";
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
          <div className="mb-14 relative group w-full max-w-4xl">
            <div
              className={`absolute inset-0 bg-gradient-to-r ${c.gradient} rounded-3xl blur-xl opacity-40 group-hover:opacity-60 transition-opacity`}
            />
            <div
              className={`relative px-10 py-5 rounded-3xl bg-gradient-to-tr ${c.gradient} shadow-2xl transform hover:scale-[1.01] transition-transform duration-300`}
            >
              <h1
                className={`text-6xl font-black tracking-tight text-center text-white drop-shadow-lg`}
              >
                {title}
              </h1>
            </div>
          </div>

          {/* Timeline Container */}
          <div className="relative w-full max-w-4xl px-10">
            {/* Center Line with subtle glow */}
            <div
              className={`absolute left-[52px] top-4 bottom-4 w-1.5 ${c.bg} opacity-20 rounded-full`}
            />
            <div
              className={`absolute left-[46px] top-4 bottom-4 w-6 ${c.bg} opacity-10 blur-md rounded-full`}
            />

            <div className="space-y-10">
              {events.map((event, i) => (
                <div
                  key={i}
                  className="relative flex items-start gap-10 group/event"
                >
                  {/* Enhanced Glowing Dot */}
                  <div
                    className={`z-10 w-14 h-14 rounded-full bg-gradient-to-tr ${c.gradient} shadow-xl flex-shrink-0 flex items-center justify-center border-4 ${s.bg} relative`}
                  >
                    {/* Dot outer glow */}
                    <div
                      className={`absolute inset-0 rounded-full bg-gradient-to-tr ${c.gradient} blur-md opacity-60`}
                    />
                    {/* Inner core */}
                    <div className="relative w-3 h-3 bg-white rounded-full shadow-inner" />
                  </div>

                  {/* Event Content with subtle glassmorphism card */}
                  <div className="flex-1 pt-1 relative">
                    <div
                      className={`absolute -inset-3 rounded-2xl bg-white/[0.02] border border-white/5 backdrop-blur-sm opacity-0 group-hover/event:opacity-100 transition-opacity duration-300`}
                    />
                    <div className="relative p-2">
                      <span
                        className={`text-3xl font-mono font-black ${c.textAccent} block mb-2 drop-shadow-sm`}
                      >
                        {event.date}
                      </span>
                      <h2
                        className={`text-4xl font-black ${s.text} mb-3 drop-shadow-sm`}
                      >
                        {event.title}
                      </h2>
                      <p
                        className={`text-2xl font-bold ${s.sub} leading-relaxed`}
                      >
                        {event.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
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
