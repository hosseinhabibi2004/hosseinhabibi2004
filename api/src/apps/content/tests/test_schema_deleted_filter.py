"""The Author lists' `?deleted=true` filter is part of the OpenAPI document, so
the admin app's SDK can call it without a hand-written request."""

import json

import pytest

from rest_framework.test import APIClient


pytestmark = pytest.mark.django_db

COLLECTIONS = [
    "posts",
    "tags",
    "projects",
    "skill-groups",
    "experience",
    "education",
    "images",
]


@pytest.fixture(scope="module")
def schema(django_db_setup, django_db_blocker):
    with django_db_blocker.unblock():
        response = APIClient().get(
            "/api/schema/author/",
            {"format": "json"},
            HTTP_ACCEPT="application/vnd.oai.openapi+json",
        )
    return json.loads(response.content)


@pytest.mark.parametrize("kind", COLLECTIONS)
def test_an_author_list_documents_an_optional_boolean_deleted_parameter(
    schema, kind: str
) -> None:
    operation = schema["paths"][f"/api/author/{kind}/"]["get"]
    parameters = {p["name"]: p for p in operation["parameters"]}

    assert "deleted" in parameters
    assert parameters["deleted"]["in"] == "query"
    assert parameters["deleted"]["required"] is False
    assert parameters["deleted"]["schema"]["type"] == "boolean"
