// 驱动电影页逐帧滚动并截图,供人工判读 + 断言 0 console error。
// 用 mouse.wheel 驱动(Lenis 走原生平滑滚动,wheel 最稳)。
// 先 `npm run dev`(5173),再 `node scripts/verify-transition.mjs`。
import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";

const URL = process.env.URL ?? "http://localhost:5173";
const OUT = "scripts/shots";
const FRACTIONS = [
  0, 0.08, 0.16, 0.24, 0.32, 0.4, 0.48, 0.56, 0.64, 0.72, 0.8, 0.88, 0.94, 1,
];

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

const errors = [];
page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
page.on("pageerror", (e) => errors.push(String(e)));

try {
  await page.goto(URL, { waitUntil: "networkidle" });
  await mkdir(OUT, { recursive: true });

  const maxScroll = await page.evaluate(
    () => document.documentElement.scrollHeight - window.innerHeight,
  );

  for (const f of FRACTIONS) {
    const target = Math.round(maxScroll * f);
    for (let i = 0; i < 80; i++) {
      const y = await page.evaluate(() => window.scrollY);
      if (Math.abs(y - target) < 8) break;
      await page.mouse.wheel(0, (target - y) * 0.6);
      await page.waitForTimeout(80);
    }
    await page.waitForTimeout(450); // let scrub + Lenis settle
    const tag = String(Math.round(f * 100)).padStart(3, "0");
    await page.screenshot({ path: `${OUT}/f-${tag}.png` });
    const y = await page.evaluate(() => Math.round(window.scrollY));
    console.log(`shot f-${tag}.png @scrollY ${y}/${maxScroll}`);
  }
} finally {
  await browser.close();
}

if (errors.length) {
  console.error("CONSOLE ERRORS:\n" + errors.join("\n"));
  process.exit(1);
}
console.log("OK — no console errors");
