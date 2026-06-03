// Bug-fix verification: hands must be a pure function of scroll.
//   1) down-sweep + up-sweep: record both hands' computed opacity, typed-count,
//      status at each scroll height. Assert hands are 0 OUTSIDE the demo band
//      (esp. the close/regrow band ≈ the scrollY 9424 region) in BOTH directions.
//   2) reload-at-deep: land cold at a deep scroll → hands must stay 0 (the
//      "right hand ghosts on refresh" bug).
//   3) sanity: hands DO appear mid-band + text types out by scroll.
// Run: `npm run dev` then `node scripts/verify-hands.mjs` (URL env to override).
import { chromium } from "playwright";

const URL = process.env.URL ?? "http://localhost:5174";

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const errors = [];
page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
page.on("pageerror", (e) => errors.push(String(e)));

const sample = () =>
  page.evaluate(() => {
    const op = (sel) => {
      const el = document.querySelector(sel);
      return el ? Math.round(parseFloat(getComputedStyle(el).opacity) * 1000) / 1000 : -1;
    };
    const p = document.querySelector(".cine-app p");
    const typed = p ? p.textContent.replace(/\s/g, "").length : -1;
    const pill = document.querySelector(".cine-app .ml-auto");
    const status = pill ? pill.textContent.trim() : "";
    return {
      y: Math.round(window.scrollY),
      right: op(".cine-hand"),
      left: op(".cine-hand-left"),
      typed,
      status,
    };
  });

async function scrollTo(target) {
  for (let i = 0; i < 80; i++) {
    const y = await page.evaluate(() => window.scrollY);
    if (Math.abs(y - target) < 8) break;
    await page.mouse.wheel(0, (target - y) * 0.6);
    await page.waitForTimeout(70);
  }
  await page.waitForTimeout(420); // let scrub + Lenis settle
}

let fail = false;
const log = (...a) => console.log(...a);

try {
  await page.goto(URL, { waitUntil: "networkidle" });
  const maxScroll = await page.evaluate(
    () => document.documentElement.scrollHeight - window.innerHeight,
  );
  log(`maxScroll=${maxScroll}`);

  const N = 40;
  const down = [];
  for (let i = 0; i <= N; i++) {
    await scrollTo(Math.round((maxScroll * i) / N));
    const s = await sample();
    s.frac = +(s.y / maxScroll).toFixed(3);
    down.push(s);
  }
  // up-sweep (the reported flash direction)
  const up = [];
  for (let i = N; i >= 0; i--) {
    await scrollTo(Math.round((maxScroll * i) / N));
    const s = await sample();
    s.frac = +(s.y / maxScroll).toFixed(3);
    up.push(s);
  }

  const fmt = (s) =>
    `frac ${String(s.frac).padEnd(5)} y=${String(s.y).padStart(5)}  R=${String(s.right).padEnd(5)} L=${String(s.left).padEnd(5)} typed=${String(s.typed).padStart(3)} [${s.status}]`;
  log("\n── DOWN sweep ──");
  down.forEach((s) => log(fmt(s)));
  log("\n── UP sweep ──");
  up.forEach((s) => log(fmt(s)));

  // Demo band = where the right hand is actually visible.
  const visible = down.filter((s) => s.right > 0.3 || s.left > 0.3);
  const bandLo = Math.min(...visible.map((s) => s.frac));
  const bandHi = Math.max(...visible.map((s) => s.frac));
  log(`\nhand-visible band ≈ frac [${bandLo}, ${bandHi}]`);

  // ── ASSERTIONS ──
  const EPS = 0.03;
  // (a) no ghost OUTSIDE a generous band [0.28, 0.66] in EITHER direction.
  const outside = [...down, ...up].filter((s) => s.frac < 0.28 || s.frac > 0.66);
  const ghosts = outside.filter((s) => s.right > EPS || s.left > EPS);
  if (ghosts.length) {
    fail = true;
    log(`\n✗ GHOST: hand visible outside demo band at:`);
    ghosts.forEach((s) => log("   " + fmt(s)));
  } else {
    log(`\n✓ no hand ghost anywhere outside [0.28,0.66] (both directions)`);
  }
  // (b) choreography alive: both hands reach a clear press mid-band.
  const rMax = Math.max(...down.map((s) => s.right));
  const lMax = Math.max(...down.map((s) => s.left));
  if (rMax > 0.6 && lMax > 0.6) log(`✓ both hands appear mid-band (Rmax=${rMax}, Lmax=${lMax})`);
  else { fail = true; log(`✗ hand never appears (Rmax=${rMax}, Lmax=${lMax})`); }
  // (c) text types by scroll: ~0 at top, full deep.
  const typedTop = down[0].typed;
  const typedFull = Math.max(...down.map((s) => s.typed));
  if (typedTop <= 1 && typedFull >= 200) log(`✓ text reveals by scroll (top=${typedTop}, max=${typedFull})`);
  else { fail = true; log(`✗ text reveal off (top=${typedTop}, max=${typedFull})`); }

  // (2) reload at a DEEP scroll (close band) → hands must stay 0.
  await scrollTo(Math.round(maxScroll * 0.9));
  const beforeReload = await sample();
  beforeReload.frac = +(beforeReload.y / maxScroll).toFixed(3);
  await page.reload({ waitUntil: "networkidle" });
  await page.waitForTimeout(700);
  const afterReload = await sample();
  afterReload.frac = +(afterReload.y / maxScroll).toFixed(3);
  log(`\nreload: before ${fmt(beforeReload)}`);
  log(`reload: after  ${fmt(afterReload)}  (scrollRestoration landed y=${afterReload.y})`);
  if (afterReload.right <= EPS && afterReload.left <= EPS)
    log(`✓ no hand ghost after refresh (R=${afterReload.right}, L=${afterReload.left})`);
  else { fail = true; log(`✗ hand GHOSTED after refresh (R=${afterReload.right}, L=${afterReload.left})`); }
} finally {
  await browser.close();
}

if (errors.length) { console.error("\nCONSOLE ERRORS:\n" + errors.join("\n")); fail = true; }
console.log(fail ? "\nRESULT: FAIL" : "\nRESULT: PASS — hands & text are pure scroll functions");
process.exit(fail ? 1 : 0);
