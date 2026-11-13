#!/usr/bin/env node
// Screenshot one screen of the running stack, signed in as a demo account.
//   node drive.cjs shot /admin/users --as 09120000001 --out /tmp/users.png
// Flags: --as <phone> --password <pw> --clinic <name> --mobile --dark --full --out <png>
// --clinic: after sign-in, open the «تغییر کلینیک» menu, choose that clinic and wait for the reload.
const { execSync } = require("node:child_process");
const path = require("node:path");

function loadPlaywright() {
  try {
    return require("playwright");
  } catch {
    return require(path.join(execSync("npm root -g").toString().trim(), "playwright"));
  }
}
const { chromium } = loadPlaywright();

const args = process.argv.slice(2);
const [command, target = "/"] = args;
const flag = (name) => args.includes(`--${name}`);
const value = (name, fallback) => {
  const index = args.indexOf(`--${name}`);
  return index === -1 ? fallback : args[index + 1];
};
if (command !== "shot") {
  console.error("usage: drive.cjs shot <path> [--as phone] [--clinic name] [--mobile] [--dark] [--full] [--out png]");
  process.exit(2);
}

const BASE = process.env.BASE || "http://localhost:3000";
const executablePath =
  process.env.PLAYWRIGHT_CHROMIUM ||
  [ "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" ].find((p) => require("node:fs").existsSync(p));

(async () => {
  const browser = await chromium.launch({ executablePath, args: ["--no-sandbox"] });
  const context = await browser.newContext({
    locale: "fa-IR",
    colorScheme: flag("dark") ? "dark" : "light",
    viewport: flag("mobile") ? { width: 390, height: 844 } : { width: 1280, height: 800 },
  });
  if (flag("dark")) await context.addInitScript(() => localStorage.setItem("theme", "dark"));
  const page = await context.newPage();
  const phone = value("as");
  if (phone) {
    await page.goto(BASE + "/login");
    await page.getByLabel("شماره موبایل").fill(phone);
    await page.getByLabel("گذرواژه", { exact: true }).fill(value("password", "Demo12345"));
    await page.getByRole("button", { name: "ورود", exact: true }).click();
    await page.waitForURL((url) => !url.pathname.endsWith("/login"));
  }
  const clinic = value("clinic");
  if (clinic) {
    await page.waitForLoadState("networkidle");
    await page.getByRole("button", { name: "تغییر کلینیک" }).click();
    await Promise.all([
      page.waitForLoadState("load"),
      page.getByRole("menuitem", { name: new RegExp(clinic) }).click(),
    ]);
    await page.waitForLoadState("networkidle");
  }
  await page.goto(BASE + target);
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(500);
  const out = value("out", "/tmp/roshan-shot.png");
  await page.screenshot({ path: out, fullPage: flag("full") });
  console.log(out);
  await browser.close();
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
