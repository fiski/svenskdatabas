import { Ctx, json, mutate, cleanString, cleanStringArray, isValidEmail } from '../_lib/sanity'
import { sendNotification } from '../_lib/notify'

const CHANGE_KEYS = [
  'varumarke',
  'kategori',
  'tillverkadISverige',
  'intro',
  'hallbarhetsFokus',
  'koncernNote',
  'kommentarer',
] as const

// Free-text additions with no original value to diff against.
const NOTE_KEYS = ['koncernNote', 'kommentarer', 'kallor']

const FIELD_LABELS: Record<string, string> = {
  varumarke: 'Varumärke',
  kategori: 'Kategori',
  tillverkadISverige: 'Tillverkad i Sverige',
  tillverkningslander: 'Tillverkningsländer',
  intro: 'Om varumärket',
  hallbarhetsFokus: 'Hållbarhetsfokus',
  koncernNote: 'Koncern',
  kommentarer: 'Kommentarer',
  kallor: 'Källor',
}

function display(value: unknown): string {
  if (Array.isArray(value)) return value.join(', ')
  return typeof value === 'string' && value ? value : '(tomt)'
}

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
  if (obj.kallor !== undefined) {
    result.kallor = cleanStringArray(obj.kallor)
  }
  return result
}

export const onRequestPost = async ({ request, env, waitUntil }: Ctx): Promise<Response> => {
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

  const suggestedChanges = cleanChanges(body.suggestedChanges)
  const originalValues = cleanChanges(body.originalValues)
  const docId = crypto.randomUUID()

  const res = await mutate(env, [
    {
      create: {
        _id: docId,
        _type: 'suggestion',
        brandRef: { _type: 'reference', _ref: brandId },
        brandName,
        email,
        suggestedChanges,
        originalValues,
        submittedAt: new Date().toISOString(),
        status: 'pending',
      },
    },
  ])
  if (res.ok) {
    const changeRows = Object.entries(suggestedChanges).map(([key, value]): [string, string] =>
      NOTE_KEYS.includes(key)
        ? [FIELD_LABELS[key], display(value)]
        : [FIELD_LABELS[key] ?? key, `${display(originalValues[key])}\n→ ${display(value)}`],
    )
    waitUntil(
      sendNotification(env, {
        subject: `Ändringsförslag: ${brandName}`,
        heading: `Ändringsförslag för ${brandName}`,
        docId,
        docType: 'suggestion',
        replyTo: email,
        rows: [...changeRows, ['Skickat av', email]],
      }),
    )
  }
  return res
}
