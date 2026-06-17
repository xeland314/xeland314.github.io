import React from "react";
import { ACCENT_COLORS, getThemeStyles, type ThemeConfig } from "./types";
import { useCanvasScale } from "./useCanvasScale";

interface BlogListProps {
  title: string;
  items: string[];
  bulletType: "check" | "number" | "bullet";
  theme: ThemeConfig;
  previewWidth?: number;
  previewHeight?: number;
}

export const BlogList: React.FC<BlogListProps> = ({
  title,
  items,
  bulletType = "bullet",
  theme,
  previewWidth = 1080,
  previewHeight = 1080,
}) => {
  const { canvasRef, wrapperRef } = useCanvasScale(previewWidth, previewHeight);
  const c = ACCENT_COLORS[theme.accent] || ACCENT_COLORS.blue;
  const s = getThemeStyles(theme.mode);

  const getBullet = (index: number) => {
    switch (bulletType) {
      case "check": return "✓";
      case "number": return `${index + 1}.`;
      default: return "•";
    }
  };

  return (
    <div
      className="flex items-center justify-center overflow-hidden font-sans w-full h-full"
    >
      <div ref={wrapperRef} className="relative">
        <div
          ref={canvasRef}
          data-export-canvas="true"
          className={`relative overflow-hidden flex flex-col items-start p-24 ${s.bg} ${s.text} shadow-2xl origin-top-left`}
          style={{ width: `${previewWidth}px`, height: `${previewHeight}px`, flexShrink: 0 }}
        >
          <h1 className={`text-7xl font-black mb-16 tracking-tight ${s.text}`}>
            {title}
          </h1>

          <ul className="w-full space-y-10">
            {items.map((item, i) => (
              <li key={i} className="flex items-start gap-8">
                <span className={`text-5xl font-black ${c.textAccent} mt-1`}>
                  {getBullet(i)}
                </span>
                <span className={`text-4xl font-bold ${s.sub} leading-tight`}>
                  {item}
                </span>
              </li>
            ))}
          </ul>

          {/* Footer Brand */}
          <div className="absolute bottom-12 right-24 flex items-center gap-4">
            <span className={`${s.footer} font-mono text-xl tracking-[0.2em] font-bold`}>
              {theme.username}
            </span>
            {theme.showLogo && (
              <img
                src={theme.logoImage}
                alt="Logo"
                className={`w-14 h-14 rounded-xl border ${theme.mode === "midnight" || theme.mode === "dark" ? "border-slate-600" : "border-slate-300"} object-cover`}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
