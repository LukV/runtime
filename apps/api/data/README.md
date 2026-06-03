# Race data import

Get races into the calendar from a flat, human-fillable CSV — no database
credentials in anyone's hands but the maintainer's.

- **Template / example:** [`races.sample.csv`](./races.sample.csv)
- **Importer:** `app/scripts/import_races.py`

## How to contribute races (no credentials needed)

1. Copy `races.sample.csv` (or a shared Google Sheet exported to CSV).
2. Fill one row per race. Leave optional columns blank.
3. Validate it yourself — `--dry-run` writes nothing:

   ```bash
   uv run python -m app.scripts.import_races your-file.csv --dry-run
   ```

   It prints one line per problem (`row 7: date: invalid date`) and a summary.
   Fix until it reads `0 skipped`, then open a PR with the CSV.

The maintainer reviews and runs the real import. Re-running is safe: rows
**upsert by `slug`**, so a fixed-and-reimported row updates in place.

## Columns

Required: `slug`, `race_type`, `title_nl`, `date`, `city`. Everything else is
optional — a blank cell is treated as "not set".

| Column | Notes |
|--------|-------|
| `slug` | URL-safe, unique. Don't reuse across races. The upsert key. |
| `race_type` | `weg`, `trail`, or `cross`. |
| `title_nl`, `description_nl` | Dutch text. Add `title_fr` / `description_fr` etc. to translate — extra locale columns are picked up automatically. |
| `date` | `YYYY-MM-DD`. |
| `end_date` | Only for multi-day events; blank for single-day. |
| `start_time` | `HH:MM` headline start; per-distance times go in `distances`. |
| `distances` | Mini-syntax, see below. |
| `price_eur` | Optional "vanaf" entry price, for sort/filter. A plain number. |
| `price_info` | Free text for the real price story — tiers, day-of surcharge, per-team. |
| `homepage` | The event's own page. Distinct from `registration_url`. |
| `registration_url`, `image_url` | Optional URLs. |
| `edition` | Whole number, e.g. `45` for "45e editie". |
| `tags` | Free-form facets, `;`-separated: `vlak;bos;kindvriendelijk;goede doel`. Covers profile/surface and any editorial theme. Lower-cased and de-duplicated on import. |
| `organizer_name` | Plain text; organizer linking comes later. |
| `location_label` | Venue name, e.g. `Sporthal 't Rosco`. |
| `country` | Defaults to `BE`. |
| `province` | One of the 11 Belgian provinces (Dutch slug): `antwerpen`, `oost-vlaanderen`, `west-vlaanderen`, `limburg`, `vlaams-brabant`, `brussel`, `waals-brabant`, `henegouwen`, `luik`, `luxemburg`, `namen`. |
| `city`, `postal_code`, `street`, `house_nr`, `lat`, `lng` | Location. `city` required, the rest optional. |
| `status` | `draft` (default), `live`, or `edition_past`. Only `live`/`edition_past` are public. |

## The `distances` mini-syntax

Segments separated by `;`. Each segment is `km[@when][#price]`, or a labelled
form for anything that isn't a single clean distance:

```
5;10                              two distances, 5 km and 10 km
10@10:00#12.50;5@09:30            10 km at 10:00 (€12.50), 5 km at 09:30
10#11;21#17;42#24                 per-distance entry prices
9 km estafette@18:30              a labelled leg (relay); "9" is lifted into km for filtering
4,6 km-lus ×1-3                   a labelled loop; comma or dot decimals both work
1 km continu                      free label; km is read as 1
Kids 800 m                        free label; no number to filter on, that's fine
17.5=Walk - 17,5 km@2026-06-27T08:30   explicit km + custom label + a per-day start
```

A pure number becomes a canonical `"N km"` label. Anything else is kept verbatim
as the label, with a leading number (if present) lifted into `km` so distance
filters still work. When the label doesn't start with the distance (e.g.
`Walk - 17,5 km`), use the `km=Label` form to set `km` explicitly.

`@when` is a bare time (`08:30`) for a single-day race, or an ISO datetime
(`2026-06-27T08:30`) when a multi-day event runs distances on different days —
the per-distance date is stored so "zaterdag wandelen, zondag lopen" survives.

## Running a real import

```bash
# DATABASE_URL must be set (Session-pooler string for cloud; .env for local).
uv run python -m app.scripts.import_races data/races.sample.csv
```

Always `--dry-run` first. The exit code is non-zero if any row was skipped, so
CI / a PR check can gate on a clean parse.
