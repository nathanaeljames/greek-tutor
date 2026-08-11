<script>
  // One popup page (5F §2.2), rendered as the original's full-screen green
  // sheet with a Cancel control. Three chapters share it:
  //
  //   chapter 6  a preposition: headword, its sense lines, three worked
  //              examples with references.
  //   chapter 7  οὐ / οὐκ / οὐχ: headword, gloss, the condition it applies
  //              under, two examples.
  //   chapter 8  the three uses of αὐτός: a title and three, two and two
  //              examples (no Greek headword of its own).
  //
  // 5G-SPEC1 §4.3 adds a fourth, and it is the one later chapters should use:
  // chapters 9 and 10 carry their popup bodies as a `content[]` BLOCK LIST —
  // the same block vocabulary the teaching topics use (para, numbered,
  // presentFutureRows, greekRows), rendered by the same RichContent. One
  // component, one block renderer, no per-chapter popup shape. The three
  // flexible-dict fields above stay for the chapters that already ship them.
  //
  // Greek-tap rule (directive 9): the headword and EVERY example phrase play
  // their own clip. Glosses and references are ink.
  import { play, stop as stopAudio } from '../lib/audio.js';
  import Marked from './Marked.svelte';
  import RichContent from './RichContent.svelte';
  import { createEventDispatcher, onDestroy } from 'svelte';
  export let popup;

  const dispatch = createEventDispatcher();
  // A4: leaving the sheet stops whatever it started. Closing is an exit like
  // any other, so it goes through one place.
  function close() { stopAudio(); dispatch('close'); }
  function onKeydown(e) { if (e.key === 'Escape') { e.preventDefault(); close(); } }
  onDestroy(() => stopAudio());
</script>

<svelte:window on:keydown={onKeydown} />

<div class="modal-overlay popup-overlay" on:click|self={close} role="presentation">
  <div class="modal popup-sheet" role="dialog" aria-modal="true"
       aria-label={popup.title || popup.greek || 'Reference'}
       data-popup-id={popup.id}>
    <div class="modal-scroll">
      {#if popup.greek}
        <button class="popup-head greek greek-say" on:click={() => popup.audio && play(popup.audio)}>{popup.greek}</button>
      {/if}
      {#if popup.title}<h2 class="popup-title">{popup.title}</h2>{/if}
      {#if popup.gloss}<div class="popup-gloss"><Marked text={popup.gloss} /></div>{/if}
      {#if popup.condition}<div class="popup-condition"><Marked text={popup.condition} /></div>{/if}

      {#if popup.senses && popup.senses.length}
        <div class="popup-senses">
          {#each popup.senses as sense}
            <div class="popup-sense"><Marked text={typeof sense === 'string' ? sense : (sense.gloss || '')} /></div>
          {/each}
        </div>
      {/if}

      {#if Array.isArray(popup.content) && popup.content.length}
        <div class="popup-content"><RichContent blocks={popup.content} greekTaps={popup.greekTaps || null} /></div>
      {/if}

      {#if popup.examples && popup.examples.length}
        <div class="popup-examples">
          {#each popup.examples as example, index}
            <div class="popup-example" data-example-index={index}>
              <button class="popup-example-greek greek greek-say"
                      disabled={!example.audio}
                      on:click={() => example.audio && play(example.audio)}>{example.greek}</button>
              {#if example.gloss}<div class="popup-example-gloss"><Marked text={example.gloss} /></div>{/if}
              {#if example.ref}<div class="popup-example-ref">{example.ref}</div>{/if}
            </div>
          {/each}
        </div>
      {/if}
    </div>
    <div class="modal-actions">
      <!-- svelte-ignore a11y-autofocus -->
      <button class="btn" autofocus on:click={close}>Cancel</button>
    </div>
  </div>
</div>
