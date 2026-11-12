// Ilustrowany awatar generowany LOKALNIE w przeglądarce (DiceBear + styl Avataaars, autor: Pablo Stanley).
// Zero zapytań do zewnętrznych serwisów: obraz powstaje z kodu pakietu i trafia do <img> jako data URI.
import { useEffect, useState } from 'react'

type Make = (seed: string, color: string) => string

let maker: Promise<Make> | null = null
const cache = new Map<string, string>()

// biblioteka i styl ładują się leniwie, przy pierwszym awatarze (osobny fragment, poza głównym kodem pokoju)
function load(): Promise<Make> {
  maker ??= Promise.all([import('@dicebear/core'), import('@dicebear/avataaars')]).then(([core, style]) => (seed, color) =>
    core
      .createAvatar(style as any, { seed, backgroundColor: [color.replace('#', '')], radius: 50 })
      .toDataUri(),
  )
  return maker
}

export function Avatar({ seed, color, name, size }: { seed: string; color: string; name: string; size: number }) {
  const key = `${seed}|${color}`
  const [uri, setUri] = useState(() => cache.get(key) ?? '')

  useEffect(() => {
    const hit = cache.get(key)
    if (hit) {
      setUri(hit)
      return
    }
    let off = false
    load()
      .then((make) => {
        const u = make(seed, color)
        cache.set(key, u)
        if (!off) setUri(u)
      })
      .catch(() => {})
    return () => {
      off = true
    }
  }, [key, seed, color])

  // zanim obrazek się wygeneruje (albo gdy się nie uda), zostaje inicjał na kolorowym kółku
  return uri ? (
    <img className="face" src={uri} width={size} height={size} alt="" />
  ) : (
    <span className="face initial" aria-hidden="true">
      {name.charAt(0).toUpperCase()}
    </span>
  )
}
