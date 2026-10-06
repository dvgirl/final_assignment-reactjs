import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, Shield, UserCheck, Briefcase, User, Sparkles, AlertCircle } from 'lucide-react';

/**
 * ============================================================================
 * LOGIN PAGE COMPONENT (Beginner-Friendly & Classy Theme)
 * ============================================================================
 * 
 * Beginner Guide for Trainees:
 * 1. State Management:
 *    - `email` & `password`: Controlled input states capturing user text.
 *    - `error`: Holds error messages if authentication fails.
 *    - `loading`: Shows a spinner/disabled state during network requests.
 * 
 * 2. Authentication:
 *    - `useAuth()` hook provides the `login(email, password)` function.
 *    - On success, `navigate('/dashboard')` redirects the user to their portal.
 * 
 * 3. 1-Click Demo Selector:
 *    - Allows developers & examiners to test all 4 roles without typing.
 */
const LoginPage = () => {
  // Controlled form inputs
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Auth context and navigation
  const { login, quickLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';

  // Standard Form Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  // 1-Click Demo Login Handler
  const handleRoleQuickFill = async (roleName) => {
    setError('');
    setLoading(true);
    try {
      await quickLogin(roleName);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: 'calc(100vh - 120px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1rem',
        backgroundColor: 'var(--bg-main)',
      }}
    >
      <div
        className="card"
        style={{
          width: '100%',
          maxWidth: '440px',
          boxShadow: 'var(--shadow-md)',
          borderRadius: '16px',
        }}
      >
        {/* Header Icon & Title */}
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: 'var(--primary-light)',
              color: 'var(--primary)',
              border: '1px solid var(--primary-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 0.75rem',
            }}
          >
            <Lock size={20} />
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#0f172a' }}>Sign In to PassTrack</h2>
          <p style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '0.25rem' }}>
            Enter credentials or select a 1-click demo role
          </p>
        </div>

        {/* 1-Click Role Login Selector Box */}
        <div
          style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '10px',
            padding: '0.75rem',
            marginBottom: '1.25rem',
          }}
        >
          <div
            style={{
              fontSize: '0.73rem',
              fontWeight: 700,
              color: '#475569',
              marginBottom: '0.45rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
            }}
          >
            <Sparkles size={12} color="#2563eb" /> 1-CLICK DEMO LOGIN (Instant Access):
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.4rem' }}>
            <button
              type="button"
              onClick={() => handleRoleQuickFill('admin')}
              className="btn btn-secondary btn-sm"
              style={{ justifyContent: 'flex-start', padding: '0.45rem 0.6rem', fontSize: '0.75rem' }}
            >
              <Shield size={14} color="#dc2626" /> Admin
            </button>

            <button
              type="button"
              onClick={() => handleRoleQuickFill('security')}
              className="btn btn-secondary btn-sm"
              style={{ justifyContent: 'flex-start', padding: '0.45rem 0.6rem', fontSize: '0.75rem' }}
            >
              <UserCheck size={14} color="#059669" /> Security Guard
            </button>

            <button
              type="button"
              onClick={() => handleRoleQuickFill('employee')}
              className="btn btn-secondary btn-sm"
              style={{ justifyContent: 'flex-start', padding: '0.45rem 0.6rem', fontSize: '0.75rem' }}
            >
              <Briefcase size={14} color="#2563eb" /> Host Employee
            </button>

            <button
              type="button"
              onClick={() => handleRoleQuickFill('visitor')}
              className="btn btn-secondary btn-sm"
              style={{ justifyContent: 'flex-start', padding: '0.45rem 0.6rem', fontSize: '0.75rem' }}
            >
              <User size={14} color="#7c3aed" /> Visitor
            </button>
          </div>
        </div>

        {/* Error Alert Box */}
        {error && (
          <div
            style={{
              padding: '0.75rem',
              borderRadius: '8px',
              background: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#991b1b',
              fontSize: '0.82rem',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* Standard Login Form */}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="email"
                required
                className="form-input"
                style={{ paddingLeft: '2.4rem' }}
                placeholder="e.g. admin@techcorp.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="password"
                required
                className="form-input"
                style={{ paddingLeft: '2.4rem' }}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.7rem', fontSize: '0.9rem', marginTop: '0.5rem' }}
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        {/* Footer Navigation Links */}
        <div style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.82rem', color: '#64748b' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ fontWeight: 600, color: '#2563eb' }}>
            Register here
          </Link>
          <div style={{ marginTop: '0.5rem' }}>
            <Link to="/pre-register" style={{ color: '#475569', fontSize: '0.78rem' }}>
              Want to pre-register a visit without account?
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
