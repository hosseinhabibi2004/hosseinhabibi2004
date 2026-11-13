"""One Django process serves everything under `/api/`. There is no Django admin:
the author writes content through the project's own admin screens, which call
this API. The public site is a static export and never talks to this process at
runtime: it reads `/api/` once, at build time."""

from django.conf import settings
from django.conf.urls.static import static
from django.urls import include, path

from src.apps.core.views import HealthCheckView, SchemaView, SwaggerView


urlpatterns = [
    path("api/health/", HealthCheckView.as_view(), name="health"),
    path("api/auth/", include("src.apps.auth.api.urls")),
    path("api/schema/", SchemaView.as_view(), name="schema"),
    path("api/docs/", SwaggerView.as_view(), name="docs"),
    *static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT),
]
