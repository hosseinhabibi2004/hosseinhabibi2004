"""Session sign-in for the author's local admin app.

The admin app and this API run on the same machine and the same site
(`localhost`), so the browser keeps a session cookie and the app sends the CSRF
token back in `X-CSRFToken`: `GET csrf/` first, then `POST login/`.
"""

from typing import TYPE_CHECKING, ClassVar

from django.contrib.auth import authenticate, login, logout
from django.middleware.csrf import get_token
from drf_spectacular.utils import OpenApiResponse, extend_schema
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.views import APIView

from src.apps.auth.api.exceptions import InvalidCredentialsError
from src.apps.auth.api.serializers import (
    CsrfResultSerializer,
    LoginSerializer,
    SessionResultSerializer,
    UserSerializer,
)
from src.apps.core.api.response_messages import AuthenticationResponseMessages


if TYPE_CHECKING:
    from rest_framework.request import Request


class CsrfView(APIView):
    """Hands the browser a CSRF token (and sets the CSRF cookie)."""

    permission_classes = (permissions.AllowAny,)
    authentication_classes: ClassVar = []

    @extend_schema(
        operation_id="authCsrf",
        tags=["Auth"],
        summary="Get a CSRF token",
        responses={status.HTTP_200_OK: CsrfResultSerializer},
    )
    def get(self, request: "Request") -> Response:
        return Response({"csrf_token": get_token(request._request)})  # noqa: SLF001


class LoginView(APIView):
    permission_classes = (permissions.AllowAny,)
    # No session authentication here: nobody is signed in yet, so there is no
    # session for a forged request to ride on. The password is the credential.
    authentication_classes: ClassVar = []
    throttle_classes = (ScopedRateThrottle,)
    throttle_scope = "login"

    @extend_schema(
        operation_id="authLogin",
        tags=["Auth"],
        summary="Sign in",
        request=LoginSerializer,
        responses={
            status.HTTP_200_OK: OpenApiResponse(
                response=SessionResultSerializer, description="Signed in."
            ),
            status.HTTP_401_UNAUTHORIZED: OpenApiResponse(
                description="Invalid username or password."
            ),
        },
    )
    def post(self, request: "Request") -> Response:
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = authenticate(
            request._request,  # noqa: SLF001
            username=serializer.validated_data["username"],
            password=serializer.validated_data["password"],
        )
        if user is None:
            raise InvalidCredentialsError
        login(request._request, user)  # noqa: SLF001
        return Response(
            {
                "csrf_token": get_token(request._request),  # noqa: SLF001
                "user": UserSerializer(user).data,
                "message": AuthenticationResponseMessages.AUTH_LOGIN_SUCCESS,
            }
        )


class LogoutView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    @extend_schema(
        operation_id="authLogout",
        tags=["Auth"],
        summary="Sign out",
        request=None,
        responses={status.HTTP_200_OK: OpenApiResponse(description="Signed out.")},
    )
    def post(self, request: "Request") -> Response:
        logout(request._request)  # noqa: SLF001
        return Response(
            {"message": AuthenticationResponseMessages.AUTH_SESSION_REVOKED}
        )


class MeView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    @extend_schema(
        operation_id="authMe",
        tags=["Auth"],
        summary="The signed-in account",
        responses={status.HTTP_200_OK: UserSerializer},
    )
    def get(self, request: "Request") -> Response:
        return Response(UserSerializer(request.user).data)
