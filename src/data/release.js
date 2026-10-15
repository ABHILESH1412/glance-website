import { createSignal } from 'solid-js';
import built from './release.json';
import { LATEST_API, normalizeRelease } from './release-normalize';

// The latest Glance release. The site is built with the one GitHub had at
// build time (release.json); when the page opens it asks GitHub again, and if
// a newer release has come out since, everything that shows the version or the
// files switches to it. If GitHub cannot be reached, the built-in one stays.
const [release, setRelease] = createSignal(built);
export { release };

// A visitor's browser may ask GitHub 60 times an hour, so the answer is kept
// for an hour and shared between pages and tabs.
const CACHE_KEY = 'glance-latest-release';
const MAX_AGE = 60 * 60 * 1000;

const newer = (a, b) => (Date.parse(a.date) || 0) > (Date.parse(b.date) || 0);

function adopt(candidate) {
  if (candidate?.tag && candidate.tag !== release().tag && newer(candidate, release())) setRelease(candidate);
}

let checked = false;
export function checkLatest() {
  if (checked) return;
  checked = true;
  try {
    const cached = JSON.parse(localStorage.getItem(CACHE_KEY) || 'null');
    if (cached && Date.now() - cached.at < MAX_AGE) return adopt(cached.release);
  } catch {}
  fetch(LATEST_API, { headers: { Accept: 'application/vnd.github+json' } })
    .then((res) => (res.ok ? res.json() : Promise.reject(new Error(String(res.status)))))
    .then((json) => {
      const latest = normalizeRelease(json);
      try {
        localStorage.setItem(CACHE_KEY, JSON.stringify({ at: Date.now(), release: latest }));
      } catch {}
      adopt(latest);
    })
    .catch(() => {});
}
