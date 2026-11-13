"""The Author writes content through /api/author/, behind a session."""

import pytest

from rest_framework import status

from src.apps.content.tests.conftest import PASSWORD


pytestmark = pytest.mark.django_db

POSTS = "/api/author/posts/"


def _post_payload(**overrides) -> dict:
    payload = {
        "slug": "hello-world",
        "cover_image": None,
        "tags": [],
        "translations": [
            {
                "locale": "en",
                "title": "Hello",
                "summary": "S",
                "body": "B",
                "status": "draft",
            },
            {
                "locale": "fa",
                "title": "سلام",
                "summary": "خ",
                "body": "ب",
                "status": "draft",
            },
        ],
    }
    payload.update(overrides)
    return payload


def _create(client, **overrides) -> dict:
    response = client.post(POSTS, _post_payload(**overrides), format="json")
    assert response.status_code == status.HTTP_201_CREATED, response.json()
    return response.json()["result"]


def test_a_post_is_created_with_both_translations_in_one_call(author_client) -> None:
    result = _create(author_client)

    assert result["uuid"]
    assert result["slug"] == "hello-world"
    assert {t["locale"] for t in result["translations"]} == {"en", "fa"}


def test_a_write_replaces_the_whole_set_of_translations(author_client) -> None:
    created = _create(author_client)

    response = author_client.patch(
        f"{POSTS}{created['uuid']}/",
        {
            "translations": [
                {
                    "locale": "fa",
                    "title": "فقط",
                    "summary": "",
                    "body": "ب",
                    "status": "draft",
                }
            ]
        },
        format="json",
    )

    assert response.status_code == status.HTTP_200_OK
    assert [t["locale"] for t in response.json()["result"]["translations"]] == ["fa"]


def test_an_unknown_locale_or_a_repeated_one_is_rejected(author_client) -> None:
    for translations in (
        [{"locale": "de", "title": "x", "summary": "", "body": "x", "status": "draft"}],
        [
            {
                "locale": "en",
                "title": "x",
                "summary": "",
                "body": "x",
                "status": "draft",
            },
            {
                "locale": "en",
                "title": "y",
                "summary": "",
                "body": "y",
                "status": "draft",
            },
        ],
    ):
        response = author_client.post(
            POSTS, _post_payload(translations=translations), format="json"
        )
        assert response.status_code == status.HTTP_400_BAD_REQUEST


def test_publishing_needs_a_title_and_a_body(author_client) -> None:
    bad = [
        {"locale": "en", "title": "T", "summary": "", "body": "", "status": "published"}
    ]

    response = author_client.post(POSTS, _post_payload(translations=bad), format="json")

    assert response.status_code == status.HTTP_400_BAD_REQUEST


def test_the_slug_is_locked_once_a_translation_is_published(author_client) -> None:
    created = _create(author_client)
    url = f"{POSTS}{created['uuid']}/"

    assert (
        author_client.patch(url, {"slug": "renamed"}, format="json").status_code == 200
    )

    published = [
        {
            "locale": "en",
            "title": "T",
            "summary": "",
            "body": "B",
            "status": "published",
        }
    ]
    assert (
        author_client.patch(url, {"translations": published}, format="json").status_code
        == 200
    )

    response = author_client.patch(url, {"slug": "renamed-again"}, format="json")
    assert response.status_code == status.HTTP_400_BAD_REQUEST


def test_delete_hides_a_post_and_restore_brings_it_back(author_client) -> None:
    created = _create(author_client)
    url = f"{POSTS}{created['uuid']}/"

    assert author_client.delete(url).status_code == status.HTTP_200_OK
    assert author_client.get(url).status_code == status.HTTP_404_NOT_FOUND
    listed = author_client.get(POSTS).json()["result"]["results"]
    assert created["uuid"] not in [p["uuid"] for p in listed]
    deleted = author_client.get(POSTS, {"deleted": "true"}).json()["result"]["results"]
    assert created["uuid"] in [p["uuid"] for p in deleted]

    assert author_client.post(f"{url}restore/").status_code == status.HTTP_200_OK
    assert author_client.get(url).status_code == status.HTTP_200_OK


def test_writes_are_held_to_the_csrf_check(csrf_client, author) -> None:
    login = csrf_client.post(
        "/api/auth/login/", {"username": "author", "password": PASSWORD}, format="json"
    )
    token = login.json()["result"]["csrf_token"]

    without = csrf_client.post(POSTS, _post_payload(), format="json")
    with_token = csrf_client.post(
        POSTS, _post_payload(), format="json", HTTP_X_CSRFTOKEN=token
    )

    assert without.status_code == status.HTTP_403_FORBIDDEN
    assert with_token.status_code == status.HTTP_201_CREATED


def test_a_tag_is_created_with_translated_names(author_client) -> None:
    response = author_client.post(
        "/api/author/tags/",
        {
            "slug": "python",
            "translations": [
                {"locale": "en", "name": "Python"},
                {"locale": "fa", "name": "پایتون"},
            ],
        },
        format="json",
    )

    assert response.status_code == status.HTTP_201_CREATED


def test_a_skill_group_carries_its_skills_and_replaces_them(author_client) -> None:
    created = author_client.post(
        "/api/author/skill-groups/",
        {
            "position": 0,
            "translations": [{"locale": "en", "title": "Backend"}],
            "skills": [
                {"name": "Django", "position": 0},
                {"name": "Celery", "position": 1},
            ],
        },
        format="json",
    ).json()["result"]
    assert [s["name"] for s in created["skills"]] == ["Django", "Celery"]

    updated = author_client.patch(
        f"/api/author/skill-groups/{created['uuid']}/",
        {"skills": [{"name": "Django", "position": 0}]},
        format="json",
    ).json()["result"]
    assert [s["name"] for s in updated["skills"]] == ["Django"]


def test_experience_and_education_can_be_created(author_client) -> None:
    experience = author_client.post(
        "/api/author/experience/",
        {
            "company": "WeNova",
            "company_url": "",
            "start_date": "2024-09-01",
            "end_date": None,
            "translations": [
                {
                    "locale": "en",
                    "role": "CTO",
                    "location": "Tabriz",
                    "description": "d",
                }
            ],
        },
        format="json",
    )
    education = author_client.post(
        "/api/author/education/",
        {
            "institution": "University of Tabriz",
            "start_date": "2022-09-01",
            "end_date": "2026-06-01",
            "translations": [{"locale": "en", "degree": "B.Sc.", "description": ""}],
        },
        format="json",
    )

    assert experience.status_code == status.HTTP_201_CREATED
    assert education.status_code == status.HTTP_201_CREATED


def test_the_profile_is_a_single_record_that_can_be_written(author_client) -> None:
    payload = {
        "email": "me@example.com",
        "avatar": None,
        "links": [{"kind": "github", "url": "https://github.com/x", "position": 0}],
        "translations": [
            {
                "locale": "en",
                "name": "Hossein",
                "headline": "Engineer",
                "summary": "",
                "location": "Tabriz",
            }
        ],
    }

    first = author_client.put("/api/author/profile/", payload, format="json")
    again = author_client.put("/api/author/profile/", payload, format="json")

    assert first.status_code == again.status_code == status.HTTP_200_OK
    assert (
        author_client.get("/api/author/profile/").json()["result"]["email"]
        == "me@example.com"
    )


def test_a_project_links_to_skills_and_a_cover_image(author_client, image) -> None:
    response = author_client.post(
        "/api/author/projects/",
        {
            "slug": "limoora-bot",
            "repo_url": "",
            "live_url": "",
            "featured": True,
            "position": 0,
            "cover_image": str(image.uuid),
            "skills": [],
            "translations": [
                {
                    "locale": "en",
                    "title": "Bot",
                    "summary": "s",
                    "body": "b",
                    "status": "draft",
                }
            ],
        },
        format="json",
    )

    assert response.status_code == status.HTTP_201_CREATED
    assert response.json()["result"]["cover_image"] == str(image.uuid)
