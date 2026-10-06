import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { passesAPI } from '../api/api';
import PassBadge from '../components/PassBadge';
import { ShieldCheck, AlertCircle, ArrowLeft, Loader2 } from 'lucide-react';

const PublicPassView = () => {
  const { identifier } = useParams();
  const [pass, setPass] = useState(null);
  const [isExpired, setIsExpired] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPass();
  }, [identifier]);

  const fetchPass = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await passesAPI.getByIdentifier(identifier);
      if (res.success && res.pass) {
        setPass(res.pass);
        setIsExpired(res.isExpired);
      } else {
        setError('Visitor pass not found or invalid.');
      }
    } catch (err) {
      setError(err.message || 'Pass not found.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', padding: '2.5rem 1rem' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
        <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#64748b', fontSize: '0.85rem' }}>
            <ArrowLeft size={16} /> Home
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#2563eb', fontWeight: 700, fontSize: '0.85rem' }}>
            <ShieldCheck size={18} /> Official Pass Verification
          </div>
        </div>

        {loading && (
          <div style={{ padding: '4rem 0' }}>
            <div style={{
              width: '40px',
              height: '40px',
              border: '4px solid #e2e8f0',
              borderTop: '4px solid #2563eb',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 1rem',
            }} />
            <p style={{ color: '#64748b' }}>Verifying pass validity with security database...</p>
          </div>
        )}

        {error && (
          <div className="card" style={{ padding: '2rem', textAlign: 'center', borderColor: '#fecaca', background: '#fef2f2' }}>
            <AlertCircle size={40} color="#ef4444" style={{ margin: '0 auto 0.75rem' }} />
            <h3 style={{ color: '#991b1b', marginBottom: '0.5rem' }}>Pass Verification Failed</h3>
            <p style={{ color: '#7f1d1d', fontSize: '0.88rem' }}>{error}</p>
            <div style={{ marginTop: '1.5rem' }}>
              <Link to="/pre-register" className="btn btn-primary btn-sm">
                Apply for Pre-Registration Pass
              </Link>
            </div>
          </div>
        )}

        {pass && (
          <div>
            {isExpired && (
              <div
                style={{
                  background: '#fef2f2',
                  border: '1px solid #fecaca',
                  color: '#991b1b',
                  padding: '0.75rem',
                  borderRadius: '10px',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  marginBottom: '1.5rem',
                }}
              >
                ⚠️ WARNING: THIS PASS HAS EXPIRED!
              </div>
            )}

            <PassBadge pass={pass} />
          </div>
        )}
      </div>
    </div>
  );
};

export default PublicPassView;
