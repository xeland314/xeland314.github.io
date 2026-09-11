import { describe, it, expect, vi } from "vitest";
import {
  normalizeGeocodeResults,
  mergeDedupGeocodeResults,
  buildNominatimUrl,
  buildGeoapifyUrl,
  fetchGeocodeResults,
} from "./geocoding";

describe("normalizeGeocodeResults", () => {
  it("nominatim array passthrough", () => {
    const data = [{ place_id: "1", display_name: "Quito", lat: "0", lon: "-78" }];
    expect(normalizeGeocodeResults(data, "nominatim")).toEqual(data);
  });
  it("nominatim no-array -> []", () => {
    expect(normalizeGeocodeResults({}, "nominatim")).toEqual([]);
    expect(normalizeGeocodeResults(null, "nominatim")).toEqual([]);
  });
  it("geoapify results mapping", () => {
    const data = { results: [{ place_id: "a", formatted: "Quito, EC", lat: -0.2, lon: -78.5, result_type: "city" }] };
    const res = normalizeGeocodeResults(data, "geoapify");
    expect(res[0].place_id).toBe("a");
    expect(res[0].display_name).toBe("Quito, EC");
    expect(res[0].lat).toBe("-0.2");
    expect(res[0].type).toBe("city");
  });
  it("geoapify features mapping", () => {
    const data = { features: [{ geometry: { coordinates: [-78.5, -0.2] }, properties: { formatted: "Quito", place_id: "b" } }] };
    const res = normalizeGeocodeResults(data, "geoapify");
    expect(res[0].lat).toBe("-0.2");
    expect(res[0].lon).toBe("-78.5");
    expect(res[0].display_name).toBe("Quito");
  });
  it("geoapify vacío -> []", () => expect(normalizeGeocodeResults({}, "geoapify")).toEqual([]));
});

describe("mergeDedupGeocodeResults", () => {
  it("merge y dedup por lat,lon", () => {
    const geo = [{ place_id: "1", display_name: "A", lat: "0", lon: "0", type: "x" }];
    const nom = [
      { place_id: "2", display_name: "B", lat: "0", lon: "0", type: "x" },
      { place_id: "3", display_name: "C", lat: "1", lon: "1", type: "y" },
    ];
    const merged = mergeDedupGeocodeResults(geo, nom, 10);
    expect(merged).toHaveLength(2);
    expect(merged[0].place_id).toBe("1");
    expect(merged[1].place_id).toBe("3");
  });
  it("respeta limit", () => {
    const geo = Array.from({ length: 6 }, (_, i) => ({ place_id: `${i}`, display_name: `${i}`, lat: `${i}`, lon: `${i}`, type: "x" }));
    expect(mergeDedupGeocodeResults(geo, [], 3)).toHaveLength(3);
  });
  it("geo primero, nom después", () => {
    const geo = [{ place_id: "g", display_name: "G", lat: "0", lon: "1", type: "x" }];
    const nom = [{ place_id: "n", display_name: "N", lat: "0", lon: "2", type: "x" }];
    const m = mergeDedupGeocodeResults(geo, nom);
    expect(m[0].place_id).toBe("g");
    expect(m[1].place_id).toBe("n");
  });
});

describe("build URLs", () => {
  it("nominatim encode", () => expect(buildNominatimUrl("Av. Amazonas")).toContain("Av.%20Amazonas"));
  it("geoapify contiene token y filtro", () => {
    const url = buildGeoapifyUrl("Quito", "KEY123");
    expect(url).toContain("KEY123");
    expect(url).toContain("countrycode:ec");
  });
});

describe("fetchGeocodeResults", () => {
  it("both merge", async () => {
    const fetchMock = vi.fn(async (url: string) => {
      if (url.includes("nominatim")) return { json: async () => [{ place_id: "n1", display_name: "N", lat: "0", lon: "0", type: "x" }] } as any;
      return { json: async () => ({ results: [{ place_id: "g1", lat: 1, lon: 1, formatted: "G" }] }) } as any;
    });
    const res = await fetchGeocodeResults("Quito", { fetchFn: fetchMock as any, geoapifyToken: "tok", provider: "both" });
    expect(res.length).toBeGreaterThan(0);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
  it("geoapify sin token throw", async () => {
    await expect(fetchGeocodeResults("Q", { geoapifyToken: "", provider: "geoapify" })).rejects.toThrow("Falta API");
  });
  it("nominatim provider solo nominatim", async () => {
    const fetchMock = vi.fn(async () => ({ json: async () => [{ place_id: "1", display_name: "A", lat: "0", lon: "0", type: "x" }] } as any));
    const res = await fetchGeocodeResults("Q", { fetchFn: fetchMock as any, geoapifyToken: "tok", provider: "nominatim" });
    expect(res[0].source).toBe("nominatim");
  });
});
