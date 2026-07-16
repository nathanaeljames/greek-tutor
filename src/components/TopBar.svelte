<script>
  // Top bar for all screens: contextual back button (left), title (center),
  // TOC shortcut (right, hub/activity only). A slot is reserved to the right
  // of the TOC icon for a future Search/Index action.
  export let title = '';
  export let showBack = false;
  export let backHash = '#/';
  export let showToc = false;
</script>

<header class="topbar">
  {#if showBack}
    <button class="icon-btn back" aria-label="Back" on:click={() => (location.hash = backHash)}>
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 6l-6 6l6 6" /></svg>
    </button>
  {:else}
    <span class="icon-btn placeholder" aria-hidden="true"></span>
  {/if}

  <h1 class="topbar-title">{title}</h1>

  {#if showToc}
    <button class="icon-btn toc" aria-label="Table of contents" on:click={() => (location.hash = '#/')}>
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l11 0" /><path d="M9 12l11 0" /><path d="M9 18l11 0" /><path d="M5 6l0 .01" /><path d="M5 12l0 .01" /><path d="M5 18l0 .01" /></svg>
    </button>
    <!-- reserved slot: Search/Index (later phase) -->
    <span class="icon-btn placeholder" aria-hidden="true"></span>
  {:else}
    <span class="icon-btn placeholder" aria-hidden="true"></span>
  {/if}
</header>
