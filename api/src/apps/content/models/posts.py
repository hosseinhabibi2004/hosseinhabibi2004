from typing import ClassVar

from django.db import models

from src.apps.content.models.common import live_unique, slug_format, slug_validator
from src.apps.content.models.images import Image
from src.apps.content.models.tags import Tag
from src.apps.core.models import PublicIdModel, SoftDeleteModel
from src.apps.core.translations import PublishableTranslation


class Post(PublicIdModel, SoftDeleteModel):
    slug = models.CharField(max_length=80, validators=[slug_validator])
    cover_image = models.ForeignKey(
        Image, on_delete=models.SET_NULL, null=True, blank=True, related_name="+"
    )
    tags = models.ManyToManyField(Tag, blank=True, related_name="posts")

    class Meta:
        constraints: ClassVar = [
            live_unique(["slug"], "content_post_live_slug"),
            slug_format("content_post_slug_format"),
        ]


class PostTranslation(PublishableTranslation):
    post = models.ForeignKey(
        Post, on_delete=models.CASCADE, related_name="translations"
    )
    title = models.CharField(max_length=200)
    summary = models.TextField(blank=True)
    body = models.TextField(blank=True)

    class Meta:
        constraints: ClassVar = [
            live_unique(["post", "locale"], "content_posttranslation_live_locale")
        ]
