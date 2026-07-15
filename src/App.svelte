<script>
  // Minimal hash router: #/ -> TOC, #/chapter/<id> -> menus, #/activity/<chId>/<actId>
  import { onMount } from 'svelte';
  import ChapterNav from './components/ChapterNav.svelte';
  import ChapterHome from './components/ChapterHome.svelte';
  import ActivityHost from './components/ActivityHost.svelte';
  import { onAudioProblem } from './lib/audio.js';

  let route = { view: 'toc' };
  let toast = '';
  let toastTimer;

  function parseHash() {
    const h = location.hash.replace(/^#\/?/, '');
    const parts = h.split('/').filter(Boolean);
    if (parts[0] === 'chapter' && parts[1]) route = { view: 'chapter', chapterId: parts[1] };
    else if (parts[0] === 'activity' && parts[1] && parts[2]) route = { view: 'activity', chapterId: parts[1], activityId: parts.slice(2).join('/') };
    else route = { view: 'toc' };
  }

  onMount(() => {
    parseHash();
    window.addEventListener('hashchange', parseHash);
    onAudioProblem(msg => {
      toast = msg;
      clearTimeout(toastTimer);
      toastTimer = setTimeout(() => (toast = ''), 3500);
    });
    return () => window.removeEventListener('hashchange', parseHash);
  });
</script>

{#if route.view === 'toc'}
  <ChapterNav />
{:else if route.view === 'chapter'}
  <ChapterHome chapterId={route.chapterId} />
{:else if route.view === 'activity'}
  <ActivityHost chapterId={route.chapterId} activityId={route.activityId} />
{/if}

{#if toast}
  <div class="toast">{toast}</div>
{/if}
