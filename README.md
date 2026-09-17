# 🎓 Student Skill Management System

A full-stack CRUD web application to manage student profiles, skills, certifications, and projects — built with **Django REST Framework** (backend) and **React + Vite** (frontend).

## Project Structure

```
student-skill-management/
├── backend/                  # Django REST Framework API
│   ├── config/                # Project settings, urls
│   ├── students/               # Main app: models, serializers, views, urls
│   │   ├── models.py            # Student, Skill, StudentSkill, Certification, Project, etc.
│   │   ├── serializers.py
│   │   ├── views.py             # CRUD viewsets + Skill Gap logic
│   │   ├── urls.py
│   │   ├── admin.py
│   │   └── management/commands/seed_data.py  # sample data
│   ├── requirements.txt
│   └── manage.py
└── frontend/                  # React (Vite) SPA
    ├── src/
    │   ├── pages/               # Dashboard, StudentList, StudentProfile, SkillsPage, SkillGapPage
    │   ├── api.js                # Axios calls to the Django API
    │   ├── App.jsx               # Routes + login gate
    │   └── App.css
    └── package.json
```

## 1. Backend Setup (Django)

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt

python manage.py makemigrations
python manage.py migrate

# Optional: load sample data (one student, skills, a cert, a project)
python manage.py seed_data

# Optional: create an admin user for the Django admin panel at /admin/
python manage.py createsuperuser

python manage.py runserver
```

The API will be available at **http://127.0.0.1:8000/api/**.

### Switching from SQLite to PostgreSQL/MySQL
Open `backend/config/settings.py` and replace the `DATABASES` block with the
PostgreSQL example already included there (commented out), filling in your
own credentials. Then re-run `makemigrations` + `migrate`.

## 2. Frontend Setup (React)

```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:5173**. Login with:
- Username: `admin`
- Password: `admin123`

(This is a simple demo login for the assignment flow. See "Notes on Auth" below.)

## 3. API Endpoints Reference

| Resource | Method | Endpoint | Purpose |
|---|---|---|---|
| Students | GET | `/api/students/` | List all students |
| | POST | `/api/students/` | Create student |
| | GET | `/api/students/<id>/` | Full profile (nested skills, certs, projects) |
| | PUT/PATCH | `/api/students/<id>/` | Update student |
| | DELETE | `/api/students/<id>/` | Delete student |
| Skills | GET/POST | `/api/skills/` | List / add a master skill |
| | DELETE | `/api/skills/<id>/` | Delete a skill |
| Student Skills | GET | `/api/student-skills/?student=<id>` | Skills for one student |
| | POST | `/api/student-skills/` | Assign `{student, skill_id, level}` |
| | PATCH | `/api/student-skills/<id>/` | Update skill level |
| | DELETE | `/api/student-skills/<id>/` | Remove skill from student |
| Certifications | GET | `/api/certifications/?student=<id>` | Certs for one student |
| | POST | `/api/certifications/` | Add `{student, name, issuing_organization, issue_date, certificate_link}` |
| | DELETE | `/api/certifications/<id>/` | Remove |
| Projects | GET | `/api/projects/?student=<id>` | Projects for one student |
| | POST | `/api/projects/` | Add `{student, title, description, duration, project_link}` |
| | DELETE | `/api/projects/<id>/` | Remove |
| Project Technologies | POST | `/api/project-technologies/` | Add `{project, skill_id}` |
| | DELETE | `/api/project-technologies/<id>/` | Remove |
| Recommended Skills | GET/POST | `/api/recommended-skills/?branch=<name>` | Configure skill-gap recommendations per branch |
| Skill Gap | GET | `/api/students/<id>/skill-gap/` | Current vs. recommended skills for a student |

Test any of these directly with **Postman** or `curl` — e.g.:
```bash
curl http://127.0.0.1:8000/api/students/
```

## 4. Database Design (ER summary)

- `Student` 1—* `Certification`
- `Student` 1—* `Project`
- `Student` *—* `Skill` via `StudentSkill` (junction table, carries `level`)
- `Project` *—* `Skill` via `ProjectTechnology` (junction table)
- `RecommendedSkill` maps a `branch` → `Skill`, used for the Skill Gap page

This normalized design avoids storing multi-value fields (like a project's
tech stack) as comma-separated strings, and lets one skill be shared across
many students and many projects.

## 5. Feature: Skill Gap Analysis

1. Set up recommended skills for a branch once (via Django admin at
   `/admin/` or POST to `/api/recommended-skills/`), e.g.:
   ```json
   { "branch": "B.Tech AI & Data Science", "skill": 4 }
   ```
2. Visit a student's profile → "View Skill Gap Analysis" to see their
   current skills, the branch's recommended skills, and what's missing.

## 6. Notes on Auth

The login screen in this build is a **client-side demo gate** (hardcoded
credentials, `localStorage` flag) so the required Login → Dashboard flow
in the SOP is represented in the UI. For a production system, replace it
with real Django auth — e.g. `rest_framework.authtoken` or `djangorestframework-simplejwt` —
and protect the API views with `permission_classes = [IsAuthenticated]`.

## 7. Suggested Next Steps for Your Submission

- Take UI screenshots of: Login, Dashboard, Student List, Student Profile,
  Skill Gap page.
- Export a few Postman requests/responses for your API documentation.
- Write a short architecture diagram: React SPA ⇄ REST API (DRF) ⇄
  SQLite/PostgreSQL.
- Mention the normalization decisions (junction tables) in your database
  design write-up — this is usually where marks are lost or gained.
