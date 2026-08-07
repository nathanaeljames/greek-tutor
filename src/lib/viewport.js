// THE HEIGHT THE USER CAN ACTUALLY SEE.
//
// Three rounds of modal fixes have now failed on the same thing: CSS viewport
// units do not describe an iPhone. `100vh` is the LARGEST viewport (browser
// chrome hidden) and overestimates by the height of the toolbars; `100dvh`
// tracks the current state but a `position: fixed` element is laid out against
// the layout viewport, which is not the same rectangle as the one the user is
// looking at. A modal sized from either can be taller than the screen while
// every measurement in a desktop browser says it fits — which is exactly what
// shipped twice.
//
// `visualViewport` is the one API that reports the real thing: the rectangle
// actually on screen, toolbars and keyboard excluded. This publishes it as
// `--modal-vh` on the document element, where CSS can use it directly.
//
// The CSS fallback chain, when this never runs or the API is missing, is in
// app.css: `100svh` (the SMALL viewport — the height with chrome fully shown,
// so it can only ever be too short, never too tall) and `100vh` behind it.
// Erring short is a modal with a little air around it; erring tall is a close
// button under the toolbar.

// AND THE APP'S OWN CHROME. The viewport height alone was still not enough:
// the app draws a fixed top bar and a fixed bottom tab bar, and a modal sized
// to the whole viewport is free to sit UNDERNEATH them. Measured at 390x844
// with the chapter-5 Hint open: bars at 0-56 and 790-844, modal at 20-824 —
// its title behind the top bar and its Close button behind the tab bar, which
// is exactly what Nathanael photographed.
//
// So `--chrome-top` and `--chrome-bottom` publish how much of the screen the
// bars are eating, measured from the elements themselves rather than assumed.
// This is his own suggestion — "can you not do 100vh minus the width of the
// top and bottom bars to get the true viewport size" — done from the live
// rects, so it stays right when a bar is absent (the table of contents has no
// tab bar) or a different height (a wrapped title).

let stop = null;

export function trackVisualViewport() {
  if (typeof window === 'undefined' || stop) return stop;
  const vv = window.visualViewport || null;
  const root = document.documentElement;

  const apply = () => {
    const height = vv ? vv.height : window.innerHeight;
    if (height > 0) root.style.setProperty('--modal-vh', `${Math.round(height)}px`);

    // Both bars are in the same client-coordinate space a position:fixed
    // overlay uses, so their rects ARE the answer, with no arithmetic.
    const top = document.querySelector('.topbar');
    const bottom = document.querySelector('.bottom-bar');
    const topEats = top ? Math.max(0, Math.round(top.getBoundingClientRect().bottom)) : 0;
    const bottomEats = bottom
      ? Math.max(0, Math.round(height - bottom.getBoundingClientRect().top))
      : 0;
    root.style.setProperty('--chrome-top', `${topEats}px`);
    root.style.setProperty('--chrome-bottom', `${bottomEats}px`);
  };

  // Coalesced to one measurement per frame: the mutation observer below fires
  // on ordinary Svelte re-renders and the work must stay free.
  let queued = 0;
  const schedule = () => {
    if (queued) return;
    queued = requestAnimationFrame(() => { queued = 0; apply(); });
  };

  apply();
  // resize covers rotation, toolbar show/hide and the software keyboard.
  // `scroll` is deliberately NOT bound: it fires on every frame of a scroll
  // and the height does not change during one.
  if (vv) vv.addEventListener('resize', schedule);
  window.addEventListener('resize', schedule);
  window.addEventListener('orientationchange', schedule);
  // The bars mount and unmount with the route (no tab bar on the TOC), and a
  // modal can open at any point after that, so the measurement has to follow
  // the DOM rather than only the window.
  const observer = typeof MutationObserver === 'undefined'
    ? null
    : new MutationObserver(schedule);
  if (observer) observer.observe(document.body, { childList: true, subtree: true });

  stop = () => {
    if (queued) cancelAnimationFrame(queued);
    if (vv) vv.removeEventListener('resize', schedule);
    window.removeEventListener('resize', schedule);
    window.removeEventListener('orientationchange', schedule);
    if (observer) observer.disconnect();
    stop = null;
  };
  return stop;
}
