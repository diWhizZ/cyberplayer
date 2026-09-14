// Testy integracyjne pipeline'u ładowania projektu: manifest + pliki → plan scen.
// Aplikacja jest uruchamiana w stubie DOM (tests/dom-stub.mjs), dzięki czemu
// sprawdzamy realne zachowanie loadProject(), a nie tylko czyste funkcje.
import test from "node:test";
import assert from "node:assert/strict";
import { bootApp, projectFile, textFile, imageFile, audioFile, planSummary, missingSummary, toArray } from "./dom-stub.mjs";

const MANIFEST = {
  version: 1,
  audio: "ghost_ai.mp3",
  cues: "ghost_ai.lrc",
  theme: "green",
  equalizer: 2,
  scenes: [
    { image: "02_face.jpg", start: 12, duration: 8, transition: "cut" },
    { image: "01_intro.jpg", start: 0, duration: 12, transition: "crossfade" },
    { image: "03_city.webp", start: 20, duration: 10 }
  ],
  render: { fps: 30, crt: 0.4, transitionSeconds: 2 }
};

function baseFiles(manifest) {
  return [
    audioFile("ghost_ai.mp3"),
    textFile("ghost_ai.lrc", "[00:00.00]I dream in static\n[00:04.50]A thousand voices"),
    imageFile("01_intro.jpg"),
    imageFile("02_face.jpg"),
    imageFile("03_city.webp"),
    projectFile("project.json", JSON.stringify(manifest))
  ];
}

async function bootAndLoad(files, { duration } = {}) {
  const harness = await bootApp();
  if (duration !== undefined) harness.app.audio.duration = duration;
  await harness.app.loadProject(files);
  return harness;
}

test("manifest buduje plan scen w kolejności czasu, nie kolejności plików", async () => {
  const harness = await bootAndLoad(baseFiles(MANIFEST));
  const plan = planSummary(harness.app.getScenePlan());

  assert.deepEqual(plan.map(scene => scene.name), ["01_intro.jpg", "02_face.jpg", "03_city.webp"]);
  assert.deepEqual(plan.map(scene => [scene.start, scene.end]), [[0, 12], [12, 20], [20, 30]]);
  assert.equal(plan[1].transition, "cut");
  assert.ok(plan.every(scene => scene.hasImg), "każda scena ma wczytany obraz");
  assert.deepEqual(missingSummary(harness.app.getIssues().missing), []);
  assert.match(harness.status(), /MANIFEST: 3 SCEN/);
  assert.match(harness.status(), /2 CUES/);
});

test("manifest ustawia motyw, equalizer i parametry renderowania", async () => {
  const harness = await bootAndLoad(baseFiles(MANIFEST));
  assert.equal(harness.app.getTheme(), "green");
  assert.equal(harness.app.getEq(), 2);
  assert.equal(harness.app.getRender().fps, 30);
  assert.equal(harness.app.getRender().crt, 0.4);
  assert.equal(harness.app.getRender().transitionSeconds, 2);
});

test("brakujący obraz w manifeście nie przerywa działania aplikacji", async () => {
  const manifest = JSON.parse(JSON.stringify(MANIFEST));
  manifest.scenes.push({ image: "04_missing.jpg", start: 30, duration: 5 });
  const harness = await bootAndLoad(baseFiles(manifest));

  const issues = harness.app.getIssues();
  assert.deepEqual(missingSummary(issues.missing), [{ role: "scene", name: "04_missing.jpg" }]);
  const plan = planSummary(harness.app.getScenePlan());
  assert.equal(plan.length, 4, "scena bez pliku zostaje w timeline jako puste miejsce");
  assert.equal(plan.filter(scene => scene.hasImg).length, 3, "pozostałe sceny są nadal odtwarzane");
  assert.deepEqual(plan.map(scene => scene.start), [0, 12, 20, 30], "czasy pozostałych scen nie przesuwają się");
  assert.match(harness.status(), /BRAK PLIKÓW \(1\)/);
  assert.match(harness.status(), /04_missing\.jpg/);
});

test("brakujące audio i LRC w manifeście są raportowane, aplikacja używa znalezionych plików", async () => {
  const manifest = JSON.parse(JSON.stringify(MANIFEST));
  manifest.audio = "nie_ma_takiego.mp3";
  manifest.cues = "nie_ma_takiego.lrc";
  const harness = await bootAndLoad(baseFiles(manifest));

  const issues = harness.app.getIssues();
  assert.deepEqual(missingSummary(issues.missing).map(item => item.role).sort(), ["audio", "cues"]);
  assert.equal(harness.app.getMeta().audio, "ghost_ai.mp3");
  assert.equal(harness.app.getMeta().cues, "ghost_ai.lrc");
  assert.ok(toArray(issues.warnings).some(warning => /nie_ma_takiego\.mp3/.test(warning)));
  assert.equal(harness.app.getScenePlan().length, 3);
});

test("błędny JSON w project.json przełącza aplikację w tryb automatyczny", async () => {
  const files = [
    audioFile("ghost_ai.mp3"),
    imageFile("01_intro.jpg"),
    imageFile("02_face.jpg"),
    projectFile("project.json", "{ \"audio\": ")
  ];
  const harness = await bootAndLoad(files, { duration: 20 });

  assert.equal(harness.app.getIssues().reason, "invalid-json");
  assert.equal(harness.app.getManifest(), null);
  assert.equal(harness.app.getScenePlan().length, 2);
  assert.match(harness.status(), /BŁĘDNY PROJECT\.JSON/);
});

test("poprawny manifest bez scen rozkłada obrazy automatycznie", async () => {
  const files = [
    audioFile("ghost_ai.mp3"),
    imageFile("01_intro.jpg"),
    imageFile("02_face.jpg"),
    imageFile("03_city.webp"),
    projectFile("project.json", JSON.stringify({ version: 1, audio: "ghost_ai.mp3" }))
  ];
  const harness = await bootAndLoad(files, { duration: 30 });

  assert.equal(harness.app.getIssues().reason, "no-scenes");
  assert.deepEqual(planSummary(harness.app.getScenePlan()).map(scene => [scene.start, scene.end]), [[0, 10], [10, 20], [20, 30]]);
  assert.match(harness.status(), /AUTO: 3 GRAFIK/);
});

test("scena wyłączona przez enabled: false znika z planu", async () => {
  const manifest = JSON.parse(JSON.stringify(MANIFEST));
  manifest.scenes.push({ image: "03_city.webp", start: 30, duration: 5, enabled: false });
  const harness = await bootAndLoad(baseFiles(manifest));

  assert.equal(harness.app.getScenePlan().length, 3);
  assert.ok(toArray(harness.app.getIssues().warnings).some(warning => /enabled/.test(warning)));
});

test("uszkodzony obraz jest pomijany bez błędu krytycznego", async () => {
  const files = [
    audioFile("ghost_ai.mp3"),
    imageFile("01_broken.jpg"),
    imageFile("02_ok.jpg"),
    projectFile("project.json", JSON.stringify({
      version: 1,
      scenes: [{ image: "01_broken.jpg", start: 0, duration: 5 }, { image: "02_ok.jpg", start: 5, duration: 5 }]
    }))
  ];
  const harness = await bootAndLoad(files);
  const plan = planSummary(harness.app.getScenePlan());
  assert.equal(plan.length, 2);
  assert.equal(plan.filter(scene => scene.hasImg).length, 1, "tylko poprawny obraz jest renderowany");
});

test("bez project.json aplikacja działa w trybie kompatybilnym wstecz", async () => {
  const files = [
    audioFile("ghost_ai.mp3"),
    textFile("ghost_ai.lrc", "[00:01.00]Pierwszy cue"),
    imageFile("01_intro.jpg"),
    imageFile("02_face.jpg")
  ];
  const harness = await bootAndLoad(files, { duration: 40 });

  assert.equal(harness.app.getManifest(), null);
  assert.equal(harness.app.getIssues().reason, "no-manifest");
  assert.deepEqual(planSummary(harness.app.getScenePlan()).map(scene => [scene.start, scene.end]), [[0, 20], [20, 40]]);
  assert.match(harness.status(), /PROJEKT ZAŁADOWANY: AUDIO, AUTO: 2 GRAFIK, 1 CUES/);
});

test("długość audio pobrana po czasie wydłuża ostatnią scenę manifestu", async () => {
  const harness = await bootApp();
  await harness.app.loadProject(baseFiles(MANIFEST));
  harness.app.audio.duration = 120;
  harness.app.audio.dispatch("loadedmetadata");

  const plan = harness.app.getScenePlan();
  assert.equal(plan[plan.length - 1].end, 120);
});

test("eksport project.json zapisuje audio, cues, motyw, equalizer, sceny i render", async () => {
  const harness = await bootAndLoad(baseFiles(MANIFEST), { duration: 30 });
  harness.app.exportProjectJson();

  const blob = harness.blobs[harness.blobs.length - 1];
  const json = JSON.parse(await blob.text());
  assert.equal(json.version, 1);
  assert.equal(json.audio, "ghost_ai.mp3");
  assert.equal(json.cues, "ghost_ai.lrc");
  assert.equal(json.theme, "green");
  assert.equal(json.equalizer, 2);
  assert.equal(json.scenes.length, 3);
  assert.deepEqual(toArray(json.scenes).map(scene => scene.image), ["01_intro.jpg", "02_face.jpg", "03_city.webp"]);
  assert.deepEqual(toArray(json.scenes).map(scene => scene.start), [0, 12, 20]);
  assert.equal(json.scenes[1].transition, "cut");
  assert.equal(json.render.fps, 30);
  assert.equal(json.render.crt, 0.4);
  assert.match(harness.status(), /ZAPISANO project\.json \(3 SCEN\)/);
});

test("wyeksportowany manifest jest akceptowany przy ponownym wczytaniu", async () => {
  const first = await bootAndLoad(baseFiles(MANIFEST), { duration: 30 });
  first.app.exportProjectJson();
  const exported = await first.blobs[first.blobs.length - 1].text();

  const second = await bootAndLoad(baseFiles(JSON.parse(exported)), { duration: 30 });
  assert.equal(second.app.getIssues().reason, "ok");
  assert.deepEqual(missingSummary(second.app.getIssues().missing), []);
  assert.deepEqual(planSummary(second.app.getScenePlan()).map(scene => scene.name), ["01_intro.jpg", "02_face.jpg", "03_city.webp"]);
  assert.equal(second.app.getTheme(), "green");
});

test("zmiana katalogu w trakcie ładowania nie nadpisuje nowszego projektu", async () => {
  const harness = await bootApp();
  const stale = baseFiles(MANIFEST);
  const fresh = [audioFile("inne.mp3"), imageFile("99_inne.jpg")];
  await Promise.all([harness.app.loadProject(stale), harness.app.loadProject(fresh)]);

  const plan = planSummary(harness.app.getScenePlan());
  assert.deepEqual(plan.map(scene => scene.name), ["99_inne.jpg"], "wygrywa ostatnio wskazany katalog");
  assert.equal(harness.app.getManifest(), null);
});

// --- DRAG AND DROP ---
function fileEntry(file) {
  return { isFile: true, isDirectory: false, file: callback => callback(file) };
}
function dirEntry(children) {
  let served = false;
  return {
    isFile: false,
    isDirectory: true,
    createReader: () => ({
      readEntries: callback => {
        if (served) { callback([]); return; }
        served = true;
        callback(children);
      }
    })
  };
}
function dataTransferFromEntries(entries) {
  return { items: entries.map(entry => ({ webkitGetAsEntry: () => entry })), files: [] };
}
function dataTransferFromFiles(files) {
  return { items: [], files };
}

test("drag and drop katalogu ładuje projekt tym samym pipeline'em co folder picker", async () => {
  const harness = await bootApp();
  harness.app.audio.duration = 20;
  await harness.app.handleDroppedFiles(dataTransferFromEntries([
    dirEntry([
      fileEntry(audioFile("ghost_ai.mp3")),
      fileEntry(imageFile("01_intro.jpg")),
      fileEntry(imageFile("02_face.jpg")),
      fileEntry(textFile("ghost_ai.lrc", "[00:02.00]Drag and drop cue")),
      fileEntry(projectFile("project.json", JSON.stringify({
        version: 1,
        audio: "ghost_ai.mp3",
        cues: "ghost_ai.lrc",
        scenes: [{ image: "02_face.jpg", start: 10 }, { image: "01_intro.jpg", start: 0 }]
      })))
    ])
  ]));

  const plan = planSummary(harness.app.getScenePlan());
  assert.deepEqual(plan.map(scene => scene.name), ["01_intro.jpg", "02_face.jpg"]);
  assert.deepEqual(missingSummary(harness.app.getIssues().missing), []);
  assert.match(harness.status(), /MANIFEST: 2 SCEN/);
});

test("drag and drop odrzuca nieobsługiwane pliki bez błędu krytycznego", async () => {
  const harness = await bootApp();
  await harness.app.handleDroppedFiles(dataTransferFromFiles([
    audioFile("ghost_ai.mp3"),
    imageFile("01_intro.jpg"),
    textFile("notatki.txt", "to nie jest część projektu"),
    { name: "archiwum.zip", type: "application/zip" }
  ]));

  assert.match(harness.status(), /POMINIĘTO 2/);
  assert.equal(planSummary(harness.app.getScenePlan()).length, 1);
});

test("drag and drop bez żadnych obsługiwanych plików zgłasza status, nie błąd", async () => {
  const harness = await bootApp();
  await harness.app.handleDroppedFiles(dataTransferFromFiles([{ name: "archiwum.zip", type: "application/zip" }]));
  assert.match(harness.status(), /POMINIĘTO 1 PLIKÓW/);
  assert.equal(harness.app.getScenePlan().length, 0);
});

test("drag and drop pustego zrzutu nie wysypuje aplikacji", async () => {
  const harness = await bootApp();
  await harness.app.handleDroppedFiles(dataTransferFromFiles([]));
  assert.match(harness.status(), /NIE WYKRYTO PLIKÓW/);
});
