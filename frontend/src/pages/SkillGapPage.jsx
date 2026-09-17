import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getSkillGap } from '../api.js'

function SkillGapPage() {
  const { id } = useParams()
  const [data, setData] = useState(null)
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    getSkillGap(id)
      .then((res) => setData(res.data))
      .catch(() => setErrorMsg('Could not load skill gap analysis for this student.'))
  }, [id])

  if (errorMsg) return <p className="error-text">{errorMsg}</p>
  if (!data) return <p>Loading...</p>

  return (
    <div>
      <Link to={`/students/${id}`} className="back-link">&larr; Back to Profile</Link>
      <h1>Skill Gap Analysis</h1>
      <p className="muted">{data.student} · {data.branch}</p>

      <div className="skill-gap-grid">
        <div className="skill-gap-col">
          <h3>Current Skills</h3>
          <ul className="pill-list">
            {data.current_skills.length > 0
              ? data.current_skills.map((s) => <li key={s} className="pill pill-green">{s}</li>)
              : <p className="muted">No skills recorded yet.</p>}
          </ul>
        </div>

        <div className="skill-gap-col">
          <h3>Recommended for {data.branch}</h3>
          <ul className="pill-list">
            {data.recommended_skills.length > 0
              ? data.recommended_skills.map((s) => <li key={s} className="pill pill-blue">{s}</li>)
              : <p className="muted">No recommendations configured for this branch yet.</p>}
          </ul>
        </div>

        <div className="skill-gap-col">
          <h3>Missing Skills</h3>
          <ul className="pill-list">
            {data.missing_skills.length > 0
              ? data.missing_skills.map((s) => <li key={s} className="pill pill-red">{s}</li>)
              : <p className="muted">No gaps — all recommended skills covered! 🎉</p>}
          </ul>
        </div>
      </div>
    </div>
  )
}

export default SkillGapPage
