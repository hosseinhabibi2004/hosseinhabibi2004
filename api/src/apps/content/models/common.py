from django.core.validators import RegexValidator
from django.db import models


SLUG_PATTERN = r"^[a-z0-9]+(-[a-z0-9]+)*$"

slug_validator = RegexValidator(
    SLUG_PATTERN, "Use lowercase ASCII letters, digits and single hyphens."
)


def live_unique(fields: list[str], name: str) -> models.UniqueConstraint:
    """Unique among rows that are not soft-deleted, so a deleted item frees its
    slug or its locale slot."""
    return models.UniqueConstraint(
        fields=fields, condition=models.Q(is_deleted=False), name=name
    )


def slug_format(name: str) -> models.CheckConstraint:
    return models.CheckConstraint(
        condition=models.Q(slug__regex=SLUG_PATTERN), name=name
    )
