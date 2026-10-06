import React, { useState, useEffect } from 'react';
import { reportsAPI, checkLogsAPI } from '../api/api';
import StatsCard from '../components/StatsCard';
import {
  BarChart3,
  Download,
  Filter,
  FileSpreadsheet,
  Mail,
  MessageSquare,
  Clock,
  Building,
  Shield,
  Search
} from 'lucide-react';

const ReportsPage = () => {
  const [stats, setStats] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const [dateFilter, setDateFilter] = useState('');
  const [gateFilter, setGateFilter] = useState('All');

  useEffect(() => {
    fetchReportData();
  }, [dateFilter, gateFilter]);

  const fetchReportData = async () => {
    setLoading(true);
    try {
      const [statsRes, notifRes, logsRes] = await Promise.all([
        reportsAPI.getStats(),
        reportsAPI.getNotifications(),
        checkLogsAPI.getAll({ gate: gateFilter !== 'All' ? gateFilter : undefined }),
      ]);

      if (statsRes.success) setStats(statsRes.stats);
      if (notifRes.success) setNotifications(notifRes.notifications || []);
      if (logsRes.success) setLogs(logsRes.logs || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-wrapper">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Analytics, Reports & Audit Logs</h1>
          <p style={{ color: '#64748b', fontSize: '0.88rem' }}>
            Comprehensive reporting, data export, and simulated notification records
          </p>
        </div>

        <a
          href={reportsAPI.getCsvUrl()}
          download
          className="btn btn-primary"
          style={{ boxShadow: '0 4px 12px rgba(37,99,235,0.25)' }}
        >
          <FileSpreadsheet size={16} /> Export All Logs (CSV)
        </a>
      </div>

      {/* Analytics Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        <StatsCard
          title="Total Registered Visitors"
          value={stats?.totalVisitors || 0}
          icon={<Building size={22} />}
          subtitle="Cumulative count"
          color="blue"
        />

        <StatsCard
          title="Total Passes Generated"
          value={stats?.totalPasses || 0}
          icon={<BarChart3 size={22} />}
          subtitle="QR Passes"
          color="purple"
        />

        <StatsCard
          title="Approved Visits Today"
          value={stats?.approvedToday || 0}
          icon={<Clock size={22} />}
          subtitle="Today's schedule"
          color="green"
        />

        <StatsCard
          title="Active Inside Facility"
          value={stats?.activeInside || 0}
          icon={<Shield size={22} />}
          subtitle="Current building count"
          color="amber"
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Purpose Analytics Breakdown */}
        <div className="card">
          <div className="card-header">
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Visitor Purpose Distribution</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {stats?.purposeStats && stats.purposeStats.length > 0 ? (
              stats.purposeStats.map((item, idx) => (
                <div key={idx}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                    <span style={{ fontWeight: 600, color: '#334155' }}>{item._id || 'Other'}</span>
                    <span style={{ fontWeight: 700, color: '#2563eb' }}>{item.count} passes</span>
                  </div>
                  <div style={{ width: '100%', height: '10px', background: '#f1f5f9', borderRadius: '5px', overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${Math.min(100, (item.count / (stats.totalPasses || 1)) * 100)}%`,
                        height: '100%',
                        background: 'linear-gradient(90deg, #2563eb, #60a5fa)',
                        borderRadius: '5px',
                      }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <p style={{ color: '#94a3b8', textAlign: 'center', padding: '1rem' }}>No purpose data yet.</p>
            )}
          </div>
        </div>

        {/* Live Notification Audit Stream */}
        <div className="card">
          <div className="card-header">
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Simulated Notifications Log</h3>
            <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 600 }}>Email & SMS</span>
          </div>

          <div style={{ maxHeight: '320px', overflowY: 'auto' }}>
            {notifications.length === 0 ? (
              <p style={{ color: '#94a3b8', textAlign: 'center', padding: '2rem' }}>No recent notification logs.</p>
            ) : (
              notifications.map((notif, idx) => (
                <div
                  key={notif.id || idx}
                  style={{
                    padding: '0.75rem',
                    borderBottom: '1px solid #f1f5f9',
                    fontSize: '0.8rem',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                    <span
                      style={{
                        fontWeight: 700,
                        color: notif.type === 'EMAIL' ? '#2563eb' : '#10b981',
                        fontSize: '0.72rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                      }}
                    >
                      {notif.type === 'EMAIL' ? <Mail size={12} /> : <MessageSquare size={12} />}
                      {notif.type}: {notif.subject}
                    </span>
                    <span style={{ color: '#94a3b8', fontSize: '0.7rem' }}>
                      {new Date(notif.sentAt).toLocaleTimeString()}
                    </span>
                  </div>
                  <p style={{ color: '#475569', margin: '0.2rem 0' }}>{notif.preview}</p>
                  <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Recipient: {notif.recipient}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Raw Audit Logs Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Security Check-In / Out Audit Trail</h3>
            <p style={{ fontSize: '0.8rem', color: '#64748b' }}>Complete historical record of all gate activities</p>
          </div>
        </div>

        <div className="table-container" style={{ border: 'none' }}>
          <table className="custom-table">
            <thead>
              <tr>
                <th>Log ID / Pass</th>
                <th>Visitor</th>
                <th>Host</th>
                <th>Gate</th>
                <th>Check-In</th>
                <th>Check-Out</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {logs.slice(0, 15).map((log) => (
                <tr key={log._id}>
                  <td>
                    <span style={{ fontWeight: 700, color: '#2563eb' }}>
                      {log.pass?.passCode || log._id.substring(0, 8)}
                    </span>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{log.visitor?.fullName}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{log.visitor?.phone}</div>
                  </td>
                  <td>{log.pass?.host?.name || 'Staff Member'}</td>
                  <td>{log.gate}</td>
                  <td>{log.checkInTime ? new Date(log.checkInTime).toLocaleString() : 'N/A'}</td>
                  <td>{log.checkOutTime ? new Date(log.checkOutTime).toLocaleString() : 'Active Inside'}</td>
                  <td>
                    <span className={`badge badge-${log.status.toLowerCase()}`}>
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
