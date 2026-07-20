import React from "react";
import { ACCENT_COLORS, getThemeStyles, type ThemeConfig } from "./types";
import { useCanvasScale } from "./useCanvasScale";

interface BlogTestimonialProps {
  quote: string;
  author: string;
  avatarUrl: string;
  rating: number;
  theme: ThemeConfig;
  previewWidth?: number;
  previewHeight?: number;
}

export const BlogTestimonial: React.FC<BlogTestimonialProps> = ({
  quote,
  author,
  avatarUrl,
  rating = 5,
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
          className={`relative overflow-hidden flex flex-col items-center justify-center p-24 ${s.bg} ${s.text} shadow-2xl origin-top-left`}
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

          <div className="relative z-10 w-full max-w-4xl flex flex-col items-center text-center">
            {/* Enhanced Rating Stars */}
            <div className="flex gap-3 mb-10 relative group">
              <div
                className={`absolute inset-0 bg-gradient-to-r ${c.gradient} rounded-full blur-xl opacity-20 group-hover:opacity-40 transition-opacity`}
              />
              <div className="relative flex gap-2">
                {[...Array(5)].map((_, i) => (
                  <span
                    key={i}
                    className={`text-5xl ${i < rating ? c.textAccent : "text-gray-400"} transition-all duration-300 group-hover:scale-110 group-hover:animate-pulse`}
                  >
                    ★
                  </span>
                ))}
              </div>
            </div>

            {/* Quote with Glassmorphism Card */}
            <div
              className={`relative p-8 rounded-3xl ${s.bg || "bg-white/5"} border border-white/5 backdrop-blur-md shadow-2xl mb-16 max-w-4xl`}
            >
              <p
                className={`text-5xl font-bold italic ${s.text} leading-snug drop-shadow-lg text-center`}
              >
                “{quote}”
              </p>
            </div>

            {/* Enhanced Author Section */}
            <div className="flex flex-col items-center gap-6 relative group">
              {/* Avatar Glow Effect */}
              <div
                className={`absolute inset-0 bg-gradient-to-tr ${c.gradient} rounded-full blur-2xl opacity-30 group-hover:opacity-50 transition-opacity duration-500`}
              />

              {/* Avatar Container */}
              <div
                className={`relative w-32 h-32 rounded-full border-4 ${c.border} p-1 shadow-2xl ${s.bg || "bg-white/5"} overflow-hidden`}
              >
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={author}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <div
                    className={`w-full h-full rounded-full ${c.bg} flex items-center justify-center text-4xl text-white font-black`}
                  >
                    {author.charAt(0)}
                  </div>
                )}
              </div>

              <div className="relative z-10">
                <span
                  className={`text-4xl font-black tracking-tight ${s.text} drop-shadow-md`}
                >
                  {author}
                </span>
                <span
                  className={`block text-2xl font-bold ${c.textAccent} uppercase tracking-widest mt-2`}
                >
                  Usuario Verificado
                </span>
              </div>
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
