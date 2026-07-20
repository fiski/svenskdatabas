import { useMemo } from 'react';
import Flag from './Flag';
import { Brand } from '../types/brand';

interface SwedishnessMatrixProps {
  brands: Brand[];
}

type OwnerBucket = 'swedish' | 'foreign';
type Status = 'Ja' | 'Delvis' | 'Nej';

// Columns reuse the site's reserved status palette (see .status-badge in index.css).
// `rgb` drives the heatmap tint; `text` keeps the count readable at any opacity.
const COLUMNS: { key: Status; label: string; rgb: string; text: string }[] = [
  { key: 'Ja', label: 'Ja', rgb: '153, 222, 201', text: '#004530' },
  { key: 'Delvis', label: 'Delvis', rgb: '153, 213, 237', text: '#005D7F' },
  { key: 'Nej', label: 'Nej', rgb: '237, 176, 171', text: '#7e211a' },
];

const ROWS: { key: OwnerBucket; label: string }[] = [
  { key: 'swedish', label: 'Svenskägt' },
  { key: 'foreign', label: 'Utländskt ägt' },
];

const compareSwedish = (a: string, b: string): number =>
  a.localeCompare(b, 'sv-SE', { sensitivity: 'base' });

/**
 * Classify a brand by owner nationality. Mirrors the source GROQ logic:
 * a brand with no corporate group (independent) or a Swedish ultimate owner
 * counts as Swedish-owned; anything with a foreign or unknown owner country
 * counts as foreign-owned.
 */
function ownerBucket(brand: Brand): OwnerBucket {
  const ks = brand.merInfo.koncernstruktur;
  if (typeof ks === 'string' || !ks) return 'swedish'; // legacy / independent
  const hasKoncern = Boolean(ks.ägare || ks.moderbolag || ks.ägareLand);
  if (!hasKoncern) return 'swedish';
  const land = ks.ägareLand?.trim().toUpperCase();
  return land === 'SE' ? 'swedish' : 'foreign';
}

const MAX_ABROAD_CHIPS = 12;

export default function SwedishnessMatrix({ brands }: SwedishnessMatrixProps) {
  const data = useMemo(() => {
    const counts: Record<OwnerBucket, Record<Status, number>> = {
      swedish: { Ja: 0, Delvis: 0, Nej: 0 },
      foreign: { Ja: 0, Delvis: 0, Nej: 0 },
    };

    for (const brand of brands) {
      counts[ownerBucket(brand)][brand.tillverkadISverige] += 1;
    }

    const cellValues = ROWS.flatMap((r) => COLUMNS.map((c) => counts[r.key][c.key]));
    const maxCell = Math.max(1, ...cellValues);

    // The two surprise quadrants that make the story.
    const swedishAbroad = brands
      .filter((b) => ownerBucket(b) === 'swedish' && b.tillverkadISverige === 'Nej')
      .map((b) => b.varumärke)
      .sort(compareSwedish);

    const foreignHere = brands
      .filter((b) => ownerBucket(b) === 'foreign' && b.tillverkadISverige === 'Ja')
      .map((b) => {
        const ks = b.merInfo.koncernstruktur;
        const owner = typeof ks === 'string' ? '' : ks?.ägare ?? '';
        const ownerLand = typeof ks === 'string' ? '' : ks?.ägareLand ?? '';
        return { namn: b.varumärke, owner, ownerLand };
      })
      .sort((a, b) => compareSwedish(a.namn, b.namn));

    return { counts, maxCell, swedishAbroad, foreignHere };
  }, [brands]);

  const { counts, maxCell, swedishAbroad, foreignHere } = data;

  const rowTotal = (row: OwnerBucket) =>
    COLUMNS.reduce((sum, c) => sum + counts[row][c.key], 0);
  const colTotal = (col: Status) =>
    ROWS.reduce((sum, r) => sum + counts[r.key][col], 0);
  const grandTotal = ROWS.reduce((sum, r) => sum + rowTotal(r.key), 0);

  const shownAbroad = swedishAbroad.slice(0, MAX_ABROAD_CHIPS);
  const restAbroad = swedishAbroad.length - shownAbroad.length;

  return (
    <div className="matrix">
      <div className="matrix-table-wrap">
        <table
          className="matrix-table"
          aria-label="Antal varumärken efter ägarnationalitet och tillverkning i Sverige"
        >
          <thead>
            <tr>
              <th scope="col" rowSpan={2} className="matrix-stub">
                Ägare
              </th>
              <th scope="colgroup" colSpan={3} className="matrix-grouphead">
                Tillverkad i Sverige
              </th>
              <th scope="col" rowSpan={2} className="matrix-colhead matrix-total-head">
                Totalt
              </th>
            </tr>
            <tr>
              {COLUMNS.map((c) => (
                <th key={c.key} scope="col" className="matrix-colhead">
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ROWS.map((r) => (
              <tr key={r.key}>
                <th scope="row" className="matrix-rowhead">
                  {r.label}
                </th>
                {COLUMNS.map((c) => {
                  const value = counts[r.key][c.key];
                  const alpha = 0.15 + 0.85 * (value / maxCell);
                  return (
                    <td
                      key={c.key}
                      className="matrix-cell"
                      style={{ backgroundColor: `rgba(${c.rgb}, ${alpha})`, color: c.text }}
                    >
                      <span className="matrix-count">{value}</span>
                    </td>
                  );
                })}
                <td className="matrix-cell matrix-total">{rowTotal(r.key)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <th scope="row" className="matrix-rowhead">
                Totalt
              </th>
              {COLUMNS.map((c) => (
                <td key={c.key} className="matrix-cell matrix-total">
                  {colTotal(c.key)}
                </td>
              ))}
              <td className="matrix-cell matrix-total matrix-grand">{grandTotal}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="matrix-highlights">
        <div className="matrix-card">
          <h3 className="matrix-card-title">Svenskägt, ändå tillverkat utomlands</h3>
          <p className="matrix-card-text">
            {swedishAbroad.length} svenskägda varumärken tillverkas inte i Sverige. Många av dem
            uppfattas nog som svensktillverkade:
          </p>
          <ul className="matrix-chips">
            {shownAbroad.map((namn) => (
              <li key={namn} className="matrix-chip">
                {namn}
              </li>
            ))}
            {restAbroad > 0 && <li className="matrix-chip matrix-chip-more">+{restAbroad} fler</li>}
          </ul>
        </div>

        <div className="matrix-card">
          <h3 className="matrix-card-title">Utländskt ägt, ändå tillverkat i Sverige</h3>
          <p className="matrix-card-text">
            Bara {foreignHere.length} varumärken ägs från utlandet men tillverkas fortfarande här:
          </p>
          <ul className="matrix-owners">
            {foreignHere.map((b) => (
              <li key={b.namn} className="matrix-owner">
                <span className="matrix-owner-name">{b.namn}</span>
                <span className="matrix-owner-by">
                  {b.ownerLand && <Flag countryCode={b.ownerLand} />}
                  {b.owner}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
