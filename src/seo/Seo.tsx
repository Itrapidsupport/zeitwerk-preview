// Lane 09 seo-geo. React 19 hoists <title>/<meta>/<link> rendered anywhere into <head>.
// Usage: <Seo path="/services/inbox-triage" />  (path must be a key of SEO in seo-data.ts)
// IMPORTANT: crawlers (GPTBot, ClaudeBot, PerplexityBot) do not run JS - these tags must also
// exist in the prerendered static HTML for each route (see seo/06-go-live-checklist.md, "Prerender").
import { SEO } from './seo-data';

export function Seo({ path, noindex = false }: { path: string; noindex?: boolean }) {
  const s = SEO[path];
  if (!s) return null;
  return (
    <>
      <title>{s.title}</title>
      <meta name="description" content={s.description} />
      <meta name="robots" content={noindex ? 'noindex, nofollow' : s.robots} />
      <link rel="canonical" href={s.canonical} />
      <meta property="og:type" content={s.ogType} />
      <meta property="og:site_name" content="Zeitwerk" />
      <meta property="og:locale" content="en_CA" />
      <meta property="og:title" content={s.ogTitle} />
      <meta property="og:description" content={s.ogDescription} />
      <meta property="og:url" content={s.canonical} />
      <meta property="og:image" content={s.ogImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta name="twitter:card" content="summary_large_image" />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(s.jsonld).replace(/</g, '\\u003c') }} />
    </>
  );
}
