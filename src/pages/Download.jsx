import { For, Show, createSignal } from 'solid-js';
import { gsap, reducedMotion, setTitle, usePageMotion } from '../lib/motion';
import CodeBlock from '../components/CodeBlock';
import Icon from '../components/Icon';
import { channels, featuredChannel, guessChannel, isLinux, releases, repo, requirements, version } from '../data/downloads';
import '../styles/download.css';

const faqs = [
  {
    q: 'Is there a Windows or macOS version?',
    a: 'No. Glance is built on GTK 4 and libadwaita and is made for the Linux desktop. If you need Windows too, nomacs and qView are good viewers that run there.',
  },
  {
    q: 'Which one should I pick?',
    a: 'Flatpak works on any distribution and keeps itself updated. If your distribution has a package, that fits in best with the rest of your system. Building from source works everywhere and takes a few minutes.',
  },
  {
    q: 'Why is the Arch and Debian package called glance-image-viewer?',
    a: 'Because “glance” is already taken there by an unrelated program. The app itself is still called Glance and the command is still glance.',
  },
  {
    q: 'Does it cost anything, or phone home?',
    a: 'It is free software under GPL-3.0-or-later. There is no account, no telemetry and nothing to upload: the file-size feature runs on your machine.',
  },
];

export default function Download() {
  let root, panel;
  setTitle('Download');

  const initial = () => {
    const guess = channels.find((c) => c.id === guessChannel() && c.ready);
    return (guess || featuredChannel() || channels[0]).id;
  };
  const [selected, setSelected] = createSignal(initial());
  const current = () => channels.find((c) => c.id === selected());
  const files = channels.filter((c) => c.file).map((c) => ({ ...c.file, channel: c, ready: c.file.ready ?? c.ready }));

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

  usePageMotion(() => root);

  return (
    <div ref={root} class="dl">
      <section class="wrap dl__hero">
        <span class="kicker" data-intro>
          Version {version}
        </span>
        <h1 class="display dl__title" data-intro>
          Get <em>Glance.</em>
        </h1>
        <p class="lede" data-intro>
          Free, open source, and made for Linux. Pick how you like to install things — every option gives you the same app, in
          your launcher and in “Open With” for images.
        </p>
        <Show when={!isLinux()}>
          <p class="dl__os" data-intro>
            <Icon name="monitor" size={18} /> You seem to be on another system. Glance runs on Linux — send this page to the
            machine you'll use it on.
          </p>
        </Show>
      </section>

      <section class="wrap dl__main" data-intro>
        <div class="dl__list" role="tablist" aria-label="Ways to install" aria-orientation="vertical">
          <For each={[...channels].sort((a, b) => b.ready - a.ready)}>
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
                <span class="dl__badge" classList={{ 'is-ready': c.ready }}>
                  {c.ready ? 'Available' : 'Coming soon'}
                </span>
              </button>
            )}
          </For>
        </div>

        <div class="dl__panel card" id="dl-panel" role="tabpanel" aria-labelledby={`tab-${selected()}`} ref={panel}>
          <div class="dl__panel-head">
            <div>
              <h2 class="h3">{current().name}</h2>
              <p class="muted">{current().note}</p>
            </div>
            <Show when={!current().ready}>
              <span class="dl__soon">Not published yet</span>
            </Show>
          </div>

          <Show when={current().deps}>
            <div class="dl__step">
              <div class="dl__n">1</div>
              <div class="dl__step-body">
                <h3>Install what it builds against</h3>
                <For each={Object.entries(current().deps)}>{([distro, cmd]) => <CodeBlock title={distro} code={cmd} />}</For>
              </div>
            </div>
          </Show>

          <Show when={current().command}>
            <div class="dl__step" classList={{ 'is-dim': !current().ready }}>
              <div class="dl__n">{current().deps ? 2 : 1}</div>
              <div class="dl__step-body">
                <h3>{current().deps ? 'Get the source, build and install' : 'Install'}</h3>
                <CodeBlock code={current().command} />
              </div>
            </div>
          </Show>

          <Show when={current().file}>
            {(f) => (
              <div class="dl__step" classList={{ 'is-dim': !(f().ready ?? current().ready) }}>
                <div class="dl__n">{current().command ? (current().deps ? 3 : 2) : 1}</div>
                <div class="dl__step-body">
                  <h3>{current().command ? 'Or download the file' : 'Download the package'}</h3>
                  <div class="dl__file">
                    <Icon name="box" size={22} />
                    <div class="dl__file-meta">
                      <span class="mono">{f().label}</span>
                      <span class="faint">{f().size || (f().ready ?? current().ready ? '' : 'coming with the first release')}</span>
                    </div>
                    <Show
                      when={f().ready ?? current().ready}
                      fallback={
                        <span class="btn btn--sm dl__disabled" aria-disabled="true">
                          <Icon name="download" size={16} /> Soon
                        </span>
                      }
                    >
                      <a class="btn btn--primary btn--sm" href={f().url} download>
                        <Icon name="download" size={16} /> Download
                      </a>
                    </Show>
                  </div>
                  <Show when={f().install}>
                    <p class="faint small-print">Then install it:</p>
                    <CodeBlock code={f().install} />
                  </Show>
                </div>
              </div>
            )}
          </Show>

          <div class="dl__after">
            <div>
              <h3>Run it</h3>
              <CodeBlock code={current().run || 'glance path/to/image.jpg'} />
            </div>
            <div>
              <h3>Remove it</h3>
              <CodeBlock code={current().remove} />
            </div>
          </div>
        </div>
      </section>

      <section class="wrap section--tight dl__files">
        <div class="section-head section-head--split">
          <h2 class="h2" data-reveal>
            Direct <em>downloads</em>
          </h2>
          <p class="muted" data-reveal>
            Every file is attached to a release on GitHub, next to the source it was built from.{' '}
            <a class="link" href={releases} target="_blank" rel="noopener">
              All releases
            </a>
          </p>
        </div>
        <div class="dl__table card" data-reveal>
          <For each={files}>
            {(f) => (
              <div class="dl__row">
                <div class="dl__row-main">
                  <span class="mono dl__row-name">{f.label}</span>
                  <span class="faint">{f.channel.name}</span>
                </div>
                <span class="faint dl__row-size">{f.size}</span>
                <Show when={f.ready} fallback={<span class="dl__badge">Coming soon</span>}>
                  <a class="btn btn--sm" href={f.url} download>
                    <Icon name="download" size={16} /> Download
                  </a>
                </Show>
              </div>
            )}
          </For>
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
