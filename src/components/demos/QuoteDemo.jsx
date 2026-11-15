import { motion } from 'framer-motion'
import { DemoFrame } from './DemoFrame'
import { Reveal, Draw, Label, Text, Box, Tick, INK, RED, LINE, MUTED, EASE } from './primitives'

const STEPS = [
  'Request read from email, web form or call notes',
  'Your real pricing rules applied',
  'Accurate, branded quote drafted',
  'One-click review; unusual jobs flagged for a human',
]
const FIELDS = [['Scope', 'Repaint, 3 offices'], ['Area', '900 sq ft'], ['Timing', 'Next month']]
const RULES = ['Rate x area', 'Minimum job size', 'Seasonal adjustment']
const LINES = [['Prep + labour', '1,800.00'], ['Materials', '420.00'], ['Subtotal', '2,220.00'], ['HST 13%', '288.60']]

export function QuoteDemo(props) {
  return (
    <DemoFrame id="quote-automation" index="02" kicker="Quote automation" title="A request turns into a quote in minutes" steps={STEPS} {...props}>
      {(p) => (
        <g>
          <Label x={20} y={36}>Inbound request</Label>
          <Text x={20} y={62} size={15} weight={400}>Could you quote repainting</Text>
          <Text x={20} y={82} size={15} weight={400}>3 offices, about 900 sq ft,</Text>
          <Text x={20} y={102} size={15} weight={400}>sometime next month?</Text>
          {FIELDS.map(([k, v], i) => (
            <Reveal key={k} show={p >= 0} delay={0.3 + i * 0.25}>
              <line x1={20} y1={124 + i * 34} x2={240} y2={124 + i * 34} stroke={LINE} />
              <Text x={20} y={146 + i * 34} size={12} fill={MUTED}>{k}</Text>
              <Text x={84} y={146 + i * 34} size={15}>{v}</Text>
            </Reveal>
          ))}

          <Box x={20} y={250} w={220} h={130} />
          <Label x={36} y={274}>Pricing rules</Label>
          {RULES.map((r, i) => (
            <g key={r}>
              <Text x={36} y={304 + i * 26} size={14} fill={p >= 1 ? INK : MUTED} weight={400}>{r}</Text>
              <Tick x={210} y={296 + i * 26} show={p >= 1} delay={0.2 + i * 0.3} />
            </g>
          ))}
          <Draw show={p >= 1} d="M240 315 H262" stroke={RED} delay={1} />

          {/* quote doc */}
          <Box x={270} y={20} w={230} h={360} fill="#fff" />
          <motion.rect x={270} y={20} width={230} height={44} fill={INK} style={{ originX: 0, transformBox: 'fill-box' }}
            initial={false} animate={{ scaleX: p >= 2 ? 1 : 0 }} transition={{ duration: 0.6, ease: EASE }} />
          <Reveal show={p >= 2} delay={0.3}>
            <Text x={286} y={48} size={15} fill="#fff">Quote</Text>
            <Text x={484} y={48} size={12} fill="#fff" weight={400} anchor="end">Sample figures</Text>
          </Reveal>
          {LINES.map(([k, v], i) => (
            <Reveal key={k} show={p >= 2} delay={0.5 + i * 0.2}>
              <Text x={286} y={98 + i * 32} size={14} weight={400}>{k}</Text>
              <Text x={484} y={98 + i * 32} size={14} anchor="end">{v}</Text>
              <line x1={286} y1={108 + i * 32} x2={484} y2={108 + i * 32} stroke={LINE} />
            </Reveal>
          ))}
          <Reveal show={p >= 2} delay={1.4}>
            <Text x={286} y={250} size={14}>Total</Text>
            <Text x={484} y={252} size={22} anchor="end">$2,508.60</Text>
          </Reveal>
          <motion.rect x={286} y={282} height={40} fill={RED} initial={false}
            animate={{ width: p >= 3 ? 198 : 0 }} transition={{ duration: 0.6, ease: EASE }} />
          <Reveal show={p >= 3} delay={0.4}>
            <Text x={385} y={307} size={14} fill="#fff" anchor="middle">Approve and send</Text>
          </Reveal>
          <Reveal show={p >= 3} delay={0.9}>
            <Text x={286} y={352} size={12} fill={MUTED} weight={400}>Unusual job? Held for</Text>
            <Text x={286} y={368} size={12} fill={MUTED} weight={400}>human review first.</Text>
          </Reveal>
        </g>
      )}
    </DemoFrame>
  )
}
