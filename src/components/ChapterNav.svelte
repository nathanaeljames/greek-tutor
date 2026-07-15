<script>
  import { getToc, isChapterAvailable } from '../lib/content.js';
  const toc = getToc();
</script>

<div class="screen">
  <div class="topbar"><h1>Greek Tutor</h1></div>
  <div class="card" style="text-align:center">
    <div class="greek" style="font-size:2.2rem">&Alpha; &alpha; &nbsp; &Omega; &omega;</div>
    <div style="font-size:0.9rem; color:#555">Learn Koine Greek -- based on the ParsonsTech Greek Tutor by Dr. Ted Hildebrandt</div>
  </div>
  <div class="section-label">Chapters</div>
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
  <div class="section-label">Coming Later</div>
  {#each toc.special as s}
    <div class="menu-item disabled"><span class="dot" style="background:#999"></span><span>{s.title}</span></div>
  {/each}
</div>
