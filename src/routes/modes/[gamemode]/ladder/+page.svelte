<script lang="ts">
  // Import store
  import { page } from '$app/stores';
  import LadderTable from '$lib/components/LadderTable.svelte';
  import { BACKEND, UNCATEGORIZED_ENDPOINTS } from '$lib/constants';
  import { titleCase } from '$lib/utils';  
</script>

  <!-- <a href="/modes"><button class="game-mode">Return to Games List</button></a> -->
  <div class="flex-auto m-4">
    <a href={`/modes/` + $page.params.gamemode + `/peak`}>View player peaks for this Game Mode.</a>
  </div>
  <h1><a href="/modes/{$page.params.gamemode}">{titleCase($page.params.gamemode)}</a> Ladder</h1><br>
  <LadderTable ladderGameMode = {$page.params.gamemode} nUsersToDisplay={0} /> <br>

  <style>
    td a, a {
      color: rgba(var(--text-neutral-500) / 1) !important; 
    }
  </style>
