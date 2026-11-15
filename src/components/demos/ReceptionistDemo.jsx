import { motion } from 'framer-motion'
import { DemoFrame } from './DemoFrame'
import { Reveal, Draw, Label, Text, Box, Tick, INK, RED, SOFT, LINE, MUTED, EASE } from './primitives'

const STEPS = [
  'Every call answered on the first ring, after hours included',
  'Caller qualified and routine questions answered',
  'Appointment booked straight into the calendar',
  'Full transcript waiting in your inbox',
]
const DAYS = ['M', 'T', 'W', 'T', 'F']
// illustrative "busy" cells [col,row]
const BUSY = [[0, 0], [1, 2], [2, 1], [4, 0], [0, 3], [3, 3], [4, 2]]
const CX = 300, CY = 62, CW = 40, CH = 34

export function ReceptionistDemo(props) {
  return (
    <DemoFrame id="ai-receptionist" index="01" kicker="AI receptionist" title="A call becomes a booked appointment" steps={STEPS} {...props}>
      {(p) => (
        <g>
          {/* call block */}
          <Box x={20} y={20} w={240} h={100} />
          <Label x={36} y={44}>Incoming call</Label>
          <Text x={36} y={70} size={18}>9:47 PM, after hours</Text>
          <motion.rect x={236} y={34} width={10} height={10} fill={RED}
            animate={p === 0 ? { opacity: [1, 0.15, 1] } : { opacity: 1 }}
            transition={p === 0 ? { duration: 0.9, repeat: Infinity } : { duration: 0.3 }} />
          {Array.from({ length: 22 }).map((_, i) => (
            <motion.rect key={i} x={36 + i * 9} y={86} width={4} height={22} fill={i % 5 === 2 ? RED : INK}
              style={{ originY: 0.5, transformBox: 'fill-box' }}
              initial={false}
              animate={p <= 1 ? { scaleY: [0.2, 0.35 + ((i * 37) % 60) / 100, 0.2] } : { scaleY: 0.12 }}
              transition={p <= 1 ? { duration: 0.7 + (i % 4) * 0.12, repeat: Infinity, ease: 'easeInOut' } : { duration: 0.4 }} />
          ))}

          {/* transcript */}
          <Reveal show={p >= 1}>
            <Label x={20} y={158}>Caller</Label>
            <Text x={20} y={180} size={16}>Anything open Thursday?</Text>
          </Reveal>
          <Reveal show={p >= 1} delay={0.5}>
            <Label x={20} y={212} fill={RED}>Receptionist</Label>
            <Text x={20} y={234} size={16}>Thursday 10:30 is free.</Text>
            <Text x={20} y={254} size={16}>Shall I book it?</Text>
          </Reveal>
          <Reveal show={p >= 2}>
            <Label x={20} y={286}>Caller</Label>
            <Text x={20} y={308} size={16}>Yes, please.</Text>
          </Reveal>
          <Reveal show={p >= 1} delay={0.9}>
            <line x1={20} y1={336} x2={260} y2={336} stroke={LINE} />
            <Text x={20} y={358} size={13} fill={MUTED} weight={400}>Anything complex is routed to a person.</Text>
          </Reveal>

          {/* calendar */}
          <Label x={CX} y={44}>Calendar, this week</Label>
          {DAYS.map((d, i) => (
            <Text key={i} x={CX + i * CW + CW / 2 - 2} y={CY + 6} size={12} fill={MUTED} anchor="middle">{d}</Text>
          ))}
          {Array.from({ length: 5 }).map((_, c) =>
            Array.from({ length: 5 }).map((_, r) => {
              const busy = BUSY.some(([bc, br]) => bc === c && br === r)
              return <Box key={`${c}-${r}`} x={CX + c * CW} y={CY + 16 + r * CH} w={CW - 4} h={CH - 4} fill={busy ? SOFT : 'none'} stroke={busy ? 'none' : LINE} />
            }),
          )}
          <motion.rect x={CX + 3 * CW} y={CY + 16 + 1 * CH} width={CW - 4} height={CH - 4} fill={RED}
            style={{ originX: 0, transformBox: 'fill-box' }}
            initial={false} animate={{ scaleX: p >= 2 ? 1 : 0 }} transition={{ duration: 0.6, ease: EASE, delay: p >= 2 ? 0.7 : 0 }} />
          <Reveal show={p >= 2} delay={1}>
            <Text x={CX} y={268} size={16}>Thu 10:30, booked</Text>
          </Reveal>
          <Draw show={p >= 2} d={`M118 302 C 200 302, 230 ${CY + 31 + CH}, ${CX + 3 * CW} ${CY + 31 + CH}`} stroke={RED} delay={0.2} />

          {/* inbox */}
          <Box x={300} y={300} w={196} h={80} />
          <Label x={316} y={324}>Your inbox</Label>
          <Reveal show={p >= 3} delay={0.6}>
            <Text x={316} y={350} size={15}>Transcript + booking</Text>
            <Tick x={316} y={362} show={p >= 3} delay={0.9} />
            <Text x={338} y={370} size={12} fill={MUTED} weight={400}>Delivered</Text>
          </Reveal>
          <motion.rect width={14} height={10} fill={RED} y={-5}
            initial={false}
            animate={p >= 3 ? { x: [262, 290], y: [331, 331], opacity: [0, 1, 0] } : { x: 262, y: 331, opacity: 0 }}
            transition={{ duration: 0.8, ease: EASE }} />
        </g>
      )}
    </DemoFrame>
  )
}
