import { motion } from 'framer-motion'
import { DemoFrame } from './DemoFrame'
import { Reveal, Draw, Label, Text, Box, Tick, INK, RED, LINE, MUTED, EASE } from './primitives'

const STEPS = [
  'Document arrives: PDF, scan, photo or form',
  'Fields located and read',
  'Values validated against your rules',
  'Written to your system; exceptions go to a person',
]
// field position on the document + value
const FIELDS = [
  { k: 'Vendor', v: 'Sample Vendor Ltd.', y: 94, flag: true },
  { k: 'Invoice no.', v: 'INV-0000', y: 148 },
  { k: 'Date', v: '2026-03-14', y: 202 },
  { k: 'Total', v: '$1,284.50', y: 330 },
]
const TX = 276

export function DocumentDemo(props) {
  return (
    <DemoFrame id="document-intake" index="05" kicker="Document intake" title="A document parsed into clean fields" steps={STEPS} {...props}>
      {(p) => (
        <g>
          <motion.g initial={false} animate={{ opacity: 1, y: 0 }}>
            <Box x={20} y={20} w={200} h={360} fill="#fff" />
            <Text x={36} y={50} size={16}>INVOICE</Text>
            <rect x={150} y={38} width={54} height={14} fill="#eeeeee" />
            {FIELDS.map((f) => (
              <g key={f.k}>
                <Text x={36} y={f.y - 17} size={11} fill={MUTED}>{f.k.toUpperCase()}</Text>
                <Text x={36} y={f.y + 4} size={13} weight={400}>{f.v}</Text>
              </g>
            ))}
            {[232, 248, 264, 280, 296].map((y, i) => (
              <g key={y}>
                <rect x={36} y={y} width={i % 2 ? 96 : 120} height={6} fill="#eeeeee" />
                <rect x={168} y={y} width={36} height={6} fill="#eeeeee" />
              </g>
            ))}
          </motion.g>

          {/* scan line */}
          <motion.g initial={false}
            animate={p === 1 ? { y: [0, 340], opacity: [0, 1, 1, 0] } : { y: 0, opacity: 0 }}
            transition={p === 1 ? { duration: 1.6, ease: 'easeInOut' } : { duration: 0.2 }}>
            <line x1={20} y1={30} x2={220} y2={30} stroke={RED} strokeWidth={2} />
          </motion.g>
          {FIELDS.map((f, i) => (
            <Reveal key={f.k} show={p >= 1} delay={0.3 + i * 0.35} rise={0}>
              <rect x={30} y={f.y - 10} width={180} height={20} fill="none" stroke={RED} strokeWidth={1} />
            </Reveal>
          ))}

          {/* extracted table */}
          <Label x={TX} y={36}>Extracted fields</Label>
          {FIELDS.map((f, i) => {
            const y = 56 + i * 62
            return (
              <g key={f.k}>
                <line x1={TX} y1={y} x2={500} y2={y} stroke={LINE} />
                <Text x={TX} y={y + 22} size={12} fill={MUTED}>{f.k}</Text>
                <Reveal show={p >= 1} delay={0.6 + i * 0.35}>
                  <Text x={TX} y={y + 48} size={17}>{f.v}</Text>
                </Reveal>
                {!f.flag && <Tick x={484} y={y + 40} show={p >= 2} delay={0.2 + i * 0.25} />}
                {f.flag && (
                  <Reveal show={p >= 3} delay={0.6}>
                    <Text x={500} y={y + 20} size={12} fill={RED} anchor="end">New vendor, to review</Text>
                  </Reveal>
                )}
                <Draw show={p >= 1} d={`M210 ${f.y} C 240 ${f.y}, 245 ${y + 40}, ${TX - 6} ${y + 40}`} stroke={LINE} delay={0.5 + i * 0.35} />
              </g>
            )
          })}
          <motion.rect x={TX} y={316} height={64} fill={INK} initial={false}
            animate={{ width: p >= 3 ? 224 : 0 }} transition={{ duration: 0.6, ease: EASE }} />
          <Reveal show={p >= 3} delay={0.3}>
            <Text x={TX + 16} y={342} size={12} fill="#a3a3a3">SYSTEM OF RECORD</Text>
            <Text x={TX + 16} y={364} size={15} fill="#fff">3 fields written</Text>
          </Reveal>
        </g>
      )}
    </DemoFrame>
  )
}
