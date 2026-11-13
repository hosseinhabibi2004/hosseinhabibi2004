from enum import Enum
from typing import Self

from django.utils.translation import gettext_lazy as _


class ResponseMessageEnum(Enum):
    def __new__(cls, code: str, message: str) -> Self:
        obj = object.__new__(cls)
        obj._value_ = code
        obj.code = code
        obj.message = _(message)
        return obj

    def __str__(self) -> str:
        return self.code

    def __repr__(self) -> str:
        return f"<{self.__class__.__name__}.{self.name}: {self.code}>"


class GenericResponseMessage(ResponseMessageEnum):
    GENERIC_OK = ("GENERIC_001", "Success")
    GENERIC_FAILED = ("GENERIC_002", "Failed")
    GENERIC_CREATED = ("GENERIC_003", "Resource created successfully.")
    VALIDATION_ERROR = ("GENERIC_004", "Validation error.")
    RESOURCE_NOT_FOUND = ("GENERIC_005", "Resource not found.")
    RESOURCE_CONFLICT = ("GENERIC_006", "Resource conflict.")
    SYSTEM_ERROR = ("GENERIC_007", "Internal server error.")


class AuthenticationResponseMessages(ResponseMessageEnum):
    AUTH_LOGIN_SUCCESS = ("AUTH_001", "Logged in successfully.")
    AUTH_INVALID_CREDENTIALS = ("AUTH_002", "Invalid username or password.")
    AUTH_SESSION_REVOKED = ("AUTH_031", "Logged out successfully.")
    AUTH_REQUIRED = ("AUTH_041", "Authentication required.")
    AUTH_FORBIDDEN = ("AUTH_042", "You do not have permission to perform this action.")
    AUTH_TOO_MANY_ATTEMPTS = (
        "AUTH_004",
        "Too many requests. Please wait before trying again.",
    )


# Every enum a response may carry, searched by `find_message_enum`. Add each new
# enum class here when a feature introduces one.
_ALL_ENUMS: list[type[ResponseMessageEnum]] = [
    GenericResponseMessage,
    AuthenticationResponseMessages,
]


def find_message_enum(code: str) -> ResponseMessageEnum | None:
    for enum_class in _ALL_ENUMS:
        for member in enum_class:
            if member.code == code or str(member) == code:
                return member
    return None
