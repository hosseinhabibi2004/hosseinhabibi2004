import logging
from types import MappingProxyType
from typing import ClassVar

from django.conf import settings
from django.db import DatabaseError, connection
from django.http import HttpResponseNotFound
from drf_spectacular.utils import extend_schema
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.views import APIView, Request, Response


logger = logging.getLogger(__name__)


class HealthCheckView(APIView):
    """What a healthcheck or an uptime monitor polls.

    Checks the database because that is the failure mode otherwise noticed too
    late. Not authenticated — a monitor has no credential to offer, and there is
    nothing here worth protecting. Left out of the OpenAPI schema: it is an
    operations probe, not something the SDK should call.
    """

    permission_classes = (AllowAny,)
    authentication_classes: ClassVar = []
    http_method_names: ClassVar = ["get", "head", "options"]

    @extend_schema(exclude=True)
    def get(self, _request: Request) -> Response:
        try:
            connection.ensure_connection()
        except (DatabaseError, OSError) as error:
            logger.warning("Health check failed: database unreachable", exc_info=error)
            return Response(
                {"status": "error"}, status=status.HTTP_503_SERVICE_UNAVAILABLE
            )
        return Response({"status": "ok"})


class DocsGateMixin:
    """The OpenAPI document and Swagger page exist only while
    `API_DOCS_ENABLED` is on (default: `DEBUG`); otherwise a plain 404 — before
    any renderer or permission runs, so nothing advertises the API surface."""

    def dispatch(self, request, *args, **kwargs):  # noqa: ANN001, ANN002, ANN003, ANN201
        if not settings.API_DOCS_ENABLED:
            return HttpResponseNotFound()
        return super().dispatch(request, *args, **kwargs)  # ty: ignore[missing-attribute]


class SchemaView(DocsGateMixin, SpectacularAPIView):
    """The OpenAPI document the frontend SDK is generated from."""

    custom_settings = MappingProxyType({"TITLE": "Backend API"})


class PublicSchemaView(DocsGateMixin, SpectacularAPIView):
    """The Public API's document: the public site's SDK is generated from it."""

    urlconf = "src.config.urls.public"
    custom_settings = MappingProxyType({"TITLE": "Public API"})


class AuthorSchemaView(DocsGateMixin, SpectacularAPIView):
    """The Author API's document (sign-in included): the admin app's SDK."""

    urlconf = "src.config.urls.author"
    custom_settings = MappingProxyType({"TITLE": "Author API"})


class SwaggerView(DocsGateMixin, SpectacularSwaggerView):
    url_name = "schema"
