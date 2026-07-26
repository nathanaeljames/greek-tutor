<script>
  // Renders one authored string, honoring inline [[u]]...[[/u]] underline
  // spans and the "( ´ )" isolated-mark groups (see lib/markup.js). Segments
  // are plain text nodes -- never {@html}.
  //
  // An isolated mark is a base-less diacritic: it needs the SPACING codepoint,
  // a font whose perispomeni is the rounded mark rather than a tilde, and the
  // original's deliberate enlargement (5B-SPEC2 B1). The mark span carries the
  // speller keyboard's font path -- those tiles are the one surface confirmed
  // on device to render the circumflex correctly.
  import { splitUnderline, splitMarkGroups } from '../lib/markup.js';
  import { ISOLATED_MARKS, spacingMarks } from '../lib/greek.js';
  export let text = '';

  const GREEK_LETTER = /[Ͱ-Ͽἀ-῿]/;
  // A group's inner text is a MARK (enlarge, keyboard font), a Greek letter
  // (Greek font, mild bump) or ordinary punctuation (grouped, left as is).
  function kindOf(inner) {
    const glyphs = spacingMarks(inner);
    if ([...glyphs].every(char => ISOLATED_MARKS.has(char))) return 'mark';
    return GREEK_LETTER.test(glyphs) ? 'greek' : 'plain';
  }
</script>

{#each splitUnderline(text) as seg}{#if seg.u}<u>{seg.t}</u>{:else}{#each splitMarkGroups(seg.t) as part}{#if part.group != null}<span class="mark-group">(&thinsp;<span class="isolated-mark" class:as-mark={kindOf(part.group) === 'mark'} class:greek={kindOf(part.group) === 'greek'}>{spacingMarks(part.group)}</span>&thinsp;)</span>{:else}{part.t}{/if}{/each}{/if}{/each}
