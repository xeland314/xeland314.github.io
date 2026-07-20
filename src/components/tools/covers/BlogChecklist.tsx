import React from "react";
import { ACCENT_COLORS, getThemeStyles, type ThemeConfig } from "./types";
import { useCanvasScale } from "./useCanvasScale";

interface BlogChecklistProps {
  title: string;
  items: { text: string; checked: boolean }[];
  theme: ThemeConfig;
  previewWidth?: number;
  previewHeight?: number;
}

export const BlogChecklist: React.FC<BlogChecklistProps> = ({
  title,
  items = [],
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
          className={`relative overflow-hidden flex flex-col items-start p-24 ${s.bg} ${s.text} shadow-2xl origin-top-left`}
          style={{ width: `${previewWidth}px`, height: `${previewHeight}px`, flexShrink: 0 }}
        >
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className={`absolute -top-40 -left-40 w-[600px] h-[600px] ${c.bg}/15 rounded-full blur-[150px]`} />
            <div className={`absolute -bottom-20 -right-20 w-[500px] h-[500px] ${c.bg}/10 rounded-full blur-[120px]`} />
            <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] ${c.bg}/5 rounded-full blur-[100px]`} />
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:48px_48px]" />
          </div>

          {/* Header */}
          <div className="mb-10 relative group w-full max-w-4xl">
            <div className={`absolute inset-0 bg-gradient-to-r ${c.gradient} rounded-3xl blur-xl opacity-40 group-hover:opacity-60 transition-opacity`} />
            <div className={`relative px-10 py-5 rounded-3xl bg-gradient-to-tr ${c.gradient} shadow-2xl`}>
              <h1 className="text-7xl font-black tracking-tight text-white drop-shadow-lg">{title}</h1>
            </div>
          </div>

          {/* Checklist Items */}
          <ul className="w-full space-y-5 max-w-4xl">
            {items.map((item, i) => (
              <li
                key={i}
                className={`flex items-center gap-8 p-6 rounded-2xl ${s.bg || "bg-white/5"} border border-white/5 backdrop-blur-sm transition-all duration-300 group/item shadow-lg`}
              >
                {/* Checkbox visual */}
                <div className={`flex-shrink-0 w-12 h-12 rounded-xl border-3 flex items-center justify-center transition-all duration-300 ${
                  item.checked
                    ? `bg-gradient-to-br ${c.gradient} border-transparent shadow-lg`
                    : `border-2 ${c.border}/40 bg-transparent`
                }`}>
                  {item.checked && (
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </div>
                <span className={`text-4xl font-medium ${item.checked ? s.text : s.sub} leading-tight ${item.checked ? "" : "opacity-70"}`}>
                  {item.text}
                </span>
              </li>
            ))}
          </ul>

          {/* Footer Brand */}
          <div className="absolute bottom-12 left-0 right-0 px-24">
            <div className={`flex items-center justify-between py-4 px-8 rounded-2xl ${s.bg || "bg-black/20"} border border-white/10 backdrop-blur-md shadow-lg max-w-4xl mx-auto`}>
              <span className={`${s.footer} font-mono text-3xl tracking-[0.2em] font-bold`}>{theme.username}</span>
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
