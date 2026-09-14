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

## 3. 💻 KOD ŹRÓDŁOWY — CyberPlayer STUDIO

Aktualnym źródłem kodu jest plik [`demorecorder.html`](./demorecorder.html). Jest to samodzielna strona HTML/CSS/JS bez bibliotek zewnętrznych i backendu.

Implementacja obejmuje:

* ładowanie katalogu z audio, grafikami i opcjonalnym plikiem `.lrc`,
* naturalne sortowanie scen (`01_...`, `02_...`),
* ASCII core reagujący na bas, trzy tryby equalizera, CRT scanlines i przejścia obrazów,
* motywy CYAN / AMBER / GREEN,
* terminal HUD synchronizowany z cue,
* nagrywanie canvasu i audio do WebM przez `MediaRecorder`,
* fullscreen, skróty klawiaturowe i komunikaty diagnostyczne.

Pełna analiza, ograniczenia i plan rozwoju znajdują się w [`ANALIZA-I-ULEPSZENIA.md`](./ANALIZA-I-ULEPSZENIA.md). Nie utrzymujemy już drugiej, wklejonej kopii kodu w tej dokumentacji, aby opis i działająca implementacja nie rozjeżdżały się przy kolejnych zmianach.

## 📖 Krótka instrukcja dla Archiwum

1. **Wymagania systemowe do zrzutów wideo:** Komputer z w miarę nowoczesną przeglądarką (najlepiej Chrome/Brave dla najwyższego wsparcia VP9 MediaRecorder). 
2. **Struktura plików w projekcie:** Zawsze trzymaj wszystkie materiały w jednym folderze.
   
   * Wideo ładuje się alfabetycznie: `01_intro.jpg`, `02_verse.jpg` itd.
   
   * Plik tekstowy (zsynchronizowany np. w Megalobiz lub Riverside) musi mieć rozszerzenie `.lrc`.
3. **Nagrywanie czystego obrazu bez panelu sterowania:**
   
   * Wczytaj katalog i sprawdź synchronizację przyciskiem `PLAY`.
   
   * Opcjonalnie kliknij `FULLSCREEN`; nagrywane jest płótno wizualizatora, więc panel sterowania HTML nie trafia do pliku.
   
   * Kliknij `REC VIDEO`. Nagrywanie kończy się automatycznie po zakończeniu audio albo po ponownym kliknięciu przycisku.

   * Wynik jest zapisywany jako `WebM`; do publikacji wymagającej MP4 użyj późniejszej konwersji, np. FFmpeg.
