import React, { useState, useEffect, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { checkLogsAPI } from '../api/api';
import { QrCode, X, CheckCircle2, AlertCircle, Camera, Keyboard, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

const QRScannerModal = ({ isOpen, onClose, mode = 'check-in', onScanComplete }) => {
  const [activeTab, setActiveTab] = useState('manual'); // 'camera' or 'manual'
  const [passCodeInput, setPassCodeInput] = useState('');
  const [gate, setGate] = useState('Main Entrance - Gate 1');
  const [belongings, setBelongings] = useState('Standard bag & Laptop');
  const [laptopSerial, setLaptopSerial] = useState('');
  const [temperature, setTemperature] = useState('98.4 °F');
  const [remarks, setRemarks] = useState('');

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null); // { success, message, data }
  const scannerRef = useRef(null);

  useEffect(() => {
    if (isOpen && activeTab === 'camera') {
      const scanner = new Html5QrcodeScanner(
        'reader',
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          rememberLastUsedCamera: true,
        },
        false
      );

      scanner.render(
        (decodedText) => {
          handleScannedData(decodedText);
          scanner.clear();
        },
        (error) => {
          // ignore minor scan errors during continuous scanning
        }
      );

      scannerRef.current = scanner;

      return () => {
        if (scannerRef.current) {
          scannerRef.current.clear().catch(console.error);
        }
      };
    }
  }, [isOpen, activeTab]);

  if (!isOpen) return null;

  const handleScannedData = (scannedText) => {
    try {
      // If QR payload is JSON
      if (scannedText.startsWith('{') && scannedText.endsWith('}')) {
        const parsed = JSON.parse(scannedText);
        if (parsed.passCode) {
          setPassCodeInput(parsed.passCode);
          executeCheckAction(parsed.passCode);
          return;
        }
      }
      setPassCodeInput(scannedText.trim());
      executeCheckAction(scannedText.trim());
    } catch {
      setPassCodeInput(scannedText.trim());
      executeCheckAction(scannedText.trim());
    }
  };

  const executeCheckAction = async (codeToUse) => {
    const code = (codeToUse || passCodeInput).trim().toUpperCase();
    if (!code) {
      setResult({ success: false, message: 'Please enter or scan a valid Pass Code.' });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      let res;
      if (mode === 'check-in') {
        res = await checkLogsAPI.checkIn({
          passCode: code,
          gate,
          belongings,
          laptopSerialNumber: laptopSerial,
          temperature,
          remarks,
        });
      } else {
        res = await checkLogsAPI.checkOut({
          passCode: code,
          remarks,
        });
      }

      if (res.success) {
        // Trigger celebratory confetti
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
        });

        setResult({
          success: true,
          message: res.message,
          data: res.log,
        });

        if (onScanComplete) {
          onScanComplete(res.log);
        }
      }
    } catch (err) {
      setResult({
        success: false,
        message: err.message || 'Operation failed. Please verify pass code.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
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
          maxWidth: '520px',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          border: '1px solid #e2e8f0',
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: mode === 'check-in' ? 'linear-gradient(135deg, #1e3a8a, #2563eb)' : 'linear-gradient(135deg, #7c2d12, #ea580c)',
            color: '#ffffff',
            borderTopLeftRadius: '16px',
            borderTopRightRadius: '16px',
          }}
        >
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#ffffff' }}>
              {mode === 'check-in' ? 'Security QR Check-In' : 'Security QR Check-Out'}
            </h3>
            <p style={{ fontSize: '0.78rem', opacity: 0.9, marginTop: '2px' }}>
              Scan QR code or enter pass number to log visitor entry/exit
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              cursor: 'pointer',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '1.5rem' }}>
          {/* Result Alert if any */}
          {result && (
            <div
              style={{
                padding: '1rem',
                borderRadius: '10px',
                marginBottom: '1.25rem',
                background: result.success ? '#ecfdf5' : '#fef2f2',
                border: `1px solid ${result.success ? '#a7f3d0' : '#fecaca'}`,
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.75rem',
              }}
            >
              {result.success ? (
                <CheckCircle2 size={22} color="#10b981" style={{ flexShrink: 0 }} />
              ) : (
                <AlertCircle size={22} color="#ef4444" style={{ flexShrink: 0 }} />
              )}
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.88rem', color: result.success ? '#065f46' : '#991b1b' }}>
                  {result.message}
                </div>
                {result.data && (
                  <div style={{ fontSize: '0.78rem', color: '#334155', marginTop: '0.35rem' }}>
                    Visitor: <strong>{result.data.visitor?.fullName}</strong> | Gate: {result.data.gate}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Scanner / Manual Input Tabs */}
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <button
              onClick={() => setActiveTab('manual')}
              style={{
                flex: 1,
                padding: '0.6rem',
                borderRadius: '8px',
                border: '1px solid',
                borderColor: activeTab === 'manual' ? '#2563eb' : '#cbd5e1',
                background: activeTab === 'manual' ? '#eff6ff' : '#ffffff',
                color: activeTab === 'manual' ? '#2563eb' : '#475569',
                fontWeight: 600,
                fontSize: '0.82rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem',
                cursor: 'pointer',
              }}
            >
              <Keyboard size={16} /> Pass Code / 1-Click
            </button>

            <button
              onClick={() => setActiveTab('camera')}
              style={{
                flex: 1,
                padding: '0.6rem',
                borderRadius: '8px',
                border: '1px solid',
                borderColor: activeTab === 'camera' ? '#2563eb' : '#cbd5e1',
                background: activeTab === 'camera' ? '#eff6ff' : '#ffffff',
                color: activeTab === 'camera' ? '#2563eb' : '#475569',
                fontWeight: 600,
                fontSize: '0.82rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem',
                cursor: 'pointer',
              }}
            >
              <Camera size={16} /> Live Camera Scanner
            </button>
          </div>

          {/* Camera Scanner View */}
          {activeTab === 'camera' ? (
            <div style={{ marginBottom: '1.25rem' }}>
              <div id="reader" style={{ width: '100%', borderRadius: '10px', overflow: 'hidden' }}></div>
              <p style={{ fontSize: '0.75rem', color: '#64748b', textAlign: 'center', marginTop: '0.5rem' }}>
                Point camera at the Visitor Pass QR Code
              </p>
            </div>
          ) : (
            /* Manual / 1-Click test view */
            <div>
              <div className="form-group">
                <label className="form-label">Pass Code Number</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. VP-2026-100101"
                    value={passCodeInput}
                    onChange={(e) => setPassCodeInput(e.target.value)}
                    style={{ textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em' }}
                  />
                  <button
                    onClick={() => executeCheckAction()}
                    disabled={loading || !passCodeInput}
                    className={`btn ${mode === 'check-in' ? 'btn-primary' : 'btn-danger'}`}
                  >
                    {loading ? 'Processing...' : mode === 'check-in' ? 'Check In' : 'Check Out'}
                  </button>
                </div>
              </div>

              {/* Instant Demo Quick-Fill Buttons */}
              <div
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  padding: '0.75rem',
                  marginBottom: '1rem',
                }}
              >
                <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600, marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <Sparkles size={12} color="#2563eb" /> Quick Demo Test Passes:
                </div>
                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={() => setPassCodeInput('VP-2026-100101')}
                    style={{
                      background: '#ffffff',
                      border: '1px solid #cbd5e1',
                      borderRadius: '4px',
                      padding: '0.2rem 0.5rem',
                      fontSize: '0.72rem',
                      color: '#0f172a',
                      cursor: 'pointer',
                    }}
                  >
                    VP-2026-100101 (Emily)
                  </button>
                  <button
                    type="button"
                    onClick={() => setPassCodeInput('VP-2026-100102')}
                    style={{
                      background: '#ffffff',
                      border: '1px solid #cbd5e1',
                      borderRadius: '4px',
                      padding: '0.2rem 0.5rem',
                      fontSize: '0.72rem',
                      color: '#0f172a',
                      cursor: 'pointer',
                    }}
                  >
                    VP-2026-100102 (David)
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Additional Gate Check Metadata (for Check-In) */}
          {mode === 'check-in' && (
            <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1rem', marginTop: '1rem' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.75rem' }}>
                Gate & Security Verification
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '0.78rem' }}>Check-In Gate</label>
                  <select className="form-select" value={gate} onChange={(e) => setGate(e.target.value)}>
                    <option value="Main Entrance - Gate 1">Main Entrance - Gate 1</option>
                    <option value="East Gate - Tower B">East Gate - Tower B</option>
                    <option value="North Gate - Executive Entrance">North Gate - Executive Entrance</option>
                    <option value="Service Gate 3">Service Gate 3</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '0.78rem' }}>Temperature</label>
                  <input
                    type="text"
                    className="form-input"
                    value={temperature}
                    onChange={(e) => setTemperature(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '0.78rem' }}>Belongings</label>
                  <input
                    type="text"
                    className="form-input"
                    value={belongings}
                    onChange={(e) => setBelongings(e.target.value)}
                    placeholder="e.g. Laptop, Backpack"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '0.78rem' }}>Laptop Serial No. (Optional)</label>
                  <input
                    type="text"
                    className="form-input"
                    value={laptopSerial}
                    onChange={(e) => setLaptopSerial(e.target.value)}
                    placeholder="e.g. SN-88219"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Remarks */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ fontSize: '0.78rem' }}>Security Notes / Remarks</label>
            <input
              type="text"
              className="form-input"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="e.g. Identity verified via photo ID"
            />
          </div>
        </div>

        {/* Modal Footer */}
        <div
          style={{
            padding: '1rem 1.5rem',
            borderTop: '1px solid #e2e8f0',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '0.5rem',
            background: '#f8fafc',
            borderBottomLeftRadius: '16px',
            borderBottomRightRadius: '16px',
          }}
        >
          <button onClick={onClose} className="btn btn-secondary btn-sm">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default QRScannerModal;
