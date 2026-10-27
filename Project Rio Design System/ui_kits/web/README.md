# Project Rio — Web UI Kit

An interactive recreation of the [Project Rio](https://github.com/matt-gree/ProjectRio-frontend) website (the competitive Mario Superstar Baseball stats site). Built entirely from this design system's compiled component bundle.

## Run it
Open `index.html`. It loads React + the design-system bundle (`_ds_bundle.js`) and mounts `app.jsx`.

## Screens (click the nav to move between them)
- **Home** — hero with the Rio mushroom, a 3-column grid of `GameScoreCard` recaps, and feature panels.
- **Ranked** — `PageHeader` + mode `Select` + `LadderTable` (Shell→Legend tiers), with a season-stats side panel.
- **Characters** — filterable roster grid of character sprites with class `Badge`s.
- **Box Score** — final-score header + two `StatTable` panels (batting + pitching).

## Components used
`Button`, `Badge`, `TierBadge`, `Select`, `Avatar`, `LiveLabel`, `Panel`, `PanelHeader`, `PageHeader`, `LadderTable`, `StatTable`, `GameScoreCard` — all from `window.ProjectRioDesignSystem_6fbb66`.

## Notes
All data is mock data hardcoded in `app.jsx`. The real site fetches from the Rio Web API (`api.projectrio.app`). Live games, auth, and the pitch visualizer from the real app are out of scope here.
