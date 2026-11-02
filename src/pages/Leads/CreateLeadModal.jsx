import React, { useState } from 'react';
import { X } from 'lucide-react';
import { URLS } from '../../url';

const getAuthToken = () => {
  const keys = ['adminToken', 'authToken', 'token', 'accessToken', 'jwt'];
  for (const key of keys) {
    const value = sessionStorage.getItem(key) || localStorage.getItem(key);
    if (value) return value;
  }
  return 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhZG1pbl9pZCI6IjZhNThiZDFjNzE1ZjE4ZTYxZDQxY2Y5MiIsImVtYWlsIjoiZGl2eWFwZW5keWFsYTA3MTdAZ21haWwuY29tIiwiYWRtaW5fc3RhZ2UiOiJzdXBlciIsImlhdCI6MTc4NDIwNDE1OCwiZXhwIjoxODE1NzQwMTU4fQ.1pjPlGU41H1G5ei3AfTEcaWk9O1eyRTG769xnpj5xts';
};

export default function CreateLeadModal({ onClose, onSave }) {
  const [form, setForm] = useState({
    name: '',
    mobile: '',
    email: '',
    followUpDate: '',
    description: '',
    referredBy: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handle = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.mobile || !form.email) {
      setErrorMsg('Name, Mobile and Email are required.');
      return;
    }
    setErrorMsg('');
    setSubmitting(true);

    try {
      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        mobile: form.mobile.trim(),
        referred_by: form.referredBy.trim(),
        description: form.description.trim(),
        followup_date: form.followUpDate || new Date().toISOString().split('T')[0]
      };

      const res = await fetch(URLS.AddLead, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (res.ok && data.success !== false) {
        onSave(data.data || data);
      } else {
        setErrorMsg(data.message || 'Failed to add lead.');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="modal-overlay"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="leads-modal-dialog" style={{ width: 620, maxWidth: '95%' }}>
        {/* Header */}
        <div className="leads-modal-header">
          <span className="leads-modal-title">Add New Lead</span>
          <button className="leads-modal-close" onClick={onClose}><X size={16} /></button>
        </div>

        {/* Body */}
        <form className="leads-modal-body" onSubmit={submit}>
          {errorMsg && (
            <div style={{ padding: '8px 12px', background: '#fee2e2', color: '#b91c1c', borderRadius: '6px', fontSize: '0.8rem', marginBottom: '12px' }}>
              {errorMsg}
            </div>
          )}

          <div className="leads-form-row">
            <div className="leads-form-group">
              <label>Name <span className="leads-required">*</span></label>
              <input className="leads-input" value={form.name} onChange={handle('name')} placeholder="Full Name" required />
            </div>
            <div className="leads-form-group">
              <label>Mobile <span className="leads-required">*</span></label>
              <input className="leads-input" value={form.mobile} onChange={handle('mobile')} placeholder="Phone Number" required />
            </div>
          </div>

          <div className="leads-form-row">
            <div className="leads-form-group">
              <label>Email <span className="leads-required">*</span></label>
              <input className="leads-input" type="email" value={form.email} onChange={handle('email')} placeholder="email@example.com" required />
            </div>
            <div className="leads-form-group">
              <label>FollowUp Date</label>
              <input className="leads-input" type="date" value={form.followUpDate} onChange={handle('followUpDate')} />
            </div>
          </div>

          <div className="leads-form-row">
            <div className="leads-form-group" style={{ flex: '0 0 100%' }}>
              <label>Referred By</label>
              <input className="leads-input" value={form.referredBy} onChange={handle('referredBy')} placeholder="Referrer Name" />
            </div>
          </div>

          <div className="leads-form-row">
            <div className="leads-form-group" style={{ flex: '0 0 100%' }}>
              <label>Description</label>
              <textarea className="leads-input leads-textarea" value={form.description} onChange={handle('description')} rows={3} placeholder="Lead notes/description..." />
            </div>
          </div>

          {/* Footer */}
          <div className="leads-modal-footer">
            <button type="button" className="leads-btn-close-modal" onClick={onClose}>Close</button>
            <button type="submit" className="leads-btn-save" disabled={submitting}>
              {submitting ? 'Saving...' : 'Save Lead'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
