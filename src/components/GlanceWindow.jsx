import { For, Show, createSignal, onCleanup, onMount } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { gsap } from '../lib/motion';
import Scene, { W, H, scenes } from './Scene';
import Icon from './Icon';
import './glance-window.css';

const MAX_SCALE = 32;
const PAD = 14;

// A working copy of the Glance window: the scroll wheel zooms around the
// pointer, dragging pans, arrow keys walk the folder, [ and ] turn the view.
export default function GlanceWindow() {
  const navigate = useNavigate();
  const [items, setItems] = createSignal([0, 1, 2, 3]);
  const [pos, setPos] = createSignal(0);
  const [active, setActive] = createSignal(false);
  const [zoom, setZoom] = createSignal(100);
  const [toast, setToast] = createSignal(null);

  const view = { s: 1, cx: 0, cy: 0, rot: 0 };
  let fitted = true;
  let root, stage, slide, frame, toastTimer;
  const pointers = new Map();
  let pinch = null;

  const current = () => scenes[items()[pos()]];
  const stageSize = () => ({ w: stage.clientWidth, h: stage.clientHeight });
  const box = (rot = view.rot) => (Math.round(rot / 90) % 2 ? [H, W] : [W, H]);

  function apply() {
    frame.style.transform = `translate(${view.cx - W / 2}px, ${view.cy - H / 2}px) scale(${view.s}) rotate(${view.rot}deg)`;
    setZoom(Math.round(view.s * 100));
  }

  function fitFor(rot = view.rot) {
    const { w, h } = stageSize();
    const [bw, bh] = box(rot);
    const s = Math.min((w - PAD * 2) / bw, (h - PAD * 2) / bh);
    return { s, cx: w / 2, cy: h / 2 };
  }
  const minScale = () => fitFor().s * 0.5;

  // Keep the picture on screen: centred when it is smaller than the stage,
  // edges pinned to the stage when it is larger.
  function clamp(v) {
    const { w, h } = stageSize();
    const [bw, bh] = box(v.rot ?? view.rot);
    const ew = (bw * v.s) / 2;
    const eh = (bh * v.s) / 2;
    v.cx = ew * 2 <= w ? w / 2 : Math.min(ew, Math.max(w - ew, v.cx));
    v.cy = eh * 2 <= h ? h / 2 : Math.min(eh, Math.max(h - eh, v.cy));
    return v;
  }

  function to(target, duration = 0.45) {
    gsap.killTweensOf(view);
    gsap.to(view, { ...target, duration, ease: 'power3.out', onUpdate: apply });
  }

  function fit(animate = true) {
    fitted = true;
    const t = fitFor();
    if (animate) to(t);
    else {
      Object.assign(view, t);
      apply();
    }
  }

  function zoomAt(factor, px, py, animate = false) {
    const s = Math.min(MAX_SCALE, Math.max(minScale(), view.s * factor));
    const k = s / view.s;
    const t = clamp({ s, cx: px - (px - view.cx) * k, cy: py - (py - view.cy) * k });
    fitted = false;
    if (animate) to(t, 0.35);
    else {
      gsap.killTweensOf(view);
      Object.assign(view, t);
      apply();
    }
  }

  function zoomTo(scale, px, py) {
    const { w, h } = stageSize();
    zoomAt(scale / view.s, px ?? w / 2, py ?? h / 2, true);
  }

  function rotate(dir) {
    const rot = view.rot + dir * 90;
    if (fitted) to({ rot, ...fitFor(rot) }, 0.55);
    else to(clamp({ rot, s: view.s, cx: view.cx, cy: view.cy }), 0.55);
  }

  // ---------------------------------------------------------------- browsing
  function show(next, dir) {
    if (next === pos()) return;
    gsap.killTweensOf(slide);
    gsap
      .timeline()
      .to(slide, { opacity: 0, x: -dir * 28, duration: 0.16, ease: 'power2.in' })
      .add(() => {
        setPos(next);
        view.rot = 0;
        fit(false);
      })
      .fromTo(slide, { opacity: 0, x: dir * 28 }, { opacity: 1, x: 0, duration: 0.4, ease: 'power3.out' });
  }
  const step = (d) => {
    const n = items().length;
    show((pos() + d + n) % n, d);
  };

  function remove() {
    if (items().length <= 1) return;
    const at = pos();
    const scene = items()[at];
    gsap
      .timeline()
      .to(slide, { opacity: 0, y: 36, scale: 0.94, duration: 0.3, ease: 'power2.in' })
      .add(() => {
        const next = items().filter((_, i) => i !== at);
        setItems(next);
        setPos(Math.min(at, next.length - 1));
        view.rot = 0;
        fit(false);
        setToast({ name: scenes[scene].name, scene, at });
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => setToast(null), 5000);
      })
      .fromTo(slide, { opacity: 0, y: 0, scale: 0.98 }, { opacity: 1, scale: 1, duration: 0.35 });
  }

  function undo() {
    const t = toast();
    if (!t) return;
    const next = [...items()];
    next.splice(t.at, 0, t.scene);
    setItems(next);
    setToast(null);
    const from = pos();
    setPos(t.at);
    fit(false);
    gsap.fromTo(slide, { opacity: 0, x: (t.at >= from ? 1 : -1) * 28 }, { opacity: 1, x: 0, duration: 0.4 });
  }

  // ---------------------------------------------------------------- input
  function onWheel(e) {
    if (!active()) return;
    e.preventDefault();
    const r = stage.getBoundingClientRect();
    const unit = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? r.height : 1;
    // A pinch on a touchpad arrives as a wheel event with ctrl held.
    const factor = Math.exp(-e.deltaY * unit * (e.ctrlKey ? 0.012 : 0.0022));
    zoomAt(factor, e.clientX - r.left, e.clientY - r.top);
  }

  function onPointerDown(e) {
    if (e.button !== 0) return;
    if (!active()) {
      setActive(true);
      root.focus({ preventScroll: true });
    }
    stage.setPointerCapture(e.pointerId);
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    gsap.killTweensOf(view);
    if (pointers.size === 2) {
      const [a, b] = [...pointers.values()];
      pinch = { d: Math.hypot(a.x - b.x, a.y - b.y), mx: (a.x + b.x) / 2, my: (a.y + b.y) / 2 };
    }
  }

  function onPointerMove(e) {
    const prev = pointers.get(e.pointerId);
    if (!prev) return;
    const next = { x: e.clientX, y: e.clientY };
    pointers.set(e.pointerId, next);
    if (pointers.size === 1) {
      fitted = false;
      Object.assign(view, clamp({ s: view.s, cx: view.cx + next.x - prev.x, cy: view.cy + next.y - prev.y }));
      apply();
    } else if (pointers.size === 2 && pinch) {
      const [a, b] = [...pointers.values()];
      const d = Math.hypot(a.x - b.x, a.y - b.y);
      const mx = (a.x + b.x) / 2;
      const my = (a.y + b.y) / 2;
      const r = stage.getBoundingClientRect();
      view.cx += mx - pinch.mx;
      view.cy += my - pinch.my;
      zoomAt(d / pinch.d, mx - r.left, my - r.top);
      pinch = { d, mx, my };
    }
  }

  function onPointerUp(e) {
    pointers.delete(e.pointerId);
    if (pointers.size < 2) pinch = null;
  }

  function onDblClick(e) {
    const r = stage.getBoundingClientRect();
    if (fitted || Math.abs(view.s - fitFor().s) < 0.01) zoomTo(1, e.clientX - r.left, e.clientY - r.top);
    else fit();
  }

  function onKeyDown(e) {
    if (e.target.closest('button') && (e.key === ' ' || e.key === 'Enter')) return;
    const handled = {
      ArrowLeft: () => step(-1),
      ArrowRight: () => step(1),
      ' ': () => step(1),
      '+': () => zoomTo(view.s * 1.4),
      '=': () => zoomTo(view.s * 1.4),
      '-': () => zoomTo(view.s / 1.4),
      0: () => fit(),
      1: () => zoomTo(1),
      '[': () => rotate(-1),
      ']': () => rotate(1),
      Delete: () => remove(),
      Escape: () => {
        setActive(false);
        root.blur();
      },
    }[e.key];
    if (handled && !e.ctrlKey && !e.metaKey && !e.altKey) {
      e.preventDefault();
      setActive(true);
      handled();
    }
  }

  function fullscreen() {
    if (document.fullscreenElement) document.exitFullscreen();
    else root.requestFullscreen?.().catch(() => {});
  }

  onMount(() => {
    fit(false);
    stage.addEventListener('wheel', onWheel, { passive: false });
    const ro = new ResizeObserver(() => {
      if (fitted) fit(false);
      else {
        Object.assign(view, clamp({ s: view.s, cx: view.cx, cy: view.cy }));
        apply();
      }
    });
    ro.observe(stage);
    onCleanup(() => {
      ro.disconnect();
      stage.removeEventListener('wheel', onWheel);
      clearTimeout(toastTimer);
      gsap.killTweensOf(view);
    });
  });

  return (
    <div
      class="gw"
      classList={{ 'is-active': active() }}
      ref={root}
      tabIndex={0}
      role="application"
      aria-roledescription="image viewer demo"
      aria-label="Glance window. Arrow keys browse, plus and minus zoom, 0 fits, 1 is 100%, brackets rotate, Escape leaves."
      onKeyDown={onKeyDown}
      onFocusOut={(e) => {
        if (!root.contains(e.relatedTarget)) setActive(false);
      }}
    >
      <div class="gw__head">
        <span class="gw__ib" aria-hidden="true">
          <Icon name="folder" size={17} />
        </span>
        <div class="gw__title">
          <strong>{current().name}</strong>
          <span>
            PNG · {W} × {H} · <span class="gw__zoom">{zoom()}%</span>
          </span>
        </div>
        <div class="gw__acts">
          <span class="gw__ib gw__hide-sm" aria-hidden="true">
            <Icon name="copy" size={16} />
          </span>
          <button class="gw__ib" type="button" onClick={fullscreen} title="Fullscreen" aria-label="Fullscreen">
            <Icon name="expand" size={16} />
          </button>
          <button class="gw__ib" type="button" onClick={() => rotate(1)} title="Turn the view ( ] )" aria-label="Rotate view">
            <Icon name="rotate-cw" size={16} />
          </button>
          <span class="gw__ib gw__hide-sm" aria-hidden="true">
            <Icon name="menu" size={16} />
          </span>
          <span class="gw__close" aria-hidden="true">
            <Icon name="x" size={12} stroke={2.4} />
          </span>
        </div>
      </div>

      <div class="gw__tools">
        <button type="button" class="gw__pill gw__pill--edit" onClick={() => navigate('/features#editor')}>
          <Icon name="pencil" size={15} /> Edit
        </button>
        <button type="button" class="gw__pill gw__pill--del" onClick={remove} disabled={items().length <= 1}>
          <Icon name="trash" size={15} /> Delete
        </button>
      </div>

      <div
        class="gw__stage"
        ref={stage}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onDblClick={onDblClick}
      >
        <div class="gw__slide" ref={slide}>
          <div class="gw__frame" ref={frame} style={{ width: `${W}px`, height: `${H}px` }}>
            <Scene index={items()[pos()]} label={current().name} />
          </div>
        </div>
        <div class="gw__hint" aria-hidden="true">
          <Show when={!active()} fallback={<span>Scroll to zoom · drag to pan · Esc to let go</span>}>
            <span>
              <b>Click to try it</b> — it's the real interaction
            </span>
          </Show>
        </div>
      </div>

      <div class="gw__foot">
        <button type="button" class="gw__nav" onClick={() => step(-1)} aria-label="Previous image">
          <Icon name="chev-l" size={20} />
        </button>
        <div class="gw__browse">
          <div class="gw__count">
            {pos() + 1}/{items().length}
          </div>
          <div class="gw__strip">
            <For each={items()}>
              {(scene, i) => (
                <button
                  type="button"
                  class="gw__thumb"
                  classList={{ 'is-current': i() === pos() }}
                  aria-label={scenes[scene].name}
                  aria-current={i() === pos() ? 'true' : undefined}
                  onClick={() => show(i(), i() > pos() ? 1 : -1)}
                >
                  <Scene index={scene} preserve="xMidYMid slice" />
                </button>
              )}
            </For>
          </div>
        </div>
        <button type="button" class="gw__nav" onClick={() => step(1)} aria-label="Next image">
          <Icon name="chev-r" size={20} />
        </button>
      </div>

      <Show when={toast()}>
        <div class="gw__toast" role="status">
          <span>“{toast().name}” moved to Bin</span>
          <button type="button" onClick={undo}>
            Undo
          </button>
        </div>
      </Show>
    </div>
  );
}
