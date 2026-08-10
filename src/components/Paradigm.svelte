<script>
  // PARADIGM CHART (5D/5E). One renderer, three hosts: a `paradigm`
  // RichContent block inside a Learn topic, the full-page `paradigmChart`
  // contentAudio mode in Quick Review, and a drill's Hint popup. Nothing here
  // is keyed to an activity id.
  //
  // A 5E block may wrap several full charts in `charts`. The switch is local
  // chart state, never rail navigation; replacing the block resets chart 1.
  // A chart's `meanings` is itself paradigm-shaped. MeaningsCard owns that
  // shared table in both Learn expanders and the Paradigm rendered by a drill
  // Hint, so row/audio/gloss behavior cannot drift between the two hosts.
  //
  // Greek-tap rule: every Greek cell and lemma is tappable when it carries an
  // audio clip. Endings rows are bare morphemes with no clips of their own, so
  // they render in ink rather than tappable blue.
  import { play } from '../lib/audio.js';
  import { splitTaps } from '../lib/greek.js';
  import MeaningsCard from './MeaningsCard.svelte';
  export let paradigm;
  export let title = null;
  // 5F-FEEDBACK2 item 12 (Nathanael, 2026-08-09): a HOST may rename the
  // More/Back pair per chart index — the Adjective Case Drill's Hint reads
  // "Plural"/"Singular" while the Learn topic showing the SAME chart stack
  // keeps the original's own More/Back (ch7railwalk p2). The label always
  // names the TARGET chart, same idea as the 'named' switch kind.
  export let switchLabels = null;

  let chartIndex = 0;
  let endingsOpen = false;
  let renderedParadigm = null;

  // RichContent is reused while topicPages steps between topics. Reset on the
  // block object, not only on an ActivityHost remount, so returning to a
  // multi-chart topic always starts at chart 1.
  $: if (paradigm !== renderedParadigm) {
    renderedParadigm = paradigm;
    chartIndex = 0;
    endingsOpen = false;
  }

  $: charts = Array.isArray(paradigm?.charts) && paradigm.charts.length
    ? paradigm.charts
    : [paradigm || {}];
  $: chart = charts[chartIndex] || charts[0] || {};
  // TWO LEMMA SHAPES. Chapters 4 and 5 ship an object ({greek, gloss, audio});
  // chapter 7 ships the headword as a bare STRING with the gloss beside it on
  // the chart ("lemma": "ἀγαθός", "gloss": "good"), which printed the lemma
  // line as "undefined" until the rail-walk comparison caught it. Normalized
  // here so the template has one shape, and the data stays as delivered.
  $: lemmaIsEquation = typeof chart.lemma === 'string';
  $: lemma = lemmaIsEquation
    ? { greek: chart.lemma, gloss: chart.gloss || null, audio: null }
    : chart.lemma;
  $: columns = chart.columns || [];
  $: columnAudio = chart.columnAudio || [];
  $: columnGroups = chart.columnGroups || [];
  $: rows = chart.rows || [];
  $: showGlosses = chart.showGlosses !== false;
  $: hasCaseLabels = rows.some(row => row.label != null);
  $: hasLongCaseLabels = rows.some(row => String(row.label || '').length > 5);
  // How long a form has to be before the cells need shrinking depends on how
  // many columns share the width. Two columns tolerate a nine-letter form;
  // THREE do not — chapter 7's adjective paradigm sets ἀγαθῶν, ἀγαθοῖς and
  // ἀγαθούς three abreast and broke each of them across two lines at 380px
  // (rail-walk comparison against ch7railwalk p14). Chapter 5's three-column
  // article chart holds forms of three and four letters and is untouched.
  $: formLimit = columns.length >= 3 ? 5 : 7;
  $: hasLongForms = hasCaseLabels && rows.some(row => (row.cells || [])
    .some(cell => [...String(cell.greek || '')].length > formLimit));
  // Endings rows are flat [ending, gloss, ending, gloss] tuples -- one pair per
  // number column, so the popup lines up with the chart above it.
  $: endingRows = (chart.endings && chart.endings.rows) || [];
  $: sayWholeEach = chart.sayWholeEach || [];
  $: switchKind = paradigm?.switch || null;
  $: hasSwitch = charts.length > 1 && (switchKind === 'moreBack' || switchKind === 'named');
  $: namedTarget = charts.length > 1 ? (chartIndex + 1) % charts.length : -1;
  // 5F-FEEDBACK2 item 27 (Nathanael, 2026-08-09): the More/Back pair lives in
  // its OWN row under the action buttons — Back always in the left slot, More
  // always in the right — so stepping through a stack never makes a button
  // jump. The say/endings row above it no longer counts the switch.
  $: hasActions = !!chart.sayWhole || !!chart.endings || sayWholeEach.length > 0
    || (hasSwitch && switchKind === 'named');
  $: hasMoreBackNav = hasSwitch && switchKind === 'moreBack';
  $: moreLabel = (switchLabels && switchLabels[chartIndex + 1])
    || (charts[chartIndex + 1] && charts[chartIndex + 1].switchLabel) || 'More';
  $: backLabel = (switchLabels && switchLabels[chartIndex - 1])
    || (charts[chartIndex - 1] && charts[chartIndex - 1].switchLabel) || 'Back';

  function switchChart(nextIndex) {
    chartIndex = Math.max(0, Math.min(charts.length - 1, nextIndex));
    endingsOpen = false;
  }

  function openEndings() {
    endingsOpen = true;
    // D-10: the original ships c_ending but its button plays nothing. Treated
    // as an original defect and restored -- behind the tap, never on render.
    if (chart.endings && chart.endings.audio) play(chart.endings.audio);
  }

  function onKeydown(e) { if (e.key === 'Escape') endingsOpen = false; }

  // The authored number code spelled the way the original prints it. Anything
  // else is printed as authored rather than guessed at.
  const NUMBER_LABELS = { s: 'Singular', p: 'Plural' };
  const numberLabel = value => NUMBER_LABELS[value] || value;
</script>

<svelte:window on:keydown={endingsOpen ? onKeydown : null} />

<div
  class="paradigm"
  class:pg-case-labels={hasCaseLabels}
  class:pg-long-case-labels={hasLongCaseLabels}
  class:pg-long-forms={hasLongForms}
  class:pg-many-columns={columns.length > 3}
  data-chart-index={chartIndex}
  data-chart-count={charts.length}
  data-chart-name={chart.name || ''}>
  {#key chart}
    {#if title}<div class="pg-title">{title}</div>{/if}
    <!-- 5F-FEEDBACK.pdf item 8/9: a per-chart secondary heading, changing as
         chartIndex changes -- unlike `title` (an outer, static prop), this
         reads off the CURRENT chart, which is what makes "Masculine" become
         "Feminine" then "Neuter" as More/Back step through chapter 8's
         third-person stack while "Third Person Paradigm" stays put above it. -->
    {#if chart.subtitle}<div class="pg-subtitle">{chart.subtitle}</div>{/if}

    {#if lemma}
      <!-- Blue means tappable and only tappable (directive 8): a lemma with no
           clip of its own renders in ink, not in link blue. -->
      <button class="pg-lemma" class:silent={!lemma.audio}
              disabled={!lemma.audio}
              on:click={() => lemma.audio && play(lemma.audio)}>
        <span class="greek pg-lemma-greek">{lemma.greek}</span>
        <!-- showGlosses controls the inflected row cells. The original keeps
             the lemma's identifying gloss in both Learn and Review charts, and
             sets it as "ἀγαθός = good". -->
        <!-- The "=" is chapter 7's own typography and rides on chapter 7's own
             data shape. Chapters 4 and 5 ship the object form and their lemma
             line is device-verified as it stands; nothing there moves. -->
        {#if lemma.gloss}{#if lemmaIsEquation}<span class="pg-lemma-eq">=</span>{/if}<span class="pg-lemma-gloss">{lemma.gloss}</span>{/if}
      </button>
    {/if}

    <div class="pg-grid" style="--pg-cols:{columns.length}">
      {#if columnGroups.length}
        <div class="pg-head pg-group-head" style="--pg-cols:{columns.length}">
          <span class="pg-person pg-head-spacer">&nbsp;</span>
          {#each columnGroups as group, groupIndex}
            <span
              class="pg-column-group"
              data-column-group={groupIndex}
              style={`grid-column: span ${group.span || 1}`}>
              {group.label}
            </span>
          {/each}
        </div>
      {/if}
      {#if columns.length}
        <div class="pg-head">
          <span class="pg-person pg-head-spacer">&nbsp;</span>
          {#each columns as column, columnIndex}
            {#if columnAudio[columnIndex]}
              <button
                class="pg-column pg-column-audio"
                data-column-index={columnIndex}
                aria-label={`Play ${column}`}
                on:click={() => play(columnAudio[columnIndex])}>
                {column}
              </button>
            {:else}
              <span class="pg-column" data-column-index={columnIndex}>{column}</span>
            {/if}
          {/each}
        </div>
      {/if}
      {#each rows as row, rowIndex}
        <!-- 5F: a chart whose rows run singular THEN plural down one column
             legends each block with its number, exactly where the number
             changes — chapter 7's Review Adjectives Paradigm prints
             "Singular" beside its N. row and "Plural" beside its N.V. row
             (ch7railwalk p14). Only chapter 7 authors `number`, so no earlier
             chart moves. -->
        {#if row.number != null && row.number !== rows[rowIndex - 1]?.number}
          <div class="pg-numberband" data-number={row.number}>{numberLabel(row.number)}</div>
        {/if}
        <div class="pg-row" data-row-index={rowIndex}>
          <span class="pg-person pg-row-label">{row.label ?? row.person ?? ''}</span>
          {#each row.cells || [] as cell, cellIndex}
            <button
              class="pg-cell"
              data-cell-index={cellIndex}
              disabled={!cell.audio}
              on:click={() => cell.audio && play(cell.audio)}>
              <span class="greek pg-greek">{cell.greek}</span>
              {#if showGlosses && cell.gloss}<span class="pg-gloss">{cell.gloss}</span>{/if}
            </button>
          {/each}
        </div>
      {/each}
    </div>

    {#if chart.meanings}
      <details class="pg-meanings" data-paradigm-meanings>
        <summary class="pg-meanings-toggle">{chart.meanings.label || 'Meanings'}</summary>
        <div class="pg-meanings-card">
          <MeaningsCard meanings={chart.meanings} title={chart.meanings.title || null} />
        </div>
      </details>
    {/if}

    {#if chart.legend && chart.legend.length}
      <div class="pg-legend">
        {#each chart.legend as entry, legendIndex}
          <div class="pg-legend-row" data-legend-index={legendIndex}>
            <span class="pg-legend-label">{entry.label}</span>
            <span class="pg-legend-text">{entry.text}</span>
          </div>
        {/each}
      </div>
    {/if}
    {#if chart.closing}<div class="pg-closing">{chart.closing}</div>{/if}
    {#if chart.note}
      <!-- 5F-FEEDBACK2 item 25 (Nathanael, 2026-08-09): Greek named in
           chart.noteTaps is tappable inside the note, same contract as
           RichContent's greekTaps — chapter 8's emphatic forms ἐμοῦ, ἐμοί,
           ἐμέ each play their own clip. Unlisted text stays ink. -->
      <div class="pg-note">{#each splitTaps(chart.note, chart.noteTaps) as seg}{#if seg.audio}<button class="greek-tap greek" on:click={() => play(seg.audio)}>{seg.t}</button>{:else}{seg.t}{/if}{/each}</div>
    {/if}

    {#if hasActions}
      <div class="pg-actions" class:pg-actions-each={sayWholeEach.length > 0} style={`--pg-action-count:${sayWholeEach.length || 1}`}>
        {#if chart.sayWhole}
          <button class="btn secondary pg-say-whole" on:click={() => play(chart.sayWhole.audio)}>{chart.sayWhole.label || 'Say Whole Paradigm'}</button>
        {/if}
        {#each sayWholeEach as action, actionIndex}
          <button
            class="btn secondary pg-say-whole pg-say-whole-each"
            data-action-index={actionIndex}
            on:click={() => action.audio && play(action.audio)}>
            {action.label || 'Say Whole Paradigm'}
          </button>
        {/each}
        {#if chart.endings}
          <button class="btn secondary pg-endings-open" on:click={openEndings}>{chart.endings.label || 'Endings'}</button>
        {/if}
        {#if hasSwitch && switchKind === 'named'}
          <button
            class="btn secondary pg-switch pg-switch-named"
            data-paradigm-switch="named"
            data-target-index={namedTarget}
            on:click={() => switchChart(namedTarget)}>
            {charts[namedTarget]?.name || `Chart ${namedTarget + 1}`}
          </button>
        {/if}
      </div>
    {/if}
    {#if hasMoreBackNav}
      <!-- Item 27's fixed-slot model: two grid cells that exist on every page
           of the stack. Page 1 shows only More (right), middle pages Back and
           More, the last page only Back — and neither button ever changes
           position, because the empty slot still occupies its cell. -->
      <div class="pg-nav">
        <span class="pg-nav-slot pg-nav-back-slot">
          {#if chartIndex > 0}
            <button
              class="btn secondary pg-switch pg-switch-back"
              data-paradigm-switch="back"
              data-target-index={chartIndex - 1}
              on:click={() => switchChart(chartIndex - 1)}>{backLabel}</button>
          {/if}
        </span>
        <span class="pg-nav-slot pg-nav-more-slot">
          {#if chartIndex < charts.length - 1}
            <button
              class="btn secondary pg-switch pg-switch-more"
              data-paradigm-switch="more"
              data-target-index={chartIndex + 1}
              on:click={() => switchChart(chartIndex + 1)}>{moreLabel}</button>
          {/if}
        </span>
      </div>
    {/if}
  {/key}
</div>

{#if endingsOpen && chart.endings}
  <div class="modal-overlay" on:click|self={() => (endingsOpen = false)} role="presentation">
    <div class="modal pg-endings" role="dialog" aria-modal="true" aria-label={chart.endings.label || 'Endings'}>
      <div class="modal-scroll">
      <h2 class="modal-title">{chart.endings.label || 'Endings'}</h2>
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
      </div>
      <div class="modal-actions">
        <!-- svelte-ignore a11y-autofocus -->
        <button class="btn" autofocus on:click={() => (endingsOpen = false)}>Close</button>
      </div>
    </div>
  </div>
{/if}
