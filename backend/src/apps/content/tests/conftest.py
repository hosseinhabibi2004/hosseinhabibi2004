import io

import pytest
from PIL import Image as PilImage

from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework.test import APIClient

from src.apps.content.models import Image, ImageTranslation


PASSWORD = "Str0ng-Passw0rd!"


@pytest.fixture(autouse=True)
def _media_root(settings, tmp_path) -> None:
    settings.MEDIA_ROOT = tmp_path


@pytest.fixture
def author(db):
    return get_user_model().objects.create_user(username="author", password=PASSWORD)


@pytest.fixture
def author_client(author) -> APIClient:
    client = APIClient()
    client.force_login(author)
    return client


@pytest.fixture
def public_client() -> APIClient:
    return APIClient()


def png_bytes(width: int = 8, height: int = 6) -> bytes:
    buffer = io.BytesIO()
    PilImage.new("RGB", (width, height), "red").save(buffer, format="PNG")
    return buffer.getvalue()


def upload(name: str = "a.png", data: bytes | None = None, kind: str = "image/png"):
    return SimpleUploadedFile(name, data if data is not None else png_bytes(), kind)


@pytest.fixture
def image(db) -> Image:
    image = Image.objects.create(file="images/2026/11/a.png", width=8, height=6)
    ImageTranslation.objects.create(image=image, locale="en", alt="A red box")
    ImageTranslation.objects.create(image=image, locale="fa", alt="جعبه قرمز")
    return image
