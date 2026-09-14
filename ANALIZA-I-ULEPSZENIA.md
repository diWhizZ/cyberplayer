# Analiza i plan ulepszeń CyberPlayer STUDIO

**Data przeglądu:** 2026-09-14  
**Ostatnia aktualizacja:** 2026-09-15 — po wdrożeniu Build 2 (manifest `project.json`) i Build 3 (walidacja, `duration`, eksport konfiguracji, drag and drop, testy)
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

### Priorytet P0 — bezpieczeństwo eksportu — zrealizowane w Build 3

- wyświetlać przed nagraniem szacowaną rozdzielczość, FPS i wybrany kodek,
- dodać kontrolę jakości `low / medium / high`, zamiast stałego bitrate'u,
- dodać test końcowy: czy Blob ma ścieżkę audio i video oraz nie jest pusty,
- zachować informację o ograniczeniach kodeka w nazwie/statusie pliku.

### Priorytet P1 — model projektu — zrealizowane w Build 2/3

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

### Priorytet P1 — kontrola artystyczna — częściowo zrealizowane w Build 2/3

- parametry intensywności ASCII, CRT, winiety, overlayu i basu,
- wybór krzywej przejścia oraz długości crossfade,
- opcjonalne beat detection z `AnalyserNode` i krótkie błyski/zakłócenia na transjentach,
- możliwość wyłączenia terminala lub equalizera przed nagraniem.

### Priorytet P2 — ergonomia — częściowo zrealizowane w Build 3

- drag-and-drop katalogu/plików,
- podgląd listy znalezionych plików i ostrzeżenia o duplikatach/braku audio,
- zapis ostatnich ustawień w `localStorage`,
- przyciski „snapshot PNG” i „reset projektu”,
- panel diagnostyczny z FPS, rozdzielczością canvasu i stanem AudioContext.

### Priorytet P2 — jakość projektu — częściowo zrealizowane w Build 3

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
- [x] konfiguracja scen z dokładnymi timestampami (`project.json`: `start`, `duration`, `transition`, `enabled`),
- [x] walidacja manifestu rozróżnia błędny JSON, manifest bez plików, manifest bez scen i manifest kompletny,
- [x] brakujący plik audio/LRC/obraz jest raportowany i nie przerywa działania aplikacji,
- [x] eksport bieżącej konfiguracji do `project.json` z poziomu UI,
- [x] drag and drop katalogu lub plików korzysta z tego samego pipeline'u co folder picker,
- [x] testy: parsera LRC, parsera manifestu, walidacji scen, formatowania czasu, statyczna struktura HTML i testy integracyjne pipeline'u,
- [ ] eksport MP4,
- [ ] automatyczny test w prawdziwej przeglądarce (szkielet jest gotowy i pomija się przy braku Playwrighta).

## 6. Co wniosły Build 2 i Build 3

### Build 2 — model projektu

- opcjonalny manifest `project.json` z polami `audio`, `cues`, `theme`, `equalizer`, `scenes` i `render`,
- sceny z dokładnymi timestampami (`start`, `duration`), przejściami `crossfade` / `cut` i wyłącznikiem `enabled`,
- parametry renderowania sterowane z manifestu: `fps`, `videoBitrate`, `audioBitrate`, `asciiIntensity`, `overlay`, `crt`, `transitionSeconds`, `showTerminal`, `showEqualizer`,
- fallback do starego trybu — bez manifestu aplikacja nadal sortuje obrazy i dzieli je na długość audio.

### Build 3 — dokończenie i przygotowanie do użycia produkcyjnego

- **walidacja manifestu:** wersja schematu (`version: 1`), rozróżnienie błędnego JSON, poprawnego JSON bez plików, manifestu bez scen i manifestu kompletnego; lista brakujących plików w statusie oraz w HUD; brak jednego obrazu nie przerywa odtwarzania,
- **rozszerzony timeline:** `start` + `duration` wyznaczają zakres, brakujące wartości dostają przewidywalny fallback, sceny nieposortowane są stabilnie porządkowane, `enabled: false` wyłącza scenę,
- **eksport konfiguracji:** przycisk `EKSPORT PROJECT.JSON` zapisuje audio, cues, motyw, equalizer, sceny i ustawienia renderowania, także w trybie automatycznym,
- **drag and drop:** katalog lub zestaw plików można upuścić na aplikację; nieobsługiwane pliki są odrzucane bez błędu krytycznego, a ich liczba pojawia się w statusie,
- **ergonomia eksportu wideo:** jakość LOW / MEDIUM / HIGH, podgląd rozdzielczości, FPS i kodeka w trakcie nagrywania oraz raport rozmiaru i liczby ścieżek po zapisie,
- **testy:** 59 testów w `node:test` (parser LRC, parser i walidacja manifestu, walidacja scen, formatowanie czasu, struktura HTML, integracja pipeline'u ładowania, drag and drop) plus opcjonalny smoke test w Playwright.

## 7. Rekomendacja

Aplikacja jest gotowa do użycia produkcyjnego do krótkich klipów lyric-video: manifest `project.json` daje dokładny timeline, eksport konfiguracji zamyka obieg między podglądem a manifestem, a drag and drop skraca start pracy. Kolejny zwrot z pracy da edycja timeline'u bezpośrednio w UI (przesuwanie i przycinanie scen zamiast ręcznej edycji JSON) oraz eksport MP4 przez `WebCodecs` albo konwersję FFmpeg. Rozbudowa o playlistę i wielościeżkowy montaż ma sens dopiero po tych dwóch krokach — same w sobie zwiększają złożoność bardziej niż poprawiają podstawowy, demoscenowy workflow.
