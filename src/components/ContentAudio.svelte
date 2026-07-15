<script>
  // Handles the contentAudio family: chart / exploreGrid / stepper /
  // textPage / flashcard / selfCheckStepper / selfCheckSequence.
  import { resolveItems } from '../lib/content.js';
  import { play } from '../lib/audio.js';
  export let chapter;
  export let activity;

  $: items = resolveItems(chapter, activity);
  $: mode = activity.mode || 'chart';

  // shared state for stepper-like modes
  let idx = -1;
  let revealed = false;
  let lastClicked = null;

  // flashcard state
  let showGreek = true;
  let showEnglish = true;

  function clickItem(item) {
    lastClicked = item;
    if (item.audio) play(item.audio);
  }
  function next() { idx = Math.min(idx + 1, items.length - 1); revealed = false; onStep(); }
  function prev() { idx = Math.max(idx - 1, 0); revealed = false; onStep(); }
  function onStep() {
    const item = items[idx];
    if (item && mode === 'stepper' && item.audio) play(item.audio);
  }
  function reveal() {
    revealed = true;
    const item = items[idx];
    if (item && item.audio) play(item.audio);
  }
</script>

{#if mode === 'textPage'}
  <div class="card textpage">
    {#if activity.id === 'c1_learn_objectives'}
      <strong>{chapter.objectivesPreamble}</strong>
      <ol>{#each chapter.objectives as o}<li>{o}</li>{/each}</ol>
    {:else}
      {activity.textPartial || 'Text capture pending.'}
    {/if}
  </div>

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

{:else if mode === 'flashcard'}
  <div class="card">
    {#if idx < 0}
      <div class="instructions">Click Next to begin.</div>
    {:else}
      <div class="flash-pane"><div class="label">Greek Word</div>
        <div class="value greek">{showGreek ? items[idx].display : ''}</div></div>
      <div class="flash-pane"><div class="label">Word Meaning</div>
        <div class="value" style="font-size:1.4rem">{showEnglish ? items[idx].secondary : ''}</div></div>
    {/if}
    <div class="controls">
      <button class="btn secondary" on:click={prev} disabled={idx <= 0}>Previous</button>
      <button class="btn" on:click={next} disabled={idx >= items.length - 1}>Next</button>
      <button class="btn secondary" on:click={() => (showGreek = !showGreek)}>{showGreek ? 'Hide' : 'Show'} Greek</button>
      <button class="btn secondary" on:click={() => (showEnglish = !showEnglish)}>{showEnglish ? 'Hide' : 'Show'} English</button>
      <button class="btn" on:click={() => idx >= 0 && items[idx].audio && play(items[idx].audio)} disabled={idx < 0}>Pronounce</button>
    </div>
    {#if activity.note}<div class="note">{activity.note}</div>{/if}
  </div>

{:else if mode === 'selfCheckStepper' || mode === 'selfCheckSequence'}
  <div class="card">
    {#if idx < 0}
      <div class="instructions">Click Next to begin.</div>
    {:else}
      <div class="prompt greek">{items[idx].display}</div>
      {#if revealed}
        <div class="field"><div class="label">Answer</div>
          <div class="value">{items[idx].meta.sound || items[idx].meta.answer || items[idx].secondary}</div></div>
      {/if}
    {/if}
    <div class="controls">
      <button class="btn secondary" on:click={prev} disabled={idx <= 0}>Previous</button>
      <button class="btn" on:click={next} disabled={idx >= items.length - 1}>Next</button>
      <button class="btn" on:click={reveal} disabled={idx < 0 || revealed}>Check Answer</button>
    </div>
    {#if activity.citation}<div class="note">{activity.citation}</div>{/if}
  </div>

{:else}
  <!-- chart / exploreGrid: tap a tile, hear it, see its info -->
  <div class="card">
    <div class="grid letters">
      {#each items as item}
        <button class="tile greek" class:small={item.display.length > 3} on:click={() => clickItem(item)}>
          {item.display}
        </button>
      {/each}
    </div>
    {#if activity.ui?.fields && lastClicked}
      <div class="fields">
        {#each activity.ui.fields as f, i}
          <div class="field"><div class="label">{f}</div>
            <div class="value">{i === 0 ? (lastClicked.meta.name || lastClicked.display) : (lastClicked.meta.sound || lastClicked.meta.translit || lastClicked.secondary || '')}</div></div>
        {/each}
      </div>
    {:else if lastClicked}
      <div class="fields"><div class="field"><div class="label">Info</div><div class="value">{lastClicked.secondary || ''}</div></div></div>
    {/if}
    <div class="controls">
      {#if activity.sayAlphabetAudio}
        <button class="btn secondary" on:click={() => play(activity.sayAlphabetAudio)}>Say Alphabet</button>
      {/if}
      {#if activity.sayWholeListAudio}
        <button class="btn secondary" on:click={() => play(activity.sayWholeListAudio)}>Say Whole List</button>
      {/if}
    </div>
    {#if activity.note}<div class="note">{activity.note}</div>{/if}
    {#if activity.noteButton}<div class="note">{activity.noteButton}</div>{/if}
  </div>
{/if}
