import { For, createEffect, onMount } from 'solid-js';
import { pref, setPref } from '../lib/theme';
import Icon from './Icon';

const options = [
  { value: 'light', icon: 'sun', label: 'Light' },
  { value: 'system', icon: 'monitor', label: 'Match system' },
  { value: 'dark', icon: 'moon', label: 'Dark' },
];

export default function ThemeSwitch() {
  let group, thumb;

  const place = () => {
    const el = group?.querySelector('[aria-checked="true"]');
    if (!el) return;
    thumb.style.left = `${el.offsetLeft}px`;
    thumb.style.width = `${el.offsetWidth}px`;
  };
  onMount(place);
  createEffect(() => {
    pref();
    queueMicrotask(place);
  });

  return (
    <div class="theme" role="radiogroup" aria-label="Colour scheme" ref={group}>
      <span class="theme__thumb" ref={thumb} aria-hidden="true" />
      <For each={options}>
        {(o) => (
          <button
            type="button"
            role="radio"
            aria-checked={pref() === o.value}
            aria-label={o.label}
            title={o.label}
            onClick={(e) => {
              const r = e.currentTarget.getBoundingClientRect();
              setPref(o.value, { x: r.left + r.width / 2, y: r.top + r.height / 2 });
            }}
          >
            <Icon name={o.icon} size={16} />
          </button>
        )}
      </For>
    </div>
  );
}
