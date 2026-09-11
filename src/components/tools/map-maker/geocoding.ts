import type { GeocodeProvider } from "./types";

export type GeocodeResult = {
  place_id: string;
  display_name: string;
  lat: string;
  lon: string;
  type: string;
  source?: string;
  raw?: any;
};

export function normalizeGeocodeResults(data: any, provider: string): GeocodeResult[] {
  if (provider === "geoapify") {
    if (Array.isArray(data?.results)) {
      return data.results.map((r: any) => ({
        place_id: r.place_id || r.osm_id || `${r.lat},${r.lon}`,
        display_name: r.formatted || r.address_line1 || `${r.lat},${r.lon}`,
        lat: String(r.lat),
        lon: String(r.lon),
        type: r.result_type || r.category || "geoapify",
        raw: r,
      }));
    }
    if (Array.isArray(data?.features)) {
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
}

export function mergeDedupGeocodeResults(
  geoResults: GeocodeResult[],
  nominatimResults: GeocodeResult[],
  limit = 10
): GeocodeResult[] {
  const merged = [...geoResults, ...nominatimResults];
  const seen = new Set<string>();
  return merged
    .filter((r) => {
      const k = `${r.lat},${r.lon}`;
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    })
    .slice(0, limit);
}

export function buildNominatimUrl(query: string): string {
  return `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=5&q=${encodeURIComponent(query)}`;
}

export function buildGeoapifyUrl(query: string, apiKey: string): string {
  return `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(query)}&format=json&limit=5&apiKey=${apiKey}&filter=countrycode:ec&lang=es&bias=proximity:-78.5,-0.2`;
}

export type FetchGeocodeDeps = {
  fetchFn?: typeof fetch;
  geoapifyToken: string;
  provider: GeocodeProvider;
};

export async function fetchGeocodeResults(
  query: string,
  deps: FetchGeocodeDeps
): Promise<GeocodeResult[]> {
  const fetchFn = deps.fetchFn ?? fetch;
  const fetchNominatim = async () => {
    const res = await fetchFn(buildNominatimUrl(query), { headers: { Accept: "application/json" } } as any);
    const data = await res.json();
    return normalizeGeocodeResults(data, "nominatim").map((r) => ({ ...r, source: "nominatim" }));
  };
  const fetchGeoapify = async () => {
    if (!deps.geoapifyToken) return [];
    const res = await fetchFn(buildGeoapifyUrl(query, deps.geoapifyToken));
    const data = await res.json();
    return normalizeGeocodeResults(data, "geoapify").map((r) => ({ ...r, source: "geoapify" }));
  };

  if (deps.provider === "both") {
    const [nom, geo] = await Promise.all([fetchNominatim().catch(() => []), fetchGeoapify().catch(() => [])]);
    return mergeDedupGeocodeResults(geo, nom, 10);
  }
  if (deps.provider === "geoapify") {
    if (!deps.geoapifyToken) throw new Error("Falta API key Geoapify");
    return fetchGeoapify();
  }
  return fetchNominatim();
}
