"""Unit tests for the CSV row parser. No database — `parse_row` is pure."""

from __future__ import annotations

from datetime import date, time
from decimal import Decimal

from app.scripts.import_races import parse_row


def _row(**overrides: str) -> dict[str, str]:
    base = {
        "slug": "stadsloop-x-2026",
        "race_type": "weg",
        "title_nl": "Stadsloop X",
        "date": "2026-06-06",
        "city": "Diest",
        "province": "vlaams-brabant",
        "distances": "5;10",
        "status": "live",
    }
    base.update(overrides)
    return base


def test_parses_a_valid_row() -> None:
    res = parse_row(_row(), 2)
    assert res.ok
    assert res.data is not None
    assert res.data.slug == "stadsloop-x-2026"
    assert res.data.title == {"nl": "Stadsloop X"}
    assert res.data.date == date(2026, 6, 6)
    assert [d.label for d in res.data.distances] == ["5 km", "10 km"]


def test_distance_mini_syntax_time_and_price() -> None:
    res = parse_row(_row(distances="10@10:00#12.50;5@09:30"), 2)
    assert res.ok
    assert res.data is not None
    first, second = res.data.distances
    assert first.label == "10 km"
    assert first.km == 10
    assert first.start_time == time(10, 0)
    assert first.price_eur == Decimal("12.50")
    assert second.km == 5
    assert second.price_eur is None


def test_relay_label_keeps_text_and_lifts_km() -> None:
    res = parse_row(_row(distances="9 km estafette@18:30"), 2)
    assert res.ok
    assert res.data is not None
    leg = res.data.distances[0]
    assert leg.label == "9 km estafette"
    assert leg.km == 9
    assert leg.start_time == time(18, 30)


def test_loop_label_with_comma_decimal() -> None:
    res = parse_row(_row(distances="4,6 km-lus ×1-3"), 2)
    assert res.ok
    assert res.data is not None
    loop = res.data.distances[0]
    assert loop.label == "4,6 km-lus ×1-3"
    assert loop.km == 4.6


def test_explicit_km_label_form() -> None:
    res = parse_row(_row(distances="17.5=Walk - 17,5 km@08:30"), 2)
    assert res.ok
    assert res.data is not None
    d = res.data.distances[0]
    assert d.label == "Walk - 17,5 km"
    assert d.km == 17.5
    assert d.start_time == time(8, 30)


def test_per_distance_iso_datetime_sets_day() -> None:
    res = parse_row(
        _row(distances="43=Run - 43 km@2026-06-28T09:00", date="2026-06-27", end_date="2026-06-28"),
        2,
    )
    assert res.ok
    assert res.data is not None
    d = res.data.distances[0]
    assert d.km == 43
    assert d.date == date(2026, 6, 28)
    assert d.start_time == time(9, 0)


def test_location_label_and_homepage() -> None:
    res = parse_row(_row(location_label="Sporthal 't Rosco", homepage="https://keeponrunning.be/"), 2)
    assert res.ok
    assert res.data is not None
    assert res.data.location.label == "Sporthal 't Rosco"
    assert res.data.homepage == "https://keeponrunning.be/"


def test_multi_day_end_date() -> None:
    res = parse_row(_row(end_date="2026-06-28", distances="1 km continu"), 2)
    assert res.ok
    assert res.data is not None
    assert res.data.end_date == date(2026, 6, 28)
    assert res.data.distances[0].km == 1


def test_edition_and_price_info_pass_through() -> None:
    res = parse_row(_row(edition="45", price_info="Ploeg van 3: €103 / €121"), 2)
    assert res.ok
    assert res.data is not None
    assert res.data.edition == 45
    assert res.data.price_info == "Ploeg van 3: €103 / €121"


def test_tags_split_lowercased_and_deduped() -> None:
    res = parse_row(_row(tags="Bos; vlak ;bos;Goede Doel"), 2)
    assert res.ok
    assert res.data is not None
    assert res.data.tags == ["bos", "vlak", "goede doel"]


def test_no_tags_is_empty_list() -> None:
    res = parse_row(_row(), 2)
    assert res.ok
    assert res.data is not None
    assert res.data.tags == []


def test_blank_optionals_become_none() -> None:
    res = parse_row(_row(price_eur="", image_url=""), 2)
    assert res.ok
    assert res.data is not None
    assert res.data.price_eur is None
    assert res.data.image_url is None


def test_bad_province_is_skipped_with_diagnostic() -> None:
    res = parse_row(_row(province="oost vlaanderen"), 2)
    assert not res.ok
    assert res.data is None
    assert any("province" in d.message for d in res.diagnostics)


def test_missing_title_is_an_error() -> None:
    row = _row()
    del row["title_nl"]
    res = parse_row(row, 2)
    assert not res.ok
    assert res.data is None
    assert any("title" in d.message for d in res.diagnostics)


def test_bad_edition_is_an_error() -> None:
    res = parse_row(_row(edition="forty-five"), 2)
    assert not res.ok
    assert any("edition" in d.message for d in res.diagnostics)
