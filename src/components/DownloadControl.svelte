<script>
  // Compact per-chapter audio-pack download control for the hub header.
  // State comes from the DownloadManager (downloads.js); the actual bytes live
  // in the shared 'greek-tutor-audio' cache and survive route changes.
  import { onMount } from 'svelte';
  import { packState, downloadPack, cancel } from '../lib/downloads.js';

  export let packId;

  $: state = packState(packId);   // re-subscribes if packId ever changes

  let online = typeof navigator !== 'undefined' ? navigator.onLine : true;
  onMount(() => {
    const up = () => (online = navigator.onLine);
    window.addEventListener('online', up);
    window.addEventListener('offline', up);
    return () => { window.removeEventListener('online', up); window.removeEventListener('offline', up); };
  });

  $: pct = $state.total ? Math.round(($state.done / $state.total) * 100) : 0;

  function start() { downloadPack(packId); }
  function resume() { downloadPack(packId); }
  function update() { downloadPack(packId, { force: true }); }
</script>

<div class="dl-control">
  {#if $state.state === 'downloading'}
    <div class="dl-progress">
      <div class="progress-track"><div class="progress-fill" style="width:{pct}%"></div></div>
      <div class="dl-progress-row">
        <span class="dl-pct">{pct}%</span>
        <button class="btn secondary small" on:click={() => cancel(packId)}>Cancel</button>
      </div>
    </div>
  {:else if $state.state === 'done'}
    <div class="dl-done">
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12l5 5l10 -10" /></svg>
      <span>Audio available offline</span>
    </div>
  {:else if $state.state === 'update'}
    <button class="btn secondary small" on:click={update} disabled={!online}>Update audio</button>
    {#if !online}<div class="dl-hint">Connect to the internet to download</div>{/if}
  {:else if $state.state === 'partial'}
    <button class="btn secondary small" on:click={resume} disabled={!online}>Resume download</button>
    <div class="dl-sub">{$state.done} of {$state.total} saved</div>
    {#if $state.error}<div class="dl-hint">{$state.error}</div>{/if}
    {#if !online}<div class="dl-hint">Connect to the internet to download</div>{/if}
  {:else}
    <button class="btn secondary small" on:click={start} disabled={!online}>
      Download audio{#if $state.total} · {$state.total} files{/if}
    </button>
    {#if !online}<div class="dl-hint">Connect to the internet to download</div>{/if}
  {/if}
</div>
