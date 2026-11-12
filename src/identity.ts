const NAMES = ['Sowa', 'Lis', 'Jeż', 'Bóbr', 'Wydra', 'Kruk', 'Żuraw', 'Rys', 'Dzik', 'Łoś', 'Wilk', 'Orzeł', 'Borsuk', 'Sarna']
// Jasne neony: ciemny tekst (#140a26) na nich ma kontrast >= 6,8 : 1, a one same na ciemnym panelu >= 7 : 1.
export const COLORS = ['#FF5FB0', '#4ADE80', '#38BDF8', '#FFA94D', '#B794F6', '#FACC15', '#FB7185', '#5EEAD4']
export const COLOR_NAMES = ['różowy', 'zielony', 'błękitny', 'pomarańczowy', 'fioletowy', 'żółty', 'koralowy', 'turkusowy']
export const newFace = () => Math.random().toString(36).slice(2, 10)

// `face` to ziarno awatara: stałe przez całą kartę, więc zmiana pseudonimu nie zmienia twarzy.
export type Identity = { name: string; color: string; face: string }


const KEY = 'notas-tozsamosc'

function pick<T>(a: T[]): T {
  return a[Math.floor(Math.random() * a.length)]
}

// Tożsamość żyje tylko w tej karcie (sessionStorage) – po zamknięciu karty znika.
export function loadIdentity(): Identity {
  try {
    const raw = sessionStorage.getItem(KEY)
    if (raw) {
      const v = JSON.parse(raw)
      if (v?.name && v?.color) {
        if (!v.face) {
          v.face = newFace()
          saveIdentity(v)
        }
        return v
      }
    }
  } catch {}
  const id = { name: `${pick(NAMES)} ${Math.floor(Math.random() * 90) + 10}`, color: pick(COLORS), face: newFace() }
  saveIdentity(id)
  return id
}

export function saveIdentity(id: Identity) {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(id))
  } catch {}
}
