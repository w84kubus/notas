const NAMES = ['Sowa', 'Lis', 'Jeż', 'Bóbr', 'Wydra', 'Kruk', 'Żuraw', 'Rys', 'Dzik', 'Łoś', 'Wilk', 'Orzeł', 'Borsuk', 'Sarna']
// Jasne neony: ciemny tekst (#140a26) na nich ma kontrast >= 6,8 : 1, a one same na ciemnym panelu >= 7 : 1.
const COLORS = ['#FF5FB0', '#4ADE80', '#38BDF8', '#FFA94D', '#B794F6', '#FACC15', '#FB7185', '#5EEAD4']

export type Identity = { name: string; color: string }

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
      if (v?.name && v?.color) return v
    }
  } catch {}
  const id = { name: `${pick(NAMES)} ${Math.floor(Math.random() * 90) + 10}`, color: pick(COLORS) }
  saveIdentity(id)
  return id
}

export function saveIdentity(id: Identity) {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(id))
  } catch {}
}
