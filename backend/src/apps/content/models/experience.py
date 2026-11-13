from typing import ClassVar

from django.db import models

from src.apps.content.models.common import live_unique
from src.apps.core.models import PublicIdModel, SoftDeleteModel
from src.apps.core.translations import TranslationModel


class Experience(PublicIdModel, SoftDeleteModel):
    company = models.CharField(max_length=120)
    company_url = models.URLField(blank=True)
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)

    class Meta:
        constraints: ClassVar = [
            models.CheckConstraint(
                condition=models.Q(end_date__isnull=True)
                | models.Q(end_date__gte=models.F("start_date")),
                name="content_experience_dates_in_order",
            )
        ]


class ExperienceTranslation(TranslationModel):
    experience = models.ForeignKey(
        Experience, on_delete=models.CASCADE, related_name="translations"
    )
    role = models.CharField(max_length=160)
    location = models.CharField(max_length=120, blank=True)
    description = models.TextField(blank=True)

    class Meta:
        constraints: ClassVar = [
            live_unique(
                ["experience", "locale"], "content_experiencetranslation_live_locale"
            )
        ]
