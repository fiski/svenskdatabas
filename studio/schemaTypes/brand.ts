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
      name: 'webbplats',
      title: 'Webbplats',
      type: 'url',
    }),
    defineField({
      name: 'kallor',
      title: 'Källor',
      description: 'Källhänvisningar som styrker uppgifterna (ägarskap, tillverkning m.m.)',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'url',
              title: 'Länk',
              type: 'url',
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'label',
              title: 'Beskrivning',
              description: 'Valfri etikett, t.ex. "Ägarstruktur" eller "Årsredovisning 2024". Visas annars domännamnet.',
              type: 'string',
            }),
          ],
          preview: {
            select: {
              title: 'label',
              subtitle: 'url',
            },
            prepare({ title, subtitle }) {
              return {
                title: title || subtitle,
                subtitle: title ? subtitle : undefined,
              }
            },
          },
        },
      ],
    }),
    defineField({
      name: 'senastVerifierad',
      title: 'Senast verifierad',
      description: 'Datum då uppgifterna senast kontrollerades mot källor.',
      type: 'date',
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
