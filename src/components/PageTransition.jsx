import { useBeforeLeave, useLocation } from '@solidjs/router';
import { createSignal } from 'solid-js';
import { gsap, ScrollTrigger, reducedMotion } from '../lib/motion';
import { markCovered, markRevealed } from '../lib/transition';
import { routeFor } from '../routes';
import { asset } from '../lib/base';

// Two frames for layout to settle — with a timer fallback, since a background
// tab gets no animation frames and the curtain must still lift.
const frames = () =>
  new Promise((r) => {
    const t = setTimeout(r, 60);
    requestAnimationFrame(() => requestAnimationFrame(() => (clearTimeout(t), r())));
  });

// Every page starts at its top, so the browser must not put back an old
// position on Back / Forward either.
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

// While the cards cover the page, wheel, touch and scroll keys do nothing — a
// touchpad fling still coasting when you clicked would otherwise carry on
// scrolling into the next page.
const SCROLL_KEYS = new Set([' ', 'ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Home', 'End']);
const stop = (e) => e.preventDefault();
const stopKeys = (e) => SCROLL_KEYS.has(e.key) && e.preventDefault();
function lockScroll(on) {
  const method = on ? 'addEventListener' : 'removeEventListener';
  window[method]('wheel', stop, { passive: false });
  window[method]('touchmove', stop, { passive: false });
  window[method]('keydown', stopKeys);
}

// Jump (never glide) to the top, or to the #hash target, and tell ScrollTrigger
// straight away. It remembers the scroll position and puts it back after a
// refresh; left alone it would still remember where you were on the old page.
function jumpToStart(hash) {
  const target = hash && document.getElementById(decodeURIComponent(hash.slice(1)));
  if (target) target.scrollIntoView({ behavior: 'instant', block: 'start' });
  else window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  ScrollTrigger.clearScrollMemory('manual');
  ScrollTrigger.update();
}

// Triggers whose element left with the old page would otherwise be measured
// against the new one.
function dropOrphanTriggers() {
  ScrollTrigger.getAll().forEach((t) => t.trigger && !t.trigger.isConnected && t.kill());
}

// Two tilted cards, the logo's drawing, sweep across the page between routes:
// the violet one behind, the blue one in front carrying the page's name.
export default function PageTransition() {
  const location = useLocation();
  const [label, setLabel] = createSignal('');
  let root, back, front, text;
  let busy = false;

  function waitFor(pathname, from) {
    return new Promise((resolve) => {
      const start = performance.now();
      const check = () => {
        const here = location.pathname;
        if ((pathname ? here === pathname : here !== from) || performance.now() - start > 1500) resolve();
        else setTimeout(check, 16);
      };
      check();
    });
  }

  function cover() {
    gsap.set(root, { visibility: 'visible' });
    if (reducedMotion()) {
      return gsap.fromTo(front, { opacity: 0, yPercent: 0, rotate: 0 }, { opacity: 1, duration: 0.15 }).then();
    }
    const tl = gsap.timeline();
    tl.fromTo(back, { yPercent: 120, rotate: 9 }, { yPercent: 0, rotate: 5, duration: 0.55, ease: 'power4.inOut' }, 0)
      .fromTo(front, { yPercent: 125, rotate: -7, opacity: 1 }, { yPercent: 0, rotate: -2, duration: 0.6, ease: 'power4.inOut' }, 0.06)
      .fromTo(text, { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.45, ease: 'power3.out' }, 0.32);
    return tl.then();
  }

  function reveal() {
    if (reducedMotion()) {
      return gsap.to(front, { opacity: 0, duration: 0.2 }).then(() => gsap.set(root, { visibility: 'hidden' }));
    }
    const tl = gsap.timeline({ onComplete: () => gsap.set(root, { visibility: 'hidden' }) });
    tl.to(text, { y: -30, opacity: 0, duration: 0.3, ease: 'power2.in' }, 0)
      .to(front, { yPercent: -125, rotate: 6, duration: 0.7, ease: 'power4.inOut' }, 0.05)
      .to(back, { yPercent: -125, rotate: -4, duration: 0.7, ease: 'power4.inOut' }, 0.12);
    return tl;
  }

  useBeforeLeave((e) => {
    if (e.defaultPrevented) return;
    const to = typeof e.to === 'string' ? new URL(e.to, window.location.origin) : null;
    // Hash links and the page you are already on do not need a curtain.
    if (to && to.pathname === e.from.pathname) return;

    e.preventDefault();
    if (busy) return;
    busy = true;
    markCovered();
    lockScroll(true);

    const route = to ? routeFor(to.pathname) : null;
    setLabel(route ? route.label : '');

    Promise.all([cover(), route?.preload()]).then(async () => {
      // Hidden under the cards: leave the old page at its top too, so nothing
      // (scroll anchoring, a restored position) can carry its offset across.
      jumpToStart();
      e.retry(true);
      await waitFor(to?.pathname, e.from.pathname);
      await frames();
      dropOrphanTriggers();
      jumpToStart(to?.hash);
      ScrollTrigger.refresh();
      jumpToStart(to?.hash);
      // Browser extensions that lay an overlay over the whole page (highlighters,
      // annotators) size it once and only re-measure on resize; left alone,
      // theirs keeps the old page's height and the scrollbar with it.
      window.dispatchEvent(new Event('resize'));
      reveal();
      // Let the page start its entrance while the cards are still lifting.
      setTimeout(() => {
        busy = false;
        lockScroll(false);
        markRevealed();
      }, reducedMotion() ? 0 : 260);
    });
  });

  return (
    <div class="pt" ref={root} aria-hidden="true">
      <div class="pt__card pt__card--back" ref={back} />
      <div class="pt__card pt__card--front" ref={front}>
        <div class="pt__label" ref={text}>
          <img src={asset('img/logo.webp')} alt="" width="44" height="44" />
          <span>{label()}</span>
        </div>
      </div>
    </div>
  );
}
