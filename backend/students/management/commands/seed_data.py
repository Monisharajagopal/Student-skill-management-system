from django.core.management.base import BaseCommand
from students.models import (
    Student, Skill, StudentSkill, Certification, Project,
    ProjectTechnology, RecommendedSkill,
)
import datetime


class Command(BaseCommand):
    help = "Seed the database with sample students, skills, certifications and projects."

    def handle(self, *args, **kwargs):
        self.stdout.write("Seeding data...")

        skill_names = ["Python", "Java", "SQL", "React", "Git", "Machine Learning", "Django", "JavaScript"]
        skills = {name: Skill.objects.get_or_create(name=name)[0] for name in skill_names}

        branch = "B.Tech AI & Data Science"
        for skill_name in ["React", "Git", "Machine Learning"]:
            RecommendedSkill.objects.get_or_create(branch=branch, skill=skills[skill_name])

        student, _ = Student.objects.get_or_create(
            name="Monisha R",
            defaults={
                "branch": branch,
                "email": "monisha.r@example.edu",
                "enrollment_year": 2023,
            },
        )

        for skill_name, level in [("Python", "Advanced"), ("Java", "Intermediate"), ("SQL", "Intermediate")]:
            StudentSkill.objects.get_or_create(
                student=student, skill=skills[skill_name], defaults={"level": level}
            )

        Certification.objects.get_or_create(
            student=student,
            name="Python for Data Science",
            defaults={
                "issuing_organization": "Coursera",
                "issue_date": datetime.date(2024, 3, 15),
                "certificate_link": "https://coursera.org/verify/example",
            },
        )

        project, _ = Project.objects.get_or_create(
            student=student,
            title="Student Skill Management System",
            defaults={
                "description": "A CRUD web app to manage student skills, certifications and projects.",
                "duration": "3 months",
                "project_link": "https://github.com/example/student-skill-management",
            },
        )
        for skill_name in ["Python", "React", "SQL"]:
            ProjectTechnology.objects.get_or_create(project=project, skill=skills[skill_name])

        self.stdout.write(self.style.SUCCESS("Sample data created successfully."))
