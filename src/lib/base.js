// Where the site is served from: "/" normally, "/<repo>/" on a GitHub Pages
// project site. Set at build time through the BASE_PATH environment variable.
export const BASE = import.meta.env.BASE_URL;

/** A file from public/, e.g. asset('img/logo.webp'). */
export const asset = (path) => BASE + path.replace(/^\//, '');

/** A browser pathname without the base, so '/glance-website/features' → '/features'. */
export const stripBase = (pathname) => {
  const base = BASE.replace(/\/$/, '');
  return base && pathname.startsWith(base) ? pathname.slice(base.length) || '/' : pathname;
};
