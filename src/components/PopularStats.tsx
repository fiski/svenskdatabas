interface PopularStatsProps {
  stats: {
    topViewed: { brandId: string; brandName: string; viewCount: number }[];
    topSearched: { term: string; searchCount: number }[];
  };
}

export default function PopularStats({ stats }: PopularStatsProps) {
  if (stats.topViewed.length === 0 && stats.topSearched.length === 0) {
    return null;
  }

  return (
    <div className="popular-stats">
      <h2 className="popular-stats-title">Populärt just nu</h2>
      <div className="popular-stats-columns">
        {stats.topViewed.length > 0 && (
          <div className="popular-stats-column">
            <div className="popular-stats-column-title">Mest visade varumärken</div>
            <ol className="popular-stats-list">
              {stats.topViewed.map((item) => (
                <li key={item.brandId} className="popular-stats-item">
                  <span className="popular-stats-name">{item.brandName}</span>
                  <span className="popular-stats-count">{item.viewCount}</span>
                </li>
              ))}
            </ol>
          </div>
        )}
        {stats.topSearched.length > 0 && (
          <div className="popular-stats-column">
            <div className="popular-stats-column-title">Mest sökta termer</div>
            <ol className="popular-stats-list">
              {stats.topSearched.map((item) => (
                <li key={item.term} className="popular-stats-item">
                  <span className="popular-stats-name">{item.term}</span>
                  <span className="popular-stats-count">{item.searchCount}</span>
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>
    </div>
  );
}
