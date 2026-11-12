# Notas — pamięć projektu

## Co to jest

Wspólne notatki na kod pokoju. Jedna osoba zakłada pokój (6-znakowy kod), reszta wchodzi
z kodem lub linkiem i wszyscy piszą w jednym dokumencie, z czatem obok. Bez kont, bez
instalowania. Pomysł: studenci dzielący się notatkami z wykładów, więc ma być **szybko,
małe i dyskretne** (okno mini, ukrywanie na `Esc`).

Produkcja: **https://notas.pl** (Render; `www.notas.pl` przekierowuje na domenę główną; stary adres https://notas-mm5e.onrender.com działa nadal).

Stack: React 18 + TypeScript strict + Vite 8, TipTap 3 + Yjs (CRDT), Node 22 z `http` + `ws`
(bez frameworka), `node:test`. Hosting: Render (Docker, plan free) z autoDeploy z `main`.

## Specyfikacja

Pełny spec: **`SPEC.md`** w rootcie repo. Wygląd: **`DESIGN.md`** (jedyne źródło prawdy o tokenach; motyw „Neon” wg makiet Jakuba).
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
- Zmiany interfejsu sprawdzaj w przeglądarce: szeroko (1440), średnio (900), okno mini (380 × 540) i telefon (390 × 844).

## Komendy

```
npm run dev          # http://localhost:8787 (Vite wbudowany w serwer)
npm run build
npm start            # produkcja: serwer + dist/
npm run typecheck
npm test             # build, potem 20 testów serwera
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
- [x] Faza 8 — cofnij/ponów, menu pokoju (⋯), kod QR, „Zamknij pokój dla wszystkich" (kod 4001),
      strona Prywatność, workflow `keepalive.yml`
- [x] Faza 9 — redesign „Neon” wg makiet: ekran startowy, pokój z paskiem bocznym (Znika za, kod, QR, Panic Mode),
      dymki czatu, nowa paleta osób, audyt web-design-guidelines (DESIGN.md)

### Co realnie zostało

- Test w Firefoksie i Safari (tam okno mini to zwykłe okienko)
- Testy interfejsu (dziś tylko serwer ma testy automatyczne)
- Wersja angielska interfejsu (pozostałe projekty mają PL/EN)
- Wzory matematyczne (KaTeX), tabele, bloki kodu

## Konwencje, które łatwo przeoczyć

### Redesign „Neon” (12.11.2026)

Wygląd wg trzech makiet (patrz `DESIGN.md`). Rzeczy, które łatwo zepsuć:

- **Układ pokoju zależy od szerokości okna** (container queries na `.room`): ≥ 1100 px pasek boczny `.side`, poniżej
  go nie ma, a kod i obecni są w `.bar`. Nie sprawdzaj układu `@media`, tylko `@container`.
- **Kontrast neonów liczymy, nie zgadujemy.** Biały tekst na gradiencie przycisku miał na różowym końcu 3,2 : 1;
  końcówka to `#DB2777` (≥ 4,6 : 1). Kolory osób mają ciemny tekst (`#140A26`) i są sprawdzone ≥ 6,8 : 1.
- **QR jest gradientowy, ale na białej karcie** (`useQrSvg` w `RoomMenu.tsx`). Nie odwracaj kolorów.
- **„Znika za”** czyta `expiresInMs` z `GET /api/rooms/:kod` (serwer: `lastActive + TTL − teraz`), odświeżane co minutę.
- **Poświata logo animuje `opacity` pseudo-elementu** (`::before` z `content: attr(data-text)`), nie `filter`.
- **Po przebudowie (`npm run build`) otwarta karta ma stare nazwy plików** i leniwy fragment `Room-*.js` znika
  („Failed to fetch dynamically imported module”). To nie błąd aplikacji: odśwież kartę.

### Awatary i czcionka (dołączone 12.11.2026, za zgodą Jakuba)

- **Awatary: DiceBear `@dicebear/core@9` + `@dicebear/avataaars@9`, generowane lokalnie** (`src/Avatar.tsx`, leniwy import).
  **Nigdy nie przełączaj na API DiceBear** (`api.dicebear.com`): obcy serwis w każdym awatarze łamie zasadę prywatności i CSP.
  Core musi być w wersji 9, bo styl `@dicebear/avataaars@9` ma peer `^9`; wersja 10 core go nie obsłuży.
- Ziarno twarzy to `face` w tożsamości (sessionStorage), przesyłane w awarenessie i w każdej wiadomości czatu
  (`ChatMsg.face`). Starsze wiadomości i symulowani klienci bez `face` używają imienia jako ziarna.
- **Czcionka Barlow Condensed**: tylko `latin` i `latin-ext` w wagach 500–800 (`src/main.tsx`). Polskie znaki są w `latin-ext`.

### Edycja awatara

`AvatarDialog` zmienia `face` i `color` w tożsamości; `changeIdentity` zapisuje ją do sessionStorage, a efekt w `Workspace`
wpisuje ją do awarenessu, więc inni widzą zmianę od razu (sprawdzone w dwóch kartach). **Starsze wiadomości w czacie
zostają z dawnym wyglądem**, bo `face` i `color` są zapisane w samej wiadomości (świadomie: czat to historia, nie widok).
Paleta kolorów to `COLORS` z `identity.ts` (wspólna z losowaniem tożsamości); tożsamość sprzed zmiany palety może mieć
kolor spoza listy, wtedy w oknie żaden kolor nie jest zaznaczony. Przyciski okien (`.dialog-actions`) są sticky.

### Testowanie z symulowanymi osobami

Do zrzutów ekranu używam skryptu łączącego kilka klientów Yjs z pokojem (obecność + wiadomości). **Zatrzymaj go
(`pkill -f peers.cjs`) przed restartem serwera**: po restarcie pokój nie istnieje, a skrypt dalej próbuje się łączyć,
co nalicza błędne próby z tego samego adresu i **blokuje własny podgląd limitem (429)**. Serwer podglądu bywa też
zatrzymywany przez aplikację podczas dłuższej przerwy; sprawdź `curl localhost:8791/healthz`.
Narzędzie odczytu obrazów potrafi zwrócić **starą wersję** pliku o tej samej nazwie. Sprawdź czas zapisu (`ls -l`)
albo skopiuj plik pod nową nazwę, zanim uznasz zrzut za błędny.

### Zamknięcie pokoju: znacznik `closed`, nie tylko kod 4001

`DELETE /api/rooms/:kod` usuwa pokój z rejestru od razu, **wpisuje `closed: true` do mapy `settings`
dokumentu Yjs** (klienci dostają to zwykłą synchronizacją), po 0,4 s kończy połączenia kodem 4001
i niszczy dokument. Klient pokazuje „Pokój został zamknięty", a nie „Pokój wygasł" — to dwa różne
komunikaty o dwóch różnych sytuacjach.

**Sam kod 4001 nie wystarcza.** Zmierzone na Render: proxy hostingu nie przekazuje klientowi własnego
kodu zamknięcia, połączenie ginie dopiero po ok. 20 s jako `1006`, więc ludzie zobaczyliby „wygasł" z dużym
opóźnieniem. Lokalnie 4001 działał, więc test lokalny tego nie wychwycił. **Sygnały dla klientów puszczaj
kanałem dokumentu, nie kodami WebSocket**, i sprawdzaj je na produkcji. Zamknąć może każdy, kto zna kod
(kod i tak daje pełny dostęp do treści); okno potwierdzenia jest jedyną ochroną przed przypadkiem.

### Esc w menu i oknach

`Esc` globalnie ukrywa ekran. Menu pokoju i okna dialogowe przechwytują `Esc` przez
`stopPropagation()` w handlerze `onKeyDown`, więc zamykają się, zamiast ukryć ekran. To działa tylko,
gdy **fokus jest wewnątrz** menu lub okna — dlatego otwarcie przenosi fokus na pierwszy element
(`data-autofocus` w dialogach). Nowe okno bez przeniesienia fokusu pozwoli `Esc` ukryć ekran pod nim.

### Serwer podglądu nie przeładowuje kodu serwera

Vite w trybie dev odświeża front, ale `server/index.js` jest wczytywany raz. **Po każdej zmianie serwera
zrestartuj podgląd** (`preview_stop` + `preview_start`). Nieświeży serwer potrafi zwracać 404 dla nowej
trasy i objawia się jak błąd klienta — tak wyglądało pierwsze podejście do „Zamknij pokój".
`preview_start` przekierowuje swoją kartę na stronę główną, więc pokoje do testu otwieraj w osobnych kartach.

### Cofanie jest per osoba

Cofanie robi menedżer cofania Yjs dołączony przez rozszerzenie Collaboration (nie historia ProseMirror,
stąd `undoRedo: false`). Sprawdzone: `Ctrl+Z` w jednej karcie cofa jej tekst i zostawia cudzy.
Przyciski Cofnij/Ponów w pasku wołają `editor.chain().focus().undo()`; `editor.can().undo()` wyłącza je,
gdy nie ma co cofać. Nie przechodź na globalne cofanie.

### Podtrzymywanie serwera

`.github/workflows/keepalive.yml` pinguje `/healthz` co 10 min w godzinach 5-21 UTC (ok. 6-22 w Polsce).
Adres bierze ze zmiennej repozytorium `NOTAS_URL`; po podpięciu domeny zmień zmienną, nie kod.
GitHub bywa spóźniony i wstrzymuje harmonogramy po 60 dniach bez aktywności w repo — to łagodzenie
usypiania na darmowym planie, nie gwarancja.

### Render: automatyczne wdrożenia po pushu (naprawione 9.11.2026)

Usługa powstała pierwotnie z **publicznego adresu repo** (przycisk „Deploy to Render"), więc Render nie dostawał
powiadomień o pushach: w Events było tylko pierwsze wdrożenie, produkcja stała na starej wersji, a CI na GitHubie
było zielone. Naprawa: zainstalowana aplikacja **Render** na koncie GitHub (`w84kubus`, dostęp **tylko do repo `notas`**)
i źródło usługi przełączone w Settings → Build & Deploy → Source na repo z tej aplikacji (Git Provider).

Po każdym pushu na `main` sprawdź w Render → notas → Events, że pojawiło się wdrożenie tego commita,
a produkcja ma nowy bundle (`curl` strony głównej, nazwa pliku `index-*.js`). Gdyby znów zniknęło:
Manual Deploy → Deploy latest commit, a potem sprawdź dostęp aplikacji Render do repo
(GitHub → Settings → Applications → Render → Repository access). Pamiętaj, że każde wdrożenie kasuje wszystkie pokoje.

### Domena notas.pl (podpięta 12.11.2026)

Rejestrator i DNS: **home.pl** (panel: Domeny → notas.pl → Zarządzaj rekordami DNS). Rekordy:
`A  notas.pl → 216.24.57.1` i `CNAME  www → notas-mm5e.onrender.com.` (**kropka na końcu jest obowiązkowa** w panelu home.pl);
stary rekord `TXT` dla `notas.pl` zostaje nietknięty. W Render (Settings → Custom Domains) obie domeny są zweryfikowane,
`www` przekierowuje na domenę główną. Certyfikat HTTPS Render wystawia sam.

Pułapki z podłączania: (1) panel home.pl zapisuje rekord od razu, ale **serwer nazw publikuje go po ok. minucie**
(sprawdzaj `dig @dns.home.pl www.notas.pl CNAME +short`); (2) lokalny resolver trzyma odpowiedź negatywną (do godziny),
więc `www` może się „nie rozwiązywać" u Ciebie, choć działa publicznie (`dig @1.1.1.1`); (3) „Certificate Error" w Render
zwykle znika po ponowieniu weryfikacji, gdy oba rekordy DNS są już widoczne; wystawienie certyfikatu trwa kilka minut.
Przy zmianie hostingu pamiętaj o rekordach w home.pl i zmiennej `NOTAS_URL` (workflow `keepalive.yml`).

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
