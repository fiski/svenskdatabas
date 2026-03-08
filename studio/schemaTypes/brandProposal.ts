import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'brandProposal',
  title: 'Nytt varumärke (förslag)',
  type: 'document',
  fields: [
    defineField({ name: 'varumarke', title: 'Varumärke', type: 'string' }),
    defineField({ name: 'kategori', title: 'Kategori', type: 'string' }),
    defineField({
      name: 'tillverkadISverige', title: 'Tillverkad i Sverige', type: 'string',
      options: { list: ['Ja', 'Nej', 'Delvis'], layout: 'radio' },
    }),
    defineField({
      name: 'borsnoterat', title: 'Börsnoterat', type: 'string',
      options: { list: ['Ja', 'Nej'], layout: 'radio' },
    }),
    defineField({ name: 'brandLand', title: 'Varumärkets land (ISO)', type: 'string' }),
    defineField({
      name: 'tillverkningslander', title: 'Tillverkningsländer', type: 'array',
      of: [{ type: 'string' }],
    }),
    defineField({ name: 'moderbolag', title: 'Moderbolag', type: 'string' }),
    defineField({ name: 'moderbolagLand', title: 'Moderbolagets land (ISO)', type: 'string' }),
    defineField({ name: 'agare', title: 'Ägare', type: 'string' }),
    defineField({ name: 'agareLand', title: 'Ägarens land (ISO)', type: 'string' }),
    defineField({ name: 'intro', title: 'Om varumärket', type: 'text' }),
    defineField({ name: 'hallbarhetsFokus', title: 'Hållbarhetsfokus', type: 'string' }),
    defineField({ name: 'kommentarer', title: 'Kommentarer', type: 'text' }),
    defineField({ name: 'email', title: 'Avsändarens e-post', type: 'string' }),
    defineField({ name: 'submittedAt', title: 'Skickat', type: 'datetime' }),
    defineField({
      name: 'status', title: 'Status', type: 'string',
      options: { list: ['pending', 'reviewed', 'applied', 'rejected'], layout: 'radio' },
      initialValue: 'pending',
    }),
  ],
})
