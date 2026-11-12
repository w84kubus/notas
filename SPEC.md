# SPEC — Notas

Specyfikacja produktu i serwera. Opisuje stan faktyczny aplikacji.

## 1. Cel i użytkownicy

**Problem.** Ktoś przepisuje notatki z wykładu, a potem trzeba je rozesłać reszcie roku, grupa po
grupie. **Cel:** wspólny notatnik, do którego wchodzi się kodem, bez konta i bez instalowania,
z czatem obok.

**Użytkownicy:** studenci na wykładzie (laptop, często w jednym oknie obok slajdów), czasem telefon.

**Priorytety:** szybko (kilka sekund od pomysłu do pisania), małe (da się zmniejszyć do rogu ekranu),
dyskretne (ukrycie na jeden klawisz), prywatne (bez kont, bez śladów).

**Poza zakresem:** konta i logowanie, trwałe archiwum notatek, historia wersji, role i uprawnienia,
załączniki, głos i wideo, edycja w trybie offline z późniejszą synchronizacją.

## 2. Przepływ użytkownika

1. Wejście na stronę → **Utwórz pokój** (lub wpisanie kodu / otwarcie linku).
2. Pokój: edytor po lewej, czat po prawej (poniżej 720 px: zakładki Notatki / Czat).
3. Pseudonim losowy, zmienialny jednym kliknięciem.
4. **Okno mini** wyciąga pokój do małego, pływającego okna.
5. **Ukryj (`Esc`)** zasłania ekran białą stroną; `Esc` lub kliknięcie przywraca.
6. **Menu pokoju (⋯)**: kod QR, skopiuj link, pobierz notatki, zamknij pokój dla wszystkich.
7. **Zamknij pokój** wymaga potwierdzenia; po nim treść znika z serwera, a wszyscy w pokoju widzą baner
   „Pokój został zamknięty" z przyciskami **Pobierz** i **Na start**.
8. Po 12 godzinach bez ruchu (albo po restarcie serwera) pokój znika — klient pokazuje baner
   „Pokój wygasł" z przyciskami **Pobierz** i **Na start**.

## 3. Model pokoju

Pokój = wpis w pamięci serwera + dokument Yjs. Nic nie jest zapisywane trwale.

| Element | Opis |
|---|---|
| Kod | 6 znaków z alfabetu `ABCDEFGHJKMNPQRSTUVWXYZ23456789` (31 znaków, bez `0 O 1 I L`), ok. 887 mln kombinacji |
| Utworzenie | wyłącznie `POST /api/rooms`; wejście przez WebSocket nigdy nie tworzy pokoju |
| Wygaśnięcie | brak aktywności (zmiana dokumentu, połączenie, rozłączenie) przez `ROOM_TTL_HOURS` (12 h) **i** zero połączeń |
| Pojemność | 30 osób w pokoju, 5000 pokoi na serwer, ładunek WebSocket do 2 MB |

### Dokument Yjs (`Y.Doc`)

| Pole | Typ | Zawartość |
|---|---|---|
| `default` | `Y.XmlFragment` | treść edytora TipTap |
| `chat` | `Y.Array<ChatMsg>` | wiadomości: `id`, `by` (clientID), `name`, `color`, `text` (≤ 500 znaków), `t` (ms) |
| `settings` | `Y.Map` | `ephemeral: boolean` — znikające wiadomości; `closed: boolean` — ustawia **serwer** przy zamknięciu pokoju |

Obecność i kursory to **awareness** Yjs: `user: { name, color }` oraz zaznaczenie edytora.
Czat jest przycinany do 200 ostatnich wiadomości.

## 4. API serwera

| Metoda i ścieżka | Odpowiedź |
|---|---|
| `GET /healthz` | `200 {"ok":true}` |
| `POST /api/rooms` | `201 {"code":"K7M2QX"}`; `429` przy limicie; `503` gdy brak miejsca |
| `GET /api/rooms/:kod` | `200 {"ok":true,"people":n,"expiresInMs":ms}` (ile zostało do wygaśnięcia przy braku ruchu; każda zmiana w pokoju odnawia pełne TTL); `404` dla nieistniejącego lub błędnego kodu; `429` przy blokadzie |
| `DELETE /api/rooms/:kod` | `200 {"ok":true}` i zamknięcie pokoju: serwer wpisuje `closed: true` do mapy `settings` dokumentu (to niezawodny sygnał dla klientów), po ok. 0,4 s kończy każde połączenie kodem WebSocket **4001** i kasuje treść; kod przestaje istnieć natychmiast; `404` brak pokoju; `403` obca domena (`Origin`); `429` blokada |
| `WS /ws/:kod` | protokół `y-websocket`; `404` brak pokoju, `403` obca domena (`Origin`), `429` blokada, `503` pokój pełny |
| `GET /*` | pliki z `dist/`; ścieżka bez rozszerzenia → `index.html` (linki do pokoi) |

Wszystkie odpowiedzi API mają `Cache-Control: no-store`. Kod w ścieżce jest niewrażliwy na wielkość liter.

## 5. Limity i bezpieczeństwo

| Mechanizm | Wartość |
|---|---|
| Błędne kody (HTTP, WS i `DELETE`) | 10 na minutę na adres → blokada 5 min |
| Zakładanie pokoi | 12 na minutę na adres → blokada 2 min |
| `Origin` WebSocketu | musi zgadzać się z nagłówkiem `Host` |
| CSP (produkcja) | `default-src 'self'; connect-src 'self' ws: wss:; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'` |
| Nagłówki | `Referrer-Policy: no-referrer`, `X-Robots-Tag: noindex, nofollow`, `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY` |
| Adres klienta za proxy | `TRUST_PROXY=1`: `fly-client-ip` → `cf-connecting-ip` → `X-Forwarded-For` |
| Ścieżki plików | wyjście poza `dist/` → `400` |

## 6. Interfejs

- **Start:** nagłówek, przycisk „Utwórz pokój", pole kodu, cztery zdania o prywatności.
- **Pokój:** pasek (kod-plakietka kopiująca link, obecni, menu ⋯, okno mini, ukryj), pasek
  formatowania (cofnij, ponów, pogrubienie, kursywa, zakreślacz, nagłówek, listy), edytor,
  czat (pseudonim, znikające wiadomości, wyczyść, lista, pole).
- **Cofanie:** `Ctrl+Z` / `Ctrl+Y` cofają i ponawiają wyłącznie zmiany **tej osoby** (menedżer cofania Yjs);
  przyciski w pasku formatowania robią to samo na telefonie.
- **Kod QR:** okno z kodem QR (SVG, biała karta niezależnie od motywu), kodem pokoju i przyciskiem „Skopiuj link".
- **Edycja awatara:** przycisk z awatarem przy pseudonimie w czacie oraz pozycja „Zmień awatar” w menu ⋯ otwierają okno: podgląd,
  siatka 12 twarzy (jedna to aktualna), „Losuj nowe twarze” i osiem kolorów osób. Zapis zmienia `face` i `color` w tożsamości
  (sessionStorage) i w awarenessie; nowe wiadomości niosą nowy wygląd, starsze zostają z dawnym.
- **Strona `/prywatnosc`:** opis tego, co serwer widzi i czego nie. Zmiana działania serwera wymaga zmiany tego tekstu.
- **Układ:** dwie kolumny od 720 px szerokości *okna* (container query), poniżej zakładki.
- **Okno mini:** Document Picture-in-Picture 380 × 540 w Chrome i Edge; w pozostałych
  przeglądarkach wyskakujące okno z adresem `/KOD?mini=1`.
- **Ukryj:** biała zasłona, tytuł karty „Nowa karta", edytor tylko do odczytu, czat wyłączony.
- **Motyw:** jeden, neonowy ciemny. Szczegóły w [`DESIGN.md`](DESIGN.md).
- **Pasek boczny** (okno ≥ 1100 px): logo, „Znika za” (odliczanie z `expiresInMs`, odświeżane co minutę), kod pokoju z
  przyciskiem kopiowania, QR, karta Panic Mode (`Esc`). W węższych oknach te informacje są w menu ⋯ i górnym pasku.

## 7. Wymagania niefunkcjonalne

- **Wydajność:** ekran startowy ≈ 48 KB (gzip) JS; edytor ładowany dopiero w pokoju.
- **Dostępność:** widoczny fokus, `aria-label` na przyciskach ikonowych, `aria-live` na czacie,
  `role="alert"` na komunikatach o błędach, `prefers-reduced-motion`.
- **Przeglądarki:** aktualne Chrome, Edge, Firefox, Safari. Pływające okno mini tylko w Chromium.
- **Wdrożenie:** jeden proces Node (patrz `CLAUDE.md`, zasada 3), Docker, healthcheck `/healthz`.

## 8. Plan

- [x] Pokoje, edytor, czat, pseudonimy
- [x] Okno mini, ukrywanie, czyszczenie czatu, znikające wiadomości
- [x] Limity, CSP, wygasanie, PWA, TipTap 3, testy serwera, CI
- [x] Wdrożenie na Render
- [x] Cofnij / ponów, menu pokoju, kod QR, „Zamknij pokój dla wszystkich", strona Prywatność
- [x] Podtrzymywanie serwera w ciągu dnia (workflow `keepalive.yml`)
- [ ] Domena notas.pl
- [ ] Testy interfejsu
