# DESIGN.md — system wizualny „Zakreślacz"

Ten plik jest **jedynym źródłem prawdy o wyglądzie aplikacji**. Każdy nowy komponent używa
tokenów i receptur stąd. Nie wymyślaj własnych kolorów, cieni ani promieni. Tokeny żyją
w `:root` w `src/styles.css`.

---

## 0. Kierunek

Papier i atrament, a jedyny kolor to **żółty zakreślacz** — tak jak w zeszycie studenta.
Spokojne, chłodne tło (jak kartka w świetle sali wykładowej), czarno-granatowy tekst i jeden
akcent, który wskazuje „tu jest to ważne": kod pokoju, aktywna zakładka, główny przycisk,
zakreślony fragment notatek.

Aplikacja ma **nie rzucać się w oczy** — używa się jej w sali, obok slajdów, często w małym
oknie. Dlatego: zero gradientów, zero cieni dekoracyjnych, zero animacji bez powodu.

**Element sygnaturowy:** żółta plakietka z kodem pokoju (`.code-chip`) w lewym górnym rogu.
To jedyna plama koloru w całym pokoju i zarazem najważniejsza informacja.

---

## 1. Tokeny

### Kolory — jasny motyw (domyślny)

| Token | Wartość | Użycie |
|---|---|---|
| `--paper` | `#EDF0F3` | tło aplikacji, paski, czat |
| `--card` | `#FFFFFF` | powierzchnia edytora, pola tekstowe |
| `--ink` | `#18212C` | tekst, obramowania aktywnych elementów |
| `--ink-2` | `#566172` | tekst drugorzędny, podpowiedzi, nieaktywne zakładki |
| `--line` | `#D3D9E0` | cienkie linie podziału |
| `--hl` | `#FFE45C` | **akcent**: zakreślacz, kod pokoju, główny przycisk, aktywna zakładka |
| `--on-hl` | `#18212C` | tekst na akcencie (zawsze ciemny, w obu motywach) |
| `--danger` | `#B3261E` | błędy, baner „brak połączenia" |

### Kolory — ciemny motyw (`prefers-color-scheme: dark`)

| Token | Wartość |
|---|---|
| `--paper` | `#141A22` |
| `--card` | `#1B232D` |
| `--ink` | `#E8ECF1` |
| `--ink-2` | `#9AA6B5` |
| `--line` | `#2B3541` |
| `--hl` | `#FFE45C` (bez zmian) |
| `--danger` | `#FF8A80` |

Akcent jest ten sam w obu motywach, a tekst na nim zawsze ciemny. Motyw wynika z ustawień
systemu — **nie ma przełącznika**.

### Kolory osób

Każda osoba dostaje jeden z ośmiu kolorów (kropka przy pseudonimie, awatar, kursor, imię na czacie):

`#C2410C` `#1D63C4` `#2B7A3D` `#7048E8` `#A15C07` `#0E7490` `#C2255C` `#4C5C7A`

Wszystkie dają kontrast **≥ 5,2 : 1** z białym tekstem (etykieta kursora, inicjał w awatarze).
Imię na czacie jest rysowane kolorem osoby **zmieszanym z `--ink`** (`color-mix(in srgb, var(--c) 60%, var(--ink))`),
więc w jasnym motywie robi się ciemniejsze, a w ciemnym jaśniejsze — ≥ 5,6 : 1 w obu. Sam kolor
bez domieszki nie przeszedłby kontrastu na obu tłach naraz.

---

### Promienie i wymiary

| Token | Wartość | Użycie |
|---|---|---|
| `--radius` | `10px` | przyciski, plakietka kodu, toast |
| mały | `7–8px` | przyciski narzędziowe, pola w czacie |
| pełny | `50%` | awatary, kropki |
| cel dotyku | min. `34–36px` | przyciski ikonowe i narzędziowe |
| wysokość paska | ~`55px` | górny pasek pokoju |

---

## 2. Typografia

**Jedna rodzina: Schibsted Grotesk** (zmienna, hostowana lokalnie przez Fontsource), z awaryjnym
`system-ui`. Ma `latin-ext`, więc Ą Ć Ę Ł Ń Ó Ś Ź Ż są w kroju, a nie podstawiane.

| Rola | Rozmiar | Waga | Uwagi |
|---|---|---|---|
| Nagłówek startu (`h1`) | `clamp(2.5rem, 9vw, 4.2rem)` | 760 | `letter-spacing: -0.035em`, `line-height: 1.02` |
| Znak „Notas.pl" | `1.15rem` | 800 (`.pl` — 600, `--ink-2`) | |
| Kod pokoju (plakietka) | `1.05rem` | 750 | `letter-spacing: 0.12em`, cyfry tabelaryczne |
| Kod w polu wpisywania | `1.7rem` | 700 | `letter-spacing: 0.16em`, wielkie litery |
| Tekst notatek | `1.02rem` (≥ 720 px: `1.08rem`) | 400 | `line-height: 1.65` |
| Nagłówek w notatkach (`h2`) | `1.3rem` | bold | `line-height: 1.25` |
| Interfejs | `0.92–1rem` | 400–650 | |

Długość linii w edytorze jest ograniczona marginesami do ok. 70 znaków.

---

## 3. Układ

- **Dwa układy, jeden komponent.** Pokój (`.room`) ma `container-type: inline-size` i reaguje na
  szerokość **własnego okna**, nie urządzenia.
  - `≥ 720px` — notatki i czat obok siebie (czat 21 rem), zakładki ukryte.
  - `< 720px` — jedna kolumna, dolne zakładki **Notatki / Czat**, licznik nieprzeczytanych.
- Wysokość pokoju to `100dvh` (nie `100vh`).
- Start (`.home`) jest wyrównany do lewej, `max-width: 34rem`, z lewym marginesem rosnącym z szerokością.
- Pasek pokoju: plakietka kodu · obecni · (rozpórka) · pobierz · okno mini · ukryj.

---

## 4. Komponenty

### Plakietka kodu (`.code-chip`)
Żółte tło, ciemny tekst, kropka stanu połączenia (zielona / bursztynowa / czerwona). Klik kopiuje link.

### Przyciski
- `.btn` — obrys `1.5px solid var(--ink)`, przezroczyste tło, wysokość 44 px.
- `.btn-primary` — wypełnienie `--hl`, bez obrysu. **Jeden na ekran.**
- `.icon-btn` — kwadrat 36 px, bez obrysu, tło tylko przy hover; `.is-on` = żółte tło.

### Pasek formatowania (`.tool`)
Przyciski 32 px. Aktywny = odwrócone kolory (`--ink` na `--paper`). Zakreślacz ma stale
półprzezroczysty żółty podkład, a aktywny — pełny żółty z obrysem `--ink`.

### Zakreślony tekst (`mark`)
`background: var(--hl)`, `color: var(--on-hl)`, promień 3 px. To ten sam żółty co w interfejsie — celowo.

### Czat
Wiadomość = lewa kreska 3 px (`--line`; u siebie `--hl`) + imię w kolorze osoby (pogrubione) + treść.
Bez dymków i bez godzin. Pusty czat mówi, co można zrobić: „Tu pojawią się wiadomości. Możesz je
wyczyścić jednym kliknięciem."

### Kursor współpracy
Pionowa kreska 2 px w kolorze osoby; etykieta z imieniem nad nią (11 px, 650, biały tekst).

### Toast
Ciemna plakietka na dole (`--ink` na `--paper`), akcja („Cofnij") w kolorze `--hl`, znika po 2,2 s
(z akcją po 7 s). Rola `status`.

### Baner błędu (`.offline`)
Pasek `--danger` pod nagłówkiem. „Pokój wygasł" ma dwa przyciski obrysowane (Pobierz, Na start).

### Zasłona „Ukryj" (`.cover`)
Czysto biała, `position: fixed; inset: 0`, `z-index: 100`. **Zawsze biała**, także w ciemnym
motywie — ma wyglądać jak pusta strona, a nie jak aplikacja z wyłączonym ekranem.

---

## 5. Ruch

Prawie żaden. Jedyne przejście to `background-color 0.12s` na przyciskach (tylko gdy
`prefers-reduced-motion: no-preference`). Bez animacji wejścia, bez konfetti, bez „skeletonów".

---

## 6. Dostępność

- Widoczny fokus: `outline: 2px solid var(--ink); outline-offset: 2px` na każdym elemencie.
- Każdy przycisk ikonowy ma `aria-label` i `title`.
- Przyciski przełączane (`aria-pressed`): formatowanie, znikające wiadomości.
- Czat: `aria-live="polite"`. Błędy: `role="alert"`. Toast: `role="status"`.
- Kontrast (policzony, nie zgadywany): `--ink` na `--paper` 14,2 : 1 (jasny) i 14,7 : 1 (ciemny); `--on-hl` na `--hl` 12,8 : 1; `--ink-2` na `--paper` 5,5 : 1 (jasny) i 7,1 : 1 (ciemny); biały tekst na `--danger` 6,5 : 1.
- Układ sprawdzony od szerokości okna 380 px (okno mini).

---

## 7. Czego nie robimy

- ❌ Gradientów, cieni dekoracyjnych, szkła, rozmyć.
- ❌ Drugiego koloru akcentu. Żółty jest jeden.
- ❌ Przełącznika motywu — wynika z systemu.
- ❌ Fontów bez `latin-ext`.
- ❌ Zapisywania preferencji w `localStorage` (patrz `CLAUDE.md`, zasada 4).
- ❌ Nowych kolorów osób poza ośmioma wyżej.
