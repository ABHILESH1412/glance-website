// Callbacks waiting for the page transition to lift. On first load there is
// no transition, so they run straight away.
let covered = false;
let queue = [];

export function whenRevealed(fn) {
  if (covered) queue.push(fn);
  else fn();
}

export function markCovered() {
  covered = true;
}

export function markRevealed() {
  covered = false;
  const q = queue;
  queue = [];
  q.forEach((fn) => fn());
}
