export type ThemeMode = "light" | "dark" | "midnight" | "soft" |  "catppuccin" | "ambercat" | "rose" | "blue";

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
  // Catppuccin — pastel suave, Mocha flavour
  catppuccin: {
    bg: "bg-[#1e1e2e]",
    text: "text-[#cdd6f4]",
    sub: "text-[#bac2de]",
    footer: "text-[#585b70]",
    badge: "border-[#313244] bg-[#181825]/80",
    iconBg: "border-[#313244] bg-[#313244]/60",
    card: "bg-[#181825]/70 border-[#313244]",
    window: "border-[#313244] bg-[#11111b]",
    windowHeader: "bg-[#313244]",
    overlay: "#cdd6f4",
    actionBg: "bg-[#313244] border-[#45475a]",
    prismTheme: "dark",
  },
  // Ambercat — cálido técnico, marrones y ámbar quemado
  ambercat: {
    bg: "bg-[#2e1f14]",
    text: "text-[#f9e6c6]",
    sub: "text-[#f1a449]",
    footer: "text-[#8a6040]",
    badge: "border-[#5c3a20] bg-[#3d2510]/80",
    iconBg: "border-[#5c3a20] bg-[#5c3a20]/50",
    card: "bg-[#3d2510]/70 border-[#5c3a20]",
    window: "border-[#5c3a20] bg-[#1e1208]",
    windowHeader: "bg-[#4a2e18]",
    overlay: "#f9e6c6",
    actionBg: "bg-[#4a2e18] border-[#5c3a20]",
    prismTheme: "dark",
  },

  // Rose — vino y rosa oscuro, femenino técnico
  rose: {
    bg: "bg-[#260d14]",
    text: "text-[#fde8f0]",
    sub: "text-[#e699b2]",
    footer: "text-[#7a3d50]",
    badge: "border-[#4d1a28] bg-[#3a1020]/80",
    iconBg: "border-[#4d1a28] bg-[#4d1a28]/50",
    card: "bg-[#3a1020]/70 border-[#4d1a28]",
    window: "border-[#4d1a28] bg-[#1a0810]",
    windowHeader: "bg-[#4d1a28]",
    overlay: "#fde8f0",
    actionBg: "bg-[#3a1020] border-[#4d1a28]",
    prismTheme: "dark",
  },
  // Blue — técnico especializado, slate profundo con sky y emerald
  blue: {
    bg: "bg-[#0f172a]",
    text: "text-slate-100",
    sub: "text-sky-400",
    footer: "text-slate-500",
    badge: "border-blue-900 bg-blue-950/60",
    iconBg: "border-sky-900/50 bg-sky-950/30",
    card: "bg-blue-950/30 border-blue-900/60",
    window: "border-blue-900 bg-[#080f1e]",
    windowHeader: "bg-blue-950",
    overlay: "#f1f5f9",
    actionBg: "bg-blue-950 border-blue-900",
    prismTheme: "dark",
  },
};

export const getThemeStyles = (mode: ThemeMode): ThemeStyles => {
  return THEME_STYLES[mode] || THEME_STYLES.dark;
};

// Mapa de colores hex de fondo para cada tema (para exportación a JPEG)
export const THEME_BG_COLORS: Record<ThemeMode, string> = {
  light: "#ffffff",
  dark: "#0f172a",
  midnight: "#020617",
  soft: "#f8fafc",
  catppuccin: "#1e1e2e",
  ambercat: "#2e1f14",
  rose: "#260d14",
  blue: "#0f172a",
};

export const getThemeBgColor = (mode: ThemeMode): string => {
  return THEME_BG_COLORS[mode] || "#0f172a";
};

export type SlideType =
  | "cover"
  | "step"
  | "comparison"
  | "code"
  | "end"
  | "image"
  | "alert"
  | "metric"
  | "list"
  | "highlight"
  | "timeline"
  | "qna"
  | "poll"
  | "pros-cons"
  | "definition"
  | "myth-fact"
  | "checklist"
  | "tech-stack"
  | "mistakes"
  | "takeaways"
  | "announcement";

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
  imageUrl?: string;
  imageFit?: "contain" | "cover";
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
  rightTitle: string;
  leftItems: string[];
  rightItems: string[];
}

export interface CodeSlideData extends BaseSlideData {
  type: "code";
  title: string;
  language: string;
  code: string;
}

export interface EndSlideData extends BaseSlideData {
  type: "end";
  firstText: string;
  secondText: string;
  description: string;
  likeText: string;
  commentText: string;
  saveText: string;
  finalText: string;
}

export interface ImageSlideData extends BaseSlideData {
  type: "image";
  title: string;
  imageUrl: string;
  caption: string;
  imageFit: "contain" | "cover";
}

export interface AlertSlideData extends BaseSlideData {
  type: "alert";
  title: string;
  description: string;
  alertType: "info" | "warning" | "error" | "success";
}

export interface MetricSlideData extends BaseSlideData {
  type: "metric";
  value: string;
  label: string;
  trend: string | "up" | "down" | "flat";
}

export interface ListSlideData extends BaseSlideData {
  type: "list";
  title: string;
  bulletType: "bullet" | "numbered";
  items: string[];
}

export interface HighlightSlideData extends BaseSlideData {
  type: "highlight";
  text: string;
  author: string;
  authorTitle?: string;
  avatarUrl?: string;
  rating?: number;
}

export interface TimelineEvent {
  date: string;
  title: string;
  description: string;
}

export interface TimelineSlideData extends BaseSlideData {
  type: "timeline";
  title: string;
  events: TimelineEvent[];
}

export interface QnASlideData extends BaseSlideData {
  type: "qna";
  question: string;
  answer: string;
  questionLabel: string;
  answerLabel: string;
}

export interface ProsConsSlideData extends BaseSlideData {
  type: "pros-cons";
  title: string;
  pros: string[];
  cons: string[];
}

export interface DefinitionSlideData extends BaseSlideData {
  type: "definition";
  term: string;
  phonetic: string;
  definition: string;
}

export interface PollSlideData extends BaseSlideData {
  type: "poll";
  question: string;
  options: string[];
  questionLabel: string;
}

export interface MythFactSlideData extends BaseSlideData {
  type: "myth-fact";
  title: string;
  myth: string;
  fact: string;
}

export interface ChecklistSlideData extends BaseSlideData {
  type: "checklist";
  title: string;
  items: { text: string; checked: boolean }[];
}

export interface TechStackSlideData extends BaseSlideData {
  type: "tech-stack";
  title: string;
  items: { name: string; icon: string }[];
  cols: number;
}

export interface MistakesSlideData extends BaseSlideData {
  type: "mistakes";
  title: string;
  badCode: string;
  goodCode: string;
  badLabel: string;
  goodLabel: string;
  language: string;
}

export interface TakeawaysSlideData extends BaseSlideData {
  type: "takeaways";
  title: string;
  items: string[];
}

export interface AnnouncementSlideData extends BaseSlideData {
  type: "announcement";
  badge: string;
  title: string;
  subtitle: string;
  imageUrl?: string;
}

export type SlideData =
  | CoverSlideData
  | StepSlideData
  | ComparisonSlideData
  | CodeSlideData
  | EndSlideData
  | ImageSlideData
  | AlertSlideData
  | MetricSlideData
  | ListSlideData
  | HighlightSlideData
  | TimelineSlideData
  | QnASlideData
  | PollSlideData
  | ProsConsSlideData
  | DefinitionSlideData
  | MythFactSlideData
  | ChecklistSlideData
  | TechStackSlideData
  | MistakesSlideData
  | TakeawaysSlideData
  | AnnouncementSlideData;

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
