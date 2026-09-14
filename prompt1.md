Pracujemy nad repozytorium GitHub:
https://github.com/diWhizZ/cyberplayer
To jest projekt CyberPlayer STUDIO — bez-buildowy generator klipów audio-wizualnych w stylu demoscene / cyber-retro. Główny plik aplikacji to:
demorecorder.html
Repozytorium zawiera również:

- README.md
- ANALIZA-I-ULEPSZENIA.md
- 🌌 GHOST AI — Dokumentacja Projektu (CyberPlayer STUDIO).md
- project.example.json
  Kontekst dotychczasowych prac:
1. Pierwszy etap poprawił:
   
   - ładowanie katalogu audio/grafik/LRC,
   
   - parser LRC,
   
   - nagrywanie WebM przez MediaRecorder,
   
   - autodetekcję kodeka,
   
   - zwalnianie Blob URL i MediaStream,
   
   - automatyczne zatrzymywanie nagrania po końcu audio,
   
   - seek i skróty klawiaturowe,
   
   - fullscreen,
   
   - responsywny HUD,
   
   - optymalizację buforów ASCII,
   
   - README i dokumentację.
2. Build 2 dodał obsługę opcjonalnego manifestu project.json:
   
   - dokładny timeline scen,
   
   - sceny z polem image i start,
   
   - przejścia crossfade/cut,
   
   - wybór audio i LRC z manifestu,
   
   - ustawienia theme i equalizer,
   
   - render.fps,
   
   - render.videoBitrate,
   
   - render.asciiIntensity,
   
   - render.overlay,
   
   - render.crt,
   
   - render.transitionSeconds,
   
   - fallback do starego trybu automatycznego dzielenia obrazów po czasie.
   Przykład manifestu znajduje się w:
   project.example.json
   Ważne:
- plik używany przez aplikację musi nazywać się dokładnie project.json,
- musi znajdować się w katalogu wskazywanym w aplikacji,
- bez project.json aplikacja nadal ma działać w trybie kompatybilnym wstecz.
  Przed rozpoczęciem:
1. Sprawdź git status, branch i log.
2. Nie usuwaj ani nie resetuj istniejących zmian.
3. Sprawdź, czy commit Build 2 jest dostępny lokalnie lub zdalnie:
   4b51a41 Add project manifest timeline for CyberPlayer build 2
4. Jeśli commit nie jest dostępny w nowym checkoutcie, odzyskaj istniejącą implementację z właściwej gałęzi albo odtwórz ją na podstawie repozytorium — nie nadpisuj zmian bez analizy.
5. Pracuj na gałęzi przydzielonej przez bieżącą sesję. Nie twórz dodatkowej gałęzi.
   Cel następnego etapu:
   Dokończyć Build 2 i przygotować aplikację do wygodnego użycia produkcyjnego.
   Priorytet 1 — walidacja project.json:
- dodaj wersję schematu, np.:
  "version": 1
- raportuj w statusie brakujące pliki audio, LRC i obrazów wskazane w manifeście,
- rozróżnij:
  - błędny JSON,
  - poprawny JSON bez wskazanych plików,
  - poprawny manifest bez scen,
  - manifest poprawny i w pełni załadowany,
- nie przerywaj działania całej aplikacji z powodu jednego brakującego obrazu,
- pokaż listę brakujących plików albo krótkie ostrzeżenie w HUD/statusie,
- zachowaj fallback do automatycznego sortowania obrazów.
  Priorytet 2 — rozszerzenie timeline’u:
- dodaj obsługę opcjonalnego pola duration dla sceny,
- zachowaj obsługę start,
- jeśli scena ma start i duration, użyj ich do wyznaczenia zakresu,
- jeśli brakuje start/duration, zastosuj rozsądny fallback,
- zapewnij stabilne zachowanie przy scenach nieposortowanych,
- dodaj możliwość wyłączenia sceny przez enabled: false,
- zachowaj przejścia crossfade i cut.
  Priorytet 3 — zapis konfiguracji:
  Dodaj w interfejsie przycisk eksportu bieżącej konfiguracji do project.json. Eksport powinien obejmować:
- audio,
- cues,
- theme,
- equalizer,
- sceny,
- ustawienia renderowania.
  Jeśli pełny panel edycji timeline’u byłby zbyt duży na jeden etap, zacznij od:
- eksportu obecnego manifestu,
- przycisku pobierającego project.json,
- czytelnego komunikatu, gdzie zapisano plik.
  Priorytet 4 — drag and drop:
  Dodaj możliwość przeciągnięcia katalogu lub zestawu plików na aplikację. Zachowaj dotychczasowy przycisk wyboru katalogu jako fallback.
  Drag and drop powinien:
- przyjąć audio, obrazy, LRC i project.json,
- używać tego samego pipeline’u co folder picker,
- odrzucać nieobsługiwane pliki bez błędu krytycznego,
- wyświetlać status skanowania.
  Priorytet 5 — testy:
  Dodaj możliwie lekkie testy bez ciężkiego build systemu:
- test parsera LRC,
- test parsera project.json,
- test walidacji scen,
- test formatowania czasu,
- statyczny test wymaganych elementów HTML,
- jeśli środowisko na to pozwala, test smoke w Playwright lub innej przeglądarce headless.
  Minimalna weryfikacja po zmianach:
  ```bash
  python3 - <<'PY'
  from pathlib import Path
  text = Path('demorecorder.html').read_text()
  script = text.split('<script>', 1)[1].split('</script>', 1)[0]
  Path('/tmp/cyberplayer.js').write_text(script)
  PY
  node --check /tmp/cyberplayer.js
  git diff --check
