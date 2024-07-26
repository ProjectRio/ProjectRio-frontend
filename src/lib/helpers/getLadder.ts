
import { BACKEND, UNCATEGORIZED_ENDPOINTS } from '$lib/constants';
import { ladderUsers } from '$lib/stores/ladder';

// Instantiate variables
let players: any = [];

export async function getTagSetLadder(gameMode: string) {
    try {
      const response = await fetch(BACKEND + UNCATEGORIZED_ENDPOINTS.GET_TAG_SET, {
        method: "POST",
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          "TagSet": gameMode
        })
      });
      const result = await response.json();
      // console.log(result);
      // players = Object.values(result).sort((a: any, b: any) => b.rating - a.rating);
      players = Object.values(result);
      const ALPHA = 0.1
      const BETA = 0.85
      players.forEach(p => {
        p.player_games = p.num_wins + p.num_losses + 1;
        p.adjusted_rating = Math.round((BETA + ((1 - BETA) * (1 - (Math.exp(1 - (ALPHA * p.num_wins)))))) * (p.rating - (500 * Math.sqrt(Math.log10(p.player_games + 1) / p.player_games))));
      })
      // for (let p in players) {
      //   let player_games = p.num_wins + p.num_losses + 1
      //   p.adjusted_rating = (BETA + ((1 - BETA) * (1 - (Math.exp(1 - (ALPHA * p.num_wins)))))) * (p.rating - (500 * Math.sqrt(Math.log10(player_games + 1) / player_games)))
      // }

      players = players.sort((a: any, b: any) => b.adjusted_rating - a.adjusted_rating);

      ladderUsers.set(players)
    } catch (error) {
      console.log(error);
    }
  }