<script>
  // End-of-chapter modal (in-app overlay). Mirrors the original's last-page
  // dialog, adapted. Rendered when Next is pressed on the last sequence item.
  import { createEventDispatcher } from 'svelte';
  import { getChapter, getNextChapter, getSequence } from '../lib/content.js';

  export let chapterId;
  const dispatch = createEventDispatcher();

  $: chapter = getChapter(chapterId);
  $: next = getNextChapter(chapterId);
  $: canAdvance = !!(next && next.available);

  function close() { dispatch('close'); }
  function toToc() { location.hash = '#/'; close(); }
  function toNextChapter() {
    if (!canAdvance) return;
    const seq = getSequence(next.id);
    const first = seq[0];
    location.hash = first ? `#/activity/${next.id}/${first}` : `#/chapter/${next.id}`;
    close();
  }
</script>

<div class="modal-overlay" on:click|self={close} role="presentation">
  <div class="modal" role="dialog" aria-modal="true" aria-label="End of chapter">
    <h2 class="modal-title">End of chapter</h2>
    <p class="modal-body">This is the last page of {chapter ? chapter.title : 'this chapter'}.</p>
    {#if next && !next.available}
      <p class="modal-note">Chapter {next.number} is coming soon.</p>
    {/if}
    <div class="modal-actions">
      {#if canAdvance}
        <button class="btn" on:click={toNextChapter}>Next chapter</button>
      {/if}
      <button class="btn secondary" on:click={toToc}>Table of contents</button>
      <button class="btn secondary" on:click={close}>Stay</button>
    </div>
  </div>
</div>
