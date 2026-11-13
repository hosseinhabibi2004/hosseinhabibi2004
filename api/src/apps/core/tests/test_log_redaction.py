"""Secrets are masked before a log handler sees them (plan 08, C4)."""

import logging

import pytest

from src.apps.core.log_filters import MASK, RedactSecretsFilter, redact


@pytest.mark.parametrize(
    "line",
    [
        "login failed password=Demo12345 for 0912",
        'payload {"token": "abc.def.ghi", "phone": "0912"}',
        "Authorization: Bearer abc.def-ghi",
        "refresh_token=eyJhbGciOi cookie set",
        "SECRET_KEY: s3cr3t-value",
    ],
)
def test_a_secret_is_masked(line):
    cleaned = redact(line)
    secrets = (
        "Demo12345",
        "abc.def.ghi",
        "abc.def-ghi",
        "eyJhbGciOi",
        "s3cr3t-value",
    )
    for secret in secrets:
        assert secret not in cleaned
    assert MASK in cleaned


def test_ordinary_text_is_left_alone():
    assert redact("Health check failed: database unreachable") == (
        "Health check failed: database unreachable"
    )


def test_the_filter_rewrites_a_record_and_keeps_it():
    record = logging.LogRecord(
        "x", logging.WARNING, __file__, 1, "bad password=%s", ("hunter2",), None
    )
    assert RedactSecretsFilter().filter(record) is True
    assert "hunter2" not in record.getMessage()


def test_the_console_handler_carries_the_filter():
    from django.conf import settings

    assert "redact_secrets" in settings.LOGGING["handlers"]["console"]["filters"]
