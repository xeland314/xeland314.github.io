import React from "react";
import { ACCENT_COLORS, getThemeStyles, type ThemeConfig } from "./types";
import { useCanvasScale } from "./useCanvasScale";

interface BlogCoverProps {
  title: string;
  subtitle: string;
  category: string;
  iconChar?: string;
  theme: ThemeConfig;
  previewWidth?: number;
  previewHeight?: number;
}

export const BlogCover: React.FC<BlogCoverProps> = ({
  title,
  subtitle,
  category,
  iconChar = "🚀",
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
          className={`relative overflow-hidden flex flex-col items-center justify-center p-12 ${s.bg} ${s.text} shadow-2xl origin-top-left`}
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
            <div
              className={`absolute top-40 right-40 w-16 h-16 ${c.bg}/15 rounded-lg rotate-45`}
            />
          </div>

          <div className="relative z-10 flex flex-col items-center text-center max-w-5xl">
            {/* Enhanced Category Badge */}
            <div className="mb-10 relative group">
              <div
                className={`absolute inset-0 bg-gradient-to-r ${c.gradient} rounded-full blur-lg opacity-40 group-hover:opacity-60 transition-opacity`}
              />
              <div
                className={`relative px-8 py-3 rounded-full border-2 ${c.border}/40 ${s.bg || "bg-white/10"} backdrop-blur-md shadow-xl`}
              >
                <span
                  className={`${c.textAccent} font-bold tracking-[0.3em] uppercase text-2xl font-mono flex items-center gap-3`}
                >
                  <span
                    className={`w-3 h-3 rounded-full ${c.bg} animate-pulse`}
                  ></span>
                  {category}
                </span>
              </div>
            </div>

            {/* Main Icon as Hero Element */}
            <div className="mb-14 relative group">
              {/* Outer deep glow */}
              <div
                className={`absolute inset-0 bg-gradient-to-tr ${c.gradient} rounded-[3rem] blur-2xl opacity-40 group-hover:opacity-60 transition-opacity duration-500`}
              />

              {/* Gradient border frame */}
              <div
                className={`relative p-1.5 rounded-[3rem] bg-gradient-to-tr ${c.gradient} shadow-2xl transform hover:scale-105 transition-transform duration-500`}
              >
                {/* Inner container */}
                <div
                  className={`relative w-48 h-48 rounded-[2.75rem] ${s.bg || "bg-black/40"} flex items-center justify-center backdrop-blur-sm overflow-hidden`}
                >
                  {/* Inner subtle gradient wash */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${c.gradient} opacity-10`}
                  />

                  {/* The Icon */}
                  <span className="relative text-[110px] drop-shadow-2xl transform group-hover:scale-110 transition-transform duration-500">
                    {iconChar}
                  </span>
                </div>
              </div>
            </div>

            {/* Title with enhanced gradient and shadow */}
            <h1
              className={`text-8xl font-inter font-black text-transparent bg-clip-text bg-gradient-to-br ${c.gradient} mb-8 tracking-tight leading-tight max-w-4xl drop-shadow-2xl`}
            >
              {title}
            </h1>

            {/* Gradient divider */}
            <div
              className={`h-2 w-32 rounded-full bg-gradient-to-r ${c.gradient} mb-10 opacity-80 shadow-lg`}
            />

            {/* Subtitle */}
            <h2
              className={`text-4xl font-bold ${s.sub} max-w-3xl leading-snug tracking-tight`}
            >
              {subtitle}
            </h2>
          </div>

          {/* Enhanced Footer Brand */}
          <div className="absolute bottom-12 left-0 right-0 px-20">
            <div
              className={`flex items-center justify-between py-4 px-8 rounded-2xl ${s.bg || "bg-black/20"} border border-white/10 backdrop-blur-md shadow-lg max-w-4xl mx-auto`}
            >
              <div className="flex items-center gap-4">
                <span
                  className={`${s.footer} font-mono text-3xl tracking-[0.2em] font-bold`}
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
                      className="w-20 h-20 rounded-lg object-cover border border-white/20"
                      loading="lazy"
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
