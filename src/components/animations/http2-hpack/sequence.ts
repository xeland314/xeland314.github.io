export const HPACK_TIMING = {
  introPause: 1600,
  headerStep: 1000,
  tablePause: 1000,
  req2Intro: 1500,
  chipStep: 950,
  chipTablePause: 500,
  barPause: 1200,
  savingsReveal: 900,
  endPause: 2600,
} as const;

export interface HpackCodeLine {
  id: number;
  html: string;
}

export const HPACK_CODE: HpackCodeLine[] = [
  { id: 1, html: `<span class="anim-tok-fn">:method:</span> GET <span class="anim-tok-mut">→ estático [2]</span>` },
  { id: 2, html: `<span class="anim-tok-fn">:path:</span> /api/users <span class="anim-tok-mut">→ dinámica #62</span>` },
  { id: 3, html: `<span class="anim-tok-fn">user-agent:</span> Moz/5.0 <span class="anim-tok-mut">→ #63</span>` },
  { id: 4, html: `<span class="anim-tok-fn">accept:</span> application/json <span class="anim-tok-mut">→ #64</span>` },
  { id: 5, html: `<span class="anim-tok-mut"># request 2 solo manda [2][62][63][64]</span>` },
];

export interface HeaderRow {
  rowId: string;
  dynId: string;
  chipId: string;
  index: string;
}

export const HEADER_ROWS: HeaderRow[] = [
  { rowId: "r_path", dynId: "d62", chipId: "c_p", index: "#62" },
  { rowId: "r_ua", dynId: "d63", chipId: "c_u", index: "#63" },
  { rowId: "r_acc", dynId: "d64", chipId: "c_a", index: "#64" },
];

export const BYTES_REQUEST_1 = 128;
export const BYTES_REQUEST_2 = 24;

export function buildHpackLines(): HpackCodeLine[] {
  return HPACK_CODE.map((line) => ({ ...line }));
}
