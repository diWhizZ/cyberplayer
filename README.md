# CyberPlayer STUDIO

Prosty, offline'owy generator klipów audio-wizualnych w estetyce demoscene / cyber-retro. Aplikacja działa w jednej stronie HTML i nie wymaga bibliotek ani backendu.

## Możliwości

- ładowanie projektu na dwa sposoby: przyciskiem `WSKAŻ KATALOG PROJEKTU` (`webkitdirectory`) albo **przeciągnięciem katalogu/plików** na okno aplikacji,
- opcjonalny manifest `project.json` z dokładnym timeline'em scen (patrz niżej),
- fallback: bez manifestu obrazy są sortowane naturalnie (`01_intro`, `02_verse`, …) i rozkładane równo na długość audio,
- walidacja manifestu: rozróżnia błędny JSON, manifest bez plików, manifest bez scen i manifest w pełni załadowany; brakujące pliki są wypisywane w statusie i w HUD,
- synchronizacja napisów/cues z plikiem `.lrc`, także dla wielu znaczników czasu w jednej linii,
- wizualizacja reagująca na bas i widmo częstotliwości: ASCII core, obrazy tła, CRT scanlines i trzy tryby equalizera,
- motywy CYAN, AMBER i GREEN oraz jakość eksportu LOW / MEDIUM / HIGH,
- sterowanie PLAY / PAUSE / STOP, pasek postępu z klawiatury i przewijanie po cue,
- nagrywanie płótna wraz ze ścieżką audio do `WebM` przez `MediaRecorder` z wybranym kodekiem, rozdzielczością, FPS i bitrate'em,
- automatyczne zakończenie nagrania po końcu audio i raport rozmiaru/ścieżek po zapisie,
- **eksport bieżącej konfiguracji do `project.json`** jednym przyciskiem,
- tryb fullscreen oraz skróty `Space` (play/pause), `R` (nagrywanie), `E` (eksport manifestu).

## Uruchomienie

1. Otwórz [`demorecorder.html`](./demorecorder.html) w aktualnej przeglądarce Chromium, Firefox lub Safari.
2. Kliknij **WSKAŻ KATALOG PROJEKTU** albo upuść katalog na okno aplikacji.
3. Wybierz katalog zawierający audio, obrazy, opcjonalny plik `.lrc` i opcjonalny `project.json`.
4. Kliknij **PLAY**, aby sprawdzić synchronizację, a następnie **REC VIDEO**, aby zapisać klip.

Dla najbardziej przewidywalnego działania można uruchomić lokalny serwer statyczny:

```bash
python3 -m http.server 8080
```

Następnie otwórz `http://localhost:8080/demorecorder.html`.

## Format katalogu projektu

```text
my-project/
├── project.json     ← opcjonalny manifest (musi nazywać się dokładnie project.json)
├── 01_intro.jpg
├── 02_signal.png
├── 03_city.webp
├── ghost_ai.mp3
└── ghost_ai.lrc
```

Obsługiwane są popularne formaty audio rozpoznawane przez przeglądarkę (`mp3`, `wav`, `ogg`, `m4a`, `aac`, `flac`) i formaty graficzne obsługiwane przez HTML (`jpg`, `png`, `gif`, `webp`, `avif`). W praktyce zakres może różnić się między przeglądarkami.

Wzorcowy manifest znajduje się w [`project.example.json`](./project.example.json) — skopiuj go do katalogu projektu pod nazwą `project.json` i dopasuj czasy.

## Manifest project.json

Manifest jest **opcjonalny**. Gdy go nie ma, aplikacja działa po staremu: sortuje obrazy i dzieli je równo na długość utworu.

```json
{
  "version": 1,
  "audio": "ghost_ai.mp3",
  "cues": "ghost_ai.lrc",
  "theme": "cyan",
  "equalizer": 1,
  "scenes": [
    { "image": "01_intro.jpg", "start": 0, "duration": 18, "transition": "crossfade" },
    { "image": "02_signal.png", "start": 18, "duration": 20, "transition": "cut" },
    { "image": "03_city.webp", "start": 38 }
  ],
  "render": {
    "fps": 60,
    "videoBitrate": 12000000,
    "audioBitrate": 192000,
    "asciiIntensity": 1,
    "overlay": 0.9,
    "crt": 1,
    "transitionSeconds": 1.2,
    "showTerminal": true,
    "showEqualizer": true
  }
}
```

### Pola

| Pole | Typ | Opis |
| --- | --- | --- |
| `version` | liczba | wersja schematu, obecnie `1`. Brak pola oznacza przyjęcie schematu 1 i dodanie ostrzeżenia. |
| `audio` | tekst | nazwa pliku audio. Gdy pliku nie ma — status i HUD zgłaszają brak, a aplikacja używa pierwszego znalezionego audio. |
| `cues` | tekst | nazwa pliku `.lrc` (akceptowany jest też alias `lrc`). |
| `theme` | tekst | `cyan`, `amber` albo `green`. Nieznana wartość = pozostawienie bieżącego motywu. |
| `equalizer` | liczba | `1` segmenty, `2` symetria, `3` punkty. |
| `scenes` | tablica | timeline scen (patrz niżej). |
| `render` | obiekt | parametry renderowania i nagrywania. |

### Sceny

| Pole | Wymagane | Opis |
| --- | --- | --- |
| `image` | tak | nazwa pliku graficznego (akceptowane aliasy: `src`, `file`). |
| `start` | nie | moment pojawienia się sceny w sekundach. Brak = koniec poprzedniej sceny. |
| `duration` | nie | czas trwania w sekundach. Brak = do `start` następnej sceny, a dla ostatniej — do końca audio. |
| `transition` | nie | `crossfade` (domyślne) albo `cut`. Nieznana wartość wraca do `crossfade` i dodaje ostrzeżenie. |
| `enabled` | nie | `false` wyłącza scenę bez usuwania jej z manifestu. |

Zasady układania timeline'u:

1. sceny są porządkowane po `start`, a przy równych czasach — po kolejności w manifeście, więc nieposortowany manifest daje stabilny wynik,
2. `start` + `duration` wyznaczają dokładny zakres sceny,
3. gdy brakuje obu pól, scena dostaje domyślny czas (8 s) i stosowne ostrzeżenie,
4. ujemny `start` jest przycinany do 0, a `duration <= 0` jest ignorowane,
5. brakujący plik graficzny nie przerywa działania — scena zostaje w timeline jako puste miejsce, a pozostałe sceny odtwarzają się bez przesunięć.

### Komunikaty walidacji

| Sytuacja | Zachowanie |
| --- | --- |
| błędny JSON (`project.json` nie parsuje się) | status i HUD zgłaszają błąd, aplikacja przechodzi w tryb automatyczny |
| poprawny JSON bez wskazanych plików | status: tryb automatyczny, HUD: ostrzeżenie |
| poprawny manifest bez scen | obrazy rozkładane automatycznie, ostrzeżenie w HUD |
| manifest poprawny i w pełni załadowany | status `MANIFEST: N SCEN`, brak ostrzeżeń |
| brak któregokolwiek pliku (audio/LRC/obraz) | lista brakujących nazw w statusie (do 3 + licznik) i w HUD |

## Eksport konfiguracji

Przycisk **💾 EKSPORT PROJECT.JSON** zapisuje bieżący stan aplikacji jako manifest: wskazane audio i LRC, motyw, equalizer, ustawienia renderowania oraz timeline scen z wyliczonymi czasami (także w trybie automatycznym). Plik trafia do katalogu pobieranych przeglądarki — komunikat w statusie przypomina, do którego katalogu projektu należy go wrzucić.

## Nagrywanie

Nagrywany jest `canvas` wizualizatora wraz z audio skierowanym do `MediaStreamDestination`. Pasek UI pozostaje poza nagraniem, więc wynik jest czystym klipem wizualnym. Format wyjściowy to `WebM` z kodekiem wybranym przez przeglądarkę (preferowany VP9/Opus, fallback VP8/Opus). Status podczas nagrywania pokazuje rozdzielczość, FPS i kodek, a po zapisie — rozmiar pliku i liczbę ścieżek.

Wymagane są:

- `Web Audio API`,
- `HTMLCanvasElement.captureStream()`,
- `MediaRecorder` z obsługą WebM.

Najlepsze wsparcie nagrywania zapewniają współczesne wersje Chrome/Edge/Brave. Eksport do MP4 nie jest realizowany w przeglądarce — wymaga późniejszej konwersji, np. FFmpeg.

## Plik LRC

Standardowe wpisy mają postać:

```text
[00:00.00]I dream in static, I bleed in code
[00:04.50]A thousand voices on a lonely road
```

Parser obsługuje również wiele znaczników w jednej linii, np. `[00:10.00][00:20.00]Powtórzony cue`, oraz pomija metadane LRC (`[ar:]`, `[ti:]`, `[al:]` itd.).

## Dokumentacja i plan rozwoju

- [Analiza projektu i plan ulepszeń](./ANALIZA-I-ULEPSZENIA.md)
- [Opis koncepcji GHOST AI, tekst i prompty graficzne](./🌌%20GHOST%20AI%20%E2%80%94%20Dokumentacja%20Projektu%20%28CyberPlayer%20STUDIO%29.md)
- [Wzorcowy manifest](./project.example.json)
- [Implementacja aplikacji](./demorecorder.html)

## Testy i weryfikacja

Projekt pozostaje bez-buildowy, a testy korzystają wyłącznie z wbudowanego w Node modułu `node:test`:

```bash
node --test tests/*.test.mjs      # albo: npm test
node tests/check-syntax.mjs       # składnia skryptu z demorecorder.html
```

Zakres testów:

- `tests/core.test.mjs` — parser LRC, parser i walidacja `project.json`, walidacja/timeline scen, mapowanie plików, eksport manifestu, formatowanie czasu,
- `tests/html.test.mjs` — statyczna struktura HTML (wymagane elementy, brak zasobów z sieci, poprawna składnia, poprawność `project.example.json`),
- `tests/integration.test.mjs` — cały pipeline ładowania projektu uruchomiony w lekkim stubie DOM: manifest + pliki → plan scen, braki plików, tryb automatyczny, eksport, drag and drop,
- `tests/smoke.test.mjs` — opcjonalny test w prawdziwej przeglądarce; pomijany, gdy Playwright nie jest zainstalowany:

  ```bash
  npm i -D playwright && npx playwright install chromium
  node --test tests/*.test.mjs
  ```

Czysta logika (`parseLRC`, `parseProjectManifest`, `buildSceneTimeline`, `serializeProject`, `formatTime`) znajduje się w `demorecorder.html` w bloku oznaczonym `CYBERPLAYER-CORE-START` / `CYBERPLAYER-CORE-END`. Testy wycinają ten blok z HTML i uruchamiają go w Node, więc źródłem prawdy pozostaje wciąż jeden plik.
