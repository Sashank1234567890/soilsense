import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, Sprout, ArrowRight, ShieldCheck, UserCheck, GraduationCap } from 'lucide-react';

export default function Login() {
  const { login, switchDemo, user } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const res = await login(email, password);
    setLoading(false);
    if (res.success) {
      navigate('/dashboard');
    } else {
      setError(res.error || 'Failed to login');
    }
  };

  const handleDemoLogin = async (role) => {
    setError('');
    setLoading(true);
    const res = await switchDemo(role);
    setLoading(false);
    if (res.success) {
      navigate('/dashboard');
    } else {
      setError(res.error || 'Failed to switch demo user');
    }
  };

  return (
    <div style={{
      maxWidth: '520px',
      margin: '40px auto',
      display: 'flex',
      flexDirection: 'column',
      gap: '24px'
    }}>
      {/* Brand Header */}
      <div style={{ textAlign: 'center' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '56px',
          height: '56px',
          borderRadius: '16px',
          backgroundColor: 'var(--primary-100)',
          color: 'var(--primary-800)',
          marginBottom: '12px'
        }}>
          <Sprout size={32} />
        </div>
        <h1 style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--primary-900)' }}>
          Sign In to SoilSense
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '4px', fontSize: '0.92rem' }}>
          Precision Agricultural Diagnostics & IoT Telemetry Platform
        </p>
      </div>

      {/* 1-Click Demo Profiles for Evaluators */}
      <div className="card" style={{
        border: '1px solid var(--primary-200)',
        backgroundColor: '#f0fdf4',
        padding: '18px 20px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: '#166534', fontWeight: '700', fontSize: '0.85rem' }}>
          <ShieldCheck size={16} />
          <span>COURSE EVALUATOR & DEMO PROFILES (1-CLICK ACCESS)</span>
        </div>
        <p style={{ fontSize: '0.82rem', color: '#14532d', marginBottom: '14px' }}>
          Select a pre-configured role to immediately test the platform without typing credentials:
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <button
            type="button"
            onClick={() => handleDemoLogin('farmer')}
            disabled={loading}
            className="btn btn-outline btn-sm"
            style={{
              justifyContent: 'space-between',
              backgroundColor: '#ffffff',
              borderColor: '#bbf7d0',
              padding: '10px 14px',
              textAlign: 'left'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              
              <div>
                <strong style={{ color: '#166534', fontSize: '0.88rem' }}>Ramesh Kumar (Farmer)</strong>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Ludhiana, Punjab • Plot 01</div>
              </div>
            </div>
            <span className="badge badge-suitable" style={{ fontSize: '0.72rem' }}>Login</span>
          </button>

          <button
            type="button"
            onClick={() => handleDemoLogin('agronomist')}
            disabled={loading}
            className="btn btn-outline btn-sm"
            style={{
              justifyContent: 'space-between',
              backgroundColor: '#ffffff',
              borderColor: '#fed7aa',
              padding: '10px 14px',
              textAlign: 'left'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              
              <div>
                <strong style={{ color: '#9a3412', fontSize: '0.88rem' }}>Dr. Preeti Sharma (Agronomist)</strong>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>PAU Ludhiana • Research Station Block C</div>
              </div>
            </div>
            <span className="badge badge-hw" style={{ fontSize: '0.72rem' }}>Login</span>
          </button>

          <button
            type="button"
            onClick={() => handleDemoLogin('student')}
            disabled={loading}
            className="btn btn-outline btn-sm"
            style={{
              justifyContent: 'space-between',
              backgroundColor: '#ffffff',
              borderColor: '#bfdbfe',
              padding: '10px 14px',
              textAlign: 'left'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              
              <div>
                <strong style={{ color: '#1d4ed8', fontSize: '0.88rem' }}>Rahul Verma (NIT Delhi Student)</strong>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>3rd Sem CSE • DBMS Evaluator Zone</div>
              </div>
            </div>
            <span className="badge badge-ref" style={{ fontSize: '0.72rem' }}>Login</span>
          </button>
        </div>
      </div>

      {/* Manual Login Card */}
      <div className="card" style={{ padding: '28px' }}>
        <h2 style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--primary-900)', marginBottom: '16px' }}>
          Registered Account Login
        </h2>

        {error && (
          <div style={{
            padding: '10px 14px',
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '8px',
            color: '#dc2626',
            fontSize: '0.85rem',
            marginBottom: '16px'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '6px' }}>
              Email Address
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px 10px 36px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-light)',
                  backgroundColor: 'var(--bg-surface)'
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '6px' }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px 10px 36px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-light)',
                  backgroundColor: 'var(--bg-surface)'
                }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center', marginTop: '6px' }}
          >
            <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
            <ArrowRight size={16} />
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: 'var(--primary-700)', fontWeight: '700' }}>
            Register New Plot Profile
          </Link>
        </div>
      </div>
    </div>
  );
}
