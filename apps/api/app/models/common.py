"""Shared model types: locales, the multilingual value type, and the StrEnums
that mirror the Postgres enums from the race-data-model migration."""

from __future__ import annotations

from collections.abc import Mapping
from enum import StrEnum
from typing import Final, Literal

Locale = Literal["nl", "fr", "en"]
DEFAULT_LOCALE: Final[Locale] = "nl"

# Multilingual text as stored in JSONB: a map of locale code -> string. Adding a
# language is data, never a migration.
Translated = dict[str, str]


def localized(value: Mapping[str, str], locale: Locale = DEFAULT_LOCALE) -> str:
    """Pick the string for `locale`, falling back to Dutch, then to any value
    present. Returns "" only when the map is empty."""
    if locale in value:
        return value[locale]
    if DEFAULT_LOCALE in value:
        return value[DEFAULT_LOCALE]
    return next(iter(value.values()), "")


class RaceType(StrEnum):
    WEG = "weg"
    TRAIL = "trail"
    CROSS = "cross"


class Province(StrEnum):
    # Flanders
    ANTWERPEN = "antwerpen"
    OOST_VLAANDEREN = "oost-vlaanderen"
    WEST_VLAANDEREN = "west-vlaanderen"
    LIMBURG = "limburg"
    VLAAMS_BRABANT = "vlaams-brabant"
    # Brussels
    BRUSSEL = "brussel"
    # Wallonia
    WAALS_BRABANT = "waals-brabant"
    HENEGOUWEN = "henegouwen"
    LUIK = "luik"
    LUXEMBURG = "luxemburg"
    NAMEN = "namen"


class RaceStatus(StrEnum):
    DRAFT = "draft"
    LIVE = "live"
    EDITION_PAST = "edition_past"


class OrganizerType(StrEnum):
    ATLETIEKCLUB = "atletiekclub"
    COMMERCIAL = "commercial"
    MUNICIPALITY = "municipality"
    INFORMAL = "informal"


class UserRole(StrEnum):
    ADMIN = "admin"
    COACH = "coach"
    ORGANIZER = "organizer"
