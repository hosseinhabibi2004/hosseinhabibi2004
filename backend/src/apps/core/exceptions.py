import re
from typing import TYPE_CHECKING

from django.db import DataError
from rest_framework import exceptions, status
from rest_framework.views import exception_handler

from src.apps.core.api.response_messages import (
    AuthenticationResponseMessages,
    GenericResponseMessage,
    ResponseMessageEnum,
)


if TYPE_CHECKING:
    from rest_framework.response import Response


# A message code a view raised on purpose. Add each new enum's prefix here.
KNOWN_CODED_PATTERN = re.compile(r"^(AUTH_|GENERIC_)")

EXCEPTION_TO_CODE = {
    exceptions.NotAuthenticated: AuthenticationResponseMessages.AUTH_REQUIRED,
    exceptions.PermissionDenied: AuthenticationResponseMessages.AUTH_FORBIDDEN,
    exceptions.Throttled: AuthenticationResponseMessages.AUTH_TOO_MANY_ATTEMPTS,
    exceptions.NotFound: GenericResponseMessage.RESOURCE_NOT_FOUND,
    exceptions.ValidationError: GenericResponseMessage.VALIDATION_ERROR,
}


def _extract_coded_message(value: object) -> ResponseMessageEnum | str | None:
    if isinstance(value, ResponseMessageEnum):
        return value
    if isinstance(value, dict):
        for field_value in value.values():
            extracted = _extract_coded_message(field_value)
            if extracted:
                return extracted
        return None
    if isinstance(value, (list, tuple)):
        for item in value:
            extracted = _extract_coded_message(item)
            if extracted:
                return extracted
        return None
    text = str(value)
    if KNOWN_CODED_PATTERN.match(text):
        return text
    return None


def custom_exception_handler(exc: Exception, context: dict) -> "Response":
    if isinstance(exc, DataError | OverflowError):
        # A number or text too big for its column: the caller's input was
        # invalid, not our code — a 400, not a 500. The surrounding service
        # transaction has already rolled back.
        exc = exceptions.ValidationError(GenericResponseMessage.VALIDATION_ERROR)

    response = exception_handler(exc, context)

    if response is None:
        return response

    if isinstance(exc, exceptions.APIException) and isinstance(
        exc.detail, ResponseMessageEnum
    ):
        code = exc.detail
    else:
        code = getattr(exc, "message", None) or getattr(exc, "detail", None)

    if isinstance(code, dict):
        coded = _extract_coded_message(code)
        if coded:
            code = coded

    if isinstance(code, list) and len(code) == 1:
        potential_code = str(code[0])
        code = potential_code if KNOWN_CODED_PATTERN.match(potential_code) else None
    elif isinstance(code, str) and not KNOWN_CODED_PATTERN.match(code):
        code = None
    elif isinstance(code, ResponseMessageEnum):
        pass

    if not code:
        for exception_type, coded_msg in EXCEPTION_TO_CODE.items():
            if isinstance(exc, exception_type):
                code = coded_msg
                break

    if isinstance(code, dict):
        code = GenericResponseMessage.VALIDATION_ERROR

    if not code:
        if response.status_code == status.HTTP_404_NOT_FOUND:
            code = GenericResponseMessage.RESOURCE_NOT_FOUND
        elif response.status_code == status.HTTP_409_CONFLICT:
            code = GenericResponseMessage.RESOURCE_CONFLICT
        elif status.is_server_error(response.status_code):
            code = GenericResponseMessage.SYSTEM_ERROR
        elif status.is_client_error(response.status_code):
            code = GenericResponseMessage.GENERIC_FAILED
        else:
            code = GenericResponseMessage.GENERIC_OK

    error_detail = None
    if isinstance(exc, exceptions.ValidationError):
        if not code or (isinstance(code, str) and not KNOWN_CODED_PATTERN.match(code)):
            code = GenericResponseMessage.VALIDATION_ERROR

        if isinstance(exc.detail, dict):
            error_detail = exc.detail
        elif isinstance(exc.detail, list):
            filtered_detail = [
                item
                for item in exc.detail
                if not (isinstance(item, str) and KNOWN_CODED_PATTERN.match(item))
            ]
            if filtered_detail:
                error_detail = {"non_field_errors": filtered_detail}

    if error_detail is None:
        error_detail = getattr(exc, "error_detail", None)
    if error_detail is not None and not isinstance(error_detail, dict):
        error_detail = None

    payload = {"detail": code}
    if error_detail:
        payload["error_detail"] = error_detail

    response.data = payload
    return response
