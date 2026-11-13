import pytest

from rest_framework.test import APIClient


@pytest.fixture
def api_client() -> APIClient:
    return APIClient()


@pytest.fixture
def csrf_client() -> APIClient:
    """A client that, like a browser, is held to the CSRF check."""
    return APIClient(enforce_csrf_checks=True)
