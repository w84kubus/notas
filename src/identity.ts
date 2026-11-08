const NAMES = ['Sowa', 'Lis', 'Jeż', 'Bóbr', 'Wydra', 'Kruk', 'Żuraw', 'Rys', 'Dzik', 'Łoś', 'Wilk', 'Orzeł', 'Borsuk', 'Sarna']
const COLORS = ['#D9480F', '#1C7ED6', '#2F9E44', '#7048E8', '#B8730A', '#0C8599', '#C2255C', '#4C5C7A']

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
