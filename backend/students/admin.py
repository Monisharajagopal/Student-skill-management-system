from django.contrib import admin
from .models import (
    Student, Skill, StudentSkill, Certification,
    Project, ProjectTechnology, RecommendedSkill,
)

admin.site.register(Student)
admin.site.register(Skill)
admin.site.register(StudentSkill)
admin.site.register(Certification)
admin.site.register(Project)
admin.site.register(ProjectTechnology)
admin.site.register(RecommendedSkill)
