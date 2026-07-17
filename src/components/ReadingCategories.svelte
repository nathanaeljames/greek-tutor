<script>
  // Reading People, Places and Letters. Three switchable categories; each
  // steps through Greek items and reveals the English on "Answer". Personal
  // and place names play their recorded clip on Answer; letter names play the
  // letter's name-only clip. Completing the last item of ANY category marks
  // the activity done.
  import { getReadingLists } from '../lib/content.js';
  import { play } from '../lib/audio.js';
  import { markCompleted } from '../lib/progress.js';
  export let chapter;
  export let activity;

  const lists = getReadingLists();
  const letters = chapter.alphabet.letters;

  function buildCategory(cat) {
    if (cat.listRef === 'alphabet.letters') {
      const ln = lists.letterNames || {};
      return (ln.greek || []).map((g, i) => ({
        greek: g,
        english: (ln.english || [])[i] || '',
        audio: letters[i] ? letters[i].audioShort : null
      }));
    }
    const key = (cat.listRef || '').replace('readingLists.', '');
    const rl = lists[key] || {};
    const audio = cat.audio || rl.audio || [];
    return (rl.greek || []).map((g, i) => ({
      greek: g,
      english: (rl.english || [])[i] || '',
      audio: audio[i] || null
    }));
  }

  const categories = (activity.categories || []).map(c => ({ name: c.name, items: buildCategory(c) }));

  let catIndex = 0;
  let itemIndex = 0;
  let answered = false;

  $: category = categories[catIndex];
  $: item = category ? category.items[itemIndex] : null;

  function selectCategory(i) {
    catIndex = i;
    itemIndex = 0;
    answered = false;
  }
  function answer() {
    answered = true;
    if (item && item.audio) play(item.audio);
    if (itemIndex === category.items.length - 1) markCompleted(activity.id);
  }
  function next() {
    if (!category) return;
    if (itemIndex < category.items.length - 1) itemIndex += 1;
    answered = false;
  }
  function prev() {
    if (itemIndex > 0) itemIndex -= 1;
    answered = false;
  }
</script>

<div class="card reading">
  <div class="cat-buttons">
    {#each categories as c, i}
      <button class="chip" class:active={i === catIndex} on:click={() => selectCategory(i)}>{c.name}</button>
    {/each}
  </div>

  {#if item}
    <div class="flash-pane"><div class="label">Greek {category.name}</div>
      <div class="value greek" style="font-size:2.2rem">{item.greek}</div></div>
    <div class="flash-pane"><div class="label">English {category.name}</div>
      <div class="value" style="font-size:1.3rem">{answered ? item.english : ''}</div></div>

    <div class="reading-count">{itemIndex + 1} of {category.items.length}</div>
  {/if}

  <div class="controls">
    <button class="btn secondary" on:click={prev} disabled={itemIndex === 0}>Previous</button>
    <button class="btn" on:click={next} disabled={!category || itemIndex >= category.items.length - 1}>Next</button>
    <button class="btn" on:click={answer} disabled={answered}>Answer</button>
  </div>
</div>
