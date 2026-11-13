from django.urls import include, path
from rest_framework.routers import SimpleRouter

from src.apps.content.api import author_views as views


router = SimpleRouter()
router.register("posts", views.PostViewSet, basename="author-post")
router.register("images", views.ImageViewSet, basename="author-image")
router.register("tags", views.TagViewSet, basename="author-tag")
router.register("projects", views.ProjectViewSet, basename="author-project")
router.register("skill-groups", views.SkillGroupViewSet, basename="author-skill-group")
router.register("experience", views.ExperienceViewSet, basename="author-experience")
router.register("education", views.EducationViewSet, basename="author-education")

urlpatterns = [
    path("profile/", views.ProfileView.as_view(), name="author-profile"),
    path("", include(router.urls)),
]
