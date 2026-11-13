"""The Public API's routes alone, so its OpenAPI document (and the public site's
SDK) can be generated without any Author operation in it."""

from django.urls import include, path


urlpatterns = [
    path("api/public/", include("src.apps.content.api.public_urls")),
]
