import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';

export default function CreateNoteModal({ onClose, onSave }) {
  const [employeeName, setEmployeeName] = useState('');
  const [date, setDate] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!employeeName.trim()) { setError('Employee name is required.'); return; }
    if (!date)                { setError('Date is required.'); return; }
    if (!note.trim())         { setError('Note content is required.'); return; }

    setSaving(true);
    setError('');
    try {
      // Pass payload up to Notes.jsx which calls the API
      await onSave({ employee_name: employeeName.trim(), date, notes: note.trim() });
    } catch (err) {
      setError(err.message || 'Failed to save note.');
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" style={overlayStyle}>
      <div className="modal-dialog" style={dialogStyle}>
        <div className="modal-header" style={headerStyle}>
          <h3 className="modal-title">Create New Note</h3>
          <button className="modal-close-trigger" onClick={onClose} style={closeBtnStyle} disabled={saving}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={bodyStyle}>
            {error && <div style={errorStyle}>{error}</div>}

            <div className="form-group" style={groupStyle}>
              <label style={labelStyle}>Employee Name <span style={{ color: '#dc3545' }}>*</span></label>
              <input
                type="text"
                className="search-input-box"
                placeholder="Enter employee name"
                value={employeeName}
                onChange={(e) => setEmployeeName(e.target.value)}
                style={inputStyle}
              />
            </div>

            <div className="form-group" style={groupStyle}>
              <label style={labelStyle}>Date <span style={{ color: '#dc3545' }}>*</span></label>
              <input
                type="date"
                className="search-input-box"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                style={inputStyle}
              />
            </div>

            <div className="form-group" style={groupStyle}>
              <label style={labelStyle}>Notes <span style={{ color: '#dc3545' }}>*</span></label>
              <textarea
                className="search-input-box"
                rows={4}
                placeholder="Enter note content…"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                style={textareaStyle}
              />
            </div>
          </div>

          <div className="modal-footer" style={footerStyle}>
            <button type="button" onClick={onClose} disabled={saving} style={secondaryBtnStyle}>
              Close
            </button>
            <button type="submit" disabled={saving} style={{ ...primaryBtnStyle, display: 'flex', alignItems: 'center', gap: '6px' }}>
              {saving ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : null}
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Styles
const overlayStyle = {
  position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
  backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex',
  justifyContent: 'center', alignItems: 'center', zIndex: 1000,
};
const dialogStyle = {
  backgroundColor: '#fff', borderRadius: '8px', width: '440px',
  maxWidth: '90%', boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
};
const headerStyle = { padding: '12px 16px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' };
const closeBtnStyle = { background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#888' };
const bodyStyle = { padding: '16px' };
const groupStyle = { marginBottom: '14px' };
const labelStyle = { display: 'block', marginBottom: '5px', fontWeight: '600', fontSize: '13px' };
const inputStyle = { width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' };
const textareaStyle = { ...inputStyle, resize: 'vertical' };
const footerStyle = { padding: '12px 16px', borderTop: '1px solid #eee', display: 'flex', justifyContent: 'flex-end', gap: '8px' };
const secondaryBtnStyle = { backgroundColor: '#6c757d', color: '#fff', border: 'none', padding: '7px 14px', borderRadius: '4px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' };
const primaryBtnStyle = { backgroundColor: 'var(--color-green-btn)', color: '#fff', border: 'none', padding: '7px 14px', borderRadius: '4px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' };
const errorStyle = { backgroundColor: 'rgba(220,53,69,0.1)', color: '#dc3545', padding: '8px 12px', borderRadius: '4px', marginBottom: '12px', border: '1px solid rgba(220,53,69,0.2)', fontSize: '13px' };
