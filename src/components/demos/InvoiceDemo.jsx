import { motion } from 'framer-motion'
import { DemoFrame } from './DemoFrame'
import { Reveal, Label, Text, Box, INK, RED, LINE, MUTED, EASE } from './primitives'

const STEPS = [
  'Invoice issued and tracked',
  'Polite, personalised email reminder',
  'SMS nudge, paced deliberately',
  'AI voice call escalates gently',
  'Paid, with every touch on record',
]
const NODES = [
  { x: 40, day: 'Day 0', ch: 'Invoice' },
  { x: 150, day: 'Day 7', ch: 'Email' },
  { x: 260, day: 'Day 14', ch: 'SMS' },
  { x: 370, day: 'Day 21', ch: 'Voice' },
  { x: 480, day: 'Day 23', ch: 'Paid' },
]
const LOG = [
  ['Day 0', 'Invoice sent'],
  ['Day 7', 'Email reminder, opened'],
  ['Day 14', 'SMS reminder, delivered'],
  ['Day 21', 'Voice call, date agreed'],
  ['Day 23', 'Payment received'],
]

export function InvoiceDemo(props) {
  return (
    <DemoFrame id="invoice-follow-up" index="03" kicker="Invoice follow-up" title="A reminder sequence that gets you paid" steps={STEPS} {...props}>
      {(p) => (
        <g>
          <Label x={20} y={30}>Sample cadence</Label>
          <line x1={40} y1={92} x2={480} y2={92} stroke={LINE} />
          <motion.line x1={40} y1={92} y2={92} stroke={RED} strokeWidth={2} initial={false}
            animate={{ x2: NODES[p].x }} transition={{ duration: 0.9, ease: EASE }} />
          {NODES.map((n, i) => (
            <g key={n.day}>
              <Text x={n.x} y={70} size={13} fill={i <= p ? INK : MUTED} anchor="middle">{n.day}</Text>
              <motion.rect x={n.x - 6} y={86} width={12} height={12} stroke={i <= p ? RED : LINE} strokeWidth={1}
                initial={false} animate={{ fill: i <= p ? RED : '#ffffff' }} transition={{ duration: 0.3, delay: i <= p ? 0.6 : 0 }} />
              <Text x={n.x} y={122} size={12} fill={MUTED} weight={400} anchor="middle">{n.ch}</Text>
            </g>
          ))}

          {/* invoice */}
          <Box x={20} y={160} w={180} h={200} fill="#fff" />
          <Label x={36} y={186}>Invoice, sample</Label>
          <rect x={36} y={204} width={110} height={6} fill="#eeeeee" />
          <rect x={36} y={218} width={80} height={6} fill="#eeeeee" />
          <rect x={36} y={232} width={124} height={6} fill="#eeeeee" />
          <Text x={36} y={276} size={12} fill={MUTED} weight={400}>Amount due</Text>
          <Text x={36} y={304} size={22}>$2,508.60</Text>
          <motion.g initial={false} animate={{ opacity: p >= 4 ? 1 : 0, scale: p >= 4 ? 1 : 1.15 }}
            style={{ transformBox: 'fill-box', originX: 0.5, originY: 0.5 }} transition={{ duration: 0.5, ease: EASE, delay: p >= 4 ? 0.5 : 0 }}>
            <rect x={36} y={320} width={78} height={28} fill="none" stroke={RED} strokeWidth={1.5} />
            <Text x={75} y={339} size={14} fill={RED} anchor="middle">PAID</Text>
          </motion.g>

          {/* touch log */}
          <Label x={230} y={186}>Touch log</Label>
          {LOG.map(([d, t], i) => (
            <Reveal key={d} show={p >= i} delay={0.7}>
              <line x1={230} y1={198 + i * 34} x2={500} y2={198 + i * 34} stroke={LINE} />
              <Text x={230} y={220 + i * 34} size={12} fill={i === 4 ? RED : MUTED}>{d}</Text>
              <Text x={290} y={220 + i * 34} size={14} weight={400}>{t}</Text>
            </Reveal>
          ))}
          <Text x={20} y={390} size={12} fill={MUTED} weight={400}>Your team steps in only when a case needs a person.</Text>
        </g>
      )}
    </DemoFrame>
  )
}
