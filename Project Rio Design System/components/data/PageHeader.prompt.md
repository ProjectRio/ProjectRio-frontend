Top-of-page title block: kicker + big uppercase title + optional right-aligned actions.

```jsx
<PageHeader kicker="Ranked play" title="Game Modes">
  <Button variant="secondary" size="sm">Filters</Button>
</PageHeader>
```

Matches the live site's `PageHeader`. Title renders at `--text-4xl` uppercase; the kicker is the rio-400 eyebrow. Pass children for trailing controls (checkboxes, selects, buttons).
