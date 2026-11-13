"""Writes shared by every content kind: replacing a set of translations (or of
child rows) in one go, and stamping who made the change."""

from collections.abc import Callable, Iterable
from typing import Any

from django.db import models

from src.apps.users.models import User


def stamp(user: User, *, creating: bool) -> dict[str, Any]:
    """`created_by` / `updated_by` values for a write by `user`."""
    values = {"updated_by": user}
    if creating:
        values["created_by"] = user
    return values


def sync_translations(
    model: type[models.Model],
    parent_field: str,
    parent: models.Model,
    items: Iterable[dict[str, Any]],
    user: User,
) -> None:
    """Make the live translations of `parent` exactly `items`: update the locales
    that are there, create the new ones, soft-delete the ones left out."""
    existing = {
        row.locale: row for row in model.objects.filter(**{parent_field: parent})
    }
    sent: set[str] = set()
    for item in items:
        locale = item["locale"]
        sent.add(locale)
        if locale in existing:
            row = existing[locale]
            for key, value in item.items():
                setattr(row, key, value)
            row.updated_by = user
            row.save()
        else:
            model.objects.create(
                **{parent_field: parent}, **item, **stamp(user, creating=True)
            )
    for locale, row in existing.items():
        if locale not in sent:
            row.delete(deleted_by=user)


def sync_children(  # noqa: PLR0913
    model: type[models.Model],
    parent_field: str,
    parent: models.Model,
    items: Iterable[dict[str, Any]],
    *,
    key: str,
    user: User,
    on_create: Callable[[dict[str, Any]], dict[str, Any]] = lambda item: item,
) -> None:
    """Same idea for child rows identified by one field (`key`): a skill by its
    name, a profile link by its kind and url."""
    existing = {
        getattr(row, key): row for row in model.objects.filter(**{parent_field: parent})
    }
    sent: set[Any] = set()
    for item in items:
        sent.add(item[key])
        if item[key] in existing:
            row = existing[item[key]]
            for field, value in item.items():
                setattr(row, field, value)
            row.updated_by = user
            row.save()
        else:
            model.objects.create(
                **{parent_field: parent},
                **on_create(item),
                **stamp(user, creating=True),
            )
    for value, row in existing.items():
        if value not in sent:
            row.delete(deleted_by=user)
