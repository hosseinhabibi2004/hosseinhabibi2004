#!/usr/bin/env node
// The appointment card's state matrix (Plan 4, G10): signs in as the secretary, route-mocks the
// appointments and practitioners with a synthetic day, and shoots it so the card design can be
// judged — unconfirmed / confirmed / arrived, each plain and with a note, a long-name column,
// five lengths (15/30/45/60/90) per column; then hover, selected, focus-visible, a pending move
// and a greyscale pass. It also prints the contrast of the card text and borders in the theme.
//
//   node card-matrix.cjs --out /tmp/roshan-shots/plan-04 [--dark] [--grey] [--move] [--states]
//
// Needs the stack up (run-app SKILL.md). Never touches data: the API answers are mocked.
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
const flag = (name) => args.includes(`--${name}`);
const value = (name, fallback) => {
  const index = args.indexOf(`--${name}`);
  return index === -1 ? fallback : args[index + 1];
};
const BASE = process.env.BASE || "http://localhost:3000";
const OUT = value("out", "/tmp/roshan-shots/plan-04");
const NAME = value("name", `card-matrix${flag("dark") ? "-dark" : "-light"}${flag("grey") ? "-grey" : ""}${flag("move") ? "-move" : ""}`);

const TODAY = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Tehran" }).format(new Date());
const LENGTHS = [15, 30, 45, 60, 90];
const COLUMNS = [
  { name: "تأیید نشده", mark: {}, note: false },
  { name: "تأیید نشده + یادداشت", mark: {}, note: true },
  { name: "تأیید شد", mark: { confirmed_at: `${TODAY}T08:00:00+03:30` }, note: false },
  { name: "تأیید شد + یادداشت", mark: { confirmed_at: `${TODAY}T08:00:00+03:30` }, note: true },
  { name: "آمد", mark: { arrived_at: `${TODAY}T09:00:00+03:30` }, note: false },
  { name: "آمد + یادداشت", mark: { arrived_at: `${TODAY}T09:00:00+03:30` }, note: true },
  { name: "نام بلند", mark: {}, note: false, long: true },
];

function minutesToTime(total) {
  const h = String(Math.floor(total / 60)).padStart(2, "0");
  const m = String(total % 60).padStart(2, "0");
  return `${h}:${m}:00+03:30`;
}
const practitioner = (index, column) => ({
  id: `00000000-0000-4000-8000-00000000010${index}`,
  first_name: column.name,
  last_name: "",
  full_name: column.name,
  title: "ستون نمونه",
  color: (index % 8) + 1,
  default_duration_minutes: 45,
  is_active: true,
  sort_order: index,
  linked_member: null,
  working_hours: [0, 1, 2, 3, 4, 5, 6].map((weekday) => ({ weekday, start_time: "08:00:00", end_time: "21:00:00" })),
  created_at: "2026-11-01T08:00:00+03:30",
});
function rows() {
  const out = [];
  COLUMNS.forEach((column, index) => {
    let cursor = 9 * 60;
    LENGTHS.forEach((minutes, n) => {
      const name = column.long ? "سید محمدحسین شریف‌الدین‌زاده‌نیا" : "علی رضایی";
      out.push({
        id: `10000000-0000-4000-8000-0000000${index}${n}00`,
        version: 1,
        practitioner: practitioner(index, column).id,
        practitioner_color: (index % 8) + 1,
        patient: { id: `p${index}${n}`, first_name: name.split(" ")[0], last_name: name.split(" ").slice(1).join(" "), full_name: name, phone: "09123456789" },
        starts_at: `${TODAY}T${minutesToTime(cursor)}`,
        ends_at: `${TODAY}T${minutesToTime(cursor + minutes)}`,
        duration_minutes: minutes,
        note: column.note ? "همراه دارد؛ پرونده را بیاورد" : "",
        has_note: column.note,
        confirmed_at: null,
        arrived_at: null,
        is_deleted: false,
        last_change: { kind: "created", actor_name: "زهرا", at: `${TODAY}T07:30:00+03:30`, data: {} },
        ...column.mark,
      });
      cursor += minutes + 15;
    });
  });
  return out;
}
const envelope = (result) => JSON.stringify({ success: true, message: "GENERIC_001", details: "", result, meta: null });

(async () => {
  const browser = await chromium.launch({ executablePath: process.env.PLAYWRIGHT_CHROMIUM || undefined, args: ["--no-sandbox"] });
  const context = await browser.newContext({
    locale: "fa-IR",
    colorScheme: flag("dark") ? "dark" : "light",
    viewport: { width: 1280, height: 800 },
  });
  if (flag("dark")) await context.addInitScript(() => localStorage.setItem("theme", "dark"));
  const page = await context.newPage();
  await page.route("**/api/team/clinic/practitioners/", (route) =>
    route.fulfill({ contentType: "application/json", body: envelope(COLUMNS.map((c, i) => practitioner(i, c))) }),
  );
  await page.route(/\/api\/team\/clinic\/appointments\/\?/, (route) => {
    if (route.request().method() !== "GET") return route.continue();
    return route.fulfill({ contentType: "application/json", body: envelope({ results: rows() }) });
  });
  await page.goto(BASE + "/login");
  await page.getByLabel("شماره موبایل").fill("09120000003");
  await page.getByLabel("گذرواژه", { exact: true }).fill("Demo12345");
  await page.getByRole("button", { name: "ورود", exact: true }).click();
  await page.waitForURL((url) => !url.pathname.endsWith("/login"));
  await page.goto(`${BASE}/?view=day&d=${TODAY}`);
  await page.waitForSelector('[data-testid="day-body"]');
  await page.waitForSelector("[role=button][data-state]");
  await page.waitForLoadState("networkidle");

  const card = (column, length) =>
    page.locator("[role=button][data-state]").nth(column * LENGTHS.length + LENGTHS.indexOf(length));

  if (flag("move")) {
    await card(4, 60).click();
    await page.getByRole("menuitem", { name: "جابه‌جایی" }).click();
    await page.waitForTimeout(200);
  } else if (flag("states")) {
    await card(0, 45).hover();
    await card(2, 60).click(); // selected (menu open) …
    await page.keyboard.press("Escape");
    await card(4, 90).focus();
    await page.keyboard.press("Shift+Tab");
    await page.keyboard.press("Tab"); // keyboard focus → :focus-visible
    await card(0, 45).hover();
  }
  if (flag("grey")) await page.addStyleTag({ content: "html { filter: grayscale(1) !important; }" });
  await page.waitForTimeout(300);

  const report = await page.evaluate(() => {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 1;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    // A colour as seen: translucent ones (a border at 50 %) are composited over `backdrop`.
    const rgb = (css, backdrop = "#fff") => {
      ctx.fillStyle = "#000";
      ctx.fillStyle = backdrop;
      ctx.fillRect(0, 0, 1, 1);
      ctx.fillStyle = css;
      ctx.fillRect(0, 0, 1, 1);
      return [...ctx.getImageData(0, 0, 1, 1).data.slice(0, 3)];
    };
    const lum = ([r, g, b]) => {
      const f = (v) => ((v /= 255) <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
      return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
    };
    const ratio = (a, b) => {
      const [hi, lo] = [lum(rgb(a, b)), lum(rgb(b))].sort((x, y) => y - x);
      return Number(((hi + 0.05) / (lo + 0.05)).toFixed(2));
    };
    const page = getComputedStyle(document.body).backgroundColor;
    const out = {};
    for (const state of ["unconfirmed", "confirmed", "arrived"]) {
      const el = document.querySelector(`[role=button][data-state=${state}]`);
      const css = getComputedStyle(el);
      out[state] = {
        textOnFill: ratio(css.color, css.backgroundColor),
        borderOnFill: css.borderTopStyle === "none" ? null : ratio(css.borderTopColor, css.backgroundColor),
        borderOnPage: css.borderTopStyle === "none" ? null : ratio(css.borderTopColor, page),
        fillOnPage: ratio(css.backgroundColor, page),
      };
    }
    return out;
  });
  console.log(JSON.stringify(report));
  require("node:fs").mkdirSync(OUT, { recursive: true });
  const file = path.join(OUT, `${NAME}.png`);
  await page.screenshot({ path: file, clip: { x: 0, y: 0, width: 1280, height: 800 } });
  console.log(file);
  await browser.close();
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
