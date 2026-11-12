# DESIGN.md — system wizualny „Neon”

Ten plik jest **jedynym źródłem prawdy o wyglądzie aplikacji**. Każdy nowy komponent używa tokenów i receptur
stąd. Tokeny żyją w `:root` w `src/styles.css`, w trzech warstwach (marka → znaczenie → komponent).

Źródło kierunku: trzy makiety od Jakuba (ekran startowy, pokój z paskiem bocznym, widok z dymkami czatu).
Makiety wygrywają z każdą ogólną regułą stylu; poniżej opisane jest to, co z nich wynika.

---

## 0. Kierunek

Neonowa noc: głęboki, ciemnofioletowy fundament, szklane panele z cienką, świecącą obwódką i jeden mocny akcent
na ekranie — **gradientowe logo „Notas”** z poświatą. Kolory mają znaczenie, nie ozdabiają:

| Kolor | Znaczy |
|---|---|
| fioletowo-różowy gradient | „zrób coś nowego” (Załóż nowy pokój) |
| neonowa zieleń | „wejdź / to jest kod” (Wejdź, kod pokoju) |
| różowy | czas, który ucieka (Znika za) |
| czerwień | ostrożnie / ukryj (Panic Mode, zamknięcie pokoju) |
| limonka | zaznaczenie w tekście (zakreślacz) i akcje pozytywne w oknach |
| kolory osób | kto jest kim (dymki czatu, awatary, kursory) |

**Napięcie, o którym trzeba wiedzieć:** aplikacja ma być dyskretna na wykładzie, a neon przyciąga wzrok. Dlatego
**Panic Mode (`Esc`) jest w pasku bocznym jako osobna, widoczna karta**, a nie ukrytą funkcją. Nie ma jasnego motywu.

---

## 1. Tokeny

### Warstwa 1: marka (surowe kolory)

| Token | Wartość | Token | Wartość |
|---|---|---|---|
| `--night-950` | `#07030F` | `--mint-300` | `#86FFB0` |
| `--night-900` | `#0D0719` (tło) | `--mint-400` | `#4ADE80` |
| `--night-800` | `#150C2B` | `--cyan-300` | `#67E8F9` |
| `--night-700` | `#20134A` | `--cyan-400` | `#22D3EE` |
| `--violet-400` | `#C084FC` | `--pink-400` | `#FF5FB0` |
| `--violet-500` | `#A855F7` | `--lime-300` | `#C6F432` |
| `--violet-600` | `#7C3AED` | `--red-400` | `#FF5A5F` |
| `--magenta-500` | `#EC4899` | `--white` | `#F6F2FF` |

### Warstwa 2: znaczenie (role)

`--bg`, `--ink` (tekst), `--ink-2` (tekst drugorzędny `#B9ACD9`), `--line`, `--glass` (tło panelu), `--accent`,
`--hl` (zakreślacz), `--on-hl`, `--danger`, `--focus` (`--cyan-400`), `--grad-create`, `--grad-join`.

### Warstwa 3: komponent

Promienie: `--r-sm: 10px` (przyciski małe, pozycje menu), `--r-md: 16px` (pola, przyciski, dymki), `--r-lg: 22px`
(panele, karty). Czcionki: `--font-display`, `--font-body`, `--font-mono`.

### Kolory osób

Osiem jasnych neonów: `#FF5FB0` `#4ADE80` `#38BDF8` `#FFA94D` `#B794F6` `#FACC15` `#FB7185` `#5EEAD4`.
Używane jako tło awatara i etykiety kursora (z **ciemnym** tekstem `#140A26`, kontrast ≥ 6,8 : 1) i jako kolor
obwódki i imienia w dymku czatu (kolor na ciemnym panelu ≥ 7 : 1).

### Kontrasty (policzone)

| Zestawienie | Kontrast |
|---|---|
| biały tekst na gradiencie przycisku (cały zakres, końcówka `#DB2777`) | ≥ 4,6 : 1 |
| ciemny tekst `#05200F` na zielonym przycisku | 9,9–14 : 1 |
| `--ink-2` na `--bg` | 9,4 : 1 |
| limonka `#C6F432` na panelu | 15,3 : 1 |
| `[Esc]` `#FF7377` na karcie Panic Mode | 7,0 : 1 |

---

## 2. Typografia

- **Nagłówki i etykiety:** `--font-display`, wąski krój w WERSALIKACH: **Barlow Condensed** (wagi 500–800, podzbiory
  `latin` i `latin-ext`, licencja OFL, hostowany lokalnie przez `@fontsource`), a awaryjnie `Roboto Condensed` →
  `Arial Narrow` → systemowy wąski. Importy w `src/main.tsx`; nie dodawaj innych podzbiorów ani wag bez potrzeby.
- **Tekst, czat, notatki:** Schibsted Grotesk (hostowany lokalnie, `latin-ext`).
- **Kod:** `--font-mono` (systemowy).
- **Logo:** Schibsted Grotesk 800 kursywą, gradient `#FFF → #B8F3FF → #CFB0FF → #F0A1FF` w tekście
  (`background-clip: text`), podwójna poświata `drop-shadow`.

| Rola | Rozmiar | Uwagi |
|---|---|---|
| Logo na starcie | `clamp(5rem, 15vw, 11.5rem)` | pulsuje poświata (opacity) |
| Tagline | `clamp(1.4rem, 2.6vw, 2.1rem)` | `text-wrap: balance` |
| Główny przycisk | `clamp(1.6rem, 3vw, 2.4rem)` | wersaliki, wąski |
| Kod pokoju (pasek boczny) | `2.55rem` | tabelaryczne cyfry |
| „Znika za” | `3rem` | różowy, poświata |
| Nagłówek notatki `h1` / `h2` | `2.1rem` / `1.45rem` | proste, 750 |

---

## 3. Układ

- **Start:** dwie kolumny (lewa: logo, tagline, przycisk, trzy kroki; prawa: karta „Dołącz do pokoju”). Poniżej
  900 px jedna kolumna. Tło: gradienty radialne + SVG z siecią linii i węzłów.
- **Pokój** (`.room` jest kontenerem, układ zależy od **szerokości okna**, nie urządzenia):

| Szerokość okna | Układ |
|---|---|
| ≥ 1100 px | pasek boczny 17,5 rem · notatki · czat 22 rem |
| 720–1099 px | notatki · czat (kod i obecni w górnym pasku) |
| < 720 px | jedna kolumna, dolne zakładki Notatki / Czat |

- Panele pływają na tle (odstęp 12 px), nie przylegają do krawędzi.
- Wysokość `100dvh`, bezpieczne obszary `env(safe-area-inset-*)` (górny, boczne, dolny pod zakładkami).

---

## 4. Komponenty

- **Panel (`.panel`)**: szkło (`--glass`), obwódka 1,5 px, miękka poświata. Warianty: `neon-violet` (domyślny w pokoju,
  słabsza poświata), `neon-green` (karta dołączania), `neon-pink`, `neon-red` (Panic Mode).
- **Przycisk główny (`.btn-create`)**: gradient, tytuł + podtytuł, unosi się o 2 px na hover, wciska na `:active`.
- **Przycisk „Wejdź” (`.btn-join`)**: zielony gradient, ciemny tekst.
- **Trzy kroki:** ręcznie rysowane SVG (okno z kursorem, okno z łańcuchem i globusem, ludzie z dymkiem), różowe linie
  z poświatą, strzałki między nimi. Lista `ol`, strzałki `aria-hidden`.
- **Karty paska bocznego:** Znika za (klepsydra + czas), Kod pokoju (zielony, przycisk kopiowania), QR, Panic Mode.
- **Pasek formatowania:** pigułka-panel; aktywne narzędzie ma fioletowo-różowy gradient, zakreślacz limonkowy.
- **Edytor:** ciemny panel; `mark` limonkowy, kod w tekście i bloki kodu zielone na prawie czarnym, punktory różowe.
- **Czat:** nagłówek „Czat pokoju” + liczba osób online; wiadomość = awatar (inicjał) + dymek z obwódką i poświatą
  w kolorze osoby, imię wewnątrz dymka. Własne wiadomości mają przy imieniu „(Ty)”.
- **Awatary:** ilustrowane twarze (DiceBear, styl Avataaars, autor Pablo Stanley), generowane **lokalnie w przeglądarce**
  (`src/Avatar.tsx`, osobny leniwy fragment), z tłem w kolorze osoby. Ziarno to `face` z tożsamości (stałe w karcie, więc
  zmiana pseudonimu nie zmienia twarzy). Do chwili wygenerowania, albo gdy się nie uda, jest inicjał na kolorowym kółku.
  Obraz trafia do `<img>` jako data URI (CSP: `img-src ... data:`), zero zapytań do zewnętrznych serwisów.
- **Edytor awatara (`AvatarDialog`):** okno z dużym podglądem (96 px), siatką 4 × 3 twarzy (52 px, wybrana ma zieloną obwódkę),
  przyciskiem „Losuj nowe twarze” i ośmioma kółkami kolorów (`role="radiogroup"`, wybrany ma biały pierścień). Przyciski
  „Anuluj / Zapisz” są przyklejone do dołu okna (`position: sticky`), żeby w oknie mini nie trzeba było przewijać.
- **Etykieta kursora:** pigułka w kolorze osoby z ciemnym tekstem.
- **QR:** gradient fioletowo-różowy (`#5B21B6 → #BE185D`) na **białej** karcie. Ciemne moduły na jasnym tle czytają
  się niezawodnie; odwrócony QR (jasny na ciemnym) nie jest czytany przez każdy skaner.
- **Menu, okna, toast:** ciemne, z fioletową obwódką i poświatą; destrukcyjne akcje na czerwono.
- **Zasłona „Ukryj”:** zawsze czysto biała (nie neon), żeby wyglądała jak pusta strona.

---

## 5. Ruch

Dozwolone: **jedno wejście przy ładowaniu** (logo, tagline, przycisk, kroki, karta — `rise`, transform + opacity),
poświata logo pulsująca przez **opacity** pseudo-elementu (nie `filter`), unoszenie głównych przycisków (transform).
Wszystko pod `prefers-reduced-motion: no-preference`. Zakazane: `transition: all`, animowanie `filter`/`box-shadow`
w pętli, parallax, migotanie, animacje przy przewijaniu.

---

## 6. Dostępność

- Widoczny fokus `--focus` (cyjan) na każdym elemencie; pola z własną obwódką fokusu mają ją wyraźną.
- Przyciski ikonowe: `aria-label` i `title`; ikony dekoracyjne `aria-hidden`.
- Linki „Przejdź do treści / notatek” (skip link), jeden `h1` na stronę (w pokoju ukryty wizualnie).
- QR ma `role="img"` i opis z adresem.
- `aria-live="polite"` na czacie, `role="status"` na toaście, `role="alert"` na błędach.
- `overscroll-behavior: contain` w przewijanych panelach i oknach, `touch-action: manipulation` na przyciskach,
  zaznaczony kolor `-webkit-tap-highlight-color`.
- `color-scheme: dark`, `theme-color` `#0D0719`.

---

## 7. Czego nie robimy

- ❌ Jasnego motywu ani przełącznika motywu.
- ❌ Nowych kolorów osób poza ośmioma wyżej.
- ❌ Białego tekstu na różowym, jeśli kontrast spada poniżej 4,5 : 1 (stąd końcówka gradientu `#DB2777`).
- ❌ Odwróconego (jasny na ciemnym) kodu QR.
- ❌ Animowania `filter` i `box-shadow` w nieskończonej pętli.
- ❌ Destrukcyjnej akcji bez okna potwierdzenia i możliwości pobrania notatek przed nią.
- ❌ Zewnętrznych obrazów i czcionek pobieranych bez zgody. Awatary i czcionki są **lokalne**; nie wolno przepiąć awatarów
  na API DiceBear (zapytania do obcego serwisu łamią obietnicę prywatności).

---

## 8. Jak powstał (skille)

- **frontend-design**: plan systemu i sprawdzenie, że wynik jest świadomy; brief (makiety) ma pierwszeństwo.
- **tailwind-design-system**: architektura tokenów w trzech warstwach i nazewnictwo ról. Notas **nie** używa Tailwinda,
  bo ma ręcznie pisany CSS.
- **web-design-guidelines**: audyt kodu (poprawki: transition tylko na transform, safe area, skip link, `h1`, nbsp,
  kontrast, `role="img"` dla QR, linki z Ctrl/Cmd).
- **design-taste-frontend**: tylko ogólne zasady (równe krawędzie, jedno wejście, czytelność). Jego reguły dla stron
  firmowych (m.in. zakaz fioletu) kolidują z makietami, więc jego bramka i skrypty **nie** są uruchamiane.
