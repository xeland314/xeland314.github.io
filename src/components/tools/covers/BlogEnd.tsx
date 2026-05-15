import React from "react";
import { ACCENT_COLORS, getThemeStyles, type ThemeConfig } from "./types";
import { useCanvasScale } from "./useCanvasScale";

interface BlogEndProps {
  username?: string;
  firstText?: string;
  secondText?: string;
  finalText?: string;
  description?: string;
  likeText?: string;
  commentText?: string;
  saveText?: string;
  theme: ThemeConfig;
}

export const BlogEnd: React.FC<BlogEndProps> = ({
  username = "xeland314",
  firstText = "Thanks for",
  secondText = "Reading!",
  finalText = "Desarrollo • Localización • Código",
  description = "If you like software development and technology, consider following me for more content.",
  likeText = "Like",
  commentText = "Comment",
  saveText = "Save",
  theme,
}) => {
  const { canvasRef, wrapperRef } = useCanvasScale();
  const c = ACCENT_COLORS[theme.accent] || ACCENT_COLORS.blue;
  const s = getThemeStyles(theme.mode);

  return (
    <div
      className={`flex items-center justify-center ${theme.mode === "light" || theme.mode === "soft" ? "bg-gray-100" : "bg-gray-900"} overflow-hidden font-sans w-full`}
    >
      <div ref={wrapperRef} className="relative">
        <div
          ref={canvasRef}
          className={`relative overflow-hidden flex flex-col items-center justify-center p-20 text-center ${s.bg} ${s.text} shadow-2xl origin-top-left`}
          style={{ width: "1080px", height: "1080px", flexShrink: 0 }}
        >
          {/* Background Ambient Blobs */}
          <div
            className={`absolute top-0 left-0 w-96 h-96 ${c.bg}/10 rounded-full blur-[120px]`}
          />
          <div
            className={`absolute bottom-0 right-0 w-96 h-96 ${c.bg}/10 rounded-full blur-[120px]`}
          />

          {theme.showLogo && (
            <div className="relative z-10 mb-10">
              <div
                className={`p-2 bg-gradient-to-tr ${c.gradient} rounded-[2rem] shadow-2xl`}
              >
                <img
                  src={theme.logoImage}
                  alt="logo"
                  className="w-40 h-40 rounded-[1.5rem] bg-[#f8e6c7] object-cover"
                />
              </div>
            </div>
          )}

          <h2 className={`relative z-10 text-6xl font-black mb-12 tracking-tight`}>
            {theme.username}
          </h2>

          <h1 className={`relative z-10 text-7xl font-black leading-tight mb-8`}>
            {firstText} <br />
            <span className={`text-transparent bg-clip-text bg-gradient-to-r ${c.gradient}`}>
              {secondText}
            </span>
          </h1>

          <p className={`relative z-10 text-3xl ${s.sub} max-w-3xl mb-20 leading-relaxed`}>
            {description}
          </p>

          <div className="relative z-10 flex flex-wrap justify-center gap-12">
            <ActionIcon icon="❤️" label={likeText} style={s.actionBg} subStyle={s.footer} />
            <ActionIcon icon="💬" label={commentText} style={s.actionBg} subStyle={s.footer} />
            <div className="flex flex-col items-center gap-4">
              <div className={`w-24 h-24 rounded-full ${s.actionBg} flex items-center justify-center text-5xl border shadow-lg`}>
                <BookmarkIcon />
              </div>
              <span className={`text-2xl ${s.footer} font-bold`}>{saveText}</span>
            </div>
          </div>

          <div className={`absolute bottom-12 ${s.footer} font-mono text-xl tracking-[0.3em] uppercase font-bold`}>
            {finalText}
          </div>
        </div>
      </div>
    </div>
  );
};

const ActionIcon = ({ icon, label, style, subStyle }: { icon: string; label: string; style: string; subStyle: string }) => (
  <div className="flex flex-col items-center gap-4">
    <div className={`w-24 h-24 rounded-full ${style} flex items-center justify-center text-5xl border shadow-lg`}>
      {icon}
    </div>
    <span className={`text-2xl ${subStyle} font-bold`}>{label}</span>
  </div>
);

const BookmarkIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="50"
    height="50"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M17 3a2 2 0 0 1 2 2v15a1 1 0 0 1-1.496.868l-4.512-2.578a2 2 0 0 0-1.984 0l-4.512 2.578A1 1 0 0 1 5 20V5a2 2 0 0 1 2-2z" />
  </svg>
);
