<script>
  // THE PREPOSITIONS CHART (5F §2.1). Chapter 6 draws its ten prepositions as
  // a DIAGRAM, not a table: ἐν sits in a circle at the centre and the other
  // nine stand around it, arrows showing the motion each case implies.
  //
  // 5F-FEEDBACK2.pdf item 1 (Nathanael, 2026-08-09): the two previous
  // reconstructions (hand-placed coordinates, then polar geometry) both failed
  // the only test that matters — overlay the original and match it. This
  // version is a TRACE: every coordinate below was measured off a 300-dpi
  // render of ch6railwalk.pdf p6 (crop space 715×584, the panel's own pixels)
  // and is used as-is. Facts of the original the previous versions invented
  // away, now traced faithfully:
  //   - μετά has NO arrow (the data's arrow field is ignored entirely);
  //   - εἰς's arrow penetrates INSIDE the circle ("into"), πρός's stops AT
  //     the boundary ("to"), ἐκ's starts inside and exits ("out of"),
  //     ἀπό's lies wholly outside pointing away ("from");
  //   - διά crosses corner-to-corner through the circle;
  //   - κατά is a short diagonal stroke parallel to διά plus a separate
  //     downward arrowhead ("down");
  //   - περί is a small hook curving up beside its own label;
  //   - ἐπί/upon carries one thick underline, gloss BESIDE the word — as do
  //     μετά and διά; the others set the gloss under the Greek.
  // Do not "regularize" any of this: the stencil-overlay comparison against
  // the original crop is the acceptance test (5F-SPEC1-PATCH2.md item 1).
  //
  // Greek-tap rule (directive 9): every Greek label plays its own clip. The
  // gloss under it is ink.
  import { play } from '../lib/audio.js';
  export let block;
  // The heading the HOST already printed (topicPages prints the topic title,
  // which for this block is also "Prepositions Chart"). Same rule as
  // Paradigm's: the data is not ours to edit, so the renderer declines to say
  // it twice.
  export let title = null;

  // Traced geometry, one entry per slot. All coordinates are the original
  // panel's own pixel space (viewBox below). greek/gloss give the text
  // baseline start; anchor defaults to 'start'. glossLines allows κατά's
  // two-line "against," / "down".
  const LAYOUT = {
    centre:      { greek: [320, 290], gloss: [320, 342], anchor: 'middle' },
    topLeft:     { greek: [72, 122],  gloss: [38, 168] },
    top:         { greek: [268, 168], gloss: [342, 168] },
    topRight:    { greek: [460, 120], gloss: [558, 120] },
    left:        { greek: [35, 252],  gloss: [55, 300] },
    right:       { greek: [540, 252], gloss: [552, 300] },
    lowerLeft:   { greek: [55, 345],  gloss: [85, 392] },
    lowerRight:  { greek: [505, 345], gloss: [488, 392] },
    bottomLeft:  { greek: [142, 478], gloss: [218, 478] },
    bottomRight: { greek: [398, 437], glossLines: [['against,', 392, 490], ['down', 418, 532]] }
  };

  // The fixed linework of the trace: not data-driven, because the original's
  // arrows are irregular in exactly the ways that carry the meaning.
  const CIRCLE = { cx: 320, cy: 300, r: 109 };
  const STROKES = [
    // πρός → : head stops at the circle boundary ("to")
    { d: 'M 135 248 L 198 248', head: true },
    // εἰς → : head lands INSIDE the circle ("into")
    { d: 'M 128 335 L 256 335', head: true },
    // ἐκ → : starts inside the circle, exits ("out of")
    { d: 'M 358 335 L 472 335', head: true },
    // ἀπό → : wholly outside, pointing away ("from")
    { d: 'M 448 248 L 516 248', head: true },
    // διά: corner to corner, THROUGH the circle
    { d: 'M 280 452 L 442 222', head: true },
    // κατά: short diagonal parallel to διά ("against")...
    { d: 'M 438 368 L 342 432', head: false },
    // ...plus its own downward arrowhead ("down")
    { d: 'M 376 404 L 376 444', head: true },
    // περί: the little hook curving up beside its label
    { d: 'M 112 178 Q 148 122 192 112', head: true },
    // ἐπί/upon underline (one thick bar, both words)
    { d: 'M 255 203 L 392 203', head: false }
  ];

  $: nodes = block.nodes || [];
  $: placed = nodes.filter(n => LAYOUT[n.slot]);
  // A slot the layout does not know still has to reach the learner.
  $: unplaced = nodes.filter(n => !LAYOUT[n.slot]);

  const layoutOf = node => LAYOUT[node.slot];
  const tap = node => { if (node.audio) play(node.audio); };
  const keyTap = (e, node) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); tap(node); }
  };
</script>

<div class="prep-chart">
  {#if title}<div class="rc-heading">{title}</div>{/if}
  <svg
    class="prep-svg"
    viewBox="25 88 667 470"
    role="group"
    aria-label={block.title || 'Prepositions chart'}>
    <defs>
      <marker id="prep-arrow" viewBox="0 0 10 10" refX="8.5" refY="5"
              markerWidth="4.6" markerHeight="4.2" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" />
      </marker>
    </defs>

    {#each STROKES as s}
      <path class="prep-arrow" d={s.d} marker-end={s.head ? 'url(#prep-arrow)' : null} />
    {/each}

    <circle class="prep-circle" cx={CIRCLE.cx} cy={CIRCLE.cy} r={CIRCLE.r} />

    {#each placed as node}
      {@const l = layoutOf(node)}
      <g class="prep-node" class:prep-centre={node.slot === 'centre'}
         role="button" tabindex="0" data-slot={node.slot}
         on:click={() => tap(node)} on:keydown={e => keyTap(e, node)}>
        <text class="prep-greek greek" x={l.greek[0]} y={l.greek[1]}
              text-anchor={l.anchor || 'start'}>{node.greek}</text>
        {#if l.glossLines}
          {#each l.glossLines as gl}
            <text class="prep-gloss" x={gl[1]} y={gl[2]}
                  text-anchor={l.anchor || 'start'}>{gl[0]}</text>
          {/each}
        {:else}
          <text class="prep-gloss" x={l.gloss[0]} y={l.gloss[1]}
                text-anchor={l.anchor || 'start'}>{node.gloss}</text>
        {/if}
      </g>
    {/each}
  </svg>

  {#if unplaced.length}
    <div class="prep-extra">
      {#each unplaced as node}
        <button class="prep-extra-node" on:click={() => tap(node)}>
          <span class="greek">{node.greek}</span><span class="prep-gloss">{node.gloss}</span>
        </button>
      {/each}
    </div>
  {/if}
</div>
