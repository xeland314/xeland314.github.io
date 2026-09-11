import type { GeocodeProvider } from "./types";

type Props = {
  searchQuery: string;
  setSearchQuery: (v: string) => void;
  searchResults: any[];
  searchLoading: boolean;
  geocodeProvider: GeocodeProvider;
  setGeocodeProvider: (v: GeocodeProvider) => void;
  geoapifyToken: string;
  handleSearch: () => void;
  handleAddMarker: (lat: number, lng: number, title?: string) => void;
  mapRef: React.MutableRefObject<any>;
  setSearchResults: (v: any[]) => void;
  setSearchQueryState: (v: string) => void;
};

export function SearchBar({
  searchQuery,
  setSearchQuery,
  searchResults,
  searchLoading,
  geocodeProvider,
  setGeocodeProvider,
  geoapifyToken,
  handleSearch,
  handleAddMarker,
  mapRef,
  setSearchResults,
  setSearchQueryState,
}: Props) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest">Buscar dirección</label>
        <select value={geocodeProvider} onChange={(e) => setGeocodeProvider(e.target.value as GeocodeProvider)} className="text-xs border border-slate-200 dark:border-slate-700 rounded-full px-2.5 py-1 bg-white dark:bg-slate-800 dark:text-white font-bold">
          <option value="nominatim">Nominatim (OSM)</option>
          <option value="geoapify">Geoapify</option>
          <option value="both">Ambas (10 máx)</option>
        </select>
      </div>
      <p className="text-[11px] text-slate-400 mt-1">
        Proveedor: <b className={geocodeProvider === "both" ? "text-indigo-600" : geocodeProvider === "geoapify" ? "text-violet-600" : "text-emerald-600"}>{geocodeProvider === "both" ? "ambas" : geocodeProvider}</b> · {geocodeProvider === "both" ? "combina Geoapify + Nominatim (hasta 10)" : geocodeProvider === "geoapify" ? "usa tu key embebida" : "OSM libre"} · {geocodeProvider === "both" ? "5+5" : "hasta 5"} sugerencias
      </p>
      <div className="flex gap-2 mt-2">
        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          placeholder={geocodeProvider === "both" ? "Ej: Av. Amazonas, Quito (Ambas)" : geocodeProvider === "geoapify" ? "Ej: Av. Orellana, Quito (Geoapify)" : "Ej: Av. Amazonas, Quito (Nominatim)"}
          className="flex-1 text-sm border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 bg-white dark:bg-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
        <button
          onClick={handleSearch}
          disabled={searchLoading || (geocodeProvider === "geoapify" && !geoapifyToken) || (geocodeProvider === "both" && !geoapifyToken)}
          className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-sm font-bold px-4 rounded-xl transition"
          title={geocodeProvider !== "nominatim" && !geoapifyToken ? "Falta API key Geoapify" : ""}
        >
          {searchLoading ? "…" : "Buscar"}
        </button>
      </div>
      {searchResults.length > 0 && (
        <ul className="mt-3 max-h-48 overflow-auto divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl">
          {searchResults.map((r: any) => (
            <li
              key={r.place_id}
              className="p-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer flex gap-2 items-start"
              onClick={() => {
                const lat = parseFloat(r.lat),
                  lon = parseFloat(r.lon);
                handleAddMarker(lat, lon, r.display_name.split(",").slice(0, 2).join(","));
                if (mapRef.current) mapRef.current.flyTo([lat, lon], 15);
                setSearchResults([]);
                setSearchQueryState("");
              }}
            >
              <span className="mt-0.5 text-emerald-600">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-100 truncate">{r.display_name}</p>
                <p className="text-[11px] text-slate-500 flex items-center gap-1.5">
                  <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full border ${r.source === "geoapify" ? "bg-violet-600 text-white border-violet-600" : r.source === "nominatim" ? "bg-emerald-600 text-white border-emerald-600" : "bg-slate-200"}`}>{r.source || geocodeProvider}</span>
                  {r.type} · {parseFloat(r.lat).toFixed(4)}, {parseFloat(r.lon).toFixed(4)}
                </p>
              </div>
              <span className="text-[11px] font-bold text-emerald-600 shrink-0">+ Añadir</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
