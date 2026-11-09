import { FormEvent, useEffect, useState } from 'react'
import { navigate } from './App'

export default function Home() {
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    document.title = 'Notas'
  }, [])

  async function create() {
    setBusy(true)
    setError('')
    try {
      const r = await fetch('/api/rooms', { method: 'POST' })
      if (r.status === 429) throw new Error('Za dużo nowych pokoi naraz. Spróbuj za chwilę.')
      if (!r.ok) throw new Error('Serwer jest pełny. Spróbuj za kilka minut.')
      const { code } = await r.json()
      navigate(`/${code}`)
    } catch (e) {
      setError(e instanceof TypeError ? 'Brak połączenia z serwerem.' : (e as Error).message)
    } finally {
      setBusy(false)
    }
  }

  function join(e: FormEvent) {
    e.preventDefault()
    const c = code.replace(/[^A-Za-z0-9]/g, '').toUpperCase()
    if (c.length !== 6) {
      setError('Kod ma 6 znaków, np. K7M 2QX.')
      return
    }
    navigate(`/${c}`)
  }

  return (
    <main className="home">
      <p className="brand">Notas<span>.pl</span></p>
      <h1>Piszcie razem.<br />Bez kont.</h1>
      <p className="lead">
        Utwórz pokój, podaj innym sześć znaków i piszcie w jednym dokumencie. Czat jest obok.
      </p>

      <button className="btn btn-primary btn-big" onClick={create} disabled={busy}>
        {busy ? 'Tworzę pokój…' : 'Utwórz pokój'}
      </button>

      <form className="join" onSubmit={join}>
        <label htmlFor="code">Masz kod? Wpisz go tutaj</label>
        <div className="join-row">
          <input
            id="code"
            className="code-input"
            value={code}
            onChange={(e) => {
              setCode(e.target.value.toUpperCase().slice(0, 8))
              setError('')
            }}
            placeholder="K7M 2QX"
            autoComplete="off"
            autoCapitalize="characters"
            spellCheck={false}
            inputMode="text"
            aria-describedby="join-error"
          />
          <button className="btn btn-big" type="submit">
            Wejdź
          </button>
        </div>
        <p id="join-error" className="error" role="alert">
          {error}
        </p>
      </form>

      <ul className="facts">
        <li>Bez rejestracji. Dostajesz losowy pseudonim, który możesz zmienić.</li>
        <li>Nic nie zapisuje się w przeglądarce. Pobierz notatki, zanim wyjdziesz.</li>
        <li>Pokój znika po 12 godzinach bez ruchu.</li>
        <li>Okno można zmniejszyć do małego, pływającego nad innymi.</li>
      </ul>

      <p className="foot">
        <a
          href="/prywatnosc"
          onClick={(e) => {
            e.preventDefault()
            navigate('/prywatnosc')
          }}
        >
          Prywatność
        </a>
      </p>
    </main>
  )
}
