import { ReactNode } from 'react'

const base = { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true } as const
const I = (c: ReactNode, size = 18) => (
  <svg {...base} width={size} height={size}>
    {c}
  </svg>
)

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
export const IcCopy = () => I(<><rect x="9" y="9" width="11" height="11" rx="2" /><path d="M5 15V6a2 2 0 0 1 2-2h8" /></>, 20)
export const IcUnderline = () => I(<><path d="M7 4v7a5 5 0 0 0 10 0V4" /><path d="M5 21h14" /></>)
export const IcStrike = () => I(<><path d="M4 12h16" /><path d="M16.5 7.5C16 5.9 14.4 5 12 5c-2.5 0-4 1.1-4 2.9 0 1.2.7 2 2.2 2.6M7.5 16.5c.5 1.6 2.1 2.5 4.5 2.5 2.6 0 4.1-1.2 4.1-3 0-1-.5-1.7-1.5-2.2" /></>)
export const IcBullets = () => I(<><path d="M9 6h11M9 12h11M9 18h11" /><circle cx="4.5" cy="6" r="1" fill="currentColor" /><circle cx="4.5" cy="12" r="1" fill="currentColor" /><circle cx="4.5" cy="18" r="1" fill="currentColor" /></>)
export const IcOrdered = () => I(<><path d="M10 6h10M10 12h10M10 18h10" /><path d="M4 5.2 5.4 4v4.2M4 11.4h2.4L4 14.2h2.6M4 16.6h2.4l-1 1.2c1 0 1.2.5 1.2 1 0 .8-.6 1.2-1.5 1.2-.5 0-.9-.1-1.1-.4" strokeWidth="1.3" /></>)
export const IcCode = () => I(<><path d="m8 8-4 4 4 4M16 8l4 4-4 4M14 5l-4 14" /></>)
export const IcCodeBlock = () => I(<><rect x="3" y="4" width="18" height="16" rx="2" /><path d="m9.5 10-2 2 2 2M14.5 10l2 2-2 2" /></>)
export const IcPlus = ({ size = 34 }: { size?: number }) => I(<><circle cx="12" cy="12" r="9.5" /><path d="M12 7.5v9M7.5 12h9" /></>, size)
export const IcInfo = () => I(<><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8h.01" /></>, 16)
export const IcArrowRight = ({ size = 28 }: { size?: number }) => I(<><path d="M4 12h15M13 6l6 6-6 6" /></>, size)
export const IcHourglass = ({ size = 44 }: { size?: number }) => I(<><path d="M6 3h12M6 21h12" /><path d="M7.5 3c0 5.2 4.5 6 4.5 9s-4.5 3.8-4.5 9M16.5 3c0 5.2-4.5 6-4.5 9s4.5 3.8 4.5 9" /><path d="M9.2 18.5h5.6l-2.8-3z" fill="currentColor" stroke="none" /></>, size)
export const IcFace = () => I(<><circle cx="12" cy="12" r="9" /><path d="M8.5 14.5c.9 1.2 2 1.8 3.5 1.8s2.6-.6 3.5-1.8" /><circle cx="9" cy="10" r="0.9" fill="currentColor" /><circle cx="15" cy="10" r="0.9" fill="currentColor" /></>)
