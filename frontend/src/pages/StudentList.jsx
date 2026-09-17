import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getStudents, createStudent, deleteStudent } from '../api.js'

const emptyForm = { name: '', branch: '', email: '', enrollment_year: '' }

function StudentList() {
  const [students, setStudents] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [showForm, setShowForm] = useState(false)
  const [error, setError] = useState('')

  const loadStudents = () => {
    getStudents().then((res) => setStudents(res.data.results ?? res.data))
  }

  useEffect(() => {
    loadStudents()
  }, [])

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await createStudent({ ...form, enrollment_year: Number(form.enrollment_year) })
      setForm(emptyForm)
      setShowForm(false)
      loadStudents()
    } catch (err) {
      const errorMsg =
        err.response?.data?.email?.[0] ||
        err.response?.data?.detail ||
        err.message ||
        'Could not add student. Check that the email is unique and all fields are valid.'
      setError(errorMsg)
    }
  }

  const handleDelete = async (id, name) => {
    if (window.confirm(`Delete ${name}? This also removes their skills, certifications and projects.`)) {
      await deleteStudent(id)
      loadStudents()
    }
  }

  return (
    <div>
      <div className="page-header">
        <h1>Students</h1>
        <button onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ Add Student'}
        </button>
      </div>

      {showForm && (
        <form className="inline-form" onSubmit={handleSubmit}>
          {error && <p className="error-text">{error}</p>}
          <input name="name" placeholder="Full name" value={form.name} onChange={handleChange} required />
          <input name="branch" placeholder="Branch (e.g. B.Tech AI & DS)" value={form.branch} onChange={handleChange} required />
          <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} required />
          <input name="enrollment_year" type="number" placeholder="Enrollment year" value={form.enrollment_year} onChange={handleChange} required />
          <button type="submit">Save Student</button>
        </form>
      )}

      <table className="data-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Branch</th>
            <th>Email</th>
            <th>Skills</th>
            <th>Certs</th>
            <th>Projects</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {students.map((s) => (
            <tr key={s.id}>
              <td><Link to={`/students/${s.id}`}>{s.name}</Link></td>
              <td>{s.branch}</td>
              <td>{s.email}</td>
              <td>{s.skill_count}</td>
              <td>{s.certification_count}</td>
              <td>{s.project_count}</td>
              <td>
                <Link to={`/students/${s.id}`} className="link-btn">View</Link>
                <button className="danger-btn" onClick={() => handleDelete(s.id, s.name)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {students.length === 0 && <p>No students yet. Add one above.</p>}
    </div>
  )
}

export default StudentList
