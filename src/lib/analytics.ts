import { sanityWriteClient } from './sanityClient'

export function trackBrandView(brandId: string, brandName: string): void {
  const key = `viewed_${brandId}`
  const last = localStorage.getItem(key)
  if (last && Date.now() - Number(last) < 300_000) return
  localStorage.setItem(key, String(Date.now()))

  const docId = `brandStats-${brandId}`
  sanityWriteClient
    .transaction()
    .createIfNotExists({ _id: docId, _type: 'brandStats', brandId, brandName, viewCount: 0 })
    .patch(docId, (p) => p.inc({ viewCount: 1 }))
    .commit()
    .catch(() => {})
}

export function trackSearch(term: string): void {
  const normalized = term.trim().toLowerCase()
  if (!normalized) return
  const slug = normalized.replace(/[^a-z0-9åäö]/g, '-').slice(0, 80)
  const docId = `searchStats-${slug}`

  sanityWriteClient
    .transaction()
    .createIfNotExists({ _id: docId, _type: 'searchStats', term: normalized, searchCount: 0 })
    .patch(docId, (p) => p.inc({ searchCount: 1 }))
    .commit()
    .catch(() => {})
}
