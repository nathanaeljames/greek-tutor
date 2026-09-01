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
  import { play, stop as stopAudio } from '../lib/audio.js';
  import { headingKey } from '../lib/content.js';
  import { splitGreekRuns, splitTaps } from '../lib/greek.js';
  import EndingsGrid from './EndingsGrid.svelte';
  import MeaningsCard from './MeaningsCard.svelte';
  import ParadigmActions from './ParadigmActions.svelte';
  export let paradigm;
  export let title = null;
  // The heading the HOST already printed above this chart, so a chart title
  // that repeats it prints once (the same contract RichContent applies to a
  // block title). Only the `charts[]` fallback below consults it: a title the
  // host passed in explicitly has already been folded.
  export let suppressTitle = null;
  // D-40: the panel heading is itself a Greek tap where the original wires one
  // ("Imperfect Active Indicative of λύω" plays λύω). The HOST supplies the
  // clip -- chapter 12 declares it on the topic (or on the Quick Review
  // activity) and the chart title is what ends up printing that heading, so
  // the tap follows the heading rather than the block it was declared on.
  export let titleAudio = null;
  // A form -> clip map the HOST declared FOR THIS PAGE'S OWN TEXT (chapter
  // 12's topic-level `audioMap`, which names θέλω and ἤθελεν because the ἔχω
  // note is where they are displayed). A chart's own `noteTaps` still wins.
  // Deliberately not the chapter-wide tap map: that would silently blue words
  // in older chapters' notes that the original prints as plain notation
  // (chapter 5's "Note ὁ and ἡ are enclitics").
  export let noteTaps = null;
  // The control row (Say Paradigm, and the switch where a chart has one)
  // normally lives inside the chart body. A host that pins its own row —
  // the composite two-state Hint modal, whose footer holds Say + toggle +
  // Close outside the scroller (DISCLOSURE-RULES §4.3) — passes true and draws
  // the row itself. Every other host passes nothing and is unaffected.
  export let actionsPinned = false;
  // DISCLOSURE-SPEC1 W4.1/W5: this chart IS the modal's body. The chart scrolls
  // inside .pg-body and the control row sits outside that scroller, so the
  // say-all and its navigation control are on screen from the moment the dialog
  // opens and never scroll away (§4.3) — the modal's own .modal-actions footer
  // holds Close beneath it. It also switches `endings` from a nested modal to
  // an in-place STATE of this chart, because §4.4 abolishes stacking a second
  // modal on top of the first. In main content the prop is absent and the
  // Endings button keeps its own single-level modal (one level is not
  // stacking, W5.4).
  export let modalHost = false;
  // 5F-FEEDBACK2 item 12 (Nathanael, 2026-08-09): a HOST may rename the
  // More/Back pair per chart index — the Adjective Case Drill's Hint reads
  // "Plural"/"Singular" while the Learn topic showing the SAME chart stack
  // keeps the original's own More/Back (ch7railwalk p2). The label always
  // names the TARGET chart, same idea as the 'named' switch kind.
  export let switchLabels = null;

  let chartIndex = 0;
  // Two different disclosures of the same `endings` table, one per host.
  // endingsState is the in-place modal-host state (§4.4); endingsOpen is the
  // main-content single-level modal (W5.4). Never both.
  let endingsState = false;
  let endingsOpen = false;
  let renderedParadigm = null;

  // RichContent is reused while topicPages steps between topics. Reset on the
  // block object, not only on an ActivityHost remount, so returning to a
  // multi-chart topic always starts at chart 1.
  $: if (paradigm !== renderedParadigm) {
    renderedParadigm = paradigm;
    chartIndex = 0;
    endingsState = false;
    endingsOpen = false;
  }

  $: charts = Array.isArray(paradigm?.charts) && paradigm.charts.length
    ? paradigm.charts
    : [paradigm || {}];
  $: chart = charts[chartIndex] || charts[0] || {};
  // 5H W3: a `charts[]` block carries its heading on each CHART, not on the
  // wrapper — chapter 11 pages "ἐκεῖνος — that/those" over a topic whose radio
  // label is '"That" Paradigm', and the reflexive stack renames itself First /
  // Second / Third Person as More/Back steps. A host that has its own title
  // still wins (chapter 8's "Third Person Paradigm" sits on the wrapper), and a
  // chart title that only repeats the heading the host already printed is
  // dropped rather than stacked under it — chapters 4/5/7 title their charts
  // exactly as their topics are titled and must keep printing ONE heading.
  $: chartHeading = title
    || (charts.length > 1 && chart.title
      && !(suppressTitle && headingKey(chart.title) === headingKey(suppressTitle))
      ? chart.title : null);
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
  // 5I-SPEC1 4.1 -- THE SIX-COLUMN CHART. Chapter 13's pas adjective is the
  // widest chart in the app: Masculine / Feminine / Neuter twice over, under a
  // spanning Singular / Plural header row. At 320px it does not fit and this
  // app CLIPS rather than scrolls, so the shipped six-across render lost its
  // right-hand columns and overprinted its headers with nothing to scroll and
  // nothing to error (measured: the grid overran by 10px and individual cells
  // by up to 10px, with headers reading "MASCULFEMININEUTER").
  //
  // A PAGER IS FORBIDDEN on the Quick Review copy (DISCLOSURE-RULES 4.6:
  // students print Review pages, so everything must be in one flowing scroll)
  // and inventing one is explicitly ruled out by the spec. What the same rule
  // asks for instead is already written down: a C9 page "stacks paradigms
  // vertically (Singular above Plural)". So a chart that declares
  // `columnGroups` draws ONE BLOCK PER GROUP, stacked, each headed by its
  // group label and carrying its own copy of the case-label column. Nothing is
  // hidden, nothing pages, and the widest thing on screen becomes a
  // three-column chart, the density chapter 5's article chart and chapter 16's
  // passive stems already sit at comfortably.
  //
  // Every cell keeps its own clip and its own tap; the say-all still speaks the
  // whole paradigm once, beneath both halves (NIT-LOG N-1: a stacked Quick
  // Review chart gets ONE button, after the last half). Chapter 13's pas chart
  // is the only chart in sixteen chapters that declares `columnGroups`, so no
  // other chart's rendering moves.
  $: groupedColumns = columnGroups.length > 1
    ? columnGroups.reduce((acc, group) => {
        const from = acc.at;
        const span = group.span || 1;
        acc.at = from + span;
        acc.blocks.push({
          label: group.label,
          from,
          columns: columns.slice(from, from + span),
          columnAudio: columnAudio.slice(from, from + span)
        });
        return acc;
      }, { at: 0, blocks: [] }).blocks
    : [];
  $: rows = chart.rows || [];
  $: showGlosses = chart.showGlosses !== false;
  $: hasCaseLabels = rows.some(row => row.label != null);
  $: hasLongCaseLabels = rows.some(row => String(row.label || '').length > 5);
  // 5I-SPEC1 4.7 -- A CHART WITH NO ROW LABELS AT ALL. Chapter 16's Passive
  // Stems table is a list of verbs across three tense columns; every row's
  // label is null, so the label gutter is a blank column stealing width from
  // three columns of long forms, and none of the density rules fired because
  // every one of them keys off having case labels. At 320px that put
  // ἀποστέλλω, ἐγερθήσομαι and γνωσθήσομαι through the "break anywhere" rule
  // and each printed across two lines mid-word.
  //
  // Scoped to THREE OR MORE columns so the one other label-less chart in
  // sixteen chapters -- chapter 7's two-column εἰμί paradigm, device-verified
  // as it stands -- is untouched.
  $: hasRowLabels = rows.some(row => {
    const label = row.label != null ? row.label : row.person;
    return label != null && String(label) !== '';
  });
  $: labelFreeWideChart = !hasRowLabels && effectiveColumnCount >= 3;
  // How long a form has to be before the cells need shrinking depends on how
  // many columns share the width. Two columns tolerate a nine-letter form;
  // THREE do not — chapter 7's adjective paradigm sets ἀγαθῶν, ἀγαθοῖς and
  // ἀγαθούς three abreast and broke each of them across two lines at 380px
  // (rail-walk comparison against ch7railwalk p14). Chapter 5's three-column
  // article chart holds forms of three and four letters and is untouched.
  // 4.1: how many columns are on screen AT ONCE, which is what the density
  // tiers are about. A grouped chart draws one group at a time down the page,
  // so a six-column paradigm is three columns wide and takes the three-column
  // type sizes rather than the crushed six-column ones.
  $: effectiveColumnCount = groupedColumns.length
    ? Math.max(...groupedColumns.map(group => group.columns.length))
    : columns.length;
  $: formLimit = effectiveColumnCount >= 3 ? 5 : 7;
  $: hasLongForms = (hasCaseLabels || labelFreeWideChart) && rows.some(row => (row.cells || [])
    .some(cell => [...String(cell.greek || '')].length > formLimit));
  // Endings rows are flat [ending, gloss, ending, gloss] tuples -- one pair per
  // number column, so the popup lines up with the chart above it.
  $: endingRows = (chart.endings && chart.endings.rows) || [];
  $: sayWholeEach = chart.sayWholeEach || [];
  $: switchKind = paradigm?.switch || null;
  $: hasSwitch = charts.length > 1 && (switchKind === 'moreBack' || switchKind === 'named');
  // R5 / DISCLOSURE-RULES §4.1-§4.2 (DISCLOSURE-SPEC1 W6): the control the
  // chart count decides, NOT the declared switch kind.
  //   two charts    ONE toggle on the say-all line, whatever the kind. `named`
  //                 labels it with the target chart's name (Singular/Plural);
  //                 `moreBack` alternates a single button — More on chart 0,
  //                 Back on chart 1 — because its contrast is lexical and has
  //                 no one-word name (λόγος/ἄνθρωπος). Before this round
  //                 `moreBack` ALWAYS drew the centred pair, so a two-chart
  //                 stack showed a permanently-greyed button beside a live one
  //                 where the sheet asks for a single alternating control.
  //   three or more the centred Back/More pair, both always visible, the
  //                 invalid direction disabled (chapter 8's Third Person
  //                 Paradigm is the in-app model). A `named` switch is
  //                 meaningless past two charts — §5 defines it as the
  //                 one-word contrast between a PAIR — so 3+ is the pair
  //                 however the data spelled the kind.
  $: twoChartToggle = hasSwitch && charts.length === 2;
  $: hasMoreBackNav = hasSwitch && charts.length > 2;
  $: namedTarget = charts.length > 1 ? (chartIndex + 1) % charts.length : -1;
  // The single toggle always names where it GOES, never where it is.
  $: toggleLabel = switchKind === 'named'
    ? (charts[namedTarget]?.name || `Chart ${namedTarget + 1}`)
    : ((switchLabels && switchLabels[namedTarget])
      || (charts[namedTarget] && charts[namedTarget].switchLabel)
      || (chartIndex === 0 ? 'More' : 'Back'));
  // W5: the Endings STATE. Only chapter 3's λύω paradigm carries an `endings`
  // table, and it is the hint target of all three chapter-3 drills as well as a
  // Learn topic of its own — the same chart in a modal and in main content,
  // which is why the disclosure differs by HOST and not by chapter.
  $: endingsInline = modalHost && !!chart.endings;
  $: showingEndings = endingsInline && endingsState;
  // §4.1 named-style labels: the button says which state it goes to.
  $: endingsToggleLabel = showingEndings
    ? (chart.paradigmLabel || 'Paradigm')
    : (chart.endings?.label || 'Endings');
  // §4.4: a replaced state that carries audio gets its own say button, in the
  // same slot and class as Say Whole Paradigm. Left as a VERIFY decision
  // (DISCLOSURE-SPEC1 W5.2) — it is a one-string change.
  $: endingsSayLabel = chart.endings?.sayLabel || 'Say Endings';
  // 5F-FEEDBACK2 item 27 (Nathanael, 2026-08-09): the More/Back pair lives in
  // its OWN row under the action buttons — Back always in the left slot, More
  // always in the right — so stepping through a stack never makes a button
  // jump. The say/endings row above it no longer counts the switch.
  $: hasActions = !!chart.sayWhole || !!chart.endings || sayWholeEach.length > 0
    || twoChartToggle;
  // §4.3 AS AMENDED 2026-08-17. Pinning happens in MODALS ONLY, at most one
  // line, and only when that line carries navigation.
  //
  // What this replaces: DISCLOSURE-SPEC1 read §4.3's "sticky at the panel
  // bottom in main content" literally and pinned Learn-page control rows too.
  // The device review revoked it in as many words ("my comment about pinning
  // the nav items applies ONLY to nav items in modals"), so `pinnedControls`
  // and its sticky rule are gone rather than narrowed — there is no
  // main-content pinning left to configure.
  //
  // `pinNav`     is there a pinned line at all? Only in a modal, and only with
  //              a navigation control to put on it. A say button is NEVER
  //              pinned alone (review item 2(c)).
  // `pinActions` does the say-all row share that line? Only in the two-screen
  //              composition, where the toggle sits beside it (pane f). At
  //              three-plus the pinned line is the Back/More pair and the say
  //              button stays in the scrolling content with its chart, which
  //              is what keeps this to ONE pinned line.
  // §4.9 (RATIFIED 2026-08-31, VERIFY-5I-RESPONSE item 11; 5I-SPEC2 §3.4):
  // A LONG SINGLE LIST IN A MODAL SCROLLS UNDER A FROZEN HEADER ROW. When a
  // modal holds ONE list — not a multi-chart bundle — it is never split into
  // pages; it is one scrolling list whose column header ("Present Active /
  // Aorist Passive / Future Passive") stays put at the top of the modal's
  // scroll area while the rows move beneath it. So the condition is exactly
  // "one chart, drawn as one grid, in a modal": a bundle still pages per §4.2
  // and a grouped chart draws a header per group rather than one for the list.
  // A list too short to scroll never shows the difference, which is why this
  // needs no height threshold and gets no guess about one.
  $: frozenHead = modalHost && charts.length === 1
    && !groupedColumns.length && columns.length > 0;
  $: navControl = twoChartToggle || endingsInline ? 'toggle' : (hasMoreBackNav ? 'pair' : null);
  $: pinNav = modalHost && !actionsPinned && !!navControl;
  $: pinActions = pinNav && navControl === 'toggle' && hasActions;
  // The row's whole resolved presentation, handed to ParadigmActions as one
  // object so the two placements cannot be given different halves of it.
  $: actionState = {
    showingEndings, endingsInline, endingsState, endingsSayLabel, endingsToggleLabel,
    sayWholeEach, twoChartToggle, toggleLabel, switchKind, namedTarget
  };
  $: moreLabel = (switchLabels && switchLabels[chartIndex + 1])
    || (charts[chartIndex + 1] && charts[chartIndex + 1].switchLabel) || 'More';
  $: backLabel = (switchLabels && switchLabels[chartIndex - 1])
    || (charts[chartIndex - 1] && charts[chartIndex - 1].switchLabel) || 'Back';

  function switchChart(nextIndex) {
    // The old chart no longer owns the screen. Stop whatever it started before
    // its cells and its say action are replaced (rule A4); the new state stays
    // silent until the learner taps it.
    stopAudio();
    chartIndex = Math.max(0, Math.min(charts.length - 1, nextIndex));
    endingsState = false;
    endingsOpen = false;
  }

  // §4.4: NOTHING AUTOPLAYS ON STATE CHANGE. openEndings() used to play
  // chart.endings.audio here — the D-10 restoration, which put the clip behind
  // the Endings tap because the original ships c_ending with a button that
  // plays nothing. D-10's audio stays restored, but behind the explicit say
  // button the replaced state now carries, which is what D-10's own text
  // ("behind the tap, never on render") already required: opening a disclosure
  // is not the same tap as asking to hear it.
  function toggleEndings() {
    stopAudio();
    endingsState = !endingsState;
  }
  function openEndings() { stopAudio(); endingsOpen = true; }

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
  class:pg-no-row-labels={labelFreeWideChart}
  class:pg-three-columns={effectiveColumnCount === 3}
  class:pg-many-columns={effectiveColumnCount > 3}
  class:pg-modal-host={modalHost}
  class:pg-frozen-head={frozenHead}
  class:pg-pins-nav={pinNav}
  data-chart-index={chartIndex}
  data-chart-count={charts.length}
  data-chart-name={chart.name || ''}
  data-endings-state={endingsInline ? (endingsState ? 'endings' : 'paradigm') : null}>
  {#key chart}
    <!-- W4: the chart BODY. In a modal host this is the only scroller, so the
         control row below it cannot scroll away (§4.3); everywhere else it is a
         plain wrapper and changes nothing.
         DISCLOSURE-SPEC3 W7.1 (re-landed 2026-08-25): in a modal it ALSO
         takes `.modal-scroll`, the class every other dialog's scroller
         carries, so modal-scroller rules reach it by one name. The footer
         divider itself is NOT drawn here: the scroller cannot own the strip
         above the line, because overflow clips at the padding box and
         scrolling content paints straight through any padding the scroller
         carries. The line and both strips are the pinned block's own — see
         the ONE DIVIDER rule in app.css. -->
    <div class="pg-body" class:modal-scroll={modalHost}>
    <!-- In the Endings STATE the heading names the state, not the chart: the
         dialog is showing endings, and leaving "Paradigm" up there put that
         word on screen twice meaning two different things (the chart's own
         title, and the toggle that goes back to it). The main-content Endings
         modal has always titled itself this way; the in-place state now reads
         the same. -->
    {#if showingEndings}
      <div class="pg-title">{chart.endings.label || 'Endings'}</div>
    {:else if chartHeading}
      <div class="pg-title">
        {#if titleAudio}
          {#each splitGreekRuns(chartHeading) as run}{#if run.greek}<button class="greek-tap greek" on:click={() => play(titleAudio)}>{run.t}</button>{:else}{run.t}{/if}{/each}
        {:else}{chartHeading}{/if}
      </div>
    {/if}
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

    {#if showingEndings}
      <!-- §4.4: the Endings state REPLACES the chart in place. No second modal
           opens over the first, and the toggle in the control row below brings
           the paradigm back. -->
      <EndingsGrid rows={endingRows} {columns} />
    {:else}
    <div class="pg-grid" class:pg-grouped={groupedColumns.length}
         style="--pg-cols:{groupedColumns.length ? groupedColumns[0].columns.length : columns.length}">
      {#each groupedColumns as group, groupIndex}
        <!-- 4.1: one block per column group, stacked. The group label is the
             block's heading rather than a spanning cell above six columns.
             The row markup below is the ungrouped branch's, sliced to this
             group's columns; the two are a PAIR and a change to a cell in one
             belongs in the other. Svelte 4 has no snippet to share them with,
             and factoring a component out for one chart in sixteen chapters
             would cost more than it saves. -->
        <div class="pg-group" data-column-group={groupIndex}
             style="--pg-cols:{group.columns.length}">
          <div class="pg-group-label">{group.label}</div>
          <div class="pg-head">
            <span class="pg-person pg-head-spacer">&nbsp;</span>
            {#each group.columns as column, columnIndex}
              {#if group.columnAudio[columnIndex]}
                <button
                  class="pg-column pg-column-audio"
                  data-column-index={group.from + columnIndex}
                  aria-label={`Play ${column}`}
                  on:click={() => play(group.columnAudio[columnIndex])}>
                  {column}
                </button>
              {:else}
                <span class="pg-column" data-column-index={group.from + columnIndex}>{column}</span>
              {/if}
            {/each}
          </div>
          {#each rows as row, rowIndex}
            <div class="pg-row" data-row-index={rowIndex}>
              <span class="pg-person pg-row-label">{row.label ?? row.person ?? ''}</span>
              {#each (row.cells || []).slice(group.from, group.from + group.columns.length) as cell, cellIndex}
                <div
                  class="pg-cell"
                  class:pg-cell-gloss={showGlosses && !!cell.gloss}
                  data-cell-index={group.from + cellIndex}>
                  {#if cell.greek == null && cell.text != null}
                    <span class="pg-cell-text" data-cell-text>{cell.text}</span>
                  {:else}
                    <button
                      class="pg-greek-tap"
                      disabled={!cell.audio}
                      on:click={() => cell.audio && play(cell.audio)}>
                      <span class="greek pg-greek">{cell.greek}</span>
                    </button>
                  {/if}
                  {#if showGlosses && cell.gloss}<span class="pg-gloss">{cell.gloss}</span>{/if}
                </div>
              {/each}
            </div>
          {/each}
        </div>
      {/each}
      {#if !groupedColumns.length && columns.length}
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
      {#each groupedColumns.length ? [] : rows as row, rowIndex}
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
            <div
              class="pg-cell"
              class:pg-cell-gloss={showGlosses && !!cell.gloss}
              data-cell-index={cellIndex}>
              {#if cell.greek == null && cell.text != null}
                <!-- 5I-SPEC1 4.7: A CELL THAT IS NOT A FORM. Chapter 16's
                     Passive Stems chart prints an em dash where a verb has no
                     future passive -- eight of its fifteen rows -- and the data
                     ships that dash as a `text` cell rather than a `greek` one
                     precisely so it cannot be mistaken for a word. It is
                     notation: no clip, no tap, no Greek face, ink not blue
                     (directive 8), and no button for a screen reader to offer.
                     `greek` and `text` are alternatives on a cell; every chart
                     in sixteen chapters that ships only `greek` cells is
                     untouched. -->
                <span class="pg-cell-text" data-cell-text>{cell.text}</span>
              {:else}
                <button
                  class="pg-greek-tap"
                  disabled={!cell.audio}
                  on:click={() => cell.audio && play(cell.audio)}>
                  <span class="greek pg-greek">{cell.greek}</span>
                </button>
              {/if}
              {#if showGlosses && cell.gloss}<span class="pg-gloss">{cell.gloss}</span>{/if}
            </div>
          {/each}
        </div>
      {/each}
    </div>
    {/if}

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
      <div class="pg-note">{#each splitTaps(chart.note, chart.noteTaps || noteTaps) as seg}{#if seg.audio}<button class="greek-tap greek" on:click={() => play(seg.audio)}>{seg.t}</button>{:else}{seg.t}{/if}{/each}</div>
    {/if}

    <!-- THE SAY-ALL ROW, IN FLOW. It scrolls with its chart everywhere except
         a two-screen modal, which is the only composition that pins it
         (amended §4.3: a say button is never pinned unless a navigation
         control shares its line). That covers main content, a three-plus modal
         and a modal with no navigation at all. -->
    {#if !actionsPinned && hasActions && !pinActions}
      <ParadigmActions {chart} state={actionState}
                       on:toggleEndings={toggleEndings}
                       on:openEndings={openEndings}
                       on:switchChart={event => switchChart(event.detail)} />
    {/if}
    <!-- The §4.2 pair, in flow, when this is not a modal. -->
    {#if hasMoreBackNav && !pinNav}
      <div class="pg-nav">
        <button
          class="btn secondary pg-switch pg-switch-back"
          data-paradigm-switch="back"
          data-target-index={chartIndex - 1}
          disabled={chartIndex <= 0}
          on:click={() => switchChart(chartIndex - 1)}>{backLabel}</button>
        <button
          class="btn secondary pg-switch pg-switch-more"
          data-paradigm-switch="more"
          data-target-index={chartIndex + 1}
          disabled={chartIndex >= charts.length - 1}
          on:click={() => switchChart(chartIndex + 1)}>{moreLabel}</button>
      </div>
    {/if}
    </div><!-- /.pg-body -->

    <!-- THE ONE PINNED LINE (amended §4.3). Exactly one line, only in a modal,
         and only when it carries navigation:
           two-screen   the say-all and the single toggle, together
           three-plus   the Back/More pair alone; the say button stayed above,
                        in the scrolling content, with its chart
         A modal with no navigation renders nothing here at all, so Close is
         the only thing below the divider. Every wrong composition the device
         review found (item 2, panes a-e) is a violation of one of those two
         sentences. -->
    {#if pinNav}
      <div class="pg-controls">
        {#if pinActions}
          <ParadigmActions {chart} state={actionState}
                           on:toggleEndings={toggleEndings}
                           on:openEndings={openEndings}
                           on:switchChart={event => switchChart(event.detail)} />
        {/if}
        {#if hasMoreBackNav}
          <!-- 5F-PATCH3 addendum (Nathanael, 2026-08-10, after user testing):
               BOTH buttons render on EVERY page of the stack, as a centred pair —
               the invalid direction is greyed out (disabled), never removed, so
               nothing ever jumps or disappears while paging. Since
               DISCLOSURE-SPEC1 W6 it is reached only at THREE OR MORE charts
               (§4.2); a two-chart stack takes the single toggle instead. -->
          <div class="pg-nav">
            <button
              class="btn secondary pg-switch pg-switch-back"
              data-paradigm-switch="back"
              data-target-index={chartIndex - 1}
              disabled={chartIndex <= 0}
              on:click={() => switchChart(chartIndex - 1)}>{backLabel}</button>
            <button
              class="btn secondary pg-switch pg-switch-more"
              data-paradigm-switch="more"
              data-target-index={chartIndex + 1}
              disabled={chartIndex >= charts.length - 1}
              on:click={() => switchChart(chartIndex + 1)}>{moreLabel}</button>
          </div>
        {/if}
      </div>
    {/if}
  {/key}
</div>

{#if endingsOpen && chart.endings}
  <div class="modal-overlay" on:click|self={() => (endingsOpen = false)} role="presentation">
    <div class="modal pg-endings" role="dialog" aria-modal="true" aria-label={chart.endings.label || 'Endings'}>
      <div class="modal-scroll">
      <h2 class="modal-title">{chart.endings.label || 'Endings'}</h2>
      <EndingsGrid rows={endingRows} {columns} />
      </div>
      <!-- W4.1/W5.4: Close is a fixed footer (.modal-actions is flex: 0 0 auto,
           outside .modal-scroll), and the state's own say button sits with it
           rather than in the scrolling body — the same slot the in-place
           Endings state uses in a modal host. Nothing plays on open (§4.4). -->
      <div class="modal-actions">
        {#if chart.endings.audio}
          <button class="btn secondary pg-say-whole pg-say-endings"
                  data-audio-id={chart.endings.audio}
                  on:click={() => play(chart.endings.audio)}>{endingsSayLabel}</button>
        {/if}
        <!-- svelte-ignore a11y-autofocus -->
        <button class="btn" autofocus on:click={() => (endingsOpen = false)}>Close</button>
      </div>
    </div>
  </div>
{/if}
