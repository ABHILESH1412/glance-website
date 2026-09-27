# glance-website

The website for [Glance](https://github.com/ABHILESH1412/glance), the image viewer for Linux.
Solid.js + Vite + GSAP.

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # static site in dist/
npm run preview   # serve dist/ locally
```

## Publishing a release — the only file you need to touch

Everything about downloading lives in **`src/data/downloads.js`**:

1. bump `version`
2. set `ready: true` on each channel that now works (Flatpak, AUR, Fedora, .deb, source)
3. fill in file URLs and sizes for anything you attached to the GitHub release

Channels still marked `ready: false` show on the site as "coming soon". The first
ready channel in `featured` becomes the install command on the home page.

## Pages

| Route       | File                     |
|-------------|--------------------------|
| `/`         | `src/pages/Home.jsx`     |
| `/features` | `src/pages/Features.jsx` |
| `/compare`  | `src/pages/Compare.jsx` — data in `src/data/compare.js` |
| `/download` | `src/pages/Download.jsx` — data in `src/data/downloads.js` |

Each page is its own chunk and loads only when visited. Page transitions are in
`src/components/PageTransition.jsx`; the theme (light / dark / system, remembered
per visitor) in `src/lib/theme.js`.

## Hosting

**GitHub Pages** is set up: `.github/workflows/deploy.yml` builds and publishes the
site on every push to `main`. In the repository go to Settings → Pages and set
Source to "GitHub Actions" once. The workflow works out the address itself — a
repository called `<user>.github.io` is served from the root, any other from
`/<repository-name>/`. The build copies `index.html` to `404.html` so links like
`/features` work when opened directly.

To build for a subfolder yourself: `BASE_PATH=/glance-website/ npm run build`.

Elsewhere: Netlify uses `public/_redirects`; Vercel and Cloudflare Pages need nothing.

## Images

`public/img/` holds the logo, the app's screenshots (from `glance/data/screenshots`)
and the other viewers' icons for the comparison, all converted to WebP. If the app's
screenshots change, regenerate them with:

```bash
magick ../../glance/data/screenshots/viewing.png -quality 80 -define webp:method=6 public/img/viewing.webp
```
