<script>
  import { getChapter } from '../lib/content.js';
  export let chapterId;
  $: chapter = getChapter(chapterId);
  const sections = [
    ['learn', 'Learn'],
    ['drill', 'Drill'],
    ['exercise', 'Exercise'],
    ['quickReview', 'Quick Review']
  ];
  const implemented = new Set(['contentAudio', 'select']);
</script>

{#if chapter}
  <div class="screen">
    <div class="topbar">
      <button class="backbtn" on:click={() => (location.hash = '#/')}>&larr;</button>
      <h1>{chapter.number}. {chapter.title}</h1>
    </div>
    {#each sections as [key, label]}
      <div class="section-label">{label}</div>
      {#each chapter[key] || [] as act}
        {#if implemented.has(act.type)}
          <button class="menu-item" on:click={() => (location.hash = `#/activity/${chapterId}/${act.id}`)}>
            <span class="dot"></span><span>{act.title}</span>
          </button>
        {:else}
          <div class="menu-item disabled" title="Coming in a later phase">
            <span class="dot" style="background:#999"></span>
            <span>{act.title} <em style="font-size:0.8rem">(soon)</em></span>
          </div>
        {/if}
      {/each}
    {/each}
  </div>
{/if}
