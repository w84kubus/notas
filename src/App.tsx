import { Suspense, lazy, useEffect, useState } from 'react'
import Home from './Home'
import Privacy from './Privacy'

// edytor ładuje się dopiero w pokoju, strona startowa zostaje lekka
const Room = lazy(() => import('./Room'))

export function navigate(to: string) {
  history.pushState({}, '', to)
  window.scrollTo(0, 0)
  window.dispatchEvent(new PopStateEvent('popstate'))
}

function useLocation() {
  const [loc, setLoc] = useState({ path: location.pathname, search: location.search })
  useEffect(() => {
    const on = () => setLoc({ path: location.pathname, search: location.search })
    window.addEventListener('popstate', on)
    return () => window.removeEventListener('popstate', on)
  }, [])
  return loc
}

export default function App() {
  const { path, search } = useLocation()
  if (path === '/prywatnosc') return <Privacy />
  const m = path.match(/^\/([A-Za-z0-9]{6})\/?$/)
  if (m) {
    const mini = new URLSearchParams(search).get('mini') === '1'
    return (
      <Suspense fallback={null}>
        <Room key={m[1].toUpperCase()} code={m[1].toUpperCase()} mini={mini} />
      </Suspense>
    )
  }
  return <Home />
}
