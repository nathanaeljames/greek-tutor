<script>
  // THE TYPED-TEXT FIELD both spellers show. Not an <input>: on the iPhone this
  // app is built for, a real text field (or contenteditable) summons the
  // system keyboard over the tile keyboard, which is the one thing the shared
  // speller must never do. So the buffer is rendered as tappable grapheme
  // clusters and the caret is drawn.
  //
  // Tapping a cluster puts the caret on the side of it that was tapped;
  // tapping the empty space to the right puts it at the end. That is the whole
  // of VERIFY-5D A6 defect 1 — entry was append-only, so a mistake in word one
  // of a fourteen-word verse cost the whole verse. Arrow keys are not required
  // (the target device has no keyboard) but the hardware Left/Right keys are
  // wired anyway because they cost one line each.
  //
  // HOLD AND DRAG MOVES THE CARET (5E-SPEC3-PATCH item 6). Tapping alone put
  // the caret within a cluster of where you meant on a phone, and holding did
  // the WORST possible thing: it started an iOS text selection and raised the
  // Copy / Look Up / Translate callout over the exercise. The field is not an
  // <input>, so that selection was pure noise — nothing can be done with it.
  // Dragging now sweeps the caret the way the Syllable Division exercise
  // sweeps a divider, and native selection and the callout are suppressed.
  import { createEventDispatcher } from 'svelte';
  import { clustersOf } from '../lib/speller-input.js';
  import { spacingMarks } from '../lib/greek.js';

  export let state;
  export let label = 'Spell Greek';
  export let locked = false;         // solved: no caret, no repositioning
  export let fieldClass = '';        // per-surface size/wrap tuning (sv-target)

  const dispatch = createEventDispatcher();
  $: clusters = clustersOf(state);

  let fieldEl;
  let dragPointer = null;
  // Drives `.dragging` on the field, which stops the caret blinking for the
  // duration. See the .caret rules in app.css: the blink restarts every time
  // the caret span is re-created at a new position, and its first half is the
  // invisible one, so a moving caret never got to be drawn.
  $: dragging = dragPointer !== null;

  // The caret position nearest a point, measured from the LAID-OUT clusters so
  // wrapping, kerning and the Greek font are all the browser's business. Every
  // cluster contributes two candidate positions (its leading and trailing
  // edge); the nearest one on the nearest LINE wins, which is what makes a drag
  // past the end of a wrapped line land at the end of that line rather than
  // jumping to whatever is horizontally closest two lines down.
  function caretFromPoint(clientX, clientY) {
    const spans = fieldEl ? [...fieldEl.querySelectorAll('.sp-cluster')] : [];
    if (!spans.length) return 0;
    const candidates = [];
    spans.forEach((span, index) => {
      const r = span.getBoundingClientRect();
      candidates.push({ caret: index, x: r.left, top: r.top, bottom: r.bottom });
      candidates.push({ caret: index + 1, x: r.right, top: r.top, bottom: r.bottom });
    });
    const onLine = candidates.filter(c => clientY >= c.top && clientY <= c.bottom);
    let pool = onLine;
    if (!pool.length) {
      // Above the first line or below the last: use the nearest line.
      const gap = c => (clientY < c.top ? c.top - clientY : clientY - c.bottom);
      const nearest = Math.min(...candidates.map(gap));
      pool = candidates.filter(c => gap(c) === nearest);
    }
    let best = pool[0];
    for (const c of pool) {
      if (Math.abs(clientX - c.x) < Math.abs(clientX - best.x)) best = c;
    }
    return best.caret;
  }

  function moveCaretTo(clientX, clientY) {
    // `after: false` because caretFromPoint already returns the final position.
    dispatch('caret', { index: caretFromPoint(clientX, clientY), after: false });
  }

  function onPointerDown(event) {
    if (locked) return;
    // Claim the gesture so the browser does not start a selection or a scroll
    // with it; touch-action: none on the element is the other half of that.
    event.preventDefault();
    dragPointer = event.pointerId;
    try { event.currentTarget.setPointerCapture(event.pointerId); } catch { /* not captureable */ }
    moveCaretTo(event.clientX, event.clientY);
  }
  function onPointerMove(event) {
    if (locked || dragPointer === null || event.pointerId !== dragPointer) return;
    event.preventDefault();
    moveCaretTo(event.clientX, event.clientY);
  }
  function endDrag(event) {
    if (dragPointer === null) return;
    try { event.currentTarget.releasePointerCapture(dragPointer); } catch { /* already gone */ }
    dragPointer = null;
  }
</script>

<div class="flash-pane">
  <div class="label">{label}</div>
  <!-- The trailing click zone is what makes "tap past the end" work; the
       clusters stop the event so a tap ON one is not also a tap past it.
       NO WHITESPACE inside this element: it renders with white-space: pre-wrap
       so a typed space is visible, which means the template's own indentation
       would be visible too — as a phantom leading newline and a trailing
       space in the field. The `sp-pending` span is a HELD mark, shown in its
       spacing form so a breathing tapped before its letter reads as waiting
       rather than lost. -->
  <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
  <div class="value greek spell-target {fieldClass}" class:dragging bind:this={fieldEl}
    role="application" aria-label="{label}. Tap or drag to move the cursor."
    on:pointerdown={onPointerDown}
    on:pointermove={onPointerMove}
    on:pointerup={endDrag}
    on:pointercancel={endDrag}
  >{#each clusters as cluster, i}{#if !locked && i === state.caret}<span class="caret" />{/if}<span class="sp-cluster">{cluster}</span>{/each}{#if !locked && state.caret >= clusters.length}<span class="caret" />{/if}{#if state.pendingMark}<span class="sp-pending">{spacingMarks(state.pendingMark)}</span>{/if}</div>
</div>
