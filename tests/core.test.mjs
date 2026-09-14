// Testy czystej logiki CyberPlayer: parser LRC, manifest project.json,
// walidacja/ Timeline scen, mapowanie plików, eksport manifestu, formatowanie czasu.
// Uruchomienie: node --test tests/
import test from "node:test";
import assert from "node:assert/strict";
import { loadCore, readCoreSource, fakeFile } from "./helpers.mjs";

const core = await loadCore();

test("blok CYBERPLAYER-CORE nie dotyka DOM ani Web Audio", async () => {
  const source = await readCoreSource();
  assert.ok(!/\bdocument\./.test(source), "core nie może używać document");
  assert.ok(!/\bwindow\./.test(source), "core nie może używać window");
  assert.ok(!/\bAudio\b/.test(source), "core nie może używać Web Audio");
});

test("CyberCore eksponuje kompletny zestaw funkcji", () => {
  for (const name of [
    "formatTime", "parseLRC", "parseProjectManifest", "buildSceneTimeline",
    "resolveManifestFiles", "serializeProject", "normalizeRender",
    "isAudioFile", "isImageFile", "isCueFile", "isProjectFile"
  ]) {
    assert.equal(typeof core[name], "function", `brakuje funkcji ${name}`);
  }
  assert.equal(core.PROJECT_SCHEMA_VERSION, 1);
});

// --- FORMATOWANIE CZASU ---
test("formatTime formatuje sekundy na mm:ss", () => {
  assert.equal(core.formatTime(0), "00:00");
  assert.equal(core.formatTime(5), "00:05");
  assert.equal(core.formatTime(65.9), "01:05");
  assert.equal(core.formatTime(600), "10:00");
  assert.equal(core.formatTime(3599), "59:59");
});

test("formatTime obsługuje wartości nietypowe", () => {
  assert.equal(core.formatTime(NaN), "00:00");
  assert.equal(core.formatTime(undefined), "00:00");
  assert.equal(core.formatTime(null), "00:00");
  assert.equal(core.formatTime(-12), "00:00");
  assert.equal(core.formatTime("abc"), "00:00");
});

// --- PARSER LRC ---
test("parseLRC czyta znaczniki mm:ss i mm:ss.xx", () => {
  const cues = core.parseLRC("[00:00.00]I dream in static\n[00:04.50]A thousand voices");
  assert.equal(cues.length, 2);
  assert.equal(cues[0].t, 0);
  assert.equal(cues[1].t, 4.5);
  assert.equal(cues[1].line, "A thousand voices");
});

test("parseLRC obsługuje wiele znaczników w jednej linii", () => {
  const cues = core.parseLRC("[00:10.00][01:20.00]Powtórzony cue");
  assert.equal(cues.length, 2);
  assert.deepEqual(cues.map(cue => cue.t), [10, 80]);
  assert.equal(cues[0].line, "Powtórzony cue");
});

test("parseLRC obsługuje CRLF, znaczniki bez ułamków i trzycyfrowe ułamki", () => {
  const cues = core.parseLRC("[00:01]Bez ulamka\r\n[00:01.123]Trzy cyfry\r\n");
  assert.equal(cues.length, 2);
  assert.equal(cues[0].t, 1);
  assert.equal(cues[1].t, 1.123);
});

test("parseLRC pomija metadane i linie bez znaczników", () => {
  const cues = core.parseLRC("[ar:Ghost AI]\n[ti:Signal]\n[offset:0]\nTekst bez znacznika\n\n[00:02.00]Właściwy cue");
  assert.equal(cues.length, 1);
  assert.equal(cues[0].line, "Właściwy cue");
});

test("parseLRC sortuje cue po czasie i toleruje puste wejście", () => {
  const cues = core.parseLRC("[00:30.00]Późny\n[00:01.00]Wczesny");
  assert.deepEqual(cues.map(cue => cue.t), [1, 30]);
  assert.deepEqual(core.parseLRC(""), []);
  assert.deepEqual(core.parseLRC(null), []);
  assert.deepEqual(core.parseLRC(undefined), []);
});

// --- MANIFEST project.json ---
test("parseProjectManifest wykrywa błędny JSON", () => {
  const result = core.parseProjectManifest("{ \"audio\": ");
  assert.equal(result.ok, false);
  assert.equal(result.reason, "invalid-json");
  assert.ok(result.error.length > 0);
  assert.equal(result.manifest, null);
});

test("parseProjectManifest wykrywa pusty plik i JSON, który nie jest obiektem", () => {
  assert.equal(core.parseProjectManifest("").reason, "invalid-json");
  assert.equal(core.parseProjectManifest("   ").reason, "invalid-json");
  assert.equal(core.parseProjectManifest("[]").reason, "invalid-shape");
  assert.equal(core.parseProjectManifest("null").reason, "invalid-shape");
  assert.equal(core.parseProjectManifest('"napis"').reason, "invalid-shape");
});

test("parseProjectManifest raportuje poprawny JSON bez wskazanych plików", () => {
  const result = core.parseProjectManifest('{ "version": 1, "theme": "amber" }');
  assert.equal(result.ok, true);
  assert.equal(result.reason, "empty-manifest");
  assert.ok(result.warnings.some(warning => /trybu automatycznego/i.test(warning)));
});

test("parseProjectManifest raportuje manifest bez scen", () => {
  const result = core.parseProjectManifest('{ "version": 1, "audio": "ghost.mp3", "cues": "ghost.lrc" }');
  assert.equal(result.ok, true);
  assert.equal(result.reason, "no-scenes");
  assert.equal(result.manifest.audio, "ghost.mp3");
  assert.ok(result.warnings.some(warning => /scen/i.test(warning)));
});

test("parseProjectManifest raportuje manifest bez poprawnych scen jako no-scenes", () => {
  const result = core.parseProjectManifest(JSON.stringify({ version: 1, scenes: [{ start: 0 }, null, "napis"] }));
  assert.equal(result.ok, true);
  assert.equal(result.reason, "no-scenes");
  assert.equal(result.manifest.scenes.length, 0);
});

test("parseProjectManifest czyta pełny manifest i normalizuje ustawienia", () => {
  const manifest = {
    version: 1,
    audio: "ghost_ai.mp3",
    cues: "ghost_ai.lrc",
    theme: "AMBER",
    equalizer: 2,
    scenes: [
      { image: "01_intro.jpg", start: 0, duration: 12.5, transition: "crossfade" },
      { image: "02_face.jpg", start: 12.5, transition: "cut" }
    ],
    render: { fps: 30, videoBitrate: 8000000, crt: 0.5, transitionSeconds: 2, showTerminal: false }
  };
  const result = core.parseProjectManifest(JSON.stringify(manifest));
  assert.equal(result.ok, true);
  assert.equal(result.reason, "ok");
  assert.equal(result.manifest.theme, "amber");
  assert.equal(result.manifest.equalizer, 2);
  assert.equal(result.manifest.scenes.length, 2);
  assert.equal(result.manifest.render.fps, 30);
  assert.equal(result.manifest.render.crt, 0.5);
  assert.equal(result.manifest.render.transitionSeconds, 2);
  assert.equal(result.manifest.render.showTerminal, false);
  assert.equal(result.manifest.render.showEqualizer, true, "niepodane flagi renderowania mają domyślnie true");
});

test("parseProjectManifest ostrzega o braku i nieznanej wersji schematu", () => {
  const withoutVersion = core.parseProjectManifest('{ "audio": "a.mp3" }');
  assert.equal(withoutVersion.version, 1);
  assert.ok(withoutVersion.warnings.some(warning => /version/i.test(warning)));

  const future = core.parseProjectManifest('{ "version": 99, "audio": "a.mp3", "scenes": [{ "image": "a.jpg" }] }');
  assert.equal(future.ok, true);
  assert.ok(future.warnings.some(warning => /99/.test(warning)));
});

test("parseProjectManifest akceptuje alias lrc i nieznany motyw", () => {
  const result = core.parseProjectManifest('{ "audio": "a.mp3", "lrc": "a.lrc", "theme": "violet", "scenes": [{ "image": "a.jpg" }] }');
  assert.equal(result.manifest.cues, "a.lrc");
  assert.equal(result.manifest.theme, "");
  assert.ok(result.warnings.some(warning => /violet/i.test(warning)));
});

test("parseProjectManifest przycina wartości renderowania do zakresu", () => {
  const result = core.parseProjectManifest(JSON.stringify({
    scenes: [{ image: "a.jpg" }],
    render: { fps: 500, videoBitrate: -10, audioBitrate: 1000, asciiIntensity: 99, overlay: 5, crt: -1, transitionSeconds: 500 }
  }));
  const render = result.manifest.render;
  assert.equal(render.fps, 120);
  assert.equal(render.videoBitrate, 250000);
  assert.equal(render.audioBitrate, 32000);
  assert.equal(render.asciiIntensity, 2);
  assert.equal(render.overlay, 1);
  assert.equal(render.crt, 0);
  assert.equal(render.transitionSeconds, 10);
});

// --- TIMELINE SCEN ---
test("buildSceneTimeline używa start i duration do wyznaczenia zakresu", () => {
  const { scenes, warnings } = core.buildSceneTimeline([
    { image: "a.jpg", start: 0, duration: 12.5 },
    { image: "b.jpg", start: 12.5, duration: 7.5 }
  ]);
  assert.equal(scenes.length, 2);
  assert.deepEqual([scenes[0].start, scenes[0].end], [0, 12.5]);
  assert.deepEqual([scenes[1].start, scenes[1].end], [12.5, 20]);
  assert.deepEqual(warnings, []);
});

test("buildSceneTimeline sortuje sceny nieposortowane i zachowuje stabilność", () => {
  const { scenes } = core.buildSceneTimeline([
    { image: "c.jpg", start: 20 },
    { image: "a.jpg", start: 0 },
    { image: "b.jpg", start: 10 }
  ]);
  assert.deepEqual(scenes.map(scene => scene.image), ["a.jpg", "b.jpg", "c.jpg"]);
  assert.equal(scenes[0].end, 10);
  assert.equal(scenes[1].end, 20);
});

test("buildSceneTimeline stosuje fallback, gdy brakuje start lub duration", () => {
  const { scenes, warnings } = core.buildSceneTimeline([
    { image: "a.jpg" },
    { image: "b.jpg" }
  ], { defaultSceneSeconds: 8 });
  assert.deepEqual([scenes[0].start, scenes[0].end], [0, 8]);
  assert.deepEqual([scenes[1].start, scenes[1].end], [8, 16]);
  assert.equal(warnings.length, 2);
  assert.ok(warnings.every(warning => /start/.test(warning)));
});

test("buildSceneTimeline kończy ostatnią scenę wraz z długością audio", () => {
  const { scenes } = core.buildSceneTimeline([
    { image: "a.jpg", start: 0 },
    { image: "b.jpg", start: 10 }
  ], { audioDuration: 42 });
  assert.equal(scenes[0].end, 10);
  assert.equal(scenes[1].end, 42);
});

test("buildSceneTimeline pomija sceny wyłączone przez enabled: false", () => {
  const { scenes, warnings } = core.buildSceneTimeline([
    { image: "a.jpg", start: 0, duration: 5 },
    { image: "skip.jpg", start: 5, duration: 5, enabled: false },
    { image: "b.jpg", start: 10, duration: 5 }
  ]);
  assert.deepEqual(scenes.map(scene => scene.image), ["a.jpg", "b.jpg"]);
  assert.ok(warnings.some(warning => /enabled/.test(warning)));
});

test("buildSceneTimeline pomija błędne wpisy i zgłasza ostrzeżenia", () => {
  const { scenes, warnings } = core.buildSceneTimeline([
    { image: "a.jpg", start: 0, duration: 5 },
    null,
    "napis",
    { start: 5 },
    { image: "b.jpg", start: -4, duration: -2, transition: "rozmycie" }
  ], { defaultSceneSeconds: 6 });
  assert.equal(scenes.length, 2);
  assert.equal(scenes[1].image, "b.jpg");
  assert.equal(scenes[1].start, 0, "ujemny start jest przycinany do 0");
  assert.equal(scenes[1].transition, "crossfade", "nieznane przejście wraca do crossfade");
  assert.ok(warnings.some(warning => /nie jest obiektem/.test(warning)));
  assert.ok(warnings.some(warning => /image/.test(warning)));
  assert.ok(warnings.some(warning => /ujemny/.test(warning)));
  assert.ok(warnings.some(warning => /duration/.test(warning)));
  assert.ok(warnings.some(warning => /przejście/.test(warning)));
});

test("buildSceneTimeline działa bez listy scen", () => {
  const result = core.buildSceneTimeline(undefined);
  assert.deepEqual(result.scenes, []);
  assert.ok(result.warnings.length > 0);
  const empty = core.buildSceneTimeline([]);
  assert.deepEqual(empty.scenes, []);
});

// --- MAPOWANIE PLIKÓW ---
test("resolveManifestFiles znajduje pliki po nazwie, ścieżce i wielkości liter", () => {
  const files = [
    fakeFile("sub/01_intro.jpg", "image/jpeg"),
    fakeFile("GHOST_AI.MP3", "audio/mpeg"),
    fakeFile("ghost_ai.lrc")
  ];
  const result = core.resolveManifestFiles({
    audio: "ghost_ai.mp3",
    cues: "ghost_ai.lrc",
    scenes: [{ image: "01_intro.jpg" }]
  }, files);
  assert.equal(result.audioFile.name, "GHOST_AI.MP3");
  assert.equal(result.cueFile.name, "ghost_ai.lrc");
  assert.equal(result.scenes[0].file.name, "sub/01_intro.jpg");
  assert.deepEqual(result.missing, []);
});

test("resolveManifestFiles raportuje brakujące pliki audio, LRC i obrazów", () => {
  const files = [fakeFile("01_intro.jpg", "image/jpeg")];
  const result = core.resolveManifestFiles({
    audio: "ghost_ai.mp3",
    cues: "ghost_ai.lrc",
    scenes: [{ image: "01_intro.jpg" }, { image: "02_face.jpg" }]
  }, files);
  assert.deepEqual(result.missing.map(item => [item.role, item.name]), [
    ["audio", "ghost_ai.mp3"],
    ["cues", "ghost_ai.lrc"],
    ["scene", "02_face.jpg"]
  ]);
  assert.equal(result.scenes[0].file.name, "01_intro.jpg");
  assert.equal(result.scenes[1].file, null);
});

test("resolveManifestFiles ostrzega o zduplikowanych nazwach plików", () => {
  const result = core.resolveManifestFiles({ scenes: [{ image: "01.jpg" }] }, [
    fakeFile("a/01.jpg", "image/jpeg"),
    fakeFile("b/01.jpg", "image/jpeg")
  ]);
  assert.ok(result.warnings.some(warning => /Zduplikowana/.test(warning)));
  assert.equal(result.missing.length, 0);
});

test("findFileByName zwraca null dla nieistniejącego pliku", () => {
  assert.equal(core.findFileByName([fakeFile("a.mp3", "audio/mpeg")], "b.mp3"), null);
  assert.equal(core.findFileByName([fakeFile("a.mp3", "audio/mpeg")], "a.mp3").name, "a.mp3");
});

test("isProjectFile rozpoznaje tylko project.json", () => {
  assert.equal(core.isProjectFile(fakeFile("project.json")), true);
  assert.equal(core.isProjectFile(fakeFile("dir/project.json")), true);
  assert.equal(core.isProjectFile(fakeFile("PROJECT.JSON")), true);
  assert.equal(core.isProjectFile(fakeFile("project.json.bak")), false);
  assert.equal(core.isProjectFile(fakeFile("manifest.json")), false);
});

// --- EKSPORT MANIFESTU ---
test("serializeProject zapisuje pełną konfigurację z wersją schematu", () => {
  const json = core.serializeProject({
    audio: "ghost_ai.mp3",
    cues: "ghost_ai.lrc",
    theme: "green",
    equalizer: 3,
    scenes: [
      { image: "01_intro.jpg", start: 0, duration: 12.5, transition: "crossfade" },
      { image: "02_face.jpg", start: 12.5, duration: 7.5, transition: "cut" }
    ],
    render: { fps: 30, videoBitrate: 8000000, crt: 0.4 }
  });
  const data = JSON.parse(json);
  assert.equal(data.version, 1);
  assert.equal(data.audio, "ghost_ai.mp3");
  assert.equal(data.cues, "ghost_ai.lrc");
  assert.equal(data.theme, "green");
  assert.equal(data.equalizer, 3);
  assert.equal(data.scenes.length, 2);
  assert.equal(data.scenes[0].start, 0);
  assert.equal(data.scenes[0].duration, 12.5);
  assert.equal(data.scenes[0].transition, undefined, "crossfade jest domyślne i nie jest zapisywane");
  assert.equal(data.scenes[1].transition, "cut");
  assert.equal(data.render.fps, 30);
  assert.equal(data.render.crt, 0.4);
  assert.equal(data.render.transitionSeconds, 1.2, "brakujące ustawienia dostają wartości domyślne");
});

test("serializeProject pomija duration, gdy scena go nie ma", () => {
  const data = JSON.parse(core.serializeProject({ scenes: [{ image: "a.jpg", start: 5 }] }));
  assert.equal(data.scenes[0].duration, undefined);
  assert.equal(data.scenes[0].start, 5);
});

test("serializeProject → parseProjectManifest zachowuje sceny i ustawienia (round trip)", () => {
  const project = {
    audio: "ghost_ai.mp3",
    cues: "ghost_ai.lrc",
    theme: "amber",
    equalizer: 2,
    scenes: [
      { image: "01_intro.jpg", start: 0, duration: 18 },
      { image: "02_signal.png", start: 18, duration: 20, transition: "cut" }
    ],
    render: { fps: 25, videoBitrate: 6000000, overlay: 0.5, crt: 0.75, transitionSeconds: 2.5 }
  };
  const result = core.parseProjectManifest(core.serializeProject(project));
  assert.equal(result.ok, true);
  assert.equal(result.reason, "ok");
  assert.equal(result.manifest.theme, project.theme);
  assert.equal(result.manifest.equalizer, project.equalizer);
  assert.equal(result.manifest.render.fps, 25);
  assert.equal(result.manifest.render.overlay, 0.5);
  assert.equal(result.manifest.render.crt, 0.75);
  assert.equal(result.manifest.render.transitionSeconds, 2.5);

  const timeline = core.buildSceneTimeline(result.manifest.scenes, { audioDuration: 60 });
  assert.deepEqual(timeline.scenes.map(scene => [scene.start, scene.end]), [[0, 18], [18, 38]]);
  assert.equal(timeline.scenes[1].transition, "cut");
});

test("serializeProject nie wysypuje się na pustym projekcie", () => {
  const data = JSON.parse(core.serializeProject({}));
  assert.equal(data.version, 1);
  assert.equal(data.theme, "cyan");
  assert.equal(data.equalizer, 1);
  assert.deepEqual(data.scenes, []);
  assert.equal(data.render.fps, 60);
});
