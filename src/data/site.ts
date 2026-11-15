/**
 * Site data. Copy comes from lane 04 (src/content/pages.json) via src/content/copy.ts;
 * facts trace to lane 01 facts.json. No invented facts. No street address (NK decision 2026-11-15).
 */
import { bullets, figures, kv, sec } from '../content/copy'

export const SITE = {
  name: 'Zeitwerk',
  origin: 'https://zeitwerk.ca',
  email: 'info@zeitwerk.ca',
  locality: 'Vaughan, Ontario',
  tagline: 'Automation and AI consulting, Vaughan, Ontario',
  cities: ['Toronto', 'Vaughan', 'Mississauga', 'Brampton', 'Markham', 'Richmond Hill'],
  areaServed: 'Serving Toronto, Vaughan, Mississauga, Brampton, Markham, Richmond Hill and the rest of the GTA, on site or remotely.',
}

export const NAV = [
  { to: '/services', label: 'Services' },
  { to: '/projects', label: 'Projects' },
  { to: '/approach', label: 'Approach' },
  { to: '/contact', label: 'Contact' },
]

export type ServiceKey = 'receptionist' | 'quote' | 'invoice' | 'inbox' | 'document' | 'reporting'
export type Service = {
  slug: string
  n: string
  key: ServiceKey
  name: string
  short: string
  promise: string
  removes: string[]
  copyId: string
}

const SVC: [string, ServiceKey, string][] = [
  ['ai-receptionist', 'receptionist', 'AI receptionists'],
  ['quote-automation', 'quote', 'Quote automation'],
  ['invoice-follow-up', 'invoice', 'Invoice follow-up'],
  ['inbox-triage', 'inbox', 'Inbox triage'],
  ['document-intake', 'document', 'Document intake'],
  ['reporting-dashboards', 'reporting', 'Reporting and dashboards'],
]

// Home table rows ("| 01 | Name | Line | /link |") and services-hub index items.
const homeRows = sec('home', 'services').lines.filter((l) => /^\| 0\d/.test(l)).map((l) => l.split('|').map((c) => c.trim()))
const hubItems = sec('services', 'index').items

export const SERVICES: Service[] = SVC.map(([slug, key, name], i) => {
  const hubKey = Object.keys(hubItems).find((k) => k.startsWith(`0${i + 1} `)) ?? ''
  const hub = kv(hubItems[hubKey] ?? [])
  return {
    slug,
    key,
    n: `0${i + 1}`,
    name,
    short: homeRows[i]?.[3] ?? hub.Promise ?? '',
    promise: hub.Promise ?? '',
    removes: (hub.Removes ?? '').split(' / ').filter(Boolean),
    copyId: `service-${slug}`,
  }
})
export const serviceBySlug = (s?: string) => SERVICES.find((x) => x.slug === s)

export type Case = { slug: string; name: string; sector: string; line: string; figures: { value: string; label: string }[]; copyId: string; visual: 'map' | 'sms' }
export const CASES: Case[] = [
  { slug: 'property-intelligence-platform', name: 'Property Intelligence Platform', visual: 'map' as const },
  { slug: 'intelligent-collections-engine', name: 'Intelligent Collections Engine', visual: 'sms' as const },
].map((c) => {
  const copyId = `case-${c.slug}`
  const proof = sec('home', 'proof').items
  const k = Object.keys(proof).find((x) => x.endsWith(c.name)) ?? ''
  const p = kv(proof[k] ?? [])
  return { ...c, copyId, sector: p.Sector ?? '', line: p.Line ?? '', figures: figures(sec(copyId, 'figures').lines) }
})
export const caseBySlug = (s?: string) => CASES.find((x) => x.slug === s)

/**
 * "More projects" index from lane 04 projects.md (reworded from zeitwerk.ca/projects).
 * NK decision 2026-11-15: omit builds that read as internal tools for a single employer.
 */
const OMIT = /Employee Marketplace|Performance Review|EV Charging|Identity Governance|Travel Access|Adobe License|Employee Sign-In|Executive Calendar|Innovation Hub/
export type Listed = { name: string; sector: string; category: string; before: string; figures: string; stack: string }
export const MORE: Listed[] = sec('projects', 'index')
  .lines.filter((l) => l.startsWith('| ') && !l.startsWith('| Project') && !l.startsWith('|---'))
  .map((l) => l.split('|').slice(1, -1).map((c) => c.trim()))
  .map(([name, sectorCat, before, figs, stack]) => {
    const [sector, category] = sectorCat.split(', ')
    return { name, sector, category: category ?? '', before, figures: figs, stack }
  })
  .filter((p) => !OMIT.test(p.name))

export const PROCESS = (() => {
  const items = sec('approach', 'stages').items
  return Object.entries(items).map(([k, v]) => {
    const m = k.match(/^(\d\d) (.*)$/)!
    const o = kv(v)
    return { n: m[1], title: m[2], body: o.Body ?? '', get: o['You get'] ?? '' }
  })
})()

export const PILLARS = Object.entries(sec('home', 'pillars').items).map(([k, v]) => {
  const o = kv(v)
  return { label: k.replace(/^pillar-\d\d /, ''), headline: o.Headline, body: o.Body, points: bullets(v) }
})
