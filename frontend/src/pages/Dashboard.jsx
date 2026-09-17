import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getStudents, getSkills } from '../api.js'

function Dashboard() {
  const [students, setStudents] = useState([])
  const [skillCount, setSkillCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getStudents(), getSkills()])
      .then(([studentsRes, skillsRes]) => {
        setStudents(studentsRes.data.results ?? studentsRes.data)
        setSkillCount((skillsRes.data.results ?? skillsRes.data).length)
      })
      .finally(() => setLoading(false))
  }, [])

  const totalCerts = students.reduce((sum, s) => sum + (s.certification_count || 0), 0)
  const totalProjects = students.reduce((sum, s) => sum + (s.project_count || 0), 0)

  if (loading) return <p>Loading dashboard...</p>

  return (
    <div>
      <h1>Dashboard</h1>
      <div className="stat-grid">
        <div className="stat-card">
          <h2>{students.length}</h2>
          <p>Students</p>
        </div>
        <div className="stat-card">
          <h2>{skillCount}</h2>
          <p>Skills Tracked</p>
        </div>
        <div className="stat-card">
          <h2>{totalCerts}</h2>
          <p>Certifications</p>
        </div>
        <div className="stat-card">
          <h2>{totalProjects}</h2>
          <p>Projects</p>
        </div>
      </div>

      <h2 className="section-heading">Recent Students</h2>
      <div className="card-grid">
        {students.slice(0, 6).map((s) => (
          <Link to={`/students/${s.id}`} key={s.id} className="student-card">
            <h3>{s.name}</h3>
            <p>{s.branch}</p>
            <p className="muted">
              {s.skill_count} skills · {s.certification_count} certs · {s.project_count} projects
            </p>
          </Link>
        ))}
      </div>
    </div>
  )
}

export default Dashboard
