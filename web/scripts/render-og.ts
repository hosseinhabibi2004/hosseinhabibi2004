// Renders the default Open Graph image of each locale to public/<lng>/opengraph-image.png.
//
// `next/og` (Satori) does not shape Persian correctly (word order, ZWNJ and punctuation come out
// wrong), so the images are pre-rendered with a real browser and committed. This is a LOCAL dev tool,
// run by hand when the site name or description changes:
//
//   pnpm exec tsx scripts/render-og.ts
//
// It needs Playwright and a Chromium on the machine; neither is a dependency of this project. If
// `require("playwright")` does not resolve, install it globally (or set NODE_PATH to where it is).
import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";

import en from "../src/i18n/locales/en/common.json";
import fa from "../src/i18n/locales/fa/common.json";

const require = createRequire(import.meta.url);
const WEB = path.resolve(import.meta.dirname, "..");
const COMMON = { en, fa } as const;
const DIR = { en: "ltr", fa: "rtl" } as const;

function font(pkg: string, file: string): string {
  const data = readFileSync(path.join(WEB, "node_modules", pkg, "files", file));
  return `data:font/woff2;base64,${data.toString("base64")}`;
}

const SORA = font("@fontsource-variable/sora", "sora-latin-wght-normal.woff2");
const VAZIR = font("@fontsource-variable/vazirmatn", "vazirmatn-arabic-wght-normal.woff2");
const VAZIR_LATIN = font("@fontsource-variable/vazirmatn", "vazirmatn-latin-wght-normal.woff2");

// Same black-and-white look as the site: near-black page, white text, a white rule.
function html(lng: keyof typeof COMMON): string {
  const t = COMMON[lng];
  return `<!doctype html><html lang="${lng}" dir="${DIR[lng]}"><head><meta charset="utf-8"><style>
@font-face{font-family:"Sora";font-weight:100 800;src:url(${SORA}) format("woff2")}
@font-face{font-family:"Vazirmatn";font-weight:100 900;src:url(${VAZIR}) format("woff2");unicode-range:U+0600-06FF,U+200C-200D,U+FB50-FDFF,U+FE70-FEFF}
@font-face{font-family:"Vazirmatn";font-weight:100 900;src:url(${VAZIR_LATIN}) format("woff2");unicode-range:U+0000-00FF}
*{margin:0;box-sizing:border-box}
body{width:1200px;height:630px;background:#0a0a0a;color:#fafafa;font-family:"Sora","Vazirmatn",sans-serif;
display:flex;flex-direction:column;justify-content:center;padding:0 96px}
h1{font-size:112px;font-weight:800;line-height:1.2}
.rule{width:120px;height:6px;background:#fafafa;margin:36px 0}
p{font-size:44px;font-weight:400;color:#a3a3a3;line-height:1.5}
</style></head><body><h1>${t.siteName}</h1><div class="rule"></div><p>${t.siteDescription}</p></body></html>`;
}

async function main() {
  const { chromium } = require("playwright");
  const browser = await chromium.launch();
  try {
    for (const lng of ["en", "fa"] as const) {
      const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
      await page.setContent(html(lng));
      await page.evaluate(() => document.fonts.ready);
      const out = path.join(WEB, "public", lng, "opengraph-image.png");
      mkdirSync(path.dirname(out), { recursive: true });
      writeFileSync(out, await page.screenshot({ type: "png" }));
      console.log(`wrote ${path.relative(WEB, out)}`);
      await page.close();
    }
  } finally {
    await browser.close();
  }
}

void main();
