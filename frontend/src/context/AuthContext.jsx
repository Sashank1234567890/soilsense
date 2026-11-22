import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { loginUser, registerUser, getCurrentUser, switchDemoProfile, switchAccount } from '../services/api';

const AuthContext = createContext();

// Session helpers for managing multiple logged-in accounts on this device
function getStoredSessions() {
  try {
    const raw = localStorage.getItem('soilsense_active_sessions');
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function saveStoredSessions(sessions) {
  try {
    localStorage.setItem('soilsense_active_sessions', JSON.stringify(sessions));
  } catch (e) {}
}

function upsertSession(userData) {
  if (!userData || !userData.email) return getStoredSessions();
  const sessions = getStoredSessions();
  const idx = sessions.findIndex(s => (s.email || '').toLowerCase() === userData.email.toLowerCase());
  const entry = {
    _id: userData._id,
    name: userData.name || 'User',
    email: userData.email,
    role: userData.role || 'farmer',
    district: userData.district || 'Ludhiana',
    state: userData.state || 'Punjab',
    token: userData.token || ''
  };
  if (idx >= 0) {
    sessions[idx] = { ...sessions[idx], ...entry };
  } else {
    sessions.push(entry);
  }
  saveStoredSessions(sessions);
  return sessions;
}

function removeStoredSession(emailOrId) {
  const sessions = getStoredSessions();
  const target = (emailOrId || '').toLowerCase();
  const filtered = sessions.filter(s =>
    (s._id || '') !== emailOrId && (s.email || '').toLowerCase() !== target
  );
  saveStoredSessions(filtered);
  return filtered;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('soilsense_token') || '');
  const [sessions, setSessions] = useState(() => getStoredSessions());
  const [loading, setLoading] = useState(true);

  // Sync axios Authorization header immediately when token changes
  useEffect(() => {
    if (token && token !== 'undefined' && token !== 'null') {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  // Initialize Auth on app load
  useEffect(() => {
    async function loadAuth() {
      const storedToken = localStorage.getItem('soilsense_token');
      if (storedToken) {
        try {
          const res = await getCurrentUser();
          if (res.data?.success && res.data?.data) {
            const u = { ...res.data.data, token: storedToken };
            setUser(u);
            const updated = upsertSession(u);
            setSessions(updated);
            setLoading(false);
            return;
          }
        } catch (err) {
          console.warn('[AuthContext] Token expired or invalid, cleaning up session...');
          localStorage.removeItem('soilsense_token');
        }
      }

      // Check if another stored session is available
      const storedList = getStoredSessions();
      if (storedList.length > 0) {
        const next = storedList[0];
        setUser(next);
        setToken(next.token || '');
        if (next.token) {
          localStorage.setItem('soilsense_token', next.token);
        }
        setSessions(storedList);
        setLoading(false);
        return;
      }

      // If no valid session exists at all, auto-load default demo farmer
      try {
        const demoRes = await switchDemoProfile('farmer');
        if (demoRes.data?.success) {
          const u = demoRes.data.data;
          setUser(u);
          setToken(u.token);
          localStorage.setItem('soilsense_token', u.token);
          const updated = upsertSession(u);
          setSessions(updated);
        }
      } catch (e) {
        console.error('[AuthContext] Failed to load default demo profile:', e);
      }
      setLoading(false);
    }

    loadAuth();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await loginUser({ email, password });
      if (res.data?.success) {
        const userData = res.data.data;
        setUser(userData);
        setToken(userData.token);
        localStorage.setItem('soilsense_token', userData.token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${userData.token}`;
        const updated = upsertSession(userData);
        setSessions(updated);
        setLoading(false);
        return { success: true, data: userData };
      }
    } catch (err) {
      setLoading(false);
      return { success: false, error: err.response?.data?.message || err.response?.data?.error || err.message };
    }
  };

  const register = async (userData) => {
    setLoading(true);
    try {
      const res = await registerUser(userData);
      if (res.data?.success) {
        const u = res.data.data;
        setUser(u);
        setToken(u.token);
        localStorage.setItem('soilsense_token', u.token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${u.token}`;
        const updated = upsertSession(u);
        setSessions(updated);
        setLoading(false);
        return { success: true, data: u };
      }
    } catch (err) {
      setLoading(false);
      return { success: false, error: err.response?.data?.message || err.response?.data?.error || err.message };
    }
  };

  const switchDemo = async (role) => {
    setLoading(true);
    try {
      const res = await switchDemoProfile(role);
      if (res.data?.success) {
        const u = res.data.data;
        setUser(u);
        setToken(u.token);
        localStorage.setItem('soilsense_token', u.token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${u.token}`;
        const updated = upsertSession(u);
        setSessions(updated);
        setLoading(false);
        return { success: true, data: u };
      }
    } catch (err) {
      setLoading(false);
      return { success: false, error: err.response?.data?.message || err.message };
    }
  };

  const switchToUser = async (emailOrId) => {
    setLoading(true);
    try {
      // First check if token is already in local active sessions
      const existing = sessions.find(s =>
        (s._id || '') === emailOrId || (s.email || '').toLowerCase() === (emailOrId || '').toLowerCase()
      );

      if (existing && existing.token) {
        setUser(existing);
        setToken(existing.token);
        localStorage.setItem('soilsense_token', existing.token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${existing.token}`;
        setLoading(false);
        return { success: true, data: existing };
      }

      // Otherwise fetch switch token from backend
      const payload = typeof emailOrId === 'string' && emailOrId.includes('@') ? { email: emailOrId } : { userId: emailOrId };
      const res = await switchAccount(payload);
      if (res.data?.success) {
        const u = res.data.data;
        setUser(u);
        setToken(u.token);
        localStorage.setItem('soilsense_token', u.token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${u.token}`;
        const updated = upsertSession(u);
        setSessions(updated);
        setLoading(false);
        return { success: true, data: u };
      }
    } catch (err) {
      setLoading(false);
      return { success: false, error: err.response?.data?.message || err.message };
    }
  };

  // Sign out a specific account from the logged-in accounts list:
  // - If it was the active account and another account is logged in: directly log in to the other account!
  // - If list is now empty: clear session and return remaining: false (to go to sign in page)
  const signOutAccount = (emailOrId) => {
    const targetEmail = (emailOrId || user?.email || '').toLowerCase();
    const targetId = emailOrId || user?._id;
    const remaining = removeStoredSession(targetEmail || targetId);
    setSessions(remaining);

    const isCurrentActive =
      (user?.email || '').toLowerCase() === targetEmail || user?._id === targetId;

    if (isCurrentActive) {
      if (remaining.length > 0) {
        const nextAccount = remaining[0];
        setUser(nextAccount);
        setToken(nextAccount.token || '');
        if (nextAccount.token) {
          localStorage.setItem('soilsense_token', nextAccount.token);
          axios.defaults.headers.common['Authorization'] = `Bearer ${nextAccount.token}`;
        } else {
          localStorage.removeItem('soilsense_token');
          delete axios.defaults.headers.common['Authorization'];
        }
        return { remaining: true, user: nextAccount };
      } else {
        setUser(null);
        setToken('');
        localStorage.removeItem('soilsense_token');
        delete axios.defaults.headers.common['Authorization'];
        return { remaining: false, user: null };
      }
    }

    return { remaining: remaining.length > 0, user };
  };

  const logout = () => {
    return signOutAccount(user?.email || user?._id);
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      sessions,
      loading,
      login,
      register,
      logout,
      signOutAccount,
      switchDemo,
      switchToUser
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
