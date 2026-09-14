// Statyczne testy struktury demorecorder.html oraz manifestu przykładowego.
// Bez przeglądarki i bez zależności — sprawdzają, że aplikacja nie zgubi
// wymaganych elementów UI i nie ładuje niczego z sieci.
import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { readHtml, readAppScript, assertScriptParses, loadCore } from "./helpers.mjs";

const REQUIRED_IDS = [
  "visualizer", "topbar", "status", "btn-rec", "btn-fullscreen", "btn-export",
  "loadFolder", "folderInput", "play", "pause", "stop", "progress",
  "progressFill", "time", "dropzone"
];

test("plik HTML ma podstawową strukturę dokumentu", async () => {
  const html = await readHtml();
  assert.match(html, /^<!DOCTYPE html>/i);
  assert.match(html, /<html lang="pl">/);
  assert.match(html, /<title>CyberPlayer STUDIO/);
  assert.match(html, /<canvas id="visualizer"/);
});

test("aplikacja zawiera wszystkie wymagane elementy UI", async () => {
  const html = await readHtml();
  for (const id of REQUIRED_IDS) {
    assert.ok(new RegExp(`id="${id}"`).test(html), `brakuje elementu #${id}`);
  }
});

test("dostępne są trzy motywy, trzy tryby equalizera i trzy poziomy jakości", async () => {
  const html = await readHtml();
  for (const [attribute, expected] of [["data-theme", 3], ["data-eq", 3], ["data-quality", 3]]) {
    const count = (html.match(new RegExp(`${attribute}=`, "g")) || []).length;
    assert.equal(count, expected, `oczekiwano ${expected} kontrolek ${attribute}, znaleziono ${count}`);
  }
});

test("fallback wyboru katalogu (webkitdirectory) został zachowany", async () => {
  const html = await readHtml();
  assert.match(html, /id="folderInput"[^>]*webkitdirectory/);
  assert.match(html, /id="loadFolder"/);
});

test("skrypt jest osadzony w jednym bloku i ma poprawną składnię", async () => {
  const html = await readHtml();
  const opens = (html.match(/<script>/g) || []).length;
  const closes = (html.match(/<\/script>/g) || []).length;
  assert.equal(opens, 1, "aplikacja powinna mieć dokładnie jeden blok <script>");
  assert.equal(closes, 1);
  const script = await readAppScript();
  assertScriptParses(script);
});

test("aplikacja nie ładuje zasobów z sieci", async () => {
  const html = await readHtml();
  assert.ok(!/<script[^>]+src=/i.test(html), "brak zewnętrznych skryptów");
  assert.ok(!/<link[^>]+href=/i.test(html), "brak zewnętrznych arkuszy stylów");
  assert.ok(!/https?:\/\/(?!www\.w3\.org)/i.test(html), "brak odwołań do zdalnych zasobów");
});

test("skrypt nie nadpisuje historii DOM przed inicjalizacją canvasu", async () => {
  const script = await readAppScript();
  assert.match(script, /const canvas = document\.getElementById\("visualizer"\)/);
  assert.match(script, /window\.requestAnimationFrame\(render\)/);
});

test("project.example.json jest poprawnym manifestem w pełni załadowanym", async () => {
  const raw = await readFile(new URL("../project.example.json", import.meta.url), "utf8");
  const core = await loadCore();
  const result = core.parseProjectManifest(raw);
  assert.equal(result.ok, true, result.error);
  assert.equal(result.reason, "ok");
  assert.equal(result.version, 1);
  assert.ok(result.manifest.audio.endsWith(".mp3"));
  assert.ok(result.manifest.cues.endsWith(".lrc"));
  assert.ok(result.manifest.scenes.length > 0);

  const timeline = core.buildSceneTimeline(result.manifest.scenes, { audioDuration: 300 });
  assert.equal(timeline.warnings.length, 0, timeline.warnings.join(" | "));
  assert.equal(timeline.scenes.length, result.manifest.scenes.length);
  for (let i = 1; i < timeline.scenes.length; i++) {
    assert.ok(timeline.scenes[i].start >= timeline.scenes[i - 1].start, "sceny są uporządkowane w czasie");
  }
  for (const scene of timeline.scenes) {
    assert.ok(scene.duration > 0, `scena ${scene.image} ma dodatni czas trwania`);
  }
});
