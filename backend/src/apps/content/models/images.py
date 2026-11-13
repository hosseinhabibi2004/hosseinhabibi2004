from typing import ClassVar

from django.db import models

from src.apps.content.models.common import live_unique
from src.apps.core.models import PublicIdModel, SoftDeleteModel
from src.apps.core.translations import TranslationModel


class Image(PublicIdModel, SoftDeleteModel):
    file = models.ImageField(upload_to="images/%Y/%m/")
    width = models.PositiveIntegerField()
    height = models.PositiveIntegerField()


class ImageTranslation(TranslationModel):
    image = models.ForeignKey(
        Image, on_delete=models.CASCADE, related_name="translations"
    )
    alt = models.CharField(max_length=300, blank=True)

    class Meta:
        constraints: ClassVar = [
            live_unique(["image", "locale"], "content_imagetranslation_live_locale")
        ]
