import React, { useState, useEffect } from 'react';
import { checkLogsAPI } from '../api/api';
import QRScannerModal from '../components/QRScannerModal';
import {
  QrCode,
  Search,
  Filter,
  ArrowDownRight,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  Building,
  UserCheck,
  Shield,
  Sparkles
} from 'lucide-react';

const CheckInOutPage = () => {
  const [activeLogs, setActiveLogs] = useState([]);
  const [allLogs, setAllLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState('active'); // 'active' or 'history'
  const [statusFilter, setStatusFilter] = useState('All');
  const [gateFilter, setGateFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  // Scanner modal state
  const [scannerOpen, setScannerOpen] = useState(false);
  const [scannerMode, setScannerMode] = useState('check-in');

  useEffect(() => {
    fetchLogs();
  }, [statusFilter, gateFilter]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      // 1. Fetch active visitors
      const activeRes = await checkLogsAPI.getActive();
      if (activeRes.success) {
        setActiveLogs(activeRes.logs || []);
      }

      // 2. Fetch history
      const params = {};
      if (statusFilter !== 'All') params.status = statusFilter;
      if (gateFilter !== 'All') params.gate = gateFilter;
      const historyRes = await checkLogsAPI.getAll(params);
      if (historyRes.success) {
        setAllLogs(historyRes.logs || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenScanner = (mode) => {
    setScannerMode(mode);
    setScannerOpen(true);
  };

  const handleQuickCheckOut = async (passCode) => {
    try {
      await checkLogsAPI.checkOut({ passCode, remarks: 'Quick checkout at gate' });
      fetchLogs();
    } catch (err) {
      alert(err.message || 'Check out failed');
    }
  };

  const filteredHistory = allLogs.filter((log) => {
    if (!searchTerm) return true;
    const s = searchTerm.toLowerCase();
    return (
      log.visitor?.fullName?.toLowerCase().includes(s) ||
      log.pass?.passCode?.toLowerCase().includes(s) ||
      log.gate?.toLowerCase().includes(s) ||
      log.checkedInBy?.name?.toLowerCase().includes(s)
    );
  });

  return (
    <div className="page-wrapper">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Gate Check-In & Check-Out</h1>
          <p style={{ color: '#64748b', fontSize: '0.88rem' }}>
            QR Code barcode scanner, real-time gate entry logs, and visitor tracking
          </p>
        </div>

        {/* Security Scanner Action Buttons */}
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={() => handleOpenScanner('check-in')}
            className="btn btn-success"
            style={{ padding: '0.65rem 1.25rem', boxShadow: '0 4px 12px rgba(16,185,129,0.3)' }}
          >
            <ArrowDownRight size={18} /> Scan QR Check-In
          </button>

          <button
            onClick={() => handleOpenScanner('check-out')}
            className="btn btn-danger"
            style={{ padding: '0.65rem 1.25rem', boxShadow: '0 4px 12px rgba(239,68,68,0.3)' }}
          >
            <ArrowUpRight size={18} /> Scan QR Check-Out
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
        <button
          onClick={() => setActiveTab('active')}
          style={{
            padding: '0.6rem 1.2rem',
            borderRadius: '8px',
            fontSize: '0.85rem',
            fontWeight: 700,
            border: '1px solid',
            borderColor: activeTab === 'active' ? '#2563eb' : '#cbd5e1',
            background: activeTab === 'active' ? '#2563eb' : '#ffffff',
            color: activeTab === 'active' ? '#ffffff' : '#475569',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
          }}
        >
          <Building size={16} /> Currently On-Site ({activeLogs.length})
        </button>

        <button
          onClick={() => setActiveTab('history')}
          style={{
            padding: '0.6rem 1.2rem',
            borderRadius: '8px',
            fontSize: '0.85rem',
            fontWeight: 700,
            border: '1px solid',
            borderColor: activeTab === 'history' ? '#2563eb' : '#cbd5e1',
            background: activeTab === 'history' ? '#2563eb' : '#ffffff',
            color: activeTab === 'history' ? '#ffffff' : '#475569',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
          }}
        >
          <Clock size={16} /> Entry & Exit Audit History ({allLogs.length})
        </button>
      </div>

      {/* Tab 1: Active Visitors Inside */}
      {activeTab === 'active' && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {loading ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>Loading active visitors...</div>
          ) : activeLogs.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
              No visitors currently inside the facility. Use the Check-In Scanner to log entries.
            </div>
          ) : (
            <div className="table-container" style={{ border: 'none' }}>
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Pass Code</th>
                    <th>Visitor Information</th>
                    <th>Host Employee</th>
                    <th>Entry Gate</th>
                    <th>Check-In Time</th>
                    <th>Belongings</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {activeLogs.map((log) => (
                    <tr key={log._id}>
                      <td>
                        <span style={{ fontWeight: 700, color: '#2563eb' }}>
                          {log.pass?.passCode}
                        </span>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{log.visitor?.fullName}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                          {log.visitor?.company} • {log.visitor?.phone}
                        </div>
                      </td>
                      <td>
                        <div>{log.pass?.host?.name || 'Staff'}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{log.pass?.host?.department}</div>
                      </td>
                      <td>
                        <span style={{ fontWeight: 500 }}>{log.gate}</span>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, color: '#0f172a' }}>
                          {new Date(log.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                          {new Date(log.checkInTime).toLocaleDateString()}
                        </div>
                      </td>
                      <td>
                        <div style={{ fontSize: '0.78rem' }}>{log.belongings || 'None'}</div>
                        {log.laptopSerialNumber && (
                          <div style={{ fontSize: '0.7rem', color: '#64748b' }}>SN: {log.laptopSerialNumber}</div>
                        )}
                      </td>
                      <td>
                        <button
                          onClick={() => handleQuickCheckOut(log.pass?.passCode)}
                          className="btn btn-danger btn-sm"
                          style={{ padding: '0.3rem 0.65rem', fontSize: '0.75rem' }}
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

      {/* Tab 2: Full Entry/Exit Audit Logs */}
      {activeTab === 'history' && (
        <>
          {/* Filters */}
          <div className="card" style={{ padding: '1rem 1.25rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ position: 'relative', minWidth: '260px', flex: 1 }}>
                <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  placeholder="Search log by visitor, pass #, gate..."
                  className="form-input"
                  style={{ paddingLeft: '2rem' }}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <select className="form-select" style={{ width: 'auto' }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                  <option value="All">All Statuses</option>
                  <option value="CheckedIn">Checked In</option>
                  <option value="CheckedOut">Checked Out</option>
                </select>

                <select className="form-select" style={{ width: 'auto' }} value={gateFilter} onChange={(e) => setGateFilter(e.target.value)}>
                  <option value="All">All Gates</option>
                  <option value="Main Entrance - Gate 1">Main Entrance - Gate 1</option>
                  <option value="East Gate - Tower B">East Gate - Tower B</option>
                  <option value="Service Gate 3">Service Gate 3</option>
                </select>
              </div>
            </div>
          </div>

          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            {filteredHistory.length === 0 ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>No logs found.</div>
            ) : (
              <div className="table-container" style={{ border: 'none' }}>
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Pass Code</th>
                      <th>Visitor</th>
                      <th>Gate</th>
                      <th>Check-In</th>
                      <th>Check-Out</th>
                      <th>Status</th>
                      <th>Security Guard</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredHistory.map((log) => (
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
                        <td>{log.gate}</td>
                        <td>
                          {log.checkInTime ? (
                            <div>
                              <div>{new Date(log.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                              <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{new Date(log.checkInTime).toLocaleDateString()}</div>
                            </div>
                          ) : 'N/A'}
                        </td>
                        <td>
                          {log.checkOutTime ? (
                            <div>
                              <div>{new Date(log.checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                              <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{new Date(log.checkOutTime).toLocaleDateString()}</div>
                            </div>
                          ) : (
                            <span style={{ color: '#10b981', fontWeight: 600, fontSize: '0.78rem' }}>Currently On-Site</span>
                          )}
                        </td>
                        <td>
                          <span className={`badge badge-${log.status.toLowerCase()}`}>
                            {log.status}
                          </span>
                        </td>
                        <td>{log.checkedInBy?.name || 'Security Officer'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {/* QR Scanner Modal */}
      <QRScannerModal
        isOpen={scannerOpen}
        onClose={() => setScannerOpen(false)}
        mode={scannerMode}
        onScanComplete={() => {
          fetchLogs();
        }}
      />
    </div>
  );
};

export default CheckInOutPage;
