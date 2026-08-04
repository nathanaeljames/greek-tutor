<script>
  // The Translation of Inflectional Forms table has two runtime hosts: the
  // expander under a Learn chart and the same Paradigm inside a drill Hint.
  // Keep its DOM and shared pg-* classes identical in both places.
  import { play } from '../lib/audio.js';
  export let meanings;
  export let title = null;

  $: columns = meanings?.columns || [];
  $: rows = meanings?.rows || [];
  $: hasCaseLabels = rows.some(row => row.label != null);
  $: hasLongCaseLabels = rows.some(row => String(row.label || '').length > 5);
  $: hasLongForms = hasCaseLabels && rows.some(row => (row.cells || [])
    .some(cell => [...String(cell.greek || '')].length > 7));
</script>

<div
  class="paradigm"
  class:pg-case-labels={hasCaseLabels}
  class:pg-long-case-labels={hasLongCaseLabels}
  class:pg-long-forms={hasLongForms}
  class:pg-many-columns={columns.length > 3}
  data-chart-index={0}
  data-chart-count={1}
  data-chart-name="">
  {#if title}<div class="pg-title">{title}</div>{/if}

  <div class="pg-grid" style="--pg-cols:{columns.length}">
    {#if columns.length}
      <div class="pg-head">
        <span class="pg-person pg-head-spacer">&nbsp;</span>
        {#each columns as column, columnIndex}
          <span class="pg-column" data-column-index={columnIndex}>{column}</span>
        {/each}
      </div>
    {/if}
    {#each rows as row, rowIndex}
      <div class="pg-row" data-row-index={rowIndex}>
        <span class="pg-person pg-row-label">{row.label ?? row.person ?? ''}</span>
        {#each row.cells || [] as cell, cellIndex}
          <button
            class="pg-cell"
            data-cell-index={cellIndex}
            disabled={!cell.audio}
            on:click={() => cell.audio && play(cell.audio)}>
            <span class="greek pg-greek">{cell.greek}</span>
            {#if cell.gloss}<span class="pg-gloss">{cell.gloss}</span>{/if}
          </button>
        {/each}
      </div>
    {/each}
  </div>

  {#if meanings.legend && meanings.legend.length}
    <div class="pg-legend">
      {#each meanings.legend as entry, legendIndex}
        <div class="pg-legend-row" data-legend-index={legendIndex}>
          <span class="pg-legend-label">{entry.label}</span>
          <span class="pg-legend-text">{entry.text}</span>
        </div>
      {/each}
    </div>
  {/if}
  {#if meanings.closing}<div class="pg-closing">{meanings.closing}</div>{/if}
</div>
