import pytest

from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APIClient


pytestmark = pytest.mark.django_db

PASSWORD = "Str0ng-Passw0rd!"


@pytest.fixture
def author():
    return get_user_model().objects.create_user(
        username="author", password=PASSWORD, first_name="Hossein"
    )


def _login(client: APIClient, password: str = PASSWORD):
    return client.post(
        "/api/auth/login/", {"username": "author", "password": password}, format="json"
    )


def test_csrf_returns_a_token_to_anyone() -> None:
    response = APIClient().get("/api/auth/csrf/")

    assert response.status_code == status.HTTP_200_OK
    assert response.json()["result"]["csrf_token"]


def test_login_signs_the_author_in_and_me_answers(author) -> None:
    client = APIClient()

    response = _login(client)

    assert response.status_code == status.HTTP_200_OK
    result = response.json()["result"]
    assert result["user"]["username"] == "author"
    assert result["csrf_token"]
    assert client.get("/api/auth/me/").json()["result"]["username"] == "author"


def test_a_wrong_password_is_rejected_and_signs_nobody_in(author) -> None:
    client = APIClient()

    response = _login(client, password="wrong")

    assert response.status_code == status.HTTP_401_UNAUTHORIZED
    assert response.json()["message"] == "AUTH_002"
    assert client.get("/api/auth/me/").status_code == status.HTTP_403_FORBIDDEN


def test_me_needs_a_session() -> None:
    assert APIClient().get("/api/auth/me/").status_code == status.HTTP_403_FORBIDDEN


def test_logout_ends_the_session(author) -> None:
    client = APIClient()
    _login(client)

    response = client.post("/api/auth/logout/")

    assert response.status_code == status.HTTP_200_OK
    assert client.get("/api/auth/me/").status_code == status.HTTP_403_FORBIDDEN


def test_logout_enforces_csrf_for_a_signed_in_session(author) -> None:
    client = APIClient(enforce_csrf_checks=True)
    client.force_login(author)

    response = client.post("/api/auth/logout/")

    assert response.status_code == status.HTTP_403_FORBIDDEN
