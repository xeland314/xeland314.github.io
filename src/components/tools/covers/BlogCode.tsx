import React from "react";
import { Highlight, themes } from "prism-react-renderer";
import { ACCENT_COLORS, getThemeStyles, type ThemeConfig } from "./types";
import { useCanvasScale } from "./useCanvasScale";

interface BlogCodeProps {
  title: string;
  code: string;
  language: string;
  theme: ThemeConfig;
  previewWidth?: number;
  previewHeight?: number;
}

export const BlogCode: React.FC<BlogCodeProps> = ({
  title,
  code,
  language,
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
                className={`text-6xl font-black tracking-tight text-center text-white drop-shadow-lg`}
              >
                {title}
              </h1>
            </div>
          </div>

          {/* Enhanced Code Window */}
          <div className="w-full max-h-[650px] flex flex-col mb-12 relative group">
            {/* Window glow effect */}
            <div
              className={`absolute inset-0 bg-gradient-to-tr ${c.gradient} opacity-20 blur-3xl rounded-[2.5rem] scale-95 group-hover:opacity-30 transition-opacity duration-500`}
            />

            {/* Window frame with gradient border */}
            <div
              className={`relative rounded-[2.5rem] bg-gradient-to-tr ${c.gradient} p-1.5 shadow-2xl transform hover:scale-[1.005] transition-transform duration-500`}
            >
              <div
                className={`relative rounded-[2.25rem] overflow-hidden ${s.window} border border-white/10`}
              >
                {/* Window Controls */}
                <div
                  className={`flex items-center gap-3 px-8 py-6 ${s.windowHeader} border-b border-white/5`}
                >
                  <div className="flex gap-3">
                    <div className="w-4 h-4 rounded-full bg-red-500 shadow-lg hover:scale-110 transition-transform cursor-pointer" />
                    <div className="w-4 h-4 rounded-full bg-yellow-500 shadow-lg hover:scale-110 transition-transform cursor-pointer" />
                    <div className="w-4 h-4 rounded-full bg-green-500 shadow-lg hover:scale-110 transition-transform cursor-pointer" />
                  </div>
                  <div
                    className={`ml-4 px-4 py-1.5 rounded-lg ${c.bg}/20 border ${c.border}/30 text-xl font-mono ${c.textAccent} backdrop-blur-sm`}
                  >
                    {language}
                  </div>
                </div>

                {/* Code Content */}
                <div className="flex-1 p-10 overflow-hidden font-mono text-3xl bg-black/20">
                  <Highlight
                    theme={
                      s.prismTheme === "light" ? themes.vsLight : themes.vsDark
                    }
                    code={code}
                    language={language as any}
                  >
                    {({
                      className,
                      style,
                      tokens,
                      getLineProps,
                      getTokenProps,
                    }) => (
                      <pre
                        className={`${className} overflow-hidden`}
                        style={{ ...style, background: "transparent" }}
                      >
                        {tokens.map((line, i) => (
                          <div
                            key={i}
                            {...getLineProps({ line, key: i })}
                            className="hover:bg-white/5 transition-colors rounded px-2 -mx-2"
                          >
                            <span className="opacity-30 mr-6 w-8 inline-block text-right select-none">
                              {i + 1}
                            </span>
                            {line.map((token, key) => (
                              <span
                                key={key}
                                {...getTokenProps({ token, key })}
                              />
                            ))}
                          </div>
                        ))}
                      </pre>
                    )}
                  </Highlight>
                </div>
              </div>
            </div>

            {/* Decorative corner accents on code window */}
            <div
              className={`absolute top-4 left-4 w-12 h-12 border-t-4 border-l-4 border-white/30 rounded-tl-xl pointer-events-none`}
            />
            <div
              className={`absolute top-4 right-4 w-12 h-12 border-t-4 border-r-4 border-white/30 rounded-tr-xl pointer-events-none`}
            />
            <div
              className={`absolute bottom-4 left-4 w-12 h-12 border-b-4 border-l-4 border-white/30 rounded-bl-xl pointer-events-none`}
            />
            <div
              className={`absolute bottom-4 right-4 w-12 h-12 border-b-4 border-r-4 border-white/30 rounded-br-xl pointer-events-none`}
            />
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
