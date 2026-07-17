<script>
  // The contentAudio family: chart / exploreGrid / stepper / textPage /
  // flashcard / selfCheckStepper / selfCheckSequence. Several chart pages have
  // bespoke pedagogical layouts (equation chart, vowel stair, diphthong rows,
  // review matrices) reconstructed from the original's yellow panels.
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
  $: mode = activity.mode || 'chart';
  $: id = activity.id;

  // Which special chart layout (if any) this activity uses.
  $: isTranslitChart = id === 'c1_learn_translit';
  $: isCapitalsChart = id === 'c1_learn_capitals';
  $: isEquationChart = isTranslitChart || isCapitalsChart;
  $: isVowels = id === 'c1_learn_vowels';
  $: isDiphthongsLearn = id === 'c1_learn_diphthongs';
  $: isIotaLearn = id === 'c1_learn_iota_subscripts';
  $: isReviewVocab = id === 'c1_qr_vocab';
  $: isReviewLetters = id === 'c1_qr_letters';
  // Arrow cue restored above the three letter-grid drills.
  $: showArrowCue = id === 'c1_drill_letter_names' || id === 'c1_drill_translit' || id === 'c1_drill_capitals';

  // --- stepper / flashcard / selfCheck shared state ---
  let idx = -1;
  let revealed = false;
  let lastClicked = null;
  let sixOpen = false;

  function clickTile(item) {
    lastClicked = item;
    const a = item.audio || (item.meta && item.meta.audioShort);
    if (a) play(a);
  }

  function next() { idx = Math.min(idx + 1, items.length - 1); revealed = false; onStep(); maybeComplete(); }
  function prev() { idx = Math.max(idx - 1, 0); revealed = false; onStep(); }
  function onStep() {
    const item = items[idx];
    if (!item) return;
    if (mode === 'stepper' && item.audio) play(item.audio);            // Learn Letters: audioFull
    if (mode === 'flashcard' && item.audio) play(item.audio);          // auto-play lemma on Next
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

  // --- Review Vocabulary Chart rows ---
  $: reviewVocabRows = isReviewVocab ? items : [];
  // --- Review Letters Quick Chart rows ---
  $: letterRows = isReviewLetters ? chapter.alphabet.letters : [];
  // --- Learn Diphthongs rows ---
  $: diphthongs = isDiphthongsLearn ? chapter.alphabet.diphthongs : [];
  // --- Learn Iota Subscripts rows (same layout as diphthongs) ---
  $: iotaRows = isIotaLearn ? chapter.alphabet.iotaSubscripts : [];
  // --- Learn Vowels stair groups ---
  $: vowelGroups = isVowels
    ? [
        { label: 'Short', rows: items.filter(r => r.group === 'short') },
        { label: 'Long or Short', rows: items.filter(r => r.group === 'longOrShort') },
        { label: 'Long', rows: items.filter(r => r.group === 'long') }
      ]
    : [];
</script>

{#if mode === 'textPage'}
  {#if activity._userDecision}
    <div class="draft-tag">Draft copy — pending approval</div>
  {/if}
  {#if activity.id === 'c1_learn_objectives'}
    <div class="card textpage">
      <strong>{chapter.objectivesPreamble}</strong>
      <ol>{#each chapter.objectives as o}<li>{o}</li>{/each}</ol>
    </div>
  {:else if activity.content}
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
    {#if idx < 0}
      <div class="instructions">Click Next to begin.</div>
    {:else}
      <div class="flash-pane"><div class="label">Greek Word</div>
        <div class="value greek">{items[idx].display}</div></div>
      <div class="flash-pane"><div class="label">Word Meaning</div>
        <div class="value" style="font-size:1.4rem">{items[idx].secondary}</div></div>
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
      <div class="prompt greek">{items[idx].display}</div>
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

{:else if isEquationChart}
  <!-- Learn Letter Transliterations / Learn Capital Letters: equation chart -->
  <div class="card">
    <div class="equation-grid">
      {#each chapter.alphabet.letters as l}
        <button class="eq-cell" on:click={() => play(l.audioShort)}>
          <span class="greek eq-a">{isCapitalsChart ? l.lower : l.lower}</span>
          <span class="eq-eq">=</span>
          <span class="greek eq-b">{isCapitalsChart ? l.upper : l.translit}</span>
        </button>
      {/each}
    </div>
  </div>
  {#if activity.content}<div class="card"><RichContent blocks={activity.content} /></div>{/if}

{:else if isVowels}
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

{:else if isDiphthongsLearn}
  <!-- Learn Diphthongs: 7 rows (diphthong / sound / example / gloss) -->
  <div class="card">
    <div class="diph-rows">
      {#each diphthongs as d}
        <div class="diph-row">
          <button class="diph-tile greek" on:click={() => play(d.audio)}>{d.greek}</button>
          <div class="diph-sound">{d.sound}</div>
          <button class="diph-ex" class:tappable={d.exampleAudio} on:click={() => d.exampleAudio && play(d.exampleAudio)}>
            <span class="greek">{d.example}</span>
            <span class="diph-gloss">{d.exampleGloss}</span>
          </button>
        </div>
      {/each}
    </div>
  </div>
  {#if activity.content}<div class="card"><RichContent blocks={activity.content} /></div>{/if}
  {#if activity.note}<div class="note">{activity.note}</div>{/if}

{:else if isIotaLearn}
  <!-- Learn Iota Subscripts: rows (subscript vowel / sound / example / gloss).
       Tile tap plays row.audio; the example word tap plays row.exampleAudio. -->
  <div class="card">
    <div class="diph-rows">
      {#each iotaRows as r}
        <div class="diph-row">
          <button class="diph-tile greek" on:click={() => r.audio && play(r.audio)}>{r.greek}</button>
          <div class="diph-sound">{r.sound}</div>
          <button class="diph-ex" class:tappable={r.exampleAudio} on:click={() => r.exampleAudio && play(r.exampleAudio)}>
            <span class="greek">{r.example}</span>
            <span class="diph-gloss">{r.exampleGloss}</span>
          </button>
        </div>
      {/each}
    </div>
  </div>
  {#if activity.content}<div class="card"><RichContent blocks={activity.content} /></div>{/if}
  {#if activity.note}<div class="note">{activity.note}</div>{/if}

{:else if isReviewVocab}
  <!-- Review Vocabulary Chart: Greek (tap = lemma audio) + gloss + ntFreq -->
  <div class="card">
    <div class="review-vocab">
      {#each reviewVocabRows as r}
        <button class="rv-row" on:click={() => r.audio && play(r.audio)}>
          <span class="rv-greek greek">{r.display}</span>
          <span class="rv-gloss">{r.secondary}{#if r.meta && r.meta.ntFreq} <span class="rv-freq">({r.meta.ntFreq})</span>{/if}</span>
        </button>
      {/each}
    </div>
    <div class="controls">
      {#if activity.sayWholeListAudio}
        <button class="btn secondary" on:click={() => play(activity.sayWholeListAudio)}>Say Whole List</button>
      {/if}
    </div>
    {#if activity.note}<div class="note">{activity.note}</div>{/if}
  </div>

{:else if isReviewLetters}
  <!-- Review Letters Quick Chart: 5-column compact matrix -->
  <div class="card">
    <div class="letters-matrix">
      <div class="lm-head">
        <span>Letter Name</span><span>Letter</span><span>Capital</span><span>Transliteration</span><span>Pronounce</span>
      </div>
      {#each letterRows as l}
        <button class="lm-row" on:click={() => play(l.audioShort)}>
          <span class="lm-name">{l.name}</span>
          <span class="greek">{l.lower}</span>
          <span class="greek">{l.upper}</span>
          <span class="greek">{l.translit}</span>
          <span class="lm-spk" aria-hidden="true">🔊</span>
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
  <!-- generic chart / exploreGrid: tap a tile, hear it, see its info -->
  <div class="card">
    {#if showArrowCue}<ArrowCue />{/if}
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
