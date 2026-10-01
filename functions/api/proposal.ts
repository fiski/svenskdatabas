import { Ctx, json, mutate, cleanString, cleanStringArray, isValidEmail } from '../_lib/sanity'
import { sendNotification } from '../_lib/notify'

const STATUS_VALUES = ['Ja', 'Nej', 'Delvis']
const BORSNOTERAT_VALUES = ['Ja', 'Nej']

export const onRequestPost = async ({ request, env, waitUntil }: Ctx): Promise<Response> => {
  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return json({ error: 'Ogiltig förfrågan.' }, 400)
  }

  const varumarke = cleanString(body.varumarke, 100)
  const kategori = cleanString(body.kategori, 100)
  const tillverkadISverige = cleanString(body.tillverkadISverige, 10)
  const email = cleanString(body.email, 200)

  if (!varumarke || !kategori || !STATUS_VALUES.includes(tillverkadISverige)) {
    return json({ error: 'Obligatoriska fält saknas.' }, 400)
  }
  if (!isValidEmail(email)) {
    return json({ error: 'Ogiltig e-postadress.' }, 400)
  }

  const borsnoterat = cleanString(body.borsnoterat, 10)

  const proposal = {
    _id: crypto.randomUUID(),
    _type: 'brandProposal',
    varumarke,
    kategori,
    tillverkadISverige,
    borsnoterat: BORSNOTERAT_VALUES.includes(borsnoterat) ? borsnoterat : '',
    brandLand: cleanString(body.brandLand, 2),
    tillverkningslander: cleanStringArray(body.tillverkningslander),
    moderbolag: cleanString(body.moderbolag, 200),
    moderbolagLand: cleanString(body.moderbolagLand, 2),
    agare: cleanString(body.agare, 200),
    agareLand: cleanString(body.agareLand, 2),
    intro: cleanString(body.intro),
    hallbarhetsFokus: cleanString(body.hallbarhetsFokus, 500),
    kallor: cleanStringArray(body.kallor),
    kommentarer: cleanString(body.kommentarer),
    email,
    submittedAt: new Date().toISOString(),
    status: 'pending',
  }

  const res = await mutate(env, [{ create: proposal }])
  if (res.ok) {
    waitUntil(
      sendNotification(env, {
        subject: `Nytt varumärkesförslag: ${varumarke}`,
        heading: `Nytt varumärke föreslaget: ${varumarke}`,
        docId: proposal._id,
        docType: 'brandProposal',
        replyTo: email,
        rows: [
          ['Kategori', proposal.kategori],
          ['Tillverkad i Sverige', proposal.tillverkadISverige],
          ['Tillverkningsländer', proposal.tillverkningslander],
          ['Moderbolag', proposal.moderbolag],
          ['Ägare', proposal.agare],
          ['Börsnoterat', proposal.borsnoterat],
          ['Om varumärket', proposal.intro],
          ['Hållbarhetsfokus', proposal.hallbarhetsFokus],
          ['Källor', proposal.kallor],
          ['Kommentarer', proposal.kommentarer],
          ['Skickat av', email],
        ],
      }),
    )
  }
  return res
}
