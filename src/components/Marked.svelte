<script>
  // Renders one authored string, honoring inline [[u]]...[[/u]] underline
  // spans (see lib/markup.js). Segments are plain text nodes -- never {@html}.
  import { splitUnderline } from '../lib/markup.js';
  export let text = '';
</script>

{#each splitUnderline(text) as seg}{#if seg.u}<u>{seg.t}</u>{:else}{seg.t}{/if}{/each}
