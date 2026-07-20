import React from "react";
import { ACCENT_COLORS, getThemeStyles, type ThemeConfig } from "./types";
import { useCanvasScale } from "./useCanvasScale";

interface BlogHighlightProps {
  text: string;
  author: string;
  authorTitle?: string;
  avatarUrl?: string;
  rating?: number;
  theme: ThemeConfig;
  previewWidth?: number;
  previewHeight?: number;
}

export const BlogHighlight: React.FC<BlogHighlightProps> = ({
  text,
  author,
  authorTitle,
  avatarUrl,
  rating,
  theme,
  previewWidth = 1080,
  previewHeight = 1080,
}) => {
  const { canvasRef, wrapperRef } = useCanvasScale(previewWidth, previewHeight);
  const c = ACCENT_COLORS[theme.accent] || ACCENT_COLORS.blue;
  const s = getThemeStyles(theme.mode);

  const showRating = typeof rating === "number" && rating > 0;
  const showAvatar = Boolean(avatarUrl);

  return (
    <div className="flex items-center justify-center overflow-hidden font-sans w-full h-full">
      <div ref={wrapperRef} className="relative">
        <div
          ref={canvasRef}
          data-export-canvas="true"
          className={`relative overflow-hidden flex flex-col items-center justify-center p-24 ${s.bg} ${s.text} shadow-2xl origin-top-left`}
          style={{ width: `${previewWidth}px`, height: `${previewHeight}px`, flexShrink: 0 }}
        >
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className={`absolute -top-40 -left-40 w-[600px] h-[600px] ${c.bg}/15 rounded-full blur-[150px]`} />
            <div className={`absolute -bottom-20 -right-20 w-[500px] h-[500px] ${c.bg}/10 rounded-full blur-[120px]`} />
            <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] ${c.bg}/5 rounded-full blur-[100px]`} />
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:48px_48px]" />
          </div>

          {/* Decorative Quote Marks */}
          <span className={`absolute top-16 left-20 text-[320px] leading-none opacity-10 font-serif ${c.textAccent} blur-[2px] select-none pointer-events-none`}>
            &ldquo;
          </span>
          <span className={`absolute bottom-16 right-20 text-[320px] leading-none opacity-10 font-serif ${c.textAccent} blur-[2px] select-none pointer-events-none`}>
            &rdquo;
          </span>

          <div className="relative z-10 w-full max-w-4xl flex flex-col items-center text-center">
            {/* Stars (optional) */}
            {showRating && (
              <div className="flex gap-3 mb-10 relative group">
                <div className={`absolute inset-0 bg-gradient-to-r ${c.gradient} rounded-full blur-xl opacity-20 group-hover:opacity-40 transition-opacity`} />
                <div className="relative flex gap-2">
                  {[...Array(5)].map((_, i) => (
                    <span
                      key={i}
                      className={`text-5xl ${i < rating! ? c.textAccent : "text-gray-400"} transition-all duration-300 group-hover:scale-110 group-hover:animate-pulse`}
                    >
                      ★
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Quote Text */}
            <div className={`relative p-8 rounded-3xl ${showAvatar ? `${s.bg || "bg-white/5"} border border-white/5 backdrop-blur-md shadow-2xl mb-16 max-w-4xl` : ""}`}>
              <p className={`text-${showAvatar ? "5xl" : "6xl"} font-bold italic ${s.text} leading-snug drop-shadow-lg text-center ${!showAvatar ? "mb-16 px-10" : ""}`}>
                &ldquo;{text}&rdquo;
              </p>
            </div>

            {/* Divider (quote mode) */}
            {!showAvatar && (
              <>
                <div className={`h-1.5 w-32 rounded-full bg-gradient-to-r ${c.gradient} mb-10 opacity-80 shadow-lg`} />
              </>
            )}

            {/* Author + Avatar (testimonial mode) */}
            {showAvatar ? (
              <div className="flex flex-col items-center gap-6 relative group">
                <div className={`absolute inset-0 bg-gradient-to-tr ${c.gradient} rounded-full blur-2xl opacity-30 group-hover:opacity-50 transition-opacity duration-500`} />
                <div className={`relative w-32 h-32 rounded-full border-4 ${c.border} p-1 shadow-2xl ${s.bg || "bg-white/5"} overflow-hidden`}>
                  {avatarUrl ? (
                    <img src={avatarUrl} alt={author} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <div className={`w-full h-full rounded-full ${c.bg} flex items-center justify-center text-4xl text-white font-black`}>
                      {author.charAt(0)}
                    </div>
                  )}
                </div>
                <div className="relative z-10">
                  <span className={`text-4xl font-black tracking-tight ${s.text} drop-shadow-md`}>{author}</span>
                  <span className={`block text-2xl font-bold ${c.textAccent} uppercase tracking-widest mt-2`}>{authorTitle || "Usuario Verificado"}</span>
                </div>
              </div>
            ) : (
              /* Author pill (quote mode) */
              <div className={`relative group`}>
                <div className={`absolute inset-0 bg-gradient-to-r ${c.gradient} rounded-full blur-lg opacity-30 group-hover:opacity-50 transition-opacity`} />
                <div className={`relative px-8 py-3 rounded-full border border-white/10 ${s.bg || "bg-white/5"} backdrop-blur-md shadow-xl`}>
                  <span className={`text-4xl font-black uppercase tracking-[0.2em] ${c.textAccent} drop-shadow-sm`}>
                    — {author}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Footer Brand */}
          <div className="absolute bottom-12 left-0 right-0 px-20">
            <div className={`flex items-center justify-between py-4 px-8 rounded-2xl ${s.bg || "bg-black/20"} border border-white/10 backdrop-blur-md shadow-lg max-w-4xl mx-auto`}>
              <div className="flex items-center gap-4">
                <span className={`${s.footer} font-mono text-xl tracking-[0.2em] font-bold uppercase`}>{theme.username}</span>
              </div>
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

          {/* Corner decorations */}
          <div className={`absolute top-8 left-8 w-16 h-16 border-t-4 border-l-4 ${c.border}/30 rounded-tl-2xl`} />
          <div className={`absolute top-8 right-8 w-16 h-16 border-t-4 border-r-4 ${c.border}/30 rounded-tr-2xl`} />
          <div className={`absolute bottom-28 left-8 w-16 h-16 border-b-4 border-l-4 ${c.border}/30 rounded-bl-2xl`} />
          <div className={`absolute bottom-28 right-8 w-16 h-16 border-b-4 border-r-4 ${c.border}/30 rounded-br-2xl`} />
        </div>
      </div>
    </div>
  );
};
