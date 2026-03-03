import { Box, Card, Stack, Text, Flex, Badge } from '@sanity/ui'

const FIELD_LABELS: Record<string, string> = {
  varumarke: 'Varumärke',
  kategori: 'Kategori',
  tillverkadISverige: 'Tillverkad i Sverige',
  tillverkningslander: 'Tillverkningsländer',
  intro: 'Om varumärket',
  hallbarhetsFokus: 'Hållbarhetsfokus',
  koncernNote: 'Notering om koncernstruktur',
  kommentarer: 'Eventuella kommentarer',
}

// These fields are plain comments — no diff styling, just readable text
const COMMENT_FIELDS = new Set(['koncernNote', 'kommentarer'])

function formatValue(value: unknown): string {
  if (Array.isArray(value)) return value.join(', ') || '(tom)'
  if (value === null || value === undefined || value === '') return '(tom)'
  return String(value)
}

function getStatusTone(status?: string): 'caution' | 'positive' | 'critical' {
  switch (status) {
    case 'approved':
      return 'positive'
    case 'rejected':
      return 'critical'
    default:
      return 'caution'
  }
}

interface SuggestionDocument {
  brandName?: string
  email?: string
  submittedAt?: string
  status?: string
  suggestedChanges?: Record<string, unknown>
  originalValues?: Record<string, unknown>
}

interface SuggestionDiffViewProps {
  document: {
    displayed: SuggestionDocument
  }
}

export default function SuggestionDiffView({ document }: SuggestionDiffViewProps) {
  const doc = document.displayed

  if (!doc) {
    return (
      <Box padding={4}>
        <Text>Inget dokument valt.</Text>
      </Box>
    )
  }

  const { brandName, email, submittedAt, status, suggestedChanges, originalValues } = doc

  const changedFields = Object.keys(suggestedChanges ?? {}).filter((field) => {
    if (COMMENT_FIELDS.has(field)) return true
    const newVal = suggestedChanges?.[field]
    const oldVal = originalValues?.[field]
    if (originalValues == null || !(field in originalValues)) return true
    return formatValue(newVal) !== formatValue(oldVal)
  })

  return (
    <Box padding={4} style={{ maxWidth: '720px' }}>
      <Card tone="default" padding={4} radius={2} border marginBottom={5}>
        <Stack space={3}>
          <Flex gap={3} align="baseline">
            <Text size={1} weight="semibold" muted>Varumärke</Text>
            <Text size={1}>{brandName ?? '—'}</Text>
          </Flex>
          <Flex gap={3} align="baseline">
            <Text size={1} weight="semibold" muted>E-post</Text>
            <Text size={1}>{email ?? '—'}</Text>
          </Flex>
          <Flex gap={3} align="baseline">
            <Text size={1} weight="semibold" muted>Inskickat</Text>
            <Text size={1}>
              {submittedAt ? new Date(submittedAt).toLocaleString('sv-SE') : '—'}
            </Text>
          </Flex>
          <Flex gap={3} align="center">
            <Text size={1} weight="semibold" muted>Status</Text>
            <Badge tone={getStatusTone(status)} radius={5} padding={2}>
              {status ?? '—'}
            </Badge>
          </Flex>
        </Stack>
      </Card>

      <Box marginBottom={4}>
        <Text size={2} weight="semibold">Föreslagna ändringar</Text>
      </Box>

      {changedFields.length === 0 ? (
        <Text muted>Inga ändringar registrerade.</Text>
      ) : (
        <Stack space={4}>
          {changedFields.map((field) => {
            const label = FIELD_LABELS[field] ?? field
            const newVal = suggestedChanges?.[field]
            const oldVal = originalValues?.[field]
            const hasOriginal = originalValues != null && field in originalValues
            const isComment = COMMENT_FIELDS.has(field)

            return (
              <Card key={field} radius={2} border overflow="hidden">
                <Box padding={3}>
                  <Text size={1} weight="semibold" muted>{label}</Text>
                </Box>

                {isComment ? (
                  <Box padding={3}>
                    <Text size={1}>{formatValue(newVal)}</Text>
                  </Box>
                ) : (
                  <>
                    {hasOriginal && (
                      <Box padding={3}>
                        <Text size={1} muted>{formatValue(oldVal)}</Text>
                      </Box>
                    )}
                    <Card tone="positive" padding={3}>
                      <Flex gap={2} align="baseline">
                        <Text size={1} weight="semibold" muted>Förslag</Text>
                        <Text size={1}>{formatValue(newVal)}</Text>
                      </Flex>
                    </Card>
                  </>
                )}
              </Card>
            )
          })}
        </Stack>
      )}
    </Box>
  )
}
