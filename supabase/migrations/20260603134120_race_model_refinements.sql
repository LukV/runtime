-- Race model refinements, shaken out by real Belgian race data.
--
-- Belgium-wide is the confirmed calendar scope, so the province enum grows from
-- the 5 Flemish provinces to all 11 (the Vlaanderen/Wallonië/Brussel region is
-- derived from province in the app layer, not stored). Real rows also showed:
--   * multi-day events (e.g. a 5-day continuous loop) need an end date;
--   * prices are tiered / per-team / "from €X" — a single numeric can't hold the
--     truth, so a free-text note carries it and the numeric stays a "vanaf" hint;
--   * editions ("45e editie") are surfaced in the calendar design;
--   * free-form tags ("vlak", "bos", "kindvriendelijk", "goede doel") cover the
--     row's profile descriptor and any editorial facet, multi-valued.
-- Distance.km becoming optional (relays, loops) is a JSONB/Pydantic change only,
-- so it is not in this migration.

-- ----- province enum: add Brussels + the 5 Walloon provinces (Dutch slugs) -----
-- ADD VALUE is safe here: the new values are not used in this same transaction.
alter type province add value if not exists 'brussel';
alter type province add value if not exists 'waals-brabant';
alter type province add value if not exists 'henegouwen';
alter type province add value if not exists 'luik';
alter type province add value if not exists 'luxemburg';
alter type province add value if not exists 'namen';

-- ----- races: new optional columns -----
alter table races add column end_date date;                         -- multi-day events; null = single-day
alter table races add column price_info text;                       -- human price truth (tiers, per-team, day-of)
alter table races add column edition integer;                       -- "45e editie"
alter table races add column tags text[] not null default '{}';     -- free-form facets: vlak / bos / kindvriendelijk / goede doel
alter table races add column homepage text;                         -- event homepage, distinct from registration_url
alter table races add column location_label text;                   -- venue name, e.g. "Sporthal 't Rosco"
