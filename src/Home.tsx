import { FormEvent, useEffect, useState } from 'react'
import { navigate } from './App'
import { Backdrop, StepCreate, StepShare, StepTogether } from './art'
import { IcArrowRight, IcInfo, IcPlus } from './icons'

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
      setError('Kod ma 6 znaków, np. K7M-2QX.')
      return
    }
    navigate(`/${c}`)
  }

  return (
    <div className="landing">
      <a className="skip" href="#glowna">
        Przejdź do treści
      </a>
      <Backdrop />

      <main id="glowna" className="landing-grid">
        <section className="hero enter">
          <h1 className="wordmark" data-text="Notas">Notas</h1>
          <p className="tagline">
            Szybki notatnik do wspólnego pisania.
            <br />
            Bez logowania, bez instalacji.
          </p>

          <button className="btn-create" onClick={create} disabled={busy}>
            <span className="btn-create-title">
              <IcPlus size={38} />
              {busy ? 'Tworzę pokój…' : 'Załóż nowy pokój'}
            </span>
            <span className="btn-create-sub">Pokój zniknie po 12 godzinach braku aktywności</span>
          </button>

          <ol className="steps" aria-label="Jak to działa">
            <li className="step">
              <StepCreate />
              <span>
                1. Załóż pokój
                <br />
                (lub wpisz kod)
              </span>
            </li>
            <li className="step-arrow" aria-hidden="true">
              <IcArrowRight />
            </li>
            <li className="step">
              <StepShare />
              <span>2. Udostępnij link / QR</span>
            </li>
            <li className="step-arrow" aria-hidden="true">
              <IcArrowRight />
            </li>
            <li className="step">
              <StepTogether />
              <span>3. Piszcie razem na żywo!</span>
            </li>
          </ol>
        </section>

        <form className="join-card panel neon-green" onSubmit={join} noValidate>
          <h2>Dołącz do pokoju</h2>
          <label className="sr-only" htmlFor="code">
            Kod pokoju, 6 znaków
          </label>
          <input
            id="code"
            className="code-input"
            value={code}
            onChange={(e) => {
              setCode(e.target.value.toUpperCase().slice(0, 8))
              setError('')
            }}
            placeholder="Wpisz 6-znakowy kod"
            autoComplete="off"
            autoCapitalize="characters"
            spellCheck={false}
            aria-describedby="join-error"
          />
          <button className="btn-join" type="submit">
            Wejdź
            <IcArrowRight size={34} />
          </button>
          <p id="join-error" className="error" role="alert">
            {error}
          </p>
        </form>
      </main>

      <p className="hint">
        <IcInfo />
        Działa od razu w przeglądarce
      </p>
      <p className="foot">
        <a
          href="/prywatnosc"
          onClick={(e) => {
            // zwykłe kliknięcie działa jak nawigacja w aplikacji; Ctrl/Cmd/środkowy przycisk zostają przeglądarce
            if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
            e.preventDefault()
            navigate('/prywatnosc')
          }}
        >
          Prywatność
        </a>
      </p>
    </div>
  )
}
