/**
 * Procedural ink/red visuals: the intentional stand-ins for AI imagery/video until lane 05/11 media lands
 * (MediaSlot swaps them out automatically when a manifest entry exists). Pure SVG + CSS keyframes
 * (transform/opacity only); paused off-screen; frozen under reduced motion. No text, no numbers.
 */
import type { ReactNode } from 'react'

export type Variant = 'hero' | 'receptionist' | 'quote' | 'invoice' | 'inbox' | 'document' | 'reporting' | 'map' | 'sms' | 'gears' | 'gta'

const R = '#E2000F'

function gearPath(cx: number, cy: number, r: number, teeth: number, depth = 6) {
  const pts: string[] = []
  for (let i = 0; i < teeth * 2; i++) {
    const a = (i / (teeth * 2)) * Math.PI * 2
    const rr = i % 2 ? r - depth : r
    const a2 = ((i + 1) / (teeth * 2)) * Math.PI * 2
    pts.push(`${(cx + rr * Math.cos(a)).toFixed(1)},${(cy + rr * Math.sin(a)).toFixed(1)}`)
    pts.push(`${(cx + rr * Math.cos(a2)).toFixed(1)},${(cy + rr * Math.sin(a2)).toFixed(1)}`)
  }
  return `M${pts.join('L')}Z`
}

const S = ({ children, light }: { children: ReactNode; light?: boolean }) => (
  <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" aria-hidden fill="none" stroke={light ? '#171717' : '#fff'} strokeWidth="1">
    {children}
  </svg>
)

export function Schematic({ variant, light }: { variant: Variant; light?: boolean }) {
  const ink = light ? '#171717' : '#fff'
  const dim = light ? 'rgba(23,23,23,.18)' : 'rgba(255,255,255,.16)'
  switch (variant) {
    case 'receptionist':
      return (
        <S light={light}>
          <line x1="40" y1="150" x2="360" y2="150" stroke={dim} />
          {Array.from({ length: 32 }, (_, i) => (
            <rect key={i} x={48 + i * 10} y={150 - (18 + ((i * 37) % 60))} width="4" height={(18 + ((i * 37) % 60)) * 2} fill={i === 14 ? R : ink} stroke="none" className="anim-wave" style={{ animationDelay: `${(i % 8) * 0.11}s`, opacity: i === 14 ? 1 : 0.85 }} />
          ))}
          <path d="M40 250 H200 L190 266 H30 Z" fill={R} stroke="none" className="anim-slide" style={{ ['--dx' as string]: '150px' }} />
        </S>
      )
    case 'quote':
      return (
        <S light={light}>
          <rect x="120" y="36" width="160" height="228" stroke={ink} />
          {[70, 90, 110, 150, 170, 190].map((y, i) => (
            <line key={y} x1="140" x2={i % 3 === 2 ? 210 : 260} y1={y} y2={y} stroke={ink} className="anim-cycle" style={{ animationDelay: `${i * 0.35}s` }} />
          ))}
          <rect x="140" y="222" width="70" height="20" fill={R} stroke="none" className="anim-cycle" style={{ animationDelay: '2.3s' }} />
          <line x1="20" y1="120" x2="120" y2="120" stroke={dim} />
          <line x1="280" y1="232" x2="380" y2="232" stroke={dim} />
        </S>
      )
    case 'invoice':
      return (
        <S light={light}>
          <line x1="30" y1="150" x2="370" y2="150" stroke={ink} />
          {[50, 120, 190, 260, 330].map((x, i) => (
            <g key={x}>
              <line x1={x} x2={x} y1="138" y2="162" stroke={ink} />
              <rect x={x - 18} y={i % 2 ? 176 : 94} width="36" height="24" stroke={dim} />
            </g>
          ))}
          <path d="M22 138 H62 L54 162 H14 Z" fill={R} stroke="none" className="anim-slide" style={{ ['--dx' as string]: '300px', animationDuration: '6s' }} />
        </S>
      )
    case 'inbox':
      return (
        <S light={light}>
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <rect key={i} x="40" y={44 + i * 36} width="150" height="24" stroke={i === 1 ? R : ink} className="anim-slide" style={{ ['--dx' as string]: `${170 - (i % 3) * 10}px`, animationDelay: `${i * 0.4}s`, animationDuration: '6s' }} />
          ))}
          {[0, 1, 2, 3].map((i) => (
            <line key={i} x1="230" x2="370" y1={60 + i * 60} y2={60 + i * 60} stroke={i === 0 ? R : dim} />
          ))}
        </S>
      )
    case 'document':
      return (
        <S light={light}>
          <rect x="110" y="30" width="180" height="240" stroke={ink} />
          {[60, 80, 100, 140, 160, 200, 220].map((y, i) => (
            <line key={y} x1="130" x2={i % 2 ? 230 : 270} y1={y} y2={y} stroke={dim} />
          ))}
          {[[128, 52, 120, 18], [128, 132, 90, 18], [128, 192, 140, 18]].map(([x, y, w, h], i) => (
            <rect key={i} x={x} y={y} width={w} height={h} stroke={R} className="anim-blink" style={{ animationDelay: `${i * 0.5}s` }} />
          ))}
          <rect x="100" y="30" width="200" height="2" fill={R} stroke="none" className="anim-scan" style={{ ['--scan' as string]: '236px' }} />
        </S>
      )
    case 'reporting':
      return (
        <S light={light}>
          <line x1="40" y1="250" x2="360" y2="250" stroke={ink} />
          {Array.from({ length: 10 }, (_, i) => (
            <rect key={i} x={52 + i * 31} y={250 - (50 + ((i * 53) % 150))} width="18" height={50 + ((i * 53) % 150)} fill={i === 6 ? R : ink} stroke="none" className="anim-grow" style={{ animationDelay: `${i * 0.12}s`, opacity: i === 6 ? 1 : 0.9 }} />
          ))}
          <polyline points="40,120 100,96 160,110 220,70 280,82 360,40" stroke={dim} />
        </S>
      )
    case 'map':
      return (
        <S light={light}>
          {Array.from({ length: 9 }, (_, i) => <line key={'h' + i} x1="0" x2="400" y1={i * 36} y2={i * 36 + 14} stroke={dim} />)}
          {Array.from({ length: 12 }, (_, i) => <line key={'v' + i} y1="0" y2="300" x1={i * 36} x2={i * 36 - 20} stroke={dim} />)}
          {Array.from({ length: 34 }, (_, i) => {
            const x = 30 + ((i * 97) % 340)
            const y = 30 + ((i * 61) % 240)
            return <rect key={i} x={x} y={y} width="5" height="5" fill={i === 11 ? R : ink} stroke="none" className="anim-blink" style={{ animationDelay: `${(i % 9) * 0.2}s` }} />
          })}
          <circle cx="127" cy="113" r="22" stroke={R} />
        </S>
      )
    case 'sms':
      return (
        <S light={light}>
          {[0, 1, 2, 3].map((i) => (
            <path key={i} d={i % 2 ? `M${210} ${50 + i * 52} H350 V${86 + i * 52} H226 Z` : `M50 ${50 + i * 52} H190 L174 ${86 + i * 52} H50 Z`} stroke={i === 3 ? R : ink} fill={i === 3 ? R : 'none'} className="anim-cycle" style={{ animationDelay: `${i * 0.6}s`, animationDuration: '7s' }} />
          ))}
          <line x1="20" y1="270" x2="380" y2="270" stroke={dim} />
        </S>
      )
    case 'gta':
      return <Gta light={light} />
    case 'gears':
    case 'hero':
    default:
      return (
        <S light={light}>
          <g className="anim-spin" style={{ ['--d' as string]: '40s' }}>
            <path d={gearPath(150, 150, 110, 60, 5)} stroke={dim} />
          </g>
          <g className="anim-spin-r" style={{ ['--d' as string]: '13.3s' }}>
            <path d={gearPath(290, 92, 46, 20, 5)} stroke={ink} />
          </g>
          <g className="anim-tick">
            <path d="M280 210 H340 L328 232 H268 Z" fill={R} stroke="none" />
          </g>
          <circle cx="150" cy="150" r="3" fill={ink} stroke="none" />
          <line x1="0" y1="150" x2="400" y2="150" stroke={dim} strokeDasharray="2 6" />
        </S>
      )
  }
}

/** GTA hairline map: abstract lake edge + six city nodes, Vaughan in red. Positions are schematic, not survey-accurate. */
export function Gta({ light }: { light?: boolean }) {
  const ink = light ? '#171717' : '#fff'
  const dim = light ? 'rgba(23,23,23,.2)' : 'rgba(255,255,255,.2)'
  const nodes: [string, number, number][] = [
    ['Vaughan', 170, 92],
    ['Toronto', 214, 196],
    ['Mississauga', 92, 196],
    ['Brampton', 86, 112],
    ['Markham', 286, 102],
    ['Richmond Hill', 234, 68],
  ]
  return (
    <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid meet" aria-hidden fill="none">
      <path d="M0 262 C60 250 110 238 160 236 C210 234 250 226 300 206 C340 190 372 182 400 178" stroke={ink} strokeWidth="1.2" className="draw" />
      <path d="M0 276 C80 266 140 256 200 254 C260 252 330 226 400 200" stroke={dim} className="draw" />
      {nodes.map(([n, x, y]) => (
        <line key={'l' + n} x1="170" y1="92" x2={x} y2={y} stroke={dim} className="draw" />
      ))}
      {nodes.map(([n, x, y], i) => (
        <g key={n}>
          {i === 0 ? <path d={`M${x - 10} ${y - 6} H${x + 12} L${x + 7} ${y + 6} H${x - 15} Z`} fill={R} /> : <rect x={x - 3.5} y={y - 3.5} width="7" height="7" fill={ink} />}
        </g>
      ))}
    </svg>
  )
}
