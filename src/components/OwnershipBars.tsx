export interface OwnerCount {
  owner: string;
  count: number;
}

interface OwnershipBarsProps {
  /** Owners controlling >= 2 brands, already sorted by count descending. */
  owners: OwnerCount[];
  /** Total number of brands in the database, for the reconciliation caption. */
  total: number;
}

export default function OwnershipBars({ owners, total }: OwnershipBarsProps) {
  if (owners.length === 0) {
    return <p className="ownership-empty">Inga moderbolag med fler än ett varumärke i databasen.</p>;
  }

  const maxCount = owners[0].count;
  const shown = owners.reduce((sum, o) => sum + o.count, 0);
  const rest = total - shown;

  return (
    <div className="ownership-bars">
      <ul className="ownership-list">
        {owners.map((o) => (
          <li key={o.owner} className="ownership-row">
            <span className="ownership-name" title={o.owner}>
              {o.owner}
            </span>
            <div className="ownership-track">
              <div className="ownership-fill" style={{ width: `${(o.count / maxCount) * 100}%` }}>
                <span className="ownership-count">{o.count}</span>
              </div>
            </div>
          </li>
        ))}
      </ul>
      <p className="ownership-caption">
        De {owners.length} största moderbolagen äger {shown} av {total} varumärken. Övriga {rest}{' '}
        ägs oberoende eller tillhör ett bolag med bara ett varumärke i databasen.
      </p>
    </div>
  );
}
