import React from "react";
import { ACCENT_COLORS, getThemeStyles, type ThemeConfig } from "./types";
import { useCanvasScale } from "./useCanvasScale";

interface BlogTestimonialProps {
  quote: string;
  author: string;
  avatarUrl: string;
  rating: number;
  theme: ThemeConfig;
}

export const BlogTestimonial: React.FC<BlogTestimonialProps> = ({
  quote,
  author,
  avatarUrl,
  rating = 5,
  theme,
}) => {
  const { canvasRef, wrapperRef } = useCanvasScale();
  const c = ACCENT_COLORS[theme.accent] || ACCENT_COLORS.blue;
  const s = getThemeStyles(theme.mode);

  return (
    <div className="flex items-center justify-center overflow-hidden font-sans w-full h-full aspect-square">
      <div ref={wrapperRef} className="relative">
        <div
          ref={canvasRef}
          data-export-canvas="true"
          className={`relative overflow-hidden flex flex-col items-center justify-center p-24 ${s.bg} ${s.text} shadow-2xl origin-top-left`}
          style={{ width: "1080px", height: "1080px", flexShrink: 0 }}
        >
          {/* Background Ambient Blobs */}
          <div
            className={`absolute top-0 left-0 w-[500px] h-[500px] ${c.bg}/5 rounded-full blur-[120px] pointer-events-none`}
          />

          <div className="relative z-10 w-full max-w-4xl flex flex-col items-center text-center">
            {/* Rating Stars */}
            <div className="flex gap-2 mb-10">
              {[...Array(5)].map((_, i) => (
                <span key={i} className={`text-5xl ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}>
                  ★
                </span>
              ))}
            </div>

            <p className={`text-5xl font-bold italic ${s.text} mb-16 leading-snug`}>
              “{quote}”
            </p>

            <div className="flex flex-col items-center gap-6">
              <div className={`w-32 h-32 rounded-full border-4 ${c.border} p-1 shadow-2xl bg-white dark:bg-slate-800`}>
                {avatarUrl ? (
                  <img src={avatarUrl} alt={author} className="w-full h-full rounded-full object-cover" />
                ) : (
                  <div className={`w-full h-full rounded-full ${c.bg} flex items-center justify-center text-4xl text-white font-black`}>
                    {author.charAt(0)}
                  </div>
                )}
              </div>
              <div>
                <span className={`text-4xl font-black tracking-tight ${s.text}`}>
                  {author}
                </span>
                <span className={`block text-2xl font-bold ${c.textAccent} uppercase tracking-widest mt-1`}>
                  Usuario Verificado
                </span>
              </div>
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
