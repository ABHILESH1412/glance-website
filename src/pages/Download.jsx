import { For, Show, createSignal } from 'solid-js';
import { gsap, reducedMotion, setTitle, usePageMotion } from '../lib/motion';
import CodeBlock from '../components/CodeBlock';
import Icon from '../components/Icon';
import {
  APP_ID,
  channels,
  checkSums,
  files,
  guessChannel,
  isLinux,
  latestRelease,
  repo,
  requirements,
  version,
} from '../data/downloads';
import '../styles/download.css';

const whatsNew = [
  'PDFs: search, select and copy text, highlight, notes, contents and bookmarks, night mode',
  'Draw and write on PDFs, sign them, and redact them for good',
  'Combine PDFs and pictures into one PDF; password-protect PDFs and make them smaller',
  'Live Text: copy the text out of pictures, read on your own computer',
  'More shapes, levels, white balance and sharpness; JPEG 2000, Photoshop, OpenEXR and more',
  'Slideshow, photo details, animated GIF frames, printing and Preferences',
];

const faqs = [
  {
    q: 'Is there a Windows or macOS version?',
    a: 'No. Glance is built on GTK 4 and libadwaita for the Linux desktop, on 64-bit Intel and AMD computers. If you need Windows too, nomacs and qView are good viewers that run there.',
  },
  {
    q: 'Which one should I pick?',
    a: 'The Flatpak, on almost every distribution: it brings everything it needs and works the same everywhere. On Arch and its relatives, the Arch package. The AppImage if you want one file with nothing to install, on a distribution from 2024 or later.',
  },
  {
    q: 'Does it update itself?',
    a: 'Not yet. Run your distribution’s install commands again: they always fetch the newest release. Installing the newer Flatpak over the old one keeps your settings, signatures and everything else.',
  },
  {
    q: 'Why is the Arch package called glance-image-viewer?',
    a: 'Because Arch already has an unrelated program called “glance”, and the two cannot be installed together. The app is still called Glance, and the command is still glance.',
  },
  {
    q: 'Does it send anything anywhere?',
    a: 'No. It is free software under GPL-3.0-or-later, with no account and no telemetry. Live Text downloads its engine and models (42.5 MB) the first time you use it, after asking, checked against fixed checksums — and then reads pictures on your own computer.',
  },
];

export default function Download() {
  let root, panel;
  setTitle('Download');

  const initial = () => (channels.find((c) => c.id === guessChannel()) || channels[0]).id;
  const [selected, setSelected] = createSignal(initial());
  const current = () => channels.find((c) => c.id === selected());
  const file = () => files[current().file];

  function pick(id) {
    if (id === selected()) return;
    if (reducedMotion() || !panel) return setSelected(id);
    gsap.to(panel, {
      opacity: 0,
      y: 10,
      duration: 0.15,
      ease: 'power2.in',
      onComplete: () => {
        setSelected(id);
        gsap.fromTo(panel, { opacity: 0, y: -10 }, { opacity: 1, y: 0, duration: 0.4, ease: 'power3.out' });
      },
    });
  }

  function jumpTo(id) {
    pick(id);
    document.getElementById('install')?.scrollIntoView({ behavior: reducedMotion() ? 'auto' : 'smooth', block: 'start' });
  }

  usePageMotion(() => root);

  return (
    <div ref={root} class="dl">
      <section class="wrap dl__hero">
        <div class="dl__intro">
          <span class="kicker" data-intro>
            Version {version}
          </span>
          <h1 class="display dl__title" data-intro>
            Get <em>Glance.</em>
          </h1>
          <p class="lede" data-intro>
            Free, open source, for 64-bit Linux. Pick your distribution and paste the commands, one block at a time. Each one
            downloads the latest release, so they stay the same from one release to the next.
          </p>
          <Show when={!isLinux()}>
            <p class="dl__os" data-intro>
              <Icon name="monitor" size={18} /> You seem to be on another system. Glance runs on Linux — send this page to the
              machine you'll use it on.
            </p>
          </Show>
        </div>
        <aside class="dl__new card" data-intro>
          <div class="dl__new-head">
            <span class="kicker">New in {version}</span>
            <a class="link" href={latestRelease} target="_blank" rel="noopener">
              Release notes
            </a>
          </div>
          <ul>
            <For each={whatsNew}>{(item) => <li>{item}</li>}</For>
          </ul>
        </aside>
      </section>

      <section class="wrap dl__main" id="install" data-intro>
        <div class="dl__list" role="tablist" aria-label="Your distribution" aria-orientation="vertical">
          <For each={channels}>
            {(c) => (
              <button
                type="button"
                role="tab"
                id={`tab-${c.id}`}
                aria-selected={selected() === c.id}
                aria-controls="dl-panel"
                class="dl__opt"
                onClick={() => pick(c.id)}
              >
                <span class="dl__opt-name">{c.name}</span>
                <span class="dl__opt-for">{c.for}</span>
                <span class="dl__badge is-ready">{c.method}</span>
              </button>
            )}
          </For>
        </div>

        <div class="dl__panel card" id="dl-panel" role="tabpanel" aria-labelledby={`tab-${selected()}`} ref={panel}>
          <div class="dl__panel-head">
            <div>
              <span class="dl__method">{current().method}</span>
              <h2 class="h3">{current().name}</h2>
              <p class="muted">
                {current().note}
                <Show when={current().link}>
                  {' '}
                  <a class="link" href={current().link.url} target="_blank" rel="noopener">
                    {current().link.label}
                  </a>
                </Show>
              </p>
            </div>
          </div>

          <For each={current().steps}>
            {(step, i) => (
              <div class="dl__step">
                <div class="dl__n">{i() + 1}</div>
                <div class="dl__step-body">
                  <h3>
                    {step.title}
                    <Show when={step.hint}>
                      <span class="dl__hint"> — {step.hint}</span>
                    </Show>
                  </h3>
                  <Show when={step.code}>
                    <CodeBlock code={step.code} />
                  </Show>
                  <Show when={step.blocks}>
                    <p class="faint small-print">The one for your distribution:</p>
                    <For each={Object.entries(step.blocks)}>{([distro, cmd]) => <CodeBlock title={distro} code={cmd} />}</For>
                  </Show>
                </div>
              </div>
            )}
          </For>

          <div class="dl__step">
            <div class="dl__n">{current().steps.length + 1}</div>
            <div class="dl__step-body">
              <h3>Run it</h3>
              <CodeBlock code={current().run} />
              <p class="faint small-print">
                {current().id === 'appimage' ? 'Or double-click the file.' : 'Or find Glance among your applications.'}
              </p>
            </div>
          </div>

          <Show when={current().after}>
            <p class="dl__after-note">
              <Icon name="check" size={16} />
              <span>
                {current().after}
                <Show when={current().links}>
                  {' '}
                  <For each={current().links}>
                    {(l, i) => (
                      <>
                        {i() > 0 && ' · '}
                        <a class="link" href={l.url} target="_blank" rel="noopener">
                          {l.label}
                        </a>
                      </>
                    )}
                  </For>
                </Show>
              </span>
            </p>
          </Show>

          <Show when={current().trouble}>
            {(t) => (
              <details class="dl__more">
                <summary>
                  {t().title}
                  <Icon name="plus" size={18} />
                </summary>
                <div class="dl__more-body">
                  <p class="muted">{t().text}</p>
                  <For each={Object.entries(t().blocks)}>{([distro, cmd]) => <CodeBlock title={distro} code={cmd} />}</For>
                  <p class="muted">{t().or.text}</p>
                  <CodeBlock code={t().or.code} />
                </div>
              </details>
            )}
          </Show>

          <Show when={current().flatpakBuild}>
            {(fb) => (
              <details class="dl__more">
                <summary>
                  {fb().title}
                  <Icon name="plus" size={18} />
                </summary>
                <div class="dl__more-body">
                  <p class="muted">{fb().text}</p>
                  <h4>1. The build tool</h4>
                  <For each={Object.entries(fb().blocks)}>{([distro, cmd]) => <CodeBlock title={distro} code={cmd} />}</For>
                  <h4>2. The runtime it builds against</h4>
                  <CodeBlock code={fb().runtime} />
                  <h4>3. Get the source, build and install</h4>
                  <CodeBlock code={fb().build} />
                  <h4>4. Run it</h4>
                  <CodeBlock code={fb().run} />
                </div>
              </details>
            )}
          </Show>

          <div class="dl__file">
            <Icon name="box" size={22} />
            <div class="dl__file-meta">
              <span class="mono">{file().name}</span>
              <span class="faint">
                {file().what}
                {file().size ? ` · ${file().size}` : ''}
              </span>
            </div>
            <a class="btn btn--primary btn--sm" href={file().url}>
              <Icon name="download" size={16} /> Download
            </a>
          </div>

          <div class="dl__foot">
            <div>
              <h3>Remove it</h3>
              <CodeBlock code={current().remove} />
            </div>
            <Show when={current().also}>
              <button type="button" class="dl__also" onClick={() => jumpTo(current().also)}>
                <span class="faint">Also works here</span>
                <span>
                  {channels.find((c) => c.id === current().also).name} <Icon name="arrow" size={16} />
                </span>
              </button>
            </Show>
          </div>
        </div>
      </section>

      <section class="wrap section--tight dl__files">
        <div class="section-head section-head--split">
          <h2 class="h2" data-reveal>
            Direct <em>downloads</em>
          </h2>
          <p class="muted" data-reveal>
            The files attached to the latest release, for 64-bit Intel and AMD computers.{' '}
            <a class="link" href={latestRelease} target="_blank" rel="noopener">
              Release {version} on GitHub
            </a>
          </p>
        </div>
        <div class="dl__table card" data-reveal>
          <For each={Object.values(files)}>
            {(f) => (
              <div class="dl__row">
                <div class="dl__row-main">
                  <span class="mono dl__row-name">{f.name}</span>
                  <span class="faint">{f.what}</span>
                </div>
                <span class="faint dl__row-size">{f.size}</span>
                <a class="btn btn--sm" href={f.url}>
                  <Icon name="download" size={16} /> Download
                </a>
              </div>
            )}
          </For>
        </div>

        <div class="dl__extra">
          <div data-reveal>
            <h3 class="h3">Checking the download</h3>
            <p class="muted">
              Optional. Each release lists the SHA-256 of its files in SHA256SUMS. In the folder you downloaded to:
            </p>
            <CodeBlock code={checkSums} />
            <p class="faint small-print">Every file you downloaded should say OK.</p>
          </div>
          <div data-reveal>
            <h3 class="h3">Updating, and what stays behind</h3>
            <p class="muted">
              Run your distribution’s install commands again: they always fetch the newest release. A Flatpak installed from a
              file does not update itself, and installing the newer file over it keeps your settings, signatures and everything
              else.
            </p>
            <p class="muted">
              Uninstalling leaves your settings in <code>~/.config/glance</code>, and your signatures and Live Text’s download in{' '}
              <code>~/.local/share/glance</code> — for the Flatpak, both under <code>~/.var/app/{APP_ID}</code>. Delete those
              folders as well to remove every trace.
            </p>
          </div>
        </div>
      </section>

      <section class="wrap section--tight dl__req">
        <div class="dl__req-grid">
          <div data-reveal>
            <span class="kicker">Requirements</span>
            <p class="dl__req-text">{requirements}</p>
          </div>
          <div class="dl__faq" data-reveal>
            <For each={faqs}>
              {(f) => (
                <details>
                  <summary>
                    {f.q}
                    <Icon name="plus" size={18} />
                  </summary>
                  <p class="muted">{f.a}</p>
                </details>
              )}
            </For>
          </div>
        </div>
        <p class="faint dl__src" data-reveal>
          Found a problem?{' '}
          <a class="link" href={`${repo}/issues`} target="_blank" rel="noopener">
            Open an issue
          </a>{' '}
          — the source is on{' '}
          <a class="link" href={repo} target="_blank" rel="noopener">
            GitHub
          </a>
          .
        </p>
      </section>
    </div>
  );
}

