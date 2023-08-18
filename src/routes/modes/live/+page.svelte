<script lang="ts">
    export let data;
    import { stadiums } from '$lib/helpers/stadiumName';
    import { getAllTagSets } from '$lib/helpers/tagNames';
    import { tagsets } from '$lib/stores/tagsets';
    import { onMount } from 'svelte';
    import {characters} from '$lib/helpers/characterName';
    import { invalidate } from '$app/navigation';
    import { sortableTableAction } from 'svelte-legos';
    import { BACKEND, STAT_ENDPOINTS } from '$lib/constants'

    let gamesToDisplay = false;
    // Access the tagsets data in your component
    let tagsetsData: any[] = []
    $: {
    tagsetsData = $tagsets; // Get the current value of the tagsets store
    // console.log($tagsets)
    }

    onMount(() => {
        getAllTagSets();
        rerunLoadFunction();
    })

    function rerunLoadFunction() {
      setInterval(() => {
        console.log(new Date());
        invalidate(BACKEND + STAT_ENDPOINTS.LIVE_GAMES);
      }, 30000);
    }
    

    function withinLastHour(timestamp: number) {
        const currentTime = Date.now() / 1000; // Convert milliseconds to seconds
        const oneHourAgo: number = currentTime - (60 * 60); // Subtract one hour in seconds
        if (timestamp >= oneHourAgo) {
          gamesToDisplay = true;
          return true;
        }
        return false;
    }

    
  </script>

<div class="head">
  <!-- <h4 style="display:flex;justify-content:center;align-items:center;font-size:x-small;margin-top:0px;margin-bottom:10px;">Click Game Mode/Player for more detailed stats.</h4> -->
  <!-- <h1 style="display:flex;justify-content:center;align-items:center;">  <img src={slice} alt=""></h1> -->
</div>
{#if data.live}
  {#if gamesToDisplay}
<div class="flex justify-center items-center mx-auto transition-[width] duration-200 w-full ">
  <div class="table-container text-token">
    <h2 class="h2">Live Games</h2>
    <table class="table table-hover" use:sortableTableAction>
      <thead>
        <tr>
          <th>Away Player</th>
          <th>Away Score</th>
          <th>Home Score</th>
          <th>Home Player</th>
          <th>Stadium</th>
          <th>Inning</th>
          <th>Game Mode</th>
        </tr>
      </thead>
      <tbody>
      {#each data.live as live}
      <!-- filter by being a game mode with slice in name -->
          {#if withinLastHour(live.start_time)}
            <tr>
              <td class="player-link">
                <a class="player" href={`/modes/player/${live.away_player}`}>{live.away_player}</a>
              </td>
              <td>{live.away_score}</td>
              <td>{live.home_score}</td>
              <td class="player-link">
                <a class="player" href={`/modes/player/${live.home_player}`}>{live.home_player}</a>
              </td>
              <!-- convert stadium id num to string -->
              <td>{stadiums[live.stadium_id]}</td>

              {#if live.half_inning === 0}
                <td>&#11014;{live.inning}</td>
              {:else if live.half_inning === 1}
                <td>⬇{live.inning}</td>
              {/if}

              <!-- convert tag id num to string -->
              <td class="game-mode"><a href={`/modes/${tagsetsData.find(tagset => tagset.id === live.tag_set)?.name}`}/ladder>{tagsetsData.find(tagset => tagset.id === live.tag_set)?.name || ''}</a></td>

            </tr>
            <tr>
              <td class="mobile-hide" style="font-weight: bolder">
                {'★ '.repeat(live.away_stars) + '☆ '.repeat(5 - live.away_stars)}
              </td>

              {#if live.half_inning === 0}
                {#if characters[live[`away_roster_${live.batter}_char`]] === "DK"}
                  <td>🥊{characters[live[`away_roster_${live.batter}_char`]]}</td>
                {:else if characters[live[`away_roster_${live.batter}_char`]] === "Petey"}
                  <td>🍃{characters[live[`away_roster_${live.batter}_char`]]}</td>
                {:else}
                  <td>🏏{characters[live[`away_roster_${live.batter}_char`]]}</td>
                {/if}
                <td>⚾{characters[live[`home_roster_${live.pitcher}_char`]]}</td>
              {:else if live.half_inning === 1}
                <td>⚾{characters[live[`away_roster_${live.pitcher}_char`]]}</td>
                {#if characters[live[`home_roster_${live.batter}_char`]] === "DK"}
                  <td>🥊{characters[live[`home_roster_${live.batter}_char`]]}</td>
                {:else if characters[live[`home_roster_${live.batter}_char`]] === "Petey"}
                  <td>🍃{characters[live[`home_roster_${live.batter}_char`]]}</td>
                {:else}
                  <td>🏏{characters[live[`home_roster_${live.batter}_char`]]}</td>
                {/if}
              {/if}

              <td class="mobile-hide" style="font-weight: bolder">
                {'★ '.repeat(live.half_inning === 0 ? live.away_stars : live.home_stars) + '☆ '.repeat(5 - (live.half_inning === 0 ? live.away_stars : live.home_stars))}
              </td>
              <td>
              {#if Number(live.runner_on_second) === 1}
                <div style="display:flex; justify-content:center; align-items:top;">❷</div>
              {:else}
                <div style="display:flex; justify-content:center; align-items:top;">➁</div>
              {/if}
              {#if Number(live.runner_on_first) === 1 && Number(live.runner_on_third) === 1}
                <span style="display:flex; justify-content:space-around;"><div>❸</div><div>❶</div></span>
              {:else if Number(live.runner_on_first) === 0 && Number(live.runner_on_third) === 1}
                <span style="display:flex; justify-content:space-around;"><div>❸</div><div>➀</div></span>
              {:else if Number(live.runner_on_first) === 1 && Number(live.runner_on_third) === 0}
                <span style="display:flex; justify-content:space-around;"><div>➂</div><div>❶</div></span>
              {:else if Number(live.runner_on_first) === 0 && Number(live.runner_on_third) === 0}
                <span style="display:flex; justify-content:space-around;"><div>➂</div><div>➀</div></span>
              {/if}
              </td>
              {#if live.outs === 0}
                <td>
                  <div>Outs</div>○○○
                </td>
              <!-- {/if} -->
              {:else if live.outs === 1}
                <td>
                  <div>Outs</div>●○○
                </td>
              <!-- {/if} -->
              {:else if live.outs === 2}
                <td>
                  <div>Outs</div>●●○
                </td>
              <!-- {/if} -->
              {:else if live.outs === 3}
                <td>
                  <div>Outs</div>●●●
                </td>
              {/if}
              <!-- convert to date format -->
              <td>{new Date(live.start_time * 1000).toLocaleString()}</td>
              <!-- {/if} -->
            </tr>
            <br>
          {/if}
        <!-- {/if} -->
      {/each}
      </tbody>
    </table>
    </div>
  </div>
{:else}
  <h1 class="h1">No games are being played right now. The page will refresh automatically and update when there are active games.</h1>
    {/if}
  {/if}