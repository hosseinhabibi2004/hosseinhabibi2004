"""One Django process serves everything under `/api/`. There is no Django admin:
the author writes content through the project's own admin screens, which call
this API. The public site is a static export and never talks to this process at
runtime: it reads `/api/public/` once, at build time.

`public` and `author` hold the two surfaces' routes on their own so each gets
its own OpenAPI document (`/api/schema/public/`, `/api/schema/author/`)."""

from django.conf import settings
from django.conf.urls.static import static
from django.urls import path

from src.apps.core.views import (
    AuthorSchemaView,
    HealthCheckView,
    PublicSchemaView,
    SchemaView,
    SwaggerView,
)
from src.config.urls import author, public


urlpatterns = [
    path("api/health/", HealthCheckView.as_view(), name="health"),
    *author.urlpatterns,
    *public.urlpatterns,
    path("api/schema/", SchemaView.as_view(), name="schema"),
    path("api/schema/public/", PublicSchemaView.as_view(), name="schema-public"),
    path("api/schema/author/", AuthorSchemaView.as_view(), name="schema-author"),
    path("api/docs/", SwaggerView.as_view(), name="docs"),
    *static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT),
]
