The recap card shown in game feeds — two stacked team rows with the loser dimmed.

```jsx
<GameScoreCard
  status="Final"
  timeAgo="12m ago"
  mode="Big Balls Brawl"
  stadium="Mario Stadium"
  away={{ user: 'DingerCity', score: 7, sprite: 'assets/characters/Mario.png', elo: { before: 1180, after: 1198 } }}
  home={{ user: 'JoeBaseball', score: 4, sprite: 'assets/characters/Bowser.png', elo: { before: 1210, after: 1192 } }}
  onBoxScore={() => {}}
/>
```

Winner stays fog-100, loser drops to fog-500. ELO delta turns emerald on a win, rio on a loss. Wrap a grid of these for a "Latest Games" section. Sizes ~360–400px wide.
