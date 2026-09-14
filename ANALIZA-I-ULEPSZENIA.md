# Analiza i plan ulepszeń CyberPlayer STUDIO

**Data przeglądu:** 2026-09-14  
**Analizowana wersja:** `demorecorder.html` po pierwszych testach  
**Charakter projektu:** samodzielna aplikacja HTML/CSS/JS, bez zależności zewnętrznych

## 1. Ocena projektu

CyberPlayer STUDIO jest lekkim, offline'owym rendererem klipów audio-wizualnych. Jego mocną stroną jest krótka ścieżka od katalogu z assetami do gotowego nagrania: użytkownik nie musi budować timeline'u ani konfigurować serwera. Sekwencja obrazów jest sterowana czasem audio, a warstwa ASCII, equalizer i filtr CRT zapewniają spójny styl demoscenowy.

### Obecny przepływ danych

```text
katalog użytkownika
  ├── audio ──> HTMLAudioElement ──> Web Audio API ──> analyser ──> wizualizacja
  │                                      └──────────> MediaStreamDestination ──> MediaRecorder
  ├── obrazy ──> Image / canvas ──> przejścia i filtr kolorystyczny
  └── .lrc ──> parser cue ──> terminal HUD
```

### Funkcje dostępne w aplikacji

- ładowanie audio, obrazów i `.lrc` z jednego katalogu,
- naturalne sortowanie nazw scen (`01_...`, `02_...`, ...),
- automatyczny dobór obrazu na podstawie postępu utworu i płynne przenikanie,
- ASCII sphere/core z reakcją na bas,
- equalizer w trzech wariantach: segmenty, symetria, punkty,
- motywy CYAN / AMBER / GREEN,
- terminal z efektem wpisywania tekstu i cue synchronizowanym do audio,
- pasek postępu, skok do pozycji, fullscreen,
- nagrywanie obrazu `canvas` i audio do WebM,
- działanie bez backendu i bez wysyłania plików użytkownika do sieci.

## 2. Ulepszenia wprowadzone w tej wersji

### Stabilność i kompatybilność

- dobór kodeka nagrywania przez `MediaRecorder.isTypeSupported()` zamiast wymuszania samego VP9,
- komunikaty błędów dla braku `MediaRecorder`, `captureStream`, Web Audio API i nieczytelnego audio,
- automatyczne zatrzymanie nagrywania po zakończeniu utworu,
- prawidłowe zwalnianie ścieżek `MediaStream` i obiektów `Blob URL`,
- zabezpieczenie przed pozostawieniem starego audio lub starych obrazów po ponownym wskazaniu katalogu,
- token ładowania projektu zapobiegający nadpisaniu nowego projektu przez spóźnione zdarzenie starego ładowania,
- bezpieczna obsługa pustego katalogu, uszkodzonego obrazu i projektu bez audio.

### Synchronizacja i UX

- parser `.lrc` obsługuje wiele timestampów w jednej linii, CRLF oraz metadane,
- cue mają stabilny prompt oparty o czas cue, a nie przypadkowy czas renderowanej klatki,
- przewijanie działa myszą oraz klawiszami `Home`, `End`, `ArrowLeft` i `ArrowRight`,
- `Space` steruje play/pause, `R` steruje nagrywaniem,
- dodany przycisk fullscreen,
- status aplikacji ma `aria-live`, a pasek postępu jest dostępny jako kontrolka klawiaturowa,
- motyw zmienia również kolor drugorzędny, tło i poświatę; wcześniej część poświaty pozostawała cyjanowa.

### Wydajność i responsywność

- bufory ASCII są ponownie wykorzystywane zamiast tworzenia nowych tablic przy każdej klatce,
- HUD przechodzi w układ pionowy na węższych ekranach,
- dodano obsługę większej liczby formatów plików rozpoznawanych przez przeglądarkę,
- przy ponownym wyborze tego samego katalogu input plikowy jest resetowany.

## 3. Najważniejsze obserwacje techniczne

### Zalety

1. **Mały narzut wdrożenia.** Jedna strona HTML jest łatwa do archiwizacji i uruchomienia.
2. **Dobry podział funkcjonalny w kodzie.** Sekcje audio, parsera, renderera i recordera można dalej wydzielić bez zmiany koncepcji.
3. **Nagrywanie bez serwera.** Połączenie `canvas.captureStream()` z `MediaStreamDestination` jest właściwym kierunkiem dla prototypu.
4. **Wyraźny język wizualny.** ASCII, scanlines, neonowe motywy i terminal tworzą rozpoznawalny rezultat już przy minimalnej liczbie assetów.

### Ograniczenia

1. **Jeden utwór na projekt.** Aplikacja wybiera pierwszy znaleziony plik audio; nie ma playlisty ani montażu wielu ścieżek.
2. **Obraz jest przypisany do równych odcinków czasu.** `.lrc` steruje tekstem, ale nie pozwala jeszcze ustawiać momentu zmiany konkretnej grafiki.
3. **Brak projektu zapisywanego jako preset.** Po odświeżeniu trzeba ponownie wskazać katalog i ustawić motyw/equalizer.
4. **WebM jako jedyny eksport.** MP4/H.264 wymaga zewnętrznej konwersji.
5. **Zużycie CPU rośnie wraz z rozdzielczością.** ASCII renderer, scanlines i nagrywanie 60 FPS mogą być ciężkie na słabszych komputerach.
6. **Brak automatycznych testów przeglądarkowych.** `node --check` sprawdza składnię, ale nie zastępuje testu w realnym Chrome/Firefox/Safari.
7. **Folder picker jest zależny od przeglądarki.** `webkitdirectory` ma najlepszą obsługę w Chromium; aplikacja nie ma jeszcze drag-and-drop ani ręcznego wyboru wielu plików jako alternatywy.

## 4. Zalecany plan rozwoju

### Priorytet P0 — bezpieczeństwo eksportu

- wyświetlać przed nagraniem szacowaną rozdzielczość, FPS i wybrany kodek,
- dodać kontrolę jakości `low / medium / high`, zamiast stałego bitrate'u,
- dodać test końcowy: czy Blob ma ścieżkę audio i video oraz nie jest pusty,
- zachować informację o ograniczeniach kodeka w nazwie/statusie pliku.

### Priorytet P1 — model projektu

- opcjonalny `project.json` z polami `audio`, `scenes`, `cues`, `theme` i `render`;
- scena powinna mieć `image`, `start` lub `duration`, opcjonalny efekt przejścia;
- fallback do obecnego trybu „sortowanie obrazów po nazwie”, aby istniejące katalogi nadal działały;
- eksport/import ustawień projektu jako JSON.

Przykładowy kierunek formatu:

```json
{
  "audio": "ghost_ai.mp3",
  "theme": "cyan",
  "scenes": [
    { "image": "01_intro.jpg", "start": 0, "transition": "crossfade" },
    { "image": "02_face.jpg", "start": 12.5, "transition": "crossfade" }
  ],
  "cues": "ghost_ai.lrc"
}
```

### Priorytet P1 — kontrola artystyczna

- parametry intensywności ASCII, CRT, winiety, overlayu i basu,
- wybór krzywej przejścia oraz długości crossfade,
- opcjonalne beat detection z `AnalyserNode` i krótkie błyski/zakłócenia na transjentach,
- możliwość wyłączenia terminala lub equalizera przed nagraniem.

### Priorytet P2 — ergonomia

- drag-and-drop katalogu/plików,
- podgląd listy znalezionych plików i ostrzeżenia o duplikatach/braku audio,
- zapis ostatnich ustawień w `localStorage`,
- przyciski „snapshot PNG” i „reset projektu”,
- panel diagnostyczny z FPS, rozdzielczością canvasu i stanem AudioContext.

### Priorytet P2 — jakość projektu

- rozdzielenie kodu na `src/` i małe moduły bez utraty wersji standalone,
- testy parsera LRC oraz testy jednostek formatowania czasu,
- test smoke w Playwright dla ładowania UI, zmiany motywu, seeka i symulowanego nagrywania,
- automatyczne sprawdzanie składni HTML/JS w CI.

## 5. Kryteria akceptacji obecnej wersji

- [x] strona otwiera się bez bibliotek zewnętrznych,
- [x] katalog z audio i obrazami ładuje się bez ręcznego wpisywania ścieżek,
- [x] obrazy są sortowane naturalnie i zmieniają się wraz z postępem audio,
- [x] plik `.lrc` synchronizuje tekst terminala,
- [x] seek nie zostawia cue z poprzedniej pozycji,
- [x] zmiana katalogu zwalnia stare zasoby i nie miesza projektów,
- [x] recorder wybiera dostępny kodek i kończy pracę razem z audio,
- [x] nie ma błędów składni JavaScript (`node --check`),
- [ ] eksport MP4,
- [ ] konfiguracja scen z dokładnymi timestampami,
- [ ] automatyczny test w prawdziwej przeglądarce.

## 6. Rekomendacja

Obecny prototyp nadaje się do tworzenia krótkich klipów lyric-video i wizualizacji do publikacji po konwersji WebM. Największy zwrot z dalszej pracy da wprowadzenie `project.json` z dokładnym timeline'em oraz panelu parametrów renderera. Dopiero później warto rozbudowywać aplikację o playlistę, wielościeżkowy montaż lub eksport MP4 — te funkcje zwiększą złożoność bardziej niż poprawią podstawowy, demoscenowy workflow.
