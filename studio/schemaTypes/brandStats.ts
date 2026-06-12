import { defineField, defineType } from 'sanity'

export const brandStatsType = defineType({
  name: 'brandStats',
  title: 'Varumärkesstatistik',
  type: 'document',
  fields: [
    defineField({ name: 'brandId', title: 'Varumärkes-ID', type: 'string' }),
    defineField({ name: 'brandName', title: 'Varumärkesnamn', type: 'string' }),
    defineField({ name: 'viewCount', title: 'Antal visningar', type: 'number', initialValue: 0 }),
  ],
  preview: {
    select: { title: 'brandName', subtitle: 'viewCount' },
  },
})
