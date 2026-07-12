import React from "react";
import { ACCENT_COLORS, getThemeStyles, type ThemeConfig } from "./types";
import { useCanvasScale } from "./useCanvasScale";

interface BlogCoverImageProps {
  title: string;
  subtitle?: string;
  category: string;
  imageUrl: string;
  imageFit?: "contain" | "cover";
  theme: ThemeConfig;
  previewWidth?: number;
  previewHeight?: number;
}

export const BlogCoverImage: React.FC<BlogCoverImageProps> = ({
  title,
  subtitle,
  category,
  imageUrl,
  imageFit = "contain",
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
          className={`relative overflow-hidden flex flex-col items-center p-14 ${s.bg} ${s.text} shadow-2xl origin-top-left`}
          style={{ width: `${previewWidth}px`, height: `${previewHeight}px`, flexShrink: 0 }}
        >
          {/* Background Ambient Blobs (heredado de BlogCover) */}
          <div
            className={`absolute top-0 left-0 w-[500px] h-[500px] ${c.bg}/10 rounded-full blur-[150px] -translate-x-1/2 -translate-y-1/2 pointer-events-none`}
          />
          <div
            className={`absolute bottom-0 right-0 w-[500px] h-[500px] ${c.bg}/10 rounded-full blur-[150px] translate-x-1/3 translate-y-1/3 pointer-events-none`}
          />

          {/* Pattern Overlay */}
          <div
            className="absolute inset-0 opacity-[0.07] pointer-events-none"
            style={{
              backgroundImage: `radial-gradient(${s.overlay} 1px, transparent 1px)`,
              backgroundSize: "40px 40px",
            }}
          />

          <div className="relative z-10 flex flex-col items-center text-center w-full h-full pb-28">
            {/* Category Badge */}
            <div className={`mb-6 px-6 py-2 rounded-full border ${s.badge} backdrop-blur-md shadow-xl shrink-0`}>
              <span
                className={`${c.textAccent} font-bold tracking-[0.3em] uppercase text-xl font-mono flex items-center gap-3`}
              >
                <span className={`w-3 h-3 rounded-full ${c.bg}`}></span>
                {category}
              </span>
            </div>

            <h1
              className={`text-6xl font-inter font-black text-transparent bg-clip-text bg-gradient-to-br ${c.gradient} mb-8 tracking-tight leading-tight max-w-4xl shrink-0`}
            >
              {title}
            </h1>

            <div className="relative w-full flex-1 min-h-0 flex items-center justify-center">
              <img
                src={imageUrl}
                alt={title}
                className={
                  imageFit === "cover"
                    ? `w-full h-full object-cover rounded-[2rem] shadow-2xl ${c.shadow}`
                    : `max-w-full max-h-full w-auto h-auto object-contain rounded-[2rem] shadow-2xl ${c.shadow}`
                }
              />
            </div>

            {subtitle && (
              <p className={`mt-8 text-3xl font-medium ${s.sub} max-w-3xl leading-snug tracking-tight shrink-0`}>
                {subtitle}
              </p>
            )}
          </div>

          {/* Footer Brand */}
          <div className="absolute bottom-10 left-0 right-0 flex items-center justify-center gap-4 z-20">
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