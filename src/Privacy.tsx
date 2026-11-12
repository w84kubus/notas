import { useEffect } from 'react'
import { navigate } from './App'

// Treść opisuje faktyczne działanie serwera (server/index.js). Zmieniasz kod, zmień i ten tekst.
export default function Privacy() {
  useEffect(() => {
    document.title = 'Prywatność · Notas'
  }, [])

  return (
    <main className="page prose" id="glowna">
      <p className="wordmark" aria-hidden="true">Notas</p>
      <h1>Prywatność</h1>
      <p className="lead">
        Notas nie ma kont. Nie pyta o imię, e-mail ani nic, po czym dałoby się Ciebie rozpoznać. Nie używa ciasteczek,
        analityki ani reklam.
      </p>

      <h2>Co dzieje się z Twoimi notatkami i czatem</h2>
      <ul>
        <li>Żyją <strong>wyłącznie w pamięci serwera</strong>. Nie trafiają na dysk, do bazy danych ani do logów.</li>
        <li>
          Pokój znika razem z całą treścią po <strong>12 godzinach bez ruchu</strong>, po zamknięciu go przez któregoś
          z uczestników albo po restarcie serwera.
        </li>
        <li>Każdy, kto zna kod pokoju, widzi wszystko i może to skopiować. Nie wpisuj tu danych wrażliwych.</li>
      </ul>

      <h2>Pseudonim</h2>
      <p>
        Dostajesz losowy pseudonim i kolor. Widzą je osoby w pokoju. Możesz go zmienić, ale wybierz coś niezwiązanego
        z imieniem i nazwiskiem.
      </p>

      <h2>Adres IP</h2>
      <p>
        Serwer <strong>przez kilka minut, tylko w pamięci</strong>, liczy nieudane próby wpisania kodu i zakładanie pokoi
        z danego adresu. Dzięki temu nie da się zgadywać kodów. Adres nie jest zapisywany ani wiązany z żadnym pokojem.
      </p>

      <h2>Co zostaje w Twojej przeglądarce</h2>
      <ul>
        <li>Pseudonim w pamięci karty (<code>sessionStorage</code>). Znika po jej zamknięciu.</li>
        <li>Pliki aplikacji w pamięci podręcznej (service worker), żeby strona startowała szybciej. Nigdy treść pokoju.</li>
        <li>Nic w <code>localStorage</code>, ciasteczkach ani IndexedDB.</li>
      </ul>

      <h2>Hosting</h2>
      <p>
        Aplikacja działa na platformie Render (region Frankfurt, UE). Dostawca hostingu, jak każdy, może prowadzić własne
        techniczne logi połączeń, na przykład z adresami IP. Aplikacja nie ma na to wpływu.
      </p>

      <h2>Czego nie robimy</h2>
      <p>
        Nie sprzedajemy danych, nie profilujemy, nie wysyłamy niczego do stron trzecich. Czcionki są hostowane razem
        z aplikacją.
      </p>

      <h2>Kontakt</h2>
      <p>
        Administrator: Jakub Bondel, <a href="https://github.com/w84kubus">github.com/w84kubus</a>. Ostatnia
        aktualizacja: 9 listopada 2026.
      </p>

      <button className="btn btn-primary" onClick={() => navigate('/')}>
        Wróć na start
      </button>
    </main>
  )
}
