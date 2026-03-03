import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { visionTool } from '@sanity/vision'
import { schemaTypes } from './schemaTypes'
import SuggestionDiffView from './components/SuggestionDiffView'

export default defineConfig({
  name: 'default',
  title: 'Svensk Databas',
  projectId: 'kmjh3e1f',
  dataset: 'production',
  plugins: [
    structureTool({
      defaultDocumentNode: (S, { schemaType }) => {
        if (schemaType === 'suggestion') {
          return S.document().views([
            S.view.form(),
            S.view.component(SuggestionDiffView).title('Ändringar'),
          ])
        }
        return S.document().views([S.view.form()])
      },
    }),
    visionTool(),
  ],
  schema: {
    types: schemaTypes,
  },
})
