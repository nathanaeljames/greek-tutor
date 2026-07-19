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
  import { getChapter, getActivity, sectionOfActivity, SECTIONS, loadChapter, isChapterLoaded, isChapterAvailable } from './lib/content.js';
  import { getCurrentActivity, getChapterProgress, progressRev } from './lib/progress.js';
  import * as nav from './lib/nav.js';

  let route = { view: 'toc' };
  let wide = false;
  let expandedSections = [];
  let showEndDialog = false;
  let scrollEl;
  let toast = '';
  let toastTimer;

  // Route gate (5A): chapter content is a lazy chunk. Before rendering a
  // chapter/activity subtree we await its loadChapter(id) once; everything
  // below stays sync. Intro/TOC/Settings gate on nothing (intro is static).
  //   loadState: 'ready' | 'loading' | 'error'
  //   contentRev: bumped when a chapter finishes loading so the sync getter
  //     reactive reads below re-run (module registry mutations are invisible
  //     to Svelte — same bridge pattern as progress.js's progressRev).
  let loadState = 'ready';
  let loadError = null;
  let contentRev = 0;
  let gateToken = 0;
  let showSlowLoading = false;   // loading indicator, mounted only if genuinely slow
  let slowTimer;

  async function gateRoute() {
    const id = (route.view === 'chapter' || route.view === 'activity') ? route.chapterId : null;
    // Nothing to gate: no chapter route, already loaded (incl. static intro),
    // or an unbuilt id (getChapter returns null and the null-guards handle it).
    if (!id || isChapterLoaded(id) || !isChapterAvailable(id)) {
      loadState = 'ready';
      return;
    }
    const token = ++gateToken;
    loadState = 'loading';
    loadError = null;
    // No spinner flash on the happy path: chunks are local/precached and the
    // await should resolve in single-digit ms. Only surface a loading note if
    // the promise is genuinely slow.
    clearTimeout(slowTimer);
    showSlowLoading = false;
    slowTimer = setTimeout(() => { if (token === gateToken && loadState === 'loading') showSlowLoading = true; }, 150);
    try {
      await loadChapter(id);
      if (token !== gateToken) return;         // superseded by a newer navigation
      contentRev += 1;                          // re-run the sync getter reads below
      loadState = 'ready';
    } catch (err) {
      if (token !== gateToken) return;
      console.error(`loadChapter("${id}") failed`, err);
      loadError = id;
      loadState = 'error';
    } finally {
      clearTimeout(slowTimer);
      showSlowLoading = false;
    }
  }

  function retryLoad() {
    // Resetting OUR memo (content.js) is necessary but not sufficient: the
    // browser's module map ALSO caches a failed dynamic import() and returns
    // the cached rejection for the same URL — verified in Chrome, and WebKit
    // doesn't even expose the URL in the import error, so cache-busting isn't
    // portable. A full reload gives a fresh module map; the app shell is
    // precached so this is fast, and the (now-recovered) chunk loads cleanly.
    location.reload();
  }

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
    // Reads chapter content (getCurrentActivity -> getSequence): only safe once
    // the chunk is loaded. The error path never reaches here.
    if (!isChapterLoaded(id)) return;
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
    // Route gate: ensure the routed chapter's chunk is loaded before its
    // subtree (and computeExpansion's content reads) render.
    await gateRoute();
    computeExpansion();
    // Progress re-render is handled by the progressRev store (B4): the
    // ActivityHost's markVisited/markCompleted bump it on mount.
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

  // `loaded` gates every sync content read for the current route's chapter.
  // It depends on contentRev so it re-runs the instant a chunk finishes loading
  // (the registry mutation itself is invisible to Svelte). Reading a getter on
  // an unloaded-but-built chapter would log a loud error — the gate prevents it.
  $: loaded = (contentRev, route.chapterId ? isChapterLoaded(route.chapterId) : false);

  $: chapter = loaded ? getChapter(route.chapterId) : null;
  $: activity = (loaded && route.view === 'activity') ? getActivity(route.chapterId, route.activityId) : null;
  $: chapterContext = route.view === 'chapter' || route.view === 'activity';
  // Chrome that reads chapter content stays hidden until the chunk is ready.
  $: sidebarVisible = wide && chapterContext && loaded;
  $: bottomBarVisible = !wide && chapterContext && loaded;
  $: activityHighlight = route.view === 'activity' ? route.activityId : null;

  // No Map tab: on the plain hub route no section tab is active (null).
  $: activeSection =
    route.view === 'activity'
      ? (loaded ? sectionOfActivity(route.chapterId, route.activityId) : null)
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

  // Wide hub pane needs a live progress read ($progressRev makes it reactive).
  $: hubProg = (loaded && route.view === 'chapter') ? ($progressRev, getChapterProgress(route.chapterId)) : { done: 0, total: 0 };
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
        <UnitMap chapterId={route.chapterId} variant="sidebar" highlightActivityId={activityHighlight} />
      </aside>
    {/if}

    <div class="scroll-area" bind:this={scrollEl}>
      <div class="content">
        {#if route.view === 'toc'}
          <ChapterNav />
        {:else if route.view === 'settings'}
          <Settings />
        {:else if loadState === 'error'}
          <!-- Chunk load failed. Plain message + retry, and NO dead end
               (standing directive 7): the TOC escape is always offered. -->
          <div class="card load-error">
            <p class="load-error-msg">This chapter couldn't load.</p>
            <div class="load-error-actions">
              <button class="btn" on:click={retryLoad}>Retry</button>
              <a class="btn secondary" href="#/">Table of contents</a>
            </div>
          </div>
        {:else if loadState === 'loading'}
          {#if showSlowLoading}<div class="loading-note" role="status">Loading&hellip;</div>{/if}
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
              on:toggle={handleToggle} />
          {/if}
        {:else if route.view === 'activity'}
          <ActivityHost chapterId={route.chapterId} activityId={route.activityId} />
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

<style>
  /* Route-gate loading/failure surfaces (5A). Kept minimal and unobtrusive:
     the loading note only mounts after a ~150ms delay, so it never flashes on
     the local/precached happy path. */
  .loading-note {
    padding: 1.5rem 0;
    text-align: center;
    color: var(--muted, #6b6b6b);
    font-size: 0.95rem;
  }
  .load-error-msg { margin: 0 0 1rem; }
  .load-error-actions { display: flex; flex-wrap: wrap; gap: 0.5rem; align-items: center; }
  /* The TOC escape is an <a> styled as a button for parity with .btn. */
  .load-error-actions :global(a.btn) { text-decoration: none; display: inline-flex; align-items: center; }
</style>
