import { KoncernNode } from '../types/brand';
import Flag from './Flag';
import StatusBadge from './StatusBadge';

interface KoncernstrukturTreeProps {
  koncernstruktur: KoncernNode | string;
  currentBrandName: string;
  currentBrandStatus: 'Ja' | 'Nej' | 'Delvis';
}

export default function KoncernstrukturTree({
  koncernstruktur,
  currentBrandName: _currentBrandName,
  currentBrandStatus: _currentBrandStatus
}: KoncernstrukturTreeProps) {
  // Fallback for legacy string format
  if (typeof koncernstruktur === 'string') {
    return (
      <div>
        <div className="detail-label">Koncernstruktur</div>
        <div className="detail-value">{koncernstruktur}</div>
      </div>
    );
  }

  const { moderbolag, moderbolagLand, ägare, varumärken } = koncernstruktur;

  // Determine if this is a single-brand company (no hierarchy)
  const isSingleBrand = varumärken.length === 1 && !moderbolag && !ägare;

  return (
    <div className="koncernstruktur-tree">
      <div className="koncernstruktur-header">Koncernstruktur</div>

      {/* Simple display for single-brand companies */}
      {isSingleBrand && (
        <div className="single-brand-display">
          <p>Oberoende svenskt företag</p>
        </div>
      )}

      {/* Render hierarchy only if there's structure */}
      {!isSingleBrand && (
        <div className="tree-hierarchy">
          {/* Level 1: Ägare (if exists) */}
          {ägare && (
            <div className="tree-level-container">
              <div className="tree-level">
                <div className="tree-node ägare-node">
                  <div className="node-label">ÄGARE</div>
                  <div className="node-value">
                    {ägare}
                  </div>
                </div>
              </div>

              {/* Children of ägare */}
              {(moderbolag || varumärken.length > 0) && (
                <div className="tree-children">
                  {/* Level 2: Moderbolag (if exists) */}
                  {moderbolag && (
                    <div className="tree-level-container">
                      <div className="tree-level">
                        <div className="tree-node moderbolag-node">
                          <div className="node-label">MODERBOLAG</div>
                          <div className="node-value">
                            {moderbolag}
                            {moderbolagLand && <Flag countryCode={moderbolagLand} />}
                          </div>
                        </div>
                      </div>

                      {/* Children of moderbolag */}
                      {varumärken.length > 0 && (
                        <div className="tree-children">
                          {/* Level 3: Varumärken */}
                          <div className="tree-level-container">
                            <div className="tree-node varumärken-node">
                              <div className="node-label">VARUMÄRKE</div>
                              <div className="brand-list">
                                {varumärken.map((brand, index) => (
                                  <div
                                    key={index}
                                    className={`brand-item ${brand.ärHuvudvarumärke ? 'main-brand' : ''}`}
                                  >
                                    <span className="brand-name">{brand.namn}</span>
                                    {brand.land && <Flag countryCode={brand.land} />}

                                    {/* Show status badge for Swedish sibling brands only (not main brand) */}
                                    {brand.land === 'SE' && !brand.ärHuvudvarumärke && brand.status && (
                                      <StatusBadge status={brand.status} variant="dot" />
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* If no moderbolag but has varumärken, render varumärken directly */}
                  {!moderbolag && varumärken.length > 0 && (
                    <div className="tree-level-container">
                      <div className="tree-node varumärken-node">
                        <div className="node-label">VARUMÄRKE</div>
                        <div className="brand-list">
                          {varumärken.map((brand, index) => (
                            <div
                              key={index}
                              className={`brand-item ${brand.ärHuvudvarumärke ? 'main-brand' : ''}`}
                            >
                              <span className="brand-name">{brand.namn}</span>
                              {brand.land && <Flag countryCode={brand.land} />}

                              {/* Show status badge for Swedish sibling brands only (not main brand) */}
                              {brand.land === 'SE' && !brand.ärHuvudvarumärke && brand.status && (
                                <StatusBadge status={brand.status} size="xs" />
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* If no ägare but has moderbolag */}
          {!ägare && moderbolag && (
            <div className="tree-level-container">
              <div className="tree-level">
                <div className="tree-node moderbolag-node">
                  <div className="node-label">MODERBOLAG</div>
                  <div className="node-value">
                    {moderbolag}
                    {moderbolagLand && <Flag countryCode={moderbolagLand} />}
                  </div>
                </div>
              </div>

              {/* Children of moderbolag */}
              {varumärken.length > 0 && (
                <div className="tree-children">
                  <div className="tree-level-container">
                    <div className="tree-node varumärken-node">
                      <div className="node-label">VARUMÄRKE</div>
                      <div className="brand-list">
                        {varumärken.map((brand, index) => (
                          <div
                            key={index}
                            className={`brand-item ${brand.ärHuvudvarumärke ? 'main-brand' : ''}`}
                          >
                            <span className="brand-name">{brand.namn}</span>
                            {brand.land && <Flag countryCode={brand.land} />}

                            {/* Show status badge for Swedish sibling brands only (not main brand) */}
                            {brand.land === 'SE' && !brand.ärHuvudvarumärke && brand.status && (
                              <StatusBadge status={brand.status} size="xs" />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* If no ägare and no moderbolag, only varumärken */}
          {!ägare && !moderbolag && varumärken.length > 0 && (
            <div className="tree-level-container">
              <div className="tree-node varumärken-node">
                <div className="node-label">VARUMÄRKE</div>
                <div className="brand-list">
                  {varumärken.map((brand, index) => (
                    <div
                      key={index}
                      className={`brand-item ${brand.ärHuvudvarumärke ? 'main-brand' : ''}`}
                    >
                      <span className="brand-name">{brand.namn}</span>
                      {brand.land && <Flag countryCode={brand.land} />}

                      {/* Show status badge for Swedish sibling brands only (not main brand) */}
                      {brand.land === 'SE' && !brand.ärHuvudvarumärke && brand.status && (
                        <StatusBadge status={brand.status} size="xs" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
