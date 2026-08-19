import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ACCENT_COLORS, getThemeStyles, type ThemeConfig } from "./types";
import { BlogCodeBlock } from "./BlogCodeBlock";

interface BlogMarkdownProps {
  content: string;
  theme: ThemeConfig;
  className?: string;
  prose?: "sm" | "base" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl";
}

export const BlogMarkdown: React.FC<BlogMarkdownProps> = ({
  content,
  theme,
  className = "",
  prose = "4xl",
}) => {
  const c = ACCENT_COLORS[theme.accent] || ACCENT_COLORS.blue;
  const s = getThemeStyles(theme.mode);

  const sizeMap: Record<string, string> = {
    sm: "text-sm",
    base: "text-base",
    lg: "text-lg",
    xl: "text-xl",
    "2xl": "text-2xl",
    "3xl": "text-3xl",
    "4xl": "text-4xl",
    "5xl": "text-5xl",
  };

  return (
    <div className={`markdown-content ${sizeMap[prose]} ${s.text} ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          p: ({ children }) => (
            <p className={`${s.text} leading-relaxed mb-4 last:mb-0`}>
              {children}
            </p>
          ),
          strong: ({ children }) => (
            <strong className="font-black">{children}</strong>
          ),
          em: ({ children }) => (
            <em className="italic">{children}</em>
          ),
          code: ({ children, className: codeClassName }) => {
            const isInline = !codeClassName;
            if (isInline) {
              return (
                <code className={`px-3 py-1 rounded-lg ${c.bg}/15 border ${c.border}/30 font-mono text-[0.9em] ${c.textAccent}`}>
                  {children}
                </code>
              );
            }
            const lang = (codeClassName || "").replace("language-", "");
            const codeString = Array.isArray(children) ? children.join("") : String(children || "");
            return (
              <div className="my-6">
                <BlogCodeBlock code={codeString} language={lang || "text"} theme={theme} />
              </div>
            );
          },
          pre: ({ children }) => <>{children}</>,
          h1: ({ children }) => (
            <h1 className={`text-5xl font-black mb-4 ${s.text} tracking-tight`}>
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className={`text-4xl font-black mb-3 ${s.text} tracking-tight`}>
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className={`text-3xl font-bold mb-2 ${s.text} tracking-tight`}>
              {children}
            </h3>
          ),
          ul: ({ children }) => (
            <ul className="space-y-2 mb-4 last:mb-0">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="space-y-2 mb-4 last:mb-0">{children}</ol>
          ),
          li: ({ children, ...props }) => {
            const checked = (props as any).checked;
            const isTask = typeof checked === "boolean";
            if (isTask) {
              return (
                <li className={`flex items-center gap-4 ${s.text} py-2`}>
                  <span
                    className={`flex-shrink-0 w-8 h-8 rounded-lg border-2 flex items-center justify-center transition-all ${
                      checked
                        ? `bg-gradient-to-br ${c.gradient} border-transparent shadow-lg`
                        : `${c.border}/40 bg-transparent`
                    }`}
                  >
                    {checked && (
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </span>
                  <span className={`flex-1 ${checked ? "opacity-90" : "opacity-70"}`}>
                    {children}
                  </span>
                </li>
              );
            }
            return (
              <li className={`flex items-baseline gap-3 ${s.text}`}>
                <span className={`mt-[0.5em] w-2 h-2 rounded-full ${c.bg} flex-shrink-0`} />
                <span>{children}</span>
              </li>
            );
          },
          a: ({ children, href }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className={`${c.textAccent} underline underline-offset-4 decoration-2 decoration-${theme.accent}-500/30 hover:opacity-80 transition-opacity`}
            >
              {children}
            </a>
          ),
          blockquote: ({ children }) => (
            <div className={`relative pl-6 my-4 border-l-4 ${c.border} ${c.bg}/5 rounded-r-2xl py-4 pr-6`}>
              <div className={`absolute left-0 top-0 bottom-0 w-1 ${c.bg} rounded-full`} />
              <div className={`text-[1.1em] italic ${s.sub}`}>{children}</div>
            </div>
          ),
          hr: () => (
            <div className={`h-px w-full ${c.bg}/20 my-6`} />
          ),
          table: ({ children }) => (
            <div className="overflow-x-auto my-4">
              <table className="w-full border-collapse">
                {children}
              </table>
            </div>
          ),
          th: ({ children }) => (
            <th className={`px-4 py-3 text-left font-black ${s.text} border-b-2 ${c.border}/30`}>
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className={`px-4 py-3 border-b ${c.border}/10 ${s.text}`}>
              {children}
            </td>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};
