<script>
  // THE SAY-ALL / TOGGLE ROW of a paradigm chart: Say Whole Paradigm (or the
  // Endings state's own say button), any per-column-group say actions, the
  // Endings control, and the two-chart §4.1 toggle.
  //
  // Its own component since DISCLOSURE-SPEC2 W3 because the amended §4.3 gives
  // it TWO placements and the placement depends on what else the modal pins:
  //
  //   pinned      a TWO-screen modal puts the say-all and the single toggle on
  //               the one pinned line above Close (review pane f).
  //   in flow     everywhere else — main content (where pinning is revoked
  //               outright), a THREE-plus modal (whose pinned line is the
  //               Back/More pair, and whose say button explicitly stays with
  //               its chart), and a modal with no navigation at all (which
  //               pins nothing: "never pin a say button alone").
  //
  // Two copies of this markup in one file, differing only by which parent they
  // sit in, is exactly how the two would come to disagree about a control the
  // learner is meant to read the same way in both places.
  import { play } from '../lib/audio.js';
  import { createEventDispatcher } from 'svelte';

  export let chart = {};
  // The derived display state Paradigm.svelte already computes. Passed as one
  // object rather than a dozen props: these are not independent settings, they
  // are one chart's resolved presentation, and splitting them up would invite a
  // caller to pass half of it.
  export let state = {};

  const dispatch = createEventDispatcher();
  $: sayWholeEach = state.sayWholeEach || [];
</script>

<div class="pg-actions" class:pg-actions-each={sayWholeEach.length > 0}
     style={`--pg-action-count:${sayWholeEach.length || 1}`}>
  {#if state.showingEndings}
    <!-- §4.4: the replaced state's own say button, in the SAME slot and class
         as Say Whole Paradigm. This is where D-10's clip now lives; nothing
         plays on the state change itself. -->
    <button class="btn secondary pg-say-whole pg-say-endings"
            data-audio-id={chart.endings?.audio || ''}
            disabled={!chart.endings?.audio}
            on:click={() => chart.endings?.audio && play(chart.endings.audio)}>{state.endingsSayLabel}</button>
  {:else if chart.sayWhole}
    <button class="btn secondary pg-say-whole"
            on:click={() => play(chart.sayWhole.audio)}>{chart.sayWhole.label || 'Say Whole Paradigm'}</button>
  {/if}
  {#each sayWholeEach as action, actionIndex}
    <button
      class="btn secondary pg-say-whole pg-say-whole-each"
      data-action-index={actionIndex}
      on:click={() => action.audio && play(action.audio)}>
      {action.label || 'Say Whole Paradigm'}
    </button>
  {/each}
  {#if chart.endings}
    {#if state.endingsInline}
      <!-- R4: in a modal host the Endings control is an IN-PLACE two-state
           toggle, not a button that opens a second modal on top of the first
           (§4.4, broken item 3). -->
      <button class="btn secondary pg-switch pg-endings-toggle"
              data-paradigm-switch="endings"
              data-target-state={state.endingsState ? 'paradigm' : 'endings'}
              on:click={() => dispatch('toggleEndings')}>{state.endingsToggleLabel}</button>
    {:else}
      <!-- From MAIN content the Endings button still opens its own
           single-level modal. One level is not stacking, and the chapter-3
           Learn page is device-verified that way. -->
      <button class="btn secondary pg-endings-open"
              on:click={() => dispatch('openEndings')}>{chart.endings.label || 'Endings'}</button>
    {/if}
  {/if}
  {#if state.twoChartToggle}
    <!-- R5/§4.1: ONE toggle on the say-all line, naming the chart it goes to.
         `named` reads Singular/Plural; `moreBack` alternates More/Back for a
         contrast with no one-word name. -->
    <button
      class="btn secondary pg-switch pg-switch-named"
      data-paradigm-switch="named"
      data-switch-kind={state.switchKind}
      data-target-index={state.namedTarget}
      on:click={() => dispatch('switchChart', state.namedTarget)}>
      {state.toggleLabel}
    </button>
  {/if}
</div>
