import React from "react";
import { ACCENT_COLORS, getThemeStyles, type ThemeConfig } from "./types";
import { useCanvasScale } from "./useCanvasScale";

interface BlogPollProps {
  question: string;
  options: string[];
  questionLabel: string;
  theme: ThemeConfig;
  previewWidth?: number;
  previewHeight?: number;
}

export const BlogPoll: React.FC<BlogPollProps> = ({
  question,
  options,
  questionLabel = "Q",
  theme,
  previewWidth = 1080,
  previewHeight = 1080,
}) => {
  const { canvasRef, wrapperRef } = useCanvasScale(previewWidth, previewHeight);
  const c = ACCENT_COLORS[theme.accent] || ACCENT_COLORS.blue;
  const s = getThemeStyles(theme.mode);

  return (
    <div className="flex items-start justify-center overflow-hidden font-sans w-full h-full">
      <div ref={wrapperRef} className="relative">
        <div
          ref={canvasRef}
          data-export-canvas="true"
          className={`relative overflow-hidden flex flex-col items-center justify-center px-20 py-12 ${s.bg} ${s.text} shadow-2xl origin-top-left`}
          style={{
            width: `${previewWidth}px`,
            height: `${previewHeight}px`,
            flexShrink: 0,
          }}
        >
          {/* 1. Fondo con profundidad y textura sutil */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div
              className={`absolute -top-40 -right-40 w-[500px] h-[500px] ${c.bg}/10 rounded-full blur-[120px]`}
            />
            <div
              className={`absolute -bottom-20 -left-20 w-[400px] h-[400px] ${c.bg}/5 rounded-full blur-[100px]`}
            />
            {/* Patrón de cuadrícula sutil para toque tech/profesional */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:48px_48px]" />
          </div>

          <div className="relative z-10 w-full flex flex-col items-start max-w-4xl space-y-6">
            {/* 2. Sección de Pregunta con mayor impacto visual */}
            <div className="flex items-start gap-6 w-full">
              <div
                className={`flex-shrink-0 w-20 h-20 rounded-2xl ${c.bg}/10 border-2 ${c.border}/30 flex items-center justify-center backdrop-blur-sm shadow-lg`}
              >
                <span
                  className={`text-5xl font-black leading-none ${c.textAccent}`}
                >
                  {questionLabel}
                </span>
              </div>
              <h1
                className={`text-5xl font-bold ${s.text} tracking-tight leading-tight pt-3 drop-shadow-sm`}
              >
                {question}
              </h1>
            </div>

            {/* 3. Divisor con gradiente en lugar de color sólido */}
            <div
              className={`h-1.5 w-64 rounded-full bg-gradient-to-r ${c.gradient} opacity-80 mb-6 shadow-lg`}
            />

            {/* 4. Sección de Opciones con efecto "Glassmorphism" y hover */}
            <div className="w-full space-y-5">
              {options.map((option, index) => (
                <div
                  key={index}
                  className={`group relative flex items-center gap-6 p-6 rounded-2xl border-2 ${c.border}/40 ${s.bg || "bg-white/5"} backdrop-blur-md transition-all duration-300 hover:scale-[1.01] hover:shadow-xl hover:border-opacity-100`}
                >
                  {/* Indicador lateral que aparece al hacer hover */}
                  <div
                    className={`absolute left-0 top-2 bottom-2 w-1.5 ${c.bg} rounded-r-full opacity-0 group-hover:opacity-100 transition-all duration-300`}
                  />

                  <span
                    className={`text-5xl font-black ${c.textAccent} opacity-50 group-hover:opacity-100 transition-all duration-300 min-w-[70px] text-center group-hover:scale-110 transform`}
                  >
                    {String.fromCharCode(65 + index)}
                  </span>

                  <p
                    className={`text-4xl font-medium ${s.text} leading-relaxed`}
                  >
                    {option}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* 5. Footer Brand elevado y consistente con el resto de componentes */}
          <div className="absolute bottom-10 left-0 right-0 px-20">
            <div
              className={`flex items-center justify-between py-4 px-6 rounded-2xl ${s.bg || "bg-black/20"} border border-white/10 backdrop-blur-md shadow-lg max-w-4xl mx-auto`}
            >
              <div className="flex items-center gap-4">
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
                <span
                  className={`${s.footer} font-mono text-3xl tracking-[0.2em] font-bold`}
                >
                  {theme.username}
                </span>
              </div>

              {/* Indicador visual decorativo */}
              <div className="flex gap-2">
                <div
                  className={`w-2.5 h-2.5 rounded-full ${c.bg} animate-pulse`}
                />
                <div className={`w-2.5 h-2.5 rounded-full ${c.bg}/40`} />
                <div className={`w-2.5 h-2.5 rounded-full ${c.bg}/20`} />
              </div>
            </div>
          </div>

          {/* 6. Detalles de esquina para enmarcar el contenido */}
          <div
            className={`absolute top-8 left-8 w-12 h-12 border-t-4 border-l-4 ${c.border}/30 rounded-tl-xl`}
          />
          <div
            className={`absolute top-8 right-8 w-12 h-12 border-t-4 border-r-4 ${c.border}/30 rounded-tr-xl`}
          />
          <div
            className={`absolute bottom-28 left-8 w-12 h-12 border-b-4 border-l-4 ${c.border}/30 rounded-bl-xl`}
          />
          <div
            className={`absolute bottom-28 right-8 w-12 h-12 border-b-4 border-r-4 ${c.border}/30 rounded-br-xl`}
          />
        </div>
      </div>
    </div>
  );
};
