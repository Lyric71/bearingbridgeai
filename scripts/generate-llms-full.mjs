#!/usr/bin/env node
/**
 * Generate public/llms-full.txt: the full-text dump of every EN insight,
 * formatted for AI crawlers that consume the llms-full.txt spec
 * (https://llmstxt.org). Frontmatter is summarised at the top of each entry,
 * the article body follows as plain markdown.
 *
 * Run manually before deploy:
 *   npm run llms:full
 *
 * Or wire into your deploy step.
 */
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const SOURCE_DIR = 'src/content/insights';
const TARGET = 'public/llms-full.txt';
const SITE = 'https://bearingbridge.ai';

function parseFrontmatter(text) {
  const m = text.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!m) return { frontmatter: {}, body: text };
  const fm = {};
  for (const line of m[1].split('\n')) {
    const kv = line.match(/^(\w+):\s*(.*)$/);
    if (!kv) continue;
    let [, k, v] = kv;
    v = v.trim();
    if (v.startsWith('"') && v.endsWith('"')) v = v.slice(1, -1);
    // Skip arrays / nested objects; we only need scalar fields here.
    if (v.startsWith('[') || v.startsWith('{') || v === '') continue;
    fm[k] = v;
  }
  return { frontmatter: fm, body: m[2].trim() };
}

function buildEntry(slug, fm, body) {
  const url = `${SITE}/insights/${slug}`;
  const header = [
    `# ${fm.title ?? slug}`,
    '',
    `URL: ${url}`,
    fm.pubDate ? `Published: ${fm.pubDate}` : null,
    fm.updatedDate ? `Updated: ${fm.updatedDate}` : null,
    fm.author ? `Author: ${fm.author}` : null,
    fm.category ? `Category: ${fm.category}` : null,
    fm.description ? `\n${fm.description}` : null,
  ].filter(Boolean).join('\n');
  return `${header}\n\n${body}\n\n---\n`;
}

function main() {
  // No content collection yet: skip quietly so `prebuild` never breaks the
  // build on a fresh checkout.
  if (!existsSync(SOURCE_DIR)) {
    console.log(`No ${SOURCE_DIR} directory; skipped llms-full.txt generation.`);
    return;
  }
  const entries = [];
  const files = readdirSync(SOURCE_DIR).filter((f) => f.endsWith('.md')).sort();
  for (const file of files) {
    const slug = file.replace(/\.md$/, '');
    const { frontmatter, body } = parseFrontmatter(readFileSync(join(SOURCE_DIR, file), 'utf8'));
    if (frontmatter.draft === 'true') continue;
    entries.push(buildEntry(slug, frontmatter, body));
  }
  const head = [
    '# BearingBridge AI — Insights (full text)',
    '',
    `> Full-text dump of every published insight on ${SITE}/insights, for AI crawlers that consume the llms-full.txt format. Published by the BearingBridge AI team. Last regenerated: ${new Date().toISOString().slice(0, 10)}.`,
    '',
    '---',
    '',
  ].join('\n');
  writeFileSync(TARGET, head + entries.join(''));
  console.log(`Wrote ${TARGET} (${entries.length} articles, ${(head.length + entries.join('').length).toLocaleString()} bytes)`);
}

main();
