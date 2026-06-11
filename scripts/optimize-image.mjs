#!/usr/bin/env node
// Optimize one or more source images for web delivery.
//
// Usage:
//   npm run img <path-to-image> [more paths...]
//   node scripts/optimize-image.mjs <path-to-image> [--max-width=2000] [--out=public] [--name=basename]
//
// Behavior:
//   Photos (no meaningful alpha)  -> writes <name>.jpg (q82) + <name>.webp (q78)
//   Graphics with real alpha      -> writes <name>.png (palette) + <name>.webp (q85)
//   Oversized images (> max-width in px) are resized down preserving aspect.
//   Originals are NEVER overwritten unless they happen to live in the output
//   directory with the same final name and extension; large source PNGs are
//   left in place and the optimized files are emitted alongside them.
//
// The script prints before/after sizes so you can verify the compression.

import { argv, exit } from "node:process";
import { readFile, stat, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const DEFAULTS = {
  maxWidth: 2000, // hero-class images rarely need more than this
  outDir: "public",
  jpgQuality: 82,
  webpQualityPhoto: 78,
  webpQualityGraphic: 85,
  alphaThreshold: 0.995, // if min alpha >= 255 * this, treat as opaque
};

function parseArgs(rawArgs) {
  const files = [];
  const opts = { ...DEFAULTS, name: null };
  for (const arg of rawArgs) {
    if (arg.startsWith("--max-width=")) opts.maxWidth = Number(arg.split("=")[1]);
    else if (arg.startsWith("--out=")) opts.outDir = arg.split("=")[1];
    else if (arg.startsWith("--name=")) opts.name = arg.split("=")[1];
    else if (arg.startsWith("--")) {
      console.error(`Unknown flag: ${arg}`);
      exit(2);
    } else {
      files.push(arg);
    }
  }
  return { files, opts };
}

function fmtBytes(n) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(2)} MB`;
}

async function hasMeaningfulAlpha(image, metadata) {
  if (!metadata.hasAlpha) return false;
  // Inspect the alpha channel. If min alpha is effectively 255, the channel is unused.
  const stats = await image.stats();
  const alpha = stats.channels[stats.channels.length - 1];
  const opaqueFloor = 255 * DEFAULTS.alphaThreshold;
  return alpha.min < opaqueFloor;
}

async function ensureDir(dir) {
  await mkdir(dir, { recursive: true });
}

async function optimizeOne(inputPath, opts) {
  const absIn = path.resolve(inputPath);
  const srcBytes = (await stat(absIn)).size;
  const srcBuf = await readFile(absIn);

  const base = opts.name ?? path.parse(absIn).name;
  const outDir = path.resolve(opts.outDir);
  await ensureDir(outDir);

  // Pipeline: decode once, reuse for metadata + derivatives.
  const pipeline = sharp(srcBuf, { failOn: "error" }).rotate(); // respect EXIF
  const meta = await pipeline.metadata();

  const needsResize = meta.width && meta.width > opts.maxWidth;
  const resizer = needsResize
    ? (p) => p.resize({ width: opts.maxWidth, withoutEnlargement: true })
    : (p) => p;

  const realAlpha = await hasMeaningfulAlpha(pipeline, meta);

  const outputs = [];

  if (realAlpha) {
    // Graphic with transparency -> compressed PNG + WebP.
    const pngPath = path.join(outDir, `${base}.png`);
    const webpPath = path.join(outDir, `${base}.webp`);

    const pngBuf = await resizer(sharp(srcBuf).rotate())
      .png({ palette: true, quality: 90, compressionLevel: 9, effort: 10 })
      .toBuffer();
    await writeFile(pngPath, pngBuf);
    outputs.push({ path: pngPath, bytes: pngBuf.length });

    const webpBuf = await resizer(sharp(srcBuf).rotate())
      .webp({ quality: opts.webpQualityGraphic, effort: 6 })
      .toBuffer();
    await writeFile(webpPath, webpBuf);
    outputs.push({ path: webpPath, bytes: webpBuf.length });
  } else {
    // Photo (or graphic with no real alpha) -> JPG + WebP.
    const jpgPath = path.join(outDir, `${base}.jpg`);
    const webpPath = path.join(outDir, `${base}.webp`);

    const flatten = (p) => p.flatten({ background: "#ffffff" });

    const jpgBuf = await flatten(resizer(sharp(srcBuf).rotate()))
      .jpeg({ quality: opts.jpgQuality, mozjpeg: true, progressive: true })
      .toBuffer();
    await writeFile(jpgPath, jpgBuf);
    outputs.push({ path: jpgPath, bytes: jpgBuf.length });

    const webpBuf = await flatten(resizer(sharp(srcBuf).rotate()))
      .webp({ quality: opts.webpQualityPhoto, effort: 6 })
      .toBuffer();
    await writeFile(webpPath, webpBuf);
    outputs.push({ path: webpPath, bytes: webpBuf.length });
  }

  return {
    input: absIn,
    srcBytes,
    width: meta.width,
    height: meta.height,
    resized: needsResize,
    alpha: realAlpha,
    outputs,
  };
}

function report(results) {
  for (const r of results) {
    const rel = path.relative(process.cwd(), r.input);
    console.log(`\n${rel}  (${r.width}x${r.height}, ${r.alpha ? "alpha" : "opaque"})`);
    console.log(`  source: ${fmtBytes(r.srcBytes)}${r.resized ? "  [resized down]" : ""}`);
    for (const out of r.outputs) {
      const outRel = path.relative(process.cwd(), out.path);
      const ratio = ((1 - out.bytes / r.srcBytes) * 100).toFixed(0);
      console.log(`  -> ${outRel}  ${fmtBytes(out.bytes)}  (${ratio}% smaller)`);
    }
  }
}

async function main() {
  const { files, opts } = parseArgs(argv.slice(2));
  if (files.length === 0) {
    console.error("Usage: npm run img <path-to-image> [more paths...]");
    console.error("       [--max-width=2000] [--out=public] [--name=basename]");
    exit(1);
  }
  const results = [];
  for (const f of files) {
    try {
      results.push(await optimizeOne(f, opts));
    } catch (err) {
      console.error(`Failed to optimize ${f}: ${err.message}`);
      exit(1);
    }
  }
  report(results);
}

main();
