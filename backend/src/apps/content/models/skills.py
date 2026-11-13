from typing import ClassVar

from django.db import models

from src.apps.content.models.common import live_unique
from src.apps.core.models import PublicIdModel, SoftDeleteModel
from src.apps.core.translations import TranslationModel


class SkillGroup(PublicIdModel, SoftDeleteModel):
    position = models.PositiveSmallIntegerField(default=0)


class SkillGroupTranslation(TranslationModel):
    group = models.ForeignKey(
        SkillGroup, on_delete=models.CASCADE, related_name="translations"
    )
    title = models.CharField(max_length=120)

    class Meta:
        constraints: ClassVar = [
            live_unique(
                ["group", "locale"], "content_skillgrouptranslation_live_locale"
            )
        ]


class Skill(PublicIdModel, SoftDeleteModel):
    """A technology name, the same in every language."""

    group = models.ForeignKey(
        SkillGroup, on_delete=models.CASCADE, related_name="skills"
    )
    name = models.CharField(max_length=80)
    position = models.PositiveSmallIntegerField(default=0)
