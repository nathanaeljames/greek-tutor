<script context="module">
  // PHYSICAL KEYBOARD MAP (legacy roman->Greek layout, font-map
  // _keyboard_layout_note) plus the 5D punctuation keys. Exported so the tile
  // keyboard, the reference popup and every speller's keydown handler read one
  // table — the iPhone this app is built for has no physical keyboard at all,
  // so the TILES are the contract and this is the desktop convenience layer.
  export const KEYMAP = {
    a: 'α', b: 'β', g: 'γ', d: 'δ', e: 'ε', z: 'ζ', h: 'η', q: 'θ', i: 'ι',
    k: 'κ', l: 'λ', m: 'μ', n: 'ν', c: 'ξ', o: 'ο', p: 'π', r: 'ρ', s: 'σ',
    t: 'τ', u: 'υ', f: 'φ', x: 'χ', y: 'ψ', w: 'ω', j: 'ς'
  };
  // Keys that type themselves. Space is here because the whole-verse speller
  // needs word boundaries; the punctuation follows the tiles.
  //
  // The apostrophe key types U+1FBD GREEK KORONIS, the elision mark, NOT the
  // ASCII apostrophe it is printed with (D-29). Both are accepted by the
  // checker, but what lands in the field should be the character the chapter-2
  // marks chart and the delivered verses actually use.
  export const PUNCT_KEYS = { ' ': ' ', ',': ',', '.': '.', ';': ';', "'": '᾽' };
</script>

<script>
  // THE SHARED SPELLER KEYBOARD (divergence log D-15). One keyboard for every
  // spell surface in the app: the chapter-1/2/3 word spellers and the
  // chapter-3 whole-verse speller all mount this component, so a layout change
  // lands everywhere at once and no chapter can fork it.
  //
  // Layout A, chosen by Nathanael at the 5D Phase 0 checkpoint: the shipped
  // letter and mark rows are untouched and ONE row is added at the bottom —
  // four punctuation keys and a space bar. Everything stays visible; there is
  // no paging, because a learner who never opens a "punctuation" page would
  // never discover that a space key exists.
  import { createEventDispatcher } from 'svelte';
  import { getSpellerTiles } from '../lib/content.js';

  export let tilesRef = null;
  export let fallbackLetters = [];
  export let showHelp = false;

  const dispatch = createEventDispatcher();

  // The SHARED contract wins over any inline activity.spellerTiles copy.
  // Chapter 1's data carries its own byte-identical duplicate of the 39 tiles,
  // and honouring that first would have left chapter 1 on the old keyboard —
  // exactly the per-chapter fork the spec rules out. The inline copy survives
  // only as the fallback if the shared file is ever unreachable.
  export let inlineTiles = null;
  $: tiles = getSpellerTiles(tilesRef) || inlineTiles || {};
  $: letterTiles = tiles.letters || (inlineTiles && inlineTiles.letters) || fallbackLetters;
  $: diacriticTiles = tiles.diacritics || (inlineTiles && inlineTiles.diacritics) || [];
  $: compositeTiles = tiles.composites || (inlineTiles && inlineTiles.composites) || ['ᾳ', 'ῃ', 'ῳ'];
  $: punctuationTiles = tiles.punctuation || [];
  $: spaceTile = tiles.space || null;
</script>

<div class="tile-keyboard">
  <div class="tk-letters">
    {#each letterTiles as ch}
      <button class="tk-key greek" on:click={() => dispatch('insert', ch)}>{ch}</button>
    {/each}
  </div>
  <div class="tk-marks">
    {#each diacriticTiles as d}
      <button class="tk-key mark" title={d.name} on:click={() => dispatch('mark', d.apply)}>{d.label}</button>
    {/each}
    {#each compositeTiles as ch}
      <button class="tk-key greek" on:click={() => dispatch('insert', ch)}>{ch}</button>
    {/each}
  </div>
  {#if punctuationTiles.length || spaceTile}
    <div class="tk-punct">
      {#each punctuationTiles as p}
        <button class="tk-key punct" title={p.name} on:click={() => dispatch('insert', p.insert)}>{p.label}</button>
      {/each}
      {#if spaceTile}
        <button class="tk-key tk-space" on:click={() => dispatch('insert', spaceTile.insert)}>{spaceTile.label}</button>
      {/if}
    </div>
  {/if}
  <div class="tk-edit">
    <button class="btn secondary" on:click={() => dispatch('backspace')}>⌫ Backspace</button>
    <button class="btn secondary" on:click={() => dispatch('clear')}>Clear</button>
  </div>
</div>

<svelte:window on:keydown={showHelp ? (e) => { if (e.key === 'Escape') showHelp = false; } : null} />

{#if showHelp}
  <div class="modal-overlay" on:click|self={() => (showHelp = false)} role="presentation">
    <div class="modal kb-ref" role="dialog" aria-modal="true" aria-label="Greek keyboard reference">
      <h2 class="modal-title">Greek Keyboard</h2>
      <p class="modal-body">Type these keys to enter Greek letters:</p>
      <div class="kb-grid">
        {#each Object.entries(KEYMAP) as [k, g]}
          <div class="kb-cell"><span class="kb-roman">{k}</span><span class="kb-greek greek">{g}</span></div>
        {/each}
      </div>
      <p class="modal-note">Diacritics: use the mark tiles (they combine onto the previous letter). Space, comma, period, ; and ' type themselves — ' is the apostrophe that marks an elided letter (δι᾽ ἐμοῦ). Enter = Check, Backspace = delete.</p>
      <div class="modal-actions">
        <!-- svelte-ignore a11y-autofocus -->
        <button class="btn" autofocus on:click={() => (showHelp = false)}>Close</button>
      </div>
    </div>
  </div>
{/if}
