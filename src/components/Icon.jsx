// A small hand-drawn stroke set, 24×24, so no icon library ships.
const paths = {
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M4.6 4.6l1.4 1.4M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4 6 18M18 6l1.4-1.4"/>',
  moon: '<path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z"/>',
  monitor: '<rect x="3" y="4" width="18" height="12.5" rx="2"/><path d="M8.5 20h7M12 16.5V20"/>',
  github:
    '<path d="M9 19c-4.3 1.4-4.3-2.5-6-3m12 5v-3.5c0-1 .1-1.4-.5-2 2.8-.3 5.5-1.4 5.5-6a4.6 4.6 0 0 0-1.3-3.2 4.2 4.2 0 0 0-.1-3.2s-1.1-.3-3.5 1.3a12.3 12.3 0 0 0-6.2 0C6.5 2.8 5.4 3.1 5.4 3.1a4.2 4.2 0 0 0-.1 3.2A4.6 4.6 0 0 0 4 9.5c0 4.6 2.7 5.7 5.5 6-.6.6-.6 1.2-.5 2V21"/>',
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  copy: '<rect x="8.5" y="8.5" width="12" height="12" rx="2.5"/><path d="M15.5 8.5V6a2.5 2.5 0 0 0-2.5-2.5H6A2.5 2.5 0 0 0 3.5 6v7A2.5 2.5 0 0 0 6 15.5h2.5"/>',
  check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
  x: '<path d="M6 6l12 12M18 6 6 18"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  folder: '<path d="M3 7.5V6a2 2 0 0 1 2-2h4l2 2.5h6a2 2 0 0 1 2 2V9"/><path d="M3.3 19.5 5.6 11a1.5 1.5 0 0 1 1.4-1h13.4a1 1 0 0 1 1 1.3l-2.2 7.2a1.5 1.5 0 0 1-1.4 1H4.5a1.2 1.2 0 0 1-1.2-1Z"/>',
  expand: '<path d="M14 4h6v6M10 20H4v-6M20 4l-6.5 6.5M4 20l6.5-6.5"/>',
  'rotate-cw': '<path d="M20 11a8 8 0 1 0-2.3 5.7"/><path d="M20 4.5V11h-6.5"/>',
  'rotate-ccw': '<path d="M4 11a8 8 0 1 1 2.3 5.7"/><path d="M4 4.5V11h6.5"/>',
  'chev-l': '<path d="m15 5-7 7 7 7"/>',
  'chev-r': '<path d="m9 5 7 7-7 7"/>',
  'chev-d': '<path d="m6 9 6 6 6-6"/>',
  pencil: '<path d="M4 20h4L19.5 8.5a2.1 2.1 0 0 0-3-3L5 17v3Z"/><path d="m14.5 7.5 3 3"/>',
  trash: '<path d="M4 6.5h16M9.5 6.5V4.5h5v2M6.5 6.5l.9 12.3a1.5 1.5 0 0 0 1.5 1.4h6.2a1.5 1.5 0 0 0 1.5-1.4l.9-12.3M10 10.5v6M14 10.5v6"/>',
  undo: '<path d="M9 14 4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11"/>',
  redo: '<path d="m15 14 5-5-5-5"/><path d="M20 9H9.5a5.5 5.5 0 0 0 0 11H13"/>',
  crop: '<path d="M6 2.5V16a2 2 0 0 0 2 2h13.5"/><path d="M2.5 6H16a2 2 0 0 1 2 2v13.5"/>',
  resize: '<path d="M15 3.5h5.5V9M9 20.5H3.5V15M20.5 3.5 14 10M3.5 20.5 10 14"/>',
  adjust: '<circle cx="12" cy="12" r="3.5"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6 7 7M17 17l1.4 1.4M5.6 18.4 7 17M17 7l1.4-1.4"/>',
  brush: '<path d="M14.5 4.5 19.5 9.5 11 18l-5-5Z"/><path d="M6 13c-2 0-3 1.5-3 3.5V20h3.5C8.5 20 10 19 10 17"/>',
  text: '<path d="M5 6V4.5h14V6M12 4.5v15M9 19.5h6"/>',
  export: '<path d="M12 15V3.5M7.5 8 12 3.5 16.5 8"/><path d="M4.5 13v4.5a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V13"/>',
  'flip-h': '<path d="M12 3v18"/><path d="M8.5 7 3.5 17h5Z"/><path d="M15.5 7l5 10h-5Z"/>',
  'flip-v': '<path d="M3 12h18"/><path d="M7 8.5 17 3.5v5Z"/><path d="M7 15.5l10 5v-5Z"/>',
  pen: '<path d="M4 20c3-1 4-5 7-8s6-4 8-6"/><circle cx="19" cy="6" r="1.2"/>',
  highlighter: '<path d="m9 15-3 3v2h6l2-2"/><path d="m8.5 13.5 7-9 5 5-9 7Z"/>',
  line: '<path d="M5 19 19 5"/>',
  'arrow-tool': '<path d="M5 19 19 5M10 5h9v9"/>',
  rect: '<rect x="4" y="6" width="16" height="12" rx="1.5"/>',
  ellipse: '<ellipse cx="12" cy="12" rx="8.5" ry="6"/>',
  lock: '<rect x="5" y="10.5" width="14" height="10" rx="2"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5"/>',
  unlock: '<rect x="5" y="10.5" width="14" height="10" rx="2"/><path d="M8 10.5V8a4 4 0 0 1 7.7-1.5"/>',
  download: '<path d="M12 3.5V15M7.5 10.5 12 15l4.5-4.5"/><path d="M4.5 16v1.5a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V16"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  minus: '<path d="M5 12h14"/>',
  terminal: '<rect x="3" y="4.5" width="18" height="15" rx="2.5"/><path d="m7 9.5 3 2.5-3 2.5M12.5 15H17"/>',
  box: '<path d="M12 3 20 7.5v9L12 21l-8-4.5v-9Z"/><path d="M4 7.5 12 12l8-4.5M12 12v9"/>',
  shield: '<path d="M12 3 19.5 6v5.5c0 4.5-3.2 8-7.5 9.5-4.3-1.5-7.5-5-7.5-9.5V6Z"/><path d="m9 12 2.2 2.2L15.5 10"/>',
  gpu: '<rect x="4" y="4" width="16" height="16" rx="2.5"/><rect x="8.5" y="8.5" width="7" height="7" rx="1"/><path d="M9 1.5V4M15 1.5V4M9 20v2.5M15 20v2.5M1.5 9H4M1.5 15H4M20 9h2.5M20 15h2.5"/>',
  palette: '<path d="M12 3.5a8.5 8.5 0 0 0 0 17c1.2 0 1.8-.8 1.8-1.7 0-1.1-.9-1.5-.9-2.6 0-1 .8-1.7 1.8-1.7h2.2A3.6 3.6 0 0 0 20.5 11 8 8 0 0 0 12 3.5Z"/><circle cx="7.5" cy="11" r="1"/><circle cx="10.5" cy="7.5" r="1"/><circle cx="15" cy="8" r="1"/>',
  sidebar: '<rect x="3" y="4" width="18" height="16" rx="2.5"/><path d="M9 4v16"/>',
  search: '<circle cx="11" cy="11" r="6.5"/><path d="m20 20-4.2-4.2"/>',
  note: '<path d="M5 4h14v11l-5 5H5Z"/><path d="M14 20v-5h5"/>',
  pages: '<path d="M8 3.5h8.5L20 7v11.5a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2v-13a2 2 0 0 1 2-2Z"/><path d="M16 3.5V7h4"/><path d="M4 7.5v12a2 2 0 0 0 2 2h9"/>',
  redact: '<rect x="3.5" y="9" width="17" height="6" rx="1" fill="currentColor"/><path d="M4 5h9M4 19h12"/>',
  scan: '<path d="M4 8V5.5A1.5 1.5 0 0 1 5.5 4H8M16 4h2.5A1.5 1.5 0 0 1 20 5.5V8M20 16v2.5a1.5 1.5 0 0 1-1.5 1.5H16M8 20H5.5A1.5 1.5 0 0 1 4 18.5V16"/><path d="M8 10h8M8 14h5"/>',
  printer: '<path d="M7 8V3.5h10V8"/><rect x="3.5" y="8" width="17" height="8.5" rx="2"/><path d="M7 13.5h10V20.5H7Z"/>',
  signature: '<path d="M3 17c2-6 4-9 6-9 3 0-1 9 2 9 2 0 3-4 5-4 1.5 0 1 3 3 3"/><path d="M3 20.5h18"/>',
  gear: '<circle cx="12" cy="12" r="3"/><path d="M12 2.5v2.2M12 19.3v2.2M4.6 4.6l1.6 1.6M17.8 17.8l1.6 1.6M2.5 12h2.2M19.3 12h2.2M4.6 19.4l1.6-1.6M17.8 6.2l1.6-1.6"/>',
  sliders: '<path d="M4 7h10M18 7h2M4 17h4M12 17h8"/><circle cx="16" cy="7" r="2"/><circle cx="10" cy="17" r="2"/>',
  keyboard: '<rect x="2.5" y="6" width="19" height="12" rx="2"/><path d="M6.5 10h.01M10 10h.01M14 10h.01M17.5 10h.01M7.5 14h9"/>',
};

export default function Icon(props) {
  return (
    <svg
      class={props.class}
      width={props.size ?? 20}
      height={props.size ?? 20}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width={props.stroke ?? 1.75}
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
      innerHTML={paths[props.name] || ''}
    />
  );
}
