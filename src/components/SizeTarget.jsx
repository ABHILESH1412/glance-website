import { For, Show, createSignal, onCleanup, onMount } from 'solid-js';
import { gsap, reducedMotion } from '../lib/motion';
import { KB, MB, addGrain, describe, fitToSize, saveBlob, svgToCanvas } from '../lib/fitsize';
import Scene, { W, H } from './Scene';
import Icon from './Icon';
import './size-target.css';

const presets = [
  { label: 'Under 150 KB', value: 150, unit: 'KB', type: 'image/jpeg', hint: 'a portal that caps uploads' },
  { label: 'Under 400 KB', value: 400, unit: 'KB', type: 'image/jpeg', hint: 'an email that has to go through' },
  { label: 'Under 6 KB', value: 6, unit: 'KB', type: 'image/jpeg', hint: 'too small for quality alone' },
  { label: 'At least 3 MB', value: 3, unit: 'MB', type: 'image/jpeg', hint: 'a form that demands a minimum' },
];

const pause = (ms) => new Promise((r) => setTimeout(r, reducedMotion() ? 0 : ms));

export default function SizeTarget() {
  const [value, setValue] = createSignal(400);
  const [unit, setUnit] = createSignal('KB');
  const [type, setType] = createSignal('image/jpeg');
  const [running, setRunning] = createSignal(false);
  const [steps, setSteps] = createSignal([]);
  const [range, setRange] = createSignal(null);
  const [result, setResult] = createSignal(null);
  const [error, setError] = createSignal('');
  const [sourceSize, setSourceSize] = createSignal(null);
  const [preview, setPreview] = createSignal('');

  let svg, source, logEl, resultEl;

  const wanted = () => Math.round(Number(value()) * (unit() === 'MB' ? MB : KB));
  const ext = () => (type() === 'image/jpeg' ? 'jpg' : 'png');

  async function getSource() {
    if (!source) {
      source = addGrain(await svgToCanvas(svg, W, H), 22);
      const png = await new Promise((r) => source.toBlob(r, 'image/png'));
      setSourceSize(png.size);
    }
    return source;
  }

  onMount(() => {
    // Measure the source quietly once the page has settled.
    const idle = window.requestIdleCallback || ((f) => setTimeout(f, 600));
    idle(() => getSource().catch(() => {}));
  });
  onCleanup(() => preview() && URL.revokeObjectURL(preview()));

  async function run() {
    if (running()) return;
    setRunning(true);
    setError('');
    setResult(null);
    setSteps([]);
    setRange({ low: 15, high: 100 });
    try {
      const canvas = await getSource();
      const fit = await fitToSize(canvas, type(), wanted(), async (s) => {
        setSteps((prev) => [...prev, s]);
        if (s.kind === 'probe' && s.low != null) {
          setRange({ low: s.fits ? Math.max(s.low, s.quality + 1) : s.low, high: s.fits ? s.high : s.quality - 1, q: s.quality });
        }
        if (s.kind === 'shrink') setRange({ low: 15, high: 100 });
        logEl && (logEl.scrollTop = logEl.scrollHeight);
        await pause(s.kind === 'probe' ? 260 : 420);
      });
      if (preview()) URL.revokeObjectURL(preview());
      setPreview(URL.createObjectURL(fit.blob));
      setResult(fit);
      if (resultEl && !reducedMotion()) gsap.fromTo(resultEl, { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6 });
    } catch (e) {
      setError(e.message || String(e));
    } finally {
      setRunning(false);
    }
  }

  function usePreset(p) {
    setValue(p.value);
    setUnit(p.unit);
    setType(p.type);
    run();
  }

  const pct = (q) => ((q - 15) / 85) * 100;

  return (
    <div class="st">
      <div class="st__source">
        <div class="st__pic">
          <Scene index={2} ref={svg} preserve="xMidYMid slice" />
          <Show when={result() && preview()}>
            <img class="st__out" src={preview()} alt="The encoded result" />
          </Show>
          <span class="st__tag">{result() ? 'Result' : 'Source'}</span>
        </div>
        <dl class="st__meta">
          <div>
            <dt>File</dt>
            <dd>scene2.png</dd>
          </div>
          <div>
            <dt>Pixels</dt>
            <dd>
              {W} × {H}
            </dd>
          </div>
          <div>
            <dt>On disk</dt>
            <dd>{sourceSize() ? describe(sourceSize()) : '…'}</dd>
          </div>
        </dl>
        <p class="st__note faint">Film grain added so it compresses like a photograph. Encoded by your browser, not simulated.</p>
      </div>

      <div class="st__panel">
        <form
          class="st__form"
          onSubmit={(e) => {
            e.preventDefault();
            run();
          }}
        >
          <label class="st__label" for="st-size">
            Aim for
          </label>
          <div class="st__row">
            <input
              id="st-size"
              class="field st__num"
              type="number"
              min="1"
              step="any"
              inputmode="decimal"
              value={value()}
              onInput={(e) => setValue(e.currentTarget.value)}
            />
            <select class="field" aria-label="Unit" value={unit()} onChange={(e) => setUnit(e.currentTarget.value)}>
              <option>KB</option>
              <option>MB</option>
            </select>
            <div class="seg" role="group" aria-label="Format">
              <For each={['image/jpeg', 'image/png']}>
                {(t) => (
                  <button type="button" aria-pressed={type() === t} onClick={() => setType(t)}>
                    {t === 'image/jpeg' ? 'JPEG' : 'PNG'}
                  </button>
                )}
              </For>
            </div>
            <button class="btn btn--primary st__go" type="submit" disabled={running()}>
              {running() ? 'Searching…' : 'Hit it'}
            </button>
          </div>
          <div class="st__presets">
            <For each={presets}>
              {(p) => (
                <button type="button" class="st__chip" onClick={() => usePreset(p)} disabled={running()} title={p.hint}>
                  {p.label}
                </button>
              )}
            </For>
          </div>
        </form>

        <div class="st__ruler" aria-hidden="true">
          <div class="st__track">
            <Show when={range()}>
              <div
                class="st__window"
                style={{ left: `${pct(Math.min(range().low, 100))}%`, width: `${Math.max(0, pct(range().high) - pct(range().low))}%` }}
              />
            </Show>
            <For each={steps().filter((s) => s.kind === 'probe' && s.quality != null)}>
              {(s) => (
                <span class="st__probe" classList={{ 'is-fit': s.fits }} style={{ left: `${pct(s.quality)}%` }}>
                  <i />
                  <em>{s.quality}</em>
                </span>
              )}
            </For>
          </div>
          <div class="st__scale">
            <span>quality 15</span>
            <span>100</span>
          </div>
        </div>

        <ol class="st__log" ref={logEl} aria-live="polite">
          <Show when={!steps().length && !error()}>
            <li class="faint">Pick a target. Each line below is a real encode.</li>
          </Show>
          <For each={steps()}>
            {(s) => (
              <li class="st__line" classList={{ 'is-fit': s.fits, 'is-note': s.kind !== 'probe' }}>
                <Show when={s.kind === 'probe'}>
                  <span class="st__k">{s.quality != null ? `q ${String(s.quality).padStart(3, ' ')}` : 'lossless'}</span>
                  <span class="st__v">{describe(s.size)}</span>
                  <span class="st__s">{s.fits ? 'fits' : 'over'}</span>
                </Show>
                <Show when={s.kind === 'shrink'}>
                  <span class="st__k">shrink</span>
                  <span class="st__v">
                    {s.width} × {s.height}
                  </span>
                  <span class="st__s">even q 15 was too big</span>
                </Show>
                <Show when={s.kind === 'pad'}>
                  <span class="st__k">pad</span>
                  <span class="st__v">+{describe(s.padding)}</span>
                  <span class="st__s">{s.type === 'image/jpeg' ? 'JPEG comment' : 'PNG text chunk'}</span>
                </Show>
              </li>
            )}
          </For>
          <Show when={error()}>
            <li class="st__err">{error()}</li>
          </Show>
        </ol>

        <div class="st__result" ref={resultEl}>
          <Show when={result()} fallback={<p class="faint st__idle">The result, and the file itself, show up here.</p>}>
            {(r) => (
              <>
                <div class="st__big">
                  <span>{describe(r().blob.size)}</span>
                  <small>
                    {r().padding ? 'at least' : 'under'} {describe(wanted())}
                  </small>
                </div>
                <p class="st__sum">
                  {r().padding
                    ? `Full quality was only ${describe(r().blob.size - r().padding)}, so ${describe(r().padding)} of filler went into a ${
                        type() === 'image/jpeg' ? 'JPEG comment' : 'PNG text chunk'
                      }. The picture is untouched and the file is still valid.`
                    : `${r().quality != null ? `Quality ${r().quality}` : 'Lossless'}${
                        r().width !== W ? `, shrunk to ${r().width} × ${r().height}` : ', full size'
                      } — the best-looking file that fits.`}
                </p>
                <button type="button" class="btn btn--sm" onClick={() => saveBlob(r().blob, `scene2-${describe(r().blob.size).replace(' ', '')}.${ext()}`)}>
                  <Icon name="download" size={16} /> Save this file
                </button>
              </>
            )}
          </Show>
        </div>
      </div>
    </div>
  );
}
