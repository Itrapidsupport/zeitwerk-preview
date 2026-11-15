/** Six-stage "clock track": six ticks on an arc, a red escapement marker on the active stage. No text. */
export function Dial({ step, total = 6, dark }: { step: number; total?: number; dark?: boolean }) {
  const ink = dark ? '#fff' : '#171717'
  const dim = dark ? 'rgba(255,255,255,.18)' : 'rgba(23,23,23,.16)'
  const cx = 200, cy = 200, r = 150
  const ang = (i: number) => Math.PI * (1.1 + (0.8 * i) / (total - 1))
  return (
    <svg viewBox="0 0 400 300" aria-hidden fill="none" style={{ width: '100%', height: '100%' }}>
      <path d={`M${cx + r * Math.cos(ang(0))} ${cy + r * Math.sin(ang(0))} A${r} ${r} 0 0 1 ${cx + r * Math.cos(ang(total - 1))} ${cy + r * Math.sin(ang(total - 1))}`} stroke={dim} />
      {Array.from({ length: total }, (_, i) => {
        const a = ang(i)
        const on = i <= step
        return <line key={i} x1={cx + (r - 14) * Math.cos(a)} y1={cy + (r - 14) * Math.sin(a)} x2={cx + (r + 14) * Math.cos(a)} y2={cy + (r + 14) * Math.sin(a)} stroke={i === step ? '#E2000F' : on ? ink : dim} strokeWidth={i === step ? 4 : 1.5} />
      })}
      <g style={{ transform: `rotate(${(ang(step) * 180) / Math.PI + 90}deg)`, transformOrigin: `${cx}px ${cy}px`, transition: 'transform .8s cubic-bezier(0.7,0,0.2,1)' }}>
        <line x1={cx} y1={cy} x2={cx} y2={cy - r + 30} stroke={ink} strokeWidth="1.5" />
        <path d={`M${cx - 16} ${cy - r + 40} H${cx + 12} L${cx + 6} ${cy - r + 52} H${cx - 22} Z`} fill="#E2000F" />
      </g>
      <circle cx={cx} cy={cy} r="5" fill={ink} />
      <line x1="40" y1="270" x2="360" y2="270" stroke={dim} />
      <rect x="40" y="268" width={(320 * (step + 1)) / total} height="4" fill="#E2000F" style={{ transition: 'width .8s cubic-bezier(0.7,0,0.2,1)' }} />
    </svg>
  )
}

/** Parse "~$80K" / "17,968" / "98%" into Counter parts; null when not a plain number. */
export function parseFigure(v: string) {
  const m = v.match(/^([^\d]*)([\d][\d,]*(?:\.\d+)?)(.*)$/)
  if (!m) return null
  return { prefix: m[1], value: Number(m[2].replace(/,/g, '')), suffix: m[3] }
}
