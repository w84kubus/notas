# Notas — pamięć projektu

## Co to jest

Wspólne notatki na kod pokoju. Jedna osoba zakłada pokój (6-znakowy kod), reszta wchodzi
z kodem lub linkiem i wszyscy piszą w jednym dokumencie, z czatem obok. Bez kont, bez
instalowania. Pomysł: studenci dzielący się notatkami z wykładów, więc ma być **szybko,
małe i dyskretne** (okno mini, ukrywanie na `Esc`).

Domena docelowa: **notas.pl** (jeszcze niepodpięta). Produkcja: https://notas-mm5e.onrender.com

Stack: React 18 + TypeScript strict + Vite 8, TipTap 3 + Yjs (CRDT), Node 22 z `http` + `ws`
(bez frameworka), `node:test`. Hosting: Render (Docker, plan free) z autoDeploy z `main`.

## Specyfikacja

Pełny spec: **`SPEC.md`** w rootcie repo. Wygląd: **`DESIGN.md`** (jedyne źródło prawdy o tokenach).
Żaden z nich nie jest ładowany automatycznie — czytaj na żądanie.

- Przed pracą nad serwerem: `SPEC.md` §3 (model pokoju) i §5 (limity).
- Przed pracą nad UI: `DESIGN.md`, w całości.

## Zasady nienegocjowalne

1. **IMPORTANT: Serwer nie ma bazy danych i nic nie zapisuje na dysk.** Pokoje i ich treść żyją
   wyłącznie w pamięci procesu. To obietnica prywatności z README („incognito"), nie wygoda.
   Nie dokładaj trwałego zapisu (plik, baza, log treści) bez wyraźnej zgody Jakuba.

2. **Pokój musi istnieć, zanim ktoś do niego wejdzie.** `POST /api/rooms` tworzy, wszystko inne
   tylko sprawdza. Wejście przez WebSocket nigdy nie zakłada pokoju — inaczej każde błędne
   zgadnięcie kodu tworzyłoby pusty pokój, a limit prób nie miałby czego liczyć.

3. **Dokładnie jedna instancja serwera.** Pokoje są w pamięci jednego procesu; druga instancja
   miałaby inne pokoje i ludzie z tym samym kodem pisaliby osobno. Nie skaluj poziomo, nie
   dokładaj `min_machines_running > 1` ani drugiego regionu.

4. **Nic w `localStorage`, ciasteczkach ani IndexedDB.** Pseudonim żyje w `sessionStorage`
   (znika z kartą). Service worker cache'uje wyłącznie szkielet aplikacji i `/assets/` —
   nigdy `/api/` ani `/ws/` ani odpowiedzi stron pokoi.

5. **Limity prób i sprawdzanie `Origin` zostają.** 10 błędnych kodów/min → blokada 5 min
   (HTTP i WebSocket), 12 założonych pokoi/min → blokada 2 min, WebSocket tylko z własnej domeny.
   Osłabienie któregokolwiek wymaga zgody, bo kod ma 6 znaków i to limit go chroni.

6. **Ukrywanie (`Esc`) musi blokować edycję.** Gdy `hidden`, edytor jest `setEditable(false)`
   a pole czatu `disabled`. Biała zasłona, w którą dalej można pisać, jest gorsza niż jej brak.

7. **Interfejs po polsku, kod i komentarze po polsku.** Fonty muszą mieć `latin-ext`
   (Ą Ć Ę Ł Ń Ó Ś Ź Ż) — Schibsted Grotesk ma. Teksty widoczne dla użytkownika piszemy w stylu
   „Czat wyczyszczony u wszystkich.", nie „Success!".

## Styl pracy

- Rób tylko bieżącą fazę. Nie refaktoruj rzeczy spoza zakresu.
- Gdy wahasz się między dwoma podejściami — przedstaw oba i zapytaj, nie decyduj sam.
- Przed zgłoszeniem „gotowe" odpal `npm run typecheck` i `npm test`. Oba muszą przejść.
- **Każdy push na `main` wdraża produkcję i kasuje wszystkie aktywne pokoje.** Grupuj zmiany
  w jeden commit, nie pushuj drobiazgów jeden po drugim.
- Zmiany interfejsu sprawdzaj w przeglądarce: oba motywy (jasny i ciemny) oraz okno 380 px.

## Komendy

```
npm run dev          # http://localhost:8787 (Vite wbudowany w serwer)
npm run build
npm start            # produkcja: serwer + dist/
npm run typecheck
npm test             # build, potem 16 testów serwera
```

Podgląd w aplikacji: konfiguracje `notas` (dev, port 8787) i `notas-prod` (port 8791)
w `.claude/launch.json` folderu nadrzędnego.

## Stan projektu

- [x] Faza 1 — pokoje na kod, wspólny edytor (TipTap + Yjs), czat, pseudonimy
- [x] Faza 2 — okno mini (Document Picture-in-Picture + wyskakujące okienko), ukrywanie `Esc`
- [x] Faza 3 — czyszczenie czatu z cofnięciem, znikające wiadomości, pobieranie notatek
- [x] Faza 4 — limity prób, `Origin`, CSP, wygasanie pokoi, komunikat „Pokój wygasł"
- [x] Faza 5 — PWA (manifest, service worker), jasny i ciemny motyw
- [x] Faza 6 — TipTap 3 (0 podatności), podział bundla, testy serwera (16), CI
- [x] Faza 7 — wdrożenie na Render z GitHuba, README PL/EN, SPEC, DESIGN

### Co realnie zostało

- Podpięcie domeny **notas.pl** (Render → Settings → Custom Domains)
- Przycisk „Zamknij pokój dla wszystkich" (natychmiastowe usunięcie treści z serwera)
- Test w Firefoksie i Safari (tam okno mini to zwykłe okienko)
- Testy interfejsu (dziś tylko serwer ma testy automatyczne)

## Konwencje, które łatwo przeoczyć

### Hosting z WebSocketami — nie Vercel

Vercel i inne platformy serverless nie utrzymują WebSocketów ani pamięci między żądaniami.
Notas wymaga długo działającego procesu. Render (Docker) i Fly.io mają gotowe konfiguracje
(`render.yaml`, `fly.toml`). Darmowy plan Render **usypia** usługę po ~15 min bez ruchu,
co kasuje pokoje; płatny `starter` nie usypia.

### Status `connecting`, nie tylko `disconnected`

`y-websocket` przy ponawianiu połączenia ustawia status `connecting`, a nie `disconnected`
(ten pojawia się tylko przy utracie działającego połączenia). Pierwsza wersja wykrywania
„pokój wygasł" patrzyła wyłącznie na `disconnected` i **nigdy się nie uruchamiała** po restarcie
serwera. Kontrola `GET /api/rooms/:kod` musi ruszać przy każdym statusie innym niż `connected`.
Baner „Brak połączenia" pojawia się dopiero po 2 s, żeby nie mrugał.

### Okno mini remontuje obszar roboczy

W trybie Document PiP `Workspace` renderuje się przez portal do drugiego okna pod innym
`key`, więc edytor TipTap tworzy się od nowa. Dokument Yjs i provider żyją wyżej (w `Room`),
dlatego nic nie ginie. Skutek uboczny: stan lokalny `Workspace` startuje od zera — status
połączenia trzeba inicjalizować z `provider.wsconnected`, nie na sztywno `'connecting'`
(inaczej w oknie mini kropka wisiała na „łączenie").

Style do okna PiP kopiujemy przez `cloneNode` wszystkich `<style>` i `<link rel="stylesheet">`.
W trybie dev późniejsze aktualizacje HMR nie trafiają do otwartego okna.

### TipTap 3

- Historia wyłączona przez `undoRedo: false` (w v2 było `history: false`) — undo/redo robi Yjs.
- `shouldRerenderOnTransaction: true` jest konieczne: w v3 domyślnie `false`, a pasek
  narzędzi czyta `editor.isActive(...)` przy renderze.
- Kursory: `CollaborationCaret` (zastąpił `CollaborationCursor`), klasy CSS
  `collaboration-carets__caret` i `collaboration-carets__label`.
- Pola dokumentu Yjs: fragment `default` (treść), tablica `chat`, mapa `settings`.

### Środowisko dev a Vite HMR

`npm run dev` osadza Vite w serwerze; HMR ma osobny port 24678. Po **restarcie serwera
dev** klient Vite sam przeładowuje stronę, więc testu „pokój wygasł" nie da się w ten sposób
zrobić — trzeba tryb produkcyjny (`notas-prod`). Dwie instancje dev naraz kłócą się o ten port.

### Podgląd w aplikacji Claude

`preview_start` **przekierowuje swoją kartę na stronę główną**, więc nie uruchamiaj go
w trakcie testu, który wymaga otwartej karty z pokojem — otwórz pokój w osobnej karcie.
Zrzuty do README: Playwright (`browser_take_screenshot` z bezwzględną ścieżką).

### Adres IP za proxy

Za proxy (`TRUST_PROXY=1`) adres klienta bierzemy kolejno z `fly-client-ip`, `cf-connecting-ip`,
w ostateczności z pierwszego wpisu `X-Forwarded-For`. Ten ostatni może podrobić klient, więc
jest tylko awaryjny. Bez `TRUST_PROXY` wszyscy użytkownicy za proxy byliby jednym adresem —
literówki jednej osoby blokowałyby cały pokój. Pilnuje tego test w `server.test.js`.

### Testy serwera uruchamiają prawdziwy proces

`server/server.test.js` startuje `node server/index.js` w trybie produkcyjnym na wolnym porcie,
więc wymaga zbudowanego `dist/` — stąd `pretest: npm run build`. Zestaw „limity prób" używa
osobnych instancji serwera, bo blokada jest per adres i zepsułaby sąsiednie testy.
