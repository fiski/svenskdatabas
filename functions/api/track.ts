import { Ctx, json, mutate, cleanString } from '../_lib/sanity'

export const onRequestPost = async ({ request, env }: Ctx): Promise<Response> => {
  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return json({ error: 'Ogiltig förfrågan.' }, 400)
  }

  const kind = cleanString(body.kind, 20)

  if (kind === 'brandView') {
    const brandId = cleanString(body.brandId, 100)
    const brandName = cleanString(body.brandName, 100)
    if (!brandId || !brandName) return json({ error: 'Obligatoriska fält saknas.' }, 400)

    const docId = `brandStats-${brandId}`
    return mutate(env, [
      { createIfNotExists: { _id: docId, _type: 'brandStats', brandId, brandName, viewCount: 0 } },
      { patch: { id: docId, inc: { viewCount: 1 } } },
    ])
  }

  if (kind === 'search') {
    const term = cleanString(body.term, 100).toLowerCase()
    if (!term) return json({ error: 'Obligatoriska fält saknas.' }, 400)

    const slug = term.replace(/[^a-z0-9åäö]/g, '-').slice(0, 80)
    const docId = `searchStats-${slug}`
    return mutate(env, [
      { createIfNotExists: { _id: docId, _type: 'searchStats', term, searchCount: 0 } },
      { patch: { id: docId, inc: { searchCount: 1 } } },
    ])
  }

  return json({ error: 'Okänd typ.' }, 400)
}
