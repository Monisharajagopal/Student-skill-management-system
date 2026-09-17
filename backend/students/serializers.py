from rest_framework import serializers
from .models import (
    Student, Skill, StudentSkill, Certification,
    Project, ProjectTechnology, RecommendedSkill,
)


class SkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = Skill
        fields = ['id', 'name']


class StudentSkillSerializer(serializers.ModelSerializer):
    skill_name = serializers.CharField(source='skill.name', read_only=True)
    skill_id = serializers.PrimaryKeyRelatedField(
        queryset=Skill.objects.all(), source='skill', write_only=True
    )

    class Meta:
        model = StudentSkill
        fields = ['id', 'student', 'skill_id', 'skill_name', 'level']
        read_only_fields = ['student']


class CertificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Certification
        fields = [
            'id', 'student', 'name', 'issuing_organization',
            'issue_date', 'certificate_link',
        ]
        read_only_fields = ['student']


class ProjectTechnologySerializer(serializers.ModelSerializer):
    skill_name = serializers.CharField(source='skill.name', read_only=True)
    skill_id = serializers.PrimaryKeyRelatedField(
        queryset=Skill.objects.all(), source='skill', write_only=True
    )

    class Meta:
        model = ProjectTechnology
        fields = ['id', 'project', 'skill_id', 'skill_name']
        read_only_fields = ['project']


class ProjectSerializer(serializers.ModelSerializer):
    technologies = ProjectTechnologySerializer(many=True, read_only=True)

    class Meta:
        model = Project
        fields = [
            'id', 'student', 'title', 'description',
            'duration', 'project_link', 'technologies',
        ]
        read_only_fields = ['student']


class StudentListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for the student list page."""
    skill_count = serializers.SerializerMethodField()
    certification_count = serializers.SerializerMethodField()
    project_count = serializers.SerializerMethodField()

    class Meta:
        model = Student
        fields = [
            'id', 'name', 'branch', 'email', 'enrollment_year',
            'skill_count', 'certification_count', 'project_count',
        ]

    def get_skill_count(self, obj):
        return obj.student_skills.count()

    def get_certification_count(self, obj):
        return obj.certifications.count()

    def get_project_count(self, obj):
        return obj.projects.count()


class StudentDetailSerializer(serializers.ModelSerializer):
    """Full nested profile: used for the Student Profile page."""
    skills = StudentSkillSerializer(source='student_skills', many=True, read_only=True)
    certifications = CertificationSerializer(many=True, read_only=True)
    projects = ProjectSerializer(many=True, read_only=True)

    class Meta:
        model = Student
        fields = [
            'id', 'name', 'branch', 'email', 'enrollment_year',
            'created_at', 'skills', 'certifications', 'projects',
        ]


class RecommendedSkillSerializer(serializers.ModelSerializer):
    skill_name = serializers.CharField(source='skill.name', read_only=True)

    class Meta:
        model = RecommendedSkill
        fields = ['id', 'branch', 'skill', 'skill_name']
