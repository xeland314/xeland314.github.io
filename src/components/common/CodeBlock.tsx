import { useState, useEffect } from "react";
import { Highlight, themes } from "prism-react-renderer";

interface CodeBlockReactProps {
  code: string;
  language?: string;
  showLanguage?: boolean;
}

export default function CodeBlockReact({
  code,
  language = "bash",
  showLanguage = false,
}: CodeBlockReactProps) {
  const [isCopied, setIsCopied] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [lang, setLang] = useState<"es" | "en">("es");

  // Detecta el tema leyendo directamente el DOM (class="dark" en <html>)
  useEffect(() => {
    const root = document.documentElement;
    const check = () => setIsDark(root.classList.contains("dark"));
    check();

    const observer = new MutationObserver(check);
    observer.observe(root, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  // Detecta idioma por ruta
  useEffect(() => {
    const currentLang = window.location.pathname.startsWith("/en")
      ? "en"
      : "es";
    setLang(currentLang);
  }, []);

  const T = {
    es: { copy: "Copiar", copied: "¡Copiado!" },
    en: { copy: "Copy", copied: "Copied!" },
  }[lang];

  const theme = isDark ? themes.jettwaveDark : themes.github;

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
              style={{ ...style, backgroundColor: theme.plain.backgroundColor }}
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

      <div className="absolute top-2 right-2 z-10 flex items-center gap-1">
        {showLanguage && (
          <span className="text-white bg-blue-600 px-2 py-1 text-xs rounded-sm">
            {language}
          </span>
        )}
        <button
          type="button"
          onClick={handleCopy}
          className="px-2 py-1 text-xs bg-blue-600 text-white rounded-sm hover:bg-blue-700 focus:outline-none"
        >
          {isCopied ? T.copied : T.copy}
        </button>
      </div>
    </div>
  );
}
