import { postApi } from './api'

export function trackBrandView(brandId: string, brandName: string): void {
  const key = `viewed_${brandId}`
  const last = localStorage.getItem(key)
  if (last && Date.now() - Number(last) < 300_000) return
  localStorage.setItem(key, String(Date.now()))

  postApi('/api/track', { kind: 'brandView', brandId, brandName }).catch(() => {})
}

export function trackSearch(term: string): void {
  const normalized = term.trim().toLowerCase()
  if (!normalized) return

  postApi('/api/track', { kind: 'search', term: normalized }).catch(() => {})
}
