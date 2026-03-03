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

  const changedFields = Object.keys(suggestedChanges ?? {})

  return (
    <Box padding={4} style={{ maxWidth: '720px' }}>
      <Card tone="default" padding={4} radius={2} border marginBottom={5}>
        <Stack space={3}>
          <Flex gap={3} align="baseline">
            <Text size={1} weight="semibold" muted style={{ minWidth: '100px' }}>Varumärke</Text>
            <Text size={1}>{brandName ?? '—'}</Text>
          </Flex>
          <Flex gap={3} align="baseline">
            <Text size={1} weight="semibold" muted style={{ minWidth: '100px' }}>E-post</Text>
            <Text size={1}>{email ?? '—'}</Text>
          </Flex>
          <Flex gap={3} align="baseline">
            <Text size={1} weight="semibold" muted style={{ minWidth: '100px' }}>Inskickat</Text>
            <Text size={1}>
              {submittedAt ? new Date(submittedAt).toLocaleString('sv-SE') : '—'}
            </Text>
          </Flex>
          <Flex gap={3} align="center">
            <Text size={1} weight="semibold" muted style={{ minWidth: '100px' }}>Status</Text>
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
                <Box padding={3} style={{ borderBottom: '1px solid var(--card-border-color)' }}>
                  <Text size={1} weight="semibold" muted>{label}</Text>
                </Box>

                {isComment ? (
                  <Box padding={3}>
                    <Text size={1} style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                      {formatValue(newVal)}
                    </Text>
                  </Box>
                ) : (
                  <>
                    {hasOriginal && (
                      <Card tone="critical" padding={3}>
                        <Flex gap={2} align="baseline">
                          <Text size={1} weight="bold">−</Text>
                          <Text size={1}>{formatValue(oldVal)}</Text>
                        </Flex>
                      </Card>
                    )}
                    <Card tone="positive" padding={3}>
                      <Flex gap={2} align="baseline">
                        <Text size={1} weight="bold">+</Text>
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
