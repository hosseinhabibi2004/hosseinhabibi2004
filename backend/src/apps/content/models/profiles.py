from typing import ClassVar

from django.db import models

from src.apps.content.models.common import live_unique
from src.apps.content.models.images import Image
from src.apps.core.models import PublicIdModel, SoftDeleteModel
from src.apps.core.translations import TranslationModel


class Profile(PublicIdModel, SoftDeleteModel):
    """The Author. There is exactly one live profile, and no phone number: it
    would end up in the public site's HTML."""

    # Always True: the unique constraint on it is what limits the table to one
    # live row.
    singleton = models.BooleanField(default=True, editable=False)
    email = models.EmailField()
    avatar = models.ForeignKey(
        Image, on_delete=models.SET_NULL, null=True, blank=True, related_name="+"
    )

    class Meta:
        constraints: ClassVar = [
            live_unique(["singleton"], "content_profile_live_singleton")
        ]


class ProfileTranslation(TranslationModel):
    profile = models.ForeignKey(
        Profile, on_delete=models.CASCADE, related_name="translations"
    )
    name = models.CharField(max_length=120)
    headline = models.CharField(max_length=200, blank=True)
    summary = models.TextField(blank=True)
    location = models.CharField(max_length=120, blank=True)

    class Meta:
        constraints: ClassVar = [
            live_unique(["profile", "locale"], "content_profiletranslation_live_locale")
        ]


class ProfileLink(SoftDeleteModel):
    profile = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name="links")
    kind = models.CharField(max_length=30)
    url = models.URLField()
    position = models.PositiveSmallIntegerField(default=0)
