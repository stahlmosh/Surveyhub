import { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

const rawApiUrl = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api')
  .trim()
  .replace(/\/+$/, '');

export const API_BASE = rawApiUrl.endsWith('/api') ? rawApiUrl : `${rawApiUrl}/api`;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('surveyhub_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [accessToken, setAccessToken] = useState(
    () => localStorage.getItem('surveyhub_access') || ''
  );
  const [refreshToken, setRefreshToken] = useState(
    () => localStorage.getItem('surveyhub_refresh') || ''
  );

  const saveSession = (userData, access, refresh) => {
    setUser(userData);
    setAccessToken(access);
    setRefreshToken(refresh);
    localStorage.setItem('surveyhub_user', JSON.stringify(userData));
    localStorage.setItem('surveyhub_access', access);
    localStorage.setItem('surveyhub_refresh', refresh);
  };

  const logout = async () => {
    try {
      if (accessToken) {
        await fetch(`${API_BASE}/auth/logout`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${accessToken}` }
        });
      }
    } catch (_) {}
    setUser(null);
    setAccessToken('');
    setRefreshToken('');
    localStorage.removeItem('surveyhub_user');
    localStorage.removeItem('surveyhub_access');
    localStorage.removeItem('surveyhub_refresh');
  };

  const authFetch = async (endpoint, options = {}) => {
    const makeRequest = (token) =>
      fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...options.headers
        }
      });

    let res = await makeRequest(accessToken);

    if (res.status === 401 && refreshToken) {
      const refreshRes = await fetch(`${API_BASE}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken })
      });

      if (refreshRes.ok) {
        const refreshData = await refreshRes.json();
        setAccessToken(refreshData.accessToken);
        setRefreshToken(refreshData.refreshToken);
        localStorage.setItem('surveyhub_access', refreshData.accessToken);
        localStorage.setItem('surveyhub_refresh', refreshData.refreshToken);
        res = await makeRequest(refreshData.accessToken);
      } else {
        await logout();
      }
    }

    return res;
  };

  return (
    <AuthContext.Provider value={{ user, accessToken, saveSession, logout, authFetch }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
