from typing import ClassVar

from django.db import models

from src.apps.content.models.common import live_unique, slug_format, slug_validator
from src.apps.core.models import PublicIdModel, SoftDeleteModel
from src.apps.core.translations import TranslationModel


class Tag(PublicIdModel, SoftDeleteModel):
    slug = models.CharField(max_length=80, validators=[slug_validator])

    class Meta:
        constraints: ClassVar = [
            live_unique(["slug"], "content_tag_live_slug"),
            slug_format("content_tag_slug_format"),
        ]


class TagTranslation(TranslationModel):
    tag = models.ForeignKey(Tag, on_delete=models.CASCADE, related_name="translations")
    name = models.CharField(max_length=80)

    class Meta:
        constraints: ClassVar = [
            live_unique(["tag", "locale"], "content_tagtranslation_live_locale")
        ]
