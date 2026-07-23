<script>
  // Renders the structured "content" block arrays that carry Chapter 1's
  // teaching prose (the original program's yellow panels). Visual arrangement
  // is pedagogy: headings, hanging-indent bibliographies, aligned definition
  // rows and underlined list lead-ins are all load-bearing, not decoration.
  //
  // Block types: heading | para | numbered | defList | biblist | refs | note |
  // greekRows | expander.
  // Trailing { greek, caption?, audio? } "example" objects render in the Greek
  // font and play their clip on tap. defList rows [term, value, audio?] play
  // the row's clip when present.
  import { play } from '../lib/audio.js';

  export let blocks = [];

  function playAudio(id) { if (id) play(id); }

  // A defList value may be a plain string OR a letters-list object
  // { letters: [{ greek, audio }] } — a row of individually-tappable Greek
  // chips (A6, Six Points "Linguistic Pronunciation Descriptions").
  const isLettersList = v => v && typeof v === 'object' && Array.isArray(v.letters);
  const defRows = block => block.rows || (block.items || []).map(item => [item.term, item.def, item.audio]);
  const isSyllableMatrix = block => Array.isArray(block.columns)
    && block.rows.every(row => Array.isArray(row.syllables) && row.syllables.length === block.columns.length && !row.gloss && !row.label);

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
  {#each blocks as b}
    {#if b.type === 'heading'}
      <div class="rc-heading">{b.text}</div>

    {:else if b.type === 'para'}
      <p class="rc-para">{b.text}</p>
      {#if b.example}
        <button class="rc-example" class:tappable={b.example.audio} on:click={() => playAudio(b.example.audio)}>
          <span class="greek">{b.example.greek}</span>
          {#if b.example.caption}<span class="rc-caption">{b.example.caption}</span>{/if}
        </button>
      {/if}

    {:else if b.type === 'numbered'}
      {#if b.preamble}<p class="rc-preamble">{b.preamble}</p>{/if}
      {@const selfNum = (() => { const re = /^\(?\d+[.)]/; return b.items.length > 0 && b.items.every(it => it.label && re.test(it.label)); })()}
      <ol class="rc-list" class:authored-labels={selfNum}>
        {#each b.items as it}
          <li>
            {#if it.label}{#if selfNum}<span class="rc-num">{it.label}</span>{it.text ? ' ' : ''}{:else}<span class="rc-lead">{it.label}</span>{it.text ? ' — ' : ''}{/if}{/if}{#if it.greekTaps}{#each splitTaps(it.text, it.greekTaps) as seg}{#if seg.audio}<button class="greek-tap greek" on:click={() => playAudio(seg.audio)}>{seg.t}</button>{:else}{seg.t}{/if}{/each}{:else}{it.text || ''}{/if}
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
                    <div class="rc-defrow letters-row">
                      <span class="rc-term">{row[0]}</span>
                      <span class="rc-chips">
                        {#each row[1].letters as lt}
                          <button class="greek-chip greek" on:click={() => playAudio(lt.audio)}>{lt.greek}</button>
                        {/each}
                      </span>
                    </div>
                  {:else}
                    <button class="rc-defrow" class:tappable={row[2]} on:click={() => playAudio(row[2])}>
                      <span class="rc-term greek">{row[0]}</span>
                      <span class="rc-val greek">{row[1]}</span>
                    </button>
                  {/if}
                {/each}
              </div>
            {/if}
            {#if it.note}<div class="rc-inlinenote">{it.note}</div>{/if}
          </li>
        {/each}
      </ol>

    {:else if b.type === 'defList'}
      <div class="rc-deflist">
        {#each defRows(b) as row}
          {#if isLettersList(row[1])}
            <div class="rc-defrow letters-row">
              <span class="rc-term">{row[0]}</span>
              <span class="rc-chips">
                {#each row[1].letters as lt}
                  <button class="greek-chip greek" on:click={() => playAudio(lt.audio)}>{lt.greek}</button>
                {/each}
              </span>
            </div>
          {:else}
            <button class="rc-defrow" class:tappable={row[2]} on:click={() => playAudio(row[2])}>
              <span class="rc-term greek">{row[0]}</span>
              <span class="rc-val greek">{row[1]}</span>
            </button>
          {/if}
        {/each}
      </div>

    {:else if b.type === 'greekRows'}
      {@const syllableMatrix = isSyllableMatrix(b)}
      <div class="rc-greekrows" class:syllable-matrix={syllableMatrix}>
        {#if b.columns}
          <div class="rc-greekhead" style={`--greek-cols:${b.columns.length}`}>
            {#each b.columns as column}<span>{column}</span>{/each}
          </div>
        {/if}
        {#each b.rows as row}
          {#if syllableMatrix}
            {#if row.audio}
              <button class="rc-syllable-row greek greek-say" style={`--greek-cols:${b.columns.length}`} on:click={() => playAudio(row.audio)}>
                {#each row.syllables as syllable}<span>{syllable || '\u00a0'}</span>{/each}
              </button>
            {:else}
              <div class="rc-syllable-row greek" style={`--greek-cols:${b.columns.length}`}>
                {#each row.syllables as syllable}<span>{syllable || '\u00a0'}</span>{/each}
              </div>
            {/if}
          {:else}
            {@const cellCount = (row.label ? 1 : 0) + (row.greek ? 1 : 0) + (row.gloss != null && row.gloss !== '' ? 1 : 0)}
            <div class="rc-greekrow" style={`--greek-cols:${Math.max(cellCount, 1)}`}>
              {#if row.label}<span class="rc-greeklabel">{row.label}</span>{/if}
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
              {#if row.gloss != null && row.gloss !== ''}<span class="rc-greekgloss">{row.gloss}</span>{/if}
            </div>
          {/if}
        {/each}
        {#if b._verify}<div class="pending-verification compact">Some chart details are pending verification.</div>{/if}
      </div>

    {:else if b.type === 'expander'}
      <details class="rc-expander">
        <summary>{b.label}</summary>
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
        {#each b.items as entry}
          <div class="rc-bibentry">{entry}</div>
        {/each}
      </div>

    {:else if b.type === 'refs'}
      <div class="rc-refs">{b.text}</div>

    {:else if b.type === 'note'}
      <div class="note">{b.text}</div>
    {/if}
  {/each}
</div>
