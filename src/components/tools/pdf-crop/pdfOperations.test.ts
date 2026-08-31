import { describe, it, expect } from "vitest";
import { parsePageIntervals, formatPageIntervals, clampPercent } from "./pdfOperations";

describe("parsePageIntervals", () => {
  it("single page", () => {
    expect(parsePageIntervals("1", 5)).toEqual([0]);
    expect(parsePageIntervals("5", 5)).toEqual([4]);
  });
  it("interval", () => {
    expect(parsePageIntervals("2-4", 5)).toEqual([1, 2, 3]);
    expect(parsePageIntervals("4-2", 5)).toEqual([1, 2, 3]);
  });
  it("mixed", () => {
    expect(parsePageIntervals("1,3-5,2", 5)).toEqual([0, 1, 2, 3, 4]);
  });
  it("out of range ignored", () => {
    expect(parsePageIntervals("0,6,1-10", 5)).toEqual([0, 1, 2, 3, 4]);
  });
  it("empty and invalid", () => {
    expect(parsePageIntervals("", 5)).toEqual([]);
    expect(parsePageIntervals("a,2-foo", 5)).toEqual([]);
  });
  it("deduplicates", () => {
    expect(parsePageIntervals("1,1,2-3,3", 5)).toEqual([0, 1, 2]);
  });
});

describe("formatPageIntervals", () => {
  it("formats ranges", () => {
    expect(formatPageIntervals([0, 1, 2, 4])).toBe("1-3, 5");
    expect(formatPageIntervals([0])).toBe("1");
    expect(formatPageIntervals([])).toBe("");
  });
});

describe("clampPercent", () => {
  it("clamps 0-50", () => {
    expect(clampPercent(60)).toBe(50);
    expect(clampPercent(-5)).toBe(0);
    expect(clampPercent(12.7)).toBe(13);
  });
});
