from pathlib import Path
from urllib.parse import unquote, urlparse

from corsheaders.defaults import default_headers
from decouple import Csv, config
from dotenv import load_dotenv


# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent
ROOT_DIR = BASE_DIR.parent

ENV_FILE = ROOT_DIR / ".env"


load_dotenv(ENV_FILE)


# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = config("SECRET_KEY", default="")

if not SECRET_KEY:
    import secrets

    SECRET_KEY = secrets.token_urlsafe(50)
    with ENV_FILE.open("a") as env_file:
        env_file.write(f'\nSECRET_KEY="{SECRET_KEY}"')

    import logging

    logger = logging.getLogger(__name__)
    logger.warning("WARNING: SECRET_KEY not set! Generated and saved to .env.")

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = config("DEBUG", cast=bool, default=False)

ALLOWED_HOSTS = config("ALLOWED_HOSTS", cast=Csv(), default="localhost,127.0.0.1")


# Application definition

INSTALLED_APPS = [
    "src.apps.users",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.staticfiles",
    # Third Party
    "corsheaders",
    "rest_framework",
    "drf_spectacular",
    # Apps
    "src.apps.core",
    "src.apps.auth",
    "src.apps.content",
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "corsheaders.middleware.CorsMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "src.config.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.template.context_processors.csrf",
                "django.contrib.auth.context_processors.auth",
            ],
        },
    },
]

WSGI_APPLICATION = "src.config.wsgi.application"


# Database
# https://docs.djangoproject.com/en/5.1/ref/settings/#databases

# SQLite by default: the API runs on the author's machine and the content is
# one file to back up. `DATABASE_URL=postgres://user:pass@host:5432/name`
# switches to PostgreSQL with no code change.
DATABASE_URL = config("DATABASE_URL", default="")
if DATABASE_URL:
    _db = urlparse(DATABASE_URL)
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.postgresql",
            "HOST": _db.hostname,
            "PORT": _db.port or 5432,
            "NAME": _db.path.lstrip("/"),
            "USER": unquote(_db.username or ""),
            "PASSWORD": unquote(_db.password or ""),
            "CONN_MAX_AGE": 0 if DEBUG else 600,
            "OPTIONS": {"connect_timeout": 10},
        }
    }
else:
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.sqlite3",
            "NAME": ROOT_DIR / "db.sqlite3",
        }
    }


# Password validation
# https://docs.djangoproject.com/en/5.1/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        "NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator",  # noqa: E501
    },
    {
        "NAME": "django.contrib.auth.password_validation.MinimumLengthValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.CommonPasswordValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.NumericPasswordValidator",
    },
]


# Internationalization
# https://docs.djangoproject.com/en/5.1/topics/i18n/

LANGUAGE_CODE = config("LANGUAGE_CODE", default="en")
LANGUAGES = [
    ("en", "English"),
    ("fa", "فارسی"),
]

TIME_ZONE = config("TIME_ZONE", default="Asia/Tehran")

USE_I18N = True

USE_TZ = True


# Static files. Nothing here is served to the public: the public site is the
# static export.
STATIC_URL = "/static/"
STATIC_ROOT = ROOT_DIR / "staticfiles"
STATICFILES_DIRS = [
    BASE_DIR / "static",
]

# Uploaded media (post images, covers) lives next to the database, outside git.
MEDIA_URL = "/media/"
MEDIA_ROOT = ROOT_DIR / "media"

# Image uploads: the byte size and the longest side an uploaded picture may have.
IMAGE_MAX_BYTES = config("IMAGE_MAX_BYTES", cast=int, default=5 * 1024 * 1024)
IMAGE_MAX_SIDE = config("IMAGE_MAX_SIDE", cast=int, default=4000)

STORAGES = {
    "default": {
        "BACKEND": "django.core.files.storage.FileSystemStorage",
    },
    "staticfiles": {
        "BACKEND": "django.contrib.staticfiles.storage.StaticFilesStorage",
    },
}

# Default primary key field type
# https://docs.djangoproject.com/en/5.1/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

AUTH_USER_MODEL = "users.User"


# How many reverse proxies sit in front of Django: the client's IP is the
# `X-Forwarded-For` entry that many hops from the right. Zero when the API is
# reached directly on localhost.
TRUSTED_PROXY_COUNT = config("TRUSTED_PROXY_COUNT", cast=int, default=0)

# Rest Framework
REST_FRAMEWORK = {
    "EXCEPTION_HANDLER": "src.apps.core.exceptions.custom_exception_handler",
    # Fail closed: a view that forgets `permission_classes` answers 403, never
    # public. The static site reads the public content endpoints, and each of
    # those names `AllowAny` on purpose.
    "DEFAULT_PERMISSION_CLASSES": ["src.apps.core.permissions.DenyAll"],
    "NUM_PROXIES": TRUSTED_PROXY_COUNT,
    "DEFAULT_RENDERER_CLASSES": [
        "src.apps.core.renderers.BaseJSONRenderer",
    ],
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework.authentication.SessionAuthentication",
    ],
    "DEFAULT_PAGINATION_CLASS": "rest_framework.pagination.PageNumberPagination",
    "PAGE_SIZE": 20,
    "DEFAULT_SCHEMA_CLASS": "drf_spectacular.openapi.AutoSchema",
    "DEFAULT_THROTTLE_RATES": {
        # Per-IP cap on password sign-ins.
        "login": config("LOGIN_THROTTLE_RATE", default="30/minute"),
    },
}

# Serve `/api/schema/` and `/api/docs/`: on for development, off otherwise
# unless asked for.
API_DOCS_ENABLED = config("API_DOCS_ENABLED", cast=bool, default=DEBUG)

SPECTACULAR_SETTINGS = {
    "TITLE": "API",
    "DESCRIPTION": "Content API read by the static site at build time",
    "VERSION": "1.0.0",
    "SERVE_INCLUDE_SCHEMA": False,
    "COMPONENT_SPLIT_REQUEST": True,
    # Name enums that would otherwise collide (several models can have a
    # `kind` or `status`) so the generated SDK gets stable names. Add them here
    # as models appear.
    "ENUM_NAME_OVERRIDES": {},
    "POSTPROCESSING_HOOKS": [
        "drf_spectacular.hooks.postprocess_schema_enums",
        # Documents the `{success, message, result, meta}` envelope last, so the
        # enum hook still sees the bare serializers.
        "src.apps.core.api.schema.wrap_in_envelope",
    ],
}

# CORS Configuration. Only matters when a browser calls the API cross-origin
# (the Next.js dev server on :3000 reading this process on :8000).
CORS_ALLOWED_ORIGINS = config("CORS_ALLOWED_ORIGINS", cast=Csv(), default="")
CORS_ALLOW_ALL_ORIGINS = config("CORS_ALLOW_ALL_ORIGINS", cast=bool, default=False)
CORS_ALLOW_CREDENTIALS = True
CORS_ALLOW_HEADERS = (*default_headers,)

# CSRF Configuration
CSRF_TRUSTED_ORIGINS = config("CSRF_TRUSTED_ORIGINS", cast=Csv(), default="")


# HTTPS / cookie hardening. Everything here defaults off `not DEBUG`, so local
# development never sees a `Secure` cookie or an HTTP->HTTPS redirect it cannot
# satisfy on `localhost`. An env var still overrides any one of them for a
# deployment that needs to differ.
#
# `SECURE_HSTS_PRELOAD` is the one exception: it never defaults on, in either
# environment. Submitting a domain to the HSTS preload list is a one-way
# door — turning it on is a deliberate step a human takes once TLS has been
# stable in production, not a default this file should ever flip for them.
def _security_defaults(*, debug: bool) -> dict:
    return {
        "SECURE_SSL_REDIRECT": not debug,
        # Start small and ramp up once TLS is confirmed stable.
        "SECURE_HSTS_SECONDS": 0 if debug else 60,
        "SECURE_HSTS_INCLUDE_SUBDOMAINS": not debug,
        "SECURE_HSTS_PRELOAD": False,
        "SESSION_COOKIE_SECURE": not debug,
        "CSRF_COOKIE_SECURE": not debug,
        # No downside locally — unconditional rather than `DEBUG`-gated.
        "SECURE_CONTENT_TYPE_NOSNIFF": True,
        "X_FRAME_OPTIONS": "DENY",
    }


_SECURITY_DEFAULTS = _security_defaults(debug=DEBUG)

# Tells Django the request arrived over HTTPS when the proxy says so — without
# it, `SECURE_SSL_REDIRECT` loops forever behind a TLS-terminating proxy.
SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
SECURE_SSL_REDIRECT = config(
    "SECURE_SSL_REDIRECT", cast=bool, default=_SECURITY_DEFAULTS["SECURE_SSL_REDIRECT"]
)
# Healthchecks call `/api/health/` over plain HTTP with no `X-Forwarded-Proto`;
# redirecting them to HTTPS would fail every check. Django matches these against
# the path with its leading `/` stripped.
SECURE_REDIRECT_EXEMPT = [r"^api/health/$"]
SECURE_HSTS_SECONDS = config(
    "SECURE_HSTS_SECONDS", cast=int, default=_SECURITY_DEFAULTS["SECURE_HSTS_SECONDS"]
)
SECURE_HSTS_INCLUDE_SUBDOMAINS = config(
    "SECURE_HSTS_INCLUDE_SUBDOMAINS",
    cast=bool,
    default=_SECURITY_DEFAULTS["SECURE_HSTS_INCLUDE_SUBDOMAINS"],
)
SECURE_HSTS_PRELOAD = config(
    "SECURE_HSTS_PRELOAD", cast=bool, default=_SECURITY_DEFAULTS["SECURE_HSTS_PRELOAD"]
)
SESSION_COOKIE_SECURE = config(
    "SESSION_COOKIE_SECURE",
    cast=bool,
    default=_SECURITY_DEFAULTS["SESSION_COOKIE_SECURE"],
)
CSRF_COOKIE_SECURE = config(
    "CSRF_COOKIE_SECURE", cast=bool, default=_SECURITY_DEFAULTS["CSRF_COOKIE_SECURE"]
)
SECURE_CONTENT_TYPE_NOSNIFF = config(
    "SECURE_CONTENT_TYPE_NOSNIFF",
    cast=bool,
    default=_SECURITY_DEFAULTS["SECURE_CONTENT_TYPE_NOSNIFF"],
)
X_FRAME_OPTIONS = config(
    "X_FRAME_OPTIONS", default=_SECURITY_DEFAULTS["X_FRAME_OPTIONS"]
)


# Browser-facing origin of the Next.js app and of this Django process.
FRONTEND_ORIGIN = config("FRONTEND_ORIGIN", default="http://localhost:3000")
BACKEND_ORIGIN = config("BACKEND_ORIGIN", default="http://localhost:8000")

# Structured logging to stdout. `WARNING` in production, `INFO` locally, either
# overridable for a one-off deep-dive.
LOG_LEVEL = config("LOG_LEVEL", default="INFO" if DEBUG else "WARNING")

LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "filters": {
        # Secrets in a message or traceback never reach a log line.
        "redact_secrets": {"()": "src.apps.core.log_filters.RedactSecretsFilter"},
    },
    "formatters": {
        "structured": {
            "format": "%(asctime)s %(levelname)s %(name)s: %(message)s",
        },
    },
    "handlers": {
        "console": {
            "class": "logging.StreamHandler",
            "formatter": "structured",
            "filters": ["redact_secrets"],
        },
    },
    "root": {
        "handlers": ["console"],
        "level": LOG_LEVEL,
    },
    "loggers": {
        # Django logs a full traceback for every 500 at this logger — worth
        # keeping even if LOG_LEVEL is raised past it elsewhere.
        "django.request": {
            "handlers": ["console"],
            "level": "ERROR",
            "propagate": False,
        },
    },
}
