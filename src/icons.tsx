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
export const IcMore = () => I(<><circle cx="5" cy="12" r="1.4" fill="currentColor" /><circle cx="12" cy="12" r="1.4" fill="currentColor" /><circle cx="19" cy="12" r="1.4" fill="currentColor" /></>)
export const IcQr = () => I(<><rect x="4" y="4" width="6" height="6" rx="1" /><rect x="14" y="4" width="6" height="6" rx="1" /><rect x="4" y="14" width="6" height="6" rx="1" /><path d="M14 14h2v2h-2zM18 14h2v2M14 18h2M18 18h2v2h-2z" /></>)
export const IcLink = () => I(<><path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1" /><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" /></>)
export const IcUndo = () => I(<><path d="M9 14 4 9l5-5" /><path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11" /></>)
export const IcRedo = () => I(<><path d="m15 14 5-5-5-5" /><path d="M20 9H9.5a5.5 5.5 0 0 0 0 11H13" /></>)
export const IcClose = () => I(<><circle cx="12" cy="12" r="9" /><path d="m9 9 6 6M15 9l-6 6" /></>)
