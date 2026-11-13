"""The project is only the apps it uses."""

from django.apps import apps


def test_the_project_apps_are_exactly_the_kept_ones():
    labels = {
        config.label
        for config in apps.get_app_configs()
        if config.name.startswith("src.apps.")
    }
    assert labels == {"core", "users", "app_auth"}
