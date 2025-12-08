import { useState } from 'react';
import StatusBadge from './StatusBadge';
import { Brand, SortColumn, SortDirection } from '../types/brand';

interface DataTableProps {
  brands: Brand[];
  sortColumn: SortColumn;
  sortDirection: SortDirection;
  onSort: (column: SortColumn) => void;
}

export default function DataTable({ brands, sortColumn, sortDirection, onSort }: DataTableProps) {
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

  const getSortIcon = (column: SortColumn) => {
    if (sortColumn !== column) return null;

    return (
      <svg
        className="sort-icon"
        viewBox="0 0 16 16"
        fill="none"
        aria-hidden="true"
      >
        {sortDirection === 'asc' ? (
          <path d="M8 4L4 8H12L8 4Z" fill="#1a3050" />
        ) : (
          <path d="M8 12L12 8H4L8 12Z" fill="#1a3050" />
        )}
      </svg>
    );
  };

  return (
    <div className="data-table">
      {/* Table Header */}
      <div className="table-header">
        <div className="table-expand-cell"></div>

        <div
          className={`table-header-cell sortable ${sortColumn === 'varumärke' ? 'sorted' : ''}`}
          onClick={() => onSort('varumärke')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onSort('varumärke');
            }
          }}
          aria-label={`Sortera efter varumärke ${
            sortColumn === 'varumärke'
              ? sortDirection === 'asc' ? '(stigande)' : '(fallande)'
              : ''
          }`}
        >
          <span>Varumärke</span>
          {getSortIcon('varumärke')}
        </div>

        <div
          className={`table-header-cell sortable ${sortColumn === 'kategori' ? 'sorted' : ''}`}
          onClick={() => onSort('kategori')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onSort('kategori');
            }
          }}
          aria-label={`Sortera efter kategori ${
            sortColumn === 'kategori'
              ? sortDirection === 'asc' ? '(stigande)' : '(fallande)'
              : ''
          }`}
        >
          <span>Kategori</span>
          {getSortIcon('kategori')}
        </div>

        <div
          className={`table-header-cell sortable ${sortColumn === 'tillverkadISverige' ? 'sorted' : ''}`}
          onClick={() => onSort('tillverkadISverige')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onSort('tillverkadISverige');
            }
          }}
          aria-label={`Sortera efter tillverkad i Sverige ${
            sortColumn === 'tillverkadISverige'
              ? sortDirection === 'asc' ? '(stigande)' : '(fallande)'
              : ''
          }`}
        >
          <span>Tillverkad i Sverige</span>
          {getSortIcon('tillverkadISverige')}
        </div>

        <div className="table-header-cell">Mer info</div>
      </div>

      {/* Table Body */}
      {brands.map((brand) => {
        const isExpanded = expandedRows.has(brand.id);
        return (
          <div key={brand.id}>
            {/* Main Row */}
            <div
              className={`table-row ${isExpanded ? 'expanded' : ''}`}
              onClick={() => toggleRow(brand.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  toggleRow(brand.id);
                }
              }}
            >
              <div className="table-expand-cell">
                <svg
                  className={`expand-icon ${isExpanded ? 'expanded' : ''}`}
                  viewBox="0 0 16 16"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M4 6L8 10L12 6"
                    stroke="#161616"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div className="table-cell">{brand.varumärke}</div>
              <div className="table-cell">{brand.kategori}</div>
              <div className="table-cell">
                <StatusBadge status={brand.tillverkadISverige} />
              </div>
              <div className="table-cell">
                <span className="more-info-text">Visa mer info</span>
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
