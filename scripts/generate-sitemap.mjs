// Writes dist/sitemap.xml after `vite build`.
//
// lastmod for / is the newest _updatedAt among published brands and koncerns
// (the home page is the brand table), and for /om the last commit touching
// the About page. Either falls back to omitting lastmod rather than failing
// the build: a sitemap without dates is still valid.

import { execSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';

const SITE = 'https://brandsfrom.se';
const projectId = process.env.VITE_SANITY_PROJECT_ID || 'kmjh3e1f';
const dataset = process.env.VITE_SANITY_DATASET || 'production';

async function latestContentDate() {
  const query = '*[_type in ["brand", "koncern"]] | order(_updatedAt desc)[0]._updatedAt';
  const params = new URLSearchParams({ query, perspective: 'published' });
  const url = `https://${projectId}.apicdn.sanity.io/v2024-01-01/data/query/${dataset}?${params}`;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const { result } = await res.json();
    return result ? new Date(result).toISOString().slice(0, 10) : null;
  } catch (err) {
    console.warn(`sitemap: could not fetch lastmod from Sanity (${err.message})`);
    return null;
  }
}

function lastCommitDate(path) {
  try {
    const date = execSync(`git log -1 --format=%cs -- ${path}`, { encoding: 'utf8' }).trim();
    return date || null;
  } catch {
    return null;
  }
}

const pages = [
  { loc: '/', lastmod: await latestContentDate(), changefreq: 'weekly', priority: '1.0' },
  { loc: '/om', lastmod: lastCommitDate('src/pages/About.tsx'), changefreq: 'monthly', priority: '0.8' },
];

const urls = pages
  .map(({ loc, lastmod, changefreq, priority }) =>
    [
      '  <url>',
      `    <loc>${SITE}${loc}</loc>`,
      lastmod && `    <lastmod>${lastmod}</lastmod>`,
      `    <changefreq>${changefreq}</changefreq>`,
      `    <priority>${priority}</priority>`,
      '  </url>',
    ]
      .filter(Boolean)
      .join('\n'),
  )
  .join('\n');

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;

writeFileSync('dist/sitemap.xml', xml);
console.log(`sitemap: wrote dist/sitemap.xml (${pages.map((p) => `${p.loc} ${p.lastmod ?? 'no lastmod'}`).join(', ')})`);
