<script>
  // The contentAudio family, dispatched on activity.mode (B1 — never on
  // activity id): chart / exploreGrid / stepper / textPage / objectivesPage /
  // flashcard / selfCheckStepper / selfCheckSequence / equationChart /
  // vowelStair / diphthongRows / reviewVocab / reviewLetters / topicPages. The bespoke
  // modes are pedagogical layouts reconstructed from the original's yellow
  // panels; their per-mode data contracts are documented in HANDOFF-4 §5 (B1).
  import { slide } from 'svelte/transition';
  import { resolveItems, shuffle } from '../lib/content.js';
  import { play } from '../lib/audio.js';
  import { markCompleted } from '../lib/progress.js';
  import RichContent from './RichContent.svelte';
  import ArrowCue from './ArrowCue.svelte';
  export let chapter;
  export let activity;

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
  let sixOpen = false;
  let topicIndex = 0;
  $: topics = activity.topics || [];
  $: currentTopic = topics[topicIndex] || null;

  // Learn Vocabulary flashcard visibility (A15). Segmented radio: Show Both /
  // Hide Greek / Hide English. A hidden pane blanks until tapped (per-card
  // reveal) or the mode changes. Persists across cards within the session
  // (component state; {#key activityId} resets it only on leaving the activity).
  let vocabMode = 'both';                       // 'both' | 'hideGreek' | 'hideEnglish'
  let revealG = false, revealE = false;
  $: showGreek = vocabMode !== 'hideGreek' || revealG;
  $: showEnglish = vocabMode !== 'hideEnglish' || revealE;
  function setVocabMode(m) { vocabMode = m; revealG = false; revealE = false; }

  function clickTile(item) {
    lastClicked = item;
    const a = item.audio || (item.meta && item.meta.audioShort);
    if (a) play(a);
  }

  function next() { idx = Math.min(idx + 1, items.length - 1); revealed = false; revealG = false; revealE = false; onStep(); maybeComplete(); }
  function prev() { idx = Math.max(idx - 1, 0); revealed = false; revealG = false; revealE = false; onStep(); }
  function onStep() {
    const item = items[idx];
    if (!item) return;
    if (mode === 'stepper' && item.audio) play(item.audio);            // Learn Letters: audioFull
    // Flashcard auto-play on Next — but NOT while the Greek is hidden (P5a):
    // hearing the lemma would give the answer away. Autoplay resumes when the
    // mode shows the Greek; tapping "reveal" plays it (the learner asking).
    if (mode === 'flashcard' && item.audio && vocabMode !== 'hideGreek') play(item.audio);
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
  <div class="card textpage">
    <strong>{chapter.objectivesPreamble}</strong>
    <ol>{#each chapter.objectives as o}<li>{o}</li>{/each}</ol>
  </div>

{:else if mode === 'topicPages'}
  <div class="card topic-page">
    {#if currentTopic}
      <div class="topic-heading">{currentTopic.title}</div>
      <RichContent blocks={currentTopic.content || []} />
      {#if currentTopic._verify}<div class="pending-verification compact">Some topic details are pending verification.</div>{/if}
    {:else}
      <div class="pending-verification">Topic content pending verification.</div>
    {/if}
    <div class="controls topic-controls">
      <button class="btn secondary" on:click={() => (topicIndex = Math.max(0, topicIndex - 1))} disabled={topicIndex <= 0}>Previous Topic</button>
      <span class="topic-count">{topics.length ? topicIndex + 1 : 0} of {topics.length}</span>
      <button class="btn" on:click={() => (topicIndex = Math.min(topics.length - 1, topicIndex + 1))} disabled={!topics.length || topicIndex >= topics.length - 1}>Next Topic</button>
    </div>
    {#if activity._topic_verify}<div class="pending-verification compact">Topic order pending verification.</div>{/if}
  </div>

{:else if mode === 'textPage'}
  {#if activity.content}
    <div class="card">
      <RichContent blocks={activity.content} />
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
    {#if idx < 0}
      <div class="prompt greek">&nbsp;</div>
      <div class="instructions">{activity.ui?.beginPrompt || 'Click Next to begin.'}</div>
    {:else}
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

  {#if activity.sixPointsContent}
    <div class="card collapsible">
      <button class="collapse-head" on:click={() => (sixOpen = !sixOpen)} aria-expanded={sixOpen}>
        <svg class="chevron" class:down={sixOpen} viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6l-6 6" /></svg>
        <span>Six Points</span>
      </button>
      {#if sixOpen}
        <div class="collapse-body" transition:slide|local>
          <RichContent blocks={activity.sixPointsContent.filter(b => b.text !== 'Six Points')} />
        </div>
      {/if}
    </div>
  {/if}

{:else if mode === 'flashcard'}
  <div class="card">
    <div class="segmented" role="radiogroup" aria-label="Card visibility">
      <button class="seg" class:on={vocabMode === 'both'} role="radio" aria-checked={vocabMode === 'both'} on:click={() => setVocabMode('both')}>Show Both</button>
      <button class="seg" class:on={vocabMode === 'hideGreek'} role="radio" aria-checked={vocabMode === 'hideGreek'} on:click={() => setVocabMode('hideGreek')}>Hide Greek</button>
      <button class="seg" class:on={vocabMode === 'hideEnglish'} role="radio" aria-checked={vocabMode === 'hideEnglish'} on:click={() => setVocabMode('hideEnglish')}>Hide English</button>
    </div>
    {#if idx < 0}
      <div class="instructions">Click Next to begin.</div>
    {:else}
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
    {#if idx < 0}
      <div class="instructions">{activity.ui?.hint || 'Click Next to begin.'}</div>
    {:else}
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
    {#if idx < 0}
      <div class="instructions">Click Next to begin.</div>
    {:else}
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
    <div class="review-vocab">
      {#each items as r}
        <div class="rv-row">
          <button class="rv-greek greek" on:click={() => r.audio && play(r.audio)}>{r.display}</button>
          <span class="rv-gloss">{r.secondary}{#if activity.showNtFreq && r.meta && r.meta.ntFreq} <span class="rv-freq">({r.meta.ntFreq})</span>{/if}</span>
        </div>
      {/each}
    </div>
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
