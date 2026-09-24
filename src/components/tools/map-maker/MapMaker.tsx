import React, { useEffect, useState, useMemo, useRef, useCallback } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMapEvents,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { ICONS, COLORS, getColorHex, createDivIconHtml, createNumberIconHtml, type IconId } from "./icons";
import { getCorrectedLatLng } from "./rotation";
import { RotationControl } from "./RotationControl";
import QRCode from "qrcode";

export type MarkerShape = "pin" | "square" | "circle";
export type MarkerData = {
  id: string;
  lat: number;
  lng: number;
  title: string;
  description: string;
  icon: IconId;
  color: string; // color id
  category?: string;
  shape?: MarkerShape; // pin (lágrima), square, circle
  size?: number; // px 24-52, tamaño visual del marker
};

type TileProvider = "osm" | "voyager" | "dark" | "satellite";

const TILE_PROVIDERS: Record<TileProvider, { url: string; attribution: string; label: string }> = {
  osm: {
    label: "OpenStreetMap",
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  },
  voyager: {
    label: "Claro (Voyager)",
    url: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
    attribution: '&copy; CARTO & OSM',
  },
  dark: {
    label: "Oscuro",
    url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    attribution: '&copy; CARTO & OSM',
  },
  satellite: {
    label: "Satélite",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution: "Esri &mdash; &copy; Esri",
  },
};

const STORAGE_KEY = "custom-map-maker:v2";
const PROJECTS_KEY = "custom-map-projects:v1";
const DEFAULT_GEOAPIFY_KEY = "d4d5a2e38d934da287b79d360de83e5d";
const EXPORT_PRESETS: Record<string, { label: string; w: number | null; h: number | null; aspect: string }> = {
  "1920x1080": { label: "Full HD 1920×1080 (16:9)", w: 1920, h: 1080, aspect: "16/9" },
  "1350x1080": { label: "1350×1080 (5:4)", w: 1350, h: 1080, aspect: "5/4" },
  "A4": { label: "A4 2480×3508 (300dpi) vertical", w: 2480, h: 3508, aspect: "210/297" },
  "A4-land": { label: "A4 horizontal 3508×2480", w: 3508, h: 2480, aspect: "297/210" },
  "1080x1080": { label: "Cuadrado 1080×1080 (1:1)", w: 1080, h: 1080, aspect: "1/1" },
  "actual": { label: "Tamaño actual del mapa", w: null, h: null, aspect: "auto" },
};
const PDF_PAGE_SIZES: Record<string, { wPt: number; hPt: number; label: string }> = {
  "1920x1080": { wPt: 1440, hPt: 810, label: "1920×1080 px → 1440×810 pt (16:9)" },
  "1350x1080": { wPt: 1012.5, hPt: 810, label: "1350×1080 px → 1013×810 pt (5:4)" },
  "A4": { wPt: 595.28, hPt: 841.89, label: "A4 vertical 595×842 pt" },
  "A4-land": { wPt: 841.89, hPt: 595.28, label: "A4 horizontal 842×595 pt" },
  "1080x1080": { wPt: 810, hPt: 810, label: "Cuadrado 810×810 pt" },
};

export type MapProject = {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  markers: MarkerData[];
  tileProvider: TileProvider;
  showPolyline: boolean;
};

function generateId() {
  return Math.random().toString(36).slice(2, 9);
}

function MapClickHandler({ onAdd, rotationDeg }: { onAdd: (lat: number, lng: number) => void; rotationDeg: number }) {
  const map = useMap();
  useMapEvents({
    click(e) {
      const target = e.originalEvent?.target as HTMLElement | null;
      if (target?.closest?.(".leaflet-marker-icon, .leaflet-popup, .leaflet-control, .leaflet-interactive")) return;
      // Siempre corrige por el wrapper 200% (incluso a 0° el contenedor está desplazado)
      try {
        const orig = e.originalEvent as MouseEvent;
        if (orig?.clientX != null && orig?.clientY != null) {
          const corrected = getCorrectedLatLng(map, orig.clientX, orig.clientY, rotationDeg);
          onAdd(corrected.lat, corrected.lng);
          return;
        }
      } catch {}
      onAdd(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function FitBounds({ markers }: { markers: MarkerData[] }) {
  const map = useMap();
  const prevRef = useRef<string>("");
  // expose fit function via custom event? we will call manually from parent via map instance
  useEffect(() => {
    // no auto fit, only when requested
  }, []);
  return null;
}

function createClusterIconHtml(count: number) {
  const bg = count > 20 ? "#dc2626" : count > 10 ? "#ea580c" : count > 5 ? "#7c3aed" : "#059669";
  return `<div style="width:42px;height:42px;border-radius:50%;background:${bg};border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.35);display:flex;align-items:center;justify-content:center;color:white;font-weight:900;font-size:13px;font-family:monospace;transform:translate(-1px,-1px)">${count}</div>`;
}

function ClusteredMarkers({
  markers,
  clusterEnabled,
  spiderClusterId,
  setSpiderClusterId,
  iconsMemo,
  showNumberInsteadOfIcon,
  rotationDeg,
  mapRef,
  setMarkers,
  setSelectedId,
  startEdit,
  getColorHex,
  createDivIconHtml,
  createNumberIconHtml,
  globalMarkerSize,
}: {
  markers: MarkerData[];
  clusterEnabled: boolean;
  spiderClusterId: string | null;
  setSpiderClusterId: (id: string | null) => void;
  iconsMemo: Map<string, L.DivIcon>;
  showNumberInsteadOfIcon: boolean;
  rotationDeg: number;
  mapRef: React.MutableRefObject<L.Map | null>;
  setMarkers: React.Dispatch<React.SetStateAction<MarkerData[]>>;
  setSelectedId: (id: string | null) => void;
  startEdit: (m: MarkerData) => void;
  getColorHex: (c: string) => string;
  createDivIconHtml: any;
  createNumberIconHtml: any;
  globalMarkerSize: number;
}) {
  const map = useMap();
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const upd = () => setTick((t) => t + 1);
    map.on("zoomend", upd);
    map.on("moveend", upd);
    upd();
    return () => { try { map.off("zoomend", upd); map.off("moveend", upd); } catch {} };
  }, [map]);

  // si clustering desactivado o pocos puntos, render simple
  if (!clusterEnabled || markers.length <= 1) {
    // fallback render sin cluster (usará misma lógica que abajo pero sin agrupar)
    return (
      <>
        {markers.map((m, idx) => {
          const shape = (m.shape ?? "pin") as MarkerShape;
          const size = Math.max(24, Math.min(52, m.size ?? globalMarkerSize ?? 38));
          const iconKey = showNumberInsteadOfIcon ? `${idx}-${m.color}-${rotationDeg}-${shape}-${size}` : `${m.icon}-${m.color}-${rotationDeg}-${shape}-${size}`;
          const anchor = shape === "pin" ? [size / 2, size] : [size / 2, size / 2];
          const icon = iconsMemo.get(iconKey) || L.divIcon({ html: showNumberInsteadOfIcon ? createNumberIconHtml(idx + 1, getColorHex(m.color), rotationDeg, shape, size) : createDivIconHtml(m.icon, getColorHex(m.color), rotationDeg, shape, size), className: "custom-div-icon", iconSize: [size, size], iconAnchor: anchor as any, popupAnchor: shape === "pin" ? [0, -size] : [0, -size / 2] });
          return (
            <Marker
              key={m.id}
              position={[m.lat, m.lng]}
              icon={icon}
              draggable
              eventHandlers={{
                dragend: (e: any) => {
                  let { lat, lng } = e.target.getLatLng();
                  if (e.originalEvent && mapRef.current) {
                    try {
                      const orig = e.originalEvent as unknown as MouseEvent;
                      const cx = (orig as any).clientX ?? (e as any).originalEvent?.clientX;
                      const cy = (orig as any).clientY ?? (e as any).originalEvent?.clientY;
                      if (cx != null && cy != null) {
                        const c = getCorrectedLatLng(mapRef.current, cx, cy, rotationDeg);
                        lat = c.lat; lng = c.lng;
                      }
                    } catch {}
                  }
                  setMarkers((prev) => prev.map((x) => (x.id === m.id ? { ...x, lat: Number(lat.toFixed(6)), lng: Number(lng.toFixed(6)) } : x)));
                  setSelectedId(m.id);
                },
                click: () => setSelectedId(m.id),
                popupopen: (e: any) => {
                  const mp = e.target._map as L.Map; if (!mp) return;
                  try { const px = mp.project(e.target.getLatLng(), mp.getZoom()); px.y -= 110; const ll = mp.unproject(px, mp.getZoom()); mp.panTo(ll, { animate: true, duration: 0.4 }); } catch {}
                },
              }}
            >
              <Popup autoPan={false}>
                <div className="min-w-[180px]">
                  <p className="font-black text-slate-900 text-sm flex items-center gap-2">
                    {showNumberInsteadOfIcon ? <span className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-black border-2 border-white shadow" style={{ background: getColorHex(m.color) }}>{idx + 1}</span> : <span className="w-7 h-7 rounded-full flex items-center justify-center border-2 border-white shadow" style={{ background: getColorHex(m.color) }}><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><g dangerouslySetInnerHTML={{ __html: (ICONS.find((x) => x.id === m.icon)?.svg ?? ICONS[0].svg) }} /></svg></span>}
                    {m.title}
                  </p>
                  {m.description && <p className="text-xs text-slate-600 mt-1">{m.description}</p>}
                  <p className="text-[11px] font-mono text-slate-400 mt-1">{m.lat.toFixed(6)}, {m.lng.toFixed(6)}</p>
                  <div className="flex gap-1 mt-2">
                    <a href={`https://www.google.com/maps/search/?api=1&query=${m.lat},${m.lng}`} target="_blank" rel="noopener noreferrer" className="text-[11px] font-bold bg-slate-900 text-white px-2 py-1 rounded-lg">Google Maps</a>
                    <button onClick={() => startEdit(m)} className="text-[11px] font-bold bg-white border border-slate-200 px-2 py-1 rounded-lg">Editar</button>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </>
    );
  }

  // clustering por distancia pixel (no altera lat/lng original)
  const threshold = 56;
  let clusters: { id: string; lat: number; lng: number; members: { m: MarkerData; idx: number }[] }[] = [];
  const visited = new Set<string>();
  // usar tick para forzar recompute en zoom/move (map.project depende de zoom)
  void tick;
  try {
    for (let i = 0; i < markers.length; i++) {
      const mi = markers[i];
      if (visited.has(mi.id)) continue;
      const pi = map.latLngToContainerPoint([mi.lat, mi.lng] as any);
      const group: { m: MarkerData; idx: number }[] = [{ m: mi, idx: i }];
      visited.add(mi.id);
      for (let j = i + 1; j < markers.length; j++) {
        const mj = markers[j];
        if (visited.has(mj.id)) continue;
        const pj = map.latLngToContainerPoint([mj.lat, mj.lng] as any);
        const dist = Math.hypot(pi.x - pj.x, pi.y - pj.y);
        if (dist < threshold) {
          // también considera distancia geográfica muy pequeña aunque en pixel lejos por zoom bajo -> igual agrupa
          group.push({ m: mj, idx: j });
          visited.add(mj.id);
        }
      }
      if (group.length === 1) {
        clusters.push({ id: mi.id, lat: mi.lat, lng: mi.lng, members: group });
      } else {
        const avgLat = group.reduce((s, g) => s + g.m.lat, 0) / group.length;
        const avgLng = group.reduce((s, g) => s + g.m.lng, 0) / group.length;
        const cid = `c-${group.map((g) => g.m.id).join("-")}`;
        clusters.push({ id: cid, lat: avgLat, lng: avgLng, members: group });
      }
    }
  } catch {
    clusters = markers.map((m, idx) => ({ id: m.id, lat: m.lat, lng: m.lng, members: [{ m, idx }] }));
  }

  return (
    <>
      {clusters.map((c) => {
        if (c.members.length === 1) {
          const { m, idx } = c.members[0];
          const shape = (m.shape ?? "pin") as MarkerShape;
          const size = Math.max(24, Math.min(52, m.size ?? globalMarkerSize ?? 38));
          const iconKey = showNumberInsteadOfIcon ? `${idx}-${m.color}-${rotationDeg}-${shape}-${size}` : `${m.icon}-${m.color}-${rotationDeg}-${shape}-${size}`;
          const anchor = shape === "pin" ? [size / 2, size] : [size / 2, size / 2];
          const icon = iconsMemo.get(iconKey) || L.divIcon({ html: showNumberInsteadOfIcon ? createNumberIconHtml(idx + 1, getColorHex(m.color), rotationDeg, shape, size) : createDivIconHtml(m.icon, getColorHex(m.color), rotationDeg, shape, size), className: "custom-div-icon", iconSize: [size, size], iconAnchor: anchor as any, popupAnchor: shape === "pin" ? [0, -size] : [0, -size / 2] });
          return (
            <Marker
              key={m.id}
              position={[m.lat, m.lng]}
                icon={icon}
                draggable
                eventHandlers={{
                  dragend: (e: any) => {
                    let { lat, lng } = e.target.getLatLng();
                    if (e.originalEvent && mapRef.current) {
                      try {
                        const orig = e.originalEvent as unknown as MouseEvent;
                        const cx = (orig as any).clientX ?? (e as any).originalEvent?.clientX;
                        const cy = (orig as any).clientY ?? (e as any).originalEvent?.clientY;
                        if (cx != null && cy != null) { const corr = getCorrectedLatLng(mapRef.current, cx, cy, rotationDeg); lat = corr.lat; lng = corr.lng; }
                      } catch {}
                    }
                    setMarkers((prev) => prev.map((x) => (x.id === m.id ? { ...x, lat: Number(lat.toFixed(6)), lng: Number(lng.toFixed(6)) } : x)));
                    setSelectedId(m.id);
                  },
                  click: () => setSelectedId(m.id),
                  popupopen: (e: any) => { const mp = e.target._map as L.Map; if (!mp) return; try { const px = mp.project(e.target.getLatLng(), mp.getZoom()); px.y -= 110; const ll = mp.unproject(px, mp.getZoom()); mp.panTo(ll, { animate: true, duration: 0.4 }); } catch {} },
                }}
              >
                <Popup autoPan={false}>
                  <div className="min-w-[180px]">
                    <p className="font-black text-slate-900 text-sm flex items-center gap-2">
                      {showNumberInsteadOfIcon ? <span className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-black border-2 border-white shadow" style={{ background: getColorHex(m.color) }}>{idx + 1}</span> : <span className="w-7 h-7 rounded-full flex items-center justify-center border-2 border-white shadow" style={{ background: getColorHex(m.color) }}><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><g dangerouslySetInnerHTML={{ __html: (ICONS.find((x) => x.id === m.icon)?.svg ?? ICONS[0].svg) }} /></svg></span>}
                      {m.title}
                    </p>
                    {m.description && <p className="text-xs text-slate-600 mt-1">{m.description}</p>}
                    <p className="text-[11px] font-mono text-slate-400 mt-1">{m.lat.toFixed(6)}, {m.lng.toFixed(6)}</p>
                    <div className="flex gap-1 mt-2"><a href={`https://www.google.com/maps/search/?api=1&query=${m.lat},${m.lng}`} target="_blank" rel="noopener noreferrer" className="text-[11px] font-bold bg-slate-900 text-white px-2 py-1 rounded-lg">Google Maps</a><button onClick={() => startEdit(m)} className="text-[11px] font-bold bg-white border border-slate-200 px-2 py-1 rounded-lg">Editar</button></div>
                  </div>
                </Popup>
              </Marker>
          );
        }
        // cluster con >1
        if (spiderClusterId === c.id) {
          // spiderfy: distribuir en círculo sin alterar coordenadas originales (solo visual)
          const n = c.members.length;
          const radiusDeg = 0.00018 + n * 0.00003; // ~20m + por cada punto
          const spiderMarkers = c.members.map(({ m, idx }, i) => {
            const angle = (2 * Math.PI * i) / n - Math.PI / 2;
            const latOff = Math.cos(angle) * radiusDeg;
            const lngOff = Math.sin(angle) * radiusDeg / Math.cos((c.lat * Math.PI) / 180 || 1);
            const sLat = c.lat + latOff;
            const sLng = c.lng + lngOff;
            const shape = (m.shape ?? "pin") as MarkerShape;
            const size = Math.max(24, Math.min(52, (m as any).size ?? globalMarkerSize ?? 38));
            const iconKey = showNumberInsteadOfIcon ? `${idx}-${m.color}-${rotationDeg}-${shape}-${size}` : `${m.icon}-${m.color}-${rotationDeg}-${shape}-${size}`;
            const anchor = shape === "pin" ? [size / 2, size] : [size / 2, size / 2];
            const icon = iconsMemo.get(iconKey) || L.divIcon({ html: showNumberInsteadOfIcon ? createNumberIconHtml(idx + 1, getColorHex(m.color), rotationDeg, shape, size) : createDivIconHtml(m.icon, getColorHex(m.color), rotationDeg, shape, size), className: "custom-div-icon", iconSize: [size, size], iconAnchor: anchor as any, popupAnchor: shape === "pin" ? [0, -size] : [0, -size / 2] });
            return (
              <Marker
                key={`${c.id}-${m.id}`}
                position={[sLat, sLng]}
                icon={icon}
                draggable
                eventHandlers={{
                  dragend: (e: any) => {
                    let { lat, lng } = e.target.getLatLng();
                    if (e.originalEvent && mapRef.current) {
                      try { const orig = e.originalEvent as unknown as MouseEvent; const cx = (orig as any).clientX ?? (e as any).originalEvent?.clientX; const cy = (orig as any).clientY ?? (e as any).originalEvent?.clientY; if (cx != null && cy != null) { const corr = getCorrectedLatLng(mapRef.current, cx, cy, rotationDeg); lat = corr.lat; lng = corr.lng; } } catch {}
                    }
                    setMarkers((prev) => prev.map((x) => (x.id === m.id ? { ...x, lat: Number(lat.toFixed(6)), lng: Number(lng.toFixed(6)) } : x)));
                    setSelectedId(m.id); setSpiderClusterId(null);
                  },
                  click: () => setSelectedId(m.id),
                }}
              >
                <Popup autoPan={false}>
                  <div className="min-w-[180px]">
                    <p className="text-[10px] font-mono text-amber-600">Desagrupado visual • original: {m.lat.toFixed(6)}, {m.lng.toFixed(6)}</p>
                    <p className="font-black text-slate-900 text-sm flex items-center gap-2">
                      {showNumberInsteadOfIcon ? <span className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-black border-2 border-white shadow" style={{ background: getColorHex(m.color) }}>{idx + 1}</span> : <span className="w-7 h-7 rounded-full flex items-center justify-center border-2 border-white shadow" style={{ background: getColorHex(m.color) }}><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><g dangerouslySetInnerHTML={{ __html: (ICONS.find((x) => x.id === m.icon)?.svg ?? ICONS[0].svg) }} /></svg></span>}
                      {m.title}
                    </p>
                    {m.description && <p className="text-xs text-slate-600 mt-1">{m.description}</p>}
                    <div className="flex gap-1 mt-2"><a href={`https://www.google.com/maps/search/?api=1&query=${m.lat},${m.lng}`} target="_blank" rel="noopener noreferrer" className="text-[11px] font-bold bg-slate-900 text-white px-2 py-1 rounded-lg">Google Maps</a><button onClick={() => startEdit(m)} className="text-[11px] font-bold bg-white border border-slate-200 px-2 py-1 rounded-lg">Editar</button></div>
                  </div>
                </Popup>
                <Polyline positions={[[c.lat, c.lng] as any, [sLat, sLng] as any]} pathOptions={{ color: "#64748b", weight: 1.5, opacity: 0.6, dashArray: "4 4" }} />
              </Marker>
            );
          });
          // also show center dot
          return (
            <React.Fragment key={c.id}>
              <Marker position={[c.lat, c.lng]} icon={L.divIcon({ html: `<div style="width:10px;height:10px;border-radius:50%;background:#334155;border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.4)"></div>`, className: "custom-div-icon", iconSize: [10, 10], iconAnchor: [5, 5] })} eventHandlers={{ click: () => setSpiderClusterId(null) } as any} />
              {spiderMarkers}
            </React.Fragment>
          );
        }
        const clusterIcon = L.divIcon({ html: createClusterIconHtml(c.members.length), className: "custom-div-icon", iconSize: [42, 42], iconAnchor: [21, 21] });
        return (
          <Marker
            key={c.id}
            position={[c.lat, c.lng]}
            icon={clusterIcon}
            eventHandlers={{
              click: () => {
                const z = map.getZoom();
                const maxZ = map.getMaxZoom ? map.getMaxZoom() : 18;
                if (z >= 18 || z >= maxZ - 1) {
                  setSpiderClusterId(c.id);
                } else {
                  try {
                    const bounds = L.latLngBounds(c.members.map(({ m }) => [m.lat, m.lng] as any));
                    // si bounds es punto, haz zoom
                    if (bounds.getSouthWest().equals(bounds.getNorthEast())) {
                      map.setView([c.lat, c.lng], Math.min(z + 3, 18), { animate: true });
                    } else {
                      map.fitBounds(bounds.pad(0.35), { animate: true, maxZoom: 18 });
                    }
                  } catch {}
                }
              },
            }}
          >
            <Popup autoPan={false}>
              <div className="min-w-[200px]">
                <p className="font-black text-slate-900 text-sm">{c.members.length} puntos amontonados</p>
                <p className="text-xs text-slate-500">Haz clic para ampliar {map.getZoom() >= 18 ? "• desagrupar visual" : "• zoom"} — sin mover coordenadas originales</p>
                <ul className="mt-2 max-h-32 overflow-auto divide-y divide-slate-100 text-xs">
                  {c.members.map(({ m, idx }) => (
                    <li key={m.id} className="py-1 flex items-center gap-2"><span className="font-mono text-[11px] bg-slate-900 text-white px-1.5 py-0.5 rounded-full">{idx + 1}</span><span className="truncate flex-1">{m.title}</span><button onClick={() => { map.setView([m.lat, m.lng], 18); setSelectedId(m.id); }} className="text-[11px] font-bold text-emerald-600">Ver</button></li>
                  ))}
                </ul>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </>
  );
}

function IconPreview({ icon, color }: { icon: IconId; color: string }) {
  const def = ICONS.find((i) => i.id === icon) ?? ICONS[0];
  const hex = getColorHex(color);
  return (
    <span
      className="w-8 h-8 rounded-full flex items-center justify-center border-2 border-white shadow"
      style={{ background: hex }}
      title={def.label}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* eslint-disable-next-line react/no-danger */}
        <g dangerouslySetInnerHTML={{ __html: def.svg }} />
      </svg>
    </span>
  );
}

export const MapMaker = () => {
  const [markers, setMarkers] = useState<MarkerData[]>(() => {
    // sample 2 markers: Quito
    return [
      {
        id: "1",
        lat: -0.180653,
        lng: -78.467834,
        title: "Mitad del Mundo",
        description: "Monumento ecuatorial - ejemplo",
        icon: "landmark",
        color: "red",
        shape: "pin",
        size: 38,
      },
      {
        id: "2",
        lat: -0.209,
        lng: -78.489,
        title: "Parque La Carolina",
        description: "Parque urbano ideal para correr",
        icon: "tree",
        color: "emerald",
        shape: "pin",
        size: 38,
      },
    ];
  });

  const [selectedIcon, setSelectedIcon] = useState<IconId>("map-pin");
  const [selectedColor, setSelectedColor] = useState<string>("blue");
  const [selectedShape, setSelectedShape] = useState<MarkerShape>("pin");
  const [selectedSize, setSelectedSize] = useState<number>(38);
  const [globalMarkerSize, setGlobalMarkerSize] = useState<number>(38);
  const [tileProvider, setTileProvider] = useState<TileProvider>("osm");
  const [showPolyline, setShowPolyline] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftTitle, setDraftTitle] = useState("");
  const [draftDesc, setDraftDesc] = useState("");
  const [draftIcon, setDraftIcon] = useState<IconId>("map-pin");
  const [draftColor, setDraftColor] = useState<string>("blue");
  const [draftLat, setDraftLat] = useState<string>("");
  const [draftLng, setDraftLng] = useState<string>("");
  const [draftShape, setDraftShape] = useState<MarkerShape>("pin");
  const [draftSize, setDraftSize] = useState<string>("38");
  const [newTitle, setNewTitle] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);
  const [geoapifyToken, setGeoapifyToken] = useState(DEFAULT_GEOAPIFY_KEY);
  const [geoapifyInput, setGeoapifyInput] = useState(DEFAULT_GEOAPIFY_KEY);
  const [showToken, setShowToken] = useState(false);
  const [routeMode, setRouteMode] = useState<"drive" | "walk" | "bicycle">("drive");
  const [optimizeStops, setOptimizeStops] = useState(false);
  const [routeColor, setRouteColor] = useState("#7c3aed");
  const [routeCoords, setRouteCoords] = useState<[number, number][]>([]);
  const [routeInfo, setRouteInfo] = useState<{ distance: number; time: number } | null>(null);
  const [routeLoading, setRouteLoading] = useState(false);
  const [routeError, setRouteError] = useState<string | null>(null);
  const [rotationDeg, setRotationDeg] = useState(0);
  const [rotationInput, setRotationInput] = useState("45");
  const [showNumberInsteadOfIcon, setShowNumberInsteadOfIcon] = useState(false);
  const [projects, setProjects] = useState<MapProject[]>([]);
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [newProjectName, setNewProjectName] = useState("");
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameDraft, setRenameDraft] = useState("");
  const [pointSearchQuery, setPointSearchQuery] = useState<Record<string, string>>({});
  const [pointSearchResults, setPointSearchResults] = useState<Record<string, any[]>>({});
  const [pointSearchLoading, setPointSearchLoading] = useState<Record<string, boolean>>({});
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [geocodeProvider, setGeocodeProvider] = useState<"nominatim" | "geoapify" | "both">("both");
  const [exportSize, setExportSize] = useState<keyof typeof EXPORT_PRESETS>("1920x1080");
  const [exportFormat, setExportFormat] = useState<"png" | "jpeg" | "pdf">("png");
  const [pdfFontSize, setPdfFontSize] = useState(9);
  const [pdfPageSize, setPdfPageSize] = useState<keyof typeof PDF_PAGE_SIZES>("A4");
  const [exportLoading, setExportLoading] = useState(false);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null);
  const [pdfPreviewLoading, setPdfPreviewLoading] = useState(false);
  const [showPdfPreview, setShowPdfPreview] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [clusterEnabled, setClusterEnabled] = useState(true);
  const [spiderClusterId, setSpiderClusterId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"inicio" | "puntos" | "insertar" | "vista" | "ruta" | "exportar" | "config">("inicio");

  const mapRef = useRef<L.Map | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const mapExportRef = useRef<HTMLDivElement | null>(null);
  const knobRef = useRef<HTMLDivElement | null>(null);
  const historyRef = useRef<MarkerData[][]>([]);
  const [historyIdx, setHistoryIdx] = useState(-1);
  const isUndoRedoRef = useRef(false);

  // Load from storage + hash share (hash prioriza y auto-ajusta vista)
  useEffect(() => {
    let hashMarkers: MarkerData[] | null = null;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed.markers) && parsed.markers.length > 0) {
          setMarkers(parsed.markers);
        }
        if (parsed.tileProvider) setTileProvider(parsed.tileProvider);
        if (typeof parsed.showPolyline === "boolean") setShowPolyline(parsed.showPolyline);
        if (parsed.selectedIcon) setSelectedIcon(parsed.selectedIcon);
        if (parsed.selectedColor) setSelectedColor(parsed.selectedColor);
      }
      // try URL hash share siempre (prioriza link compartido sobre storage)
      const hash = window.location.hash.slice(1);
      if (hash.startsWith("map=")) {
        try {
          const data = JSON.parse(decodeURIComponent(atob(hash.slice(4))));
          if (Array.isArray(data) && data.length) {
            const valid = data.filter((m: any) => typeof m.lat === "number" && typeof m.lng === "number");
            if (valid.length) {
              hashMarkers = valid.map((m: any) => ({
                id: m.id || generateId(),
                lat: Number(m.lat),
                lng: Number(m.lng),
                title: String(m.title || "Sin título"),
                description: String(m.description || ""),
                icon: (m.icon as IconId) || "map-pin",
                color: m.color || "blue",
                shape: (m.shape === "square" || m.shape === "circle" ? m.shape : "pin") as MarkerShape,
                size: typeof m.size === "number" ? Math.max(24, Math.min(52, Math.round(m.size))) : 38,
              }));
              setMarkers(hashMarkers);
            }
          }
        } catch {}
      }
      const savedToken = localStorage.getItem("geoapify-api-key");
      if (savedToken) {
        setGeoapifyToken(savedToken);
        setGeoapifyInput(savedToken);
      } else {
        // embebida por defecto, pero mantenida sobreescribible
        setGeoapifyToken(DEFAULT_GEOAPIFY_KEY);
        setGeoapifyInput(DEFAULT_GEOAPIFY_KEY);
      }
      const savedRotation = localStorage.getItem("map-rotation-deg");
      if (savedRotation) setRotationDeg(parseInt(savedRotation) || 0);
      const savedShowNumber = localStorage.getItem("map-show-number");
      if (savedShowNumber) setShowNumberInsteadOfIcon(savedShowNumber === "true");
      const savedProvider = localStorage.getItem("map-geocode-provider");
      if (savedProvider === "geoapify" || savedProvider === "nominatim" || savedProvider === "both") setGeocodeProvider(savedProvider as any);
      const savedProjects = localStorage.getItem(PROJECTS_KEY);
      if (savedProjects) {
        try {
          const parsed = JSON.parse(savedProjects);
          if (Array.isArray(parsed)) setProjects(parsed);
        } catch {}
      }
      const savedCurrentId = localStorage.getItem("custom-map-current-project");
      if (savedCurrentId) setCurrentProjectId(savedCurrentId);
      // si vino por hash, ajustar vista tras montar mapa (compensa 200% + rotación)
      if (hashMarkers && hashMarkers.length) {
        const hm = hashMarkers;
        setTimeout(() => {
          if (!mapRef.current) return;
          try {
            const b = L.latLngBounds(hm.map((m) => [m.lat, m.lng] as [number, number]));
            const map = mapRef.current;
            map.invalidateSize();
            const rot = parseInt(localStorage.getItem("map-rotation-deg") || "0", 10) || 0;
            const size = map.getSize();
            const padX = size.x * 0.29;
            const padY = size.y * 0.29;
            const rad = (rot % 360) * (Math.PI / 180);
            const factor = Math.abs(Math.sin(rad)) + Math.abs(Math.cos(rad));
            const expanded = b.pad((factor - 1) / 2 + 0.06);
            map.fitBounds(expanded, { paddingTopLeft: [padX, padY], paddingBottomRight: [padX, padY], animate: true, duration: 0.6 });
            setTimeout(() => map.invalidateSize(), 700);
          } catch {}
        }, 800);
      }
    } catch {}
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    const payload = { markers, tileProvider, showPolyline, selectedIcon, selectedColor };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  }, [markers, tileProvider, showPolyline, selectedIcon, selectedColor, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem("map-rotation-deg", String(rotationDeg));
    // recarga tiles tras rotar: el contenedor 200% necesita invalidateSize tras transición
    const t1 = setTimeout(() => mapRef.current?.invalidateSize(), 50);
    const t2 = setTimeout(() => mapRef.current?.invalidateSize(), 400);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [rotationDeg, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem("map-show-number", String(showNumberInsteadOfIcon));
  }, [showNumberInsteadOfIcon, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem("map-geocode-provider", geocodeProvider);
  }, [geocodeProvider, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
  }, [projects, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    if (currentProjectId) localStorage.setItem("custom-map-current-project", currentProjectId);
    else localStorage.removeItem("custom-map-current-project");
  }, [currentProjectId, isLoaded]);

  // Sidebar colapsable: persistencia + invalidateSize al plegar/desplegar
  useEffect(() => {
    if (!isLoaded) return;
    const saved = localStorage.getItem("map-sidebar-open");
    if (saved !== null) setSidebarOpen(saved === "true");
    else if (window.innerWidth < 1024) setSidebarOpen(false);
    const savedCluster = localStorage.getItem("map-cluster-enabled");
    if (savedCluster !== null) setClusterEnabled(savedCluster === "true");
  }, [isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem("map-sidebar-open", String(sidebarOpen));
    const t1 = setTimeout(() => mapRef.current?.invalidateSize(), 80);
    const t2 = setTimeout(() => mapRef.current?.invalidateSize(), 380);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [sidebarOpen, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem("map-cluster-enabled", String(clusterEnabled));
    setSpiderClusterId(null);
  }, [clusterEnabled, isLoaded]);

  // limpiar spider al mover/zoom
  useEffect(() => {
    if (!mapRef.current) return;
    const map: any = mapRef.current;
    const clear = () => setSpiderClusterId(null);
    map.on("zoomstart", clear);
    map.on("movestart", clear);
    return () => { try { map.off("zoomstart", clear); map.off("movestart", clear); } catch {} };
  }, [isLoaded]);

  // Historial para undo/redo (Ctrl+Z / Ctrl+Y / Ctrl+Shift+Z / Ctrl+X)
  useEffect(() => {
    if (!isLoaded) return;
    if (historyRef.current.length === 0) {
      historyRef.current = [markers.map((m) => ({ ...m }))];
      setHistoryIdx(0);
      return;
    }
    if (isUndoRedoRef.current) {
      isUndoRedoRef.current = false;
      return;
    }
    const last = historyRef.current[historyIdx];
    if (last && JSON.stringify(last) === JSON.stringify(markers)) return;
    const nextStack = [...historyRef.current.slice(0, historyIdx + 1), markers.map((m) => ({ ...m }))];
    if (nextStack.length > 50) nextStack.shift();
    historyRef.current = nextStack;
    setHistoryIdx(nextStack.length - 1);
  }, [markers, isLoaded]);

  const handleUndo = useCallback(() => {
    if (historyIdx <= 0) return;
    const prevIdx = historyIdx - 1;
    const prevMarkers = historyRef.current[prevIdx];
    if (!prevMarkers) return;
    isUndoRedoRef.current = true;
    setMarkers(prevMarkers.map((m) => ({ ...m })));
    setHistoryIdx(prevIdx);
    setRouteCoords([]);
    setRouteInfo(null);
  }, [historyIdx]);

  const handleRedo = useCallback(() => {
    if (historyIdx >= historyRef.current.length - 1) return;
    const nextIdx = historyIdx + 1;
    const nextMarkers = historyRef.current[nextIdx];
    if (!nextMarkers) return;
    isUndoRedoRef.current = true;
    setMarkers(nextMarkers.map((m) => ({ ...m })));
    setHistoryIdx(nextIdx);
    setRouteCoords([]);
    setRouteInfo(null);
  }, [historyIdx]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const isMod = e.ctrlKey || e.metaKey;
      if (!isMod) return;
      // evitar cuando se escribe en input/textarea
      const target = e.target as HTMLElement | null;
      const isTyping = !!target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable);
      if (isTyping) {
        // permitir undo/redo incluso en inputs? lo bloqueamos para no interferir con edición de texto estándar
        // solo permitir si no hay selección? por simplicidad, dejar que el navegador maneje
        return;
      }
      const key = e.key.toLowerCase();
      if (key === "z" && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      } else if ((key === "z" && e.shiftKey) || key === "y" || key === "x") {
        // Ctrl+Shift+Z / Ctrl+Y / Ctrl+X para rehacer (X pedido por usuario)
        e.preventDefault();
        handleRedo();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handleUndo, handleRedo]);

  const handleSaveProject = () => {
    const name = newProjectName.trim();
    if (!name) return alert("Ponle un nombre al mapa");
    if (markers.length === 0) return alert("Añade al menos 1 punto antes de guardar");
    const newProj: MapProject = {
      id: generateId(),
      name,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      markers: [...markers],
      tileProvider,
      showPolyline,
    };
    setProjects((prev) => [newProj, ...prev]);
    setCurrentProjectId(newProj.id);
    setNewProjectName("");
  };

  const handleLoadProject = (id: string) => {
    const proj = projects.find((p) => p.id === id);
    if (!proj) return;
    setMarkers(proj.markers);
    setTileProvider(proj.tileProvider);
    setShowPolyline(proj.showPolyline);
    setCurrentProjectId(id);
    setRouteCoords([]);
    setRouteInfo(null);
    setTimeout(() => {
      if (proj.markers.length > 0 && mapRef.current) {
        const bounds = L.latLngBounds(proj.markers.map((m) => [m.lat, m.lng] as [number, number]));
        fitAdjusted(bounds);
      }
    }, 200);
  };

  const handleUpdateCurrentProject = () => {
    if (!currentProjectId) return alert("Carga primero un mapa guardado");
    const proj = projects.find((p) => p.id === currentProjectId);
    if (!proj) return;
    if (!confirm(`¿Actualizar "${proj.name}" con ${markers.length} puntos actuales?`)) return;
    setProjects((prev) => prev.map((p) => p.id === currentProjectId ? { ...p, markers: [...markers], tileProvider, showPolyline, updatedAt: Date.now() } : p));
  };

  const handleDeleteProject = (id: string) => {
    const proj = projects.find((p) => p.id === id);
    if (!proj) return;
    if (!confirm(`¿Eliminar mapa "${proj.name}"?`)) return;
    setProjects((prev) => prev.filter((p) => p.id !== id));
    if (currentProjectId === id) setCurrentProjectId(null);
  };

  const handleDuplicateProject = (id: string) => {
    const proj = projects.find((p) => p.id === id);
    if (!proj) return;
    const dup: MapProject = { ...proj, id: generateId(), name: `${proj.name} (copia)`, createdAt: Date.now(), updatedAt: Date.now(), markers: [...proj.markers] };
    setProjects((prev) => [dup, ...prev]);
  };

  const handleRenameProject = (id: string) => {
    const newName = renameDraft.trim();
    if (!newName) return;
    setProjects((prev) => prev.map((p) => p.id === id ? { ...p, name: newName, updatedAt: Date.now() } : p));
    setRenamingId(null);
    setRenameDraft("");
  };

  const isDirty = (() => {
    if (!currentProjectId) return markers.length > 0;
    const proj = projects.find((pr) => pr.id === currentProjectId);
    if (!proj) return markers.length > 0;
    try {
      return JSON.stringify(proj.markers) !== JSON.stringify(markers) || proj.tileProvider !== tileProvider || proj.showPolyline !== showPolyline;
    } catch { return true; }
  })();

  const currentProjectName = currentProjectId ? (projects.find((pr) => pr.id === currentProjectId)?.name || "Proyecto") : (markers.length > 0 ? "Mapa sin guardar" : "Mapa nuevo");

  const handleNewMap = () => {
    if (markers.length === 0) {
      if (currentProjectId) setCurrentProjectId(null);
      setRouteCoords([]);
      setRouteInfo(null);
      setSelectedId(null);
      return;
    }
    const proj = currentProjectId ? projects.find((pr) => pr.id === currentProjectId) : null;
    const dirty = isDirty;
    if (dirty) {
      const randomName = `Mapa ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString().slice(0,5)} - ${generateId()}`;
      const msg = `Vas a crear un NUEVO MAPA en blanco.

Tus ${markers.length} puntos actuales se guardarán automáticamente como "${randomName}" para no perderlos.

¿Continuar?`;
      if (!confirm(msg)) return;
      const autoProj: MapProject = {
        id: generateId(),
        name: randomName,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        markers: [...markers],
        tileProvider,
        showPolyline,
      };
      setProjects((prev) => [autoProj, ...prev]);
    } else {
      if (!confirm(`Crear nuevo mapa en blanco?\nEl mapa "${proj?.name}" ya está guardado.`)) return;
    }
    setMarkers([]);
    setCurrentProjectId(null);
    setRouteCoords([]);
    setRouteInfo(null);
    setSelectedId(null);
    setSpiderClusterId(null);
    setActiveTab("inicio");
  };

  const handleSaveToken = () => {
    const t = geoapifyInput.trim();
    if (!t) return;
    localStorage.setItem("geoapify-api-key", t);
    setGeoapifyToken(t);
  };
  const handleClearToken = () => {
    localStorage.removeItem("geoapify-api-key");
    setGeoapifyToken(DEFAULT_GEOAPIFY_KEY);
    setGeoapifyInput(DEFAULT_GEOAPIFY_KEY);
  };

  const handleAddMarker = useCallback(
    (lat: number, lng: number, titleOverride?: string) => {
      const newMarker: MarkerData = {
        id: generateId(),
        lat: Number(lat.toFixed(6)),
        lng: Number(lng.toFixed(6)),
        title: (titleOverride ?? (newTitle.trim() || `Punto ${markers.length + 1}`)),
        description: "",
        icon: selectedIcon,
        color: selectedColor,
        shape: selectedShape,
        size: selectedSize,
      };
      setMarkers((prev) => [...prev, newMarker]);
      setNewTitle("");
    },
    [markers.length, newTitle, selectedIcon, selectedColor, selectedShape, selectedSize]
  );

  const handleDelete = (id: string) => setMarkers((prev) => prev.filter((m) => m.id !== id));
  const handleDuplicate = (m: MarkerData) =>
    setMarkers((prev) => [...prev, { ...m, id: generateId(), title: m.title + " (copia)" }]);

  const startEdit = (m: MarkerData) => {
    setEditingId(m.id);
    setDraftTitle(m.title);
    setDraftDesc(m.description);
    setDraftIcon(m.icon);
    setDraftColor(m.color);
    setDraftLat(String(m.lat));
    setDraftLng(String(m.lng));
    setDraftShape((m.shape as MarkerShape) ?? "pin");
    setDraftSize(String(m.size ?? 38));
    // cerrar popup de Leaflet para que el modal quede visible
    mapRef.current?.closePopup();
  };
  const saveEdit = () => {
    if (!editingId) return;
    const latNum = parseFloat(draftLat);
    const lngNum = parseFloat(draftLng);
    if (Number.isNaN(latNum) || Number.isNaN(lngNum)) return alert("Coordenadas inválidas");
    const sizeNum = parseInt(draftSize, 10);
    const safeSize = Number.isNaN(sizeNum) ? 38 : Math.max(24, Math.min(52, sizeNum));
    setMarkers((prev) =>
      prev.map((m) =>
        m.id === editingId
          ? { ...m, title: draftTitle, description: draftDesc, icon: draftIcon, color: draftColor, lat: latNum, lng: lngNum, shape: draftShape, size: safeSize }
          : m
      )
    );
    setEditingId(null);
  };

  const moveMarker = (id: string, dir: -1 | 1) => {
    setMarkers((prev) => {
      const idx = prev.findIndex((m) => m.id === id);
      if (idx < 0) return prev;
      const next = idx + dir;
      if (next < 0 || next >= prev.length) return prev;
      const arr = [...prev];
      const [item] = arr.splice(idx, 1);
      arr.splice(next, 0, item);
      return arr;
    });
    // limpiar ruta al reordenar (debe recalcular)
    setRouteCoords([]);
    setRouteInfo(null);
  };

  const updateMarkerSize = (id: string, size: number) => {
    const safe = Math.max(24, Math.min(52, Math.round(size)));
    setMarkers((prev) => prev.map((m) => (m.id === id ? { ...m, size: safe } : m)));
  };

  const handleGlobalSize = (size: number) => {
    const safe = Math.max(24, Math.min(52, Math.round(size)));
    setGlobalMarkerSize(safe);
    setSelectedSize(safe);
    setMarkers((prev) => prev.map((m) => ({ ...m, size: safe })));
  };

  const handleResetSizes = () => {
    setGlobalMarkerSize(38);
    setSelectedSize(38);
    setMarkers((prev) => prev.map((m) => ({ ...m, size: 38 })));
  };

  const fitAdjusted = (bounds: L.LatLngBounds, opts?: L.FitBoundsOptions) => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    // 1. Refrescar para garantizar medidas actualizadas
    map.invalidateSize();

    // 2. Obtener dimensiones del mapa interno (que mide el 200% del contenedor visible)
    const size = map.getSize();

    // 3. Compensar el lienzo gigante: 25% invisible + 2% margen pins + ~2% holgura (ajustado para no alejar demasiado)
    const padX = size.x * 0.29;
    const padY = size.y * 0.29;

    // 4. Calcular el crecimiento de la caja al rotar (varía de 1 a 1.414)
    const rad = (rotationDeg % 360) * (Math.PI / 180);
    const factor = Math.abs(Math.sin(rad)) + Math.abs(Math.cos(rad));

    // 5. Expandir los límites geográficos proporcionalmente + 6% holgura (retrocede poco, pero más cerca que 12%)
    const expandedBounds = bounds.pad((factor - 1) / 2 + 0.06);

    // 6. Ejecutar el ajuste obligando a Leaflet a renderizar en el centro exacto
    map.fitBounds(expandedBounds, {
      paddingTopLeft: [padX, padY],
      paddingBottomRight: [padX, padY],
      animate: true,
      duration: 0.5,
      ...opts,
    });

    // Refrescar tamaño tras la animación por seguridad
    setTimeout(() => map.invalidateSize(), 500);
  };
  const fitAll = () => {
    if (!mapRef.current || markers.length === 0) return;
    const bounds = L.latLngBounds(markers.map((m) => [m.lat, m.lng] as [number, number]));
    fitAdjusted(bounds, { maxZoom: 16 });
  };

  const handleDrawRoute = async () => {
    setRouteError(null);
    if (markers.length < 2) {
      setRouteError("Necesitas al menos 2 puntos");
      return;
    }
    if (!geoapifyToken) {
      setRouteError("Primero guarda tu API key de Geoapify");
      return;
    }
    setRouteLoading(true);
    try {
      const waypoints = markers.map((m) => `${m.lat},${m.lng}`).join("|");
      const params = new URLSearchParams({
        waypoints,
        mode: routeMode,
        apiKey: geoapifyToken,
      });
      if (optimizeStops) params.set("optimize_stops", "true");
      const url = `https://api.geoapify.com/v1/routing?${params.toString()}`;
      const res = await fetch(url);
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || `Error ${res.status}`);
      }
      const data = await res.json();
      // GeoJSON FeatureCollection -> features[0].geometry.coordinates son [lon,lat]
      let coords: [number, number][] = [];
      let distance = 0;
      let time = 0;
      if (data.type === "FeatureCollection" && Array.isArray(data.features) && data.features[0]) {
        const feat = data.features[0];
        const geom = feat.geometry;
        // puede ser LineString o MultiLineString
        if (geom.type === "LineString") {
          coords = geom.coordinates.map((c: number[]) => [c[1], c[0]] as [number, number]);
        } else if (geom.type === "MultiLineString") {
          coords = geom.coordinates.flat().map((c: number[]) => [c[1], c[0]] as [number, number]);
        }
        distance = feat.properties?.distance ?? 0;
        time = feat.properties?.time ?? 0;
        // si waypoints optimizados, actualizar orden visual
        if (feat.properties?.waypoints && Array.isArray(feat.properties.waypoints) && optimizeStops) {
          // feat.properties.waypoints viene ordenado, pero no reordenamos markers automáticamente para no confundir; solo mostramos ruta optimizada
        }
      } else if (data.features) {
        throw new Error("Respuesta inesperada de Geoapify");
      } else {
        throw new Error("Sin geometría de ruta");
      }
      if (coords.length === 0) throw new Error("Ruta vacía");
      setRouteCoords(coords);
      setRouteInfo({ distance, time });
      // ajustar vista a ruta (compensando rotación)
      if (mapRef.current) {
        const bounds = L.latLngBounds(coords);
        fitAdjusted(bounds);
      }
    } catch (e: any) {
      setRouteError(e.message || "Error al calcular ruta");
      setRouteCoords([]);
      setRouteInfo(null);
    } finally {
      setRouteLoading(false);
    }
  };

  const handleClearRoute = () => {
    setRouteCoords([]);
    setRouteInfo(null);
    setRouteError(null);
  };

  // Helpers exportación
  const captureMapRaw = async (): Promise<string> => {
    const node = mapExportRef.current;
    if (!node) throw new Error("Mapa no listo");
    const toHide = Array.from(node.querySelectorAll("[data-no-export], .leaflet-control")) as HTMLElement[];
    const prev = toHide.map((el) => el.style.display);
    toHide.forEach((el) => (el.style.display = "none"));
    try {
      const { toPng } = await import("html-to-image");
      const dataUrl = await toPng(node, { cacheBust: true, pixelRatio: 2, backgroundColor: "#f8fafc" } as any);
      return dataUrl;
    } finally {
      toHide.forEach((el, i) => (el.style.display = prev[i] || ""));
    }
  };
  const resizeDataUrl = (dataUrl: string, targetW: number, targetH: number, mime: "image/png" | "image/jpeg" = "image/png"): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = targetW;
        canvas.height = targetH;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("Canvas no soportado"));
        ctx.fillStyle = "#f8fafc";
        ctx.fillRect(0, 0, targetW, targetH);
        // contain: escalar preservando aspecto, centrado
        const scale = Math.min(targetW / img.width, targetH / img.height);
        const w = img.width * scale;
        const h = img.height * scale;
        const x = (targetW - w) / 2;
        const y = (targetH - h) / 2;
        ctx.drawImage(img, x, y, w, h);
        resolve(canvas.toDataURL(mime, mime === "image/jpeg" ? 0.92 : undefined));
      };
      img.onerror = () => reject(new Error("Error cargando imagen para resize"));
      img.src = dataUrl;
    });
  };
  const handleExportMapImage = async (format: "png" | "jpeg" = "png") => {
    // legacy: actual size
    try {
      setExportLoading(true);
      const raw = await captureMapRaw();
      let out = raw;
      const preset = EXPORT_PRESETS[exportSize];
      if (preset.w && preset.h && exportSize !== "actual") {
        const mime = format === "png" ? "image/png" : "image/jpeg";
        out = await resizeDataUrl(raw, preset.w, preset.h, mime);
      } else if (format === "jpeg") {
        // converter png raw to jpeg if needed via resize trick (1:1)
        const img = new Image();
        // quick convert via canvas 1:1
        out = await new Promise<string>((res, rej) => {
          const i = new Image();
          i.onload = () => {
            const c = document.createElement("canvas");
            c.width = i.width; c.height = i.height;
            const cx = c.getContext("2d")!;
            cx.drawImage(i, 0, 0);
            res(c.toDataURL("image/jpeg", 0.92));
          };
          i.onerror = rej; i.src = raw;
        });
      }
      const a = document.createElement("a");
      a.href = out;
      const ext = format === "png" ? "png" : "jpg";
      const sizeTag = exportSize === "actual" ? "actual" : `${EXPORT_PRESETS[exportSize].w}x${EXPORT_PRESETS[exportSize].h}`;
      a.download = `mapa-${new Date().toISOString().slice(0,10)}-${markers.length}pts-${rotationDeg}deg-${sizeTag}.${ext}`;
      a.click();
    } catch (e: any) {
      console.error(e);
      alert("Error exportando imagen: " + (e.message || e));
    } finally {
      setExportLoading(false);
    }
  };
  const handleExportPreset = async () => {
    if (exportFormat === "pdf") {
      await handleExportPdf();
    } else {
      await handleExportMapImage(exportFormat as "png" | "jpeg");
    }
  };
  const handleGeneratePdfPreview = async () => {
    if (markers.length === 0) return alert("Añade al menos 1 punto");
    try {
      setPdfPreviewLoading(true);
      const raw = await captureMapRaw();
      const preset = EXPORT_PRESETS[exportSize];
      let out = raw;
      if (preset.w && preset.h) {
        // preview usa tamaño moderado para no saturar memoria: escalar a max 800 en lado mayor
        const maxSide = 800;
        const scale = Math.min(maxSide / preset.w, maxSide / preset.h, 1);
        const pw = Math.round(preset.w * scale);
        const ph = Math.round(preset.h * scale);
        out = await resizeDataUrl(raw, pw, ph, "image/png");
      }
      setPdfPreviewUrl(out);
      setShowPdfPreview(true);
    } catch (e: any) {
      alert("Error preview: " + (e.message || e));
    } finally {
      setPdfPreviewLoading(false);
    }
  };
  const handleExportPdf = async () => {
    if (markers.length === 0) return alert("Añade al menos 1 punto");
    try {
      setExportLoading(true);
      const raw = await captureMapRaw();
      const { PDFDocument, StandardFonts, rgb } = await import("pdf-lib");
      const pdf = await PDFDocument.create();
      const font = await pdf.embedFont(StandardFonts.Helvetica);
      const fontBold = await pdf.embedFont(StandardFonts.HelveticaBold);
      const pageSize = PDF_PAGE_SIZES[pdfPageSize] || PDF_PAGE_SIZES["A4"];
      const margin = 36;
      const projName = (projects.find(p=>p.id===currentProjectId)?.name?.trim()) || "Mapa";
      const toWinAnsi = (s: string) => s.replace(/\u2026/g,"...").replace(/\u2014/g,"-").replace(/\u2191/g,"^").replace(/\u2192/g,"->").replace(/[^\x20-\x7E\xA0-\xFF]/g, (c)=> c.normalize ? c.normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^\x20-\x7E\xA0-\xFF]/g,"?") : "?");
      const safeProjName = toWinAnsi(projName);
      // — generar shareLink + QR una vez (import estatico, sin await import) —
      const shareLink = `${window.location.origin}${window.location.pathname}#map=${btoa(encodeURIComponent(JSON.stringify(markers)))}`;
      let qrEmbed: any = null;
      try {
        const qrDataUrl = await QRCode.toDataURL(shareLink, { width: 420, margin: 1, errorCorrectionLevel: "M" });
        const qrRes = await fetch(qrDataUrl);
        const qrBuf = await qrRes.arrayBuffer();
        try { qrEmbed = await pdf.embedPng(qrBuf); } catch { qrEmbed = await pdf.embedJpg(qrBuf); }
      } catch (e) { console.warn("QR pdf gen fail", e); }

      // Página 1: portada mapa (solo nombre proyecto)
      const page1 = pdf.addPage([pageSize.wPt, pageSize.hPt]);
      const { width: pw, height: ph } = page1.getSize();
      // título header: solo nombre proyecto (centrado) — truncado si excede ancho para no desbordar
      const titleSize = 14;
      let safeTitle = safeProjName;
      const maxTitleW = pw - margin*2;
      if (fontBold.widthOfTextAtSize(safeTitle, titleSize) > maxTitleW) {
        const ell = "...";
        while (safeTitle.length > 0 && fontBold.widthOfTextAtSize(safeTitle + ell, titleSize) > maxTitleW) safeTitle = safeTitle.slice(0,-1);
        safeTitle += ell;
      }
      const titleW = fontBold.widthOfTextAtSize(safeTitle, titleSize);
      page1.drawText(safeTitle, { x: (pw - titleW)/2, y: ph - 32, size: titleSize, font: fontBold, color: rgb(0.1,0.1,0.1) });
      // embed map image — reservar 110px abajo para QR+link en portada para que no solape
      const res = await fetch(raw);
      const buf = await res.arrayBuffer();
      let imgEmbed: any;
      try {
        imgEmbed = await pdf.embedPng(buf);
      } catch {
        imgEmbed = await pdf.embedJpg(buf);
      }
      const imgDims = imgEmbed.scale(1);
      const availW = pw - margin*2;
      const qrReserveH = 110;
      const availH = ph - 55 - qrReserveH - 10;
      const scale = Math.min(availW / imgDims.width, availH / imgDims.height);
      const imgW = imgDims.width * scale;
      const imgH = imgDims.height * scale;
      const imgX = (pw - imgW)/2;
      const imgY = ph - 50 - imgH;
      page1.drawImage(imgEmbed, { x: imgX, y: imgY, width: imgW, height: imgH });
      // borde mapa
      page1.drawRectangle({ x: imgX-1, y: imgY-1, width: imgW+2, height: imgH+2, borderColor: rgb(0.8,0.8,0.8), borderWidth: 0.5 });
      // QR + link en portada (arriba de margen, garantizado visible)
      if (qrEmbed) {
        const qrSize = 78;
        const qrX = pw - margin - qrSize;
        const qrY = margin + 14;
        page1.drawRectangle({ x: qrX-2, y: qrY-2, width: qrSize+4, height: qrSize+4, color: rgb(1,1,1), borderColor: rgb(0.85,0.85,0.85), borderWidth: 0.5 });
        page1.drawImage(qrEmbed, { x: qrX, y: qrY, width: qrSize, height: qrSize });
        page1.drawText("Escanea para abrir", { x: qrX - 1, y: qrY + qrSize + 9, size: 6, font, color: rgb(0.3,0.3,0.3) });
        page1.drawText("mapa interactivo", { x: qrX - 1, y: qrY + qrSize + 2, size: 6, font, color: rgb(0.3,0.3,0.3) });
      }
      // link completo en portada — envuelto en 2 líneas para que no se recorte
      {
        const linkFontSize = 6.5;
        const maxCharsPerLine = Math.floor((pw - margin*2 - 90) / (linkFontSize * 0.55)); // deja hueco QR 78+gap
        const words = shareLink;
        // simple wrap por longitud
        let lx = margin, ly = margin + 6;
        let remaining = words;
        let lines = 0;
        while (remaining.length > 0 && lines < 3) {
          const chunk = remaining.slice(0, maxCharsPerLine);
          page1.drawText(chunk, { x: lx, y: ly, size: linkFontSize, font, color: rgb(0.2,0.35,0.8) });
          remaining = remaining.slice(maxCharsPerLine);
          ly -= linkFontSize + 2;
          lines++;
          if (remaining.length > 0 && lines === 3) {
            // ellipsis en última línea
            page1.drawText("...", { x: lx + font.widthOfTextAtSize(chunk, linkFontSize), y: ly + linkFontSize + 2, size: linkFontSize, font, color: rgb(0.2,0.35,0.8) });
            break;
          }
        }
        page1.drawText("Link interactivo ^", { x: margin, y: margin - 4, size: 5, font, color: rgb(0.5,0.5,0.5) });
      }
      // Páginas de tabla (sin descripción/icon/color, solo # Título Lat Lng) — anchos por ratio para evitar desborde
      const headers = ["#", "Titulo", "Lat", "Lng"];
      const colRatios = [0.07, 0.61, 0.16, 0.16];
      const tableAvailW = pw - margin*2;
      const scaledWidths = colRatios.map(r => tableAvailW * r);
      const rowH = Math.max(18, Math.ceil(pdfFontSize * 1.45 + 7));
      const headerH = rowH;
      const rowsPerPage = Math.floor((ph - margin*2 - headerH - 18) / rowH);
      let page = pdf.addPage([pageSize.wPt, pageSize.hPt]);
      let y = page.getSize().height - margin;
      // header tabla: solo nombre proyecto (centrado)
      const tabTitleW = fontBold.widthOfTextAtSize(safeProjName, pdfFontSize);
      page.drawText(safeProjName, { x: (pw - tabTitleW)/2, y, size: pdfFontSize, font: fontBold, color: rgb(0.1,0.1,0.1) });
      y -= 16;
      // — tabla: truncado preciso por ancho real de fuente (evita desborde con letra grande) —
      const fitText = (text: string, colW: number, fnt: any, size: number) => {
        const safe = toWinAnsi(text);
        const avail = colW - 6; // 3px padding cada lado
        if (fnt.widthOfTextAtSize(safe, size) <= avail) return safe;
        let txt = safe;
        const ell = "...";
        const ellW = fnt.widthOfTextAtSize(ell, size);
        while (txt.length > 0 && fnt.widthOfTextAtSize(txt, size) + ellW > avail) {
          txt = txt.slice(0, -1);
        }
        return txt + ell;
      };
      const drawHeader = (pg: any, yy: number) => {
        let x = margin;
        pg.drawRectangle({ x: margin, y: yy - headerH + 4, width: tableAvailW, height: headerH, color: rgb(0.95,0.95,0.95) });
        headers.forEach((h,i)=>{
          const txt = fitText(h, scaledWidths[i], fontBold, pdfFontSize -1);
          const ty = yy - headerH/2 + 2;
          pg.drawText(txt, { x: x+3, y: ty, size: pdfFontSize -1, font: fontBold, color: rgb(0.2,0.2,0.2) });
          x += scaledWidths[i];
        });
        // borde vertical separador de columnas en header
        let vx = margin;
        for (let i=0;i<headers.length-1;i++){ vx+=scaledWidths[i]; pg.drawLine({ start:{x:vx, y: yy - headerH +4}, end:{x:vx, y: yy+4}, thickness:0.25, color: rgb(0.85,0.85,0.85)}); }
      };
      drawHeader(page, y);
      y -= headerH;
      const drawRow = (pg: any, m: MarkerData, idx: number, yy: number, isOdd: boolean) => {
        if (isOdd) pg.drawRectangle({ x: margin, y: yy - rowH + 4, width: tableAvailW, height: rowH, color: rgb(0.98,0.98,0.98) });
        let x = margin;
        const cells = [
          String(idx+1),
          (m.title||"").trim(),
          m.lat.toFixed(5),
          m.lng.toFixed(5),
        ];
        cells.forEach((c,i)=>{
          const txt = fitText(c, scaledWidths[i], font, pdfFontSize -1);
          const ty = yy - rowH/2 + 2;
          pg.drawText(txt, { x: x+3, y: ty, size: pdfFontSize -1, font, color: rgb(0.15,0.15,0.15) });
          x += scaledWidths[i];
        });
        pg.drawLine({ start:{x:margin, y: yy - rowH +4}, end:{x: margin+tableAvailW, y: yy - rowH +4}, thickness: 0.25, color: rgb(0.85,0.85,0.85) });
        // líneas verticales para que no "asome" contenido entre columnas
        let vx = margin;
        for (let i=0;i<cells.length-1;i++){ vx+=scaledWidths[i]; pg.drawLine({ start:{x:vx, y: yy - rowH +4}, end:{x:vx, y: yy+4}, thickness:0.25, color: rgb(0.92,0.92,0.92)}); }
        // borde exterior tabla por fila (evita desborde visual)
        pg.drawRectangle({ x: margin, y: yy - rowH +4, width: tableAvailW, height: rowH, borderColor: rgb(0.85,0.85,0.85), borderWidth: 0.25 });
      };
      for (let i=0;i<markers.length;i++) {
        if (y - rowH < margin) {
          page = pdf.addPage([pageSize.wPt, pageSize.hPt]);
          y = page.getSize().height - margin;
          const contW = font.widthOfTextAtSize(safeProjName, pdfFontSize-1);
          page.drawText(safeProjName, { x: (pw - contW)/2, y, size: pdfFontSize -1, font, color: rgb(0.4,0.4,0.4) });
          y -= 14;
          drawHeader(page, y);
          y -= headerH;
        }
        drawRow(page, markers[i], i, y, i%2===1);
        y -= rowH;
      }
      // — PÁGINA FINAL OBLIGATORIA: QR grande + link completo (siempre al final) —
      {
        const last = pdf.addPage([pageSize.wPt, pageSize.hPt]);
        const { width: lw, height: lh } = last.getSize();
        const tSize = 16;
        const t = "Acceso al mapa interactivo";
        const tw = fontBold.widthOfTextAtSize(t, tSize);
        last.drawText(t, { x: (lw - tw)/2, y: lh - 48, size: tSize, font: fontBold, color: rgb(0.1,0.1,0.1) });
        const sub = safeProjName;
        const sw = font.widthOfTextAtSize(sub, 10);
        last.drawText(sub, { x: (lw - sw)/2, y: lh - 64, size: 10, font, color: rgb(0.35,0.35,0.35) });
        last.drawLine({ start: { x: margin, y: lh - 72 }, end: { x: lw - margin, y: lh - 72 }, thickness: 0.5, color: rgb(0.9,0.9,0.9) });

        if (qrEmbed) {
          const qSize = Math.min(220, lw - margin*2 - 20);
          const qX = (lw - qSize)/2;
          const qY = lh/2 - qSize/2 - 10;
          // fondo + borde
          last.drawRectangle({ x: qX-8, y: qY-8, width: qSize+16, height: qSize+16, color: rgb(1,1,1), borderColor: rgb(0.8,0.8,0.8), borderWidth: 1 });
          last.drawImage(qrEmbed, { x: qX, y: qY, width: qSize, height: qSize });
          last.drawText("Escanea con la cámara para abrir el mapa", { x: (lw - font.widthOfTextAtSize("Escanea con la cámara para abrir el mapa", 8))/2, y: qY - 14, size: 8, font, color: rgb(0.3,0.3,0.3) });
        } else {
          last.drawText("QR no disponible (error de generación)", { x: margin, y: lh/2, size: 9, font, color: rgb(0.8,0,0) });
        }

        // link completo envuelto — cortado en líneas de ~70 chars, centrado
        const linkSize = 8;
        const availLinkW = lw - margin*2;
        const charsPerLine = Math.max(40, Math.floor(availLinkW / (linkSize * 0.58)));
        const linkLines: string[] = [];
        for (let i = 0; i < shareLink.length; i += charsPerLine) linkLines.push(shareLink.slice(i, i+charsPerLine));
        // limitar a 6 líneas para que quepa; si sobra, truncar última con ...
        if (linkLines.length > 6) {
          linkLines.length = 6;
          linkLines[5] = linkLines[5].slice(0, -1) + "...";
        }
        // dibujar líneas centradas, empezando arriba del margen inferior
        let ly = 92;
        last.drawText("Link:", { x: margin, y: ly + 14, size: 7, font: fontBold, color: rgb(0.2,0.2,0.2) });
        linkLines.forEach((line) => {
          const lwLine = font.widthOfTextAtSize(line, linkSize);
          last.drawText(line, { x: (lw - lwLine)/2, y: ly, size: linkSize, font, color: rgb(0.12,0.35,0.85) });
          ly -= linkSize + 3;
        });
        last.drawText("Copia el link o escanea el QR - ambos abren el mismo mapa interactivo", { x: (lw - font.widthOfTextAtSize("Copia el link o escanea el QR - ambos abren el mismo mapa interactivo", 6))/2, y: 22, size: 6, font, color: rgb(0.5,0.5,0.5) });

        // link clickeable (anotación) — rect invisible sobre el bloque de link
        try {
          const linkAnno = (last as any).doc?.context?.obj ? null : null;
          // pdf-lib no expone link annotation fácil; fallback: texto ya visible garantiza exigencia "asomen"
        } catch {}
      }

      // footer páginas tabla + final (numeración)
      pdf.getPages().forEach((p, idx)=>{
        const { width, height } = p.getSize();
        // numeración en todas excepto portada
        if (idx===0) return;
        p.drawText(`Pag ${idx+1}/${pdf.getPageCount()}`, { x: width - margin - 45, y: 12, size: 6, font, color: rgb(0.5,0.5,0.5) });
      });
      const bytes = await pdf.save();
      const blob = new Blob([bytes as any], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const safe = projName.replace(/[^a-zA-Z0-9\u00C0-\u024F]+/g,"-").replace(/^-|-$/g,"").slice(0,30) || "mapa";
      a.download = `${safe}-${new Date().toISOString().slice(0,10)}-${markers.length}pts-${pdfPageSize}-${pdfFontSize}pt.pdf`;
      a.click();
      setTimeout(()=> URL.revokeObjectURL(url), 3000);
    } catch (e: any) {
      console.error(e);
      alert("Error exportando PDF: " + (e.message||e));
    } finally {
      setExportLoading(false);
    }
  };

  const rotateMap = (delta: number) => {
    setRotationDeg((prev) => {
      let next = prev + delta;
      next = ((next % 360) + 360) % 360;
      // normalizar a 0-360
      return next;
    });
    // Leaflet necesita invalidateSize tras CSS rotate para mantener interacción
    setTimeout(() => mapRef.current?.invalidateSize(), 350);
  };
  const handleCustomRotate = () => {
    const v = parseInt(rotationInput, 10);
    if (Number.isNaN(v)) return;
    let next = ((v % 360) + 360) % 360;
    setRotationDeg(next);
    setTimeout(() => mapRef.current?.invalidateSize(), 350);
  };

  const updateRotationFromPointer = (clientX: number, clientY: number) => {
    const el = knobRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = clientX - cx;
    const dy = clientY - cy;
    let angle = Math.atan2(dy, dx) * 180 / Math.PI + 90;
    angle = ((angle % 360) + 360) % 360;
    setRotationDeg(Math.round(angle));
  };

  const handleKnobPointerDown = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const getXY = (ev: any) => {
      if (ev.touches) return { x: ev.touches[0].clientX, y: ev.touches[0].clientY };
      return { x: ev.clientX, y: ev.clientY };
    };
    const onMove = (ev: MouseEvent | TouchEvent) => {
      const { x, y } = (ev as any).touches ? { x: (ev as TouchEvent).touches[0].clientX, y: (ev as TouchEvent).touches[0].clientY } : { x: (ev as MouseEvent).clientX, y: (ev as MouseEvent).clientY };
      updateRotationFromPointer(x, y);
    };
    const onUp = () => {
      window.removeEventListener("mousemove", onMove as any);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("touchmove", onMove as any);
      window.removeEventListener("touchend", onUp);
      setTimeout(() => mapRef.current?.invalidateSize(), 350);
    };
    window.addEventListener("mousemove", onMove as any);
    window.addEventListener("mouseup", onUp);
    window.addEventListener("touchmove", onMove as any, { passive: false } as any);
    window.addEventListener("touchend", onUp);
    const { x, y } = getXY(e as any);
    updateRotationFromPointer(x, y);
  };

  const normalizeGeocodeResults = (data: any, provider: string) => {
    // Geoapify devuelve {results:[{lat,lon,formatted,place_id}]} o {features:[{geometry,properties}]}
    if (provider === "geoapify") {
      if (Array.isArray(data.results)) {
        return data.results.map((r: any) => ({
          place_id: r.place_id || r.osm_id || `${r.lat},${r.lon}`,
          display_name: r.formatted || r.address_line1 || `${r.lat},${r.lon}`,
          lat: String(r.lat),
          lon: String(r.lon),
          type: r.result_type || r.category || "geoapify",
          raw: r,
        }));
      }
      if (Array.isArray(data.features)) {
        return data.features.map((f: any) => ({
          place_id: f.properties?.place_id || f.properties?.osm_id || `${f.geometry.coordinates[1]},${f.geometry.coordinates[0]}`,
          display_name: f.properties?.formatted || f.properties?.address_line1 || `${f.geometry.coordinates[1]},${f.geometry.coordinates[0]}`,
          lat: String(f.geometry.coordinates[1]),
          lon: String(f.geometry.coordinates[0]),
          type: f.properties?.result_type || "geoapify",
          raw: f,
        }));
      }
      return [];
    }
    return Array.isArray(data) ? data : [];
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setSearchLoading(true);
    try {
      let data: any;
      const fetchNominatim = async (q: string) => {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=5&q=${encodeURIComponent(q)}`, { headers: { Accept: "application/json" } });
        return normalizeGeocodeResults(await res.json(), "nominatim").map((r: any) => ({ ...r, source: "nominatim" }));
      };
      const fetchGeoapify = async (q: string) => {
        if (!geoapifyToken) return [];
        const url = `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(q)}&format=json&limit=5&apiKey=${geoapifyToken}&filter=countrycode:ec&lang=es&bias=proximity:-78.5,-0.2`;
        const res = await fetch(url);
        return normalizeGeocodeResults(await res.json(), "geoapify").map((r: any) => ({ ...r, source: "geoapify" }));
      };
      if (geocodeProvider === "both") {
        const [nom, geo] = await Promise.all([fetchNominatim(searchQuery).catch(() => []), fetchGeoapify(searchQuery).catch(() => [])]);
        const merged = [...geo, ...nom];
        const seen = new Set<string>();
        data = merged.filter((r: any) => { const k = `${r.lat},${r.lon}`; if (seen.has(k)) return false; seen.add(k); return true; }).slice(0, 10);
        if (geo.length === 0 && geoapifyToken) console.warn("Geoapify sin resultados, usando Nominatim");
      } else if (geocodeProvider === "geoapify") {
        if (!geoapifyToken) { setSearchResults([]); throw new Error("Falta API key Geoapify"); }
        data = await fetchGeoapify(searchQuery);
      } else {
        data = await fetchNominatim(searchQuery);
      }
      setSearchResults(data);
    } catch (e) {
      console.error(e);
      // @ts-ignore
      if (e.message?.includes("Falta API")) alert(e.message);
    } finally {
      setSearchLoading(false);
    }
  };

  const handlePointSearch = async (id: string) => {
    const q = (pointSearchQuery[id] || "").trim();
    if (!q) return;
    setPointSearchLoading((prev) => ({ ...prev, [id]: true }));
    try {
      let data: any;
      const fetchNominatim = async (qq: string) => {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=5&q=${encodeURIComponent(qq)}`, { headers: { Accept: "application/json" } });
        return normalizeGeocodeResults(await res.json(), "nominatim").map((r: any) => ({ ...r, source: "nominatim" }));
      };
      const fetchGeoapify = async (qq: string) => {
        if (!geoapifyToken) return [];
        const url = `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(qq)}&format=json&limit=5&apiKey=${geoapifyToken}&filter=countrycode:ec&lang=es&bias=proximity:-78.5,-0.2`;
        const res = await fetch(url);
        return normalizeGeocodeResults(await res.json(), "geoapify").map((r: any) => ({ ...r, source: "geoapify" }));
      };
      if (geocodeProvider === "both") {
        const [nom, geo] = await Promise.all([fetchNominatim(q).catch(() => []), fetchGeoapify(q).catch(() => [])]);
        const merged = [...geo, ...nom];
        const seen = new Set<string>();
        data = merged.filter((r: any) => { const k = `${r.lat},${r.lon}`; if (seen.has(k)) return false; seen.add(k); return true; }).slice(0, 10);
      } else if (geocodeProvider === "geoapify") {
        if (!geoapifyToken) throw new Error("Falta API key Geoapify");
        data = await fetchGeoapify(q);
      } else {
        data = await fetchNominatim(q);
      }
      setPointSearchResults((prev) => ({ ...prev, [id]: data }));
    } catch (e: any) {
      console.error(e);
      if (e.message?.includes("Falta API")) alert(e.message);
      setPointSearchResults((prev) => ({ ...prev, [id]: [] }));
    } finally {
      setPointSearchLoading((prev) => ({ ...prev, [id]: false }));
    }
  };

  const handlePointSelect = (id: string, result: any) => {
    const lat = parseFloat(result.lat);
    const lon = parseFloat(result.lon);
    if (Number.isNaN(lat) || Number.isNaN(lon)) return;
    // copiar nombre desde Nominatim para reemplazar "Punto X"
    const newName = result.display_name ? String(result.display_name).split(",").slice(0, 3).join(", ").trim() : result.name || result.display_name || "";
    setMarkers((prev) => prev.map((m) => m.id === id ? { ...m, lat: Number(lat.toFixed(6)), lng: Number(lon.toFixed(6)), title: newName || m.title, description: m.description || result.type || "" } : m));
    setSelectedId(id);
    setPointSearchResults((prev) => ({ ...prev, [id]: [] }));
    setPointSearchQuery((prev) => ({ ...prev, [id]: "" }));
    setRouteCoords([]);
    setRouteInfo(null);
    if (mapRef.current) mapRef.current.flyTo([lat, lon], 15);
  };

  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(markers, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `mapa-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };
  const exportGeoJSON = () => {
    const geojson = {
      type: "FeatureCollection",
      features: markers.map((m) => ({
        type: "Feature",
        geometry: { type: "Point", coordinates: [m.lng, m.lat] },
        properties: { title: m.title, description: m.description, icon: m.icon, color: m.color, shape: m.shape ?? "pin", size: m.size ?? 38 },
      })),
    };
    const blob = new Blob([JSON.stringify(geojson, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `mapa-${new Date().toISOString().slice(0, 10)}.geojson`;
    a.click();
    URL.revokeObjectURL(url);
  };
  const exportCSV = () => {
    const head = "title,description,lat,lng,icon,color,shape,size";
    const rows = markers.map((m) => `"${m.title.replace(/"/g, '""')}","${m.description.replace(/"/g, '""')}",${m.lat},${m.lng},${m.icon},${m.color},${m.shape ?? "pin"},${m.size ?? 38}`);
    const csv = [head, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `mapa-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result as string);
        let imported: MarkerData[] = [];
        if (Array.isArray(parsed)) {
          imported = parsed;
        } else if (parsed.type === "FeatureCollection" && Array.isArray(parsed.features)) {
          imported = parsed.features.map((f: any) => ({
            id: generateId(),
            lat: f.geometry.coordinates[1],
            lng: f.geometry.coordinates[0],
            title: f.properties?.title ?? f.properties?.name ?? "Importado",
            description: f.properties?.description ?? "",
            icon: (f.properties?.icon as IconId) ?? "map-pin",
            color: f.properties?.color ?? "blue",
            shape: (f.properties?.shape === "square" || f.properties?.shape === "circle" ? f.properties.shape : "pin") as MarkerShape,
            size: typeof f.properties?.size === "number" ? Math.max(24, Math.min(52, Math.round(f.properties.size))) : 38,
          }));
        } else {
          throw new Error("Formato no reconocido");
        }
        // validate
        imported = imported.filter((m) => typeof m.lat === "number" && typeof m.lng === "number");
        if (imported.length === 0) throw new Error("Sin marcadores válidos");
        // ensure id/icon/color/shape/size
        imported = imported.map((m) => ({
          id: m.id ?? generateId(),
          lat: Number(m.lat),
          lng: Number(m.lng),
          title: String(m.title ?? "Sin título"),
          description: String(m.description ?? ""),
          icon: (m.icon as IconId) ?? "map-pin",
          color: m.color ?? "blue",
          shape: ((m as any).shape === "square" || (m as any).shape === "circle" ? (m as any).shape : "pin") as MarkerShape,
          size: typeof (m as any).size === "number" ? Math.max(24, Math.min(52, Math.round((m as any).size))) : 38,
        }));
        if (confirm(`Importar ${imported.length} puntos? Reemplazará los ${markers.length} actuales. Acepta para reemplazar, Cancela para añadir.`)) {
          setMarkers(imported);
        } else {
          setMarkers((prev) => [...prev, ...imported]);
        }
      } catch (err) {
        alert("Error importando: " + (err as Error).message);
      }
      if (fileInputRef.current) fileInputRef.current.value = "";
    };
    reader.readAsText(file);
  };

  const shareUrl = () => {
    try {
      const encoded = btoa(encodeURIComponent(JSON.stringify(markers)));
      const url = `${window.location.origin}${window.location.pathname}#map=${encoded}`;
      navigator.clipboard.writeText(url).then(() => {
        setShareCopied(true);
        setTimeout(() => setShareCopied(false), 2000);
      });
    } catch {}
  };

  const iconsMemo = useMemo(() => {
    if (showNumberInsteadOfIcon) {
      const map = new Map<string, L.DivIcon>();
      markers.forEach((m, idx) => {
        const shape = (m.shape ?? "pin") as MarkerShape;
        const size = Math.max(24, Math.min(52, m.size ?? globalMarkerSize ?? 38));
        const key = `${idx}-${m.color}-${rotationDeg}-${shape}-${size}`;
        const anchor = shape === "pin" ? [size / 2, size] : [size / 2, size / 2];
        map.set(
          key,
          L.divIcon({
            html: createNumberIconHtml(idx + 1, getColorHex(m.color), rotationDeg, shape, size),
            className: "custom-div-icon",
            iconSize: [size, size],
            iconAnchor: anchor as any,
            popupAnchor: shape === "pin" ? [0, -size] : [0, -size / 2],
          })
        );
      });
      return map;
    }
    const map = new Map<string, L.DivIcon>();
    markers.forEach((m) => {
      const shape = (m.shape ?? "pin") as MarkerShape;
      const size = Math.max(24, Math.min(52, m.size ?? globalMarkerSize ?? 38));
      const key = `${m.icon}-${m.color}-${rotationDeg}-${shape}-${size}`;
      if (!map.has(key)) {
        const anchor = shape === "pin" ? [size / 2, size] : [size / 2, size / 2];
        map.set(
          key,
          L.divIcon({
            html: createDivIconHtml(m.icon, getColorHex(m.color), rotationDeg, shape, size),
            className: "custom-div-icon",
            iconSize: [size, size],
            iconAnchor: anchor as any,
            popupAnchor: shape === "pin" ? [0, -size] : [0, -size / 2],
          })
        );
      }
    });
    return map;
  }, [markers, showNumberInsteadOfIcon, rotationDeg, globalMarkerSize]);

  const center: [number, number] = markers.length ? [markers[0].lat, markers[0].lng] : [-0.180653, -78.467834];
  const TABS = [
    { id: "archivo", label: "Archivo" },
    { id: "inicio", label: "Inicio" },
    { id: "puntos", label: "Puntos" },
    { id: "insertar", label: "Insertar" },
    { id: "vista", label: "Vista" },
    { id: "ruta", label: "Ruta" },
    { id: "exportar", label: "Exportar" },
    { id: "config", label: "Configuración" },
  ] as const;

  return (
    <div className="flex flex-col gap-4 w-full min-h-[720px] relative">
      <style>{`.custom-div-icon{background:transparent !important;border:none !important} .leaflet-popup-content{margin:12px 16px !important} .leaflet-popup-content-wrapper{border-radius:14px} .ribbon-group{border-right:1px solid #e2e8f0} .dark .ribbon-group{border-right-color:#1e293b} .ribbon-group:last-child{border-right:none}`}</style>

      {/* Ribbon superior estilo Word/Excel */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        {/* Barra de pestañas */}
        <div className="flex items-center gap-1 px-3 py-2 bg-[#f1f5f9] dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 overflow-x-auto scrollbar-thin">
          {/* Logo mini + titulo */}
          <div className="flex items-center gap-2 mr-3 pr-3 border-r border-slate-200 dark:border-slate-700 shrink-0">
            <span className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
            </span>
            <span className="text-xs font-black tracking-tight text-slate-700 dark:text-white hidden sm:inline">Mapa</span>
          </div>
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-md whitespace-nowrap transition border ${activeTab === t.id ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white border-slate-200 dark:border-slate-700 shadow-sm" : "bg-transparent text-slate-600 dark:text-slate-400 border-transparent hover:bg-white dark:hover:bg-slate-700 hover:text-slate-900"}`}
            >
              {t.label}
            </button>
          ))}
          <div className="ml-auto hidden md:flex items-center gap-2 text-[11px] font-mono text-slate-500 shrink-0">
            <span className={`px-2 py-1 rounded-full font-bold border truncate max-w-[180px] ${isDirty ? "bg-amber-500 text-white border-amber-500" : "bg-emerald-600 text-white border-emerald-600"}`} title={currentProjectName}>{currentProjectName}</span>
            <span className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-2 py-1 rounded-full font-bold">{markers.length} pts</span>
            <span className="hidden lg:inline">{rotationDeg}° · {TILE_PROVIDERS[tileProvider].label}</span>
          </div>
        </div>

        {/* Contenido de la cinta */}
        <div className="p-3 bg-white dark:bg-slate-900">
          {/* ARCHIVO - Mapas guardados + Nuevo mapa - ahora en ribbon, no lateral */}
          {activeTab === "archivo" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              <div className="lg:col-span-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Proyecto actual</p>
                <div className={`mt-1.5 rounded-xl border p-3 flex flex-col gap-2 ${isDirty ? "bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900" : "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900"}`}>
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${isDirty ? "bg-amber-500" : "bg-emerald-500"}`}></span>
                    <span className="text-xs font-black truncate flex-1 text-slate-900 dark:text-white">{currentProjectName}</span>
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full border ${isDirty ? "bg-amber-500 text-white border-amber-500" : "bg-emerald-600 text-white border-emerald-600"}`}>{isDirty ? "Cambios sin guardar" : markers.length===0 ? "Vacío" : "Guardado"}</span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-tight">
                    {isDirty ? "Tienes cambios locales no guardados. Usa Guardar o Actualizar abajo, o Nuevo mapa los auto-guardará con nombre aleatorio." : markers.length===0 ? "Mapa en blanco listo para empezar. Añade puntos en Inicio o Insertar." : "Todo guardado. Puedes seguir editando o crear un nuevo mapa."}
                  </p>
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    <button onClick={handleNewMap} className="text-xs font-black bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-3 py-2.5 rounded-xl flex items-center justify-center gap-1.5">
                      <span className="text-sm">＋</span> Nuevo mapa
                    </button>
                    <button onClick={() => { if (markers.length===0) return; const n = prompt("Nombre para guardar mapa actual:", currentProjectName !== "Mapa sin guardar" && currentProjectName !== "Mapa nuevo" ? currentProjectName : ""); if (n===null) return; const trimmed=n.trim(); if(!trimmed) return alert("Nombre vacío"); const np: MapProject={ id: generateId(), name: trimmed, createdAt: Date.now(), updatedAt: Date.now(), markers:[...markers], tileProvider, showPolyline }; setProjects(prev=>[np,...prev]); setCurrentProjectId(np.id); }} disabled={markers.length===0} className="text-xs font-bold bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white px-3 py-2.5 rounded-xl">Guardar como…</button>
                  </div>
                  {currentProjectId && isDirty && (
                    <button onClick={handleUpdateCurrentProject} className="w-full text-xs font-bold bg-white dark:bg-slate-800 border border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300 px-3 py-2 rounded-xl hover:bg-amber-50">Actualizar "{`"`}{projects.find(pr=>pr.id===currentProjectId)?.name}{`"`}"</button>
                  )}
                  <p className="text-[10px] text-slate-400">Nuevo mapa → guarda automáticamente el actual con nombre aleatorio (<code>Mapa DD/MM/AAAA HH:MM - xxx</code>) y limpia el lienzo. Nunca pierdes puntos.</p>
                </div>
              </div>
              <div className="lg:col-span-8">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Mapas guardados ({projects.length}) — localStorage</p>
                  <span className="text-[10px] font-mono bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-2 py-1 rounded-full">{projects.length} mapas</span>
                </div>
                <div className="flex gap-2 mt-2">
                  <input value={newProjectName} onChange={(e)=>setNewProjectName(e.target.value)} onKeyDown={(e)=>e.key==="Enter" && handleSaveProject()} placeholder="Nombre ej: Ruta Quito Centro" className="flex-1 text-sm border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 bg-white dark:bg-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500" />
                  <button onClick={handleSaveProject} disabled={markers.length===0} className="text-xs font-black bg-amber-500 hover:bg-amber-600 disabled:opacity-40 text-white px-4 py-2 rounded-xl">Guardar</button>
                </div>
                <div className="mt-2 max-h-[320px] overflow-y-auto space-y-2 pr-1 overscroll-contain border border-slate-200 dark:border-slate-700 rounded-xl p-2 bg-slate-50/50 dark:bg-slate-800/30">
                  {projects.length===0 ? (
                    <p className="text-xs text-slate-400 text-center py-6 border border-dashed border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800">Sin mapas guardados aún. Guarda el actual con un nombre arriba. <br/>O usa <b>Nuevo mapa</b> para auto-guardar con nombre aleatorio.</p>
                  ) : projects.slice().sort((a,b)=>b.updatedAt-a.updatedAt).map((proj)=> (
                    <div key={proj.id} className={`group border rounded-xl p-3 flex flex-col gap-2 ${currentProjectId===proj.id ? "border-amber-400 bg-amber-50/50 dark:bg-amber-950/20" : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"}`}>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          {renamingId===proj.id ? (
                            <div className="flex gap-1.5">
                              <input value={renameDraft} onChange={(e)=>setRenameDraft(e.target.value)} onKeyDown={(e)=>{if(e.key==="Enter") handleRenameProject(proj.id); if(e.key==="Escape") setRenamingId(null);}} autoFocus className="flex-1 text-sm border border-amber-300 dark:border-amber-700 rounded-lg px-2 py-1 bg-white dark:bg-slate-900 dark:text-white" />
                              <button onClick={()=>handleRenameProject(proj.id)} className="text-xs font-bold bg-emerald-600 text-white px-2 py-1 rounded-lg">OK</button>
                              <button onClick={()=>setRenamingId(null)} className="text-xs font-bold bg-slate-200 dark:bg-slate-700 px-2 py-1 rounded-lg">X</button>
                            </div>
                          ) : (
                            <>
                              <p className="text-sm font-black text-slate-900 dark:text-white truncate">{proj.name}</p>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400">{proj.markers.length} puntos · {new Date(proj.updatedAt).toLocaleDateString()} {new Date(proj.updatedAt).toLocaleTimeString().slice(0,5)} {currentProjectId===proj.id && "· activo"}</p>
                            </>
                          )}
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-1 rounded-full border ${currentProjectId===proj.id ? "bg-amber-500 text-white border-amber-500" : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600"}`}>{proj.markers.length}</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        <button onClick={()=>handleLoadProject(proj.id)} className={`text-[11px] font-bold px-2.5 py-1 rounded-lg ${currentProjectId===proj.id ? "bg-amber-500 text-white" : "bg-slate-900 dark:bg-white text-white dark:text-slate-900"}`}>Cargar</button>
                        <button onClick={()=>{setRenamingId(proj.id); setRenameDraft(proj.name);}} className="text-[11px] font-bold bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 px-2 py-1 rounded-lg">Renombrar</button>
                        <button onClick={()=>handleDuplicateProject(proj.id)} className="text-[11px] font-bold bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 px-2 py-1 rounded-lg">Duplicar</button>
                        <button onClick={()=>handleDeleteProject(proj.id)} className="text-[11px] font-bold text-red-600 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 px-2 py-1 rounded-lg">Eliminar</button>
                      </div>
                      <details className="text-[11px] text-slate-500 dark:text-slate-400">
                        <summary className="cursor-pointer font-semibold">Ver puntos</summary>
                        <ul className="mt-1 space-y-0.5 max-h-24 overflow-y-auto font-mono text-[11px] bg-slate-50 dark:bg-slate-800/50 rounded-lg p-2 border border-slate-100 dark:border-slate-700">
                          {proj.markers.map((m,i)=>(<li key={m.id} className="truncate">{i+1}. {m.title} — {m.lat.toFixed(4)},{m.lng.toFixed(4)}</li>))}
                        </ul>
                      </details>
                    </div>
                  ))}
                </div>
                <p className="text-[10px] text-slate-400 mt-2">Tip: <b>Nuevo mapa</b> nunca borra sin guardar — auto-genera <code>Mapa fecha hora - id</code>. Carga un proyecto, edita en <b>Puntos</b>, luego <b>Actualizar</b>.</p>
              </div>
            </div>
          )}
          {/* INICIO */}
          {activeTab === "inicio" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
              <div className="lg:col-span-2 ribbon-group pr-3 flex flex-col gap-2">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Portapapeles</p>
                <div className="grid grid-cols-2 gap-1.5">
                  <button onClick={(e) => { e.stopPropagation(); handleUndo(); }} disabled={historyIdx <= 0} className="text-[11px] font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-2 rounded-xl disabled:opacity-30 flex flex-col items-center gap-1">
                    <span className="text-base">↩</span>Deshacer
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); handleRedo(); }} disabled={historyIdx >= historyRef.current.length - 1} className="text-[11px] font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-2 rounded-xl disabled:opacity-30 flex flex-col items-center gap-1">
                    <span className="text-base">↪</span>Rehacer
                  </button>
                </div>
                <p className="text-[10px] text-slate-400 text-center">{historyIdx + 1}/{historyRef.current.length} · Ctrl+Z / Ctrl+Y</p>
                <div className="grid grid-cols-3 gap-1.5">
                  <button onClick={fitAll} disabled={markers.length === 0} className="text-xs font-bold bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-2 py-2 rounded-lg disabled:opacity-40">Ajustar vista</button>
                  <button onClick={handleNewMap} disabled={markers.length===0 && !currentProjectId} className="text-xs font-black bg-sky-600 hover:bg-sky-700 disabled:opacity-40 text-white px-2 py-2 rounded-lg flex items-center justify-center gap-1">＋ Nuevo</button>
                  <button onClick={() => { if (!confirm(`¿Borrar ${markers.length} puntos sin guardar? Usa Nuevo para auto-guardar con nombre aleatorio.`)) return; setMarkers([]); setRouteCoords([]); setRouteInfo(null); }} disabled={markers.length === 0} className="text-xs font-bold bg-red-50 dark:bg-red-950/30 text-red-600 border border-red-200 dark:border-red-900 px-2 py-2 rounded-lg disabled:opacity-40">Limpiar</button>
                </div>
                <p className="text-[9px] text-slate-400 leading-tight text-center">Nuevo = guarda actual como <code>Mapa fecha - id</code> + lienzo en blanco. Seguro, no pierdes puntos.</p>
              </div>
              <div className="lg:col-span-5 ribbon-group pr-3">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Nuevo punto</p>
                <input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Título del próximo punto (opcional)" className="mt-1.5 w-full text-sm border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 bg-white dark:bg-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                <div className="grid grid-cols-3 gap-2 mt-2">
                  <div>
                    <p className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">Ícono</p>
                    <div className="grid grid-cols-4 gap-1 max-h-[92px] overflow-y-auto pr-1">
                      {ICONS.slice(0, 16).map((ic) => (
                        <button key={ic.id} type="button" onClick={() => setSelectedIcon(ic.id)} className={`w-8 h-8 rounded-lg border-2 flex items-center justify-center transition ${selectedIcon === ic.id ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30" : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"}`} title={ic.label}>
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={selectedIcon === ic.id ? "#059669" : "currentColor"} strokeWidth="2" className={selectedIcon === ic.id ? "" : "text-slate-600 dark:text-slate-300"}><g dangerouslySetInnerHTML={{ __html: ic.svg }} /></svg>
                        </button>
                      ))}
                    </div>
                    <button onClick={() => document.getElementById("all-icons-inicio")?.classList.toggle("hidden")} className="text-[10px] font-bold text-emerald-600 mt-1">Ver {ICONS.length} →</button>
                    <div id="all-icons-inicio" className="hidden grid grid-cols-7 gap-1 mt-1 max-h-28 overflow-auto pr-1">
                      {ICONS.map((ic) => (
                        <button key={ic.id+"-all"} type="button" onClick={() => setSelectedIcon(ic.id)} className={`w-7 h-7 rounded-lg border flex items-center justify-center ${selectedIcon === ic.id ? "border-emerald-500 bg-emerald-50" : "border-slate-200 dark:border-slate-700"}`} title={ic.label}>
                          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><g dangerouslySetInnerHTML={{ __html: ic.svg }} /></svg>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">Color</p>
                    <div className="flex flex-wrap gap-1">
                      {COLORS.map((c) => (
                        <button key={c.id} onClick={() => setSelectedColor(c.id)} className={`w-6 h-6 rounded-full border-2 ${selectedColor === c.id ? "border-slate-900 dark:border-white scale-110" : "border-white dark:border-slate-700"}`} style={{ background: c.hex }} title={c.label}>{selectedColor === c.id && <span className="text-white text-[8px]">✓</span>}</button>
                      ))}
                    </div>
                    <p className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mt-2 mb-1">Forma</p>
                    <div className="grid grid-cols-3 gap-1">
                      {(["pin","square","circle"] as const).map((sh) => (
                        <button key={sh} type="button" onClick={() => setSelectedShape(sh)} className={`text-[10px] font-bold px-1 py-1.5 rounded-lg border flex flex-col items-center gap-1 ${selectedShape === sh ? "bg-sky-600 text-white border-sky-600" : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"}`}>{sh==="pin"?"Pin":sh==="square"?"□":"○"}</button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">Tamaño {selectedSize}px</p>
                    <div className="flex items-center gap-1">
                      <button type="button" onClick={() => setSelectedSize((s)=>Math.max(24,s-4))} className="w-7 h-7 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg flex items-center justify-center text-xs">−</button>
                      <input type="range" min={24} max={52} step={2} value={selectedSize} onChange={(e)=>setSelectedSize(parseInt(e.target.value))} className="flex-1 accent-emerald-600" />
                      <button type="button" onClick={() => setSelectedSize((s)=>Math.min(52,s+4))} className="w-7 h-7 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg flex items-center justify-center text-xs">+</button>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-2 leading-tight">Clic en mapa para añadir. Forma+color+ícono del próximo punto.</p>
                    <div className="mt-1 flex items-center gap-1.5 text-[11px]"><IconPreview icon={selectedIcon} color={selectedColor} /><span className="text-xs font-bold truncate">{newTitle || `Punto ${markers.length+1}`}</span></div>
                  </div>
                </div>
              </div>
              <div className="lg:col-span-3 ribbon-group pr-3">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Vista</p>
                <div className="grid grid-cols-2 gap-1.5 mt-1.5">
                  <button type="button" onClick={() => setShowNumberInsteadOfIcon(false)} className={`text-xs font-bold px-2 py-2 rounded-xl border ${!showNumberInsteadOfIcon ? "bg-emerald-600 text-white border-emerald-600" : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"}`}>Ícono</button>
                  <button type="button" onClick={() => setShowNumberInsteadOfIcon(true)} className={`text-xs font-bold px-2 py-2 rounded-xl border ${showNumberInsteadOfIcon ? "bg-violet-600 text-white border-violet-600" : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"}`}>N.º</button>
                </div>
                <div className="mt-2">
                  <p className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider flex items-center justify-between">Tamaño global <span className="font-mono bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-1.5 py-0.5 rounded-full text-[10px]">{globalMarkerSize}px</span></p>
                  <input type="range" min={24} max={52} step={2} value={globalMarkerSize} onChange={(e)=>setGlobalMarkerSize(parseInt(e.target.value))} className="w-full accent-sky-600 mt-1" />
                  <div className="grid grid-cols-2 gap-1 mt-1">
                    <button type="button" onClick={()=>handleGlobalSize(globalMarkerSize)} className="text-[11px] font-bold bg-sky-600 text-white px-2 py-1.5 rounded-lg">Aplicar a todos</button>
                    <button type="button" onClick={handleResetSizes} className="text-[11px] font-bold bg-white dark:bg-slate-800 border px-2 py-1.5 rounded-lg">Reset</button>
                  </div>
                </div>
              </div>
              <div className="lg:col-span-2">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Consejos</p>
                <ul className="text-[11px] text-slate-600 dark:text-slate-400 mt-1.5 space-y-1 leading-tight list-disc list-inside">
                  <li>Clic mapa = añadir</li>
                  <li>Arrastra pin = mover</li>
                  <li>↑↓ en Puntos = reordenar ruta</li>
                  <li>Sin límite 10 de Google</li>
                </ul>
                <p className="text-[10px] text-slate-400 mt-2">Pestañas: <b>Puntos</b> edita lista completa, <b>Insertar</b> busca, <b>Vista</b> fondo/rotación.</p>
              </div>
            </div>
          )}

          {activeTab === "puntos" && (
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Puntos ({markers.length}) — orden = orden de ruta</p>
                <div className="flex items-center gap-2 text-[11px]">
                  <span className="text-slate-400">Google limit 10 · aquí ∞</span>
                  <button onClick={fitAll} disabled={markers.length===0} className="text-xs font-bold bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-2.5 py-1 rounded-lg disabled:opacity-40">Ajustar vista</button>
                </div>
              </div>
              {markers.length===0 ? (
                <div className="text-center py-8 border border-dashed border-slate-200 dark:border-slate-700 rounded-xl">
                  <p className="text-sm font-bold text-slate-600 dark:text-slate-300">Sin puntos aún</p>
                  <p className="text-xs text-slate-400 mt-1">Añade desde Inicio o Insertar → Buscar</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2 max-h-[420px] overflow-y-auto pr-1">
                  {markers.map((m, idx)=> (
                    <div key={m.id} onClick={()=>setSelectedId(m.id)} className={`border rounded-xl p-2.5 flex flex-col gap-2 cursor-pointer ${selectedId===m.id ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20 ring-1 ring-emerald-500/30" : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-300"}`}>
                      <div className="flex gap-2">
                        <div className="shrink-0 flex flex-col items-center gap-1">
                          <span className="text-[10px] font-mono font-bold text-slate-400">#{idx+1}</span>
                          {showNumberInsteadOfIcon ? <span className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-black border-2 border-white shadow" style={{background:getColorHex(m.color)}}>{idx+1}</span> : <IconPreview icon={m.icon} color={m.color} />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{m.title}</p>
                          {m.description && <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">{m.description}</p>}
                          <p className="text-[10px] font-mono text-slate-400">{m.lat.toFixed(5)}, {m.lng.toFixed(5)}</p>
                        </div>
                        <div className="flex flex-col gap-1">
                          <button onClick={()=>moveMarker(m.id,-1)} disabled={idx===0} className="w-6 h-6 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg disabled:opacity-30 text-[11px]">↑</button>
                          <button onClick={()=>moveMarker(m.id,1)} disabled={idx===markers.length-1} className="w-6 h-6 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg disabled:opacity-30 text-[11px]">↓</button>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        <button onClick={(e)=>{e.stopPropagation(); mapRef.current?.flyTo([m.lat,m.lng],16); setSelectedId(m.id);}} className="text-[11px] font-bold bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-2 py-1 rounded-lg">Ver</button>
                        <button onClick={()=>startEdit(m)} className="text-[11px] font-bold bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 px-2 py-1 rounded-lg">Editar</button>
                        <button onClick={()=>handleDuplicate(m)} className="text-[11px] font-bold bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 px-2 py-1 rounded-lg">⧉</button>
                        <button onClick={()=>handleDelete(m.id)} className="text-[11px] font-bold text-red-600 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 px-2 py-1 rounded-lg">Eliminar</button>
                      </div>
                      <div className="flex items-center gap-1">
                        <button type="button" onClick={()=>updateMarkerSize(m.id,(m.size??globalMarkerSize??38)-4)} className="w-6 h-6 bg-white dark:bg-slate-800 border rounded-lg text-xs">−</button>
                        <input type="range" min={24} max={52} step={2} value={m.size??globalMarkerSize??38} onChange={(e)=>updateMarkerSize(m.id,parseInt(e.target.value))} className="flex-1 accent-sky-600" />
                        <button type="button" onClick={()=>updateMarkerSize(m.id,(m.size??globalMarkerSize??38)+4)} className="w-6 h-6 bg-white dark:bg-slate-800 border rounded-lg text-xs">+</button>
                        <span className="text-[10px] font-mono bg-sky-50 dark:bg-sky-950/30 px-1.5 py-0.5 rounded">{m.size??globalMarkerSize??38}px</span>
                      </div>
                      <div className="grid grid-cols-3 gap-1">
                        {(["pin","square","circle"] as const).map((sh)=>(
                          <button key={sh} type="button" onClick={()=>setMarkers(prev=>prev.map(x=>x.id===m.id?{...x,shape:sh}:x))} className={`text-[10px] font-bold px-1 py-1 rounded-lg border ${ (m.shape??"pin")===sh ? "bg-sky-600 text-white border-sky-600" : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"}`}>{sh==="pin"?"Pin":sh==="square"?"□":"○"}</button>
                        ))}
                      </div>
                      <div className="pt-1.5 border-t border-slate-100 dark:border-slate-700">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Corregir sin borrar · <span className={geocodeProvider==="both"?"text-indigo-600":geocodeProvider==="geoapify"?"text-violet-600":"text-emerald-600"}>{geocodeProvider==="both"?"ambas":geocodeProvider}</span></p>
                        <div className="flex gap-1 mt-1">
                          <input value={pointSearchQuery[m.id]||""} onChange={(e)=>setPointSearchQuery(prev=>({...prev,[m.id]:e.target.value}))} onKeyDown={(e)=>{if(e.key==="Enter") handlePointSearch(m.id)}} placeholder="Ej: Av. Shyris, Quito" className="flex-1 text-xs border border-slate-200 dark:border-slate-600 rounded-lg px-2 py-1 bg-white dark:bg-slate-900 dark:text-white" />
                          <button onClick={()=>handlePointSearch(m.id)} disabled={!!pointSearchLoading[m.id]} className="text-[11px] font-bold bg-emerald-600 text-white px-2 py-1 rounded-lg disabled:opacity-40">{pointSearchLoading[m.id]?"…":"Buscar"}</button>
                        </div>
                        {(pointSearchResults[m.id]?.length||0)>0 && (
                          <ul className="mt-1 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden divide-y max-h-32 overflow-y-auto">
                            {pointSearchResults[m.id]!.slice(0,5).map((r:any)=>(
                              <li key={r.place_id} onClick={()=>handlePointSelect(m.id,r)} className="px-2 py-1.5 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 cursor-pointer">
                                <p className="text-[11px] font-semibold text-slate-800 dark:text-slate-100 line-clamp-1">{r.display_name}</p>
                                <p className="text-[10px] text-slate-500">{parseFloat(r.lat).toFixed(4)},{parseFloat(r.lon).toFixed(4)} · {r.source}</p>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex gap-2 mt-2">
                <button onClick={exportJSON} className="text-xs font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-lg">JSON</button>
                <button onClick={exportGeoJSON} className="text-xs font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-lg">GeoJSON</button>
                <button onClick={exportCSV} className="text-xs font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-lg">CSV</button>
                <button onClick={shareUrl} className="text-xs font-bold bg-emerald-600 text-white px-3 py-1.5 rounded-lg ml-auto">{shareCopied?"¡Copiado!":"Compartir link"}</button>
                <button onClick={()=>fileInputRef.current?.click()} className="text-xs font-bold bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-lg">Importar</button>
                <input ref={fileInputRef} type="file" accept=".json,.geojson" className="hidden" onChange={importFile} />
              </div>
            </div>
          )}

          {activeTab === "insertar" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Buscar dirección</p>
                  <select value={geocodeProvider} onChange={(e)=>setGeocodeProvider(e.target.value as any)} className="text-xs border border-slate-200 dark:border-slate-700 rounded-full px-2.5 py-1 bg-white dark:bg-slate-800 dark:text-white font-bold">
                    <option value="nominatim">Nominatim (OSM)</option>
                    <option value="geoapify">Geoapify</option>
                    <option value="both">Ambas (10)</option>
                  </select>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Escribe una dirección y añade como punto. Proveedor: <b className={geocodeProvider==="both"?"text-indigo-600":geocodeProvider==="geoapify"?"text-violet-600":"text-emerald-600"}>{geocodeProvider}</b></p>
                <div className="flex gap-2 mt-2">
                  <input value={searchQuery} onChange={(e)=>setSearchQuery(e.target.value)} onKeyDown={(e)=>e.key==="Enter" && handleSearch()} placeholder={geocodeProvider==="both"?"Ej: Av. Amazonas, Quito (Ambas)":geocodeProvider==="geoapify"?"Ej: Av. Orellana, Quito (Geoapify)":"Ej: Av. Amazonas, Quito (Nominatim)"} className="flex-1 text-sm border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 bg-white dark:bg-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                  <button onClick={handleSearch} disabled={searchLoading || (geocodeProvider!=="nominatim" && !geoapifyToken)} className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-sm font-bold px-4 rounded-xl">{searchLoading?"…":"Buscar"}</button>
                </div>
                {searchResults.length>0 && (
                  <ul className="mt-2 max-h-56 overflow-auto divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl">
                    {searchResults.map((r:any)=>(
                      <li key={r.place_id} className="p-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer flex gap-2 items-start" onClick={()=>{ const lat=parseFloat(r.lat), lon=parseFloat(r.lon); handleAddMarker(lat,lon,r.display_name.split(",").slice(0,2).join(",")); if(mapRef.current) mapRef.current.flyTo([lat,lon],15); setSearchResults([]); setSearchQuery(""); }}>
                        <span className="mt-0.5 text-emerald-600"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg></span>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-slate-800 dark:text-slate-100 truncate">{r.display_name}</p>
                          <p className="text-[11px] text-slate-500 flex items-center gap-1.5"><span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full border ${r.source==="geoapify"?"bg-violet-600 text-white border-violet-600":"bg-emerald-600 text-white border-emerald-600"}`}>{r.source}</span>{r.type} · {parseFloat(r.lat).toFixed(4)}, {parseFloat(r.lon).toFixed(4)}</p>
                        </div>
                        <span className="text-[11px] font-bold text-emerald-600 shrink-0">+ Añadir</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-3">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Cómo insertar</p>
                <ul className="text-xs text-slate-600 dark:text-slate-400 mt-2 space-y-1.5 leading-relaxed">
                  <li>• <b>Clic en mapa</b> añade punto con estilo de Inicio.</li>
                  <li>• <b>Buscar</b> y clic en resultado añade automáticamente.</li>
                  <li>• <b>Importar JSON/GeoJSON</b> desde Exportar → Importar.</li>
                  <li>• En <b>Puntos</b> puedes corregir cada pin con búsqueda individual.</li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === "vista" && (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
              <div className="border border-slate-200 dark:border-slate-700 rounded-xl p-3">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Fondo del mapa</p>
                <select value={tileProvider} onChange={(e)=>setTileProvider(e.target.value as TileProvider)} className="mt-1.5 w-full text-sm border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 bg-white dark:bg-slate-800 dark:text-white">
                  {Object.entries(TILE_PROVIDERS).map(([k,v])=> <option key={k} value={k}>{v.label}</option>)}
                </select>
                <label className="flex items-center gap-1.5 mt-3 text-xs font-semibold text-slate-700 dark:text-slate-300"><input type="checkbox" checked={showPolyline} onChange={(e)=>setShowPolyline(e.target.checked)} className="accent-emerald-600" /> Unir con línea</label>
                <label className="flex items-center gap-1.5 mt-2 text-xs font-semibold text-slate-700 dark:text-slate-300"><input type="checkbox" checked={clusterEnabled} onChange={(e)=>setClusterEnabled(e.target.checked)} className="accent-amber-600" /> Agrupar amontonados</label>
                <p className="text-[10px] text-slate-400 mt-1">Cluster evita solapamiento · clic para expandir/spider.</p>
              </div>
              <div className="border border-slate-200 dark:border-slate-700 rounded-xl p-3">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Rotación</p>
                <p className="text-[11px] text-slate-500 mt-1">Gira el lienzo {rotationDeg}° (no afecta coords).</p>
                <div className="flex gap-1.5 mt-2">
                  <button type="button" onClick={()=>rotateMap(-45)} className="flex-1 text-xs font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-2 rounded-xl">↺ 45°</button>
                  <button type="button" onClick={()=>rotateMap(45)} className="flex-1 text-xs font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-2 rounded-xl">↻ 45°</button>
                  <button type="button" onClick={()=>{setRotationDeg(0); setTimeout(()=>mapRef.current?.invalidateSize(),350);}} className="text-xs font-bold bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-3 py-2 rounded-xl">Reset</button>
                </div>
                <div className="flex gap-1.5 mt-2">
                  <input type="number" value={rotationInput} onChange={(e)=>setRotationInput(e.target.value)} placeholder="45" className="w-20 text-xs border border-slate-200 dark:border-slate-700 rounded-xl px-2 py-2 bg-white dark:bg-slate-800 dark:text-white font-mono" />
                  <button type="button" onClick={()=>rotateMap(-parseInt(rotationInput||"0")||0)} className="flex-1 text-[11px] font-bold bg-white dark:bg-slate-800 border px-2 py-2 rounded-xl">↺ X°</button>
                  <button type="button" onClick={()=>rotateMap(parseInt(rotationInput||"0")||0)} className="flex-1 text-[11px] font-bold bg-white dark:bg-slate-800 border px-2 py-2 rounded-xl">↻ X°</button>
                  <button type="button" onClick={handleCustomRotate} className="text-[11px] font-bold bg-violet-600 text-white px-3 py-2 rounded-xl">Ir a</button>
                </div>
                <div className="flex items-center gap-3 mt-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2">
                  <div ref={knobRef} onMouseDown={handleKnobPointerDown} onTouchStart={handleKnobPointerDown} className="w-16 h-16 rounded-full border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 relative shadow-inner cursor-grab active:cursor-grabbing select-none shrink-0 touch-none">
                    <div className="absolute left-1/2 top-1/2 w-1 h-1 bg-slate-900 dark:bg-white rounded-full -translate-x-1/2 -translate-y-1/2"></div>
                    <div className="absolute left-1/2 top-1 w-1.5 h-6 bg-emerald-500 rounded-full -translate-x-1/2 origin-bottom" style={{ transform: `translateX(-50%) rotate(${rotationDeg}deg)` }}></div>
                    <span className="absolute inset-0 flex items-center justify-center text-[9px] font-mono font-bold text-slate-500 mt-4">{rotationDeg}°</span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-tight flex-1">Perilla 360°: arrastra la aguja verde. El contenedor 200% cubre esquinas sin blanco.</p>
                </div>
              </div>
              <div className="border border-slate-200 dark:border-slate-700 rounded-xl p-3">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Apariencia de pins</p>
                <div className="flex gap-1.5 mt-2">
                  <button type="button" onClick={()=>setShowNumberInsteadOfIcon(false)} className={`flex-1 text-xs font-bold px-2 py-2 rounded-xl border ${!showNumberInsteadOfIcon ? "bg-emerald-600 text-white border-emerald-600" : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"}`}>Ícono</button>
                  <button type="button" onClick={()=>setShowNumberInsteadOfIcon(true)} className={`flex-1 text-xs font-bold px-2 py-2 rounded-xl border ${showNumberInsteadOfIcon ? "bg-violet-600 text-white border-violet-600" : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"}`}>N.º</button>
                </div>
                <p className="text-[10px] text-slate-400 mt-2">N.º muestra orden de ruta · útil para planificación.</p>
                <div className="mt-3">
                  <p className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider flex items-center justify-between">Tamaño global <span className="font-mono bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-1.5 py-0.5 rounded-full text-[10px]">{globalMarkerSize}px</span></p>
                  <input type="range" min={24} max={52} step={2} value={globalMarkerSize} onChange={(e)=>setGlobalMarkerSize(parseInt(e.target.value))} className="w-full accent-sky-600 mt-1" />
                  <div className="grid grid-cols-2 gap-1 mt-1">
                    <button type="button" onClick={()=>handleGlobalSize(globalMarkerSize)} className="text-[11px] font-bold bg-sky-600 text-white px-2 py-1.5 rounded-lg">Aplicar a todos</button>
                    <button type="button" onClick={handleResetSizes} className="text-[11px] font-bold bg-white dark:bg-slate-800 border px-2 py-1.5 rounded-lg">Reset</button>
                  </div>
                </div>
              </div>
              <div className="border border-slate-200 dark:border-slate-700 rounded-xl p-3 bg-sky-50/50 dark:bg-sky-950/20">
                <p className="text-[10px] font-black uppercase tracking-widest text-sky-700 dark:text-sky-300">Trucos de vista</p>
                <ul className="text-[11px] text-slate-600 dark:text-slate-400 mt-2 space-y-1 leading-relaxed list-disc list-inside">
                  <li>Reduce tamaño global para ver cientos de puntos.</li>
                  <li>Usa círculo/cuadrado para solapados (menos alto que pin).</li>
                  <li>Cluster activado agrupa a nivel ciudad.</li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === "ruta" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="border border-slate-200 dark:border-slate-700 rounded-xl p-3">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2"><span className="w-6 h-6 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white text-[10px]">↗</span> Configurar ruta</p>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">Modo
                    <select value={routeMode} onChange={(e)=>setRouteMode(e.target.value as any)} className="mt-1 w-full text-xs border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-2 bg-white dark:bg-slate-800 dark:text-white">
                      <option value="drive">Auto</option>
                      <option value="walk">A pie</option>
                      <option value="bicycle">Bici</option>
                    </select>
                  </label>
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 flex flex-col justify-end">
                    <span className="flex items-center gap-1.5 pb-1"><input type="checkbox" checked={optimizeStops} onChange={(e)=>setOptimizeStops(e.target.checked)} className="accent-violet-600" /> Optimizar orden</span>
                    <span className="text-[10px] font-normal text-slate-400">fija 1º y último</span>
                  </label>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 flex items-center gap-2">Color <input type="color" value={routeColor} onChange={(e)=>setRouteColor(e.target.value)} className="w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-700 p-0.5 bg-white dark:bg-slate-800" /> <span className="text-[11px] font-mono px-2 py-1 rounded-full border bg-white dark:bg-slate-800" style={{color:routeColor, borderColor:routeColor}}>{routeColor}</span></label>
                  <div className="ml-auto flex gap-1">
                    {["#7c3aed","#059669","#dc2626","#ea580c","#2563eb","#000000"].map(c=>(
                      <button key={c} onClick={()=>setRouteColor(c)} className={`w-6 h-6 rounded-full border-2 ${routeColor===c?"border-slate-900 dark:border-white scale-110":"border-white dark:border-slate-600"}`} style={{background:c}} title={c} />
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-3">
                  <button onClick={handleDrawRoute} disabled={routeLoading || markers.length<2 || !geoapifyToken} className="text-xs font-black bg-violet-600 hover:bg-violet-700 disabled:opacity-40 text-white px-3 py-2.5 rounded-xl flex items-center justify-center gap-1.5">{routeLoading?"Calculando…":"Dibujar ruta"}</button>
                  <button onClick={handleClearRoute} disabled={routeCoords.length===0 && !routeError} className="text-xs font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2.5 rounded-xl disabled:opacity-40">Limpiar</button>
                </div>
                {!geoapifyToken && <p className="text-[11px] text-amber-600 mt-2">Config → guarda tu API key para habilitar.</p>}
                {markers.length<2 && <p className="text-[11px] text-slate-400 mt-2">Necesitas ≥2 puntos · reordena en Puntos con ↑↓ y vuelve a dibujar.</p>}
                {routeError && <p className="text-xs text-red-600 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-xl px-3 py-2 mt-2">{routeError}</p>}
                {routeInfo && (
                  <div className="text-xs bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 rounded-xl px-3 py-2 mt-2">
                    <p className="font-bold text-emerald-800 dark:text-emerald-300">Ruta lista — {(routeInfo.distance/1000).toFixed(2)} km · {Math.round(routeInfo.time/60)} min</p>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400">{routeCoords.length} pts geometría · {optimizeStops?"optimizado":"secuencial"}</p>
                  </div>
                )}
              </div>
              <div className="border border-slate-200 dark:border-slate-700 rounded-xl p-3 bg-violet-50/50 dark:bg-violet-950/20">
                <p className="text-[10px] font-black uppercase tracking-widest text-violet-700 dark:text-violet-300">Cómo funciona</p>
                <ul className="text-xs text-slate-600 dark:text-slate-400 mt-2 space-y-1.5 leading-relaxed list-disc list-inside">
                  <li>Usa <b>Geoapify Routing</b> (orden fijo por defecto).</li>
                  <li><b>Optimizar</b> aplica TSP manteniendo primero y último fijos.</li>
                  <li>Reordena marcadores en <b>Puntos</b> y vuelve a <b>Dibujar</b> para probar variantes.</li>
                  <li>La línea se dibuja sobre el mapa y se ajusta la vista automáticamente.</li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === "exportar" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="border border-slate-200 dark:border-slate-700 rounded-xl p-3">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Exportar datos</p>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <button onClick={exportJSON} className="text-xs font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 rounded-xl hover:bg-slate-50">JSON</button>
                  <button onClick={exportGeoJSON} className="text-xs font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 rounded-xl hover:bg-slate-50">GeoJSON</button>
                  <button onClick={exportCSV} className="text-xs font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 rounded-xl hover:bg-slate-50">CSV</button>
                  <button onClick={shareUrl} className="text-xs font-bold bg-emerald-600 text-white px-3 py-2 rounded-xl hover:bg-emerald-700">{shareCopied?"¡Copiado!":"Compartir link"}</button>
                </div>
                <div className="mt-2 flex gap-2">
                  <button onClick={()=>fileInputRef.current?.click()} className="flex-1 text-xs font-bold bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 rounded-xl">Importar JSON/GeoJSON</button>
                  <input ref={fileInputRef} type="file" accept=".json,.geojson" className="hidden" onChange={importFile} />
                </div>
                <p className="text-[10px] text-slate-400 mt-2">Importar: reemplaza o añade · Exportar: descarga inmediata.</p>
              </div>
              <div className="border border-slate-200 dark:border-slate-700 rounded-xl p-3">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center justify-between">Alta resolución <span className="font-mono bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-2 py-0.5 rounded-full text-[10px]">{markers.length} pts · {rotationDeg}°</span></p>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">Tamaño
                    <select value={exportSize} onChange={(e)=>{setExportSize(e.target.value as any); if(e.target.value!=="actual") setPdfPageSize(e.target.value as any);}} className="mt-1 w-full text-xs border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-2 bg-white dark:bg-slate-800 dark:text-white">
                      {Object.entries(EXPORT_PRESETS).map(([k,v])=> <option key={k} value={k}>{v.label}</option>)}
                    </select>
                  </label>
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">Formato
                    <select value={exportFormat} onChange={(e)=>setExportFormat(e.target.value as any)} className="mt-1 w-full text-xs border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-2 bg-white dark:bg-slate-800 dark:text-white font-bold">
                      <option value="png">PNG</option>
                      <option value="jpeg">JPG</option>
                      <option value="pdf">PDF</option>
                    </select>
                  </label>
                </div>
                {exportFormat==="pdf" && (
                  <div className="mt-2 p-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">Página PDF
                        <select value={pdfPageSize} onChange={(e)=>setPdfPageSize(e.target.value as any)} className="mt-1 w-full text-xs border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-2 bg-white dark:bg-slate-800 dark:text-white">
                          {Object.entries(PDF_PAGE_SIZES).map(([k,v])=> <option key={k} value={k}>{v.label}</option>)}
                        </select>
                      </label>
                      <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">Letra tabla: {pdfFontSize}pt
                        <input type="range" min={7} max={12} step={0.5} value={pdfFontSize} onChange={(e)=>setPdfFontSize(parseFloat(e.target.value))} className="w-full mt-1 accent-violet-600" />
                      </label>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={handleGeneratePdfPreview} disabled={pdfPreviewLoading} className="flex-1 text-xs font-bold bg-white dark:bg-slate-800 border border-violet-300 dark:border-violet-700 text-violet-700 dark:text-violet-300 px-3 py-2 rounded-xl disabled:opacity-40">{pdfPreviewLoading?"Generando…":"Vista previa"}</button>
                      <button onClick={handleExportPdf} disabled={exportLoading || markers.length===0} className="flex-1 text-xs font-black bg-violet-600 hover:bg-violet-700 disabled:opacity-40 text-white px-3 py-2 rounded-xl">{exportLoading?"Generando…":"Exportar PDF"}</button>
                    </div>
                    {showPdfPreview && (
                      <div className="border border-violet-200 dark:border-violet-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900">
                        <div className="flex items-center justify-between px-3 py-2 bg-violet-50 dark:bg-violet-950/30 border-b">
                          <span className="text-xs font-black text-violet-700 dark:text-violet-300">Vista previa</span>
                          <button onClick={()=>setShowPdfPreview(false)} className="text-xs font-bold bg-white dark:bg-slate-800 border px-2 py-1 rounded-lg">Cerrar</button>
                        </div>
                        <div className="p-2 max-h-[360px] overflow-auto space-y-2">
                          <p className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Portada</p>
                          <div className="bg-slate-100 dark:bg-slate-800 border rounded-xl p-2 flex flex-col items-center">
                            {pdfPreviewUrl ? <img src={pdfPreviewUrl} alt="preview" className="max-w-full h-auto rounded-lg border" style={{aspectRatio: EXPORT_PRESETS[exportSize].aspect==="auto" ? undefined : EXPORT_PRESETS[exportSize].aspect as any}} /> : <span className="text-xs text-slate-400 py-6">Genera vista previa</span>}
                          </div>
                          <p className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Tabla ({markers.length} filas · {pdfFontSize}pt)</p>
                          <div className="border rounded-xl overflow-hidden overflow-x-auto">
                            <table className="w-full text-left border-collapse" style={{fontSize: `${pdfFontSize}px`}}>
                              <thead className="bg-slate-900 dark:bg-white text-white dark:text-slate-900"><tr>{["#","Título","Lat","Lng"].map(h=> <th key={h} className="px-2 py-1 font-bold whitespace-nowrap">{h}</th>)}</tr></thead>
                              <tbody>{markers.slice(0,8).map((m,i)=> <tr key={m.id} className={i%2===1?"bg-slate-50 dark:bg-slate-800/50":"bg-white dark:bg-slate-900"}><td className="px-2 py-1 font-mono">{i+1}</td><td className="px-2 py-1 truncate max-w-[150px]">{m.title}</td><td className="px-2 py-1 font-mono">{m.lat.toFixed(5)}</td><td className="px-2 py-1 font-mono">{m.lng.toFixed(5)}</td></tr>)}{markers.length>8 && <tr><td colSpan={4} className="text-center text-[11px] text-slate-400 py-1">… +{markers.length-8} más</td></tr>}</tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                {exportFormat!=="pdf" && (
                  <div className="mt-2 flex gap-2">
                    <button onClick={handleExportPreset} disabled={exportLoading} className="flex-1 text-xs font-black bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-3 py-2.5 rounded-xl disabled:opacity-40">{exportLoading?"Exportando…":`Exportar ${exportFormat.toUpperCase()} ${EXPORT_PRESETS[exportSize].w ? `${EXPORT_PRESETS[exportSize].w}×${EXPORT_PRESETS[exportSize].h}` : "actual"}`}</button>
                    <button onClick={()=>{setExportFormat("pdf"); handleGeneratePdfPreview();}} className="text-xs font-bold bg-white dark:bg-slate-800 border px-3 py-2.5 rounded-xl">Ver PDF</button>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "config" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="border border-slate-200 dark:border-slate-700 rounded-xl p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-1.5"><span className={`w-2 h-2 rounded-full ${geoapifyToken ? "bg-emerald-500" : "bg-amber-500"}`}></span> Geoapify API Key</p>
                  <a href="https://myprojects.geoapify.com" target="_blank" rel="noopener noreferrer" className="text-[11px] font-bold text-emerald-600 hover:underline">Obtener key →</a>
                </div>
                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">Solo en tu navegador (<code className="bg-slate-100 dark:bg-slate-800 px-1 rounded">localStorage: geoapify-api-key</code>) · fetch directo a api.geoapify.com {geoapifyToken ? <span className="text-emerald-600 font-bold">· listo</span> : <span className="text-amber-600">· falta</span>}</p>
                <div className="flex gap-2 mt-2">
                  <div className="relative flex-1">
                    <input type={showToken ? "text" : "password"} value={geoapifyInput} onChange={(e)=>setGeoapifyInput(e.target.value)} placeholder="Ej: 3b7a... (pega tu apiKey)" className="w-full text-sm border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 pr-9 bg-white dark:bg-slate-800 dark:text-white placeholder:text-slate-400 font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                    <button type="button" onClick={()=>setShowToken(!showToken)} className="absolute right-1 top-1 bottom-1 w-7 flex items-center justify-center text-slate-400 hover:text-slate-600">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d={showToken ? "M9.88 9.88a3 3 0 1 0 4.24 4.24" : "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"} /><circle cx="12" cy="12" r="3" /></svg>
                    </button>
                  </div>
                </div>
                <div className="flex gap-2 mt-2">
                  <button onClick={handleSaveToken} disabled={!geoapifyInput.trim() || geoapifyInput.trim()===geoapifyToken} className="flex-1 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white px-3 py-2 rounded-xl">Guardar</button>
                  <button onClick={handleClearToken} disabled={!geoapifyToken} className="text-xs font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 rounded-xl disabled:opacity-40">Borrar</button>
                  <span className={`text-[11px] font-mono px-2 py-1 rounded-full border self-center ${geoapifyToken?"bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 border-emerald-200":"bg-amber-50 dark:bg-amber-950/30 text-amber-700 border-amber-200"}`}>{geoapifyToken?"✓ configurado":"○ falta key"}</span>
                </div>
              </div>
              <div className="border border-slate-200 dark:border-slate-700 rounded-xl p-3">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Proveedor de búsqueda</p>
                <select value={geocodeProvider} onChange={(e)=>setGeocodeProvider(e.target.value as any)} className="mt-2 w-full text-sm border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 bg-white dark:bg-slate-800 dark:text-white font-bold">
                  <option value="nominatim">Nominatim (OSM) — libre</option>
                  <option value="geoapify">Geoapify — con tu key</option>
                  <option value="both">Ambas (10 máx = 5+5)</option>
                </select>
                <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">Cambia cómo se buscan direcciones: en <b>Insertar</b> y en cada pin de <b>Puntos</b>. Recomendado <b>Ambas</b> para más aciertos.</p>
                <details className="mt-2 group">
                  <summary className="text-[11px] font-bold text-slate-600 dark:text-slate-400 cursor-pointer select-none">¿Ruta óptima (TSP)? — info</summary>
                  <div className="mt-2 text-[11px] text-slate-500 leading-relaxed bg-slate-50 dark:bg-slate-800/50 border rounded-xl p-2">
                    Usa Geoapify Routing / Route Planner. Tu proyecto ya incluye <code>routing-api-openapi-specs.json</code>. En pestaña <b>Ruta</b> puedes dibujar secuencial u optimizado.
                  </div>
                </details>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Cuerpo: mapa a ancho completo - todo en Ribbon, sin laterales */}
      <div className="w-full">
        <div ref={mapExportRef} className="flex-1 min-h-[560px] lg:h-[calc(100vh-220px)] lg:min-h-[640px] lg:sticky lg:top-4 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm relative bg-slate-100 dark:bg-slate-900">
          <div style={{ transform: `rotate(${rotationDeg}deg)`, transformOrigin: "center center", transition: "transform 0.35s ease", position: "absolute", inset: "-50%", width: "200%", height: "200%" }}>
            <MapContainer center={center} zoom={13} style={{ height: "100%", width: "100%" }} ref={mapRef as any} zoomControl={false}>
              <TileLayer attribution={TILE_PROVIDERS[tileProvider].attribution} url={TILE_PROVIDERS[tileProvider].url} crossOrigin={true} keepBuffer={2} updateWhenZooming={false} />
              <MapClickHandler onAdd={handleAddMarker} rotationDeg={rotationDeg} />
              {showPolyline && markers.length > 1 && routeCoords.length === 0 && (
                <Polyline positions={markers.map((m) => [m.lat, m.lng] as [number, number])} pathOptions={{ color: "#10b981", weight: 3, opacity: 0.7, dashArray: "8 8" }} />
              )}
              {routeCoords.length > 0 && (
                <Polyline positions={routeCoords} pathOptions={{ color: routeColor, weight: 5, opacity: 0.85 }} />
              )}
              <ClusteredMarkers markers={markers} clusterEnabled={clusterEnabled} spiderClusterId={spiderClusterId} setSpiderClusterId={setSpiderClusterId} iconsMemo={iconsMemo} showNumberInsteadOfIcon={showNumberInsteadOfIcon} rotationDeg={rotationDeg} mapRef={mapRef} setMarkers={setMarkers} setSelectedId={setSelectedId} startEdit={startEdit} getColorHex={getColorHex as any} createDivIconHtml={createDivIconHtml as any} createNumberIconHtml={createNumberIconHtml as any} globalMarkerSize={globalMarkerSize} />
            </MapContainer>
          </div>
          <div data-no-export className="absolute top-3 right-3 z-[400] flex flex-col gap-2">
            <button onClick={() => mapRef.current?.zoomIn()} className="w-9 h-9 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow flex items-center justify-center font-black text-slate-700 dark:text-white hover:bg-slate-50" aria-label="Zoom in">+</button>
            <button onClick={() => mapRef.current?.zoomOut()} className="w-9 h-9 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow flex items-center justify-center font-black text-slate-700 dark:text-white hover:bg-slate-50" aria-label="Zoom out">−</button>
            <button onClick={fitAll} className="w-9 h-9 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow flex items-center justify-center text-slate-700 dark:text-white hover:bg-slate-50" title="Ajustar a todos">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 3h6v6"/><path d="M9 21H3v-6"/><path d="M21 3l-7 7"/><path d="M3 21l7-7"/></svg>
            </button>
          </div>
          <div data-no-export className="absolute bottom-3 left-3 z-[400] bg-white/95 dark:bg-slate-800/95 backdrop-blur border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-[11px] font-mono text-slate-600 dark:text-slate-300 shadow">
            Clic para añadir · Arrastra para mover
          </div>
        </div>
      </div>

      {/* Modal edición */}
      {editingId && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setEditingId(null)} />
          <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
            <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
              <h3 className="font-black text-slate-900 dark:text-white">Editar punto</h3>
              <button onClick={() => setEditingId(null)} className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700">✕</button>
            </div>
            <div className="p-5 space-y-4 overflow-auto">
              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Título</label>
                <input value={draftTitle} onChange={(e) => setDraftTitle(e.target.value)} placeholder="Ej: Mitad del Mundo" className="mt-1 w-full text-sm border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 bg-white dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Descripción</label>
                <textarea value={draftDesc} onChange={(e) => setDraftDesc(e.target.value)} placeholder="Notas, horario, etc." rows={3} className="mt-1 w-full text-sm border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 bg-white dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Latitud</label>
                  <input value={draftLat} onChange={(e) => setDraftLat(e.target.value)} className="mt-1 w-full text-sm font-mono border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 bg-white dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Longitud</label>
                  <input value={draftLng} onChange={(e) => setDraftLng(e.target.value)} className="mt-1 w-full text-sm font-mono border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 bg-white dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2 block">Ícono ({ICONS.length} opciones)</label>
                <div className="grid grid-cols-7 sm:grid-cols-8 gap-1.5">
                  {ICONS.map((ic) => (
                    <button key={ic.id} type="button" onClick={() => setDraftIcon(ic.id)} className={`w-10 h-10 rounded-xl border-2 flex items-center justify-center transition ${draftIcon === ic.id ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40" : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-300"}`} title={ic.label}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={draftIcon === ic.id ? "#059669" : "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={draftIcon === ic.id ? "" : "text-slate-600 dark:text-slate-300"}>
                        <g dangerouslySetInnerHTML={{ __html: ic.svg }} />
                      </svg>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2 block">Color</label>
                <div className="flex flex-wrap gap-2">
                  {COLORS.map((c) => (
                    <button key={c.id} type="button" onClick={() => setDraftColor(c.id)} className={`w-9 h-9 rounded-full border-2 flex items-center justify-center transition ${draftColor === c.id ? "border-slate-900 dark:border-white scale-110" : "border-white dark:border-slate-700 shadow-sm"}`} style={{ background: c.hex }} title={c.label}>
                      {draftColor === c.id && <span className="text-white text-xs font-bold">✓</span>}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2 block">Forma</label>
                <div className="grid grid-cols-3 gap-2">
                  {(["pin", "square", "circle"] as const).map((sh) => (
                    <button key={sh} type="button" onClick={() => setDraftShape(sh)} className={`text-xs font-bold px-3 py-2 rounded-xl border flex flex-col items-center gap-1 ${draftShape === sh ? "bg-sky-600 text-white border-sky-600" : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"}`}>
                      <span className="w-7 h-7 flex items-center justify-center" style={{ background: getColorHex(draftColor), borderRadius: sh === "circle" ? "50%" : sh === "square" ? "8px" : "50% 50% 50% 0", transform: sh === "pin" ? "rotate(-45deg)" : "none", border: "1.5px solid white" }}><span style={{ transform: sh === "pin" ? "rotate(45deg)" : "none", display: "flex" }}><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><g dangerouslySetInnerHTML={{ __html: (ICONS.find((i) => i.id === draftIcon)?.svg ?? ICONS[0].svg) }} /></svg></span></span>
                      {sh === "pin" ? "Pin" : sh === "square" ? "Cuadrado" : "Círculo"}
                    </button>
                  ))}
                </div>
              </div>
              <div className="bg-sky-50 dark:bg-sky-950/20 border border-sky-100 dark:border-sky-900 rounded-xl p-3">
                <label className="text-xs font-black text-sky-700 dark:text-sky-300 uppercase tracking-wider flex items-center justify-between">⤢ Tamaño marker <span className="font-mono text-[11px] bg-sky-600 text-white px-2 py-0.5 rounded-full">{draftSize}px</span></label>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">24 pequeño — 52 grande.</p>
                <div className="flex items-center gap-2 mt-2">
                  <button type="button" onClick={() => setDraftSize(String(Math.max(24, parseInt(draftSize || "38") - 4)))} className="w-9 h-9 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl flex items-center justify-center">−</button>
                  <input type="range" min={24} max={52} step={2} value={parseInt(draftSize || "38")} onChange={(e) => setDraftSize(e.target.value)} className="flex-1 accent-sky-600" />
                  <button type="button" onClick={() => setDraftSize(String(Math.min(52, parseInt(draftSize || "38") + 4)))} className="w-9 h-9 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl flex items-center justify-center">+</button>
                </div>
                <div className="flex gap-2 mt-2">
                  <input type="number" value={draftSize} onChange={(e) => setDraftSize(e.target.value)} className="flex-1 text-sm font-mono border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 bg-white dark:bg-slate-800 dark:text-white" placeholder="24-52" />
                  <button type="button" onClick={() => setDraftSize("38")} className="text-xs font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 rounded-xl">Reset 38px</button>
                </div>
              </div>
              <div className="flex items-center gap-2 pt-2">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  Vista previa: <span className="w-8 h-8 rounded-full flex items-center justify-center border-2 border-white shadow" style={{ background: getColorHex(draftColor) }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><g dangerouslySetInnerHTML={{ __html: (ICONS.find(i=>i.id===draftIcon)?.svg ?? ICONS[0].svg) }} /></svg>
                  </span>
                </div>
              </div>
            </div>
            <div className="px-5 py-4 border-t border-slate-100 dark:border-slate-800 flex gap-3 shrink-0 bg-slate-50 dark:bg-slate-800/50">
              <button onClick={() => setEditingId(null)} className="flex-1 text-sm font-bold bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 px-4 py-2.5 rounded-xl hover:bg-slate-50">Cancelar</button>
              <button onClick={saveEdit} className="flex-1 text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl">Guardar cambios</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
