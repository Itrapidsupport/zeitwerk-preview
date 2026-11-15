import { motion } from 'framer-motion'
import { DemoFrame } from './DemoFrame'
import { Reveal, Draw, Label, Text, Box, Tick, INK, RED, LINE, MUTED, SOFT, EASE } from './primitives'

const STEPS = [
  'Mail arrives in one shared, unsorted inbox',
  'Every message classified',
  'Urgent surfaced, each item routed to its owner',
  'Replies drafted, ready for review',
]
const MSGS = [
  { s: 'Leak reported, unit 4B', lane: 0, tag: 'Urgent' },
  { s: 'Spring newsletter', lane: 3, tag: 'Low priority' },
  { s: 'Question on invoice', lane: 1, tag: 'Accounts' },
  { s: 'Can you confirm Friday?', lane: 2, tag: 'Needs reply' },
  { s: 'Service outage, 2nd ask', lane: 0, tag: 'Urgent' },
  { s: 'Receipt attached', lane: 1, tag: 'Accounts' },
]
const LANES = ['Urgent, to on-call', 'Accounts', 'Needs reply', 'Low priority']
// compute right-column layout
const RX = 280
const layout = (() => {
  let y = 40
  const lanes = [], rows = {}
  LANES.forEach((name, li) => {
    lanes.push({ name, y })
    y += 24
    MSGS.forEach((m, mi) => { if (m.lane === li) { rows[mi] = y; y += 34 } })
    y += 12
  })
  return { lanes, rows }
})()

export function InboxDemo(props) {
  return (
    <DemoFrame id="inbox-triage" index="04" kicker="Inbox triage" title="An inbox that sorts itself" steps={STEPS} {...props}>
      {(p) => (
        <g>
          <Label x={20} y={30}>Shared inbox</Label>
          <motion.g initial={false} animate={{ opacity: p >= 2 ? 1 : 0 }} transition={{ duration: 0.4, delay: p >= 2 ? 1.2 : 0 }}>
            <Text x={250} y={30} size={12} fill={MUTED} weight={400} anchor="end">0 unsorted</Text>
          </motion.g>
          {MSGS.map((m, i) => {
            const y = 44 + i * 46
            return (
              <motion.g key={m.s} initial={false}
                animate={{ opacity: p >= 2 ? 0 : 1, x: p >= 2 ? 16 : 0 }}
                transition={{ duration: 0.45, ease: EASE, delay: p >= 2 ? i * 0.12 : 0.7 + i * 0.05 }}>
                <Box x={20} y={y} w={230} h={40} fill="#fff" />
                <rect x={20} y={y} width={3} height={40} fill={m.lane === 0 && p >= 1 ? RED : SOFT} />
                <Text x={34} y={y + 18} size={14}>{m.s}</Text>
                <Reveal show={p >= 1} delay={i * 0.12} rise={4}>
                  <Text x={34} y={y + 33} size={12} fill={m.lane === 0 ? RED : MUTED}>{m.tag}</Text>
                </Reveal>
              </motion.g>
            )
          })}

          {/* lanes */}
          {layout.lanes.map((l, li) => (
            <Reveal key={l.name} show={p >= 2} delay={0.2 + li * 0.15} rise={4}>
              <Label x={RX} y={l.y + 14} fill={li === 0 ? RED : MUTED}>{l.name}</Label>
              <line x1={RX} y1={l.y + 20} x2={500} y2={l.y + 20} stroke={li === 0 ? RED : LINE} />
            </Reveal>
          ))}
          {MSGS.map((m, i) => (
            <Reveal key={m.s} show={p >= 2} delay={0.35 + i * 0.12} rise={0}>
              <motion.g initial={false} animate={{ x: p >= 2 ? 0 : -16 }} transition={{ duration: 0.5, ease: EASE, delay: p >= 2 ? 0.35 + i * 0.12 : 0 }}>
                <Text x={RX} y={layout.rows[i] + 22} size={14} fill={INK}>{m.s}</Text>
                {m.lane === 2 && <Tick x={484} y={layout.rows[i] + 14} show={p >= 3} delay={1.2} />}
              </motion.g>
            </Reveal>
          ))}

          {/* draft reply appears where the inbox used to be */}
          <Reveal show={p >= 3} delay={0.2}>
            <Box x={20} y={150} w={230} h={150} fill="#fff" />
            <Label x={36} y={174}>Draft reply, for review</Label>
            <Text x={36} y={204} size={14} weight={400}>Hi, yes: Friday at 2 PM</Text>
            <Text x={36} y={224} size={14} weight={400}>is confirmed. See you then.</Text>
          </Reveal>
          <motion.rect x={36} y={248} height={34} fill={RED} initial={false}
            animate={{ width: p >= 3 ? 198 : 0 }} transition={{ duration: 0.5, ease: EASE, delay: p >= 3 ? 0.7 : 0 }} />
          <Reveal show={p >= 3} delay={1}>
            <Text x={135} y={270} size={13} fill="#fff" anchor="middle">Review and send</Text>
          </Reveal>
          <Draw show={p >= 3} d={`M250 225 H265 V${layout.rows[3] + 17} H276`} stroke={RED} delay={1} />
        </g>
      )}
    </DemoFrame>
  )
}
