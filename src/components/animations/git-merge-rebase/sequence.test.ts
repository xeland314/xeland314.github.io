import { describe, it, expect } from "vitest";
import {
  buildGitLines,
  GIT_CODE,
  GIT_FILE,
  GIT_TIMING,
} from "./sequence";

describe("buildGitLines", () => {
  it("has 4 lines for the merge mode", () => {
    expect(buildGitLines("merge").map((l) => l.id)).toEqual([1, 2, 3, 4]);
  });

  it("has 4 lines for the rebase mode", () => {
    expect(buildGitLines("rebase").map((l) => l.id)).toEqual([1, 2, 3, 4]);
  });

  it("marks the git keyword on every line", () => {
    for (const mode of ["merge", "rebase"] as const) {
      const html = buildGitLines(mode)
        .map((l) => l.html)
        .join("\n");
      expect(html).toContain('anim-tok-git">git');
    }
  });

  it("merge explains the fusion commit M1", () => {
    expect(buildGitLines("merge").find((l) => l.id === 3)?.html).toContain(
      "M1",
    );
  });

  it("rebase explains the linear history without M1", () => {
    expect(buildGitLines("rebase").find((l) => l.id === 4)?.html).toContain(
      "lineal",
    );
  });
});

describe("GIT_FILE / GIT_TIMING", () => {
  it("uses a different script per mode", () => {
    expect(GIT_FILE.merge).toBe("git_merge.sh");
    expect(GIT_FILE.rebase).toBe("git_rebase.sh");
  });

  it("keeps every mode script name mapping in sync", () => {
    expect(Object.keys(GIT_FILE).sort()).toEqual(
      Object.keys(GIT_CODE).sort(),
    );
  });

  it("keeps every timing positive", () => {
    for (const ms of Object.values(GIT_TIMING)) {
      expect(ms).toBeGreaterThan(0);
    }
  });
});