from django.db import models


class Student(models.Model):
    name = models.CharField(max_length=100)
    branch = models.CharField(max_length=100, help_text="e.g. B.Tech AI & Data Science")
    email = models.EmailField(unique=True)
    enrollment_year = models.IntegerField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return self.name


class Skill(models.Model):
    name = models.CharField(max_length=50, unique=True)  # Python, Java, SQL, React...

    class Meta:
        ordering = ['name']

    def __str__(self):
        return self.name


class StudentSkill(models.Model):
    LEVEL_CHOICES = [
        ('Beginner', 'Beginner'),
        ('Intermediate', 'Intermediate'),
        ('Advanced', 'Advanced'),
    ]
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='student_skills')
    skill = models.ForeignKey(Skill, on_delete=models.CASCADE)
    level = models.CharField(max_length=20, choices=LEVEL_CHOICES, default='Beginner')

    class Meta:
        unique_together = ('student', 'skill')

    def __str__(self):
        return f"{self.student.name} - {self.skill.name} ({self.level})"


class Certification(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='certifications')
    name = models.CharField(max_length=150)
    issuing_organization = models.CharField(max_length=150)
    issue_date = models.DateField()
    certificate_link = models.URLField(blank=True, null=True)

    class Meta:
        ordering = ['-issue_date']

    def __str__(self):
        return f"{self.name} ({self.student.name})"


class Project(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='projects')
    title = models.CharField(max_length=150)
    description = models.TextField()
    duration = models.CharField(max_length=50, help_text="e.g. 3 months")
    project_link = models.URLField(blank=True, null=True)

    def __str__(self):
        return f"{self.title} ({self.student.name})"


class ProjectTechnology(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='technologies')
    skill = models.ForeignKey(Skill, on_delete=models.CASCADE)

    class Meta:
        unique_together = ('project', 'skill')

    def __str__(self):
        return f"{self.project.title} uses {self.skill.name}"


class RecommendedSkill(models.Model):
    """Maps a branch to skills recommended for students in that branch.
    Powers the Skill Gap Analysis page."""
    branch = models.CharField(max_length=100)
    skill = models.ForeignKey(Skill, on_delete=models.CASCADE)

    class Meta:
        unique_together = ('branch', 'skill')

    def __str__(self):
        return f"{self.branch} -> {self.skill.name}"
