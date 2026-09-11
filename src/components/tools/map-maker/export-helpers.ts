export function buildPdfFilename(
  projectName: string,
  dateIso: string,
  count: number,
  pageSize: string,
  fontSize: number,
  ext = "pdf"
): string {
  const safe =
    projectName
      .replace(/[^a-zA-Z0-9\u00C0-\u024F]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 30) || "mapa";
  return `${safe}-${dateIso}-${count}pts-${pageSize}-${fontSize}pt.${ext}`;
}

export function calcScaledWidths(colWidths: number[], availW: number): number[] {
  const total = colWidths.reduce((a, b) => a + b, 0);
  const scale = availW / total;
  return colWidths.map((w) => w * scale);
}

export function rowsPerPage(pageH: number, margin: number, headerH: number, rowH: number, reservedTop = 18): number {
  return Math.floor((pageH - margin * 2 - headerH - reservedTop) / rowH);
}

export function sanitizeFileName(name: string): string {
  return name.replace(/[^a-zA-Z0-9\u00C0-\u024F]+/g, "-").replace(/^-|-$/g, "");
}

export function buildMapImageFilename(
  dateIso: string,
  count: number,
  rotationDeg: number,
  sizeTag: string,
  ext: string
): string {
  return `mapa-${dateIso}-${count}pts-${rotationDeg}deg-${sizeTag}.${ext}`;
}
