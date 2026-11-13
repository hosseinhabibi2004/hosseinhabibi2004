"""Keeps secrets out of technical logs (plan 08, C4).

A traceback or a warning can carry a password, a bearer token or a refresh
cookie that was in the request or in an exception's text. The filter masks them
in the formatted message before any handler sees it.
"""

import logging
import re


MASK = "[hidden]"
# `password=abc`, `"token": "abc"`, `Authorization: Bearer abc`, `refresh_token=abc`
_PATTERNS = (
    re.compile(
        r"(?i)((?:pass(?:word)?|token|secret|authorization|api[_-]?key|cookie)\w*"
        r"[\"']?\s*[:=]\s*[\"']?)(?:bearer\s+)?[^\s\"',;&}]+"
    ),
    re.compile(r"(?i)(bearer\s+)[A-Za-z0-9._~+/=-]+"),
)


def redact(text: str) -> str:
    for pattern in _PATTERNS:
        text = pattern.sub(lambda match: f"{match.group(1)}{MASK}", text)
    return text


class RedactSecretsFilter(logging.Filter):
    """Rewrites a record's message with secrets masked; never drops a record."""

    def filter(self, record: logging.LogRecord) -> bool:
        record.msg = redact(record.getMessage())
        record.args = None
        if record.exc_text:
            record.exc_text = redact(record.exc_text)
        return True
