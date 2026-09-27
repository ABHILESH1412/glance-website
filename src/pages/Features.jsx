import { A } from '@solidjs/router';
import { For, createSignal, onCleanup, onMount } from 'solid-js';
import { gsap, setTitle, usePageMotion } from '../lib/motion';
import EditorTour from '../components/EditorTour';
import Scene from '../components/Scene';
import Icon from '../components/Icon';
import '../styles/features.css';
import { asset } from '../lib/base';

const formatFamilies = [
  ['Raster', 'PNG, JPEG, GIF, WebP, TIFF, BMP, ICO, QOI, TGA, PNM'],
  ['Modern', 'HEIC / HEIF, AVIF'],
  ['Vector', 'SVG, SVGZ'],
  ['Camera raw', 'CR2, CR3, CRW, NEF, NRW, ARW, DNG, RAF, ORF, RW2, PEF, SRW, and 14 more'],
];

// keys: what KeyboardEvent.key values light the row up.
const shortcuts = [
  { combo: [['Ctrl', 'O']], does: 'Open an image', keys: ['o'], ctrl: true },
  { combo: [['←'], ['→'], ['Space']], does: 'Previous / next image', keys: ['ArrowLeft', 'ArrowRight', ' '] },
  { combo: [['+'], ['-'], ['0'], ['1']], does: 'Zoom in, out, fit, 100%', keys: ['+', '=', '-', '0', '1'] },
  { combo: [['['], [']']], does: 'Rotate left / right', keys: ['[', ']'] },
  { combo: [['Ctrl', 'E']], does: 'Edit panel', keys: ['e'], ctrl: true },
  { combo: [['Ctrl', 'T'], ['Ctrl', 'R']], does: 'Rotate and flip / Resize', keys: ['t', 'r'], ctrl: true },
  { combo: [['Ctrl', 'Z'], ['Ctrl', 'Shift', 'Z']], does: 'Undo / redo an edit', keys: ['z', 'Z'], ctrl: true },
  { combo: [['Ctrl', 'S'], ['Ctrl', 'Shift', 'S']], does: 'Save in place / Export…', keys: ['s', 'S'], ctrl: true },
  { combo: [['Ctrl', 'C']], does: 'Copy the image to the clipboard', keys: ['c'], ctrl: true },
  { combo: [['F11']], does: 'Fullscreen', keys: ['F11'] },
  { combo: [['Delete']], does: 'Delete the current image', keys: ['Delete'] },
  { combo: [['Esc']], does: 'Leave fullscreen, close the panel, or cancel editing', keys: ['Escape'] },
  { combo: [['Ctrl', 'W'], ['Ctrl', 'Q']], does: 'Close window / quit', keys: ['w', 'q'], ctrl: true },
];

const limits = [
  ['SVG is not an export format.', 'An SVG can be written out as pixels at any size, but pixels cannot be turned back into shapes. To keep an SVG an SVG, copy the file.'],
  ['Text and drawings sit against the current size.', 'Resizing carries them along; a crop or rotation applied afterwards will not move them for you.'],
  ['Animated GIF and WebP export one frame.', 'Exporting writes the frame you are looking at.'],
  ['“Move to Bin” needs a filesystem with one.', 'From /tmp or some removable media it reports that it is unsupported; Delete Permanently still works there.'],
];

function Shortcuts() {
  const [lit, setLit] = createSignal(-1);
  let timer;
  const onKey = (e) => {
    if (e.target.closest('input, textarea, select, [role="application"]')) return;
    const i = shortcuts.findIndex((s) => s.keys.includes(e.key) && !!s.ctrl === (e.ctrlKey || e.metaKey));
    if (i < 0) return;
    setLit(i);
    clearTimeout(timer);
    timer = setTimeout(() => setLit(-1), 900);
  };
  onMount(() => window.addEventListener('keydown', onKey));
  onCleanup(() => {
    window.removeEventListener('keydown', onKey);
    clearTimeout(timer);
  });

  return (
    <div class="keys card">
      <For each={shortcuts}>
        {(s, i) => (
          <div class="keys__row" classList={{ 'is-lit': lit() === i() }}>
            <div class="keys__combo">
              <For each={s.combo}>
                {(c, j) => (
                  <>
                    {j() > 0 && <span class="keys__sep">/</span>}
                    <span class="keys__chord">
                      <For each={c}>{(k) => <kbd>{k}</kbd>}</For>
                    </span>
                  </>
                )}
              </For>
            </div>
            <span class="keys__does">{s.does}</span>
          </div>
        )}
      </For>
    </div>
  );
}

function ColourSplit() {
  const [at, setAt] = createSignal(50);
  let box;
  const move = (e) => {
    const r = box.getBoundingClientRect();
    setAt(Math.min(100, Math.max(0, ((e.clientX - r.left) / r.width) * 100)));
  };
  return (
    <div
      class="split"
      ref={box}
      style={{ '--at': `${at()}%` }}
      onPointerDown={(e) => {
        box.setPointerCapture(e.pointerId);
        move(e);
      }}
      onPointerMove={(e) => e.buttons && move(e)}
    >
      <Scene index={1} class="split__img" />
      <div class="split__wrong">
        <Scene index={1} class="split__img" />
      </div>
      <div class="split__handle" aria-hidden="true">
        <span>
          <Icon name="chev-l" size={14} />
          <Icon name="chev-r" size={14} />
        </span>
      </div>
      <span class="split__tag split__tag--l">Wide-gamut numbers read as sRGB</span>
      <span class="split__tag split__tag--r">Converted at the door</span>
      <input
        class="sr-only"
        type="range"
        min="0"
        max="100"
        value={at()}
        aria-label="Compare the two"
        onInput={(e) => setAt(Number(e.currentTarget.value))}
      />
    </div>
  );
}

export default function Features() {
  let root;
  setTitle('Features');

  usePageMotion(
    () => root,
    (reduced) => {
      if (reduced) return;
      // The pixel under the pointer stays under it while the picture grows around it.
      gsap
        .timeline({ repeat: -1, repeatDelay: 0.5, defaults: { ease: 'power3.inOut' } })
        .to('.anchor__pic', { scale: 3.2, duration: 1.6 })
        .to('.anchor__pct', { textContent: 320, snap: { textContent: 1 }, duration: 1.6 }, '<')
        .to('.anchor__pic', { scale: 1, duration: 1.4 }, '+=0.9')
        .to('.anchor__pct', { textContent: 100, snap: { textContent: 1 }, duration: 1.4 }, '<');

      // A file saved from another program appears in the strip.
      gsap
        .timeline({ repeat: -1, repeatDelay: 1.2 })
        .fromTo('.watch__new', { width: 0, opacity: 0, marginLeft: -10 }, { width: 72, opacity: 1, marginLeft: 0, duration: 0.7, ease: 'power3.out' }, 1)
        .fromTo('.watch__note', { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.4 }, '<0.2')
        .to(['.watch__new', '.watch__note'], { opacity: 0, duration: 0.4 }, '+=2')
        .set('.watch__new', { width: 0, marginLeft: -10 });
    },
  );

  return (
    <div ref={root}>
      <section class="wrap fx-hero">
        <span class="kicker" data-intro>
          Features
        </span>
        <h1 class="display" data-intro>
          A viewer first.
          <br />
          <em>An editor when you need one.</em>
        </h1>
        <p class="lede" data-intro>
          Photographs, screenshots, vector art and camera raw all open in the same window, and browsing a folder is a matter of
          pressing an arrow key. When you do need to change something, the editor is one button away.
        </p>
        <nav class="fx-toc" data-intro aria-label="On this page">
          <a href="#viewing">Viewing</a>
          <a href="#editor">Editing</a>
          <a href="#colour">Colour</a>
          <a href="#formats">Formats</a>
          <a href="#keys">Keyboard</a>
          <a href="#limits">Limits</a>
        </nav>
      </section>

      {/* ------------------------------------------------------------ viewing */}
      <section class="section wrap" id="viewing">
        <div class="fx-split">
          <div class="fx-copy">
            <span class="kicker" data-reveal>
              Viewing
            </span>
            <h2 class="h2" data-reveal>
              Zoom goes <em>where you point.</em>
            </h2>
            <ul class="fx-list" data-reveal>
              <li>Fit to window, 100%, or free zoom to 32×.</li>
              <li>Zoom anchors on the pointer, so the pixel under the cursor stays under it.</li>
              <li>
                Two fingers on a touchpad pan and the wheel zooms — the hardware says which is which, so there is no modifier to
                remember. Pinch works too.
              </li>
              <li>Animated GIF and WebP play, and keep playing while you zoom or rotate.</li>
              <li>A header button turns the picture 90° just to look at it, without touching the file.</li>
            </ul>
          </div>
          <div class="anchor card" data-reveal aria-hidden="true">
            <div class="anchor__view">
              <div class="anchor__pic">
                <Scene index={0} />
              </div>
              <svg class="anchor__cursor" viewBox="0 0 24 24" width="26" height="26">
                <path d="M4 3l16 7.5-7 1.8-3.3 6.9Z" fill="#fff" stroke="#111" stroke-width="1.4" stroke-linejoin="round" />
              </svg>
            </div>
            <div class="anchor__bar">
              <span>scene0.png</span>
              <span>
                <span class="anchor__pct">100</span>%
              </span>
            </div>
          </div>
        </div>

        <div class="fx-split fx-split--rev">
          <div class="fx-copy">
            <span class="kicker" data-reveal>
              Browsing
            </span>
            <h2 class="h2" data-reveal>
              The rest of the folder, <em>along the bottom.</em>
            </h2>
            <p class="muted" data-reveal>
              A filmstrip of the folder, arrow keys to step through it — and the folder is watched, so a file saved from another
              program shows up without you doing anything. Decoding never runs on the main thread, so a huge file cannot freeze
              the window.
            </p>
          </div>
          <div class="watch card" data-reveal aria-hidden="true">
            <img src={asset('img/viewing.webp')} alt="" width="1280" height="800" loading="lazy" decoding="async" />
            <div class="watch__strip">
              <For each={[0, 1, 2, 3]}>
                {(i) => (
                  <span class="watch__thumb" classList={{ 'is-current': i === 2 }}>
                    <Scene index={i} preserve="xMidYMid slice" />
                  </span>
                )}
              </For>
              <span class="watch__thumb watch__new">
                <Scene index={1} preserve="xMidYMid slice" />
              </span>
              <span class="watch__note">scene4.png appeared</span>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------ editing */}
      <section class="section fx-edit">
        <div class="wrap">
          <div class="section-head section-head--split">
            <div>
              <span class="kicker" data-reveal>
                Editing
              </span>
              <h2 class="h2" data-reveal>
                One panel, <em>one section at a time.</em>
              </h2>
            </div>
            <p class="lede" data-reveal>
              Everything happens on the picture in front of you rather than in a preview box. Pick a section to see what it does.
            </p>
          </div>
          <div data-reveal>
            <EditorTour />
          </div>
          <div class="fx-shots">
            <figure data-reveal>
              <img src={asset('img/editing.webp')} alt="Glance with the Adjust section open" width="1280" height="800" loading="lazy" decoding="async" />
              <figcaption>Adjust: brightness, contrast and saturation, live on the picture.</figcaption>
            </figure>
            <figure data-reveal>
              <img src={asset('img/exporting.webp')} alt="Glance with the Export section open" width="1280" height="800" loading="lazy" decoding="async" />
              <figcaption>
                Export: a format, a quality, or a file size to aim for.{' '}
                <A href="/" class="link">
                  See the file-size search run
                </A>
                .
              </figcaption>
            </figure>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------ colour */}
      <section class="section wrap" id="colour">
        <div class="fx-split">
          <div class="fx-copy">
            <span class="kicker" data-reveal>
              Colour
            </span>
            <h2 class="h2" data-reveal>
              An Adobe RGB photo <em>looks the way it should.</em>
            </h2>
            <p class="muted" data-reveal>
              ICC profiles are honoured. An Adobe RGB or Display P3 photograph is converted to sRGB on the way in, rather than
              shown as though its numbers meant something else — which is what makes wide-gamut photos look washed out in viewers
              that skip it.
            </p>
            <p class="muted" data-reveal>
              EXIF orientation is honoured too, so phone photos are upright.
            </p>
            <dl class="fx-facts" data-reveal>
              <div>
                <dt>27 ms</dt>
                <dd>to convert a 12-megapixel photograph</dd>
              </div>
              <div>
                <dt>2 µs</dt>
                <dd>to recognise an sRGB profile and skip it</dd>
              </div>
            </dl>
          </div>
          <div data-reveal>
            <ColourSplit />
            <p class="faint fx-cap">An illustration of the difference. Drag across it.</p>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------ formats */}
      <section class="section--tight wrap" id="formats">
        <div class="section-head section-head--split">
          <h2 class="h2" data-reveal>
            Formats
          </h2>
          <p class="muted" data-reveal>
            Everything a photographer actually has, from a screenshot to a raw file off a Fujifilm.
          </p>
        </div>
        <div class="fams card" data-reveal>
          <For each={formatFamilies}>
            {([fam, list]) => (
              <div class="fams__row">
                <span class="fams__fam">{fam}</span>
                <span class="fams__list">{list}</span>
              </div>
            )}
          </For>
        </div>
      </section>

      {/* ------------------------------------------------------------ keys */}
      <section class="section wrap" id="keys">
        <div class="section-head section-head--split">
          <div>
            <span class="kicker" data-reveal>
              Keyboard
            </span>
            <h2 class="h2" data-reveal>
              Hands stay <em>on the keys.</em>
            </h2>
          </div>
          <p class="lede" data-reveal>
            Press any of them now — the matching row lights up.
          </p>
        </div>
        <div data-reveal>
          <Shortcuts />
        </div>
      </section>

      {/* ------------------------------------------------------------ limits */}
      <section class="section--tight wrap" id="limits">
        <div class="limits">
          <div>
            <span class="kicker" data-reveal>
              Known limitations
            </span>
            <h2 class="h2" data-reveal>
              What it <em>doesn't</em> do.
            </h2>
            <p class="muted" data-reveal>
              Wanted, but not built yet: HDR and wide-gamut output, and progressive loading so a 100 MP TIFF appears in stages.
              And it is not a photo library — no tags, catalogs or batch jobs.
            </p>
          </div>
          <ul class="limits__list">
            <For each={limits}>
              {([t, d]) => (
                <li data-reveal>
                  <strong>{t}</strong>
                  <span class="muted">{d}</span>
                </li>
              )}
            </For>
          </ul>
        </div>
        <div class="fx-next" data-reveal>
          <A href="/compare" class="btn">
            How it compares <Icon name="arrow" class="arrow" />
          </A>
          <A href="/download" class="btn btn--primary">
            <Icon name="download" /> Download
          </A>
        </div>
      </section>
    </div>
  );
}
