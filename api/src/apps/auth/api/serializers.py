from rest_framework import serializers

from src.apps.users.models import User


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=150)
    password = serializers.CharField(write_only=True, trim_whitespace=False)


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("username", "first_name", "last_name", "email")
        read_only_fields = fields


class CsrfResultSerializer(serializers.Serializer):
    csrf_token = serializers.CharField()


class SessionResultSerializer(serializers.Serializer):
    """`csrf_token` is the new token: signing in rotates it."""

    csrf_token = serializers.CharField()
    user = UserSerializer()
