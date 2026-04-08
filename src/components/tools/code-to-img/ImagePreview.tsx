import React from "react";
import { Highlight, type Language } from "prism-react-renderer";
import { THEMES } from "./constants";

interface Props {
  exportRef: React.RefObject<HTMLDivElement | null>;
  width: number;
  height: number;
  bgType: "color" | "image";
  bgColor: string;
  bgImage: string;
  bgBlur: number;
  bgOpacity: number;
  padding: number;
  code: string;
  language: Language;
  themeName: keyof typeof THEMES;
  fontSize: number;
  showLineNumbers: boolean;
  showFooter: boolean;
  showLogo: boolean;
  showUsername: boolean;
  username: string;
}

export const ImagePreview: React.FC<Props> = ({
  exportRef,
  width,
  height,
  bgType,
  bgColor,
  bgImage,
  bgBlur,
  bgOpacity,
  padding,
  code,
  language,
  themeName,
  fontSize,
  showLineNumbers,
  showFooter,
  showLogo,
  showUsername,
  username,
}) => {
  return (
    <div className="overflow-auto border border-gray-300 dark:border-gray-700 rounded-2xl bg-gray-200 dark:bg-black p-4 flex justify-start items-start min-h-[600px]">
      <div
        ref={exportRef}
        className="flex-shrink-0"
        style={{
          width: `${width}px`,
          height: `${height}px`,
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          backgroundColor: "#000",
        }}
      >
        {/* CAPA DE FONDO: Aquí se aplican la imagen/color, blur y opacidad */}
        <div
          style={{
            position: "absolute",
            inset: "-20px",
            backgroundColor: bgType === "color" ? bgColor : "transparent",
            backgroundImage:
              bgType === "image" && bgImage ? `url(${bgImage})` : "none",
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: `blur(${bgBlur}px)`,
            opacity: bgOpacity / 100,
            zIndex: 0,
          }}
        />

        {/* OVERLAY SUTIL */}
        <div
          className="absolute inset-0 bg-black/5"
          style={{ zIndex: 1 }}
        ></div>

        {/* CAPA DE CONTENIDO: Código y Marca de agua siempre al 100% */}
        <div
          className="relative w-full h-full flex flex-col items-center justify-center"
          style={{ zIndex: 10 }}
        >
          {/* Marca de Agua */}
          {showFooter && (
            <div className="absolute bottom-6 right-6 flex items-center gap-3 bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 shadow-2xl">
              {showLogo && (
                <img
                  src="/assets/images/logo_v3.png"
                  alt="Logo"
                  className="w-8 h-8 rounded-full border border-white/20"
                  loading="lazy"
                  fetchPriority="auto"
                />
              )}
              {showUsername && (
                <span className="text-white font-bold text-sm tracking-tight">
                  {username}
                </span>
              )}
            </div>
          )}

          <div
            style={{
              padding: `${padding}px`,
              width: "100%",
              display: "flex",
              justifyContent: "center",
            }}
          >
            <Highlight
              theme={THEMES[themeName]}
              code={code}
              language={language}
            >
              {({ className, style, tokens, getLineProps, getTokenProps }) => (
                <pre
                  className={`${className} shadow-2xl overflow-hidden min-w-[300px] w-full`}
                  style={{
                    ...style,
                    fontSize: `${fontSize}px`,
                    fontFamily: '"Fira Code", monospace',
                    lineHeight: "1.5",
                    borderRadius: "0px",
                  }}
                >
                  <div className="bg-white/10 dark:bg-black/20 p-3 flex gap-2 border-b border-white/5">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  </div>
                  <div className="p-6 text-left">
                    {tokens.map((line, i) => (
                      <div
                        key={i}
                        {...getLineProps({ line })}
                        className="table-row"
                      >
                        {showLineNumbers && (
                          <span className="table-cell text-right pr-4 opacity-30 select-none text-xs">
                            {i + 1}
                          </span>
                        )}
                        <span className="table-cell">
                          {line.map((token, key) => (
                            <span key={key} {...getTokenProps({ token })} />
                          ))}
                        </span>
                      </div>
                    ))}
                  </div>
                </pre>
              )}
            </Highlight>
          </div>
        </div>
      </div>
    </div>
  );
};
