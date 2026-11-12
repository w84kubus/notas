// Okno edycji awatara: wybór twarzy (siatka, z losowaniem nowych) i koloru.
import { CSSProperties, useState } from 'react'
import { Avatar } from './Avatar'
import { COLORS, COLOR_NAMES, Identity, newFace } from './identity'
import { Dialog } from './RoomMenu'

const OPTIONS = 11 // twarze do wyboru poza aktualną

export function AvatarDialog(props: { identity: Identity; onClose: () => void; onSave: (face: string, color: string) => void }) {
  const { identity } = props
  const [face, setFace] = useState(identity.face)
  const [color, setColor] = useState(identity.color)
  const [options, setOptions] = useState<string[]>(() => [identity.face, ...Array.from({ length: OPTIONS }, newFace)])

  // nowe losowanie zachowuje wybraną twarz na pierwszym miejscu, żeby nie zginęła
  const reroll = () => setOptions([face, ...Array.from({ length: OPTIONS }, newFace)])

  return (
    <Dialog
      title="Twój awatar"
      onClose={props.onClose}
      actions={
        <>
          <button className="btn" onClick={props.onClose}>
            Anuluj
          </button>
          <button className="btn btn-primary" onClick={() => props.onSave(face, color)} data-autofocus>
            Zapisz
          </button>
        </>
      }
    >
      <p className="dialog-text">Wybierz twarz i kolor. Zobaczą je inni w pokoju. Starsze wiadomości zostają z dawnym awatarem.</p>

      <div className="face-preview" style={{ '--c': color } as CSSProperties}>
        <span className="face-box" style={{ width: 96, height: 96 }}>
          <Avatar seed={face} color={color} name={identity.name} size={96} />
        </span>
      </div>

      <div className="face-grid" role="radiogroup" aria-label="Twarz">
        {options.map((o, i) => (
          <button
            key={o}
            type="button"
            role="radio"
            aria-checked={o === face}
            aria-label={`Twarz ${i + 1}`}
            className={`face-pick ${o === face ? 'on' : ''}`}
            onClick={() => setFace(o)}
          >
            <span className="face-box" style={{ width: 52, height: 52 }}>
              <Avatar seed={o} color={color} name={identity.name} size={52} />
            </span>
          </button>
        ))}
      </div>
      <button type="button" className="btn btn-small" onClick={reroll}>
        Losuj nowe twarze
      </button>

      <div className="swatches" role="radiogroup" aria-label="Kolor">
        {COLORS.map((c, i) => (
          <button
            key={c}
            type="button"
            role="radio"
            aria-checked={c === color}
            aria-label={COLOR_NAMES[i]}
            title={COLOR_NAMES[i]}
            className={`swatch ${c === color ? 'on' : ''}`}
            style={{ background: c }}
            onClick={() => setColor(c)}
          />
        ))}
      </div>
    </Dialog>
  )
}
