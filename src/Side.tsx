// Pasek boczny pokoju (szeroki układ): logo, czas do wygaśnięcia, kod, QR, tryb paniki.
import { IcCopy, IcHourglass } from './icons'
import { useQrSvg } from './RoomMenu'

/** „09h 41m” z liczby milisekund. */
export function fmtLeft(ms: number) {
  const h = Math.floor(ms / 3_600_000)
  const m = Math.floor((ms % 3_600_000) / 60_000)
  return `${String(h).padStart(2, '0')}h ${String(m).padStart(2, '0')}m`
}

export function SideCards(props: { code: string; display: string; left: number; onCopy: () => void; onHide: () => void }) {
  const url = `${location.origin}/${props.code}`
  const svg = useQrSvg(url, 'qr-side')
  return (
    <>
      <p className="wordmark wordmark-sm" aria-hidden="true">
        Notas
      </p>

      <section className="side-card panel neon-violet" aria-label="Czas do wygaśnięcia pokoju">
        <p className="label">Znika za:</p>
        <div className="expire-row">
          <IcHourglass size={44} />
          <p className="expire-time">{fmtLeft(props.left)}</p>
        </div>
      </section>

      <section className="side-card panel neon-violet code-card" aria-label="Kod pokoju">
        <p className="label">Kod pokoju:</p>
        <div className="code-card-row">
          <p className="code-big">{props.display}</p>
          <button className="copy-btn" onClick={props.onCopy} aria-label="Skopiuj link do pokoju" title="Skopiuj link do pokoju">
            <IcCopy />
          </button>
        </div>
      </section>

      <section className="side-card qr-card panel neon-violet" aria-label="Kod QR">
        <div className="qr" role="img" aria-label={`Kod QR prowadzący do ${url}`} dangerouslySetInnerHTML={{ __html: svg }} />
        <p>Skanuj i dołącz</p>
      </section>

      <button className="panic panel neon-red" onClick={props.onHide}>
        <span className="kbd">[Esc]</span>
        <span>
          – Szybki kamuflaż
          <br />
          <small>(Panic Mode)</small>
        </span>
      </button>
    </>
  )
}
