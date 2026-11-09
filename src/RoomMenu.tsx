// Menu pokoju (⋯) oraz okna dialogowe: kod QR i zamknięcie pokoju.
import { ReactNode, useEffect, useRef, useState } from 'react'
import { IcMore } from './icons'

export type MenuItem = { label: string; icon: ReactNode; run: () => void; danger?: boolean; separatorBefore?: boolean }

/* ------------------------- menu ------------------------- */

export function RoomMenu({ items }: { items: MenuItem[] }) {
  const [open, setOpen] = useState(false)
  const wrap = useRef<HTMLDivElement>(null)

  // klik poza menu je zamyka (w oknie, w którym menu faktycznie jest: główne albo mini)
  useEffect(() => {
    if (!open) return
    const doc = wrap.current?.ownerDocument ?? document
    const away = (e: Event) => {
      if (!wrap.current?.contains(e.target as Node)) setOpen(false)
    }
    doc.addEventListener('pointerdown', away)
    return () => doc.removeEventListener('pointerdown', away)
  }, [open])

  useEffect(() => {
    if (open) wrap.current?.querySelector<HTMLElement>('[role="menuitem"]')?.focus()
  }, [open])

  return (
    <div
      className="menu-wrap"
      ref={wrap}
      onKeyDown={(e) => {
        // Esc zamyka menu, a nie ukrywa całego ekranu
        if (e.key === 'Escape' && open) {
          e.stopPropagation()
          setOpen(false)
          wrap.current?.querySelector<HTMLElement>('.menu-btn')?.focus()
        }
      }}
    >
      <button
        className="icon-btn menu-btn"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Menu pokoju"
        title="Menu pokoju"
      >
        <IcMore />
      </button>
      {open && (
        <div className="menu" role="menu">
          {items.map((it) => (
            <div key={it.label} className="menu-row">
              {it.separatorBefore && <hr className="menu-sep" />}
              <button
                role="menuitem"
                className={`menu-item ${it.danger ? 'danger' : ''}`}
                onClick={() => {
                  setOpen(false)
                  it.run()
                }}
              >
                {it.icon}
                <span>{it.label}</span>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/* ------------------------- okno dialogowe ------------------------- */

export function Dialog(props: { title: string; onClose: () => void; children: ReactNode; actions: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    ref.current?.querySelector<HTMLElement>('[data-autofocus]')?.focus()
  }, [])

  return (
    <div
      className="dialog-backdrop"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) props.onClose()
      }}
    >
      <div
        className="dialog"
        role="dialog"
        aria-modal="true"
        aria-label={props.title}
        ref={ref}
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            e.stopPropagation() // Esc zamyka okno, nie ukrywa ekranu
            props.onClose()
          } else if (e.key === 'Tab') {
            // fokus zostaje w oknie
            const f = [...(ref.current?.querySelectorAll<HTMLElement>('button, [href], input') ?? [])].filter((n) => !n.hasAttribute('disabled'))
            if (!f.length) return
            const first = f[0]
            const last = f[f.length - 1]
            const active = ref.current?.ownerDocument.activeElement
            if (e.shiftKey && active === first) {
              e.preventDefault()
              last.focus()
            } else if (!e.shiftKey && active === last) {
              e.preventDefault()
              first.focus()
            }
          }
        }}
      >
        <h2>{props.title}</h2>
        {props.children}
        <div className="dialog-actions">{props.actions}</div>
      </div>
    </div>
  )
}

/* ------------------------- kod QR ------------------------- */

export function QrDialog({ code, display, onClose, onCopy }: { code: string; display: string; onClose: () => void; onCopy: () => void }) {
  const url = `${location.origin}/${code}`
  const [svg, setSvg] = useState('')

  // biblioteka QR ładuje się dopiero przy otwarciu okna
  useEffect(() => {
    let off = false
    import('qrcode')
      .then((m) => ((m as any).default ?? m).toString(url, { type: 'svg', margin: 1, color: { dark: '#18212C', light: '#FFFFFF' } }) as Promise<string>)
      .then((s) => !off && setSvg(s))
      .catch(() => {})
    return () => {
      off = true
    }
  }, [url])

  return (
    <Dialog
      title="Kod QR do pokoju"
      onClose={onClose}
      actions={
        <>
          <button className="btn" onClick={onCopy}>
            Skopiuj link
          </button>
          <button className="btn btn-primary" onClick={onClose} data-autofocus>
            Gotowe
          </button>
        </>
      }
    >
      <p className="dialog-text">Zeskanuj telefonem albo przepisz kod. Pokój nie ma hasła: wejść może każdy, kto zna kod, więc pokaż go tylko tym, z którymi chcesz pisać.</p>
      <div className="qr" aria-label={`Kod QR prowadzący do ${url}`} dangerouslySetInnerHTML={{ __html: svg }} />
      <p className="qr-code">{display}</p>
    </Dialog>
  )
}

/* ------------------------- zamknięcie pokoju ------------------------- */

export function CloseRoomDialog(props: { busy: boolean; onClose: () => void; onConfirm: () => void; onDownload: () => void }) {
  return (
    <Dialog
      title="Zamknąć pokój dla wszystkich?"
      onClose={props.onClose}
      actions={
        <>
          <button className="btn" onClick={props.onDownload}>
            Pobierz notatki
          </button>
          <button className="btn" onClick={props.onClose} data-autofocus>
            Anuluj
          </button>
          <button className="btn btn-danger" onClick={props.onConfirm} disabled={props.busy}>
            {props.busy ? 'Zamykam…' : 'Zamknij pokój'}
          </button>
        </>
      }
    >
      <p className="dialog-text">Notatki i czat znikną u wszystkich, od razu i bezpowrotnie. Pobierz notatki, jeśli chcesz je zachować.</p>
    </Dialog>
  )
}
