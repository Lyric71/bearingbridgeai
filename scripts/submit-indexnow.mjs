#!/usr/bin/env node
/**
 * Submit URLs to IndexNow (Bing, Yandex, Seznam, Naver) after a deploy.
 *
 * Usage:
 *   node scripts/submit-indexnow.mjs                    # submits all URLs in dist/client/sitemap-0.xml
 *   node scripts/submit-indexnow.mjs https://bearingbridge.ai/insights/foo  # one URL
 *   node scripts/submit-indexnow.mjs --changed-since=2026-05-15  # filter sitemap by lastmod
 *
 * The key file lives at public/<key>.txt and is served from
 * https://bearingbridge.ai/<key>.txt for verification.
 */
import { readFileSync } from 'node:fs';

const HOST = 'bearingbridge.ai';
const KEY = '1c30762450e26e4061508f626283b403';
const KEY_LOCATION = `https://${HOST}/${KEY}.txt`;
const ENDPOINT = 'https://api.indexnow.org/indexnow';
const SITEMAP_PATH = 'dist/client/sitemap-0.xml';

function urlsFromSitemap(filter) {
  const xml = readFileSync(SITEMAP_PATH, 'utf8');
  const matches = [...xml.matchAll(/<url>([\s\S]*?)<\/url>/g)];
  const urls = [];
  for (const [, block] of matches) {
    const loc = block.match(/<loc>([^<]+)<\/loc>/)?.[1];
    if (!loc) continue;
    if (filter) {
      const lastmod = block.match(/<lastmod>([^<]+)<\/lastmod>/)?.[1];
      if (!lastmod || lastmod < filter) continue;
    }
    urls.push(loc);
  }
  return urls;
}

async function submit(urls) {
  if (urls.length === 0) {
    console.log('No URLs to submit.');
    return;
  }
  const body = JSON.stringify({
    host: HOST,
    key: KEY,
    keyLocation: KEY_LOCATION,
    urlList: urls,
  });
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body,
  });
  if (res.ok || res.status === 202) {
    console.log(`IndexNow accepted ${urls.length} URLs (HTTP ${res.status}).`);
  } else {
    const text = await res.text();
    console.error(`IndexNow failed: HTTP ${res.status} ${text}`);
    process.exit(1);
  }
}

async function main() {
  const args = process.argv.slice(2);
  const changedSince = args.find((a) => a.startsWith('--changed-since='))?.split('=')[1];
  const explicitUrls = args.filter((a) => a.startsWith('http'));
  const urls = explicitUrls.length > 0 ? explicitUrls : urlsFromSitemap(changedSince);
  // IndexNow accepts up to 10,000 URLs per request.
  const batches = [];
  for (let i = 0; i < urls.length; i += 10000) batches.push(urls.slice(i, i + 10000));
  for (const batch of batches) await submit(batch);
}

main().catch((e) => { console.error(e); process.exit(1); });
