import type { Env } from './sanity'

const STUDIO_URL = 'https://brandsfrom.sanity.studio'
const DEFAULT_FROM = 'Brandsfrom <onboarding@resend.dev>'

export interface Notification {
  subject: string
  heading: string
  rows: [label: string, value: unknown][]
  docId: string
  docType: string
  replyTo?: string
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function formatValue(value: unknown): string {
  if (Array.isArray(value)) return value.join(', ')
  return typeof value === 'string' ? value : ''
}

export function studioLink(docType: string, docId: string): string {
  return `${STUDIO_URL}/intent/edit/id=${docId};type=${docType}`
}

// Fire-and-forget: a failed email is logged but never fails the submission.
export async function sendNotification(env: Env, n: Notification): Promise<void> {
  if (!env.RESEND_API_KEY || !env.NOTIFY_EMAIL) return

  const rows = n.rows
    .map(([label, value]) => [label, formatValue(value)] as const)
    .filter(([, value]) => value)
  const link = studioLink(n.docType, n.docId)

  const html = `
    <h2>${escapeHtml(n.heading)}</h2>
    <table cellpadding="6" style="border-collapse:collapse">
      ${rows
        .map(
          ([label, value]) =>
            `<tr><td style="vertical-align:top"><strong>${escapeHtml(label)}</strong></td><td style="white-space:pre-wrap">${escapeHtml(value)}</td></tr>`,
        )
        .join('')}
    </table>
    <p><a href="${link}">Öppna i Sanity Studio</a></p>`
  const text = `${n.heading}\n\n${rows.map(([l, v]) => `${l}: ${v}`).join('\n')}\n\n${link}`

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: env.NOTIFY_FROM || DEFAULT_FROM,
        to: env.NOTIFY_EMAIL,
        reply_to: n.replyTo,
        subject: n.subject,
        html,
        text,
      }),
    })
    if (!res.ok) console.error('Resend failed:', res.status, await res.text())
  } catch (err) {
    console.error('Resend failed:', err)
  }
}
