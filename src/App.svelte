<script>
  // App shell + hash router.
  //   #/                                Global TOC
  //   #/chapter/:id                     Chapter hub (accordion Unit Map)
  //   #/chapter/:id/:section            Hub with one section expanded
  //   #/activity/:id/:activityId        Activity page
  // Chrome (top bar, bottom section bar, sequential rail, responsive
  // sidebar) lives here; the routed components render content only.
  import { onMount, tick } from 'svelte';
  import ChapterNav from './components/ChapterNav.svelte';
  import ActivityHost from './components/ActivityHost.svelte';
  import UnitMap from './components/UnitMap.svelte';
  import TopBar from './components/TopBar.svelte';
  import BottomBar from './components/BottomBar.svelte';
  import SequentialRail from './components/SequentialRail.svelte';
  import EndOfChapterDialog from './components/EndOfChapterDialog.svelte';
  import DownloadControl from './components/DownloadControl.svelte';
  import Settings from './components/Settings.svelte';
  import { onAudioProblem, stop as stopAudio } from './lib/audio.js';
  import { getChapter, getActivity, sectionOfActivity, SECTIONS } from './lib/content.js';
  import { getCurrentActivity, getChapterProgress } from './lib/progress.js';
  import * as nav from './lib/nav.js';

  let route = { view: 'toc' };
  let wide = false;
  let expandedSections = [];
  let showEndDialog = false;
  let progressTick = 0;
  let scrollEl;
  let toast = '';
  let toastTimer;

  function parseHash() {
    const h = location.hash.replace(/^#\/?/, '');
    const parts = h.split('/').filter(Boolean);
    if (parts[0] === 'activity' && parts[1] && parts[2]) {
      route = { view: 'activity', chapterId: parts[1], activityId: parts.slice(2).join('/') };
    } else if (parts[0] === 'chapter' && parts[1]) {
      const section = SECTIONS.includes(parts[2]) ? parts[2] : null;
      route = { view: 'chapter', chapterId: parts[1], section };
    } else if (parts[0] === 'settings') {
      route = { view: 'settings' };
    } else {
      route = { view: 'toc' };
    }
  }

  function computeExpansion() {
    if (route.view !== 'chapter') return;
    const id = route.chapterId;
    if (route.section) {
      nav.setExpanded(id, [route.section]);
    } else if (!nav.hasAnyExpanded(id)) {
      const cur = getCurrentActivity(id);
      const sec = cur ? sectionOfActivity(id, cur) : null;
      nav.setExpanded(id, sec ? [sec] : []);
    }
    expandedSections = nav.getExpanded(id);
  }

  async function handleHashChange() {
    stopAudio();                       // audio stops on every route change
    parseHash();
    showEndDialog = false;
    computeExpansion();
    progressTick += 1;                 // refresh map/sidebar from progress
    await tick();
    // Scroll content to top, except the hub :section route (UnitMap scrolls
    // the target section into view itself).
    if (scrollEl && !(route.view === 'chapter' && route.section)) scrollEl.scrollTop = 0;
  }

  function handleToggle(e) {
    nav.toggleExpanded(route.chapterId, e.detail.section);
    expandedSections = nav.getExpanded(route.chapterId);
  }

  onMount(() => {
    const mq = window.matchMedia('(min-width: 900px)');
    wide = mq.matches;
    const onMq = e => (wide = e.matches);
    // addEventListener on MediaQueryList needs Safari 14+; fall back for older iOS.
    if (mq.addEventListener) mq.addEventListener('change', onMq);
    else mq.addListener(onMq);

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    onAudioProblem(msg => {
      toast = msg;
      clearTimeout(toastTimer);
      toastTimer = setTimeout(() => (toast = ''), 3500);
    });
    return () => {
      if (mq.removeEventListener) mq.removeEventListener('change', onMq);
      else mq.removeListener(onMq);
      window.removeEventListener('hashchange', handleHashChange);
    };
  });

  $: chapter = route.chapterId ? getChapter(route.chapterId) : null;
  $: activity = route.view === 'activity' ? getActivity(route.chapterId, route.activityId) : null;
  $: chapterContext = route.view === 'chapter' || route.view === 'activity';
  $: sidebarVisible = wide && chapterContext;
  $: bottomBarVisible = !wide && chapterContext;
  $: activityHighlight = route.view === 'activity' ? route.activityId : null;

  // No Map tab: on the plain hub route no section tab is active (null).
  $: activeSection =
    route.view === 'activity'
      ? sectionOfActivity(route.chapterId, route.activityId)
      : route.view === 'chapter'
        ? route.section
        : null;

  const chapterLabel = ch => (ch ? (ch.number != null ? `${ch.number}. ${ch.title}` : ch.title) : 'Chapter');

  $: screenTitle =
    route.view === 'toc'
      ? 'Greek Tutor'
      : route.view === 'settings'
        ? 'Storage & Downloads'
        : route.view === 'chapter'
          ? chapterLabel(chapter)
          : (activity ? activity.title : 'Activity');

  $: if (typeof document !== 'undefined') {
    document.title = route.view === 'toc' ? 'Greek Tutor' : `Greek Tutor — ${screenTitle}`;
  }

  // Wide hub pane needs a live progress read.
  $: hubProg = route.view === 'chapter' ? (progressTick, getChapterProgress(route.chapterId)) : { done: 0, total: 0 };
  $: hubPct = hubProg.total ? Math.round((hubProg.done / hubProg.total) * 100) : 0;
</script>

<div class="app" class:wide>
  <TopBar
    title={screenTitle}
    showBack={route.view !== 'toc'}
    backHash={route.view === 'activity' ? `#/chapter/${route.chapterId}` : '#/'}
    showToc={route.view !== 'toc'}
    showSettings={route.view === 'toc'} />

  <div class="app-main">
    {#if sidebarVisible}
      <aside class="sidebar">
        <UnitMap chapterId={route.chapterId} variant="sidebar" highlightActivityId={activityHighlight} {progressTick} />
      </aside>
    {/if}

    <div class="scroll-area" bind:this={scrollEl}>
      <div class="content">
        {#if route.view === 'toc'}
          <ChapterNav />
        {:else if route.view === 'settings'}
          <Settings />
        {:else if route.view === 'chapter'}
          {#if wide}
            <div class="hub-pane-wide">
              <div class="hub-title">{chapter ? chapterLabel(chapter) : ''}</div>
              <div class="hub-progress-line">{hubProg.done} of {hubProg.total} complete</div>
              <div class="progress-track"><div class="progress-fill" style="width:{hubPct}%"></div></div>
              <DownloadControl packId={route.chapterId} />
              <p class="hub-hint">Select an activity from the Unit Map to begin.</p>
            </div>
          {:else}
            <UnitMap
              chapterId={route.chapterId}
              variant="hub"
              {expandedSections}
              focusSection={route.section}
              {progressTick}
              on:toggle={handleToggle} />
          {/if}
        {:else if route.view === 'activity'}
          <ActivityHost chapterId={route.chapterId} activityId={route.activityId} on:progress={() => (progressTick += 1)} />
          <SequentialRail chapterId={route.chapterId} activityId={route.activityId} on:end={() => (showEndDialog = true)} />
        {/if}
      </div>
    </div>
  </div>

  {#if bottomBarVisible}
    <BottomBar chapterId={route.chapterId} {activeSection} />
  {/if}
</div>

{#if showEndDialog}
  <EndOfChapterDialog chapterId={route.chapterId} on:close={() => (showEndDialog = false)} />
{/if}

{#if toast}
  <div class="toast">{toast}</div>
{/if}
