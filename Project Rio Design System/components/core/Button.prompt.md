Angled, uppercase action button — use for any primary or secondary CTA (Get Rio, View Ladders, form submits).

```jsx
<Button>Get Project Rio</Button>
<Button variant="secondary">View Ladders</Button>
<Button icon="assets/icons/baseball-bat.png" size="lg">Play Online</Button>
<Button as="a" href="/login" variant="secondary" size="sm">Log In</Button>
```

Variants: `primary` (solid Rio red, hover lightens to rio-400, active darkens to rio-600) and `secondary` (transparent, night-600 border, hover → rio border + rio-300 text). Sizes `sm | md | lg`. The signature shape is the `--clip-button` angled polygon — never round these.
