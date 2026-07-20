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
  previewWidth?: number;
  previewHeight?: number;
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
  previewWidth = 1080,
  previewHeight = 1080,
}) => {
  const { canvasRef, wrapperRef } = useCanvasScale(previewWidth, previewHeight);
  const c = ACCENT_COLORS[theme.accent] || ACCENT_COLORS.blue;
  const s = getThemeStyles(theme.mode);

  return (
    <div className="flex items-center justify-center overflow-hidden font-sans w-full h-full">
      <div ref={wrapperRef} className="relative">
        <div
          ref={canvasRef}
          data-export-canvas="true"
          className={`relative overflow-hidden flex flex-col items-center justify-center p-16 ${s.bg} ${s.text} shadow-2xl origin-top-left`}
          style={{ width: `${previewWidth}px`, height: `${previewHeight}px`, flexShrink: 0 }}
        >
          {/* Enhanced Background Effects */}
          <div className="absolute inset-0 overflow-hidden">
            {/* Animated gradient orbs */}
            <div className={`absolute -top-40 -left-40 w-[600px] h-[600px] ${c.bg}/20 rounded-full blur-[150px] animate-pulse`} />
            <div className={`absolute -bottom-40 -right-40 w-[500px] h-[500px] ${c.bg}/15 rounded-full blur-[120px]`} />
            <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] ${c.bg}/10 rounded-full blur-[100px]`} />
            
            {/* Geometric patterns */}
            <div className={`absolute top-20 right-20 w-32 h-32 border-4 ${c.border}/20 rounded-3xl rotate-12`} />
            <div className={`absolute bottom-32 left-16 w-24 h-24 border-4 ${c.border}/15 rounded-full`} />
            <div className={`absolute top-40 right-40 w-16 h-16 ${c.bg}/20 rounded-lg rotate-45`} />
          </div>

          {/* Main Content Container */}
          <div className="relative z-10 w-full max-w-5xl flex flex-col items-center">
            
            {/* Logo with enhanced presentation */}
            {theme.showLogo && (
              <div className="mb-12 relative group">
                <div className={`absolute inset-0 bg-gradient-to-tr ${c.gradient} rounded-[2.5rem] blur-xl opacity-60 group-hover:opacity-80 transition-opacity`} />
                <div className={`relative p-3 bg-gradient-to-tr ${c.gradient} rounded-[2.5rem] shadow-2xl transform hover:scale-105 transition-transform duration-300`}>
                  <div className="relative">
                    <img
                      src={theme.logoImage}
                      alt="logo"
                      className="w-44 h-44 rounded-[2rem] object-cover border-4 border-white/20"
                    />
                    <div className={`absolute -bottom-2 -right-2 w-16 h-16 ${c.bg} rounded-full flex items-center justify-center border-4 border-white shadow-lg`}>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Username badge */}
            <div className={`mb-8 px-8 py-3 rounded-full ${c.bg}/10 border-2 ${c.border}/30 backdrop-blur-sm`}>
              <span className={`text-2xl font-bold ${c.textAccent} tracking-wider`}>
                @{theme.username}
              </span>
            </div>

            {/* Main headline with dynamic typography */}
            <div className="text-center mb-5">
              <h1 className="text-8xl font-black leading-none mb-2">
                <span className={`block text-6xl ${s.sub} mb-2 font-bold`}>{firstText}</span>
                <span className={`text-transparent bg-clip-text bg-gradient-to-r ${c.gradient} drop-shadow-2xl`}>
                  {secondText}
                </span>
              </h1>
              
              {/* Decorative line */}
              <div className="flex items-center justify-center gap-4 mt-8">
                <div className={`h-1 w-24 ${c.bg} rounded-full`} />
                <div className={`w-3 h-3 ${c.bg} rounded-full`} />
                <div className={`h-1 w-24 ${c.bg} rounded-full`} />
              </div>
            </div>

            {/* Description with better styling */}
            <div className={`relative mb-4 max-w-2xl`}>
              <div className={`absolute -inset-4 bg-gradient-to-r ${c.gradient} opacity-5 rounded-3xl blur-xl`} />
              <p className={`relative text-3xl ${s.sub} leading-relaxed text-center font-medium px-8 py-6`}>
                {description}
              </p>
            </div>

            {/* Enhanced Action Buttons */}
            <div className="flex flex-row items-center justify-center gap-12 mb-2">
              <ActionCard 
                icon="❤️" 
                label={likeText} 
                accentColor={c} 
                theme={s}
                delay={0}
              />
              <ActionCard 
                icon="💬" 
                label={commentText} 
                accentColor={c} 
                theme={s}
                delay={100}
              />
              <ActionCard 
                icon={<BookmarkIcon />} 
                label={saveText} 
                accentColor={c} 
                theme={s}
                delay={200}
              />
            </div>
          </div>

          {/* Enhanced Footer */}
          <div className="absolute bottom-0 left-0 right-0 p-8">
            <div className={`flex items-center justify-center gap-3 py-4 px-8 rounded-full ${s.bg} border border-white/10 backdrop-blur-sm max-w-fit mx-auto`}>
              <div className={`w-2 h-2 ${c.bg} rounded-full animate-pulse`} />
              <span className={`${s.footer} font-mono text-xl tracking-[0.3em] uppercase font-bold`}>
                {finalText}
              </span>
            </div>
          </div>

          {/* Corner decorations */}
          <div className={`absolute top-8 left-8 w-20 h-20 border-t-4 border-l-4 ${c.border}/30 rounded-tl-3xl`} />
          <div className={`absolute top-8 right-8 w-20 h-20 border-t-4 border-r-4 ${c.border}/30 rounded-tr-3xl`} />
          <div className={`absolute bottom-24 left-8 w-20 h-20 border-b-4 border-l-4 ${c.border}/30 rounded-bl-3xl`} />
          <div className={`absolute bottom-24 right-8 w-20 h-20 border-b-4 border-r-4 ${c.border}/30 rounded-br-3xl`} />
        </div>
      </div>
    </div>
  );
};

interface ActionCardProps {
  icon: React.ReactNode;
  label: string;
  accentColor: any;
  theme: any;
  delay: number;
}

const ActionCard: React.FC<ActionCardProps> = ({ icon, label, accentColor, theme, delay }) => (
  <div 
    className="group relative"
    style={{ animationDelay: `${delay}ms` }}
  >
    <div className={`absolute inset-0 bg-gradient-to-br ${accentColor.gradient} rounded-3xl blur-xl opacity-0 group-hover:opacity-40 transition-opacity duration-300`} />
    <div className={`relative flex flex-col items-center gap-4 p-6 rounded-3xl ${theme.cardBg}  transform hover:scale-110 hover:-translate-y-2 transition-all duration-300`}>
      <div className={`w-24 h-24 rounded-2xl bg-gradient-to-br ${accentColor.gradient} flex items-center justify-center text-5xl shadow-lg transform group-hover:rotate-12 transition-transform duration-300`}>
        {icon}
      </div>
      <span className={`text-xl ${theme.footer} font-black uppercase tracking-widest`}>
        {label}
      </span>
      <div className={`w-12 h-1 ${accentColor.bg} rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
    </div>
  </div>
);

const BookmarkIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="48"
    height="48"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="text-white"
  >
    <path d="M17 3a2 2 0 0 1 2 2v15a1 1 0 0 1-1.496.868l-4.512-2.578a2 2 0 0 0-1.984 0l-4.512 2.578A1 1 0 0 1 5 20V5a2 2 0 0 1 2-2z" />
  </svg>
);