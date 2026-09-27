import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { onCleanup, onMount } from 'solid-js';
import { whenRevealed } from './transition';

gsap.registerPlugin(ScrollTrigger);
gsap.defaults({ ease: 'power3.out', duration: 0.8 });

export { gsap, ScrollTrigger };

export const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Wire up a page's motion once it is on screen.
 *  - `[data-intro]` children animate in as the page transition lifts.
 *  - `[data-reveal]` children animate in as they scroll into view.
 *  - `setup(reduced)` can add page-specific tweens, and may return a cleanup
 *    for anything a context does not track. Everything is reverted on unmount.
 */
export function usePageMotion(rootRef, setup) {
  let ctx;
  let undo;
  onMount(() => {
    const root = rootRef();
    ctx = gsap.context(() => {}, root);

    if (reducedMotion()) {
      gsap.set(root.querySelectorAll('[data-reveal],[data-intro]'), { opacity: 1 });
      ctx.add(() => (undo = setup?.(true)));
      return;
    }

    gsap.set(root.querySelectorAll('[data-intro]'), { opacity: 0, y: 28 });

    whenRevealed(() => {
      ctx.add(() => {
        gsap.to(root.querySelectorAll('[data-intro]'), {
          opacity: 1,
          y: 0,
          duration: 1,
          stagger: 0.07,
          clearProps: 'transform',
        });

        ScrollTrigger.batch(root.querySelectorAll('[data-reveal]'), {
          start: 'top 88%',
          once: true,
          onEnter: (els) =>
            gsap.fromTo(
              els,
              { opacity: 0, y: 36 },
              { opacity: 1, y: 0, duration: 0.9, stagger: 0.08, clearProps: 'transform' },
            ),
        });

        undo = setup?.(false);
        ScrollTrigger.refresh();
      });
    });
  });
  onCleanup(() => {
    if (typeof undo === 'function') undo();
    ctx?.revert();
  });
}

export function setTitle(title) {
  document.title = title ? `${title} — Glance` : 'Glance — a fast, native image viewer for Linux';
}
