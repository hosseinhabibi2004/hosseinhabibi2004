"""The Profile cannot hold a phone number, so it cannot reach the static site."""

import pytest

from src.apps.content.models import Profile, ProfileLink, ProfileTranslation


pytestmark = pytest.mark.django_db


@pytest.mark.parametrize("model", [Profile, ProfileTranslation, ProfileLink])
def test_no_profile_model_has_a_phone_field(model) -> None:
    names = {field.name for field in model._meta.get_fields()}

    assert not any("phone" in name or "mobile" in name for name in names)


def test_the_public_profile_payload_has_exactly_these_keys(public_client) -> None:
    profile = Profile.objects.create(email="me@example.com")
    ProfileTranslation.objects.create(
        profile=profile,
        locale="en",
        name="Hossein",
        headline="Engineer",
        summary="Hi",
        location="Tabriz",
    )
    ProfileLink.objects.create(
        profile=profile, kind="github", url="https://github.com/x", position=0
    )

    response = public_client.get("/api/public/en/profile/")

    assert response.status_code == 200
    assert set(response.json()["result"]) == {
        "name",
        "headline",
        "summary",
        "location",
        "email",
        "avatar",
        "links",
    }
    assert set(response.json()["result"]["links"][0]) == {"kind", "url"}
