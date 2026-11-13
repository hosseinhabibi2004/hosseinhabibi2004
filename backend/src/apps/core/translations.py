"""Base classes for content that has one row of text per language.

A concrete translation declares its own parent foreign key and the conditional
unique constraint on `(parent, locale)` among live rows, since the parent's name
differs per model.
"""

from django.conf import settings
from django.db import models
from django.utils import timezone

from src.apps.core.models import SoftDeleteModel


class TranslationModel(SoftDeleteModel):
    """The text of one item in one language."""

    locale = models.CharField(max_length=8, choices=settings.LANGUAGES)

    class Meta:
        abstract = True


class PublishableTranslation(TranslationModel):
    """A translation that is a draft until it is published; `published_at` is the
    moment of the first publish and does not move on later edits."""

    class Status(models.TextChoices):
        DRAFT = "draft", "Draft"
        PUBLISHED = "published", "Published"

    status = models.CharField(
        max_length=10, choices=Status.choices, default=Status.DRAFT
    )
    published_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        abstract = True

    def save(self, *args: object, **kwargs: object) -> None:
        if self.status == self.Status.PUBLISHED and self.published_at is None:
            self.published_at = timezone.now()
        super().save(*args, **kwargs)
