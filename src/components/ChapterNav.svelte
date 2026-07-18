<script>
  // Global TOC content (chrome supplied by the App shell).
  import { getToc, isChapterAvailable } from '../lib/content.js';
  const toc = getToc();
</script>

<div class="card toc-hero">
  <div class="greek toc-hero-glyphs">&Alpha; &alpha; &nbsp; &Omega; &omega;</div>
  <div class="toc-hero-sub">Learn Koine Greek &mdash; based on the ParsonsTech Greek Tutor by Dr. Ted Hildebrandt</div>
</div>

{#if toc.intro && isChapterAvailable(toc.intro.id)}
  <button class="menu-item" on:click={() => (location.hash = `#/chapter/${toc.intro.id}`)}>
    <span class="dot"></span>
    <span>{toc.intro.title}</span>
  </button>
{/if}

<div class="section-label">Chapters</div>
<!-- Single column on phones; two-column card grid at >=900px (A2). -->
<div class="chapter-grid">
  {#each toc.chapters as ch}
    {#if isChapterAvailable(ch.id)}
      <button class="menu-item" on:click={() => (location.hash = `#/chapter/${ch.id}`)}>
        <span class="dot"></span>
        <span><strong>{ch.number}.</strong> {ch.title}</span>
      </button>
    {:else}
      <div class="menu-item disabled">
        <span class="dot" style="background:#999"></span>
        <span><strong>{ch.number}.</strong> {ch.title}</span>
      </div>
    {/if}
  {/each}
</div>

<div class="section-label">Coming Later</div>
{#each toc.special as s}
  <div class="menu-item disabled"><span class="dot" style="background:#999"></span><span>{s.title}</span></div>
{/each}
