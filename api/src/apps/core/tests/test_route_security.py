"""Every route is closed to someone who is not signed in, unless it is on the
list of routes that are public on purpose."""

import re

import pytest

from drf_spectacular.generators import EndpointEnumerator
from rest_framework.test import APIClient


pytestmark = pytest.mark.django_db

# Open on purpose: the static site's read API, health, the sign-in handshake and
# the API docs. Anything new fails this test until it is put on a list.
PUBLIC_PREFIXES = (
    "/api/public/",
    "/api/health/",
    "/api/auth/csrf/",
    "/api/auth/login/",
    "/api/schema/",
    "/api/docs/",
)
SAFE = {"GET", "HEAD", "OPTIONS"}


def _concrete(path: str) -> str:
    return re.sub(
        r"\{(\w+)\}",
        lambda m: (
            "en" if m.group(1) == "locale" else "00000000-0000-0000-0000-000000000000"
        ),
        path,
    )


def _endpoints() -> list[tuple[str, str]]:
    return [
        (path, method.upper())
        for path, _regex, method, _callback in EndpointEnumerator().get_api_endpoints()
        if method.upper() not in {"HEAD", "OPTIONS"}
    ]


def test_there_are_author_and_public_routes_to_check() -> None:
    paths = {path for path, _ in _endpoints()}

    assert any(p.startswith("/api/author/") for p in paths)
    assert any(p.startswith("/api/public/") for p in paths)


def test_every_route_not_on_the_public_list_answers_403_without_a_session() -> None:
    client = APIClient()
    failures = []
    for path, method in _endpoints():
        if path.startswith(PUBLIC_PREFIXES):
            continue
        status_code = client.generic(method, _concrete(path)).status_code
        if status_code != 403:
            failures.append((method, path, status_code))

    assert failures == []


def test_the_public_list_only_ever_allows_reading_content() -> None:
    for path, method in _endpoints():
        if path.startswith("/api/public/"):
            assert method in SAFE, (method, path)
