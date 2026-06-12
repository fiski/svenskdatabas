export interface Env {
  SANITY_PROJECT_ID: string
  SANITY_DATASET: string
  SANITY_WRITE_TOKEN: string
}

export interface Ctx {
  request: Request
  env: Env
}

export function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

export async function mutate(env: Env, mutations: Record<string, unknown>[]): Promise<Response> {
  const url = `https://${env.SANITY_PROJECT_ID}.api.sanity.io/v2024-01-01/data/mutate/${env.SANITY_DATASET}`
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${env.SANITY_WRITE_TOKEN}`,
    },
    body: JSON.stringify({ mutations }),
  })
  if (!res.ok) {
    console.error('Sanity mutate failed:', res.status, await res.text())
    return json({ error: 'Kunde inte spara.' }, 502)
  }
  return json({ ok: true })
}

export function cleanString(value: unknown, maxLength = 2000): string {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : ''
}

export function cleanStringArray(value: unknown, maxItems = 30, maxLength = 100): string[] {
  if (!Array.isArray(value)) return []
  return value
    .filter((v): v is string => typeof v === 'string')
    .slice(0, maxItems)
    .map((v) => v.trim().slice(0, maxLength))
    .filter(Boolean)
}

export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}
