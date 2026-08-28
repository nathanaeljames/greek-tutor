<script>
  // The contentAudio family, dispatched on activity.mode (B1 — never on
  // activity id): chart / exploreGrid / stepper / textPage / objectivesPage /
  // flashcard / selfCheckStepper / selfCheckSequence / equationChart /
  // vowelStair / diphthongRows / reviewVocab / reviewLetters / topicPages /
  // paradigmChart / interlinearVerse. The bespoke
  // modes are pedagogical layouts reconstructed from the original's yellow
  // panels; their per-mode data contracts are documented in HANDOFF-4 §5 (B1).
  import { onDestroy } from 'svelte';
  import { getGreekTapMap, headingKey, resolveItems, shuffle } from '../lib/content.js';
  import { splitGreekRuns, splitTaps } from '../lib/greek.js';
  import { play, playOnLoad, stop as stopAudio } from '../lib/audio.js';
  import { markCompleted } from '../lib/progress.js';
  import { providePopups, popupFor } from '../lib/popups.js';
  import RichContent from './RichContent.svelte';
  import ArrowCue from './ArrowCue.svelte';
  import Paradigm from './Paradigm.svelte';
  import PopupSheet from './PopupSheet.svelte';
  export let chapter;
  export let activity;

  // FULL-PAGE POPUPS (5F §2.2). The register goes down by context so a link
  // nested anywhere in the topic content can open one; the SHEET is rendered
  // here, over the whole activity, because that is what the original does.
  // Opening one stops whatever the page underneath was saying (rule A4).
  let openPopupPage = null;
  const popupRegister = providePopups(activity.popups, popup => { stopAudio(); openPopupPage = popup; });
  const openPopup = popup => { if (popup) popupRegister.open(popup); };

  // Items resolve from the data; activities flagged order:"shuffled"
  // (Pronounce Letters Exercise) get a fresh Fisher-Yates shuffle each visit.
  // applyOrder is a plain helper fed reactive values as arguments so it never
  // becomes its own reactive dependency (no self-invalidation loop): it
  // reshuffles only when the activity id changes (fresh mount or rail-next),
  // and leaves the order untouched on incidental re-runs (e.g. progressTick).
  let items = [];
  let orderedForId = null;
  $: base = resolveItems(chapter, activity);
  $: applyOrder(activity.id, activity.order, base);
  function applyOrder(id, order, baseItems) {
    if (order === 'shuffled') {
      if (orderedForId !== id) {
        orderedForId = id;
        idx = -1;
        revealed = false;
        items = shuffle(baseItems);
      }
    } else {
      orderedForId = null;
      items = baseItems;
    }
  }
  // Dispatch is MODE-keyed (B1): every layout is selected by activity.mode
  // (plus data-shape fields like display/columns/showNtFreq), never by
  // activity id — chapters 2+ reuse these layouts under new ids. The mode
  // vocabulary and per-mode data contracts live in HANDOFF-4 §5 (B1) for the
  // chat-side pipeline.
  $: mode = activity.mode || 'chart';

  // equationChart: each cell is "lower = X". The right-hand side comes from
  // the activity's display field: 'lower=upper' -> capital, else transliteration.
  $: eqRightField = activity.display === 'lower=upper' ? 'upper' : 'translit';

  // reviewLetters: header labels come from the data's columns list; the four
  // cell fields are fixed (name, lower, upper, translit).
  $: reviewColumns = activity.columns || ['Letter Name', 'Letter', 'Capital', 'Transliteration'];

  // --- stepper / flashcard / selfCheck shared state ---
  let idx = -1;
  let revealed = false;
  let lastClicked = null;
  let topicIndex = 0;
  $: topics = activity.topics || [];
  $: currentTopic = topics[topicIndex] || null;
  // 5G-SPEC1 §4.2: a topicPages activity with ONE topic shows no topic
  // navigation at all. The original draws no radio rail on chapter 10's
  // English Concepts page, and the port's equivalent — the Previous
  // Topic / "1 of 1" / Next Topic stepper — would be three dead controls
  // under a page that has nowhere to go. The content fills the card instead.
  $: showTopicControls = topics.length > 1;
  // A topic TITLE may itself be a control: chapter 9's Deponent Verbs heading
  // opens the "Deponent" popup (titleLink), and chapter 10's "Future of εἰμί"
  // taps its Greek word to that word's own clip (titleAudio). Both are the
  // original's own behavior on the panel heading, and both are declared by the
  // data — never inferred from the words in the title.
  $: topicTitlePopup = currentTopic && currentTopic.titleLink
    ? popupFor(popupRegister, currentTopic.titleLink)
    : null;
  // ONE HEADING, NOT TWO (5E-R1, extended in 5G). Where a topic's chart is
  // titled with the topic's own heading AND MORE OF IT — the rail label
  // "Present Middle Paradigm" over the panel heading "Present Middle
  // Indicative Paradigm" — the original prints the fuller one in its panel and
  // the shorter one only in the radio rail, which this port does not draw. So
  // the chart's title stands and this heading steps aside. The reverse case
  // (the chart title is an abbreviation of the topic's, chapter 5) is handled
  // the other way round inside RichContent and is untouched.
  // 5H generalises the rule from "the chart says the topic's heading and MORE"
  // to "the chart prints a panel heading of its own". Chapter 11's paradigm
  // topics are named for the original's RADIO LABELS ('"That" Paradigm') while
  // the yellow panel is headed with the lemma (ἐκεῖνος — that/those) — and the
  // original drops the radio column entirely on those screens, so the panel
  // heading is the only heading there. A chart titled exactly as its topic is
  // (chapters 4, 5, 7, 8) is NOT a second heading: RichContent drops the
  // chart's copy and this one stays, which is why the comparison folds through
  // the same headingKey the renderer uses.
  $: topicTitleCovered = !!currentTopic && (currentTopic.content || [])
    .some(block => block && printsOwnHeading(block, currentTopic.title));
  function printsOwnHeading(block, topicTitle) {
    const titles = [block.title, ...((block.charts || []).map(chart => chart && chart.title))];
    return titles.some(title => title && headingKey(title) !== headingKey(topicTitle));
  }
  $: activityGreekTaps = activity.greekTaps === true
    ? getGreekTapMap(chapter.id)
    : activity.greekTaps;

  // paradigmChart: a Quick Review page's chart, or several of them. This mode
  // is used by quickReview activities and nothing else, so it IS the C9 host.
  $: paradigmPages = Array.isArray(activity.paradigms) && activity.paradigms.length
    ? activity.paradigms
    : (activity.paradigm ? [activity.paradigm] : []);
  // §4.6 as AMENDED 2026-08-17: A REVIEW PAGE NEVER PAGES. Every chart it
  // carries is stacked into one flowing scroll, regardless of whether the
  // charts are named.
  //
  // What this replaces: 5G-SPEC1 §2.8/§3.7 read the DATA for the answer — a
  // paged stack NAMES each chart (the name is what More/Back and
  // data-chart-name report) and a stacked pair does not — so chapters 9 and 10
  // stacked while chapter 8's named third-person stack paged. The device review
  // (item 4) rejected the paged half outright and gave the rule its rationale:
  // students may want to PRINT a Review page, so all of its content has to be
  // visible at once. The name/no-name distinction is still real and still
  // decides paging on LEARN pages; it simply has no authority here. Each named
  // chart keeps printing its own authored title and subtitle, which is how a
  // reader tells the stacked charts apart now that nothing switches between
  // them.
  $: stackedParadigms = paradigmPages.length > 1;

  // Learn Vocabulary flashcard visibility (A15). Segmented radio: Show Both /
  // Hide Greek / Hide English. A hidden pane blanks until tapped (per-card
  // reveal) or the mode changes. Persists across cards within the session
  // (component state; {#key activityId} resets it only on leaving the activity).
  let vocabMode = 'both';                       // 'both' | 'hideGreek' | 'hideEnglish'
  let revealG = false, revealE = false;
  $: showGreek = vocabMode !== 'hideGreek' || revealG;
  $: showEnglish = vocabMode !== 'hideEnglish' || revealE;
  function setVocabMode(m) { vocabMode = m; revealG = false; revealE = false; }

  // AUDIO STOPS ON EVERY EXIT (5E-SPEC2 §3.1, rule A4). A TOPIC SWITCH is the
  // exit that was missed: it does not remount the activity and it does not
  // change the route, so neither {#key activityId} nor App.svelte's
  // hashchange handler sees it — and a Say Whole Paradigm clip started on
  // chapter 4's Masculine Declension kept reading over Neuter Declension and
  // over Word Order after it. Every way OUT of a topic goes through here.
  function goToTopic(index) {
    const next = Math.max(0, Math.min(topics.length - 1, index));
    if (next === topicIndex) return;
    stopAudio();
    topicIndex = next;
  }
  // The unmount exit: the rail and the route both destroy this component, and
  // App.svelte stops audio on hashchange as well. Belt and braces, locally
  // owned, so the rule does not depend on the shell remembering it.
  onDestroy(() => stopAudio());

  function clickTile(item) {
    lastClicked = item;
    const a = item.audio || (item.meta && item.meta.audioShort);
    if (a) play(a);
  }

  function next() { idx = Math.min(idx + 1, items.length - 1); revealed = false; revealG = false; revealE = false; onStep(); maybeComplete(); }
  function prev() { idx = Math.max(idx - 1, 0); revealed = false; revealG = false; revealE = false; onStep(); }
  function onStep(speak = play) {
    const item = items[idx];
    if (!item) return;
    if (mode === 'stepper' && item.audio) speak(item.audio);           // Learn Letters: audioFull
    // Flashcard auto-play on Next — but NOT while the Greek is hidden (P5a):
    // hearing the lemma would give the answer away. Autoplay resumes when the
    // mode shows the Greek; tapping "reveal" plays it (the learner asking).
    if (mode === 'flashcard' && item.audio && vocabMode !== 'hideGreek') speak(item.audio);
  }

  // ---- INITIAL LOAD (DISCLOSURE-SPEC3 W2; DRILL-BEHAVIOR-RULES B-last) ----
  //
  // A SEQUENCE-STEPPED ACTIVITY NEVER STARTS EMPTY. These four modes are the
  // whole of the app's empty-start class — every other stepping surface in the
  // app already opens on its first item (SelectActivity's qIndex, the spellers'
  // wordIndex, DivideActivity/PlaceAccentActivity's item index, topicPages'
  // topicIndex, ReadingCategories' catIndex all start at 0). They opened at
  // `idx = -1` behind a "Click Next to begin" screen, which the review (item 1)
  // rejected: the learner arrives at a blank card and has to discover that the
  // content is one press away.
  //
  // The rule is EXACTLY "as if Next had been pressed once", which is why this
  // calls onStep() rather than declaring its own audio policy: whatever a step
  // pronounces, the mount pronounces, and whatever a step leaves silent stays
  // silent. Concretely, on today's data — Learn Letters speaks the letter
  // (stepper), the ten Learn Vocabulary flashcards speak the lemma unless Hide
  // Greek is on (P5a still holds on item 1), Pronounce Letters and Phonetic
  // Reading are silent until Check Answer / Answer, exactly as their ledger
  // rows say (afterCheck, none).
  //
  // maybeComplete() is deliberately NOT called: arriving somewhere is not
  // finishing it, and on a one-item selfCheck sequence "Next once" would
  // otherwise mark the exercise complete on sight.
  //
  // SELECTION-DRIVEN SURFACES ARE UNTOUCHED. The generic chart/exploreGrid
  // branch (ch1's four `afterTap` drills, the named model) still shows its
  // instruction line and its empty field block until a tile is tapped — the
  // user picks the item there, so there is no "first item" to load.
  const AUTO_LOAD_MODES = new Set(['stepper', 'flashcard', 'selfCheckStepper', 'selfCheckSequence']);
  // Guarded by a flag rather than by `idx < 0` so that stepping BACK to item 1
  // and the shuffle reset inside applyOrder() cannot re-trigger a mount clip.
  // {#key activityId} remounts this component on every navigation, so the flag
  // starts false on each fresh arrival without needing to be reset anywhere.
  let initialLoadDone = false;
  $: maybeInitialLoad(items);
  function maybeInitialLoad(list) {
    if (initialLoadDone || !AUTO_LOAD_MODES.has(mode) || !list.length) return;
    initialLoadDone = true;
    idx = 0;
    revealed = false; revealG = false; revealE = false;
    // W2.4: playOnLoad, not play. This is the app's only un-gestured playback
    // and iOS refuses it; that refusal must be silent and must not cost the
    // learner the clip (lib/audio.js holds it for the first tap). The ITEM is
    // on screen either way — the load and the pronunciation are separate.
    onStep(playOnLoad);
  }
  // selfCheck sequences (Pronounce Letters / Phonetic Reading) complete on
  // reaching the final item, not on visit.
  function maybeComplete() {
    if ((mode === 'selfCheckStepper' || mode === 'selfCheckSequence') && idx === items.length - 1) {
      markCompleted(activity.id);
    }
  }

  function reveal() {
    revealed = true;
    const item = items[idx];
    if (!item) return;
    // Pronounce Letters Exercise: reveal the two fields AND speak the name.
    const a = item.audio || (item.meta && item.meta.audioShort);
    if (a) play(a);
  }

  // exploreGrid drills: value shown in each field on tap.
  function fieldValue(item, label) {
    if (!item) return '';
    const m = item.meta || {};
    if (/Transliteration/i.test(label)) return m.translit || item.secondary || '';
    if (/Sound/i.test(label)) return m.sound || '';
    if (label === 'Letter') return m.name || item.display;
    return m.name || item.secondary || '';
  }

  // --- vowelStair groups (items resolved from alphabet.vowels carry group) ---
  $: vowelGroups = mode === 'vowelStair'
    ? [
        { label: 'Short', rows: items.filter(r => r.group === 'short') },
        { label: 'Long or Short', rows: items.filter(r => r.group === 'longOrShort') },
        { label: 'Long', rows: items.filter(r => r.group === 'long') }
      ]
    : [];
</script>

<!-- lead: mode-independent intro text rendered above the content card
     (A12/A13; any contentAudio activity may carry it). -->
{#if activity.lead}<p class="lead-text">{activity.lead}</p>{/if}

{#if mode === 'objectivesPage'}
  <!-- The chapter's objectives list (preamble + numbered objectives from the
       chapter record itself, not the activity). -->
  <!-- D-20 EXCEPTION: objectives print "1. 2. 3.", not the "1) 2) 3)" house
       style the teaching lists use. The class pins the marker so a later
       global list rule cannot quietly convert this page too. The objective
       strings themselves are extracted verbatim from the TBK -- round 1
       authored chapter 3's four lines from scratch, which is what
       VERIFY-5D-RESPONSE2 item 1 is about; they are never paraphrased. -->
  <!-- 5H-SPEC2 2.5 (VERIFY-5H (o), DOSBox-confirmed): AN OBJECTIVE MAY SPEAK.
       Chapter 11's first objective names ἐκεῖνος and οὗτος, chapter 7's fifth
       names εἰμί, and the Objectives page's own WordSelection table in each
       TBK dispatches a clip for those words — the original's objectives are
       tap targets like every other displayed Greek (directive 9). The
       objectives array was plain strings and had nowhere to carry a clip, so
       an entry is now EITHER a string (every other objective in twelve
       chapters, unchanged) or `{ text, audioMap }`, the same form -> clip map
       topics already use. splitTaps does the wrapping, so a Greek word here
       renders exactly as it does in prose. -->
  <div class="card textpage">
    <strong>{chapter.objectivesPreamble}</strong>
    <ol class="objectives-list">{#each chapter.objectives as o}
      {@const text = typeof o === 'string' ? o : (o.text || '')}
      {@const taps = typeof o === 'string' ? null : o.audioMap}
      <li>{#if taps}{#each splitTaps(text, taps) as part}{#if part.audio}<button class="greek-tap greek" on:click={() => play(part.audio)}>{part.t}</button>{:else}{part.t}{/if}{/each}{:else}{text}{/if}</li>
    {/each}</ol>
  </div>

{:else if mode === 'topicPages'}
  <div class="card topic-page">
    {#if currentTopic}
      {#if !topicTitleCovered}
        <div class="topic-heading">
          {#if topicTitlePopup}
            <button class="popup-link topic-title-link" on:click={() => openPopup(topicTitlePopup)}>{currentTopic.title}</button>
          {:else if currentTopic.titleAudio}
            {#each splitGreekRuns(currentTopic.title) as run}{#if run.greek}<button class="greek-tap greek" on:click={() => play(currentTopic.titleAudio)}>{run.t}</button>{:else}{run.t}{/if}{/each}
          {:else}
            {currentTopic.title}
          {/if}
        </div>
      {/if}
      <!-- greekTaps is declared once for the whole activity (chapter 3's Learn
           Verbs wires λύουσιν / λύουσι / λύω, which appear in prose across
           three different topics) and a topic may still override it. -->
      <RichContent
        blocks={currentTopic.content || []}
        suppressTitle={currentTopic.title}
        titleAudio={topicTitleCovered ? currentTopic.titleAudio || null : null}
        noteTaps={currentTopic.audioMap || null}
        greekTaps={currentTopic.greekTaps === true
          ? getGreekTapMap(chapter.id)
          : (currentTopic.greekTaps || activityGreekTaps)} />
      {#if currentTopic._verify}<div class="pending-verification compact">Some topic details are pending verification.</div>{/if}
    {:else}
      <div class="pending-verification">Topic content pending verification.</div>
    {/if}
    {#if showTopicControls}
      <div class="controls topic-controls">
        <button class="btn secondary" on:click={() => goToTopic(topicIndex - 1)} disabled={topicIndex <= 0}>Previous Topic</button>
        <span class="topic-count">{topics.length ? topicIndex + 1 : 0} of {topics.length}</span>
        <button class="btn" on:click={() => goToTopic(topicIndex + 1)} disabled={!topics.length || topicIndex >= topics.length - 1}>Next Topic</button>
      </div>
    {/if}
    {#if activity._topic_verify}<div class="pending-verification compact">Topic order pending verification.</div>{/if}
  </div>

{:else if mode === 'paradigmChart'}
  <!-- Quick Review's full-page paradigm: the same chart the Learn topic and
       the drill Hint render, with the chart title above it. The Endings button
       simply isn't there when the data omits the endings block.
       5F: an activity may ship SEVERAL charts as `paradigms[]` (chapter 8's
       third person: Masculine, then More to Feminine, then More to Neuter,
       with Back stepping down) and may carry its Say Whole action beside the
       chart rather than inside it. -->
  <div class="card">
    {#if stackedParadigms}
      <div class="paradigm-stack">
        {#each paradigmPages as chart, chartIndex}
          <Paradigm paradigm={chart} title={chart.title || null} />
          {#if chartIndex < paradigmPages.length - 1}<div class="paradigm-stack-rule" aria-hidden="true"></div>{/if}
        {/each}
      </div>
    {:else if paradigmPages.length}
      {@const page = paradigmPages[0]}
      <!-- 5F-FEEDBACK.pdf §8.1 root-cause fix: every pronoun paradigm now
           ships in the SAME cell-audio shape every other chapter's paradigm
           does (chapt-08.json no longer carries a `pronounParadigm` block
           anywhere), so this reads title off the PAGE the same way every
           other paradigmChart activity does -- no per-shape branch left to
           drift out of sync with the data. -->
      <Paradigm paradigm={page} title={activity.chartTitle || page.title || null}
                titleAudio={activity.titleAudio || null} />
      <!-- Paradigm.svelte already draws chart.sayWhole INSIDE the card when
           the chart carries one (every chart here does). This block adds
           only the More/Back stepper beside it -- an EXTERNAL sayWhole is
           for the rare page whose chart has none, so it can never double up
           with the one Paradigm just drew. -->
      {@const externalSayWhole = page.sayWhole ? null : activity.sayWhole}
      {#if externalSayWhole}
        <div class="controls pg-actions">
          <button class="btn secondary pg-say-whole" on:click={() => play(externalSayWhole.audio)}>{externalSayWhole.label || 'Say Whole Paradigm'}</button>
        </div>
      {/if}
      <!-- THE REVIEW PAGER IS GONE (amended §4.6, DISCLOSURE-SPEC2 W4). This
           branch draws a single chart now: with more than one, the stacked
           branch above runs instead, so there is nothing left to page between
           and no second copy of .pg-nav in the app to drift from Paradigm's. -->
    {:else}
      <div class="pending-verification">Chart content pending verification.</div>
    {/if}
  </div>

{:else if mode === 'interlinearVerse'}
  <!-- Scripture Memory: the verse set as flowing Greek with each word's gloss
       under it, wrapping as a unit so a word never parts company with its
       gloss. Every Greek word is tappable and plays its own c_sm clip; a word
       with no gloss (the article before Ἰησοῦς) still renders and still
       plays, holding its column open so the two rows stay aligned. -->
  <div class="card">
    <div class="ilv">
      {#each activity.words || [] as w}
        <button class="ilv-word" disabled={!w.audio} on:click={() => w.audio && play(w.audio)}>
          <span class="greek ilv-greek">{w.greek}</span>
          <span class="ilv-gloss">{w.gloss || ' '}</span>
        </button>
      {/each}
    </div>
    {#if activity.reference}<div class="ilv-ref">{activity.reference}</div>{/if}
    {#if activity.sayWhole}
      <div class="controls">
        <button class="btn secondary" on:click={() => play(activity.sayWhole.audio)}>{activity.sayWhole.label || 'Say Whole Verse'}</button>
      </div>
    {/if}
  </div>

{:else if mode === 'textPage'}
  {#if activity.content}
    <div class="card">
      <RichContent blocks={activity.content} greekTaps={activityGreekTaps} />
      {#if activity.playButton}
        <div class="controls">
          <button class="btn" on:click={() => play(activity.playButton.audio)}>▶ {activity.playButton.label}</button>
        </div>
      {/if}
    </div>
  {:else}
    <div class="card textpage">Text capture pending.</div>
  {/if}

{:else if mode === 'stepper'}
  <div class="card">
    <!-- W2.3: THE BEGIN SCREEN IS RETIRED. This branch used to draw a blank
         Greek line and `ui.beginPrompt` ("Click on 'Next Letter' to begin.")
         until Next was pressed. Item 1 is on screen from mount now (B-last), so
         the only state left to guard is "the data resolved no items at all",
         where drawing nothing is right and drawing an instruction to press a
         button that cannot help would not be. `ui.beginPrompt` stays in the
         data as inert provenance, like `numberPopupRef`. -->
    {#if items[idx]}
      <div class="prompt greek">{items[idx].display}</div>
      <div class="fields">
        <div class="field"><div class="label">The Letter's Name:</div><div class="value">{items[idx].meta.name || items[idx].secondary}</div></div>
        <div class="field"><div class="label">It sounds like:</div><div class="value">{items[idx].meta.sound || ''}</div></div>
        <div class="field"><div class="label">English Transliteration:</div><div class="value greek">{items[idx].meta.translit || ''}</div></div>
      </div>
    {/if}
    <div class="controls">
      <button class="btn secondary" on:click={prev} disabled={idx <= 0}>Previous</button>
      <button class="btn" on:click={next} disabled={idx >= items.length - 1}>Next Letter</button>
      {#if activity.sayAlphabetAudio}
        <button class="btn secondary" on:click={() => play(activity.sayAlphabetAudio)}>Say Alphabet</button>
      {/if}
    </div>
  </div>

  <!-- DISCLOSURE-SPEC1 W3.3: chapter 1's Six Points. It was already an
       accordion under the letter stepper, but a BESPOKE one — its own card,
       its own chevron, its own open/closed flag, fed by an activity-level
       `sixPointsContent` field no other chapter had. Nothing keyed to it could
       be styled by R2, and the collapse-default it happened to have was its
       own rather than the shared component's.
       The pipeline moved that content into a standard `expander` block inside
       the activity's ordinary `content[]`, so the stepper now renders content
       through RichContent after its controls exactly as textPage mode does,
       and Six Points is an accordion like every other accordion in the app.
       DISCLOSURE-SPEC2 W2.4: and NO card around it. SPEC1 wrapped this render
       in one, which was invisible while the accordion was borderless — the
       card WAS the box you saw. Now that §3.1 puts a box on the accordion
       itself, a card here would be a box inside a box, and its 16px padding
       around a single one-line summary is exactly the inflated spacing the
       device review flagged (item 1(b)). Unwrapped, Six Points is one
       accordion box under the stepper card, with the same minimal padding
       every other accordion in the app has. The page's own .content gutter
       keeps it inset from the screen edge. -->
  {#if activity.content}
    <RichContent blocks={activity.content} greekTaps={activityGreekTaps} />
  {/if}

{:else if mode === 'flashcard'}
  <div class="card">
    <div class="segmented" role="radiogroup" aria-label="Card visibility">
      <button class="seg" class:on={vocabMode === 'both'} role="radio" aria-checked={vocabMode === 'both'} on:click={() => setVocabMode('both')}>Show Both</button>
      <button class="seg" class:on={vocabMode === 'hideGreek'} role="radio" aria-checked={vocabMode === 'hideGreek'} on:click={() => setVocabMode('hideGreek')}>Hide Greek</button>
      <button class="seg" class:on={vocabMode === 'hideEnglish'} role="radio" aria-checked={vocabMode === 'hideEnglish'} on:click={() => setVocabMode('hideEnglish')}>Hide English</button>
    </div>
    <!-- W2.3: begin screen retired; card 1 is on screen from mount (B-last). -->
    {#if items[idx]}
      <div class="flash-pane"><div class="label">Greek Word</div>
        {#if showGreek}
          <!-- Greek-tap rule (P5b): the visible Greek word pronounces itself. -->
          <button class="value greek greek-say" on:click={() => items[idx].audio && play(items[idx].audio)}>{items[idx].display}</button>
        {:else}
          <!-- Revealing plays the lemma (P5a — the learner asked for it). -->
          <button class="flash-hidden" on:click={() => { revealG = true; if (items[idx].audio) play(items[idx].audio); }}>Tap to reveal</button>
        {/if}</div>
      <div class="flash-pane"><div class="label">Word Meaning</div>
        {#if showEnglish}
          <div class="value" style="font-size:1.4rem">{items[idx].secondary}</div>
        {:else}
          <button class="value flash-hidden" on:click={() => (revealE = true)}>Tap to reveal</button>
        {/if}</div>
    {/if}
    <div class="controls">
      <button class="btn secondary" on:click={prev} disabled={idx <= 0}>Previous</button>
      <button class="btn" on:click={next} disabled={idx >= items.length - 1}>Next</button>
      <button class="btn" on:click={() => idx >= 0 && items[idx].audio && play(items[idx].audio)} disabled={idx < 0}>Pronounce</button>
    </div>
    {#if activity.note}<div class="note">{activity.note}</div>{/if}
  </div>

{:else if mode === 'selfCheckStepper'}
  <!-- Pronounce Letters Exercise: show letter, reveal name + sounds-like -->
  <div class="card">
    <!-- W2.3: begin screen retired. Its text was `ui.hint`, which is a begin
         prompt in all but name ("Click on 'Check Answer' to see if you are
         correct") and duplicates the activity's own instruction line that the
         shell already prints above this card. The key stays in the data. -->
    {#if items[idx]}
      <!-- Greek-tap rule (P7): the displayed letter plays its audioShort (the
           same clip Check Answer speaks). The tap never reveals or advances. -->
      <button class="prompt greek greek-say" on:click={() => { const a = items[idx].audio || (items[idx].meta && items[idx].meta.audioShort); if (a) play(a); }}>{items[idx].display}</button>
      {#if revealed}
        <div class="fields">
          <div class="field"><div class="label">The Letter's Name:</div><div class="value">{items[idx].meta.name || ''}</div></div>
          <div class="field"><div class="label">It sounds like:</div><div class="value">{items[idx].meta.sound || ''}</div></div>
        </div>
      {/if}
    {/if}
    <div class="controls">
      <button class="btn secondary" on:click={prev} disabled={idx <= 0}>Previous</button>
      <button class="btn" on:click={next} disabled={idx >= items.length - 1}>Next Letter</button>
      <button class="btn" on:click={reveal} disabled={idx < 0 || revealed}>Check Answer</button>
    </div>
  </div>

{:else if mode === 'selfCheckSequence'}
  <!-- Phonetic Reading: Greek-lettered phrase on a highlight band -->
  <div class="card">
    <!-- W2.3: begin screen retired; phrase 1 is on screen from mount (B-last). -->
    {#if items[idx]}
      <div class="phonetic-band greek">{items[idx].display}</div>
      {#if revealed}
        <div class="field"><div class="label">Answer Key:</div>
          <div class="value">{items[idx].meta.answer || items[idx].secondary}</div></div>
      {/if}
    {/if}
    <div class="controls">
      <button class="btn secondary" on:click={prev} disabled={idx <= 0}>Previous</button>
      <button class="btn" on:click={next} disabled={idx >= items.length - 1}>Next</button>
      <button class="btn" on:click={() => (revealed = true)} disabled={idx < 0 || revealed}>Answer</button>
    </div>
    {#if activity.citation}<div class="rc-refs">{activity.citation}</div>{/if}
  </div>

{:else if mode === 'equationChart'}
  <!-- Equation chart (letter transliterations / capitals): "lower = X" cells;
       X picked by the activity's display field (eqRightField). -->
  <div class="card">
    <div class="equation-grid">
      {#each items as it}
        <button class="eq-cell" on:click={() => it.audio && play(it.audio)}>
          <span class="greek eq-a">{it.meta.lower}</span>
          <span class="eq-eq">=</span>
          <span class="greek eq-b">{it.meta[eqRightField]}</span>
        </button>
      {/each}
    </div>
  </div>
  {#if activity.content}<div class="card"><RichContent blocks={activity.content} /></div>{/if}

{:else if mode === 'vowelStair'}
  <!-- Learn Vowels: short / long-or-short / long stair -->
  <div class="card">
    <div class="vowel-stair">
      {#each vowelGroups as g, gi}
        <div class="vowel-group" style="--step:{gi}">
          <div class="vowel-group-label">{g.label}</div>
          <div class="vowel-tiles">
            {#each g.rows as r}
              <button class="tile greek" on:click={() => r.audio && play(r.audio)}>{r.display}</button>
            {/each}
          </div>
        </div>
      {/each}
    </div>
  </div>
  {#if activity.content}<div class="card"><RichContent blocks={activity.content} /></div>{/if}

{:else if mode === 'diphthongRows'}
  <!-- Sound rows (diphthongs AND iota subscripts share this layout): tile
       (plays row audio) / sound description / tappable example word + gloss.
       Row fields come from the itemsFrom source rows (meta): greek, sound,
       example, exampleGloss, exampleAudio. -->
  <div class="card">
    <div class="diph-rows">
      {#each items as it}
        <div class="diph-row">
          <button class="diph-tile greek" on:click={() => it.audio && play(it.audio)}>{it.meta.greek}</button>
          <div class="diph-sound">{it.meta.sound}</div>
          <button class="diph-ex" class:tappable={it.meta.exampleAudio} on:click={() => it.meta.exampleAudio && play(it.meta.exampleAudio)}>
            <span class="greek">{it.meta.example}</span>
            <span class="diph-gloss">{it.meta.exampleGloss}</span>
          </button>
        </div>
      {/each}
    </div>
  </div>
  {#if activity.content}<div class="card"><RichContent blocks={activity.content} /></div>{/if}
  {#if activity.note}<div class="note">{activity.note}</div>{/if}

{:else if mode === 'reviewVocab'}
  <!-- Review Vocabulary Chart: Greek (tap = lemma audio, blue) + STATIC gloss
       (dark green) + ntFreq. A17/A6: only the Greek word is tappable. -->
  <div class="card">
    <div class="review-vocab" class:two-columns={activity.columns === 2}
         style={`--rv-rows:${Math.ceil(items.length / (activity.columns || 1))}`}>
      {#each items as r}
        <div class="rv-row">
          <button class="rv-greek greek" on:click={() => r.audio && play(r.audio)}>{r.display}</button>
          <span class="rv-gloss">{r.secondary}{#if activity.showNtFreq && r.meta && r.meta.ntFreq} <span class="rv-freq">({r.meta.ntFreq})</span>{/if}</span>
        </div>
      {/each}
    </div>
    <!-- The original prints the ntFreq legend under the chart, not as a note
         banner: it explains the numbers already on screen. -->
    {#if activity.footnote}<div class="rv-footnote">{activity.footnote}</div>{/if}
    <div class="controls">
      {#if activity.playAll || activity.sayWholeListAudio}
        <button class="btn secondary" on:click={() => play(activity.playAll?.audio || activity.sayWholeListAudio)}>{activity.playAll?.label || 'Say Whole List'}</button>
      {/if}
    </div>
    {#if activity.note}<div class="note">{activity.note}</div>{/if}
  </div>

{:else if mode === 'reviewLetters'}
  <!-- Review Letters Quick Chart: 4-column compact matrix (A18); headers from
       the data's columns list; each row tappable to hear the letter name. -->
  <div class="card">
    <div class="letters-matrix">
      <div class="lm-head">
        {#each reviewColumns as c}<span>{c}</span>{/each}
      </div>
      {#each items as it}
        <button class="lm-row" on:click={() => it.audio && play(it.audio)}>
          <span class="lm-name">{it.meta.name}</span>
          <span class="greek">{it.meta.lower}</span>
          <span class="greek">{it.meta.upper}</span>
          <span class="greek">{it.meta.translit}</span>
        </button>
      {/each}
    </div>
    <div class="controls">
      {#if activity.sayAlphabetAudio}
        <button class="btn secondary" on:click={() => play(activity.sayAlphabetAudio)}>Say Alphabet</button>
      {/if}
    </div>
  </div>

{:else}
  <!-- generic chart / exploreGrid: tap a tile, hear it, see its info.
       ui.arrowCue (data) restores the tap-here arrow above the grid. -->
  <div class="card">
    {#if activity.ui?.arrowCue}<ArrowCue />{/if}
    <div class="grid letters">
      {#each items as item}
        <button class="tile greek" class:small={item.display.length > 3} on:click={() => clickTile(item)}>
          {item.display}
        </button>
      {/each}
    </div>
    {#if activity.ui?.fields && lastClicked}
      <div class="fields">
        {#each activity.ui.fields as f}
          <div class="field"><div class="label">{f}</div>
            <div class="value">{fieldValue(lastClicked, f)}</div></div>
        {/each}
      </div>
    {:else if lastClicked}
      <div class="fields"><div class="field"><div class="label">Info</div><div class="value">{lastClicked.secondary || ''}</div></div></div>
    {/if}
    <div class="controls">
      {#if activity.sayAlphabetAudio}
        <button class="btn secondary" on:click={() => play(activity.sayAlphabetAudio)}>Say Alphabet</button>
      {/if}
    </div>
    {#if activity.note}<div class="note">{activity.note}</div>{/if}
    {#if activity.content}<div class="rc-below"><RichContent blocks={activity.content} /></div>{/if}
  </div>
{/if}

{#if openPopupPage}
  <!-- The original's full-screen green reference page, over whatever teaching
       surface opened it. Cancel comes back; nothing about the page underneath
       moves while it is open. -->
  <PopupSheet popup={openPopupPage} on:close={() => (openPopupPage = null)} />
{/if}
