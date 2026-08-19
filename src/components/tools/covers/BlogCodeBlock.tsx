import React, { useState } from "react";
import { Highlight, themes } from "prism-react-renderer";
import { type ThemeConfig } from "./types";

interface BlogCodeBlockProps {
  code: string;
  language: string;
  theme?: ThemeConfig;
}

const DARK_PRISM = themes.vsDark;
const LIGHT_PRISM = themes.vsLight;

const WrapIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 7h16" />
    <path d="M4 12h10" />
    <path d="M4 17h6" />
    <path d="M14 17l4-4 4 4" />
  </svg>
);

const NoWrapIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 7h16" />
    <path d="M4 12h16" />
    <path d="M4 17h10" />
    <path d="M17 17l0 0" />
  </svg>
);

export const BlogCodeBlock: React.FC<BlogCodeBlockProps> = ({
  code,
  language,
  theme,
}) => {
  const [wrap, setWrap] = useState(true);

  const prismTheme =
    theme && (theme as any).prismTheme
      ? (theme as any).prismTheme === "light"
        ? LIGHT_PRISM
        : DARK_PRISM
      : DARK_PRISM;

  const headerBg = theme ? "bg-slate-800" : "bg-[#1e1e1e]";
  const bodyBg = theme ? undefined : "bg-[#1e1e1e]";

  return (
    <div className="flex flex-col relative group">
      <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/20 to-cyan-400/20 opacity-20 blur-3xl rounded-[2.5rem] scale-95 group-hover:opacity-30 transition-opacity duration-500" />
      <div className="relative rounded-[2.5rem] bg-gradient-to-tr from-blue-600 to-cyan-400 p-1.5 shadow-2xl">
        <div
          className={`relative rounded-[2.25rem] overflow-hidden border border-white/10 ${bodyBg || "bg-[#1e1e1e]"}`}
        >
          <div
            className={`flex items-center gap-3 px-6 py-4 ${headerBg} border-b border-white/5`}
          >
            <div className="flex gap-2.5">
              <div className="w-3.5 h-3.5 rounded-full bg-red-500 shadow-lg" />
              <div className="w-3.5 h-3.5 rounded-full bg-yellow-500 shadow-lg" />
              <div className="w-3.5 h-3.5 rounded-full bg-green-500 shadow-lg" />
            </div>
            <span
              className={`ml-4 px-3 py-1 rounded-lg text-sm font-mono text-blue-400 bg-blue-500/20 border border-blue-500/30 backdrop-blur-sm`}
            >
              {language}
            </span>

            <button
              type="button"
              onClick={() => setWrap(!wrap)}
              className={`ml-auto flex items-center gap-1.5 px-2 py-1 rounded-lg text-sm font-mono font-bold transition-colors ${
                wrap
                  ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                  : "text-white/40 hover:text-white/70 hover:bg-white/5"
              }`}
              title={wrap ? "Desactivar wrapping" : "Activar wrapping"}
            >
              {wrap ? <WrapIcon /> : <NoWrapIcon />}
              <span>Wrap</span>
            </button>
          </div>

          <div className={`p-6 font-mono text-base bg-black/20 max-h-[400px] ${wrap ? "overflow-y-auto" : "overflow-auto"}`}>
            <Highlight
              theme={prismTheme}
              code={code.trim()}
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
                  className={`${className} ${wrap ? "whitespace-pre-wrap" : "whitespace-pre"}`}
                  style={{ ...style, background: "transparent" }}
                >
                  {tokens.map((line, i) => (
                    <div
                      key={i}
                      {...getLineProps({ line, key: i })}
                      className={`hover:bg-white/5 transition-colors rounded px-2 -mx-2 ${wrap ? "" : "inline-block"}`}
                    >
                      <span className="opacity-30 mr-4 w-6 inline-block text-right select-none text-xs shrink-0">
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

      <div className="absolute top-3 left-3 w-8 h-8 border-t-2 border-l-2 border-white/30 rounded-tl-xl pointer-events-none" />
      <div className="absolute top-3 right-3 w-8 h-8 border-t-2 border-r-2 border-white/30 rounded-tr-xl pointer-events-none" />
      <div className="absolute bottom-3 left-3 w-8 h-8 border-b-2 border-l-2 border-white/30 rounded-bl-xl pointer-events-none" />
      <div className="absolute bottom-3 right-3 w-8 h-8 border-b-2 border-r-2 border-white/30 rounded-br-xl pointer-events-none" />
    </div>
  );
};
