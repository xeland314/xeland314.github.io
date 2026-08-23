export type HttpMode = "http1" | "http2";

export const H2_TIMING = {
  introPause: 1500,
  sendPause: 1100,
  respPause: 1100,
  laneDonePause: 550,
  h2IntroPause: 1600,
  framePause: 850,
  streamDonePause: 750,
  endPause: 2400,
} as const;

export const MODE_FILE: Record<HttpMode, string> = {
  http1: "http_1_1.txt",
  http2: "http_2_frames.txt",
};

export interface HttpCodeLine {
  id: number;
  html: string;
}

export const MODE_CODE: Record<HttpMode, HttpCodeLine[]> = {
  http1: [
    { id: 1, html: `<span class="anim-tok-kw">GET</span> /index.html <span class="anim-tok-mut">HTTP/1.1</span>` },
    { id: 2, html: `<span class="anim-tok-kw">GET</span> /style.css&nbsp;&nbsp;<span class="anim-tok-mut">HTTP/1.1</span>` },
    { id: 3, html: `<span class="anim-tok-kw">GET</span> /app.js&nbsp;&nbsp;&nbsp;&nbsp;<span class="anim-tok-mut">HTTP/1.1</span>` },
    { id: 4, html: `<span class="anim-tok-mut"># una petición por conexión TCP</span>` },
  ],
  http2: [
    { id: 1, html: `<span class="anim-tok-fn">HEADERS</span>+<span class="anim-tok-fn">DATA</span> <span class="anim-tok-mut">→</span> <span class="anim-tok-num">Stream 1</span>` },
    { id: 2, html: `<span class="anim-tok-fn">HEADERS</span>+<span class="anim-tok-fn">DATA</span> <span class="anim-tok-mut">→</span> <span class="anim-tok-num">Stream 3</span>` },
    { id: 3, html: `<span class="anim-tok-fn">HEADERS</span>+<span class="anim-tok-fn">DATA</span> <span class="anim-tok-mut">→</span> <span class="anim-tok-num">Stream 5</span>` },
    { id: 4, html: `<span class="anim-tok-mut"># frames intercalados en UNA conexión</span>` },
  ],
};

export interface FrameStep {
  elId: string;
  label: string;
}

export const FRAME_ORDER: FrameStep[] = [
  { elId: "fh1", label: "H1" },
  { elId: "fh3", label: "H3" },
  { elId: "fd1", label: "D1" },
  { elId: "fh5", label: "H5" },
  { elId: "fd3", label: "D3" },
  { elId: "fd5", label: "D5" },
];

export function buildMuxLines(mode: HttpMode): HttpCodeLine[] {
  return MODE_CODE[mode].map((line) => ({ ...line }));
}
