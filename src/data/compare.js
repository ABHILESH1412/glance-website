// From the Glance README, "How it compares" — compiled from each project's own
// documentation, and Apple's Preview User Guide, in October 2026.
import { asset } from '../lib/base';

export const apps = [
  { id: 'glance', name: 'Glance', icon: asset('img/logo.webp'), note: 'GTK 4 · Rust' },
  { id: 'preview', name: 'Preview', icon: asset('img/preview.webp'), note: 'macOS only' },
  { id: 'loupe', name: 'Loupe', icon: asset('img/loupe.webp'), note: 'GTK 4 · Rust' },
  { id: 'gthumb', name: 'gThumb', icon: asset('img/gthumb.webp'), note: 'GTK 3 · C' },
  { id: 'gwenview', name: 'Gwenview', icon: asset('img/gwenview.webp'), note: 'Qt · C++' },
  { id: 'qview', name: 'qView', icon: asset('img/qview.webp'), note: 'Qt · C++' },
  { id: 'nomacs', name: 'nomacs', icon: asset('img/nomacs.webp'), note: 'Qt · C++' },
];

// Order of the values follows `apps`. A third element marks a row only Glance has.
export const groups = [
  {
    id: 'speed',
    title: 'Speed and rendering',
    rows: [
      ['GPU-accelerated rendering', [1, 1, 1, 0, 0, 0, 0]],
      ['SVG zoom with no re-rasterising', [1, 0, 0, 0, 0, 0, 0], true],
      ['Memory-safe decoders (Rust)', [1, 0, 1, 0, 0, 0, 0]],
      ['Two-finger pan and pinch zoom', [1, 1, 1, 0, 0, 0, 0]],
      ['Current native toolkit (GTK 4 / libadwaita, or AppKit)', [1, 1, 1, 0, 0, 0, 0]],
    ],
  },
  {
    id: 'editing',
    title: 'Editing pictures',
    rows: [
      ['Rotate and flip', [1, 1, 1, 1, 1, 1, 1]],
      ['Rotate to any angle', [1, 0, 0, 1, 0, 0, 1]],
      ['Crop', [1, 1, 1, 1, 1, 0, 1]],
      ['Resize to exact pixels', [1, 1, 0, 1, 1, 0, 1]],
      ['Brightness / contrast / saturation', [1, 1, 0, 1, 1, 0, 1]],
      ['Draw, shapes and text on the image', [1, 1, 0, 0, 1, 0, 1]],
      ['Move, resize and recolour a shape after drawing it', [1, 1, 0, 0, 0, 0, 0]],
      ['Signatures, written once and kept', [1, 1, 0, 0, 0, 0, 0]],
      ['Redact — black out for good', [1, 1, 0, 0, 0, 0, 0]],
      ['Convert format on save, with a quality dial', [1, 1, 0, 1, 1, 0, 1]],
      ['Compress or inflate to a target file size', [1, 0, 0, 0, 0, 0, 0], true],
    ],
  },
  {
    id: 'pdf',
    title: 'PDFs',
    rows: [
      ['Read, search and copy text', [1, 1, 0, 0, 0, 0, 0]],
      ['Highlight, underline, notes and drawings, saved in the file', [1, 1, 0, 0, 0, 0, 0]],
      ['Sign a PDF', [1, 1, 0, 0, 0, 0, 0]],
      ['Fill in form fields', [0, 1, 0, 0, 0, 0, 0]],
      ['Combine PDFs and pictures; add, remove, reorder and turn pages', [1, 1, 0, 0, 0, 0, 0]],
      ['Insert a blank page', [1, 1, 0, 0, 0, 0, 0]],
      ['Password-protect a PDF', [1, 1, 0, 0, 0, 0, 0]],
      ['Make a PDF smaller', [1, 1, 0, 0, 0, 0, 0]],
      ['Redact text permanently', [1, 1, 0, 0, 0, 0, 0]],
      ['Night mode, colours kept', [1, 0, 0, 0, 0, 0, 0], true],
    ],
  },
  {
    id: 'browsing',
    title: 'Browsing and extras',
    rows: [
      ['Camera raw, HEIC and AVIF', [1, 1, 1, 1, 1, 1, 1]],
      ['SVG', [1, 0, 1, 1, 1, 1, 1]],
      ['ICC colour management', [1, 1, 1, 1, 1, 1, 0]],
      ['Live Text — copy the text out of a picture', [1, 1, 0, 0, 0, 0, 0]],
      ['Filmstrip of the whole folder', [1, 0, 0, 1, 1, 0, 1]],
      ['EXIF / metadata panel', [1, 1, 1, 1, 1, 0, 1]],
      ['Slideshow', [1, 1, 0, 1, 1, 1, 1]],
      ['Thumbnail browser / file manager', [0, 0, 0, 1, 1, 0, 1]],
      ['Batch processing', [0, 1, 0, 1, 0, 0, 1]],
      ['Tags, catalogs, albums', [0, 0, 0, 1, 0, 0, 0]],
      ['3D models (USDZ, OBJ, STL)', [0, 1, 0, 0, 0, 0, 0]],
      ['Runs on Linux', [1, 0, 1, 1, 1, 1, 1]],
      ['Windows builds', [0, 0, 0, 0, 0, 1, 1]],
    ],
  },
];

export const tally = (group) =>
  apps.map((_, i) => (group ? [group] : groups).flatMap((g) => g.rows).filter((r) => r[1][i]).length);
