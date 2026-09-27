import { A } from '@solidjs/router';
import { setTitle, usePageMotion } from '../lib/motion';
import Scene from '../components/Scene';
import Icon from '../components/Icon';

export default function NotFound() {
  let root;
  setTitle('Not found');
  usePageMotion(() => root);
  return (
    <section class="wrap nf" ref={root}>
      <div class="nf__pic" data-intro aria-hidden="true">
        <Scene index={3} />
        <span>?</span>
      </div>
      <h1 class="display" data-intro>
        Nothing <em>to look at.</em>
      </h1>
      <p class="lede" data-intro>
        This page isn't in the folder. It may have moved, or the link was mistyped.
      </p>
      <div data-intro>
        <A href="/" class="btn btn--primary">
          <Icon name="chev-l" /> Back home
        </A>
      </div>
      <style>{`
        .nf { display: grid; gap: 22px; justify-items: start; padding-block: clamp(48px, 10vw, 140px); }
        .nf em { color: var(--ink-2); }
        .nf__pic { position: relative; width: min(320px, 70vw); aspect-ratio: 1400/950; border-radius: 12px; overflow: hidden; transform: rotate(-4deg); box-shadow: var(--shadow-lg); filter: grayscale(.5); }
        .nf__pic svg { width: 100%; height: 100%; }
        .nf__pic span { position: absolute; inset: 0; display: grid; place-items: center; font-family: var(--f-serif); font-size: 6rem; color: #fff; font-style: italic; }
      `}</style>
    </section>
  );
}
