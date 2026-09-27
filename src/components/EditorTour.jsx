import { For, Match, Switch, createEffect, createSignal, on, onCleanup } from 'solid-js';
import { gsap, reducedMotion } from '../lib/motion';
import Scene, { W, H } from './Scene';
import Icon from './Icon';
import './editor-tour.css';

// The edit panel from the app, one section at a time, each with a short
// animated illustration of what it does. Illustrations, not a working editor.
const sections = [
  { id: 'rotate', icon: 'rotate-cw', name: 'Rotate & Flip', text: 'Quarter turns, or any angle typed into the box. A separate header button turns the picture 90° just to look at it, without changing the file.' },
  { id: 'crop', icon: 'crop', name: 'Crop', text: 'Drag a rectangle, pull any of its eight handles, or pick an aspect preset — including the usual social sizes.' },
  { id: 'resize', icon: 'resize', name: 'Resize', text: 'Handles on the picture or numbers in the panel, kept in step, with an optional aspect lock.' },
  { id: 'adjust', icon: 'adjust', name: 'Adjust', text: 'Brightness, contrast and saturation, applied live on the GPU and baked identically on save.' },
  { id: 'draw', icon: 'brush', name: 'Draw', text: 'Pen, highlighter, line, arrow, rectangle, ellipse — with the buttons drawing their own shapes.' },
  { id: 'text', icon: 'text', name: 'Text', text: 'Font, size, colour, background, bold, italic, underline, dragged anywhere on the picture.' },
  { id: 'export', icon: 'export', name: 'Export', text: 'Any format the picture can honestly become, with a quality dial — or a file size to aim for.' },
];

export default function EditorTour() {
  const [current, setCurrent] = createSignal('crop');
  let stage, ctx;

  function play(id) {
    ctx?.revert();
    if (reducedMotion() || !stage) return;
    ctx = gsap.context(() => {
      const q = (s) => stage.querySelector(s);
      gsap.fromTo(q('.et__art'), { opacity: 0, scale: 0.97 }, { opacity: 1, scale: 1, duration: 0.5 });
      const loop = gsap.timeline({ repeat: -1, repeatDelay: 0.6, defaults: { ease: 'power3.inOut' } });
      if (id === 'rotate') {
        loop
          .to('.et__pic', { rotate: -12, duration: 1.2 })
          .to('.et__dial i', { rotate: -12 * 6, duration: 1.2 }, '<')
          .to('.et__pic', { rotate: 0, duration: 1.0 }, '+=0.5')
          .to('.et__dial i', { rotate: 0, duration: 1.0 }, '<')
          .to('.et__pic', { scaleX: -1, duration: 0.8 }, '+=0.4')
          .to('.et__pic', { scaleX: 1, duration: 0.8 }, '+=0.6');
      } else if (id === 'crop') {
        const box = q('.et__crop');
        const set = (x, y, w, h, label) => ({ left: `${x}%`, top: `${y}%`, width: `${w}%`, height: `${h}%`, duration: 1, onStart: () => (q('.et__ratio').textContent = label) });
        gsap.set(box, { left: '8%', top: '10%', width: '84%', height: '80%' });
        loop
          .to(box, set(22, 8, 46, 68, '1:1'), '+=0.4')
          .to(box, set(6, 24, 88, 50, '16:9'), '+=0.6')
          .to(box, set(34, 6, 30, 88, '9:16'), '+=0.6')
          .to(box, set(8, 10, 84, 80, 'Free'), '+=0.6');
      } else if (id === 'resize') {
        const o = { w: 1400 };
        loop
          .to(q('.et__pic'), { scale: 0.62, duration: 1.2 })
          .to(o, { w: 868, duration: 1.2, onUpdate: () => (q('.et__dims').textContent = `${Math.round(o.w)} × ${Math.round((o.w * H) / W)}`) }, '<')
          .to(q('.et__pic'), { scale: 1, duration: 1.2 }, '+=0.8')
          .to(o, { w: 1400, duration: 1.2, onUpdate: () => (q('.et__dims').textContent = `${Math.round(o.w)} × ${Math.round((o.w * H) / W)}`) }, '<');
      } else if (id === 'adjust') {
        const f = { b: 1, c: 1, s: 1 };
        const apply = () => {
          q('.et__pic').style.filter = `brightness(${f.b}) contrast(${f.c}) saturate(${f.s})`;
          stage.querySelectorAll('.et__slider i').forEach((el, i) => (el.style.left = `${[f.b, f.c, f.s][i] * 50}%`));
        };
        loop
          .to(f, { s: 1.7, duration: 1.1, onUpdate: apply })
          .to(f, { b: 1.2, c: 1.25, duration: 1.1, onUpdate: apply }, '+=0.2')
          .to(f, { s: 0.25, b: 0.9, duration: 1.2, onUpdate: apply }, '+=0.4')
          .to(f, { b: 1, c: 1, s: 1, duration: 1, onUpdate: apply }, '+=0.5');
      } else if (id === 'draw') {
        const paths = stage.querySelectorAll('.et__ink path, .et__ink ellipse');
        paths.forEach((p) => {
          const len = p.getTotalLength();
          gsap.set(p, { strokeDasharray: len, strokeDashoffset: len });
        });
        loop.to(paths, { strokeDashoffset: 0, duration: 0.9, stagger: 0.55, ease: 'power2.inOut' }).to(paths, { opacity: 0, duration: 0.4 }, '+=1.6');
      } else if (id === 'text') {
        loop
          .fromTo('.et__label', { opacity: 0, x: 0, y: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: 0.5 })
          .to('.et__label', { x: 90, y: -40, duration: 1.2 }, '+=0.3')
          .to('.et__label', { x: 20, y: 30, duration: 1.2 }, '+=0.3')
          .to('.et__label', { opacity: 0, duration: 0.4 }, '+=0.8');
      } else if (id === 'export') {
        const o = { v: 1840 };
        const out = q('.et__kb');
        loop
          .to(o, { v: 498, duration: 1.8, ease: 'power2.out', onUpdate: () => (out.textContent = `${Math.round(o.v)} KB`) }, '+=0.3')
          .fromTo('.et__ok', { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: 0.4 })
          .to('.et__ok', { opacity: 0, duration: 0.3 }, '+=1.4')
          .set(o, { v: 1840 });
      }
    }, stage);
  }

  createEffect(on(current, (id) => queueMicrotask(() => play(id))));
  onCleanup(() => ctx?.revert());

  return (
    <div class="et" id="editor">
      <div class="et__panel">
        <div class="et__panel-head">
          <strong>Edit</strong>
          <div class="et__undo" aria-hidden="true">
            <span>
              <Icon name="undo" size={15} />
            </span>
            <span>
              <Icon name="redo" size={15} />
            </span>
          </div>
        </div>
        <div class="et__sections" role="tablist" aria-label="Editor sections">
          <For each={sections}>
            {(s) => (
              <div class="et__sec" classList={{ 'is-open': current() === s.id }}>
                <button type="button" role="tab" aria-selected={current() === s.id} onClick={() => setCurrent(s.id)}>
                  <Icon name={s.icon} size={16} /> {s.name}
                </button>
                <div class="et__desc">
                  <p>{s.text}</p>
                </div>
              </div>
            )}
          </For>
        </div>
        <p class="et__note">Nothing is written until you say so, and saving over the original asks first.</p>
      </div>

      <div class="et__stage" ref={stage} aria-hidden="true">
        <Switch>
          <Match when={current() === 'rotate'}>
            <div class="et__art">
              <div class="et__pic">
                <Scene index={0} />
              </div>
              <div class="et__hud">
                <div class="et__dial">
                  <i />
                </div>
                <span>angle · flip</span>
              </div>
            </div>
          </Match>
          <Match when={current() === 'crop'}>
            <div class="et__art">
              <div class="et__pic">
                <Scene index={1} />
                <div class="et__crop">
                  <For each={['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w']}>{(h) => <b class={`h-${h}`} />}</For>
                </div>
              </div>
              <div class="et__hud">
                <span class="et__ratio">Free</span>
              </div>
            </div>
          </Match>
          <Match when={current() === 'resize'}>
            <div class="et__art">
              <div class="et__pic et__pic--resize">
                <Scene index={2} />
              </div>
              <div class="et__hud">
                <Icon name="lock" size={14} />
                <span class="et__dims">1400 × 950</span>
              </div>
            </div>
          </Match>
          <Match when={current() === 'adjust'}>
            <div class="et__art">
              <div class="et__pic">
                <Scene index={0} />
              </div>
              <div class="et__hud et__hud--sliders">
                <For each={['Brightness', 'Contrast', 'Saturation']}>
                  {(n) => (
                    <div class="et__slider">
                      <span>{n}</span>
                      <div>
                        <i />
                      </div>
                    </div>
                  )}
                </For>
              </div>
            </div>
          </Match>
          <Match when={current() === 'draw'}>
            <div class="et__art">
              <div class="et__pic">
                <Scene index={3}>
                  <g class="et__ink" fill="none" stroke-linecap="round" stroke-linejoin="round">
                    <ellipse cx="1030" cy="190" rx="150" ry="130" stroke="#ff4d6d" stroke-width="12" />
                    <path d="M620 330 L880 230" stroke="#ff4d6d" stroke-width="12" />
                    <path d="M840 212 L884 228 L858 268" stroke="#ff4d6d" stroke-width="12" />
                    <path d="M140 470 C 260 430, 380 520, 520 480" stroke="#ffe14d" stroke-width="44" opacity="0.55" />
                    <path d="M180 760 q40 -60 80 0 t80 0 t80 0 t80 0" stroke="#ffffff" stroke-width="9" />
                  </g>
                </Scene>
              </div>
              <div class="et__hud et__tools">
                <For each={['pen', 'highlighter', 'line', 'arrow-tool', 'rect', 'ellipse']}>{(t) => <Icon name={t} size={16} />}</For>
              </div>
            </div>
          </Match>
          <Match when={current() === 'text'}>
            <div class="et__art">
              <div class="et__pic">
                <Scene index={1} />
                <span class="et__label">Summit, 6 a.m.</span>
              </div>
              <div class="et__hud">
                <b>B</b> <i>I</i> <u>U</u> <span class="et__swatch" />
              </div>
            </div>
          </Match>
          <Match when={current() === 'export'}>
            <div class="et__art et__art--export">
              <div class="et__pic">
                <Scene index={2} />
              </div>
              <div class="et__dialog">
                <div class="et__row">
                  <span>Format</span>
                  <strong>JPEG</strong>
                </div>
                <div class="et__row">
                  <span>Aim for</span>
                  <strong>500 KB</strong>
                </div>
                <div class="et__row et__row--big">
                  <span class="et__kb">1840 KB</span>
                  <span class="et__ok">
                    <Icon name="check" size={14} stroke={2.4} /> fits
                  </span>
                </div>
              </div>
            </div>
          </Match>
        </Switch>
      </div>
    </div>
  );
}
