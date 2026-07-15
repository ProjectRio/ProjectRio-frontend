Ranked-tier chip for ladder rows and player headers — colored Shell green → Legend gold.

```jsx
<TierBadge tier="Star II" />
<TierBadge rating={1240} />   // -> "Flower III"
```

Six tiers (Shell, Mushroom, Flower, Star, Special, Legend) × five divisions (V–I). Each renders as a tinted chip in its tier color. Use `ratingToTier(rating)` to derive the label elsewhere (e.g. plain text).
