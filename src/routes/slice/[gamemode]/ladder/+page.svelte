<script lang="ts">
    // Import store
    import { page } from '$app/stores';
    import { Body } from 'svelte-body';
    // Import components
  
    // Import apiFetch function
    import { apiFetch } from "../../../../fetch/apiFetch";
    
    // Instantiate variables
    let players: any = [];
  
    // Call on page load
    getTagSetLadder();
    async function getTagSetLadder() {
      try {
        const response = await fetch("https://api.projectrio.app/tag_set/ladder/", {
          method: "POST",
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            "TagSet": $page.params.gamemode
          })
        });
        const result = await response.json();
        console.log(result);
        players = Object.values(result).sort((a: any, b: any) => b.rating - a.rating);
      } catch (error) {
        console.log(error);
      }
    }
  
  </script>
  <Body style="background-color:#333;color:#f5f5f5;display:flex;justify-content:center;align-items:center;margin:0;" />
  <div class="head">
  <a href="/slice"><button class="game-mode">Return to Games List</button></a>

  
  <h1>{$page.params.gamemode}</h1>
</div>
  <section>
    <table>
      <thead>
      <tr>
        <th>#</th>
        <th>Glicko Rating</th>
        <th>Username</th>
        <th>W/L/T</th>
      </tr>
      </thead>
      <tbody>
      {#if players}
        {#each players as player, i}
          <tr>
            <td>{i + 1}</td>
            <td>{player.rating}</td>
            <td class="player-link"><a class="player" href={`/slice/player/${player.username}`}>{player.username}</a></td>
            <td>{player.num_wins}/{player.num_losses}/{player.num_ties}</td>
          </tr>
        {/each}
      {/if}
      <tr></tr>
    </tbody>
    </table>
  </section>
  
  
  <style>
    h1 {
      justify-content: center;
      align-self: center;
    }
    /* @import "./slice.css"; */
    * {
        font-size: 0.85rem  ;
    }
    

  /* need to break up this page */
  table { 
    height: auto;
    width: 100%; 
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
thead th, tbody td {
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

.game-mode {
  text-decoration: none;
  color: inherit;
  width: fit-content;
  align-self:auto;
  /* align-self: center; */
  /* position: fixed; */
  /* left: 10%;
  top: 20%; */
}

.game-mode {
  background: #333;
  border-color: #00A4E8ff;
  border-style:double 4px;
  border-radius: 4px;
  color: #f5f5f5;
  font-weight: bolder;
  box-shadow: #F367D0ff 0   2px;
}
button:hover {
  color: #F367D0ff;

}

.player {
  text-decoration: none;
  color: inherit;
  justify-content: center;
}

.player-link:hover {
  background-color: #F367D0ff;
}

th {
  background-color: #222;
}

table {
  box-shadow: rgba(0, 164, 232, 0.4) 5px 5px, rgba(0, 164, 232, 0.3) 10px 10px, rgba(0, 164, 232, 0.2) 15px 15px, rgba(0, 164, 232, 0.1) 20px 20px, rgba(0, 164, 232, 0.05) 25px 25px;
}

.head {
  display: flex;
  justify-content: space-around;
}

td {
  position: relative;
}

.data-label {
  display: none;
}

/* Media query for mobile */
@media screen and (max-width: 600px) {
  .data-label {
    display: inline-block;
    position: absolute;
    top: 0;
    right: 0;
    background-color: #00A4E8ff;
    color: #fff;
    padding: 2px 6px;
  }
}
  </style>
  