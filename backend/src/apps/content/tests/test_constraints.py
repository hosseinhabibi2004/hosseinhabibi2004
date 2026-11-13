"""One translation per locale per live item, one slug per live item, and the
rules the database itself enforces."""

import datetime as dt

import pytest

from django.db import IntegrityError, transaction

from src.apps.content.models import Experience, Post, PostTranslation, Profile


pytestmark = pytest.mark.django_db


def _translation(post: Post, locale: str = "en", **kwargs) -> PostTranslation:
    return PostTranslation.objects.create(
        post=post, locale=locale, title="T", summary="S", body="B", **kwargs
    )


def test_a_post_has_at_most_one_live_translation_per_locale() -> None:
    post = Post.objects.create(slug="a-post")
    _translation(post, "en")

    with pytest.raises(IntegrityError), transaction.atomic():
        _translation(post, "en")

    _translation(post, "fa")


def test_a_deleted_translation_frees_its_locale() -> None:
    post = Post.objects.create(slug="a-post")
    first = _translation(post, "en")
    first.delete()

    _translation(post, "en")


def test_a_live_slug_is_unique_and_a_deleted_posts_slug_is_reusable() -> None:
    first = Post.objects.create(slug="same")

    with pytest.raises(IntegrityError), transaction.atomic():
        Post.objects.create(slug="same")

    first.delete()
    Post.objects.create(slug="same")


@pytest.mark.parametrize("slug", ["Has Space", "UPPER", "under_score", "", "-"])
def test_a_slug_must_be_lowercase_ascii_with_hyphens(slug: str) -> None:
    with pytest.raises(IntegrityError), transaction.atomic():
        Post.objects.create(slug=slug)


def test_there_is_only_one_live_profile() -> None:
    Profile.objects.create(email="me@example.com")

    with pytest.raises(IntegrityError), transaction.atomic():
        Profile.objects.create(email="other@example.com")


def test_an_experience_cannot_end_before_it_starts() -> None:
    with pytest.raises(IntegrityError), transaction.atomic():
        Experience.objects.create(
            company="X",
            start_date=dt.date(2024, 1, 1),
            end_date=dt.date(2023, 1, 1),
        )


def test_published_at_is_set_on_first_publish_and_kept_after() -> None:
    post = Post.objects.create(slug="a-post")
    translation = _translation(post, "en", status="draft")
    assert translation.published_at is None

    translation.status = "published"
    translation.save()
    first = translation.published_at
    assert first is not None

    translation.title = "T2"
    translation.save()
    translation.refresh_from_db()
    assert translation.published_at == first
