import { A } from '@solidjs/router';
import { For } from 'solid-js';
import { gsap, ScrollTrigger, setTitle, usePageMotion } from '../lib/motion';
import GlanceWindow from '../components/GlanceWindow';
import SizeTarget from '../components/SizeTarget';
import CodeBlock from '../components/CodeBlock';
import PdfReader from '../components/PdfReader';
import Icon from '../components/Icon';
import { apps, groups } from '../data/compare';
import { featuredChannel, version } from '../data/downloads';
import '../styles/home.css';
import { asset } from '../lib/base';

const stats = [
  { n: 0, unit: 'MB', label: 'extra memory to zoom an SVG logo to 23×. A rasteriser needed 571 MB.' },
  { n: 32, unit: '×', label: 'free zoom, anchored on the pointer so the pixel under it stays under it.' },
  { n: 27, unit: 'ms', label: 'to convert a 12-megapixel Adobe RGB or P3 photo to sRGB on the way in.' },
  { n: 26, unit: '+', label: 'camera raw formats — Canon, Nikon, Sony, Fujifilm, Olympus and the rest.' },
];

const formats = [
  'PDF', 'PNG', 'JPEG', 'WebP', 'HEIC', 'AVIF', 'SVG', 'JPEG 2000', 'PSD', 'TIFF', 'GIF', 'CR3', 'NEF', 'OpenEXR', 'ARW',
  'DNG', 'RAF', 'Illustrator', 'ORF', 'RW2', 'Radiance HDR', 'PEF', 'SRW', 'ICNS', 'CR2', 'QOI', 'PSB', 'BMP', 'ICO', 'TGA',
  'PNM', 'HEIF', 'SVGZ', 'NRW', 'CRW',
];

const pdfPoints = [
  ['Read', 'Every page in one column, one at a time, or two side by side. Contents, bookmarks, search that never freezes the window, and night mode that keeps colours.'],
  ['Mark up', 'Highlight, underline, strike through, notes, speech bubbles, pens and shapes — saved into the file as ordinary annotations, so every PDF reader shows them.'],
  ['Sign and redact', 'A signature written once and kept, put down as sharp ink. Redaction that removes what is under the box, not just covers it.'],
  ['Protect and shrink', 'Require a password, saved with AES-256. Reduce the file size, and see the new size before deciding.'],
];

const newIn2 = [
  { href: '/features#live-text', title: 'Live Text', text: 'Copy the words out of a screenshot, a photographed page or a sign — read on your own computer, in English and about 45 other languages.' },
  { href: '/features#combine', title: 'Combine into PDF', text: 'Pages from any number of PDFs and pictures, dragged into order, turned, or blank, saved as one new PDF.' },
  { href: '/features#redact', title: 'Redaction that removes', text: 'A black box hides nothing. Glance takes out what is under it, in pictures and PDFs, and checks that it is gone.' },
  { href: '/features#more', title: 'And the rest', text: 'Slideshow, photo details, animated GIF frames, levels, white balance, printing, and one Preferences window.' },
];

const shots = [
  { src: asset('img/viewing.webp'), caption: 'A picture open, with the rest of the folder along the bottom.' },
  { src: asset('img/editing.webp'), caption: 'Brightness, contrast and saturation, applied to the picture as you move them.' },
  { src: asset('img/exporting.webp'), caption: 'Exporting: pick a format, a quality, or a file size to aim for.' },
];

const teaser = [
  groups[2].rows[0], // read, search and copy PDF text
  groups[2].rows[2], // sign a PDF
  groups[2].rows[8], // redact text permanently
  groups[3].rows[3], // Live Text
  groups[1].rows[10], // hit a file size
  groups[0].rows[1], // SVG zoom without re-rasterising
  groups[3].rows[11], // runs on Linux
];

export default function Home() {
  let root;
  setTitle('');
  const featured = featuredChannel();

  usePageMotion(
    () => root,
    (reduced) => {
      if (reduced) return;
      // Headline lines rise out of their own masks.
      gsap.from(root.querySelectorAll('.hero__title .ln > span'), {
        yPercent: 110,
        duration: 1.15,
        stagger: 0.09,
        ease: 'power4.out',
      });
      // The window lands like the front card of the logo, the violet card behind it.
      gsap.fromTo('.hero__win', { y: 90, rotate: -4, opacity: 0 }, { y: 0, rotate: 0, opacity: 1, duration: 1.3, delay: 0.25, ease: 'power4.out' });
      gsap.fromTo('.hero__back', { rotate: 0, opacity: 0 }, { rotate: 5, opacity: 1, duration: 1.5, delay: 0.45, ease: 'power3.out' });
      gsap.to('.hero__back', {
        rotate: 7,
        ease: 'none',
        scrollTrigger: { trigger: '.hero__stage', start: 'top 60%', end: 'bottom top', scrub: true },
      });

      // Stats count up once.
      root.querySelectorAll('[data-count]').forEach((el) => {
        const to = Number(el.dataset.count);
        const o = { v: 0 };
        gsap.to(o, {
          v: to,
          duration: 1.4,
          ease: 'power2.out',
          scrollTrigger: { trigger: el, start: 'top 90%', once: true },
          onUpdate: () => (el.textContent = Math.round(o.v)),
        });
      });

      // Benchmark bars grow when seen.
      gsap.from(root.querySelectorAll('.bench__bar i'), {
        scaleX: 0,
        duration: 1.3,
        stagger: 0.12,
        ease: 'power3.inOut',
        scrollTrigger: { trigger: '.bench', start: 'top 80%', once: true },
      });

      // Screenshots fan out of a stack as you scroll past them.
      const mm = gsap.matchMedia();
      mm.add('(min-width: 900px)', () => {
        const cards = gsap.utils.toArray('.shots__card');
        gsap.fromTo(
          cards,
          { xPercent: (i) => (1 - i) * 92, yPercent: (i) => Math.abs(1 - i) * 6, rotate: (i) => (i - 1) * -5, scale: (i) => (i === 1 ? 1 : 0.94) },
          {
            xPercent: 0,
            yPercent: 0,
            rotate: (i) => (i - 1) * 2.5,
            scale: 1,
            ease: 'none',
            scrollTrigger: { trigger: '.shots', start: 'top 85%', end: 'center 55%', scrub: 0.6 },
          },
        );
      });

      // Pipeline dots travel along the colour diagram.
      gsap.fromTo(
        root.querySelectorAll('.pipe__flow i'),
        { left: '0%' },
        { left: '100%', duration: 2.4, ease: 'none', repeat: -1, stagger: 0.8 },
      );

      ScrollTrigger.refresh();
      return () => mm.revert();
    },
  );

  return (
    <div ref={root}>
      {/* ------------------------------------------------------------ hero */}
      <section class="hero">
        <div class="wrap hero__grid">
          <div class="hero__copy">
            <div class="hero__tags" data-intro>
              <span class="tag">
                <i class="tag__dot" /> Version {version}
              </span>
              <span class="tag">Pictures &amp; PDFs</span>
              <span class="tag">Linux</span>
              <span class="tag">Free &amp; open source</span>
            </div>
            <h1 class="display hero__title">
              <span class="ln">
                <span>Look at pictures</span>
              </span>
              <span class="ln">
                <span>
                  and PDFs, <em>and make</em>
                </span>
              </span>
              <span class="ln">
                <span>
                  <em>small changes to them.</em>
                </span>
              </span>
            </h1>
          </div>
          <div class="hero__side">
            <p class="lede" data-intro>
              Glance is a fast, native image and PDF viewer for Linux. It opens a file, shows it properly, and gets out of the
              way — with an editor one button away when you need it.
            </p>
            <div class="hero__cta" data-intro>
              <A href="/download" class="btn btn--primary">
                <Icon name="download" /> Download for Linux
              </A>
              <A href="/features" class="btn btn--ghost">
                See what it does <Icon name="arrow" class="arrow" />
              </A>
            </div>
          </div>
        </div>

        <div class="wrap hero__stage">
          <div class="hero__back" aria-hidden="true" />
          <div class="hero__win">
            <GlanceWindow />
          </div>
        </div>
        <p class="wrap hero__keys faint" data-intro>
          <span class="hero__keys-lead">A preview of the window — click it and try:</span>
          <span>
            <kbd>←</kbd> <kbd>→</kbd> browse
          </span>
          <span>
            <kbd>scroll</kbd> zoom
          </span>
          <span>
            <kbd>0</kbd> <kbd>1</kbd> fit / 100%
          </span>
          <span>
            <kbd>[</kbd> <kbd>]</kbd> turn
          </span>
        </p>
      </section>

      {/* ------------------------------------------------------------ stats */}
      <section class="wrap stats" aria-label="In numbers">
        <For each={stats}>
          {(s) => (
            <div class="stat" data-reveal>
              <div class="stat__n">
                <span data-count={s.n}>{s.n}</span>
                <small>{s.unit}</small>
              </div>
              <p>{s.label}</p>
            </div>
          )}
        </For>
      </section>

      {/* ------------------------------------------------------------ why */}
      <section class="section why">
        <div class="wrap why__grid">
          <div class="why__head">
            <div class="why__sticky">
              <span class="kicker" data-reveal>
                Why another viewer
              </span>
              <h2 class="h2" data-reveal>
                Fast <em>and</em> modern, not one or the other.
              </h2>
              <p class="muted" data-reveal>
                Most Linux image viewers are either fast but dated, or modern-looking but sluggish for what is fundamentally a
                pixel-blitting problem. Glance aims at both, and three decisions follow from that.
              </p>
            </div>
          </div>

          <ol class="why__list">
            <li class="why__item" data-reveal>
              <div class="why__n">01</div>
              <div class="why__body">
                <h3 class="h3">
                  <Icon name="shield" size={26} /> Rust, because a viewer parses untrusted files.
                </h3>
                <p class="muted">
                  An image viewer is a parser for binary data from anywhere. Image decoders are a classic source of
                  memory-corruption bugs — libjpeg, libpng and WebP have all had serious ones. Rust removes that whole class of
                  defect from the decoding path, and decoding never runs on the main thread, so a huge file cannot freeze the
                  window.
                </p>
              </div>
            </li>

            <li class="why__item" data-reveal>
              <div class="why__n">02</div>
              <div class="why__body">
                <h3 class="h3">
                  <Icon name="gpu" size={26} /> The GPU does the drawing.
                </h3>
                <p class="muted">
                  Zooming and panning are transforms, not re-renders. An SVG is translated into GTK's own render nodes once, at
                  load, so zooming never re-rasterises anything. One logo with three nested drop shadows, zoomed to 23×:
                </p>
                <figure class="bench">
                  <div class="bench__group">
                    <div class="bench__label">Memory</div>
                    <div class="bench__bar bench__bar--them">
                      <i style={{ '--w': '100%' }} />
                      <span>Rasteriser · 571 MB</span>
                    </div>
                    <div class="bench__bar bench__bar--us">
                      <i style={{ '--w': '0.6%' }} />
                      <span>Glance · 0 MB</span>
                    </div>
                  </div>
                  <div class="bench__group">
                    <div class="bench__label">Time</div>
                    <div class="bench__bar bench__bar--them">
                      <i style={{ '--w': '100%' }} />
                      <span>Rasteriser · 11.6 s</span>
                    </div>
                    <div class="bench__bar bench__bar--us">
                      <i style={{ '--w': `${(1 / 11.6) * 100}%` }} />
                      <span>Glance · 1.0 s</span>
                    </div>
                  </div>
                  <figcaption class="faint">Measured by the project on the logo described above.</figcaption>
                </figure>
              </div>
            </li>

            <li class="why__item" data-reveal>
              <div class="why__n">03</div>
              <div class="why__body">
                <h3 class="h3">
                  <Icon name="palette" size={26} /> Colour is handled once, at the door.
                </h3>
                <p class="muted">
                  Every decoder converts to 8-bit sRGB before the picture reaches anything else — ICC profiles included — so a
                  pixel means the same thing in the tone sliders, under your text and drawings, and on the way back out to a file.
                </p>
                <div class="pipe" aria-label="Every format is converted to sRGB once, then used everywhere">
                  <div class="pipe__col">
                    <span>JPEG · PNG</span>
                    <span>HEIC · AVIF</span>
                    <span>Camera raw</span>
                    <span>SVG</span>
                  </div>
                  <div class="pipe__flow" aria-hidden="true">
                    <i />
                    <i />
                    <i />
                  </div>
                  <div class="pipe__core">
                    <strong>sRGB</strong>
                    <small>8-bit, once</small>
                  </div>
                  <div class="pipe__flow" aria-hidden="true">
                    <i />
                    <i />
                    <i />
                  </div>
                  <div class="pipe__col">
                    <span>On screen</span>
                    <span>Tone sliders</span>
                    <span>Text &amp; drawing</span>
                    <span>Saved file</span>
                  </div>
                </div>
                <p class="faint small">About 27 ms on a 12-megapixel photograph. Recognising an already-sRGB profile and skipping it costs 2 µs.</p>
              </div>
            </li>
          </ol>
        </div>
      </section>

      {/* ------------------------------------------------------------ PDFs */}
      <section class="section pdfs">
        <div class="wrap">
          <div class="section-head section-head--split">
            <div>
              <span class="kicker" data-reveal>
                New in {version}
              </span>
              <h2 class="h2" data-reveal>
                PDFs open in the same window — <em>and the changes stay in the file.</em>
              </h2>
            </div>
            <p class="lede" data-reveal>
              Search them, highlight, annotate, draw and write on them, sign, redact, protect with a password, make smaller, and
              combine with other PDFs and pictures. Every change is saved where any PDF reader will see it.
            </p>
          </div>
          <div class="pdfs__grid">
            <div data-reveal>
              <PdfReader />
              <p class="faint pdfs__hint">Try it: search for a word, pick a highlight colour, switch on night mode.</p>
            </div>
            <dl class="pdfs__points">
              <For each={pdfPoints}>
                {([t, d]) => (
                  <div data-reveal>
                    <dt>{t}</dt>
                    <dd>{d}</dd>
                  </div>
                )}
              </For>
              <div data-reveal>
                <A href="/features#pdfs" class="btn">
                  Everything it does with PDFs <Icon name="arrow" class="arrow" />
                </A>
              </div>
            </dl>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------ size target */}
      <section class="section size">
        <div class="wrap">
          <div class="section-head section-head--split">
            <div>
              <span class="kicker" data-reveal>
                The unusual bit
              </span>
              <h2 class="h2" data-reveal>
                “Make it <em>under 500 KB.”</em> Done.
              </h2>
            </div>
            <p class="lede" data-reveal>
              Give Glance a file size and it compresses — or inflates — the picture to hit it. That's the job people normally
              hand to an ad-funded upload site. Below is the same search the app runs, using your browser's encoder so you can
              watch it work.
            </p>
          </div>
          <div data-reveal>
            <SizeTarget />
          </div>
          <div class="size__how" data-reveal>
            <div>
              <h3>Too big?</h3>
              <p class="muted">A binary search over JPEG quality finds the best-looking file that fits — about eight encodes.</p>
            </div>
            <div>
              <h3>Still too big at quality 15?</h3>
              <p class="muted">Below that the picture is ruined, so it shrinks the image instead and searches again.</p>
            </div>
            <div>
              <h3>Too small?</h3>
              <p class="muted">Upload forms that demand a minimum get a padded file: filler in a comment block, pixels untouched.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------ also new */}
      <section class="section--tight wrap news">
        <div class="news__head">
          <span class="kicker" data-reveal>
            Also new in {version}
          </span>
        </div>
        <div class="news__list">
          <For each={newIn2}>
            {(n, i) => (
              <A href={n.href} class="news__item" data-reveal>
                <span class="news__n">0{i() + 1}</span>
                <span class="news__t">{n.title}</span>
                <span class="news__d">{n.text}</span>
                <Icon name="arrow" class="arrow news__arrow" />
              </A>
            )}
          </For>
        </div>
      </section>

      {/* ------------------------------------------------------------ screenshots */}
      <section class="section shots-sec">
        <div class="wrap">
          <div class="section-head">
            <span class="kicker" data-reveal>
              The real thing
            </span>
            <h2 class="h2" data-reveal>
              Everything happens <em>on the picture</em>,<br class="br-lg" /> not in a preview box.
            </h2>
          </div>
          <div class="shots">
            <For each={shots}>
              {(s, i) => (
                <figure class="shots__card" style={{ 'z-index': i() === 1 ? 3 : 2 - Math.abs(1 - i()) }}>
                  <img src={s.src} alt={s.caption} width="1280" height="800" loading="lazy" decoding="async" />
                  <figcaption>{s.caption}</figcaption>
                </figure>
              )}
            </For>
          </div>
          <div class="shots__more" data-reveal>
            <A href="/features" class="btn">
              Every feature, in detail <Icon name="arrow" class="arrow" />
            </A>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------ formats */}
      <section class="section--tight formats" aria-label="Formats">
        <div class="wrap formats__head">
          <h2 class="h2" data-reveal>
            Reads what a photographer <em>actually has</em> — and PDFs.
          </h2>
        </div>
        <div class="marquee" aria-hidden="true">
          <div class="marquee__row">
            <For each={[...formats, ...formats]}>{(f) => <span>{f}</span>}</For>
          </div>
          <div class="marquee__row marquee__row--rev">
            <For each={[...formats.slice(13), ...formats.slice(0, 13), ...formats.slice(13), ...formats.slice(0, 13)]}>
              {(f) => <span>{f}</span>}
            </For>
          </div>
        </div>
        <p class="wrap faint formats__foot" data-reveal>
          EXIF orientation is honoured, so phone photos are upright. Animated GIF and WebP play — and keep playing while you zoom
          or rotate. HDR files are fitted into the screen’s range; Photoshop files show the picture as last saved.
        </p>
      </section>

      {/* ------------------------------------------------------------ compare teaser */}
      <section class="section">
        <div class="wrap teaser">
          <div class="teaser__copy">
            <span class="kicker" data-reveal>
              Against the others
            </span>
            <h2 class="h2" data-reveal>
              The short, <em>honest</em> version.
            </h2>
            <p class="muted" data-reveal>
              On Linux, Glance is the only viewer that also reads, marks up, signs, combines and redacts PDFs, reads the text in
              pictures, or hits a file size on request — the things people otherwise keep a Mac around for. Its yardstick is
              Apple’s Preview, and it still lacks PDF forms, 3D models and batch work.
            </p>
            <div data-reveal>
              <A href="/compare" class="btn">
                Full comparison <Icon name="arrow" class="arrow" />
              </A>
            </div>
          </div>
          <div class="mini card" data-reveal>
            <div class="mini__head">
              <span />
              <For each={apps}>
                {(a) => (
                  <span class="mini__app" classList={{ 'is-us': a.id === 'glance' }}>
                    <img src={a.icon} alt={a.name} title={a.name} width="28" height="28" loading="lazy" />
                  </span>
                )}
              </For>
            </div>
            <For each={teaser}>
              {(row) => (
                <div class="mini__row">
                  <span class="mini__label">{row[0]}</span>
                  <For each={row[1]}>
                    {(v, i) => (
                      <span class="mini__cell" classList={{ 'is-us': i() === 0 }}>
                        {v ? <Icon name="check" size={16} stroke={2.2} class="yes" /> : <i class="no" aria-label="No" />}
                      </span>
                    )}
                  </For>
                </div>
              )}
            </For>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------ download */}
      <section class="section get">
        <div class="wrap">
          <div class="get__card" data-reveal>
            <div class="get__glow" aria-hidden="true" />
            <img class="get__logo" src={asset('img/logo.webp')} alt="" width="120" height="120" loading="lazy" />
            <h2 class="h2">
              Open a picture, or a PDF. <em>That's it.</em>
            </h2>
            <p class="get__sub">
              Glance {version} · 64-bit Linux · GPL-3.0 · as a Flatpak, on any distribution
            </p>
            <CodeBlock code={[...featured.steps.map((s) => s.code), featured.run].join('\n')} class="get__code" />
            <div class="get__cta">
              <A href="/download" class="btn btn--primary">
                <Icon name="download" /> All download options
              </A>
              <span class="faint get__count">Commands for Ubuntu, Debian, Fedora, openSUSE, Arch, and an AppImage</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
