export interface ToolCard {
  href: string;
  title: { es: string; en: string };
  description: { es: string; en: string };
  badge: { es: string; en: string };
  gradient: string;
  icon: string;
  external?: boolean;
}

export const TOOLS: ToolCard[] = [
  {
    href: "/code-to-img",
    title: { es: "Code to Image", en: "Code to Image" },
    description: {
      es: "Fragmentos en imágenes elegantes",
      en: "Snippets as elegant images",
    },
    badge: { es: "Tool", en: "Tool" },
    gradient: "from-indigo-500 to-blue-600",
    icon: `<path d="m18 16 4-4-4-4"/><path d="m6 8-4 4 4 4"/><path d="m14.5 4-5 16"/>`,
  },
  {
    href: "/cover-creator",
    title: { es: "Cover Creator", en: "Cover Creator" },
    description: {
      es: "Diseña portadas para tus artículos",
      en: "Design covers for your articles",
    },
    badge: { es: "Nuevo", en: "New" },
    gradient: "from-orange-500 to-amber-600",
    icon: `<rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>`,
  },
  {
    href: "/code-to-video",
    title: { es: "Code to Video", en: "Code to Video" },
    description: {
      es: "Animaciones de código para compartir",
      en: "Code animations to share",
    },
    badge: { es: "Beta", en: "Beta" },
    gradient: "from-purple-500 to-indigo-600",
    icon: `<path d="m22 8-6 4 6 4V8Z"/><rect width="14" height="12" x="2" y="6" rx="2" ry="2"/>`,
  },
  {
    href: "/rotador-imagenes",
    title: { es: "Rotador de Imágenes", en: "Image Rotator" },
    description: {
      es: "Gira imágenes con animación y trazado",
      en: "Rotate images with animated tracing",
    },
    badge: { es: "Imágenes", en: "Images" },
    gradient: "from-fuchsia-500 to-pink-600",
    icon: `<path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/>`,
  },
  {
    href: "/dominos",
    title: { es: "Dominós", en: "Dominos" },
    description: {
      es: "Visualizador, solver y patrones de fichas",
      en: "Tile visualizer, solver & patterns",
    },
    badge: { es: "Mini Wiki", en: "Mini Wiki" },
    gradient: "from-red-500 to-rose-600",
    icon: `<rect x="3" y="3" width="18" height="18" rx="3"/><line x1="12" x2="12" y1="3" y2="21"/><circle cx="8" cy="8" r="1"/><circle cx="16" cy="16" r="1"/>`,
  },
  {
    href: "https://xeland314.github.io/chat_analyzer_ui/",
    title: { es: "Chat Analyzer", en: "Chat Analyzer" },
    description: {
      es: "Analiza tus chats de WhatsApp localmente con IA.",
      en: "Analyze your WhatsApp chats locally with AI.",
    },
    badge: { es: "WhatsApp", en: "WhatsApp" },
    gradient: "from-green-500 to-emerald-600",
    icon: `<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>`,
    external: true,
  },
];
