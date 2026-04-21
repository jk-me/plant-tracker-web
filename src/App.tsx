import { useEffect, useState } from 'react';
import LoginForm from './components/LoginForm';
import PlantList from './components/PlantList';
import type { User } from './types';
import * as api from './api';
import './App.css';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    let active = true;
    api.getCurrentUser()
      .then((currentUser) => {
        if (active) {
          setUser(currentUser);
        }
      })
      .catch(() => {
        // Ignore unauthenticated responses.
      })
      .finally(() => {
        if (active) {
          setCheckingSession(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  async function handleLogout() {
    await api.logout();
    setUser(null);
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>🌿 Plant Tracker</h1>
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
        ) : user ? (
          <PlantList />
        ) : (
          <LoginForm onSuccess={setUser} />
        )}
      </main>
    </div>
  );
}

export default App;
