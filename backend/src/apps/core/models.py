import datetime as dt
import uuid
from typing import TYPE_CHECKING

from django.conf import settings
from django.db import models
from django.db.models import Manager
from django.utils import timezone


if TYPE_CHECKING:
    from src.apps.users.models import User


class PublicIdModel(models.Model):
    """A row addressed from outside by `uuid`, never by its integer key."""

    uuid = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)

    class Meta:
        abstract = True


class AuditModel(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        related_name="created_%(class)ss",
        null=True,
        blank=True,
    )

    updated_at = models.DateTimeField(auto_now=True)
    updated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        related_name="updated_%(class)ss",
        null=True,
        blank=True,
    )

    class Meta:
        abstract = True

    def save(
        self,
        *,
        force_insert: bool = False,
        force_update: bool = False,
        using: str | None = None,
        update_fields: list | None = None,
    ) -> None:
        if update_fields is not None and "updated_by" in update_fields:
            update_fields.append("updated_at")
        return super().save(
            force_insert=force_insert,
            force_update=force_update,
            using=using,
            update_fields=update_fields,
        )


class SoftDeleteQuerySet(models.QuerySet):
    def delete(self, deleted_by: "User | None" = None) -> None:
        # Row by row, so each object's cascade to its children runs.
        for obj in self:
            obj.delete(deleted_by)

    def hard_delete(self) -> tuple:
        return super().delete()

    def restore(self) -> None:
        for obj in self:
            obj.restore()

    def deleted(self) -> "SoftDeleteQuerySet":
        return self.filter(is_deleted=True)

    def active(self) -> "SoftDeleteQuerySet":
        return self.filter(is_deleted=False)


class SoftDeleteManager(Manager):
    def get_queryset(self) -> SoftDeleteQuerySet:
        return SoftDeleteQuerySet(self.model, using=self._db).active()

    def get_all(self) -> SoftDeleteQuerySet:
        return SoftDeleteQuerySet(self.model, using=self._db)

    def deleted_only(self) -> SoftDeleteQuerySet:
        return SoftDeleteQuerySet(self.model, using=self._db).deleted()


class SoftDeleteModel(AuditModel):
    """A row that is hidden, never removed. Deleting a parent soft-deletes the
    children that would have been deleted with it (`on_delete=CASCADE` to
    another `SoftDeleteModel`); restoring it brings back exactly those, and not
    a child that was deleted on its own earlier."""

    is_deleted = models.BooleanField(default=False, db_index=True)
    deleted_at = models.DateTimeField(blank=True, null=True)
    deleted_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        related_name="deleted_%(class)ss",
        null=True,
        blank=True,
    )

    # `objects` comes first so it is the model's default manager: reverse
    # relations (`post.translations`) and DRF lookups then hide deleted rows.
    objects = SoftDeleteManager()
    objects_default = Manager()  # noqa: DJ012

    class Meta:
        abstract = True

    def _cascaded_children(self) -> list[tuple[type["SoftDeleteModel"], str]]:
        return [
            (related.related_model, related.field.name)
            for related in self._meta.related_objects
            if related.on_delete is models.CASCADE
            and issubclass(related.related_model, SoftDeleteModel)
        ]

    def _soft_delete(self, deleted_by: "User | None" = None) -> None:
        if self.is_deleted:
            return

        self.is_deleted = True
        self.deleted_at = timezone.now()
        self.deleted_by = deleted_by
        self.save()

        for model, field in self._cascaded_children():
            children = model.objects_default.filter(
                **{field: self, "is_deleted": False}
            )
            for child in children:
                child._soft_delete_at(self.deleted_at, deleted_by)  # noqa: SLF001

    def _soft_delete_at(self, when: dt.datetime, deleted_by: "User | None") -> None:
        # A child deleted together with its parent shares the parent's timestamp.
        self.is_deleted = True
        self.deleted_at = when
        self.deleted_by = deleted_by
        self.save()

        for model, field in self._cascaded_children():
            children = model.objects_default.filter(
                **{field: self, "is_deleted": False}
            )
            for child in children:
                child._soft_delete_at(when, deleted_by)  # noqa: SLF001

    def delete(self, deleted_by: "User | None" = None) -> None:
        return self._soft_delete(deleted_by)

    def restore(self) -> None:
        if not self.is_deleted:
            return

        deleted_at = self.deleted_at
        self.is_deleted = False
        self.deleted_at = None
        self.deleted_by = None
        self.save()

        for model, field in self._cascaded_children():
            children = model.objects_default.filter(
                **{field: self, "is_deleted": True, "deleted_at": deleted_at}
            )
            for child in children:
                child.restore()

    def hard_delete(self) -> tuple:
        return super().delete()
