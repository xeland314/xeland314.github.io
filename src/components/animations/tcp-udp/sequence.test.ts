import { describe, it, expect } from "vitest";
import {
  buildNetLines,
  estimateDemoMs,
  MODE_FILE,
  NET_CODE,
  NET_TIMING,
  PACKET_FADE_MS,
} from "./sequence";

describe("buildNetLines", () => {
  it("has 4 lines per mode", () => {
    for (const mode of ["tcp", "udp"] as const) {
      expect(buildNetLines(mode).map((l) => l.id)).toEqual([1, 2, 3, 4]);
    }
  });

  it("narrates the three handshake segments for tcp", () => {
    const html = buildNetLines("tcp").map((l) => l.html).join("\n");
    expect(html).toContain("SYN-ACK");
    expect(html).toContain("Ack=301");
    expect(html).toContain("ESTABLISHED");
  });

  it("narrates fire & forget datagrams for udp", () => {
    const html = buildNetLines("udp").map((l) => l.html).join("\n");
    expect(html).toContain("sendto");
    expect(html).toContain("Fire &amp; Forget");
  });
});

describe("MODE_FILE / NET_TIMING", () => {
  it("uses a different socket file per mode", () => {
    expect(MODE_FILE.tcp).toBe("tcp_socket.c");
    expect(MODE_FILE.udp).toBe("udp_socket.c");
    expect(Object.keys(MODE_FILE).sort()).toEqual(
      Object.keys(NET_CODE).sort(),
    );
  });

  it("keeps every timing positive", () => {
    for (const ms of Object.values(NET_TIMING)) {
      expect(ms).toBeGreaterThan(0);
    }
    expect(PACKET_FADE_MS).toBeGreaterThan(0);
  });

  it("runs the full demo between 15s and 60s", () => {
    const total = estimateDemoMs();
    expect(total).toBeGreaterThanOrEqual(15000);
    expect(total).toBeLessThanOrEqual(60000);
  });
});
