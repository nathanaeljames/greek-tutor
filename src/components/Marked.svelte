<script>
  // Renders one authored string, honoring the inline [[u]]...[[/u]] underline,
  // [[g]]...[[/g]] descriptive-term and [[i]]...[[/i]] title spans, plus the
  // "( ´ )" isolated-mark groups. Segments are text nodes -- never {@html}.
  //
  // An isolated mark is a base-less diacritic: it needs the SPACING codepoint,
  // a font whose perispomeni is the rounded mark rather than a tilde, and the
  // original's deliberate enlargement (5B-SPEC2 B1). The mark span carries the
  // speller keyboard's font path -- those tiles are the one surface confirmed
  // on device to render the circumflex correctly.
  //
  // 5F §2.2: an underlined run whose slug names one of the host activity's
  // popups IS the link that opens it — chapter 8's Three Uses page underlines
  // "As a pronoun", "Reflexive Intensifier" and 'Adjective meaning "same"',
  // whose popup ids are exactly those slugs. A run that matches nothing stays
  // an ordinary underline, which is what keeps the "he himself will get the
  // car" emphasis on the same page from turning into a dead link.
  import { splitUnderline, splitMarkGroups } from '../lib/markup.js';
  import { ISOLATED_MARKS, spacingMarks } from '../lib/greek.js';
  import { usePopups, popupFor } from '../lib/popups.js';
  export let text = '';

  const popups = usePopups();
  const linked = run => (popups ? popupFor(popups, run) : null);

  const GREEK_LETTER = /[Ͱ-Ͽἀ-῿]/;
  // A group's inner text is a MARK (enlarge, keyboard font), a Greek letter
  // (Greek font, mild bump) or ordinary punctuation (grouped, left as is).
  function kindOf(inner) {
    const glyphs = spacingMarks(inner);
    if ([...glyphs].every(char => ISOLATED_MARKS.has(char))) return 'mark';
    return GREEK_LETTER.test(glyphs) ? 'greek' : 'plain';
  }
</script>

{#each splitUnderline(text) as seg}{#if seg.u}{@const popup = linked(seg.t)}{#if popup}<button class="popup-link underline-link" on:click={() => popups.open(popup)}>{seg.t}</button>{:else}<u>{seg.t}</u>{/if}{:else if seg.g}<span class="term-green">{seg.t}</span>{:else if seg.i}<em>{seg.t}</em>{:else}{#each splitMarkGroups(seg.t) as part}{#if part.group != null}<span class="mark-group">(&thinsp;<span class="isolated-mark" class:as-mark={kindOf(part.group) === 'mark'} class:greek={kindOf(part.group) === 'greek'}>{spacingMarks(part.group)}</span>&thinsp;)</span>{:else}{part.t}{/if}{/each}{/if}{/each}
