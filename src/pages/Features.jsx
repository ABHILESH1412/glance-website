import { A } from '@solidjs/router';
import { For, createSignal, onCleanup, onMount } from 'solid-js';
import { gsap, setTitle, usePageMotion } from '../lib/motion';
import EditorTour from '../components/EditorTour';
import PdfReader from '../components/PdfReader';
import { CombineDemo, LiveTextDemo, RedactDemo } from '../components/Showcase';
import Scene from '../components/Scene';
import Icon from '../components/Icon';
import '../styles/features.css';
import { asset } from '../lib/base';

const formatFamilies = [
  ['Raster', 'PNG, JPEG, GIF, WebP, TIFF, BMP, ICO, QOI, TGA, PNM'],
  ['Modern', 'HEIC / HEIF, AVIF, JPEG 2000'],
  ['High dynamic range', 'OpenEXR, Radiance HDR — fitted into the screen’s range when brighter than white'],
  ['Design', 'PSD and PSB (the picture as last saved), Illustrator AI (through the PDF inside it), ICNS'],
  ['Vector', 'SVG, SVGZ'],
  ['Camera raw', 'CR2, CR3, CRW, NEF, NRW, ARW, DNG, RAF, ORF, RW2, PEF, SRW, and 14 more'],
  ['Documents', 'PDF — password-protected ones too, after asking for the password'],
];

// `keys`: KeyboardEvent.key values that light the row up; `ctrl`/`shift` must match.
const shortcutGroups = [
  {
    title: 'General',
    rows: [
      { combo: [['Ctrl', 'O']], does: 'Open a file', keys: ['o'], ctrl: true },
      { combo: [['Ctrl', 'S'], ['Ctrl', 'Shift', 'S']], does: 'Save in place / Export…', keys: ['s', 'S'], ctrl: true },
      { combo: [['Ctrl', 'Z'], ['Ctrl', 'Shift', 'Z']], does: 'Undo / redo an edit, or a change to a PDF', keys: ['z', 'Z'], ctrl: true },
      { combo: [['Ctrl', 'E']], does: 'Edit panel: draw, write and redact', keys: ['e'], ctrl: true },
      { combo: [['Ctrl', 'P']], does: 'Print', keys: ['p'], ctrl: true },
      { combo: [['F11']], does: 'Fullscreen', keys: ['F11'] },
      { combo: [['Esc']], does: 'Leave fullscreen, close the panel, or cancel editing', keys: ['Escape'] },
      { combo: [['Ctrl', ',']], does: 'Preferences', keys: [','], ctrl: true },
      { combo: [['Ctrl', '?']], does: 'All keyboard shortcuts, with a search box', keys: ['?', '/'], ctrl: true },
      { combo: [['Ctrl', 'W'], ['Ctrl', 'Q']], does: 'Close window / quit', keys: ['w', 'q'], ctrl: true },
    ],
  },
  {
    title: 'Pictures',
    rows: [
      { combo: [['←'], ['→'], ['Space']], does: 'Previous / next image', keys: ['ArrowLeft', 'ArrowRight', ' '] },
      { combo: [['+'], ['-'], ['0'], ['1']], does: 'Zoom in, out, fit, 100%', keys: ['+', '=', '-', '0', '1'] },
      { combo: [['['], [']']], does: 'Rotate left / right', keys: ['[', ']'] },
      { combo: [['Ctrl', 'T'], ['Ctrl', 'R']], does: 'Rotate and flip / Resize', keys: ['t', 'r'], ctrl: true },
      { combo: [['Ctrl', 'C']], does: 'Copy the image', keys: ['c'], ctrl: true },
      { combo: [['F5']], does: 'Slideshow; Space pauses it', keys: ['F5'] },
      { combo: [['Ctrl', 'I']], does: 'Image info', keys: ['i'], ctrl: true },
      { combo: [['Ctrl', 'Shift', 'T'], ['Ctrl', 'A']], does: 'Live Text: select text in the picture, all of it', keys: ['T', 'a'], ctrl: true },
      { combo: [['F9'], [','], ['.'], ['K']], does: 'An animation’s frames: show them, previous / next, play or pause', keys: ['F9', ',', '.', 'k'] },
      { combo: [['Delete']], does: 'Delete the current image', keys: ['Delete'] },
    ],
  },
  {
    title: 'PDFs',
    rows: [
      { combo: [['Page Up'], ['Page Down'], ['Space']], does: 'Back / forward a screen', keys: ['PageUp', 'PageDown', ' '] },
      { combo: [['Home'], ['End']], does: 'First / last page', keys: ['Home', 'End'] },
      { combo: [['F9']], does: 'Sidebar: pages, contents, bookmarks', keys: ['F9'] },
      { combo: [['Ctrl', 'F']], does: 'Find', keys: ['f'], ctrl: true },
      { combo: [['Enter'], ['Shift', 'Enter'], ['F3']], does: 'Next / previous match', keys: ['Enter', 'F3'] },
      { combo: [['Ctrl', 'D']], does: 'Bookmark the page, or remove its bookmark', keys: ['d'], ctrl: true },
      { combo: [['Ctrl', 'H'], ['Ctrl', 'U'], ['Ctrl', 'Shift', 'X']], does: 'Highlight / underline / strike through the selection', keys: ['h', 'u', 'X'], ctrl: true },
      { combo: [['Ctrl', 'C']], does: 'Copy the selected text', keys: ['c'], ctrl: true },
      { combo: [['Ctrl', 'I']], does: 'Document info', keys: ['i'], ctrl: true },
      { combo: [['Ctrl', 'Shift', 'R']], does: 'Mark the selected text for redaction', keys: ['R'], ctrl: true },
      { combo: [['Ctrl', 'Enter']], does: 'Finish writing a note or speech bubble', keys: ['Enter'], ctrl: true },
    ],
  },
];

const limits = [
  ['SVG is not an export format.', 'An SVG can be written out as pixels at any size, but pixels cannot be turned back into shapes. To keep an SVG an SVG, copy the file.'],
  ['Text and drawings sit against the current size.', 'Resizing carries them along; a crop or rotation applied afterwards will not move them for you.'],
  ['Animated GIF and WebP export one frame.', 'Exporting writes the frame you are looking at.'],
  ['PDF form fields cannot be filled in yet.', 'And 3D models do not open.'],
  ['On a PDF, text boxes, notes and bubbles move but do not resize.', 'A PDF text box has no underline, and of the shapes only rectangles and ellipses can be filled: the rest are saved as ink, which a PDF draws as lines.'],
  ['A text box in a font you chose carries that font.', 'A few hundred kilobytes, once per font per document, so it looks the same everywhere.'],
  ['Redacting a PDF page turns it into a picture.', 'It prints and reads the same, but is larger than the text it replaces. The title, outline and other details are shown in Document Info and the sidebar, to check.'],
  ['Redacting in place is final.', 'Once a file is redacted in place, the old one is gone as far as any program can tell. Backups and copies elsewhere are beyond its reach.'],
  ['“Move to Bin” needs a filesystem with one.', 'From /tmp or some removable media it reports that it is unsupported; Delete Permanently still works there.'],
];

const more = [
  { icon: 'adjust', t: 'Image Info', d: 'Ctrl+I opens the file’s details and what the camera wrote — camera, lens, shutter, aperture, ISO, and where, if it has GPS. It follows along as you browse.' },
  { icon: 'expand', t: 'Slideshow', d: 'F5 plays the folder full screen, every 2 to 30 seconds. Space pauses it.' },
  { icon: 'pages', t: 'Animation frames', d: 'F9 lists every frame of a GIF or WebP with how long it shows, to pause on one or step through. Copy copies the frame on screen.' },
  { icon: 'printer', t: 'Printing', d: 'Ctrl+P, for pictures and PDFs. A PDF prints page by page, fitted and turned to the paper; a picture prints as it is on screen, edits included.' },
  { icon: 'gear', t: 'Preferences', d: 'Ctrl+, gathers what Glance remembers: appearance, the slideshow, PDF layout and night mode, highlight colour, paper size, signatures, and Live Text’s download.' },
  { icon: 'keyboard', t: 'Every shortcut in one place', d: 'Ctrl+? opens a window listing all of them, for pictures and for PDFs, with a search box.' },
];

function Shortcuts() {
  const [lit, setLit] = createSignal(new Set());
  let timer;
  const onKey = (e) => {
    if (e.target.closest('input, textarea, select, [role="application"]')) return;
    const ctrl = e.ctrlKey || e.metaKey;
    const hits = new Set();
    shortcutGroups.forEach((g, gi) =>
      g.rows.forEach((r, ri) => {
        if (r.keys.includes(e.key) && !!r.ctrl === ctrl) hits.add(`${gi}-${ri}`);
      }),
    );
    if (!hits.size) return;
    setLit(hits);
    clearTimeout(timer);
    timer = setTimeout(() => setLit(new Set()), 900);
  };
  onMount(() => window.addEventListener('keydown', onKey));
  onCleanup(() => {
    window.removeEventListener('keydown', onKey);
    clearTimeout(timer);
  });

  return (
    <div class="keys card">
      <For each={shortcutGroups}>
        {(g, gi) => (
          <div class="keys__group">
            <h3 class="keys__title">{g.title}</h3>
            <For each={g.rows}>
              {(s, ri) => (
                <div class="keys__row" classList={{ 'is-lit': lit().has(`${gi()}-${ri()}`) }}>
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
          An image viewer first.
          <br />
          <em>A PDF reader too.</em>
        </h1>
        <p class="lede" data-intro>
          Photographs, screenshots, vector art, camera raw, Photoshop and HDR files all open in the same window, and so do PDFs.
          When you do need to change something, the editor is one button away — and Glance measures itself against Apple’s
          Preview.
        </p>
        <nav class="fx-toc" data-intro aria-label="On this page">
          <a href="#viewing">Viewing</a>
          <a href="#editor">Editing</a>
          <a href="#pdfs">PDFs</a>
          <a href="#combine">Combine</a>
          <a href="#redact">Redact</a>
          <a href="#live-text">Live Text</a>
          <a href="#more">More</a>
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
              <li>
                Animated GIF and WebP play, and keep playing while you zoom or rotate. F9 lists every frame down the side, to pause
                on one or step through.
              </li>
              <li>Right-click the picture, or a frame, to copy it. A header button turns the picture 90° just to look at it.</li>
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
              program shows up without you doing anything. F5 plays it as a slideshow. Decoding never runs on the main thread, so a
              huge file cannot freeze the window.
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
              <figcaption>Adjust, live on the picture.</figcaption>
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

      {/* ------------------------------------------------------------ PDFs */}
      <section class="section wrap" id="pdfs">
        <div class="section-head section-head--split">
          <div>
            <span class="kicker" data-reveal>
              PDFs
            </span>
            <h2 class="h2" data-reveal>
              Read them, mark them up, <em>and the marks stay in the file.</em>
            </h2>
          </div>
          <p class="lede" data-reveal>
            Every change is an ordinary PDF annotation, saved straight into the file, so every other PDF reader shows it too.
            Ctrl+Z undoes all of it, and a read-only file is left untouched.
          </p>
        </div>
        <div class="fx-pdf">
          <div data-reveal>
            <PdfReader />
          </div>
          <div class="fx-cols">
            <div data-reveal>
              <h3 class="fx-col__t">Reading</h3>
              <ul class="fx-list">
                <li>One scrolling column, one page at a time, or two side by side like an open book. Only the pages near the screen are drawn, so a long document costs about what a short one does.</li>
                <li>A sidebar with page thumbnails, the document’s own contents — following the section you are reading — and bookmarks that follow a file that is moved or renamed.</li>
                <li>Search with Ctrl+F: every match marked, the count growing while a long document is still being searched. Case and accents do not matter, and a phrase broken across two lines is still found.</li>
                <li>Select text by dragging, across pages if you like. Night mode turns the pages black with colours keeping their hue. Document info lists fonts, page sizes by name and restrictions.</li>
              </ul>
            </div>
            <div data-reveal>
              <h3 class="fx-col__t">Marking up</h3>
              <ul class="fx-list">
                <li>Highlight, underline or strike through with Ctrl+H, Ctrl+U or Ctrl+Shift+X — highlights in six colours, or any other.</li>
                <li>Notes and speech bubbles, right where you right-click. Click one to edit it, drag it to move it.</li>
                <li>The Edit panel: Draw with every pen and shape, Signature, Select to pick up any drawing — made earlier, or by another program — Text boxes in any font, and Redact.</li>
              </ul>
            </div>
            <div data-reveal>
              <h3 class="fx-col__t">Protecting and shrinking</h3>
              <ul class="fx-list">
                <li>Password-protected PDFs open after asking, right in the window — and what their author does not allow, Glance does not do either.</li>
                <li>Require a password to open a document, or take it off. Saved with AES-256, the strongest encryption PDF has.</li>
                <li>Reduce File Size: repack without changing anything you can see, or scale photos to 150 or 96 dpi. You see the new size before deciding, and nothing is saved that came out bigger.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------ combine */}
      <section class="section fx-band" id="combine">
        <div class="wrap fx-split">
          <div class="fx-copy">
            <span class="kicker" data-reveal>
              Combine into PDF
            </span>
            <h2 class="h2" data-reveal>
              Pages from anywhere, <em>put together as one PDF.</em>
            </h2>
            <ul class="fx-list" data-reveal>
              <li>Add PDFs and pictures with the button, Ctrl+O, or by dropping them in — between two pages to put them there. A long PDF asks which pages to take, such as 2-5, 9.</li>
              <li>Every page in a grid, with a stripe in its file’s colour, so after any amount of shuffling it is still plain where a page came from.</li>
              <li>Drag pages into order, turn them with [ and ], take them out with Delete. Ctrl+B puts in a blank page. Everything can be undone.</li>
              <li>Save as PDF writes a new file; the originals are never changed. PDF pages keep their text, links and notes, and a JPEG goes in exactly as it was.</li>
            </ul>
          </div>
          <div data-reveal>
            <CombineDemo />
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------ redact */}
      <section class="section wrap" id="redact">
        <div class="section-head section-head--split">
          <div>
            <span class="kicker" data-reveal>
              Redacting
            </span>
            <h2 class="h2" data-reveal>
              A black box hides nothing. <em>This takes it out.</em>
            </h2>
          </div>
          <p class="lede" data-reveal>
            The words under a drawn box are still in the file; any program can copy them out or lift the box off. Glance removes
            what is under the box for good, in pictures and PDFs alike — in two steps, so nothing goes by accident.
          </p>
        </div>
        <div data-reveal>
          <RedactDemo />
        </div>
        <div class="fx-cols fx-cols--3">
          <div data-reveal>
            <h3 class="fx-col__t">1 · Mark</h3>
            <p class="muted">Drag a box over anything, or select text and press Ctrl+Shift+R. Marked areas show dark but see-through, edged in red. Nothing has changed yet.</p>
          </div>
          <div data-reveal>
            <h3 class="fx-col__t">2 · Apply</h3>
            <p class="muted">Save a redacted copy — the default, leaving the original as it was — or redact the original itself.</p>
          </div>
          <div data-reveal>
            <h3 class="fx-col__t">Then it checks</h3>
            <p class="muted">A redacted PDF page is rebuilt as a picture, its other words put back as invisible searchable text. Glance reopens the result and checks no removed text is left.</p>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------ live text */}
      <section class="section fx-band" id="live-text">
        <div class="wrap fx-split fx-split--rev">
          <div class="fx-copy">
            <span class="kicker" data-reveal>
              Live Text
            </span>
            <h2 class="h2" data-reveal>
              Copy the words <em>out of a picture.</em>
            </h2>
            <ul class="fx-list" data-reveal>
              <li>Ctrl+Shift+T, or the button in the header, finds the text in a picture: drag across it, double-click a word, Ctrl+A for all of it, Ctrl+C to copy.</li>
              <li>Screenshots, photographed pages, signs and blurry text, in English and about 45 other languages written in the Latin alphabet.</li>
              <li>Nothing is sent anywhere. A small helper reads on your own computer, runs only while it is needed, and gives its memory back when it stops.</li>
              <li>The engine and models — 42.5 MB — download the first time, after asking, checked against fixed checksums. Preferences shows them and removes them.</li>
              <li>In a PDF, right-click a picture on a page to copy it or read only that picture — which is what a scanned page is.</li>
            </ul>
          </div>
          <div data-reveal>
            <LiveTextDemo />
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------ more */}
      <section class="section wrap" id="more">
        <div class="section-head">
          <span class="kicker" data-reveal>
            And the rest
          </span>
          <h2 class="h2" data-reveal>
            The small things, <em>done properly.</em>
          </h2>
        </div>
        <div class="more">
          <For each={more}>
            {(m) => (
              <div class="more__item" data-reveal>
                <Icon name={m.icon} size={22} />
                <h3>{m.t}</h3>
                <p class="muted">{m.d}</p>
              </div>
            )}
          </For>
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
            Everything a photographer actually has, from a screenshot to a raw file off a Fujifilm — and PDFs. Export writes PNG,
            JPEG, HEIC, WebP, TIFF, JPEG 2000, PSD, OpenEXR, TGA, BMP, GIF, ICO or ICNS.
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
            The most used ones. Press any of them now — the matching rows light up. In the app, Ctrl+? lists every one.
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
