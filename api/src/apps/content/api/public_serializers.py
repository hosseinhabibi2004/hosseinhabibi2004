"""What the static site receives. Plain serializers over rows from
`selectors`, each carrying the requested locale's translation as `.tr`."""

from typing import Any

from drf_spectacular.utils import extend_schema_field
from rest_framework import serializers

from src.apps.content.api.serializers import absolute_media_url


class PublicImageSerializer(serializers.Serializer):
    url = serializers.CharField()
    width = serializers.IntegerField()
    height = serializers.IntegerField()
    alt = serializers.CharField()


def public_image(image: Any, locale: str) -> dict[str, Any] | None:  # noqa: ANN401
    """The image as the site sees it; a deleted image reads as null."""
    if image is None or image.is_deleted:
        return None
    alt = next((t.alt for t in image.translations.all() if t.locale == locale), "")
    return {
        "url": absolute_media_url(image.file.url),
        "width": image.width,
        "height": image.height,
        "alt": alt,
    }


class PublicTagSerializer(serializers.Serializer):
    slug = serializers.CharField()
    name = serializers.CharField(source="tr.name")


class _CoverMixin(serializers.Serializer):
    cover_image = serializers.SerializerMethodField()

    @extend_schema_field(PublicImageSerializer(allow_null=True))
    def get_cover_image(self, obj: Any) -> dict[str, Any] | None:  # noqa: ANN401
        return public_image(obj.cover_image, self.context["locale"])


class PublicPostListSerializer(_CoverMixin):
    slug = serializers.CharField()
    title = serializers.CharField(source="tr.title")
    summary = serializers.CharField(source="tr.summary")
    published_at = serializers.DateTimeField(source="tr.published_at")
    tags = serializers.SerializerMethodField()

    @extend_schema_field(PublicTagSerializer(many=True))
    def get_tags(self, obj: Any) -> list[dict[str, str]]:  # noqa: ANN401
        locale = self.context["locale"]
        result = []
        for tag in obj.tags.all():
            name = next(
                (t.name for t in tag.translations.all() if t.locale == locale), None
            )
            if name is not None:
                result.append({"slug": tag.slug, "name": name})
        return result


class PublicPostDetailSerializer(PublicPostListSerializer):
    body = serializers.CharField(source="tr.body")


class PublicProjectListSerializer(_CoverMixin):
    slug = serializers.CharField()
    title = serializers.CharField(source="tr.title")
    summary = serializers.CharField(source="tr.summary")
    repo_url = serializers.CharField()
    live_url = serializers.CharField()
    featured = serializers.BooleanField()
    skills = serializers.SerializerMethodField()

    def get_skills(self, obj: Any) -> list[str]:  # noqa: ANN401
        return [skill.name for skill in obj.skills.all()]


class PublicProjectDetailSerializer(PublicProjectListSerializer):
    body = serializers.CharField(source="tr.body")


class PublicLinkSerializer(serializers.Serializer):
    kind = serializers.CharField()
    url = serializers.CharField()


class PublicProfileSerializer(serializers.Serializer):
    name = serializers.CharField(source="tr.name")
    headline = serializers.CharField(source="tr.headline")
    summary = serializers.CharField(source="tr.summary")
    location = serializers.CharField(source="tr.location")
    email = serializers.CharField()
    avatar = serializers.SerializerMethodField()
    links = serializers.SerializerMethodField()

    @extend_schema_field(PublicImageSerializer(allow_null=True))
    def get_avatar(self, obj: Any) -> dict[str, Any] | None:  # noqa: ANN401
        return public_image(obj.avatar, self.context["locale"])

    @extend_schema_field(PublicLinkSerializer(many=True))
    def get_links(self, obj: Any) -> list[dict[str, str]]:  # noqa: ANN401
        links = sorted(obj.links.all(), key=lambda link: link.position)
        return [{"kind": link.kind, "url": link.url} for link in links]


class PublicSkillSerializer(serializers.Serializer):
    name = serializers.CharField()


class PublicSkillGroupSerializer(serializers.Serializer):
    title = serializers.CharField(source="tr.title")
    skills = serializers.SerializerMethodField()

    @extend_schema_field(PublicSkillSerializer(many=True))
    def get_skills(self, obj: Any) -> list[dict[str, str]]:  # noqa: ANN401
        skills = sorted(obj.skills.all(), key=lambda skill: (skill.position, skill.pk))
        return [{"name": skill.name} for skill in skills]


class PublicExperienceSerializer(serializers.Serializer):
    company = serializers.CharField()
    company_url = serializers.CharField()
    role = serializers.CharField(source="tr.role")
    location = serializers.CharField(source="tr.location")
    description = serializers.CharField(source="tr.description")
    start_date = serializers.DateField()
    end_date = serializers.DateField(allow_null=True)


class PublicEducationSerializer(serializers.Serializer):
    institution = serializers.CharField()
    degree = serializers.CharField(source="tr.degree")
    description = serializers.CharField(source="tr.description")
    start_date = serializers.DateField()
    end_date = serializers.DateField(allow_null=True)
