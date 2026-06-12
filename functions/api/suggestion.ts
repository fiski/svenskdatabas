import { Ctx, json, mutate, cleanString, cleanStringArray, isValidEmail } from '../_lib/sanity'

const CHANGE_KEYS = [
  'varumarke',
  'kategori',
  'tillverkadISverige',
  'intro',
  'hallbarhetsFokus',
  'koncernNote',
  'kommentarer',
] as const

function cleanChanges(value: unknown): Record<string, unknown> {
  const result: Record<string, unknown> = {}
  if (typeof value !== 'object' || value === null) return result
  const obj = value as Record<string, unknown>
  for (const key of CHANGE_KEYS) {
    if (typeof obj[key] === 'string') result[key] = cleanString(obj[key])
  }
  if (obj.tillverkningslander !== undefined) {
    result.tillverkningslander = cleanStringArray(obj.tillverkningslander)
  }
  return result
}

export const onRequestPost = async ({ request, env }: Ctx): Promise<Response> => {
  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return json({ error: 'Ogiltig förfrågan.' }, 400)
  }

  const brandId = cleanString(body.brandId, 100)
  const brandName = cleanString(body.brandName, 100)
  const email = cleanString(body.email, 200)

  if (!brandId || !brandName) {
    return json({ error: 'Obligatoriska fält saknas.' }, 400)
  }
  if (!isValidEmail(email)) {
    return json({ error: 'Ogiltig e-postadress.' }, 400)
  }

  return mutate(env, [
    {
      create: {
        _type: 'suggestion',
        brandRef: { _type: 'reference', _ref: brandId },
        brandName,
        email,
        suggestedChanges: cleanChanges(body.suggestedChanges),
        originalValues: cleanChanges(body.originalValues),
        submittedAt: new Date().toISOString(),
        status: 'pending',
      },
    },
  ])
}
