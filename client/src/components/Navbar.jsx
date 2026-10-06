import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { reportsAPI } from '../api/api';
import {
  Shield,
  Bell,
  User,
  LogOut,
  QrCode,
  MapPin,
  CheckCircle,
  ExternalLink,
  ChevronDown
} from 'lucide-react';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 15000); // refresh every 15s
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  const fetchNotifications = async () => {
    try {
      const res = await reportsAPI.getNotifications();
      if (res.success) {
        setNotifications(res.notifications || []);
      }
    } catch {
      // ignore in silent polling
    }
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'admin': return '#ef4444';
      case 'security': return '#10b981';
      case 'employee': return '#2563eb';
      case 'visitor': return '#8b5cf6';
      default: return '#64748b';
    }
  };

  return (
    <header
      style={{
        background: '#ffffff',
        borderBottom: '1px solid var(--border-color)',
        padding: '0.75rem 2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 40,
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
      }}
    >
      {/* Left Brand */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        <Link
          to={isAuthenticated ? '/dashboard' : '/'}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            textDecoration: 'none',
            color: 'inherit',
          }}
        >
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 2px 6px rgba(37,99,235,0.3)',
            }}
          >
            <Shield size={20} />
          </div>
          <div>
            <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
              Pass<span style={{ color: '#2563eb' }}>Track</span>
            </span>
            <span style={{ display: 'block', fontSize: '0.65rem', color: '#64748b', marginTop: '-4px', fontWeight: 500 }}>
              Visitor Pass Management
            </span>
          </div>
        </Link>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.35rem',
          background: '#f1f5f9',
          padding: '0.3rem 0.75rem',
          borderRadius: '20px',
          fontSize: '0.75rem',
          color: '#475569',
          fontWeight: 500,
        }}>
          <MapPin size={13} color="#2563eb" />
          <span>TechCorp HQ • Gate 1</span>
        </div>
      </div>

      {/* Right Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <Link
          to="/pre-register"
          className="btn btn-secondary btn-sm"
          style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
        >
          <ExternalLink size={14} /> Pre-Register Guest
        </Link>

        {isAuthenticated ? (
          <>
            {/* Notification Bell */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => {
                  setShowNotifDropdown(!showNotifDropdown);
                  setShowUserDropdown(false);
                }}
                style={{
                  background: '#f8fafc',
                  border: '1px solid var(--border-color)',
                  borderRadius: '50%',
                  width: '38px',
                  height: '38px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  cursor: 'pointer',
                  color: '#475569',
                }}
                title="System Notifications"
              >
                <Bell size={18} />
                {notifications.length > 0 && (
                  <span
                    style={{
                      position: 'absolute',
                      top: '-2px',
                      right: '-2px',
                      background: '#ef4444',
                      color: 'white',
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      width: '18px',
                      height: '18px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '2px solid #fff',
                    }}
                  >
                    {notifications.length > 9 ? '9+' : notifications.length}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {showNotifDropdown && (
                <div
                  style={{
                    position: 'absolute',
                    top: '48px',
                    right: 0,
                    width: '340px',
                    background: '#ffffff',
                    border: '1px solid var(--border-color)',
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
                    padding: '1rem',
                    zIndex: 100,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0f172a' }}>Live System Alerts</span>
                    <span style={{ fontSize: '0.75rem', color: '#2563eb', fontWeight: 600 }}>Email & SMS</span>
                  </div>

                  <div style={{ maxHeight: '280px', overflowY: 'auto' }}>
                    {notifications.length === 0 ? (
                      <p style={{ fontSize: '0.8rem', color: '#94a3b8', textAlign: 'center', padding: '1rem 0' }}>
                        No new notifications
                      </p>
                    ) : (
                      notifications.map((n, i) => (
                        <div
                          key={n.id || i}
                          style={{
                            padding: '0.6rem 0.5rem',
                            borderBottom: '1px solid #f1f5f9',
                            fontSize: '0.78rem',
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                            <span style={{
                              fontWeight: 600,
                              color: n.type === 'EMAIL' ? '#2563eb' : '#10b981',
                              fontSize: '0.7rem',
                            }}>
                              [{n.type}] {n.subject}
                            </span>
                            <span style={{ fontSize: '0.65rem', color: '#94a3b8' }}>
                              {new Date(n.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p style={{ color: '#475569', fontSize: '0.75rem', margin: '2px 0' }}>{n.preview}</p>
                          <span style={{ fontSize: '0.7rem', color: '#64748b' }}>To: {n.recipient}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User Profile Pill */}
            <div style={{ position: 'relative' }}>
              <div
                onClick={() => {
                  setShowUserDropdown(!showUserDropdown);
                  setShowNotifDropdown(false);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  padding: '0.35rem 0.75rem',
                  background: '#f8fafc',
                  border: '1px solid var(--border-color)',
                  borderRadius: '24px',
                  cursor: 'pointer',
                }}
              >
                <div
                  style={{
                    width: '30px',
                    height: '30px',
                    borderRadius: '50%',
                    background: getRoleBadgeColor(user.role),
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '0.8rem',
                  }}
                >
                  {user.name.charAt(0)}
                </div>
                <div style={{ textAlign: 'left', lineHeight: 1.2 }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#0f172a' }}>{user.name}</div>
                  <div style={{
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    color: getRoleBadgeColor(user.role),
                    textTransform: 'uppercase'
                  }}>
                    {user.role}
                  </div>
                </div>
                <ChevronDown size={14} color="#64748b" />
              </div>

              {/* User Dropdown */}
              {showUserDropdown && (
                <div
                  style={{
                    position: 'absolute',
                    top: '48px',
                    right: 0,
                    width: '200px',
                    background: '#ffffff',
                    border: '1px solid var(--border-color)',
                    borderRadius: '10px',
                    boxShadow: '0 10px 20px rgba(0,0,0,0.1)',
                    padding: '0.5rem',
                    zIndex: 100,
                  }}
                >
                  <Link
                    to="/profile"
                    onClick={() => setShowUserDropdown(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.5rem 0.75rem',
                      color: '#334155',
                      fontSize: '0.82rem',
                      borderRadius: '6px',
                      textDecoration: 'none',
                    }}
                  >
                    <User size={15} /> My Profile
                  </Link>

                  <button
                    onClick={() => {
                      logout();
                      navigate('/login');
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.5rem 0.75rem',
                      color: '#ef4444',
                      fontSize: '0.82rem',
                      borderRadius: '6px',
                      width: '100%',
                      background: 'none',
                      border: 'none',
                      textAlign: 'left',
                      cursor: 'pointer',
                    }}
                  >
                    <LogOut size={15} /> Log Out
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Link to="/login" className="btn btn-primary btn-sm">
              Log In
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
