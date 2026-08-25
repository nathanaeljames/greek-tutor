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
  // The apostrophe key types U+0027, the straight apostrophe, which is what
  // every rendered elision in the data is stored as (D-29). A smooth breathing
  // is a different mark on a different row and the two are NOT interchangeable
  // anywhere in the app, including in the checker.
  export const PUNCT_KEYS = { ' ': ' ', ',': ',', '.': '.', ';': ';', "'": "'" };

  // ---- CAPITALS (DISCLOSURE-SPEC3 W3) --------------------------------------
  //
  // THE STANDARD GREEK UPPERCASE TABLE, written out rather than derived from
  // String.prototype.toUpperCase(). Two reasons it has to be explicit:
  //
  //   * ς. Unicode gives final sigma the same capital as medial sigma, and
  //     toUpperCase() agrees — but only by accident of the same table this
  //     states outright. W3.3 names the behaviour, so it is named here.
  //   * the composite tiles. toUpperCase('ᾳ') is 'ΑΙ' — TWO characters, the
  //     Unicode full-uppercase mapping for an iota subscript. A shift key that
  //     turned one tile into two letters would be a spelling bug. Only the 25
  //     letter tiles are in this table; a composite, a mark or a punctuation
  //     tile is not a key that shifts.
  //
  // Answer checking is case-INSENSITIVE at both "With Accents" settings
  // (lib/answer-check.js), so this adds an input capability and changes no
  // score: Χριστός was always accepted spelled χριστός, and now it can also be
  // typed the way the chapter prints it.
  export const CAPITALS = {
    α: 'Α', β: 'Β', γ: 'Γ', δ: 'Δ', ε: 'Ε', ζ: 'Ζ', η: 'Η', θ: 'Θ', ι: 'Ι',
    κ: 'Κ', λ: 'Λ', μ: 'Μ', ν: 'Ν', ξ: 'Ξ', ο: 'Ο', π: 'Π', ρ: 'Ρ', σ: 'Σ',
    τ: 'Τ', υ: 'Υ', φ: 'Φ', χ: 'Χ', ψ: 'Ψ', ω: 'Ω', 'ς': 'Σ'
  };
  export const capitalOf = ch => CAPITALS[ch] || ch;
  // PHYSICAL-KEYBOARD PARITY (W3.4). The desktop convenience layer folded the
  // key to lower case before looking it up, so Shift-A and a both typed α and
  // the tiles and the hardware keyboard disagreed about what the app can spell.
  // One entry point for both spellers, reading the one KEYMAP and the one
  // capital table — the same reason the keyboard itself is shared (D-15).
  export function greekForKey(key) {
    if (typeof key !== 'string' || [...key].length !== 1) return null;
    const greek = KEYMAP[key.toLowerCase()];
    if (!greek) return null;
    return key !== key.toLowerCase() ? capitalOf(greek) : greek;
  }
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
  // ---- SHIFT (W3.2) --------------------------------------------------------
  // ONE-SHOT, like a phone keyboard: tap Shift, the next LETTER tile types its
  // capital, the state reverts by itself. Tapping Shift again disarms it. The
  // armed state is visible on the key AND on every letter face, so the learner
  // can see what the next tap will produce rather than having to try one.
  //
  // The state lives HERE, in the one shared keyboard, and the component
  // dispatches the character it has already resolved. Neither speller learns
  // that a shift key exists — which is what keeps the two hosts from acquiring
  // two slightly different ideas of when a shift is spent (the D-15 fork this
  // component exists to prevent, and where the VERIFY-5D A6 defects lived).
  let shifted = false;
  const toggleShift = () => { shifted = !shifted; };
  function typeLetter(ch) {
    dispatch('insert', shifted ? capitalOf(ch) : ch);
    shifted = false;                      // spent by the letter it capitalized
  }
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
      <button class="tk-key greek" data-lower={ch} on:click={() => typeLetter(ch)}>{shifted ? capitalOf(ch) : ch}</button>
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
  {#if punctuationTiles.length}
    <div class="tk-punct">
      {#each punctuationTiles as p}
        <button class="tk-key punct" title={p.name} on:click={() => dispatch('insert', p.insert)}>{p.label}</button>
      {/each}
    </div>
  {/if}
  <!-- W3.2: THE BOTTOM ROW — Shift in the keyboard's LEFT-HAND CORNER and the
       space bar taking the rest of the line, so the shift key's width comes out
       of the space bar and out of nothing else. That is Nathanael's stated
       layout and it is also the only arrangement in which the phrase means
       anything: the space bar had already wrapped clear of the punctuation keys
       at every phone width, so a Shift key parked at the head of THAT row would
       have cost the space bar nothing.
       The row is unconditional. Shift is not tile data — it is a property of
       the one shared keyboard (D-15), so it is present on every speller in the
       app whatever tile set the activity names. -->
  <div class="tk-bottom">
    <button class="tk-key tk-shift" class:armed={shifted}
            aria-pressed={shifted} data-speller-shift
            on:click={toggleShift}>Shift</button>
    {#if spaceTile}
      <button class="tk-key tk-space" on:click={() => dispatch('insert', spaceTile.insert)}>{spaceTile.label}</button>
    {/if}
  </div>
  <div class="tk-edit">
    <button class="btn secondary" on:click={() => dispatch('backspace')}>⌫ Backspace</button>
    <button class="btn secondary" on:click={() => dispatch('clear')}>Clear</button>
  </div>
</div>

<svelte:window on:keydown={showHelp ? (e) => { if (e.key === 'Escape') showHelp = false; } : null} />

{#if showHelp}
  <div class="modal-overlay" on:click|self={() => (showHelp = false)} role="presentation">
    <div class="modal kb-ref" role="dialog" aria-modal="true" aria-label="Greek keyboard reference">
      <div class="modal-scroll">
      <h2 class="modal-title">Greek Keyboard</h2>
      <p class="modal-body">Type these keys to enter Greek letters:</p>
      <div class="kb-grid">
        {#each Object.entries(KEYMAP) as [k, g]}
          <div class="kb-cell"><span class="kb-roman">{k}</span><span class="kb-greek greek">{g}</span></div>
        {/each}
      </div>
      <p class="modal-note">Diacritics: use the mark tiles (they combine onto the previous letter). Space, comma, period, ; and ' type themselves — ' is the apostrophe that marks an elided letter (δι' ἐμοῦ); it is REQUIRED where a verse elides, and it is not the same mark as a smooth breathing. Enter = Check, Backspace = delete.</p>
      </div>
      <div class="modal-actions">
        <!-- svelte-ignore a11y-autofocus -->
        <button class="btn" autofocus on:click={() => (showHelp = false)}>Close</button>
      </div>
    </div>
  </div>
{/if}
