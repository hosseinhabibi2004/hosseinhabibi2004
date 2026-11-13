"""What the Public API may show. Every public endpoint reads through this
module, so "published, live and in this locale" is decided in one place.

Each function returns rows with the locale's translation attached as `.tr`.
"""

from typing import Any

from django.db.models import Model, Prefetch, QuerySet

from src.apps.content.models import (
    Education,
    EducationTranslation,
    Experience,
    ExperienceTranslation,
    Post,
    PostTranslation,
    Profile,
    ProfileTranslation,
    Project,
    ProjectTranslation,
    SkillGroup,
    SkillGroupTranslation,
    Tag,
    TagTranslation,
)


def _attach(rows: QuerySet, attr: str) -> list[Any]:
    """Keep the rows that have a translation in the locale, and expose it as `.tr`."""
    result = []
    for row in rows:
        translations = getattr(row, attr)
        if translations:
            row.tr = translations[0]
            result.append(row)
    return result


def _translations(
    model: type[Model], locale: str, *, published: bool = False
) -> QuerySet:
    queryset = model.objects.filter(locale=locale)
    return queryset.filter(status="published") if published else queryset


def published_posts(locale: str) -> list[Post]:
    translations = _translations(PostTranslation, locale, published=True)
    rows = (
        Post.objects.filter(translations__in=translations)
        .distinct()
        .prefetch_related(
            Prefetch("translations", queryset=translations, to_attr="localized"),
            "tags__translations",
            "cover_image__translations",
        )
    )
    return sorted(
        _attach(rows, "localized"), key=lambda p: p.tr.published_at, reverse=True
    )


def published_post(locale: str, slug: str) -> Post | None:
    return next((p for p in published_posts(locale) if p.slug == slug), None)


def published_projects(locale: str) -> list[Project]:
    translations = _translations(ProjectTranslation, locale, published=True)
    rows = (
        Project.objects.filter(translations__in=translations)
        .distinct()
        .order_by("position", "-pk")
        .prefetch_related(
            Prefetch("translations", queryset=translations, to_attr="localized"),
            "skills",
            "cover_image__translations",
        )
    )
    return _attach(rows, "localized")


def published_project(locale: str, slug: str) -> Project | None:
    return next((p for p in published_projects(locale) if p.slug == slug), None)


def tags(locale: str) -> list[Tag]:
    translations = _translations(TagTranslation, locale)
    rows = Tag.objects.filter(translations__in=translations).distinct().order_by("slug")
    rows = rows.prefetch_related(
        Prefetch("translations", queryset=translations, to_attr="localized")
    )
    return _attach(rows, "localized")


def profile(locale: str) -> Profile | None:
    translations = _translations(ProfileTranslation, locale)
    rows = Profile.objects.prefetch_related(
        Prefetch("translations", queryset=translations, to_attr="localized"),
        "links",
        "avatar__translations",
    )
    found = _attach(rows, "localized")
    return found[0] if found else None


def skill_groups(locale: str) -> list[SkillGroup]:
    translations = _translations(SkillGroupTranslation, locale)
    rows = (
        SkillGroup.objects.filter(translations__in=translations)
        .distinct()
        .order_by("position", "pk")
        .prefetch_related(
            Prefetch("translations", queryset=translations, to_attr="localized"),
            "skills",
        )
    )
    return _attach(rows, "localized")


def experience(locale: str) -> list[Experience]:
    translations = _translations(ExperienceTranslation, locale)
    rows = (
        Experience.objects.filter(translations__in=translations)
        .distinct()
        .order_by("-start_date", "-pk")
        .prefetch_related(
            Prefetch("translations", queryset=translations, to_attr="localized")
        )
    )
    return _attach(rows, "localized")


def education(locale: str) -> list[Education]:
    translations = _translations(EducationTranslation, locale)
    rows = (
        Education.objects.filter(translations__in=translations)
        .distinct()
        .order_by("-start_date", "-pk")
        .prefetch_related(
            Prefetch("translations", queryset=translations, to_attr="localized")
        )
    )
    return _attach(rows, "localized")
