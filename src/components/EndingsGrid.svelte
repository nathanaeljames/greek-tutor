<script>
  // The ENDINGS table of a paradigm chart: flat [ending, gloss, ending, gloss]
  // tuples, one pair per number column, so the rows line up with the chart the
  // endings belong to.
  //
  // Its own component since DISCLOSURE-SPEC1 W5 because it now has TWO hosts.
  // In a modal (a drill Hint) the endings are an in-place STATE of the one
  // paradigm — §4.4 abolishes stacking a second modal on top of the first — and
  // in main content the Endings button still opens its own single-level modal
  // (one level is not stacking). Two hosts drawing their own copy of this table
  // is how the two would come to disagree about a chart the learner is meant to
  // read the same way in both places.
  //
  // Endings rows are bare morphemes with no clips of their own, so they render
  // in ink rather than tappable blue (directive 8).
  export let rows = [];
  export let columns = [];
</script>

<div class="pg-endgrid">
  {#if columns.length === 2}
    <div class="pg-endhead"><span>{columns[0]}</span><span>{columns[1]}</span></div>
  {/if}
  {#each rows as row}
    <div class="pg-endrow">
      <span class="pg-endpair"><span class="greek pg-ending">{row[0]}</span><span class="pg-endgloss">{row[1]}</span></span>
      <span class="pg-endpair"><span class="greek pg-ending">{row[2]}</span><span class="pg-endgloss">{row[3]}</span></span>
    </div>
  {/each}
</div>
