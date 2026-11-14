"""The Public API: read-only, open, and only ever what `selectors` allows."""

from typing import TYPE_CHECKING, Any, ClassVar

from django.http import Http404
from drf_spectacular.utils import extend_schema
from rest_framework import permissions
from rest_framework.response import Response
from rest_framework.views import APIView

from src.apps.content import selectors
from src.apps.content.api import public_serializers as ser
from src.apps.content.api.serializers import LOCALES


if TYPE_CHECKING:
    from rest_framework.request import Request


@extend_schema(tags=["Public"])
class PublicView(APIView):
    """One GET endpoint under `/api/public/<locale>/`. Subclasses name the
    selector, the serializer, and whether the URL carries a slug."""

    permission_classes = (permissions.AllowAny,)
    authentication_classes: ClassVar = []
    http_method_names: ClassVar = ["get", "head", "options"]
    serializer_class: ClassVar[Any]
    many: ClassVar[bool] = True

    def select(self, locale: str, **kwargs: str) -> Any:  # noqa: ANN401
        raise NotImplementedError

    def get(self, request: "Request", locale: str, **kwargs: str) -> Response:  # noqa: ARG002
        if locale not in LOCALES:
            raise Http404
        result = self.select(locale, **kwargs)
        if result is None:
            raise Http404
        serializer = self.serializer_class(
            result, many=self.many, context={"locale": locale}
        )
        return Response(serializer.data)


@extend_schema(responses=ser.PublicPostListSerializer(many=True))
class PostList(PublicView):
    serializer_class = ser.PublicPostListSerializer

    def select(self, locale: str, **_kwargs: str) -> Any:  # noqa: ANN401
        return selectors.published_posts(locale)


class PostDetail(PublicView):
    serializer_class = ser.PublicPostDetailSerializer
    many = False

    def select(self, locale: str, slug: str, **_kwargs: str) -> Any:  # noqa: ANN401
        return selectors.published_post(locale, slug)


@extend_schema(responses=ser.PublicTagSerializer(many=True))
class TagList(PublicView):
    serializer_class = ser.PublicTagSerializer

    def select(self, locale: str, **_kwargs: str) -> Any:  # noqa: ANN401
        return selectors.tags(locale)


@extend_schema(responses=ser.PublicProjectListSerializer(many=True))
class ProjectList(PublicView):
    serializer_class = ser.PublicProjectListSerializer

    def select(self, locale: str, **_kwargs: str) -> Any:  # noqa: ANN401
        return selectors.published_projects(locale)


class ProjectDetail(PublicView):
    serializer_class = ser.PublicProjectDetailSerializer
    many = False

    def select(self, locale: str, slug: str, **_kwargs: str) -> Any:  # noqa: ANN401
        return selectors.published_project(locale, slug)


class ProfileDetail(PublicView):
    serializer_class = ser.PublicProfileSerializer
    many = False

    def select(self, locale: str, **_kwargs: str) -> Any:  # noqa: ANN401
        return selectors.profile(locale)


@extend_schema(responses=ser.PublicSkillGroupSerializer(many=True))
class SkillList(PublicView):
    serializer_class = ser.PublicSkillGroupSerializer

    def select(self, locale: str, **_kwargs: str) -> Any:  # noqa: ANN401
        return selectors.skill_groups(locale)


@extend_schema(responses=ser.PublicExperienceSerializer(many=True))
class ExperienceList(PublicView):
    serializer_class = ser.PublicExperienceSerializer

    def select(self, locale: str, **_kwargs: str) -> Any:  # noqa: ANN401
        return selectors.experience(locale)


@extend_schema(responses=ser.PublicEducationSerializer(many=True))
class EducationList(PublicView):
    serializer_class = ser.PublicEducationSerializer

    def select(self, locale: str, **_kwargs: str) -> Any:  # noqa: ANN401
        return selectors.education(locale)
