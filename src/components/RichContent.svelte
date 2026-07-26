<script>
  // Renders the structured "content" block arrays that carry Chapter 1's
  // teaching prose (the original program's yellow panels). Visual arrangement
  // is pedagogy: headings, hanging-indent bibliographies, aligned definition
  // rows and underlined list lead-ins are all load-bearing, not decoration.
  //
  // Block types: heading | subheading | para | numbered | defList | biblist |
  // refs | note | greekRows | expander. An unknown type renders LOUD (see the
  // dispatch's final else) rather than vanishing.
  // Trailing { greek, caption?, audio? } "example" objects render in the Greek
  // font and play their clip on tap. defList rows [term, value, audio?] play
  // the row's clip when present.
  import { play } from '../lib/audio.js';
  import { splitMarkRun } from '../lib/greek.js';
  import Marked from './Marked.svelte';

  export let blocks = [];

  // The 6 Accent Rules topic ships the "Chart: Accent Possibilities" expander
  // TWICE, byte-identical (feedback 5: it renders twice on both devices). Data
  // content is not ours to edit, so the renderer drops a repeat of an expander
  // label already seen in the same block array.
  $: shown = dedupeExpanders(blocks);
  function dedupeExpanders(list) {
    const seen = new Set();
    return (list || []).filter(block => {
      if (block.type !== 'expander') return true;
      const key = block.label || '';
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  function playAudio(id) { if (id) play(id); }

  // A defList value may be a plain string OR a letters-list object
  // { letters: [{ greek, audio }] } — a row of individually-tappable Greek
  // chips (A6, Six Points "Linguistic Pronunciation Descriptions").
  const isLettersList = v => v && typeof v === 'object' && Array.isArray(v.letters);
  const defRows = block => block.rows || (block.items || []).map(item => [item.term, item.def, item.audio]);
  // The accent hints ship term-less entries ("Acute—last 3 syllables" on its
  // own line, 5B-SPEC2 C7). With no term there is no two-column rhythm to
  // keep, so those lists render as hanging-indent lines instead.
  const isTermless = block => defRows(block).every(row => !row[0]);
  // A matrix row fills the declared columns with cells instead of the usual
  // greek-word + gloss pair. Rows may also carry a row LABEL: the Accent
  // Possibilities chart legends its two rows "Short Ultima" / "Long Ultima"
  // in a trailing unheaded column.
  const isSyllableMatrix = block => Array.isArray(block.columns)
    && block.rows.every(row => Array.isArray(row.syllables) && row.syllables.length === block.columns.length && !row.gloss);
  const hasRowLabels = block => block.rows.some(row => row.label);

  // greekTaps: split an item's text on STANDALONE substring matches (first
  // standalone occurrence per key) and render those substrings as tappable
  // spans. Greek NOT listed here stays plain (e.g. the red-highlighted π stays
  // untappable). Data contract (chat-side pipeline, chapters 2+): a greekTaps
  // key marks the first occurrence of that exact string whose neighbors are
  // not Greek letters — a single-letter key like "ζ" can never turn part of a
  // longer Greek word in the same paragraph into a tap target. Matches render
  // as plain text nodes inside a <button> (never {@html}).
  const GREEK_LETTER = /[Ͱ-Ͽἀ-῿]/; // Greek + Greek Extended

  // First occurrence of sub in text where the adjacent characters are not
  // Greek letters; -1 if none.
  function standaloneIndexOf(text, sub) {
    for (let i = text.indexOf(sub); i !== -1; i = text.indexOf(sub, i + 1)) {
      const before = i > 0 ? text[i - 1] : '';
      const after = text[i + sub.length] || '';
      if (!GREEK_LETTER.test(before) && !GREEK_LETTER.test(after)) return i;
    }
    return -1;
  }

  function splitTaps(text, taps) {
    let parts = [{ t: text || '' }];
    if (!taps) return parts;
    for (const [sub, audio] of Object.entries(taps)) {
      const next = [];
      for (const p of parts) {
        const i = p.audio ? -1 : standaloneIndexOf(p.t, sub);   // only split plain segments
        if (i === -1) { next.push(p); continue; }
        if (i > 0) next.push({ t: p.t.slice(0, i) });
        next.push({ t: sub, audio });
        const rest = p.t.slice(i + sub.length);
        if (rest) next.push({ t: rest });            // rest not re-scanned -> first occurrence only
      }
      parts = next;
    }
    return parts;
  }
</script>

<div class="rich">
  {#each shown as b}
    {#if b.type === 'heading'}
      <div class="rc-heading"><Marked text={b.text} /></div>

    {:else if b.type === 'subheading'}
      <!-- D4: a run-in label promoted to its own line (Grammar Review Nouns:
           "Gender:" / "Number:" / "Case:"). Left-aligned heading green, and the
           prose under it is an ordinary para -- no hanging indent, which is
           what made the two-column defList wrong for this content. -->
      <div class="rc-subheading"><Marked text={b.text} /></div>

    {:else if b.type === 'para'}
      <p class="rc-para"><Marked text={b.text} /></p>
      {#if b.example}
        <button class="rc-example" class:tappable={b.example.audio} on:click={() => playAudio(b.example.audio)}>
          <span class="greek">{b.example.greek}</span>
          {#if b.example.caption}<span class="rc-caption">{b.example.caption}</span>{/if}
        </button>
      {/if}

    {:else if b.type === 'numbered'}
      {#if b.preamble}<p class="rc-preamble"><Marked text={b.preamble} /></p>{/if}
      {@const selfNum = (() => { const re = /^\(?\d+[.)]/; return b.items.length > 0 && b.items.every(it => it.label && re.test(it.label)); })()}
      <ol class="rc-list" class:authored-labels={selfNum}>
        {#each b.items as it}
          <li>
            {#if it.label}{#if selfNum}<span class="rc-num">{it.label}</span>{it.text ? ' ' : ''}{:else}<span class="rc-lead">{it.label}</span>{it.text ? ' — ' : ''}{/if}{/if}{#if it.greekTaps}{#each splitTaps(it.text, it.greekTaps) as seg}{#if seg.audio}<button class="greek-tap greek" on:click={() => playAudio(seg.audio)}>{seg.t}</button>{:else}{seg.t}{/if}{/each}{:else}<Marked text={it.text || ''} />{/if}
            {#if it.example}
              <button class="rc-example" class:tappable={it.example.audio} on:click={() => playAudio(it.example.audio)}>
                <span class="greek">{it.example.greek}</span>
                {#if it.example.caption}<span class="rc-caption">{it.example.caption}</span>{/if}
              </button>
            {/if}
            {#if it.defList}
              <div class="rc-deflist nested">
                {#each it.defList as row}
                  {#if isLettersList(row[1])}
                    <div class="rc-defrow letters-row" class:no-term={!row[0]}>
                      <span class="rc-term">{row[0]}</span>
                      <span class="rc-chips">
                        {#each row[1].letters as lt}
                          <button class="greek-chip greek" on:click={() => playAudio(lt.audio)}>{lt.greek}</button>
                        {/each}
                      </span>
                    </div>
                  {:else if row[2]}
                    <button class="rc-defrow tappable" class:no-term={!row[0]} on:click={() => playAudio(row[2])}>
                      <span class="rc-term greek"><Marked text={row[0]} /></span>
                      <span class="rc-val greek"><Marked text={row[1]} /></span>
                    </button>
                  {:else}
                    <div class="rc-defrow static" class:no-term={!row[0]}>
                      <span class="rc-term greek"><Marked text={row[0]} /></span>
                      <span class="rc-val greek"><Marked text={row[1]} /></span>
                    </div>
                  {/if}
                {/each}
              </div>
            {/if}
            {#if it.note}<div class="rc-inlinenote"><Marked text={it.note} /></div>{/if}
          </li>
        {/each}
      </ol>

    {:else if b.type === 'defList'}
      <div class="rc-deflist" class:termless={isTermless(b)}>
        {#each defRows(b) as row}
          {#if isLettersList(row[1])}
            <div class="rc-defrow letters-row" class:no-term={!row[0]}>
              <span class="rc-term">{row[0]}</span>
              <span class="rc-chips">
                {#each row[1].letters as lt}
                  <button class="greek-chip greek" on:click={() => playAudio(lt.audio)}>{lt.greek}</button>
                {/each}
              </span>
            </div>
          {:else if row[2]}
            <button class="rc-defrow tappable" class:no-term={!row[0]} on:click={() => playAudio(row[2])}>
              <span class="rc-term greek"><Marked text={row[0]} /></span>
              <span class="rc-val greek"><Marked text={row[1]} /></span>
            </button>
          {:else}
            <div class="rc-defrow static" class:no-term={!row[0]}>
              <span class="rc-term greek"><Marked text={row[0]} /></span>
              <span class="rc-val greek"><Marked text={row[1]} /></span>
            </div>
          {/if}
        {/each}
      </div>

    {:else if b.type === 'greekRows'}
      {@const syllableMatrix = isSyllableMatrix(b)}
      {@const rowLabels = syllableMatrix && hasRowLabels(b)}
      {@const matrixCols = syllableMatrix ? b.columns.length + (rowLabels ? 1 : 0) : 0}
      {@const gridVars = `--greek-cols:${syllableMatrix ? matrixCols : (b.columns || []).length};--greek-datacols:${(b.columns || []).length}`}
      <div class="rc-greekrows" class:syllable-matrix={syllableMatrix} class:row-labels={rowLabels} class:titled={b.title}>
        <!-- B5: Review Marks groups its rows under a title ("Breathing:",
             "Punctuation:", "Apostrophe:  ( ᾽ )  elided letters"). The title
             owns its line in the heading green; the rows hang beneath it. -->
        {#if b.title}<div class="rc-greektitle"><Marked text={b.title} /></div>{/if}
        {#if b.columns}
          <div class="rc-greekhead" style={gridVars}>
            {#each b.columns as column}<span>{column}</span>{/each}
            {#if rowLabels}<span class="rc-headspacer">&nbsp;</span>{/if}
          </div>
        {/if}
        {#each b.rows as row}
          {#if syllableMatrix}
            <!-- One tap target spanning the whole row: the chunks sit under
                 their own column headers but the WORD is what is tapped
                 (5B-SPEC2 B2). A chunk may legitimately be empty -- kosmos has
                 no antepenult -- so empty cells hold their column open. -->
            {#if row.audio}
              <button class="rc-syllable-row greek greek-say" style={gridVars} on:click={() => playAudio(row.audio)}>
                {#each row.syllables as syllable}<span class="rc-cell">{#each splitMarkRun(syllable) as run}{#if run.mark}<span class="isolated-mark as-mark">{run.t}</span>{:else}{run.t}{/if}{/each}{#if !syllable}&nbsp;{/if}</span>{/each}
                {#if rowLabels}<span class="rc-cell rc-rowlabel">{row.label || '\u00a0'}</span>{/if}
              </button>
            {:else}
              <div class="rc-syllable-row greek" style={gridVars}>
                {#each row.syllables as syllable}<span class="rc-cell">{#each splitMarkRun(syllable) as run}{#if run.mark}<span class="isolated-mark as-mark">{run.t}</span>{:else}{run.t}{/if}{/each}{#if !syllable}&nbsp;{/if}</span>{/each}
                {#if rowLabels}<span class="rc-cell rc-rowlabel">{row.label || '\u00a0'}</span>{/if}
              </div>
            {/if}
          {:else if row.parts}
            <!-- C6: an equation row (\u03b4\u03b9\u03ac + \u03b1\u1f50\u03c4\u03bf\u1fe6 becomes \u03b4\u03b9\u1fbd \u03b1\u1f50\u03c4\u03bf\u1fe6). Each Greek
                 part is its OWN tap target with its own clip; the connecting
                 words are inert ink. -->
            <div class="rc-greekrow parts-row" style="--greek-cols:1">
              <span class="rc-parts">
                {#each row.parts as part}
                  {#if part.greek}
                    {#if part.audio}
                      <button class="rc-part greek greek-say" on:click={() => playAudio(part.audio)}>{part.greek}</button>
                    {:else}
                      <span class="rc-part greek">{part.greek}</span>
                    {/if}
                  {:else}
                    <span class="rc-parttext">{part.text}</span>
                  {/if}
                {/each}
                {#if row.gloss != null && row.gloss !== ''}<span class="rc-greekgloss"><Marked text={row.gloss} /></span>{/if}
              </span>
            </div>
          {:else}
            {@const cellCount = (row.label ? 1 : 0) + (row.greek ? 1 : 0) + (row.gloss != null && row.gloss !== '' ? 1 : 0)}
            <div class="rc-greekrow" style={`--greek-cols:${Math.max(cellCount, 1)}`}>
              {#if row.label}<span class="rc-greeklabel"><Marked text={row.label} /></span>{/if}
              {#if row.greek}
                {#if row.audio}
                  <button class="rc-greekword greek greek-say" on:click={() => playAudio(row.audio)}>
                    {#if row.syllables}
                      <span class="rc-syllables">{#each row.syllables as syllable}<span>{syllable}</span>{/each}</span>
                    {:else}{row.greek}{/if}
                  </button>
                {:else}
                  <span class="rc-greekword greek">
                    {#if row.syllables}
                      <span class="rc-syllables">{#each row.syllables as syllable}<span>{syllable}</span>{/each}</span>
                    {:else}{row.greek}{/if}
                  </span>
                {/if}
              {/if}
              {#if row.gloss != null && row.gloss !== ''}<span class="rc-greekgloss"><Marked text={row.gloss} /></span>{/if}
            </div>
          {/if}
        {/each}
        {#if b._verify}<div class="pending-verification compact">Some chart details are pending verification.</div>{/if}
      </div>

    {:else if b.type === 'expander'}
      <details class="rc-expander">
        <summary><Marked text={b.label} /></summary>
        <div class="rc-expander-body">
          {#if b.content && b.content.length}
            <svelte:self blocks={b.content} />
          {:else}
            <div class="pending-verification compact">Content pending verification.</div>
          {/if}
        </div>
      </details>

    {:else if b.type === 'biblist'}
      {#if b.starNote}<div class="rc-starnote">{b.starNote}</div>{/if}
      <div class="rc-biblist">
        <!-- B6: a biblist entry is a plain string. An object-form entry once
             shipped and rendered as "[object Object]" five times over; the
             guard makes the shape failure visible instead of garbled. The
             build-time equivalent is scripts/check-content-shapes.mjs. -->
        {#each b.items as entry}
          {#if typeof entry === 'string'}
            <div class="rc-bibentry"><Marked text={entry} /></div>
          {:else}
            <div class="pending-verification compact">Bibliography entry is not a string — data shape error.</div>
          {/if}
        {/each}
      </div>

    {:else if b.type === 'refs'}
      <div class="rc-refs"><Marked text={b.text} /></div>

    {:else if b.type === 'note'}
      <div class="note"><Marked text={b.text} /></div>

    {:else}
      <!-- Unknown block type. Silence here would DELETE authored teaching
           content with nothing to notice (the biblist lesson: a shape failure
           that only fails visually needs a loud failure). The build-time twin
           is scripts/check-content-shapes.mjs, which fails the build on any
           type this dispatch does not handle. -->
      <div class="pending-verification compact" role="status">Unsupported content block "{b.type}" — renderer needs updating.</div>
    {/if}
  {/each}
</div>
