import { HorizontalRail } from '../motion'
import type { Listed } from '../data/site'
import MediaSlot from './MediaSlot'
import type { Variant } from './Schematic'

/** Visual per project, from what the live card says the system does (no client imagery). */
function variantFor(p: Listed): Variant {
  const n = p.name.toLowerCase()
  if (/inspection|evaluator|expense/.test(n)) return 'document'
  if (/staging/.test(n)) return 'gears'
  if (/dashboard|tracker|portfolio/.test(n)) return 'reporting'
  if (/service call|snow/.test(n)) return 'map'
  return 'inbox'
}

/**
 * Cinematic project showcase: pinned horizontal rail on desktop (vertical scroll drives it sideways),
 * native swipe deck with snap on touch. Full-height panels alternate ink / white, red index, huge outcome
 * figure (the live site's "~" estimates, verbatim), one visual per panel.
 */
export default function ProjectRail({ items, label = 'Projects' }: { items: Listed[]; label?: string }) {
  const total = String(items.length).padStart(2, '0')
  const panels = items.map((p, i) => {
    const dark = i % 2 === 0
    const [lead, ...rest] = p.figures.split(', ')
    return (
      <article key={p.name} className={`pj ${dark ? 'pj--dark' : 'pj--light'}`}>
        <div className="pj-top">
          <span className="pj-idx tnum">{String(i + 1).padStart(2, '0')} / {total}</span>
          <span className="t-label pj-sector">{p.sector}</span>
        </div>
        <MediaSlot variant={variantFor(p)} light={!dark} ratio="16 / 9" className="pj-media" />
        <h3 className="pj-name">{p.name}</h3>
        <p className="pj-before">{p.before}</p>
        <div className="pj-fig">
          <span className="pj-fig-v tnum">{lead}</span>
          {rest.length > 0 && <span className="pj-fig-k">{rest.join(', ')}</span>}
          <span className="pj-fig-note">Estimated, as reported for the project</span>
        </div>
      </article>
    )
  })
  return <HorizontalRail label={label} items={panels} itemWidth="min(86vw, 620px)" gap="0px" />
}
