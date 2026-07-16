<script>
  // Persistent bottom section bar (chapter context only). Five equal-width
  // items: Learn / Drill / Exercise / Review / Map. Section taps expand that
  // section on the hub; Map returns to the plain hub with the current
  // activity's section expanded.
  import { setExpanded } from '../lib/nav.js';
  import { getCurrentActivity } from '../lib/progress.js';
  import { sectionOfActivity } from '../lib/content.js';

  export let chapterId;
  export let activeSection = null;   // 'learn'|'drill'|'exercise'|'quickReview'|'map'|null

  const ITEMS = [
    { key: 'learn', label: 'Learn', icon: 'book' },
    { key: 'drill', label: 'Drill', icon: 'repeat' },
    { key: 'exercise', label: 'Exercise', icon: 'pencil' },
    { key: 'quickReview', label: 'Review', icon: 'eye' },
    { key: 'map', label: 'Map', icon: 'sitemap' }
  ];

  // Setting an identical hash fires no hashchange; dispatch one manually so
  // the shell still re-applies expansion state (e.g. re-tapping the open tab).
  function go(hash) {
    if (location.hash === hash) window.dispatchEvent(new Event('hashchange'));
    else location.hash = hash;
  }
  function goSection(section) {
    go(`#/chapter/${chapterId}/${section}`);
  }
  function goMap() {
    const cur = getCurrentActivity(chapterId);
    const sec = cur ? sectionOfActivity(chapterId, cur) : null;
    setExpanded(chapterId, sec ? [sec] : []);
    go(`#/chapter/${chapterId}`);
  }
  function onTap(item) {
    if (item.key === 'map') goMap();
    else goSection(item.key);
  }
</script>

<nav class="bottom-bar" aria-label="Chapter sections">
  {#each ITEMS as item}
    <button class="bb-item" class:active={activeSection === item.key} on:click={() => onTap(item)}>
      <svg class="bb-icon" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        {#if item.icon === 'book'}
          <path d="M3 19a9 9 0 0 1 9 0a9 9 0 0 1 9 0" /><path d="M3 6a9 9 0 0 1 9 0a9 9 0 0 1 9 0" /><path d="M3 6l0 13" /><path d="M12 6l0 13" /><path d="M21 6l0 13" />
        {:else if item.icon === 'repeat'}
          <path d="M4 12v-3a3 3 0 0 1 3 -3h13m-3 -3l3 3l-3 3" /><path d="M20 12v3a3 3 0 0 1 -3 3h-13m3 3l-3 -3l3 -3" />
        {:else if item.icon === 'pencil'}
          <path d="M4 20h4l10.5 -10.5a2.828 2.828 0 1 0 -4 -4l-10.5 10.5v4" /><path d="M13.5 6.5l4 4" />
        {:else if item.icon === 'eye'}
          <path d="M10 12a2 2 0 1 0 4 0a2 2 0 0 0 -4 0" /><path d="M21 12c-2.4 4 -5.4 6 -9 6c-3.6 0 -6.6 -2 -9 -6c2.4 -4 5.4 -6 9 -6c3.6 0 6.6 2 9 6" />
        {:else if item.icon === 'sitemap'}
          <path d="M3 16a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1z" /><path d="M15 16a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1z" /><path d="M9 4a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1z" /><path d="M12 8l0 4" /><path d="M6 15v-1a2 2 0 0 1 2 -2h8a2 2 0 0 1 2 2v1" />
        {/if}
      </svg>
      <span class="bb-label">{item.label}</span>
    </button>
  {/each}
</nav>
