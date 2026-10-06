import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  CalendarCheck,
  CreditCard,
  QrCode,
  BarChart3,
  Users,
  UserCircle,
  PlusCircle,
} from 'lucide-react';

/**
 * ============================================================================
 * SIDEBAR COMPONENT (Light & Classy Theme)
 * ============================================================================
 * 
 * Beginner Guide for Trainees:
 * 1. Role-Based Navigation: We list all app links in the `navItems` array.
 * 2. Each link specifies which user `roles` are allowed to see it.
 * 3. We filter `navItems` against `user.role` so users only see their pages.
 * 4. NavLink provides `isActive` automatically to highlight the current page.
 */
const Sidebar = () => {
  const { user } = useAuth();
  const role = user?.role || 'visitor';

  // Define all available navigation routes and who has access to them
  const navItems = [
    {
      title: 'Dashboard',
      path: '/dashboard',
      icon: <LayoutDashboard size={18} />,
      roles: ['admin', 'security', 'employee', 'visitor'],
    },
    {
      title: 'Appointments',
      path: '/appointments',
      icon: <CalendarCheck size={18} />,
      roles: ['admin', 'security', 'employee', 'visitor'],
    },
    {
      title: 'Visitor Passes',
      path: '/passes',
      icon: <CreditCard size={18} />,
      roles: ['admin', 'security', 'employee', 'visitor'],
    },
    {
      title: 'Check-In / Out',
      path: '/check-in-out',
      icon: <QrCode size={18} />,
      roles: ['admin', 'security'],
      badge: 'Scanner',
    },
    {
      title: 'Reports & Analytics',
      path: '/reports',
      icon: <BarChart3 size={18} />,
      roles: ['admin', 'security'],
    },
    {
      title: 'Staff Management',
      path: '/users',
      icon: <Users size={18} />,
      roles: ['admin'],
    },
    {
      title: 'My Profile',
      path: '/profile',
      icon: <UserCircle size={18} />,
      roles: ['admin', 'security', 'employee', 'visitor'],
    },
  ];

  // Only show menu items permitted for the current user's role
  const visibleNavItems = navItems.filter((item) => item.roles.includes(role));

  return (
    <aside
      style={{
        width: '240px',
        backgroundColor: '#ffffff',
        color: '#475569',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '1.25rem 0.75rem',
        borderRight: '1px solid #e2e8f0',
        minHeight: 'calc(100vh - 45px)',
      }}
    >
      <div>
        {/* Role Badge Indicator */}
        <div
          style={{
            padding: '0.25rem 0.75rem 1rem',
            fontSize: '0.72rem',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            color: '#64748b',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span>PORTAL</span>
          <span
            style={{
              background: '#f1f5f9',
              color: '#334155',
              padding: '0.15rem 0.5rem',
              borderRadius: '6px',
              fontSize: '0.68rem',
              fontWeight: 700,
              border: '1px solid #e2e8f0',
            }}
          >
            {role.toUpperCase()}
          </span>
        </div>

        {/* Navigation Link Items */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          {visibleNavItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.625rem 0.85rem',
                borderRadius: '8px',
                fontSize: '0.86rem',
                fontWeight: isActive ? 600 : 500,
                color: isActive ? '#2563eb' : '#475569',
                backgroundColor: isActive ? '#eff6ff' : 'transparent',
                borderLeft: isActive ? '3px solid #2563eb' : '3px solid transparent',
                textDecoration: 'none',
                transition: 'all 0.15s ease',
              })}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                {item.icon}
                <span>{item.title}</span>
              </div>
              {item.badge && (
                <span
                  style={{
                    background: '#ecfdf5',
                    color: '#059669',
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    padding: '0.1rem 0.4rem',
                    borderRadius: '4px',
                    border: '1px solid #a7f3d0',
                  }}
                >
                  {item.badge}
                </span>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Quick Action Footer Card */}
      <div
        style={{
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '10px',
          padding: '0.85rem',
        }}
      >
        <div style={{ fontSize: '0.75rem', color: '#334155', fontWeight: 600, marginBottom: '0.4rem' }}>
          Pre-Registration
        </div>
        <p style={{ fontSize: '0.7rem', color: '#64748b', marginBottom: '0.6rem' }}>
          Invite guests or register before arrival.
        </p>
        <NavLink
          to="/pre-register"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.4rem',
            width: '100%',
            background: '#ffffff',
            color: '#2563eb',
            border: '1px solid #cbd5e1',
            padding: '0.45rem',
            borderRadius: '6px',
            fontSize: '0.78rem',
            fontWeight: 600,
            textDecoration: 'none',
            boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
          }}
        >
          <PlusCircle size={14} /> Book Visitor Pass
        </NavLink>
      </div>
    </aside>
  );
};

export default Sidebar;
