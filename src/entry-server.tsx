import { prerender } from 'react-dom/static'
import { StaticRouter } from 'react-router'
import App from './App'
import { SEO, headHtml } from './data/seo'

export { headHtml }
export const ROUTES = SEO.map((e) => e.path)

/** Full markup for `url` (waits for lazy routes / Suspense). */
export async function render(url: string): Promise<string> {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '')
  const { prelude } = await prerender(
    <StaticRouter location={base + url} basename={base}>
      <App />
    </StaticRouter>,
  )
  return await new Response(prelude).text()
}
