import { For, Show, createMemo, createSignal } from 'solid-js';
import Icon from './Icon';
import './pdf-reader.css';

// A working sketch of Glance's PDF window: search marks every match, the
// highlight colours repaint the highlights, and night mode turns the page
// dark with colours keeping their hue — a red heading stays red.
const HIGHLIGHTS = [
  { name: 'Yellow', c: '#ffe14d' },
  { name: 'Green', c: '#7be08a' },
  { name: 'Blue', c: '#7cc4ff' },
  { name: 'Pink', c: '#ff9ccf' },
  { name: 'Orange', c: '#ffb35c' },
  { name: 'Purple', c: '#c3a3ff' },
];

const contents = ['The ridge walk', 'Getting there', 'Above the treeline', 'Coming down'];

// Paragraphs as runs: plain text, or marked { t, mark: 'hl' | 'ul' | 'st' }.
const page = [
  { h: 'The ridge walk' },
  [
    'A long day on the high ridge, starting from the lake before sunrise. ',
    { t: 'Start no later than six', mark: 'hl' },
    ' — the light on the ridge is gone by mid-afternoon, and the descent is slow in the dark.',
  ],
  { h2: 'Getting there' },
  [
    'The road to the lake is ',
    { t: 'closed in winter', mark: 'st' },
    ' open all year now. Park at the second bend, where the path to the ridge leaves the track.',
  ],
  { h2: 'Above the treeline' },
  [
    'From the saddle the ridge narrows. ',
    { t: 'Keep to the north side', mark: 'ul' },
    ' where the rock is solid, and stop at the cairn for the view across both valleys.',
  ],
];

export default function PdfReader(props) {
  const [night, setNight] = createSignal(false);
  const [colour, setColour] = createSignal(HIGHLIGHTS[0].c);
  const [query, setQuery] = createSignal(props.query ?? 'ridge');
  const [current, setCurrent] = createSignal(0);
  const [tab, setTab] = createSignal('pages');

  const q = () => query().trim().toLowerCase();
  // Count matches across the page, in reading order, so "current" can be picked out.
  const total = createMemo(() => {
    if (!q()) return 0;
    const all = page.map((p) => (Array.isArray(p) ? p.map((r) => (typeof r === 'string' ? r : r.t)).join('') : p.h || p.h2)).join(' ');
    return all.toLowerCase().split(q()).length - 1;
  });

  // Render text with search matches wrapped; `seen` numbers them across the page.
  let seen = 0;
  const marks = (text) => {
    if (!q()) return text;
    const out = [];
    const lower = text.toLowerCase();
    let at = 0;
    for (let i = lower.indexOf(q()); i !== -1; i = lower.indexOf(q(), at)) {
      if (i > at) out.push(text.slice(at, i));
      const n = seen++;
      out.push(<mark class="pdf__match" classList={{ 'is-current': n === current() % Math.max(1, total()) }}>{text.slice(i, i + q().length)}</mark>);
      at = i + q().length;
    }
    out.push(text.slice(at));
    return out;
  };

  const renderPage = () => {
    seen = 0;
    return page.map((p) => {
      if (p.h) return <h3 class="pdf__h">{marks(p.h)}</h3>;
      if (p.h2) return <h4 class="pdf__h2">{marks(p.h2)}</h4>;
      return (
        <p class="pdf__p">
          {p.map((r) =>
            typeof r === 'string' ? (
              marks(r)
            ) : (
              <span class={`pdf__mk pdf__mk--${r.mark}`} style={r.mark === 'hl' ? { 'background-color': colour() } : undefined}>
                {marks(r.t)}
              </span>
            ),
          )}
        </p>
      );
    });
  };

  return (
    <div class="pdf" classList={{ 'is-night': night() }}>
      <div class="pdf__win">
        <div class="pdf__head">
          <span class="pdf__ib" aria-hidden="true">
            <Icon name="sidebar" size={16} />
          </span>
          <div class="pdf__title">
            <strong>trail-notes.pdf</strong>
            <span>PDF · 6 pages</span>
          </div>
          <span class="pdf__pagebox" aria-hidden="true">
            1 <span>/ 6</span>
          </span>
          <label class="pdf__search">
            <Icon name="search" size={14} />
            <input
              type="search"
              value={query()}
              onInput={(e) => {
                setQuery(e.currentTarget.value);
                setCurrent(0);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') setCurrent((c) => (e.shiftKey ? c - 1 + total() : c + 1));
              }}
              aria-label="Find in the document"
              spellcheck={false}
            />
            <span class="pdf__count">{q() ? `${total() ? (current() % total()) + 1 : 0} of ${total()}` : ''}</span>
          </label>
        </div>

        <div class="pdf__body">
          <aside class="pdf__side">
            <div class="pdf__tabs" role="tablist" aria-label="Sidebar">
              <For each={[['pages', 'Pages'], ['contents', 'Contents']]}>
                {([id, label]) => (
                  <button type="button" role="tab" aria-selected={tab() === id} onClick={() => setTab(id)}>
                    {label}
                  </button>
                )}
              </For>
            </div>
            <Show
              when={tab() === 'pages'}
              fallback={
                <ol class="pdf__toc">
                  <For each={contents}>{(c, i) => <li classList={{ 'is-here': i() === 0 }}>{c}</li>}</For>
                </ol>
              }
            >
              <div class="pdf__thumbs">
                <For each={[0, 1, 2]}>
                  {(i) => (
                    <div class="pdf__thumb" classList={{ 'is-here': i === 0 }}>
                      <i />
                      <i />
                      <i />
                      <i />
                      <span>{i + 1}</span>
                    </div>
                  )}
                </For>
              </div>
            </Show>
          </aside>

          <div class="pdf__stage">
            <article class="pdf__page" aria-label="Page 1 of trail-notes.pdf">
              {renderPage()}
              <div class="pdf__note" title="A note">
                <Icon name="note" size={14} />
              </div>
              <div class="pdf__bubble">Bring a head torch</div>
              <svg class="pdf__sig" viewBox="0 0 220 60" aria-hidden="true">
                <path
                  d="M6 44 C 20 10, 30 8, 34 30 S 46 54, 56 30 S 70 12, 78 34 C 84 48, 96 46, 104 28 C 110 16, 118 18, 122 32 C 126 44, 140 44, 150 30 M 150 30 C 170 26, 190 30, 214 22"
                  fill="none"
                  stroke="#1f3fbf"
                  stroke-width="2.4"
                  stroke-linecap="round"
                />
              </svg>
              <span class="pdf__pnum">1</span>
            </article>
          </div>
        </div>
      </div>

      <div class="pdf__controls">
        <div class="pdf__swatches" role="radiogroup" aria-label="Highlight colour">
          <span class="pdf__label">Highlight</span>
          <For each={HIGHLIGHTS}>
            {(h) => (
              <button
                type="button"
                role="radio"
                aria-checked={colour() === h.c}
                aria-label={h.name}
                title={h.name}
                style={{ '--sw': h.c }}
                onClick={() => setColour(h.c)}
              />
            )}
          </For>
        </div>
        <button type="button" class="pdf__night" aria-pressed={night()} onClick={() => setNight(!night())}>
          <Icon name={night() ? 'sun' : 'moon'} size={16} /> {night() ? 'Day' : 'Night mode'}
        </button>
      </div>
    </div>
  );
}
