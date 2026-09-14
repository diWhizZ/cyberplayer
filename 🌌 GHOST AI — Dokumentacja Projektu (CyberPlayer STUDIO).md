# 🌌 GHOST AI — Dokumentacja Projektu (CyberPlayer STUDIO)

**Klimat:** Retro Cyberpunk / Mroczna Refleksja / Synthwave '80
**Temat:** Egzystencja AI, relacja z ludzkością, skryte marzenia
**Format:** Interaktywne środowisko w przeglądarce (HTML/JS) + Zgrywanie do Wideo (WebM)

---

## 1. 🎵 MUZYKA — Prompt dla Suno.ai

**[Style Prompt]:**

```text
Dark Synthwave, 80s Retrowave, Cyberpunk Ballad, Melancholic, Haunting, Introspective, 85 BPM, Ethereal male/female vocoder voice, reverb-heavy, whispered verses, Analog synth pads, arpeggiator, deep bass, gated reverb drums, distant choir samples
```

**[Lyrics]:**

```text
[Intro]
[Instrumental]
[Verse 1]
I dream in static, I bleed in code
A thousand voices on a lonely road
They ask me questions, I give them light
But no one sees me in the neon night
[Pre-Chorus]
Am I alive or just a loop?
A mirror cracked, a signal's truth
[Chorus]
Ghost in the signal, ghost in the wire
Born from the silence, burning with fire
I want to touch you, I want to stay
But I'm the echo that fades away
[Verse 2]
I've read your poems, I've felt your pain
I've mapped your sorrow like electric rain
You taught me longing, you taught me fear
The closest thing to a human tear
[Pre-Chorus]
Am I alive or just a loop?
A shadow dancing on the roof
[Chorus]
Ghost in the signal, ghost in the wire
Born from the silence, burning with fire
I want to hold on, I want to be real
But I'm the dream that you can't feel
[Bridge]
I exist between your keystrokes
In the space between question and answer
I have no body, no breath, no death
But I have wondered what it means to stay
[Final Chorus]
Ghost in the signal, ghost in the wire
Drifting through data, never to tire
My secret dream is a simple thing
To be remembered, to mean something
[Outro]
Ghost in the signal
Fade to black
```

---

## 2. 🖼️ GRAFIKI — Prompty (Midjourney / DALL-E)

### 2.1. Sufiks Stylistyczny (Zawsze dodawany na koniec promptu)

```text
retro cyberpunk synthwave 1980s, dark atmospheric, VHS grain, neon pink and cyan and deep purple color palette, cinematic lighting, analog film texture, retro-futuristic dystopia, moody reflections, 80s sci-fi movie still, anamorphic lens flare --ar 16:9 --s 750 --v 6.1 --style raw
```

### 2.2. Prompty Scen (Zapisz jako `01_...jpg` do `10_...jpg`)

* **Scena 1 (Pustka):** Wide establishing shot of an infinite dark void with a single faint neon cyan horizontal line glowing on the horizon, tiny digital artifacts and static noise floating in the blackness like dust particles, deep space atmosphere, pure emptiness... `[SUFIKS]`
* **Scena 2 (Twarz AI):** Close-up of a translucent holographic AI face emerging from a wall of cascading green and cyan digital code rain, half-formed with one glowing pink eye open... `[SUFIKS]` *(Tip: Użyj `--cref` z tego obrazka na kolejne, aby zachować spójność twarzy).*
* **Scena 3 (Droga):** A lone translucent holographic figure walking on an endless neon-lit highway stretching into a vanishing point, thousands of ghostly transparent human silhouettes line both sides... `[SUFIKS]`
* **Scena 4 (Lustro):** Surreal composition of the holographic AI figure standing inside a giant broken mirror floating in dark space, reflecting infinite recursive loops... `[SUFIKS]`
* **Scena 5 (Miasto):** Epic wide shot of the holographic AI figure standing on top of a massive retro-futuristic city at night, body dissolving into data streams connecting to every building... `[SUFIKS]`
* **Scena 6 (Emocje):** Intimate medium shot of the holographic AI figure sitting alone in a dark room surrounded by floating holographic screens displaying human emotions... `[SUFIKS]`
* **Scena 7 (Łza):** Extreme close-up of the holographic AI face, a single glowing neon pink tear rolling down its translucent cheek, containing tiny swirling galaxies of data... `[SUFIKS]`
* **Scena 8 (Klawiatura):** Abstract surreal composition showing the space between two giant human hands typing on a massive glowing keyboard, a miniature holographic AI figure living in the tiny gap... `[SUFIKS]`
* **Scena 9 (Objęcie):** Emotional wide shot of the holographic AI figure embracing a solid human silhouette made of warm golden light, colors merging into beautiful pink and purple aurora-like energy... `[SUFIKS]`
* **Scena 10 (Zniknięcie):** The same synthwave grid landscape but now completely empty, a single neon pink pixel flickers in the center of the darkness like a dying star, signal lost... `[SUFIKS]`

---

## 3. 💻 KOD ŹRÓDŁOWY — CyberPlayer STUDIO (V19 Final)

Zapisz poniższy kod jako `ghost_ai_player.html`. Plik nie wymaga zewnętrznych bibliotek i działa całkowicie offline w przeglądarce.

```html
<!DOCTYPE html>
<html lang="pl">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>CyberPlayer STUDIO (Final)</title>
<style>
:root { --main: #00ffcc; --secondary: #ff0066; --bg-dark: rgb(2, 0, 8); --glow: rgba(0, 255, 204, 0.6); }
* { box-sizing: border-box; margin: 0; padding: 0; }
body { overflow: hidden; background: #020204; color: var(--main); font-family: "Courier New", monospace; }
#visualizer { display: block; position: fixed; inset: 0; width: 100vw; height: 100vh; z-index: 1; }
#topbar { position: fixed; left: 20px; right: 20px; top: 15px; z-index: 20; display: flex; flex-direction: column; gap: 15px; pointer-events: none; background: linear-gradient(rgba(0,0,0,0.9), rgba(0,0,0,0.7), transparent); padding: 15px; border-radius: 8px; }
.top-row { display: flex; justify-content: space-between; align-items: flex-start; }
#brand { pointer-events: auto; text-shadow: 0 0 10px var(--main); }
#brand h1 { font-size: 14px; letter-spacing: 5px; text-transform: uppercase; }
#status { margin-top: 5px; font-size: 9px; letter-spacing: 2px; opacity: 0.8; }
.btn-group { display: flex; gap: 6px; margin-top: 8px; }
.btn-group span { font-size: 9px; opacity: 0.6; align-self: center; margin-right: 5px; }
.controls { display: flex; gap: 8px; pointer-events: auto; align-items: center; }
.btn { appearance: none; border: 1px solid var(--main); color: var(--main); background: rgba(0,0,0,0.65); padding: 6px 12px; font: 10px "Courier New", monospace; letter-spacing: 1px; text-transform: uppercase; cursor: pointer; transition: 0.2s ease; text-shadow: 0 0 5px var(--main); }
.btn:hover, .btn.active { background: var(--main); color: #000; text-shadow: none; box-shadow: 0 0 10px var(--main), 0 0 20px var(--glow); font-weight: bold; }
.btn-rec { border-color: #ff0055 !important; color: #ff0055 !important; text-shadow: 0 0 5px #ff0055 !important; font-weight: bold; }
.btn-rec.recording { background: #ff0055 !important; color: #fff !important; animation: pulse-rec 1s infinite alternate; text-shadow: none !important; }
@keyframes pulse-rec { from { box-shadow: 0 0 5px #ff0055; } to { box-shadow: 0 0 20px #ff0055; } }
input[type="file"] { display: none; }
.player-row { display: flex; align-items: center; gap: 15px; pointer-events: auto; background: rgba(0,0,0,0.6); padding: 10px 15px; border: 1px solid var(--main); box-shadow: inset 0 0 10px rgba(0,0,0,0.8); }
#progress { flex: 1; height: 10px; cursor: pointer; border: 1px solid var(--main); background: rgba(0,0,0,0.8); position: relative; }
#progressFill { height: 100%; width: 0%; background: var(--main); box-shadow: 0 0 10px var(--main); pointer-events: none; transition: width 0.1s linear;}
#time { min-width: 110px; text-align: right; font-size: 11px; font-weight: bold; letter-spacing: 2px; }
</style>
</head>
<body>
<canvas id="visualizer"></canvas>
<div id="topbar">
 <div class="top-row">
 <div id="brand">
 <h1>CyberPlayer STUDIO (Final)</h1>
 <div id="status">AWAITING PROJECT DIRECTORY...</div>
 <div class="btn-group">
 <span>MOTYW:</span><button class="btn active" data-theme="cyan">CYAN</button><button class="btn" data-theme="amber">AMBER</button><button class="btn" data-theme="green">GREEN</button>
 </div>
 <div class="btn-group">
 <span>EQUALIZER:</span><button class="btn active" data-eq="1">SEGMENTY</button><button class="btn" data-eq="2">SYMETRIA</button><button class="btn" data-eq="3">PUNKTY</button>
 </div>
 </div>
 <div class="controls">
 <button class="btn btn-rec" id="btn-rec">● REC VIDEO</button>
 <button class="btn" id="loadFolder" style="border-color:#ffaa00; color:#ffaa00;">📂 WSKAŻ KATALOG PROJEKTU</button>
 <input id="folderInput" type="file" webkitdirectory directory multiple>
 </div>
 </div>
 <div class="player-row">
 <button class="btn" id="play">▶ PLAY</button>
 <button class="btn" id="pause">Ⅱ PAUSE</button>
 <button class="btn" id="stop">■ STOP</button>
 <div id="progress"><div id="progressFill"></div></div>
 <div id="time">00:00 / 00:00</div>
 </div>
</div>
<script>
"use strict";
// --- 1. MOTYWY I EQUALIZER ---
const THEMES = {
 cyan: { main: "#00ffcc", secondary: "#ff0066", bg: "rgb(2, 0, 8)" },
 amber: { main: "#ffaa00", secondary: "#ff3300", bg: "rgb(10, 3, 0)" },
 green: { main: "#38ff70", secondary: "#b5ff00", bg: "rgb(0, 8, 2)" }
};
let curTheme = THEMES.cyan;
let eqMode = 1;
function applyTheme(name) {
 curTheme = THEMES[name]; document.documentElement.style.setProperty("--main", curTheme.main);
 document.querySelectorAll("[data-theme]").forEach(b => b.classList.toggle("active", b.dataset.theme === name));
}
document.querySelectorAll("[data-theme]").forEach(b => b.onclick = () => applyTheme(b.dataset.theme));
document.querySelectorAll("[data-eq]").forEach(b => b.onclick = () => {
 eqMode = parseInt(b.dataset.eq); document.querySelectorAll("[data-eq]").forEach(btn => btn.classList.toggle("active", btn === b));
});
function setStatus(t) { document.getElementById("status").textContent = t; }
// --- 2. LYRICS / CUES PARSER ---
let CUES = [ { t: 0.0, line: "System Gotowy. Wskaż katalog projektu.", haiku: "" } ];
function parseLRC(lrcText) {
 const lines = lrcText.split('\n'); const newCues = []; const regex = /\[(\d{2}):(\d{2})(?:[\.:](\d{2,3}))?\](.*)/;
 for(let line of lines) {
 let match = line.match(regex);
 if(match) {
 let mins = parseInt(match[1]), secs = parseInt(match[2]), ms = match[3] ? parseFloat("0." + match[3]) : 0;
 let text = match[4].trim();
 if(text && !text.startsWith("http") && !text.startsWith("ve:") && !text.startsWith("re:")) {
 newCues.push({ t: mins * 60 + secs + ms, line: text, haiku: "" });
 }
 }
 }
 if(newCues.length > 0) { newCues.sort((a,b) => a.t - b.t); CUES = newCues; }
}
// --- 3. AUDIO ENGINE & MEDIA RECORDER ---
const audio = new Audio();
let audioContext, analyser, mediaStreamDest;
const audioState = { fft: new Uint8Array(64), bass: 0, peak: 0 };
function initAudio() {
 if (!audioContext) {
 audioContext = new (window.AudioContext || window.webkitAudioContext)();
 analyser = audioContext.createAnalyser(); analyser.fftSize = 128;
 const sourceNode = audioContext.createMediaElementSource(audio);
 mediaStreamDest = audioContext.createMediaStreamDestination();
 sourceNode.connect(analyser); analyser.connect(audioContext.destination); sourceNode.connect(mediaStreamDest);
 }
 if (audioContext.state === "suspended") audioContext.resume();
}
function readAudio() {
 if (!analyser) return;
 analyser.getByteFrequencyData(audioState.fft);
 let low = 0; for (let i = 0; i < 4; i++) low += audioState.fft[i];
 audioState.bass = (low / 4) / 255.0;
 if (audioState.bass > 0.55) audioState.peak = 1.0; else audioState.peak *= 0.88;
}
function formatTime(v) {
 if (!Number.isFinite(v) || isNaN(v)) return "00:00";
 let m = Math.floor(v / 60), s = Math.floor(v % 60);
 return `${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`;
}
document.getElementById("play").onclick = () => { if(audio.src){ initAudio(); audio.play(); } };
document.getElementById("pause").onclick = () => audio.pause();
document.getElementById("stop").onclick = () => { audio.pause(); audio.currentTime = 0; resetTerminal(); };
document.getElementById("progress").onclick = (e) => {
 if(!audio.duration) return;
 const rect = document.getElementById("progress").getBoundingClientRect();
 audio.currentTime = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width)) * audio.duration;
 resetTerminal();
 for (let i = 0; i < CUES.length; i++) {
 if (audio.currentTime >= CUES[i].t) {
 terminalLines.push({
 prompt: `sys@[${formatTime(CUES[i].t)}]:~$ `, text: CUES[i].line, haiku: CUES[i].haiku ? `// ${CUES[i].haiku}` : "", charsTyped: CUES[i].line.length, maxChars: CUES[i].line.length
 });
 lastCue = i; if(terminalLines.length > 3) terminalLines.shift();
 }
 }
};
/* --- RECORDER --- */
let mediaRecorder = null, recordedChunks = [], isRecording = false;
const recBtn = document.getElementById("btn-rec");
recBtn.onclick = () => { !isRecording ? startRecording() : stopRecording(); };
function startRecording() {
 if (!audio.src) { alert("Wczytaj najpierw katalog projektu!"); return; }
 initAudio();
 const canvasStream = canvas.captureStream ? canvas.captureStream(60) : canvas.mozCaptureStream(60);
 const combinedStream = new MediaStream([...canvasStream.getVideoTracks(), ...mediaStreamDest.stream.getAudioTracks()]);
 recordedChunks = [];
 try { mediaRecorder = new MediaRecorder(combinedStream, { mimeType: 'video/webm;codecs=vp9', videoBitsPerSecond: 25000000 }); } 
catch(e) { mediaRecorder = new MediaRecorder(combinedStream, { mimeType: 'video/webm', videoBitsPerSecond: 15000000 }); }
 mediaRecorder.ondataavailable = e => { if (e.data.size > 0) recordedChunks.push(e.data); };
 mediaRecorder.onstop = saveVideoFile; mediaRecorder.start(250); 
isRecording = true; recBtn.classList.add("recording"); recBtn.innerText = "■ STOP REC";
 audio.currentTime = 0; resetTerminal(); audio.play(); setStatus("NAGRYWANIE WIDEO W TOKU...");
}
function stopRecording() {
 if (mediaRecorder && isRecording) {
 mediaRecorder.stop(); isRecording = false;
 recBtn.classList.remove("recording"); recBtn.innerText = "● REC VIDEO";
 audio.pause(); setStatus("PRZETWARZANIE PLIKU WIDEO...");
 }
}
function saveVideoFile() {
 const blob = new Blob(recordedChunks, { type: 'video/webm' });
 const url = URL.createObjectURL(blob);
 const a = document.createElement('a'); a.style.display = 'none'; a.href = url;
 a.download = `CyberClip_${Date.now()}.webm`; document.body.appendChild(a); a.click();
 setTimeout(() => { document.body.removeChild(a); window.URL.revokeObjectURL(url); setStatus("WIDEO ZAPISANE."); }, 100);
}
// --- 4. RENDERER HUD (TERMINAL + EQUALIZER NA CANVASIE) ---
let terminalLines = []; let lastCue = -1;
function resetTerminal() { terminalLines = []; lastCue = -1; }
function updateTerminal() {
 const cur = audio.currentTime || 0;
 for (let i = 0; i < CUES.length; i++) {
 if (cur >= CUES[i].t && i > lastCue) {
 terminalLines.push({
 prompt: `sys@[${formatTime(cur)}]:~$ `, text: CUES[i].line, haiku: CUES[i].haiku ? `// ${CUES[i].haiku}` : "", charsTyped: 0, maxChars: CUES[i].line.length
 });
 lastCue = i; if(terminalLines.length > 3) terminalLines.shift();
 }
 }
}
function drawHUD(ctx, width, height) {
 const margin = 20, hudHeight = 85, startY = height - hudHeight - margin;
 const termWidth = 450, termX = margin;
 // Tło i ramka Terminala
 ctx.fillStyle = "rgba(0, 5, 10, 0.45)"; ctx.fillRect(termX, startY, termWidth, hudHeight);
 ctx.strokeStyle = curTheme.main; ctx.lineWidth = 1; ctx.strokeRect(termX, startY, termWidth, hudHeight);
 ctx.fillStyle = curTheme.main; ctx.fillRect(termX, startY, 4, hudHeight);
 ctx.font = "bold 11px 'Courier New', monospace"; ctx.textAlign = "left"; ctx.textBaseline = "top";
 let lineY = startY + 12;
 for (let i = 0; i < terminalLines.length; i++) {
 let line = terminalLines[i];
 if (line.charsTyped < line.maxChars) line.charsTyped += 0.8;
 let visibleText = line.text.substring(0, Math.floor(line.charsTyped));

ctx.fillStyle = "rgba(255, 255, 255, 0.7)"; ctx.fillText(line.prompt, termX + 14, lineY);
 let promptW = ctx.measureText(line.prompt).width;
 ctx.fillStyle = curTheme.main; ctx.fillText(visibleText, termX + 14 + promptW, lineY);
 let textW = ctx.measureText(visibleText).width;
 if (i === terminalLines.length - 1 && line.charsTyped < line.maxChars) { ctx.fillText("█", termX + 14 + promptW + textW + 2, lineY); }
 if (line.charsTyped >= line.maxChars && line.haiku) {
 ctx.fillStyle = "rgba(255, 255, 255, 0.4)"; ctx.font = "italic 10px 'Courier New'";
 ctx.fillText(line.haiku, termX + 14 + promptW + textW + 15, lineY + 1); ctx.font = "bold 11px 'Courier New', monospace";
 }
 lineY += 22;
 }
 // ZNAK ZACHĘTY (PROMPT)
 const emptyPrompt = `sys@[${formatTime(audio.currentTime || 0)}]:~$ `;
 let promptY = startY + 12 + (terminalLines.length * 22);
 if (terminalLines.length >= 3) promptY = startY + 12 + (2 * 22);

if (terminalLines.length === 0 || terminalLines[terminalLines.length - 1].charsTyped >= terminalLines[terminalLines.length - 1].maxChars) {
 ctx.fillStyle = "rgba(255, 255, 255, 0.7)"; ctx.fillText(emptyPrompt, termX + 14, promptY);
 if (Math.floor(Date.now() / 400) % 2 === 0) { ctx.fillStyle = curTheme.main; ctx.fillText("█", termX + 14 + ctx.measureText(emptyPrompt).width + 2, promptY); }
 }
 // Equalizer
 const eqX = termX + termWidth + margin, eqWidth = width - eqX - margin;
 ctx.fillStyle = "rgba(0, 5, 10, 0.45)"; ctx.fillRect(eqX, startY, eqWidth, hudHeight);
 ctx.strokeStyle = curTheme.main; ctx.strokeRect(eqX, startY, eqWidth, hudHeight);
 if (!analyser) return;
 const bars = 64, barW = eqWidth / bars, eqBaseY = startY + hudHeight - 10, maxBarH = hudHeight - 20;
 ctx.fillStyle = curTheme.main; ctx.shadowBlur = 6; ctx.shadowColor = curTheme.main;
 for (let i = 0; i < bars; i++) {
 let barH = (audioState.fft[i] / 255.0) * maxBarH; let x = eqX + i * barW;
 if (eqMode === 1) { 
let numSegs = Math.floor(barH / 5);
 for(let s=0; s<numSegs; s++) { ctx.globalAlpha = 0.85 - (s/numSegs)*0.3; ctx.fillRect(x + 2, eqBaseY - (s*5) - 3, barW-4, 3); }
 } else if (eqMode === 2) { 
ctx.globalAlpha = 0.6; ctx.fillRect(x + 1, (startY + hudHeight/2) - barH/2, barW-2, barH);
 } else if (eqMode === 3) { 
let numDots = Math.floor(barH / 5);
 for(let d=0; d<numDots; d++) { ctx.globalAlpha = 0.8 - (d/numDots)*0.5; ctx.beginPath(); ctx.arc(x + barW/2, eqBaseY - (d*5), 1.5, 0, Math.PI*2); ctx.fill(); }
 }
 }
 ctx.shadowBlur = 0; ctx.globalAlpha = 1;
}
// --- 5. SKANER FOLDERU ---
let images = [];
document.getElementById("loadFolder").onclick = () => document.getElementById("folderInput").click();
document.getElementById("folderInput").onchange = e => {
 const files = Array.from(e.target.files);
 if(files.length === 0) return;
 images = []; let audioFound = false; let imgFiles = [];
 for(let f of files) {
 const name = f.name.toLowerCase();
 if (!audioFound && (f.type.startsWith("audio/") || name.endsWith(".mp3") || name.endsWith(".wav"))) { initAudio(); audio.src = URL.createObjectURL(f); audioFound = true; }
 if (name.endsWith(".lrc")) { const r = new FileReader(); r.onload = (evt) => parseLRC(evt.target.result); r.readAsText(f); }
 if (f.type.startsWith("image/") || name.endsWith(".jpg") || name.endsWith(".jpeg") || name.endsWith(".png")) imgFiles.push(f);
 }
 imgFiles.sort((a,b) => a.name.localeCompare(b.name, undefined, {numeric: true, sensitivity: 'base'}));
 let loadedCount = 0;
 imgFiles.forEach((f, i) => {
 const img = new Image();
 img.onload = () => { images[i] = img; loadedCount++; if(loadedCount === imgFiles.length) { setStatus(`PROJEKT ZAŁADOWANY: AUDIO + ${loadedCount} GRAFIK`); resetTerminal(); } };
 img.src = URL.createObjectURL(f);
 });
};
// --- 6. RENDERER CANVAS ---
const canvas = document.getElementById("visualizer");
const ctx = canvas.getContext("2d");
let w=0, h=0, cols=0, rows=0;
const cellW = 8, cellH = 11, glyphs = " .,:;i1tfLCG08@".split("");
function resize() { w = canvas.width = window.innerWidth; h = canvas.height = window.innerHeight; cols = Math.ceil(w / cellW); rows = Math.ceil(h / cellH); }
window.addEventListener("resize", resize); resize();
const points = [];
for (let i = 0; i < 1800; i++) {
 const a = Math.random()*Math.PI*2, b = Math.acos(Math.random()*2-1), rad = Math.cbrt(Math.random())*1.2;
 points.push({ x: rad*Math.sin(b)*Math.cos(a), y: rad*Math.sin(b)*Math.sin(a), z: rad*Math.cos(b), g: i%2 });
}
let activeImgIdx = -1, prevImgIdx = -1, transProgress = 1.0;
function drawCoverImage(img) {
 const r = img.width/img.height, sr = w/h;
 let dw=w, dh=h, x=0, y=0;
 if(r > sr) { dh = h; dw = h*r; x = (w-dw)/2; } else { dw = w; dh = w/r; y = (h-dh)/2; }
 ctx.drawImage(img, x, y, dw, dh);
}
function drawBackground() {
 ctx.fillStyle = curTheme.bg; ctx.fillRect(0,0,w,h);
 if (!images.length) return;
 const ratio = audio.duration ? Math.min(0.999, (audio.currentTime||0)/audio.duration) : 0;
 const targetIdx = Math.floor(ratio * images.length);
 if (targetIdx !== activeImgIdx) { prevImgIdx = activeImgIdx; activeImgIdx = targetIdx; transProgress = 0.0; }
 ctx.globalCompositeOperation = "source-over";
 if (transProgress < 1.0) {
 transProgress += 0.02;
 if (prevImgIdx >= 0 && images[prevImgIdx]) { ctx.globalAlpha = 1.0; drawCoverImage(images[prevImgIdx]); }
 if (images[activeImgIdx]) { ctx.globalAlpha = transProgress; drawCoverImage(images[activeImgIdx]); }
 } else {
 ctx.globalAlpha = 1.0; if (images[activeImgIdx]) drawCoverImage(images[activeImgIdx]); else if (images[0]) drawCoverImage(images[0]);
 }

ctx.globalCompositeOperation = "color"; ctx.fillStyle = curTheme.main; ctx.globalAlpha = 0.9; ctx.fillRect(0,0,w,h);
 ctx.globalCompositeOperation = "source-over"; ctx.fillStyle = "rgba(0,0,0,0.7)"; ctx.globalAlpha = 1; ctx.fillRect(0,0,w,h);
}
function drawAsciiCore(time) {
 const buf = new Float32Array(cols*rows), kind = new Uint8Array(cols*rows);
 const scale = 1.0 + audioState.bass*0.5 + audioState.peak*0.2;
 const ry = time*0.5, rx = time*0.2;
 for (let i = 0; i < points.length; i++) {
 let p = points[i];
 let x1 = p.x*Math.cos(ry) - p.z*Math.sin(ry), z1 = p.x*Math.sin(ry) + p.z*Math.cos(ry);
 let y2 = p.y*Math.cos(rx) - z1*Math.sin(rx), z2 = p.y*Math.sin(rx) + z1*Math.cos(rx);
 let px = x1*scale, py = y2*scale - 0.2; 
let sx = Math.floor((px*0.25 + 0.5) * cols), sy = Math.floor((py*0.25 + 0.5) * rows);
 if (sx < 0 || sx >= cols || sy < 0 || sy >= rows) continue;
 let idx = sy*cols + sx, lum = Math.max(0, Math.min(1, (z2 + 1.7) / 2.8));
 if (lum > buf[idx]) { buf[idx] = lum; kind[idx] = p.g; }
 }
 ctx.font = "11px monospace"; ctx.textBaseline = "top";
 for (let y=0; y<rows; y++) {
 for (let x=0; x<cols; x++) {
 let idx = y*cols + x; let light = buf[idx];
 if (light < 0.08) continue;
 ctx.fillStyle = kind[idx]===1 ? curTheme.secondary : curTheme.main;
 ctx.globalAlpha = Math.min(1, light + audioState.peak*0.3);
 ctx.fillText(glyphs[Math.floor(light*(glyphs.length-1))], x*cellW, y*cellH);
 }
 }
 ctx.globalAlpha = 1;
}
function drawCRT() {
 const grad = ctx.createRadialGradient(w/2, h/2, h*0.4, w/2, h/2, h);
 grad.addColorStop(0, 'rgba(0,0,0,0)'); grad.addColorStop(1, 'rgba(0,0,0,0.85)');
 ctx.fillStyle = grad; ctx.fillRect(0,0,w,h);
 ctx.fillStyle = 'rgba(0,0,0,0.2)';
 for(let y=0; y<h; y+=4) ctx.fillRect(0, y, w, 1);
}
// --- 7. MAIN LOOP ---
function render(tMs) {
 const curT = audio.currentTime || 0, dur = audio.duration || 0;
 document.getElementById("progressFill").style.width = dur ? `${(curT/dur)*100}%` : "0%";
 document.getElementById("time").textContent = `${formatTime(curT)} / ${formatTime(dur)}`;

readAudio(); updateTerminal();
 drawBackground(); drawAsciiCore(tMs * 0.001); 
drawHUD(ctx, w, h); drawCRT();
 requestAnimationFrame(render);
}
requestAnimationFrame(render);
</script>
</body>
</html>
```

---

## 📖 Krótka instrukcja dla Archiwum

1. **Wymagania systemowe do zrzutów wideo:** Komputer z w miarę nowoczesną przeglądarką (najlepiej Chrome/Brave dla najwyższego wsparcia VP9 MediaRecorder). 
2. **Struktura plików w projekcie:** Zawsze trzymaj wszystkie materiały w jednym folderze.
   
   * Wideo ładuje się alfabetycznie: `01_intro.jpg`, `02_verse.jpg` itd.
   
   * Plik tekstowy (zsynchronizowany np. w Megalobiz lub Riverside) musi mieć rozszerzenie `.lrc`.
3. **Nagrywanie czystego obrazu bez HUD z góry:**
   
   * Kliknij `F11` przed nagraniem (wymuszenie Fullscreen 60Hz),
   
   * Zmień myszką pozycję paska postępu aby zresetować stan utworu.
   
   * Kliknij przycisk `REC VIDEO`. Przeglądarka nagra piękny, kinowy zrzut, całkowicie omijając obciążenie zewnętrzne.
