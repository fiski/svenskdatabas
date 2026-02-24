import { defineField, defineType } from 'sanity'

export const koncernType = defineType({
  name: 'koncern',
  title: 'Koncern',
  type: 'document',
  fields: [
    defineField({
      name: 'moderbolag',
      title: 'Moderbolag',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'moderbolagLand',
      title: 'Moderbolag land',
      description: 'ISO 3166-1 alpha-2 landkod (t.ex. SE, DE, US)',
      type: 'string',
      validation: (rule) => rule.required().max(2),
    }),
    defineField({
      name: 'agare',
      title: 'Ägare',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'agareLand',
      title: 'Ägareland',
      description: 'ISO 3166-1 alpha-2 landkod (t.ex. SE, DE, US)',
      type: 'string',
      validation: (rule) => rule.required().max(2),
    }),
  ],
  preview: {
    select: {
      title: 'moderbolag',
      subtitle: 'agare',
    },
  },
})
