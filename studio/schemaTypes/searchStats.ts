import { defineField, defineType } from 'sanity'

export const searchStatsType = defineType({
  name: 'searchStats',
  title: 'Sökstatistik',
  type: 'document',
  fields: [
    defineField({ name: 'term', title: 'Sökterm', type: 'string' }),
    defineField({ name: 'searchCount', title: 'Antal sökningar', type: 'number', initialValue: 0 }),
  ],
  preview: {
    select: { title: 'term', subtitle: 'searchCount' },
  },
})
