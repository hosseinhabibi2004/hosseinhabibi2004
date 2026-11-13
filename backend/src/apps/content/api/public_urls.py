from django.urls import path

from src.apps.content.api import public_views as views


urlpatterns = [
    path("<str:locale>/posts/", views.PostList.as_view(), name="public-posts"),
    path(
        "<str:locale>/posts/<slug:slug>/",
        views.PostDetail.as_view(),
        name="public-post",
    ),
    path("<str:locale>/tags/", views.TagList.as_view(), name="public-tags"),
    path("<str:locale>/projects/", views.ProjectList.as_view(), name="public-projects"),
    path(
        "<str:locale>/projects/<slug:slug>/",
        views.ProjectDetail.as_view(),
        name="public-project",
    ),
    path("<str:locale>/profile/", views.ProfileDetail.as_view(), name="public-profile"),
    path("<str:locale>/skills/", views.SkillList.as_view(), name="public-skills"),
    path(
        "<str:locale>/experience/",
        views.ExperienceList.as_view(),
        name="public-experience",
    ),
    path(
        "<str:locale>/education/",
        views.EducationList.as_view(),
        name="public-education",
    ),
]
