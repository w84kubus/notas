// Ilustracje neonowe (SVG rysowane ręcznie, bez zewnętrznych plików).
import { useId } from 'react'

const line = { fill: 'none', stroke: 'currentColor', strokeWidth: 3, strokeLinecap: 'round', strokeLinejoin: 'round' } as const

/** Okno przeglądarki z kursorem: „Załóż pokój”. */
export function StepCreate() {
  return (
    <svg viewBox="0 0 96 96" aria-hidden="true" style={{ color: '#e879f9', filter: 'drop-shadow(0 0 7px rgba(232,121,249,.85))' }}>
      <rect x="8" y="14" width="80" height="68" rx="9" {...line} />
      <path d="M8 30h80" {...line} />
      <circle cx="19" cy="22" r="1.8" fill="currentColor" />
      <circle cx="27" cy="22" r="1.8" fill="currentColor" />
      <circle cx="35" cy="22" r="1.8" fill="currentColor" />
      <path d="M38 44v25l7-6.5 6 12 6-3-6-11.5H62z" {...line} strokeWidth={2.6} />
    </svg>
  )
}

/** Okno z łańcuchem i globusem: „Udostępnij link / QR”. */
export function StepShare() {
  return (
    <svg viewBox="0 0 96 96" aria-hidden="true" style={{ color: '#d946ef', filter: 'drop-shadow(0 0 7px rgba(217,70,239,.85))' }}>
      <rect x="8" y="12" width="78" height="64" rx="9" {...line} />
      <path d="M8 28h78" {...line} />
      <circle cx="19" cy="20" r="1.8" fill="currentColor" />
      <circle cx="27" cy="20" r="1.8" fill="currentColor" />
      <circle cx="35" cy="20" r="1.8" fill="currentColor" />
      <path d="M34 54a8 8 0 0 0 11 0l6-6a8 8 0 0 0-11-11l-2 2" {...line} strokeWidth={2.6} />
      <path d="M46 46a8 8 0 0 0-11 0l-6 6a8 8 0 0 0 11 11l2-2" {...line} strokeWidth={2.6} />
      <circle cx="70" cy="68" r="15" {...line} fill="#150c2b" strokeWidth={2.6} />
      <path d="M55 68h30M70 53c-6 5-6 25 0 30M70 53c6 5 6 25 0 30" {...line} strokeWidth={2.2} />
    </svg>
  )
}

/** Grupa osób z dymkiem: „Piszcie razem na żywo”. */
export function StepTogether() {
  return (
    <svg viewBox="0 0 96 96" aria-hidden="true" style={{ color: '#f472b6', filter: 'drop-shadow(0 0 7px rgba(244,114,182,.85))' }}>
      <path d="M30 8h36a6 6 0 0 1 6 6v14a6 6 0 0 1-6 6H48l-8 7v-7h-10a6 6 0 0 1-6-6V14a6 6 0 0 1 6-6z" {...line} strokeWidth={2.6} />
      <circle cx="48" cy="52" r="8" {...line} strokeWidth={2.6} />
      <path d="M32 80v-3a10 10 0 0 1 10-10h12a10 10 0 0 1 10 10v3" {...line} strokeWidth={2.6} />
      <circle cx="21" cy="58" r="6.5" {...line} strokeWidth={2.4} />
      <path d="M9 80v-2a8 8 0 0 1 8-8h3" {...line} strokeWidth={2.4} />
      <circle cx="75" cy="58" r="6.5" {...line} strokeWidth={2.4} />
      <path d="M87 80v-2a8 8 0 0 0-8-8h-3" {...line} strokeWidth={2.4} />
    </svg>
  )
}

/** Tło ekranu startowego: sieć linii, węzły i iskry. */
export function Backdrop() {
  const id = useId().replace(/:/g, '')
  return (
    <svg className="backdrop" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <linearGradient id={`${id}l`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#7c3aed" stopOpacity="0" />
          <stop offset="0.5" stopColor="#a855f7" stopOpacity="0.55" />
          <stop offset="1" stopColor="#22d3ee" stopOpacity="0.35" />
        </linearGradient>
        <radialGradient id={`${id}g`}>
          <stop offset="0" stopColor="#67e8f9" stopOpacity="0.9" />
          <stop offset="1" stopColor="#67e8f9" stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* świetlisty ślad w prawym górnym rogu */}
      <path d="M1380 120 1590 -10" stroke={`url(#${id}g)`} strokeWidth="3" strokeLinecap="round" />
      <circle cx="1352" cy="148" r="46" fill={`url(#${id}g)`} opacity="0.55" />
      {/* sieć */}
      <g fill="none" stroke={`url(#${id}l)`} strokeWidth="1.4">
        <path d="M980 900C1040 700 1180 640 1300 610S1520 520 1600 430" />
        <path d="M1060 900C1100 760 1240 700 1330 690S1500 650 1600 560" />
        <path d="M1160 900C1180 800 1290 760 1380 740S1520 720 1600 680" />
        <path d="M900 900C960 780 1040 740 1180 700" />
        <path d="M1240 900C1270 820 1340 790 1420 790" />
        <path d="M1300 610C1330 700 1380 760 1380 900" />
      </g>
      <g>
        <circle cx="1300" cy="610" r="5" fill="#22d3ee" />
        <circle cx="1380" cy="740" r="6" fill="#38bdf8" />
        <circle cx="1180" cy="700" r="4" fill="#a855f7" />
        <circle cx="1520" cy="520" r="3.5" fill="#22d3ee" />
        <circle cx="1330" cy="690" r="3" fill="#f472b6" />
        <circle cx="1420" cy="790" r="3.5" fill="#67e8f9" />
      </g>
      {/* iskry */}
      <g fill="#fff">
        <circle cx="1255" cy="258" r="2.4" fill="#22d3ee" />
        <circle cx="1034" cy="602" r="2" fill="#f472b6" />
        <circle cx="120" cy="760" r="2.2" fill="#c084fc" opacity="0.8" />
        <circle cx="610" cy="80" r="1.8" opacity="0.6" />
        <circle cx="880" cy="200" r="1.6" opacity="0.5" />
        <circle cx="300" cy="860" r="1.8" fill="#22d3ee" opacity="0.7" />
      </g>
    </svg>
  )
}
