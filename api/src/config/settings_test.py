from src.config.settings import *  # noqa: F403


# A test-only app with a parent and a child model for the soft-delete tests.
INSTALLED_APPS = [
    *INSTALLED_APPS,  # noqa: F405
    "src.apps.core.tests.softdelete_app",
]


DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": ":memory:",
    }
}

CACHES = {
    "default": {
        "BACKEND": "django.core.cache.backends.locmem.LocMemCache",
    }
}

# Tests talk to the app over plain HTTP; without `DEBUG` the production default
# would answer every request with a redirect to HTTPS.
SECURE_SSL_REDIRECT = False

PASSWORD_HASHERS = ["django.contrib.auth.hashers.MD5PasswordHasher"]

STORAGES = {
    "default": {
        "BACKEND": "django.core.files.storage.FileSystemStorage",
    },
    "staticfiles": {
        "BACKEND": "django.contrib.staticfiles.storage.StaticFilesStorage",
    },
}

# The schema and docs views are open under test (`DocsGateMixin` reads this).
API_DOCS_ENABLED = True
TRUSTED_PROXY_COUNT = 0

# The per-IP sign-in cap is exercised on its own; keep it out of the way of the
# rest.
REST_FRAMEWORK = {
    **REST_FRAMEWORK,  # noqa: F405
    "DEFAULT_THROTTLE_RATES": {"login": "1000/minute"},
}
