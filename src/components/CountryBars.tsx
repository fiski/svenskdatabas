import type { ReactNode } from 'react';
import Flag from './Flag';

export interface CountryBar {
  /** ISO 3166-1 alpha-2 code for the flag. Omit for aggregate/region bars. */
  code?: string;
  label: string;
  count: number;
}

interface CountryBarsProps {
  /** Bars in display order (already sorted). */
  items: CountryBar[];
  caption?: ReactNode;
  emptyMessage?: string;
}

export default function CountryBars({
  items,
  caption,
  emptyMessage = 'Ingen data att visa.',
}: CountryBarsProps) {
  if (items.length === 0) {
    return <p className="ownership-empty">{emptyMessage}</p>;
  }

  const maxCount = Math.max(...items.map((i) => i.count));

  return (
    <div className="country-bars">
      <ul className="country-list">
        {items.map((item) => (
          <li key={item.label} className="country-row">
            <span className="country-name" title={item.label}>
              {item.code ? (
                <Flag countryCode={item.code} />
              ) : (
                <span className="country-flag-placeholder" aria-hidden="true" />
              )}
              <span className="country-name-text">{item.label}</span>
            </span>
            <div className="country-track">
              <div
                className="country-fill"
                style={{ width: `${(item.count / maxCount) * 100}%` }}
              >
                <span className="country-count">{item.count}</span>
              </div>
            </div>
          </li>
        ))}
      </ul>
      {caption && <p className="ownership-caption">{caption}</p>}
    </div>
  );
}
