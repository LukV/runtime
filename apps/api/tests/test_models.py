"""Surface tests for the model layer: the multilingual helper and that a
representative race row validates into the Race model."""

from __future__ import annotations

from app.models import Race, localized


def test_localized_prefers_requested_then_falls_back_to_nl() -> None:
    title = {"nl": "Stadsloop", "fr": "Course urbaine"}
    assert localized(title, "fr") == "Course urbaine"
    assert localized(title, "en") == "Stadsloop"  # missing locale → Dutch fallback
    assert localized({}, "nl") == ""  # empty map never raises


def test_race_validates_a_representative_row() -> None:
    race = Race.model_validate(
        {
            "id": "00000000-0000-0000-0000-000000000001",
            "slug": "stadsloop-mechelen-2026",
            "race_type": "weg",
            "title": {"nl": "Stadsloop Mechelen"},
            "date": "2026-09-01",
            "distances": [{"label": "10 km", "km": 10, "price_eur": "12.50"}],
            "location": {"city": "Mechelen", "province": "antwerpen"},
            "status": "live",
            "created_at": "2026-06-02T12:00:00Z",
            "updated_at": "2026-06-02T12:00:00Z",
        }
    )
    assert race.slug == "stadsloop-mechelen-2026"
    assert localized(race.title) == "Stadsloop Mechelen"
    assert race.distances[0].km == 10
    assert race.location.country == "BE"  # default applied
