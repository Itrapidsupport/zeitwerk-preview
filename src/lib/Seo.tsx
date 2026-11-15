import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { canonical, seoFor } from '../data/seo'

function setMeta(attr: 'name' | 'property', key: string, value: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.content = value
}

/** Keeps <head> in sync on client-side navigation (prerendered HTML already carries it). robots stays noindex. */
export default function Seo() {
  const { pathname } = useLocation()
  useEffect(() => {
    const e = seoFor(pathname)
    const url = e.path === '/404' ? canonical('/') : canonical(pathname)
    document.title = e.title
    setMeta('name', 'description', e.description)
    setMeta('property', 'og:title', e.ogTitle ?? e.title)
    setMeta('property', 'og:description', e.ogDescription ?? e.description)
    setMeta('property', 'og:url', url)
    let link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
    if (!link) {
      link = document.createElement('link')
      link.rel = 'canonical'
      document.head.appendChild(link)
    }
    link.href = url
    const ld = document.head.querySelector('script[type="application/ld+json"]')
    if (e.jsonld) {
      const s = ld ?? document.head.appendChild(Object.assign(document.createElement('script'), { type: 'application/ld+json' }))
      s.textContent = JSON.stringify(e.jsonld)
    } else ld?.remove()
  }, [pathname])
  return null
}
