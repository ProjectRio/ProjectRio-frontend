# Game mods (Gecko code generator)

The `/tools/mods` pages let players edit the game's internal tables and produce Gecko codes. This
directory holds everything behind them.

| File | Role |
| --- | --- |
| `catalog.ts` | **Hand-written.** Which tables to expose, grouped, with descriptions, axis labels, min/max/step and default values. This is the only file to touch when adding a table. |
| `defaults/*.ts` | Default (unmodified game) values, seeded from the original gecko-code-generator. Replace from a RAM dump when one exists. |
| `generated/symbols.json` | **Generated, committed.** Addresses, element types, array dimensions, struct field offsets and enum members for every catalog entry, resolved from the MSSB decomp. Never hand-edit. |
| `resolve.ts` | Merges catalog + generated into flat per-cell data (`ResolvedTable`) for the editor. Throws at build time if the two disagree. |
| `gecko.ts` | Value/address encoding for Gecko write codes and the `.ini` block format. |
| `types.ts` | Types for all of the above. |

The editor itself is `components/mods/ModTableEditor.tsx`; the routes are `app/tools/mods/`.

## Where the data comes from

[ProjectRio-Modding](https://github.com/ProjectRio/ProjectRio-Modding) pins the
[MSSB decomp](https://github.com/LittleCoaks/mssb-dtk) as its `Decomp` submodule. `npm run sync-mods`
reads the pinned ProjectRio-Modding commit (`MODDING_SOURCE.ref` in `catalog.ts`), finds the decomp
commit it points at, downloads that decomp, and for each catalog entry resolves:

- the **address** from `config/GYQE01/**/symbols.txt` (REL sections are rebased to RAM exactly as the
  decomp's `tools/cvt_rel_addr_to_mapped_addr.py` does, and the derived bases are asserted against the
  measured ones);
- the **type and layout** from the `extern` declaration and struct definitions under `include/`, using
  the decomp's `/* 0xNN */` offset comments.

The output is committed so builds are deterministic and a PR that re-syncs shows exactly which
addresses changed. To pick up new decomp labels, bump `MODDING_SOURCE.ref`, run the sync, run
`npm run check-mods`, and commit the result.

```bash
npm run sync-mods                              # pinned commit (network)
npm run sync-mods -- --ref LittleCoaks-Mods    # a different ProjectRio-Modding ref
npm run sync-mods -- --decomp ../mssb-dtk      # a local decomp checkout, no network
npm run check-mods                             # assert resolved addresses against known-good formulas
```

## Adding a table

1. Find the symbol in the decomp: grep `config/GYQE01/**/symbols.txt` for a name, or look up an
   address (game REL `.data` symbols are relative to `0x807B1600`, `.rodata` to `0x807AD440`).
2. Add an entry to `catalog.ts`:
   - `source: { symbol }` when the decomp headers declare it (`extern T name[N];`). The sync uses
     that declaration for the element type and dimensions.
   - `source: { symbol, declare: { type, dims } }` when `symbols.txt` names it but no header declares
     it. `type` is a primitive (`u8`, `s16`, `f32`, …) or a struct/typedef name from the headers.
     `declare.stride` forces the byte size of one element when the decomp struct's computed size
     disagrees with the game (only `CharacterStats` needs it today).
   - `source: { symbol, path }` to step into it: `.field`, `[n]`, `[]` (make this dimension an axis)
     or `{*}` (make a struct's fields an axis).
   - `source: { address, type, dims? }` only for addresses the decomp has not labelled yet. The sync
     report lists these with the placeholder symbol that contains them, which is the list of things
     to label upstream.
3. Give it `axes` (one per array dimension, outermost first; a `null` label hides that index),
   `columns` (struct fields to show, keyed by header field name) or `columnMeta` (primitive tables),
   and `defaults` nested to match the displayed axes.
4. `npm run sync-mods`, then `npm run check-mods`. The sync fails loudly when a symbol is missing,
   a path does not match the header layout, or the declared layout is larger than the extent
   `symbols.txt` records.

A `constants` entry works the same way but lists unrelated scalars, each with its own `source`.

## Conventions

- Shorts are shown signed; the encoder writes two's complement, so `-110` becomes `FF92`.
- Enum-typed fields (`E(u8, ENUM)` in the decomp, or `enum:` in the catalog) render as a select, or as
  a checklist when the enum's values are all powers of two.
- Cell state lives only in the browser; nothing is persisted.
