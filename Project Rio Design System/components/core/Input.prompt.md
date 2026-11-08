Form text input / select with the uppercase Rajdhani label and red focus ring.

```jsx
<Input label="Username" placeholder="Enter your tag" />
<Input label="Password" type="password" />
<Select label="Mode" defaultValue="Standard">
  <option>Standard</option>
  <option>Big Balls Brawl</option>
</Select>
```

Both fill their container width. Focus lights the border rio-400 with a 3px red halo. The `label` prop is optional — omit for unlabeled fields.
