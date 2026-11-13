"""The Author API's routes alone (sign-in included), for the admin app's SDK."""

from django.urls import include, path


urlpatterns = [
    path("api/auth/", include("src.apps.auth.api.urls")),
    path("api/author/", include("src.apps.content.api.author_urls")),
]
