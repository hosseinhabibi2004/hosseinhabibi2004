from django.apps import AppConfig


class AuthConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "src.apps.auth"
    # `auth` is taken by `django.contrib.auth`.
    label = "app_auth"
