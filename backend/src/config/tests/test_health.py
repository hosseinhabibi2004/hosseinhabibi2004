"""The health endpoint a healthcheck or an uptime monitor polls."""

import pytest

from rest_framework import status
from rest_framework.test import APIClient


pytestmark = pytest.mark.django_db


def test_health_reports_ok_when_the_database_answers() -> None:
    response = APIClient().get("/api/health/")

    assert response.status_code == status.HTTP_200_OK
    assert response.json()["result"]["status"] == "ok"


def test_health_reports_error_when_the_database_is_unreachable(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    from django.db import connection

    def _boom() -> None:
        message = "no route to host"
        raise OSError(message)

    monkeypatch.setattr(connection, "ensure_connection", _boom)

    response = APIClient().get("/api/health/")

    assert response.status_code == status.HTTP_503_SERVICE_UNAVAILABLE
    assert response.json()["result"]["status"] == "error"
