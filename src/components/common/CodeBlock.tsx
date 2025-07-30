import { useState, useEffect } from "react";
import { Highlight, themes } from "prism-react-renderer";
import { useAstroTheme } from "../../hooks/useAstroThemes";

interface CodeBlockProps {
  code: string;
  language?: string;
}

export default function CodeBlock({ code, language = "bash" }: CodeBlockProps) {
  const [isCopied, setIsCopied] = useState(false);
  const { resolvedTheme } = useAstroTheme();
  const [theme, setTheme] = useState(themes.github); // Predeterminado en modo claro

  // Actualiza el tema cuando cambie `resolvedTheme`
  useEffect(() => {
    setTheme(resolvedTheme === "dark" ? themes.vsDark : themes.github);
  }, [resolvedTheme]);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="my-2 relative w-full">
      <div className="relative w-full bg-gray-200 dark:bg-gray-700 rounded-lg p-1 overflow-x-auto">
        <Highlight code={code} language={language} theme={theme}>
          {({ className, style, tokens, getLineProps, getTokenProps }) => (
            <pre
              className={`${className} p-2 text-xs mobile:text-[14px] mobile:p-3 sm:p-4 sm:text-[16px] rounded-md w-max min-w-full`}
              style={{
                ...style,
                backgroundColor: theme.plain.backgroundColor,
              }}
            >
              {tokens.map((line, i) => (
                <div key={i} {...getLineProps({ line })}>
                  {line.map((token, key) => (
                    <span key={key} {...getTokenProps({ token })} />
                  ))}
                </div>
              ))}
            </pre>
          )}
        </Highlight>
      </div>
      <div className="absolute top-2 right-2 z-10">
        <span className="mr-1 text-white bg-blue-600 px-2 py-1 text-xs rounded-sm">
          {language}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          className="px-2 py-1 text-xs bg-blue-600 text-white rounded-sm hover:bg-blue-700 focus:outline-none"
        >
          {isCopied ? "¡Copiado!" : "Copiar"}
        </button>
      </div>
    </div>
  );
}
