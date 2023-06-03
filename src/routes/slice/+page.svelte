<script lang="ts">
    export let data;
    import { stadiums } from '../../components/stadiumName';
    import { getAllTagSets } from '../../components/tagNames';
    import { tagsets } from '$lib/tagsets';
    import { onMount } from 'svelte';
    import {characters} from '../../components/characterName';
    import { Body } from 'svelte-body';
    import slice from '../../lib/images/slice.png'
    // Access the tagsets data in your component
    let tagsetsData: any[] = []
    $: {
    tagsetsData = $tagsets; // Get the current value of the tagsets store
    // console.log($tagsets)
    }

    onMount(() => {
        getAllTagSets();
    })

    function withinLastHour(timestamp: Number) {
        const currentTime = Date.now() / 1000; // Convert milliseconds to seconds
        const oneHourAgo: Number = currentTime - (60 * 60); // Subtract one hour in seconds

        return timestamp >= oneHourAgo;
    }

    
  </script>

  <Body style="background-color:#333;color:#f5f5f5;display:flex;justify-content:center;align-items:center;margin:0;" />
  <div class="head">
    <h4 style="display:flex;justify-content:center;align-items:center;font-size:x-small;margin-top:0px;margin-bottom:10px;">Click Game Mode/Player for more detailed stats.</h4>
  <h1 style="display:flex;justify-content:center;align-items:center;">  <img src={slice} alt=""></h1>
</div>
  {#if data.live}
  <h2 style="display:flex;justify-content:center;align-items:center;">Live Games</h2>
  <table>
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
          {#if String(tagsetsData.find(tagset => tagset.id === live.tag_set)?.name).includes("SLICE")}
            {#if withinLastHour(live.start_time)}
     
                <tr>
                  <td class="player-link"><a class="player" href={`/slice/player/${live.away_player}`}>{live.away_player}</a></td>
                    <td>{live.away_score}</td>
                    <td>{live.home_score}</td>
                    <td class="player-link"><a class="player" href={`/slice/player/${live.home_player}`}>{live.home_player}</a></td>
                    <td>{stadiums[live.stadium_id]}</td>
                    {#if live.half_inning === 0}
                        <td>&#11014;{live.inning}</td>
                    {/if}
                    {#if live.half_inning === 1}
                        <td>⬇{live.inning}</td>
                    {/if}
                    <!-- convert stadium id num to string -->

                    <!-- convert tag id num to string -->
                    <!-- convert to date format -->
                    <td>{tagsetsData.find(tagset => tagset.id === live.tag_set)?.name || ''}</td>

                </tr>
                <tr>
                    <td class="mobile-hide" style="font-weight: bolder">
                        {'★ '.repeat(live.away_stars) + '☆ '.repeat(5 - live.away_stars)}
                    </td>
                    
                    {#if live.half_inning === 0 || live.half_inning === 1}
                      {#if characters[live[`away_roster_${live.batter}_char`]] === "DK" || characters[live[`home_roster_${live.batter}_char`]] === "DK"}
                        {#if live.half_inning === 0}<td>🥊{characters[live[`away_roster_${live.batter}_char`]]}</td>{/if}
                        {#if live.half_inning === 1}<td>🥊{characters[live[`home_roster_${live.batter}_char`]]}</td>{/if}
                    {:else if characters[live[`away_roster_${live.batter}_char`]] === "Petey" || characters[live[`home_roster_${live.batter}_char`]] === "Petey"}
                      {#if live.half_inning === 0}<td>🍃{characters[live[`away_roster_${live.batter}_char`]]}</td>{/if}
                      {#if live.half_inning === 1}<td>🍃{characters[live[`home_roster_${live.batter}_char`]]}</td>{/if}
                    {:else}
                      {#if live.half_inning === 0}<td>🏏{characters[live[`away_roster_${live.batter}_char`]]}</td>{/if}
                      {#if live.half_inning === 1}<td>🏏{characters[live[`home_roster_${live.batter}_char`]]}</td>{/if}
                    {/if}
                    {#if live.half_inning === 0}
                      <td>⚾{characters[live[`home_roster_${live.pitcher}_char`]]}</td>
                    {:else if live.half_inning === 1}
                      <td>⚾{characters[live[`home_roster_${live.pitcher}_char`]]}</td>
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
                    {#if live.outs === 0}<td><div>Outs</div>○○○</td>{/if}
                    {#if live.outs === 1}<td><div>Outs</div>●○○</td>{/if}
                    {#if live.outs === 2}<td><div>Outs</div>●●○</td>{/if}
                    {#if live.outs === 3}<td><div>Outs</div>●●●</td>{/if}
                   
                    <td>{new Date(live.start_time * 1000).toLocaleString()}</td>
                  {/if}
                </tr>
                <br>
            {/if}
            {/if}
        {/each}
    </tbody>
  </table>
  {/if}

 <!-- recent games table (diff page..?) -->
  {#if data.games}
  <h2 style="display:flex;justify-content:center;align-items:center;">Recent Games</h2>
  <table>
    <thead>
        <tr>
            <th>Away Player</th>
            <th>Away Score</th>
            <th>Home Score</th>
            <th>Home Player</th>
            <th>Stadium</th>
            <th>Game Mode</th>
            <th>Time</th>
        </tr>
    </thead>
    <tbody>
        {#each data.games as games}
                <tr>
                  <td class="player-link"><a class="player" href={`/slice/player/${games.away_user}`}>{games.away_user}</a></td>
                  <td>{games.away_score}</td>
                    <td>{games.home_score}</td>
                    <td class="player-link"><a class="player" href={`/slice/player/${games.home_user}`}>{games.home_user}</a></td>
                    <td>{stadiums[games.stadium]}</td>
                    <a href={`/slice/${tagsetsData.find(tagset => tagset.id === games.game_mode)?.name}`}/ladder><td>{tagsetsData.find(tagset => tagset.id === games.game_mode)?.name || ''}</td></a>

                    <td>{new Date(games.date_time_start * 1000).toLocaleString()}</td>
                </tr>
        {/each}
    </tbody>
  </table>
  {/if}
<style>
    /* @import "./slice.css"; */
    * {
        font-size: 0.85rem  ;
    }
    
img {
    max-width: fit-content;
    max-height: fit-content;
    height: 12.5%;
    width: 12.5%;
    left: 50%;
    right: 50%;
}


  /* need to break up this page */
  table { 
    width: 100%;
    height: auto; 
    min-width: 400px;
    border-collapse: collapse; 
  }

  /* Zebra striping */
  /* tr:nth-of-type(odd) { 
    background: #eee; 
  } */
  /* th { 
    background: #ccc; 
    color: black; 
    font-weight: bold; 
  } */
  td, th { 
    padding: 6px; 
    border: 1px solid #ccc; 
    text-align: center; 
    color: #f5f5f5
  }

  /* .hover-row:hover {
    background-color:lightblue;
  } */
  thead{
    background:#222;
}

thead tr {
  background: #222;
}
tbody td {
    border: 2px solid #f5f5f5;
    padding: 4px 20px;
}
tbody tr{
    transition:all, 0.2s;
}
tbody tr:hover{
    background:#00A4E8ff;
}

tbody tr a:hover td:hover{
  background: #F367D0ff;
}

a {
  text-decoration: none;
}

.player {
  text-decoration: none;
  color: inherit;
  justify-content: center;
}

.player-link:hover {
  background-color: #F367D0ff;
}


  </style>
  