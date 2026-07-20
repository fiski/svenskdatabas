interface StatusCounts {
  Ja: number;
  Delvis: number;
  Nej: number;
}

interface StatusDonutProps {
  counts: StatusCounts;
  total: number;
}

// Order + colors reuse the site's reserved status palette (see .status-badge in index.css).
const SEGMENTS = [
  { key: 'Ja', label: 'Ja', fill: '#99dec9' },
  { key: 'Delvis', label: 'Delvis', fill: '#99D5ED' },
  { key: 'Nej', label: 'Nej', fill: '#edb0ab' },
] as const;

export default function StatusDonut({ counts, total }: StatusDonutProps) {
  const size = 240;
  const strokeWidth = 34;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const gap = 2; // px of surface showing between segments

  // Accumulated fraction (0..1) used to rotate each segment to its start angle.
  let cumulative = 0;

  return (
    <div className="status-donut">
      <div className="status-donut-figure">
        <svg
          viewBox={`0 0 ${size} ${size}`}
          className="status-donut-svg"
          role="img"
          aria-label={`Tillverkad i Sverige: ${counts.Ja} Ja, ${counts.Delvis} Delvis, ${counts.Nej} Nej av totalt ${total} varumärken.`}
        >
          {SEGMENTS.map((seg) => {
            const value = counts[seg.key];
            if (total <= 0 || value <= 0) return null;
            const fraction = value / total;
            const dash = Math.max(fraction * circumference - gap, 0.5);
            const rotation = cumulative * 360 - 90; // -90 => start at 12 o'clock
            cumulative += fraction;
            return (
              <circle
                key={seg.key}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke={seg.fill}
                strokeWidth={strokeWidth}
                strokeDasharray={`${dash} ${circumference}`}
                transform={`rotate(${rotation} ${size / 2} ${size / 2})`}
              />
            );
          })}
        </svg>
        <div className="status-donut-center">
          <span className="status-donut-total">{total}</span>
          <span className="status-donut-total-label">varumärken</span>
        </div>
      </div>

      <ul className="status-donut-legend">
        {SEGMENTS.map((seg) => {
          const value = counts[seg.key];
          const pct = total > 0 ? Math.round((value / total) * 100) : 0;
          return (
            <li key={seg.key} className="status-donut-legend-item">
              <span className="status-donut-swatch" style={{ backgroundColor: seg.fill }} />
              <span className="status-donut-legend-label">{seg.label}</span>
              <span className="status-donut-legend-value">
                {value} <span className="status-donut-legend-pct">· {pct}%</span>
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
