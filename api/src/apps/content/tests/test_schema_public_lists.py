"""The Public OpenAPI document types list endpoints as arrays (the generated SDK
reads `result` as a list) and keeps detail endpoints as single objects."""

import json

import pytest

from rest_framework.test import APIClient


pytestmark = pytest.mark.django_db

LISTS = ["posts", "projects", "tags", "skills", "experience", "education"]
DETAILS = ["posts/{slug}", "projects/{slug}", "profile"]


@pytest.fixture(scope="module")
def schema(django_db_setup, django_db_blocker):
    with django_db_blocker.unblock():
        response = APIClient().get(
            "/api/schema/public/",
            {"format": "json"},
            HTTP_ACCEPT="application/vnd.oai.openapi+json",
        )
    return json.loads(response.content)


def _result(schema: dict, path: str) -> dict:
    operation = schema["paths"][f"/api/public/{{locale}}/{path}/"]["get"]
    envelope = operation["responses"]["200"]["content"]["application/json"]["schema"]
    return envelope["properties"]["result"]


@pytest.mark.parametrize("kind", LISTS)
def test_a_public_list_documents_result_as_an_array(schema, kind: str) -> None:
    result = _result(schema, kind)

    assert result["type"] == "array"
    assert result["items"]


@pytest.mark.parametrize("path", DETAILS)
def test_a_public_detail_documents_result_as_an_object(schema, path: str) -> None:
    result = _result(schema, path)

    assert result.get("type") != "array"
    assert "items" not in result
