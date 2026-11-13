"""The OpenAPI document generates (the frontend SDK is generated from it)."""

import json

import pytest

from django.test import override_settings
from rest_framework.test import APIClient


pytestmark = pytest.mark.django_db


def test_the_schema_generates() -> None:
    response = APIClient().get(
        "/api/schema/",
        {"format": "json"},
        HTTP_ACCEPT="application/vnd.oai.openapi+json",
    )

    assert response.status_code == 200
    assert json.loads(response.content)["openapi"].startswith("3.")


@override_settings(API_DOCS_ENABLED=False)
def test_the_schema_is_a_404_when_docs_are_off() -> None:
    assert APIClient().get("/api/schema/").status_code == 404


def test_every_success_response_documents_the_envelope() -> None:
    response = APIClient().get(
        "/api/schema/",
        {"format": "json"},
        HTTP_ACCEPT="application/vnd.oai.openapi+json",
    )
    schema = json.loads(response.content)

    login = schema["paths"]["/api/auth/login/"]["post"]["responses"]["200"]
    body = login["content"]["application/json"]["schema"]
    assert set(body["required"]) == {"success", "message", "result"}
    assert body["properties"]["result"]["$ref"].endswith("SessionResult")


def _operations() -> list[tuple[str, str, dict]]:
    response = APIClient().get(
        "/api/schema/",
        {"format": "json"},
        HTTP_ACCEPT="application/vnd.oai.openapi+json",
    )
    schema = json.loads(response.content)
    return [
        (path, method, operation)
        for path, item in schema["paths"].items()
        for method, operation in item.items()
        if method in {"get", "post", "put", "patch", "delete"}
    ]


def test_operations_are_tagged_by_surface_and_both_surfaces_exist() -> None:
    operations = _operations()
    tags = {tag for _, _, op in operations for tag in op.get("tags", [])}

    assert {"Public", "Author", "Auth"} <= tags
    for path, _method, op in operations:
        assert set(op["tags"]) & {"Public", "Author", "Auth"}, path


def test_public_operations_are_reads_under_api_public() -> None:
    public = [(p, m) for p, m, op in _operations() if "Public" in op.get("tags", [])]

    assert public
    assert all(p.startswith("/api/public/") and m == "get" for p, m in public)


def test_author_operations_live_under_api_author() -> None:
    author = [p for p, _m, op in _operations() if "Author" in op.get("tags", [])]

    assert author
    assert all(p.startswith("/api/author/") for p in author)
