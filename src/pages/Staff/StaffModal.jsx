import React, { useState, useEffect } from 'react';
import { Plus, Pencil, X, Eye, EyeOff, CheckCircle, Circle } from 'lucide-react';
import { URLS } from '../../url';

const getToken = () => {
  const keys = ['adminToken', 'authToken', 'token', 'accessToken', 'jwt'];
  for (const key of keys) {
    const value = sessionStorage.getItem(key) || localStorage.getItem(key);
    if (value) return value;
  }
  return 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhZG1pbl9pZCI6IjZhNThiZDFjNzE1ZjE4ZTYxZDQxY2Y5MiIsImVtYWlsIjoiZGl2eWFwZW5keWFsYTA3MTdAZ21haWwuY29tIiwiYWRtaW5fc3RhZ2UiOiJzdXBlciIsImlhdCI6MTc4NDIwNDE1OCwiZXhwIjoxODE1NzQwMTU4fQ.1pjPlGU41H1G5ei3AfTEcaWk9O1eyRTG769xnpj5xts';
};

export default function StaffModal({ isOpen, onClose, onSave, editData, roles }) {
  const isEdit = !!editData;

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    role: '',
    password: '',
    isActive: true,
    adminStage: '',
    adminCode: '',
  });
  const [showPwd, setShowPwd] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Admin Stage options with value/label
  const adminStageOptions = [
    { value: 'stage1', label: 'Stage 1' },
    { value: 'stage2', label: 'Stage 2' },
  ];
  const adminCodeOptions = ['A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7', 'B1', 'B2', 'B3', 'B4', 'B5', 'B6', 'B7'];

  useEffect(() => {
    if (isOpen) {
      if (editData) {
        // Handle both old and new field names
        let firstName = editData.firstName || editData.first_name || '';
        let lastName = editData.lastName || editData.last_name || '';
        if (!firstName && !lastName && editData.fullName) {
          const parts = editData.fullName.trim().split(' ');
          firstName = parts[0] || '';
          lastName = parts.slice(1).join(' ') || '';
        }
        setForm({
          firstName,
          lastName,
          email: editData.email || '',
          phone: editData.phone || editData.contact_number || '',
          address: editData.address || '',
          role: editData.role?._id || editData.role || editData.role_id || '',
          password: '',
          isActive: editData.isActive !== false,
          adminStage: editData.adminStage || editData.admin_stage || '',
          adminCode: editData.adminCode || editData.admin_code || '',
        });
      } else {
        setForm({
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          address: '',
          role: '',
          password: '',
          isActive: true,
          adminStage: '',
          adminCode: '',
        });
      }
      setError('');
    }
  }, [isOpen, editData]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.firstName.trim()) {
      setError('First Name is required.');
      return;
    }
    if (!form.email.trim()) {
      setError('Email is required.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!form.phone.trim()) {
      setError('Phone number is required.');
      return;
    }
    if (!/^\d{10}$/.test(form.phone.trim())) {
      setError('Phone number must be exactly 10 digits.');
      return;
    }
    if (!form.role) {
      setError('Role is required.');
      return;
    }
    if (!form.adminStage) {
      setError('Admin Stage is required.');
      return;
    }
    if (!form.adminCode) {
      setError('Admin Code is required.');
      return;
    }
    if (!isEdit && !form.password) {
      setError('Password is required.');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      // Build payload matching the cURL exactly
      const payload = {
        first_name: form.firstName.trim(),
        last_name: form.lastName.trim(),
        email: form.email.trim(),
        contact_number: form.phone.trim(),
        address: form.address.trim(),
        role_id: form.role,
        admin_stage: form.adminStage,
        admin_code: form.adminCode,
      };
      // Include password only if provided (required on create, optional on edit)
      if (form.password) {
        payload.adm_pswd = form.password;
      }

      const url = isEdit ? `${URLS.UpdateStaff}${editData._id}` : URLS.CreateStaff;
      const method = isEdit ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${getToken()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (res.ok && json.success !== false) {
        onSave(json.data || json.result || json);
        onClose();
      } else {
        throw new Error(json.message || 'Request failed');
      }
    } catch (err) {
      setError(err.message || 'Something went wrong');
      onSave(null, err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const primaryColor = '#0076a3';
  const headerBg = primaryColor;

  // ── Modal Styles ──
  const modalOverlayStyle = {
    position: 'fixed',
    inset: 0,
    background: 'rgba(15, 23, 42, 0.6)',
    backdropFilter: 'blur(6px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    padding: '20px',
    animation: 'fadeIn 0.25s ease-out',
  };

  const modalStyle = {
    background: '#ffffff',
    borderRadius: '20px',
    boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
    width: '95%',
    maxWidth: '780px',
    maxHeight: '90vh',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    animation: 'slideUp 0.3s ease-out',
  };

  const headerStyle = {
    padding: '20px 24px',
    borderBottom: '1px solid rgba(255,255,255,0.15)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: headerBg,
    borderRadius: '20px 20px 0 0',
  };

  const bodyStyle = {
    padding: '24px',
    overflowY: 'auto',
    flex: 1,
  };

  const footerStyle = {
    padding: '16px 24px',
    borderTop: '1px solid #f1f5f9',
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    background: '#fafcff',
  };

  return (
    <div style={modalOverlayStyle} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={modalStyle}>
        {/* Header */}
        <div style={headerStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              background: '#ffffff',
              color: primaryColor,
              borderRadius: '10px',
              padding: '6px 10px',
              fontSize: '16px',
              fontWeight: '700',
              lineHeight: 1,
            }}>
              {isEdit ? '✎' : '+'}
            </div>
            <h3 style={{
              margin: 0,
              fontSize: '20px',
              fontWeight: '700',
              color: '#ffffff',
              letterSpacing: '-0.3px',
            }}>
              {isEdit ? 'Edit Staff Member' : 'Add Staff Member'}
            </h3>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '8px',
              color: '#ffffff',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.35)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.2)'; }}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
          <div style={bodyStyle}>
            {error && (
              <div style={{
                background: '#fef2f2',
                border: '1px solid #fecaca',
                color: '#b91c1c',
                borderRadius: '8px',
                padding: '10px 14px',
                marginBottom: '16px',
                fontSize: '13px',
              }}>
                ⚠️ {error}
              </div>
            )}

            {/* Row 1: First Name, Last Name (2‑col) */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '16px 20px',
              marginBottom: '16px',
            }}>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: '700',
                  color: '#334155',
                  marginBottom: '6px',
                }}>
                  First Name <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <input
                  type="text"
                  placeholder="John"
                  value={form.firstName}
                  onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))}
                  required
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    border: '1.5px solid #e2e8f0',
                    borderRadius: '10px',
                    fontSize: '14px',
                    outline: 'none',
                    transition: 'all 0.15s',
                    background: '#f8fafc',
                  }}
                  onFocus={e => { e.target.style.borderColor = primaryColor; e.target.style.background = '#fff'; e.target.style.boxShadow = `0 0 0 3px ${primaryColor}25`; }}
                  onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.background = '#f8fafc'; e.target.style.boxShadow = 'none'; }}
                />
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: '700',
                  color: '#334155',
                  marginBottom: '6px',
                }}>
                  Last Name
                </label>
                <input
                  type="text"
                  placeholder="Doe"
                  value={form.lastName}
                  onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    border: '1.5px solid #e2e8f0',
                    borderRadius: '10px',
                    fontSize: '14px',
                    outline: 'none',
                    transition: 'all 0.15s',
                    background: '#f8fafc',
                  }}
                  onFocus={e => { e.target.style.borderColor = primaryColor; e.target.style.background = '#fff'; e.target.style.boxShadow = `0 0 0 3px ${primaryColor}25`; }}
                  onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.background = '#f8fafc'; e.target.style.boxShadow = 'none'; }}
                />
              </div>
            </div>

            {/* Row 2: Email, Phone (2‑col) */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '16px 20px',
              marginBottom: '16px',
            }}>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: '700',
                  color: '#334155',
                  marginBottom: '6px',
                }}>
                  Email <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <input
                  type="email"
                  placeholder="john@example.com"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  required
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    border: '1.5px solid #e2e8f0',
                    borderRadius: '10px',
                    fontSize: '14px',
                    outline: 'none',
                    transition: 'all 0.15s',
                    background: '#f8fafc',
                  }}
                  onFocus={e => { e.target.style.borderColor = primaryColor; e.target.style.background = '#fff'; e.target.style.boxShadow = `0 0 0 3px ${primaryColor}25`; }}
                  onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.background = '#f8fafc'; e.target.style.boxShadow = 'none'; }}
                />
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: '700',
                  color: '#334155',
                  marginBottom: '6px',
                }}>
                  Phone / Contact <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <input
                  type="tel"
                  placeholder="9876543210"
                  value={form.phone}
                  onChange={e => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                    setForm(f => ({ ...f, phone: value }));
                  }}
                  maxLength={10}
                  required
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    border: '1.5px solid #e2e8f0',
                    borderRadius: '10px',
                    fontSize: '14px',
                    outline: 'none',
                    transition: 'all 0.15s',
                    background: '#f8fafc',
                  }}
                  onFocus={e => { e.target.style.borderColor = primaryColor; e.target.style.background = '#fff'; e.target.style.boxShadow = `0 0 0 3px ${primaryColor}25`; }}
                  onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.background = '#f8fafc'; e.target.style.boxShadow = 'none'; }}
                />
              </div>
            </div>

            {/* Row 3: Address (full width) */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: '700',
                color: '#334155',
                marginBottom: '6px',
              }}>
                Address
              </label>
              <input
                type="text"
                placeholder="Enter address"
                value={form.address}
                onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  border: '1.5px solid #e2e8f0',
                  borderRadius: '10px',
                  fontSize: '14px',
                  outline: 'none',
                  transition: 'all 0.15s',
                  background: '#f8fafc',
                }}
                onFocus={e => { e.target.style.borderColor = primaryColor; e.target.style.background = '#fff'; e.target.style.boxShadow = `0 0 0 3px ${primaryColor}25`; }}
                onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.background = '#f8fafc'; e.target.style.boxShadow = 'none'; }}
              />
            </div>

            {/* Row 4: Role, Admin Stage (2‑col) */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '16px 20px',
              marginBottom: '16px',
            }}>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: '700',
                  color: '#334155',
                  marginBottom: '6px',
                }}>
                  Role <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <select
                  value={form.role}
                  onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
                  required
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    border: '1.5px solid #e2e8f0',
                    borderRadius: '10px',
                    fontSize: '14px',
                    outline: 'none',
                    transition: 'all 0.15s',
                    background: '#f8fafc',
                    color: '#0f172a',
                    appearance: 'auto',
                  }}
                  onFocus={e => { e.target.style.borderColor = primaryColor; e.target.style.background = '#fff'; e.target.style.boxShadow = `0 0 0 3px ${primaryColor}25`; }}
                  onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.background = '#f8fafc'; e.target.style.boxShadow = 'none'; }}
                >
                  <option value="">— Select Role —</option>
                  {roles.map(r => (
                    <option key={r._id} value={r._id}>{r.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: '700',
                  color: '#334155',
                  marginBottom: '6px',
                }}>
                  Admin Stage <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <select
                  value={form.adminStage}
                  onChange={e => setForm(f => ({ ...f, adminStage: e.target.value }))}
                  required
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    border: '1.5px solid #e2e8f0',
                    borderRadius: '10px',
                    fontSize: '14px',
                    outline: 'none',
                    transition: 'all 0.15s',
                    background: '#f8fafc',
                    color: '#0f172a',
                    appearance: 'auto',
                  }}
                  onFocus={e => { e.target.style.borderColor = primaryColor; e.target.style.background = '#fff'; e.target.style.boxShadow = `0 0 0 3px ${primaryColor}25`; }}
                  onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.background = '#f8fafc'; e.target.style.boxShadow = 'none'; }}
                >
                  <option value="">— Select Stage —</option>
                  {adminStageOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Row 5: Admin Code, Password (2‑col) */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '16px 20px',
              marginBottom: '16px',
            }}>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: '700',
                  color: '#334155',
                  marginBottom: '6px',
                }}>
                  Admin Code <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <select
                  value={form.adminCode}
                  onChange={e => setForm(f => ({ ...f, adminCode: e.target.value }))}
                  required
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    border: '1.5px solid #e2e8f0',
                    borderRadius: '10px',
                    fontSize: '14px',
                    outline: 'none',
                    transition: 'all 0.15s',
                    background: '#f8fafc',
                    color: '#0f172a',
                    appearance: 'auto',
                  }}
                  onFocus={e => { e.target.style.borderColor = primaryColor; e.target.style.background = '#fff'; e.target.style.boxShadow = `0 0 0 3px ${primaryColor}25`; }}
                  onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.background = '#f8fafc'; e.target.style.boxShadow = 'none'; }}
                >
                  <option value="">— Select Code —</option>
                  {adminCodeOptions.map(code => (
                    <option key={code} value={code}>{code}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: '700',
                  color: '#334155',
                  marginBottom: '6px',
                }}>
                  {isEdit ? 'New Password (optional)' : 'Password'}
                  {!isEdit && <span style={{ color: '#dc2626' }}> *</span>}
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPwd ? 'text' : 'password'}
                    placeholder={isEdit ? 'Leave blank to keep current' : 'Enter password'}
                    value={form.password}
                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                    required={!isEdit}
                    style={{
                      width: '100%',
                      padding: '10px 44px 10px 14px',
                      border: '1.5px solid #e2e8f0',
                      borderRadius: '10px',
                      fontSize: '14px',
                      outline: 'none',
                      transition: 'all 0.15s',
                      background: '#f8fafc',
                    }}
                    onFocus={e => { e.target.style.borderColor = primaryColor; e.target.style.background = '#fff'; e.target.style.boxShadow = `0 0 0 3px ${primaryColor}25`; }}
                    onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.background = '#f8fafc'; e.target.style.boxShadow = 'none'; }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd(s => !s)}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#94a3b8',
                      display: 'flex',
                      alignItems: 'center',
                      padding: '4px',
                    }}
                  >
                    {showPwd ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div>
            </div>

            {/* Status Toggle (UI only – not sent in payload) */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: '700',
                color: '#334155',
                marginBottom: '6px',
              }}>
                Status
              </label>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                background: '#f8fafc',
                padding: '8px 14px',
                borderRadius: '10px',
                border: '1.5px solid #e2e8f0',
                height: '42px',
                maxWidth: '200px',
              }}>
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '13px',
                  fontWeight: '600',
                  color: form.isActive ? '#16a34a' : '#64748b',
                  cursor: 'pointer',
                }}>
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))}
                    style={{ accentColor: primaryColor, width: '16px', height: '16px' }}
                  />
                  {form.isActive ? (
                    <><CheckCircle size={14} style={{ color: '#16a34a' }} /> Active</>
                  ) : (
                    <><Circle size={14} style={{ color: '#94a3b8' }} /> Inactive</>
                  )}
                </label>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div style={footerStyle}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '8px 20px',
                border: '1px solid #e2e8f0',
                borderRadius: '10px',
                background: '#fff',
                color: '#475569',
                fontWeight: '600',
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#f1f5f9'; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#fff'; }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              style={{
                padding: '8px 24px',
                border: 'none',
                borderRadius: '10px',
                background: primaryColor,
                color: '#fff',
                fontWeight: '600',
                fontSize: '14px',
                cursor: submitting ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                opacity: submitting ? 0.7 : 1,
                transition: 'all 0.15s',
                boxShadow: `0 4px 6px -1px ${primaryColor}40`,
              }}
              onMouseEnter={e => {
                if (!submitting) e.currentTarget.style.background = '#005f8a';
              }}
              onMouseLeave={e => {
                if (!submitting) e.currentTarget.style.background = primaryColor;
              }}
            >
              {submitting ? (
                <span className="st-spinner" style={{
                  display: 'inline-block',
                  width: '18px',
                  height: '18px',
                  border: '2px solid #fff',
                  borderTopColor: 'transparent',
                  borderRadius: '50%',
                  animation: 'spin 0.8s linear infinite',
                }} />
              ) : (
                isEdit ? <Pencil size={16} /> : <Plus size={16} />
              )}
              {isEdit ? 'Update Staff' : 'Add Staff'}
            </button>
          </div>
        </form>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}