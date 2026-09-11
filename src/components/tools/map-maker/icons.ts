export type IconId =
  | "map-pin"
  | "flag"
  | "star"
  | "heart"
  | "home"
  | "hotel"
  | "coffee"
  | "utensils"
  | "shopping"
  | "car"
  | "plane"
  | "camera"
  | "mountain"
  | "tree"
  | "waves"
  | "tent"
  | "landmark"
  | "hospital"
  | "graduation"
  | "music"
  | "bike"
  | "gamepad";

export interface IconDef {
  id: IconId;
  label: string;
  svg: string; // inner svg content (paths etc)
}

export const ICONS: IconDef[] = [
  {
    id: "map-pin",
    label: "Pin",
    svg: `<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>`,
  },
  {
    id: "flag",
    label: "Bandera",
    svg: `<path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" x2="4" y1="22" y2="15"/>`,
  },
  {
    id: "star",
    label: "Estrella",
    svg: `<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>`,
  },
  {
    id: "heart",
    label: "Corazón",
    svg: `<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2.08C10.5 3.5 9.5 3 7.5 3A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>`,
  },
  {
    id: "home",
    label: "Casa",
    svg: `<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>`,
  },
  {
    id: "hotel",
    label: "Hotel",
    svg: `<path d="M3 7v13a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V7"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="12" x2="12" y1="11" y2="17"/><line x1="8" x2="8" y1="11" y2="17"/><line x1="16" x2="16" y1="11" y2="17"/>`,
  },
  {
    id: "coffee",
    label: "Café",
    svg: `<path d="M10 2v2"/><path d="M14 2v2"/><path d="M16 8a1 1 0 0 1 1 1v8a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V9a1 1 0 0 1 1-1h14a4 4 0 1 1 0 8h-1"/><path d="M6 2v2"/>`,
  },
  {
    id: "utensils",
    label: "Restaurante",
    svg: `<path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/>`,
  },
  {
    id: "shopping",
    label: "Compras",
    svg: `<path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6Z"/><line x1="3" x2="21" y1="6" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>`,
  },
  {
    id: "car",
    label: "Auto",
    svg: `<path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 12 10s-6.7.6-8.5 1.1C2.7 11.3 2 12.1 2 13v3c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/>`,
  },
  {
    id: "plane",
    label: "Avión",
    svg: `<path d="M17.8 19.2 16 11 2 14l5-5-5-5 14 3-1.8 8.2a1 1 0 0 1-.43.64 1 1 0 0 1-.67.16Z"/>`,
  },
  {
    id: "camera",
    label: "Foto",
    svg: `<path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/>`,
  },
  {
    id: "mountain",
    label: "Montaña",
    svg: `<path d="m8 3 4 8 5-5 5 15H2L8 3z"/>`,
  },
  {
    id: "tree",
    label: "Parque",
    svg: `<path d="M14 15a2 2 0 0 0-2 2v3"/><path d="M14 7a6 6 0 0 0-6 6 3 3 0 0 0 3 3h6a3 3 0 0 0 3-3 6 6 0 0 0-6-6z"/><path d="M7 15a2 2 0 0 0-2 2v3"/>`,
  },
  {
    id: "waves",
    label: "Playa",
    svg: `<path d="M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2v14s-1.5 1-3 1-2.5-1-4-1-2 1-4 1-3-1-3-1V6z"/><path d="M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2"/><path d="M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2"/>`,
  },
  {
    id: "tent",
    label: "Camping",
    svg: `<path d="M3.5 21 14 3 24.5 21a1 1 0 0 1-.87 1.5H4.37a1 1 0 0 1-.87-1.5z"/><path d="M9 21h6"/>`,
  },
  {
    id: "landmark",
    label: "Monumento",
    svg: `<line x1="3" x2="21" y1="22" y2="22"/><line x1="6" x2="6" y1="18" y2="22"/><line x1="10" x2="10" y1="18" y2="22"/><line x1="14" x2="14" y1="18" y2="22"/><line x1="18" x2="18" y1="18" y2="22"/><polygon points="12 2 15 8 9 8 12 2"/><path d="M12 8a4 4 0 0 1 4 4v2H8v-2a4 4 0 0 1 4-4z"/>`,
  },
  {
    id: "hospital",
    label: "Salud",
    svg: `<path d="M12 6v4"/><path d="M14 14h-4"/><path d="M14 18h-4"/><path d="M14 8h-4"/><path d="M18 12h2a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-9a2 2 0 0 1 2-2h2"/><path d="M18 22V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v18"/>`,
  },
  {
    id: "graduation",
    label: "Educación",
    svg: `<path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z"/><path d="M22 10v6"/><path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5"/>`,
  },
  {
    id: "music",
    label: "Música",
    svg: `<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>`,
  },
  {
    id: "bike",
    label: "Bici",
    svg: `<circle cx="5.5" cy="17.5" r="3.5"/><circle cx="18.5" cy="17.5" r="3.5"/><path d="M15 6a1 1 0 1 0 0 2 1 1 0 0 0 0-2zm-3 11.5V14l-3-3 4-3 2 3h2"/>`,
  },
  {
    id: "gamepad",
    label: "Ocio",
    svg: `<line x1="6" x2="10" y1="12" y2="12"/><line x1="8" x2="8" y1="10" y2="14"/><line x1="15" x2="15.01" y1="13" y2="13"/><line x1="18" x2="18.01" y1="11" y2="11"/><rect width="20" height="12" x="2" y="6" rx="2"/>`,
  },
];

export const COLORS = [
  { id: "red", hex: "#ef4444", label: "Rojo" },
  { id: "blue", hex: "#3b82f6", label: "Azul" },
  { id: "green", hex: "#10b981", label: "Verde" },
  { id: "amber", hex: "#f59e0b", label: "Ámbar" },
  { id: "violet", hex: "#8b5cf6", label: "Violeta" },
  { id: "pink", hex: "#ec4899", label: "Rosa" },
  { id: "teal", hex: "#14b8a6", label: "Teal" },
  { id: "orange", hex: "#f97316", label: "Naranja" },
  { id: "slate", hex: "#475569", label: "Gris" },
  { id: "emerald", hex: "#059669", label: "Esmeralda" },
] as const;

export function getColorHex(id: string) {
  return COLORS.find((c) => c.id === id)?.hex ?? COLORS[0].hex;
}

export function createDivIconHtml(iconId: IconId, colorHex: string, mapRotationDeg = 0, markerRotationDeg = 0) {
  const def = ICONS.find((i) => i.id === iconId) ?? ICONS[0];
  // outer pin rota -45 + markerRotation, inner contra-rota para quedar legible (45 - marker - map)
  const outerRotate = -45 + (markerRotationDeg || 0);
  const innerRotate = 45 - (markerRotationDeg || 0) - mapRotationDeg;
  return `
  <div style="
    width:38px;height:38px;
    background:${colorHex};
    border-radius:50% 50% 50% 0;
    transform: rotate(${outerRotate}deg);
    border:2.5px solid white;
    box-shadow:0 2px 8px rgba(0,0,0,0.35);
    display:flex;align-items:center;justify-content:center;
  ">
    <div style="transform: rotate(${innerRotate}deg); display:flex; align-items:center; justify-content:center;">
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        ${def.svg}
      </svg>
    </div>
  </div>`;
}

export function createNumberIconHtml(order: number, colorHex: string, mapRotationDeg = 0, markerRotationDeg = 0) {
  const outerRotate = -45 + (markerRotationDeg || 0);
  const innerRotate = 45 - (markerRotationDeg || 0) - mapRotationDeg;
  return `
  <div style="
    width:38px;height:38px;
    background:${colorHex};
    border-radius:50% 50% 50% 0;
    transform: rotate(${outerRotate}deg);
    border:2.5px solid white;
    box-shadow:0 2px 8px rgba(0,0,0,0.35);
    display:flex;align-items:center;justify-content:center;
  ">
    <div style="transform: rotate(${innerRotate}deg); color:white; font-weight:900; font-size:16px; font-family:ui-monospace,monospace; line-height:1; display:flex; align-items:center; justify-content:center;">
      ${order}
    </div>
  </div>`;
}
