<script>
  // Renders the structured "content" block arrays that carry Chapter 1's
  // teaching prose (the original program's yellow panels). Visual arrangement
  // is pedagogy: headings, hanging-indent bibliographies, aligned definition
  // rows and underlined list lead-ins are all load-bearing, not decoration.
  //
  // Block types: heading | para | numbered | defList | biblist | refs | note.
  // Trailing { greek, caption?, audio? } "example" objects render in the Greek
  // font and play their clip on tap. defList rows [term, value, audio?] play
  // the row's clip when present.
  import { play } from '../lib/audio.js';

  export let blocks = [];

  function playAudio(id) { if (id) play(id); }
</script>

<div class="rich">
  {#each blocks as b}
    {#if b.type === 'heading'}
      <div class="rc-heading">{b.text}</div>

    {:else if b.type === 'para'}
      <p class="rc-para">{b.text}</p>
      {#if b.example}
        <button class="rc-example" class:tappable={b.example.audio} on:click={() => playAudio(b.example.audio)}>
          <span class="greek">{b.example.greek}</span>
          {#if b.example.caption}<span class="rc-caption">{b.example.caption}</span>{/if}
          {#if b.example.audio}<span class="rc-spk" aria-hidden="true">🔊</span>{/if}
        </button>
      {/if}

    {:else if b.type === 'numbered'}
      {#if b.preamble}<p class="rc-preamble">{b.preamble}</p>{/if}
      <ol class="rc-list">
        {#each b.items as it}
          <li>
            {#if it.label}<span class="rc-lead">{it.label}</span>{it.text ? ' — ' : ''}{/if}{it.text || ''}
            {#if it.example}
              <button class="rc-example" class:tappable={it.example.audio} on:click={() => playAudio(it.example.audio)}>
                <span class="greek">{it.example.greek}</span>
                {#if it.example.caption}<span class="rc-caption">{it.example.caption}</span>{/if}
                {#if it.example.audio}<span class="rc-spk" aria-hidden="true">🔊</span>{/if}
              </button>
            {/if}
            {#if it.defList}
              <div class="rc-deflist nested">
                {#each it.defList as row}
                  <button class="rc-defrow" class:tappable={row[2]} on:click={() => playAudio(row[2])}>
                    <span class="rc-term greek">{row[0]}</span>
                    <span class="rc-val greek">{row[1]}</span>
                    {#if row[2]}<span class="rc-spk" aria-hidden="true">🔊</span>{/if}
                  </button>
                {/each}
              </div>
            {/if}
            {#if it.note}<div class="rc-inlinenote">{it.note}</div>{/if}
          </li>
        {/each}
      </ol>

    {:else if b.type === 'defList'}
      <div class="rc-deflist">
        {#each b.rows as row}
          <button class="rc-defrow" class:tappable={row[2]} on:click={() => playAudio(row[2])}>
            <span class="rc-term greek">{row[0]}</span>
            <span class="rc-val greek">{row[1]}</span>
            {#if row[2]}<span class="rc-spk" aria-hidden="true">🔊</span>{/if}
          </button>
        {/each}
      </div>

    {:else if b.type === 'biblist'}
      {#if b.starNote}<div class="rc-starnote">{b.starNote}</div>{/if}
      <div class="rc-biblist">
        {#each b.items as entry}
          <div class="rc-bibentry">{entry}</div>
        {/each}
      </div>

    {:else if b.type === 'refs'}
      <div class="rc-refs">{b.text}</div>

    {:else if b.type === 'note'}
      <div class="note">{b.text}</div>
    {/if}
  {/each}
</div>
