from rest_framework import status
from rest_framework.exceptions import APIException

from src.apps.core.api.response_messages import AuthenticationResponseMessages


class InvalidCredentialsError(APIException):
    status_code = status.HTTP_401_UNAUTHORIZED
    default_detail = AuthenticationResponseMessages.AUTH_INVALID_CREDENTIALS
    default_code = "invalid_credentials"
