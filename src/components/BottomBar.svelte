<script>
  // Persistent bottom section bar (chapter context only). Four equal-width
  // items: Learn / Drill / Exercise / Review (Map removed — user decision
  // 2026-07-17; the plain hub is reachable via Back). A section with no
  // activities (e.g. the Introduction's drill/exercise/review) is disabled.
  import { getChapter } from '../lib/content.js';

  export let chapterId;
  export let activeSection = null;   // 'learn'|'drill'|'exercise'|'quickReview'|null

  const ITEMS = [
    { key: 'learn', label: 'Learn', icon: 'book' },
    { key: 'drill', label: 'Drill', icon: 'repeat' },
    { key: 'exercise', label: 'Exercise', icon: 'pencil' },
    { key: 'quickReview', label: 'Review', icon: 'eye' }
  ];

  $: chapter = getChapter(chapterId);
  // Reactive enabled-map. In Svelte 4 a template binding like
  // `class:disabled={!enabled(item.key)}` does NOT track `chapter` as a
  // dependency (it's hidden inside the function call), so if `chapter` ever
  // changes without `item` changing, the disabled state would NOT recompute —
  // leaving the bar stuck greyed until an unrelated re-render. Naming `chapter`
  // directly here fixes that class of stale-state bug (e.g. after an iOS PWA
  // resume-from-frozen). See the Svelte-4 reactivity gotcha.
  $: sectionEnabled = {
    learn: !!(chapter && (chapter.learn || []).length),
    drill: !!(chapter && (chapter.drill || []).length),
    exercise: !!(chapter && (chapter.exercise || []).length),
    quickReview: !!(chapter && (chapter.quickReview || []).length)
  };

  // Setting an identical hash fires no hashchange; dispatch one manually so
  // the shell still re-applies expansion state (e.g. re-tapping the open tab).
  function go(hash) {
    if (location.hash === hash) window.dispatchEvent(new Event('hashchange'));
    else location.hash = hash;
  }
  function onTap(item) {
    if (!sectionEnabled[item.key]) return;
    go(`#/chapter/${chapterId}/${item.key}`);
  }
</script>

<nav class="bottom-bar" aria-label="Chapter sections">
  {#each ITEMS as item}
    <button
      class="bb-item"
      class:active={activeSection === item.key}
      class:disabled={!sectionEnabled[item.key]}
      disabled={!sectionEnabled[item.key]}
      on:click={() => onTap(item)}>
      <svg class="bb-icon" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        {#if item.icon === 'book'}
          <path d="M3 19a9 9 0 0 1 9 0a9 9 0 0 1 9 0" /><path d="M3 6a9 9 0 0 1 9 0a9 9 0 0 1 9 0" /><path d="M3 6l0 13" /><path d="M12 6l0 13" /><path d="M21 6l0 13" />
        {:else if item.icon === 'repeat'}
          <path d="M4 12v-3a3 3 0 0 1 3 -3h13m-3 -3l3 3l-3 3" /><path d="M20 12v3a3 3 0 0 1 -3 3h-13m3 3l-3 -3l3 -3" />
        {:else if item.icon === 'pencil'}
          <path d="M4 20h4l10.5 -10.5a2.828 2.828 0 1 0 -4 -4l-10.5 10.5v4" /><path d="M13.5 6.5l4 4" />
        {:else if item.icon === 'eye'}
          <path d="M10 12a2 2 0 1 0 4 0a2 2 0 0 0 -4 0" /><path d="M21 12c-2.4 4 -5.4 6 -9 6c-3.6 0 -6.6 -2 -9 -6c2.4 -4 5.4 -6 9 -6c3.6 0 6.6 2 9 6" />
        {/if}
      </svg>
      <span class="bb-label">{item.label}</span>
    </button>
  {/each}
</nav>
