from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import (
    Student, Skill, StudentSkill, Certification,
    Project, ProjectTechnology, RecommendedSkill,
)
from .serializers import (
    StudentListSerializer, StudentDetailSerializer, SkillSerializer,
    StudentSkillSerializer, CertificationSerializer, ProjectSerializer,
    ProjectTechnologySerializer, RecommendedSkillSerializer,
)


class StudentViewSet(viewsets.ModelViewSet):
    """
    /api/students/            GET (list), POST (create)
    /api/students/<id>/       GET (full profile), PUT/PATCH (update), DELETE
    """
    queryset = Student.objects.all()

    def get_serializer_class(self):
        if self.action == 'list':
            return StudentListSerializer
        return StudentDetailSerializer


class SkillViewSet(viewsets.ModelViewSet):
    """
    /api/skills/          GET (list), POST (create a master skill)
    /api/skills/<id>/     PUT/PATCH, DELETE
    """
    queryset = Skill.objects.all()
    serializer_class = SkillSerializer


class StudentSkillViewSet(viewsets.ModelViewSet):
    """
    /api/student-skills/?student=<id>   GET (skills for one student)
    /api/student-skills/                POST { student, skill_id, level }
    /api/student-skills/<id>/           PUT/PATCH (update level), DELETE
    """
    serializer_class = StudentSkillSerializer

    def get_queryset(self):
        qs = StudentSkill.objects.all()
        student_id = self.request.query_params.get('student')
        if student_id:
            qs = qs.filter(student_id=student_id)
        return qs

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(student_id=request.data.get('student'))
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class CertificationViewSet(viewsets.ModelViewSet):
    """
    /api/certifications/?student=<id>   GET
    /api/certifications/                POST { student, name, issuing_organization, issue_date, certificate_link }
    /api/certifications/<id>/           PUT/PATCH, DELETE
    """
    serializer_class = CertificationSerializer

    def get_queryset(self):
        qs = Certification.objects.all()
        student_id = self.request.query_params.get('student')
        if student_id:
            qs = qs.filter(student_id=student_id)
        return qs

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(student_id=request.data.get('student'))
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class ProjectViewSet(viewsets.ModelViewSet):
    """
    /api/projects/?student=<id>   GET
    /api/projects/                POST { student, title, description, duration, project_link }
    /api/projects/<id>/           PUT/PATCH, DELETE
    """
    serializer_class = ProjectSerializer

    def get_queryset(self):
        qs = Project.objects.all()
        student_id = self.request.query_params.get('student')
        if student_id:
            qs = qs.filter(student_id=student_id)
        return qs

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(student_id=request.data.get('student'))
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class ProjectTechnologyViewSet(viewsets.ModelViewSet):
    """
    /api/project-technologies/?project=<id>   GET
    /api/project-technologies/                POST { project, skill_id }
    /api/project-technologies/<id>/           DELETE
    """
    serializer_class = ProjectTechnologySerializer

    def get_queryset(self):
        qs = ProjectTechnology.objects.all()
        project_id = self.request.query_params.get('project')
        if project_id:
            qs = qs.filter(project_id=project_id)
        return qs

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(project_id=request.data.get('project'))
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class RecommendedSkillViewSet(viewsets.ModelViewSet):
    """
    /api/recommended-skills/?branch=<name>   GET
    /api/recommended-skills/                 POST { branch, skill }
    /api/recommended-skills/<id>/            DELETE
    """
    serializer_class = RecommendedSkillSerializer

    def get_queryset(self):
        qs = RecommendedSkill.objects.all()
        branch = self.request.query_params.get('branch')
        if branch:
            qs = qs.filter(branch=branch)
        return qs


class SkillGapView(APIView):
    """
    GET /api/students/<id>/skill-gap/
    Compares a student's current skills against the skills recommended
    for their branch and returns the difference.
    """

    def get(self, request, student_id):
        try:
            student = Student.objects.get(id=student_id)
        except Student.DoesNotExist:
            return Response({'error': 'Student not found'}, status=status.HTTP_404_NOT_FOUND)

        current_skill_names = set(
            StudentSkill.objects.filter(student=student).values_list('skill__name', flat=True)
        )
        recommended_skill_names = set(
            RecommendedSkill.objects.filter(branch=student.branch).values_list('skill__name', flat=True)
        )

        missing = sorted(recommended_skill_names - current_skill_names)

        return Response({
            'student': student.name,
            'branch': student.branch,
            'current_skills': sorted(current_skill_names),
            'recommended_skills': sorted(recommended_skill_names),
            'missing_skills': missing,
        })
