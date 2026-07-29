<script>
  // PARADIGM CHART (5D). One renderer, three hosts: a `paradigm` RichContent
  // block inside a Learn topic, the full-page `paradigmChart` contentAudio
  // mode in Quick Review, and the Hint popup on the three chapter-3 verb
  // drills. The original draws all three from the same chart, so the port does
  // too — nothing here is keyed to an activity id.
  //
  // Layout follows the original: a numbered person column, one column per
  // number (Singular / Plural), each cell a Greek form over its gloss, and the
  // Say Whole Paradigm / Endings buttons INSIDE the chart frame.
  //
  // Greek-tap rule: every Greek cell and the lemma are tappable and play their
  // own clip. The ENDINGS rows are bare morphemes with no clips of their own,
  // so they render in ink rather than the tappable blue — the same exception
  // the chapter's "Stem + Pronominal ending" line takes (logged in the data's
  // _note).
  import { play } from '../lib/audio.js';
  export let paradigm;
  export let title = null;

  let endingsOpen = false;
  $: columns = paradigm.columns || [];
  $: rows = paradigm.rows || [];
  // Endings rows are flat [ending, gloss, ending, gloss] tuples — one pair per
  // number column, so the popup lines up with the chart above it.
  $: endingRows = (paradigm.endings && paradigm.endings.rows) || [];

  function openEndings() {
    endingsOpen = true;
    // D-10: the original ships c_ending but its button plays nothing. Treated
    // as an original defect and restored — behind the tap, never on render.
    if (paradigm.endings && paradigm.endings.audio) play(paradigm.endings.audio);
  }
  function onKeydown(e) { if (e.key === 'Escape') endingsOpen = false; }
</script>

<svelte:window on:keydown={endingsOpen ? onKeydown : null} />

<div class="paradigm">
  {#if title}<div class="pg-title">{title}</div>{/if}

  {#if paradigm.lemma}
    <button class="pg-lemma" on:click={() => paradigm.lemma.audio && play(paradigm.lemma.audio)}>
      <span class="greek pg-lemma-greek">{paradigm.lemma.greek}</span>
      {#if paradigm.lemma.gloss}<span class="pg-lemma-gloss">{paradigm.lemma.gloss}</span>{/if}
    </button>
  {/if}

  <div class="pg-grid" style="--pg-cols:{columns.length}">
    {#if columns.length}
      <div class="pg-head">
        <span class="pg-person">&nbsp;</span>
        {#each columns as column}<span>{column}</span>{/each}
      </div>
    {/if}
    {#each rows as row}
      <div class="pg-row">
        <span class="pg-person">{row.person}</span>
        {#each row.cells as cell}
          <button class="pg-cell" disabled={!cell.audio} on:click={() => cell.audio && play(cell.audio)}>
            <span class="greek pg-greek">{cell.greek}</span>
            {#if cell.gloss}<span class="pg-gloss">{cell.gloss}</span>{/if}
          </button>
        {/each}
      </div>
    {/each}
  </div>

  {#if paradigm.sayWhole || paradigm.endings}
    <div class="pg-actions">
      {#if paradigm.sayWhole}
        <button class="btn secondary" on:click={() => play(paradigm.sayWhole.audio)}>{paradigm.sayWhole.label || 'Say Whole Paradigm'}</button>
      {/if}
      {#if paradigm.endings}
        <button class="btn secondary" on:click={openEndings}>{paradigm.endings.label || 'Endings'}</button>
      {/if}
    </div>
  {/if}
</div>

{#if endingsOpen}
  <div class="modal-overlay" on:click|self={() => (endingsOpen = false)} role="presentation">
    <div class="modal pg-endings" role="dialog" aria-modal="true" aria-label={paradigm.endings.label || 'Endings'}>
      <h2 class="modal-title">{paradigm.endings.label || 'Endings'}</h2>
      <div class="pg-endgrid">
        {#if columns.length === 2}
          <div class="pg-endhead"><span>{columns[0]}</span><span>{columns[1]}</span></div>
        {/if}
        {#each endingRows as row}
          <div class="pg-endrow">
            <span class="pg-endpair"><span class="greek pg-ending">{row[0]}</span><span class="pg-endgloss">{row[1]}</span></span>
            <span class="pg-endpair"><span class="greek pg-ending">{row[2]}</span><span class="pg-endgloss">{row[3]}</span></span>
          </div>
        {/each}
      </div>
      <div class="modal-actions">
        <!-- svelte-ignore a11y-autofocus -->
        <button class="btn" autofocus on:click={() => (endingsOpen = false)}>Close</button>
      </div>
    </div>
  </div>
{/if}
