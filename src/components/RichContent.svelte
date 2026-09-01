<script>
  // Renders the structured "content" block arrays that carry Chapter 1's
  // teaching prose (the original program's yellow panels). Visual arrangement
  // is pedagogy: headings, hanging-indent bibliographies, aligned definition
  // rows and underlined list lead-ins are all load-bearing, not decoration.
  //
  // Block types: heading | subheading | para | numbered | defList | termList |
  // biblist | refs | note | greekRows | wordUsage | expander | paradigm |
  // presentFutureRows | formula.
  // An unknown type renders LOUD (see the dispatch's final else)
  // rather than vanishing.
  // Trailing { greek, caption?, audio? } "example" objects render in the Greek
  // font and play their clip on tap. defList rows [term, value, audio?] play
  // the row's clip when present.
  import { play } from '../lib/audio.js';
  import { headingKey } from '../lib/content.js';
  import { splitMarkRun, splitTaps } from '../lib/greek.js';
  import { stripMarkup } from '../lib/markup.js';
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
  // The clip for the heading a chart block prints, when the HOST has stepped
  // aside and that title is the page's only heading (D-40, chapter 12).
  export let titleAudio = null;
  // Clips for Greek printed in a chart's `note` line, where the host declared
  // them for this page's own text (chapter 12's topic `audioMap`).
  export let noteTaps = null;
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

    {:else if b.type === 'formula'}
      <!-- 5G-SPEC3: the future-tense construction is three centred authored
           lines with two deliberately different tap boundaries. The whole
           morpheme equation is ONE button (including plus signs), while only
           the named Greek word inside the worked example is a button. Plain
           English remains inert ink. -->
      <div class="rc-formula" class:rc-center={b.align === 'center'}
           class:rc-gap-before={b.gapBefore}>
        {#each b.lines || [] as line}
          {#if line.tapUnit}
            <button class="rc-formula-line rc-formula-unit greek-tap greek"
                    on:click={() => playAudio(line.audio)}>{line.text}</button>
          {:else if line.greekTap}
            <div class="rc-formula-line">{#each splitTaps(line.text, { [line.greekTap.word]: line.greekTap.audio }) as seg}{#if seg.audio}<button class="greek-tap greek" on:click={() => playAudio(seg.audio)}>{seg.t}</button>{:else}<Marked text={seg.t} />{/if}{/each}</div>
          {:else}
            <div class="rc-formula-line"><Marked text={line.text} /></div>
          {/if}
        {/each}
      </div>

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

    {:else if b.type === 'termList'}
      <!-- R7 / DISCLOSURE-RULES §8 broken item 2: chapter 2's Identifying Verbs
           terms. The two-column defList this replaces gave the definition
           whatever width the longest TERM left over, and item 2 ("Aspect:", the
           longest definition of the six) wrapped into a ribbon three words
           wide. A term now owns its own line in green and its definition sets
           full width beneath it — the original's own arrangement, and the same
           term-over-text shape `subheading` already uses for the Grammar Review
           Nouns page.
           A term carrying `link` is a C3 trigger and takes the green underline
           every other in-text link takes (R1). A term without one is plain
           green: not underlined, not a button, nothing to tap. -->
      <div class="rc-termlist" class:rc-gap-before={b.gapBefore}>
        {#each b.items || [] as item}
          {@const popup = linkedPopup(item.link)}
          <div class="rc-termitem">
            {#if popup}
              <button class="rc-term-name popup-link" on:click={() => openPopup(popup)}><Marked text={item.term} /></button>
            {:else}
              <span class="rc-term-name"><Marked text={item.term} /></span>
            {/if}
            <div class="rc-term-def"><Marked text={item.def} /></div>
          </div>
        {/each}
      </div>

    {:else if b.type === 'wordUsage'}
      <!-- W8: what used to be a POPUP body, rendered inline inside a C2
           "Examples" accordion. Chapter 7's οὐ/οὐκ/οὐχ page and chapter 8's
           Three Uses of αὐτός are both rule lists in which every item is
           disclosed, so both are C2 and both retire their popup mechanism
           (D-31 amended for ch7's number markers; ch8's three slug-linked
           popups retired with the same conversion).
           TWO SOURCE SHAPES, ONE BLOCK, because the popups had two shapes and
           the content is not ours to reshape:
             ch7  a Greek headword, its gloss, and the condition it applies
                  under — then the examples.
             ch8  a TITLE naming the use ("αὐτός as a pronoun"); those popups
                  carry no headword of their own — then the examples.
           Every field renders only when present, which is exactly how
           PopupSheet.svelte reads the same fields on its own two branches, and
           each field keeps that sheet's treatment so the same content does not
           look like two different things in two hosts.
           Greek-tap rule (directive 9): the headword and every example phrase
           play their own clip; titles, glosses, conditions and references are
           not tappable. -->
      <div class="rc-wordusage">
        {#if b.greek}
          <button class="rc-wu-head greek greek-say" disabled={!b.audio}
                  on:click={() => playAudio(b.audio)}>{b.greek}</button>
        {/if}
        {#if b.title}<div class="rc-wu-title"><Marked text={b.title} /></div>{/if}
        {#if b.gloss}<div class="rc-wu-gloss"><Marked text={b.gloss} /></div>{/if}
        {#if b.condition}<div class="rc-wu-condition"><Marked text={b.condition} /></div>{/if}
        {#if b.examples && b.examples.length}
          <div class="rc-wu-examples">
            {#each b.examples as example, index}
              <div class="rc-wu-example" data-example-index={index}>
                <button class="rc-wu-example-greek greek greek-say" disabled={!example.audio}
                        on:click={() => playAudio(example.audio)}>{example.greek}</button>
                {#if example.gloss}<div class="rc-wu-example-gloss"><Marked text={example.gloss} /></div>{/if}
                {#if example.ref}<div class="rc-wu-example-ref">{example.ref}</div>{/if}
              </div>
            {/each}
          </div>
        {/if}
      </div>

    {:else if b.type === 'greekRows'}
      {@const syllableMatrix = isSyllableMatrix(b)}
      {@const rowLabels = syllableMatrix && hasRowLabels(b)}
      {@const matrixCols = syllableMatrix ? b.columns.length + (rowLabels ? 1 : 0) : 0}
      {@const gridVars = `--greek-cols:${syllableMatrix ? matrixCols : (b.columns || []).length};--greek-datacols:${(b.columns || []).length}`}
      <div class="rc-greekrows" class:syllable-matrix={syllableMatrix} class:row-labels={rowLabels}
           class:gloss-only={b.layout === 'glossOnly'} class:english-pairs={b.layout === 'englishPairs'}
           class:compound-verbs={b.layout === 'compoundVerbs'}
           class:contraction={b.layout === 'contraction'}
           class:derivation={b.layout === 'derivation'}
           class:key-letter-box={b.layout === 'keyLetterBox'}
           class:transformation={b.layout === 'transformation'}
           class:stem-list={b.layout === 'stemList'}
           class:ending-transformation={b.layout === 'endingTransformation'}
           class:shift-summary={b.layout === 'shiftSummary'}
           class:principal-parts={b.layout === 'principalParts'}
           class:titled={b.title} class:centered={b.centered} class:rc-gap-before={b.gapBefore}
           class:paired-gutter={b.pairedGutter}>
        <!-- `headerUnderline` USED TO BIND `head-underline` HERE, and does not
             any more (DISCLOSURE-SPEC3 W5.1, amended §3.2). The chapter-8
             Number chart's Singular/Plural headers were underlined because the
             original prints them that way — but the port gave green underline a
             job the original's typography never had, and the review (item 4)
             read those headers as broken links. Green underline is now
             EXCLUSIVE to tappable elements app-wide, so the key becomes inert
             provenance like `numberPopupRef`: it stays in the data recording
             what the source page looked like, and the renderer no longer has a
             path that can act on it. Headers render plain. -->
        <!-- B5: Review Marks groups its rows under a title ("Breathing:",
             "Punctuation:", "Apostrophe:  ( ᾽ )  elided letters"). The title
             owns its line in the heading green; the rows hang beneath it. -->
        {#if b.title}<div class="rc-greektitle"><Marked text={b.title} /></div>{/if}
        {#if b.layout === 'keyLetterBox'}
          <!-- 5I-SPEC1 4.6: the Key Letter Box's COLUMN HEADERS are C3 in-chart
               triggers, not labels: Unvoiced / Voiced / Aspirate each open
               their own popup, as do the three row labels beside the grid --
               six triggers in one chart, a shape no earlier chapter has.
               DISCLOSURE-RULES 3.3: an in-chart trigger keeps its existing
               appearance and takes NO green underline, which would collide
               with the blue Greek-tap convention. The original prints these
               six blue and unmarked, so that is what they are here: blue
               because they are tappable (directive 8), and nothing else.
               `columns` on this layout is a list of OBJECTS ({label,
               popupRef}), which is why the shared string header below cannot
               draw it. -->
          <div class="rc-klb-head">
            <span class="rc-klb-corner">&nbsp;</span>
            {#each b.columns as column}
              {@const columnPopup = linkedPopup(column.popupRef)}
              {#if columnPopup}
                <button class="popup-link rc-chart-trigger" data-chart-trigger={column.popupRef}
                        on:click={() => openPopup(columnPopup)}>{column.label}</button>
              {:else}
                <span class="rc-klb-label">{column.label}</span>
              {/if}
            {/each}
          </div>
        {:else if b.columns}
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
          {:else if b.layout === 'contraction'}
            <!-- 5H §4 (ch12 Augments > Contraction Examples): the original
                 prints each example as one line reading rule, augmented form,
                 then the lemma the augment was added to -- "ε + α = η
                 ἤκουον   ἀκούω + ε augment". BOTH Greek forms carry their own
                 clip and tap; the rule is notation and stays ink. The
                 derivation is one unit, so at phone widths it drops to its own
                 line under the pair rather than splitting mid-equation. -->
            <div class="rc-greekrow rc-contraction-row" style="--greek-cols:2">
              <span class="rc-contraction-rule">{row.gloss}</span>
              {#if row.audio}
                <button class="rc-contraction-form greek greek-say" on:click={() => playAudio(row.audio)}>{row.greek}</button>
              {:else}
                <span class="rc-contraction-form greek">{row.greek}</span>
              {/if}
              <span class="rc-parts">
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
              </span>
            </div>

          {:else if b.layout === 'keyLetterBox'}
            <!-- The nine consonant cells are NOTATION. No clip exists for any
                 of them, the rail walk shows no hand cursor over one, and the
                 chart teaches what the LETTERS look like across three voiced
                 classes rather than how each sounds alone -- the same
                 treatment chapter 12's augment rule lines get. So they render
                 in the Greek face, in ink, with nothing to press; only the six
                 labels around the grid are live. -->
            {@const rowPopup = linkedPopup(row.popupRef)}
            <div class="rc-greekrow rc-klb-row">
              {#if rowPopup}
                <button class="popup-link rc-chart-trigger" data-chart-trigger={row.popupRef}
                        on:click={() => openPopup(rowPopup)}>{row.label}</button>
              {:else}
                <span class="rc-klb-label">{row.label}</span>
              {/if}
              {#each equationParts(row) as part}
                <span class="rc-klb-cell greek">{part.greek != null ? part.greek : part.text}</span>
              {/each}
            </div>

          {:else if b.layout === 'transformation' || b.layout === 'shiftSummary'}
            <!-- 5I-SPEC1 4.6. `transformation` is chapter 13's three labelled
                 rule lines ("Labials:" then the pi/beta/phi rule);
                 `shiftSummary` is chapter 16's four label-less ones. Both are
                 RULE NOTATION printed in the Greek face: a rule is not a word,
                 no clip is wired to one, and the alignment of the columns
                 INSIDE the line is the teaching -- which is why the text stays
                 one preformatted run rather than being tokenised into taps.
                 The label gutter is what keeps a set of rules stacked over
                 each other. -->
            <div class="rc-greekrow rc-rule-row" class:no-label={row.label == null}>
              {#if row.label != null}<span class="rc-rule-label">{row.label}</span>{/if}
              {#each equationParts(row) as part}
                <span class="rc-rule-text greek">{part.greek != null ? part.greek : part.text}</span>
              {/each}
            </div>

          {:else if b.layout === 'stemList'}
            <!-- 5I-SPEC1 4.6 (chapters 14 and 15, the Aorist Stems of Verbs
                 lists): lemma, dash, aorist, gloss. BOTH Greek forms are
                 displayed Greek with a clip of their own, so both tap and
                 neither speaks for the other (directive 9). The dash between
                 them is the original's own connector and is inert. A row may
                 additionally carry a popupRef: chapter 14 prints its aorist of
                 blepo blue with a hand cursor over it (ch14railwalk p7/p8)
                 because it opens a note on which verb that form really belongs
                 to. The aorist cell is therefore BOTH an audio tap and an
                 in-chart trigger, and the two cannot share one press -- the
                 note gets its own marker beside the form rather than stealing
                 the form's clip. -->
            {@const stemPopup = linkedPopup(row.popupRef)}
            <div class="rc-greekrow rc-stem-row">
              {#if row.audio}
                <button class="rc-stem-lemma greek greek-say" on:click={() => playAudio(row.audio)}>{row.greek}</button>
              {:else}
                <span class="rc-stem-lemma greek">{row.greek}</span>
              {/if}
              <span class="rc-stem-forms">
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
                {#if stemPopup}
                  <!-- 5I-SPEC2 §3.3 / DISCLOSURE-RULES §3.12: the note marker
                       is a MODAL TRIGGER, not an in-chart one. It shipped
                       carrying `.rc-chart-trigger`, which is the §3.3 exemption
                       and made it blue and un-underlined beside a form that is
                       itself a blue Greek tap — the one collision §3.3 exists
                       to avoid. It is `.rc-prose-trigger` now, so its glyph and
                       its ring are both the trigger green. -->
                  <button class="popup-link rc-prose-trigger rc-stem-note" data-chart-trigger={row.popupRef}
                          aria-label="About this form" on:click={() => openPopup(stemPopup)}>?</button>
                {/if}
              </span>
              {#if row.gloss != null && row.gloss !== ''}<span class="rc-stem-gloss">{row.gloss}</span>{/if}
            </div>

          {:else if b.layout === 'endingTransformation'}
            <!-- 5I-SPEC1 4.6 (chapters 15 and 16): a labelled rule line with a
                 WORKED EXAMPLE indented beneath it. The label is an in-chart C3
                 trigger where the chapter wires one (chapter 15's Palatals /
                 Labials / Dentals open sound descriptions; chapter 16's do
                 not), and chapter 16's third line carries no label at all. The
                 rule itself is notation and stays ink. `noteAudioMap` maps the
                 forms inside the example to clips, so both sides of the
                 derivation tap and the connectors between them do not -- the
                 same form-to-clip map chart notes already use. -->
            {@const rulePopup = linkedPopup(row.popupRef)}
            <div class="rc-etf-row">
              <div class="rc-etf-rule" class:no-label={row.label == null}>
                {#if row.label != null}
                  {#if rulePopup}
                    <!-- 5I-SPEC2 §3.3 / DISCLOSURE-RULES §3.11 (Nathanael's
                         ruling on VERIFY-5I-RESPONSE item 9): A PROSE RULE LIST
                         IS TEXT, NOT A CHART. This block lays out a page's
                         running teaching prose — a rule line with a worked
                         example under it — so its hot label is a C3 IN-TEXT
                         link and takes §3.2's green underline, not the in-chart
                         blue. It shipped as `.rc-chart-trigger` in 5I, which is
                         the class §3.3 exempts, and that was the error the rule
                         now names: §3.3 governs the cells and labels of an
                         ACTUAL chart (paradigm, grid, table) — the ch13 Key
                         Letter Box and the ch6 case-chart glosses — and this is
                         neither. Bold is kept: the original sets these labels
                         bold and nothing in §3.2 asks for the weight. -->
                    <button class="popup-link rc-etf-label rc-prose-trigger" data-chart-trigger={row.popupRef}
                            on:click={() => openPopup(rulePopup)}>{row.label}</button>
                  {:else}
                    <span class="rc-etf-label">{row.label}</span>
                  {/if}
                {/if}
                {#each equationParts(row) as part}
                  <span class="rc-etf-text greek">{part.greek != null ? part.greek : part.text}</span>
                {/each}
              </div>
              {#if row.note}
                <div class="rc-etf-example greek">{#each splitTaps(row.note, row.noteAudioMap || null) as seg}{#if seg.audio}<button class="greek-tap greek" on:click={() => playAudio(seg.audio)}>{seg.t}</button>{:else}{seg.t}{/if}{/each}</div>
              {/if}
            </div>

          {:else if b.layout === 'principalParts'}
            <!-- 5I-SPEC1 4.6 (chapter 16's Comparison with Greek): the six
                 principal parts of ballo. The original sets them as a
                 three-across grid with each label over its form; the data
                 emits SIX LABELLED ROWS, which is the shape the spec asks for
                 and the one that leaves room for a label as long as
                 "Perf mid/pass" at phone width. Every form keeps its own clip
                 and its own tap. The labels are underlined in the original and
                 render WITHOUT the underline: green underline is exclusive to
                 tappable elements app-wide (DISCLOSURE-RULES 3.2), and a
                 column label is not one. -->
            <div class="rc-greekrow rc-pp-row">
              <span class="rc-pp-label">{row.label}</span>
              <span class="rc-pp-forms">
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
                <!-- 5I-SPEC2 §3.1 / DISCLOSURE-RULES §4.10: ONE FLOWING LINE.
                     The original's second line is its panel's width, not the
                     verse's punctuation, so the two join with a single space
                     and wrap where the card wraps them. `greek2` stays in the
                     data as extraction provenance (positional pool line 2);
                     only the render joins. -->
                <span class="rc-verse-line">{row.greek}</span>{#if row.greek2}<span class="rc-verse-line">{` ${row.greek2}`}</span>{/if}
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
      <Paradigm paradigm={b} title={sameTitle(b.title) ? null : b.title} {suppressTitle} {titleAudio}
                noteTaps={b.noteTaps || noteTaps} />

    {:else if b.type === 'prepositionsChart'}
      <!-- 5F §2.1: chapter 6's ten prepositions as a DIAGRAM. The same block
           renders here (a Learn topic) and as the Review Prepositions Chart. -->
      <PrepositionsChart block={b} title={sameTitle(b.title) ? null : b.title} />

    {:else if b.type === 'expander'}
      <!-- R2 / DISCLOSURE-RULES §3.1: ONE accordion look for every category in
           every chapter — green summary, left caret, no underline, collapsed by
           default. `summaryStyle: "green"` (chapter 2's 6 Accent Rules, adopted
           2026-08-14 after a four-way on-device comparison) was the trial of
           that look on one page; the ratified sheet makes it universal, so the
           conditional class is gone and the styling is unconditional in
           app.css. The key stays harmless if it remains in data.
           THE LABEL IS PLAIN TEXT, not <Marked>: §3.1 requires accordion titles
           to carry no underline, and a C2 title drawn from rule text can arrive
           carrying the rule's own [[u]] run ("Words with [[u]]No[[/u]] Accents").
           stripMarkup drops the markers rather than rendering them, so a marker
           can never reach the screen as literal text either. -->
      <details class="rc-expander">
        <summary>{stripMarkup(b.label)}</summary>
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
