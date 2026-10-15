// Turns GitHub's "latest release" answer into what the site needs. Plain
// JavaScript with no imports, so the build script (Node) and the page (the
// browser) read a release the same way.

export const REPO_SLUG = 'ABHILESH1412/glance';
export const LATEST_API = `https://api.github.com/repos/${REPO_SLUG}/releases/latest`;

export function normalizeRelease(r) {
  const tag = String(r.tag_name || '');
  if (!tag) throw new Error('release has no tag');
  return {
    tag,
    version: tag.replace(/^v/i, ''),
    name: r.name || tag,
    date: r.published_at || r.created_at || null,
    url: r.html_url || `https://github.com/${REPO_SLUG}/releases/tag/${tag}`,
    notes: parseNotes(r.body || ''),
    assets: (r.assets || []).map((a) => ({ name: a.name, size: a.size, url: a.browser_download_url })),
  };
}

// The bullet points under the first "What's new"-style heading (or every bullet,
// when there are no headings). Release notes made from commit messages carry tags
// like "[feat]" and "[fix]", sometimes several to a line; each becomes its own item.
const KINDS = 'feat|fix|update|perf|docs|chore|refactor|change|new';
const TAG = new RegExp(`^\\[(${KINDS})[^\\]]*\\]\\s*`, 'i');
// Where a new tag starts mid-line. No capturing group: split() would return it.
const NEXT_TAG = new RegExp(`\\s+(?=\\[(?:${KINDS})[^\\]]*\\])`, 'i');

export function parseNotes(body) {
  const items = [];
  let section = null; // null: no heading seen yet; true / false: inside a wanted section or not
  for (const raw of body.replace(/\r/g, '').split('\n')) {
    const heading = raw.match(/^#{1,6}\s+(.*)/);
    if (heading) {
      if (section && items.length) break;
      section = /new|change|highlight|feature|fix/i.test(heading[1]);
      continue;
    }
    if (section === false) continue;
    const bullet = raw.match(/^\s*[-*+]\s+(.*)/);
    if (!bullet) continue;
    for (const part of bullet[1].split(NEXT_TAG)) {
      let text = part.trim();
      let kind = null;
      const tag = text.match(TAG);
      if (tag) {
        kind = tag[1].toLowerCase();
        text = text.slice(tag[0].length);
      }
      text = text
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // links → their text
        .replace(/[*_`]/g, '')
        .trim();
      // Housekeeping commits say nothing to someone choosing a download.
      if (!text || /^(update[ds]?|edit(ed)?)\s+readme(\.md)?\.?$/i.test(text)) continue;
      items.push({ kind, text: text[0].toUpperCase() + text.slice(1) });
    }
  }
  return items;
}

/** GitHub-style sizes: 9768560 → "9.3 MB". */
export function formatSize(bytes) {
  if (!Number.isFinite(bytes) || bytes <= 0) return '';
  if (bytes < 1024) return `${bytes} bytes`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}
