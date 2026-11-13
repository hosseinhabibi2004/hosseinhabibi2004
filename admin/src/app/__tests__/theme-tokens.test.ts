import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

/**
 * The admin is dark only, black and white. Every colour is a token declared once in
 * `:root`; every token is grayscale except the single danger red (`destructive*`).
 */
const css = readFileSync(join(__dirname, "..", "globals.css"), "utf8");

type Oklch = { l: number; c: number; h: number };
type Rgb = [number, number, number];

function block(selector: string): string {
  const start = css.indexOf(`\n${selector} {`);
  if (start === -1) return "";
  return css.slice(start, css.indexOf("\n}", start));
}

function tokens(selector: string): Record<string, Oklch> {
  const found: Record<string, Oklch> = {};
  for (const [, name, l, c, h] of block(selector).matchAll(
    /--([\w-]+):\s*oklch\(([\d.]+)\s+([\d.]+)\s+([\d.]+)\)/g,
  )) {
    found[name] = { l: Number(l), c: Number(c), h: Number(h) };
  }
  return found;
}

function toSrgb({ l, c, h }: Oklch): Rgb {
  const a = c * Math.cos((h * Math.PI) / 180);
  const b = c * Math.sin((h * Math.PI) / 180);
  const l_ = (l + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m_ = (l - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s_ = (l - 0.0894841775 * a - 1.291485548 * b) ** 3;
  const linear = [
    4.0767416621 * l_ - 3.3077115913 * m_ + 0.2309699292 * s_,
    -1.2684380046 * l_ + 2.6097574011 * m_ - 0.3413193965 * s_,
    -0.0041960863 * l_ - 0.7034186147 * m_ + 1.707614701 * s_,
  ];
  const encode = (x: number) => {
    const v = Math.min(1, Math.max(0, x));
    return v <= 0.0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - 0.055;
  };
  return [encode(linear[0]), encode(linear[1]), encode(linear[2])];
}

const luminance = (rgb: Rgb) => {
  const [r, g, b] = rgb.map((v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

function contrast(a: Oklch, b: Oklch): number {
  const [hi, lo] = [luminance(toSrgb(a)), luminance(toSrgb(b))].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

const t = tokens(":root");
const GRAYSCALE = [
  "background",
  "foreground",
  "card",
  "card-foreground",
  "popover",
  "popover-foreground",
  "primary",
  "primary-foreground",
  "secondary",
  "secondary-foreground",
  "muted",
  "muted-foreground",
  "accent",
  "accent-foreground",
  "border",
  "input",
  "ring",
];
const TEXT_PAIRS: [string, string][] = [
  ["foreground", "background"],
  ["card-foreground", "card"],
  ["popover-foreground", "popover"],
  ["muted-foreground", "background"],
  ["muted-foreground", "card"],
  ["muted-foreground", "muted"],
  ["primary-foreground", "primary"],
  ["secondary-foreground", "secondary"],
  ["accent-foreground", "accent"],
  ["destructive", "background"],
  ["destructive", "card"],
  ["destructive-foreground", "destructive"],
];
const NON_TEXT_PAIRS: [string, string][] = [
  ["border", "background"],
  ["input", "background"],
  ["ring", "background"],
];

describe("the dark-only, black and white palette", () => {
  it("declares its colours once, in :root, with no light/dark split", () => {
    expect(Object.keys(t).length).toBeGreaterThan(15);
    expect(block(".dark")).toBe("");
    expect(block(":root:not(.dark)")).toBe("");
    expect(css).not.toMatch(/prefers-color-scheme:\s*light/);
  });

  it("is black on the page and white on text", () => {
    expect(t.background.l).toBeLessThanOrEqual(0.2);
    expect(t.foreground.l).toBeGreaterThanOrEqual(0.95);
  });

  it("is grayscale everywhere except the one danger red", () => {
    for (const name of GRAYSCALE) {
      expect(t[name], name).toBeDefined();
      expect(t[name].c, name).toBeLessThanOrEqual(0.005);
    }
    const hued = Object.entries(t)
      .filter(([, color]) => color.c > 0.005)
      .map(([name]) => name);
    expect(hued.every((name) => name.startsWith("destructive")), hued.join(", ")).toBe(true);
    expect(t.destructive.h).toBeGreaterThanOrEqual(15);
    expect(t.destructive.h).toBeLessThanOrEqual(35);
    expect(t.destructive.c).toBeGreaterThanOrEqual(0.15);
  });

  it("keeps every text pair at WCAG AA (4.5:1)", () => {
    for (const [fg, bg] of TEXT_PAIRS) {
      expect(t[fg], fg).toBeDefined();
      expect(t[bg], bg).toBeDefined();
      expect(contrast(t[fg], t[bg]), `${fg} on ${bg}`).toBeGreaterThanOrEqual(4.5);
    }
  });

  it("keeps borders, inputs and the focus ring visible (3:1)", () => {
    for (const [fg, bg] of NON_TEXT_PAIRS) {
      expect(contrast(t[fg], t[bg]), `${fg} on ${bg}`).toBeGreaterThanOrEqual(3);
    }
  });

  it("defines the dim layer behind dialogs", () => {
    expect(css).toMatch(/--scrim:/);
  });

  it("sets the fonts: Latin first, Persian next", () => {
    expect(css).toMatch(/--font-sans:[^;]*Geist[^;]*Vazirmatn/i);
  });
});
