import { motion } from 'framer-motion'
import { DemoFrame } from './DemoFrame'
import { Reveal, Draw, Label, Text, Box, Tick, INK, RED, LINE, MUTED, SOFT, EASE } from './primitives'

const STEPS = [
  'Data pulled from the tools you already run',
  'Combined into one version of the truth',
  'Live dashboard assembles itself',
  'Scheduled report delivered, zero assembly',
]
const SOURCES = ['CRM', 'Accounting', 'Spreadsheets', 'Scheduling']
const KPIS = [['Revenue', '$84k'], ['Jobs closed', '126'], ['Days to pay', '18']]
const BARS = [38, 52, 46, 64, 58, 72, 66, 80]
const DX = 200, DY = 20, DW = 300

export function ReportingDemo(props) {
  return (
    <DemoFrame id="reporting-dashboards" index="06" kicker="Reporting dashboards" title="A report that builds itself" steps={STEPS} {...props}>
      {(p) => (
        <g>
          <Label x={20} y={36}>Sources</Label>
          {SOURCES.map((s, i) => {
            const y = 56 + i * 64
            return (
              <g key={s}>
                <Box x={20} y={y} w={130} h={44} fill="#fff" />
                <Text x={34} y={y + 27} size={14}>{s}</Text>
                <motion.rect x={140} y={y + 18} width={6} height={8} fill={RED} initial={false}
                  animate={p === 0 ? { opacity: [0.2, 1, 0.2] } : { opacity: p >= 1 ? 1 : 0.2 }}
                  transition={p === 0 ? { duration: 1.1, repeat: Infinity, delay: i * 0.2 } : { duration: 0.3 }} />
                <Draw show={p >= 1} d={`M150 ${y + 22} C 168 ${y + 22}, 168 180, ${DX - 14} 180`} stroke={i === 0 ? RED : INK} delay={i * 0.15} />
              </g>
            )
          })}
          <Reveal show={p >= 1} delay={0.7} rise={0}>
            <rect x={DX - 14} y={150} width={4} height={60} fill={RED} />
          </Reveal>

          {/* dashboard */}
          <Box x={DX} y={DY} w={DW} h={300} fill="#fff" />
          <rect x={DX} y={DY} width={DW} height={30} fill={INK} />
          <Text x={DX + 14} y={DY + 20} size={12} fill="#fff">Operations, live</Text>
          <Text x={DX + DW - 14} y={DY + 20} size={12} fill="#a3a3a3" weight={400} anchor="end">Sample data</Text>
          {KPIS.map(([k, v], i) => {
            const x = DX + 14 + i * 96
            return (
              <Reveal key={k} show={p >= 2} delay={0.1 + i * 0.15}>
                <Text x={x} y={DY + 58} size={12} fill={MUTED}>{k}</Text>
                <Text x={x} y={DY + 86} size={22}>{v}</Text>
              </Reveal>
            )
          })}
          <line x1={DX + 14} y1={DY + 104} x2={DX + DW - 14} y2={DY + 104} stroke={LINE} />
          {BARS.map((h, i) => (
            <motion.rect key={i} x={DX + 14 + i * 17} width={11} fill={i === BARS.length - 1 ? RED : INK}
              initial={false}
              animate={{ height: p >= 2 ? h : 0, y: p >= 2 ? DY + 270 - h : DY + 270 }}
              transition={{ duration: 0.7, ease: EASE, delay: p >= 2 ? 0.4 + i * 0.07 : 0 }} />
          ))}
          <line x1={DX + 14} y1={DY + 270} x2={DX + 150} y2={DY + 270} stroke={LINE} />
          <Text x={DX + 14} y={DY + 290} size={12} fill={MUTED} weight={400}>Weekly volume</Text>
          <line x1={DX + 168} y1={DY + 270} x2={DX + DW - 14} y2={DY + 270} stroke={LINE} />
          <Draw show={p >= 2} delay={0.9} stroke={RED} width={1.6} duration={1.2}
            d={`M${DX + 168} ${DY + 250} L${DX + 188} ${DY + 238} L${DX + 208} ${DY + 244} L${DX + 228} ${DY + 214} L${DX + 248} ${DY + 222} L${DX + 268} ${DY + 192} L${DX + 286} ${DY + 180}`} />
          <Text x={DX + 168} y={DY + 290} size={12} fill={MUTED} weight={400}>Cash collected</Text>
          {[150, 190, 230].map((y) => (
            <line key={y} x1={DX + 168} y1={DY + y - 26} x2={DX + DW - 14} y2={DY + y - 26} stroke={SOFT} />
          ))}

          {/* scheduled delivery */}
          <motion.rect x={DX} y={336} height={44} fill={RED} initial={false}
            animate={{ width: p >= 3 ? DW : 0 }} transition={{ duration: 0.6, ease: EASE }} />
          <Reveal show={p >= 3} delay={0.4}>
            <Text x={DX + 14} y={363} size={14} fill="#fff">Monday 8:00 AM report, sent</Text>
          </Reveal>
          <Reveal show={p >= 3} delay={0.8}>
            <Text x={20} y={363} size={12} fill={MUTED} weight={400}>Same numbers, every time.</Text>
          </Reveal>
        </g>
      )}
    </DemoFrame>
  )
}
