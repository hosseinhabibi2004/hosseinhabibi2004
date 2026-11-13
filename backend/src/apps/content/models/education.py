from typing import ClassVar

from django.db import models

from src.apps.content.models.common import live_unique
from src.apps.core.models import PublicIdModel, SoftDeleteModel
from src.apps.core.translations import TranslationModel


class Education(PublicIdModel, SoftDeleteModel):
    institution = models.CharField(max_length=160)
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)

    class Meta:
        constraints: ClassVar = [
            models.CheckConstraint(
                condition=models.Q(end_date__isnull=True)
                | models.Q(end_date__gte=models.F("start_date")),
                name="content_education_dates_in_order",
            )
        ]


class EducationTranslation(TranslationModel):
    education = models.ForeignKey(
        Education, on_delete=models.CASCADE, related_name="translations"
    )
    degree = models.CharField(max_length=160)
    description = models.TextField(blank=True)

    class Meta:
        constraints: ClassVar = [
            live_unique(
                ["education", "locale"], "content_educationtranslation_live_locale"
            )
        ]
