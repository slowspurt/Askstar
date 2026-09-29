import { readdir, readFile, writeFile, rm } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const dist = fileURLToPath(new URL('../dist/', import.meta.url));
const configuredUrl = process.env.SITE_URL
  || process.env.VERCEL_PROJECT_PRODUCTION_URL
  || process.env.VERCEL_URL;
if (process.env.VERCEL && !configuredUrl) {
  throw new Error('Enable Vercel System Environment Variables or set SITE_URL before building.');
}
const site = new URL(configuredUrl
  ? (/^https?:\/\//.test(configuredUrl) ? configuredUrl : `https://${configuredUrl}`)
  : 'http://localhost:4173');
if (!['http:', 'https:'].includes(site.protocol) || site.username || site.password) {
  throw new Error('SITE_URL must be an HTTP(S) URL without credentials.');
}
const origin = site.origin;

// Work only on built copies: preserve the archived, manually edited articles.
async function updateUrls(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      await updateUrls(file);
    } else if (/\.(html|xml|txt)$/.test(entry.name)) {
      const text = await readFile(file, 'utf8');
      await writeFile(file, text
        .replaceAll('https://askstar.kr', origin)
        .replaceAll('__ASKSTAR_SITE_URL__', origin)
        .replaceAll('/meta img.jpg', '/meta%20img.jpg'));
    }
  }
}

// The old public/share/index.html references unbuilt /src code and masks SPA routes.
await rm(path.join(dist, 'share'), { recursive: true, force: true });
await rm(path.join(dist, 'CNAME'), { force: true });
await rm(path.join(dist, 'ads.txt'), { force: true });
await updateUrls(dist);

const { articles } = JSON.parse(await readFile(path.join(dist, 'data/articles.json'), 'utf8'));
const routes = ['/', '/about', '/input', '/fortune', '/article',
  ...articles.map(article => `/article/${encodeURIComponent(article.url)}`)];
await writeFile(path.join(dist, 'sitemap.xml'),
  '<?xml version="1.0" encoding="UTF-8"?>\n'
  + '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
  + routes.map(route => `  <url><loc>${origin}${route}</loc></url>`).join('\n')
  + '\n</urlset>\n');
await writeFile(path.join(dist, 'robots.txt'),
  `User-agent: *\nAllow: /\nDisallow: /share\nDisallow: /result\nDisallow: /loading\n\nSitemap: ${origin}/sitemap.xml\n`);
console.log(`Prepared portfolio metadata for ${origin} (${articles.length} archived articles).`);
