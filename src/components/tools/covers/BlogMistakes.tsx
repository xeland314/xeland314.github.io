import React from "react";
import { Highlight, themes } from "prism-react-renderer";
import { ACCENT_COLORS, getThemeStyles, type ThemeConfig } from "./types";
import { useCanvasScale } from "./useCanvasScale";

interface BlogMistakesProps {
  title: string;
  badCode: string;
  goodCode: string;
  badLabel: string;
  goodLabel: string;
  language: string;
  theme: ThemeConfig;
  previewWidth?: number;
  previewHeight?: number;
}

export const BlogMistakes: React.FC<BlogMistakesProps> = ({
  title,
  badCode,
  goodCode,
  badLabel = "Mal",
  goodLabel = "Bien",
  language = "javascript",
  theme,
  previewWidth = 1080,
  previewHeight = 1080,
}) => {
  const { canvasRef, wrapperRef } = useCanvasScale(previewWidth, previewHeight);
  const c = ACCENT_COLORS[theme.accent] || ACCENT_COLORS.blue;
  const s = getThemeStyles(theme.mode);

  const renderCodeBlock = (code: string, isError: boolean) => (
    <Highlight
      theme={s.prismTheme === "light" ? themes.vsLight : themes.vsDark}
      code={code}
      language={language as any}
    >
      {({ className, style, tokens, getLineProps, getTokenProps }) => (
        <pre className={`${className} overflow-hidden text-xl`} style={{ ...style, background: "transparent" }}>
          {tokens.map((line, i) => (
            <div key={i} {...getLineProps({ line, key: i })} className="hover:bg-white/5 transition-colors rounded px-2 -mx-2">
              <span className="opacity-30 mr-4 w-6 inline-block text-right select-none text-lg">{i + 1}</span>
              {line.map((token, key) => (
                <span key={key} {...getTokenProps({ token, key })} />
              ))}
            </div>
          ))}
        </pre>
      )}
    </Highlight>
  );

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
          <div className="mb-10 relative group w-full max-w-4xl">
            <div className={`absolute inset-0 bg-gradient-to-r ${c.gradient} rounded-3xl blur-xl opacity-40 group-hover:opacity-60 transition-opacity`} />
            <div className={`relative px-10 py-5 rounded-3xl bg-gradient-to-tr ${c.gradient} shadow-2xl`}>
              <h1 className="text-6xl font-black tracking-tight text-center text-white drop-shadow-lg">{title}</h1>
            </div>
          </div>

          {/* Bad Code Block */}
          <div className="w-full max-w-4xl mb-6">
            <div className={`flex items-center gap-4 mb-4 px-2`}>
              <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                <span className="text-red-500 text-xl font-black">✕</span>
              </div>
              <span className="text-3xl font-black text-red-500 uppercase tracking-widest">{badLabel}</span>
            </div>
            <div className={`rounded-3xl ${s.window} border-2 border-red-500/30 overflow-hidden shadow-xl`}>
              <div className={`flex items-center gap-3 px-6 py-4 ${s.windowHeader} border-b border-white/5`}>
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                </div>
                <span className={`ml-3 px-3 py-1 rounded-lg text-sm font-mono ${c.textAccent} ${c.bg}/20 border ${c.border}/30`}>{language}</span>
              </div>
              <div className="p-6 bg-black/20 max-h-[250px] overflow-hidden">
                {renderCodeBlock(badCode, true)}
              </div>
            </div>
          </div>

          {/* Good Code Block */}
          <div className="w-full max-w-4xl">
            <div className={`flex items-center gap-4 mb-4 px-2`}>
              <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <span className="text-emerald-500 text-xl font-black">✓</span>
              </div>
              <span className="text-3xl font-black text-emerald-500 uppercase tracking-widest">{goodLabel}</span>
            </div>
            <div className={`rounded-3xl ${s.window} border-2 border-emerald-500/30 overflow-hidden shadow-xl`}>
              <div className={`flex items-center gap-3 px-6 py-4 ${s.windowHeader} border-b border-white/5`}>
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                </div>
                <span className={`ml-3 px-3 py-1 rounded-lg text-sm font-mono ${c.textAccent} ${c.bg}/20 border ${c.border}/30`}>{language}</span>
              </div>
              <div className="p-6 bg-black/20 max-h-[250px] overflow-hidden">
                {renderCodeBlock(goodCode, false)}
              </div>
            </div>
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
