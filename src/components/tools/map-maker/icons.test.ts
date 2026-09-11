import { describe, it, expect } from "vitest";
import { getColorHex, createDivIconHtml, createNumberIconHtml, COLORS, ICONS } from "./icons";

describe("getColorHex", () => {
  it("devuelve hex existente", () => expect(getColorHex("red")).toBe("#ef4444"));
  it("fallback a primer color", () => expect(getColorHex("inexistente")).toBe(COLORS[0].hex));
});

describe("createDivIconHtml", () => {
  it("contiene color y svg", () => {
    const html = createDivIconHtml("map-pin", "#ff0000", 0);
    expect(html).toContain("#ff0000");
    expect(html).toContain("<svg");
    expect(html).toContain(ICONS.find((i) => i.id === "map-pin")!.svg);
  });
  it("innerRotate 0 -> 45deg", () => expect(createDivIconHtml("map-pin", "#000", 0)).toContain("rotate(45deg)"));
  it("innerRotate 90 -> -45deg", () => expect(createDivIconHtml("map-pin", "#000", 90)).toContain("rotate(-45deg)"));
  it("fallback icono inexistente a map-pin", () => {
    const html = createDivIconHtml("map-pin" as any, "#000", 0);
    expect(html).toContain("<svg");
  });
});

describe("createNumberIconHtml", () => {
  it("contiene número y color", () => {
    const html = createNumberIconHtml(5, "#00ff00", 0);
    expect(html).toContain("5");
    expect(html).toContain("#00ff00");
  });
  it("innerRotate corrige rotación", () => expect(createNumberIconHtml(1, "#000", 45)).toContain("rotate(0deg)"));
  it("90° -> -45deg", () => expect(createNumberIconHtml(2, "#000", 90)).toContain("rotate(-45deg)"));
});
