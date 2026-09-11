import type { MarkerData, TileProvider } from "./types";
import type { IconId } from "./icons";

export function generateId(): string {
  return Math.random().toString(36).slice(2, 9);
}

export function encodeMarkersHash(markers: MarkerData[]): string {
  return btoa(encodeURIComponent(JSON.stringify(markers)));
}

export function decodeMarkersHash(hash: string): MarkerData[] | null {
  try {
    const raw = hash.startsWith("map=") ? hash.slice(4) : hash;
    const data = JSON.parse(decodeURIComponent(atob(raw)));
    if (!Array.isArray(data)) return null;
    const valid = data.filter((m: any) => typeof m.lat === "number" && typeof m.lng === "number");
    if (valid.length === 0) return null;
    return valid.map((m: any) => ({
      id: m.id || generateId(),
      lat: Number(m.lat),
      lng: Number(m.lng),
      title: String(m.title || "Sin título"),
      description: String(m.description || ""),
      icon: (m.icon as IconId) || "map-pin",
      color: m.color || "blue",
    }));
  } catch {
    return null;
  }
}

export function buildShareUrl(pathname: string, origin: string, markers: MarkerData[]): string {
  const encoded = encodeMarkersHash(markers);
  return `${origin}${pathname}#map=${encoded}`;
}

export type StoredPayload = {
  markers: MarkerData[];
  tileProvider: TileProvider;
  showPolyline: boolean;
  selectedIcon: IconId;
  selectedColor: string;
};

export function parseStoredPayload(raw: string | null): Partial<StoredPayload> | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    return parsed;
  } catch {
    return null;
  }
}

export function sanitizeProjectName(name: string, fallback = "mapa"): string {
  const safe = name
    .replace(/[^a-zA-Z0-9\u00C0-\u024F]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 30);
  return safe || fallback;
}

export function buildProjectFilename(
  projectName: string,
  markers: MarkerData[],
  extra: string
): string {
  const safe = sanitizeProjectName(projectName);
  const date = new Date().toISOString().slice(0, 10);
  return `${safe}-${date}-${markers.length}pts-${extra}`;
}
