import React from "react";
import { ACCENT_COLORS, getThemeStyles, type ThemeConfig } from "./types";
import { useCanvasScale } from "./useCanvasScale";

interface BlogTechStackProps {
  title: string;
  items: { name: string; icon: string }[];
  cols: number;
  theme: ThemeConfig;
  previewWidth?: number;
  previewHeight?: number;
}

export const BlogTechStack: React.FC<BlogTechStackProps> = ({
  title,
  items = [],
  cols = 3,
  theme,
  previewWidth = 1080,
  previewHeight = 1080,
}) => {
  const { canvasRef, wrapperRef } = useCanvasScale(previewWidth, previewHeight);
  const c = ACCENT_COLORS[theme.accent] || ACCENT_COLORS.blue;
  const s = getThemeStyles(theme.mode);

  const gridCols = cols === 4 ? "grid-cols-4" : cols === 2 ? "grid-cols-2" : "grid-cols-3";

  return (
    <div className="flex items-center justify-center overflow-hidden font-sans w-full h-full">
      <div ref={wrapperRef} className="relative">
        <div
          ref={canvasRef}
          data-export-canvas="true"
          className={`relative overflow-hidden flex flex-col items-center p-16 ${s.bg} ${s.text} shadow-2xl origin-top-left`}
          style={{ width: `${previewWidth}px`, height: `${previewHeight}px`, flexShrink: 0 }}
        >
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className={`absolute -top-40 -left-40 w-[600px] h-[600px] ${c.bg}/15 rounded-full blur-[150px]`} />
            <div className={`absolute -bottom-20 -right-20 w-[500px] h-[500px] ${c.bg}/10 rounded-full blur-[120px]`} />
            <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] ${c.bg}/5 rounded-full blur-[100px]`} />
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:48px_48px]" />
          </div>

          {/* Header */}
          <div className="mb-14 relative group w-full max-w-4xl">
            <div className={`absolute inset-0 bg-gradient-to-r ${c.gradient} rounded-3xl blur-xl opacity-40 group-hover:opacity-60 transition-opacity`} />
            <div className={`relative px-10 py-5 rounded-3xl bg-gradient-to-tr ${c.gradient} shadow-2xl`}>
              <h1 className="text-6xl font-black tracking-tight text-center text-white drop-shadow-lg">{title}</h1>
            </div>
          </div>

          {/* Tech Grid */}
          <div className={`grid ${gridCols} gap-8 w-full max-w-4xl`}>
            {items.map((item, i) => (
              <div
                key={i}
                className={`group relative flex flex-col items-center gap-5 p-8 rounded-[2.5rem] ${s.bg || "bg-white/5"} border-2 ${c.border}/30 backdrop-blur-md transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:border-opacity-100`}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${c.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500 rounded-[2.5rem]`} />
                <div className={`relative w-24 h-24 rounded-2xl ${c.bg}/10 border-2 ${c.border}/20 flex items-center justify-center backdrop-blur-sm`}>
                  <span className={`text-5xl ${c.textAccent}`}>{item.icon}</span>
                </div>
                <span className={`relative text-2xl font-black ${s.text} text-center tracking-tight`}>{item.name}</span>
              </div>
            ))}
          </div>

          {/* Footer Brand */}
          <div className="absolute bottom-12 left-0 right-0 px-20">
            <div className={`flex items-center justify-between py-4 px-8 rounded-2xl ${s.bg || "bg-black/20"} border border-white/10 backdrop-blur-md shadow-lg max-w-4xl mx-auto`}>
              <span className={`${s.footer} font-mono text-xl tracking-[0.2em] font-bold uppercase`}>{theme.username}</span>
              <div className="flex items-center gap-4">
                <div className="flex gap-2">
                  <div className={`w-3 h-3 rounded-full ${c.bg} animate-pulse`} />
                  <div className={`w-3 h-3 rounded-full ${c.bg}/40`} />
                  <div className={`w-3 h-3 rounded-full ${c.bg}/20`} />
                </div>
                {theme.showLogo && (
                  <div className={`p-1.5 rounded-xl bg-gradient-to-tr ${c.gradient} shadow-md`}>
                    <img src={theme.logoImage} alt="Logo" className="w-10 h-10 rounded-lg object-cover border border-white/20" />
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className={`absolute top-8 left-8 w-16 h-16 border-t-4 border-l-4 ${c.border}/30 rounded-tl-2xl`} />
          <div className={`absolute top-8 right-8 w-16 h-16 border-t-4 border-r-4 ${c.border}/30 rounded-tr-2xl`} />
          <div className={`absolute bottom-28 left-8 w-16 h-16 border-b-4 border-l-4 ${c.border}/30 rounded-bl-2xl`} />
          <div className={`absolute bottom-28 right-8 w-16 h-16 border-b-4 border-r-4 ${c.border}/30 rounded-br-2xl`} />
        </div>
      </div>
    </div>
  );
};
