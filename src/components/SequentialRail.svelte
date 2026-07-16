<script>
  // Sequential Prev/Next rail on activity screens. Walks the chapter in
  // sequence order; Next on the last item opens the end-of-chapter dialog.
  import { createEventDispatcher } from 'svelte';
  import { getSequencePosition } from '../lib/content.js';

  export let chapterId;
  export let activityId;

  const dispatch = createEventDispatcher();

  $: pos = getSequencePosition(chapterId, activityId);
  $: inSequence = pos.index !== -1;

  // Defensive: activity absent from the sequence -> Previous returns to hub.
  $: if (!inSequence) console.warn(`Activity "${activityId}" is not in chapter "${chapterId}" sequence; rail degraded.`);

  function goPrev() {
    if (!inSequence) { location.hash = `#/chapter/${chapterId}`; return; }
    if (pos.prevId) location.hash = `#/activity/${chapterId}/${pos.prevId}`;
  }
  function goNext() {
    if (!inSequence) return;
    if (pos.nextId) location.hash = `#/activity/${chapterId}/${pos.nextId}`;
    else dispatch('end');
  }
</script>

<div class="rail">
  <button class="btn secondary rail-prev" on:click={goPrev} disabled={inSequence && pos.index === 0}>Previous</button>

  {#if inSequence}
    <span class="rail-count">{pos.index + 1} of {pos.total}</span>
    <button class="btn rail-next" on:click={goNext}>Next</button>
  {:else}
    <span class="rail-count">&mdash;</span>
    <span class="rail-next-placeholder" aria-hidden="true"></span>
  {/if}
</div>
