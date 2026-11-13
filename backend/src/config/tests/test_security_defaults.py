"""The HTTPS/cookie hardening settings default off `DEBUG`, never hardcoded.

`_security_defaults` is tested directly (pure function, both `DEBUG` states)
rather than by reimporting `settings` with a patched environment.
"""

import pytest

from django.test import override_settings
from rest_framework.test import APIClient

from src.config.settings import _security_defaults


class TestSecurityDefaults:
    def test_debug_true_disables_every_https_only_setting(self) -> None:
        defaults = _security_defaults(debug=True)

        assert defaults["SECURE_SSL_REDIRECT"] is False
        assert defaults["SECURE_HSTS_SECONDS"] == 0
        assert defaults["SECURE_HSTS_INCLUDE_SUBDOMAINS"] is False
        assert defaults["SESSION_COOKIE_SECURE"] is False
        assert defaults["CSRF_COOKIE_SECURE"] is False

    def test_debug_false_enables_every_https_only_setting(self) -> None:
        defaults = _security_defaults(debug=False)

        assert defaults["SECURE_SSL_REDIRECT"] is True
        assert defaults["SECURE_HSTS_SECONDS"] > 0
        assert defaults["SECURE_HSTS_INCLUDE_SUBDOMAINS"] is True
        assert defaults["SESSION_COOKIE_SECURE"] is True
        assert defaults["CSRF_COOKIE_SECURE"] is True

    def test_hsts_preload_never_defaults_on(self) -> None:
        """Preloading with a broken certificate locks out the domain for
        months — turning it on is a deliberate human step, never a default."""
        assert _security_defaults(debug=True)["SECURE_HSTS_PRELOAD"] is False
        assert _security_defaults(debug=False)["SECURE_HSTS_PRELOAD"] is False

    def test_content_type_and_frame_hardening_are_unconditional(self) -> None:
        for debug in (True, False):
            defaults = _security_defaults(debug=debug)
            assert defaults["SECURE_CONTENT_TYPE_NOSNIFF"] is True
            assert defaults["X_FRAME_OPTIONS"] == "DENY"


@pytest.mark.django_db
class TestSslRedirectExemption:
    """Healthchecks call `/api/health/` over plain HTTP with no
    `X-Forwarded-Proto`, so that path alone is exempt from the HTTPS redirect."""

    @override_settings(SECURE_SSL_REDIRECT=True)
    def test_health_is_not_redirected_to_https(self) -> None:
        assert APIClient().get("/api/health/").status_code == 200

    @override_settings(SECURE_SSL_REDIRECT=True)
    def test_other_paths_are_still_redirected(self) -> None:
        response = APIClient().get("/api/schema/")

        assert response.status_code == 301
        assert response["Location"].startswith("https://")
