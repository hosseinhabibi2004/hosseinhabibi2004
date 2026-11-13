from django.contrib.auth.models import AbstractUser


class User(AbstractUser):
    """The project's user model, kept custom from the first migration so adding
    fields later never needs a swap. Today it is the Django default: the site
    author's account for the API."""
