import { useEffect, useRef, useState } from 'react'
import videos from '../data/videos.json'
import images from '../data/images.json'
import Img from './Img'
import Video from './Video'
import { Schematic, type Variant } from './Schematic'
import { clipFor } from '../data/media'

/**
 * One media slot, manifest-driven:
 *   1. src/data/videos.json has `video` id  -> lane 08 <Video> (autoplay muted loop, 720p/1080p, poster first)
 *   2. src/data/images.json has `image` id  -> lane 08 <Img> (AVIF/WebP srcset)
 *   3. otherwise                             -> procedural ink/red <Schematic> (intentional, animated)
 * Swap = run scripts/videos.sh / scripts/import-images.mjs with the same ids; no code change needed.
 */
const V = videos as Record<string, unknown>
const I = images as Record<string, unknown>

type Props = {
  variant: Variant
  video?: string
  image?: string
  alt?: string
  ratio?: string
  light?: boolean
  caption?: string
  priority?: boolean
  className?: string
  sweep?: boolean
}

export default function MediaSlot({ variant, video, image, alt = '', ratio = '4 / 3', light, caption, priority, className = '', sweep }: Props) {
  const box = useRef<HTMLDivElement>(null)
  const [vis, setVis] = useState(true)
  const [drawn, setDrawn] = useState(false)
  useEffect(() => {
    const el = box.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => { setVis(e.isIntersecting); if (e.isIntersecting && e.intersectionRatio > 0.2) setDrawn(true) }, { rootMargin: '10% 0px', threshold: [0, 0.25] })
    io.observe(el)
    return () => io.disconnect()
  }, [])
  video = clipFor(video)
  const ar = ratio === 'fill' ? undefined : ratio
  const num = ar ? Number(ar.split('/')[0]) / Number(ar.split('/')[1]) : undefined
  if (video && V[video]) return <Video id={video} label={alt} priority={priority} className={className} ratio={num} cover={ratio === 'fill'} />
  if (image && I[image]) return <Img id={image} alt={alt} priority={priority} className={className} ratio={num} />
  return (
    <div
      ref={box}
      className={`slot ${light ? 'slot--light' : ''} ${vis ? '' : 'paused'} ${className}`}
      data-drawn={drawn ? '1' : '0'}
      style={ar ? { aspectRatio: ar } : undefined}
      role={alt ? 'img' : undefined}
      aria-label={alt || undefined}
      aria-hidden={alt ? undefined : true}
      data-slot={video || image || variant}
    >
      <div className="grid-bg" />
      {sweep && <span className="sweep" />}
      <Schematic variant={variant} light={light} />
      {caption && <span className="slot-cap">{caption}</span>}
    </div>
  )
}
