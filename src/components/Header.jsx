import { A, useLocation } from '@solidjs/router';
import { For, Show, createEffect, createSignal, onCleanup, onMount } from 'solid-js';
import { nav } from '../routes';
import { gsap, reducedMotion } from '../lib/motion';
import ThemeSwitch from './ThemeSwitch';
import Icon from './Icon';
import { asset } from '../lib/base';

export const REPO = 'https://github.com/ABHILESH1412/glance';

export default function Header() {
  const location = useLocation();
  const [scrolled, setScrolled] = createSignal(false);
  const [open, setOpen] = createSignal(false);
  let navEl, bar, sheet;

  const onScroll = () => setScrolled(window.scrollY > 8);
  onMount(() => {
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', placeBar);
    document.fonts?.ready.then(placeBar);
  });
  onCleanup(() => {
    window.removeEventListener('scroll', onScroll);
    window.removeEventListener('resize', placeBar);
  });

  // The indicator under the nav follows the page you are on.
  function placeBar() {
    if (!navEl) return;
    const active = navEl.querySelector('a.is-active');
    if (!active) {
      bar.style.opacity = '0';
      return;
    }
    bar.style.opacity = '1';
    bar.style.transform = `translateX(${active.offsetLeft}px)`;
    bar.style.width = `${active.offsetWidth}px`;
  }
  createEffect(() => {
    location.pathname;
    requestAnimationFrame(placeBar);
    setOpen(false);
  });

  createEffect(() => {
    const isOpen = open();
    document.body.style.overflow = isOpen ? 'hidden' : '';
    if (isOpen && sheet && !reducedMotion()) {
      gsap.fromTo(sheet, { clipPath: 'inset(0 0 100% 0)' }, { clipPath: 'inset(0 0 0% 0)', duration: 0.55, ease: 'power4.inOut' });
      gsap.fromTo(
        sheet.querySelectorAll('[data-item]'),
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, stagger: 0.05, delay: 0.18, duration: 0.6 },
      );
    }
  });

  return (
    <>
      <header class="hdr" classList={{ 'is-scrolled': scrolled() || open() }}>
        <div class="wrap hdr__in">
          <A href="/" class="brand" aria-label="Glance, home">
            <img src={asset('img/logo.webp')} alt="" width="34" height="34" />
            <span>Glance</span>
          </A>

          <nav class="hdr__nav" aria-label="Main" ref={navEl}>
            <For each={nav.filter((r) => r.path !== '/download')}>
              {(r) => (
                <A href={r.path} end={r.path === '/'} activeClass="is-active">
                  {r.label}
                </A>
              )}
            </For>
            <span class="hdr__bar" ref={bar} aria-hidden="true" />
          </nav>

          <div class="hdr__tools">
            <ThemeSwitch />
            <A href="/download" class="btn btn--primary btn--sm hdr__cta" activeClass="is-here">
              <Icon name="download" size={16} /> Download
            </A>
            <a class="hdr__gh" href={REPO} target="_blank" rel="noopener" aria-label="Source on GitHub">
              <Icon name="github" size={19} />
            </a>
            <button
              class="hdr__burger"
              type="button"
              aria-expanded={open()}
              aria-controls="sheet"
              aria-label={open() ? 'Close menu' : 'Open menu'}
              onClick={() => setOpen(!open())}
            >
              <Icon name={open() ? 'x' : 'menu'} size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* Outside the header: its backdrop-filter would trap a fixed child inside it. */}
      <Show when={open()}>
        <div class="sheet" id="sheet" ref={sheet}>
          <nav class="wrap" aria-label="Main">
            <For each={nav}>
              {(r, i) => (
                <A href={r.path} end={r.path === '/'} activeClass="is-active" data-item>
                  <span class="sheet__n">0{i() + 1}</span>
                  {r.label}
                </A>
              )}
            </For>
            <a href={REPO} target="_blank" rel="noopener" data-item class="sheet__gh">
              <Icon name="github" size={18} /> Source on GitHub
            </a>
          </nav>
        </div>
      </Show>
    </>
  );
}
