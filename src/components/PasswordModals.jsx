import React, { useState, useEffect } from 'react';
import { X, Lock, Key, Eye, EyeOff, CheckCircle, Loader2, AlertTriangle } from 'lucide-react';

/* ─────────────────────────────────────────────────────────────
   Password Prompt Modal (for Excel Download Protection)
───────────────────────────────────────────────────────────── */
export function PasswordPromptModal({ isOpen, onClose, onVerify, downloadType = 'Excel' }) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setPassword('');
      setError('');
      setShowPassword(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password.trim()) {
      setError('Please enter password.');
      return;
    }
    setError('');
    setVerifying(true);
    try {
      const success = await onVerify(password);
      if (success) {
        setPassword('');
        onClose();
      } else {
        setError('Invalid password. Please try again.');
      }
    } catch (err) {
      setError(err.message || 'Verification failed.');
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'rgba(15,23,42,0.65)',
      backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 9999, padding: '16px'
    }}>
      <div style={{
        background: '#fff', borderRadius: '14px',
        width: '100%', maxWidth: '440px',
        boxShadow: '0 25px 50px rgba(0,0,0,0.2)',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #dc2626, #991b1b)',
          padding: '18px 20px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              background: 'rgba(255,255,255,0.2)',
              borderRadius: '8px', padding: '6px', display: 'flex'
            }}>
              <Lock size={20} color="#fff" />
            </div>
            <div>
              <p style={{ color: '#fff', fontWeight: '700', fontSize: '15px', margin: 0 }}>
                Password Required
              </p>
              <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '12px', margin: 0 }}>
                Download: {downloadType}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            type="button"
            style={{
              background: 'none', border: 'none',
              color: '#fff', cursor: 'pointer', opacity: 0.8
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} style={{ padding: '20px' }}>
          {error && (
            <div style={{
              background: '#fef2f2', border: '1px solid #fecaca',
              color: '#b91c1c', borderRadius: '8px',
              padding: '10px 14px', fontSize: '13px',
              marginBottom: '16px', display: 'flex',
              alignItems: 'center', gap: '8px'
            }}>
              <AlertTriangle size={15} style={{ flexShrink: 0 }} /> {error}
            </div>
          )}

          <p style={{
            fontSize: '13px', color: '#475569',
            textAlign: 'center', marginBottom: '16px'
          }}>
            Enter password to download Excel file
          </p>

          {/* Password Input */}
          <div style={{ position: 'relative', marginBottom: '20px' }}>
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Enter download password"
              autoFocus
              style={{
                width: '100%', padding: '10px 40px 10px 12px',
                border: '1.5px solid #cbd5e1', borderRadius: '8px',
                fontSize: '14px', outline: 'none', boxSizing: 'border-box'
              }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute', right: '10px', top: '50%',
                transform: 'translateY(-50%)', background: 'none',
                border: 'none', cursor: 'pointer', color: '#64748b'
              }}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {/* Footer Buttons */}
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '8px 16px', border: '1px solid #cbd5e1',
                borderRadius: '6px', background: '#fff',
                color: '#475569', fontSize: '13px',
                fontWeight: '500', cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={verifying || !password.trim()}
              style={{
                padding: '8px 18px', border: 'none',
                borderRadius: '6px', background: '#dc2626',
                color: '#fff', fontSize: '13px',
                fontWeight: '600', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '6px',
                opacity: verifying || !password.trim() ? 0.6 : 1
              }}
            >
              {verifying ? (
                <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} />
              ) : null}
              {verifying ? 'Verifying...' : 'Verify & Download'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Change Password Modal (Admin Password Management)
───────────────────────────────────────────────────────────── */
export function ChangePasswordModal({ isOpen, onClose, onSave }) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setError('');
      setSuccess('');
      setShowCurrent(false);
      setShowNew(false);
      setShowConfirm(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    if (!currentPassword.trim()) {
      setError('Current password is required.');
      return;
    }
    if (!newPassword.trim()) {
      setError('New password is required.');
      return;
    }
    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('New password and confirm password do not match.');
      return;
    }
    if (currentPassword === newPassword) {
      setError('New password must be different from current password.');
      return;
    }

    setSaving(true);
    try {
      const result = await onSave({
        currentPassword,
        newPassword,
        confirmPassword
      });
      
      if (result.success) {
        setSuccess(result.message || 'Password changed successfully!');
        setTimeout(() => {
          setSaving(false);
          setSuccess('');
          onClose();
        }, 1500);
      } else {
        setSaving(false);
        setError(result.message || 'Failed to change password.');
      }
    } catch (err) {
      setSaving(false);
      setError(err.message || 'An error occurred.');
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'rgba(15,23,42,0.65)',
      backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 9999, padding: '16px'
    }}>
      <div style={{
        background: '#fff', borderRadius: '14px',
        width: '100%', maxWidth: '480px',
        boxShadow: '0 25px 50px rgba(0,0,0,0.2)',
        overflow: 'hidden',
        animation: 'fadeIn 0.2s ease-out'
      }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #0076a3, #005f8a)',
          padding: '18px 20px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              background: 'rgba(255,255,255,0.2)',
              borderRadius: '8px', padding: '8px', display: 'flex'
            }}>
              <Key size={20} color="#fff" />
            </div>
            <div>
              <p style={{ color: '#fff', fontWeight: '700', fontSize: '16px', margin: 0 }}>
                Change Excel Password
              </p>
              <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px', margin: 0 }}>
                Used to protect Excel downloads
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            type="button"
            style={{
              background: 'none', border: 'none',
              color: '#fff', cursor: 'pointer',
              opacity: 0.85, padding: '4px'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: '20px' }}>
          {/* Info Message */}
          <div style={{
            background: '#eff6ff', border: '1px solid #bfdbfe',
            color: '#1e40af', borderRadius: '8px',
            padding: '10px 14px', fontSize: '12px',
            marginBottom: '16px'
          }}>
            ℹ️ <strong>Note:</strong> Enter the password currently used for Excel downloads, then choose a new one. The new password applies to every Excel download from now on.
          </div>

          {success && (
            <div style={{
              background: '#ecfdf5', border: '1px solid #a7f3d0',
              color: '#047857', borderRadius: '8px',
              padding: '10px 14px', fontSize: '13px',
              display: 'flex', gap: '8px', alignItems: 'center',
              marginBottom: '16px'
            }}>
              <CheckCircle size={16} style={{ flexShrink: 0 }} /> {success}
            </div>
          )}
          {error && (
            <div style={{
              background: '#fef2f2', border: '1px solid #fecaca',
              color: '#b91c1c', borderRadius: '8px',
              padding: '10px 14px', fontSize: '13px',
              marginBottom: '16px'
            }}>
              ⚠️ {error}
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Current Password */}
            <div>
              <label style={{
                display: 'block', fontSize: '12px',
                fontWeight: '700', color: '#334155',
                marginBottom: '5px'
              }}>
                Current Password <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showCurrent ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={e => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  style={{
                    width: '100%', padding: '9px 40px 9px 12px',
                    border: '1px solid #cbd5e1', borderRadius: '6px',
                    fontSize: '13px', outline: 'none', boxSizing: 'border-box'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  style={{
                    position: 'absolute', right: '10px', top: '50%',
                    transform: 'translateY(-50%)', background: 'none',
                    border: 'none', cursor: 'pointer', color: '#64748b'
                  }}
                >
                  {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label style={{
                display: 'block', fontSize: '12px',
                fontWeight: '700', color: '#334155',
                marginBottom: '5px'
              }}>
                New Password <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showNew ? 'text' : 'password'}
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="Enter new password (min 6 characters)"
                  style={{
                    width: '100%', padding: '9px 40px 9px 12px',
                    border: '1px solid #cbd5e1', borderRadius: '6px',
                    fontSize: '13px', outline: 'none', boxSizing: 'border-box'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  style={{
                    position: 'absolute', right: '10px', top: '50%',
                    transform: 'translateY(-50%)', background: 'none',
                    border: 'none', cursor: 'pointer', color: '#64748b'
                  }}
                >
                  {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label style={{
                display: 'block', fontSize: '12px',
                fontWeight: '700', color: '#334155',
                marginBottom: '5px'
              }}>
                Confirm New Password <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showConfirm ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  style={{
                    width: '100%', padding: '9px 40px 9px 12px',
                    border: '1px solid #cbd5e1', borderRadius: '6px',
                    fontSize: '13px', outline: 'none', boxSizing: 'border-box'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  style={{
                    position: 'absolute', right: '10px', top: '50%',
                    transform: 'translateY(-50%)', background: 'none',
                    border: 'none', cursor: 'pointer', color: '#64748b'
                  }}
                >
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          </div>

          {/* Footer Buttons */}
          <div style={{
            marginTop: '24px', paddingTop: '16px',
            borderTop: '1px solid #f1f5f9',
            display: 'flex', gap: '10px', justifyContent: 'flex-end'
          }}>
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              style={{
                padding: '9px 18px', border: '1px solid #cbd5e1',
                borderRadius: '6px', background: '#fff',
                color: '#475569', fontSize: '13px',
                fontWeight: '500', cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              style={{
                padding: '9px 20px', border: 'none',
                borderRadius: '6px', background: '#0076a3',
                color: '#fff', fontSize: '13px',
                fontWeight: '600', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '6px',
                opacity: saving ? 0.7 : 1,
                boxShadow: '0 2px 4px rgba(0,118,163,0.2)'
              }}
            >
              {saving ? (
                <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
              ) : null}
              {saving ? 'Updating...' : 'Change Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
