import { Fragment, useState } from 'react';
import { ArrowUpDown, ArrowUpAZ, ArrowDownZA } from 'lucide-react';
import StatusBadge from './StatusBadge';
import KoncernstrukturTree from './KoncernstrukturTree';
import BrandSuggestionForm from './BrandSuggestionForm';
import { Brand, SortColumn, SortDirection } from '../types/brand';

/** Display text for a source link: its label, or the bare hostname as a fallback. */
function sourceLabel(source: { url: string; label?: string }): string {
  if (source.label) return source.label;
  try {
    return new URL(source.url).hostname.replace(/^www\./, '');
  } catch {
    return source.url;
  }
}

function sourceHost(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return 'Källa';
  }
}

/**
 * Källor are labelled "<Kategori> – <detalj>" (see BRAND_RESEARCH.md §9), e.g.
 * "Ägarstruktur – Traction äger 100% via Ankarsrum Industries". Split that into the
 * evidence category (rendered as a plain heading) and the detail (the link text).
 * Labels that don't follow the convention fall back to the domain as the heading.
 */
function splitSource(source: { url: string; label?: string }): { tag: string; detail: string } {
  const text = sourceLabel(source);
  // Require whitespace around the dash so hyphenated names ("Snap-on") don't split,
  // and cap the tag length so a stray dash mid-sentence can't become a giant tag.
  const match = text.match(/^(.{2,40}?)\s[–—-]\s(.+)$/s);
  if (match) return { tag: match[1].trim(), detail: match[2].trim() };

  const host = sourceHost(source.url);
  return { tag: host, detail: text === host ? '' : text };
}

interface DataTableProps {
  brands: Brand[];
  sortColumn: SortColumn;
  sortDirection: SortDirection;
  onSort: (column: SortColumn) => void;
  stickyTop?: number;
  onBrandExpand?: (brandId: string, brandName: string) => void;
}

export default function DataTable({ brands, sortColumn, sortDirection, onSort, stickyTop, onBrandExpand }: DataTableProps) {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [editingBrandId, setEditingBrandId] = useState<string | null>(null);

  const toggleRow = (id: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
      // Close suggestion form if collapsing the row
      if (editingBrandId === id) setEditingBrandId(null);
    } else {
      newExpanded.add(id);
      const brand = brands.find(b => b.id === id);
      if (brand) onBrandExpand?.(brand.id, brand.varumärke);
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

  const renderRow = (brand: Brand) => {
    const isExpanded = expandedRows.has(brand.id);
    const isEditing = editingBrandId === brand.id;
    const detailsId = `brand-details-${brand.id}`;

    return (
      <Fragment key={brand.id}>
        <tr
          className={`table-row ${isExpanded ? 'expanded' : ''}`}
          onClick={() => toggleRow(brand.id)}
        >
          <td className="table-expand-cell">
            <button
              type="button"
              className="expand-button"
              aria-expanded={isExpanded}
              aria-controls={detailsId}
              onClick={(e) => {
                e.stopPropagation();
                toggleRow(brand.id);
              }}
            >
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
              <span className="sr-only">
                {isExpanded ? `Dölj detaljer om ${brand.varumärke}` : `Visa detaljer om ${brand.varumärke}`}
              </span>
            </button>
          </td>
          <td className="table-cell">{brand.varumärke}</td>
          <td className="table-cell">{brand.kategori}</td>
          <td className="table-cell">
            <StatusBadge status={brand.tillverkadISverige} />
          </td>
          <td className="table-cell">
            <span className="more-info-text">Visa mer info</span>
          </td>
        </tr>

        {/* Expanded Section */}
        {isExpanded && (
          <tr>
            <td className={isEditing ? undefined : 'expanded-details'} colSpan={5} id={detailsId}>
              {isEditing ? (
                <BrandSuggestionForm
                  brand={brand}
                  onCancel={() => setEditingBrandId(null)}
                  onSubmit={() => setEditingBrandId(null)}
                />
              ) : (
                <div className="details-grid">
                <div className="detail-item">
                  <div className="detail-label">Börsnoterat</div>
                  <div className="detail-value">{brand.merInfo.börsnoterat}</div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">Tillverkningsländer</div>
                  <div className="detail-value">
                    {brand.merInfo.tillverkningsländer?.length
                      ? brand.merInfo.tillverkningsländer.join(', ')
                      : 'Uppgift saknas'}
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
                  {brand.merInfo.hallbarhetsFokus && (
                    <>
                      <div className="detail-label" style={{ marginTop: 8 }}>Hållbarhetsfokus</div>
                      <div className="detail-value intro-text">{brand.merInfo.hallbarhetsFokus}</div>
                    </>
                  )}
                  {brand.merInfo.webbplats && (
                    <>
                      <div className="detail-label" style={{ marginTop: 8 }}>Länk till {brand.varumärke}</div>
                      <div className="detail-value">
                        <a
                          href={brand.merInfo.webbplats}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-link"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {brand.merInfo.webbplats}
                        </a>
                      </div>
                    </>
                  )}
                  {((brand.merInfo.källor && brand.merInfo.källor.length > 0) || brand.merInfo.senastVerifierad) && (
                    <div className="brand-sources">
                      <div className="detail-label" style={{ marginTop: 8 }}>Källor</div>
                      {brand.merInfo.källor && brand.merInfo.källor.length > 0 ? (
                        <ul className="kalla-list">
                          {brand.merInfo.källor.map((källa) => {
                            const { tag, detail } = splitSource(källa);
                            return (
                              <li key={källa.url} className="kalla-item">
                                <div className="kalla-tag">{tag}</div>
                                <a
                                  href={källa.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-link"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  {detail || sourceHost(källa.url)}
                                </a>
                              </li>
                            );
                          })}
                        </ul>
                      ) : (
                        <div className="detail-value">Inga källor angivna ännu</div>
                      )}
                      {brand.merInfo.senastVerifierad && (
                        <div className="senast-verifierad">
                          Senast uppdaterad: {new Date(brand.merInfo.senastVerifierad).toLocaleDateString('sv-SE')}
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <div className="detail-item suggest-change-item">
                  <button
                    className="suggest-change-btn"
                    onClick={(e) => { e.stopPropagation(); setEditingBrandId(brand.id); }}
                    type="button"
                  >
                    Föreslå ändring
                  </button>
                </div>
              </div>
              )}
            </td>
          </tr>
        )}
      </Fragment>
    );
  };

  const renderRows = () => {
    if (sortColumn !== 'varumärke') {
      return brands.map((brand) => renderRow(brand));
    }

    const groups: { letter: string; brands: Brand[] }[] = [];
    for (const brand of brands) {
      const letter = brand.varumärke.charAt(0).toUpperCase();
      if (groups.length === 0 || groups[groups.length - 1].letter !== letter) {
        groups.push({ letter, brands: [brand] });
      } else {
        groups[groups.length - 1].brands.push(brand);
      }
    }

    return groups.map(({ letter, brands: groupBrands }) => (
      <Fragment key={letter}>
        <tr>
          <th
            scope="rowgroup"
            colSpan={5}
            className="letter-section-header"
            style={{ top: stickyTop ?? 0 }}
          >
            {letter}
          </th>
        </tr>
        {groupBrands.map((brand) => renderRow(brand))}
      </Fragment>
    ));
  };

  const sortAriaLabel = (column: SortColumn, label: string) =>
    `Sortera efter ${label} ${
      sortColumn === column
        ? sortDirection === 'asc' ? '(stigande)' : '(fallande)'
        : ''
    }`;

  const sortAriaSort = (column: SortColumn): 'ascending' | 'descending' | 'none' =>
    sortColumn === column ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none';

  return (
    <table className="data-table">
      <caption className="sr-only">
        Svenska varumärken: kategori, tillverkningsland och ägarstruktur
      </caption>
      <thead>
        <tr className="table-header">
          <th scope="col" className="table-expand-cell">
            <span className="sr-only">Expandera rad</span>
          </th>

          <th scope="col" className="table-header-th" aria-sort={sortAriaSort('varumärke')}>
            <button
              type="button"
              className={`table-header-cell sortable ${sortColumn === 'varumärke' ? 'sorted' : ''}`}
              onClick={() => onSort('varumärke')}
              aria-label={sortAriaLabel('varumärke', 'varumärke')}
            >
              <span>Varumärke</span>
              {getSortIcon('varumärke')}
            </button>
          </th>

          <th scope="col" className="table-header-th" aria-sort={sortAriaSort('kategori')}>
            <button
              type="button"
              className={`table-header-cell sortable ${sortColumn === 'kategori' ? 'sorted' : ''}`}
              onClick={() => onSort('kategori')}
              aria-label={sortAriaLabel('kategori', 'kategori')}
            >
              <span>Kategori</span>
              {getSortIcon('kategori')}
            </button>
          </th>

          <th scope="col" className="table-header-th" aria-sort={sortAriaSort('tillverkadISverige')}>
            <button
              type="button"
              className={`table-header-cell sortable ${sortColumn === 'tillverkadISverige' ? 'sorted' : ''}`}
              onClick={() => onSort('tillverkadISverige')}
              aria-label={sortAriaLabel('tillverkadISverige', 'tillverkad i Sverige')}
            >
              <span>Tillverkad i Sverige</span>
              {getSortIcon('tillverkadISverige')}
            </button>
          </th>

          <th scope="col" className="table-header-cell">Mer info</th>
        </tr>
      </thead>

      {/* Table Body */}
      <tbody>{renderRows()}</tbody>
    </table>
  );
}
