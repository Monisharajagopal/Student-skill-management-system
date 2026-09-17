import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api'

const api = axios.create({
  baseURL: API_BASE,
  timeout: 5000,
})

// Check if running in browser over HTTPS while API is HTTP localhost
// Browsers strictly block HTTPS -> HTTP localhost requests as Mixed Content
const isBrowser = typeof window !== 'undefined'
const isHttps = isBrowser && window.location.protocol === 'https:'
const isLocalApi = API_BASE.startsWith('http://127.0.0.1') || API_BASE.startsWith('http://localhost')
const shouldPreferMock = isHttps && isLocalApi

// --- LocalStorage Mock Database for offline / demo / Vercel fallback ---
const DB_STORAGE_KEY = 'ssms_mock_db_v1'

const defaultSeedData = {
  skills: [
    { id: 1, name: 'Python' },
    { id: 2, name: 'Java' },
    { id: 3, name: 'SQL' },
    { id: 4, name: 'React' },
    { id: 5, name: 'Git' },
    { id: 6, name: 'Machine Learning' },
    { id: 7, name: 'Django' },
    { id: 8, name: 'JavaScript' },
  ],
  recommendedSkills: [
    { id: 1, branch: 'B.Tech AI & Data Science', skill: 4, skill_name: 'React' },
    { id: 2, branch: 'B.Tech AI & Data Science', skill: 5, skill_name: 'Git' },
    { id: 3, branch: 'B.Tech AI & Data Science', skill: 6, skill_name: 'Machine Learning' },
  ],
  students: [
    {
      id: 1,
      name: 'Monisha R',
      branch: 'B.Tech AI & Data Science',
      email: 'monisha.r@example.edu',
      enrollment_year: 2023,
      created_at: '2026-09-17T01:19:42Z',
      skills: [
        { id: 1, student: 1, skill_id: 1, skill_name: 'Python', level: 'Advanced' },
        { id: 2, student: 1, skill_id: 2, skill_name: 'Java', level: 'Intermediate' },
        { id: 3, student: 1, skill_id: 3, skill_name: 'SQL', level: 'Intermediate' },
      ],
      certifications: [
        {
          id: 1,
          student: 1,
          name: 'Python for Data Science',
          issuing_organization: 'Coursera',
          issue_date: '2024-03-15',
          certificate_link: 'https://coursera.org/verify/example',
        },
      ],
      projects: [
        {
          id: 1,
          student: 1,
          title: 'Student Skill Management System',
          description: 'A CRUD web app to manage student skills, certifications and projects.',
          duration: '3 months',
          project_link: 'https://github.com/example/student-skill-management',
          technologies: [
            { id: 1, project: 1, skill_id: 1, skill_name: 'Python' },
            { id: 2, project: 1, skill_id: 4, skill_name: 'React' },
            { id: 3, project: 1, skill_id: 3, skill_name: 'SQL' },
          ],
        },
      ],
    },
  ],
}

function getLocalDB() {
  if (!isBrowser) return defaultSeedData
  try {
    const raw = localStorage.getItem(DB_STORAGE_KEY)
    if (!raw) {
      localStorage.setItem(DB_STORAGE_KEY, JSON.stringify(defaultSeedData))
      return defaultSeedData
    }
    return JSON.parse(raw)
  } catch (e) {
    console.error('Failed to read from localStorage:', e)
    return defaultSeedData
  }
}

function saveLocalDB(db) {
  if (!isBrowser) return
  try {
    localStorage.setItem(DB_STORAGE_KEY, JSON.stringify(db))
  } catch (e) {
    console.error('Failed to save to localStorage:', e)
  }
}

// Wrapper to try backend API first, falling back to LocalStorage mock DB on network failure
async function runWithFallback(apiFn, mockFn) {
  if (shouldPreferMock) {
    return mockFn()
  }
  try {
    return await apiFn()
  } catch (err) {
    // If network error, timeout, or CORS issue (no HTTP response from server)
    if (!err.response) {
      console.warn('Backend API unreachable at ' + API_BASE + ', using local storage fallback.', err.message)
      return mockFn()
    }
    // If server responded with a 4xx/5xx status, throw it so UI handles validation errors
    throw err
  }
}

// --- Students ---
export const getStudents = () =>
  runWithFallback(
    () => api.get('/students/'),
    () => {
      const db = getLocalDB()
      const results = db.students.map((s) => ({
        id: s.id,
        name: s.name,
        branch: s.branch,
        email: s.email,
        enrollment_year: s.enrollment_year,
        skill_count: (s.skills || []).length,
        certification_count: (s.certifications || []).length,
        project_count: (s.projects || []).length,
      }))
      return { data: { results } }
    }
  )

export const getStudent = (id) =>
  runWithFallback(
    () => api.get(`/students/${id}/`),
    () => {
      const db = getLocalDB()
      const student = db.students.find((s) => s.id === Number(id))
      if (!student) {
        return Promise.reject(new Error('Student not found'))
      }
      return {
        data: {
          ...student,
          skills: student.skills || [],
          certifications: student.certifications || [],
          projects: student.projects || [],
        },
      }
    }
  )

export const createStudent = (data) =>
  runWithFallback(
    () => api.post('/students/', data),
    () => {
      const db = getLocalDB()
      const exists = db.students.some(
        (s) => s.email.toLowerCase() === (data.email || '').trim().toLowerCase()
      )
      if (exists) {
        const error = new Error('A student with that email already exists.')
        error.response = { data: { email: ['A student with that email already exists.'] } }
        return Promise.reject(error)
      }

      const nextId = db.students.reduce((max, s) => Math.max(max, s.id), 0) + 1
      const newStudent = {
        id: nextId,
        name: data.name.trim(),
        branch: data.branch.trim(),
        email: data.email.trim(),
        enrollment_year: Number(data.enrollment_year),
        created_at: new Date().toISOString(),
        skills: [],
        certifications: [],
        projects: [],
      }

      db.students.push(newStudent)
      saveLocalDB(db)

      return {
        data: {
          ...newStudent,
          skill_count: 0,
          certification_count: 0,
          project_count: 0,
        },
      }
    }
  )

export const updateStudent = (id, data) =>
  runWithFallback(
    () => api.put(`/students/${id}/`, data),
    () => {
      const db = getLocalDB()
      const studentIndex = db.students.findIndex((s) => s.id === Number(id))
      if (studentIndex === -1) {
        return Promise.reject(new Error('Student not found'))
      }

      const existing = db.students[studentIndex]
      const updated = {
        ...existing,
        name: data.name !== undefined ? data.name : existing.name,
        branch: data.branch !== undefined ? data.branch : existing.branch,
        email: data.email !== undefined ? data.email : existing.email,
        enrollment_year:
          data.enrollment_year !== undefined
            ? Number(data.enrollment_year)
            : existing.enrollment_year,
      }

      db.students[studentIndex] = updated
      saveLocalDB(db)
      return { data: updated }
    }
  )

export const deleteStudent = (id) =>
  runWithFallback(
    () => api.delete(`/students/${id}/`),
    () => {
      const db = getLocalDB()
      db.students = db.students.filter((s) => s.id !== Number(id))
      saveLocalDB(db)
      return { data: null }
    }
  )

// --- Skills (master list) ---
export const getSkills = () =>
  runWithFallback(
    () => api.get('/skills/'),
    () => {
      const db = getLocalDB()
      return { data: { results: db.skills || [] } }
    }
  )

export const createSkill = (data) =>
  runWithFallback(
    () => api.post('/skills/', data),
    () => {
      const db = getLocalDB()
      const name = (data.name || '').trim()
      const exists = (db.skills || []).some(
        (s) => s.name.toLowerCase() === name.toLowerCase()
      )
      if (exists) {
        const error = new Error('Skill already exists.')
        error.response = { data: { name: ['A skill with that name already exists.'] } }
        return Promise.reject(error)
      }

      const nextId = (db.skills || []).reduce((max, s) => Math.max(max, s.id), 0) + 1
      const newSkill = { id: nextId, name }
      db.skills = db.skills || []
      db.skills.push(newSkill)
      saveLocalDB(db)
      return { data: newSkill }
    }
  )

export const deleteSkill = (id) =>
  runWithFallback(
    () => api.delete(`/skills/${id}/`),
    () => {
      const db = getLocalDB()
      const numId = Number(id)
      const skillToDelete = (db.skills || []).find((s) => s.id === numId)
      db.skills = (db.skills || []).filter((s) => s.id !== numId)

      // Cascade removal in mock db
      db.students.forEach((student) => {
        student.skills = (student.skills || []).filter((s) => s.skill_id !== numId)
        student.projects?.forEach((proj) => {
          proj.technologies = (proj.technologies || []).filter((t) => t.skill_id !== numId)
        })
      })

      if (skillToDelete) {
        db.recommendedSkills = (db.recommendedSkills || []).filter(
          (r) => r.skill !== numId && r.skill_name !== skillToDelete.name
        )
      }

      saveLocalDB(db)
      return { data: null }
    }
  )

// --- Student <-> Skill assignments ---
export const addStudentSkill = (studentId, skillId, level) =>
  runWithFallback(
    () => api.post('/student-skills/', { student: studentId, skill_id: skillId, level }),
    () => {
      const db = getLocalDB()
      const student = db.students.find((s) => s.id === Number(studentId))
      if (!student) return Promise.reject(new Error('Student not found'))

      const skill = (db.skills || []).find((s) => s.id === Number(skillId))
      const skillName = skill ? skill.name : 'Unknown'

      student.skills = student.skills || []
      const existingIndex = student.skills.findIndex((s) => s.skill_id === Number(skillId))

      const item = {
        id: Date.now(),
        student: Number(studentId),
        skill_id: Number(skillId),
        skill_name: skillName,
        level: level || 'Beginner',
      }

      if (existingIndex >= 0) {
        student.skills[existingIndex].level = level || 'Beginner'
      } else {
        student.skills.push(item)
      }

      saveLocalDB(db)
      return { data: item }
    }
  )

export const updateStudentSkill = (id, level) =>
  runWithFallback(
    () => api.patch(`/student-skills/${id}/`, { level }),
    () => {
      const db = getLocalDB()
      let updatedItem = null
      db.students.forEach((student) => {
        const sk = (student.skills || []).find((s) => s.id === Number(id))
        if (sk) {
          sk.level = level
          updatedItem = sk
        }
      })
      saveLocalDB(db)
      return { data: updatedItem }
    }
  )

export const deleteStudentSkill = (id) =>
  runWithFallback(
    () => api.delete(`/student-skills/${id}/`),
    () => {
      const db = getLocalDB()
      db.students.forEach((student) => {
        student.skills = (student.skills || []).filter((s) => s.id !== Number(id))
      })
      saveLocalDB(db)
      return { data: null }
    }
  )

// --- Certifications ---
export const addCertification = (studentId, data) =>
  runWithFallback(
    () => api.post('/certifications/', { student: studentId, ...data }),
    () => {
      const db = getLocalDB()
      const student = db.students.find((s) => s.id === Number(studentId))
      if (!student) return Promise.reject(new Error('Student not found'))

      const nextId = Date.now()
      const cert = {
        id: nextId,
        student: Number(studentId),
        name: data.name,
        issuing_organization: data.issuing_organization,
        issue_date: data.issue_date,
        certificate_link: data.certificate_link || null,
      }

      student.certifications = student.certifications || []
      student.certifications.push(cert)
      saveLocalDB(db)
      return { data: cert }
    }
  )

export const updateCertification = (id, data) =>
  runWithFallback(
    () => api.put(`/certifications/${id}/`, data),
    () => {
      const db = getLocalDB()
      let updatedCert = null
      db.students.forEach((student) => {
        const cert = (student.certifications || []).find((c) => c.id === Number(id))
        if (cert) {
          Object.assign(cert, data)
          updatedCert = cert
        }
      })
      saveLocalDB(db)
      return { data: updatedCert }
    }
  )

export const deleteCertification = (id) =>
  runWithFallback(
    () => api.delete(`/certifications/${id}/`),
    () => {
      const db = getLocalDB()
      db.students.forEach((student) => {
        student.certifications = (student.certifications || []).filter((c) => c.id !== Number(id))
      })
      saveLocalDB(db)
      return { data: null }
    }
  )

// --- Projects ---
export const addProject = (studentId, data) =>
  runWithFallback(
    () => api.post('/projects/', { student: studentId, ...data }),
    () => {
      const db = getLocalDB()
      const student = db.students.find((s) => s.id === Number(studentId))
      if (!student) return Promise.reject(new Error('Student not found'))

      const proj = {
        id: Date.now(),
        student: Number(studentId),
        title: data.title,
        description: data.description,
        duration: data.duration,
        project_link: data.project_link || null,
        technologies: [],
      }

      student.projects = student.projects || []
      student.projects.push(proj)
      saveLocalDB(db)
      return { data: proj }
    }
  )

export const updateProject = (id, data) =>
  runWithFallback(
    () => api.put(`/projects/${id}/`, data),
    () => {
      const db = getLocalDB()
      let updatedProj = null
      db.students.forEach((student) => {
        const p = (student.projects || []).find((prj) => prj.id === Number(id))
        if (p) {
          Object.assign(p, data)
          updatedProj = p
        }
      })
      saveLocalDB(db)
      return { data: updatedProj }
    }
  )

export const deleteProject = (id) =>
  runWithFallback(
    () => api.delete(`/projects/${id}/`),
    () => {
      const db = getLocalDB()
      db.students.forEach((student) => {
        student.projects = (student.projects || []).filter((p) => p.id !== Number(id))
      })
      saveLocalDB(db)
      return { data: null }
    }
  )

export const addProjectTechnology = (projectId, skillId) =>
  runWithFallback(
    () => api.post('/project-technologies/', { project: projectId, skill_id: skillId }),
    () => {
      const db = getLocalDB()
      const skill = (db.skills || []).find((s) => s.id === Number(skillId))
      const skillName = skill ? skill.name : 'Unknown'
      let newTech = null

      db.students.forEach((student) => {
        const proj = (student.projects || []).find((p) => p.id === Number(projectId))
        if (proj) {
          proj.technologies = proj.technologies || []
          newTech = {
            id: Date.now(),
            project: Number(projectId),
            skill_id: Number(skillId),
            skill_name: skillName,
          }
          proj.technologies.push(newTech)
        }
      })

      saveLocalDB(db)
      return { data: newTech }
    }
  )

export const deleteProjectTechnology = (id) =>
  runWithFallback(
    () => api.delete(`/project-technologies/${id}/`),
    () => {
      const db = getLocalDB()
      db.students.forEach((student) => {
        student.projects?.forEach((proj) => {
          proj.technologies = (proj.technologies || []).filter((t) => t.id !== Number(id))
        })
      })
      saveLocalDB(db)
      return { data: null }
    }
  )

// --- Skill Gap ---
export const getSkillGap = (studentId) =>
  runWithFallback(
    () => api.get(`/students/${studentId}/skill-gap/`),
    () => {
      const db = getLocalDB()
      const student = db.students.find((s) => s.id === Number(studentId))
      if (!student) return Promise.reject(new Error('Student not found'))

      const currentSkills = (student.skills || []).map((s) => s.skill_name)
      const branchLower = (student.branch || '').trim().toLowerCase()

      let recommended = (db.recommendedSkills || [])
        .filter((r) => (r.branch || '').trim().toLowerCase() === branchLower)
        .map((r) => r.skill_name)

      // Fallback default recommendations if branch not explicitly configured
      if (recommended.length === 0) {
        recommended = ['React', 'Git', 'Machine Learning']
      }

      const missingSkills = recommended.filter((skill) => !currentSkills.includes(skill))

      return {
        data: {
          student: student.name,
          branch: student.branch,
          current_skills: currentSkills,
          recommended_skills: recommended,
          missing_skills: missingSkills,
        },
      }
    }
  )

// --- Recommended skills ---
export const addRecommendedSkill = (branch, skillId) =>
  runWithFallback(
    () => api.post('/recommended-skills/', { branch, skill: skillId }),
    () => {
      const db = getLocalDB()
      const skill = (db.skills || []).find((s) => s.id === Number(skillId))
      const skillName = skill ? skill.name : 'Unknown'
      const item = {
        id: Date.now(),
        branch,
        skill: Number(skillId),
        skill_name: skillName,
      }
      db.recommendedSkills = db.recommendedSkills || []
      db.recommendedSkills.push(item)
      saveLocalDB(db)
      return { data: item }
    }
  )

export default api
