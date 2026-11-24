import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import SurveyBuilder from './pages/SurveyBuilder';
import TakeSurvey from './pages/TakeSurvey';
import Results from './pages/Results';
import './index.css';

function Navbar() {
  const { user, logout } = useAuth();
  return (
    <nav className="navbar">
      <Link to="/dashboard" className="brand">
        SurveyHub
      </Link>
      <div>
        {user ? (
          <>
            <span>
              {user.name} ({user.role})
            </span>
            <Link to="/dashboard">Dashboard</Link>
            <button onClick={logout}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <main className="container">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/survey/:id" element={<TakeSurvey />} />

            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/builder"
              element={
                <ProtectedRoute allowedRoles={['owner', 'admin']}>
                  <SurveyBuilder />
                </ProtectedRoute>
              }
            />
            <Route
              path="/survey/:id/results"
              element={
                <ProtectedRoute allowedRoles={['owner', 'admin']}>
                  <Results />
                </ProtectedRoute>
              }
            />
          </Routes>
        </main>
      </BrowserRouter>
    </AuthProvider>
  );
}
