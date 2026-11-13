from typing import ClassVar

from django.db import models

from src.apps.content.models.common import live_unique, slug_format, slug_validator
from src.apps.content.models.images import Image
from src.apps.content.models.skills import Skill
from src.apps.core.models import PublicIdModel, SoftDeleteModel
from src.apps.core.translations import PublishableTranslation


class Project(PublicIdModel, SoftDeleteModel):
    slug = models.CharField(max_length=80, validators=[slug_validator])
    repo_url = models.URLField(blank=True)
    live_url = models.URLField(blank=True)
    featured = models.BooleanField(default=False)
    position = models.PositiveSmallIntegerField(default=0)
    cover_image = models.ForeignKey(
        Image, on_delete=models.SET_NULL, null=True, blank=True, related_name="+"
    )
    skills = models.ManyToManyField(Skill, blank=True, related_name="projects")

    class Meta:
        constraints: ClassVar = [
            live_unique(["slug"], "content_project_live_slug"),
            slug_format("content_project_slug_format"),
        ]


class ProjectTranslation(PublishableTranslation):
    project = models.ForeignKey(
        Project, on_delete=models.CASCADE, related_name="translations"
    )
    title = models.CharField(max_length=200)
    summary = models.TextField(blank=True)
    body = models.TextField(blank=True)

    class Meta:
        constraints: ClassVar = [
            live_unique(["project", "locale"], "content_projecttranslation_live_locale")
        ]
