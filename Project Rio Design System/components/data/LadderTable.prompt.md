Drop-in ranked leaderboard — sorts are the caller's job; pass rows in rank order.

```jsx
<LadderTable
  highlightUser="DingerCity"
  rows={[
    { username: 'DingerCity', rating: 2014, wins: 142, losses: 38 },
    { username: 'JoeBaseball', rating: 1876, wins: 110, losses: 51 },
  ]}
/>
```

Built on the stat-table vocabulary with a `TierBadge` per row. Rank is derived from array order; win % is computed. `highlightUser` raises and golds one row.
