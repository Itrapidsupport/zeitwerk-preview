/**
 * Slot -> lane 11 clip id. NK 2026-11-15 1:17 PM: real footage ONLY in the home hero; every other slot
 * (service cards, service headers, projects, bands) uses the vector illustration system (components/Schematic.tsx).
 */
export const CLIP: Record<string, string> = {
  hero: 'hero-escapement',
}
export const clipFor = (slot?: string) => (slot ? CLIP[slot] ?? slot : undefined)
