export interface AnimationCard {
  slug: string;
  title: { es: string; en: string };
  description: { es: string; en: string };
  badge: { es: string; en: string };
  gradient: string;
  icon: string;
}

export const ANIMATIONS: AnimationCard[] = [
  {
    slug: "go-channels",
    title: { es: "Go · Buffered Channel", en: "Go · Buffered Channel" },
    description: {
      es: "Productor y consumidor con canales bufferizados",
      en: "Producer & consumer with buffered channels",
    },
    badge: { es: "Go", en: "Go" },
    gradient: "from-cyan-500 to-blue-600",
    icon: `<path d="m17 2 4 4-4 4"/><path d="M3 11v-1a4 4 0 0 1 4-4h14"/><path d="m7 22-4-4 4-4"/><path d="M21 13v1a4 4 0 0 1-4 4H3"/>`,
  },
  {
    slug: "defer-go",
    title: { es: "Go · defer (LIFO)", en: "Go · defer (LIFO)" },
    description: {
      es: "Orden de ejecución de defers en pila",
      en: "LIFO execution order of defers",
    },
    badge: { es: "Go", en: "Go" },
    gradient: "from-sky-500 to-indigo-600",
    icon: `<path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z"/><path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65"/><path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65"/>`,
  },
  {
    slug: "python-decorator",
    title: { es: "Python · Decoradores", en: "Python · Decorators" },
    description: {
      es: "Envolviendo funciones con @decorator",
      en: "Wrapping functions with @decorator",
    },
    badge: { es: "Python", en: "Python" },
    gradient: "from-amber-500 to-orange-600",
    icon: `<path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/>`,
  },
  {
    slug: "python-return-vs-yield",
    title: { es: "Python · return vs yield", en: "Python · return vs yield" },
    description: {
      es: "Generadores y rendimiento de valor",
      en: "Generators and value yielding",
    },
    badge: { es: "Python", en: "Python" },
    gradient: "from-yellow-500 to-amber-600",
    icon: `<path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M21 21v-5h-5"/>`,
  },
  {
    slug: "switch-python-bebidas",
    title: { es: "Python · match/case (Bebidas)", en: "Python · match/case (Drinks)" },
    description: {
      es: "Máquina expendedora con match/case",
      en: "Vending machine with match/case",
    },
    badge: { es: "Python", en: "Python" },
    gradient: "from-emerald-500 to-teal-600",
    icon: `<path d="M17 8h1a4 4 0 1 1 0 8h-1"/><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"/><line x1="6" x2="6" y1="2" y2="4"/><line x1="10" x2="10" y1="2" y2="4"/><line x1="14" x2="14" y1="2" y2="4"/>`,
  },
  {
    slug: "with-in-python",
    title: { es: "Python · with (Context Manager)", en: "Python · with (Context Manager)" },
    description: {
      es: "Gestión garantizada de recursos",
      en: "Guaranteed resource management",
    },
    badge: { es: "Python", en: "Python" },
    gradient: "from-green-500 to-emerald-600",
    icon: `<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/>`,
  },
  {
    slug: "git-merge-rebase",
    title: { es: "Git · Merge vs Rebase", en: "Git · Merge vs Rebase" },
    description: {
      es: "Fusión con commit M1 vs historial lineal",
      en: "Merge commit M1 vs linear history",
    },
    badge: { es: "Git", en: "Git" },
    gradient: "from-purple-500 to-orange-500",
    icon: `<line x1="6" x2="6" y1="3" y2="15"/><circle cx="18" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M18 9a9 9 0 0 1-9 9"/>`,
  },
  {
    slug: "http2-multiplexing",
    title: { es: "HTTP/2 · Multiplexación", en: "HTTP/2 · Multiplexing" },
    description: {
      es: "Frames intercalados vs head-of-line blocking",
      en: "Interleaved frames vs head-of-line blocking",
    },
    badge: { es: "Redes", en: "Networks" },
    gradient: "from-sky-500 to-cyan-400",
    icon: `<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M7 12h10"/><path d="M7 8h4"/><path d="M13 16h4"/>`,
  },
  {
    slug: "http2-hpack",
    title: { es: "HTTP/2 · HPACK", en: "HTTP/2 · HPACK" },
    description: {
      es: "Tablas estática/dinámica + Huffman para headers",
      en: "Static/dynamic tables + Huffman for headers",
    },
    badge: { es: "Redes", en: "Networks" },
    gradient: "from-violet-500 to-fuchsia-500",
    icon: `<path d="M4 7V4h16v3"/><path d="M9 20h6"/><path d="M12 4v16"/>`,
  },
];