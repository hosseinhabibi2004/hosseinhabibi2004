"""Uploads are validated, and an image carries an alt text per language."""

import pytest

from django.core.files.uploadedfile import SimpleUploadedFile

from src.apps.content.models import Image
from src.apps.content.tests.conftest import png_bytes, upload


pytestmark = pytest.mark.django_db

IMAGES = "/api/author/images/"


def _post_image(client, file):
    return client.post(IMAGES, {"file": file}, format="multipart")


def test_a_png_is_accepted_and_its_size_recorded(author_client) -> None:
    response = _post_image(author_client, upload(data=png_bytes(30, 20)))

    assert response.status_code == 201, response.json()
    result = response.json()["result"]
    assert (result["width"], result["height"]) == (30, 20)
    assert result["url"].startswith("http")
    assert Image.objects.get(uuid=result["uuid"]).file


def test_a_text_file_named_png_is_rejected(author_client) -> None:
    fake = SimpleUploadedFile("a.png", b"not an image", "image/png")

    assert _post_image(author_client, fake).status_code == 400


def test_a_file_over_the_byte_limit_is_rejected(author_client, settings) -> None:
    settings.IMAGE_MAX_BYTES = 100

    assert (
        _post_image(author_client, upload(data=png_bytes(200, 200))).status_code == 400
    )


def test_an_image_over_the_side_limit_is_rejected(author_client, settings) -> None:
    settings.IMAGE_MAX_SIDE = 10

    assert _post_image(author_client, upload(data=png_bytes(20, 5))).status_code == 400


def test_only_the_signed_in_author_can_upload(public_client) -> None:
    assert _post_image(public_client, upload()).status_code == 403


def test_alt_texts_are_set_per_language_after_the_upload(author_client) -> None:
    created = _post_image(author_client, upload()).json()["result"]

    response = author_client.patch(
        f"{IMAGES}{created['uuid']}/",
        {"translations": [{"locale": "en", "alt": "A"}, {"locale": "fa", "alt": "ب"}]},
        format="json",
    )

    assert response.status_code == 200
    assert {
        t["locale"]: t["alt"] for t in response.json()["result"]["translations"]
    } == {"en": "A", "fa": "ب"}


def test_the_public_image_has_an_empty_alt_when_the_locale_has_none(
    public_client, image
) -> None:
    from src.apps.content.models import Post, PostTranslation

    post = Post.objects.create(slug="p", cover_image=image)
    PostTranslation.objects.create(
        post=post, locale="en", title="T", summary="", body="B", status="published"
    )
    image.translations.filter(locale="en").delete()

    cover = public_client.get("/api/public/en/posts/p/").json()["result"]["cover_image"]

    assert cover["alt"] == ""
