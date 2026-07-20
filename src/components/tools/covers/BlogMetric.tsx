import React from "react";
import { ACCENT_COLORS, getThemeStyles, type ThemeConfig } from "./types";
import { useCanvasScale } from "./useCanvasScale";

interface BlogMetricProps {
  value: string;
  label: string;
  trend: string;
  theme: ThemeConfig;
  previewWidth?: number;
  previewHeight?: number;
}

export const BlogMetric: React.FC<BlogMetricProps> = ({
  value,
  label,
  trend,
  theme,
  previewWidth = 1080,
  previewHeight = 1080,
}) => {
  const { canvasRef, wrapperRef } = useCanvasScale(previewWidth, previewHeight);
  const c = ACCENT_COLORS[theme.accent] || ACCENT_COLORS.blue;
  const s = getThemeStyles(theme.mode);

  // Determinar el color y la dirección de la tendencia
  const isPositive = trend.includes('+');
  const isNegative = trend.includes('-');
  const trendColorClass = isPositive ? 'text-emerald-500' : isNegative ? 'text-rose-500' : c.textAccent;
  const trendBgClass = isPositive ? 'bg-emerald-500' : isNegative ? 'bg-rose-500' : c.bg;

  return (
    <div className="flex items-center justify-center overflow-hidden font-sans w-full h-full">
      <div ref={wrapperRef} className="relative">
        <div
          ref={canvasRef}
          data-export-canvas="true"
          className={`relative overflow-hidden flex flex-col items-center justify-center p-20 ${s.bg} ${s.text} shadow-2xl origin-top-left`}
          style={{ width: `${previewWidth}px`, height: `${previewHeight}px`, flexShrink: 0 }}
        >
          {/* Enhanced Background Effects */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {/* Ambient glow orbs */}
            <div className={`absolute -top-40 -left-40 w-[600px] h-[600px] ${c.bg}/15 rounded-full blur-[150px]`} />
            <div className={`absolute -bottom-20 -right-20 w-[500px] h-[500px] ${c.bg}/10 rounded-full blur-[120px]`} />
            <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] ${c.bg}/5 rounded-full blur-[100px]`} />
            
            {/* Subtle grid pattern for dashboard feel */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:48px_48px]" />
            
            {/* Decorative floating shapes */}
            <div className={`absolute top-32 right-32 w-24 h-24 border-4 ${c.border}/20 rounded-2xl rotate-12`} />
            <div className={`absolute bottom-48 left-24 w-16 h-16 ${c.bg}/20 rounded-full blur-sm`} />
          </div>

          <div className="relative z-10 flex flex-col items-center text-center max-w-5xl">
            
            {/* Massive Value with Deep Glow */}
            <div className="relative mb-4 group">
              {/* Outer massive glow */}
              <div className={`absolute inset-0 bg-gradient-to-br ${c.gradient} blur-[100px] opacity-40 group-hover:opacity-60 transition-opacity duration-700`} />
              <span className={`relative text-[180px] font-black tracking-tighter leading-none text-transparent bg-clip-text bg-gradient-to-br ${c.gradient} drop-shadow-2xl select-none`}>
                {value}
              </span>
            </div>
            
            {/* Label with premium typography */}
            <h1 className={`text-6xl font-bold ${s.text} mb-12 max-w-4xl uppercase tracking-widest drop-shadow-md`}>
              {label}
            </h1>

            {/* Premium Trend Ticker */}
            {trend && (
              <div className="relative group">
                {/* Dynamic glow based on trend */}
                <div className={`absolute inset-0 ${trendBgClass} rounded-full blur-xl opacity-30 group-hover:opacity-50 transition-opacity duration-300`} />
                
                <div className={`relative flex items-center gap-4 px-10 py-4 rounded-full border border-white/10 ${s.bg || 'bg-white/5'} backdrop-blur-md shadow-2xl`}>
                  {/* Trend Icon */}
                  <div className={`w-10 h-10 rounded-full ${trendBgClass}/10 flex items-center justify-center`}>
                    {isPositive ? (
                      <svg className={`w-5 h-5 ${trendColorClass}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
                        <path d="M7 17l5-5 5 5M7 7l5 5 5-5" />
                      </svg>
                    ) : isNegative ? (
                      <svg className={`w-5 h-5 ${trendColorClass}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
                        <path d="M7 7l5 5 5-5M7 17l5-5 5 5" />
                      </svg>
                    ) : (
                      <div className={`w-2.5 h-2.5 rounded-full ${trendBgClass}`} />
                    )}
                  </div>
                  
                  <span className={`text-3xl font-mono font-black ${trendColorClass} tracking-tight`}>
                    {trend}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Enhanced Footer Brand */}
          <div className="absolute bottom-12 left-0 right-0 px-20">
            <div className={`flex items-center justify-between py-4 px-8 rounded-2xl ${s.bg || 'bg-black/20'} border border-white/10 backdrop-blur-md shadow-lg max-w-4xl mx-auto`}>
              <div className="flex items-center gap-4">
                <span className={`${s.footer} font-mono text-xl tracking-[0.2em] font-bold uppercase`}>
                  {theme.username}
                </span>
              </div>
              
              <div className="flex items-center gap-4">
                {/* Decorative tech dots */}
                <div className="flex gap-2">
                  <div className={`w-3 h-3 rounded-full ${c.bg} animate-pulse`} />
                  <div className={`w-3 h-3 rounded-full ${c.bg}/40`} />
                  <div className={`w-3 h-3 rounded-full ${c.bg}/20`} />
                </div>
                
                {theme.showLogo && (
                  <div className={`p-1.5 rounded-xl bg-gradient-to-tr ${c.gradient} shadow-md`}>
                    <img
                      src={theme.logoImage}
                      alt="Logo"
                      className="w-10 h-10 rounded-lg object-cover border border-white/20"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Corner decorations for framing */}
          <div className={`absolute top-8 left-8 w-16 h-16 border-t-4 border-l-4 ${c.border}/30 rounded-tl-2xl`} />
          <div className={`absolute top-8 right-8 w-16 h-16 border-t-4 border-r-4 ${c.border}/30 rounded-tr-2xl`} />
          <div className={`absolute bottom-28 left-8 w-16 h-16 border-b-4 border-l-4 ${c.border}/30 rounded-bl-2xl`} />
          <div className={`absolute bottom-28 right-8 w-16 h-16 border-b-4 border-r-4 ${c.border}/30 rounded-br-2xl`} />
        </div>
      </div>
    </div>
  );
};