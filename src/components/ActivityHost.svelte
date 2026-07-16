<script>
  // Renders one activity's content (chrome supplied by the App shell).
  // Records progress on mount: contentAudio pages count completed on visit;
  // scored activities complete on finish (handled inside their components).
  import { createEventDispatcher } from 'svelte';
  import { getChapter, getActivity } from '../lib/content.js';
  import { markVisited, markCompleted } from '../lib/progress.js';
  import ContentAudio from './ContentAudio.svelte';
  import SelectActivity from './SelectActivity.svelte';

  export let chapterId;
  export let activityId;

  const dispatch = createEventDispatcher();
  $: chapter = getChapter(chapterId);
  $: activity = getActivity(chapterId, activityId);

  let recordedId = null;
  $: if (activity && activity.id !== recordedId) record(activity);
  function record(a) {
    recordedId = a.id;
    markVisited(a.id);
    // A contentAudio page (that actually renders content) is done on visit.
    if (a.type === 'contentAudio' && !a.categories) markCompleted(a.id);
    dispatch('progress');
  }
</script>

{#if chapter && activity}
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
{/if}
