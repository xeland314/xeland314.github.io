import React from "react";
import { ACCENT_COLORS, getThemeStyles, type ThemeConfig } from "./types";
import { useCanvasScale } from "./useCanvasScale";

interface BlogAnnouncementProps {
  badge: string;
  title: string;
  subtitle: string;
  imageUrl?: string;
  theme: ThemeConfig;
  previewWidth?: number;
  previewHeight?: number;
}

export const BlogAnnouncement: React.FC<BlogAnnouncementProps> = ({
  badge,
  title,
  subtitle,
  imageUrl,
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
          className={`relative overflow-hidden flex flex-col items-center justify-center p-20 ${s.bg} ${s.text} shadow-2xl origin-top-left`}
          style={{ width: `${previewWidth}px`, height: `${previewHeight}px`, flexShrink: 0 }}
        >
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className={`absolute -top-40 -left-40 w-[600px] h-[600px] ${c.bg}/15 rounded-full blur-[150px]`} />
            <div className={`absolute -bottom-20 -right-20 w-[500px] h-[500px] ${c.bg}/10 rounded-full blur-[120px]`} />
            <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] ${c.bg}/8 rounded-full blur-[100px]`} />
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:48px_48px]" />
            <div className={`absolute top-32 right-32 w-24 h-24 border-4 ${c.border}/20 rounded-2xl rotate-12`} />
            <div className={`absolute bottom-48 left-24 w-16 h-16 ${c.bg}/20 rounded-full blur-sm`} />
          </div>

          <div className="relative z-10 flex flex-col items-center text-center max-w-5xl">
            {/* Badge */}
            <div className="mb-10 relative group">
              <div className={`absolute inset-0 bg-gradient-to-r ${c.gradient} rounded-full blur-xl opacity-50 group-hover:opacity-70 transition-opacity animate-pulse`} />
              <div className={`relative px-10 py-4 rounded-full bg-gradient-to-r ${c.gradient} shadow-2xl`}>
                <span className="text-3xl font-black text-white uppercase tracking-[0.3em] drop-shadow-lg">{badge}</span>
              </div>
            </div>

            {/* Title */}
            <h1 className="text-8xl font-black tracking-tight leading-none mb-8 drop-shadow-2xl">
              <span className={`text-transparent bg-clip-text bg-gradient-to-br ${c.gradient}`}>{title}</span>
            </h1>

            {/* Divider */}
            <div className={`h-2 w-40 rounded-full bg-gradient-to-r ${c.gradient} mb-10 opacity-80 shadow-lg`} />

            {/* Subtitle */}
            <p className={`text-4xl font-bold ${s.sub} leading-relaxed max-w-3xl mb-12`}>{subtitle}</p>

            {/* Optional Image Mockup */}
            {imageUrl && (
              <div className="relative w-full max-w-3xl">
                <div className={`absolute inset-0 bg-gradient-to-tr ${c.gradient} opacity-20 blur-3xl rounded-[2rem] scale-95`} />
                <div className={`relative p-1.5 rounded-[2rem] bg-gradient-to-tr ${c.gradient} shadow-2xl`}>
                  <div className={`relative rounded-[1.75rem] overflow-hidden ${s.bg || "bg-black/20"}`}>
                    <img src={imageUrl} alt={title} className="w-full h-auto object-contain max-h-[400px]" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
                  </div>
                </div>
                <div className="absolute top-4 left-4 w-12 h-12 border-t-4 border-l-4 border-white/40 rounded-tl-xl" />
                <div className="absolute top-4 right-4 w-12 h-12 border-t-4 border-r-4 border-white/40 rounded-tr-xl" />
                <div className="absolute bottom-4 left-4 w-12 h-12 border-b-4 border-l-4 border-white/40 rounded-bl-xl" />
                <div className="absolute bottom-4 right-4 w-12 h-12 border-b-4 border-r-4 border-white/40 rounded-br-xl" />
              </div>
            )}
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
