import React, { useState, useEffect } from 'react';
import { passesAPI, usersAPI } from '../api/api';
import { useAuth } from '../context/AuthContext';
import PassBadge from '../components/PassBadge';
import {
  CreditCard,
  Search,
  Plus,
  QrCode,
  Download,
  Eye,
  X,
  User,
  Building,
  Sparkles,
  Calendar,
  CheckCircle2
} from 'lucide-react';

const PassesPage = () => {
  const { user } = useAuth();
  const role = user?.role || 'visitor';

  const [passes, setPasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Selected Pass for Modal Badge
  const [selectedPass, setSelectedPass] = useState(null);

  // Walk-in Pass Issuance Modal State
  const [isWalkInModalOpen, setIsWalkInModalOpen] = useState(false);
  const [hosts, setHosts] = useState([]);
  const [walkInData, setWalkInData] = useState({
    fullName: '',
    phone: '',
    email: '',
    company: '',
    hostId: '',
    purpose: 'Official Visit',
    gateNumber: 'Main Entrance - Gate 1',
    durationHours: 8,
  });

  useEffect(() => {
    fetchPasses();
    fetchHosts();
  }, [statusFilter]);

  const fetchPasses = async () => {
    setLoading(true);
    try {
      const params = {};
      if (statusFilter !== 'All') params.status = statusFilter;
      const res = await passesAPI.getAll(params);
      if (res.success) {
        setPasses(res.passes || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchHosts = async () => {
    try {
      const res = await usersAPI.getHosts();
      if (res.success && res.hosts) {
        setHosts(res.hosts);
        if (res.hosts.length > 0) {
          setWalkInData((prev) => ({ ...prev, hostId: res.hosts[0]._id }));
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleIssueWalkInPass = async (e) => {
    e.preventDefault();
    try {
      const res = await passesAPI.issueWalkIn(walkInData);
      if (res.success) {
        setIsWalkInModalOpen(false);
        fetchPasses();
        setSelectedPass(res.pass);
      }
    } catch (err) {
      alert(err.message || 'Error issuing pass');
    }
  };

  const filteredPasses = passes.filter((p) => {
    if (!searchTerm) return true;
    const s = searchTerm.toLowerCase();
    return (
      p.passCode?.toLowerCase().includes(s) ||
      p.visitor?.fullName?.toLowerCase().includes(s) ||
      p.visitor?.company?.toLowerCase().includes(s) ||
      p.host?.name?.toLowerCase().includes(s)
    );
  });

  return (
    <div className="page-wrapper">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Digital Visitor Passes</h1>
          <p style={{ color: '#64748b', fontSize: '0.88rem' }}>
            QR Code Badges, verification details, and printable security cards
          </p>
        </div>

        {(role === 'admin' || role === 'security') && (
          <button onClick={() => setIsWalkInModalOpen(true)} className="btn btn-primary">
            <Plus size={16} /> Issue On-Spot Walk-In Pass
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="card" style={{ padding: '1rem 1.25rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ position: 'relative', minWidth: '280px', flex: 1 }}>
            <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search by Pass Code (VP-...) or Visitor name..."
              className="form-input"
              style={{ paddingLeft: '2rem' }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            {['All', 'Active', 'CheckedIn', 'Completed', 'Expired'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                style={{
                  padding: '0.4rem 0.8rem',
                  borderRadius: '6px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  border: '1px solid',
                  borderColor: statusFilter === status ? '#2563eb' : '#cbd5e1',
                  background: statusFilter === status ? '#2563eb' : '#ffffff',
                  color: statusFilter === status ? '#ffffff' : '#475569',
                  cursor: 'pointer',
                }}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Passes Grid */}
      {loading ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
          Loading passes...
        </div>
      ) : filteredPasses.length === 0 ? (
        <div className="card" style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
          No digital passes found matching your search.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {filteredPasses.map((pass) => (
            <div
              key={pass._id}
              className="card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '1.25rem',
                borderTop: `4px solid ${pass.status === 'Active' ? '#10b981' : pass.status === 'CheckedIn' ? '#2563eb' : '#94a3b8'}`,
                position: 'relative',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <span
                    style={{
                      background: '#f1f5f9',
                      padding: '0.2rem 0.5rem',
                      borderRadius: '4px',
                      fontWeight: 700,
                      fontSize: '0.8rem',
                      color: '#0f172a',
                    }}
                  >
                    #{pass.passCode}
                  </span>

                  <span className={`badge badge-${pass.status.toLowerCase()}`}>
                    {pass.status}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                  <div
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '50%',
                      background: '#e0e7ff',
                      color: '#4338ca',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: '1rem',
                      flexShrink: 0,
                    }}
                  >
                    {pass.visitor?.fullName?.charAt(0) || 'V'}
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>{pass.visitor?.fullName || 'Visitor'}</h3>
                    <p style={{ fontSize: '0.75rem', color: '#64748b' }}>{pass.visitor?.company || 'Independent'}</p>
                  </div>
                </div>

                <div style={{ fontSize: '0.78rem', color: '#475569', display: 'flex', flexDirection: 'column', gap: '0.35rem', marginBottom: '1rem', borderTop: '1px solid #f1f5f9', paddingTop: '0.75rem' }}>
                  <div><strong>Host:</strong> {pass.host?.name} ({pass.host?.department})</div>
                  <div><strong>Gate:</strong> {pass.gateNumber}</div>
                  <div><strong>Valid Until:</strong> {new Date(pass.validUntil).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', borderTop: '1px solid #f1f5f9', paddingTop: '0.75rem' }}>
                <button
                  onClick={() => setSelectedPass(pass)}
                  className="btn btn-primary btn-sm"
                  style={{ flex: 1, padding: '0.4rem 0.6rem', fontSize: '0.75rem' }}
                >
                  <Eye size={13} /> View Badge
                </button>
                <a
                  href={passesAPI.getPdfUrl(pass.passCode || pass._id)}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-secondary btn-sm"
                  style={{ padding: '0.4rem 0.6rem', fontSize: '0.75rem' }}
                  title="Download PDF"
                >
                  <Download size={13} />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Walk-in On-Spot Pass Modal */}
      {isWalkInModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem',
          }}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              width: '100%',
              maxWidth: '540px',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            }}
          >
            <div
              style={{
                padding: '1.25rem 1.5rem',
                borderBottom: '1px solid #e2e8f0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: 'linear-gradient(135deg, #1e3a8a, #2563eb)',
                color: '#ffffff',
                borderTopLeftRadius: '16px',
                borderTopRightRadius: '16px',
              }}
            >
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#fff' }}>Issue On-Spot Walk-In Pass</h3>
                <p style={{ fontSize: '0.75rem', opacity: 0.9 }}>Frontdesk fast issuance for unregistered visitors</p>
              </div>
              <button
                onClick={() => setIsWalkInModalOpen(false)}
                style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '50%', color: '#fff', width: '30px', height: '30px', cursor: 'pointer' }}
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleIssueWalkInPass} style={{ padding: '1.5rem' }}>
              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Visitor Full Name *</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    placeholder="e.g. Mike Ross"
                    value={walkInData.fullName}
                    onChange={(e) => setWalkInData({ ...walkInData, fullName: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    className="form-input"
                    placeholder="+1 555-0133"
                    value={walkInData.phone}
                    onChange={(e) => setWalkInData({ ...walkInData, phone: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Visitor Company</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Pearson Hardman"
                    value={walkInData.company}
                    onChange={(e) => setWalkInData({ ...walkInData, company: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Email (Optional)</label>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="mike@example.com"
                    value={walkInData.email}
                    onChange={(e) => setWalkInData({ ...walkInData, email: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Host Employee to Visit *</label>
                  <select
                    className="form-select"
                    value={walkInData.hostId}
                    onChange={(e) => setWalkInData({ ...walkInData, hostId: e.target.value })}
                  >
                    {hosts.map((h) => (
                      <option key={h._id} value={h._id}>
                        {h.name} ({h.department})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Entry Gate</label>
                  <select
                    className="form-select"
                    value={walkInData.gateNumber}
                    onChange={(e) => setWalkInData({ ...walkInData, gateNumber: e.target.value })}
                  >
                    <option value="Main Entrance - Gate 1">Main Entrance - Gate 1</option>
                    <option value="East Gate - Tower B">East Gate - Tower B</option>
                    <option value="Service Gate 3">Service Gate 3</option>
                  </select>
                </div>
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Purpose of Visit</label>
                  <input
                    type="text"
                    className="form-input"
                    value={walkInData.purpose}
                    onChange={(e) => setWalkInData({ ...walkInData, purpose: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Valid Duration (Hours)</label>
                  <input
                    type="number"
                    min={1}
                    max={24}
                    className="form-input"
                    value={walkInData.durationHours}
                    onChange={(e) => setWalkInData({ ...walkInData, durationHours: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="button" onClick={() => setIsWalkInModalOpen(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Print & Issue Pass
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Selected Pass Badge Modal */}
      {selectedPass && (
        <div
          className="pass-modal-overlay"
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem',
          }}
        >
          <div
            className="pass-modal-card"
            style={{
              background: '#ffffff',
              borderRadius: '20px',
              padding: '2rem',
              maxWidth: '440px',
              width: '100%',
              position: 'relative',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            }}
          >
            <button
              className="no-print"
              onClick={() => setSelectedPass(null)}
              style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                background: '#f1f5f9',
                border: 'none',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <X size={18} />
            </button>

            <PassBadge pass={selectedPass} />
          </div>
        </div>
      )}
    </div>
  );
};

export default PassesPage;
