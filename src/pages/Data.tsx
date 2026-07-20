import { useState, useMemo, useEffect } from 'react';
import StatusDonut from '../components/StatusDonut';
import SwedishnessMatrix from '../components/SwedishnessMatrix';
import OwnershipBars, { OwnerCount } from '../components/OwnershipBars';
import CountryBars, { CountryBar } from '../components/CountryBars';
import { sanityClient } from '../lib/sanityClient';
import { ALL_BRANDS_QUERY } from '../lib/queries';
import { Brand } from '../types/brand';
import { ISO_TO_SV, SV_TO_ISO, REGION_LABELS, normalizeCountryName } from '../lib/countries';

// Swedish locale comparator for tie-breaking equal counts (matches Home.tsx).
const compareSwedish = (a: string, b: string): number => {
  return a.localeCompare(b, 'sv-SE', { sensitivity: 'base' });
};

export default function Data() {
  const [allBrands, setAllBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    document.title = 'Data & statistik - Svensk Databas';
  }, []);

  useEffect(() => {
    sanityClient
      .fetch<Brand[]>(ALL_BRANDS_QUERY)
      .then((data) => {
        setAllBrands(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to fetch brands:', err);
        setError('Kunde inte ladda varumärken. Försök igen senare.');
        setLoading(false);
      });
  }, []);

  const total = allBrands.length;

  // Manufacturing-status split across all brands.
  const statusCounts = useMemo(() => {
    const counts = { Ja: 0, Delvis: 0, Nej: 0 };
    for (const brand of allBrands) {
      counts[brand.tillverkadISverige] += 1;
    }
    return counts;
  }, [allBrands]);

  // Ownership concentration: group by parent company (moderbolag), keep groups of >= 2.
  // We group on moderbolag rather than the "ägare" (ultimate owner) field because ägare
  // is free text that mixes real entities with ownership-type labels ("Privatägd",
  // "Familjeägt", "Börsnoterat (...)") — grouping on it would merge unrelated companies.
  const owners = useMemo<OwnerCount[]>(() => {
    const byOwner = new Map<string, number>();
    for (const brand of allBrands) {
      const owner = brand.merInfo.moderbolag?.trim();
      if (owner) {
        byOwner.set(owner, (byOwner.get(owner) ?? 0) + 1);
      }
    }
    return [...byOwner.entries()]
      .map(([owner, count]) => ({ owner, count }))
      .filter((o) => o.count >= 2)
      .sort((a, b) => b.count - a.count || compareSwedish(a.owner, b.owner));
  }, [allBrands]);

  // Foreign owners: brands whose ultimate owner (koncern.ägareLand) is registered
  // outside Sweden, grouped by owner country. ägareLand is an ISO code.
  const ownerCountries = useMemo<CountryBar[]>(() => {
    const byCode = new Map<string, number>();
    for (const brand of allBrands) {
      const ks = brand.merInfo.koncernstruktur;
      if (typeof ks === 'string') continue; // legacy string format has no country
      const code = ks.ägareLand?.trim().toUpperCase();
      if (!code || code === 'SE') continue;
      byCode.set(code, (byCode.get(code) ?? 0) + 1);
    }
    return [...byCode.entries()]
      .map(([code, count]) => ({ code, label: ISO_TO_SV[code] ?? code, count }))
      .sort((a, b) => b.count - a.count || compareSwedish(a.label, b.label));
  }, [allBrands]);

  const foreignOwnedCount = useMemo(
    () => ownerCountries.reduce((sum, o) => sum + o.count, 0),
    [ownerCountries]
  );

  // Most common manufacturing countries: count how many brands list each country.
  // A brand manufacturing in several countries is counted once per country. Vague
  // region labels (Europa, Asien, ...) collapse into one bar; single-brand countries
  // collapse into an "Övriga länder" bar. Both aggregate bars sit at the bottom.
  const manufacturingCountries = useMemo<CountryBar[]>(() => {
    const byCountry = new Map<string, number>();
    let regionCount = 0;
    for (const brand of allBrands) {
      const entries = brand.merInfo.tillverkningsländer;
      if (!entries || entries.length === 0) continue;
      const countries = new Set<string>();
      let hasRegion = false;
      for (const entry of entries) {
        if (!entry) continue;
        const name = normalizeCountryName(entry);
        if (!name) continue;
        if (REGION_LABELS.has(name)) hasRegion = true;
        else countries.add(name);
      }
      for (const name of countries) {
        byCountry.set(name, (byCountry.get(name) ?? 0) + 1);
      }
      if (hasRegion) regionCount += 1;
    }

    const all = [...byCountry.entries()].map(([label, count]) => ({
      code: SV_TO_ISO[label],
      label,
      count,
    }));
    const multi = all
      .filter((c) => c.count >= 2)
      .sort((a, b) => b.count - a.count || compareSwedish(a.label, b.label));
    const singles = all.filter((c) => c.count < 2);

    const bars: CountryBar[] = [...multi];
    if (singles.length > 0) {
      const singleTotal = singles.reduce((sum, c) => sum + c.count, 0);
      bars.push({ label: `Övriga länder (${singles.length} st)`, count: singleTotal });
    }
    if (regionCount > 0) {
      bars.push({ label: 'Region ej specificerad', count: regionCount });
    }
    return bars;
  }, [allBrands]);

  if (loading) {
    return (
      <main className="main">
        <div className="container">
          <div className="content">
            <div className="loading-state">Laddar data...</div>
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="main">
        <div className="container">
          <div className="content">
            <div className="error-state">{error}</div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="main">
      <div className="container">
        <div className="content">
          <section className="data-section data-hero">
            <h1 className="about-title">Data & statistik</h1>
            <p className="about-intro">
              En överblick över hela databasen: hur stor andel av varumärkena som faktiskt
              tillverkas i Sverige, var produktionen sker, vilka ägare som kontrollerar flest
              varumärken och hur många som ägs från utlandet.
            </p>
          </section>

          <section className="data-section">
            <h2 className="about-heading">Tillverkad i Sverige</h2>
            <p>Fördelningen av samtliga {total} varumärken i databasen.</p>
            <StatusDonut counts={statusCounts} total={total} />
          </section>

          <section className="data-section">
            <h2 className="about-heading">Namn mot verklighet</h2>
            <p>
              Hur svenskt ett varumärke känns handlar ofta om vem som äger det, men var det
              faktiskt tillverkas är en annan sak. Matrisen korsar ägarnationalitet med
              tillverkning i Sverige.
            </p>
            <SwedishnessMatrix brands={allBrands} />
          </section>

          <section className="data-section">
            <h2 className="about-heading">Vanligaste tillverkningsländer</h2>
            <p>Antal varumärken som anger respektive land som tillverkningsland.</p>
            <CountryBars
              items={manufacturingCountries}
              caption={
                <>
                  Ett varumärke kan tillverka i flera länder och räknas då i varje land, därför
                  summerar staplarna till mer än {total}. Länder med bara ett varumärke är samlade
                  under Övriga länder.
                </>
              }
              emptyMessage="Inga tillverkningsländer angivna i databasen."
            />
          </section>

          <section className="data-section">
            <h2 className="about-heading">Ägarkoncentration</h2>
            <p>Antal varumärken per moderbolag — bolag som äger minst två varumärken i databasen.</p>
            <OwnershipBars owners={owners} total={total} />
          </section>

          <section className="data-section">
            <h2 className="about-heading">Utländska ägare</h2>
            <p>Varumärken vars yttersta ägare är registrerad utanför Sverige, per ägarland.</p>
            <CountryBars
              items={ownerCountries}
              caption={
                <>
                  {foreignOwnedCount} av {total} varumärken ägs av ett bolag registrerat utanför
                  Sverige. Övriga ägs av svenska bolag eller är oberoende.
                </>
              }
              emptyMessage="Inga utländskt ägda varumärken i databasen."
            />
          </section>
        </div>
      </div>
    </main>
  );
}
