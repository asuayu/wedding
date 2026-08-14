const { spawn } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");
const { chromium } = require("@playwright/test");

const root = path.resolve(__dirname, "..");
const output = process.env.SCREENSHOT_DIR || path.join(root, "artifacts");
fs.mkdirSync(output, { recursive: true });

const server = spawn(process.execPath, [path.join(__dirname, "server.js")], {
  cwd: root,
  stdio: "ignore",
  windowsHide: true,
});

async function openWithRetry(page) {
  let lastError;
  for (let attempt = 0; attempt < 20; attempt += 1) {
    try {
      await page.goto("http://127.0.0.1:4173", { waitUntil: "networkidle", timeout: 3_000 });
      return;
    } catch (error) {
      lastError = error;
      await new Promise((resolve) => setTimeout(resolve, 200));
    }
  }
  throw lastError;
}

(async () => {
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const results = [];

  try {
    const setups = [
      { name: "love-site-desktop.png", viewport: { width: 1440, height: 1000 }, isMobile: false },
      { name: "love-site-mobile.png", viewport: { width: 390, height: 844 }, isMobile: true },
    ];

    for (const setup of setups) {
      const context = await browser.newContext({ viewport: setup.viewport, isMobile: setup.isMobile, deviceScaleFactor: 1 });
      const page = await context.newPage();
      const errors = [];
      page.on("pageerror", (error) => errors.push(error.message));
      await openWithRetry(page);

      const sections = page.locator("main section");
      for (let index = 0; index < (await sections.count()); index += 1) {
        await sections.nth(index).scrollIntoViewIfNeeded();
        await page.waitForTimeout(180);
      }
      await page.evaluate(() => {
        document.querySelectorAll(".reveal").forEach((element) => element.classList.add("is-visible"));
        window.scrollTo(0, 0);
      });
      await page.waitForTimeout(900);

      const metrics = await page.evaluate(() => ({
        viewport: document.documentElement.clientWidth,
        scrollWidth: document.documentElement.scrollWidth,
        height: document.documentElement.scrollHeight,
      }));
      await page.screenshot({ path: path.join(output, setup.name), fullPage: true });
      await page.locator("#gallery").screenshot({ path: path.join(output, setup.name.replace(".png", "-gallery.png")) });
      await page.locator("#promises").screenshot({ path: path.join(output, setup.name.replace(".png", "-promises.png")) });
      results.push({ name: setup.name, metrics, errors });
      await context.close();
    }
  } finally {
    await browser.close();
    server.kill();
  }

  console.log(JSON.stringify(results, null, 2));
})().catch((error) => {
  server.kill();
  console.error(error);
  process.exitCode = 1;
});
