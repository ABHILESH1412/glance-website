// From the Glance README, "How it compares" — compiled from each project's
// own documentation in September 2026.
import { asset } from '../lib/base';
export const apps = [
  { id: 'glance', name: 'Glance', icon: asset('img/logo.webp'), note: 'GTK 4 · Rust' },
  { id: 'loupe', name: 'Loupe', icon: asset('img/loupe.webp'), note: 'GTK 4 · Rust' },
  { id: 'gthumb', name: 'gThumb', icon: asset('img/gthumb.webp'), note: 'GTK 3 · C' },
  { id: 'gwenview', name: 'Gwenview', icon: asset('img/gwenview.webp'), note: 'Qt · C++' },
  { id: 'qview', name: 'qView', icon: asset('img/qview.webp'), note: 'Qt · C++' },
  { id: 'nomacs', name: 'nomacs', icon: asset('img/nomacs.webp'), note: 'Qt · C++' },
];

// Order of the booleans follows `apps`.
export const groups = [
  {
    id: 'speed',
    title: 'Speed and rendering',
    rows: [
      ['GPU-accelerated rendering', [1, 1, 0, 0, 0, 0]],
      ['SVG zoom with no re-rasterising', [1, 0, 0, 0, 0, 0]],
      ['Memory-safe decoders (Rust)', [1, 1, 0, 0, 0, 0]],
      ['Two-finger pan and pinch zoom', [1, 1, 0, 0, 0, 0]],
      ['Modern toolkit (GTK 4 / libadwaita)', [1, 1, 0, 0, 0, 0]],
    ],
  },
  {
    id: 'editing',
    title: 'Editing',
    rows: [
      ['Rotate and flip', [1, 1, 1, 1, 1, 1]],
      ['Rotate to any angle', [1, 0, 1, 0, 0, 1]],
      ['Crop', [1, 1, 1, 1, 0, 1]],
      ['Resize to exact pixels', [1, 0, 1, 1, 0, 1]],
      ['Brightness / contrast / saturation', [1, 0, 1, 1, 0, 1]],
      ['Draw, shapes and text on the image', [1, 0, 0, 1, 0, 1]],
      ['Convert format on save, with a quality dial', [1, 0, 1, 1, 0, 1]],
      ['Compress or inflate to a target file size', [1, 0, 0, 0, 0, 0], true],
    ],
  },
  {
    id: 'browsing',
    title: 'Browsing and extras',
    rows: [
      ['Camera raw, HEIC / AVIF and SVG', [1, 1, 1, 1, 1, 1]],
      ['ICC colour management', [1, 1, 1, 1, 1, 0]],
      ['Filmstrip of the folder', [1, 0, 1, 1, 0, 1]],
      ['Thumbnail browser / file manager', [0, 0, 1, 1, 0, 1]],
      ['EXIF / metadata panel', [0, 1, 1, 1, 0, 1]],
      ['Slideshow', [0, 0, 1, 1, 1, 1]],
      ['Batch processing', [0, 0, 1, 0, 0, 1]],
      ['Tags, catalogs, albums', [0, 0, 1, 0, 0, 0]],
      ['Windows and macOS builds', [0, 0, 0, 0, 1, 1]],
    ],
  },
];

export const tally = (group) =>
  apps.map((_, i) => (group ? [group] : groups).flatMap((g) => g.rows).filter((r) => r[1][i]).length);
