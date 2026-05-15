export type ThemeMode = "light" | "dark" | "midnight" | "soft";

export type AccentColor =
  | "blue"
  | "purple"
  | "emerald"
  | "orange"
  | "rose"
  | "yellow"
  | "sky"
  | "indigo"
  | "cyan"
  | "teal"
  | "pink"
  | "slate";

export interface ThemeConfig {
  mode: ThemeMode;
  accent: AccentColor;
  showLogo: boolean;
  logoImage: string;
  username: string;
}

export interface ThemeStyles {
  bg: string;
  text: string;
  sub: string;
  footer: string;
  badge: string;
  iconBg: string;
  card: string;
  window: string;
  windowHeader: string;
  overlay: string;
  actionBg: string;
  prismTheme: "light" | "dark";
}

export const THEME_STYLES: Record<ThemeMode, ThemeStyles> = {
  light: {
    bg: "bg-white",
    text: "text-slate-900",
    sub: "text-slate-600",
    footer: "text-slate-400",
    badge: "border-slate-200 bg-slate-50/80",
    iconBg: "border-slate-200 bg-slate-50",
    card: "bg-slate-50 border-slate-100",
    window: "border-slate-100 bg-[#f5f5f5]",
    windowHeader: "bg-slate-100",
    overlay: "#000000",
    actionBg: "bg-slate-100 border-slate-200",
    prismTheme: "light",
  },
  dark: {
    bg: "bg-slate-900",
    text: "text-white",
    sub: "text-slate-300",
    footer: "text-slate-500",
    badge: "border-slate-700 bg-slate-800/80",
    iconBg: "border-white/10 bg-white/5",
    card: "bg-slate-800/50 border-slate-700",
    window: "border-slate-800 bg-[#1e1e1e]",
    windowHeader: "bg-slate-800",
    overlay: "#ffffff",
    actionBg: "bg-slate-800 border-slate-700",
    prismTheme: "dark",
  },
  midnight: {
    bg: "bg-[#020617]",
    text: "text-white",
    sub: "text-slate-400",
    footer: "text-slate-600",
    badge: "border-blue-900 bg-blue-950/50",
    iconBg: "border-white/5 bg-white/5",
    card: "bg-blue-950/20 border-blue-900/50",
    window: "border-blue-900 bg-blue-950/20",
    windowHeader: "bg-blue-950",
    overlay: "#ffffff",
    actionBg: "bg-slate-800 border-slate-700",
    prismTheme: "dark",
  },
  soft: {
    bg: "bg-[#f8fafc]",
    text: "text-slate-900",
    sub: "text-slate-500",
    footer: "text-slate-400",
    badge: "border-slate-200 bg-slate-100/80",
    iconBg: "border-slate-200 bg-white",
    card: "bg-white border-slate-200",
    window: "border-slate-200 bg-white",
    windowHeader: "bg-slate-50",
    overlay: "#000000",
    actionBg: "bg-slate-100 border-slate-200",
    prismTheme: "light",
  },
};

export const getThemeStyles = (mode: ThemeMode): ThemeStyles => {
  return THEME_STYLES[mode] || THEME_STYLES.dark;
};

export type SlideType = "cover" | "step" | "comparison" | "code" | "end";

export interface BaseSlideData {
  id: string;
  type: SlideType;
}

export interface CoverSlideData extends BaseSlideData {
  type: "cover";
  title: string;
  subtitle: string;
  category: string;
  iconChar: string;
}

export interface StepSlideData extends BaseSlideData {
  type: "step";
  stepNumber: string;
  title: string;
  description: string;
}

export interface ComparisonSlideData extends BaseSlideData {
  type: "comparison";
  title: string;
  leftTitle: string;
  leftItems: string[];
  rightTitle: string;
  rightItems: string[];
}

export interface CodeSlideData extends BaseSlideData {
  type: "code";
  title: string;
  code: string;
  language: string;
}

export interface EndSlideData extends BaseSlideData {
  type: "end";
  username: string;
  firstText: string;
  secondText: string;
  description: string;
  likeText: string;
  commentText: string;
  saveText: string;
  finalText: string;
}

export type SlideData =
  | CoverSlideData
  | StepSlideData
  | ComparisonSlideData
  | CodeSlideData
  | EndSlideData;

export const ACCENT_COLORS = {
  blue: {
    gradient: "from-blue-600 to-cyan-400",
    textAccent: "text-blue-500 dark:text-blue-400",
    bg: "bg-blue-500",
    shadow: "shadow-blue-500/20",
    border: "border-blue-500/30",
  },
  purple: {
    gradient: "from-purple-600 to-pink-500",
    textAccent: "text-purple-500 dark:text-purple-400",
    bg: "bg-purple-500",
    shadow: "shadow-purple-500/20",
    border: "border-purple-500/30",
  },
  emerald: {
    gradient: "from-emerald-600 to-teal-400",
    textAccent: "text-emerald-500 dark:text-emerald-400",
    bg: "bg-emerald-500",
    shadow: "shadow-emerald-500/20",
    border: "border-emerald-500/30",
  },
  orange: {
    gradient: "from-orange-600 to-amber-400",
    textAccent: "text-orange-500 dark:text-orange-400",
    bg: "bg-orange-500",
    shadow: "shadow-orange-500/20",
    border: "border-orange-500/30",
  },
  rose: {
    gradient: "from-rose-600 to-red-400",
    textAccent: "text-rose-500 dark:text-rose-400",
    bg: "bg-rose-500",
    shadow: "shadow-rose-500/20",
    border: "border-rose-500/30",
  },
  yellow: {
    gradient: "from-yellow-500 to-orange-400",
    textAccent: "text-yellow-500 dark:text-yellow-400",
    bg: "bg-yellow-500",
    shadow: "shadow-yellow-500/20",
    border: "border-yellow-500/30",
  },
  sky: {
    gradient: "from-sky-600 to-blue-400",
    textAccent: "text-sky-500 dark:text-sky-400",
    bg: "bg-sky-500",
    shadow: "shadow-sky-500/20",
    border: "border-sky-500/30",
  },
  indigo: {
    gradient: "from-indigo-600 to-purple-400",
    textAccent: "text-indigo-500 dark:text-indigo-400",
    bg: "bg-indigo-500",
    shadow: "shadow-indigo-500/20",
    border: "border-indigo-500/30",
  },
  cyan: {
    gradient: "from-cyan-600 to-emerald-400",
    textAccent: "text-cyan-500 dark:text-cyan-400",
    bg: "bg-cyan-500",
    shadow: "shadow-cyan-500/20",
    border: "border-cyan-500/30",
  },
  teal: {
    gradient: "from-teal-600 to-cyan-400",
    textAccent: "text-teal-500 dark:text-teal-400",
    bg: "bg-teal-500",
    shadow: "shadow-teal-500/20",
    border: "border-teal-500/30",
  },
  pink: {
    gradient: "from-pink-600 to-rose-400",
    textAccent: "text-pink-500 dark:text-pink-400",
    bg: "bg-pink-500",
    shadow: "shadow-pink-500/20",
    border: "border-pink-500/30",
  },
  slate: {
    gradient: "from-slate-600 to-slate-400",
    textAccent: "text-slate-500 dark:text-slate-400",
    bg: "bg-slate-500",
    shadow: "shadow-slate-500/20",
    border: "border-slate-500/30",
  },
};
