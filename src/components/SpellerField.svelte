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
  import { createEventDispatcher } from 'svelte';
  import { clustersOf } from '../lib/speller-input.js';
  import { spacingMarks } from '../lib/greek.js';

  export let state;
  export let label = 'Spell Greek';
  export let locked = false;         // solved: no caret, no repositioning
  export let fieldClass = '';        // per-surface size/wrap tuning (sv-target)

  const dispatch = createEventDispatcher();
  $: clusters = clustersOf(state);

  // Which half of the cluster was tapped decides which side the caret lands.
  function tapCluster(event, index) {
    if (locked) return;
    const box = event.currentTarget.getBoundingClientRect();
    const after = event.clientX - box.left > box.width / 2;
    dispatch('caret', { index, after });
  }
  function tapEnd() {
    if (locked) return;
    dispatch('caretEnd');
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
  <div class="value greek spell-target {fieldClass}" role="presentation" on:click={tapEnd}
  >{#each clusters as cluster, i}{#if !locked && i === state.caret}<span class="caret" />{/if}<span class="sp-cluster" role="presentation" on:click|stopPropagation={e => tapCluster(e, i)}>{cluster}</span>{/each}{#if !locked && state.caret >= clusters.length}<span class="caret" />{/if}{#if state.pendingMark}<span class="sp-pending">{spacingMarks(state.pendingMark)}</span>{/if}</div>
</div>
