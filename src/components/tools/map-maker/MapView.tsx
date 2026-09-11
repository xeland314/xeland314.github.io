import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { getColorHex, createDivIconHtml, ICONS } from "./icons";
import type { MarkerData, TileProvider } from "./types";
import { TILE_PROVIDERS } from "./constants";
import { getCorrectedLatLng } from "./rotation";
import type { IconId } from "./icons";

function MapClickHandler({ onAdd, rotationDeg }: { onAdd: (lat: number, lng: number) => void; rotationDeg: number }) {
  const map = useMap();
  useMapEvents({
    click(e) {
      const target = e.originalEvent?.target as HTMLElement | null;
      if (target?.closest?.(".leaflet-marker-icon, .leaflet-popup, .leaflet-control, .leaflet-interactive")) return;
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

export type MapViewProps = {
  markers: MarkerData[];
  tileProvider: TileProvider;
  showPolyline: boolean;
  routeCoords: [number, number][];
  routeColor: string;
  rotationDeg: number;
  center: [number, number];
  mapRef: React.MutableRefObject<L.Map | null>;
  mapExportRef: React.RefObject<HTMLDivElement | null>;
  showNumberInsteadOfIcon: boolean;
  iconsMemo: Map<string, L.DivIcon>;
  onAddMarker: (lat: number, lng: number) => void;
  onMarkerDragEnd: (id: string, lat: number, lng: number) => void;
  onMarkerClick: (id: string) => void;
  onStartEdit: (m: MarkerData) => void;
  onFitAll: () => void;
};

export function MapView({
  markers,
  tileProvider,
  showPolyline,
  routeCoords,
  routeColor,
  rotationDeg,
  center,
  mapRef,
  mapExportRef,
  showNumberInsteadOfIcon,
  iconsMemo,
  onAddMarker,
  onMarkerDragEnd,
  onMarkerClick,
  onStartEdit,
  onFitAll,
}: MapViewProps) {
  return (
    <div
      ref={mapExportRef}
      className="flex-1 min-h-[520px] lg:h-[calc(100vh-32px)] lg:min-h-[640px] lg:sticky lg:top-4 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm relative bg-slate-100 dark:bg-slate-900"
    >
      <div
        style={{
          transform: `rotate(${rotationDeg}deg)`,
          transformOrigin: "center center",
          transition: "transform 0.35s ease",
          position: "absolute",
          inset: "-50%",
          width: "200%",
          height: "200%",
        }}
      >
        <MapContainer center={center} zoom={13} style={{ height: "100%", width: "100%" }} ref={mapRef as any} zoomControl={false}>
          <TileLayer attribution={TILE_PROVIDERS[tileProvider].attribution} url={TILE_PROVIDERS[tileProvider].url} crossOrigin={true} keepBuffer={2} updateWhenZooming={false} />
          <MapClickHandler onAdd={onAddMarker} rotationDeg={rotationDeg} />

          {showPolyline && markers.length > 1 && routeCoords.length === 0 && (
            <Polyline positions={markers.map((m) => [m.lat, m.lng] as [number, number])} pathOptions={{ color: "#10b981", weight: 3, opacity: 0.7, dashArray: "8 8" }} />
          )}
          {routeCoords.length > 0 && <Polyline positions={routeCoords} pathOptions={{ color: routeColor, weight: 5, opacity: 0.85 }} />}

          {markers.map((m, idx) => {
            const iconKey = showNumberInsteadOfIcon ? `${idx}-${m.color}-${rotationDeg}` : `${m.icon}-${m.color}-${rotationDeg}`;
            const icon = iconsMemo.get(iconKey) || L.divIcon({ html: createDivIconHtml(m.icon as IconId, getColorHex(m.color), rotationDeg), className: "custom-div-icon", iconSize: [38, 38], iconAnchor: [19, 38], popupAnchor: [0, -38] });
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
                          const corrected = getCorrectedLatLng(mapRef.current, cx, cy, rotationDeg);
                          lat = corrected.lat;
                          lng = corrected.lng;
                        }
                      } catch {}
                    }
                    onMarkerDragEnd(m.id, lat, lng);
                  },
                  click: () => onMarkerClick(m.id),
                  popupopen: (e: any) => {
                    const map = e.target._map as L.Map;
                    if (!map) return;
                    try {
                      const px = map.project(e.target.getLatLng(), map.getZoom());
                      px.y -= 110;
                      const offsetLatLng = map.unproject(px, map.getZoom());
                      map.panTo(offsetLatLng, { animate: true, duration: 0.4 });
                    } catch {}
                  },
                }}
              >
                <Popup autoPan={false}>
                  <div className="min-w-[180px]">
                    <p className="font-black text-slate-900 text-sm flex items-center gap-2">
                      {showNumberInsteadOfIcon ? (
                        <span className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-black border-2 border-white shadow" style={{ background: getColorHex(m.color) }}>
                          {idx + 1}
                        </span>
                      ) : (
                        <span className="w-8 h-8 rounded-full flex items-center justify-center border-2 border-white shadow" style={{ background: getColorHex(m.color) }}>
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                            <g dangerouslySetInnerHTML={{ __html: (ICONS.find((i) => i.id === m.icon) ?? ICONS[0]).svg }} />
                          </svg>
                        </span>
                      )}
                      {m.title}
                    </p>
                    {m.description && <p className="text-xs text-slate-600 mt-1">{m.description}</p>}
                    <p className="text-[11px] font-mono text-slate-400 mt-1">
                      {m.lat.toFixed(6)}, {m.lng.toFixed(6)}
                    </p>
                    <div className="flex gap-1 mt-2">
                      <a href={`https://www.google.com/maps/search/?api=1&query=${m.lat},${m.lng}`} target="_blank" rel="noopener noreferrer" className="text-[11px] font-bold bg-slate-900 text-white px-2 py-1 rounded-lg">
                        Google Maps
                      </a>
                      <button onClick={() => onStartEdit(m)} className="text-[11px] font-bold bg-white border border-slate-200 px-2 py-1 rounded-lg">
                        Editar
                      </button>
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>

      <div data-no-export className="absolute top-3 right-3 z-[400] flex flex-col gap-2">
        <button onClick={() => mapRef.current?.zoomIn()} className="w-9 h-9 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow flex items-center justify-center font-black text-slate-700 dark:text-white hover:bg-slate-50" aria-label="Zoom in">
          +
        </button>
        <button onClick={() => mapRef.current?.zoomOut()} className="w-9 h-9 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow flex items-center justify-center font-black text-slate-700 dark:text-white hover:bg-slate-50" aria-label="Zoom out">
          −
        </button>
        <button onClick={onFitAll} className="w-9 h-9 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow flex items-center justify-center text-slate-700 dark:text-white hover:bg-slate-50" title="Ajustar a todos">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 3h6v6" />
            <path d="M9 21H3v-6" />
            <path d="M21 3l-7 7" />
            <path d="M3 21l7-7" />
          </svg>
        </button>
      </div>

      <div data-no-export className="absolute bottom-3 left-3 z-[400] bg-white/95 dark:bg-slate-800/95 backdrop-blur border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-[11px] font-mono text-slate-600 dark:text-slate-300 shadow">
        Clic para añadir · Arrastra para mover
      </div>
    </div>
  );
}
