"""Author-side serializers: one per content kind, each carrying its translations
as a nested list that a write replaces as a whole."""

from typing import Any, ClassVar

from django.conf import settings
from django.db import models, transaction
from rest_framework import serializers

from src.apps.content import services
from src.apps.content.models import (
    Education,
    EducationTranslation,
    Experience,
    ExperienceTranslation,
    Image,
    ImageTranslation,
    Post,
    PostTranslation,
    Profile,
    ProfileLink,
    ProfileTranslation,
    Project,
    ProjectTranslation,
    Skill,
    SkillGroup,
    SkillGroupTranslation,
    Tag,
    TagTranslation,
)
from src.apps.users.models import User


LOCALES = [code for code, _name in settings.LANGUAGES]


class TranslationSerializer(serializers.ModelSerializer):
    locale = serializers.ChoiceField(choices=LOCALES)


class PublishableTranslationSerializer(TranslationSerializer):
    published_at = serializers.DateTimeField(read_only=True)

    def validate(self, attrs: dict[str, Any]) -> dict[str, Any]:
        if attrs.get("status") == "published" and not (
            attrs.get("title", "").strip() and attrs.get("body", "").strip()
        ):
            message = "A published translation needs a title and a body."
            raise serializers.ValidationError(message)
        return attrs


class ImageTranslationSerializer(TranslationSerializer):
    class Meta:
        model = ImageTranslation
        fields = ("locale", "alt")


class TagTranslationSerializer(TranslationSerializer):
    class Meta:
        model = TagTranslation
        fields = ("locale", "name")


class PostTranslationSerializer(PublishableTranslationSerializer):
    class Meta:
        model = PostTranslation
        fields = ("locale", "title", "summary", "body", "status", "published_at")


class ProjectTranslationSerializer(PublishableTranslationSerializer):
    class Meta:
        model = ProjectTranslation
        fields = ("locale", "title", "summary", "body", "status", "published_at")


class ProfileTranslationSerializer(TranslationSerializer):
    class Meta:
        model = ProfileTranslation
        fields = ("locale", "name", "headline", "summary", "location")


class SkillGroupTranslationSerializer(TranslationSerializer):
    class Meta:
        model = SkillGroupTranslation
        fields = ("locale", "title")


class ExperienceTranslationSerializer(TranslationSerializer):
    class Meta:
        model = ExperienceTranslation
        fields = ("locale", "role", "location", "description")


class EducationTranslationSerializer(TranslationSerializer):
    class Meta:
        model = EducationTranslation
        fields = ("locale", "degree", "description")


class TranslatedSerializer(serializers.ModelSerializer):
    """A model whose text lives in translation rows. Subclasses name the
    translation model and the FK back to the parent, and declare `translations`."""

    translation_model: ClassVar[type[models.Model]]
    parent_field: ClassVar[str]
    uuid = serializers.UUIDField(read_only=True)

    def validate_translations(self, items: list[dict]) -> list[dict]:
        locales = [item["locale"] for item in items]
        if len(locales) != len(set(locales)):
            message = "Each locale may appear only once."
            raise serializers.ValidationError(message)
        return items

    def _user(self) -> User:
        return self.context["request"].user

    @transaction.atomic
    def create(self, validated_data: dict[str, Any]) -> models.Model:
        translations = validated_data.pop("translations", [])
        extra = self._pop_extra(validated_data)
        instance = super().create(
            {**validated_data, **services.stamp(self._user(), creating=True)}
        )
        self._set_extra(instance, extra)
        services.sync_translations(
            self.translation_model,
            self.parent_field,
            instance,
            translations,
            self._user(),
        )
        return instance

    @transaction.atomic
    def update(
        self, instance: models.Model, validated_data: dict[str, Any]
    ) -> models.Model:
        translations = validated_data.pop("translations", None)
        extra = self._pop_extra(validated_data)
        instance = super().update(
            instance, {**validated_data, **services.stamp(self._user(), creating=False)}
        )
        self._set_extra(instance, extra)
        if translations is not None:
            services.sync_translations(
                self.translation_model,
                self.parent_field,
                instance,
                translations,
                self._user(),
            )
        return instance

    def _pop_extra(self, validated_data: dict[str, Any]) -> dict[str, Any]:  # noqa: ARG002
        """Children that are not translations (skills, links): split off so the
        model serializer does not try to assign them."""
        return {}

    def _set_extra(self, instance: models.Model, extra: dict[str, Any]) -> None:  # noqa: ARG002
        return None


def _check_slug_free(
    model: type[models.Model], value: str, instance: models.Model | None
) -> str:
    taken = model.objects.filter(slug=value)
    if instance is not None:
        taken = taken.exclude(pk=instance.pk)
    if taken.exists():
        message = "This slug is already used."
        raise serializers.ValidationError(message)
    return value


class TagSerializer(TranslatedSerializer):
    translation_model = TagTranslation
    parent_field = "tag"
    translations = TagTranslationSerializer(many=True, allow_empty=False)

    class Meta:
        model = Tag
        fields = ("uuid", "slug", "translations")

    def validate_slug(self, value: str) -> str:
        if self.instance is not None and value != self.instance.slug:
            message = "A tag's slug cannot change."
            raise serializers.ValidationError(message)
        return _check_slug_free(Tag, value, self.instance)


class PostSerializer(TranslatedSerializer):
    translation_model = PostTranslation
    parent_field = "post"
    translations = PostTranslationSerializer(many=True, allow_empty=False)
    cover_image = serializers.SlugRelatedField(
        slug_field="uuid", queryset=Image.objects.all(), allow_null=True, required=False
    )
    tags = serializers.SlugRelatedField(
        slug_field="uuid", queryset=Tag.objects.all(), many=True, required=False
    )

    class Meta:
        model = Post
        fields = ("uuid", "slug", "cover_image", "tags", "translations")

    def validate_slug(self, value: str) -> str:
        return _check_slug_free(Post, value, self.instance)

    def validate(self, attrs: dict[str, Any]) -> dict[str, Any]:
        _reject_slug_change_when_published(self.instance, attrs, "translations")
        return attrs


class ProjectSerializer(TranslatedSerializer):
    translation_model = ProjectTranslation
    parent_field = "project"
    translations = ProjectTranslationSerializer(many=True, allow_empty=False)
    cover_image = serializers.SlugRelatedField(
        slug_field="uuid", queryset=Image.objects.all(), allow_null=True, required=False
    )
    skills = serializers.SlugRelatedField(
        slug_field="uuid", queryset=Skill.objects.all(), many=True, required=False
    )

    class Meta:
        model = Project
        fields = (
            "uuid",
            "slug",
            "repo_url",
            "live_url",
            "featured",
            "position",
            "cover_image",
            "skills",
            "translations",
        )

    def validate_slug(self, value: str) -> str:
        return _check_slug_free(Project, value, self.instance)

    def validate(self, attrs: dict[str, Any]) -> dict[str, Any]:
        _reject_slug_change_when_published(self.instance, attrs, "translations")
        return attrs


def _reject_slug_change_when_published(
    instance: models.Model | None, attrs: dict[str, Any], related: str
) -> None:
    """Post and Project slugs are URLs: fixed once anything is published."""
    if instance is None or "slug" not in attrs or attrs["slug"] == instance.slug:
        return
    if getattr(instance, related).filter(status="published").exists():
        message = "The slug cannot change once a translation is published."
        raise serializers.ValidationError({"slug": message})


class SkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = Skill
        fields = ("name", "position")


class SkillGroupSerializer(TranslatedSerializer):
    translation_model = SkillGroupTranslation
    parent_field = "group"
    translations = SkillGroupTranslationSerializer(many=True, allow_empty=False)
    skills = SkillSerializer(many=True, required=False)

    class Meta:
        model = SkillGroup
        fields = ("uuid", "position", "skills", "translations")

    def _pop_extra(self, validated_data: dict[str, Any]) -> dict[str, Any]:
        return {"skills": validated_data.pop("skills", None)}

    def _set_extra(self, instance: models.Model, extra: dict[str, Any]) -> None:
        if extra["skills"] is not None:
            services.sync_children(
                Skill, "group", instance, extra["skills"], key="name", user=self._user()
            )


class ExperienceSerializer(TranslatedSerializer):
    translation_model = ExperienceTranslation
    parent_field = "experience"
    translations = ExperienceTranslationSerializer(many=True, allow_empty=False)

    class Meta:
        model = Experience
        fields = (
            "uuid",
            "company",
            "company_url",
            "start_date",
            "end_date",
            "translations",
        )

    def validate(self, attrs: dict[str, Any]) -> dict[str, Any]:
        _check_dates(self.instance, attrs)
        return attrs


class EducationSerializer(TranslatedSerializer):
    translation_model = EducationTranslation
    parent_field = "education"
    translations = EducationTranslationSerializer(many=True, allow_empty=False)

    class Meta:
        model = Education
        fields = ("uuid", "institution", "start_date", "end_date", "translations")

    def validate(self, attrs: dict[str, Any]) -> dict[str, Any]:
        _check_dates(self.instance, attrs)
        return attrs


def _check_dates(instance: models.Model | None, attrs: dict[str, Any]) -> None:
    start = attrs.get("start_date", getattr(instance, "start_date", None))
    end = attrs.get("end_date", getattr(instance, "end_date", None))
    if start and end and end < start:
        message = "The end date cannot be before the start date."
        raise serializers.ValidationError({"end_date": message})


class ProfileLinkSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProfileLink
        fields = ("kind", "url", "position")


class ProfileSerializer(TranslatedSerializer):
    translation_model = ProfileTranslation
    parent_field = "profile"
    translations = ProfileTranslationSerializer(many=True, allow_empty=False)
    links = ProfileLinkSerializer(many=True, required=False)
    avatar = serializers.SlugRelatedField(
        slug_field="uuid", queryset=Image.objects.all(), allow_null=True, required=False
    )

    class Meta:
        model = Profile
        fields = ("uuid", "email", "avatar", "links", "translations")

    def _pop_extra(self, validated_data: dict[str, Any]) -> dict[str, Any]:
        return {"links": validated_data.pop("links", None)}

    def _set_extra(self, instance: models.Model, extra: dict[str, Any]) -> None:
        if extra["links"] is not None:
            services.sync_children(
                ProfileLink,
                "profile",
                instance,
                extra["links"],
                key="url",
                user=self._user(),
            )


class ImageSerializer(serializers.ModelSerializer):
    """An uploaded picture. The file is written by `ImageUploadSerializer`; alt
    texts are set afterwards with a nested `translations` write."""

    uuid = serializers.UUIDField(read_only=True)
    url = serializers.SerializerMethodField()
    translations = ImageTranslationSerializer(many=True, required=False)

    class Meta:
        model = Image
        fields = ("uuid", "url", "width", "height", "translations")
        read_only_fields = ("width", "height")

    def get_url(self, obj: Image) -> str:
        return absolute_media_url(obj.file.url)

    @transaction.atomic
    def update(self, instance: Image, validated_data: dict[str, Any]) -> Image:
        translations = validated_data.pop("translations", None)
        instance.updated_by = self.context["request"].user
        instance.save()
        if translations is not None:
            services.sync_translations(
                ImageTranslation,
                "image",
                instance,
                translations,
                self.context["request"].user,
            )
        return instance


class ImageUploadSerializer(serializers.Serializer):
    """Validates an uploaded picture against the size limits and writes it."""

    file = serializers.ImageField()

    def validate_file(self, file: Any) -> Any:  # noqa: ANN401
        if file.size > settings.IMAGE_MAX_BYTES:
            message = f"The file is larger than {settings.IMAGE_MAX_BYTES} bytes."
            raise serializers.ValidationError(message)
        if file.image.format not in {"JPEG", "PNG", "WEBP"}:
            message = "Only JPEG, PNG and WebP images are accepted."
            raise serializers.ValidationError(message)
        if max(file.image.size) > settings.IMAGE_MAX_SIDE:
            message = f"A side is longer than {settings.IMAGE_MAX_SIDE} pixels."
            raise serializers.ValidationError(message)
        return file

    def create(self, validated_data: dict[str, Any]) -> Image:
        file = validated_data["file"]
        width, height = file.image.size
        return Image.objects.create(
            file=file,
            width=width,
            height=height,
            **services.stamp(validated_data["user"], creating=True),
        )

    def save(self, **kwargs: Any) -> Image:  # noqa: ANN401
        return self.create({**self.validated_data, **kwargs})


def absolute_media_url(path: str) -> str:
    return f"{settings.BACKEND_ORIGIN.rstrip('/')}{path}"
