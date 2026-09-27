import { A } from '@solidjs/router';
import { For, Show, createMemo, createSignal, onMount } from 'solid-js';
import { gsap, reducedMotion, setTitle, usePageMotion } from '../lib/motion';
import Icon from '../components/Icon';
import { apps, groups, tally } from '../data/compare';
import '../styles/compare.css';

const filters = [{ id: 'all', title: 'Everything' }, ...groups.map((g) => ({ id: g.id, title: g.title }))];

const alternatives = [
  { app: 'gthumb', when: 'You want a photo library', text: 'Tags, catalogs, batch jobs or a camera import wizard — gThumb is still the answer.' },
  { app: 'nomacs', when: 'You need Windows too', text: 'nomacs runs on Linux, Windows and macOS, and has a thumbnail browser and batch processing.' },
  { app: 'loupe', when: 'You only ever look', text: 'Loupe is the closest in spirit — same toolkit, same language — but stops at crop and rotate.' },
];

export default function Compare() {
  let root, table, seg, thumb;
  setTitle('Compare');
  const [filter, setFilter] = createSignal('all');
  const shown = createMemo(() => (filter() === 'all' ? groups : groups.filter((g) => g.id === filter())));
  const scores = createMemo(() => tally(filter() === 'all' ? null : groups.find((g) => g.id === filter())));
  const total = createMemo(() => shown().reduce((n, g) => n + g.rows.length, 0));

  function placeThumb() {
    const el = seg?.querySelector('[aria-selected="true"]');
    if (!el) return;
    thumb.style.left = `${el.offsetLeft}px`;
    thumb.style.width = `${el.offsetWidth}px`;
  }
  onMount(() => {
    placeThumb();
    document.fonts?.ready.then(placeThumb);
  });

  function choose(id) {
    if (id === filter()) return;
    setFilter(id);
    queueMicrotask(placeThumb);
    if (reducedMotion()) return;
    requestAnimationFrame(() => {
      gsap.fromTo(table.querySelectorAll('.cmp__row, .cmp__group'), { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.45, stagger: 0.025 });
    });
  }

  usePageMotion(() => root);

  return (
    <div ref={root}>
      <section class="wrap cmp-hero">
        <span class="kicker" data-intro>
          How it compares
        </span>
        <h1 class="display" data-intro>
          Six viewers, <em>side by side.</em>
        </h1>
        <p class="lede" data-intro>
          Against the image viewers people actually use on Linux, compiled from each project's own documentation in September
          2026. Features move, so check upstream if one matters to you.
        </p>
      </section>

      <section class="wrap cmp" data-intro>
        <div class="cmp__bar">
          <div class="seg cmp__seg" role="tablist" aria-label="Filter" ref={seg}>
            <span class="seg__thumb" ref={thumb} aria-hidden="true" />
            <For each={filters}>
              {(f) => (
                <button type="button" role="tab" aria-selected={filter() === f.id} onClick={() => choose(f.id)}>
                  {f.title}
                </button>
              )}
            </For>
          </div>
        </div>

        <div class="cmp__scores" aria-label="Features supported">
          <For each={apps}>
            {(a, i) => (
              <div class="cmp__score" classList={{ 'is-us': i() === 0 }}>
                <img src={a.icon} alt="" width="28" height="28" loading="lazy" />
                <div class="cmp__score-main">
                  <div class="cmp__score-top">
                    <span>{a.name}</span>
                    <span class="mono">
                      {scores()[i()]}/{total()}
                    </span>
                  </div>
                  <div class="cmp__meter">
                    <i style={{ width: `${(scores()[i()] / total()) * 100}%` }} />
                  </div>
                </div>
              </div>
            )}
          </For>
        </div>

        <div class="cmp__scroll">
          <table class="cmp__table" ref={table}>
            <thead>
              <tr>
                <th class="cmp__corner" scope="col">
                  <span class="sr-only">Feature</span>
                </th>
                <For each={apps}>
                  {(a, i) => (
                    <th scope="col" classList={{ 'is-us': i() === 0 }}>
                      <img src={a.icon} alt="" width="36" height="36" loading="lazy" />
                      <span>{a.name}</span>
                      <small>{a.note}</small>
                    </th>
                  )}
                </For>
              </tr>
            </thead>
            <For each={shown()}>
              {(g) => (
                <tbody>
                  <Show when={filter() === 'all'}>
                    <tr class="cmp__group">
                      <th colSpan={apps.length + 1} scope="colgroup">
                        {g.title}
                      </th>
                    </tr>
                  </Show>
                  <For each={g.rows}>
                    {([label, values, star]) => (
                      <tr class="cmp__row" classList={{ 'is-star': !!star }}>
                        <th scope="row">
                          {label}
                          {star && <span class="cmp__only">only Glance</span>}
                        </th>
                        <For each={values}>
                          {(v, i) => (
                            <td classList={{ 'is-us': i() === 0 }}>
                              {v ? (
                                <span class="yes">
                                  <Icon name="check" size={17} stroke={2.3} />
                                  <span class="sr-only">Yes</span>
                                </span>
                              ) : (
                                <span class="no">
                                  <i aria-hidden="true" />
                                  <span class="sr-only">No</span>
                                </span>
                              )}
                            </td>
                          )}
                        </For>
                      </tr>
                    )}
                  </For>
                </tbody>
              )}
            </For>
          </table>
        </div>
        <p class="faint cmp__foot">Icons are each project's own, from their Flathub listings, used to identify them.</p>
      </section>

      <section class="section wrap">
        <div class="verdict">
          <div class="verdict__main">
            <span class="kicker" data-reveal>
              The short version
            </span>
            <p class="verdict__text" data-reveal>
              Glance is the fastest and the most capable editor of the six, and the <em>only one that can hit a file size</em> on
              request. It is not a photo library.
            </p>
          </div>
          <div class="alts">
            <h2 class="alts__h" data-reveal>
              When to pick something else
            </h2>
            <For each={alternatives}>
              {(alt) => {
                const app = apps.find((a) => a.id === alt.app);
                return (
                  <div class="alt card" data-reveal>
                    <img src={app.icon} alt="" width="40" height="40" loading="lazy" />
                    <div>
                      <div class="alt__when">{alt.when}</div>
                      <strong>{app.name}</strong>
                      <p class="muted">{alt.text}</p>
                    </div>
                  </div>
                );
              }}
            </For>
          </div>
        </div>
        <div class="cmp__next" data-reveal>
          <A href="/download" class="btn btn--primary">
            <Icon name="download" /> Download Glance
          </A>
          <A href="/features" class="btn">
            Every feature <Icon name="arrow" class="arrow" />
          </A>
        </div>
      </section>
    </div>
  );
}
