/**
 * Migration script: Import brands from src/data/brands.json into Sanity
 *
 * Run from the project root:
 *   SANITY_WRITE_TOKEN=<token> npx tsx studio/migrations/importFromJson.ts
 *
 * The write token was generated when the project was created.
 * Find it at: https://www.sanity.io/manage/project/kmjh3e1f/api
 */

import { createClient } from '@sanity/client'
import { readFileSync } from 'fs'
import { join } from 'path'

const PROJECT_ID = 'kmjh3e1f'
const DATASET = process.env.SANITY_DATASET ?? 'production'
const TOKEN = process.env.SANITY_WRITE_TOKEN

if (!TOKEN) {
  console.error('Error: SANITY_WRITE_TOKEN environment variable is required')
  console.error('Usage: SANITY_WRITE_TOKEN=<token> npx tsx studio/migrations/importFromJson.ts')
  process.exit(1)
}

const client = createClient({
  projectId: PROJECT_ID,
  dataset: DATASET,
  token: TOKEN,
  useCdn: false,
  apiVersion: '2024-01-01',
})

interface BrandInJson {
  id: number
  varumärke: string
  kategori: string
  tillverkadISverige: 'Ja' | 'Nej' | 'Delvis'
  merInfo: {
    moderbolag: string
    ägare: string
    börsnoterat: string
    tillverkningsländer: string[]
    intro?: string
    hallbarhetsFokus?: string
    koncernstruktur:
      | {
          moderbolag: string
          moderbolagLand: string
          ägare: string
          ägareLand: string
          varumärken: Array<{
            namn: string
            land: string
            ärHuvudvarumärke: boolean
            status?: string
          }>
        }
      | string
  }
}

const brandsJsonPath = join(process.cwd(), 'src/data/brands.json')
const brandsJson = JSON.parse(readFileSync(brandsJsonPath, 'utf-8'))
const brands: BrandInJson[] = brandsJson.brands

// Deduplicate koncern groups by moderbolag name
const koncernMap = new Map<string, { id: string; doc: Record<string, unknown> }>()

for (const brand of brands) {
  const ks = brand.merInfo.koncernstruktur
  if (typeof ks === 'string') continue

  const key = ks.moderbolag
  if (!koncernMap.has(key)) {
    const koncernId = `koncern-${key
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')}`
    koncernMap.set(key, {
      id: koncernId,
      doc: {
        _id: koncernId,
        _type: 'koncern',
        moderbolag: ks.moderbolag,
        moderbolagLand: ks.moderbolagLand ?? 'SE',
        agare: ks.ägare ?? '',
        agareLand: ks.ägareLand ?? 'SE',
      },
    })
  }
}

async function migrate() {
  console.log(`Migrating to project: ${PROJECT_ID}, dataset: ${DATASET}`)

  // Step 1: Create/replace all Koncern documents
  console.log(`\nCreating ${koncernMap.size} koncern documents...`)
  for (const { id, doc } of koncernMap.values()) {
    await client.createOrReplace(doc as Parameters<typeof client.createOrReplace>[0])
    console.log(`  ✓ Koncern: ${doc.moderbolag} (${id})`)
  }

  // Step 2: Create/replace all Brand documents
  console.log(`\nCreating ${brands.length} brand documents...`)
  for (const brand of brands) {
    const ks = brand.merInfo.koncernstruktur
    const moderbolag = typeof ks === 'string' ? '' : ks.moderbolag
    const koncernEntry = koncernMap.get(moderbolag)

    // Determine the brand's country from the varumärken list
    let brandLand = 'SE'
    if (typeof ks !== 'string' && Array.isArray(ks.varumärken)) {
      const selfEntry = ks.varumärken.find((v) => v.ärHuvudvarumärke)
      if (selfEntry?.land) brandLand = selfEntry.land
    }

    const brandDoc: Record<string, unknown> = {
      _id: `brand-${brand.id}`,
      _type: 'brand',
      varumarke: brand.varumärke,
      kategori: brand.kategori,
      tillverkadISverige: brand.tillverkadISverige,
      tillverkningslander: brand.merInfo.tillverkningsländer ?? [],
      borsnoterat: brand.merInfo.börsnoterat,
      brandLand,
      intro: brand.merInfo.intro ?? '',
    }

    if (brand.merInfo.hallbarhetsFokus) {
      brandDoc.hallbarhetsFokus = brand.merInfo.hallbarhetsFokus
    }

    if (koncernEntry) {
      brandDoc.koncern = {
        _type: 'reference',
        _ref: koncernEntry.id,
      }
    }

    await client.createOrReplace(brandDoc as Parameters<typeof client.createOrReplace>[0])
    console.log(`  ✓ Brand: ${brand.varumärke} (brand-${brand.id})`)
  }

  console.log('\n✅ Migration complete!')
  console.log(
    `Created ${koncernMap.size} koncern documents and ${brands.length} brand documents.`,
  )
}

migrate().catch((err) => {
  console.error('Migration failed:', err)
  process.exit(1)
})
