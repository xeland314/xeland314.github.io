import { describe, it, expect } from "vitest";
import { resolveSequence } from "./sequence";
import { DRINKS, META } from "../code/codeLines";

describe("resolveSequence", () => {
  it("starts by highlighting the assign and match lines", () => {
    const steps = resolveSequence("agua");
    expect(steps[0]).toMatchObject({ lineId: "assign", state: "active" });
    expect(steps[1]).toMatchObject({ lineId: "match", state: "active" });
  });

  it("scans the non-matching cases before matching one", () => {
    const steps = resolveSequence("limonada");
    const scanned = steps
      .filter((s) => s.state === "scan")
      .map((s) => s.lineId);
    expect(scanned).toEqual(["case-gaseosa", "case-agua"]);
    const matched = steps
      .filter((s) => s.state === "matched")
      .map((s) => s.lineId);
    expect(matched).toEqual(["case-limonada", "call-limonada"]);
  });

  it("lights the matching slot and drops the can on the matching call", () => {
    for (const d of DRINKS) {
      const steps = resolveSequence(d);
      const slotStep = steps.find((s) => s.slot === d);
      expect(slotStep).toBeDefined();
      const dropStep = steps.find((s) => s.dropCan);
      expect(dropStep?.lineId).toBe(`call-${d}`);
    }
  });

  it("prints a liberar_bebida console message for the matched drink", () => {
    for (const d of DRINKS) {
      const steps = resolveSequence(d);
      const consoleStep = steps.find((s) => s.console);
      expect(consoleStep?.console).toBe(
        `liberar_bebida("${META[d].can} ${META[d].name}")`,
      );
    }
  });

  it("only scans cases before the match and never after", () => {
    const steps = resolveSequence("gaseosa");
    const matchedIndex = steps.findIndex((s) => s.state === "matched");
    for (let i = matchedIndex + 1; i < steps.length; i++) {
      expect(steps[i].state).not.toBe("scan");
    }
  });

  it("ends with a pause step", () => {
    const steps = resolveSequence("gaseosa");
    const last = steps[steps.length - 1];
    expect(last.lineId).toBeNull();
    expect(last.state).toBeNull();
    expect(last.ms).toBeGreaterThan(0);
  });
});