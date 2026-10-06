import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { reportsAPI, appointmentsAPI, checkLogsAPI } from '../api/api';
import StatsCard from '../components/StatsCard';
import PassBadge from '../components/PassBadge';
import QRScannerModal from '../components/QRScannerModal';
import {
  Users,
  CreditCard,
  Building,
  Clock,
  CheckCircle2,
  XCircle,
  QrCode,
  CalendarPlus,
  ArrowRight,
  Shield,
  Download,
  AlertCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useAuth();
  const role = user?.role || 'visitor';

  const [stats, setStats] = useState(null);
  const [activeLogs, setActiveLogs] = useState([]);
  const [pendingAppointments, setPendingAppointments] = useState([]);
  const [myPass, setMyPass] = useState(null);
  const [loading, setLoading] = useState(true);

  // Scanner modal state for security
  const [scannerOpen, setScannerOpen] = useState(false);
  const [scannerMode, setScannerMode] = useState('check-in');

  useEffect(() => {
    loadDashboardData();
  }, [role]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // 1. Load Stats
      const statsRes = await reportsAPI.getStats();
      if (statsRes.success) {
        setStats(statsRes.stats);
      }

      // 2. Load active check logs for Security & Admin
      if (role === 'security' || role === 'admin') {
        const activeRes = await checkLogsAPI.getActive();
        if (activeRes.success) {
          setActiveLogs(activeRes.logs || []);
        }
      }

      // 3. Load pending appointments for Employee & Admin
      if (role === 'employee' || role === 'admin') {
        const apptRes = await appointmentsAPI.getAll({ status: 'Pending' });
        if (apptRes.success) {
          setPendingAppointments(apptRes.appointments || []);
        }
      }
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveReject = async (appointmentId, status, rejectionReason = '') => {
    try {
      await appointmentsAPI.updateStatus(appointmentId, { status, rejectionReason });
      loadDashboardData();
    } catch (err) {
      alert(err.message || 'Error updating status');
    }
  };

  const openScanner = (mode) => {
    setScannerMode(mode);
    setScannerOpen(true);
  };

  return (
    <div className="page-wrapper">
      {/* Top Banner Header */}
      <div
        style={{
          background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)',
          color: '#ffffff',
          borderRadius: '16px',
          padding: '1.75rem 2rem',
          marginBottom: '2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          boxShadow: '0 10px 20px rgba(37,99,235,0.15)',
        }}
      >
        <div>
          <div style={{ display: 'inline-block', background: 'rgba(255,255,255,0.15)', padding: '0.2rem 0.6rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.5rem' }}>
            {role.toUpperCase()} PORTAL
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ffffff' }}>
            Welcome back, {user?.name}!
          </h1>
          <p style={{ opacity: 0.9, fontSize: '0.88rem', marginTop: '0.25rem' }}>
            {role === 'admin' && 'Enterprise Visitor Management System Overview & Controls'}
            {role === 'security' && 'Live Security Gate Command Center • QR Verification & Check-In/Out'}
            {role === 'employee' && 'Host Management • Approve Visitor Requests & Issue Invites'}
            {role === 'visitor' && 'Visitor Pass Hub • View Your Digital Badges & Appointments'}
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
          {role === 'security' && (
            <>
              <button
                onClick={() => openScanner('check-in')}
                className="btn btn-success btn-sm"
                style={{ boxShadow: '0 4px 10px rgba(16,185,129,0.3)', padding: '0.6rem 1rem' }}
              >
                <QrCode size={16} /> QR Check-In Scan
              </button>
              <button
                onClick={() => openScanner('check-out')}
                className="btn btn-danger btn-sm"
                style={{ padding: '0.6rem 1rem' }}
              >
                <QrCode size={16} /> QR Check-Out Scan
              </button>
            </>
          )}

          {role === 'employee' && (
            <Link to="/appointments" className="btn btn-secondary btn-sm" style={{ background: '#fff', color: '#1e3a8a' }}>
              <CalendarPlus size={16} /> Schedule / Invite Visitor
            </Link>
          )}

          {role === 'visitor' && (
            <Link to="/pre-register" className="btn btn-secondary btn-sm" style={{ background: '#fff', color: '#1e3a8a' }}>
              <CalendarPlus size={16} /> Book New Appointment
            </Link>
          )}

          {role === 'admin' && (
            <a
              href={reportsAPI.getCsvUrl()}
              download
              className="btn btn-secondary btn-sm"
              style={{ background: '#ffffff', color: '#1e3a8a' }}
            >
              <Download size={15} /> Export CSV Audit Logs
            </a>
          )}
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1.25rem',
          marginBottom: '2rem',
        }}
      >
        <StatsCard
          title="Total Visitors"
          value={stats?.totalVisitors || 0}
          icon={<Users size={24} />}
          subtitle="Registered profiles"
          color="blue"
        />

        <StatsCard
          title="Total Passes Issued"
          value={stats?.totalPasses || 0}
          icon={<CreditCard size={24} />}
          subtitle="Digital QR Badges"
          color="purple"
        />

        <StatsCard
          title="Active Inside Building"
          value={stats?.activeInside || 0}
          icon={<Building size={24} />}
          subtitle="Live on-site headcount"
          color="green"
        />

        <StatsCard
          title="Pending Approvals"
          value={stats?.pendingAppointments || 0}
          icon={<Clock size={24} />}
          subtitle="Awaiting host confirmation"
          color="amber"
        />
      </div>

      {/* Role-Specific Content Sections */}

      {/* 1. Host Employee / Admin Pending Approvals Box */}
      {(role === 'employee' || role === 'admin') && pendingAppointments.length > 0 && (
        <div className="card" style={{ marginBottom: '2rem', borderLeft: '5px solid #f59e0b' }}>
          <div className="card-header">
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>
                Pending Visitor Appointment Requests ({pendingAppointments.length})
              </h3>
              <p style={{ fontSize: '0.8rem', color: '#64748b' }}>
                Review and approve guests requesting to visit you
              </p>
            </div>
            <span className="badge badge-pending">Requires Action</span>
          </div>

          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Visitor Name</th>
                  <th>Company</th>
                  <th>Purpose</th>
                  <th>Requested Date & Time</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingAppointments.map((appt) => (
                  <tr key={appt._id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{appt.visitor?.fullName}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{appt.visitor?.email}</div>
                    </td>
                    <td>{appt.visitor?.company || 'Individual'}</td>
                    <td><span className="badge badge-pending">{appt.purpose}</span></td>
                    <td>
                      {new Date(appt.visitDate).toLocaleDateString()} at {appt.visitTime}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <button
                          onClick={() => handleApproveReject(appt._id, 'Approved')}
                          className="btn btn-success btn-sm"
                          style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem' }}
                        >
                          <CheckCircle2 size={13} /> Approve & Issue Pass
                        </button>
                        <button
                          onClick={() => {
                            const reason = prompt('Reason for rejection:');
                            if (reason !== null) {
                              handleApproveReject(appt._id, 'Rejected', reason);
                            }
                          }}
                          className="btn btn-danger btn-sm"
                          style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem' }}
                        >
                          <XCircle size={13} /> Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 2. Security & Admin: Currently Checked-In Visitors Live Table */}
      {(role === 'security' || role === 'admin') && (
        <div className="card" style={{ marginBottom: '2rem' }}>
          <div className="card-header">
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>
                Live Checked-In Visitors On-Site ({activeLogs.length})
              </h3>
              <p style={{ fontSize: '0.8rem', color: '#64748b' }}>
                Real-time security log of visitors currently inside the facility
              </p>
            </div>
            <button onClick={() => openScanner('check-out')} className="btn btn-danger btn-sm">
              <QrCode size={14} /> Check-Out Scanner
            </button>
          </div>

          {activeLogs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8', fontSize: '0.9rem' }}>
              No visitors currently checked-in inside the building.
            </div>
          ) : (
            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Pass Code</th>
                    <th>Visitor Name</th>
                    <th>Host Employee</th>
                    <th>Gate</th>
                    <th>Check-In Time</th>
                    <th>Belongings</th>
                    <th>Quick Action</th>
                  </tr>
                </thead>
                <tbody>
                  {activeLogs.map((log) => (
                    <tr key={log._id}>
                      <td>
                        <span style={{ fontWeight: 700, color: '#2563eb' }}>
                          {log.pass?.passCode || 'N/A'}
                        </span>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{log.visitor?.fullName}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{log.visitor?.company}</div>
                      </td>
                      <td>{log.pass?.host?.name || 'Staff Member'}</td>
                      <td>{log.gate}</td>
                      <td>
                        {new Date(log.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td>{log.belongings}</td>
                      <td>
                        <button
                          onClick={async () => {
                            if (log.pass?.passCode) {
                              try {
                                await checkLogsAPI.checkOut({ passCode: log.pass.passCode });
                                loadDashboardData();
                              } catch (err) {
                                alert(err.message);
                              }
                            }
                          }}
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '0.2rem 0.55rem', fontSize: '0.72rem', color: '#ef4444' }}
                        >
                          Check Out
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* 3. Analytics Chart Summary for Admin */}
      {role === 'admin' && stats?.purposeStats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
          <div className="card">
            <div className="card-header">
              <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Visits by Purpose Breakdown</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {stats.purposeStats.map((item, idx) => (
                <div key={idx}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '0.25rem' }}>
                    <span style={{ fontWeight: 600, color: '#334155' }}>{item._id || 'Other'}</span>
                    <span style={{ fontWeight: 700, color: '#2563eb' }}>{item.count} visits</span>
                  </div>
                  <div style={{ width: '100%', height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${Math.min(100, (item.count / (stats.totalPasses || 1)) * 100)}%`,
                        height: '100%',
                        background: 'linear-gradient(90deg, #2563eb, #3b82f6)',
                        borderRadius: '4px',
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>System Quick Actions</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              <Link to="/passes" className="btn btn-secondary" style={{ justifyContent: 'flex-start' }}>
                <CreditCard size={16} color="#2563eb" /> Issue Walk-In Pass on Spot
              </Link>
              <Link to="/users" className="btn btn-secondary" style={{ justifyContent: 'flex-start' }}>
                <Users size={16} color="#10b981" /> Add Security / Employee Accounts
              </Link>
              <Link to="/reports" className="btn btn-secondary" style={{ justifyContent: 'flex-start' }}>
                <Download size={16} color="#8b5cf6" /> Download Complete Entry Audit Logs
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Security QR Scanner Modal */}
      <QRScannerModal
        isOpen={scannerOpen}
        onClose={() => setScannerOpen(false)}
        mode={scannerMode}
        onScanComplete={() => {
          loadDashboardData();
        }}
      />
    </div>
  );
};

export default Dashboard;
