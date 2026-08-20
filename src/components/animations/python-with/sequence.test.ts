import { describe, it, expect } from "vitest";
import {
  buildWithLines,
  buildWithScenario,
  WITH_FILE,
  WITH_TIMING,
} from "./sequence";

describe("buildWithLines", () => {
  it("keeps ids 1..8 in order", () => {
    expect(buildWithLines().map((l) => l.id)).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
  });

  it("has a blank separation line", () => {
    expect(buildWithLines().find((l) => l.id === 6)?.html).toBe("");
  });

  it("marks the with keyword with the accent token", () => {
    const line = buildWithLines().find((l) => l.id === 7)?.html ?? "";
    expect(line).toContain('anim-tok-acc">with');
  });

  it("tokenizes class/def and method calls", () => {
    const html = buildWithLines()
      .map((l) => l.html)
      .join("\n");
    expect(html).toContain('anim-tok-kw">class');
    expect(html).toContain('anim-tok-kw">def');
    expect(html).toContain('anim-tok-fn">__enter__');
    expect(html).toContain('anim-tok-fn">__exit__');
    expect(html).toContain('anim-tok-fn">ejecutar_consulta');
  });
});

describe("buildWithScenario", () => {
  it("orders steps as with -> enter -> block -> exit", () => {
    expect(buildWithScenario("normal").map((s) => s.id)).toEqual([7, 3, 8, 5]);
    expect(buildWithScenario("error").map((s) => s.id)).toEqual([7, 3, 8, 5]);
  });

  it("highlights the block with warn on error flow only", () => {
    expect(buildWithScenario("normal").find((s) => s.id === 8)?.style).toBe(
      "active",
    );
    expect(buildWithScenario("error").find((s) => s.id === 8)?.style).toBe(
      "warn",
    );
  });

  it("always marks with and __exit__ as accent", () => {
    for (const mode of ["normal", "error"] as const) {
      const spec = buildWithScenario(mode);
      expect(spec.find((s) => s.id === 7)?.style).toBe("accent");
      expect(spec.find((s) => s.id === 5)?.style).toBe("accent");
    }
  });
});

describe("WITH_FILE / WITH_TIMING", () => {
  it("points to the database connection file", () => {
    expect(WITH_FILE).toBe("conexion_db.py");
  });

  it("keeps every timing positive", () => {
    for (const ms of Object.values(WITH_TIMING)) {
      expect(ms).toBeGreaterThan(0);
    }
  });
});