/**
 * Per-route SEO. Lane 09 (src/seo/seo-data.ts, generated) is the source for the 13 live routes;
 * /approach, /contact and 404 use lane 04 meta. Used at runtime by lib/Seo.tsx and at build time by
 * the prerender step (scripts/postbuild.mjs via the SSR bundle). Preview is always noindex.
 */
import { SEO as LANE09 } from '../seo/seo-data'
import { page } from '../content/copy'

export type SeoEntry = { path: string; title: string; description: string; ogTitle?: string; ogDescription?: string; ogType?: string; jsonld?: unknown }

const fromLane04 = (path: string, id: string): SeoEntry => {
  const m = page(id).meta
  return { path, title: m.meta_title, description: m.meta_description }
}

export const SEO: SeoEntry[] = [
  ...Object.values(LANE09).map((s) => ({ path: s.path, title: s.title, description: s.description, ogTitle: s.ogTitle, ogDescription: s.ogDescription, ogType: s.ogType, jsonld: s.jsonld })),
  fromLane04('/approach', 'approach'),
  fromLane04('/contact', 'contact'),
]

export const NOT_FOUND: SeoEntry = fromLane04('/404', '404')

export function seoFor(path: string): SeoEntry {
  const p = path.replace(/\/+$/, '') || '/'
  return SEO.find((e) => e.path === p) ?? NOT_FOUND
}

export const canonical = (path: string) => 'https://zeitwerk.ca' + (path === '/' ? '/' : path.replace(/\/+$/, ''))

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')
/** Static <head> block for the prerendered HTML of `path`. */
export function headHtml(path: string): string {
  const e = seoFor(path)
  const url = e.path === '/404' ? canonical('/') : canonical(path)
  const ld = e.jsonld ? `\n    <script type="application/ld+json">${JSON.stringify(e.jsonld).replace(/</g, '\\u003c')}</script>` : ''
  return `<!--SEO:START-->
    <title>${esc(e.title)}</title>
    <meta name="description" content="${esc(e.description)}" />
    <link rel="canonical" href="${url}" />
    <meta property="og:type" content="${e.ogType ?? 'website'}" />
    <meta property="og:site_name" content="Zeitwerk" />
    <meta property="og:locale" content="en_CA" />
    <meta property="og:title" content="${esc(e.ogTitle ?? e.title)}" />
    <meta property="og:description" content="${esc(e.ogDescription ?? e.description)}" />
    <meta property="og:url" content="${url}" />${ld}
    <!--SEO:END-->`
}
