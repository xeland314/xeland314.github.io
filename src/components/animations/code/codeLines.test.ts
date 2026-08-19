import { describe, it, expect } from "vitest";
import {
  DRINKS,
  META,
  CODE_LINES,
  buildCodeLines,
  renderAssignLine,
} from "./codeLines";

describe("codeLines", () => {
  it("builds one line per definition with sequential numbering", () => {
    const lines = buildCodeLines("agua");
    expect(lines).toHaveLength(CODE_LINES.length);
    const numbered = lines
      .filter((l) => l.lineNumber !== null)
      .map((l) => l.lineNumber);
    expect(numbered).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  });

  it("blank lines have no line number", () => {
    const lines = buildCodeLines("gaseosa");
    const blank = lines.find((l) => l.id === "blank1");
    expect(blank?.lineNumber).toBeNull();
    expect(blank?.html).toBe("");
  });

  it("renders the assign line with the current drink", () => {
    const lines = buildCodeLines("limonada");
    const assign = lines.find((l) => l.id === "assign");
    expect(assign?.html).toContain('"limonada"');
    expect(assign?.html).toContain("anim-tok-str");
    expect(renderAssignLine("agua")).toContain('"agua"');
  });

  it("every drink has complete metadata and belongs to DRINKS", () => {
    for (const d of DRINKS) {
      expect(META[d].str).toBe(d);
      expect(META[d].can.length).toBeGreaterThan(0);
      expect(META[d].name.length).toBeGreaterThan(0);
    }
    expect(DRINKS).toEqual(["gaseosa", "agua", "limonada"]);
  });

  it("case lines carry their drink while the default case carries null", () => {
    const lines = buildCodeLines("gaseosa");
    expect(lines.find((l) => l.id === "case-gaseosa")?.drink).toBe("gaseosa");
    expect(lines.find((l) => l.id === "case-agua")?.drink).toBe("agua");
    expect(lines.find((l) => l.id === "case-limonada")?.drink).toBe("limonada");
    expect(lines.find((l) => l.id === "case-def")?.drink).toBeNull();
  });
});