from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import (
    StudentViewSet, SkillViewSet, StudentSkillViewSet,
    CertificationViewSet, ProjectViewSet, ProjectTechnologyViewSet,
    RecommendedSkillViewSet, SkillGapView,
)

router = DefaultRouter()
router.register(r'students', StudentViewSet, basename='student')
router.register(r'skills', SkillViewSet, basename='skill')
router.register(r'student-skills', StudentSkillViewSet, basename='student-skill')
router.register(r'certifications', CertificationViewSet, basename='certification')
router.register(r'projects', ProjectViewSet, basename='project')
router.register(r'project-technologies', ProjectTechnologyViewSet, basename='project-technology')
router.register(r'recommended-skills', RecommendedSkillViewSet, basename='recommended-skill')

urlpatterns = [
    path('', include(router.urls)),
    path('students/<int:student_id>/skill-gap/', SkillGapView.as_view(), name='skill-gap'),
]
