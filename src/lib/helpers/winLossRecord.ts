export function winLossRecord (gameList: any[], username: string) {
    let wins: number = 0;
    let losses: number = 0;

    gameList.forEach((game: { away_user: string; home_user: string; away_score: number; home_score: number}) => {
        if (game.away_user === username) {
            (game.away_score > game.home_score) ? wins += 1 : losses += 1;
        } else if (game.home_user === username) {
            (game.home_score > game.away_score) ? wins += 1 : losses += 1;
        }
    });
    
    return [wins, losses] 
}