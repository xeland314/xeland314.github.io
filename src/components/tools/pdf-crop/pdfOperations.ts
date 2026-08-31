export interface CropPercents {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

export function clampPercent(v: number): number {
  if (isNaN(v)) return 0;
  return Math.max(0, Math.min(50, Math.round(v)));
}

export function parsePageIntervals(input: string, totalPages: number): number[] {
  if (!input || !input.trim()) return [];
  const parts = input.split(",").map((s) => s.trim()).filter(Boolean);
  const set = new Set<number>();
  for (const part of parts) {
    if (part.includes("-")) {
      const [aRaw, bRaw] = part.split("-").map((s) => s.trim());
      const a = Number(aRaw);
      const b = Number(bRaw);
      if (!Number.isInteger(a) || !Number.isInteger(b)) continue;
      const start = Math.min(a, b);
      const end = Math.max(a, b);
      for (let i = start; i <= end; i++) {
        if (i >= 1 && i <= totalPages) set.add(i - 1);
      }
    } else {
      const n = Number(part);
      if (!Number.isInteger(n)) continue;
      if (n >= 1 && n <= totalPages) set.add(n - 1);
    }
  }
  return Array.from(set).sort((x, y) => x - y);
}

export function formatPageIntervals(indices: number[]): string {
  if (indices.length === 0) return "";
  const sorted = [...indices].sort((a, b) => a - b);
  const groups: string[] = [];
  let start = sorted[0];
  let prev = sorted[0];
  for (let i = 1; i < sorted.length; i++) {
    const cur = sorted[i];
    if (cur === prev + 1) {
      prev = cur;
    } else {
      if (start === prev) groups.push(String(start + 1));
      else groups.push(`${start + 1}-${prev + 1}`);
      start = cur;
      prev = cur;
    }
  }
  if (start === prev) groups.push(String(start + 1));
  else groups.push(`${start + 1}-${prev + 1}`);
  return groups.join(", ");
}

export function validateCropPercents(c: CropPercents): boolean {
  return (
    c.top >= 0 && c.top <= 50 &&
    c.bottom >= 0 && c.bottom <= 50 &&
    c.left >= 0 && c.left <= 50 &&
    c.right >= 0 && c.right <= 50 &&
    c.top + c.bottom < 100 &&
    c.left + c.right < 100
  );
}
