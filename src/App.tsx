import { lazy, Suspense, useEffect } from 'react'
import { Route, Routes, useNavigate } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'

// Route-level code splitting; Home stays in the entry chunk. The prerender step (react-dom/static)
// waits for every lazy route, so each dist/<route>/index.html carries the full page markup.
const Services = lazy(() => import('./pages/Services'))
const ServiceDetail = lazy(() => import('./pages/ServiceDetail'))
const Projects = lazy(() => import('./pages/Projects'))
const ProjectDetail = lazy(() => import('./pages/ProjectDetail'))
const Approach = lazy(() => import('./pages/Approach'))
const Contact = lazy(() => import('./pages/Contact'))
const Legal = lazy(() => import('./pages/Legal'))
const NotFound = lazy(() => import('./pages/NotFound'))

/** Bridges raw <a> CTAs (MagneticButton) to client-side navigation. */
function NavBridge() {
  const nav = useNavigate()
  useEffect(() => {
    const on = (e: Event) => nav((e as CustomEvent<string>).detail)
    window.addEventListener('zw:navigate', on)
    return () => window.removeEventListener('zw:navigate', on)
  }, [nav])
  return null
}

export default function App() {
  return (
    <>
      <NavBridge />
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="services" element={<S><Services /></S>} />
          <Route path="services/:slug" element={<S><ServiceDetail /></S>} />
          <Route path="projects" element={<S><Projects /></S>} />
          <Route path="projects/:slug" element={<S><ProjectDetail /></S>} />
          <Route path="approach" element={<S><Approach /></S>} />
          <Route path="contact" element={<S><Contact /></S>} />
          <Route path="privacy" element={<S><Legal kind="privacy" /></S>} />
          <Route path="terms" element={<S><Legal kind="terms" /></S>} />
          <Route path="*" element={<S><NotFound /></S>} />
        </Route>
      </Routes>
    </>
  )
}

function S({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<div className="min-h-[100svh]" aria-busy="true" />}>{children}</Suspense>
}
