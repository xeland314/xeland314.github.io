import React from "react";
import { ACCENT_COLORS, getThemeStyles, type ThemeConfig } from "./types";
import { useCanvasScale } from "./useCanvasScale";

interface BlogImageProps {
  title: string;
  imageUrl: string;
  caption: string;
  imageFit: "contain" | "cover";
  theme: ThemeConfig;
}

export const BlogImage: React.FC<BlogImageProps> = ({
  title,
  imageUrl,
  caption,
  imageFit = "contain",
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
          className={`relative overflow-hidden flex flex-col items-center p-16 ${s.bg} ${s.text} shadow-2xl origin-top-left`}
          style={{ width: "1080px", height: "1080px", flexShrink: 0 }}
        >
          <h1
            className={`text-5xl font-black mb-10 tracking-tight text-center ${s.text}`}
          >
            {title}
          </h1>

          <div className="w-full flex items-center justify-center mb-10 bg-black/5 dark:bg-white/5 rounded-[2rem] overflow-hidden border-2 border-dashed border-gray-300 dark:border-gray-700">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={title}
                className={`w-full h-auto max-h-full object-${imageFit}`}
              />
            ) : (
              <div className="text-gray-400 font-bold text-2xl uppercase tracking-widest py-20">
                No hay imagen seleccionada
              </div>
            )}
          </div>

          {caption && (
            <p
              className={`text-3xl font-medium ${s.sub} text-center max-w-4xl leading-relaxed`}
            >
              {caption}
            </p>
          )}

          {/* Footer Brand */}
          <div className="absolute bottom-10 flex items-center gap-4">
            {theme.showLogo && (
              <img
                src={theme.logoImage}
                alt="Logo"
                className={`w-12 h-12 rounded-lg border ${theme.mode === "midnight" || theme.mode === "dark" ? "border-slate-600" : "border-slate-300"} object-cover`}
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
