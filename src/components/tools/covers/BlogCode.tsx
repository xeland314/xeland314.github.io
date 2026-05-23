import React from "react";
import { Highlight, themes } from "prism-react-renderer";
import { ACCENT_COLORS, getThemeStyles, type ThemeConfig } from "./types";
import { useCanvasScale } from "./useCanvasScale";

interface BlogCodeProps {
  title: string;
  code: string;
  language: string;
  theme: ThemeConfig;
}

export const BlogCode: React.FC<BlogCodeProps> = ({
  title,
  code,
  language,
  theme,
}) => {
  const { canvasRef, wrapperRef } = useCanvasScale();
  const c = ACCENT_COLORS[theme.accent] || ACCENT_COLORS.blue;
  const s = getThemeStyles(theme.mode);

  return (
    <div
      className={`flex items-center justify-center overflow-hidden font-sans w-full h-full aspect-square`}
    >
      <div ref={wrapperRef} className="relative">
        <div
          ref={canvasRef}
          data-export-canvas="true"
          className={`relative overflow-hidden flex flex-col items-center p-16 ${s.bg} shadow-2xl origin-top-left`}
          style={{ width: "1080px", height: "1080px", flexShrink: 0 }}
        >
          {/* Header */}
          <h1 className={`text-6xl font-black mb-12 tracking-tight text-center ${s.text}`}>
            {title}
          </h1>

          {/* Code Window */}
          <div className={`w-full max-h-[650px] flex flex-col rounded-[2.5rem] overflow-hidden shadow-2xl border-4 ${s.window} mb-12`}>
            {/* Window Controls */}
            <div className={`flex items-center gap-3 px-8 py-6 ${s.windowHeader}`}>
              <div className="w-4 h-4 rounded-full bg-red-500"></div>
              <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
              <div className="w-4 h-4 rounded-full bg-green-500"></div>
              <div className="ml-4 px-4 py-1 rounded-lg bg-white/10 text-xl font-mono opacity-50">
                {language}
              </div>
            </div>

            {/* Code Content */}
            <div className="flex-1 p-10 overflow-hidden font-mono text-3xl">
              <Highlight
                theme={s.prismTheme === "light" ? themes.vsLight : themes.vsDark}
                code={code}
                language={language as any}
              >
                {({ className, style, tokens, getLineProps, getTokenProps }) => (
                  <pre className={`${className} overflow-hidden`} style={{ ...style, background: "transparent" }}>
                    {tokens.map((line, i) => (
                      <div key={i} {...getLineProps({ line, key: i })}>
                        <span className="opacity-30 mr-6 w-8 inline-block text-right">{i + 1}</span>
                        {line.map((token, key) => (
                          <span key={key} {...getTokenProps({ token, key })} />
                        ))}
                      </div>
                    ))}
                  </pre>
                )}
              </Highlight>
            </div>
          </div>

           {/* Footer Brand */}
           <div className="absolute bottom-10 right-20 flex items-center gap-4">
             <span
              className={`${s.footer} font-mono text-xl tracking-[0.2em] font-bold`}
            >
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
