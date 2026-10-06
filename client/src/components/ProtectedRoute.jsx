import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * ============================================================================
 * PROTECTED ROUTE GUARD COMPONENT
 * ============================================================================
 * 
 * Beginner Guide for Trainees:
 * 1. What does this component do?
 *    - Wraps private routes in React Router.
 *    - Check 1: If user is not logged in, redirect them to `/login`.
 *    - Check 2: If `allowedRoles` is set (e.g. ['admin']), verify `user.role`.
 *      If unauthorized, displays a clean 403 Forbidden screen.
 *    - Check 3: If valid, renders the `children` page component.
 */
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  // 1. Show loading spinner while token is being verified
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'var(--bg-main)' }}>
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              border: '3px solid #e2e8f0',
              borderTop: '3px solid #2563eb',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 0.75rem',
            }}
          />
          <p style={{ color: '#64748b', fontSize: '0.85rem' }}>Verifying security session...</p>
        </div>
      </div>
    );
  }

  // 2. Redirect unauthenticated visitors to login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 3. Block unauthorized role access
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return (
      <div style={{ padding: '4rem 1.5rem', textAlign: 'center', maxWidth: '500px', margin: '0 auto' }}>
        <div className="card" style={{ padding: '2rem', border: '1px solid #fecaca', background: '#fff' }}>
          <h2 style={{ color: '#dc2626', fontSize: '1.4rem', marginBottom: '0.5rem' }}>403 - Access Forbidden</h2>
          <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
            Your account role (<strong>{user.role}</strong>) does not have permission to view this section.
          </p>
          <a href="/dashboard" className="btn btn-primary btn-sm">
            Return to Dashboard
          </a>
        </div>
      </div>
    );
  }

  // 4. Access Granted
  return children;
};

export default ProtectedRoute;
