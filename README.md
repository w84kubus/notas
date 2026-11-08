# Notas

Wspólne notatki na kod pokoju (notas.pl). Bez kont, bez instalacji, z czatem.

## Jak to działa

- Ktoś klika **Utwórz pokój** i dostaje 6-znakowy kod (np. `K7M 2QX`). Reszta wpisuje kod albo otwiera link.
- Wszyscy piszą w jednym dokumencie (Yjs + TipTap). Kursory innych widać na żywo.
- Obok jest czat. Można go wyczyścić jednym kliknięciem (u wszystkich, z opcją „Cofnij”) albo włączyć znikanie wiadomości po 10 minutach.
- Każdy ma losowy **pseudonim**, który zmienia jednym kliknięciem. Żyje tylko w tej karcie.

## Dyskrecja

- **Okno mini**: w Chrome/Edge pływa nad innymi oknami (Document Picture-in-Picture). W innych przeglądarkach otwiera małe okienko. Układ sam przechodzi na zakładki Notatki/Czat przy wąskim oknie.
- **Ukryj (Esc)**: natychmiast biała strona, tytuł karty „Nowa karta”, edytor zablokowany. Esc przywraca.
- Nic nie trafia do `localStorage`. Treść pokoju jest tylko w pamięci serwera. Pokój znika po 12 godzinach bez ruchu (`ROOM_TTL_HOURS`) albo po restarcie serwera.
- Brak analityki i logów treści, nagłówki `no-referrer` i `noindex`.

## Bezpieczeństwo kodów

- Pokój istnieje tylko, jeśli ktoś go utworzył. Wpisanie losowego kodu niczego nie tworzy.
- 10 błędnych kodów w minutę z jednego IP = blokada na 5 minut. Za reverse proxy ustaw `TRUST_PROXY=1`.
- 6 znaków z 31 możliwych to ok. 887 mln kombinacji. Limit prób robi z zgadywania praktycznie nierealny scenariusz.

## Uruchomienie lokalne

```bash
npm install
npm run dev        # http://localhost:8787 (Vite wbudowany w serwer)
npm run build      # buduje dist/
npm start          # produkcja: serwer + dist na jednym porcie (PORT, domyślnie 8787)
```

## Wdrożenie (Fly.io)

Aplikacja potrzebuje długo działającego procesu Node z WebSocketami. **Nie nadaje się do Vercela** (funkcje serverless nie trzymają WebSocketów). W repo są gotowe `Dockerfile` i `fly.toml` (region Warszawa, jedna maszyna, bez usypiania, bo pokoje żyją w pamięci procesu).

```bash
brew install flyctl
fly auth login
fly launch --no-deploy --copy-config   # w fly.toml zmień `app` na własną, unikalną nazwę
fly deploy
fly certs add notas.pl                 # po kupnie domeny, potem ustaw rekordy DNS z instrukcji
```

Ważne:
- **Nie skaluj do 2 maszyn.** Pokoje są w pamięci jednego procesu, druga maszyna miałaby inne pokoje.
- Każdy deploy i restart kasuje wszystkie pokoje (użytkownicy zobaczą „Pokój wygasł” i mogą pobrać notatki).
- `TRUST_PROXY=1` jest ustawione w obrazie, a limit prób korzysta z nagłówka `fly-client-ip`.
- Healthcheck: `GET /healthz`.

## Sprawdzone

- Dwóch klientów w jednym pokoju: tekst, zakreślacz, kursory z pseudonimami, czat, czyszczenie z cofnięciem.
- Okno mini (Document Picture-in-Picture) w prawdziwym Chrome: pisanie, Esc, zakładki, powrót do dużego okna.
- Restart serwera: klient widzi „Pokój wygasł”, może pobrać notatki.
- Limit prób zgadywania kodów (429 po 10 błędach w minutę).
- `npm audit --omit=dev`: 0 podatności (TipTap 3).

## Do zrobienia

- Sprawdzić Firefox/Safari (tam mini okno to zwykłe, małe okienko, bez „zawsze na wierzchu”).
- Przycisk „Zamknij pokój dla wszystkich” (natychmiastowe usunięcie treści z serwera).
- Testy automatyczne (na razie weryfikacja ręczna w przeglądarce).
