"""The Author API: full CRUD on every content kind, behind the session.

Rows are addressed by `uuid`. `DELETE` hides a row (soft delete), `restore/`
brings it back, and `?deleted=true` lists the hidden ones.
"""

from typing import TYPE_CHECKING, ClassVar

from drf_spectacular.utils import extend_schema
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.generics import get_object_or_404
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.response import Response
from rest_framework.views import APIView

from src.apps.content.api import serializers
from src.apps.content.models import (
    Education,
    Experience,
    Image,
    Post,
    Profile,
    Project,
    SkillGroup,
    Tag,
)
from src.apps.core.api.pagination import DefaultPagination
from src.apps.core.api.response_messages import GenericResponseMessage
from src.apps.core.models import SoftDeleteModel


if TYPE_CHECKING:
    from rest_framework.request import Request


UUID_REGEX = "[0-9a-fA-F-]{36}"


@extend_schema(tags=["Author"])
class AuthorViewSet(viewsets.ModelViewSet):
    """CRUD with soft delete and restore, for any `SoftDeleteModel`."""

    permission_classes = (permissions.IsAuthenticated,)
    pagination_class = DefaultPagination
    lookup_field = "uuid"
    lookup_value_regex = UUID_REGEX
    model: ClassVar[type[SoftDeleteModel]]
    prefetch: ClassVar[tuple[str, ...]] = ("translations",)

    def get_queryset(self):  # noqa: ANN201
        if self.action == "restore":
            queryset = self.model.objects_default.filter(is_deleted=True)
        elif (
            self.action == "list" and self.request.query_params.get("deleted") == "true"
        ):
            queryset = self.model.objects.deleted_only()
        else:
            queryset = self.model.objects.all()
        return queryset.prefetch_related(*self.prefetch).order_by("-pk")

    def perform_destroy(self, instance: SoftDeleteModel) -> None:
        instance.delete(deleted_by=self.request.user)

    def destroy(self, request: "Request", *args: object, **kwargs: object) -> Response:  # noqa: ARG002
        self.perform_destroy(self.get_object())
        return Response({"message": GenericResponseMessage.RESOURCE_DELETED})

    @extend_schema(request=None, responses={status.HTTP_200_OK: None})
    @action(detail=True, methods=["post"])
    def restore(self, request: "Request", uuid: str) -> Response:  # noqa: ARG002
        self.get_object().restore()
        return Response({"message": GenericResponseMessage.RESOURCE_RESTORED})


class ImageViewSet(AuthorViewSet):
    """Pictures. Uploading sends the file only (multipart); alt texts are set
    afterwards with a nested `translations` write."""

    model = Image
    serializer_class = serializers.ImageSerializer
    parser_classes = (MultiPartParser, FormParser, JSONParser)

    @extend_schema(
        request={"multipart/form-data": serializers.ImageUploadSerializer},
        responses={status.HTTP_201_CREATED: serializers.ImageSerializer},
    )
    def create(self, request: "Request", *args: object, **kwargs: object) -> Response:  # noqa: ARG002
        upload = serializers.ImageUploadSerializer(data=request.data)
        upload.is_valid(raise_exception=True)
        image = upload.save(user=request.user)
        data = serializers.ImageSerializer(image, context={"request": request}).data
        return Response(data, status=status.HTTP_201_CREATED)


class TagViewSet(AuthorViewSet):
    model = Tag
    serializer_class = serializers.TagSerializer


class PostViewSet(AuthorViewSet):
    model = Post
    serializer_class = serializers.PostSerializer
    prefetch = ("translations", "tags")


class ProjectViewSet(AuthorViewSet):
    model = Project
    serializer_class = serializers.ProjectSerializer
    prefetch = ("translations", "skills")


class SkillGroupViewSet(AuthorViewSet):
    model = SkillGroup
    serializer_class = serializers.SkillGroupSerializer
    prefetch = ("translations", "skills")


class ExperienceViewSet(AuthorViewSet):
    model = Experience
    serializer_class = serializers.ExperienceSerializer


class EducationViewSet(AuthorViewSet):
    model = Education
    serializer_class = serializers.EducationSerializer


@extend_schema(tags=["Author"])
class ProfileView(APIView):
    """The one profile: read it, replace it, or change part of it."""

    permission_classes = (permissions.IsAuthenticated,)

    def _profile(self) -> Profile | None:
        return Profile.objects.prefetch_related("translations", "links").first()

    @extend_schema(
        operation_id="authorProfileRead", responses=serializers.ProfileSerializer
    )
    def get(self, _request: "Request") -> Response:
        profile = get_object_or_404(Profile.objects.all())
        return Response(
            serializers.ProfileSerializer(profile, context={"request": _request}).data
        )

    def _write(self, request: "Request", *, partial: bool) -> Response:
        serializer = serializers.ProfileSerializer(
            self._profile(),
            data=request.data,
            partial=partial,
            context={"request": request},
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    @extend_schema(
        operation_id="authorProfileReplace",
        request=serializers.ProfileSerializer,
        responses=serializers.ProfileSerializer,
    )
    def put(self, request: "Request") -> Response:
        return self._write(request, partial=False)

    @extend_schema(
        operation_id="authorProfileUpdate",
        request=serializers.ProfileSerializer,
        responses=serializers.ProfileSerializer,
    )
    def patch(self, request: "Request") -> Response:
        return self._write(request, partial=True)
