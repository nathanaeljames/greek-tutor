<script>
  // Accordion "Unit Map" — the chapter hub (variant="hub") and, on wide
  // viewports, the persistent left sidebar (variant="sidebar", all sections
  // expanded). Rows navigate to activities; progress affordances come from
  // progress.js.
  import { createEventDispatcher, tick } from 'svelte';
  import { getChapter, SECTIONS } from '../lib/content.js';
  import { getActivityState, getSectionProgress, getChapterProgress, getCurrentActivity, progressRev } from '../lib/progress.js';
  import DownloadControl from './DownloadControl.svelte';

  export let chapterId;
  export let variant = 'hub';               // 'hub' | 'sidebar'
  export let expandedSections = [];          // hub only; sidebar is all-expanded
  export let focusSection = null;            // hub: scroll this section into view
  export let highlightActivityId = null;     // teal-highlight the open activity

  const dispatch = createEventDispatcher();
  const LABELS = { learn: 'Learn', drill: 'Drill', exercise: 'Exercise', quickReview: 'Quick Review' };

  $: chapter = getChapter(chapterId);
  $: isSidebar = variant === 'sidebar';
  // $progressRev is read so these recompute when progress changes (B4: the
  // store replaces the old progressTick prop threading).
  $: currentId = ($progressRev, getCurrentActivity(chapterId));
  $: chapterProg = ($progressRev, getChapterProgress(chapterId));
  $: pct = chapterProg.total ? Math.round((chapterProg.done / chapterProg.total) * 100) : 0;

  // NOTE: template expressions must reference reactive variables directly
  // (expandedSections, currentId, $progressRev) or Svelte 4 won't re-render
  // them; helpers therefore take those values as arguments.
  function rowState(id, current, _tick) {
    const s = getActivityState(id);
    if (s === 'done') return 'done';
    if (id === current) return 'current';
    return 'none';
  }
  function go(id) { location.hash = `#/activity/${chapterId}/${id}`; }
  function toggle(section) {
    if (isSidebar) return;
    dispatch('toggle', { section });
  }

  // Scroll the routed section's card into view when arriving via #/chapter/:id/:section.
  let cardEls = {};
  $: if (!isSidebar && focusSection) scrollToSection(focusSection);
  async function scrollToSection(section) {
    await tick();
    const el = cardEls[section];
    if (el && el.scrollIntoView) el.scrollIntoView({ block: 'start', behavior: 'auto' });
  }
</script>

{#if chapter}
  <div class="unitmap" class:sidebar={isSidebar}>
    <div class="hub-header">
      <div class="hub-title">{chapter.number != null ? `${chapter.number}. ${chapter.title}` : chapter.title}</div>
      <div class="hub-progress-line">{chapterProg.done} of {chapterProg.total} complete</div>
      <div class="progress-track"><div class="progress-fill" style="width:{pct}%"></div></div>
      {#if !isSidebar}<DownloadControl packId={chapterId} />{/if}
    </div>

    {#each SECTIONS.filter(s => (chapter[s] || []).length) as section}
      {@const items = chapter[section] || []}
      {@const sp = ($progressRev, getSectionProgress(chapterId, section))}
      {@const open = isSidebar || expandedSections.includes(section)}
      <div class="section-card" bind:this={cardEls[section]}>
        <button class="section-head" class:open on:click={() => toggle(section)} aria-expanded={open}>
          {#if !isSidebar}
            <svg class="chevron" class:down={open} viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6l-6 6" /></svg>
          {/if}
          <span class="section-name">{LABELS[section]}</span>
          <span class="section-count">{sp.done} of {sp.count}</span>
        </button>

        {#if open}
          <div class="section-body">
            {#each items as act}
              {@const st = rowState(act.id, currentId, $progressRev)}
              <button
                class="act-row"
                class:active={act.id === highlightActivityId}
                on:click={() => go(act.id)}>
                <span class="bullet"></span>
                <span class="act-title">{act.title}</span>
                <span class="act-state {st}">
                  {#if st === 'done'}
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12l5 5l10 -10" /></svg>
                  {:else if st === 'current'}
                    up next
                  {/if}
                </span>
              </button>
            {/each}
          </div>
        {/if}
      </div>
    {/each}
  </div>
{/if}
