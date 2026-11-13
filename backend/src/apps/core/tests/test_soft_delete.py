"""The soft-delete base hides rows instead of removing them, and cascades."""

import uuid

import pytest

from src.apps.core.tests.softdelete_app.models import Child, Parent


pytestmark = pytest.mark.django_db


@pytest.fixture
def parent() -> Parent:
    parent = Parent.objects.create(name="p")
    Child.objects.create(parent=parent, name="c")
    return parent


def test_a_row_has_an_integer_pk_and_a_public_uuid(parent) -> None:
    assert isinstance(parent.pk, int)
    assert isinstance(parent.uuid, uuid.UUID)


def test_delete_hides_the_parent_and_cascades_to_its_children(parent) -> None:
    parent.delete()

    assert not Parent.objects.filter(pk=parent.pk).exists()
    assert not Child.objects.filter(parent_id=parent.pk).exists()
    assert Parent.objects_default.get(pk=parent.pk).is_deleted is True
    assert Child.objects_default.get(parent_id=parent.pk).is_deleted is True


def test_restore_brings_back_the_parent_and_the_children_deleted_with_it(
    parent,
) -> None:
    parent.delete()
    parent.restore()

    assert Parent.objects.filter(pk=parent.pk).exists()
    assert Child.objects.filter(parent_id=parent.pk).exists()


def test_a_child_deleted_on_its_own_stays_deleted_when_the_parent_is_restored(
    parent,
) -> None:
    child = Child.objects.get(parent=parent)
    child.delete()
    parent.delete()
    parent.restore()

    assert not Child.objects.filter(pk=child.pk).exists()


def test_hard_delete_removes_the_row(parent) -> None:
    pk = parent.pk
    parent.hard_delete()

    assert not Parent.objects_default.filter(pk=pk).exists()
