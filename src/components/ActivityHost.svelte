<script>
  // Renders one activity's content (chrome supplied by the App shell).
  // Records progress on mount: contentAudio pages count completed on visit;
  // scored activities complete on finish (handled inside their components).
  import { createEventDispatcher } from 'svelte';
  import { getChapter, getActivity } from '../lib/content.js';
  import { markVisited, markCompleted } from '../lib/progress.js';
  import ContentAudio from './ContentAudio.svelte';
  import SelectActivity from './SelectActivity.svelte';
  import SpellActivity from './SpellActivity.svelte';
  import ReadingCategories from './ReadingCategories.svelte';

  export let chapterId;
  export let activityId;

  const dispatch = createEventDispatcher();
  $: chapter = getChapter(chapterId);
  $: activity = getActivity(chapterId, activityId);

  // Self-directed activities complete on reaching their final item, so they
  // are NOT auto-completed on visit: selfCheck sequences (Pronounce Letters,
  // Phonetic Reading) mark themselves in ContentAudio; category reading marks
  // itself in ReadingCategories.
  const SELF_PACED = new Set(['selfCheckStepper', 'selfCheckSequence']);

  let recordedId = null;
  $: if (activity && activity.id !== recordedId) record(activity);
  function record(a) {
    recordedId = a.id;
    markVisited(a.id);
    // A plain contentAudio page (chart/stepper/textPage/flashcard) is done on
    // visit. Self-paced and category exercises complete on finish instead.
    if (a.type === 'contentAudio' && !a.categories && !SELF_PACED.has(a.mode)) markCompleted(a.id);
    dispatch('progress');
  }
</script>

{#if chapter && activity}
  {#if activity.instructions && !activity.instructions.startsWith('_verify')}
    <div class="instructions">{activity.instructions}</div>
  {/if}
  <!-- Consecutive routes often render the SAME component type; Svelte would
       reuse the instance and its per-activity state (question list, counters,
       shuffle) would never reinitialize (A8/A9/A16). Keying on activityId
       forces a destroy/remount on every navigation so each activity starts
       clean. -->
  {#key activityId}
    {#if activity.categories}
      <ReadingCategories {chapter} {activity} />
    {:else if activity.type === 'contentAudio'}
      <ContentAudio {chapter} {activity} />
    {:else if activity.type === 'select'}
      <SelectActivity {chapter} {activity} />
    {:else if activity.type === 'spell'}
      <SpellActivity {chapter} {activity} />
    {:else}
      <div class="card">This activity type ({activity.type}) arrives in a later phase.</div>
    {/if}
  {/key}
{/if}
