import copy

from django.conf import settings
from rest_framework import status
from rest_framework.renderers import JSONRenderer

from src.apps.core.api.response_messages import (
    GenericResponseMessage,
    ResponseMessageEnum,
    find_message_enum,
)


class BaseJSONRenderer(JSONRenderer):
    def render(
        self,
        data: dict | None,
        accepted_media_type: str | None = None,
        renderer_context: dict | None = None,
    ) -> bytes:
        response = renderer_context["response"]
        response_data = copy.deepcopy(data)
        modified_data = {}

        if isinstance(response_data, list):
            response_data = {"result": response_data}

        original_message = response_data.pop("message", "")

        if "detail" in response_data:
            original_message = response_data.pop("detail")
        elif "non_field_errors" in response_data:
            original_message = "\n".join(response_data.pop("non_field_errors"))

        if status.is_client_error(response.status_code) or status.is_server_error(
            response.status_code
        ):
            modified_data["success"] = False
            if not original_message:
                original_message = GenericResponseMessage.GENERIC_FAILED
        else:
            modified_data["success"] = response_data.pop("success", True)
            if not original_message:
                original_message = GenericResponseMessage.GENERIC_OK

        message_code = (
            original_message
            if isinstance(original_message, ResponseMessageEnum)
            else find_message_enum(str(original_message))
        )
        if not message_code:
            error_msg = (
                f"Message '{original_message}' is not registered. "
                "Please add it to src/apps/core/api/response_messages.py"
            )
            raise ValueError(error_msg)

        modified_data["message"] = str(message_code)

        if settings.DEBUG and message_code:
            modified_data["details"] = message_code.message

        modified_data["result"] = response_data.pop("result", response_data)
        modified_data["meta"] = response_data.pop("meta", None)

        return super().render(modified_data, accepted_media_type, renderer_context)
