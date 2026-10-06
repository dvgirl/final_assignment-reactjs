import React, { useState, useEffect } from 'react';
import { appointmentsAPI, usersAPI } from '../api/api';
import { useAuth } from '../context/AuthContext';
import PassBadge from '../components/PassBadge';
import {
  CalendarPlus,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  X,
  UserCheck,
  Building,
  Sparkles
} from 'lucide-react';

const AppointmentsPage = () => {
  const { user } = useAuth();
  const role = user?.role || 'visitor';

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  // Create / Invite Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hosts, setHosts] = useState([]);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    company: '',
    hostId: user?.role === 'employee' ? user._id : '',
    purpose: 'Client Meeting',
    visitDate: new Date().toISOString().split('T')[0],
    visitTime: '10:00 AM',
    expectedDuration: '1 Hour',
    location: 'TechCorp HQ - Main Building',
    remarks: '',
  });

  // View Pass Badge Modal State
  const [selectedPass, setSelectedPass] = useState(null);

  useEffect(() => {
    fetchAppointments();
    fetchHosts();
  }, [statusFilter]);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const params = {};
      if (statusFilter !== 'All') params.status = statusFilter;
      const res = await appointmentsAPI.getAll(params);
      if (res.success) {
        setAppointments(res.appointments || []);
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
        if (role !== 'employee' && res.hosts.length > 0) {
          setFormData((prev) => ({ ...prev, hostId: res.hosts[0]._id }));
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      let rejectionReason = '';
      if (status === 'Rejected') {
        rejectionReason = prompt('Enter rejection reason:') || 'Host unavailable';
      }
      await appointmentsAPI.updateStatus(id, { status, rejectionReason });
      fetchAppointments();
    } catch (err) {
      alert(err.message || 'Status update failed');
    }
  };

  const handleCreateAppointment = async (e) => {
    e.preventDefault();
    try {
      const res = await appointmentsAPI.create({
        ...formData,
        hostId: formData.hostId || user._id,
      });
      if (res.success) {
        setIsModalOpen(false);
        fetchAppointments();
        if (res.pass) {
          setSelectedPass(res.pass);
        }
      }
    } catch (err) {
      alert(err.message || 'Error creating appointment');
    }
  };

  const viewAppointmentPass = async (appointmentId) => {
    try {
      const res = await appointmentsAPI.getById(appointmentId);
      if (res.success && res.pass) {
        setSelectedPass(res.pass);
      } else {
        alert('Digital Pass is not issued yet (requires approval).');
      }
    } catch (err) {
      alert(err.message || 'Could not load pass');
    }
  };

  const filteredAppointments = appointments.filter((appt) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      appt.visitor?.fullName?.toLowerCase().includes(term) ||
      appt.visitor?.company?.toLowerCase().includes(term) ||
      appt.purpose?.toLowerCase().includes(term) ||
      appt.host?.name?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="page-wrapper">
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Appointments & Pre-Registrations</h1>
          <p style={{ color: '#64748b', fontSize: '0.88rem' }}>
            Schedule visits, manage host approvals, and generate digital badges
          </p>
        </div>

        <button onClick={() => setIsModalOpen(true)} className="btn btn-primary">
          <CalendarPlus size={16} /> + New Appointment / Invite
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="card" style={{ padding: '1rem 1.25rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Search Box */}
          <div style={{ position: 'relative', minWidth: '280px', flex: 1 }}>
            <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search visitor, host, company..."
              className="form-input"
              style={{ paddingLeft: '2rem' }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Status Filter Buttons */}
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            {['All', 'Pending', 'Approved', 'Rejected', 'Completed'].map((status) => (
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

      {/* Appointments Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
            Loading appointments...
          </div>
        ) : filteredAppointments.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
            No appointments found matching your criteria.
          </div>
        ) : (
          <div className="table-container" style={{ border: 'none' }}>
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Visitor Details</th>
                  <th>Host Employee</th>
                  <th>Purpose</th>
                  <th>Scheduled Date & Time</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAppointments.map((appt) => {
                  const isHostOrAdmin = role === 'admin' || appt.host?._id === user?._id;
                  return (
                    <tr key={appt._id}>
                      <td>
                        <div style={{ fontWeight: 600 }}>{appt.visitor?.fullName}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                          {appt.visitor?.company} • {appt.visitor?.phone}
                        </div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 500 }}>{appt.host?.name || 'Staff'}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{appt.host?.department}</div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 500 }}>{appt.purpose}</div>
                        <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{appt.location}</div>
                      </td>
                      <td>
                        <div>{new Date(appt.visitDate).toLocaleDateString()}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{appt.visitTime} ({appt.expectedDuration})</div>
                      </td>
                      <td>
                        <span className={`badge badge-${appt.status.toLowerCase()}`}>
                          {appt.status}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                          {/* If Approved, can view digital pass */}
                          {appt.status === 'Approved' && (
                            <button
                              onClick={() => viewAppointmentPass(appt._id)}
                              className="btn btn-secondary btn-sm"
                              style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                              title="View Digital Badge"
                            >
                              <Eye size={13} /> View Pass
                            </button>
                          )}

                          {/* Host/Admin can approve/reject pending requests */}
                          {appt.status === 'Pending' && isHostOrAdmin && (
                            <>
                              <button
                                onClick={() => handleStatusChange(appt._id, 'Approved')}
                                className="btn btn-success btn-sm"
                                style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                              >
                                <CheckCircle2 size={13} /> Approve
                              </button>
                              <button
                                onClick={() => handleStatusChange(appt._id, 'Rejected')}
                                className="btn btn-danger btn-sm"
                                style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                              >
                                <XCircle size={13} /> Reject
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* New Appointment / Invite Modal */}
      {isModalOpen && (
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
              maxWidth: '600px',
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
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#fff' }}>Schedule / Invite Visitor</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '50%', color: '#fff', width: '30px', height: '30px', cursor: 'pointer' }}
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateAppointment} style={{ padding: '1.5rem' }}>
              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Visitor Full Name *</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    placeholder="e.g. Rachel Green"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Visitor Company</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Ralph Lauren Corp"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Email Address *</label>
                  <input
                    type="email"
                    required
                    className="form-input"
                    placeholder="rachel@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    className="form-input"
                    placeholder="+1 555-0182"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Host Employee *</label>
                  <select
                    className="form-select"
                    value={formData.hostId}
                    onChange={(e) => setFormData({ ...formData, hostId: e.target.value })}
                  >
                    {hosts.map((h) => (
                      <option key={h._id} value={h._id}>
                        {h.name} ({h.department})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Purpose of Visit *</label>
                  <select
                    className="form-select"
                    value={formData.purpose}
                    onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                  >
                    <option value="Client Meeting">Client Meeting</option>
                    <option value="Job Interview">Job Interview</option>
                    <option value="Vendor / Supplier">Vendor / Supplier</option>
                    <option value="Maintenance & Repairs">Maintenance & Repairs</option>
                    <option value="Official Inspection">Official Inspection</option>
                    <option value="Personal Visit">Personal Visit</option>
                  </select>
                </div>
              </div>

              <div className="form-grid-3">
                <div className="form-group">
                  <label className="form-label">Visit Date *</label>
                  <input
                    type="date"
                    required
                    className="form-input"
                    value={formData.visitDate}
                    onChange={(e) => setFormData({ ...formData, visitDate: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Visit Time</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.visitTime}
                    onChange={(e) => setFormData({ ...formData, visitTime: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Duration</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.expectedDuration}
                    onChange={(e) => setFormData({ ...formData, expectedDuration: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Location / Meeting Room</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Create & Issue Pass
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Pass Badge Modal */}
      {selectedPass && (
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
              borderRadius: '20px',
              padding: '2rem',
              maxWidth: '440px',
              width: '100%',
              position: 'relative',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            }}
          >
            <button
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

export default AppointmentsPage;
