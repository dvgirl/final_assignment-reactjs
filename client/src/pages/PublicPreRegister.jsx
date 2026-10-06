import React, { useState, useEffect, useRef } from 'react';
import { usersAPI, appointmentsAPI, authAPI } from '../api/api';
import PassBadge from '../components/PassBadge';
import {
  CalendarPlus,
  User,
  Mail,
  Phone,
  Building,
  Camera,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  ShieldCheck,
  Upload
} from 'lucide-react';
import confetti from 'canvas-confetti';

const PublicPreRegister = () => {
  const [hosts, setHosts] = useState([]);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    company: '',
    idType: 'Driving License',
    idNumber: '',
    address: '',
    photo: '',
    hostId: '',
    purpose: 'Client Meeting',
    customPurpose: '',
    visitDate: new Date().toISOString().split('T')[0],
    visitTime: '10:30 AM',
    expectedDuration: '2 Hours',
    location: 'TechCorp HQ - Main Building',
    remarks: '',
  });

  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpVerified, setOtpVerified] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successResult, setSuccessResult] = useState(null); // { message, appointment, pass }

  const [showWebcam, setShowWebcam] = useState(false);
  const videoRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchHosts();
  }, []);

  const fetchHosts = async () => {
    try {
      const res = await usersAPI.getHosts();
      if (res.success && res.hosts) {
        setHosts(res.hosts);
        if (res.hosts.length > 0) {
          setFormData((prev) => ({ ...prev, hostId: res.hosts[0]._id }));
        }
      }
    } catch (err) {
      console.error('Error loading hosts:', err);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // WebCam Capture logic
  const startCamera = async () => {
    setShowWebcam(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error('Webcam error:', err);
      alert('Camera access denied or unavailable. You can upload a photo instead.');
      setShowWebcam(false);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = 300;
      canvas.height = 300;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(videoRef.current, 0, 0, 300, 300);
      const dataUrl = canvas.toDataURL('image/png');
      setFormData((prev) => ({ ...prev, photo: dataUrl }));

      // Stop camera
      const stream = videoRef.current.srcObject;
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      setShowWebcam(false);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, photo: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSendOtp = async () => {
    const target = formData.phone || formData.email;
    if (!target) {
      setError('Please provide visitor phone or email to receive OTP verification.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await authAPI.sendOtp({ target, type: formData.phone ? 'phone' : 'email' });
      setOtpSent(true);
      if (res.demoOtp) {
        setOtpCode(res.demoOtp);
      }
    } catch (err) {
      setError(err.message || 'Failed to send verification code');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    const target = formData.phone || formData.email;
    if (!otpCode) {
      setError('Please enter the OTP verification code');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await authAPI.verifyOtp({ target, code: otpCode });
      setOtpVerified(true);
    } catch (err) {
      setError(err.message || 'Invalid verification code');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await appointmentsAPI.create(formData);
      if (res.success) {
        confetti({
          particleCount: 75,
          spread: 70,
          origin: { y: 0.6 },
        });

        setSuccessResult(res);
      }
    } catch (err) {
      setError(err.message || 'Failed to submit pre-registration.');
    } finally {
      setLoading(false);
    }
  };

  // If successfully registered & pass issued
  if (successResult) {
    return (
      <div className="page-wrapper" style={{ maxWidth: '800px', textAlign: 'center', padding: '3rem 1.5rem' }}>
        <div
          style={{
            background: '#ecfdf5',
            border: '1px solid #a7f3d0',
            borderRadius: '16px',
            padding: '2rem',
            marginBottom: '2rem',
          }}
        >
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: '#10b981',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem',
            }}
          >
            <CheckCircle2 size={32} />
          </div>

          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#065f46' }}>
            Pre-Registration Confirmed!
          </h2>
          <p style={{ color: '#047857', marginTop: '0.5rem', fontSize: '0.95rem' }}>
            {successResult.message}
          </p>
        </div>

        {/* Render Pass Badge if issued */}
        {successResult.pass ? (
          <div style={{ marginTop: '2rem' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: '#0f172a' }}>
              Your Digital Visitor Pass Badge
            </h3>
            <PassBadge pass={successResult.pass} />
          </div>
        ) : (
          <div className="card" style={{ padding: '2rem', marginTop: '1rem' }}>
            <p style={{ color: '#475569', fontSize: '0.95rem' }}>
              Your appointment request with <strong>{successResult.appointment?.host?.name}</strong> is currently pending host approval. You will receive an SMS/Email notification with your digital pass once approved.
            </p>
          </div>
        )}

        <div style={{ marginTop: '2.5rem' }}>
          <button
            onClick={() => {
              setSuccessResult(null);
              setFormData({
                fullName: '',
                email: '',
                phone: '',
                company: '',
                idType: 'Driving License',
                idNumber: '',
                address: '',
                photo: '',
                hostId: hosts[0]?._id || '',
                purpose: 'Client Meeting',
                customPurpose: '',
                visitDate: new Date().toISOString().split('T')[0],
                visitTime: '10:30 AM',
                expectedDuration: '2 Hours',
                location: 'TechCorp HQ - Main Building',
                remarks: '',
              });
            }}
            className="btn btn-secondary"
          >
            Register Another Visitor
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrapper" style={{ maxWidth: '880px', padding: '2.5rem 1.5rem' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            background: '#eff6ff',
            color: '#2563eb',
            padding: '0.35rem 0.9rem',
            borderRadius: '20px',
            fontSize: '0.8rem',
            fontWeight: 700,
            marginBottom: '0.75rem',
          }}
        >
          <Sparkles size={14} /> Digital Visitor Registration
        </div>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a' }}>
          Pre-Register Your Visit
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.95rem', maxWidth: '600px', margin: '0.5rem auto 0' }}>
          Fill out the details below to receive your fast-track QR pass for entry at TechCorp HQ
        </p>
      </div>

      {error && (
        <div
          style={{
            padding: '0.85rem',
            borderRadius: '10px',
            background: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#991b1b',
            fontSize: '0.85rem',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="card" style={{ padding: '2rem', boxShadow: 'var(--shadow-md)' }}>
        {/* Section 1: Visitor Info */}
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <User size={18} color="#2563eb" /> 1. Visitor Information
          </h3>

          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input
                type="text"
                name="fullName"
                required
                className="form-input"
                placeholder="e.g. Jessica Alba"
                value={formData.fullName}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Company / Organization</label>
              <input
                type="text"
                name="company"
                className="form-input"
                placeholder="e.g. Google, Self, Vendor"
                value={formData.company}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">Email Address *</label>
              <input
                type="email"
                name="email"
                required
                className="form-input"
                placeholder="jessica@example.com"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Phone Number *</label>
              <input
                type="tel"
                name="phone"
                required
                className="form-input"
                placeholder="+1 555-0199"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* OTP Verification Bonus Section */}
          <div
            style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '10px',
              padding: '0.85rem 1rem',
              marginBottom: '1.25rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#334155', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <ShieldCheck size={16} color="#2563eb" /> Phone OTP Verification (Bonus Feature):
              </span>
              {!otpSent && (
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={loading || (!formData.phone && !formData.email)}
                  className="btn btn-secondary btn-sm"
                >
                  Send OTP Code
                </button>
              )}
            </div>

            {otpSent && !otpVerified && (
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.6rem' }}>
                <input
                  type="text"
                  placeholder="Enter 6-digit code (e.g. 123456)"
                  className="form-input"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  style={{ maxWidth: '240px' }}
                />
                <button
                  type="button"
                  onClick={handleVerifyOtp}
                  disabled={loading || !otpCode}
                  className="btn btn-primary btn-sm"
                >
                  Verify Code
                </button>
              </div>
            )}

            {otpVerified && (
              <div style={{ color: '#10b981', fontSize: '0.8rem', fontWeight: 600, marginTop: '0.4rem' }}>
                ✓ Phone & Identity verified successfully
              </div>
            )}
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">ID Proof Type</label>
              <select name="idType" className="form-select" value={formData.idType} onChange={handleChange}>
                <option value="Driving License">Driving License</option>
                <option value="Aadhaar Card">Aadhaar Card</option>
                <option value="Passport">Passport</option>
                <option value="Voter ID">Voter ID</option>
                <option value="Employee ID">Company Employee ID</option>
                <option value="Other">Other Government ID</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">ID Proof Number</label>
              <input
                type="text"
                name="idNumber"
                className="form-input"
                placeholder="e.g. DL-9812401"
                value={formData.idNumber}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Photo Capture / Upload */}
          <div className="form-group">
            <label className="form-label">Visitor Photo / Badge Image</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              {formData.photo ? (
                <img
                  src={formData.photo}
                  alt="Visitor Preview"
                  style={{ width: '80px', height: '80px', borderRadius: '12px', objectFit: 'cover', border: '2px solid #2563eb' }}
                />
              ) : (
                <div
                  style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '12px',
                    background: '#f1f5f9',
                    border: '2px dashed #cbd5e1',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#94a3b8',
                  }}
                >
                  <User size={32} />
                </div>
              )}

              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <button type="button" onClick={startCamera} className="btn btn-secondary btn-sm">
                  <Camera size={15} /> Capture via Webcam
                </button>
                <button
                  type="button"
                  onClick={() => fileInputRef.current && fileInputRef.current.click()}
                  className="btn btn-secondary btn-sm"
                >
                  <Upload size={15} /> Upload Photo
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/*"
                  style={{ display: 'none' }}
                />
              </div>
            </div>

            {/* Webcam video live preview */}
            {showWebcam && (
              <div style={{ marginTop: '1rem', textAlign: 'center', background: '#0f172a', padding: '1rem', borderRadius: '12px' }}>
                <video ref={videoRef} autoPlay playsInline style={{ width: '280px', height: '210px', borderRadius: '8px', objectFit: 'cover' }} />
                <div style={{ marginTop: '0.75rem', display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
                  <button type="button" onClick={capturePhoto} className="btn btn-primary btn-sm">
                    Take Snapshot
                  </button>
                  <button type="button" onClick={() => setShowWebcam(false)} className="btn btn-secondary btn-sm">
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Section 2: Visit & Host Details */}
        <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1.5rem', marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Building size={18} color="#2563eb" /> 2. Appointment & Host Details
          </h3>

          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">Select Host Employee to Visit *</label>
              <select name="hostId" required className="form-select" value={formData.hostId} onChange={handleChange}>
                {hosts.map((host) => (
                  <option key={host._id} value={host._id}>
                    {host.name} ({host.department || 'Staff'}) - {host.email}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Purpose of Visit *</label>
              <select name="purpose" required className="form-select" value={formData.purpose} onChange={handleChange}>
                <option value="Client Meeting">Client Meeting</option>
                <option value="Job Interview">Job Interview</option>
                <option value="Vendor / Supplier">Vendor / Supplier</option>
                <option value="Maintenance & Repairs">Maintenance & Repairs</option>
                <option value="Official Inspection">Official Inspection</option>
                <option value="Personal Visit">Personal Visit</option>
                <option value="Consulting">Consulting</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="form-grid-3">
            <div className="form-group">
              <label className="form-label">Visit Date *</label>
              <input
                type="date"
                name="visitDate"
                required
                className="form-input"
                value={formData.visitDate}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Visit Time</label>
              <input
                type="text"
                name="visitTime"
                className="form-input"
                placeholder="e.g. 10:30 AM"
                value={formData.visitTime}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Expected Duration</label>
              <input
                type="text"
                name="expectedDuration"
                className="form-input"
                placeholder="e.g. 2 Hours"
                value={formData.expectedDuration}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Visit Location / Meeting Room</label>
            <input
              type="text"
              name="location"
              className="form-input"
              value={formData.location}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Additional Remarks / Message to Host</label>
            <textarea
              name="remarks"
              rows={2}
              className="form-textarea"
              placeholder="e.g. Bringing presentation materials for project demo"
              value={formData.remarks}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="btn btn-primary btn-lg"
          style={{ width: '100%', boxShadow: '0 4px 14px rgba(37,99,235,0.3)' }}
        >
          {loading ? 'Submitting Pre-Registration...' : 'Submit & Generate Visitor Pass'}
        </button>
      </form>
    </div>
  );
};

export default PublicPreRegister;
