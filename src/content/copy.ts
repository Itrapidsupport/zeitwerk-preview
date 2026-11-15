// Copy access layer over lane 04's pages.json (04-copywriting/dist/pages.json, copied verbatim).
// Regenerate pages.json in lane 04 and re-copy; nothing here hard-codes page copy.
import pages from './pages.json'

type Sec = { lines: string[]; items: Record<string, string[]> }
type Page = { title: string; route: string; meta: Record<string, string>; sections: Record<string, Sec> }
const P = pages as unknown as Record<string, Page> & { microcopy: Record<string, any> }

export const page = (id: string) => P[id] as Page
export const sec = (id: string, s: string): Sec => P[id]?.sections?.[s] ?? { lines: [], items: {} }
export const micro = P.microcopy

/** "Key: value" lines -> object (first occurrence wins; repeated keys collected via kvAll). */
export function kv(lines: string[]): Record<string, string> {
  const o: Record<string, string> = {}
  for (const l of lines) {
    const m = l.match(/^([A-Z][\w ()/-]*): (.*)$/)
    if (m && !(m[1] in o)) o[m[1]] = m[2]
  }
  return o
}
export const kvAll = (lines: string[], key: string) => lines.filter((l) => l.startsWith(key + ': ')).map((l) => l.slice(key.length + 2))
export const bullets = (lines: string[]) => lines.filter((l) => l.startsWith('- ')).map((l) => l.slice(2))
export function steps(lines: string[]) {
  return lines
    .map((l) => l.match(/^(\d\d) ([^:]+): (.*)$/))
    .filter(Boolean)
    .map((m) => ({ n: m![1], title: m![2], body: m![3] }))
}
export function faqs(lines: string[]) {
  const out: { q: string; a: string }[] = []
  for (const l of lines) {
    if (l.startsWith('Q: ')) out.push({ q: l.slice(3), a: '' })
    else if (l.startsWith('A: ') && out.length) out[out.length - 1].a = l.slice(3)
  }
  return out
}
/** "- Label: /path" lines -> links */
export const links = (lines: string[]) =>
  bullets(lines)
    .map((b) => b.match(/^(.*): (\/[\w/-]*)$/))
    .filter(Boolean)
    .map((m) => ({ label: m![1], to: m![2] }))
/** "17,968 / units with real-time visibility" -> figure */
export const figures = (lines: string[]) =>
  lines.map((l) => l.split(' / ')).filter((p) => p.length === 2).map(([value, label]) => ({ value, label }))
