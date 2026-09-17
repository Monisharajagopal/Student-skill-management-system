import axios from 'axios'

const API_BASE = 'http://127.0.0.1:8000/api'

const api = axios.create({
  baseURL: API_BASE,
})

// --- Students ---
export const getStudents = () => api.get('/students/')
export const getStudent = (id) => api.get(`/students/${id}/`)
export const createStudent = (data) => api.post('/students/', data)
export const updateStudent = (id, data) => api.put(`/students/${id}/`, data)
export const deleteStudent = (id) => api.delete(`/students/${id}/`)

// --- Skills (master list) ---
export const getSkills = () => api.get('/skills/')
export const createSkill = (data) => api.post('/skills/', data)
export const deleteSkill = (id) => api.delete(`/skills/${id}/`)

// --- Student <-> Skill assignments ---
export const addStudentSkill = (studentId, skillId, level) =>
  api.post('/student-skills/', { student: studentId, skill_id: skillId, level })
export const updateStudentSkill = (id, level) =>
  api.patch(`/student-skills/${id}/`, { level })
export const deleteStudentSkill = (id) => api.delete(`/student-skills/${id}/`)

// --- Certifications ---
export const addCertification = (studentId, data) =>
  api.post('/certifications/', { student: studentId, ...data })
export const updateCertification = (id, data) => api.put(`/certifications/${id}/`, data)
export const deleteCertification = (id) => api.delete(`/certifications/${id}/`)

// --- Projects ---
export const addProject = (studentId, data) =>
  api.post('/projects/', { student: studentId, ...data })
export const updateProject = (id, data) => api.put(`/projects/${id}/`, data)
export const deleteProject = (id) => api.delete(`/projects/${id}/`)
export const addProjectTechnology = (projectId, skillId) =>
  api.post('/project-technologies/', { project: projectId, skill_id: skillId })
export const deleteProjectTechnology = (id) => api.delete(`/project-technologies/${id}/`)

// --- Skill Gap ---
export const getSkillGap = (studentId) => api.get(`/students/${studentId}/skill-gap/`)

// --- Recommended skills (admin setup for skill-gap feature) ---
export const addRecommendedSkill = (branch, skillId) =>
  api.post('/recommended-skills/', { branch, skill: skillId })

export default api
