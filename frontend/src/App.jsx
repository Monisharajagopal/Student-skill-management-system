import { useState } from 'react'
import { Routes, Route, Link, Navigate, useNavigate } from 'react-router-dom'
import Dashboard from './pages/Dashboard.jsx'
import StudentList from './pages/StudentList.jsx'
import StudentProfile from './pages/StudentProfile.jsx'
import SkillsPage from './pages/SkillsPage.jsx'
import SkillGapPage from './pages/SkillGapPage.jsx'

function Login({ onLogin }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSubmit = (e) => {
    e.preventDefault()
    // Simple demo auth. Replace with real backend auth (e.g. DRF Token/Session)
    // before using this outside a classroom project.
    if (username === 'admin' && password === 'admin123') {
      localStorage.setItem('ssms_logged_in', 'true')
      onLogin()
      navigate('/dashboard')
    } else {
      setError('Invalid credentials. Try admin / admin123.')
    }
  }

  return (
    <div className="login-page">
      <form className="login-card" onSubmit={handleSubmit}>
        <h1>🎓 Student Skill Management System</h1>
        <p className="subtitle">Login to continue</p>
        {error && <p className="error-text">{error}</p>}
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">Login</button>
        <p className="hint">Demo credentials: admin / admin123</p>
      </form>
    </div>
  )
}

function Layout({ children, onLogout }) {
  return (
    <div className="app-shell">
      <nav className="navbar">
        <div className="nav-title">🎓 SSMS</div>
        <div className="nav-links">
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/students">Students</Link>
          <Link to="/skills">Skills</Link>
          <button className="logout-btn" onClick={onLogout}>Logout</button>
        </div>
      </nav>
      <main className="main-content">{children}</main>
    </div>
  )
}

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(
    localStorage.getItem('ssms_logged_in') === 'true'
  )
  const navigate = useNavigate()

  const handleLogout = () => {
    localStorage.removeItem('ssms_logged_in')
    setIsLoggedIn(false)
    navigate('/login')
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={
          isLoggedIn ? <Navigate to="/dashboard" /> : <Login onLogin={() => setIsLoggedIn(true)} />
        }
      />
      <Route
        path="/dashboard"
        element={
          isLoggedIn ? (
            <Layout onLogout={handleLogout}><Dashboard /></Layout>
          ) : (
            <Navigate to="/login" />
          )
        }
      />
      <Route
        path="/students"
        element={
          isLoggedIn ? (
            <Layout onLogout={handleLogout}><StudentList /></Layout>
          ) : (
            <Navigate to="/login" />
          )
        }
      />
      <Route
        path="/students/:id"
        element={
          isLoggedIn ? (
            <Layout onLogout={handleLogout}><StudentProfile /></Layout>
          ) : (
            <Navigate to="/login" />
          )
        }
      />
      <Route
        path="/students/:id/skill-gap"
        element={
          isLoggedIn ? (
            <Layout onLogout={handleLogout}><SkillGapPage /></Layout>
          ) : (
            <Navigate to="/login" />
          )
        }
      />
      <Route
        path="/skills"
        element={
          isLoggedIn ? (
            <Layout onLogout={handleLogout}><SkillsPage /></Layout>
          ) : (
            <Navigate to="/login" />
          )
        }
      />
      <Route path="*" element={<Navigate to={isLoggedIn ? '/dashboard' : '/login'} />} />
    </Routes>
  )
}

export default App
