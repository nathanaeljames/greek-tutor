<script>
  // Storage & Downloads utility screen (#/settings). Plain by design — no
  // lesson chrome. Shows storage estimate + persistence, a whole-manifest
  // "Download all", per-pack rows for built content, and a Clear action.
  import { onMount } from 'svelte';
  import { getBuiltPacks } from '../lib/packs.js';
  import { allState, downloadAll, cancelAll, clearAllAudio, storageInfo, audioFileCount, audioCacheDiagnostic, dedupeAudioCache, packStatesFingerprint, audioCount, lastScan, reconcileAudioCache, startupReport } from '../lib/downloads.js';
  import DownloadControl from './DownloadControl.svelte';

  const all = allState();

  // "Audio files stored" reads the persisted counter store (audioCount) so it
  // renders INSTANTLY on mount — no full cache.keys() scan on the paint path
  // (that scan is what hung app load once the whole library was cached). The
  // exact value is kept current by the download manager (clear -> 0, a recount
  // after each download settles, and the deferred reconcile). null = not yet
  // measured on this device -> "counting…" until the background scan fills it.
  let storage = { usage: null, quota: null, persisted: false };
  let counting = false;      // a manual recount is in flight
  let builtPacks = [];
  let packsFailed = false;   // manifest unreachable (first run offline)
  let confirmClear = false;
  let clearing = false;

  let online = typeof navigator !== 'undefined' ? navigator.onLine : true;

  // P1 diagnostic. Two activations (4-STORAGE-PASS §3a): the ?debug URL flag
  // (desktop), and seven quick taps on the "Storage" heading — the installed
  // PWA has no URL bar, and opening the URL in Safari inspects a DIFFERENT
  // storage partition than the installed app. The toggle persists for the
  // session (sessionStorage) so it survives navigation but not a relaunch.
  const DEBUG_KEY = 'greek-tutor-debug-card';
  let debug = false;
  try {
    debug = (typeof location !== 'undefined' && new URLSearchParams(location.search).has('debug'))
      || sessionStorage.getItem(DEBUG_KEY) === '1';
  } catch (_) { /* sessionStorage unavailable -> ?debug only */ }
  let tapCount = 0;
  let tapTimer;
  function headingTap() {
    clearTimeout(tapTimer);
    tapTimer = setTimeout(() => (tapCount = 0), 1600);
    tapCount += 1;
    if (tapCount >= 7) {
      tapCount = 0;
      debug = !debug;
      try {
        if (debug) sessionStorage.setItem(DEBUG_KEY, '1');
        else sessionStorage.removeItem(DEBUG_KEY);
      } catch (_) { /* toggle still works for this mount */ }
    }
  }

  // Cold-start timing (reflects the ORIGINAL app load; hash navigation to
  // Settings does not reset it). Localizes the load hang: SW-serving-shell vs
  // our JS. Captured in onMount so the gt-app-created mark (set after App's
  // constructor returns) is already present.
  let startup = {};

  let diag = null;
  let diagRunning = false;
  async function runDiag() {
    diagRunning = true;
    diag = await audioCacheDiagnostic();
    diagRunning = false;
  }

  // Copy report (§3b): serialize the diagnostic to JSON so device results can
  // be pasted back into chat.
  //
  // Two device-pass bugs fixed here:
  //  1. Clipboard was ALWAYS "unavailable": the old code awaited the multi-
  //     second scan and THEN called clipboard.writeText — by then Safari had
  //     dropped the user-activation from the tap, so the write always threw.
  //     Now the write happens against an already-computed diag (scan first via
  //     "Scan audio cache", then Copy is synchronous-enough to keep activation);
  //     and the textarea fallback is always populated so a failed clipboard
  //     never leaves the user empty-handed.
  //  2. The report was multiple MB (every one of ~3800 duplicate URLs, with
  //     headers) — it took minutes to paste. audioCacheDiagnostic now caps the
  //     duplicate DETAIL (duplicatesTotal keeps the true count), so the report
  //     is a few KB.
  let copyMsg = '';
  let reportText = '';
  async function copyReport() {
    if (!diag) {
      copyMsg = 'Scanning…';
      await runDiag();          // populate diag first (this is the slow part)
    }
    const json = JSON.stringify(diag, null, 2);
    reportText = json;          // always show it: a failed clipboard still copies by hand
    try {
      await navigator.clipboard.writeText(json);
      copyMsg = 'Report copied to clipboard (also shown below).';
    } catch (_) {
      copyMsg = 'Clipboard unavailable — select and copy the text below.';
    }
  }

  // Debug-card recovery tool: collapse duplicate entries. Kept behind debug on
  // purpose — run it only AFTER a Copy report has captured the duplicates.
  let dedupeMsg = '';
  async function runDedupe() {
    dedupeMsg = 'Working…';
    const r = await dedupeAudioCache();
    dedupeMsg = r.error
      ? `Failed: ${r.error}`
      : `Removed ${r.removed} duplicate entr${r.removed === 1 ? 'y' : 'ies'} (${r.duplicateUrls} URLs affected).`;
    await recount();      // duplicates collapsed -> refresh the exact count
    await refreshStorage();
  }

  // Only the browser's storage estimate is fetched here — the file count comes
  // from the audioCount store (kept current by the manager), so this never runs
  // a full cache scan. estimate() alone was cheap; the scan was the cost.
  async function refreshStorage() {
    storage = await storageInfo();
  }

  // Manual recount: the one place that runs the real O(files) cache scan, only
  // on explicit user action (the "unavailable — tap to retry" affordance).
  async function recount() {
    counting = true;
    await audioFileCount();   // updates the audioCount store + persists it
    counting = false;
  }

  onMount(() => {
    startup = startupReport();
    refreshStorage();
    // The one reconciling cache scan (exact count + badge drift) lives HERE, in
    // the Storage menu — NOT on app load. It is deferred to idle and runs at
    // most once per session (skipped on repeat opens when nothing changed), so
    // the store-backed count renders instantly and the scan just confirms it in
    // the background. This is the answer to "why scan on load" — we no longer do.
    reconcileAudioCache();
    getBuiltPacks().then(p => (builtPacks = p)).catch(() => (packsFailed = true));
    const up = () => (online = navigator.onLine);
    window.addEventListener('online', up);
    window.addEventListener('offline', up);
    return () => { window.removeEventListener('online', up); window.removeEventListener('offline', up); };
  });

  // Refresh the browser estimate whenever a download/clear lands (per-pack or
  // "Download all"). No cache scan here — the count updates via audioCount.
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
    <!-- Seven quick taps on this heading toggle the diagnostic card (§3a):
         the installed PWA has no URL bar for ?debug. Deliberately not a
         button — it must not look interactive. -->
    <!-- svelte-ignore a11y-click-events-have-key-events a11y-no-noninteractive-element-interactions -->
    <h2 class="settings-h" on:click={headingTap}>Storage</h2>
    <div class="settings-row"><span>Audio files stored</span>
      <span>
        {#if $audioCount != null}{$audioCount}
        {:else if counting}counting…
        {:else}<button class="count-retry" on:click={recount}>unavailable — tap to retry</button>{/if}
      </span></div>
    <div class="settings-row"><span>Used (reported by the browser)</span><span>{fmtBytes(storage.usage)}</span></div>
    <div class="settings-row"><span>Available (quota)</span><span>{fmtBytes(storage.quota)}</span></div>
    <div class="settings-note">
      "Audio files stored" counts the distinct audio files in the app's own
      cache and updates immediately. The browser's "Used" figure may lag
      behind deletions on iOS.
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
      <div class="controls">
        <button class="btn secondary" on:click={runDiag} disabled={diagRunning}>{diagRunning ? 'Scanning…' : 'Scan audio cache'}</button>
        <button class="btn secondary" on:click={copyReport} disabled={diagRunning}>Copy report</button>
      </div>
      {#if $lastScan}<div class="settings-note">Last cache scan: {$lastScan.label} — {$lastScan.ms}ms{#if $lastScan.entries != null} ({$lastScan.entries} entries){/if}</div>{/if}
      <div class="settings-note">Cold start (ms since nav): worker {startup.workerStart} · resp-start {startup.responseStart} · resp-end {startup.responseEnd} · js-start {startup.jsStart} · app {startup.appCreated} · DCL {startup.domContentLoaded} · sw {String(startup.swControlled)}</div>
      {#if copyMsg}<div class="settings-note">{copyMsg}</div>{/if}
      {#if reportText}<textarea class="report-out" readonly rows="8">{reportText}</textarea>{/if}
      {#if diag}
        <div class="settings-row"><span>Entries</span><span>{diag.entryCount}</span></div>
        <div class="settings-row"><span>Distinct URLs</span><span>{diag.distinctUrls}</span></div>
        <div class="settings-row"><span>Duplicate URLs</span><span>{diag.duplicatesTotal ?? diag.duplicates.length}</span></div>
        <div class="settings-row"><span>Summed bytes</span><span>{fmtBytes(diag.totalBytes)} ({diag.totalBytes})</span></div>
        {#if diag.readErrors}<div class="settings-row"><span>Unreadable entries</span><span>{diag.readErrors}</span></div>{/if}
        <div class="settings-note">Caches: {Object.entries(diag.perCacheCounts).map(([n, c]) => `${n}: ${c}`).join(' · ') || '(none)'}</div>
        <div class="settings-note">Vary: {Object.entries(diag.varyHistogram).map(([v, c]) => `${v} ×${c}`).join(' · ') || '(empty cache)'}</div>
        {#if diag.estimate}<div class="settings-note">estimate: {fmtBytes(diag.estimate.usage)} used · persisted: {diag.persisted}</div>{/if}
        {#each diag.duplicates.slice(0, 12) as d}
          <div class="settings-note warn">{d.url}
            {#each d.entries as e}<br />vary: {e.vary || '(none)'} · req: {JSON.stringify(e.reqHeaders)}{/each}
          </div>
        {/each}
        {#if (diag.duplicatesTotal ?? diag.duplicates.length) > 12}<div class="settings-note warn">…and {(diag.duplicatesTotal ?? diag.duplicates.length) - 12} more duplicated URLs (sample in Copy report).</div>{/if}
        {#if diag.error}<div class="settings-note warn">{diag.error}</div>{/if}
        {#if diag.duplicates.length}
          <button class="btn secondary" on:click={runDedupe}>Remove duplicate copies</button>
          <div class="settings-note">Run only after Copy report — duplicates are the evidence.</div>
        {/if}
        {#if dedupeMsg}<div class="settings-note">{dedupeMsg}</div>{/if}
      {/if}
    </section>
  {/if}

  <section class="card">
    <h2 class="settings-h">Clear downloaded audio</h2>
    <div class="settings-note">Removes every cached audio file from this device.</div>
    <button class="btn secondary" on:click={() => (confirmClear = true)}>Clear downloaded audio</button>
  </section>
</div>

<style>
  /* Honest counter states (§3c): the retry affordance replaces the old
     unexplained dash. Styled as a quiet inline link, not a button. */
  .count-retry {
    background: none;
    border: none;
    padding: 0;
    font: inherit;
    color: var(--link);
    text-decoration: underline;
  }
  .report-out {
    width: 100%;
    font-family: monospace;
    font-size: 0.7rem;
    margin-top: 8px;
    box-sizing: border-box;
  }
</style>

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
