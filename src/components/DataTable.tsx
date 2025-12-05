import { useState } from 'react';
import StatusBadge from './StatusBadge';
import { Brand } from '../types/brand';

interface DataTableProps {
  brands: Brand[];
}

export default function DataTable({ brands }: DataTableProps) {
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

  const toggleRow = (id: number) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
  };

  return (
    <div className="data-table">
      {/* Table Header */}
      <div className="table-header">
        <div className="table-expand-cell"></div>
        <div className="table-header-cell">Varumärke</div>
        <div className="table-header-cell">Kategori</div>
        <div className="table-header-cell">Tillverkad i Sverige</div>
        <div className="table-header-cell">Mer info</div>
      </div>

      {/* Table Body */}
      {brands.map((brand) => {
        const isExpanded = expandedRows.has(brand.id);
        return (
          <div key={brand.id}>
            {/* Main Row */}
            <div className="table-row">
              <div className="table-expand-cell">
                <button
                  onClick={() => toggleRow(brand.id)}
                  className="expand-button"
                  aria-label="Expandera rad"
                >
                  <svg
                    className={`expand-icon ${isExpanded ? 'expanded' : ''}`}
                    viewBox="0 0 16 16"
                    fill="none"
                  >
                    <path
                      d="M4 6L8 10L12 6"
                      stroke="#161616"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </div>
              <div className="table-cell">{brand.varumärke}</div>
              <div className="table-cell">{brand.kategori}</div>
              <div className="table-cell">
                <StatusBadge status={brand.tillverkadISverige} />
              </div>
              <div className="table-cell">
                <button
                  onClick={() => toggleRow(brand.id)}
                  className="more-info-button"
                >
                  Visa mer info
                </button>
              </div>
            </div>

            {/* Expanded Details */}
            {isExpanded && (
              <div className="expanded-details">
                <div className="details-grid">
                  <div className="detail-item">
                    <div className="detail-label">Moderbolag</div>
                    <div className="detail-value">{brand.merInfo.moderbolag}</div>
                  </div>
                  <div className="detail-item">
                    <div className="detail-label">Ägare</div>
                    <div className="detail-value">{brand.merInfo.ägare}</div>
                  </div>
                  <div className="detail-item">
                    <div className="detail-label">Börsnoterat</div>
                    <div className="detail-value">{brand.merInfo.börsnoterat}</div>
                  </div>
                  <div className="detail-item">
                    <div className="detail-label">Tillverkningsländer</div>
                    <div className="detail-value">
                      {brand.merInfo.tillverkningsländer.join(', ')}
                    </div>
                  </div>
                  <div className="detail-item full-width">
                    <div className="detail-label">Koncernstruktur</div>
                    <div className="detail-value">{brand.merInfo.koncernstruktur}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
