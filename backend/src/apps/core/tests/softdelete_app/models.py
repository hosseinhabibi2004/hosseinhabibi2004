"""Test-only models: `core` has none of its own, so the soft-delete base is
exercised through a parent and a child that cascades."""

from django.db import models

from src.apps.core.models import PublicIdModel, SoftDeleteModel


class Parent(PublicIdModel, SoftDeleteModel):
    name = models.CharField(max_length=20)


class Child(SoftDeleteModel):
    parent = models.ForeignKey(
        Parent, on_delete=models.CASCADE, related_name="children"
    )
    name = models.CharField(max_length=20)
