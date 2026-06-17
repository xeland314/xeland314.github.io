import React from "react";
import { ACCENT_COLORS, getThemeStyles, type ThemeConfig } from "./types";
import { useCanvasScale } from "./useCanvasScale";

interface BlogAlertProps {
  alertType: "info" | "warning" | "error" | "success";
  title: string;
  description: string;
  theme: ThemeConfig;
  previewWidth?: number;
  previewHeight?: number;
}

const ALERT_STYLES = {
  info: {
    icon: "ℹ️",
    bg: "bg-blue-500/10",
    border: "border-blue-500",
    text: "text-blue-500",
  },
  warning: {
    icon: "⚠️",
    bg: "bg-amber-500/10",
    border: "border-amber-500",
    text: "text-amber-500",
  },
  error: {
    icon: "🚫",
    bg: "bg-red-500/10",
    border: "border-red-500",
    text: "text-red-500",
  },
  success: {
    icon: "✅",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500",
    text: "text-emerald-500",
  },
};

export const BlogAlert: React.FC<BlogAlertProps> = ({
  alertType = "info",
  title,
  description,
  theme,
  previewWidth = 1080,
  previewHeight = 1080,
}) => {
  const { canvasRef, wrapperRef } = useCanvasScale(previewWidth, previewHeight);
  const a = ALERT_STYLES[alertType];
  const s = getThemeStyles(theme.mode);

  return (
    <div
      className="flex items-center justify-center overflow-hidden font-sans w-full h-full"
    >
      <div ref={wrapperRef} className="relative">
        <div
          ref={canvasRef}
          data-export-canvas="true"
          className={`relative overflow-hidden flex flex-col items-center justify-center p-20 ${s.bg} ${s.text} shadow-2xl origin-top-left`}
          style={{ width: `${previewWidth}px`, height: `${previewHeight}px`, flexShrink: 0 }}
        >
          <div className={`w-full max-w-4xl p-16 rounded-[4rem] border-4 ${a.bg} ${a.border} flex flex-col items-center text-center shadow-2xl`}>
            <span className="text-9xl mb-12 animate-bounce">{a.icon}</span>
            <h1 className={`text-7xl font-black mb-10 tracking-tight ${a.text} uppercase`}>
              {title}
            </h1>
            <div className={`h-2 w-48 ${a.text.replace('text', 'bg')} rounded-full mb-12 opacity-50`} />
            <p className={`text-4xl font-bold ${s.text} leading-relaxed`}>
              {description}
            </p>
          </div>

          {/* Footer Brand */}
          <div className="absolute bottom-12 flex items-center gap-4">
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
