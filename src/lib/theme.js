import { createSignal } from 'solid-js';

const KEY = 'glance-theme';
const root = document.documentElement;
const mq = window.matchMedia('(prefers-color-scheme: dark)');

function stored() {
  try {
    const v = localStorage.getItem(KEY);
    return v === 'light' || v === 'dark' ? v : 'system';
  } catch {
    return 'system';
  }
}

const [pref, setPrefSignal] = createSignal(stored());
const [systemDark, setSystemDark] = createSignal(mq.matches);
mq.addEventListener('change', (e) => setSystemDark(e.matches));

export { pref };
export const resolved = () => (pref() === 'system' ? (systemDark() ? 'dark' : 'light') : pref());

function write(value) {
  if (value === 'system') delete root.dataset.theme;
  else root.dataset.theme = value;
  try {
    if (value === 'system') localStorage.removeItem(KEY);
    else localStorage.setItem(KEY, value);
  } catch {}
  setPrefSignal(value);
}

/** Change theme; when the colours actually change, reveal them from `origin` in a circle. */
export function setPref(value, origin) {
  const before = resolved();
  const after = value === 'system' ? (systemDark() ? 'dark' : 'light') : value;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (before === after || reduced || !document.startViewTransition || !origin) {
    write(value);
    return;
  }

  const { x, y } = origin;
  const r = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
  const t = document.startViewTransition(() => write(value));
  t.ready
    .then(() => {
      root.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${r}px at ${x}px ${y}px)`] },
        { duration: 620, easing: 'cubic-bezier(.7,0,.25,1)', pseudoElement: '::view-transition-new(root)' },
      );
    })
    .catch(() => {});
}
