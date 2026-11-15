/** Zeitwerk logo mark (lane 03 geometry = live header SVG) + wordmark. Bars are separate paths so they can move (translateX only). */
export function Mark({ size = 28, className = '', title, dark = false }: { size?: number; className?: string; title?: string; dark?: boolean }) {
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} className={className} role={title ? 'img' : undefined} aria-hidden={title ? undefined : true} aria-label={title}>
      <path d="M55 40 L45 60" stroke={dark ? '#5C5C5C' : '#ccc'} strokeWidth="2" fill="none" />
      <path className="b1" d="M20 20 H60 L50 40 H10 Z" fill="currentColor" />
      <path className="b2" d="M50 60 H90 L80 80 H40 Z" fill="#E2000F" />
    </svg>
  )
}

export function Logo({ dark = false }: { dark?: boolean }) {
  return (
    <span className="logo">
      <Mark size={34} dark={dark} />
      <span>Zeitwerk</span>
    </span>
  )
}
