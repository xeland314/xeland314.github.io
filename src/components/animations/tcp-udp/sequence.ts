export type NetMode = "tcp" | "udp";

export const NET_TIMING = {
  introPause: 1000,
  stepPause: 900,
  settlePause: 500,
  dropExtra: 1400,
  outroPause: 2400,
} as const;

export const PACKET_TRAVEL_MS = 650;
export const PACKET_FADE_MS = 320;

export const MODE_FILE: Record<NetMode, string> = {
  tcp: "tcp_socket.c",
  udp: "udp_socket.c",
};

export interface NetCodeLine {
  id: number;
  html: string;
}

export const NET_CODE: Record<NetMode, NetCodeLine[]> = {
  tcp: [
    { id: 1, html: `<span class="anim-tok-fn">connect</span>(sockfd, <span class="anim-tok-mut">&amp;</span>servaddr)<span class="anim-tok-mut">:</span>` },
    { id: 2, html: `&nbsp;&nbsp;<span class="anim-net-tcp">SYN</span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span class="anim-tok-mut">--&gt;</span> Seq=100` },
    { id: 3, html: `&nbsp;&nbsp;<span class="anim-net-tcp">SYN-ACK</span> <span class="anim-tok-mut">&lt;--</span> Seq=300 Ack=101` },
    { id: 4, html: `&nbsp;&nbsp;<span class="anim-net-tcp">ACK</span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span class="anim-tok-mut">--&gt;</span> Ack=301 <span class="anim-tok-str">(ESTABLISHED)</span>` },
  ],
  udp: [
    { id: 1, html: `<span class="anim-tok-fn">sendto</span>(sockfd, buffer, len...)<span class="anim-tok-mut">:</span>` },
    { id: 2, html: `&nbsp;&nbsp;<span class="anim-tok-str">Datagram 1</span> <span class="anim-tok-mut">--&gt;</span> <span class="anim-tok-mut">(Sin conexión)</span>` },
    { id: 3, html: `&nbsp;&nbsp;<span class="anim-tok-str">Datagram 2</span> <span class="anim-tok-mut">--&gt;</span> <span class="anim-tok-mut">(Sin confirmación)</span>` },
    { id: 4, html: `&nbsp;&nbsp;<span class="anim-tok-str">Datagram 3</span> <span class="anim-tok-mut">--&gt;</span> <span class="anim-tok-mut">(Fire &amp; Forget)</span>` },
  ],
};

const TCP_STEPS = 3;

const UDP_STEPS = 4;

export function buildNetLines(mode: NetMode): NetCodeLine[] {
  return NET_CODE[mode].map((line) => ({ ...line }));
}

export function estimateDemoMs(): number {
  const tcp =
    NET_TIMING.introPause +
    TCP_STEPS * (NET_TIMING.stepPause + PACKET_TRAVEL_MS + NET_TIMING.settlePause) +
    NET_TIMING.outroPause;
  const udp =
    NET_TIMING.introPause +
    UDP_STEPS * (NET_TIMING.stepPause + PACKET_TRAVEL_MS) +
    NET_TIMING.dropExtra +
    NET_TIMING.outroPause;
  return tcp + udp;
}
