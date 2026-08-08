<script>
  // PRONOUN PARADIGM (5F §2.8, chapter 8). Four case rows (N./G./D./A.) over a
  // Singular and a Plural column. It is its own block type because the
  // pipeline ships each ROW as one line of set text — "ἐγώ I ἡμεῖς we" —
  // rather than as the {greek, gloss} cells Paradigm.svelte reads, so the two
  // charts cannot share a data contract even though they share a look.
  //
  // SPLITTING THE LINE. The original is column-set: each row is
  // <singular form> <its gloss> <plural form> <its gloss>. The reliable
  // boundary is the START OF THE LAST GREEK RUN — the plural form — because a
  // gloss never contains Greek on any of these twelve rows. Within a cell the
  // leading Greek run is the form and the remainder is its gloss.
  //
  // A KNOWN DATA DEFECT rides on this (reported in 5F-SPEC1-RESULTS §2.8): six
  // rows of the two Quick Review charts still hold the TBK's untransliterated
  // Latin for the enclitic forms (mou, moi, me, sou, soi, se) where the Learn
  // pages carry proper μου, μοι, με, σου, σοι, σε. Those cells therefore have
  // no Greek run, the split still puts them in the singular column, and they
  // print exactly as delivered — visibly wrong rather than silently patched,
  // because the data is not this renderer's to fix.
  //
  // Greek-tap rule (directive 9): a cell whose form has a clip in the
  // chapter's audio map is tappable and plays it.
  import { play } from '../lib/audio.js';
  export let paradigm;
  export let audioMap = {};
  export let title = null;

  const GREEK_RUN = /[Ͱ-Ͽἀ-῿][Ͱ-Ͽἀ-῿'ʼ]*/gu;

  $: columns = paradigm.columns || ['Singular', 'Plural'];
  $: rows = (paradigm.rows || []).map(row => ({ label: row.label ?? row.person ?? '', cells: splitRow(row.text) }));

  // [singularCell, pluralCell]; a row that cannot be split renders whole in the
  // first column rather than being dropped.
  function splitRow(text) {
    const line = String(text || '').trim();
    if (!line) return [cell(''), cell('')];
    const runs = [...line.matchAll(GREEK_RUN)];
    if (runs.length < 2) {
      // Only one Greek run: it opens the PLURAL half (the singular half is the
      // Latin-carrying defect above) unless the line starts with it.
      const at = runs.length === 1 ? runs[0].index : -1;
      if (at > 0) return [cell(line.slice(0, at)), cell(line.slice(at))];
      return [cell(line), cell('')];
    }
    const at = runs[runs.length - 1].index;
    return [cell(line.slice(0, at)), cell(line.slice(at))];
  }

  // { greek, gloss }: the leading Greek run is the form, the rest is its gloss.
  function cell(text) {
    const trimmed = String(text || '').trim();
    if (!trimmed) return { greek: '', gloss: '' };
    GREEK_RUN.lastIndex = 0;
    const first = GREEK_RUN.exec(trimmed);
    if (!first || first.index !== 0) return { greek: '', gloss: trimmed };
    return { greek: first[0], gloss: trimmed.slice(first[0].length).trim() };
  }

  const clipFor = greek => (greek && audioMap[greek]) || null;
</script>

<div class="paradigm pronoun-paradigm" data-gender={paradigm.gender || ''}>
  {#if title}<div class="pg-title">{title}</div>{/if}
  {#if paradigm.gender}<div class="pp-gender">{paradigm.gender}</div>{/if}
  <div class="pg-grid" style="--pg-cols:{columns.length}">
    <div class="pg-head">
      <span class="pg-person pg-head-spacer">&nbsp;</span>
      {#each columns as column, columnIndex}
        <span class="pg-column" data-column-index={columnIndex}>{column}</span>
      {/each}
    </div>
    {#each rows as row, rowIndex}
      <div class="pg-row" data-row-index={rowIndex}>
        <span class="pg-person pg-row-label">{row.label}</span>
        {#each row.cells as c, cellIndex}
          {@const clip = clipFor(c.greek)}
          <button class="pg-cell" data-cell-index={cellIndex} disabled={!clip}
                  on:click={() => clip && play(clip)}>
            {#if c.greek}<span class="greek pg-greek">{c.greek}</span>{/if}
            {#if c.gloss}<span class="pg-gloss">{c.gloss}</span>{/if}
          </button>
        {/each}
      </div>
    {/each}
  </div>
  {#if paradigm.note}<div class="pg-note">{paradigm.note}</div>{/if}
</div>
