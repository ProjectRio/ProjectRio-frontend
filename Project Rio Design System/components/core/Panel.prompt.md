The container for nearly everything in Rio — wrap any grouped content in a Panel.

```jsx
<Panel glow>
  <PanelHeader title="Recent Games" action={<a className="kicker">All →</a>} />
  <div style={{ padding: '1rem' }}>…</div>
</Panel>
```

`glow` adds the signature red hover (border lights to rio, soft bloom). `PanelHeader` is the uppercase bar; pass `action` for a trailing link/badge. Panels clip their children (overflow hidden) so edge-to-edge tables and headers sit flush.
