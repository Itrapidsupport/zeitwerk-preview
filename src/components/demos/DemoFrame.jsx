import { MotionConfig } from 'framer-motion'
import { useDemoSteps } from './useDemoSteps'

/**
 * Editorial frame shared by all six demos:
 * number + title + step legend (left) and an SVG stage (right) with a fixed
 * aspect ratio so the layout never shifts (CLS 0).
 */
export function DemoFrame({ id, index, kicker, title, steps, viewBox = '0 0 520 400', forcePhase, interval, hold, children, className = '' }) {
  const { ref, phase, reduced, interval: iv, hold: hd } = useDemoSteps(steps.length, { forcePhase, interval, hold })
  const last = steps.length - 1
  return (
    <MotionConfig reducedMotion="user">
      <figure ref={ref} className={`zwd ${className}`} data-demo={id} data-phase={phase}>
        <div className="zwd-copy">
          <div className="zwd-index">{index}</div>
          <p className="zwd-kicker">{kicker}</p>
          <h3 className="zwd-title">{title}</h3>
          <ol className="zwd-steps">
            {steps.map((s, i) => {
              const state = reduced ? 'done' : i === phase ? 'on' : i < phase ? 'done' : ''
              return (
                <li key={s} className={state}>
                  <span className="zwd-n">{String(i + 1).padStart(2, '0')}</span>
                  <span className="zwd-s">{s}</span>
                  {state === 'on' && !reduced && (
                    <span
                      key={`bar-${phase}`}
                      className="zwd-bar"
                      style={{ animationDuration: `${phase === last ? hd : iv}ms` }}
                    />
                  )}
                </li>
              )
            })}
          </ol>
          <p className="zwd-note">Illustrative sample. Names, times and figures are placeholders, not client data.</p>
        </div>
        <div className="zwd-stage">
          <svg viewBox={viewBox} role="img" aria-label={`${title}: ${steps.join(', ')}`} preserveAspectRatio="xMidYMid meet">
            {children(phase)}
          </svg>
        </div>
      </figure>
    </MotionConfig>
  )
}
