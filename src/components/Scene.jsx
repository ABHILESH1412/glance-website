import { createUniqueId } from 'solid-js';

// The same folder of pictures the app's screenshots use: a sky, a sun and
// three ridges, at four times of day. Drawn at 1400 × 950, the picture's size.
export const W = 1400;
export const H = 950;

export const scenes = [
  { name: 'scene0.png', sky: ['#2c85b9', '#7fa09e', '#e0b47e'], sun: '#fff5d8', m: ['#383a5c', '#282a47', '#1a1c31'], sunAt: [1021, 190] },
  { name: 'scene1.png', sky: ['#2f3a94', '#8a6fb0', '#eaa3a0'], sun: '#fff0e8', m: ['#3d3363', '#2c2550', '#1c1836'], sunAt: [1080, 150] },
  { name: 'scene2.png', sky: ['#1c7e9a', '#5ea7a8', '#c9d4a8'], sun: '#fffbe6', m: ['#2e4760', '#22364c', '#152536'], sunAt: [980, 170], flip: true },
  { name: 'scene3.png', sky: ['#48607a', '#7f9791', '#b7c79a'], sun: '#fdf8e4', m: ['#37465a', '#293747', '#1b2633'], sunAt: [1110, 200] },
];

const ridges = [
  'M0 880 L112 551 L269 634 L439 600 L629 708 L730 642 L859 719 L958 618 L1155 578 L1268 674 L1400 705 L1400 950 L0 950 Z',
  'M0 915 L146 696 L332 706 L505 822 L673 857 L870 728 L966 846 L1060 815 L1184 712 L1275 665 L1400 761 L1400 950 L0 950 Z',
  'M0 950 L149 824 L343 925 L670 900 L775 950 L998 950 L1146 807 L1400 940 L1400 950 Z',
];

/**
 * props: index, class, preserve ('xMidYMid meet' | 'none' ...), viewBox, children (extra SVG on top), ref
 */
export default function Scene(props) {
  const id = createUniqueId();
  const s = () => scenes[props.index % scenes.length];
  return (
    <svg
      ref={props.ref}
      class={props.class}
      viewBox={props.viewBox ?? `0 0 ${W} ${H}`}
      preserveAspectRatio={props.preserve ?? 'xMidYMid meet'}
      width={props.width}
      height={props.height}
      xmlns="http://www.w3.org/2000/svg"
      role={props.label ? 'img' : undefined}
      aria-label={props.label}
      aria-hidden={props.label ? undefined : 'true'}
      style={props.style}
      onPointerDown={props.onPointerDown}
    >
      <defs>
        <linearGradient id={`sky${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color={s().sky[0]} />
          <stop offset="0.55" stop-color={s().sky[1]} />
          <stop offset="1" stop-color={s().sky[2]} />
        </linearGradient>
        {props.defs}
      </defs>
      <g filter={props.filter}>
        <rect width={W} height={H} fill={`url(#sky${id})`} />
        <g transform={s().flip ? `translate(${W} 0) scale(-1 1)` : undefined}>
          <circle cx={s().sunAt[0]} cy={s().sunAt[1]} r="96" fill={s().sun} />
          <path d={ridges[0]} fill={s().m[0]} />
          <path d={ridges[1]} fill={s().m[1]} />
          <path d={ridges[2]} fill={s().m[2]} />
        </g>
      </g>
      {props.children}
    </svg>
  );
}
