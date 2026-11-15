# Lane 08 — Scaffold + deploy pipeline (Zeitwerk preview)

The production app skeleton is in `../app/`. Lane 08 owns that folder. Everything is PREVIEW ONLY: the site carries `noindex,nofollow`, and `robots.txt` contains `Disallow: /`. Nothing here touches zeitwerk.ca, Render, DNS or NaukhanGreenwin/Zeitwerk.

- Preview URL: https://itrapidsupport.github.io/zeitwerk-preview/
- Repo: https://github.com/Itrapidsupport/zeitwerk-preview (public). `main` holds the app source and `gh-pages` holds the built `dist/`, which Pages serves.
- Stack: Vite 8, React 19.3, TypeScript 6, Tailwind 4 (`@tailwindcss/vite`), react-router-dom 7. framer-motion, gsap, lenis, three, @react-three/fiber and drei are installed but not imported yet (they are for lanes 06/07). Playwright 1.65 and @axe-core/playwright are dev deps.

## Commands (run in `app/`)
| | |
|---|---|
| `npm run dev` | Vite dev server |
| `npm run build` | `tsc -b` + `vite build` + `scripts/postbuild.mjs`. Writes `dist/<route>/index.html` for each route with that route's SEO head baked in, so deep links return 200 with the right title. Also writes `dist/404.html`, the SPA shell for unknown paths, which GH Pages serves with a 404 status before the router renders NotFound. |
| `npm run serve` | Local server that copies GH Pages behaviour: `http://localhost:4173/zeitwerk-preview/`, 404.html fallback and Range support for video |
| `npm run qa` | `qa/run.cjs`. Runs Chromium 1440x900 and WebKit iPhone 390x844 on every route plus one 404 route, and checks: horizontal overflow, broken images, failed requests or HTTP 4xx, console and page errors, noindex present, exactly one h1, focus visible on the first 6 Tab stops, axe WCAG 2.1 A/AA (Chromium), and that a video in view is actually playing. It also tests the mobile menu (opens, locks scroll, makes main inert, traps focus, Escape closes). Screenshots and `report.json` go to `qa/out/`. Exits 1 on any failure. `--url <deployed base>` tests the live preview. |
| `npm run lighthouse` | `qa/lighthouse.sh [base-url]`. Runs Lighthouse 12 mobile on home, services, a project and contact, using Playwright's Chromium. The SEO score is low on purpose because of noindex. |
| `npm run deploy` | `scripts/deploy.sh "msg"`. Builds, refuses if noindex is missing or any file is over 10 MB, then force-pushes source to `main` and `dist` to `gh-pages`. The token comes from `$GH_TOKEN` or `~/.hermes/cache/scratch/.zw08tok` (the same Itrapidsupport-capable token the wop-site-preview deploy used). Set `SKIP_BUILD=1` to reuse the existing dist. |
| `bash scripts/videos.sh <master> <id> [...]` | Encodes video (see below) |

Last QA result: 33 checks, 0 failures.

## Routes (`src/App.tsx`)
`/`, `/services`, `/services/:slug` (ai-receptionist, quote-automation, invoice-follow-up, inbox-triage, document-intake, reporting-dashboards), `/projects`, `/projects/:slug` (property-intelligence-platform, intelligent-collections-engine), `/approach`, `/contact`, `/privacy`, `/terms`, and `*` for the 404. Unknown slugs render NotFound. Home is in the entry chunk and every other route is lazy-loaded.

## File map (`app/`)
- `index.html`: the noindex meta, the `<!--SEO:START/END-->` block that postbuild replaces, the OG image and the font preload.
- `src/styles/tokens.css`: **SWAP POINT for lane 03.** It holds the provisional `--zw-*` tokens (colour, type scale, spacing, motion easings) and the General Sans @font-face. Replace this file and keep the variable names, or remap them in the `@theme inline` block of `src/styles.css`. That block maps them to Tailwind as `bg-ink`, `text-red`, `text-red-ink`, `border-line`, `text-mute`, `bg-paper`, `font-display` and `font-sans`.
- `src/styles.css`: Tailwind import, base styles, `.wrap`, `.eyebrow`, `.btn`, `.btn-red`, `.link-u`, skip link, a global reduced-motion clamp, and `@keyframes zw-rise`.
- `src/data/site.ts`: **placeholder content for lanes 01/04 to replace.** It exports `SITE`, `SERVICES`, `PROJECTS`, `APPROACH` and `NAV`. All text is taken from live zeitwerk.ca. The contact email `nkhan@zeitwerk.ca` comes from the live Organization schema.
- `src/data/seo.ts`: **for lane 09.** Holds per-route title and description, `seoFor(path)` and `canonical(path)`, with canonical origin `https://zeitwerk.ca`. The runtime `<Seo/>` and the build-time postbuild both use it. The /approach and /contact strings are placeholders.
- `src/lib/Seo.tsx`: updates title, description, og:* and canonical on navigation. Accepts `<Seo override={{title,description}} />`.
- `src/lib/env.ts`: `BASE`, `asset(p)`, `prefersReduced()` (`?reduce` in the URL forces it), `useReducedMotion()`, `useMedia(q)`.
- `src/components/Layout.tsx`: skip link, Seo, Header, `<main id="main">`, Footer. Scrolls to top and moves focus to main on route change, using `window.__lenis` if the motion lane exposes it.
- `src/components/Header.tsx`: opaque sticky header (`bg-paper`, no blur), with a hairline border once scrolled. Height is `--zw-header-h` (68px).
- `src/components/MobileMenu.tsx`: full-screen opaque dialog. Focus trap cycles manually, which also covers WebKit's link-skipping Tab. Escape closes and returns focus to the toggle. Scroll lock uses iOS-safe body `position:fixed` and restores the scroll position. `main` and `footer` are made inert while it is open.
- `src/components/Footer.tsx`, `src/components/Mark.tsx` (`<Mark size/>` and `<Logo/>` using the brand SVG geometry).
- `src/components/Img.tsx`: `<Img id alt sizes ratio priority fit className/>` renders a `<picture>` with AVIF and WebP srcset from `src/data/images.json`. The manifest format is `{id:{w,h,ws:[480,960,...],lqip}}` and the files are `public/img/<id>-<w>.{avif,webp}`. It reserves the aspect ratio, so CLS is 0. Images are lazy unless `priority` is set, which switches to eager and fetchpriority high. An unknown id renders a branded ink placeholder block with `data-slot`. Slot ids used so far: `project-<slug>` and `service-<slug>`. Lane 05 generates derivatives with a script like the Artistic one (`artistic-site/app/scripts/images.py`) and writes `images.json`.
- `src/components/Video.tsx`: **video pipeline.** `<Video id label? priority? ratio? fit? className?/>` plays muted, looping, inline and autoplay. It uses 720p at 768px wide or less and 1080p above, with WebM (VP9) listed first and MP4 (H.264) as the fallback. A poster `<picture>` (webp, then jpg) is always shown first. Below the fold, the `<video>` only mounts within 25% of the viewport. `priority` mounts it immediately with `preload=auto`. It pauses when offscreen (IntersectionObserver) or when the tab is hidden. With reduced motion or Save-Data it shows the poster only and downloads no video. The aspect ratio comes from the manifest. Pass `label` only if the clip carries meaning; otherwise it is aria-hidden.
- `scripts/videos.sh`: `bash scripts/videos.sh master.mp4 hero master2.mov section-1 ...`. Takes masters (HappyHorse clips) and writes `public/video/<id>-{1080,720}.{mp4,webm}` and `<id>-poster.{jpg,webp}`. Audio is stripped, output is 30fps, and MP4s get faststart. It updates `src/data/videos.json` and prints an OVER BUDGET warning for any 720p file over 3 MB or any file over 10 MB. Files are committed as **plain git files, not Git LFS**, because GitHub Pages does not serve LFS. `deploy.sh` refuses any file over 10 MB.
  - Current `hero` and `approach` clips are a **synthetic placeholder**: an ffmpeg-drawn ink grid with a red sweep, about 50 KB. It exists only to prove the pipeline. Lane 06 or the HappyHorse clips replace it by re-running `videos.sh` with the same ids.
- `src/components/Reveal.tsx`: provisional straight fade-and-rise reveal (no skew or rotate). Content is visible with reduced motion. Lane 07 replaces it and should keep the `as`, `delay` and `className` props.
- `src/components/ContactForm.tsx`: accessible form (labels, inline errors, aria-invalid, focus moves to the first error, live status). Submit composes a `mailto:` to `SITE.email`. There is no backend and no paid service.
- `src/components/ui.tsx`: `PageHero`, `Rule`, `CtaBand` (placeholder layout).
- `src/pages/*`: placeholder pages wired to the data. Lanes 02/04/06/07 restyle them.
- `public/`: `robots.txt` (Disallow all), `.nojekyll`, `mark.svg`, `og.png` (1200x630, brand mark and wordmark), `fonts/GeneralSans-{Medium,Semibold}.woff2` (with the FFL licence txt), `video/`. Inter comes from `@fontsource-variable/inter`.
- `qa/run.cjs`, `qa/lighthouse.sh`, `scripts/serve.cjs`, `scripts/postbuild.mjs`, `scripts/deploy.sh`.

## Integration notes
1. Tokens: drop lane 03's file in as `src/styles/tokens.css`, or `@import` it there.
2. Content: replace `src/data/site.ts` and keep the shapes, or adapt the pages. SEO strings live in `src/data/seo.ts`, and postbuild picks up any new route listed there automatically. New routes also need an entry in `App.tsx`.
3. 3D and motion: the deps are installed. Use `manualChunks` in `vite.config.ts`, which already splits three, gsap and motion. Gate WebGL behind `useReducedMotion()`.
4. Base path: `VITE_BASE=/ npm run build` builds for root hosting. To launch on a real domain, remove the robots meta and robots.txt. That step belongs to the integration lane and needs NK's approval.
5. Use `SKIP_BUILD=1 bash scripts/deploy.sh "msg"` after a build that passes QA.

## Open questions
- Contact email: the live schema uses `nkhan@zeitwerk.ca` and the privacy page uses `hello@zeitwerk.ca`. The scaffold uses nkhan@ for the form and footer, and hello@ only on the legal pages.
- `/approach` and `/contact` titles and descriptions are placeholders because those pages are not on the live site.
- Privacy and terms are summary stubs. The integration lane should port the full text from live zeitwerk.ca word for word.
- The live projects index also lists "Innovation Hub" and other projects that have no detail page. Only the two sitemap case studies are routed.
