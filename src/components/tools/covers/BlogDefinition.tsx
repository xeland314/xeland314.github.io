import React from "react";
import { ACCENT_COLORS, getThemeStyles, type ThemeConfig } from "./types";
import { useCanvasScale } from "./useCanvasScale";

interface BlogDefinitionProps {
  term: string;
  phonetic: string;
  definition: string;
  theme: ThemeConfig;
  previewWidth?: number;
  previewHeight?: number;
}

export const BlogDefinition: React.FC<BlogDefinitionProps> = ({
  term,
  phonetic,
  definition,
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
          className={`relative overflow-hidden flex flex-col p-16 ${s.bg} ${s.text} shadow-2xl origin-top-left`}
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
              className={`absolute -top-40 -right-40 w-[600px] h-[600px] ${c.bg}/15 rounded-full blur-[150px]`}
            />
            <div
              className={`absolute -bottom-20 -left-20 w-[500px] h-[500px] ${c.bg}/10 rounded-full blur-[120px]`}
            />

            {/* Subtle grid pattern for tech/developer aesthetic */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:48px_48px]" />

            {/* Decorative floating shapes */}
            <div
              className={`absolute top-32 right-32 w-24 h-24 border-4 ${c.border}/20 rounded-2xl rotate-12`}
            />
            <div
              className={`absolute bottom-48 left-24 w-16 h-16 ${c.bg}/20 rounded-full blur-sm`}
            />
          </div>

          {/* Main Content */}
          <div className="relative z-10 w-full max-w-5xl flex flex-col justify-center h-full">
            {/* Decorative Header Label */}
            <div className="flex items-center gap-4 mb-8">
              <div
                className={`w-16 h-16 rounded-2xl ${c.bg}/10 border-2 ${c.border}/30 flex items-center justify-center backdrop-blur-sm`}
              >
                <span className={`text-4xl ${c.textAccent} font-serif`}>❝</span>
              </div>
              <span
                className={`text-2xl font-mono ${s.footer} uppercase tracking-[0.25em] font-bold`}
              >
                Definición
              </span>
            </div>

            {/* Term with massive impact */}
            <h1
              className={`text-[120px] font-black tracking-tighter leading-[0.85] mb-8 ${s.text} drop-shadow-sm`}
            >
              {term}
            </h1>

            {/* Phonetic with modern pill design */}
            {phonetic && (
              <div className="inline-flex items-center gap-4 mb-12">
                <span
                  className={`text-4xl font-mono ${c.textAccent} italic font-medium`}
                >
                  {phonetic}
                </span>
                <div className={`h-px w-32 ${c.bg}/40`} />
              </div>
            )}

            {/* Definition block with premium styling */}
            <div className="relative pl-10">
              {/* Accent border line */}
              <div
                className={`absolute left-0 top-0 bottom-0 w-2 ${c.bg} rounded-full`}
              />

              <div
                className={`relative p-8 rounded-3xl ${s.bg} border border-white/5 backdrop-blur-sm`}
              >
                <p
                  className={`text-5xl font-bold ${s.sub} leading-tight tracking-tight`}
                >
                  {definition}
                </p>
              </div>
            </div>
          </div>

          {/* Enhanced Footer Brand */}
          <div className="absolute bottom-0 left-0 right-0 p-8">
            <div
              className={`flex items-center justify-between py-4 px-8 rounded-2xl ${s.bg} border border-white/10 backdrop-blur-md shadow-lg max-w-4xl mx-auto`}
            >
              <div className="flex items-center gap-4">
                {theme.showLogo && (
                  <div
                    className={`p-1.5 rounded-xl bg-gradient-to-tr ${c.gradient} shadow-lg`}
                  >
                    <img
                      src={theme.logoImage}
                      alt="Logo"
                      className="w-12 h-12 rounded-lg object-cover border-2 border-white/20"
                      loading="lazy"
                    />
                  </div>
                )}
                <div className="flex flex-col">
                  <span
                    className={`${s.footer} font-mono text-xl tracking-[0.2em] font-bold`}
                  >
                    {theme.username}
                  </span>
                </div>
              </div>

              {/* Decorative tech dots */}
              <div className="flex gap-2">
                <div className={`w-3 h-3 rounded-full ${c.bg} animate-pulse`} />
                <div className={`w-3 h-3 rounded-full ${c.bg}/40`} />
                <div className={`w-3 h-3 rounded-full ${c.bg}/20`} />
              </div>
            </div>
          </div>

          {/* Corner accents for framing */}
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
