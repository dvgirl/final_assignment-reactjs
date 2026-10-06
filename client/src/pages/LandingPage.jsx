import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  QrCode,
  CalendarCheck,
  Building2,
  Lock,
  ArrowRight,
  Search,
  CheckCircle,
  FileBadge,
  Sparkles
} from 'lucide-react';

const LandingPage = () => {
  const [passLookupCode, setPassLookupCode] = useState('');
  const navigate = useNavigate();

  const handleLookup = (e) => {
    e.preventDefault();
    if (passLookupCode.trim()) {
      navigate(`/pass/${passLookupCode.trim().toUpperCase()}`);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#f8fafc' }}>
      {/* Hero Section */}
      <section
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)',
          color: '#ffffff',
          padding: '4.5rem 1.5rem 4rem',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ maxWidth: '900px', margin: '0 auto', position: 'relative', zIndex: 10 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              background: 'rgba(255, 255, 255, 0.12)',
              backdropFilter: 'blur(8px)',
              padding: '0.35rem 0.9rem',
              borderRadius: '20px',
              fontSize: '0.8rem',
              fontWeight: 600,
              marginBottom: '1.25rem',
              border: '1px solid rgba(255, 255, 255, 0.2)',
            }}
          >
            <Sparkles size={14} color="#60a5fa" /> Smart & Touchless Workplace Entry
          </div>

          <h1
            style={{
              fontSize: 'clamp(2.2rem, 5vw, 3.5rem)',
              fontWeight: 800,
              color: '#ffffff',
              lineHeight: 1.15,
              marginBottom: '1.25rem',
            }}
          >
            Modern Visitor Pass & Access Management
          </h1>

          <p
            style={{
              fontSize: 'clamp(1rem, 2vw, 1.2rem)',
              color: '#cbd5e1',
              maxWidth: '680px',
              margin: '0 auto 2.25rem',
              lineHeight: 1.6,
            }}
          >
            Replace manual logbooks with secure QR-code digital badges, pre-registration workflows, real-time security check-ins, and automated email/SMS notifications.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap', marginBottom: '2.5rem' }}>
            <Link to="/pre-register" className="btn btn-primary btn-lg" style={{ boxShadow: '0 10px 25px rgba(37,99,235,0.4)' }}>
              Pre-Register as Visitor <ArrowRight size={18} />
            </Link>
            <Link to="/login" className="btn btn-secondary btn-lg" style={{ background: 'rgba(255,255,255,0.9)' }}>
              Staff & Admin Portal
            </Link>
          </div>

          {/* Quick Pass Lookup Box */}
          <div
            style={{
              maxWidth: '520px',
              margin: '0 auto',
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(12px)',
              padding: '1rem',
              borderRadius: '14px',
              border: '1px solid rgba(255, 255, 255, 0.2)',
            }}
          >
            <form onSubmit={handleLookup} style={{ display: 'flex', gap: '0.5rem' }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <Search size={18} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  placeholder="Enter Pass # (e.g. VP-2026-100101)"
                  value={passLookupCode}
                  onChange={(e) => setPassLookupCode(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.75rem 0.65rem 2.4rem',
                    borderRadius: '8px',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    background: '#ffffff',
                    color: '#0f172a',
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    textTransform: 'uppercase',
                  }}
                />
              </div>
              <button type="submit" className="btn btn-primary" style={{ background: '#2563eb' }}>
                Verify Pass
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Role Features Grid */}
      <section style={{ padding: '4rem 1.5rem', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a' }}>
            Seamless Architecture for Every Role
          </h2>
          <p style={{ color: '#64748b', marginTop: '0.5rem' }}>
            Built specifically to solve paper logs and provide end-to-end security compliance
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem' }}>
          {/* Card 1: Admin */}
          <div className="card" style={{ borderTop: '4px solid #ef4444' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444', marginBottom: '1rem' }}>
              <Building2 size={22} />
            </div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Admin Control Center</h3>
            <p style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: 1.5, marginBottom: '1rem' }}>
              Manage all department employees, gate security officers, export CSV audit logs, and monitor analytics.
            </p>
            <ul style={{ fontSize: '0.8rem', color: '#475569', listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <li>✓ Staff onboarding & roles</li>
              <li>✓ Audit reports & CSV export</li>
              <li>✓ Multi-gate oversight</li>
            </ul>
          </div>

          {/* Card 2: Security */}
          <div className="card" style={{ borderTop: '4px solid #10b981' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981', marginBottom: '1rem' }}>
              <QrCode size={22} />
            </div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Security & Frontdesk</h3>
            <p style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: 1.5, marginBottom: '1rem' }}>
              Lightning fast QR code scanning for instantaneous check-in and check-out with belongings tracking.
            </p>
            <ul style={{ fontSize: '0.8rem', color: '#475569', listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <li>✓ Webcam & scanner check-in</li>
              <li>✓ On-spot walk-in pass issuance</li>
              <li>✓ Live in-building headcount</li>
            </ul>
          </div>

          {/* Card 3: Host Employee */}
          <div className="card" style={{ borderTop: '4px solid #2563eb' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb', marginBottom: '1rem' }}>
              <CalendarCheck size={22} />
            </div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Host Employees</h3>
            <p style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: 1.5, marginBottom: '1rem' }}>
              Invite guests directly, review pre-registration requests with 1-click approvals, and receive arrival alerts.
            </p>
            <ul style={{ fontSize: '0.8rem', color: '#475569', listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <li>✓ 1-Click invite & approval</li>
              <li>✓ Auto QR pass dispatch</li>
              <li>✓ Instant arrival SMS & email</li>
            </ul>
          </div>

          {/* Card 4: Visitor */}
          <div className="card" style={{ borderTop: '4px solid #8b5cf6' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: '#ede9fe', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8b5cf6', marginBottom: '1rem' }}>
              <FileBadge size={22} />
            </div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Visitors & Guests</h3>
            <p style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: 1.5, marginBottom: '1rem' }}>
              Self-register prior to arrival, verify via phone OTP, download printable PDF badges, and view pass status.
            </p>
            <ul style={{ fontSize: '0.8rem', color: '#475569', listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <li>✓ Instant self pre-registration</li>
              <li>✓ Downloadable PDF badge</li>
              <li>✓ Touchless QR entry</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ marginTop: 'auto', background: '#0f172a', color: '#94a3b8', padding: '2rem 1.5rem', textAlign: 'center', fontSize: '0.85rem', borderTop: '1px solid #1e293b' }}>
        <p>© 2026 PassTrack - MERN Visitor Pass Management System. Built for Tutedude Fullstack Assignment.</p>
        <p style={{ fontSize: '0.75rem', marginTop: '0.5rem', color: '#64748b' }}>
          Tech Stack: MongoDB • Express.js • React • Node.js • JWT • QR Code • PDFKit
        </p>
      </footer>
    </div>
  );
};

export default LandingPage;
