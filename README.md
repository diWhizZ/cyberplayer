# CyberPlayer STUDIO

Prosty, offline'owy generator klipów audio-wizualnych w estetyce demoscene / cyber-retro. Aplikacja działa w jednej stronie HTML i nie wymaga bibliotek ani backendu.

## Możliwości

- ładowanie całego katalogu projektu przez `webkitdirectory`,
- automatyczne wyszukanie pierwszego pliku audio oraz grafik uporządkowanych naturalnie (`01_intro`, `02_verse`, ...),
- synchronizacja napisów/cues z plikiem `.lrc`, także dla wielu znaczników czasu w jednej linii,
- wizualizacja reagująca na bas i widmo częstotliwości: ASCII core, obrazy tła, CRT scanlines i trzy tryby equalizera,
- motywy kolorystyczne CYAN, AMBER i GREEN,
- sterowanie PLAY / PAUSE / STOP, pasek postępu z klawiatury i przewijanie po cue,
- nagrywanie płótna wraz ze ścieżką audio do `WebM` przez `MediaRecorder`,
- automatyczne zakończenie nagrania po końcu audio,
- tryb fullscreen oraz skróty `Space` (play/pause) i `R` (nagrywanie).

## Uruchomienie

1. Otwórz [`demorecorder.html`](./demorecorder.html) w aktualnej przeglądarce Chromium, Firefox lub Safari.
2. Kliknij **WSKAŻ KATALOG PROJEKTU**.
3. Wybierz katalog zawierający audio, obrazy i opcjonalny plik `.lrc`.
4. Kliknij **PLAY**, aby sprawdzić synchronizację, a następnie **REC VIDEO**, aby zapisać klip.

Dla najbardziej przewidywalnego działania można uruchomić lokalny serwer statyczny:

```bash
python3 -m http.server 8080
```

Następnie otwórz `http://localhost:8080/demorecorder.html`.

## Format katalogu projektu

```text
my-project/
├── 01_intro.jpg
├── 02_signal.png
├── 03_city.webp
├── ghost_ai.mp3
└── ghost_ai.lrc
```

Obsługiwane są popularne formaty audio rozpoznawane przez przeglądarkę (`mp3`, `wav`, `ogg`, `m4a`, `aac`, `flac`) i formaty graficzne obsługiwane przez HTML (`jpg`, `png`, `gif`, `webp`, `avif`). W praktyce zakres może różnić się między przeglądarkami.

### Plik LRC

Standardowe wpisy mają postać:

```text
[00:00.00]I dream in static, I bleed in code
[00:04.50]A thousand voices on a lonely road
```

Parser obsługuje również wiele znaczników w jednej linii, np. `[00:10.00][00:20.00]Powtórzony cue`, oraz pomija metadane LRC (`[ar:]`, `[ti:]`, `[al:]` itd.).

## Nagrywanie

Nagrywany jest `canvas` wizualizatora wraz z audio skierowanym do `MediaStreamDestination`. Pasek UI pozostaje poza nagraniem, więc wynik jest czystym klipem wizualnym. Format wyjściowy to `WebM` z kodekiem wybranym przez przeglądarkę (preferowany VP9/Opus, fallback VP8/Opus).

Wymagane są:

- `Web Audio API`,
- `HTMLCanvasElement.captureStream()`,
- `MediaRecorder` z obsługą WebM.

Najlepsze wsparcie nagrywania zapewniają współczesne wersje Chrome/Edge/Brave. Eksport do MP4 nie jest realizowany w przeglądarce — wymaga późniejszej konwersji, np. FFmpeg.

## Dokumentacja i plan rozwoju

- [Analiza projektu i plan ulepszeń](./ANALIZA-I-ULEPSZENIA.md)
- [Opis koncepcji GHOST AI, tekst i prompty graficzne](./🌌%20GHOST%20AI%20%E2%80%94%20Dokumentacja%20Projektu%20%28CyberPlayer%20STUDIO%29.md)
- [Implementacja aplikacji](./demorecorder.html)

## Weryfikacja

Kod JavaScript osadzony w HTML można sprawdzić bez instalowania zależności:

```bash
python3 - <<'PY'
from pathlib import Path
text = Path('demorecorder.html').read_text()
script = text.split('<script>', 1)[1].split('</script>', 1)[0]
Path('/tmp/cyberplayer.js').write_text(script)
PY
node --check /tmp/cyberplayer.js
git diff --check
```

Projekt jest celowo bez-buildowy: źródłem prawdy jest pojedynczy plik `demorecorder.html`.
