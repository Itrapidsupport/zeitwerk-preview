// Web derivatives of the 12000x9000 poster masters (master/ folder, rendered by qa/master.mjs + qa/master.py).
import l640 from './assets/poster-light-640.webp'
import l960 from './assets/poster-light-960.webp'
import l1280 from './assets/poster-light-1280.webp'
import l1600 from './assets/poster-light-1600.webp'
import l2400 from './assets/poster-light-2400.webp'
import l3200 from './assets/poster-light-3200.webp'
import d640 from './assets/poster-dark-640.webp'
import d960 from './assets/poster-dark-960.webp'
import d1280 from './assets/poster-dark-1280.webp'
import d1600 from './assets/poster-dark-1600.webp'
import d2400 from './assets/poster-dark-2400.webp'
import d3200 from './assets/poster-dark-3200.webp'

const set = (a: [number, string][]) => a.map(([w, u]) => `${u} ${w}w`).join(', ')

export const POSTERS = {
  light: { src: l1600, srcSet: set([[640, l640], [960, l960], [1280, l1280], [1600, l1600], [2400, l2400], [3200, l3200]]) },
  dark: { src: d1600, srcSet: set([[640, d640], [960, d960], [1280, d1280], [1600, d1600], [2400, d2400], [3200, d3200]]) },
} as const
