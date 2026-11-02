import React, { useState, useRef, useEffect } from 'react';
import { Send, Mail, Image as ImageIcon, Loader, CheckCircle, XCircle, X } from 'lucide-react';
import { URLS } from '../url';

export default function SendMail({ selectedYear = '' }) {
  const [status, setStatus] = useState('Select Status');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [toast, setToast] = useState(null); // { type: 'success'|'error', text: string }
  const [loadingSend, setLoadingSend] = useState(false);
  const [loadingTest, setLoadingTest] = useState(false);
  const fileInputRef = useRef(null);
  const [resolvedYear, setResolvedYear] = useState(selectedYear.replace(/\D/g, '') || '');

  useEffect(() => {
    const controller = new AbortController();
    const fetchCurrentYear = async () => {
      try {
        const token = (() => {
          for (const key of ['authToken', 'token', 'adminToken', 'accessToken', 'jwt']) {
            const v = sessionStorage.getItem(key) || localStorage.getItem(key);
            if (v) return v;
          }
          return '';
        })();
        const response = await fetch(URLS.GetCurrentYear, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          signal: controller.signal,
        });
        if (!response.ok) return;
        const result = await response.json();
        // API returns { success: true, data: { name: "2025", _id: "...", ... } }
        const year = result?.data?.name;
        if (year) setResolvedYear(String(year).replace(/\D/g, ''));
      } catch (err) {
        // keep the fallback year already set
      }
    };
    fetchCurrentYear();
    return () => controller.abort();
  }, []);

  // Auto-dismiss toast after 3 s
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  const showToast = (type, text) => setToast({ type, text });

  const resetForm = () => {
    setStatus('Select Status');
    setSubject('');
    setBody('');
    setImageFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const getToken = () => {
    for (const key of ['authToken', 'token', 'adminToken', 'accessToken', 'jwt']) {
      const v = sessionStorage.getItem(key) || localStorage.getItem(key);
      if (v) return v;
    }
    return '';
  };

  const handleTestMail = async (e) => {
    e.preventDefault();

    if (!subject.trim() || !body.trim()) {
      showToast('error', 'Subject and Body are required to send a test email.');
      return;
    }

    const formData = new FormData();
    formData.append('subject', subject);
    formData.append('body', body);
    if (fileInputRef.current?.files[0]) {
      formData.append('image', fileInputRef.current.files[0]);
    }

    try {
      setLoadingTest(true);
      const response = await fetch(URLS.TestMail, {
        method: 'POST',
        headers: { Authorization: `Bearer ${getToken()}` },
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        showToast('success', data?.message || 'Test email sent successfully to administrator inbox!');
        resetForm();
      } else {
        showToast('error', data?.message || 'Failed to send test email. Please try again.');
      }
    } catch (err) {
      showToast('error', 'Network error. Could not reach the server.');
    } finally {
      setLoadingTest(false);
    }
  };

  const handleSendMail = async (e) => {
    e.preventDefault();

    if (status === 'Select Status') {
      showToast('error', 'Please select a status target first.');
      return;
    }
    if (!subject.trim() || !body.trim()) {
      showToast('error', 'Subject and Body are required to send broadcast emails.');
      return;
    }

    if (!window.confirm(`Are you sure you want to send this email to all users with status "${status}" for Tax Year ${resolvedYear}?`)) {
      return;
    }

    const formData = new FormData();
    formData.append('status', status);
    formData.append('subject', subject);
    formData.append('body', body);
    if (fileInputRef.current?.files[0]) {
      formData.append('image', fileInputRef.current.files[0]);
    }

    try {
      setLoadingSend(true);
      const response = await fetch(URLS.SendMail, {
        method: 'POST',
        headers: { Authorization: `Bearer ${getToken()}` },
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        showToast('success', data?.message || 'Emails dispatched successfully to all target subscribers!');
        resetForm();
      } else {
        showToast('error', data?.message || 'Failed to send emails. Please try again.');
      }
    } catch (err) {
      showToast('error', 'Network error. Could not reach the server.');
    } finally {
      setLoadingSend(false);
    }
  };

  return (
    <div className="content-card" style={{ animation: 'fadeIn 0.2s ease-out', padding: '24px' }}>
      <div style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '14px', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Mail size={20} color="#0076a3" />
          Send Mail to All Registered in {resolvedYear} Tax Year
        </h2>
      </div>

      {/* Toast notification */}
      {toast && (
        <div style={{
          position: 'fixed',
          top: '24px',
          right: '24px',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'flex-start',
          gap: '10px',
          backgroundColor: toast.type === 'success' ? '#f0fdf4' : '#fef2f2',
          border: `1px solid ${toast.type === 'success' ? '#bbf7d0' : '#fecaca'}`,
          borderLeft: `4px solid ${toast.type === 'success' ? '#16a34a' : '#dc2626'}`,
          borderRadius: '8px',
          padding: '14px 16px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
          maxWidth: '360px',
          animation: 'slideInRight 0.3s ease-out',
        }}>
          {toast.type === 'success'
            ? <CheckCircle size={18} color="#16a34a" style={{ flexShrink: 0, marginTop: '1px' }} />
            : <XCircle size={18} color="#dc2626" style={{ flexShrink: 0, marginTop: '1px' }} />
          }
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '13px', fontWeight: '700', color: toast.type === 'success' ? '#15803d' : '#b91c1c', marginBottom: '2px' }}>
              {toast.type === 'success' ? 'Email Sent' : 'Error'}
            </div>
            <div style={{ fontSize: '12px', color: toast.type === 'success' ? '#166534' : '#991b1b', lineHeight: '1.4' }}>
              {toast.text}
            </div>
          </div>
          <button onClick={() => setToast(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0', color: '#94a3b8', flexShrink: 0 }}>
            <X size={14} />
          </button>
        </div>
      )}

      <style>{`
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(40px); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>

      <form style={{ display: 'flex', flexDirection: 'column', gap: '18px', maxWidth: '800px' }}>
        {/* Select Status */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#334155' }}>Select Status <span style={{ color: '#dc2626' }}>*</span></label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="search-input-box"
            style={{ width: '100%', padding: '10px 12px', fontSize: '13px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
          >
            <option value="Select Status">Select Status</option>
            <option value="RGO">Registered Only</option>
            <option value="BIP">Basic Information Pending</option>
            <option value="SP">Scheduling Pending</option>
            <option value="IP">Interview Pending</option>
            <option value="DP">Documents Pending</option>
            <option value="PP_I">Preparation - 1</option>
            <option value="PP_II">Preparation - 2</option>
            <option value="TR_S_I">Review &amp; Summary 1</option>
            <option value="TR_S_II">Review &amp; Summary 2</option>
            <option value="ITIN">ITIN Files</option>
            <option value="RE_ES">Revised Estimate</option>
            <option value="PP_EF">Payment Pending - Efiling</option>
            <option value="PP_PF">Payment Pending - Paper filing</option>
            <option value="FPR">Fee Payment Received - I</option>
            <option value="FPR_II">Fee Payment Received - II</option>
            <option value="CR_EF">Client Review - Efiling</option>
            <option value="CR_PF">Client Review - Paper Filing</option>
            <option value="EFP_I">Efiling Pending - 1</option>
            <option value="EFP_II">Efiling Pending - 2</option>
            <option value="EF_AA_I">E - Filed &amp; Awaiting Acceptance - 1</option>
            <option value="EF_AA_II">E - Filed &amp; Awaiting Acceptance - 2</option>
            <option value="EF_REJ">E - Filed &amp; Rejected</option>
            <option value="C_R">City Return</option>
            <option value="EFA_FC">E-Filing Accepted &amp; Filing Complete</option>
            <option value="PF_P">Paper Filing Pending</option>
            <option value="PF_D">Paper Filing Done</option>
            <option value="CANC">Cancelled</option>
          </select>
        </div>

        {/* Subject */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#334155' }}>Subject <span style={{ color: '#dc2626' }}>*</span></label>
          <input
            type="text"
            className="search-input-box"
            placeholder="Enter Email Subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            style={{ width: '100%', padding: '10px 12px', fontSize: '13px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
          />
        </div>

        {/* Body */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#334155' }}>Body <span style={{ color: '#dc2626' }}>*</span></label>
          <textarea
            rows="6"
            className="search-input-box"
            placeholder="Enter Email Content Body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            style={{ width: '100%', height: '150px', fontSize: '13px', fontFamily: 'inherit', padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
          />
        </div>

        {/* Image Attachment */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#334155' }}>Image Attachment</label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files[0] ? e.target.files[0].name : null)}
            style={{
              padding: '8px 12px',
              border: '1px solid #cbd5e1',
              borderRadius: '6px',
              fontSize: '13px',
              backgroundColor: '#fff',
              cursor: 'pointer'
            }}
          />
          {imageFile && (
            <span style={{ fontSize: '12px', color: '#0076a3', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <ImageIcon size={14} /> Selected image: <strong>{imageFile}</strong>
            </span>
          )}
        </div>

        {/* Buttons Row */}
        <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
          <button
            type="button"
            onClick={handleTestMail}
            disabled={loadingTest || loadingSend}
            style={{
              backgroundColor: '#64748b',
              color: '#ffffff',
              border: 'none',
              padding: '10px 20px',
              fontSize: '13px',
              fontWeight: '600',
              borderRadius: '6px',
              cursor: loadingTest || loadingSend ? 'not-allowed' : 'pointer',
              opacity: loadingTest || loadingSend ? 0.7 : 1,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
            }}
          >
            {loadingTest ? <Loader size={14} style={{ animation: 'spin 1s linear infinite' }} /> : null}
            {loadingTest ? 'Sending...' : 'Test Mail'}
          </button>
          <button
            type="button"
            onClick={handleSendMail}
            disabled={loadingSend || loadingTest}
            style={{
              backgroundColor: '#0076a3',
              color: '#ffffff',
              border: 'none',
              padding: '10px 24px',
              fontSize: '13px',
              fontWeight: '600',
              borderRadius: '6px',
              cursor: loadingSend || loadingTest ? 'not-allowed' : 'pointer',
              opacity: loadingSend || loadingTest ? 0.7 : 1,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 2px 4px rgba(0,118,163,0.2)'
            }}
          >
            {loadingSend ? <Loader size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Send size={15} />}
            {loadingSend ? 'Sending...' : 'Send Mail'}
          </button>
        </div>
      </form>
    </div>
  );
}
