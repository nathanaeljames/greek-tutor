<script>
  // End-of-chapter modal (in-app overlay). Mirrors the original's last-page
  // dialog, adapted. Rendered when Next is pressed on the last sequence item.
  import { createEventDispatcher, onMount } from 'svelte';
  import { getChapter, getNextChapter, getSequence, loadChapter } from '../lib/content.js';

  export let chapterId;
  const dispatch = createEventDispatcher();

  $: chapter = getChapter(chapterId);
  $: next = getNextChapter(chapterId);
  $: canAdvance = !!(next && next.available);

  // Focus moves into the dialog on open (keyboard/VoiceOver users land on the
  // primary action); Escape behaves like Stay.
  let firstAction;
  onMount(() => { if (firstAction) firstAction.focus(); });
  function onKeydown(e) { if (e.key === 'Escape') close(); }

  function close() { dispatch('close'); }
  function toChapterMap() { location.hash = `#/chapter/${chapterId}`; close(); }
  function toToc() { location.hash = '#/'; close(); }
  async function toNextChapter() {
    if (!canAdvance) return;
    // The next chapter is a lazy chunk (5A) and is not loaded yet — its
    // sequence read would hit an unloaded chapter. Load it first (idempotent;
    // the route gate then awaits the same memoized promise). On failure, fall
    // back to the hub route so the gate can surface the error/retry there.
    try { await loadChapter(next.id); } catch (_) {
      location.hash = `#/chapter/${next.id}`;
      close();
      return;
    }
    const seq = getSequence(next.id);
    const first = seq[0];
    location.hash = first ? `#/activity/${next.id}/${first}` : `#/chapter/${next.id}`;
    close();
  }
</script>

<svelte:window on:keydown={onKeydown} />

<div class="modal-overlay" on:click|self={close} role="presentation">
  <div class="modal" role="dialog" aria-modal="true" aria-label="End of chapter">
    <h2 class="modal-title">End of chapter</h2>
    <p class="modal-body">This is the last page of {chapter ? chapter.title : 'this chapter'}.</p>
    {#if next && !next.available}
      <p class="modal-note">Chapter {next.number} is coming soon.</p>
    {/if}
    <div class="modal-actions">
      {#if canAdvance}
        <button class="btn" bind:this={firstAction} on:click={toNextChapter}>Next chapter</button>
        <button class="btn secondary" on:click={toChapterMap}>Chapter map</button>
      {:else}
        <button class="btn secondary" bind:this={firstAction} on:click={toChapterMap}>Chapter map</button>
      {/if}
      <button class="btn secondary" on:click={toToc}>Table of contents</button>
      <button class="btn secondary" on:click={close}>Stay</button>
    </div>
  </div>
</div>
