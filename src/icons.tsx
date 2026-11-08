import { ReactNode } from 'react'

const p = { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true } as const
const I = (c: ReactNode) => <svg {...p}>{c}</svg>

export const IcDownload = () => I(<><path d="M12 4v11" /><path d="m7 11 5 5 5-5" /><path d="M5 20h14" /></>)
export const IcMini = () => I(<><rect x="3" y="4" width="18" height="16" rx="2" /><rect x="11" y="12" width="7" height="5" rx="1" fill="currentColor" stroke="none" /></>)
export const IcBack = () => I(<><rect x="3" y="4" width="18" height="16" rx="2" /><path d="m9 15 3-3 3 3" /></>)
export const IcHide = () => I(<><path d="M3 3l18 18" /><path d="M10.6 6.2A9.8 9.8 0 0 1 12 6c5 0 8.5 4 9.5 6a14 14 0 0 1-2.7 3.4M6.5 7.6A14 14 0 0 0 2.5 12c1 2 4.5 6 9.5 6 1.5 0 2.8-.4 4-1" /><path d="M9.9 10a3 3 0 0 0 4.1 4.1" /></>)
export const IcTrash = () => I(<><path d="M4 7h16" /><path d="M10 11v6M14 11v6" /><path d="M6 7l1 13h10l1-13" /><path d="M9 7V4h6v3" /></>)
export const IcTimer = () => I(<><circle cx="12" cy="13" r="8" /><path d="M12 9v4l2.5 2" /><path d="M9 2h6" /></>)
export const IcSend = () => I(<><path d="M4 12 20 4l-4 16-4-6-8-2Z" /></>)
