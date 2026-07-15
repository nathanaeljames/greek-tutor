<script>
  import { getChapter, getActivity } from '../lib/content.js';
  import ContentAudio from './ContentAudio.svelte';
  import SelectActivity from './SelectActivity.svelte';
  export let chapterId;
  export let activityId;
  $: chapter = getChapter(chapterId);
  $: activity = getActivity(chapterId, activityId);
</script>

{#if chapter && activity}
  <div class="screen">
    <div class="topbar">
      <button class="backbtn" on:click={() => (location.hash = `#/chapter/${chapterId}`)}>&larr;</button>
      <h1>{activity.title}</h1>
    </div>
    {#if activity.instructions && !activity.instructions.startsWith('_verify')}
      <div class="instructions">{activity.instructions}</div>
    {/if}
    {#if activity.categories}
      <div class="card">This multi-category exercise arrives in phase 4.</div>
    {:else if activity.type === 'contentAudio'}
      <ContentAudio {chapter} {activity} />
    {:else if activity.type === 'select'}
      <SelectActivity {chapter} {activity} />
    {:else}
      <div class="card">This activity type ({activity.type}) arrives in a later phase.</div>
    {/if}
  </div>
{/if}
