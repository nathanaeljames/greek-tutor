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

let stop = null;

export function trackVisualViewport() {
  if (typeof window === 'undefined' || stop) return stop;
  const vv = window.visualViewport || null;
  const apply = () => {
    const height = vv ? vv.height : window.innerHeight;
    if (height > 0) {
      document.documentElement.style.setProperty('--modal-vh', `${Math.round(height)}px`);
    }
  };
  apply();
  // resize covers rotation, toolbar show/hide and the software keyboard.
  // `scroll` is deliberately NOT bound: it fires on every frame of a scroll and
  // the height does not change during one.
  if (vv) vv.addEventListener('resize', apply);
  window.addEventListener('resize', apply);
  window.addEventListener('orientationchange', apply);
  stop = () => {
    if (vv) vv.removeEventListener('resize', apply);
    window.removeEventListener('resize', apply);
    window.removeEventListener('orientationchange', apply);
    stop = null;
  };
  return stop;
}
