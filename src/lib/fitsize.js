// Hitting a file size — a port of Glance's src/compress.rs to the browser's
// own encoders. Same two levers: a search over JPEG quality, then shrinking
// the picture when even the worst quality is too big. The other direction is
// real too: a file too small is padded with a JPEG comment or a PNG text
// chunk, so the picture is untouched and the file stays valid.

export const KB = 1024;
export const MB = 1024 * KB;

const MIN_QUALITY = 15;
const MAX_QUALITY = 100;
const SHRINK_ROUNDS = 5;
const MIN_EDGE = 32;
// The app allows 512 MB of filler; a browser tab should not.
const MOST_PADDING = 64 * MB;

export function describe(bytes) {
  if (bytes >= MB) return `${(bytes / MB).toFixed(1)} MB`;
  if (bytes >= KB) return `${Math.round(bytes / KB)} KB`;
  return `${bytes} bytes`;
}

export function encode(canvas, type, quality) {
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Could not encode.'))), type, quality / 100),
  );
}

/** JPEG cannot carry transparency, so flatten onto white first, as the app does. */
export function flatten(source) {
  const c = document.createElement('canvas');
  c.width = source.width;
  c.height = source.height;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, c.width, c.height);
  ctx.drawImage(source, 0, 0);
  return c;
}

function resize(source, width, height) {
  const c = document.createElement('canvas');
  c.width = width;
  c.height = height;
  const ctx = c.getContext('2d');
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(source, 0, 0, width, height);
  return c;
}

async function searchQuality(image, type, wanted, step, known) {
  if (type !== 'image/jpeg') {
    const blob = known ?? (await encode(image, type, MAX_QUALITY));
    if (!known) await step({ kind: 'probe', quality: null, size: blob.size, fits: blob.size <= wanted });
    return blob.size <= wanted ? { blob, quality: null, width: image.width, height: image.height, padding: 0 } : null;
  }

  let low = MIN_QUALITY;
  let high = MAX_QUALITY;
  let best = null;
  while (low <= high) {
    const middle = low + Math.floor((high - low) / 2);
    const blob = await encode(image, type, middle);
    const fits = blob.size <= wanted;
    await step({ kind: 'probe', quality: middle, size: blob.size, fits, low, high });
    if (fits) {
      best = { quality: middle, blob };
      low = middle + 1;
    } else if (middle === MIN_QUALITY) {
      break;
    } else {
      high = middle - 1;
    }
  }
  return best && { ...best, width: image.width, height: image.height, padding: 0 };
}

/**
 * Encode `source` (a canvas) as `type`, as close under `wanted` bytes as it
 * gets — or padded up to it when the picture will not fill it.
 * `step` is awaited after every encode, so a caller can show the search.
 */
export async function fitToSize(source, type, wanted, step = async () => {}) {
  if (!(wanted > 0)) throw new Error('Give a size to aim for.');
  const lossy = type === 'image/jpeg';
  let working = lossy ? flatten(source) : source;

  const largest = await encode(working, type, MAX_QUALITY);
  await step({ kind: 'probe', quality: lossy ? MAX_QUALITY : null, size: largest.size, fits: largest.size <= wanted, low: MIN_QUALITY, high: MAX_QUALITY });
  if (largest.size <= wanted) {
    const blob = await pad(largest, type, wanted - largest.size);
    const padding = blob.size - largest.size;
    if (padding > 0) await step({ kind: 'pad', padding, size: blob.size, type });
    return { blob, quality: lossy ? MAX_QUALITY : null, width: working.width, height: working.height, padding };
  }

  for (let round = 0; round < SHRINK_ROUNDS; round++) {
    const fit = await searchQuality(working, type, wanted, step, round === 0 && !lossy ? largest : null);
    if (fit) return fit;
    // Too big even at the worst quality: the picture itself has to give. File
    // size goes roughly with area, so the side scales with the root of the ratio.
    const floor = await encode(working, type, MIN_QUALITY);
    const ratio = Math.min(0.9, Math.max(0.1, Math.sqrt(wanted / floor.size) * 0.95));
    const width = Math.max(1, Math.round(working.width * ratio));
    const height = Math.max(1, Math.round(working.height * ratio));
    if (Math.max(width, height) < MIN_EDGE) {
      throw new Error(`${describe(wanted)} is too small a target for this picture: it would have to shrink past ${MIN_EDGE} pixels.`);
    }
    await step({ kind: 'shrink', width, height });
    working = resize(working, width, height);
  }
  throw new Error(`Could not get this down to ${describe(wanted)}. Try a larger target, or resize it first.`);
}

// ------------------------------------------------------------------ padding
async function pad(blob, type, wanted) {
  if (wanted <= 0) return blob;
  if (wanted > MOST_PADDING) throw new Error(`${describe(wanted)} is too much padding to add in a browser tab.`);
  const bytes = new Uint8Array(await blob.arrayBuffer());
  if (type === 'image/jpeg') return new Blob([padJpeg(bytes, wanted)], { type });
  if (type === 'image/png') return new Blob([padPng(bytes, wanted)], { type });
  return blob;
}

/** A JPEG comment segment holds up to 65533 bytes, so long padding becomes several, straight after SOI. */
function padJpeg(bytes, wanted) {
  const MOST = 65533;
  const OVERHEAD = 4;
  if (bytes.length < 2 || bytes[0] !== 0xff || bytes[1] !== 0xd8) return bytes;
  const segments = [];
  let left = wanted;
  let total = 0;
  while (left > OVERHEAD) {
    const payload = Math.min(left - OVERHEAD, MOST);
    segments.push(payload);
    total += payload + OVERHEAD;
    left -= payload + OVERHEAD;
  }
  const out = new Uint8Array(bytes.length + total);
  out.set(bytes.subarray(0, 2), 0);
  let at = 2;
  for (const payload of segments) {
    const length = payload + 2;
    out[at] = 0xff;
    out[at + 1] = 0xfe;
    out[at + 2] = length >> 8;
    out[at + 3] = length & 0xff;
    out.fill(0x20, at + 4, at + 4 + payload);
    at += payload + OVERHEAD;
  }
  out.set(bytes.subarray(2), at);
  return out;
}

/** A PNG tEXt chunk, inserted before IEND. */
function padPng(bytes, wanted) {
  const KEYWORD = new TextEncoder().encode('Comment\0');
  const OVERHEAD = 12;
  const end = findIend(bytes);
  if (end == null) return bytes;
  const payload = Math.max(0, wanted - OVERHEAD - KEYWORD.length);
  if (payload === 0) return bytes;

  const dataLength = KEYWORD.length + payload;
  const chunk = new Uint8Array(dataLength + OVERHEAD);
  const view = new DataView(chunk.buffer);
  view.setUint32(0, dataLength);
  chunk.set([0x74, 0x45, 0x58, 0x74], 4); // tEXt
  chunk.set(KEYWORD, 8);
  chunk.fill(0x20, 8 + KEYWORD.length, 8 + dataLength);
  view.setUint32(8 + dataLength, crc32(chunk.subarray(4, 8 + dataLength)));

  const out = new Uint8Array(bytes.length + chunk.length);
  out.set(bytes.subarray(0, end), 0);
  out.set(chunk, end);
  out.set(bytes.subarray(end), end + chunk.length);
  return out;
}

function findIend(bytes) {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  let at = 8;
  while (at + 8 <= bytes.length) {
    const length = view.getUint32(at);
    if (bytes[at + 4] === 0x49 && bytes[at + 5] === 0x45 && bytes[at + 6] === 0x4e && bytes[at + 7] === 0x44) return at;
    at += 12 + length;
  }
  return null;
}

let table;
function crc32(data) {
  if (!table) {
    table = new Uint32Array(256);
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      table[n] = c >>> 0;
    }
  }
  let crc = 0xffffffff;
  for (let i = 0; i < data.length; i++) crc = table[(crc ^ data[i]) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

// ------------------------------------------------------------------ helpers
/** Draw an <svg> element into a canvas at a given pixel size. */
export async function svgToCanvas(svg, width, height) {
  const clone = svg.cloneNode(true);
  clone.setAttribute('width', width);
  clone.setAttribute('height', height);
  clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  clone.removeAttribute('style');
  clone.removeAttribute('class');
  const markup = new XMLSerializer().serializeToString(clone);
  const url = URL.createObjectURL(new Blob([markup], { type: 'image/svg+xml' }));
  try {
    const img = new Image();
    img.decoding = 'async';
    img.src = url;
    await img.decode();
    const c = document.createElement('canvas');
    c.width = width;
    c.height = height;
    c.getContext('2d').drawImage(img, 0, 0, width, height);
    return c;
  } finally {
    URL.revokeObjectURL(url);
  }
}

/** Seeded film grain, so a flat illustration compresses like a photograph. */
export function addGrain(canvas, amount = 18, seed = 7) {
  const ctx = canvas.getContext('2d');
  const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const d = img.data;
  let s = seed >>> 0;
  const rand = () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  for (let i = 0; i < d.length; i += 4) {
    const n = (rand() - 0.5) * amount;
    d[i] += n;
    d[i + 1] += n;
    d[i + 2] += n;
  }
  ctx.putImageData(img, 0, 0);
  return canvas;
}

export function saveBlob(blob, name) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}
