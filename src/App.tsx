import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import PlantHistoryPage from './pages/PlantHistoryPage'
import LoginForm from './components/LoginForm'
import PlantList from './components/PlantList'
import PlantNewPage from './pages/PlantNewPage'
import PlantEditPage from './pages/PlantEditPage'
import type { User } from './types'
import * as api from './api'
import './App.css'

function App() {
  const [user, setUser] = useState<User | null>(null)
  const [checkingSession, setCheckingSession] = useState(true)

  useEffect(() => {
    async function checkSession() {
      try {
        const currentUser = await api.getCurrentUser()
        setUser(currentUser.user)
      } catch {
        // Ignore unauthenticated responses.
      } finally {
        setCheckingSession(false)
      }
    }

    checkSession()
  }, [])

  async function handleLogout() {
    await api.logout()
    setUser(null)
  }

  const goToDashboard = () => {
    if (user) {
      window.location.href = '/plants'
    }
  }

  return (
    <BrowserRouter>
      <div className="app">
        <header className="app-header">
          <h1 onClick={goToDashboard}>
            <img src="/icon.png" alt="Plant Tracker Icon" height="40" />
            Plant Tracker
          </h1>
          {user && (
            <div className="header-actions">
              <span>{user.email_address}</span>
              <button onClick={handleLogout}>Sign Out</button>
            </div>
          )}
        </header>
        <main className="app-main">
          {checkingSession ? (
            <p>Checking session…</p>
          ) : (
            <Routes>
              <Route path="/plants" element={user ? <PlantList /> : <Navigate to="/" replace />} />
              <Route
                path="/plants/new"
                element={user ? <PlantNewPage /> : <Navigate to="/" replace />}
              />
              <Route
                path="/plants/:id/edit"
                element={user ? <PlantEditPage /> : <Navigate to="/" replace />}
              />
              <Route
                path="/plants/:id/history"
                element={user ? <PlantHistoryPage /> : <Navigate to="/" replace />}
              />
              <Route
                path="/"
                element={
                  user ? <Navigate to="/plants" replace /> : <LoginForm onSuccess={setUser} />
                }
              />
            </Routes>
          )}
        </main>
      </div>
    </BrowserRouter>
  )
}

export default App
