// Opcjonalny test smoke w prawdziwej przeglądarce (Playwright).
// Wymaga lokalnej instalacji: npm i -D playwright && npx playwright install chromium
// Gdy Playwright nie jest dostępny, test jest pomijany — nie blokuje `node --test tests/`.
import test from "node:test";
import assert from "node:assert/strict";
import { pathToFileURL } from "node:url";
import { HTML_PATH } from "./helpers.mjs";

let chromium = null;
let skippedReason = "";
try {
  const playwright = await import("playwright");
  chromium = playwright.chromium || null;
  if (!chromium) skippedReason = "playwright nie udostępnia chromium";
} catch (error) {
  skippedReason = "playwright nie jest zainstalowany (npm i -D playwright && npx playwright install chromium)";
}

const smoke = (name, fn) => test(name, { skip: chromium ? false : skippedReason }, fn);

async function openApp(browser) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  const errors = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.goto(pathToFileURL(HTML_PATH.pathname).href);
  await page.waitForSelector("#visualizer");
  return { page, errors };
}

smoke("aplikacja startuje bez błędów i wystawia CyberCore", async () => {
  const browser = await chromium.launch();
  try {
    const { page, errors } = await openApp(browser);
    const hasCore = await page.evaluate(() => typeof window.CyberCore === "object");
    assert.equal(hasCore, true);
    const formatted = await page.evaluate(() => window.CyberCore.formatTime(65));
    assert.equal(formatted, "01:05");
    const canvasSize = await page.evaluate(() => {
      const canvas = document.getElementById("visualizer");
      return { width: canvas.width, height: canvas.height };
    });
    assert.ok(canvasSize.width > 0 && canvasSize.height > 0);
    assert.deepEqual(errors, []);
  } finally {
    await browser.close();
  }
});

smoke("zmiana motywu aktualizuje zmienne CSS i przyciski", async () => {
  const browser = await chromium.launch();
  try {
    const { page } = await openApp(browser);
    await page.click('[data-theme="amber"]');
    const state = await page.evaluate(() => ({
      main: getComputedStyle(document.documentElement).getPropertyValue("--main").trim(),
      active: document.querySelector('[data-theme="amber"]').classList.contains("active"),
      cyanActive: document.querySelector('[data-theme="cyan"]').classList.contains("active")
    }));
    assert.equal(state.main, "#ffaa00");
    assert.equal(state.active, true);
    assert.equal(state.cyanActive, false);
  } finally {
    await browser.close();
  }
});

smoke("przycisk eksportu pobiera plik project.json", async () => {
  const browser = await chromium.launch();
  try {
    const { page } = await openApp(browser);
    const [download] = await Promise.all([
      page.waitForEvent("download", { timeout: 5000 }),
      page.click("#btn-export")
    ]);
    assert.equal(download.suggestedFilename(), "project.json");
    const status = await page.textContent("#status");
    assert.match(status, /project\.json/i);
  } finally {
    await browser.close();
  }
});

smoke("skróty klawiaturowe Space i R nie powodują błędów", async () => {
  const browser = await chromium.launch();
  try {
    const { page, errors } = await openApp(browser);
    await page.click("body");
    await page.keyboard.press("Space");
    await page.keyboard.press("r");
    await page.waitForTimeout(200);
    assert.deepEqual(errors, []);
  } finally {
    await browser.close();
  }
});
