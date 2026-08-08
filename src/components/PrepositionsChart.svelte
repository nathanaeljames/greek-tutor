<script>
  // THE PREPOSITIONS CHART (5F §2.1). Chapter 6 draws its ten prepositions as
  // a DIAGRAM, not a table: ἐν sits in a circle at the centre and the other
  // nine stand around it, each with an arrow showing the direction of motion
  // its case implies. The arrangement IS the pedagogy (standing directive 2) —
  // "out of" points away from the circle, "into" points at it, "through" runs
  // across it — so the geometry is reconstructed rather than flattened.
  //
  // It is NOT a pixel copy of the original's 1990s line art. The goal is a
  // clean, legible diagram inside a 380px phone viewport; the spec says so
  // explicitly. The same block renders as a Learn topic and as the Review
  // Prepositions Chart, from one component, so the two can never disagree.
  //
  // Greek-tap rule (directive 9): every Greek label plays its own clip. The
  // gloss under it is ink.
  //
  // LAYOUT. Nine slots on a 320x320 user-space grid plus the centre. The slot
  // names are the data's (topLeft, top, topRight, left, right, lowerLeft,
  // lowerRight, bottomLeft, bottomRight); an unknown slot still renders, in a
  // spare row below the diagram, rather than vanishing.
  import { play } from '../lib/audio.js';
  export let block;
  // The heading the HOST already printed (topicPages prints the topic title,
  // which for this block is also "Prepositions Chart"). Same rule as
  // Paradigm's: the data is not ours to edit, so the renderer declines to say
  // it twice.
  export let title = null;

  const SIZE = 320;
  const CX = SIZE / 2;
  const CY = 150;
  const R = 40;                                  // the ἐν circle

  // x/y is the label ANCHOR; the arrow runs between `from` and `to`.
  const SLOTS = {
    topLeft:     { x: 46,  y: 28,  anchor: 'start'  },
    top:         { x: 160, y: 20,  anchor: 'middle' },
    topRight:    { x: 274, y: 28,  anchor: 'end'    },
    left:        { x: 20,  y: 118, anchor: 'start'  },
    right:       { x: 300, y: 118, anchor: 'end'    },
    lowerLeft:   { x: 20,  y: 196, anchor: 'start'  },
    lowerRight:  { x: 300, y: 196, anchor: 'end'    },
    bottomLeft:  { x: 46,  y: 286, anchor: 'start'  },
    bottomRight: { x: 274, y: 286, anchor: 'end'    },
    centre:      { x: CX,  y: CY,  anchor: 'middle' }
  };

  // Arrow paths, per slot and arrow kind. "in" points at the circle, "out"
  // away from it, "over" arcs above it, "across" runs through it, "down"
  // drives into it from below, "curveIn" is περί's encircling sweep.
  const ARROWS = {
    topLeft:     { curveIn: 'M 92 46 A 78 78 0 0 1 150 108', in: 'M 92 46 L 138 96', out: 'M 138 96 L 92 46' },
    top:         { over: 'M 118 62 A 62 62 0 0 1 202 62', in: 'M 160 44 L 160 104', out: 'M 160 104 L 160 44' },
    topRight:    { in: 'M 228 46 L 182 96', out: 'M 182 96 L 228 46' },
    left:        { in: 'M 74 132 L 116 145', out: 'M 116 145 L 74 132' },
    right:       { in: 'M 246 132 L 204 145', out: 'M 204 145 L 246 132' },
    lowerLeft:   { in: 'M 74 190 L 116 162', out: 'M 116 162 L 74 190' },
    lowerRight:  { in: 'M 246 190 L 204 162', out: 'M 204 162 L 246 190' },
    bottomLeft:  { across: 'M 74 268 L 250 118', in: 'M 92 262 L 138 200', out: 'M 138 200 L 92 262' },
    bottomRight: { down: 'M 250 268 L 176 190', in: 'M 228 262 L 182 200', out: 'M 182 200 L 228 262' }
  };

  $: nodes = block.nodes || [];
  $: centre = nodes.find(n => n.slot === 'centre') || null;
  $: placed = nodes.filter(n => n.slot !== 'centre' && SLOTS[n.slot]);
  // A slot the layout does not know still has to reach the learner.
  $: unplaced = nodes.filter(n => n.slot !== 'centre' && !SLOTS[n.slot]);

  const slotOf = node => SLOTS[node.slot];
  const arrowOf = node => (ARROWS[node.slot] || {})[node.arrow] || null;
  // The gloss sits one line under the Greek, on the label's own anchor.
  const glossY = node => slotOf(node).y + 17;
</script>

<div class="prep-chart">
  {#if title}<div class="rc-heading">{title}</div>{/if}
  <svg
    class="prep-svg"
    viewBox="0 0 {SIZE} {SIZE}"
    role="group"
    aria-label={block.title || 'Prepositions chart'}>
    <defs>
      <marker id="prep-arrow" viewBox="0 0 10 10" refX="9" refY="5"
              markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" />
      </marker>
    </defs>

    {#each placed as node}
      {@const d = arrowOf(node)}
      {#if d}<path class="prep-arrow" d={d} marker-end="url(#prep-arrow)" />{/if}
    {/each}

    <circle class="prep-circle" cx={CX} cy={CY} r={R} />

    {#if centre}
      <!-- Greek-tap rule: the centre word pronounces itself like every other. -->
      <g class="prep-node prep-centre" role="button" tabindex="0"
         on:click={() => centre.audio && play(centre.audio)}
         on:keydown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); centre.audio && play(centre.audio); } }}>
        <text class="prep-greek greek" x={CX} y={CY - 2} text-anchor="middle">{centre.greek}</text>
        <text class="prep-gloss" x={CX} y={CY + 16} text-anchor="middle">{centre.gloss}</text>
      </g>
    {/if}

    {#each placed as node}
      {@const slot = slotOf(node)}
      <g class="prep-node" role="button" tabindex="0"
         data-slot={node.slot}
         on:click={() => node.audio && play(node.audio)}
         on:keydown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); node.audio && play(node.audio); } }}>
        <text class="prep-greek greek" x={slot.x} y={slot.y} text-anchor={slot.anchor}>{node.greek}</text>
        <text class="prep-gloss" x={slot.x} y={glossY(node)} text-anchor={slot.anchor}>{node.gloss}</text>
      </g>
    {/each}
  </svg>

  {#if unplaced.length}
    <div class="prep-extra">
      {#each unplaced as node}
        <button class="prep-extra-node" on:click={() => node.audio && play(node.audio)}>
          <span class="greek">{node.greek}</span><span class="prep-gloss">{node.gloss}</span>
        </button>
      {/each}
    </div>
  {/if}
</div>
