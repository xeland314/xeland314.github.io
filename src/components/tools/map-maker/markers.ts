import type { MarkerData } from "./types";
import type { IconId } from "./icons";

export function validateMarker(m: any): boolean {
  return typeof m.lat === "number" && typeof m.lng === "number" && !Number.isNaN(m.lat) && !Number.isNaN(m.lng);
}

export function validateLatLng(latStr: string, lngStr: string): { lat: number; lng: number } | null {
  const lat = parseFloat(latStr);
  const lng = parseFloat(lngStr);
  if (Number.isNaN(lat) || Number.isNaN(lng)) return null;
  return { lat, lng };
}

export function reorderMarkers(markers: MarkerData[], id: string, dir: -1 | 1): MarkerData[] {
  const idx = markers.findIndex((m) => m.id === id);
  if (idx < 0) return markers;
  const next = idx + dir;
  if (next < 0 || next >= markers.length) return markers;
  const arr = [...markers];
  const [item] = arr.splice(idx, 1);
  arr.splice(next, 0, item);
  return arr;
}

export function createMarker(
  lat: number,
  lng: number,
  title: string,
  icon: IconId,
  color: string,
  generateId: () => string
): MarkerData {
  return {
    id: generateId(),
    lat: Number(lat.toFixed(6)),
    lng: Number(lng.toFixed(6)),
    title,
    description: "",
    icon,
    color,
  };
}

export function updateMarker(markers: MarkerData[], id: string, patch: Partial<MarkerData>): MarkerData[] {
  return markers.map((m) => (m.id === id ? { ...m, ...patch } : m));
}

export function removeMarker(markers: MarkerData[], id: string): MarkerData[] {
  return markers.filter((m) => m.id !== id);
}

export function duplicateMarker(markers: MarkerData[], marker: MarkerData, generateId: () => string): MarkerData[] {
  return [...markers, { ...marker, id: generateId(), title: marker.title + " (copia)" }];
}

export function parseImportedMarkers(raw: any, generateId: () => string): MarkerData[] {
  let imported: any[] = [];
  if (Array.isArray(raw)) {
    imported = raw;
  } else if (raw?.type === "FeatureCollection" && Array.isArray(raw.features)) {
    imported = raw.features.map((f: any) => ({
      id: generateId(),
      lat: f.geometry.coordinates[1],
      lng: f.geometry.coordinates[0],
      title: f.properties?.title ?? f.properties?.name ?? "Importado",
      description: f.properties?.description ?? "",
      icon: f.properties?.icon ?? "map-pin",
      color: f.properties?.color ?? "blue",
    }));
  } else {
    throw new Error("Formato no reconocido");
  }
  imported = imported.filter(validateMarker);
  if (imported.length === 0) throw new Error("Sin marcadores válidos");
  return imported.map((m) => ({
    id: m.id ?? generateId(),
    lat: Number(m.lat),
    lng: Number(m.lng),
    title: String(m.title ?? "Sin título"),
    description: String(m.description ?? ""),
    icon: (m.icon as IconId) ?? "map-pin",
    color: m.color ?? "blue",
  }));
}
