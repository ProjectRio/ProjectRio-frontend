The workhorse for every batting / pitching / ladder table in Rio.

```jsx
<StatTable
  columns={[
    { key: 'name', label: 'Batters' },
    { key: 'ab', label: 'AB' },
    { key: 'h', label: 'H' },
    { key: 'avg', label: 'AVG', render: (r) => r.avg.toFixed(3) },
  ]}
  rows={roster}
  rowKey="name"
  highlightKey="Mario"
/>
```

Uppercase Rajdhani headers on the raised surface, hairline row borders, red row-hover wash. First column is the left-aligned label; numeric columns auto-align right with tabular-nums. `highlightKey` flags a featured row (gold label).
