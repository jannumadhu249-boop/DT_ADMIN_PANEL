import React, { useState, useEffect } from 'react';
import {
  Eye, EyeOff, Loader2, Shield, X, Search, RefreshCw
} from 'lucide-react';
import { URLS } from '../../url';
import JustUploadedDocsView, { CODE_TO_STATUS_NAME } from './JustUploadedDocsView';

const getAuthToken = () => {
  const keys = ['authToken', 'token', 'adminToken', 'accessToken', 'jwt'];
  for (const key of keys) {
    const value = sessionStorage.getItem(key) || localStorage.getItem(key);
    if (value) return value;
  }
  return 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhZG1pbl9pZCI6IjZhNThiZDFjNzE1ZjE4ZTYxZDQxY2Y5MiIsImVtYWlsIjoiZGl2eWFwZW5keWFsYTA3MTdAZ21haWwuY29tIiwiYWRtaW5fc3RhZ2UiOiJzdXBlciIsImlhdCI6MTc4NDIwNDE1OCwiZXhwIjoxODE1NzQwMTU4fQ.1pjPlGU41H1G5ei3AfTEcaWk9O1eyRTG769xnpj5xts';
};

// -------------------- Table-level OTP Modal --------------------
function OtpModal({ isOpen, onClose, onVerify, onResend, fieldLabel, initialError, initialSuccess }) {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState(initialError || '');
  const refs = Array.from({ length: 6 }, () => React.createRef());

  useEffect(() => {
    if (!isOpen) return;
    setOtp(['', '', '', '', '', '']);
    setTimeLeft(30);
    setError(initialError || '');
    setSuccess(initialSuccess || '');

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { clearInterval(timer); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen, initialError, initialSuccess]);

  if (!isOpen) return null;

  const fmt = s => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  const handleChange = (val, idx) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...otp];
    next[idx] = val;
    setOtp(next);
    if (val && idx < 5) refs[idx + 1].current?.focus();
  };

  const handleKeyDown = (e, idx) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) refs[idx - 1].current?.focus();
  };

  const handleResend = async () => {
    if (timeLeft > 0 || isResending) return;
    setIsResending(true);
    setError('');
    try {
      if (onResend) await onResend();
      setTimeLeft(30);
      setOtp(['', '', '', '', '', '']);
      setSuccess('New verification code sent.');
    } catch (err) {
      setError(err.message || 'Failed to resend code.');
    } finally {
      setIsResending(false);
    }
  };

  const handleVerify = async () => {
    const code = otp.join('');
    if (code.length < 6) { setError('Please enter the complete 6-digit code.'); return; }
    setIsVerifying(true);
    setError('');
    try {
      const ok = await onVerify(code);
      if (ok) {
        setSuccess('Verified successfully!');
        setTimeout(() => {
          setIsVerifying(false);
          onClose();
        }, 400);
      } else {
        setIsVerifying(false);
        setError('Invalid verification code. Please try again.');
      }
    } catch (err) {
      setIsVerifying(false);
      setError(err.message || 'Verification failed. Please try again.');
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(3px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px'
    }}>
      <div style={{
        background: '#ffffff', borderRadius: '16px', maxWidth: '420px', width: '100%',
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', border: '1px solid #e2e8f0',
        padding: '32px 28px', textAlign: 'center', position: 'relative'
      }}>
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: '16px', right: '16px', background: '#f1f5f9',
            border: 'none', borderRadius: '50%', width: '32px', height: '32px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: '#64748b'
          }}
        >
          <X size={16} />
        </button>

        <div style={{
          width: '56px', height: '56px', borderRadius: '14px', background: '#e0f2fe',
          display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px'
        }}>
          <Shield size={28} color="#0076a3" />
        </div>

        <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a', margin: '0 0 6px' }}>
          Verification Required
        </h3>
        <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 20px', lineHeight: '1.4' }}>
          Enter the 6-digit OTP to view protected <strong>{fieldLabel}</strong>
        </p>

        {error && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', borderRadius: '8px', padding: '8px 12px', fontSize: '12px', marginBottom: '16px' }}>
            {error}
          </div>
        )}
        {success && (
          <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', color: '#047857', borderRadius: '8px', padding: '8px 12px', fontSize: '12px', marginBottom: '16px' }}>
            {success}
          </div>
        )}

        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '24px' }}>
          {otp.map((digit, i) => (
            <input
              key={i}
              ref={refs[i]}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={e => handleChange(e.target.value, i)}
              onKeyDown={e => handleKeyDown(e, i)}
              style={{
                width: '44px', height: '50px', textAlign: 'center', fontSize: '20px',
                fontWeight: '700', border: digit ? '2px solid #0076a3' : '1.5px solid #cbd5e1',
                borderRadius: '10px', background: digit ? '#f0f9ff' : '#f8fafc',
                color: '#0f172a', outline: 'none'
              }}
            />
          ))}
        </div>

        <button
          onClick={handleVerify}
          disabled={isVerifying || otp.join('').length < 6}
          style={{
            width: '100%', padding: '12px', background: '#0076a3', color: '#fff',
            border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '600',
            cursor: isVerifying || otp.join('').length < 6 ? 'not-allowed' : 'pointer',
            opacity: isVerifying || otp.join('').length < 6 ? 0.6 : 1,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            marginBottom: '16px'
          }}
        >
          {isVerifying ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : null}
          {isVerifying ? 'Verifying...' : 'Verify Code'}
        </button>

        <div style={{ fontSize: '13px', color: '#64748b' }}>
          {timeLeft > 0 ? (
            <span>Resend OTP in <strong>{fmt(timeLeft)}</strong></span>
          ) : (
            <button
              onClick={handleResend}
              disabled={isResending}
              style={{
                background: 'none', border: 'none', color: '#0076a3', fontWeight: '600',
                cursor: 'pointer', textDecoration: 'underline', fontSize: '13px'
              }}
            >
              {isResending ? 'Sending...' : 'Resend Code'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ==================== Main JustUploadedDocs List Component ====================
export default function JustUploadedDocs({ selectedYear, setSelectedYear }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMember, setSelectedMember] = useState(null);
  const [clients, setClients] = useState([]);
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalRecords: 0, limit: 20 });
  const [counts, setCounts] = useState({ totalMembers: 0, totalDocuments: 0 });
  const [years, setYears] = useState([]);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  // Table OTP state
  const [unmaskedFields, setUnmaskedFields] = useState({});
  const [otpModalOpen, setOtpModalOpen] = useState(false);
  const [pendingFieldKey, setPendingFieldKey] = useState(null);
  const [otpFieldLabel, setOtpFieldLabel] = useState('Email Address');
  const [otpMemberId, setOtpMemberId] = useState(null);
  const [otpType, setOtpType] = useState('email');
  const [otpError, setOtpError] = useState('');
  const [otpSuccess, setOtpSuccess] = useState('');
  const [sendingOtp, setSendingOtp] = useState(false);

  const currentYearVal = selectedYear ? selectedYear.replace('TY', '') : '2026';
  const currentYearId = years.find(y => String(y.name) === currentYearVal)?._id || '';

  // ---- Fetch Years ----
  const fetchYears = async () => {
    try {
      const token = getAuthToken();
      const res = await fetch(URLS.GetYears, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      if (data.success) {
        setYears(data.data || []);
        const defaultYear = (data.data || []).find(y => y.current_year) || data.data?.[0];
        if (!selectedYear && defaultYear && setSelectedYear) {
          setSelectedYear('TY' + defaultYear.name);
        }
      }
    } catch (err) {
      console.warn('Error loading years:', err);
    }
  };

  // ---- Fetch Uploaded Docs Members ----
  const fetchClients = async (page = 1, limit = 20, search = '', yearId = '') => {
    setLoading(true);
    setApiError('');
    try {
      const token = getAuthToken();
      const payload = {
        page,
        limit,
        search: search || '',
        year_id: yearId || currentYearId || ''
      };
      const res = await fetch(URLS.GetJustUploadDocs, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        setClients(data.data || []);
        if (data.pagination) setPagination(data.pagination);
        if (data.counts) setCounts(data.counts);
      } else {
        setApiError(data.message || 'Failed to fetch uploaded documents members.');
      }
    } catch (err) {
      setApiError('Error fetching uploaded documents members: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // ---- OTP Handlers ----
  const sendOtp = async (mId, type = 'email') => {
    const url = type === 'email' ? URLS.SendEmailOtp : URLS.SendContactOtp;
    const token = getAuthToken();
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ member_id: mId })
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || 'Failed to send OTP.');
    return true;
  };

  const verifyOtp = async (mId, otpCode, type = 'email') => {
    const url = type === 'email' ? URLS.VerifyEmailOtp : URLS.VerifyContactOtp;
    const token = getAuthToken();
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ member_id: mId, otp: otpCode })
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || 'Invalid OTP.');
    return true;
  };

  const handleFieldClick = async (fieldKey, label, requiresOtp = true, mId = null, otpTypeParam = 'email') => {
    const isCurrentlyUnmasked = !!unmaskedFields[fieldKey];
    if (isCurrentlyUnmasked) {
      setUnmaskedFields(prev => ({ ...prev, [fieldKey]: false }));
      return;
    }
    if (requiresOtp) {
      if (!mId) {
        console.warn('No memberId provided for OTP');
        return;
      }
      setOtpModalOpen(true);
      setOtpError('');
      setOtpSuccess('');
      setPendingFieldKey(fieldKey);
      setOtpFieldLabel(label);
      setOtpMemberId(mId);
      setOtpType(otpTypeParam);
      setSendingOtp(true);

      try {
        await sendOtp(mId, otpTypeParam);
        setOtpSuccess(`Verification code sent to ${otpTypeParam === 'email' ? 'email' : 'mobile number'}.`);
      } catch (err) {
        setOtpError(err.message || 'Failed to send OTP. Please try again.');
      } finally {
        setSendingOtp(false);
      }
    } else {
      setUnmaskedFields(prev => ({ ...prev, [fieldKey]: true }));
    }
  };

  const handleOtpVerify = async (code) => {
    if (!otpMemberId) return false;
    const success = await verifyOtp(otpMemberId, code, otpType);
    if (success && pendingFieldKey) {
      setUnmaskedFields(prev => ({ ...prev, [pendingFieldKey]: true }));
      return true;
    }
    return false;
  };

  const handleOtpResend = async () => {
    if (!otpMemberId) throw new Error('No member selected.');
    await sendOtp(otpMemberId, otpType);
  };

  // ---- Search Handlers ----
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchClients(1, pagination.limit, searchTerm, currentYearId);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    fetchClients(1, pagination.limit, '', currentYearId);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchClients(newPage, pagination.limit, searchTerm, currentYearId);
    }
  };

  const getMaskedEmail = (email) => {
    if (!email) return '—';
    const parts = email.split('@');
    if (parts.length < 2) return 'XXXXXXXXXX';
    const domainParts = parts[1].split('.');
    const ext = domainParts.length > 1 ? domainParts.pop() : 'com';
    return 'XXXXXXXXXX.' + ext;
  };

  const statusColor = (s) => {
    if (!s) return '#475569';
    if (s.includes('Complete') || s.includes('Accepted') || s === 'EFA_FC') return '#16a34a';
    if (s.includes('Rejected') || s === 'EF_REJ' || s.includes('Cancel')) return '#dc2626';
    if (s.includes('Pending') || s === 'IP' || s === 'SP' || s === 'BIP') return '#d97706';
    return '#2563eb';
  };

  const handleStatusUpdated = (mId, newStatusName, newFilingType) => {
    setClients(prev => prev.map(c => {
      if ((c.member_id || c._id) === mId) {
        return {
          ...c,
          file_status_name: newStatusName,
          filestatus_name: newStatusName,
          filing_type: newFilingType || c.filing_type
        };
      }
      return c;
    }));
    if (selectedMember && (selectedMember.member_id || selectedMember._id) === mId) {
      setSelectedMember(prev => ({
        ...prev,
        file_status_name: newStatusName,
        filestatus_name: newStatusName,
        filing_type: newFilingType || prev.filing_type
      }));
    }
  };

  const markDocumentsViewed = async (documents) => {
    if (!Array.isArray(documents) || documents.length === 0) return;
    const token = getAuthToken();
    for (const doc of documents) {
      const docId = typeof doc === 'string' ? doc : (doc._id || doc.id || doc.documentId || doc.document_id);
      if (!docId) continue;
      let primarySource = doc.source;
      if (!primarySource) {
        primarySource = (doc.uploaded_by === 'Admin' || doc.isAdminUploaded) ? 'Admin' : 'User';
      }
      try {
        const res = await fetch(URLS.MarkDocumentViewed, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ documentId: String(docId), source: primarySource })
        });
        if (res.status === 404) {
          const fallbackSource = primarySource === 'Admin' ? 'User' : 'Admin';
          await fetch(URLS.MarkDocumentViewed, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ documentId: String(docId), source: fallbackSource })
          });
        }
      } catch (err) {
        console.warn('markDocumentViewed error for doc', docId, err);
      }
    }
  };

  const handleViewMember = (client) => {
    setSelectedMember(client);
    if (Array.isArray(client.uploaded_documents) && client.uploaded_documents.length > 0) {
      markDocumentsViewed(client.uploaded_documents);
    }
  };

  useEffect(() => {
    fetchYears();
  }, []);

  useEffect(() => {
    if (years.length > 0 && currentYearId) {
      fetchClients(1, pagination.limit, searchTerm, currentYearId);
    }
  }, [currentYearId, years]);

  return (
    <div className="content-card">
      {selectedMember ? (
        <JustUploadedDocsView
          member={selectedMember}
          selectedYear={selectedYear}
          onBack={() => {
            setSelectedMember(null);
            fetchClients(pagination.currentPage, pagination.limit, searchTerm, currentYearId);
          }}
          onStatusUpdated={handleStatusUpdated}
        />
      ) : (
        <>
          {/* Header section */}
          <div className="header-section" style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: '12px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0, color: '#0f172a' }}>Just Uploaded Documents</h2>
              <p style={{ margin: '3px 0 0', fontSize: '12px', color: '#64748b' }}>
                Members with new documents uploaded for tax year {currentYearVal}
              </p>
            </div>
            {counts.totalMembers > 0 && (
              <div style={{ display: 'flex', gap: '12px', fontSize: '12px' }}>
                <span style={{ background: '#f1f5f9', padding: '4px 10px', borderRadius: '4px', color: '#334155' }}>
                  Total Members: <strong>{counts.totalMembers}</strong>
                </span>
                <span style={{ background: '#e0f2fe', padding: '4px 10px', borderRadius: '4px', color: '#0369a1' }}>
                  Total Documents: <strong>{counts.totalDocuments}</strong>
                </span>
              </div>
            )}
          </div>

          {apiError && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', borderRadius: '8px', padding: '10px 14px', fontSize: '13px', marginBottom: '16px' }}>
              ⚠️ {apiError}
            </div>
          )}

          {/* Reduced-size Search Bar */}
          <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '18px', maxWidth: '420px' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                type="text"
                placeholder="Search name, email, file no..."
                className="search-input-box"
                style={{
                  width: '100%',
                  padding: '7px 10px 7px 32px',
                  border: '1px solid #cbd5e1',
                  borderRadius: '6px',
                  fontSize: '13px',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <button
              type="submit"
              style={{
                padding: '7px 14px',
                background: '#0076a3',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer',
                flexShrink: 0
              }}
            >
              Search
            </button>
            {searchTerm && (
              <button
                type="button"
                onClick={handleClearSearch}
                style={{
                  padding: '7px 10px',
                  background: '#f1f5f9',
                  color: '#475569',
                  border: '1px solid #cbd5e1',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  flexShrink: 0
                }}
              >
                Clear
              </button>
            )}
          </form>

          {/* Members Table */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <Loader2 size={36} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
              <p style={{ marginTop: '10px', color: '#555', fontSize: '13px' }}>Loading uploaded document records...</p>
            </div>
          ) : (
            <>
              <div className="table-responsive">
                <table className="corporate-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                  <thead>
                    <tr>
                      <th style={{ width: '60px', padding: '10px 10px', borderBottom: '2px solid #ddd', textAlign: 'left' }}>S.No</th>
                      <th style={{ padding: '10px 10px', borderBottom: '2px solid #ddd', textAlign: 'left' }}>Name</th>
                      <th style={{ padding: '10px 10px', borderBottom: '2px solid #ddd', textAlign: 'left' }}>File No</th>
                      <th style={{ padding: '10px 10px', borderBottom: '2px solid #ddd', textAlign: 'left' }}>Filing Type</th>
                      <th style={{ padding: '10px 10px', borderBottom: '2px solid #ddd', textAlign: 'left' }}>E-mail</th>
                      <th style={{ padding: '10px 10px', borderBottom: '2px solid #ddd', textAlign: 'center' }}>Documents Uploaded</th>
                      <th style={{ padding: '10px 10px', borderBottom: '2px solid #ddd', textAlign: 'left' }}>File Status</th>
                      <th style={{ width: '80px', textAlign: 'center', padding: '10px 10px', borderBottom: '2px solid #ddd' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clients.length > 0 ? (
                      clients.map((client, index) => {
                        const rowNum = (pagination.currentPage - 1) * pagination.limit + index + 1;
                        const mId = client.member_id || client._id;
                        const emailKey = `cs_${mId}_email`;
                        const clientName = client.name || `${client.first_name || ''} ${client.last_name || ''}`.trim() || '—';
                        const isUnmasked = !!unmaskedFields[emailKey];
                        const docCount = client.uploaded_documents_count !== undefined ? client.uploaded_documents_count : (client.documents_count || '—');
                        const statusName = client.file_status_name || client.filestatus_name || CODE_TO_STATUS_NAME[client.file_status] || client.file_status || client.current_stage || '—';

                        return (
                          <tr key={mId || index}>
                            <td style={{ padding: '10px 10px', borderBottom: '1px solid #eee' }}>{rowNum}</td>
                            <td style={{ padding: '10px 10px', borderBottom: '1px solid #eee', fontWeight: '500' }}>{clientName}</td>
                            <td style={{ padding: '10px 10px', borderBottom: '1px solid #eee' }}>{client.file_no}</td>
                            <td style={{ padding: '10px 10px', borderBottom: '1px solid #eee' }}>{client.filing_type || client.file_type || '—'}</td>
                            <td style={{ padding: '10px 10px', borderBottom: '1px solid #eee' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span>{isUnmasked ? client.email : getMaskedEmail(client.email)}</span>
                                <button
                                  type="button"
                                  className="email-toggle-eye-btn"
                                  onClick={() => handleFieldClick(emailKey, 'Email Address', true, mId, 'email')}
                                  style={{ padding: '2px', display: 'inline-flex', color: '#0076a3', border: 'none', background: 'none', cursor: 'pointer' }}
                                  disabled={sendingOtp && pendingFieldKey === emailKey}
                                >
                                  {sendingOtp && pendingFieldKey === emailKey ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : (isUnmasked ? <EyeOff size={14} /> : <Eye size={14} />)}
                                </button>
                              </div>
                            </td>
                            <td style={{ padding: '10px 10px', borderBottom: '1px solid #eee', textAlign: 'center', fontWeight: '600' }}>{docCount}</td>
                            <td style={{ padding: '10px 10px', borderBottom: '1px solid #eee' }}>
                              <span style={{ color: statusColor(statusName), fontWeight: statusName.includes('Complete') ? 'bold' : '500' }}>
                                {statusName}
                              </span>
                            </td>
                            <td style={{ textAlign: 'center', padding: '10px 10px', borderBottom: '1px solid #eee' }}>
                              <button
                                type="button"
                                className="btn"
                                style={{ backgroundColor: '#5cb85c', color: '#ffffff', padding: '6px 12px', fontSize: '13px', borderRadius: '4px', border: 'none', cursor: 'pointer' }}
                                onClick={() => handleViewMember(client)}
                              >
                                View
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr><td colSpan="8" style={{ textAlign: 'center', padding: '30px', color: '#555' }}>No uploaded document members found.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>

              {clients.length > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px' }}>
                  <div className="pagination-row" style={{ display: 'flex', gap: '4px' }}>
                    <button className="page-link-btn" style={{ padding: '6px 12px', border: '1px solid #ccc', background: '#fff', borderRadius: '4px', cursor: 'pointer' }} onClick={() => handlePageChange(pagination.currentPage - 1)} disabled={pagination.currentPage <= 1}>Prev</button>
                    {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(p => (
                      <button key={p} className="page-link-btn" style={{ padding: '6px 12px', border: p === pagination.currentPage ? '1px solid #0076a3' : '1px solid #ccc', background: p === pagination.currentPage ? '#0076a3' : '#fff', color: p === pagination.currentPage ? '#fff' : '#000', borderRadius: '4px', cursor: 'pointer' }} onClick={() => handlePageChange(p)}>{p}</button>
                    ))}
                    <button className="page-link-btn" style={{ padding: '6px 12px', border: '1px solid #ccc', background: '#fff', borderRadius: '4px', cursor: 'pointer' }} onClick={() => handlePageChange(pagination.currentPage + 1)} disabled={pagination.currentPage >= pagination.totalPages}>Next</button>
                  </div>
                  <div style={{ fontSize: '12px', color: '#555' }}>
                    Showing {(pagination.currentPage - 1) * pagination.limit + 1} to {Math.min(pagination.currentPage * pagination.limit, pagination.totalRecords)} of {pagination.totalRecords} entries
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* Table-level OTP Modal */}
      <OtpModal
        isOpen={otpModalOpen}
        onClose={() => { setOtpModalOpen(false); setOtpError(''); setOtpSuccess(''); }}
        onVerify={handleOtpVerify}
        onResend={handleOtpResend}
        fieldLabel={otpFieldLabel}
        initialError={otpError}
        initialSuccess={otpSuccess}
      />
    </div>
  );
};
