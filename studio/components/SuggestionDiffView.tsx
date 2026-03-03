import React from 'react'

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

function formatValue(value: unknown): string {
  if (Array.isArray(value)) return value.join(', ') || '(tom)'
  if (value === null || value === undefined || value === '') return '(tom)'
  return String(value)
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
    return <div style={styles.container}>Inget dokument valt.</div>
  }

  const { brandName, email, submittedAt, status, suggestedChanges, originalValues } = doc

  const changedFields = Object.keys(suggestedChanges ?? {})

  return (
    <div style={styles.container}>
      <div style={styles.meta}>
        <div style={styles.metaRow}>
          <span style={styles.metaLabel}>Varumärke</span>
          <span style={styles.metaValue}>{brandName ?? '—'}</span>
        </div>
        <div style={styles.metaRow}>
          <span style={styles.metaLabel}>E-post</span>
          <span style={styles.metaValue}>{email ?? '—'}</span>
        </div>
        <div style={styles.metaRow}>
          <span style={styles.metaLabel}>Inskickat</span>
          <span style={styles.metaValue}>
            {submittedAt ? new Date(submittedAt).toLocaleString('sv-SE') : '—'}
          </span>
        </div>
        <div style={styles.metaRow}>
          <span style={styles.metaLabel}>Status</span>
          <span style={{ ...styles.statusBadge, ...getStatusStyle(status) }}>
            {status ?? '—'}
          </span>
        </div>
      </div>

      <h3 style={styles.heading}>Föreslagna ändringar</h3>

      {changedFields.length === 0 ? (
        <p style={styles.emptyState}>Inga ändringar registrerade.</p>
      ) : (
        <div style={styles.diffList}>
          {changedFields.map((field) => {
            const label = FIELD_LABELS[field] ?? field
            const newVal = suggestedChanges?.[field]
            const oldVal = originalValues?.[field]
            const hasOriginal = originalValues != null && field in originalValues

            return (
              <div key={field} style={styles.diffBlock}>
                <div style={styles.fieldLabel}>{label}</div>
                {hasOriginal && (
                  <div style={styles.removedLine}>
                    <span style={styles.diffMarker}>−</span>
                    <span>{formatValue(oldVal)}</span>
                  </div>
                )}
                <div style={styles.addedLine}>
                  <span style={styles.diffMarker}>+</span>
                  <span>{formatValue(newVal)}</span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function getStatusStyle(status?: string): React.CSSProperties {
  switch (status) {
    case 'approved':
      return { background: '#99dec9', color: '#004530' }
    case 'rejected':
      return { background: '#edb0ab', color: '#7e211a' }
    default:
      return { background: '#e8e8e8', color: '#444' }
  }
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: '24px',
    fontFamily: 'sans-serif',
    maxWidth: '720px',
  },
  meta: {
    background: '#f5f5f5',
    border: '1px solid #ddd',
    borderRadius: '8px',
    padding: '16px',
    marginBottom: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  metaRow: {
    display: 'flex',
    gap: '12px',
    alignItems: 'baseline',
  },
  metaLabel: {
    fontWeight: 600,
    fontSize: '13px',
    color: '#555',
    minWidth: '100px',
  },
  metaValue: {
    fontSize: '14px',
    color: '#222',
  },
  statusBadge: {
    display: 'inline-block',
    padding: '2px 10px',
    borderRadius: '999px',
    fontSize: '13px',
    fontWeight: 600,
  },
  heading: {
    fontSize: '16px',
    fontWeight: 700,
    marginBottom: '16px',
    color: '#1a3050',
  },
  emptyState: {
    color: '#888',
    fontStyle: 'italic',
  },
  diffList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  diffBlock: {
    border: '1px solid #e0e0e0',
    borderRadius: '6px',
    overflow: 'hidden',
  },
  fieldLabel: {
    background: '#f0f0f0',
    padding: '6px 12px',
    fontSize: '13px',
    fontWeight: 600,
    color: '#444',
    borderBottom: '1px solid #e0e0e0',
  },
  removedLine: {
    display: 'flex',
    gap: '8px',
    padding: '8px 12px',
    background: '#fff5f5',
    color: '#7e211a',
    fontSize: '14px',
    borderBottom: '1px solid #f5d0cd',
    fontFamily: 'monospace',
  },
  addedLine: {
    display: 'flex',
    gap: '8px',
    padding: '8px 12px',
    background: '#f0fff8',
    color: '#004530',
    fontSize: '14px',
    fontFamily: 'monospace',
  },
  diffMarker: {
    fontWeight: 700,
    fontSize: '16px',
    lineHeight: 1,
    userSelect: 'none',
    minWidth: '12px',
  },
}
