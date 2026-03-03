import { defineField, defineType } from 'sanity'

export const suggestionType = defineType({
  name: 'suggestion',
  title: 'Förslag på ändring',
  type: 'document',
  fields: [
    defineField({
      name: 'brandRef',
      title: 'Varumärke',
      type: 'reference',
      to: [{ type: 'brand' }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'brandName',
      title: 'Varumärkesnamn',
      type: 'string',
      description: 'Denormaliserat namn för enkel visning i Studio',
    }),
    defineField({
      name: 'suggestedChanges',
      title: 'Föreslagna ändringar',
      type: 'object',
      fields: [
        defineField({ name: 'varumarke', title: 'Varumärke', type: 'string' }),
        defineField({ name: 'kategori', title: 'Kategori', type: 'string' }),
        defineField({
          name: 'tillverkadISverige',
          title: 'Tillverkad i Sverige',
          type: 'string',
          options: {
            list: ['Ja', 'Nej', 'Delvis'],
          },
        }),
        defineField({
          name: 'tillverkningslander',
          title: 'Tillverkningsländer',
          type: 'array',
          of: [{ type: 'string' }],
        }),
        defineField({ name: 'intro', title: 'Om varumärket', type: 'text' }),
        defineField({ name: 'hallbarhetsFokus', title: 'Hållbarhetsfokus', type: 'string' }),
        defineField({
          name: 'koncernNote',
          title: 'Notering om koncernstruktur',
          type: 'text',
          description: 'Fritext om önskade ändringar i ägarstruktur',
        }),
        defineField({ name: 'kommentarer', title: 'Eventuella kommentarer', type: 'text' }),
      ],
    }),
    defineField({
      name: 'originalValues',
      title: 'Ursprungliga värden',
      type: 'object',
      fields: [
        defineField({ name: 'varumarke', title: 'Varumärke', type: 'string' }),
        defineField({ name: 'kategori', title: 'Kategori', type: 'string' }),
        defineField({
          name: 'tillverkadISverige',
          title: 'Tillverkad i Sverige',
          type: 'string',
        }),
        defineField({
          name: 'tillverkningslander',
          title: 'Tillverkningsländer',
          type: 'array',
          of: [{ type: 'string' }],
        }),
        defineField({ name: 'intro', title: 'Om varumärket', type: 'text' }),
        defineField({ name: 'hallbarhetsFokus', title: 'Hållbarhetsfokus', type: 'string' }),
      ],
    }),
    defineField({
      name: 'email',
      title: 'E-postadress',
      type: 'string',
      description: 'Kontaktadress från inlämnaren',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'submittedAt',
      title: 'Inskickat',
      type: 'datetime',
    }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      initialValue: 'pending',
      options: {
        list: [
          { title: 'Väntar', value: 'pending' },
          { title: 'Granskad', value: 'reviewed' },
          { title: 'Tillämpad', value: 'applied' },
          { title: 'Avvisad', value: 'rejected' },
        ],
        layout: 'radio',
      },
    }),
  ],
  preview: {
    select: {
      title: 'brandName',
      subtitle: 'status',
    },
  },
})
