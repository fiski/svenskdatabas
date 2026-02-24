import { defineField, defineType } from 'sanity'

export const brandType = defineType({
  name: 'brand',
  title: 'Varumärke',
  type: 'document',
  fields: [
    defineField({
      name: 'varumarke',
      title: 'Varumärke',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'kategori',
      title: 'Kategori',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'tillverkadISverige',
      title: 'Tillverkad i Sverige',
      type: 'string',
      options: {
        list: [
          { title: 'Ja', value: 'Ja' },
          { title: 'Nej', value: 'Nej' },
          { title: 'Delvis', value: 'Delvis' },
        ],
        layout: 'radio',
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'tillverkningslander',
      title: 'Tillverkningsländer',
      type: 'array',
      of: [{ type: 'string' }],
    }),
    defineField({
      name: 'borsnoterat',
      title: 'Börsnoterat',
      type: 'string',
      options: {
        list: [
          { title: 'Ja', value: 'Ja' },
          { title: 'Nej', value: 'Nej' },
        ],
        layout: 'radio',
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'brandLand',
      title: 'Varumärkets land',
      description: 'ISO 3166-1 alpha-2 landkod (standard: SE)',
      type: 'string',
      initialValue: 'SE',
      validation: (rule) => rule.required().max(2),
    }),
    defineField({
      name: 'intro',
      title: 'Om varumärket',
      type: 'text',
      rows: 4,
    }),
    defineField({
      name: 'hallbarhetsFokus',
      title: 'Hållbarhetsfokus',
      type: 'string',
    }),
    defineField({
      name: 'koncern',
      title: 'Koncern',
      type: 'reference',
      to: [{ type: 'koncern' }],
    }),
  ],
  preview: {
    select: {
      title: 'varumarke',
      subtitle: 'tillverkadISverige',
    },
  },
})
