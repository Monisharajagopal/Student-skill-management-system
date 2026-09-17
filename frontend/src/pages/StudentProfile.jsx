import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  getStudent, updateStudent, getSkills,
  addStudentSkill, updateStudentSkill, deleteStudentSkill,
  addCertification, deleteCertification,
  addProject, deleteProject,
} from '../api.js'

const LEVELS = ['Beginner', 'Intermediate', 'Advanced']

function StudentProfile() {
  const { id } = useParams()
  const [student, setStudent] = useState(null)
  const [allSkills, setAllSkills] = useState([])
  const [editingInfo, setEditingInfo] = useState(false)
  const [infoForm, setInfoForm] = useState(null)

  const [skillForm, setSkillForm] = useState({ skill_id: '', level: 'Beginner' })
  const [certForm, setCertForm] = useState({ name: '', issuing_organization: '', issue_date: '', certificate_link: '' })
  const [projectForm, setProjectForm] = useState({ title: '', description: '', duration: '', project_link: '' })
  const [showCertForm, setShowCertForm] = useState(false)
  const [showProjectForm, setShowProjectForm] = useState(false)

  const loadStudent = () => {
    getStudent(id).then((res) => {
      setStudent(res.data)
      setInfoForm(res.data)
    })
  }

  useEffect(() => {
    loadStudent()
    getSkills().then((res) => setAllSkills(res.data.results ?? res.data))
  }, [id])

  if (!student) return <p>Loading profile...</p>

  // --- Student info edit ---
  const saveInfo = async (e) => {
    e.preventDefault()
    await updateStudent(id, {
      name: infoForm.name,
      branch: infoForm.branch,
      email: infoForm.email,
      enrollment_year: Number(infoForm.enrollment_year),
    })
    setEditingInfo(false)
    loadStudent()
  }

  // --- Skills ---
  const handleAddSkill = async (e) => {
    e.preventDefault()
    if (!skillForm.skill_id) return
    await addStudentSkill(id, skillForm.skill_id, skillForm.level)
    setSkillForm({ skill_id: '', level: 'Beginner' })
    loadStudent()
  }

  const handleLevelChange = async (studentSkillId, level) => {
    await updateStudentSkill(studentSkillId, level)
    loadStudent()
  }

  const handleRemoveSkill = async (studentSkillId) => {
    await deleteStudentSkill(studentSkillId)
    loadStudent()
  }

  // --- Certifications ---
  const handleAddCert = async (e) => {
    e.preventDefault()
    await addCertification(id, certForm)
    setCertForm({ name: '', issuing_organization: '', issue_date: '', certificate_link: '' })
    setShowCertForm(false)
    loadStudent()
  }

  const handleDeleteCert = async (certId) => {
    await deleteCertification(certId)
    loadStudent()
  }

  // --- Projects ---
  const handleAddProject = async (e) => {
    e.preventDefault()
    await addProject(id, projectForm)
    setProjectForm({ title: '', description: '', duration: '', project_link: '' })
    setShowProjectForm(false)
    loadStudent()
  }

  const handleDeleteProject = async (projectId) => {
    await deleteProject(projectId)
    loadStudent()
  }

  return (
    <div>
      <Link to="/students" className="back-link">&larr; Back to Students</Link>

      <div className="profile-header">
        {!editingInfo ? (
          <>
            <h1>{student.name}</h1>
            <p className="muted">{student.branch}</p>
            <p className="muted">{student.email} · Enrolled {student.enrollment_year}</p>
            <button onClick={() => setEditingInfo(true)}>Edit Info</button>
            <Link to={`/students/${id}/skill-gap`} className="link-btn">View Skill Gap Analysis</Link>
          </>
        ) : (
          <form className="inline-form" onSubmit={saveInfo}>
            <input value={infoForm.name} onChange={(e) => setInfoForm({ ...infoForm, name: e.target.value })} />
            <input value={infoForm.branch} onChange={(e) => setInfoForm({ ...infoForm, branch: e.target.value })} />
            <input value={infoForm.email} onChange={(e) => setInfoForm({ ...infoForm, email: e.target.value })} />
            <input type="number" value={infoForm.enrollment_year} onChange={(e) => setInfoForm({ ...infoForm, enrollment_year: e.target.value })} />
            <button type="submit">Save</button>
            <button type="button" onClick={() => setEditingInfo(false)}>Cancel</button>
          </form>
        )}
      </div>

      {/* --- Skills Section --- */}
      <section className="profile-section">
        <h2>Skills</h2>
        <ul className="pill-list">
          {student.skills.map((s) => (
            <li key={s.id} className="pill">
              <span>{s.skill_name}</span>
              <select value={s.level} onChange={(e) => handleLevelChange(s.id, e.target.value)}>
                {LEVELS.map((lvl) => <option key={lvl} value={lvl}>{lvl}</option>)}
              </select>
              <button className="remove-btn" onClick={() => handleRemoveSkill(s.id)}>&times;</button>
            </li>
          ))}
        </ul>
        <form className="inline-form" onSubmit={handleAddSkill}>
          <select value={skillForm.skill_id} onChange={(e) => setSkillForm({ ...skillForm, skill_id: e.target.value })}>
            <option value="">-- choose skill --</option>
            {allSkills.map((sk) => <option key={sk.id} value={sk.id}>{sk.name}</option>)}
          </select>
          <select value={skillForm.level} onChange={(e) => setSkillForm({ ...skillForm, level: e.target.value })}>
            {LEVELS.map((lvl) => <option key={lvl} value={lvl}>{lvl}</option>)}
          </select>
          <button type="submit">Add Skill</button>
        </form>
        <p className="hint">Need a new skill in the list? Add it on the <Link to="/skills">Skills</Link> page first.</p>
      </section>

      {/* --- Certifications Section --- */}
      <section className="profile-section">
        <div className="page-header">
          <h2>Certifications ({student.certifications.length})</h2>
          <button onClick={() => setShowCertForm(!showCertForm)}>{showCertForm ? 'Cancel' : '+ Add Certification'}</button>
        </div>
        {showCertForm && (
          <form className="inline-form" onSubmit={handleAddCert}>
            <input placeholder="Certification name" value={certForm.name} onChange={(e) => setCertForm({ ...certForm, name: e.target.value })} required />
            <input placeholder="Issuing organization" value={certForm.issuing_organization} onChange={(e) => setCertForm({ ...certForm, issuing_organization: e.target.value })} required />
            <input type="date" value={certForm.issue_date} onChange={(e) => setCertForm({ ...certForm, issue_date: e.target.value })} required />
            <input placeholder="Certificate link (optional)" value={certForm.certificate_link} onChange={(e) => setCertForm({ ...certForm, certificate_link: e.target.value })} />
            <button type="submit">Save Certification</button>
          </form>
        )}
        <ul className="list">
          {student.certifications.map((c) => (
            <li key={c.id} className="list-item">
              <div>
                <strong>{c.name}</strong> — {c.issuing_organization}
                <div className="muted">Issued: {c.issue_date}</div>
                {c.certificate_link && <a href={c.certificate_link} target="_blank" rel="noreferrer">View certificate</a>}
              </div>
              <button className="danger-btn" onClick={() => handleDeleteCert(c.id)}>Delete</button>
            </li>
          ))}
        </ul>
      </section>

      {/* --- Projects Section --- */}
      <section className="profile-section">
        <div className="page-header">
          <h2>Projects ({student.projects.length})</h2>
          <button onClick={() => setShowProjectForm(!showProjectForm)}>{showProjectForm ? 'Cancel' : '+ Add Project'}</button>
        </div>
        {showProjectForm && (
          <form className="inline-form" onSubmit={handleAddProject}>
            <input placeholder="Project title" value={projectForm.title} onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })} required />
            <textarea placeholder="Description" value={projectForm.description} onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })} required />
            <input placeholder="Duration (e.g. 3 months)" value={projectForm.duration} onChange={(e) => setProjectForm({ ...projectForm, duration: e.target.value })} required />
            <input placeholder="GitHub / project link" value={projectForm.project_link} onChange={(e) => setProjectForm({ ...projectForm, project_link: e.target.value })} />
            <button type="submit">Save Project</button>
          </form>
        )}
        <ul className="list">
          {student.projects.map((p) => (
            <li key={p.id} className="list-item">
              <div>
                <strong>{p.title}</strong> ({p.duration})
                <p className="muted">{p.description}</p>
                <p className="muted">
                  Tech: {p.technologies.map((t) => t.skill_name).join(', ') || 'none listed'}
                </p>
                {p.project_link && <a href={p.project_link} target="_blank" rel="noreferrer">View project</a>}
              </div>
              <button className="danger-btn" onClick={() => handleDeleteProject(p.id)}>Delete</button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}

export default StudentProfile
