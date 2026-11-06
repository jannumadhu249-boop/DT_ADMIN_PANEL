import React, { useState, useEffect, useRef } from 'react';
import { Eye, EyeOff, Download, Search, Calendar, ChevronLeft, RefreshCw, Loader2, Shield, Clock, CheckCircle, X, Send, Landmark, Plus, Edit3, User, Users, UserCheck, MapPin, FileDown, MessageSquare, CreditCard, UploadCloud, FileText, Trash2 } from 'lucide-react';
import { getMemberDetails, WORKFLOW_STATUSES, INITIAL_COMMENTS, INITIAL_MEMBERS } from '../data/mockMembers';
import { URLS } from '../url';
import * as XLSX from 'xlsx';
import { formatDate } from '../utils/dateUtils';
import { getUserRole } from '../utils/permissions';

// DateTime formatting utility - MM/DD/YYYY HH:MM
const formatDateTime = (dateString) => {
  if (!dateString) return '—';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '—';
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${month}/${day}/${year} ${hours}:${minutes}`;
};

const getAuthToken = () => {
  const keys = ['authToken', 'token', 'adminToken', 'accessToken', 'jwt'];
  for (const key of keys) {
    const value = sessionStorage.getItem(key) || localStorage.getItem(key);
    if (value) return value;
  }
  return 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhZG1pbl9pZCI6IjZhNThiZDFjNzE1ZjE4ZTYxZDQxY2Y5MiIsImVtYWlsIjoiZGl2eWFwZW5keWFsYTA3MTdAZ21haWwuY29tIiwiYWRtaW5fc3RhZ2UiOiJzdXBlciIsImlhdCI6MTc4NDIwNDE1OCwiZXhwIjoxODE1NzQwMTU4fQ.1pjPlGU41H1G5ei3AfTEcaWk9O1eyRTG769xnpj5xts';
};

/* ─── Reverse map: backend filestatus code → WORKFLOW_STATUSES display name ─── */
const CODE_TO_DISPLAY = {
  'RGO':     'Registered Users',
  'BIP':     'Information Pending',
  'SP':      'Scheduling Pending',
  'IP':      'Interview Pending', 
  'DP':      'Documents Pending',
  'PP_I':    'Preparation - 1',
  'PP_II':   'Preparation - 2',
  'TR_S_I':  'Review & Summary 1',
  'TR_S_II': 'Review & Summary 2',
  'ITIN':    'ITIN Files',
  'RE_ES':   'Revised Estimate',
  'PP_EF':   'Payment Pending - Efiling',
  'PP_PF':   'Payment Pending - Paper filing',
  'FPR':     'Fee Payment Received - I',
  'FPR_II':  'Fee Payment Received - II',
  'FPR_2':   'Fee Payment Received - II',
  'CR_EF':   'Client Review - Efiling',
  'CR_PF':   'Client Review - Paper Filing',
  'EFP_I':   'Efiling Pending - 1',
  'EFP_II':  'Efiling Pending - 2',
  'EF_AA_I': 'E - Filed & Awaiting Acceptance - 1',
  'EF_AA_II':'E - Filed & Awaiting Acceptance - 2',
  'EF_REJ':  'E - Filed & Rejected',
  'C_R':     'City Return',
  'EFA_FC':  'E-Filing Accepted & Filing Complete',
  'PF_P':    'Paper Filing Pending',
  'PF_D':    'Paper Filing Done',
  'CANC':    'Cancelled',
};

/* ─────────────────────────────────────────────────────────────
   OTP Modal (Email OTP Verification via API)
───────────────────────────────────────────────────────────── */
function OtpModal({ isOpen, onClose, onVerify, onResend, fieldLabel }) {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const refs = Array.from({ length: 6 }, () => React.createRef());

  useEffect(() => {
    if (!isOpen) return;
    setOtp(['', '', '', '', '', '']);
    setTimeLeft(30);
    setError('');
    setSuccess('Verification code sent to email.');

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { clearInterval(timer); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen]);

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
      setError(err.message || 'Verification failed.');
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '16px' }}>
      <div style={{ background: '#fff', borderRadius: '14px', width: '100%', maxWidth: '440px', boxShadow: '0 25px 50px rgba(0,0,0,0.2)', overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ background: 'linear-gradient(135deg, #0076a3, #005f8a)', padding: '18px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ background: 'rgba(255,255,255,0.2)', borderRadius: '8px', padding: '6px', display: 'flex' }}>
              <Shield size={20} color="#fff" />
            </div>
            <div>
              <p style={{ color: '#fff', fontWeight: '700', fontSize: '15px', margin: 0 }}>Email Verification Required</p>
              <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '12px', margin: 0 }}>Unmask: {fieldLabel}</p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', opacity: 0.8 }}>
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '20px' }}>
          {success && (
            <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', color: '#047857', borderRadius: '8px', padding: '10px 14px', fontSize: '12px', display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '14px' }}>
              <CheckCircle size={15} style={{ flexShrink: 0 }} />{success}
            </div>
          )}
          {error && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', borderRadius: '8px', padding: '10px 14px', fontSize: '12px', marginBottom: '14px' }}>
              ⚠️ {error}
            </div>
          )}

          <p style={{ fontSize: '13px', color: '#475569', textAlign: 'center', marginBottom: '16px' }}>
            Enter the 6-digit security code sent to verify email viewing
          </p>

          {/* Digit Boxes */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '18px' }}>
            {otp.map((d, i) => (
              <input
                key={i}
                ref={refs[i]}
                type="text"
                maxLength={1}
                value={d}
                onChange={e => handleChange(e.target.value, i)}
                onKeyDown={e => handleKeyDown(e, i)}
                onFocus={e => e.target.select()}
                style={{
                  width: '44px', height: '50px', textAlign: 'center', fontSize: '22px', fontWeight: '700',
                  border: `2px solid ${d ? '#0076a3' : '#cbd5e1'}`,
                  borderRadius: '8px', outline: 'none',
                  boxShadow: d ? '0 0 0 3px rgba(0,118,163,0.15)' : 'none',
                  transition: 'all 0.15s'
                }}
              />
            ))}
          </div>

          {/* Timer + Resend */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px 14px', marginBottom: '4px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '600', color: timeLeft === 0 ? '#dc2626' : '#1e293b' }}>
              <Clock size={15} color={timeLeft === 0 ? '#dc2626' : '#2563eb'} />
              {timeLeft > 0 ? `Expires in ${fmt(timeLeft)}` : 'Code Expired'}
            </div>
            <button onClick={handleResend} disabled={timeLeft > 0 || isResending} style={{ border: 'none', background: 'none', cursor: timeLeft > 0 || isResending ? 'not-allowed' : 'pointer', color: '#0076a3', fontSize: '12px', fontWeight: '600', opacity: timeLeft > 0 || isResending ? 0.45 : 1, display: 'flex', alignItems: 'center', gap: '5px' }}>
              {isResending ? <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} /> : <RefreshCw size={13} />}
              {isResending ? 'Sending...' : 'Resend Code'}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: '12px 20px 16px', borderTop: '1px solid #f1f5f9', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{ padding: '8px 16px', border: '1px solid #cbd5e1', borderRadius: '6px', background: '#fff', color: '#475569', fontSize: '13px', fontWeight: '500', cursor: 'pointer' }}>
            Cancel
          </button>
          <button
            onClick={handleVerify}
            disabled={isVerifying || otp.join('').length < 6}
            style={{ padding: '8px 18px', border: 'none', borderRadius: '6px', background: '#0076a3', color: '#fff', fontSize: '13px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', opacity: isVerifying || otp.join('').length < 6 ? 0.6 : 1 }}
          >
            {isVerifying ? <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> : null}
            {isVerifying ? 'Verifying...' : 'Verify & Reveal Email'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Bank Details Add / Edit Modal
───────────────────────────────────────────────────────────── */
function BankModal({ isOpen, onClose, onSave, bankData, memberName }) {
  const [accountNumber, setAccountNumber] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountHolderName, setAccountHolderName] = useState('');
  const [routingNumber, setRoutingNumber] = useState('');
  const [accountType, setAccountType] = useState('Checking Account');
  
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const isEdit = Boolean(bankData && Object.keys(bankData).length > 0 && (bankData.account_number || bankData.bank_name || bankData.accountNumber || bankData.bankName));

  useEffect(() => {
    if (!isOpen) return;
    setError('');
    setSuccess('');
    if (bankData && Object.keys(bankData).length > 0) {
      setAccountNumber(bankData.account_number || bankData.accountNumber || '');
      setBankName(bankData.bank_name || bankData.bankName || '');
      setAccountHolderName(bankData.account_holder_name || bankData.account_holder || bankData.accountHolderName || memberName || '');
      setRoutingNumber(bankData.routing_number || bankData.routingNumber || '');
      
      const rawType = bankData.account_type || bankData.accountType || 'Checking Account';
      if (rawType.toLowerCase().includes('sav')) {
        setAccountType('Saving Account');
      } else {
        setAccountType('Checking Account');
      }
    } else {
      setAccountNumber('');
      setBankName('');
      setAccountHolderName(memberName || '');
      setRoutingNumber('');
      setAccountType('Checking Account');
    }
  }, [isOpen, bankData, memberName]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!accountNumber.trim()) { setError('Account Number is required.'); return; }
    if (!bankName.trim()) { setError('Bank Name is required.'); return; }
    if (!accountHolderName.trim()) { setError('Account Holder Name is required.'); return; }
    if (!routingNumber.trim()) { setError('Routing Number is required.'); return; }
    if (!accountType) { setError('Account Type is required.'); return; }

    setError('');
    setSaving(true);

    try {
      await onSave({
        account_number: accountNumber.trim(),
        bank_name: bankName.trim(),
        account_holder_name: accountHolderName.trim(),
        routing_number: routingNumber.trim(),
        account_type: accountType
      });
      setSuccess(isEdit ? 'Bank details updated successfully!' : 'Bank details added successfully!');
      setTimeout(() => {
        setSaving(false);
        setSuccess('');
        onClose();
      }, 700);
    } catch (err) {
      setSaving(false);
      setError(err.message || 'Failed to save bank details.');
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '16px' }}>
      <div style={{ background: '#fff', borderRadius: '14px', width: '100%', maxWidth: '520px', boxShadow: '0 25px 50px rgba(0,0,0,0.2)', overflow: 'hidden', animation: 'fadeIn 0.2s ease-out' }}>
        {/* Header */}
        <div style={{ background: 'linear-gradient(135deg, #0076a3, #005f8a)', padding: '18px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ background: 'rgba(255,255,255,0.2)', borderRadius: '8px', padding: '8px', display: 'flex' }}>
              <Landmark size={20} color="#fff" />
            </div>
            <div>
              <p style={{ color: '#fff', fontWeight: '700', fontSize: '16px', margin: 0 }}>
                {isEdit ? 'Edit Bank Details' : 'Add Bank Details'}
              </p>
              <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px', margin: 0 }}>
                {isEdit ? 'Update member refund and tax settlement banking information' : 'Enter new bank account information for member'}
              </p>
            </div>
          </div>
          <button onClick={onClose} type="button" style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', opacity: 0.85, padding: '4px' }}>
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: '20px' }}>
          {success && (
            <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', color: '#047857', borderRadius: '8px', padding: '10px 14px', fontSize: '13px', display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '16px' }}>
              <CheckCircle size={16} style={{ flexShrink: 0 }} /> {success}
            </div>
          )}
          {error && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', borderRadius: '8px', padding: '10px 14px', fontSize: '13px', marginBottom: '16px' }}>
              ⚠️ {error}
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* Account Number */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '5px' }}>
                1. Account Number <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <input
                type="text"
                value={accountNumber}
                onChange={e => setAccountNumber(e.target.value)}
                placeholder="Enter Account Number (e.g. 1234567890)"
                style={{
                  width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '6px',
                  fontSize: '13px', color: '#0f172a', outline: 'none', boxSizing: 'border-box', fontFamily: 'monospace'
                }}
              />
            </div>

            {/* Bank Name */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '5px' }}>
                2. Bank Name <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <input
                type="text"
                value={bankName}
                onChange={e => setBankName(e.target.value)}
                placeholder="Enter Bank Name (e.g. JPMorgan Chase Bank, Bank of America)"
                style={{
                  width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '6px',
                  fontSize: '13px', color: '#0f172a', outline: 'none', boxSizing: 'border-box'
                }}
              />
            </div>

            {/* Account Holder Name */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '5px' }}>
                3. Account Holder Name <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <input
                type="text"
                value={accountHolderName}
                onChange={e => setAccountHolderName(e.target.value)}
                placeholder="Enter Account Holder Name (e.g. John Doe)"
                style={{
                  width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '6px',
                  fontSize: '13px', color: '#0f172a', outline: 'none', boxSizing: 'border-box'
                }}
              />
            </div>

            {/* Routing Number */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '5px' }}>
                4. Routing Number <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <input
                type="text"
                value={routingNumber}
                onChange={e => setRoutingNumber(e.target.value)}
                placeholder="Enter 9-digit Routing Number (e.g. 021000021)"
                style={{
                  width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '6px',
                  fontSize: '13px', color: '#0f172a', outline: 'none', boxSizing: 'border-box', fontFamily: 'monospace'
                }}
              />
            </div>

            {/* Type of Account (Radio selecting option) */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '8px' }}>
                5. Type of Account <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <label style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '10px 14px', borderRadius: '8px', cursor: 'pointer',
                  border: accountType === 'Checking Account' ? '2px solid #0076a3' : '1px solid #cbd5e1',
                  background: accountType === 'Checking Account' ? '#f0f9ff' : '#fff',
                  transition: 'all 0.15s ease'
                }}>
                  <input
                    type="radio"
                    name="accountType"
                    value="Checking Account"
                    checked={accountType === 'Checking Account'}
                    onChange={() => setAccountType('Checking Account')}
                    style={{ accentColor: '#0076a3', cursor: 'pointer', width: '16px', height: '16px' }}
                  />
                  <div>
                    <span style={{ fontSize: '13px', fontWeight: '600', color: '#0f172a', display: 'block' }}>Checking Account</span>
                    <span style={{ fontSize: '11px', color: '#64748b' }}>Standard transactional account</span>
                  </div>
                </label>

                <label style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '10px 14px', borderRadius: '8px', cursor: 'pointer',
                  border: accountType === 'Saving Account' ? '2px solid #0076a3' : '1px solid #cbd5e1',
                  background: accountType === 'Saving Account' ? '#f0f9ff' : '#fff',
                  transition: 'all 0.15s ease'
                }}>
                  <input
                    type="radio"
                    name="accountType"
                    value="Saving Account"
                    checked={accountType === 'Saving Account'}
                    onChange={() => setAccountType('Saving Account')}
                    style={{ accentColor: '#0076a3', cursor: 'pointer', width: '16px', height: '16px' }}
                  />
                  <div>
                    <span style={{ fontSize: '13px', fontWeight: '600', color: '#0f172a', display: 'block' }}>Saving Account</span>
                    <span style={{ fontSize: '11px', color: '#64748b' }}>Savings deposit account</span>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Footer Buttons */}
          <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #f1f5f9', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              style={{
                padding: '9px 18px', border: '1px solid #cbd5e1', borderRadius: '6px',
                background: '#fff', color: '#475569', fontSize: '13px', fontWeight: '500', cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              style={{
                padding: '9px 20px', border: 'none', borderRadius: '6px',
                background: '#0076a3', color: '#fff', fontSize: '13px', fontWeight: '600',
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
                opacity: saving ? 0.7 : 1, boxShadow: '0 2px 4px rgba(0,118,163,0.2)'
              }}
            >
              {saving ? <Loader2 size={16} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} /> : null}
              {saving ? (isEdit ? 'Updating...' : 'Adding...') : (isEdit ? 'Update Bank Details' : 'Save Bank Details')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Detail View — Full page view with 10-tab ribbon
   Note: SSN unmasking does NOT require OTP per user instruction.
───────────────────────────────────────────────────────────── */
const DETAIL_TABS = [
  { id: 'personal',  label: 'Personal Info',   icon: User },
  { id: 'spouse',    label: 'Spouse Info',      icon: Users },
  { id: 'dependent', label: 'Dependent Info',  icon: UserCheck },
  { id: 'bank',      label: 'Bank Details',    icon: Landmark },
  { id: 'address',   label: 'Address',         icon: MapPin },
  { id: 'download',  label: 'Download',        icon: FileDown },
  { id: 'interview', label: 'Interview',       icon: MessageSquare },
  { id: 'pay',       label: 'Pay',             icon: CreditCard },
  { id: 'upload',    label: 'Upload',          icon: UploadCloud },
  { id: 'fileInfo',  label: 'File Info',       icon: FileText },
];

const statusColor = (s = '') => {
  if (s.includes('Complete') || s.includes('Accepted')) return '#28a745';
  if (s.includes('Rejected')) return '#dc3545';
  if (s.includes('Pending')) return '#856404';
  return '#333';
};

function MemberDetailFullPage({ member, onBack, commentsHistory, onAddComment, onSendEmailOtp, onVerifyEmailOtp }) {
  const [activeTab, setActiveTab] = useState('personal');
  const [tabRefreshKey, setTabRefreshKey] = useState(0);
  const [unmasked, setUnmasked] = useState({});
  const [otpOpen, setOtpOpen] = useState(false);
  const [bankModalOpen, setBankModalOpen] = useState(false);
  const [pendingEmailKey, setPendingEmailKey] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [commentPopup, setCommentPopup] = useState(null); // { text: string } | null
  const [commentStatus, setCommentStatus] = useState(member.status);
  const [fileTypeInput, setFileTypeInput] = useState('E-Filing');
  // Use raw filestatus code (from member.raw) to resolve the correct WORKFLOW_STATUSES display name.
  // Falls back to member.status (backend display name) or first status.
  const [statusInput, setStatusInput] = useState(
    CODE_TO_DISPLAY[member.raw?.filestatus || ''] || member.status || 'Registered Users'
  );

  // Profile API State
  const [profileData, setProfileData] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(false);

    // Payment state (for Pay tab)
    const [payAmount, setPayAmount] = useState('');
    const [paymentLoading, setPaymentLoading] = useState(false);
    const [paymentSuccess, setPaymentSuccess] = useState('');
    const [paymentError, setPaymentError] = useState('');

  // Document Upload State
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadDocName, setUploadDocName] = useState('');
  const [uploadDocTypeId, setUploadDocTypeId] = useState('');
  const [uploadYearId, setUploadYearId] = useState('');
  const [recentFiveYears, setRecentFiveYears] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState('');
  const fileInputRef = useRef(null);

  // ---- Admin uploaded documents (fetched separately) ----
  const [adminUploadedDocs, setAdminUploadedDocs] = useState([]);
  const [loadingAdminDocs, setLoadingAdminDocs] = useState(false);

  const [deleteLoading, setDeleteLoading] = useState(false);

  // Track admin-uploaded document IDs to persist the flag even after re-fetch
  const [adminUploadedDocIds, setAdminUploadedDocIds] = useState(new Set());

  // Document type mapping (string to ID)
  const DOC_TYPE_MAP = {
    'Tax Summary': '',
    'Revised Tax Summary': '',
    'Tax Review Copy': '',
    'Filed Return For Records': ''
  };

    // Payment handler
  const handlePay = () => {
    if (!payAmount || parseFloat(payAmount) <= 0) {
      setPaymentError('Please enter a valid amount.');
      return;
    }
    setPaymentError('');
    setPaymentLoading(true);
    setPaymentSuccess('');
    // Simulate payment processing
    setTimeout(() => {
      setPaymentLoading(false);
      setPaymentSuccess(`Payment of $${payAmount} processed successfully!`);
      setPayAmount('');
      setTimeout(() => setPaymentSuccess(''), 4000);
    }, 1500);
  };

  const handleResetPay = () => {
    setPayAmount('');
    setPaymentError('');
  };

  // Add Payment
const handleAddPayment = async () => {
  if (!payAmount || parseFloat(payAmount) <= 0) {
    setPaymentError('Please enter a valid amount.');
    return;
  }
  setPaymentError('');
  setPaymentLoading(true);
  setPaymentSuccess('');

  try {
    const token = getAuthToken();
    const memberId = member._id || member.sNo;
    const res = await fetch(`${URLS.PayAmount}${memberId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ amount: parseFloat(payAmount) }),
    });
    const data = await res.json();
    if (data.success) {
      setPaymentSuccess(data.message || 'Payment added successfully!');
      setPayAmount('');
      // Refresh payment history
      fetchPaymentHistory();
    } else {
      setPaymentError(data.message || 'Failed to add payment.');
    }
  } catch (err) {
    console.error('Add payment error:', err);
    setPaymentError('Network error. Please try again.');
  } finally {
    setPaymentLoading(false);
  }
};

// Fetch Payment History
const [paymentHistory, setPaymentHistory] = useState([]);
const [loadingPaymentHistory, setLoadingPaymentHistory] = useState(false);

const fetchPaymentHistory = async () => {
  const memberId = member._id || member.sNo;
  if (!memberId) return;
  setLoadingPaymentHistory(true);
  try {
    const token = getAuthToken();
    const res = await fetch(`${URLS.GetPayList}${memberId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await res.json();
    if (data.success) {
      setPaymentHistory(data.data || []);
    } else {
      console.warn('Failed to fetch payment history:', data.message);
    }
  } catch (err) {
    console.error('Fetch payment history error:', err);
  } finally {
    setLoadingPaymentHistory(false);
  }
};

// Fetch payment history when component mounts or member changes
useEffect(() => {
  if (member._id || member.sNo) {
    fetchPaymentHistory();
  }
}, [member]);

  // ---- Fetch recent 5 years ----
  const fetchRecentFiveYears = async () => {
    try {
      const token = getAuthToken();
      const res = await fetch(URLS.GetLatestFiveYears, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setRecentFiveYears(data.data);
      }
    } catch (err) {
      console.warn('Error loading recent 5 years:', err);
    }
  };

  useEffect(() => {
    fetchRecentFiveYears();
  }, []);

  // ---- Fetch admin‑uploaded documents ----
  const fetchAdminUploadedDocs = async (memberId) => {
    if (!memberId) return;
    setLoadingAdminDocs(true);
    try {
      const token = getAuthToken();
      const res = await fetch(`${URLS.GetUploadList}${memberId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const result = await res.json();
      if (result.success && Array.isArray(result.data)) {
        setAdminUploadedDocs(result.data);
      } else {
        setAdminUploadedDocs([]);
      }
    } catch (err) {
      console.warn('⚠️ Fetch admin documents error:', err);
      setAdminUploadedDocs([]);
    } finally {
      setLoadingAdminDocs(false);
    }
  };

  const handleUploadDocument = async (e) => {
    e.preventDefault();
    const userId = member._id || member.sNo;
    if (!userId) {
      setUploadError('Member ID is missing.');
      return;
    }
    if (!uploadFile) {
      setUploadError('Please select a file to upload.');
      return;
    }
    if (!uploadDocTypeId) {
      setUploadError('Please select a document type.');
      return;
    }

    setUploadError('');
    setUploadSuccess('');
    setIsUploading(true);

    try {
      const token = getAuthToken();
      const formData = new FormData();
      formData.append('document', uploadFile);
      
      // Convert string type to ID if needed
      const docTypeIdToSend = DOC_TYPE_MAP[uploadDocTypeId] || uploadDocTypeId;
      formData.append('document_type', docTypeIdToSend);
      formData.append('document_name', uploadDocName.trim() || uploadFile.name);
      if (uploadYearId) {
        formData.append('year_id', uploadYearId);
      }

      const endpoint = `${URLS.UploadDocuments}${userId}`;

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const result = await res.json();

      if (res.ok && result.success) {
        setUploadSuccess(result.message || 'Document uploaded successfully.');
        await fetchAdminUploadedDocs(userId);
        await fetchMemberProfile(userId);
        setUploadFile(null);
        setUploadDocName('');
        setUploadDocTypeId('');
        setUploadYearId('');
        if (fileInputRef.current) fileInputRef.current.value = '';
        setTimeout(() => setUploadSuccess(''), 4000);
      } else {
        const errorMsg = result.message || result.error || `Failed to upload document (${res.status})`;
        setUploadError(errorMsg);
      }
    } catch (err) {
      console.error('❌ Upload document error:', err);
      setUploadError(err.message || 'Network error occurred during upload.');
    } finally {
      setIsUploading(false);
    }
  };

  useEffect(() => {
    const validFileTypes = ['E-Filing', 'Paper-Filing'];
    let defaultFileType = member.filingType || 'E-Filing';
    if (!validFileTypes.includes(defaultFileType)) {
      defaultFileType = 'E-Filing';
    }
    setFileTypeInput(defaultFileType);
    // Re-resolve the display name from the raw status code whenever the member changes.
    setStatusInput(
      CODE_TO_DISPLAY[member.raw?.filestatus || ''] || member.status || 'Registered Users'
    );
  }, [member]);

const handleDeleteDoc = async (docId) => {
  if (!window.confirm('Are you sure you want to delete this document?')) return;

  setDeleteLoading(true);
  setUploadError('');
  setUploadSuccess('');

  try {
    const token = getAuthToken();
    const memberId = member._id || member.sNo;

    const res = await fetch(`${URLS.DeleteUploads}${docId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    const result = await res.json();

    if (res.ok && result.success) {
      setUploadSuccess('Document deleted successfully.');

      // 1. Remove from adminUploadedDocs list (Upload tab)
      setAdminUploadedDocs(prev => prev.filter(doc => (doc._id || doc.id) !== docId));

      // 2. Also remove from profileData.documents (if present)
      setProfileData(prev => ({
        ...prev,
        documents: (prev?.documents || []).filter(d => (d._id || d.id) !== docId)
      }));

      // Optional: re‑fetch both lists to guarantee consistency
      // await fetchAdminUploadedDocs(memberId);
      // await fetchMemberProfile(memberId);

      setTimeout(() => setUploadSuccess(''), 4000);
    } else {
      setUploadError(result.message || 'Failed to delete document.');
    }
  } catch (err) {
    console.error('Delete error:', err);
    setUploadError(err.message || 'Network error occurred during deletion.');
  } finally {
    setDeleteLoading(false);
  }
};

  // File Info (Member Status) State & API Handlers
  const [statusHistory, setStatusHistory] = useState([]);
  const [currentFileInfo, setCurrentFileInfo] = useState(null);
  const [loadingFileInfo, setLoadingFileInfo] = useState(false);
  const [isSubmittingFileInfo, setIsSubmittingFileInfo] = useState(false);
  const [fileInfoSuccessMsg, setFileInfoSuccessMsg] = useState('');
  const [fileInfoErrorMsg, setFileInfoErrorMsg] = useState('');
  
  // const [fileTypeInput, setFileTypeInput] = useState(member.filingType || 'E-Filing');
  // const [statusInput, setStatusInput] = useState(member.status || 'EFA_FC');
  const [commentsInput, setCommentsInput] = useState('');

  // Status name to code mapping
  const STATUS_CODE_MAP = {
    'Registered Users': 'RGO',
    'Registered Only': 'RGO',
    'Basic Information Pending': 'BIP',
    'Scheduling Pending': 'SP',
    'Interview Pending': 'IP',
    'Documents Pending': 'DP',

    // Preparation 1 & 2
    'Preparation - 1': 'PP_I',
    'Preparation - 2': 'PP_II',

    // Review & Summary 1 & 2
    'Review & Summary 1': 'TR_S_I',
    'Review & Summary 2': 'TR_S_II',

    'ITIN Files': 'ITIN',
    'Revised Estimate': 'RE_ES',
    'Payment Pending - Efiling': 'PP_EF',
    'Payment Pending - Paper filing': 'PP_PF',

    // Fee Payment Received I & II
    'Fee Payment Received - I': 'FPR',
    'Fee Payment Received - II': 'FPR_II',

    'Client Review - Efiling': 'CR_EF',
    'Client Review - Paper Filing': 'CR_PF',

    // Efiling Pending 1 & 2
    'Efiling Pending - 1': 'EFP_I',
    'Efiling Pending - 2': 'EFP_II',

    // E - Filed & Awaiting Acceptance 1 & 2
    'E - Filed & Awaiting Acceptance - 1': 'EF_AA_I',
    'E - Filed & Awaiting Acceptance - 2': 'EF_AA_II',

    'E - Filed & Rejected': 'EF_REJ',
    'City Return': 'C_R',
    'E-Filing Accepted & Filing Complete': 'EFA_FC',
    'Paper Filing Pending': 'PF_P',
    'Paper Filing Done': 'PF_D',
    'Cancelled': 'CANC',

    // Direct code identity mappings
    'RGO': 'RGO',
    'BIP': 'BIP',
    'SP': 'SP',
    'IP': 'IP',
    'DP': 'DP',
    'PP_I': 'PP_I',
    'PP_II': 'PP_II',
    'TR_S_I': 'TR_S_I',
    'TR_S_II': 'TR_S_II',
    'ITIN': 'ITIN',
    'RE_ES': 'RE_ES',
    'PP_EF': 'PP_EF',
    'PP_PF': 'PP_PF',
    'FPR': 'FPR',
    'FPR_II': 'FPR_II',
    'FPR_2': 'FPR_II',
    'CR_EF': 'CR_EF',
    'CR_PF': 'CR_PF',
    'EFP_I': 'EFP_I',
    'EFP_II': 'EFP_II',
    'EF_AA_I': 'EF_AA_I',
    'EF_AA_II': 'EF_AA_II',
    'EF_REJ': 'EF_REJ',
    'C_R': 'C_R',
    'EFA_FC': 'EFA_FC',
    'PF_P': 'PF_P',
    'PF_D': 'PF_D',
    'CANC': 'CANC'
  };

  const fetchFileInfoHistory = async () => {
    const memberId = member._id || member.sNo;
    if (!memberId) return;
    setLoadingFileInfo(true);
    try {
      const token = getAuthToken();
      const res = await fetch(`${URLS.GetFileInfo}${memberId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (res.ok) {
        const result = await res.json();
        
        if (result.success) {
          if (Array.isArray(result.history)) {
            // Sort by creation date, newest first
            const sortedHistory = result.history.sort((a, b) => {
              const dateA = new Date(a.createdAt || a.dateTime || 0);
              const dateB = new Date(b.createdAt || b.dateTime || 0);
              return dateB - dateA; // Newest first
            });
            setStatusHistory(sortedHistory);
            console.log('✅ Status history updated:', sortedHistory.length, 'entries');
          } else {
            setStatusHistory([]);
          }
          if (result.currentStatus) {
            setCurrentFileInfo(result.currentStatus);
          }
        }
      }
    } catch (err) {
      console.warn('⚠️ Fetch File Info history warning:', err);
    } finally {
      setLoadingFileInfo(false);
    }
  };

  // Refresh fileInfo data whenever member changes OR fileInfo tab becomes active
  useEffect(() => {
    if (activeTab === 'fileInfo' || member) {
      fetchFileInfoHistory();
    }
  }, [member]);

  const handleCreateFileInfoStatus = async (e) => {
    e.preventDefault();
    const memberId = member._id || member.sNo;
    if (!memberId) {
      setFileInfoErrorMsg('Member ID is missing.');
      return;
    }
    // Comments are optional — no mandatory check.

    setFileInfoErrorMsg('');
    setFileInfoSuccessMsg('');
    setIsSubmittingFileInfo(true);

    try {
      const token = getAuthToken();
      
      // Convert status name to code before sending
      const statusCode = STATUS_CODE_MAP[statusInput] || statusInput;
      
      const payload = {
        file_type: fileTypeInput || member.filingType || '',
        status: statusCode,
        comments: commentsInput.trim()
      };

      console.log('📤 Submitting File Info:', {
        memberId,
        statusName: statusInput,
        statusCode: statusCode,
        payload
      });

      const res = await fetch(`${URLS.CreateFileInfo}${memberId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const result = await res.json();

      // console.log('📥 API Response:', { status: res.status, result });

      if (res.ok && result.success) {
        setFileInfoSuccessMsg(result.message || 'Member status updated successfully.');
        setTimeout(() => setFileInfoSuccessMsg(''), 4000);
        setCommentsInput('');
        
        // If the API returns the new status entry, add it to the list immediately
        if (result.data) {
          const newEntry = {
            ...result.data,
            _id: result.data._id || result.data.id || Date.now(),
            file_type: fileTypeInput,
            status: statusInput, // Keep the name for display
            status_name: statusInput,
            comments: commentsInput,
            createdBy: result.data.createdBy || 'Admin',
            createdAt: result.data.createdAt || new Date().toISOString()
          };
          
          // Add to the beginning of the list (newest first)
          setStatusHistory(prev => [newEntry, ...prev]);
          console.log('✅ Added new entry to history (optimistic update)');
        }
        
        // Also refresh the complete history from the server
        setTimeout(() => fetchFileInfoHistory(), 500);
      } else {
        const errorMsg = result.message || result.error || `Failed to update member status (${res.status})`;
        setFileInfoErrorMsg(errorMsg);
        console.error('❌ API Error:', { status: res.status, result });
      }
    } catch (err) {
      console.error('❌ Create member status error:', err);
      setFileInfoErrorMsg(err.message || 'Network error occurred.');
    } finally {
      setIsSubmittingFileInfo(false);
    }
  };

  // ---- Fetch member profile data ----
  const fetchMemberProfile = async (targetMemberId) => {
    const memberId = targetMemberId || member._id || member.sNo;
    if (!memberId) return;
    setLoadingProfile(true);
    try {
      const token = getAuthToken();
      const res = await fetch(`${URLS.GetMemberView}${memberId}/profile`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (res.ok) {
        const result = await res.json();
        if (result.success && result.data) {
          // Mark documents as admin-uploaded if they have the flag from backend
          const processedData = {
            ...result.data,
            documents: Array.isArray(result.data.documents) 
              ? result.data.documents.map(doc => ({
                  ...doc,
                  // Mark as admin upload if backend indicates it, or if it has new_docs flag
                  isAdminUploaded: doc.isAdminUploaded || doc.new_docs || doc.uploaded_by_admin || doc.admin_upload || false
                }))
              : []
          };
          
          setProfileData(processedData);
        }
      }
    } catch (err) {
      console.warn('Member profile fetch warning:', err);
    } finally {
      setLoadingProfile(false);
    }
  };

  useEffect(() => {
    fetchMemberProfile();
  }, [member]);

  // ---- Fetch admin docs when member changes ----
  useEffect(() => {
    const memberId = member._id || member.sNo;
    if (memberId) {
      fetchAdminUploadedDocs(memberId);
    }
  }, [member]);

  // ---- Per-tab refresh: reload the right data whenever activeTab changes ----
  useEffect(() => {
    const memberId = member._id || member.sNo;
    if (!memberId) return;

    switch (activeTab) {
      case 'personal':
      case 'spouse':
      case 'dependent':
      case 'bank':
      case 'address':
      case 'download':
      case 'interview':
        fetchMemberProfile(memberId);
        break;
      case 'pay':
        fetchPaymentHistory();
        break;
      case 'upload':
        fetchAdminUploadedDocs(memberId);
        fetchRecentFiveYears();
        // Clear stale alerts when switching to upload tab
        setUploadSuccess('');
        setUploadError('');
        break;
      case 'fileInfo':
        fetchFileInfoHistory();
        break;
      default:
        break;
    }
  }, [activeTab, tabRefreshKey]);

  const details = getMemberDetails(member);
  const history = commentsHistory?.[member.sNo || member._id] || [
    { status: member.status, comments: 'Initial registration processed.', dateTime: member.regDate }
  ];

  const handleSaveBankDetails = async (formData) => {
    const memberId = member._id || member.sNo;
    const hasBank = Boolean(profileData?.bankDetails && Object.keys(profileData.bankDetails).length > 0 && (profileData.bankDetails.account_number || profileData.bankDetails.bank_name));
    
    const token = getAuthToken();
    const payload = {
      member_id: memberId,
      memberId: memberId,
      account_number: formData.account_number,
      bank_name: formData.bank_name,
      account_holder_name: formData.account_holder_name,
      account_holder: formData.account_holder_name,
      routing_number: formData.routing_number,
      account_type: formData.account_type,
    };

    const endpoint = hasBank ? URLS.UpdateBankDetails : URLS.CreateBankDetails;

    try {
      let res = await fetch(`${endpoint}${memberId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        res = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });
      }
    } catch (err) {
      console.warn('Bank Details API network notice:', err);
    }

    setProfileData(prev => ({
      ...prev,
      bankDetails: {
        ...(prev?.bankDetails || {}),
        bank_name: formData.bank_name,
        account_number: formData.account_number,
        account_holder_name: formData.account_holder_name,
        account_holder: formData.account_holder_name,
        routing_number: formData.routing_number,
        account_type: formData.account_type,
        updatedAt: new Date().toISOString(),
        createdAt: prev?.bankDetails?.createdAt || new Date().toISOString(),
      }
    }));
  };

  const [otpFieldLabel, setOtpFieldLabel] = useState('Email Address');
  const [otpType, setOtpType] = useState('email'); // 'email' or 'contact'

  // Contact Number & Email require OTP verification!
  const handleToggleField = (key, requiresOtp = false, label = 'Email Address', isContact = false) => {
    if (unmasked[key]) {
      setUnmasked(prev => ({ ...prev, [key]: false }));
    } else if (requiresOtp) {
      setPendingEmailKey(key);
      setOtpFieldLabel(label);
      setOtpType(isContact ? 'contact' : 'email');
      setOtpOpen(true);
      if (onSendEmailOtp) {
        onSendEmailOtp(member._id || member.sNo, isContact);
      }
    } else {
      setUnmasked(prev => ({ ...prev, [key]: true }));
    }
  };

  const handleOtpVerify = async (code) => {
    if (onVerifyEmailOtp) {
      const success = await onVerifyEmailOtp(member._id || member.sNo, code, otpType);
      if (success) {
        if (pendingEmailKey) setUnmasked(prev => ({ ...prev, [pendingEmailKey]: true }));
        return true;
      }
      return false;
    }
    if (pendingEmailKey) setUnmasked(prev => ({ ...prev, [pendingEmailKey]: true }));
    return true;
  };

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    const pad = n => String(n).padStart(2, '0');
    const now = new Date();
    const dt = `${pad(now.getMonth() + 1)}-${pad(now.getDate())}-${now.getFullYear()} :: ${pad(now.getHours())}:${pad(now.getMinutes())}`;
    if (onAddComment) onAddComment(member._id || member.sNo, commentStatus, commentText, dt);
    setCommentText('');
  };

  return (
    <>
      <div className="detail-view-container" style={{ animation: 'fadeIn 0.2s ease-out' }}>
        {/* Back Button */}
        <button className="detail-back-btn" onClick={onBack}>
          <ChevronLeft size={16} style={{ display: 'inline', marginRight: '4px' }} />
          Back to List
        </button>

        {/* Member Quick Info Bar */}
        <div style={{ marginBottom: '12px', padding: '10px 14px', background: '#f8f9fa', borderRadius: '4px', border: '1px solid #e5e7eb', fontSize: '13px' }}>
          <strong style={{ fontSize: '15px', color: '#0076a3' }}>
            {profileData?.header ? `${profileData.header.first_name || ''} ${profileData.header.last_name || ''}`.trim() : member.name}
          </strong>
          &nbsp;|&nbsp; File No: <strong>{profileData?.header?.file_no || member.fileNo}</strong>
          &nbsp;|&nbsp; {profileData?.header?.file_type || profileData?.header?.file_type || member.filingType}
          &nbsp;|&nbsp; <span style={{ color: statusColor(profileData?.header?.filestatus || member.status), fontWeight: 600 }}>{profileData?.header?.filestatus || member.status}</span>
        </div>

        {/* 10-Tab Ribbon */}
        <div className="detail-tabs-row">
          {DETAIL_TABS.map(tab => {
            const TabIcon = tab.icon;
            return (
              <button
                key={tab.id}
                className={`detail-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab(tab.id);
                  setTabRefreshKey(prev => prev + 1);
                  if (tab.id === 'fileInfo') setCommentStatus(member.status);
                }}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}
              >
                {TabIcon && <TabIcon size={13} />}
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Panels */}
        <div className="detail-tab-panel" style={{ marginTop: '16px' }}>

          {/* ── Personal Info ── */}
          {activeTab === 'personal' && (
            <div className="table-responsive">
              {loadingProfile ? (
                <div style={{ padding: '15px', textAlign: 'center', color: '#0076a3', fontSize: '13px', fontWeight: '600' }}>
                  <Loader2 size={18} className="animate-spin" style={{ display: 'inline', marginRight: '6px' }} />
                  Loading personal details...
                </div>
              ) : (
                <>
                  <table className="corporate-table detail-card-table">
                    <thead><tr><th colSpan="2" style={{ textAlign: 'left' }}>
                      <User size={16} style={{ marginRight: '6px' }} />
                      PERSONAL DETAILS</th></tr></thead>
                    <tbody>
                      {[
                        { label: 'FIRST NAME', value: profileData?.personalInfo?.first_name || member.raw?.first_name || member.name?.split(' ')[0] || '—' },
                        { label: 'MIDDLE NAME', value: profileData?.personalInfo?.middle_name || '—' },
                        { label: 'LAST NAME', value: profileData?.personalInfo?.last_name || member.raw?.last_name || member.name?.split(' ').slice(1).join(' ') || '—' },
                        { label: 'CONTACT NUMBER', value: profileData?.personalInfo?.contact_number || member.raw?.contact_number || '—', masked: true, requiresOtp: true, isPhone: true, isContact: true, key: `${member._id || member.sNo}_phone` },
                        { label: 'ALTERNATE NUMBER', value: profileData?.personalInfo?.alternate_number || member.raw?.alter_number || '—', masked: true, requiresOtp: true, isPhone: true, isContact: true, key: `${member._id || member.sNo}_alter_phone` },
                        { label: 'TIME ZONE', value: profileData?.personalInfo?.timezone || member.raw?.time_zone || '—' },
                        { label: 'SSN / TIN TYPE', value: profileData?.personalInfo?.ssn_tin || '—' },
                        { label: 'DATE OF BIRTH', value: formatDate(profileData?.personalInfo?.date_of_birth) },
                        { label: 'OCCUPATION', value: profileData?.personalInfo?.occupation || '—' },
                        { label: 'GENDER', value: profileData?.personalInfo?.gender || '—' },
                        { label: 'VISA TYPE', value: profileData?.personalInfo?.visa_type || '—' },
                        { label: 'EMAIL', value: profileData?.personalInfo?.email || member.raw?.email || member.email || '—', masked: true, requiresOtp: true, isEmail: true, key: `${member._id || member.sNo}_email_detail` },
                        { label: 'MAILING ADDRESS', value: profileData?.personalInfo?.mailing_address || '—' },
                        { label: 'CITY', value: profileData?.personalInfo?.city || '—' },
                        { label: 'STATE', value: profileData?.personalInfo?.state || '—' },
                        { label: 'ZIPCODE', value: profileData?.personalInfo?.zipcode || '—' },
                        { label: 'FILING TYPE', value: profileData?.personalInfo?.filing_type || '—' },
                        { label: 'DATE OF MARRIAGE', value: formatDate(profileData?.personalInfo?.date_of_marriage) },
                        { label: 'REFERED EMAIL', value: profileData?.personalInfo?.refer_email },
                        { label: 'REFERED NAME', value: profileData?.personalInfo?.refer_full_name },
                        { label: 'FILING STATUS', value: profileData?.personalInfo?.filing_status || member.raw?.filestatus || member.status || '—' },
                        { label: 'FIRST ENTRY DATE INTO USA', value: formatDate(profileData?.personalInfo?.first_entry_date_into_usa) },
                        { label: 'REGISTRATION DATE', value: formatDateTime(member.raw?.date_created) || member.regDate || '—' },
                        { label: 'LAST UPDATED', value: formatDateTime(member.raw?.date_updated) || member.statusDate || '—' },
                      ].map((row, i) =>
                        row.masked ? (
                          <tr key={row.key}>
                            <td style={{ width: '30%', fontWeight: '600', color: 'var(--text-muted)' }}>{row.label}</td>
                            <td>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span>{unmasked[row.key] ? row.value : (row.isEmail ? 'XXXXXXXXX.COM' : 'XXXXXXXXXX')}</span>
                                <button
                                  className="email-toggle-eye-btn"
                                  onClick={() => handleToggleField(row.key, row.requiresOtp, row.label, row.isContact)}
                                  title={unmasked[row.key] ? 'Mask Field' : 'Reveal Field'}
                                >
                                  {unmasked[row.key] ? <EyeOff size={14} /> : <Eye size={14} />}
                                </button>
                              </div>
                            </td>
                          </tr>
                        ) : (
                          <tr key={i}>
                            <td style={{ width: '30%', fontWeight: '600', color: 'var(--text-muted)' }}>{row.label}</td>
                            <td>{row.value || '—'}</td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </>
              )}
            </div>
          )}

          {/* ── Spouse Info ── */}
          {activeTab === 'spouse' && (
            <div className="table-responsive">
              {loadingProfile ? (
                <div style={{ padding: '15px', textAlign: 'center', color: '#0076a3', fontSize: '13px', fontWeight: '600' }}>
                  <Loader2 size={18} className="animate-spin" style={{ display: 'inline', marginRight: '6px' }} />
                  Loading spouse details...
                </div>
              ) : profileData?.spouseInfo && Object.keys(profileData.spouseInfo).length > 0 ? (
                <table className="corporate-table detail-card-table">
                  <thead><tr><th colSpan="2" style={{ textAlign: 'left' }}><span style={{ display: 'inline-flex', alignItems: 'center', gap: '7px' }}>
                    <span style={{ background: '#ede9fe', color: '#7c3aed', padding: '6px', borderRadius: '6px', display: 'inline-flex' }}>
                      <Users size={16} /></span>SPOUSE DETAILS</span></th></tr></thead>
                  <tbody>
                    {[
                      ['FIRST NAME', profileData.spouseInfo.first_name],
                      ['MIDDLE NAME', profileData.spouseInfo.middle_name],
                      ['LAST NAME', profileData.spouseInfo.last_name],
                      ['GENDER', profileData.spouseInfo.gender],
                      ['DATE OF BIRTH', profileData.spouseInfo.date_of_birth ? formatDate(profileData.spouseInfo.date_of_birth, '') : ''],
                      ['OCCUPATION', profileData.spouseInfo.occupation],
                      ['VISA TYPE', profileData.spouseInfo.visa_type],
                      ['TAX ID TYPE', profileData.spouseInfo.tax_id_type],
                      ['SSN / ITIN', profileData.spouseInfo.ssn_tin],
                      ['PASSPORT NUMBER', profileData.spouseInfo.passport_number],
                      ['PASSPORT EXPIRY DATE', profileData.spouseInfo.passport_expiry_date ? formatDate(profileData.spouseInfo.passport_expiry_date, '') : ''],
                      ['VISA NUMBER', profileData.spouseInfo.visa_number],
                      ['VISA EXPIRY DATE', profileData.spouseInfo.visa_expiry_date ? formatDate(profileData.spouseInfo.visa_expiry_date, '') : ''],
                      ['FIRST ENTRY DATE INTO USA', profileData.spouseInfo.first_entry_date_into_usa ? formatDate(profileData.spouseInfo.first_entry_date_into_usa, '') : ''],
                      ['CREATED AT', profileData.spouseInfo.createdAt ? formatDate(profileData.spouseInfo.createdAt, '') : ''],
                      ['UPDATED AT', profileData.spouseInfo.updatedAt ? formatDate(profileData.spouseInfo.updatedAt, '') : ''],
                    ].map(([l, v], i) => (
                      <tr key={i}>
                        <td style={{ width: '30%', fontWeight: '600', color: 'var(--text-muted)' }}>{l}</td>
                        <td>{v || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div style={{ padding: '24px', textAlign: 'center', color: '#64748b', background: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                  <p style={{ margin: 0, fontWeight: '600', fontSize: '13px' }}>No spouse details submitted yet</p>
                  <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#94a3b8' }}>Member stage: <strong>{member.status || 'Basic Information Pending'}</strong></p>
                </div>
              )}
            </div>
          )}

          {/* ── Dependent Info ── */}
          {activeTab === 'dependent' && (
            <div style={{ border: '1px solid var(--border-light)', padding: '20px', borderRadius: 'var(--radius-sm)', background: '#fff' }}>
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid #f1f5f9' }}>
                <div style={{ background: '#dcfce7', color: '#16a34a', padding: '9px', borderRadius: '8px', display: 'flex' }}>
                  <UserCheck size={20} />
                </div>
                <div>
                  <h4 style={{ fontWeight: 'bold', margin: 0, fontSize: '15px', color: '#0f172a' }}>Dependent Information</h4>
                  <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#64748b' }}>Dependent family members on tax return</p>
                </div>
              </div>
              {loadingProfile ? (
                <div style={{ padding: '15px', textAlign: 'center', color: '#0076a3', fontSize: '13px', fontWeight: '600' }}>
                  <Loader2 size={18} className="animate-spin" style={{ display: 'inline', marginRight: '6px' }} />
                  Loading dependent details...
                </div>
              ) : (() => {
                const deps = Array.isArray(profileData?.dependentInfo)
                  ? profileData.dependentInfo
                  : (profileData?.dependentInfo ? [profileData.dependentInfo] : []);

                return deps.length > 0 ? (
                  <div className="table-responsive"><table className="corporate-table">
                    <thead>
                      <tr>
                        <th>S.NO</th>
                        <th>NAME</th>
                        <th>GENDER</th>
                        <th>RELATIONSHIP</th>
                        <th>DATE OF BIRTH</th>
                        <th>VISA TYPE</th>
                        <th>TAX ID TYPE</th>
                        <th>SSN / ITIN</th>
                        <th>PASSPORT NO</th>
                        <th>PASSPORT EXPIRY</th>
                        <th>VISA NO</th>
                        <th>VISA EXPIRY</th>
                        <th>USA ENTRY DATE</th>
                      </tr>
                    </thead>
                    <tbody>
                      {deps.map((dep, i) => (
                        <tr key={dep._id || i}>
                          <td>{i + 1}</td>
                          <td style={{ fontWeight: '600' }}>{`${dep.first_name || ''} ${dep.middle_name || ''} ${dep.last_name || ''}`.trim() || '—'}</td>
                          <td>{dep.gender || '—'}</td>
                          <td>{dep.relationship || '—'}</td>
                          <td>{dep.date_of_birth ? formatDate(dep.date_of_birth) : '—'}</td>
                          <td>{dep.visa_type || '—'}</td>
                          <td>{dep.tax_id_type || '—'}</td>
                          <td>{dep.ssn_itin || '—'}</td>
                          <td>{dep.passport_number || '—'}</td>
                          <td>{dep.passport_expiry_date ? formatDate(dep.passport_expiry_date) : '—'}</td>
                          <td>{dep.visa_number || '—'}</td>
                          <td>{dep.visa_expiry_date ? formatDate(dep.visa_expiry_date) : '—'}</td>
                          <td>{dep.first_entry_date_into_usa ? formatDate(dep.first_entry_date_into_usa) : '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table></div>
                ) : (
                  <div style={{ padding: '24px', textAlign: 'center', color: '#64748b', background: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                    <p style={{ margin: 0, fontWeight: '600', fontSize: '13px' }}>No dependent details submitted yet</p>
                    <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#94a3b8' }}>Member has not listed any dependents.</p>
                  </div>
                );
              })()}
            </div>
          )}

          {/* ── Bank Details ── */}
          {activeTab === 'bank' && (
            <div style={{ border: '1px solid var(--border-light)', padding: '20px', borderRadius: 'var(--radius-sm)', background: '#fff' }}>
              {/* Header with Title & Top-Right Action Button */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '14px', borderBottom: '1px solid #f1f5f9' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ background: '#e0f2fe', color: '#0284c7', padding: '9px', borderRadius: '8px', display: 'flex' }}>
                    <Landmark size={20} />
                  </div>
                  <div>
                    <h4 style={{ fontWeight: 'bold', margin: 0, fontSize: '15px', color: '#0f172a' }}>Bank Account Details</h4>
                    <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#64748b' }}>Member tax refund and direct deposit information</p>
                  </div>
                </div>

                {/* Top Right Button */}
                {profileData?.bankDetails && Object.keys(profileData.bankDetails).length > 0 && (profileData.bankDetails.account_number || profileData.bankDetails.bank_name) ? (
                  <button
                    onClick={() => setBankModalOpen(true)}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: '6px',
                      padding: '8px 16px', borderRadius: '6px',
                      background: '#0076a3', border: 'none', color: '#fff',
                      fontSize: '13px', fontWeight: '600', cursor: 'pointer',
                      boxShadow: '0 2px 4px rgba(0,118,163,0.2)',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <Edit3 size={15} /> Edit Bank Details
                  </button>
                ) : (
                  <button
                    onClick={() => setBankModalOpen(true)}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: '6px',
                      padding: '8px 16px', borderRadius: '6px',
                      background: '#0076a3', border: 'none', color: '#fff',
                      fontSize: '13px', fontWeight: '600', cursor: 'pointer',
                      boxShadow: '0 2px 4px rgba(0,118,163,0.2)',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <Plus size={15} /> Add Bank Details
                  </button>
                )}
              </div>

              {loadingProfile ? (
                <div style={{ padding: '30px', textAlign: 'center', color: '#0076a3', fontSize: '13px', fontWeight: '600' }}>
                  <Loader2 size={22} className="animate-spin" style={{ display: 'inline', marginRight: '8px' }} />
                  Loading bank details...
                </div>
              ) : profileData?.bankDetails && Object.keys(profileData.bankDetails).length > 0 && (profileData.bankDetails.account_number || profileData.bankDetails.bank_name) ? (
                <div className="table-responsive">
                  <table className="corporate-table">
                    <tbody>
                      <tr>
                        <td style={{ fontWeight: 'bold', width: '30%', color: 'var(--text-muted)' }}>Account Number</td>
                        <td style={{ fontFamily: 'monospace', fontSize: '14px', fontWeight: '600', color: '#0f172a', letterSpacing: '0.5px' }}>
                          {profileData.bankDetails.account_number || profileData.bankDetails.accountNumber || '—'}
                        </td>
                      </tr>
                      <tr>
                        <td style={{ fontWeight: 'bold', color: 'var(--text-muted)' }}>Bank Name</td>
                        <td style={{ fontWeight: '600', color: '#0f172a' }}>
                          {profileData.bankDetails.bank_name || profileData.bankDetails.bankName || '—'}
                        </td>
                      </tr>
                      <tr>
                        <td style={{ fontWeight: 'bold', color: 'var(--text-muted)' }}>Account Holder Name</td>
                        <td style={{ fontWeight: '600', color: '#0f172a' }}>
                          {profileData.bankDetails.account_holder_name || profileData.bankDetails.account_holder || profileData.bankDetails.accountHolderName || (profileData?.personalInfo ? `${profileData.personalInfo.first_name || ''} ${profileData.personalInfo.last_name || ''}`.trim() : member.name) || '—'}
                        </td>
                      </tr>
                      <tr>
                        <td style={{ fontWeight: 'bold', color: 'var(--text-muted)' }}>Routing Number</td>
                        <td style={{ fontFamily: 'monospace', fontSize: '14px', fontWeight: '600', color: '#0f172a' }}>
                          {profileData.bankDetails.routing_number || profileData.bankDetails.routingNumber || '—'}
                        </td>
                      </tr>
                      <tr>
                        <td style={{ fontWeight: 'bold', color: 'var(--text-muted)' }}>Account Type</td>
                        <td>
                          {profileData.bankDetails.account_type || profileData.bankDetails.accountType ? (
                            <span style={{
                              display: 'inline-block',
                              padding: '4px 12px',
                              borderRadius: '20px',
                              fontSize: '12px',
                              fontWeight: '600',
                              background: (profileData.bankDetails.account_type || profileData.bankDetails.accountType || '').toLowerCase().includes('checking') ? '#e0f2fe' : '#f0fdf4',
                              color: (profileData.bankDetails.account_type || profileData.bankDetails.accountType || '').toLowerCase().includes('checking') ? '#0369a1' : '#15803d',
                              border: (profileData.bankDetails.account_type || profileData.bankDetails.accountType || '').toLowerCase().includes('checking') ? '1px solid #bae6fd' : '1px solid #bbf7d0'
                            }}>
                              {profileData.bankDetails.account_type || profileData.bankDetails.accountType}
                            </span>
                          ) : '—'}
                        </td>
                      </tr>
                      {profileData.bankDetails.createdAt && (
                        <tr>
                          <td style={{ fontWeight: 'bold', color: 'var(--text-muted)' }}>Created At</td>
                          <td style={{ color: '#64748b', fontSize: '12px' }}>
                            {formatDate(profileData.bankDetails.createdAt)}
                          </td>
                        </tr>
                      )}
                      {profileData.bankDetails.updatedAt && (
                        <tr>
                          <td style={{ fontWeight: 'bold', color: 'var(--text-muted)' }}>Updated At</td>
                          <td style={{ color: '#64748b', fontSize: '12px' }}>
                            {formatDate(profileData.bankDetails.updatedAt)}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div style={{ padding: '36px 20px', textAlign: 'center', color: '#64748b', background: '#f8fafc', borderRadius: '8px', border: '1px dashed #cbd5e1' }}>
                  <div style={{ background: '#f1f5f9', width: '48px', height: '48px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                    <Landmark size={24} color="#94a3b8" />
                  </div>
                  <p style={{ margin: 0, fontWeight: '600', fontSize: '14px', color: '#334155' }}>No bank account details submitted yet</p>
                  <p style={{ margin: '6px 0 16px', fontSize: '12px', color: '#64748b' }}>Bank account information is required for direct deposit refund or tax settlements.</p>
                  <button
                    onClick={() => setBankModalOpen(true)}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: '6px',
                      padding: '8px 18px', borderRadius: '6px',
                      background: '#0076a3', border: 'none', color: '#fff',
                      fontSize: '13px', fontWeight: '600', cursor: 'pointer',
                      boxShadow: '0 2px 4px rgba(0,118,163,0.2)'
                    }}
                  >
                    <Plus size={15} /> Add Bank Details
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ── Address ── */}
          {activeTab === 'address' && (
            <div style={{ border: '1px solid var(--border-light)', padding: '20px', borderRadius: 'var(--radius-sm)', background: '#fff' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid #f1f5f9' }}>
                <div style={{ background: '#fef9c3', color: '#ca8a04', padding: '9px', borderRadius: '8px', display: 'flex' }}>
                  <MapPin size={20} />
                </div>
                <div>
                  <h4 style={{ fontWeight: 'bold', margin: 0, fontSize: '15px', color: '#0f172a' }}>Member Address Records</h4>
                  <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#64748b' }}>State-wise address history for tax year</p>
                </div>
              </div>
              {loadingProfile ? (
                <div style={{ padding: '15px', textAlign: 'center', color: '#0076a3', fontSize: '13px', fontWeight: '600' }}>
                  <Loader2 size={18} className="animate-spin" style={{ display: 'inline', marginRight: '6px' }} />
                  Loading address details...
                </div>
              ) : (() => {
                const addrs = Array.isArray(profileData?.address)
                  ? profileData.address
                  : (profileData?.address ? [profileData.address] : []);

                return addrs.length > 0 ? (
                  <div className="table-responsive">
                    <table className="corporate-table">
                      <thead>
                        <tr>
                          <th>S.NO</th>
                          <th>PERSON</th>
                          <th>STATE</th>
                          <th>TAX YEAR</th>
                          <th>ADDRESS FROM</th>
                          <th>ADDRESS TO</th>
                          <th>CREATED AT</th>
                        </tr>
                      </thead>
                      <tbody>
                        {addrs.map((addr, i) => (
                          <tr key={addr._id || i}>
                            <td>{i + 1}</td>
                            <td style={{ fontWeight: '600' }}>{addr.person || 'Taxpayer'}</td>
                            <td>{addr.state?.name || '—'}</td>
                            <td>{addr.year?.name || '—'}</td>
                            <td>{addr.address_from ? formatDate(addr.address_from) : '—'}</td>
                            <td>{addr.address_to ? formatDate(addr.address_to) : '—'}</td>
                            <td style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
                              {addr.createdAt ? formatDate(addr.createdAt) : '—'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div style={{ padding: '24px', textAlign: 'center', color: '#64748b', background: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                    <p style={{ margin: 0, fontWeight: '600', fontSize: '13px' }}>No address history records submitted yet</p>
                    <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#94a3b8' }}>Address details will appear once filled by the member.</p>
                  </div>
                );
              })()}
            </div>
          )}

          {/* ── Download ── */}
          {activeTab === 'download' && (
            <div style={{ border: '1px solid var(--border-light)', padding: '20px', borderRadius: 'var(--radius-sm)', background: '#fff' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid #f1f5f9' }}>
                <div style={{ background: '#e0f2fe', color: '#0284c7', padding: '9px', borderRadius: '8px', display: 'flex' }}>
                  <FileDown size={20} />
                </div>
                <div>
                  <h4 style={{ fontWeight: 'bold', margin: 0, fontSize: '15px', color: '#0f172a' }}>Member Uploaded Documents</h4>
                  <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#64748b' }}>Documents uploaded by the member/client</p>
                </div>
              </div>
              {loadingProfile ? (
                <div style={{ padding: '15px', textAlign: 'center', color: '#0076a3', fontSize: '13px', fontWeight: '600' }}>
                  <Loader2 size={18} className="animate-spin" style={{ display: 'inline', marginRight: '6px' }} />
                  Loading documents...
                </div>
              ) : (() => {
                // Filter to show ONLY member/user-uploaded documents (exclude admin uploads)
                const allDocs = Array.isArray(profileData?.documents) ? profileData.documents : [];
                const memberDocs = allDocs.filter(doc => {
                  // Exclude documents that have ANY admin upload indicator
                  const isAdmin = doc.new_docs || doc.isAdminUploaded || doc.uploaded_by_admin || doc.admin_upload;
                  return !isAdmin;
                });
                
                return memberDocs.length > 0 ? (
                  <div className="table-responsive">
                    <table className="corporate-table">
                      <thead>
                        <tr>
                          <th>S.NO</th>
                          <th>DOCUMENT NAME</th>
                          <th>CATEGORY</th>
                          <th>FILE SIZE</th>
                          <th>UPLOADED DATE</th>
                          <th>ACTION</th>
                        </tr>
                      </thead>
                      <tbody>
                        {memberDocs.map((doc, i) => {
                          const docName = doc.document_name || doc.file_name || doc.name || doc.originalName || '—';
                          const categoryName = doc.document_type?.name || 'Tax Document';
                          const sizeStr = doc.file_size ? `${(doc.file_size / 1024).toFixed(1)} KB` : '—';
                          const uploadDate = doc.createdAt ? formatDate(doc.createdAt) : '—';
                          const fullUrl = doc.file_path ? (doc.file_path.startsWith('http') ? doc.file_path : `${URLS.ImageUrl}${doc.file_path}`) : '#';

                          return (
                            <tr key={doc._id || i}>
                              <td>{i + 1}</td>
                              <td style={{ fontWeight: '600', color: '#0f172a' }}>{docName}</td>
                              <td>
                                <span style={{ background: '#e0f2fe', color: '#0369a1', border: '1px solid #bae6fd', padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '600' }}>
                                  {categoryName}
                                </span>
                              </td>
                              <td style={{ fontSize: '12px', color: '#64748b' }}>{sizeStr}</td>
                              <td style={{ fontSize: '12px', color: '#64748b' }}>{uploadDate}</td>
                              <td>
                                <a
                                  href={fullUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="btn-view-action btn-md"
                                  style={{ padding: '5px 12px', fontSize: '12px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                                >
                                  <Download size={13} />
                                </a>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div style={{ padding: '24px', textAlign: 'center', color: '#64748b', background: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                    <p style={{ margin: 0, fontWeight: '600', fontSize: '13px' }}>No member documents available</p>
                    <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#94a3b8' }}>Documents uploaded by the member will appear here.</p>
                  </div>
                );
              })()}
            </div>
          )}

          {/* ── Interview ── */}
          {activeTab === 'interview' && (
            <div style={{ border: '1px solid var(--border-light)', padding: '20px', borderRadius: 'var(--radius-sm)', background: '#fff' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid #f1f5f9' }}>
                <div style={{ background: '#fce7f3', color: '#be185d', padding: '9px', borderRadius: '8px', display: 'flex' }}>
                  <MessageSquare size={20} />
                </div>
                <div>
                  <h4 style={{ fontWeight: 'bold', margin: 0, fontSize: '15px', color: '#0f172a' }}>Interview Scheduling Info</h4>
                  <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#64748b' }}>Consultation date, time slot and status</p>
                </div>
              </div>
              {loadingProfile ? (
                <div style={{ padding: '15px', textAlign: 'center', color: '#0076a3', fontSize: '13px', fontWeight: '600' }}>
                  <Loader2 size={18} className="animate-spin" style={{ display: 'inline', marginRight: '6px' }} />
                  Loading interview details...
                </div>
              ) : profileData?.interview && Object.keys(profileData.interview).length > 0 ? (
                <div className="table-responsive">
                  <table className="corporate-table">
                    <tbody>
                      <tr>
                        <td style={{ fontWeight: 'bold', width: '30%', color: 'var(--text-muted)' }}>Consultation Date</td>
                        <td style={{ fontWeight: '600', color: '#0f172a' }}>
                          {profileData.interview.consultation_date ? formatDate(profileData.interview.consultation_date) : '—'}
                        </td>
                      </tr>
                      <tr>
                        <td style={{ fontWeight: 'bold', color: 'var(--text-muted)' }}>Time Slot</td>
                        <td style={{ fontWeight: '600', color: '#0f172a' }}>
                          {profileData.interview.time_slot?.slot || '—'}
                        </td>
                      </tr>
                      <tr>
                        <td style={{ fontWeight: 'bold', color: 'var(--text-muted)' }}>Interview Status</td>
                        <td>
                          {profileData.interview.status ? (
                            <span style={{ background: '#dcfce7', color: '#15803d', border: '1px solid #bbf7d0', padding: '4px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' }}>
                              {profileData.interview.status}
                            </span>
                          ) : '—'}
                        </td>
                      </tr>
                      {/* {profileData.interview._id && (
                        <tr>
                          <td style={{ fontWeight: 'bold', color: 'var(--text-muted)' }}>Interview Record ID</td>
                          <td style={{ fontFamily: 'monospace', fontSize: '12px', color: '#64748b' }}>
                            {profileData.interview._id}
                          </td>
                        </tr>
                      )} */}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div style={{ padding: '24px', textAlign: 'center', color: '#64748b', background: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                  <p style={{ margin: 0, fontWeight: '600', fontSize: '13px' }}>No interview scheduled yet</p>
                  <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#94a3b8' }}>Consultation details will appear once scheduled by the member or admin.</p>
                </div>
              )}
            </div>
          )}

          {/* ── Pay ── */}
        {activeTab === 'pay' && (
  <div style={{ border: '1px solid var(--border-light)', padding: '20px', borderRadius: 'var(--radius-sm)', background: '#fff' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid #f1f5f9' }}>
      <div style={{ background: '#dcfce7', color: '#16a34a', padding: '9px', borderRadius: '8px', display: 'flex' }}>
        <CreditCard size={20} />
      </div>
      <div>
        <h4 style={{ fontWeight: 'bold', margin: 0, fontSize: '15px', color: '#0f172a' }}>Billing & Invoices</h4>
        <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#64748b' }}>Payment history and invoice details</p>
      </div>
    </div>

    {/* Add Payment Form */}
    <div style={{ marginTop: '24px', padding: '20px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
      <h5 style={{ fontWeight: 'bold', fontSize: '14px', margin: '0 0 12px 0', color: '#0f172a' }}>Make a Payment</h5>
      {paymentSuccess && (
        <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', color: '#047857', borderRadius: '8px', padding: '10px 14px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <CheckCircle size={16} /> {paymentSuccess}
        </div>
      )}
      {paymentError && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', borderRadius: '8px', padding: '10px 14px', fontSize: '13px', marginBottom: '12px' }}>
          ⚠️ {paymentError}
        </div>
      )}
      <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
        <div style={{ width: '240px', flexShrink: 0 }}>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>Amount ($)</label>
          <input
            type="number"
            step="0.01"
            min="0.01"
            value={payAmount}
            onChange={e => setPayAmount(e.target.value)}
            placeholder="0.00"
            style={{
              width: '100%',
              padding: '9px 12px',
              border: '1px solid #cbd5e1',
              borderRadius: '6px',
              fontSize: '14px',
              fontFamily: 'monospace',
              outline: 'none',
              boxSizing: 'border-box'
            }}
          />
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={handleAddPayment}
            disabled={paymentLoading}
            style={{
              padding: '9px 24px',
              background: '#0076a3',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: '600',
              cursor: paymentLoading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              opacity: paymentLoading ? 0.7 : 1,
              boxShadow: '0 2px 4px rgba(0,118,163,0.2)'
            }}
          >
            {paymentLoading ? <Loader2 size={16} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} /> : <CreditCard size={16} />}
            {paymentLoading ? 'Processing...' : 'Pay Now'}
          </button>
          <button
            onClick={() => { setPayAmount(''); setPaymentError(''); }}
            disabled={paymentLoading}
            style={{
              padding: '9px 20px',
              background: '#e2e8f0',
              color: '#475569',
              border: '1px solid #cbd5e1',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            Reset
          </button>
        </div>
      </div>
    </div>

    {/* Payment History Table */}
    <div className="table-responsive" style={{ marginTop: '24px' }}>
      <h5 style={{ fontWeight: 'bold', fontSize: '14px', margin: '0 0 12px 0', color: '#0f172a' }}>
        Payment History {loadingPaymentHistory && <Loader2 size={14} style={{ animation: 'spin 1s linear infinite', marginLeft: '8px' }} />}
      </h5>
      {paymentHistory.length === 0 ? (
        <p style={{ color: '#64748b', textAlign: 'center', padding: '20px' }}>No payments recorded yet.</p>
      ) : (
        <table className="corporate-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
          <thead>
            <tr>
              <th>Sl.No</th>
              <th>Amount</th>
              <th>Paid Amount</th>
              <th>Year</th>
              <th>Status</th>
              <th>Payment Date</th>
            </tr>
          </thead>
          <tbody>
            {paymentHistory.map((p, idx) => (
              <tr key={p._id}>
                <td>{idx + 1}</td>
                <td>${p.amount}</td>
                <td>${p.paid_amount || 0}</td>
                <td>{p.year_id?.name || p.year || '—'}</td>
                <td>
                  <span style={{
                    padding: '4px 10px',
                    borderRadius: '12px',
                    fontSize: '11px',
                    fontWeight: '600',
                    background: p.status === 1 ? '#dcfce7' : '#fef3c7',
                    color: p.status === 1 ? '#15803d' : '#92400e',
                  }}>
                    {p.status === 1 ? 'Paid' : 'Pending'}
                  </span>
                </td>
                <td>{p.createdAt ? formatDate(p.createdAt) : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  </div>
)}

          {/* ── Upload ── */}
          {activeTab === 'upload' && (
            <div style={{ border: '1px solid var(--border-light)', padding: '24px', borderRadius: 'var(--radius-sm)', background: '#fff' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px', paddingBottom: '14px', borderBottom: '1px solid #f1f5f9' }}>
                <div style={{ background: '#fff7ed', color: '#ea580c', padding: '9px', borderRadius: '8px', display: 'flex' }}>
                  <UploadCloud size={20} />
                </div>
                <div>
                  <h4 style={{ fontWeight: 'bold', margin: 0, fontSize: '15px', color: '#0f172a' }}>Admin Document Upload</h4>
                  <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#64748b' }}>Upload documents as admin (these won't appear in member's document tab)</p>
                </div>
              </div>

              {uploadSuccess && (
                <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', color: '#047857', borderRadius: '8px', padding: '10px 14px', fontSize: '13px', display: 'flex', gap: '8px', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <CheckCircle size={16} style={{ flexShrink: 0 }} /> {uploadSuccess}
                  </div>
                  <button onClick={() => setUploadSuccess('')} style={{ background: 'none', border: 'none', color: '#047857', cursor: 'pointer', padding: '2px' }}>
                    <X size={14} />
                  </button>
                </div>
              )}
              {uploadError && (
                <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', borderRadius: '8px', padding: '10px 14px', fontSize: '13px', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                  <span>⚠️ {uploadError}</span>
                  <button onClick={() => setUploadError('')} style={{ background: 'none', border: 'none', color: '#b91c1c', cursor: 'pointer', padding: '2px', flexShrink: 0 }}>
                    <X size={14} />
                  </button>
                </div>
              )}

              <form onSubmit={handleUploadDocument} style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '650px', margin: '0 auto' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px' }}>
                  {/* Document Name */}
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '5px' }}>
                      Document Name <span style={{ color: '#dc2626' }}>*</span>
                    </label>
                    <input
                      type="text"
                      value={uploadDocName}
                      onChange={e => setUploadDocName(e.target.value)}
                      placeholder="e.g. Statement / Provisional PDF"
                      required
                      style={{
                        width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '6px',
                        fontSize: '13px', color: '#0f172a', outline: 'none', boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  {/* Document Type */}
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '5px' }}>
                      Document Type <span style={{ color: '#dc2626' }}>*</span>
                    </label>
                    <select
                      value={uploadDocTypeId}
                      onChange={e => setUploadDocTypeId(e.target.value)}
                      style={{
                        width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '6px',
                        fontSize: '13px', color: '#0f172a', outline: 'none', boxSizing: 'border-box', background: '#fff'
                      }}
                    >
                      <option value="">Select Document Type</option>
                      <option value="Tax Summary">Tax Summary</option>
                      <option value="Revised Tax Summary">Revised Tax Summary</option>
                      <option value="Tax Review Copy">Tax Review Copy</option>
                      <option value="Filed Return For Records">Filed Return For Records</option>
                    </select>
                  </div>

                  {/* Tax Year */}
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '5px' }}>
                      Tax Year
                    </label>
                    <select
                      value={uploadYearId}
                      onChange={e => setUploadYearId(e.target.value)}
                      style={{
                        width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '6px',
                        fontSize: '13px', color: '#0f172a', outline: 'none', boxSizing: 'border-box', background: '#fff'
                      }}
                    >
                      <option value="">Select Tax Year</option>
                      {(recentFiveYears.length > 0 ? recentFiveYears : []).map(y => (
                        <option key={y._id || y.name} value={y._id || y.name}>
                          Tax Year {y.name || y.year_name || y}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Drag & Drop / File Input Box */}
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '5px' }}>
                    Select File <span style={{ color: '#dc2626' }}>*</span>
                  </label>
                  <input
                    type="file"
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    onChange={e => {
                      if (e.target.files && e.target.files[0]) {
                        const file = e.target.files[0];
                        setUploadFile(file);
                        if (!uploadDocName) {
                          setUploadDocName(file.name.replace(/\.[^/.]+$/, ""));
                        }
                      }
                    }}
                  />

                  <div
                    style={{
                      border: uploadFile ? '2px dashed #0076a3' : '2px dashed #cbd5e1',
                      padding: '30px 20px',
                      borderRadius: '8px',
                      background: uploadFile ? '#f0f9ff' : '#f8fafc',
                      textAlign: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={e => e.preventDefault()}
                    onDrop={e => {
                      e.preventDefault();
                      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                        const file = e.dataTransfer.files[0];
                        setUploadFile(file);
                        if (!uploadDocName) {
                          setUploadDocName(file.name.replace(/\.[^/.]+$/, ""));
                        }
                      }
                    }}
                  >
                    <UploadCloud size={36} color={uploadFile ? '#0076a3' : '#94a3b8'} style={{ marginBottom: '10px' }} />
                    {uploadFile ? (
                      <div>
                        <p style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: '#0076a3' }}>
                          📄 {uploadFile.name}
                        </p>
                        <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#64748b' }}>
                          {(uploadFile.size / 1024).toFixed(1)} KB | {uploadFile.type || 'Document'}
                        </p>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setUploadFile(null);
                            if (fileInputRef.current) fileInputRef.current.value = '';
                          }}
                          style={{
                            marginTop: '8px', border: 'none', background: '#fee2e2', color: '#dc2626',
                            padding: '4px 10px', borderRadius: '4px', fontSize: '11px', fontWeight: '600', cursor: 'pointer'
                          }}
                        >
                          Remove file
                        </button>
                      </div>
                    ) : (
                      <div>
                        <p style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: '#334155' }}>
                          Drag & Drop file here, or <span style={{ color: '#0076a3', textDecoration: 'underline' }}>browse</span>
                        </p>
                        <span style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginTop: '4px' }}>
                          Supported Formats: PDF, PNG, JPG, JPEG, TIFF (Max 10MB)
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Submit Button */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                  <button
                    type="submit"
                    disabled={isUploading || !uploadFile}
                    style={{
                      padding: '10px 24px', border: 'none', borderRadius: '6px',
                      background: '#0076a3', color: '#fff', fontSize: '13px', fontWeight: '600',
                      cursor: isUploading || !uploadFile ? 'not-allowed' : 'pointer',
                      display: 'flex', alignItems: 'center', gap: '8px',
                      opacity: isUploading || !uploadFile ? 0.6 : 1,
                      boxShadow: '0 2px 4px rgba(0,118,163,0.2)'
                    }}
                  >
                    {isUploading ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <UploadCloud size={16} />}
                    {isUploading ? 'Uploading Document...' : 'Upload Document'}
                  </button>
                </div>
              </form>

            {/* Admin Uploaded Documents List */}
            {loadingAdminDocs ? (
              <div style={{ padding: '15px', textAlign: 'center', color: '#0076a3' }}>
                <Loader2 size={18} className="animate-spin" style={{ display: 'inline', marginRight: '6px' }} />
                Loading admin documents...
              </div>
            ) : adminUploadedDocs.length > 0 ? (
              <div style={{ marginTop: '30px', paddingTop: '20px', borderTop: '1px solid #f1f5f9' }}>
                <h4 style={{ fontWeight: 'bold', fontSize: '14px', color: '#0f172a', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ background: '#fff7ed', color: '#ea580c', padding: '4px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '700' }}>ADMIN UPLOADS</span>
                  Admin Uploaded Documents History ({adminUploadedDocs.length})
                </h4>
                <div className="table-responsive">
                  <table className="corporate-table">
                    <thead>
                      <tr>
                        <th>S.NO</th>
                        <th>DOCUMENT TYPE</th>
                        <th>FILE NAME</th>
                        <th>FILE SIZE</th>
                        <th>UPLOADED DATE</th>
                        <th>ACTION</th>
                      </tr>
                    </thead>
                    <tbody>
                      {adminUploadedDocs.map((doc, i) => {
                        const docName = doc.document_type || doc.original_name || doc.file_name || 'Document';
                        const fileName = doc.original_name || doc.file_name || '—';
                        const sizeStr = doc.file_size ? `${(doc.file_size / 1024).toFixed(1)} KB` : '—';
                        const uploadDate = doc.createdAt ? formatDate(doc.createdAt) : '—';
                        const fileUrl = doc.file_path
                          ? (doc.file_path.startsWith('http') ? doc.file_path : `${URLS.ImageUrl}${doc.file_path}`)
                          : null;
                        return (
                          <tr key={doc._id || i}>
                            <td>{i + 1}</td>
                            <td style={{ fontWeight: '600', color: '#0f172a' }}>{docName}</td>
                            <td style={{ fontSize: '12px', color: '#475569' }}>{fileName}</td>
                            <td style={{ fontSize: '12px', color: '#64748b' }}>{sizeStr}</td>
                            <td style={{ fontSize: '12px', color: '#64748b' }}>{uploadDate}</td>
                            <td style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                              {/* View/Preview button */}
                              {fileUrl ? (
                                <a
                                  href={fileUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  title="View Document"
                                  style={{
                                    padding: '4px 10px', fontSize: '12px', border: '1px solid #bae6fd',
                                    background: '#e0f2fe', color: '#0369a1', borderRadius: '4px',
                                    cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px',
                                    fontWeight: '600', textDecoration: 'none'
                                  }}
                                >
                                  <Eye size={13} />
                                </a>
                              ) : (
                                <span style={{ fontSize: '11px', color: '#94a3b8' }}>No file</span>
                              )}
                              {/* Delete button */}
                              <button
                                type="button"
                                onClick={() => handleDeleteDoc(doc._id || i)}
                                style={{
                                  padding: '4px 10px', fontSize: '12px', border: '1px solid #fecaca',
                                  background: '#fef2f2', color: '#dc2626', borderRadius: '4px',
                                  cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px',
                                  fontWeight: '600'
                                }}
                              >
                                {deleteLoading ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : null}
          </div>
        )}
            </div>
  

          {/* ── File Info (Member Status & History) ── */}
          {activeTab === 'fileInfo' && (
            <div className="file-info-view" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <form onSubmit={handleCreateFileInfoStatus} style={{ border: '1px solid var(--border-light)', padding: '24px', borderRadius: 'var(--radius-sm)', background: '#fff' }}>
                {/* File Info Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px', paddingBottom: '14px', borderBottom: '1px solid #f1f5f9' }}>
                  <div style={{ background: '#f1f5f9', color: '#0076a3', padding: '9px', borderRadius: '8px', display: 'flex' }}>
                    <FileText size={20} />
                  </div>
                  <div>
                    <h4 style={{ fontWeight: 'bold', margin: 0, fontSize: '15px', color: '#0f172a' }}>File Information & Workflow Status</h4>
                    <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#64748b' }}>Update administrative filing status and record status notes</p>
                  </div>
                </div>

                {fileInfoSuccessMsg && (
                  <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', color: '#047857', borderRadius: '8px', padding: '10px 14px', fontSize: '13px', display: 'flex', gap: '8px', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <CheckCircle size={16} style={{ flexShrink: 0 }} /> {fileInfoSuccessMsg}
                    </div>
                    <button type="button" onClick={() => setFileInfoSuccessMsg('')} style={{ background: 'none', border: 'none', color: '#047857', cursor: 'pointer', padding: '2px' }}>
                      <X size={14} />
                    </button>
                  </div>
                )}
                {fileInfoErrorMsg && (
                  <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', borderRadius: '8px', padding: '10px 14px', fontSize: '13px', marginBottom: '16px' }}>
                    ⚠️ {fileInfoErrorMsg}
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                  {/* File No */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#334155' }}>File No</label>
                    <input type="text" className="search-input-box" style={{ width: '100%', background: '#f8fafc', color: '#64748b', cursor: 'not-allowed' }} value={member.fileNo} disabled />
                  </div>

                  {/* Filing Type */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#334155' }}>Filing Type <span style={{ color: '#dc2626' }}>*</span></label>
                    <select
                      className="search-input-box"
                      style={{ width: '100%', background: '#fff' }}
                      value={fileTypeInput}
                      onChange={e => setFileTypeInput(e.target.value)}
                    >
                      <option value="E-Filing">E-Filing</option>
                      <option value="Paper Filing">Paper Filing</option>
                    </select>
                  </div>

                  {/* File Status */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#334155' }}>File Status <span style={{ color: '#dc2626' }}>*</span></label>
                    <select
                      className="search-input-box"
                      style={{ width: '100%', background: '#fff' }}
                      value={statusInput}
                      onChange={e => setStatusInput(e.target.value)}
                    >
                      {WORKFLOW_STATUSES.map((s, i) => (
                        <option key={i} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Comments Textarea */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '18px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#334155' }}>Comments</label>
                  <textarea
                    rows="4"
                    className="search-input-box"
                    style={{ width: '100%', height: 'auto', fontFamily: 'inherit', padding: '10px' }}
                    placeholder="Enter administrative workflow update comments..."
                    value={commentsInput}
                    onChange={e => setCommentsInput(e.target.value)}
                  // required
                  />
                </div>

                {/* Submit & Reset Buttons */}
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    style={{ padding: '8px 20px', fontWeight: '600' }}
                    onClick={() => {
                      setCommentsInput('');
                      setStatusInput(
                        CODE_TO_DISPLAY[member.raw?.filestatus || ''] || member.status || 'Registered Users'
                      );
                      setFileTypeInput(member.filingType || 'E-Filing');
                      setFileInfoErrorMsg('');
                    }}
                  >
                    Reset
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingFileInfo}
                    style={{
                      background: '#0076a3', padding: '8px 22px', border: 'none', fontWeight: '600',
                      color: '#fff', borderRadius: '6px', cursor: isSubmittingFileInfo ? 'not-allowed' : 'pointer',
                      opacity: isSubmittingFileInfo ? 0.6 : 1,
                      display: 'flex', alignItems: 'center', gap: '6px'
                    }}
                  >
                    {isSubmittingFileInfo ? <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> : null}
                    {isSubmittingFileInfo ? 'Submitting...' : 'Submit Update'}
                  </button>
                </div>
              </form>

              {/* Status History Table */}
              <div style={{ border: '1px solid var(--border-light)', padding: '20px', borderRadius: 'var(--radius-sm)', background: '#fff', position: 'relative' }}>
                {/* Loading Overlay */}
                {loadingFileInfo && (
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(255, 255, 255, 0.85)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 10,
                    borderRadius: 'var(--radius-sm)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#0076a3', fontSize: '13px', fontWeight: '600' }}>
                      <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                      Refreshing history...
                    </div>
                  </div>
                )}
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <h4 style={{ fontWeight: 'bold', margin: 0, fontSize: '14px', color: '#0f172a' }}>
                    Status History & Activity Log ({statusHistory.length})
                  </h4>
                  <button
                    onClick={fetchFileInfoHistory}
                    disabled={loadingFileInfo}
                    style={{
                      border: '1px solid #cbd5e1',
                      background: '#fff',
                      padding: '6px 12px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: '500',
                      color: '#475569',
                      cursor: loadingFileInfo ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      opacity: loadingFileInfo ? 0.5 : 1
                    }}
                  >
                    <RefreshCw size={14} style={{ animation: loadingFileInfo ? 'spin 1s linear infinite' : 'none' }} />
                    Refresh
                  </button>
                </div>

                <div className="table-responsive">
                  <table className="corporate-table" style={{ width: '100%' }}>
                    <thead>
                      <tr>
                        <th style={{ width: '70px', textAlign: 'center' }}>S.No</th>
                        <th style={{ width: '150px', whiteSpace: 'nowrap' }}>Filing Type</th>
                        <th style={{ width: '190px', whiteSpace: 'nowrap' }}>Status</th>
                        <th style={{ minWidth: '250px', maxWidth: 'nowrap' }}>Comments</th>
                        <th style={{ width: '150px', whiteSpace: 'nowrap' }}>Created By</th>
                        <th style={{ width: '180px', whiteSpace: 'nowrap' }}>Date & Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {statusHistory.length > 0 ? (
                        statusHistory.map((c, i) => {
                          const fullComment = (c.comments || '').trim();
                          const MAX_LEN = 100;
                          const isLong = fullComment.length > MAX_LEN;
                          const preview = isLong ? `${fullComment.slice(0, MAX_LEN)}...` : (fullComment || '—');
                          return (
                            <tr key={c._id || i}>
                              <td style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>{i + 1}</td>
                              <td style={{ fontWeight: '500', whiteSpace: 'nowrap' }}>{c.file_type || member.filingType || '—'}</td>
                              <td style={{ whiteSpace: 'nowrap' }}>
                                <span style={{
                                  background: c.status?.includes('EFA') || c.status_name?.includes('Complete') ? '#ecfdf5' : '#f0f9ff',
                                  color: c.status?.includes('EFA') || c.status_name?.includes('Complete') ? '#047857' : '#0369a1',
                                  border: '1px solid #bae6fd',
                                  padding: '3px 8px',
                                  borderRadius: '12px',
                                  fontSize: '11px',
                                  fontWeight: '600',
                                  display: 'inline-block'
                                }}>
                                  {c.status_name || c.status || '—'}
                                </span>
                              </td>
                              <td style={{ color: '#334155', maxWidth: '240px', overflow: 'hidden', verticalAlign: 'middle' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <span
                                    style={{
                                      fontSize: '13px',
                                      lineHeight: '1.4',
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                      whiteSpace: 'nowrap',
                                      maxWidth: isLong ? '140px' : '220px',
                                      display: 'inline-block',
                                      verticalAlign: 'middle',
                                      cursor: isLong ? 'pointer' : 'default'
                                    }}
                                    title={isLong ? "Click to view full comment" : (fullComment || '')}
                                    onClick={() => isLong && setCommentPopup({ text: fullComment })}
                                  >
                                    {preview}
                                  </span>
                                  {isLong && (
                                    <button
                                      type="button"
                                      onClick={() => setCommentPopup({ text: fullComment })}
                                      style={{
                                        border: '1px solid #bae6fd',
                                        background: '#f0f9ff',
                                        color: '#0284c7',
                                        borderRadius: '4px',
                                        padding: '2px 8px',
                                        fontSize: '11px',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        whiteSpace: 'nowrap',
                                        flexShrink: 0,
                                        lineHeight: '1.2'
                                      }}
                                      onMouseEnter={e => {
                                        e.currentTarget.style.background = '#0284c7';
                                        e.currentTarget.style.color = '#ffffff';
                                      }}
                                      onMouseLeave={e => {
                                        e.currentTarget.style.background = '#f0f9ff';
                                        e.currentTarget.style.color = '#0284c7';
                                      }}
                                      title="View full comment"
                                    >
                                      View
                                    </button>
                                  )}
                                </div>
                              </td>
                              <td style={{ fontSize: '12px', color: '#64748b', whiteSpace: 'nowrap' }}>{c.createdBy || 'Admin'}</td>
                              <td style={{ color: 'var(--text-muted)', fontSize: '12px', whiteSpace: 'nowrap' }}>
                                {c.createdAt ? formatDate(c.createdAt) : (c.dateTime ? formatDate(c.dateTime) : '—')}
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan="6" style={{ textAlign: 'center', padding: '30px', color: '#94a3b8' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                              <FileText size={32} color="#cbd5e1" />
                              <p style={{ margin: 0, fontSize: '13px', fontWeight: '500' }}>No status history available yet</p>
                              <p style={{ margin: 0, fontSize: '11px' }}>Submit an update above to create the first entry</p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

        </div>
      {/* </div> */}

      {/* ── Comment Full-View Popup ── */}
      {commentPopup && (
        <div
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(15,23,42,0.55)',
            backdropFilter: 'blur(3px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 9999, padding: '16px'
          }}
          onClick={() => setCommentPopup(null)}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: '#fff',
              borderRadius: '12px',
              width: '100%',
              maxWidth: '520px',
              boxShadow: '0 20px 50px rgba(0,0,0,0.18)',
              overflow: 'hidden',
              animation: 'fadeIn 0.18s ease-out'
            }}
          >
            {/* Header */}
            <div style={{
              background: 'linear-gradient(135deg, #0076a3, #005f8a)',
              padding: '14px 18px',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ background: 'rgba(255,255,255,0.2)', borderRadius: '6px', padding: '5px', display: 'flex' }}>
                  <FileText size={16} color="#fff" />
                </div>
                <span style={{ color: '#fff', fontWeight: '700', fontSize: '14px' }}>Full Comment</span>
              </div>
              <button
                onClick={() => setCommentPopup(null)}
                style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', opacity: 0.85, padding: '2px' }}
              >
                <X size={18} />
              </button>
            </div>
            {/* Body */}
            <div style={{ padding: '20px' }}>
              <div style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '14px 16px',
                fontSize: '13px',
                color: '#1e293b',
                lineHeight: '1.65',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                maxHeight: '340px',
                overflowY: 'auto'
              }}>
                {commentPopup.text}
              </div>
            </div>
            {/* Footer */}
            <div style={{ padding: '10px 20px 16px', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setCommentPopup(null)}
                style={{
                  padding: '8px 20px', border: '1px solid #cbd5e1',
                  borderRadius: '6px', background: '#fff', color: '#475569',
                  fontSize: '13px', fontWeight: '500', cursor: 'pointer'
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <OtpModal
        isOpen={otpOpen}
        onClose={() => setOtpOpen(false)}
        onVerify={handleOtpVerify}
        onResend={() => onSendEmailOtp && onSendEmailOtp(member._id || member.sNo)}
        fieldLabel={otpFieldLabel}
      />

      <BankModal
        isOpen={bankModalOpen}
        onClose={() => setBankModalOpen(false)}
        onSave={handleSaveBankDetails}
        bankData={profileData?.bankDetails}
        memberName={profileData?.personalInfo ? `${profileData.personalInfo.first_name || ''} ${profileData.personalInfo.last_name || ''}`.trim() : member.name}
      />
    </>
  );
}

/* ─────────────────────────────────────────────────────────────
   Main MemberTableLayout component
   Full API integration:
   - GET Registered Members API (POST to URLS.GetAllRegistred)
   - Status Code query/body filter (SP, BIP, RGO, CANC, etc.)
   - Send Email OTP API (URLS.SendEmailOtp)
   - Verify Email OTP API (URLS.VerifyEmailOtp)
   - Export Previous Year Excel API (URLS.ExportPerivousYear)
   - Export Current Year Excel API (URLS.ExportCurrentYear)
───────────────────────────────────────────────────────────── */
export default function MemberTableLayout({
  title,
  subtitle,
  statusCode = 'all',
  members: initialMembersProp,
  selectedYear = `TY${new Date().getFullYear()}`,
  refreshKey,
}) {
  const [numericYear, setNumericYear] = useState(() => String(selectedYear).replace('TY', ''));
  // Update numericYear when selectedYear prop changes
  useEffect(() => {
    setNumericYear(String(selectedYear).replace('TY', ''));
  }, [selectedYear]);
  // Role-Based Access Control (RBAC) for Excel export actions
  const userRole = getUserRole(); // 'super_admin' | 'admin' | 'other'
  const canExportPreviousYear = userRole === 'super_admin' || userRole === 'admin';
  const canExportCurrentYear = userRole === 'super_admin';

  const [searchTerm, setSearchTerm] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [activeSubTab, setActiveSubTab] = useState(statusCode === 'all' ? '' : 'New');
  const [selectedMember, setSelectedMember] = useState(() => {
    // Try to restore selected member from sessionStorage on component mount
    try {
      const saved = sessionStorage.getItem('selectedMemberView');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [activeDetailTab, setActiveDetailTab] = useState('personal');
  const [unmaskedEmails, setUnmaskedEmails] = useState({});

  // Save selectedMember to sessionStorage whenever it changes
  useEffect(() => {
    if (selectedMember) {
      sessionStorage.setItem('selectedMemberView', JSON.stringify(selectedMember));
    } else {
      sessionStorage.removeItem('selectedMemberView');
    }
  }, [selectedMember]);

  // When sidebar item is clicked again (refreshKey bumps), close detail view and go back to table
  useEffect(() => {
    if (refreshKey === undefined) return;
    sessionStorage.removeItem('selectedMemberView');
    setSelectedMember(null);
    setSearchTerm('');
    setFilterDate('');
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  }, [refreshKey]);

  const [otpOpen, setOtpOpen] = useState(false);
  const [pendingMemberId, setPendingMemberId] = useState(null);
  const [commentsHistory, setCommentsHistory] = useState(INITIAL_COMMENTS || {});

  // API State
  const [apiMembers, setApiMembers] = useState([]);
  const [isApiLoaded, setIsApiLoaded] = useState(false);
  const [counts, setCounts] = useState({});
  const [pagination, setPagination] = useState({ currentPage: 1, limit: 20, totalRecords: 0, totalPages: 1 });
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [activeYearId, setActiveYearId] = useState('');

  // Fetch active year ID based on selectedYear prop (e.g. TY2025 -> 2025)
  useEffect(() => {
    let isMounted = true;
    const fetchYearId = async () => {
      try {
        const token = getAuthToken();
        if (!numericYear) {
          // Fetch actual current year from API when no navbar year override is set
          const currentRes = await fetch(URLS.GetCurrentYear, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          if (currentRes.ok) {
            const currentResult = await currentRes.json();
            if (isMounted && currentResult.success && currentResult.data && currentResult.data._id) {
              setActiveYearId(currentResult.data._id);
              return;
            }
          }
        }

        const res = await fetch(URLS.GetYears, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        if (res.ok) {
          const result = await res.json();
          if (isMounted && result.success && Array.isArray(result.data)) {
            if (numericYear) {
              const found = result.data.find(y => String(y.name) === String(numericYear));
              if (found && found._id) {
                setActiveYearId(found._id);
                return;
              }
            }
            const activeYear = result.data.find(y => y.current_year === 1 || y.status === 'active') || result.data[0];
            if (activeYear && activeYear._id) {
              setActiveYearId(activeYear._id);
            }
          }
        }
      } catch (err) {
        console.warn('Year fetch warning:', err);
      }
    };
    fetchYearId();
    return () => { isMounted = false; };
  }, [selectedYear, numericYear]);

  // Fetch registered members from backend API
  useEffect(() => {
  let isMounted = true;
  const abortController = new AbortController();

  const fetchMembers = async () => {
    // Guard: do not fetch until activeYearId is set
    if (!activeYearId) return;

    setLoading(true);
    setApiError('');
    try {
      const token = getAuthToken();
      const filterPayload = statusCode === 'all'
        ? (activeSubTab === 'New' ? 'new' : (activeSubTab === 'Modified' ? 'modified' : ''))
        : (activeSubTab === 'Modified' ? 'modified' : 'new');

      const payload = {
        page: pagination.currentPage,
        limit: 20,
        search: searchTerm || "",
        year_id: activeYearId,
        filestatus: statusCode === 'all' || !statusCode ? 'all' : statusCode,
        filter: filterPayload,
        status_date: filterDate || ""
      };

      const response = await fetch(URLS.GetAllRegistred, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload),
        signal: abortController.signal,
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const result = await response.json();
      if (isMounted && result.success) {
        setIsApiLoaded(true);
        setCounts(result.counts || {});
        if (result.pagination) {
          setPagination(result.pagination);
        }
        if (Array.isArray(result.data)) {
          const mapped = result.data.map(item => ({
            _id: item._id,
            sNo: item._id,
            name: `${item.first_name || ''} ${item.last_name || ''}`.trim() || 'N/A',
            fileNo: item.file_no ? String(item.file_no) : 'N/A',
            filingType: item.file_type || item.file_type || 'E-Filing',
            email: item.email || '',
            regDate: item.date_created ? formatDate(item.date_created, '') : '',
            status: item.filestatus_name || 'Registered',
            statusDate: item.date_updated ? formatDate(item.date_updated, '') : '',
            year: item.year?.name ? String(item.year.name) : numericYear,
            raw: item
          }));
          setApiMembers(mapped);
        } else {
          setApiMembers([]);
        }
      } else if (isMounted) {
        setApiError(result.message || 'Failed to fetch members.');
        setApiMembers([]);
      }
    } catch (err) {
      if (err.name !== 'AbortError' && isMounted) {
        console.error('Fetch members error:', err);
        setApiError(err.message);
        setApiMembers([]);
      }
    } finally {
      if (isMounted) setLoading(false);
    }
  };

  fetchMembers();
  return () => {
    isMounted = false;
    abortController.abort();
  };
}, [
  activeYearId,
  statusCode,
  activeSubTab,
  searchTerm,
  filterDate,
  pagination.currentPage,
  refreshKey,
]);

// Close detail view when any list filter changes
useEffect(() => {
  if (selectedMember) {
    setSelectedMember(null);
  }
}, [statusCode, numericYear, activeSubTab, searchTerm, filterDate]);

  // Determine list to display (never load static mock data)
  const displayMembers = apiMembers;

  const getMaskedEmail = (email) => {
    if (!email) return 'XXXXXXXXXX.COM';
    const parts = email.split('@');
    if (parts.length > 1) {
      return `XXXXXXXXXX@${parts[1]}`;
    }
    return `XXXXXXXXXX.${email.split('.').pop()}`;
  };

  // API Call: Send Email/Contact Verification OTP
  const handleSendEmailOtp = async (memberId, isContact = false) => {
    try {
      const token = getAuthToken();
      const url = isContact ? URLS.SendContactOtp : URLS.SendEmailOtp;
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ member_id: memberId })
      });
      const data = await res.json();
      return data.success;
    } catch (err) {
      console.error('Send OTP error:', err);
      return false;
    }
  };

  // API Call: Verify Email/Contact Verification OTP
  const handleVerifyEmailOtp = async (memberId, otpCode, otpType = 'email') => {
    try {
      const token = getAuthToken();
      const isContact = otpType === 'contact';
      const url = isContact ? URLS.VerifyContactOtp : URLS.VerifyEmailOtp;
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ member_id: memberId, otp: otpCode })
      });
      const data = await res.json();
      return data.success;
    } catch (err) {
      console.error('Verify OTP error:', err);
      return false;
    }
  };

  const handleEmailEyeClick = (memberId) => {
    const key = `${memberId}_email`;
    if (unmaskedEmails[key]) {
      setUnmaskedEmails(prev => ({ ...prev, [key]: false }));
    } else {
      setPendingMemberId(memberId);
      setOtpOpen(true);
      handleSendEmailOtp(memberId);
    }
  };

  const handleTableOtpVerify = async (code) => {
    if (!pendingMemberId) return false;
    const ok = await handleVerifyEmailOtp(pendingMemberId, code);
    if (ok) {
      setUnmaskedEmails(prev => ({ ...prev, [`${pendingMemberId}_email`]: true }));
      return true;
    }
    return false;
  };

  // Helper to trigger browser file download from Blob, Array, or String URL
  const triggerFileDownload = (blobOrUrl, fileName) => {
    if (blobOrUrl instanceof Blob) {
      const url = window.URL.createObjectURL(blobOrUrl);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => window.URL.revokeObjectURL(url), 2000);
    } else if (Array.isArray(blobOrUrl)) {
      if (blobOrUrl.length === 0) {
        alert("No member records found to export.");
        return;
      }
      
      // Prepare data for Excel
      const excelData = blobOrUrl.map(item => ({
        'File No': item.file_no || '',
        'File Type': item.file_type || item.tin_type || '',
        'First Name': item.first_name || '',
        'Last Name': item.last_name || '',
        'Email': item.email || '',
        'Contact Number': item.contact_number || '',
        'Alternate Number': item.alter_number || '',
        'State': item.state?.name || item.state || '',
        'City': item.city || '',
        'Zipcode': item.zipcode || '',
        'Filing Status': item.filing_status || '',
        'File Status': item.filestatus || '',
        'Current Stage': item.current_stage || item.stage || '',
        'Year': item.year?.name || '',
        'Date Created': item.date_created ? formatDate(item.date_created, '') : '',
        'Date Updated': item.date_updated ? formatDate(item.date_updated, '') : ''
      }));
      
      // Create workbook and worksheet
      const ws = XLSX.utils.json_to_sheet(excelData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Members');
      
      // Generate Excel file
      const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      
      // Download
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName.endsWith('.xlsx') ? fileName : fileName.replace(/\.csv$/i, '.xlsx');
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => window.URL.revokeObjectURL(url), 2000);

    } else if (typeof blobOrUrl === 'string' && blobOrUrl.length > 0) {
      // Remove hash from URL if present
      let cleanUrl = blobOrUrl;
      if (cleanUrl.includes('#')) {
        const hashIndex = cleanUrl.indexOf('#');
        cleanUrl = cleanUrl.substring(0, hashIndex);
      }
      
      // Make URL absolute if needed
      let fullUrl = cleanUrl;
      if (!fullUrl.startsWith('http://') && !fullUrl.startsWith('https://') && !fullUrl.startsWith('blob:') && !fullUrl.startsWith('data:')) {
        fullUrl = `${URLS.Base}${fullUrl.startsWith('/') ? fullUrl.slice(1) : fullUrl}`;
      }
      
      // Fetch the file and download it
      fetch(fullUrl)
        .then(response => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.blob();
        })
        .then(blob => {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = fileName;
          document.body.appendChild(a);
          a.click();
          a.remove();
          setTimeout(() => window.URL.revokeObjectURL(url), 2000);
          // console.log('✅ File downloaded:', fileName);
        })
        .catch(error => {
          console.error('❌ Download error:', error);
          alert(`Failed to download file: ${error.message}`);
        });
    }
  };

  // API Call: Export Previous Year Excel (All except current year)
  const handleExportPreviousYear = async () => {
    if (!canExportPreviousYear) {
      console.warn('⛔ Unauthorized: You do not have permission to export previous year members.');
      return;
    }
    // console.log('📤 Exporting Previous Year Members (excluding current year)');
    
    try {
      const token = getAuthToken();
      // Backend expects: year_id as empty string, search, and filestatus
      const payload = {
        year_id: "",
        search: "",
        filestatus: ""
      };

      // console.log('📤 Export payload:', payload);
      // console.log('📤 API endpoint:', URLS.ExportPerivousYear);

      const res = await fetch(URLS.ExportPerivousYear, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      // console.log('📥 Export response status:', res.status);

      if (!res.ok) {
        const errorText = await res.text();
        console.error('❌ Export error response:', errorText);
        throw new Error(`Export error: ${res.status}`);
      }

      const contentType = res.headers.get("content-type") || "";
      // console.log('📋 Content-Type:', contentType);
      
      if (contentType.includes("application/json")) {
        const result = await res.json();
        
        if (!result.success) {
          console.error('❌ Export failed:', result.message);
          return;
        }
        
        // Check if data is empty
        if (Array.isArray(result.data) && result.data.length === 0) {
          // console.warn('⚠️ No data returned from API');
          return;
        }
        
        const filePath = result.data?.url || result.data?.file || result.data?.filePath || result.download_url || result.file_path || result.file;
        
        if (typeof filePath === 'string' && filePath.length > 0) {
          triggerFileDownload(filePath, `previous_members_except_current.xlsx`);
        } else if (Array.isArray(result.data) && result.data.length > 0) {
          triggerFileDownload(result.data, `previous_members_except_current.xlsx`);
        } else if (typeof result.data === 'string' && result.data.length > 0) {
          triggerFileDownload(result.data, `previous_members_except_current.xlsx`);
        } else {
        }
      } else {
        const rawBlob = await res.blob();
        
        if (rawBlob.size === 0) {
          return;
        }
        
        const excelBlob = new Blob([rawBlob], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        triggerFileDownload(excelBlob, `previous_members_except_current.xlsx`);
      }
    } catch (err) {
      console.error('❌ Export error:', err);
    }
  };

  // API Call: Export Current Year Excel
  const handleExportCurrentYear = async () => {
    if (!canExportCurrentYear) {
      console.warn('⛔ Unauthorized: You do not have permission to export current year members.');
      return;
    }
    try {
      const token = getAuthToken();
      // Backend expects: search and filestatus only (NO year_id)
      const payload = {
        search: "",
        filestatus: ""
      };

      const res = await fetch(URLS.ExportCurrentYear, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error('❌ Export error response:', errorText);
        throw new Error(`Export error: ${res.status}`);
      }

      const contentType = res.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        const result = await res.json();
        if (!result.success) {
          console.error('❌ Export failed:', result.message);
          return;
        }
        // Check if data is empty
        if (Array.isArray(result.data) && result.data.length === 0) {
          return;
        }
        
        const filePath = result.data?.url || result.data?.file || result.data?.filePath || result.download_url || result.file_path || result.file;
        
        if (typeof filePath === 'string' && filePath.length > 0) {
          triggerFileDownload(filePath, `current_year_members.xlsx`);
        } else if (Array.isArray(result.data) && result.data.length > 0) {
          triggerFileDownload(result.data, `current_year_members.xlsx`);
        } else if (typeof result.data === 'string' && result.data.length > 0) {
          triggerFileDownload(result.data, `current_year_members.xlsx`);
        }
      } else {
        const rawBlob = await res.blob();
        
        if (rawBlob.size === 0) {
          return;
        }
        
        const excelBlob = new Blob([rawBlob], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        triggerFileDownload(excelBlob, `current_year_members.xlsx`);
      }
    } catch (err) {
      console.error('❌ Export error:', err);
    }
  };

  const handleAddComment = (sNo, status, comment, dateTime) => {
    setCommentsHistory(prev => ({
      ...prev,
      [sNo]: [{ status, comments: comment, dateTime }, ...(prev[sNo] || [])]
    }));
  };

  const totalCount = counts[statusCode] !== undefined
    ? counts[statusCode]
    : (counts.all !== undefined ? counts.all : (pagination.totalRecords || displayMembers.length));

  const filteredTotalRecords = pagination.totalRecords !== undefined ? pagination.totalRecords : displayMembers.length;

  if (selectedMember) {
    return (
      <div className="content-card">
        <MemberDetailFullPage
          member={selectedMember}
          onBack={() => { setSelectedMember(null); setActiveDetailTab('personal'); }}
          commentsHistory={commentsHistory}
          onAddComment={handleAddComment}
          onSendEmailOtp={handleSendEmailOtp}
          onVerifyEmailOtp={handleVerifyEmailOtp}
        />
      </div>
    );
  }

  return (
    <div className="content-card">
      {/* Header Section */}
      <div className="header-section" style={{ display: 'flex', justifyContent: 'space-between', flexWrap: "wrap", alignItems: 'center', gap: "12px", borderBottom: '1px solid var(--border-light)', paddingBottom: '12px', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0 }}>{title}</h2>
        {/* <div className="filter-right-inputs"> */}
         <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', maxWidth: '220px' }}>
          <input
            type="text"
            className="search-input-box"
            placeholder="Search members..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
          <Search
              size={16}
              style={{
                position: 'absolute',
                right: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#94a3b8',
                pointerEvents: 'none',
              }}
            />
        </div>
        {/* </div> */}

        {/* <div style={{ display: 'flex', gap: '8px' }}> */}
          <input
            type="date"
            className="date-picker-box"
            value={filterDate}
            onChange={e => setFilterDate(e.target.value)}
          />
        {/* </div> */}
         </div>
      </div>

      {/* Ribbon Toolbar & Excel Download Cards on the same equal line */}
      <div className="table-filter-bar" style={{ display: "flex", flexWrap: "wrap", gap: "12px", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
        <div className="filter-left-pill-group" style={{ display: "flex", flexWrap: "wrap", gap: "8px", alignItems: "center" }}>
          <button
            className={`pill-btn new-members ${activeSubTab === 'New' ? 'active' : ''}`}
            style={{ border: activeSubTab === 'New' ? '2px solid black' : 'none' }}
            onClick={() => {
              setActiveSubTab(prev => (prev === 'New' ? '' : 'New'));
              setPagination(prev => ({ ...prev, currentPage: 1 }));
            }}
          >
            New Registered Members
          </button>
          <button
            className={`pill-btn modified-members ${activeSubTab === 'Modified' ? 'active' : ''}`}
            style={{ border: activeSubTab === 'Modified' ? '2px solid black' : 'none' }}
            onClick={() => {
              setActiveSubTab(prev => (prev === 'Modified' ? '' : 'Modified'));
              setPagination(prev => ({ ...prev, currentPage: 1 }));
            }}
          >
            Last Modified Members
          </button>
          <span className="pill-badge">Total {totalCount}</span>
        </div>

        {/* Two Excel Download Cards in same row (Role-based access control) */}
        {(canExportPreviousYear || canExportCurrentYear) && (
          <div className="excel-btn-group" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
            {canExportPreviousYear && (
              <button className="excel-download-btn-card" onClick={handleExportPreviousYear}>
                <span className="excel-btn-top">⬇ Excel</span>
                <span className="excel-btn-bottom">Note: Download All members except current year</span>
              </button>
            )}
            {canExportCurrentYear && (
              <button className="excel-download-btn-card" onClick={handleExportCurrentYear}>
                <span className="excel-btn-top">⬇ Excel</span>
                <span className="excel-btn-bottom">Note: Download All Members current year only</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Loading Indicator */}
      {loading && (
        <div style={{ padding: '15px', textAlign: 'center', color: '#0076a3', fontSize: '13px', fontWeight: '600' }}>
          <Loader2 size={18} className="animate-spin" style={{ display: 'inline', marginRight: '6px' }} />
          Loading registered members from server...
        </div>
      )}

      {/* Table */}
      <div className="table-responsive" style={{ animation: 'fadeIn 0.2s ease-out' }}>
        <table className="corporate-table">
          <thead>
            <tr>
              <th>S.No</th>
              <th>Name</th>
              <th>File No</th>
              <th>Filing Type</th>
              <th>E-mail</th>
              <th>Register Date</th>
              <th>File Status</th>
              <th>Status Updated Date</th>
              <th style={{ width: '80px', textAlign: 'center' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {displayMembers.length > 0 ? (
              displayMembers.map((member, idx) => (
                <tr key={member._id || member.sNo || idx}>
                  <td>{(pagination.currentPage - 1) * pagination.limit + idx + 1}</td>
                  <td style={{ fontWeight: '500' }}>{member.name}</td>
                  <td>{member.fileNo}</td>
                  <td>{member.filingType}</td>
                  <td>
                    <div className="email-cell-container">
                      <span>
                        {unmaskedEmails[`${member._id || member.sNo}_email`]
                          ? member.email
                          : getMaskedEmail(member.email)}
                      </span>
                      <button
                        className="email-toggle-eye-btn"
                        onClick={() => handleEmailEyeClick(member._id || member.sNo)}
                        title={unmaskedEmails[`${member._id || member.sNo}_email`] ? 'Mask Email' : 'Show Email'}
                      >
                        {unmaskedEmails[`${member._id || member.sNo}_email`] ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </td>
                  <td style={{ color: 'var(--text-muted)' }}>{member.regDate}</td>
                  <td>
                    <span style={{
                      color: member.status?.includes('Complete') ? 'var(--color-darkgreen-btn)'
                        : member.status?.includes('Pending') ? '#856404' : '#212529',
                      fontWeight: member.status?.includes('Complete') ? 'bold' : 'normal'
                    }}>
                      {member.status}
                    </span>
                  </td>
                  <td style={{ color: 'var(--text-muted)' }}>{member.statusDate}</td>
                  <td style={{ textAlign: 'center' }}>
                    <button className="btn-view-action" onClick={() => {
                      setSelectedMember(member);
                      setActiveDetailTab('personal');
                    }}>
                      View
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="9" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                  No member records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px' }}>
        <div className="pagination-row">
          {/* Previous Button */}
          {pagination.currentPage > 1 && (
            <button
              className="page-link-btn"
              onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage - 1 }))}
            >
              &lt;
            </button>
          )}
          
          {/* Smart Page Numbers with Ellipsis */}
          {(() => {
            const totalPages = pagination.totalPages || 1;
            const current = pagination.currentPage;
            const pages = [];
            
            // Always show first page
            pages.push(1);
            
            if (totalPages <= 7) {
              // Show all pages if 7 or less
              for (let i = 2; i <= totalPages; i++) {
                pages.push(i);
              }
            } else {
              // Show smart pagination with ellipsis
              if (current <= 3) {
                // Near start: 1 2 3 4 ... last
                for (let i = 2; i <= 4; i++) pages.push(i);
                pages.push('...');
                pages.push(totalPages);
              } else if (current >= totalPages - 2) {
                // Near end: 1 ... last-3 last-2 last-1 last
                pages.push('...');
                for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
              } else {
                // Middle: 1 ... current-1 current current+1 ... last
                pages.push('...');
                pages.push(current - 1);
                pages.push(current);
                pages.push(current + 1);
                pages.push('...');
                pages.push(totalPages);
              }
            }
            
            return pages.map((p, idx) => (
              p === '...' ? (
                <span key={`ellipsis-${idx}`} style={{ padding: '0 8px', color: 'var(--text-muted)' }}>...</span>
              ) : (
                <button
                  key={p}
                  className={`page-link-btn ${pagination.currentPage === p ? 'active' : ''}`}
                  onClick={() => setPagination(prev => ({ ...prev, currentPage: p }))}
                >
                  {p}
                </button>
              )
            ));
          })()}
          
          {/* Next Button */}
          {pagination.currentPage < pagination.totalPages && (
            <button
              className="page-link-btn"
              onClick={() => setPagination(prev => ({ ...prev, currentPage: Math.min(prev.totalPages, prev.currentPage + 1) }))}
            >
              &gt;
            </button>
          )}
        </div>
        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
          Showing {displayMembers.length > 0 ? (pagination.currentPage - 1) * pagination.limit + 1 : 0} to {Math.min(pagination.currentPage * pagination.limit, filteredTotalRecords)} of {filteredTotalRecords} entries
        </div>
      </div>

      {/* Email OTP Verification Modal */}
      <OtpModal
        isOpen={otpOpen}
        onClose={() => setOtpOpen(false)}
        onVerify={handleTableOtpVerify}
        onResend={() => pendingMemberId && handleSendEmailOtp(pendingMemberId)}
        fieldLabel="Email Address"
      />
    </div>
  );
}
