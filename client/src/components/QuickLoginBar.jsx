import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Shield, UserCheck, Briefcase, User, Sparkles, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

/**
 * ============================================================================
 * QUICK LOGIN DEMO BAR (Light & Classy Theme)
 * ============================================================================
 * 
 * Beginner Guide for Trainees:
 * - This top toolbar allows evaluators and developers to switch between all 4
 *   roles (Admin, Security, Employee, Visitor) with a single click.
 * - `useAuth()` provides `quickLogin(roleName)`, which sends pre-seeded credentials
 *   to `/api/auth/login` and saves the JWT token into localStorage.
 */
const QuickLoginBar = () => {
  const { user, quickLogin, logout, isAuthenticated } = useAuth();
  const [loadingRole, setLoadingRole] = useState('');
  const navigate = useNavigate();

  // Helper to trigger 1-click role switch
  const handleQuickLogin = async (roleName) => {
    try {
      setLoadingRole(roleName);
      await quickLogin(roleName);
      navigate('/dashboard');
    } catch (err) {
      console.error('Quick login failed:', err);
    } finally {
      setLoadingRole('');
    }
  };

  return (
    <div
      className="no-print"
      style={{
        background: '#f8fafc',
        color: '#334155',
        padding: '0.4rem 1.25rem',
        fontSize: '0.78rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.5rem',
        borderBottom: '1px solid #e2e8f0',
        zIndex: 50,
      }}
    >
      {/* Demo Tag */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span
          style={{
            background: '#eff6ff',
            color: '#2563eb',
            border: '1px solid #bfdbfe',
            fontWeight: 700,
            padding: '0.15rem 0.5rem',
            borderRadius: '6px',
            fontSize: '0.7rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem',
          }}
        >
          <Sparkles size={12} /> 1-CLICK DEMO BAR
        </span>
        <span style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 500 }}>Switch Role:</span>
      </div>

      {/* Role Buttons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
        {/* Admin Button */}
        <button
          onClick={() => handleQuickLogin('admin')}
          disabled={loadingRole !== ''}
          style={{
            background: user?.role === 'admin' ? '#fef2f2' : '#ffffff',
            color: user?.role === 'admin' ? '#dc2626' : '#475569',
            border: user?.role === 'admin' ? '1px solid #fecaca' : '1px solid #e2e8f0',
            padding: '0.22rem 0.6rem',
            borderRadius: '6px',
            fontSize: '0.75rem',
            fontWeight: user?.role === 'admin' ? 700 : 500,
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            cursor: 'pointer',
            boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
          }}
        >
          <Shield size={13} color={user?.role === 'admin' ? '#dc2626' : '#ef4444'} />
          Admin {user?.role === 'admin' && '✓'}
        </button>

        {/* Security Guard Button */}
        <button
          onClick={() => handleQuickLogin('security')}
          disabled={loadingRole !== ''}
          style={{
            background: user?.role === 'security' ? '#ecfdf5' : '#ffffff',
            color: user?.role === 'security' ? '#059669' : '#475569',
            border: user?.role === 'security' ? '1px solid #a7f3d0' : '1px solid #e2e8f0',
            padding: '0.22rem 0.6rem',
            borderRadius: '6px',
            fontSize: '0.75rem',
            fontWeight: user?.role === 'security' ? 700 : 500,
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            cursor: 'pointer',
            boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
          }}
        >
          <UserCheck size={13} color={user?.role === 'security' ? '#059669' : '#10b981'} />
          Security {user?.role === 'security' && '✓'}
        </button>

        {/* Host / Employee Button */}
        <button
          onClick={() => handleQuickLogin('employee')}
          disabled={loadingRole !== ''}
          style={{
            background: user?.role === 'employee' ? '#eff6ff' : '#ffffff',
            color: user?.role === 'employee' ? '#2563eb' : '#475569',
            border: user?.role === 'employee' ? '1px solid #bfdbfe' : '1px solid #e2e8f0',
            padding: '0.22rem 0.6rem',
            borderRadius: '6px',
            fontSize: '0.75rem',
            fontWeight: user?.role === 'employee' ? 700 : 500,
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            cursor: 'pointer',
            boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
          }}
        >
          <Briefcase size={13} color={user?.role === 'employee' ? '#2563eb' : '#3b82f6'} />
          Host / Employee {user?.role === 'employee' && '✓'}
        </button>

        {/* Visitor Button */}
        <button
          onClick={() => handleQuickLogin('visitor')}
          disabled={loadingRole !== ''}
          style={{
            background: user?.role === 'visitor' ? '#f5f3ff' : '#ffffff',
            color: user?.role === 'visitor' ? '#7c3aed' : '#475569',
            border: user?.role === 'visitor' ? '1px solid #ddd6fe' : '1px solid #e2e8f0',
            padding: '0.22rem 0.6rem',
            borderRadius: '6px',
            fontSize: '0.75rem',
            fontWeight: user?.role === 'visitor' ? 700 : 500,
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            cursor: 'pointer',
            boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
          }}
        >
          <User size={13} color={user?.role === 'visitor' ? '#7c3aed' : '#8b5cf6'} />
          Visitor {user?.role === 'visitor' && '✓'}
        </button>

        {/* Logout (Visible if logged in) */}
        {isAuthenticated && (
          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            style={{
              background: 'transparent',
              color: '#64748b',
              border: '1px solid transparent',
              padding: '0.2rem 0.4rem',
              fontSize: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
              cursor: 'pointer',
              marginLeft: '0.25rem',
            }}
            title="Log Out"
          >
            <LogOut size={12} /> Log Out
          </button>
        )}
      </div>
    </div>
  );
};

export default QuickLoginBar;
