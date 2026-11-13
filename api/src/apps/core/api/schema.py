"""OpenAPI post-processing: document the response envelope and optional parameters.

`BaseJSONRenderer` wraps every response in `{success, message, result, meta}`,
but a view's serializer describes only `result`. Without this hook the generated
SDK would type a response as the bare payload and be wrong at runtime.
"""

from typing import Any


def _envelope(result_schema: dict[str, Any]) -> dict[str, Any]:
    return {
        "type": "object",
        "properties": {
            "success": {"type": "boolean"},
            "message": {"type": "string"},
            # Only present while DEBUG is on.
            "details": {"type": "string"},
            "result": result_schema,
            "meta": {"type": "object", "nullable": True, "additionalProperties": True},
        },
        "required": ["success", "message", "result"],
    }


def wrap_in_envelope(result: dict[str, Any], **_kwargs: object) -> dict[str, Any]:
    for path_item in result.get("paths", {}).values():
        for operation in path_item.values():
            if not isinstance(operation, dict):
                continue
            # Say "optional" out loud: some parameters leave `required` out.
            for parameter in operation.get("parameters", []):
                parameter.setdefault("required", False)
            for code, response in operation.get("responses", {}).items():
                if not str(code).startswith("2"):
                    continue
                content = response.setdefault("content", {})
                if not content:
                    content["application/json"] = {"schema": {"type": "object"}}
                for media in content.values():
                    media["schema"] = _envelope(
                        media.get("schema") or {"type": "object"}
                    )
    return result
