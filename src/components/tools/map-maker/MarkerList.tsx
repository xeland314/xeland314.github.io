import { getColorHex } from "./icons";
import type { MarkerData } from "./types";
import type { IconId } from "./icons";
import { ICONS } from "./icons";

function IconPreview({ icon, color }: { icon: IconId; color: string }) {
  const def = ICONS.find((i) => i.id === icon) ?? ICONS[0];
  const hex = getColorHex(color);
  return (
    <span className="w-8 h-8 rounded-full flex items-center justify-center border-2 border-white shadow" style={{ background: hex }}>
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <g dangerouslySetInnerHTML={{ __html: def.svg }} />
      </svg>
    </span>
  );
}

type Props = {
  markers: MarkerData[];
  selectedId: string | null;
  setSelectedId: (id: string | null) => void;
  showNumberInsteadOfIcon: boolean;
  mapRef: React.MutableRefObject<any>;
  moveMarker: (id: string, dir: -1 | 1) => void;
  startEdit: (m: MarkerData) => void;
  handleDuplicate: (m: MarkerData) => void;
  handleDelete: (id: string) => void;
  pointSearchQuery: Record<string, string>;
  setPointSearchQuery: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  pointSearchResults: Record<string, any[]>;
  pointSearchLoading: Record<string, boolean>;
  handlePointSearch: (id: string) => void;
  handlePointSelect: (id: string, result: any) => void;
  geocodeProvider: string;
  historyIdx: number;
  historyRef: React.MutableRefObject<MarkerData[][]>;
  handleUndo: () => void;
  handleRedo: () => void;
};

export function MarkerList({
  markers,
  selectedId,
  setSelectedId,
  showNumberInsteadOfIcon,
  mapRef,
  moveMarker,
  startEdit,
  handleDuplicate,
  handleDelete,
  pointSearchQuery,
  setPointSearchQuery,
  pointSearchResults,
  pointSearchLoading,
  handlePointSearch,
  handlePointSelect,
  geocodeProvider,
  historyIdx,
  historyRef,
  handleUndo,
  handleRedo,
}: Props) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col shadow-sm">
      <div className="p-4 pb-3 border-b border-slate-100 dark:border-slate-800 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest">Puntos ({markers.length})</h3>
          <span className="text-[11px] text-slate-400">Google limit 10 · aquí ∞</span>
        </div>
        <div className="flex gap-1.5">
          <button onClick={(e) => { e.stopPropagation(); handleUndo(); }} disabled={historyIdx <= 0} className="flex-1 text-[11px] font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-1.5 rounded-xl disabled:opacity-30 flex items-center justify-center gap-1" title="Ctrl+Z">↩ Deshacer</button>
          <button onClick={(e) => { e.stopPropagation(); handleRedo(); }} disabled={historyIdx >= historyRef.current.length - 1} className="flex-1 text-[11px] font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-1.5 rounded-xl disabled:opacity-30 flex items-center justify-center gap-1" title="Ctrl+Y / Ctrl+Shift+Z / Ctrl+X">↪ Rehacer</button>
        </div>
        <p className="text-[10px] text-slate-400">Ctrl+Z deshacer · Ctrl+Y / Ctrl+Shift+Z / Ctrl+X rehacer · {historyIdx + 1}/{historyRef.current.length}</p>
      </div>

      <div className="max-h-[520px] overflow-y-auto p-2 space-y-2 overscroll-contain pr-1">
        {markers.length === 0 ? (
          <div className="text-center py-10 px-4">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mb-3">📍</div>
            <p className="text-sm font-bold text-slate-600 dark:text-slate-300">Sin puntos aún</p>
            <p className="text-xs text-slate-400 mt-1">Haz clic en el mapa o usa el buscador para empezar. Puedes añadir cientos.</p>
          </div>
        ) : markers.map((m, idx) => (
          <div key={m.id} onClick={() => setSelectedId(m.id)} className={`group border rounded-xl p-3 flex gap-3 cursor-pointer transition ${selectedId === m.id ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 ring-2 ring-emerald-500/30 shadow-md" : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600"}`}>
            <div className="shrink-0 flex flex-col items-center gap-1">
              <span className="text-[10px] font-mono font-bold text-slate-400">#{idx + 1}</span>
              {showNumberInsteadOfIcon ? (
                <span className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-black border-2 border-white shadow" style={{ background: getColorHex(m.color) }}>{idx + 1}</span>
              ) : (
                <IconPreview icon={m.icon} color={m.color} />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{m.title}</p>
              {m.description && <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{m.description}</p>}
              <p className="text-[11px] font-mono text-slate-400 mt-1">{m.lat.toFixed(5)}, {m.lng.toFixed(5)}</p>
              <div className="flex flex-wrap gap-1 mt-2 items-center">
                <div className="flex gap-0.5 mr-1">
                  <button onClick={() => moveMarker(m.id, -1)} disabled={idx === 0} className="w-6 h-6 flex items-center justify-center bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-l-lg disabled:opacity-30 text-[10px]">↑</button>
                  <button onClick={() => moveMarker(m.id, 1)} disabled={idx === markers.length - 1} className="w-6 h-6 flex items-center justify-center bg-white dark:bg-slate-700 border-t border-b border-r border-slate-200 dark:border-slate-600 rounded-r-lg disabled:opacity-30 text-[10px]">↓</button>
                </div>
                <button onClick={(e) => { e.stopPropagation(); setSelectedId(m.id); mapRef.current?.flyTo([m.lat, m.lng], 16); }} className="text-[11px] font-bold bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-2 py-1 rounded-lg hover:opacity-90">Ver</button>
                <button onClick={() => startEdit(m)} className="text-[11px] font-bold bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 px-2 py-1 rounded-lg hover:bg-slate-50">Editar</button>
                <button onClick={() => handleDuplicate(m)} className="text-[11px] font-bold bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 px-2 py-1 rounded-lg hover:bg-slate-50" title="Duplicar">⧉</button>
                <button onClick={() => handleDelete(m.id)} className="text-[11px] font-bold text-red-600 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 px-2 py-1 rounded-lg hover:bg-red-100">Eliminar</button>
              </div>
              <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-700">
                <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Corregir ubicación sin borrar · <span className={geocodeProvider === "both" ? "text-indigo-600" : geocodeProvider === "geoapify" ? "text-violet-600" : "text-emerald-600"}>{geocodeProvider === "both" ? "ambas" : geocodeProvider}</span></label>
                <div className="flex gap-1.5 mt-1">
                  <input value={pointSearchQuery[m.id] || ""} onChange={(e) => setPointSearchQuery((prev) => ({ ...prev, [m.id]: e.target.value }))} onKeyDown={(e) => { if (e.key === "Enter") handlePointSearch(m.id); }} placeholder={geocodeProvider === "both" ? "Ej: Av. Shyris, Quito (Ambas)" : geocodeProvider === "geoapify" ? "Ej: Quicentro, Quito (Geoapify)" : "Ej: Av. Shyris, Quito (Nominatim)"} className="flex-1 text-xs border border-slate-200 dark:border-slate-600 rounded-lg px-2 py-1.5 bg-white dark:bg-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono" />
                  <button onClick={() => handlePointSearch(m.id)} disabled={pointSearchLoading[m.id]} className="text-[11px] font-bold bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white px-2.5 py-1.5 rounded-lg">{pointSearchLoading[m.id] ? "…" : "Buscar"}</button>
                </div>
                {(pointSearchResults[m.id]?.length || 0) > 0 && (
                  <ul className="mt-1.5 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden divide-y divide-slate-100 dark:divide-slate-800 max-h-48 overflow-y-auto">
                    {pointSearchResults[m.id]!.slice(0, 10).map((r: any) => (
                      <li key={r.place_id} onClick={() => handlePointSelect(m.id, r)} className="px-2.5 py-2 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 cursor-pointer">
                        <p className="text-[11px] font-semibold text-slate-800 dark:text-slate-100 leading-tight line-clamp-2">{r.display_name}</p>
                        <p className="text-[10px] text-slate-500 flex items-center gap-1.5"><span className={`text-[9px] font-black px-1 py-0.5 rounded-full border ${r.source === "geoapify" ? "bg-violet-600 text-white border-violet-600" : "bg-emerald-600 text-white border-emerald-600"}`}>{r.source || geocodeProvider}</span>{r.type} · {parseFloat(r.lat).toFixed(4)},{parseFloat(r.lon).toFixed(4)} · click para mover</p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
