"""The static site reads /api/public/<locale>/ with no session: only what is
published and not deleted."""

import datetime as dt

import pytest

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
    Skill,
    SkillGroup,
    SkillGroupTranslation,
    Tag,
    TagTranslation,
)


pytestmark = pytest.mark.django_db


def _post(slug: str, **translations: dict) -> Post:
    post = Post.objects.create(slug=slug)
    for locale, fields in translations.items():
        PostTranslation.objects.create(
            post=post,
            locale=locale,
            title=fields.get("title", slug),
            summary=fields.get("summary", ""),
            body=fields.get("body", "body"),
            status=fields.get("status", "published"),
        )
    return post


def _result(client, url: str):
    response = client.get(url)
    assert response.status_code == 200, response.content
    body = response.json()
    assert set(body) >= {"success", "message", "result", "meta"}
    return body["result"]


def test_only_published_live_translations_in_the_requested_locale(
    public_client,
) -> None:
    _post("both", en={"title": "Both"}, fa={"title": "هر دو"})
    _post("fa-only", fa={"title": "فقط فارسی"})
    _post("draft", en={"status": "draft"})
    _post("gone", en={}).delete()

    en = _result(public_client, "/api/public/en/posts/")
    fa = _result(public_client, "/api/public/fa/posts/")

    assert [p["slug"] for p in en] == ["both"]
    assert sorted(p["slug"] for p in fa) == ["both", "fa-only"]


def test_a_post_list_item_and_detail_shape(public_client, image) -> None:
    post = _post("both", en={"title": "Both", "summary": "S", "body": "# B"})
    post.cover_image = image
    post.save()
    tag = Tag.objects.create(slug="python")
    TagTranslation.objects.create(tag=tag, locale="en", name="Python")
    post.tags.add(tag)

    item = _result(public_client, "/api/public/en/posts/")[0]
    detail = _result(public_client, "/api/public/en/posts/both/")

    assert set(item) == {
        "slug",
        "title",
        "summary",
        "published_at",
        "cover_image",
        "tags",
    }
    assert item["cover_image"] == {
        "url": item["cover_image"]["url"],
        "width": 8,
        "height": 6,
        "alt": "A red box",
    }
    assert item["cover_image"]["url"].startswith("http")
    assert item["tags"] == [{"slug": "python", "name": "Python"}]
    assert set(detail) == set(item) | {"body"}
    assert detail["body"] == "# B"


def test_the_image_alt_follows_the_requested_locale(public_client, image) -> None:
    post = _post("both", en={}, fa={})
    post.cover_image = image
    post.save()

    fa = _result(public_client, "/api/public/fa/posts/both/")

    assert fa["cover_image"]["alt"] == "جعبه قرمز"


def test_a_deleted_cover_image_reads_as_null(public_client, image) -> None:
    post = _post("both", en={})
    post.cover_image = image
    post.save()
    image.delete()

    assert _result(public_client, "/api/public/en/posts/both/")["cover_image"] is None


def test_a_draft_or_deleted_post_detail_is_404(public_client) -> None:
    _post("draft", en={"status": "draft"})
    _post("gone", en={}).delete()

    assert public_client.get("/api/public/en/posts/draft/").status_code == 404
    assert public_client.get("/api/public/en/posts/gone/").status_code == 404
    assert public_client.get("/api/public/en/posts/missing/").status_code == 404


def test_an_unknown_locale_is_404(public_client) -> None:
    for path in ("posts/", "profile/", "skills/", "projects/"):
        assert public_client.get(f"/api/public/de/{path}").status_code == 404


def test_the_public_api_is_read_only(public_client) -> None:
    for method in (
        public_client.post,
        public_client.put,
        public_client.patch,
        public_client.delete,
    ):
        assert method("/api/public/en/posts/").status_code == 405


def test_tags_list_only_tags_with_a_name_in_the_locale(public_client) -> None:
    both = Tag.objects.create(slug="both")
    TagTranslation.objects.create(tag=both, locale="en", name="Both")
    TagTranslation.objects.create(tag=both, locale="fa", name="هر دو")
    en_only = Tag.objects.create(slug="en-only")
    TagTranslation.objects.create(tag=en_only, locale="en", name="EN")

    assert [t["slug"] for t in _result(public_client, "/api/public/fa/tags/")] == [
        "both"
    ]
    assert sorted(
        t["slug"] for t in _result(public_client, "/api/public/en/tags/")
    ) == ["both", "en-only"]


def test_skills_are_ordered_and_hide_deleted_rows(public_client) -> None:
    second = SkillGroup.objects.create(position=1)
    SkillGroupTranslation.objects.create(group=second, locale="en", title="Second")
    first = SkillGroup.objects.create(position=0)
    SkillGroupTranslation.objects.create(group=first, locale="en", title="First")
    Skill.objects.create(group=first, name="B", position=1)
    Skill.objects.create(group=first, name="A", position=0)
    Skill.objects.create(group=first, name="Gone", position=2).delete()

    groups = _result(public_client, "/api/public/en/skills/")

    assert [g["title"] for g in groups] == ["First", "Second"]
    assert [s["name"] for s in groups[0]["skills"]] == ["A", "B"]


def test_experience_and_education_are_newest_first(public_client) -> None:
    for year, role in ((2020, "Old"), (2024, "New")):
        item = Experience.objects.create(company="C", start_date=dt.date(year, 1, 1))
        ExperienceTranslation.objects.create(
            experience=item, locale="en", role=role, location="", description=""
        )
    for year, degree in ((2018, "Old"), (2022, "New")):
        item = Education.objects.create(institution="U", start_date=dt.date(year, 1, 1))
        EducationTranslation.objects.create(
            education=item, locale="en", degree=degree, description=""
        )

    experience = _result(public_client, "/api/public/en/experience/")
    education = _result(public_client, "/api/public/en/education/")

    assert [e["role"] for e in experience] == ["New", "Old"]
    assert set(experience[0]) == {
        "company",
        "company_url",
        "role",
        "location",
        "description",
        "start_date",
        "end_date",
    }
    assert [e["degree"] for e in education] == ["New", "Old"]


def test_the_profile_is_404_in_a_locale_without_a_translation(public_client) -> None:
    profile = Profile.objects.create(email="me@example.com")
    ProfileTranslation.objects.create(
        profile=profile, locale="en", name="N", headline="H", summary="S", location="L"
    )

    assert public_client.get("/api/public/en/profile/").status_code == 200
    assert public_client.get("/api/public/fa/profile/").status_code == 404


def test_projects_follow_the_same_publishing_rules(public_client) -> None:
    shown = Project.objects.create(slug="shown", featured=True, position=0)
    ProjectTranslation.objects.create(
        project=shown,
        locale="en",
        title="Shown",
        summary="s",
        body="b",
        status="published",
    )
    hidden = Project.objects.create(slug="hidden", position=1)
    ProjectTranslation.objects.create(
        project=hidden,
        locale="en",
        title="Hidden",
        summary="s",
        body="b",
        status="draft",
    )

    projects = _result(public_client, "/api/public/en/projects/")
    detail = _result(public_client, "/api/public/en/projects/shown/")

    assert [p["slug"] for p in projects] == ["shown"]
    assert set(projects[0]) == {
        "slug",
        "title",
        "summary",
        "repo_url",
        "live_url",
        "featured",
        "cover_image",
        "skills",
    }
    assert set(detail) == set(projects[0]) | {"body"}
    assert public_client.get("/api/public/en/projects/hidden/").status_code == 404
