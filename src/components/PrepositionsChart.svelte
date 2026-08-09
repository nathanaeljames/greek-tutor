<script>
  // THE PREPOSITIONS CHART (5F §2.1). Chapter 6 draws its ten prepositions as
  // a DIAGRAM, not a table: ἐν sits in an oval at the centre and the other
  // nine stand around it, each with an arrow showing the direction of motion
  // its case implies. The arrangement IS the pedagogy (standing directive 2) —
  // "out of" points away from the circle, "into" points at it, "through" runs
  // across it — so the geometry is reconstructed rather than flattened.
  //
  // 5F-FEEDBACK.pdf item 1 (Nathanael, 2026-08-09): match the original's
  // intersections, angles and positioning, not a loosely-spaced redraw. Every
  // node below sits on a fixed ANGLE around a shared ellipse (the original's
  // ἐν is wider than tall), and every in/out arrow is computed from that same
  // angle at a start/end RADIUS, so it always meets the ellipse boundary at
  // exactly the point the label sits over — no more hand-placed coordinates
  // that could drift out of alignment with their own label.
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

  const SIZE = 320;
  const CX = SIZE / 2;
  const CY = 158;
  // The ἐν oval: wider than tall, matching the original's proportions.
  const ERX = 36, ERY = 26;

  // Clock position, in degrees (0 = right/east, increasing counter-clockwise,
  // SVG y-down so a positive angle step visually goes UP first) -- one entry
  // per slot the chapter's data actually names, read directly off the rail
  // walk's own layout (ch6railwalk p6/p14): three prepositions cluster at the
  // top, four run the sides, two anchor the bottom corners.
  const ANGLE = {
    topLeft: 125, top: 90, topRight: 55,
    left: 178, right: 2,
    lowerLeft: 205, lowerRight: 335,
    bottomLeft: 240, bottomRight: 300
  };
  const LABEL_R = 108;   // how far out the Greek/gloss pair sits
  const ARROW_OUT_R = 62;  // the arrow's far end (label side)
  const ARROW_IN_R = ERX + 8;  // the arrow's near end (oval side)

  // Point on the shared ellipse at a given angle and radius scale (1 = the
  // ellipse boundary itself; label/arrow points scale the same x/y ratio out
  // from the centre, which is what keeps everything on one consistent ray).
  function pt(angleDeg, r) {
    const rad = (angleDeg * Math.PI) / 180;
    return { x: CX + r * Math.cos(rad), y: CY - r * (ERY / ERX) * Math.sin(rad) };
  }
  function anchorFor(angleDeg) {
    const c = Math.cos((angleDeg * Math.PI) / 180);
    return c > 0.3 ? 'start' : c < -0.3 ? 'end' : 'middle';
  }

  const SLOTS = {};
  for (const [slot, angle] of Object.entries(ANGLE)) {
    const label = pt(angle, LABEL_R);
    SLOTS[slot] = { x: label.x, y: label.y, anchor: anchorFor(angle), angle };
  }

  function arrowPath(angle, reverse) {
    const a = pt(angle, ARROW_IN_R);
    const b = pt(angle, ARROW_OUT_R);
    return reverse ? `M ${b.x} ${b.y} L ${a.x} ${a.y}` : `M ${a.x} ${a.y} L ${b.x} ${b.y}`;
  }
  // περί's sweep: a single curve from its own position bending in to meet the
  // oval near the top, encircling toward ἐπί's side (ch6railwalk: the one
  // arrow that visibly curves rather than running straight).
  function curveIn(angle) {
    const start = pt(angle, ARROW_OUT_R - 6);
    const end = pt(90, ARROW_IN_R + 6);
    const mid = pt((angle + 90) / 2, ARROW_OUT_R + 10);
    return `M ${start.x} ${start.y} Q ${mid.x} ${mid.y} ${end.x} ${end.y}`;
  }
  // ἐπί's arc: over the top of the oval, from just past περί's side to just
  // before μετά's, peaking well above the oval the way the original draws it.
  function overArc() {
    const start = pt(125, ARROW_OUT_R - 14);
    const end = pt(55, ARROW_OUT_R - 14);
    const peak = pt(90, ARROW_OUT_R + 34);
    return `M ${start.x} ${start.y} Q ${peak.x} ${peak.y} ${end.x} ${end.y}`;
  }
  // διά's line: straight THROUGH the oval, corner to corner (bottomLeft to
  // the topRight side), the one arrow that crosses the centre.
  function acrossLine() {
    const start = pt(240, ARROW_OUT_R + 6);
    const end = pt(20, ARROW_OUT_R + 30);
    return `M ${start.x} ${start.y} L ${end.x} ${end.y}`;
  }
  // κατά's line: straight up into the oval from the bottom-right corner.
  function downLine() {
    const start = pt(300, ARROW_OUT_R + 6);
    const end = pt(120, ARROW_IN_R + 4);
    return `M ${start.x} ${start.y} L ${end.x} ${end.y}`;
  }

  const ARROWS = {
    topLeft: { curveIn: curveIn(ANGLE.topLeft), in: arrowPath(ANGLE.topLeft, false), out: arrowPath(ANGLE.topLeft, true) },
    top: { over: overArc(), in: arrowPath(ANGLE.top, false), out: arrowPath(ANGLE.top, true) },
    topRight: { in: arrowPath(ANGLE.topRight, false), out: arrowPath(ANGLE.topRight, true) },
    left: { in: arrowPath(ANGLE.left, false), out: arrowPath(ANGLE.left, true) },
    right: { in: arrowPath(ANGLE.right, false), out: arrowPath(ANGLE.right, true) },
    lowerLeft: { in: arrowPath(ANGLE.lowerLeft, false), out: arrowPath(ANGLE.lowerLeft, true) },
    lowerRight: { in: arrowPath(ANGLE.lowerRight, false), out: arrowPath(ANGLE.lowerRight, true) },
    bottomLeft: { across: acrossLine(), in: arrowPath(ANGLE.bottomLeft, false), out: arrowPath(ANGLE.bottomLeft, true) },
    bottomRight: { down: downLine(), in: arrowPath(ANGLE.bottomRight, false), out: arrowPath(ANGLE.bottomRight, true) }
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
    viewBox="6 0 {SIZE - 6} {SIZE - 4}"
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

    <ellipse class="prep-circle" cx={CX} cy={CY} rx={ERX} ry={ERY} />

    {#if centre}
      <!-- Greek-tap rule: the centre word pronounces itself like every other. -->
      <g class="prep-node prep-centre" role="button" tabindex="0"
         on:click={() => centre.audio && play(centre.audio)}
         on:keydown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); centre.audio && play(centre.audio); } }}>
        <text class="prep-greek greek" x={CX} y={CY - 2} text-anchor="middle">{centre.greek}</text>
        <text class="prep-gloss" x={CX} y={CY + 15} text-anchor="middle">{centre.gloss}</text>
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
