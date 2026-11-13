"""A view that does not name its permission is closed, not open."""

import pytest

from django.urls import path
from rest_framework import status
from rest_framework.test import APIClient
from rest_framework.views import APIView, Response


class _Unmarked(APIView):
    def get(self, _request) -> Response:
        return Response({})


urlpatterns = [path("unmarked/", _Unmarked.as_view())]


@pytest.mark.django_db
@pytest.mark.urls("src.apps.core.tests.test_default_permission")
def test_a_view_without_permission_classes_answers_403() -> None:
    response = APIClient().get("/unmarked/")

    assert response.status_code in {
        status.HTTP_401_UNAUTHORIZED,
        status.HTTP_403_FORBIDDEN,
    }
