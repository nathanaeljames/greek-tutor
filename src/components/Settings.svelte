<script>
  // Storage & Downloads utility screen (#/settings). Plain by design — no
  // lesson chrome. Shows storage estimate + persistence, a whole-manifest
  // "Download all", per-pack rows for built content, and a Clear action.
  import { onMount } from 'svelte';
  import { getBuiltPacks } from '../lib/packs.js';
  import { allState, downloadAll, cancelAll, clearAllAudio, storageInfo, audioFileCount, audioCacheDiagnostic, packStatesFingerprint } from '../lib/downloads.js';
  import DownloadControl from './DownloadControl.svelte';

  const all = allState();

  let storage = { usage: null, quota: null, persisted: false };
  let fileCount = null;      // ground truth from the cache itself (P1)
  let builtPacks = [];
  let packsFailed = false;   // manifest unreachable (first run offline)
  let confirmClear = false;
  let clearing = false;

  let online = typeof navigator !== 'undefined' ? navigator.onLine : true;

  // P1 diagnostic, hidden unless the page is loaded with ?debug.
  const debug = typeof location !== 'undefined' && new URLSearchParams(location.search).has('debug');
  let diag = null;
  let diagRunning = false;
  async function runDiag() {
    diagRunning = true;
    diag = await audioCacheDiagnostic();
    diagRunning = false;
  }

  async function refreshStorage() {
    storage = await storageInfo();
    fileCount = await audioFileCount();
  }

  onMount(() => {
    refreshStorage();
    getBuiltPacks().then(p => (builtPacks = p)).catch(() => (packsFailed = true));
    const up = () => (online = navigator.onLine);
    window.addEventListener('online', up);
    window.addEventListener('offline', up);
    return () => { window.removeEventListener('online', up); window.removeEventListener('offline', up); };
  });

  // Refresh the storage figures whenever any pack's state transitions (a
  // download or clear landed) — covers "Download all" AND per-pack rows (P1).
  $: $packStatesFingerprint, refreshStorage();

  function fmtBytes(n) {
    if (n == null) return '—';
    if (n >= 1024 ** 3) return (n / 1024 ** 3).toFixed(2) + ' GB';
    return (n / 1024 ** 2).toFixed(1) + ' MB';
  }
  $: allPct = $all.total ? Math.round(($all.done / $all.total) * 100) : 0;

  async function doClear() {
    clearing = true;
    await clearAllAudio();
    clearing = false;
    confirmClear = false;
    await refreshStorage();
  }
</script>

<div class="settings">
  <section class="card">
    <h2 class="settings-h">Storage</h2>
    <div class="settings-row"><span>Audio files stored</span><span>{fileCount == null ? '—' : fileCount}</span></div>
    <div class="settings-row"><span>Used (reported by the browser)</span><span>{fmtBytes(storage.usage)}</span></div>
    <div class="settings-row"><span>Available (quota)</span><span>{fmtBytes(storage.quota)}</span></div>
    <div class="settings-note">
      "Audio files stored" is counted from the app's own cache and updates
      immediately. The browser's "Used" figure may lag behind deletions on iOS.
    </div>
    <div class="settings-note">
      {#if storage.persisted}
        Persistent storage: <strong>granted</strong>.
      {:else}
        Persistent storage: <strong>not granted</strong> — iOS may reclaim storage if space runs low.
      {/if}
    </div>
  </section>

  <section class="card">
    <h2 class="settings-h">Download all audio</h2>
    {#if $all.state === 'downloading'}
      <div class="progress-track"><div class="progress-fill" style="width:{allPct}%"></div></div>
      <div class="dl-progress-row">
        <span class="dl-pct">{allPct}% · {$all.done} of {$all.total}</span>
        <button class="btn secondary small" on:click={cancelAll}>Cancel</button>
      </div>
    {:else}
      <button class="btn" on:click={downloadAll} disabled={!online}>
        {#if $all.state === 'partial'}Resume download all{:else if $all.state === 'done'}Re-download all{:else}Download all audio{/if}
      </button>
      {#if $all.state === 'partial'}<div class="settings-note">{$all.done} of {$all.total} files saved.</div>{/if}
      {#if $all.error}<div class="settings-note warn">{$all.error}</div>{/if}
      {#if !online}<div class="settings-note warn">Connect to the internet to download.</div>{/if}
    {/if}
    <div class="settings-note warn">Keep the app open until the download finishes.</div>
  </section>

  <section class="card">
    <h2 class="settings-h">Downloaded packs</h2>
    {#each builtPacks as p (p.id)}
      <div class="pack-row">
        <span class="pack-label">{p.label} <span class="pack-count">· {p.count} files</span></span>
        <DownloadControl packId={p.id} />
      </div>
    {/each}
    {#if !builtPacks.length}
      <div class="settings-note">
        {packsFailed ? 'Audio list unavailable — connect to the internet once to load it.' : 'Loading…'}
      </div>
    {/if}
  </section>

  {#if debug}
    <section class="card">
      <h2 class="settings-h">Cache diagnostic (debug)</h2>
      <button class="btn secondary" on:click={runDiag} disabled={diagRunning}>{diagRunning ? 'Scanning…' : 'Scan audio cache'}</button>
      {#if diag}
        <div class="settings-row"><span>Entries</span><span>{diag.entryCount}</span></div>
        <div class="settings-row"><span>Summed bytes</span><span>{fmtBytes(diag.totalBytes)} ({diag.totalBytes})</span></div>
        <div class="settings-row"><span>Duplicate URLs</span><span>{diag.duplicates.length}</span></div>
        <div class="settings-note">Caches: {diag.cacheNames.join(', ') || '(none)'}</div>
        {#if diag.estimate}<div class="settings-note">estimate: {fmtBytes(diag.estimate.usage)} used</div>{/if}
        {#each diag.duplicates as d}
          <div class="settings-note warn">{d.url}
            {#each d.entries as e}<br />vary: {e.vary || '(none)'} · req: {JSON.stringify(e.reqHeaders)}{/each}
          </div>
        {/each}
        {#if diag.error}<div class="settings-note warn">{diag.error}</div>{/if}
      {/if}
    </section>
  {/if}

  <section class="card">
    <h2 class="settings-h">Clear downloaded audio</h2>
    <div class="settings-note">Removes every cached audio file from this device.</div>
    <button class="btn secondary" on:click={() => (confirmClear = true)}>Clear downloaded audio</button>
  </section>
</div>

{#if confirmClear}
  <div class="modal-overlay" on:click|self={() => !clearing && (confirmClear = false)} role="presentation">
    <div class="modal" role="dialog" aria-modal="true" aria-label="Clear downloaded audio">
      <h2 class="modal-title">Clear downloaded audio?</h2>
      <p class="modal-body">This deletes all cached audio. You'll need to download packs again to use them offline.</p>
      <div class="modal-actions">
        <button class="btn" on:click={doClear} disabled={clearing}>{clearing ? 'Clearing…' : 'Clear audio'}</button>
        <button class="btn secondary" on:click={() => (confirmClear = false)} disabled={clearing}>Cancel</button>
      </div>
    </div>
  </div>
{/if}
