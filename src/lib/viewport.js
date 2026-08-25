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

// AND THE HEIGHT GOES STALE (DISCLOSURE-SPEC3 W4, the half-screen modal bug).
//
// The symptom Nathanael reports is a modal that opens at roughly half height,
// intermittently, on a build that is already current — and killing the app and
// reopening it always fixes it. That recovery is the tell: kill-and-restart is
// nothing but a fresh measurement, so the HEIGHT is what is wrong, not the CSS
// that consumes it.
//
// Where a wrong height comes from: `--modal-vh` was published once at startup
// and re-measured ONLY on `resize` / `orientationchange`. The SOFTWARE KEYBOARD
// eats roughly half the screen and correctly shrinks `visualViewport.height`
// while it is up — the spell exercises put it up in every chapter. iOS PWAs are
// known to drop resize events on resume-from-background, so a height snapshotted
// with the keyboard up can SURVIVE a backgrounding, and every modal opened after
// the resume is sized to a keyboard that is no longer there. Half a screen,
// intermittently, cured by a restart.
//
// TWO ANSWERS, because either alone would be a guess:
//
//   1. MEASURE MORE OFTEN (W4.1). `pageshow` is the event WebKit fires when a
//      page comes back from the back/forward cache, which is the resume path
//      that drops `resize`; `visibilitychange` covers a foregrounding that does
//      not go through bfcache; `focusout` covers the keyboard going away. And a
//      modal measures BEFORE ITS FIRST PAINT through the DOM observer at the
//      foot of this file, which sees the overlay appear as a microtask — so no
//      dialog has to remember to ask, and a dialog written next year gets it.
//   2. REFUSE AN IMPLAUSIBLE HEIGHT (W4.2). Even a perfect trigger list is a
//      list of events someone BELIEVED fire; the clamp needs no such belief. A
//      published height below MIN_PLAUSIBLE_RATIO of `window.innerHeight` while
//      NOTHING EDITABLE IS FOCUSED cannot be a keyboard — a keyboard implies a
//      focused field — so it is a stale reading, `innerHeight` is used instead,
//      and a re-measure is scheduled for the next frame in case the viewport
//      was merely mid-transition.
//
// 0.6 IS THE THRESHOLD. It has to sit BELOW every legitimate short viewport and
// ABOVE the keyboard case: iOS software keyboards take 40-55% of the screen (so
// a phantom leaves 45-60%), while the browser toolbars this file already exists
// to handle take 12-20% (leaving 80-88%). Pinch-zoom shrinks the visual viewport
// too, but zooming takes a gesture and cannot happen while the app is
// backgrounded, and the next-frame re-measure restores it either way.
//
// THIS IS NOT A PROVEN FIX (W4.4). The root cause is a hypothesis with a strong
// circumstantial fit; the bug is intermittent and device-bound, so what is
// verified here is that the triggers fire and that the clamp rejects a phantom
// height. It stays a VERIFY device-soak item.
const MIN_PLAUSIBLE_RATIO = 0.6;

let stop = null;

// A keyboard implies a focused editable. This is what lets the clamp tell "the
// keyboard really is up" from "this reading is left over from when it was".
function editableFocused() {
  const el = document.activeElement;
  if (!el || el === document.body) return false;
  const tag = el.tagName;
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || el.isContentEditable === true;
}

export function trackVisualViewport() {
  if (typeof window === 'undefined' || stop) return stop;
  const vv = window.visualViewport || null;
  const root = document.documentElement;

  const apply = () => {
    const measured = vv ? vv.height : window.innerHeight;
    const innerHeight = window.innerHeight || 0;
    // W4.2, THE SANITY CLAMP. An implausibly small reading with nothing focused
    // is a phantom keyboard, and innerHeight — which the software keyboard does
    // NOT shrink on iOS — is the better answer until a real measurement lands.
    let height = measured;
    if (innerHeight > 0 && measured > 0
        && measured < innerHeight * MIN_PLAUSIBLE_RATIO && !editableFocused()) {
      height = innerHeight;
      schedule();
    }
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

  // W4.1: THE RESUME TRIGGERS. `visibilitychange` -> visible covers a
  // foregrounded tab; `pageshow` covers WebKit's back/forward cache, which is
  // the resume path that drops `resize` on an iOS PWA; `focusout` covers the
  // software keyboard being dismissed, which is where a phantom height is born.
  // All three go through the same per-frame coalescer as everything else, so a
  // resume that fires all three still measures once.
  const onVisible = () => { if (!document.hidden) schedule(); };
  const onPageShow = () => schedule();
  const onFocusOut = () => schedule();

  apply();
  // resize covers rotation, toolbar show/hide and the software keyboard.
  // `scroll` is deliberately NOT bound: it fires on every frame of a scroll
  // and the height does not change during one.
  if (vv) vv.addEventListener('resize', schedule);
  window.addEventListener('resize', schedule);
  window.addEventListener('orientationchange', schedule);
  window.addEventListener('pageshow', onPageShow);
  window.addEventListener('focusout', onFocusOut);
  document.addEventListener('visibilitychange', onVisible);
  // The bars mount and unmount with the route (no tab bar on the TOC), and a
  // modal can open at any point after that, so the measurement has to follow
  // the DOM rather than only the window.
  //
  // AND IT IS ALSO HOW A MODAL MEASURES BEFORE ITS FIRST PAINT (W4.1). A
  // MutationObserver callback is a MICROTASK: it runs at the end of the task
  // that added the node and before the browser renders it. So an overlay that
  // has just been inserted can be measured for, synchronously, while it is
  // still unpainted — and every modal in the app goes through this one door
  // without a single dialog having to remember to ask.
  //
  // That matters more than it looks: this bug's whole shape is a height that is
  // correct at every moment except the one where a modal opens. A per-modal
  // hook would be a list of dialogs someone maintained; this is the DOM saying
  // a dialog appeared. `apply` rather than `schedule` for that case only —
  // ordinary Svelte re-renders stay coalesced to one measurement per frame,
  // which is what keeps this observer free.
  const addedAModal = records => records.some(record =>
    [...record.addedNodes].some(node => node.nodeType === 1
      && (node.classList.contains('modal-overlay') || node.querySelector('.modal-overlay'))));
  const observer = typeof MutationObserver === 'undefined'
    ? null
    : new MutationObserver(records => { if (addedAModal(records)) apply(); else schedule(); });
  if (observer) observer.observe(document.body, { childList: true, subtree: true });

  stop = () => {
    if (queued) cancelAnimationFrame(queued);
    if (vv) vv.removeEventListener('resize', schedule);
    window.removeEventListener('resize', schedule);
    window.removeEventListener('orientationchange', schedule);
    window.removeEventListener('pageshow', onPageShow);
    window.removeEventListener('focusout', onFocusOut);
    document.removeEventListener('visibilitychange', onVisible);
    if (observer) observer.disconnect();
    stop = null;
  };
  return stop;
}
