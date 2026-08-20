export type ChannelAction = "send" | "recv";

export const CHANNEL_TIMING = {
  startPause: 150,
  initPause: 500,
  sendAnim: 650,
  recvAnim: 650,
  blockPause: 1200,
  clearPause: 250,
  endPause: 900,
} as const;

export const CHANNEL_FILE = "concurrencia.go";
export const CHANNEL_CAPACITY = 2;

export interface ChannelCodeLine {
  id: number;
  html: string;
}

export interface ChannelStep {
  action: ChannelAction;
  item?: string;
  blocked?: boolean;
}

const CHANNEL_SOURCE: ChannelCodeLine[] = [
  {
    id: 1,
    html: `ch <span class="anim-tok-mut">:=</span> <span class="anim-tok-fn">make</span>(<span class="anim-tok-kw">chan</span> <span class="anim-tok-kw">string</span>, <span class="anim-tok-str">${CHANNEL_CAPACITY}</span>) <span class="anim-tok-mut">// Capacidad = 2</span>`,
  },
  {
    id: 2,
    html: `<span class="anim-tok-go">go</span> <span class="anim-tok-kw">func</span>() <span class="anim-tok-mut">{</span>`,
  },
  {
    id: 3,
    html: `    ch <span class="anim-tok-mut">&lt;-</span> <span class="anim-tok-str">"📦 Item"</span> <span class="anim-tok-mut">// Envía (bloquea si lleno)</span>`,
  },
  {
    id: 4,
    html: `<span class="anim-tok-mut">}()</span>  <span class="anim-tok-mut">// G1: productor</span>`,
  },
  {
    id: 5,
    html: `item <span class="anim-tok-mut">:=</span> <span class="anim-tok-mut">&lt;-</span>ch     <span class="anim-tok-mut">// Consume (bloquea si vacío)</span>`,
  },
];

export function buildChannelLines(): ChannelCodeLine[] {
  return CHANNEL_SOURCE.map((line) => ({ ...line }));
}

export function buildDemoPlan(): ChannelStep[] {
  return [
    { action: "send", item: "📦#1" },
    { action: "send", item: "📦#2" },
    { action: "send", item: "📦#3", blocked: true },
    { action: "recv" },
    { action: "send", item: "📦#3" },
    { action: "recv" },
    { action: "recv" },
    { action: "recv", blocked: true },
    { action: "send", item: "📦#4" },
  ];
}