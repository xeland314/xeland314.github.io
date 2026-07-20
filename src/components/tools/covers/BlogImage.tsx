import React from "react";
import { ACCENT_COLORS, getThemeStyles, type ThemeConfig } from "./types";
import { useCanvasScale } from "./useCanvasScale";

interface BlogImageProps {
  title: string;
  imageUrl: string;
  caption: string;
  imageFit: "contain" | "cover";
  theme: ThemeConfig;
  previewWidth?: number;
  previewHeight?: number;
}

export const BlogImage: React.FC<BlogImageProps> = ({
  title,
  imageUrl,
  caption,
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
          className={`relative overflow-hidden flex flex-col items-center p-16 ${s.bg} ${s.text} shadow-2xl origin-top-left`}
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

          {/* Header with Premium Gradient Box */}
          <div className="mb-12 relative group w-full max-w-4xl">
            <div
              className={`absolute inset-0 bg-gradient-to-r ${c.gradient} rounded-3xl blur-xl opacity-40 group-hover:opacity-60 transition-opacity`}
            />
            <div
              className={`relative px-10 py-5 rounded-3xl bg-gradient-to-tr ${c.gradient} shadow-2xl transform hover:scale-[1.01] transition-transform duration-300`}
            >
              <h1
                className={`text-5xl font-black tracking-tight text-center text-white drop-shadow-lg`}
              >
                {title}
              </h1>
            </div>
          </div>

          {/* Enhanced Image Container */}
          <div className="w-full flex items-center justify-center mb-10 relative group">
            {/* Image glow effect */}
            <div
              className={`absolute inset-0 bg-gradient-to-tr ${c.gradient} opacity-20 blur-3xl rounded-[2rem] scale-95 group-hover:opacity-30 transition-opacity duration-500`}
            />

            {/* Image frame with gradient border */}
            <div
              className={`relative p-1.5 rounded-[2rem] bg-gradient-to-tr ${c.gradient} shadow-2xl transform hover:scale-[1.01] transition-transform duration-500`}
            >
              <div
                className={`relative rounded-[1.75rem] overflow-hidden ${s.bg || "bg-black/20"}`}
              >
                {imageUrl ? (
                  <>
                    <img
                      src={imageUrl}
                      alt={title}
                      className={`w-full h-auto max-h-[600px] object-${imageFit}`}
                    />
                    {/* Overlay gradient for depth */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 px-8">
                    <div
                      className={`w-20 h-20 rounded-full ${c.bg}/20 flex items-center justify-center mb-6`}
                    >
                      <svg
                        className={`w-10 h-10 ${c.textAccent} opacity-60`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                    <span
                      className={`text-2xl font-bold ${s.sub} uppercase tracking-widest`}
                    >
                      No hay imagen seleccionada
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Decorative corner accents on image */}
            {imageUrl && (
              <>
                <div
                  className={`absolute top-4 left-4 w-12 h-12 border-t-4 border-l-4 border-white/40 rounded-tl-xl`}
                />
                <div
                  className={`absolute top-4 right-4 w-12 h-12 border-t-4 border-r-4 border-white/40 rounded-tr-xl`}
                />
                <div
                  className={`absolute bottom-4 left-4 w-12 h-12 border-b-4 border-l-4 border-white/40 rounded-bl-xl`}
                />
                <div
                  className={`absolute bottom-4 right-4 w-12 h-12 border-b-4 border-r-4 border-white/40 rounded-br-xl`}
                />
              </>
            )}
          </div>

          {/* Caption with enhanced presentation */}
          {caption && (
            <div className="relative w-full max-w-4xl">
              <div
                className={`absolute -inset-4 bg-gradient-to-r ${c.gradient} opacity-5 rounded-2xl blur-xl`}
              />
              <p
                className={`relative text-3xl font-medium ${s.sub} text-center max-w-4xl leading-relaxed px-8 py-6`}
              >
                {caption}
              </p>
            </div>
          )}

          {/* Enhanced Footer Brand */}
          <div className="absolute bottom-10 left-0 right-0 px-20">
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
