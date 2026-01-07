import { useState } from 'react';
import { ArrowUpDown, ArrowUpAZ, ArrowDownZA } from 'lucide-react';
import StatusBadge from './StatusBadge';
import KoncernstrukturTree from './KoncernstrukturTree';
import { Brand, SortColumn, SortDirection } from '../types/brand';

interface DataTableProps {
  brands: Brand[];
  sortColumn: SortColumn;
  sortDirection: SortDirection;
  onSort: (column: SortColumn) => void;
}

export default function DataTable({ brands, sortColumn, sortDirection, onSort }: DataTableProps) {
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  let previousLetter = '';

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
    if (sortColumn !== column) {
      return <ArrowUpDown className="sort-icon" size={16} aria-hidden="true" />;
    }

    return sortDirection === 'asc' ? (
      <ArrowUpAZ className="sort-icon" size={16} aria-hidden="true" />
    ) : (
      <ArrowDownZA className="sort-icon" size={16} aria-hidden="true" />
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

        // Letter tracking for alphabetical indicators
        const currentLetter = brand.varumärke.charAt(0).toUpperCase();
        const showLetter = sortColumn === 'varumärke' && currentLetter !== previousLetter;
        const letterToDisplay = showLetter ? currentLetter : '';
        previousLetter = currentLetter;

        return (
          <div key={brand.id} className="row-container">
            {sortColumn === 'varumärke' && (
              <div className="letter-indicator-external">
                {letterToDisplay && <span className="letter-indicator">{letterToDisplay}</span>}
              </div>
            )}
            <div className="row-content">
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
                <div className="table-cell" data-label="Varumärke">
                  {brand.varumärke}
                </div>
              <div className="table-cell" data-label="Kategori">
                {brand.kategori}
              </div>
              <div className="table-cell" data-label="Tillverkad i Sverige">
                <StatusBadge status={brand.tillverkadISverige} />
              </div>
              <div className="table-cell" data-label="Mer info">
                <span className="more-info-text">Visa mer info</span>
              </div>
            </div>

            {/* Expanded Details */}
            {isExpanded && (
              <div className="expanded-details">
                <div className="details-grid">
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
                  <div className="detail-item">
                    <KoncernstrukturTree
                      koncernstruktur={brand.merInfo.koncernstruktur}
                      currentBrandName={brand.varumärke}
                      currentBrandStatus={brand.tillverkadISverige}
                    />
                  </div>
                  <div className="detail-item brand-intro">
                    <div className="detail-label">Om varumärket</div>
                    <div className="detail-value intro-text">
                      {brand.merInfo.intro || 'Ingen information att visa för tillfället'}
                    </div>
                  </div>
                </div>
              </div>
            )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
