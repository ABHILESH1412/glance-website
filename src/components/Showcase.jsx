import { For, Show, createSignal, onCleanup, onMount } from 'solid-js';
import { gsap, reducedMotion } from '../lib/motion';
import Scene from './Scene';
import Icon from './Icon';
import './showcase.css';

// ---------------------------------------------------------------- Redaction
// The point of Glance's redaction, shown rather than told: what a program can
// still copy out of the file after each kind of "black box".
const DOC = [
  ['Invoice', 'INV-2026-0418'],
  ['Billed to', 'Asha Rao'],
  ['Account', '4417 1234 5678 9113', true],
  ['Phone', '+91 98200 41827', true],
  ['Amount', '₹ 18,400'],
];

const MODES = [
  { id: 'drawn', label: 'A box drawn in any editor', verdict: 'Still in the file. Anyone can copy it out, or lift the box off.', bad: true },
  { id: 'marked', label: 'Marked in Glance', verdict: 'Marked, see-through, edged in red, so you can check what each covers. Nothing has changed yet.' },
  { id: 'applied', label: 'Applied in Glance', verdict: 'Gone from the file for good. The page is rebuilt; the words around it are still searchable.' },
];

export function RedactDemo() {
  const [mode, setMode] = createSignal('drawn');
  const m = () => MODES.find((x) => x.id === mode());
  return (
    <div class="rd">
      <div class="seg rd__modes" role="radiogroup" aria-label="Kind of black box">
        <For each={MODES}>
          {(x) => (
            <button type="button" role="radio" aria-checked={mode() === x.id} onClick={() => setMode(x.id)}>
              {x.label}
            </button>
          )}
        </For>
      </div>
      <div class="rd__grid">
        <div class="rd__page" aria-label="The page">
          <For each={DOC}>
            {([k, v, secret]) => (
              <div class="rd__row">
                <span class="rd__k">{k}</span>
                <span class="rd__v" classList={{ [`is-${mode()}`]: !!secret, 'is-secret': !!secret }}>
                  {v}
                </span>
              </div>
            )}
          </For>
        </div>
        <div class="rd__copy">
          <div class="rd__copy-head">
            <Icon name="copy" size={14} /> What any program can copy out of the file
          </div>
          <pre>
            <For each={DOC}>
              {([k, v, secret]) => (
                <span class="rd__line">
                  {k}: <span classList={{ 'rd__leak': secret && mode() !== 'applied' }}>{secret && mode() === 'applied' ? '' : v}</span>
                </span>
              )}
            </For>
          </pre>
          <p class="rd__verdict" classList={{ 'is-bad': !!m().bad, 'is-good': mode() === 'applied' }}>
            <Icon name={m().bad ? 'x' : mode() === 'applied' ? 'check' : 'redact'} size={16} />
            {m().verdict}
          </p>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- Live Text
export function LiveTextDemo() {
  let root;
  let ctx;
  onMount(() => {
    if (reducedMotion()) {
      gsap.set(root.querySelectorAll('.lt__w'), { opacity: 1 });
      return;
    }
    ctx = gsap.context(() => {
      gsap
        .timeline({ repeat: -1, repeatDelay: 1 })
        .set('.lt__w', { opacity: 0, '--sel': 0 })
        .set('.lt__toast', { opacity: 0, y: 8 })
        .fromTo('.lt__scan', { top: '0%', opacity: 1 }, { top: '100%', duration: 1.2, ease: 'power1.inOut' })
        .set('.lt__scan', { opacity: 0 })
        .to('.lt__w', { opacity: 1, duration: 0.3, stagger: 0.06 }, '-=0.3')
        .to('.lt__w', { '--sel': 1, duration: 0.18, stagger: 0.12, ease: 'none' }, '+=0.4')
        .to('.lt__toast', { opacity: 1, y: 0, duration: 0.35 }, '+=0.2')
        .to({}, { duration: 2 });
    }, root);
  });
  onCleanup(() => ctx?.revert());

  return (
    <div class="lt" ref={root} aria-label="A photo of a trail sign, with its words found and copied">
      <div class="lt__photo">
        <Scene index={3} preserve="xMidYMid slice" />
        <div class="lt__sign">
          <div class="lt__line">
            <span class="lt__w">RIDGE</span> <span class="lt__w">PATH</span>
          </div>
          <div class="lt__line lt__line--sm">
            <span class="lt__w">Summit</span> <span class="lt__w">2.4</span> <span class="lt__w">km</span>
          </div>
          <div class="lt__line lt__line--sm">
            <span class="lt__w">Lake</span> <span class="lt__w">1.1</span> <span class="lt__w">km</span>
          </div>
        </div>
        <div class="lt__scan" aria-hidden="true" />
      </div>
      <div class="lt__toast" role="status">
        <Icon name="check" size={14} stroke={2.4} /> Copied “RIDGE PATH Summit 2.4 km Lake 1.1 km”
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- Combine into PDF
const TILES = [
  { id: 'a1', file: 'report.pdf', n: 1, c: '#3b6fe0' },
  { id: 'a2', file: 'report.pdf', n: 2, c: '#3b6fe0' },
  { id: 'a3', file: 'report.pdf', n: 3, c: '#3b6fe0' },
  { id: 'b1', file: 'map.pdf', n: 1, c: '#20a36b' },
  { id: 'b2', file: 'map.pdf', n: 2, c: '#20a36b' },
  { id: 'p1', file: 'summit.jpg', n: 1, c: '#e8892b', photo: true },
  { id: 'bl', file: 'Blank page', n: '', c: '#9a9aa2', blank: true },
];
const STEPS = [
  ['a1', 'a2', 'a3', 'b1', 'b2', 'p1'],
  ['a1', 'p1', 'a2', 'a3', 'b1', 'b2'],
  ['a1', 'p1', 'a2', 'bl', 'a3', 'b1', 'b2'],
  ['a1', 'p1', 'a2', 'bl', 'b1', 'b2', 'a3'],
];

export function CombineDemo() {
  let grid;
  let tl;
  const COLS = 4;
  const place = (order, duration) => {
    TILES.forEach((t) => {
      const el = grid.querySelector(`[data-tile="${t.id}"]`);
      const i = order.indexOf(t.id);
      if (i === -1) return gsap.to(el, { opacity: 0, scale: 0.8, duration: duration * 0.6 });
      gsap.to(el, {
        left: `${(i % COLS) * 25}%`,
        top: `${Math.floor(i / COLS) * 50}%`,
        opacity: 1,
        scale: 1,
        duration,
        ease: 'power3.inOut',
      });
    });
  };
  onMount(() => {
    place(STEPS[0], 0);
    if (reducedMotion()) return;
    tl = gsap.timeline({ repeat: -1, repeatDelay: 1.2 });
    STEPS.slice(1).concat([STEPS[0]]).forEach((s) => tl.call(() => place(s, 0.8), null, '+=1.6'));
  });
  onCleanup(() => {
    tl?.kill();
    gsap.killTweensOf(grid?.querySelectorAll('[data-tile]') ?? []);
  });

  return (
    <div class="cb">
      <div class="cb__legend" aria-hidden="true">
        <For each={[TILES[0], TILES[3], TILES[5]]}>
          {(t) => (
            <span>
              <i style={{ background: t.c }} />
              {t.file}
            </span>
          )}
        </For>
      </div>
      <div class="cb__grid" ref={grid} aria-label="Pages from two PDFs and a photo, being arranged into one PDF">
        <For each={TILES}>
          {(t) => (
            <div class="cb__tile" data-tile={t.id} style={{ '--c': t.c }}>
              <div class="cb__page" classList={{ 'is-blank': !!t.blank }}>
                <Show when={t.photo} fallback={<Show when={!t.blank}><i /><i /><i /><i /><i /></Show>}>
                  <Scene index={2} preserve="xMidYMid slice" />
                </Show>
              </div>
              <span class="cb__label">{t.blank ? 'Blank' : `${t.file} · ${t.n}`}</span>
            </div>
          )}
        </For>
      </div>
    </div>
  );
}
