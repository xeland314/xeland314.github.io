import { useEffect, useMemo, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import rawPoints from "./data.json";

type Punto = {
  id: string;
  lat: number;
  lng: number;
  title: string;
  description: string;
  color: string;
};

type LatLng = { lat: number; lng: number };
type Sample = { punto: Punto; dH: number; dEff: number; score: number };

const DATA = rawPoints as Punto[];

const SCORE_BY_COLOR: Record<string, number> = { blue: 1, amber: 0.5, red: 0 };
const CAT_COLOR: Record<string, string> = {
  blue: "#2563eb",
  amber: "#f59e0b",
  red: "#ef4444",
};
const CAT_LABEL: Record<string, string> = {
  blue: "Escucha clara",
  amber: "Parcial / interferencia",
  red: "Sin señal",
};

// Oficinas ICON (piso 3) / Norio (piso 4): arrastrable en el mapa
const DEFAULT_BASE: LatLng = { lat: -0.2058, lng: -78.4956 };
const GEOAPIFY_KEY_DEFAULT = "d4d5a2e38d934da287b79d360de83e5d";

type MapStyle = {
  id: string;
  label: string;
  url: string;
  attribution: string;
  maxZoom: number;
  subdomains?: string | string[];
};

const MAP_STYLES: MapStyle[] = [
  {
    id: "voyager",
    label: "Claro (CARTO)",
    url: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
    maxZoom: 20,
    subdomains: ["a", "b", "c", "d"],
  },
  {
    id: "osm",
    label: "OSM estándar",
    url: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 19,
  },
  {
    id: "dark",
    label: "Oscuro (CARTO)",
    url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
    maxZoom: 20,
    subdomains: ["a", "b", "c", "d"],
  },
  {
    id: "satelite",
    label: "Satélite (Esri)",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution: "Tiles &copy; Esri — Source: Esri, Maxar, Earthstar Geographics",
    maxZoom: 19,
  },
  {
    id: "topo",
    label: "Topográfico (OpenTopoMap)",
    url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
    attribution: '&copy; <a href="https://www.opentopomap.org">OpenTopoMap</a> (CC-BY-SA)',
    maxZoom: 17,
    subdomains: ["a", "b", "c"],
  },
];
const ATTRIBUTION = MAP_STYLES[0].attribution;

function haversine(a: LatLng, b: LatLng): number {
  const R = 6371000;
  const toRad = (x: number) => (x * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

const sigma = (z: number) => 1 / (1 + Math.exp(-z));

/**
 * Regresión logística por máxima verosimilitud (Newton-Raphson, 2 parámetros):
 * P(ser escuchado) = sigma(a - b*d). Con pocos puntos cualitativos da una
 * curva suave y el radio donde P cae por debajo de un umbral.
 */
function fitLogistic(
  ds: number[],
  ss: number[],
): { a: number; b: number; ok: boolean } {
  const n = ds.length;
  if (n < 2) return { a: 0, b: 0, ok: false };
  let a = 0;
  let b = 0.001;
  for (let it = 0; it < 300; it++) {
    let ga = 0;
    let gb = 0;
    let haa = 0;
    let hab = 0;
    let hbb = 0;
    for (let i = 0; i < n; i++) {
      const d = ds[i];
      const p = sigma(a - b * d);
      const w = p * (1 - p) + 1e-9;
      const e = ss[i] - p;
      ga += e;
      gb += -d * e;
      haa -= w;
      hab += w * d;
      hbb -= w * d * d;
    }
    const det = haa * hbb - hab * hab;
    if (!isFinite(det) || Math.abs(det) < 1e-12) break;
    const da = (ga * hbb - gb * hab) / det;
    const db = (haa * gb - hab * ga) / det;
    a += Math.max(-2, Math.min(2, da));
    b += Math.max(-0.5, Math.min(0.5, db));
    if (!isFinite(a) || !isFinite(b)) return { a: 0, b: 0, ok: false };
    if (Math.abs(da) < 1e-10 && Math.abs(db) < 1e-12) break;
  }
  if (b <= 0) return { a, b: 0, ok: false };
  return { a, b, ok: true };
}

function heatColor(p: number): [number, number, number, number] {
  const t = Math.max(0, Math.min(1, p));
  let r: number;
  let g: number;
  let b: number;
  if (t >= 0.5) {
    const k = (t - 0.5) / 0.5;
    r = 245 + (34 - 245) * k;
    g = 158 + (197 - 158) * k;
    b = 11 + (94 - 11) * k;
  } else {
    const k = t / 0.5;
    r = 239 + (245 - 239) * k;
    g = 68 + (158 - 68) * k;
    b = 68 + (11 - 68) * k;
  }
  return [Math.round(r), Math.round(g), Math.round(b), Math.round(255 * (0.16 + 0.34 * t))];
}

async function fetchElevations(pts: LatLng[]): Promise<number[]> {
  const lat = pts.map((p) => p.lat.toFixed(6)).join(",");
  const lng = pts.map((p) => p.lng.toFixed(6)).join(",");
  const res = await fetch(
    `https://api.open-meteo.com/v1/elevation?latitude=${lat}&longitude=${lng}`,
  );
  const json = await res.json();
  return json.elevation as number[];
}

export default function HeatMap() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const tileRef = useRef<L.TileLayer | null>(null);
  const heatLayerRef = useRef<L.ImageOverlay | null>(null);
  const circleLayerRef = useRef<L.LayerGroup | null>(null);
  const baseMarkerRef = useRef<L.Marker | null>(null);
  const lastElevBaseRef = useRef<LatLng | null>(null);

  const [base, setBase] = useState<LatLng>(DEFAULT_BASE);
  const [useDh, setUseDh] = useState(false);
  const [altura, setAltura] = useState(12);
  const [elevBase, setElevBase] = useState<number | null>(null);
  const [elevPoints, setElevPoints] = useState<number[] | null>(null);
  const [elevLoading, setElevLoading] = useState(false);
  const [styleId, setStyleId] = useState("voyager");
  const [searchQuery, setSearchQuery] = useState("");
  const [address, setAddress] = useState("Oficinas ICON (p3) / Norio (p4) — arrastra para ajustar");
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoProvider, setGeoProvider] = useState<"nominatim" | "geoapify">("nominatim");
  const [geoKey, setGeoKey] = useState(GEOAPIFY_KEY_DEFAULT);
  const [geoError, setGeoError] = useState("");
  const [showChart, setShowChart] = useState(false);
  const chartRef = useRef<HTMLDivElement>(null);

  const model = useMemo(() => {
    const samples: Sample[] = DATA.map((punto, i) => {
      const dH = haversine(base, punto);
      const score = SCORE_BY_COLOR[punto.color] ?? 0.5;
      let dEff = dH;
      if (useDh && elevBase !== null && elevPoints) {
        const penalty = Math.max(elevPoints[i] - elevBase - altura, 0);
        dEff = Math.hypot(dH, penalty);
      }
      return { punto, dH, dEff, score };
    });
    const fit = fitLogistic(
      samples.map((s) => s.dEff),
      samples.map((s) => s.score),
    );
    const minScore = Math.min(...samples.map((s) => s.score));
    const maxD = Math.max(...samples.map((s) => s.dH));
    let R50 = fit.ok ? fit.a / fit.b : maxD * 1.15;
    let R80 = fit.ok ? (fit.a - Math.log(4)) / fit.b : maxD * 0.9;
    if (!isFinite(R50) || R50 <= 0) R50 = maxD * 1.15;
    if (!isFinite(R80) || R80 <= 0) R80 = R50 * 0.7;
    R50 = Math.min(R50, 8000);
    R80 = Math.min(R80, R50);
    const counts = {
      blue: samples.filter((s) => s.punto.color === "blue").length,
      amber: samples.filter((s) => s.punto.color === "amber").length,
      red: samples.filter((s) => s.punto.color === "red").length,
    };
    return { samples, fit, R50, R80, minScore, maxD, counts };
  }, [base, useDh, altura, elevBase, elevPoints]);

  // --- init mapa ---
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = L.map(containerRef.current, { zoomControl: true });
    mapRef.current = map;

    const bounds = L.latLngBounds(DATA.map((p) => [p.lat, p.lng] as [number, number]));
    bounds.extend([DEFAULT_BASE.lat, DEFAULT_BASE.lng]);
    map.fitBounds(bounds.pad(0.25));

    circleLayerRef.current = L.layerGroup().addTo(map);

    const baseIcon = L.divIcon({
      className: "",
      html: `<div style="width:38px;height:38px;border-radius:50%;background:#0f172a;color:#f9e6c6;display:flex;align-items:center;justify-content:center;font-size:18px;box-shadow:0 0 0 3px rgba(249,230,198,.35);border:2px solid #f9e6c6">📡</div>`,
      iconSize: [38, 38],
      iconAnchor: [19, 19],
    });
    baseMarkerRef.current = L.marker(DEFAULT_BASE, {
      draggable: true,
      icon: baseIcon,
      zIndexOffset: 1000,
    })
      .addTo(map)
      .bindTooltip("Base — arrastra para moverla", { permanent: false });

    baseMarkerRef.current.on("dragend", () => {
      const pos = baseMarkerRef.current!.getLatLng();
      setBase({ lat: pos.lat, lng: pos.lng });
    });

    DATA.forEach((p) => {
      const cat = p.color;
      L.circleMarker([p.lat, p.lng], {
        radius: 8,
        color: CAT_COLOR[cat] ?? "#64748b",
        weight: 2,
        fillColor: CAT_COLOR[cat] ?? "#64748b",
        fillOpacity: 0.4,
      })
        .bindTooltip(
          `<b>${p.title}</b><br/>${CAT_LABEL[cat] ?? cat}<br/><span style="opacity:.75">${p.description || "Sin notas"}</span>`,
          { direction: "top" },
        )
        .addTo(map);
    });

    return () => {
      map.remove();
      mapRef.current = null;
      tileRef.current = null;
    };
  }, []);

  // --- cambiar mapa base ---
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const style = MAP_STYLES.find((s) => s.id === styleId) ?? MAP_STYLES[0];
    if (tileRef.current) map.removeLayer(tileRef.current);
    tileRef.current = L.tileLayer(style.url, {
      attribution: style.attribution,
      maxZoom: style.maxZoom,
      subdomains: style.subdomains ?? "abc",
    }).addTo(map);
    tileRef.current.bringToBack();
  }, [styleId]);

  // --- elevaciones iniciales (base + puntos en una llamada bulk) ---
  const loadElevations = async (b: LatLng) => {
    setElevLoading(true);
    try {
      const [elevs] = await Promise.all([
        fetchElevations([b, ...DATA.map((p) => ({ lat: p.lat, lng: p.lng }))]),
      ]);
      setElevBase(elevs[0]);
      setElevPoints(elevs.slice(1));
      lastElevBaseRef.current = b;
    } catch {
      /* sin desnivel si la API falla */
    } finally {
      setElevLoading(false);
    }
  };

  useEffect(() => {
    loadElevations(DEFAULT_BASE);
    const savedKey = localStorage.getItem("geoapify-api-key");
    if (savedKey) setGeoKey(savedKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // refetch de la elevación de la base cuando se arrastra lejos del último punto
  useEffect(() => {
    if (!useDh) return;
    const moved = lastElevBaseRef.current ? haversine(lastElevBaseRef.current, base) : Infinity;
    if (moved > 80 && !elevLoading) {
      fetchElevations([base]).then((e) => {
        setElevBase(e[0]);
        lastElevBaseRef.current = base;
      }).catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [base]);

  // --- redibujar calor + esferas cuando cambia el modelo ---
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // esferas de cobertura
    const layers = circleLayerRef.current;
    if (layers) {
      layers.clearLayers();
      L.circle([base.lat, base.lng], {
        radius: model.R80,
        color: "#22c55e",
        weight: 1.5,
        dashArray: "6 6",
        fill: false,
      })
        .bindTooltip(`Alcance confiable (80%): ${Math.round(model.R80)} m`, { sticky: true })
        .addTo(layers);
      L.circle([base.lat, base.lng], {
        radius: model.R50,
        color: "#f59e0b",
        weight: 2,
        fillColor: "#f59e0b",
        fillOpacity: 0.05,
      })
        .bindTooltip(`Alcance estimado (50%): ${Math.round(model.R50)} m`, { sticky: true })
        .addTo(layers);
    }

    // raster de calor fijado a los límites geográficos
    if (heatLayerRef.current) {
      map.removeLayer(heatLayerRef.current);
      heatLayerRef.current = null;
    }
    const latDeg = (model.R50 / 111320) * 1.1;
    const lngDeg = (model.R50 / (111320 * Math.cos((base.lat * Math.PI) / 180))) * 1.1;
    const lats = DATA.map((p) => p.lat).concat(base.lat, base.lat - latDeg, base.lat + latDeg);
    const lngs = DATA.map((p) => p.lng).concat(base.lng, base.lng - lngDeg, base.lng + lngDeg);
    const south = Math.min(...lats);
    const north = Math.max(...lats);
    const west = Math.min(...lngs);
    const east = Math.max(...lngs);
    const size = 280;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const img = ctx.createImageData(size, size);
    const cell: LatLng = { lat: 0, lng: 0 };
    for (let py = 0; py < size; py++) {
      cell.lat = north - ((north - south) * py) / (size - 1);
      for (let px = 0; px < size; px++) {
        cell.lng = west + ((east - west) * px) / (size - 1);
        const d = haversine(base, cell);
        const p = model.fit.ok ? sigma(model.fit.a - model.fit.b * d) : d <= model.R50 ? 0.55 : 0.2;
        const [r, g, b, a] = heatColor(p);
        const idx = (py * size + px) * 4;
        img.data[idx] = r;
        img.data[idx + 1] = g;
        img.data[idx + 2] = b;
        img.data[idx + 3] = a;
      }
    }
    ctx.putImageData(img, 0, 0);
    heatLayerRef.current = L.imageOverlay(canvas.toDataURL(), [
      [south, west],
      [north, east],
    ], { interactive: false, opacity: 0.75 }).addTo(map);
  }, [model, base]);

  // --- geocodificar nueva ubicación de la base (Nominatim o Geoapify) ---
  const moverBase = async () => {
    const q = searchQuery.trim();
    if (!q || geoLoading) return;
    setGeoLoading(true);
    setGeoError("");
    try {
      let lat: number | null = null;
      let lon: number | null = null;
      let formatted = q;
      if (geoProvider === "geoapify") {
        if (!geoKey.trim()) {
          setGeoError("API KEY REQUIRED: escribe tu clave de Geoapify o cambia a Nominatim (sin key).");
          return;
        }
        const res = await fetch(
          `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(q)}&format=json&limit=1&apiKey=${encodeURIComponent(geoKey.trim())}`,
        );
        const json = await res.json();
        if (!res.ok) {
          setGeoError(`Geoapify: ${json.message ?? `HTTP ${res.status}`} — prueba con Nominatim.`);
          return;
        }
        const hit = json.results?.[0];
        if (hit) {
          lat = hit.lat;
          lon = hit.lon;
          formatted = hit.formatted ?? q;
        }
      } else {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(q)}`,
        );
        const json = await res.json();
        const hit = json?.[0];
        if (hit) {
          lat = Number(hit.lat);
          lon = Number(hit.lon);
          formatted = hit.display_name ?? q;
        }
      }
      if (lat === null || lon === null) {
        setGeoError("Sin resultados para esa búsqueda.");
        return;
      }
      const pos = { lat, lng: lon };
      baseMarkerRef.current?.setLatLng(pos);
      setBase(pos);
      setAddress(formatted);
      mapRef.current?.panTo(pos);
    } catch {
      setGeoError("Error de red al geocodificar. Intenta de nuevo.");
    } finally {
      setGeoLoading(false);
    }
  };

  // --- gráfico Plotly (CDN, carga diferida) ---
  const renderChart = async () => {
    setShowChart(true);
    const w = window as any;
    if (!w.Plotly) {
      await new Promise<void>((resolve) => {
        const s = document.createElement("script");
        s.src = "https://cdn.plot.ly/plotly-2.35.2.min.js";
        s.onload = () => resolve();
        document.head.appendChild(s);
      });
    }
    if (!chartRef.current) return;
    const sorted = [...model.samples].sort((x, y) => x.dH - y.dH);
    const maxD = Math.max(...model.samples.map((s) => s.dH), model.R50) * 1.2;
    const grid: number[] = [];
    for (let d = 0; d <= maxD; d += maxD / 120) grid.push(d);
    const curve = grid.map((d) => sigma(model.fit.a - model.fit.b * d));
    const traces: any[] = [
      {
        x: sorted.map((s) => Math.round(s.dH)),
        y: sorted.map((s) => s.score),
        text: sorted.map((s) => `${s.punto.title} — ${CAT_LABEL[s.punto.color]}`),
        type: "scatter",
        mode: "markers",
        marker: {
          size: 11,
          color: sorted.map((s) => CAT_COLOR[s.punto.color]),
          line: { width: 1, color: "#0f172a" },
        },
        name: "Mediciones",
      },
      {
        x: grid.map((d) => Math.round(d)),
        y: curve.map((p) => Math.round(p * 1000) / 1000),
        type: "scatter",
        mode: "lines",
        line: { color: "#0ea5e9", width: 3 },
        name: "Modelo P(escucha)",
      },
    ];
    const layout = {
      title: "Perfil de señal vs distancia desde la base",
      xaxis: { title: "Distancia horizontal (m)" },
      yaxis: { title: "P(escucha)", range: [-0.05, 1.1] },
      shapes: [
        {
          type: "line",
          x0: model.R50,
          x1: model.R50,
          y0: 0,
          y1: 1,
          line: { color: "#f59e0b", width: 2, dash: "solid" },
        },
        {
          type: "line",
          x0: model.R80,
          x1: model.R80,
          y0: 0,
          y1: 1,
          line: { color: "#22c55e", width: 2, dash: "dash" },
        },
      ],
      legend: { orientation: "h", y: -0.25 },
      margin: { t: 40, r: 20, b: 60, l: 50 },
      paper_bgcolor: "rgba(0,0,0,0)",
      plot_bgcolor: "rgba(0,0,0,0)",
      font: { color: document.documentElement.classList.contains("dark") ? "#e2e8f0" : "#0f172a" },
    };
    w.Plotly.newPlot(chartRef.current, traces, layout, { responsive: true });
  };

  const sortedSamples = [...model.samples].sort((a, b) => a.dH - b.dH);

  return (
    <div className="flex flex-col lg:flex-row gap-4">
      {/* Panel de control */}
      <aside className="w-full lg:w-96 shrink-0 flex flex-col gap-4">
        <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
          <h2 className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-gray-400 mb-2">
            Base de medición
          </h2>
          <p className="text-[11px] text-slate-500 dark:text-gray-400 mb-2">
            {address}
          </p>
          <div className="flex gap-2">
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && moverBase()}
              placeholder="Nueva ubicación (dirección)…"
              className="flex-1 text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
            />
            <button
              onClick={moverBase}
              disabled={geoLoading || !searchQuery.trim()}
              className="px-3 py-2 rounded-xl text-xs font-black bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-40"
            >
              {geoLoading ? "…" : "Ir"}
            </button>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <select
              value={geoProvider}
              onChange={(e) => {
                setGeoProvider(e.target.value as "nominatim" | "geoapify");
                setGeoError("");
              }}
              className="text-[11px] font-semibold px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-gray-300"
            >
              <option value="nominatim">Nominatim (sin key)</option>
              <option value="geoapify">Geoapify (con key)</option>
            </select>
            {geoProvider === "geoapify" && (
              <input
                value={geoKey}
                onChange={(e) => setGeoKey(e.target.value)}
                onBlur={() => localStorage.setItem("geoapify-api-key", geoKey.trim())}
                placeholder="API key Geoapify"
                className="flex-1 text-[11px] font-mono px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-gray-200"
              />
            )}
          </div>
          {geoError && <p className="text-[10px] font-bold text-red-500 mt-1.5">{geoError}</p>}
          <p className="text-[10px] text-slate-400 mt-2">
            📡 {base.lat.toFixed(5)}, {base.lng.toFixed(5)} — también puedes arrastrarla en el mapa.
          </p>
        </section>

        <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
          <h2 className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-gray-400 mb-2">
            Desnivel (elevación terrain)
          </h2>
          <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-gray-300 mb-2">
            <input
              type="checkbox"
              checked={useDh}
              onChange={(e) => setUseDh(e.target.checked)}
              className="accent-emerald-600"
            />
            Corregir por desnivel {elevLoading && <span className="text-slate-400">(midiendo…)</span>}
          </label>
          <label className="block text-[11px] text-slate-500 dark:text-gray-400 mb-1">
            Altura de la antena base sobre su piso: <b>{altura} m</b>
          </label>
          <input
            type="range"
            min={2}
            max={25}
            value={altura}
            onChange={(e) => setAltura(Number(e.target.value))}
            className="w-full accent-emerald-600"
          />
          {elevBase !== null && elevPoints && (
            <p className="text-[10px] text-slate-400 mt-1">
              Elevación base: <b>{Math.round(elevBase)} msnm</b> · puntos: {Math.round(Math.min(...elevPoints))}–{Math.round(Math.max(...elevPoints))} msnm
            </p>
          )}
          <p className="text-[10px] text-slate-400 mt-1">
            Elevación vía Open-Meteo. El modelo penaliza puntos con terreno más alto que la base.
          </p>
        </section>

        <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
          <h2 className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-gray-400 mb-2">
            Predicción de alcance
          </h2>
          <div className="grid grid-cols-2 gap-2 text-center">
            <div className="rounded-xl bg-amber-500/10 border border-amber-500/30 p-2">
              <p className="text-[10px] font-bold uppercase text-amber-600 dark:text-amber-400">Escucha 50%</p>
              <p className="text-xl font-black text-slate-900 dark:text-white">{Math.round(model.R50)} m</p>
            </div>
            <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-2">
              <p className="text-[10px] font-bold uppercase text-emerald-600 dark:text-emerald-400">Confiable 80%</p>
              <p className="text-xl font-black text-slate-900 dark:text-white">{Math.round(model.R80)} m</p>
            </div>
          </div>
          <p className="text-[10px] text-slate-400 mt-2">
            🔵 {model.counts.blue} claros · 🟡 {model.counts.amber} parciales · 🔴 {model.counts.red} sin señal — ajuste logístico sobre {model.samples.length} puntos.
          </p>
        </section>

        <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
          <h2 className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-gray-400 mb-2">
            Puntos medidos
          </h2>
          <ul className="max-h-64 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
            {sortedSamples.map((s) => (
              <li key={s.punto.id} className="py-1.5 flex items-start gap-2">
                <span
                  className="mt-1 w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: CAT_COLOR[s.punto.color] }}
                />
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-800 dark:text-gray-200 truncate">
                    {s.punto.title} <span className="font-mono text-slate-400">· {Math.round(s.dH)} m</span>
                  </p>
                  {s.punto.description && (
                    <p className="text-[10px] text-slate-500 dark:text-gray-400 leading-snug">{s.punto.description}</p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </section>

        <button
          onClick={renderChart}
          className="px-4 py-2.5 rounded-xl text-xs font-black bg-sky-600 hover:bg-sky-700 text-white"
        >
          {showChart ? "Actualizar gráfico" : "Ver gráfico señal vs distancia (Plotly)"}
        </button>
      </aside>

      {/* Mapa + gráfico */}
      <div className="flex-1 min-w-0 flex flex-col gap-4">
        <div className="relative">
          <div
            ref={containerRef}
            className="h-[65vh] min-h-[420px] rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 z-0"
          />
          <div className="absolute top-2 right-2 z-[1000]">
            <select
              value={styleId}
              onChange={(e) => setStyleId(e.target.value)}
              className="px-2 py-1.5 rounded-lg text-[10px] font-black border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-gray-200 shadow"
            >
              {MAP_STYLES.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {showChart && <div ref={chartRef} className="w-full min-h-[380px] rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2" />}

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 text-[11px] text-slate-500 dark:text-gray-400 leading-relaxed">
          <p>
            <b>Cómo leerlo:</b> el degradado predice la probabilidad de ser escuchado desde la base
            (verde claro → rojo sin señal). La <span className="text-amber-600 font-bold">esfera ámbar</span> es
            el radio donde el modelo cruza el 50% y la <span className="text-emerald-600 font-bold">verde punteada</span> el 80%.
            Arrastra la base o geocodifica otra dirección para recalcular el alcance en una ubicación nueva.
          </p>
          <p className="mt-1">
            Modelo: regresión logística sobre {model.samples.length} mediciones cualitativas (claro=1, parcial=0.5, sin señal=0).
            Con pocos puntos es una estimación orientativa, no un estudio de propagación.
          </p>
        </div>
      </div>
    </div>
  );
}
