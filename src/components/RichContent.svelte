<script>
  // Renders the structured "content" block arrays that carry Chapter 1's
  // teaching prose (the original program's yellow panels). Visual arrangement
  // is pedagogy: headings, hanging-indent bibliographies, aligned definition
  // rows and underlined list lead-ins are all load-bearing, not decoration.
  //
  // Block types: heading | subheading | para | numbered | defList | biblist |
  // refs | note | greekRows | expander | paradigm | presentFutureRows. An
  // unknown type renders LOUD (see the dispatch's final else) rather than
  // vanishing.
  // Trailing { greek, caption?, audio? } "example" objects render in the Greek
  // font and play their clip on tap. defList rows [term, value, audio?] play
  // the row's clip when present.
  import { play } from '../lib/audio.js';
  import { headingKey } from '../lib/content.js';
  import { splitMarkRun, splitTaps } from '../lib/greek.js';
  import { usePopups, popupFor } from '../lib/popups.js';
  import Marked from './Marked.svelte';
  import Paradigm from './Paradigm.svelte';
  import PrepositionsChart from './PrepositionsChart.svelte';

  export let blocks = [];

  // The activity's popup register, if its host provided one (5F §2.2).
  const popups = usePopups();
  const linkedPopup = ref => popupFor(popups, ref);
  const openPopup = popup => { if (popups && popup) popups.open(popup); };
  // greekTaps declared once for a whole topic/page, inherited by every block
  // under it. Chapter 3's Learn Verbs page wires λύουσιν, λύουσι and λύω this
  // way: the words sit in running prose across three different topics, and
  // repeating the table on each block would be three chances to disagree.
  // A block's own greekTaps still wins.
  export let greekTaps = null;
  // The heading the HOST already printed above these blocks (topicPages prints
  // the topic title). A chart whose own title repeats it prints one heading,
  // not two — the chapter-3 Paradigm topic is titled "Paradigm" and so is its
  // chart. Same principle as dedupeExpanders below: the data is not ours to
  // edit, so the renderer declines to say it twice.
  export let suppressTitle = null;
  // One delivered topic abbreviates Masculine to Masc while its chart spells
  // the word out ("First Declension—Masc" over "First Declension—Masculine",
  // chapter 5). They are the same heading in the original, not two stacked
  // headings; the fold that normalizes them lives in lib/content.js since 5G,
  // because the topicPages HOST needs the identical rule for the other
  // relationship (a chart title that says the topic's and more of it) and two
  // copies of a fold rule is how the em-dash regression happened.
  const sameTitle = t => !!t && !!suppressTitle && headingKey(t) === headingKey(suppressTitle);

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
  // A numbered item is either an object { label?, text, ... } or a BARE STRING.
  // Chapters 1-2 and the intro ship the object form; chapter 3 ships strings.
  // A string item used to render as an EMPTY <li> — the number printed, the
  // sentence did not, and nothing errored (device feedback, 5D: the Voice,
  // Mood, Person and Translation topics showed "1. 2. 3." over blank lines).
  // Same lesson as biblist in chapter 2: normalize the shape at the renderer,
  // because the data is not ours to edit.
  const listItems = block => (block.items || []).map(it => (typeof it === 'string' ? { text: it } : (it || {})));
  // A numbered item may carry its own hard line breaks, and the original means
  // two different things by them:
  //   \n    the next line is SET APART UNDER this one and indented further
  //         than the item text — chapter 10's stem variations put the rule on
  //         line one and its formula on line two; chapters 4 and 5 put the
  //         case label on line one and its example sentence on line two
  //         ("Subjective case (Gk: nominative):" / "He hit the ball.",
  //         ch4railwalk p2).
  //   \n\n  a new PARAGRAPH inside the item — a blank line, no indent
  //         (chapter 1's Six Points pronunciation note).
  // The lines are SPLIT rather than left to a pre-line white-space rule,
  // because no white-space rule can indent one line inside a flow. Formula
  // brackets and ==> arrows are the original's own LITERAL notation and pass
  // through as text (5G-SPEC1 §3.2).
  function itemLines(text) {
    const raw = String(text || '').split('\n');
    const lines = [];
    let gap = false;
    for (const line of raw) {
      if (!line.trim() && lines.length) { gap = true; continue; }   // blank = paragraph break
      lines.push({ text: line, gap });
      gap = false;
    }
    return lines.length ? lines : [{ text: '', gap: false }];
  }
  // LABEL STYLES on a numbered list (5D-SPEC2 §6). The original's chapter-3
  // teaching lists lead each item with a term set apart from the sentence that
  // follows — underlined (its blue hotwords: "Active voice", "Indicative mood",
  // "First person") or merely bold ("Undefined action"). Those hotwords opened
  // popups; the popups are the expander cards under the list, so the labels
  // here are NOT tappable — blue means tappable and only tappable (directive 8),
  // which is why an underline rather than a colour carries the emphasis.
  //   'underline'  <u>label</u>, the original's hotword terms
  //   'plain'      bold label, no underline
  //   (absent)     the chapters-1/2/intro form: underlined lead + " — "
  // The JOINER is the item text's own opening punctuation, not a renderer
  // guess: "—simply states that…" joins tight, ":  subject does…" joins tight,
  // "is the person(s)…" takes one space. A label style never invents a colon
  // the data does not have.
  const joiner = text => (!text || /^[\s—–:;,.!?-]/.test(text) ? '' : ' ');
  // AN EXAMPLE BLOCK is a para carrying its own line breaks. In the original
  // these are always the indented, line-per-example panels sitting under a lead
  // sentence — "Zachary drove the car. / Elliott is a good kid.", the
  // Present/Past/Future tense table, "He hits the ball. / They hit the ball."
  // Collapsing them into running prose lost both the breaks and the indent, and
  // visual arrangement is pedagogy (standing directive 2).
  // Audited before shipping this rule: chapters 1, 2 and the intro contain ZERO
  // multi-line paras, so nothing already device-verified can shift under it.
  const isExampleBlock = block => typeof block.text === 'string' && block.text.includes('\n');
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

  // greekTaps splitting lives in lib/greek.js (splitTaps) since 5F-FEEDBACK2
  // item 25 — Paradigm's note line needs the identical contract, and two
  // copies would be two places for it to disagree. Matches render as plain
  // text nodes inside a <button> (never {@html}).

  // 5F-FEEDBACK.pdf item 15 (Nathanael, 2026-08-09): a popup is opened from
  // the NUMBER in front of the line that introduces it, never from the Greek
  // word itself -- the Greek stays an ordinary audio tap, like everywhere
  // else on the page (directive 9). This supersedes D-31's original reading
  // (the headword itself was the link); the numbered-item marker route lives
  // in the `numbered` block branch below (`it.numberPopupRef`). See
  // DIVERGENCE-LOG D-31r.

  // A greekRows row may carry parts[] in TWO shapes. Chapters 4/5 ship objects
  // ({greek, audio} / {text}); chapter 6 ships plain strings with a parallel
  // partAudio[] whose null entries are the inert connectors (the "+"). Both
  // normalize here so the template has one shape to draw.
  function equationParts(row) {
    return (row.parts || []).map((part, index) => {
      if (part && typeof part === 'object') return part;
      const audio = (row.partAudio || [])[index] || null;
      return audio ? { greek: String(part), audio } : { text: String(part) };
    });
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
      <!-- emphasis:"strong" / indent:true carry the original's own typography
           on a body line ("Stem + Pronominal ending — λύ + ω" is bold and
           indented under the sentence that introduces it). greekTaps makes the
           named Greek words in the line tappable; anything not named stays
           plain ink, which is how the λύ and ω MORPHEMES on that same line stay
           untappable — they are fragments with no clip of their own. -->
      <!-- 5F-FEEDBACK2 (Nathanael, 2026-08-09): three per-block layout flags,
           all carrying the ORIGINAL's own arrangement rather than a style
           choice. gapBefore = the original sets a full blank line before this
           block (its paragraph gap, distinct from line spacing). flush = an
           example block the original does NOT indent (chapter 8's pronoun
           Definition). align:"center" = the original centres the line
           (chapter 7's "Adjective has definite article" banner). -->
      {@const taps = b.greekTaps || greekTaps}
      <p class="rc-para" class:example-block={isExampleBlock(b)}
         class:rc-strong={b.emphasis === 'strong'} class:rc-indent={b.indent}
         class:rc-flush={b.flush} class:rc-center={b.align === 'center'}
         class:rc-gap-before={b.gapBefore}
      >{#if taps}{#each splitTaps(b.text, taps) as seg}{#if seg.popup}<button class="greek-tap popup-link greek" on:click={() => openPopup(seg.popup)}>{seg.t}</button>{:else if seg.audio}<button class="greek-tap greek" on:click={() => playAudio(seg.audio)}>{seg.t}</button>{:else}<Marked text={seg.t} />{/if}{/each}{:else}<Marked text={b.text} />{/if}</p>
      {#if b.example}
        <button class="rc-example" class:tappable={b.example.audio} on:click={() => playAudio(b.example.audio)}>
          <span class="greek">{b.example.greek}</span>
          {#if b.example.caption}<span class="rc-caption">{b.example.caption}</span>{/if}
        </button>
      {/if}

    {:else if b.type === 'numbered'}
      {#if b.preamble}<p class="rc-preamble" class:rc-gap-before={b.gapBefore}><Marked text={b.preamble} /></p>{/if}
      {@const items = listItems(b)}
      {@const selfNum = (() => { const re = /^\(?\d+[.)]/; return items.length > 0 && items.every(it => it.label && re.test(it.label)); })()}
      <ol class="rc-list" class:authored-labels={selfNum} class:unnumbered={b.numbered === false}
          class:item-gap={b.itemGap} class:rc-gap-before={b.gapBefore && !b.preamble}>
        {#each items as it, idx}
          <!-- 5F-FEEDBACK3 item 3 (Nathanael, 2026-08-10): the NUMBER and the
               Greek WORD are the SAME link — both open the popup. To hear the
               word spoken, tap the popup's own title. This re-revises D-31
               (first: word was the link; then item 15 of 5F-FEEDBACK2 moved
               the link to the number and made the word an audio tap; now both
               are the link) — see DIVERGENCE-LOG D-31r2. -->
          {@const markerPopup = it.numberPopupRef ? linkedPopup(it.numberPopupRef) : null}
          {@const itemTaps = it.greekTaps || (markerPopup && markerPopup.greek ? { [markerPopup.greek]: markerPopup.audio } : null) || greekTaps}
          <li class:no-marker={!!markerPopup}>
            {#if markerPopup}
              <button class="rc-num rc-num-popup" on:click={() => openPopup(markerPopup)}>{idx + 1})</button>
            {/if}
            {#if it.label}{#if selfNum}<span class="rc-num">{it.label}</span>{it.text ? ' ' : ''}{:else if b.labelStyle === 'underline'}<u class="rc-lead-u">{it.label}</u>{joiner(it.text)}{:else if b.labelStyle === 'plain'}<span class="rc-lead-plain">{it.label}</span>{joiner(it.text)}{:else}<span class="rc-lead">{it.label}</span>{it.text ? ' — ' : ''}{/if}{/if}{#each itemLines(it.text) as line, lineIndex}<span class="rc-item-line" class:continuation={lineIndex > 0 && !line.gap} class:new-para={line.gap}>{#if itemTaps}{#each splitTaps(line.text, itemTaps) as seg}{#if seg.popup}<button class="greek-tap popup-link greek" on:click={() => openPopup(seg.popup)}>{seg.t}</button>{:else if markerPopup && seg.t === markerPopup.greek}<button class="greek-tap popup-link greek rc-word-popup" on:click={() => openPopup(markerPopup)}>{seg.t}</button>{:else if seg.audio}<button class="greek-tap greek" on:click={() => playAudio(seg.audio)}>{seg.t}</button>{:else}<Marked text={seg.t} />{/if}{/each}{:else}<Marked text={line.text} />{/if}</span>{/each}
            {#if it.example}
              <button class="rc-example" class:tappable={it.example.audio} on:click={() => playAudio(it.example.audio)}>
                <span class="greek">{it.example.greek}</span>
                {#if it.example.caption}<span class="rc-caption">{it.example.caption}</span>{/if}
              </button>
            {/if}
            {#if it.exampleLines}
              <!-- 5F-FEEDBACK2 items 5/6 (Nathanael, 2026-08-09): the original
                   sets a teaching point's worked example on its OWN line,
                   indented deeper than the item text, with wrapped lines
                   hanging under the example's first word ("The good book"
                   under "Attributive: ..."). English examples, so plain ink —
                   never a tap target. -->
              <div class="rc-example-lines">
                {#each it.exampleLines as line}<div class="rc-example-line"><Marked text={line} /></div>{/each}
              </div>
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
            {#if it.below && it.below.length}
              <!-- 5F-FEEDBACK.pdf items 5/6/7/13 (Nathanael, 2026-08-09): a
                   numbered teaching point that introduces one or two worked
                   examples (Attributive/Predicate adjective position, etc.)
                   used to ship as a literal "1) ..." STRING inside a plain
                   para, which put the marker outside the hanging-indent
                   system entirely -- long items wrapped flush left instead of
                   under their own text. it.below nests ordinary content
                   blocks (typically a glossOnly greekRows table) INSIDE the
                   <li>, so they inherit the list's own 1.9em text column for
                   free and recurse through the same renderer as everywhere
                   else, the same mechanism `expander` already uses. -->
              <div class="rc-item-below">
                <svelte:self blocks={it.below} greekTaps={itemTaps} />
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
      <div class="rc-greekrows" class:syllable-matrix={syllableMatrix} class:row-labels={rowLabels}
           class:gloss-only={b.layout === 'glossOnly'} class:english-pairs={b.layout === 'englishPairs'}
           class:compound-verbs={b.layout === 'compoundVerbs'}
           class:titled={b.title} class:centered={b.centered} class:rc-gap-before={b.gapBefore}
           class:head-underline={b.headerUnderline} class:paired-gutter={b.pairedGutter}>
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
          {:else if b.layout === 'englishPairs' && row.parts}
            <!-- English singular/plural examples share greekRows' ruled table
                 shell, but their cells are plain strings and never Greek tap
                 targets. The explicit layout flag keeps this distinct from
                 the object-form equation rows below. -->
            <div class="rc-greekrow rc-english-pair" style={`--greek-cols:${row.parts.length}`}>
              {#each row.parts as part}<span class="rc-english-cell">{part}</span>{/each}
            </div>
          {:else if row.senses}
            <!-- 5F \u00a72.3: a preposition and its sense lines. Each sense is a
                 GLOSS (the link that opens the green page) and a case tag,
                 which is plain ink. The headword plays its own clip. A row
                 whose popupRef names nothing still prints its senses; the
                 gloss simply stays ink rather than becoming a dead link. -->
            {@const popup = linkedPopup(row.popupRef)}
            <div class="rc-greekrow rc-sense-row" style="--greek-cols:2">
              {#if row.audio}
                <button class="rc-greekword greek greek-say" on:click={() => playAudio(row.audio)}>{row.greek}</button>
              {:else}
                <span class="rc-greekword greek">{row.greek}</span>
              {/if}
              <span class="rc-senses">
                {#each row.senses as sense}
                  <span class="rc-sense">
                    {#if popup}
                      <button class="popup-link rc-sense-link" on:click={() => openPopup(popup)}><Marked text={sense.gloss} /></button>
                    {:else}
                      <span class="rc-sense-gloss"><Marked text={sense.gloss} /></span>
                    {/if}
                    {#if sense.caseTag}<span class="rc-casetag">{sense.caseTag}</span>{/if}
                  </span>
                {/each}
              </span>
            </div>
          {:else if row.parts}
            <!-- C6: an equation row (\u03b4\u03b9\u03ac + \u03b1\u1f50\u03c4\u03bf\u1fe6 becomes \u03b4\u03b9\u1fbd \u03b1\u1f50\u03c4\u03bf\u1fe6). Each Greek
                 part is its OWN tap target with its own clip; the connecting
                 words are inert ink.
                 5F \u00a72.3: `bracket` parenthesises the whole row \u2014 the Elision
                 page sets its derivations that way. -->
            <!-- 5F-FEEDBACK2 items 2/3 (Nathanael, 2026-08-09): a parts row
                 WITH a gloss keeps the table's two columns — the equation in
                 column one, its translation in column two, aligned with the
                 gloss column of every other row ("διά + βλέπω | through +
                 I see" sits directly over "διαβλέπω | I see clearly"). Only
                 the gloss-less bracket derivations reclaim the full width. -->
            {@const partsGloss = row.gloss != null && row.gloss !== ''}
            <div class="rc-greekrow parts-row" class:rc-bracket={row.bracket} class:has-gloss={partsGloss}
                 style={partsGloss ? '--greek-cols:2' : '--greek-cols:1'}>
              <span class="rc-parts">
                {#if row.bracket}<span class="rc-bracket-mark">(</span>{/if}
                {#each equationParts(row) as part}
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
                {#if row.bracket}<span class="rc-bracket-mark">)</span>{/if}
              </span>
              {#if partsGloss}<span class="rc-greekgloss"><Marked text={row.gloss} /></span>{/if}
              {#if row.ref}<span class="rc-greekref">{row.ref}</span>{/if}
            </div>
          {:else if b.layout === 'verseExamples' || row.greek2}
            <!-- 5F: a worked verse example set over up to two lines, with its
                 gloss and citation under it. One tap target: the two lines are
                 one phrase and one clip (chapter 8's Examples page). -->
            <!-- One tap target, one clip: the original wires BOTH displayed
                 lines of a two-line verse to the SAME full-verse clip
                 (7_ADJS.TBK WordSelection handlers: pp3 for the whole Lk 2:25
                 verse, pp4 twice for both Mat 23:28 lines). The audio2
                 per-line split PATCH2 invented here was wrong and is removed
                 — 5F-FEEDBACK3 item 2 / 5F-SPEC1-PATCH3.md. -->
            <div class="rc-greekrow rc-verse-example" style="--greek-cols:1">
              <button class="rc-verse-greek greek greek-say" disabled={!row.audio}
                      on:click={() => playAudio(row.audio)}>
                <span class="rc-verse-line">{row.greek}</span>
                {#if row.greek2}<span class="rc-verse-line">{row.greek2}</span>{/if}
              </button>
              {#if row.gloss}<span class="rc-greekgloss"><Marked text={row.gloss} /></span>{/if}
              {#if row.ref}<span class="rc-greekref">{row.ref}</span>{/if}
            </div>
          {:else}
            {@const cellCount = (row.label ? 1 : 0) + (row.greek ? 1 : 0)
              + ((row.gloss != null && row.gloss !== '') || row.suffix ? 1 : 0)}
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
              {#if row.gloss != null && row.gloss !== ''}
                <!-- 5G: chapter 9's Compound Verbs rows print the preposition
                     the compound is built from AFTER the gloss, in its own
                     parentheses ("I go in, enter (εἰς)"). It is displayed
                     Greek with a clip of its own, so it is a tap target of its
                     own (directive 9) — and separate from the headword's, so
                     the two never speak over each other. -->
                <span class="rc-greekgloss"><Marked text={row.gloss} />{#if row.suffix}{' '}<button class="rc-greeksuffix greek greek-say" disabled={!row.suffix.audio} on:click={() => playAudio(row.suffix.audio)}>{row.suffix.greek}</button>{/if}</span>
              {:else if row.suffix}
                <span class="rc-greekgloss"><button class="rc-greeksuffix greek greek-say" disabled={!row.suffix.audio} on:click={() => playAudio(row.suffix.audio)}>{row.suffix.greek}</button></span>
              {/if}
              {#if row.ref}<span class="rc-greekref">{row.ref}</span>{/if}
            </div>
          {/if}
        {/each}
        {#if b._verify}<div class="pending-verification compact">Some chart details are pending verification.</div>{/if}
      </div>

    {:else if b.type === 'presentFutureRows'}
      <!-- 5G-SPEC1 §4.4: a present form beside its future. The SAME data shape
           serves the chapter's two teaching charts and its five stem-variation
           popups, because the original prints them two ways and the difference
           is exactly whether the chart is HEADED:
             headers  a two-column chart under "Present" / "Future" headings,
                      each form's gloss on its own line under it (the Deponent
                      Futures and Irregular Futures topics).
             none     one derivation per line, "ἔχω ==> ἕξω", with the gloss
                      beside it (the palatal/labial/dental/liquid/sibilant
                      popups). The arrow is the original's own notation.
           A block may also say so outright with layout: "arrow" | "columns".
           Greek cells are tap targets; glosses are not (directive 9). -->
      {@const arrowForm = b.layout === 'arrow' || (b.layout !== 'columns' && !Array.isArray(b.headers))}
      <div class="rc-pfrows" class:arrow-form={arrowForm} class:rc-gap-before={b.gapBefore}>
        {#if Array.isArray(b.headers) && b.headers.length}
          <div class="rc-pfhead">{#each b.headers as header}<span><Marked text={header} /></span>{/each}</div>
        {/if}
        {#each b.rows || [] as row}
          {@const present = row.present || {}}
          {@const future = row.future || {}}
          {#if arrowForm}
            <div class="rc-pfrow">
              <span class="rc-pfcell" data-side="present">
                <button class="rc-pfgreek greek greek-say" disabled={!present.audio}
                        on:click={() => playAudio(present.audio)}>{present.greek || ''}</button>
              </span>
              <span class="rc-pfarrow" aria-hidden="true">==&gt;</span>
              <span class="rc-pfcell" data-side="future">
                <button class="rc-pfgreek greek greek-say" disabled={!future.audio}
                        on:click={() => playAudio(future.audio)}>{future.greek || ''}</button>
              </span>
              <span class="rc-pfgloss">{#if future.gloss}<Marked text={future.gloss} />{/if}{#if present.gloss}<Marked text={present.gloss} />{/if}</span>
            </div>
          {:else}
            <div class="rc-pfrow">
              {#each [present, future] as cell, sideIndex}
                <span class="rc-pfcell" data-side={sideIndex === 0 ? 'present' : 'future'}>
                  <button class="rc-pfgreek greek greek-say" disabled={!cell.audio}
                          on:click={() => playAudio(cell.audio)}>{cell.greek || ''}</button>
                  {#if cell.gloss}<span class="rc-pfgloss"><Marked text={cell.gloss} /></span>{/if}
                </span>
              {/each}
            </div>
          {/if}
        {/each}
      </div>

    {:else if b.type === 'paradigm'}
      <!-- A conjugation/declension chart. Its own component because the same
           grid is ALSO a full-page contentAudio mode (paradigmChart) and the
           Hint popup on three chapter-3 drills — one renderer, three hosts. -->
      <Paradigm paradigm={b} title={sameTitle(b.title) ? null : b.title} />

    {:else if b.type === 'prepositionsChart'}
      <!-- 5F §2.1: chapter 6's ten prepositions as a DIAGRAM. The same block
           renders here (a Learn topic) and as the Review Prepositions Chart. -->
      <PrepositionsChart block={b} title={sameTitle(b.title) ? null : b.title} />

    {:else if b.type === 'expander'}
      <details class="rc-expander">
        <summary><Marked text={b.label} /></summary>
        <div class="rc-expander-body">
          {#if b.content && b.content.length}
            <svelte:self blocks={b.content} greekTaps={b.greekTaps || greekTaps} />
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
