import type { IconId, MarkerShape } from "./icons";

export type MarkerData = {
  id: string;
  lat: number;
  lng: number;
  title: string;
  description: string;
  icon: IconId;
  color: string;
  category?: string;
  shape?: MarkerShape;
  size?: number;
};

export type TileProvider = "osm" | "voyager" | "dark" | "satellite";

export type MapProject = {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  markers: MarkerData[];
  tileProvider: TileProvider;
  showPolyline: boolean;
};

export type ExportPresetId = "1920x1080" | "1350x1080" | "A4" | "A4-land" | "1080x1080" | "actual";
export type PdfPageSizeId = "1920x1080" | "1350x1080" | "A4" | "A4-land" | "1080x1080";
export type GeocodeProvider = "nominatim" | "geoapify" | "both";
export type RouteMode = "drive" | "walk" | "bicycle";
