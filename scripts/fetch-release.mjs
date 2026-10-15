// Runs before every build (npm's "prebuild"): asks GitHub for Glance's latest
// release and saves it to src/data/release.json, which the site is built from.
//
// GITHUB_TOKEN, when set (the Pages workflow sets it), lifts GitHub's limit of
// 60 requests an hour. RELEASE_STRICT=1 makes a failed lookup fail the build, so
// the workflow never publishes a stale site; without it (a local build) the last
// saved release.json is kept and the build goes on.
import fs from 'node:fs';
import { LATEST_API, normalizeRelease } from '../src/data/release-normalize.js';

const out = new URL('../src/data/release.json', import.meta.url);
const strict = process.env.RELEASE_STRICT === '1';
const headers = { Accept: 'application/vnd.github+json', 'User-Agent': 'glance-website-build' };
if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;

try {
  const res = await fetch(LATEST_API, { headers, signal: AbortSignal.timeout(20000) });
  if (!res.ok) throw new Error(`GitHub answered ${res.status} ${res.statusText}`);
  const release = normalizeRelease(await res.json());
  const json = `${JSON.stringify(release, null, 2)}\n`;
  const before = fs.existsSync(out) ? fs.readFileSync(out, 'utf8') : '';
  if (before !== json) fs.writeFileSync(out, json);
  console.log(`release: ${release.tag}, ${release.assets.length} files, ${release.notes.length} notes${before === json ? '' : ' (updated)'}`);
} catch (err) {
  const kept = fs.existsSync(out) ? JSON.parse(fs.readFileSync(out, 'utf8')).tag : null;
  if (strict || !kept) {
    console.error(`release: could not read the latest release — ${err.message}`);
    process.exit(1);
  }
  console.warn(`release: could not reach GitHub (${err.message}); building with the saved ${kept}`);
}
