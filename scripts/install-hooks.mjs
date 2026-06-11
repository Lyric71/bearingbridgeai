#!/usr/bin/env node
// Install repo git hooks into .git/hooks/. Run once after cloning:
//   npm run hooks:install
//
// Idempotent: re-running just overwrites the files in .git/hooks/. Skips with a
// warning if .git/hooks/ doesn't exist (e.g. running from a tarball).

import { copyFile, readdir, chmod, stat } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const SRC = path.resolve("scripts/hooks");
const DST = path.resolve(".git/hooks");

async function main() {
  try {
    await stat(DST);
  } catch {
    console.warn(`No .git/hooks/ directory at ${DST}; skipping hook install.`);
    return;
  }

  const files = await readdir(SRC);
  for (const name of files) {
    const from = path.join(SRC, name);
    const to = path.join(DST, name);
    await copyFile(from, to);
    if (process.platform !== "win32") {
      await chmod(to, 0o755);
    }
    console.log(`installed: ${path.relative(process.cwd(), to)}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
