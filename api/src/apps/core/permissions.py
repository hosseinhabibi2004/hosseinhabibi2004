"""Permission classes that need nothing from the account apps.

Imported by DRF while it loads its own settings, so this module must not import
`rest_framework.views` (a circular import): the types are for the checker only.
"""

from typing import TYPE_CHECKING

from rest_framework.permissions import BasePermission


if TYPE_CHECKING:
    from rest_framework.request import Request
    from rest_framework.views import APIView


class DenyAll(BasePermission):
    """The project default (`DEFAULT_PERMISSION_CLASSES`): a view that does not
    name its permission is closed, not open (ADR 0097)."""

    def has_permission(self, request: "Request", view: "APIView") -> bool:  # noqa: ARG002
        return False
