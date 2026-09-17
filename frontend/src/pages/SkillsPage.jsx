import { useEffect, useState } from 'react'
import { getSkills, createSkill, deleteSkill } from '../api.js'

function SkillsPage() {
  const [skills, setSkills] = useState([])
  const [name, setName] = useState('')
  const [error, setError] = useState('')

  const load = () => getSkills().then((res) => setSkills(res.data.results ?? res.data))

  useEffect(() => { load() }, [])

  const handleAdd = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await createSkill({ name })
      setName('')
      load()
    } catch {
      setError('That skill may already exist.')
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Delete this skill? It will be removed from any students/projects using it.')) {
      await deleteSkill(id)
      load()
    }
  }

  return (
    <div>
      <h1>Skills Master List</h1>
      <p className="muted">Add skills here (Python, Java, SQL, React, etc.) before assigning them to students.</p>
      {error && <p className="error-text">{error}</p>}
      <form className="inline-form" onSubmit={handleAdd}>
        <input placeholder="New skill name" value={name} onChange={(e) => setName(e.target.value)} required />
        <button type="submit">Add Skill</button>
      </form>
      <ul className="pill-list">
        {skills.map((s) => (
          <li key={s.id} className="pill">
            <span>{s.name}</span>
            <button className="remove-btn" onClick={() => handleDelete(s.id)}>&times;</button>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default SkillsPage
