import { describe, it, expect } from "vitest";
import {
  buildChainLines,
  estimateChainDemoMs,
  CHAIN_CODE,
  CHAIN_TIMING,
  type ChainScene,
} from "./sequence";

describe("buildChainLines", () => {
  it("joins the success chain with && so both commands run", () => {
    const html = CHAIN_CODE.exito.map((l) => l.html).join("\n");
    expect(html).toContain("&amp;&amp;");
    expect(html).toContain("mkdir proyectos");
    expect(html).toContain("cd proyectos");
  });

  it("omits the failed echo and rescues with ||", () => {
    const html = CHAIN_CODE.rescate.map((l) => l.html).join("\n");
    expect(html).toContain("ping -c1 servidor");
    expect(html).toContain("/dev/null");
    expect(html).toContain("conexión OK");
    expect(html).toContain("sin conexión");
    expect(html).toContain("||");
  });

  it("states the general rule for && and ||", () => {
    const html = CHAIN_CODE.regla.map((l) => l.html).join("\n");
    expect(html).toContain("avanza solo si el código es 0");
    expect(html).toContain("distinto de 0");
  });

  it("covers the three scenes", () => {
    const scenes = Object.keys(CHAIN_CODE) as ChainScene[];
    expect(scenes).toEqual(["exito", "rescate", "regla"]);
    for (const scene of scenes) {
      expect(buildChainLines(scene).length).toBeGreaterThan(0);
    }
  });
});

describe("CHAIN_TIMING / estimate", () => {
  it("keeps every timing positive", () => {
    for (const ms of Object.values(CHAIN_TIMING)) {
      expect(ms).toBeGreaterThan(0);
    }
  });

  it("runs the full demo between 15s and 22s (hard cap 60s)", () => {
    const total = estimateChainDemoMs();
    expect(total).toBeGreaterThanOrEqual(15000);
    expect(total).toBeLessThanOrEqual(22000);
    expect(total).toBeLessThanOrEqual(60000);
  });
});
