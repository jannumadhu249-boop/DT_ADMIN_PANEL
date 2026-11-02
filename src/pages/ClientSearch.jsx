// ClientSearch.jsx – Final version with all fixes
import React, { useState, useRef, useEffect } from 'react';
import {
  Eye, EyeOff, User, Users, UserCheck, Landmark, MapPin,
  FileDown, Clock, CreditCard, UploadCloud, Download, MessageSquare,
  ChevronLeft, Loader2, Edit3, Plus,
  RefreshCw, CheckCircle, X, Trash2, FileText,
  Shield
} from 'lucide-react';
import { URLS } from '../url';
import { formatDate } from '../utils/dateUtils';

const getAuthToken = () => {
  const keys = ['authToken', 'token', 'adminToken', 'accessToken', 'jwt'];
  for (const key of keys) {
    const value = sessionStorage.getItem(key) || localStorage.getItem(key);
    if (value) return value;
  }
  return 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhZG1pbl9pZCI6IjZhNThiZDFjNzE1ZjE4ZTYxZDQxY2Y5MiIsImVtYWlsIjoiZGl2eWFwZW5keWFsYTA3MTdAZ21haWwuY29tIiwiYWRtaW5fc3RhZ2UiOiJzdXBlciIsImlhdCI6MTc4NDIwNDE1OCwiZXhwIjoxODE1NzQwMTU4fQ.1pjPlGU41H1G5ei3AfTEcaWk9O1eyRTG769xnpj5xts';
};

// -------------------- Constants --------------------
const WORKFLOW_STATUSES = [
  'Registered Users',
  'Scheduling Pending',
  'Information Pending',
  'Interview Pending',
  'Documents Pending',
  'Preparation Pending - 1',
  'Preparation Pending - 2',
  'Review & Summary 1',
  'Review & Summary 2',
  'ITIN Files',
  'Revised Estimate',
  'Payment Pending - Efiling',
  'Payment Pending - Paper filing',
  'Fee Payment Received - I',
  'Fee Payment Received - II',
  'Client Review - Efiling',
  'Client Review - Paper Filing',
  'Efiling Pending - 1',
  'Efiling Pending - 2',
  'E - Filed & Awaiting Acceptance - 1',
  'E - Filed & Awaiting Acceptance - 2',
  'E - Filed & Rejected',
  'City Return',
  'E-Filing Accepted & Filing Complete',
  'Paper Filing Pending',
  'Paper Filing Done',
  'Cancelled'
];

const STATUS_CODE_MAP = {
  'Registered Users': 'RGO',
  'Registered Only': 'RGO', // Alias for Registered Users
  'Scheduling Pending': 'SP',
  'Information Pending': 'BIP',
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
  'SP': 'SP',
  'BIP': 'BIP',
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

// -------------------- OTP Modal (fixed: immediate open with success/error props) --------------------
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
      setError(err.message || 'Verification failed.');
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '16px' }}>
      <div style={{ background: '#fff', borderRadius: '14px', width: '100%', maxWidth: '440px', boxShadow: '0 25px 50px rgba(0,0,0,0.2)', overflow: 'hidden' }}>
        <div style={{ background: 'linear-gradient(135deg, #0076a3, #005f8a)', padding: '18px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ background: 'rgba(255,255,255,0.2)', borderRadius: '8px', padding: '6px', display: 'flex' }}>
              <Shield size={20} color="#fff" />
            </div>
            <div>
              <p style={{ color: '#fff', fontWeight: '700', fontSize: '15px', margin: 0 }}>Verification Required</p>
              <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '12px', margin: 0 }}>Unmask: {fieldLabel}</p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', opacity: 0.8 }}>
            <X size={18} />
          </button>
        </div>
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
            Enter the 6-digit security code sent to verify viewing
          </p>
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
            {isVerifying ? 'Verifying...' : 'Verify & Reveal'}
          </button>
        </div>
      </div>
    </div>
  );
}

// -------------------- Bank Modal --------------------
function BankModal({ isOpen, onClose, onSave, bankData, memberName }) {
  const [accountNumber, setAccountNumber] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountHolderName, setAccountHolderName] = useState('');
  const [routingNumber, setRoutingNumber] = useState('');
  const [accountType, setAccountType] = useState('Checking Account');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const isEdit = Boolean(bankData && Object.keys(bankData).length > 0 && (bankData.account_number || bankData.bank_name));

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
    if (!/^\d+$/.test(accountNumber.trim())) { setError('Account Number must contain only digits.'); return; }
    if (accountNumber.trim().length < 5 || accountNumber.trim().length > 17) { setError('Account Number must be between 5 and 17 digits.'); return; }
    if (!bankName.trim()) { setError('Bank Name is required.'); return; }
    if (!accountHolderName.trim()) { setError('Account Holder Name is required.'); return; }
    if (!routingNumber.trim()) { setError('Routing Number is required.'); return; }
    if (!/^\d+$/.test(routingNumber.trim())) { setError('Routing Number must contain only digits.'); return; }
    if (routingNumber.trim().length !== 9) { setError('Routing Number must be exactly 9 digits.'); return; }
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
      <div style={{ background: '#fff', borderRadius: '14px', width: '100%', maxWidth: '520px', boxShadow: '0 25px 50px rgba(0,0,0,0.2)', overflow: 'hidden' }}>
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
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '5px' }}>
                Account Number <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <input
                type="text"
                value={accountNumber}
                onChange={e => setAccountNumber(e.target.value.replace(/\D/g, ''))}
                placeholder="Enter Account Number (5-17 digits)"
                style={{
                  width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '6px',
                  fontSize: '13px', color: '#0f172a', outline: 'none', boxSizing: 'border-box', fontFamily: 'monospace'
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '5px' }}>
                Bank Name <span style={{ color: '#dc2626' }}>*</span>
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
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '5px' }}>
                Account Holder Name <span style={{ color: '#dc2626' }}>*</span>
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
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '5px' }}>
                Routing Number <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <input
                type="text"
                value={routingNumber}
                onChange={e => setRoutingNumber(e.target.value.replace(/\D/g, ''))}
                placeholder="Enter 9-digit Routing Number (e.g. 021000021)"
                style={{
                  width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '6px',
                  fontSize: '13px', color: '#0f172a', outline: 'none', boxSizing: 'border-box', fontFamily: 'monospace'
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '8px' }}>
                Type of Account <span style={{ color: '#dc2626' }}>*</span>
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

// -------------------- Helper to build profile --------------------
const buildProfileFromClient = (client) => {
  if (!client) return null;
  return {
    personalInfo: {
      first_name: client.first_name || '',
      middle_name: '',
      last_name: client.last_name || '',
      contact_number: client.contact_number || '',
      alternate_number: client.alter_number || '',
      timezone: client.time_zone || 'EST',
      ssn_tin: client.tin_type || 'SSN',
      date_of_birth: '',
      occupation: '',
      gender: '',
      visa_type: '',
      email: client.email || '',
      mailing_address: '',
      city: '',
      state: '',
      zipcode: '',
      filing_status: client.filestatus_name || client.current_stage || '',
      first_entry_date_into_usa: ''
    },
    spouseInfo: {},
    dependentInfo: [],
    bankDetails: {
      bank_name: '',
      account_number: '',
      account_holder_name: '',
      routing_number: '',
      account_type: 'Checking Account',
      createdAt: client.date_created,
      updatedAt: client.date_updated
    },
    address: [],
    interview: {},
    documents: []
  };
};

// -------------------- Main ClientSearch Component --------------------
export default function ClientSearch({ member, selectedYear, setSelectedYear }) {
  // ---- UI state ----
  const [searchTerm, setSearchTerm] = useState('');
  const [searchIdType, setSearchIdType] = useState('');
  const [submittedSearch, setSubmittedSearch] = useState({ term: '', idType: '' });
  const [selectedMember, setSelectedMember] = useState(null);
  const [activeDetailTab, setActiveDetailTab] = useState('personal');
  const [profileData, setProfileData] = useState(null);

  // ---- OTP state ----
  const [unmaskedFields, setUnmaskedFields] = useState({});
  const [otpModalOpen, setOtpModalOpen] = useState(false);
  const [pendingFieldKey, setPendingFieldKey] = useState(null);
  const [otpFieldLabel, setOtpFieldLabel] = useState('Email Address');
  const [otpMemberId, setOtpMemberId] = useState(null);
  const [otpType, setOtpType] = useState('email');
  const [otpError, setOtpError] = useState('');
  const [otpSuccess, setOtpSuccess] = useState('');
  const [sendingOtp, setSendingOtp] = useState(false);

  // ---- File Info state ----
  const [statusHistory, setStatusHistory] = useState([]);
  const [loadingFileInfo, setLoadingFileInfo] = useState(false);
  const [fileTypeInput, setFileTypeInput] = useState('E-Filing');
  const [statusInput, setStatusInput] = useState('E-Filing Accepted & Filing Complete');
  const [commentsInput, setCommentsInput] = useState('');
  const [commentPopup, setCommentPopup] = useState(null); // For viewing full comments
  const [isSubmittingFileInfo, setIsSubmittingFileInfo] = useState(false);
  const [fileInfoSuccessMsg, setFileInfoSuccessMsg] = useState('');
  const [fileInfoErrorMsg, setFileInfoErrorMsg] = useState('');

  // ---- Upload state ----
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadDocName, setUploadDocName] = useState('');
  const [uploadDocTypeId, setUploadDocTypeId] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState('');
  const fileInputRef = useRef(null);

  // ---- Admin uploaded documents (fetched separately) ----
  const [adminUploadedDocs, setAdminUploadedDocs] = useState([]);
  const [loadingAdminDocs, setLoadingAdminDocs] = useState(false);

  const [deleteLoading, setDeleteLoading] = useState(false);

  // ---- Bank modal ----
  const [bankModalOpen, setBankModalOpen] = useState(false);

  // ---- Payment state ----
  const [payAmount, setPayAmount] = useState('');
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState('');
  const [paymentError, setPaymentError] = useState('');
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [loadingPaymentHistory, setLoadingPaymentHistory] = useState(false);

  // ---- API state ----
  const [years, setYears] = useState([]);
  const [clients, setClients] = useState([]);
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalRecords: 0, limit: 20 });
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [loadingProfile, setLoadingProfile] = useState(false);

  // ---- Derived ----
  const currentYearVal = selectedYear ? selectedYear.replace('TY', '') : '2026';
  const currentYearId = years.find(y => String(y.name) === currentYearVal)?._id || '';

  // ---- API calls ----
  const fetchYears = async () => {
    try {
      const token = getAuthToken();
      const res = await fetch(URLS.GetYears, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      if (data.success) {
        setYears(data.data);
        const defaultYear = data.data.find(y => y.current_year) || data.data[0];
        if (!selectedYear && defaultYear) {
          setSelectedYear('TY' + defaultYear.name);
        }
      } else {
        setApiError('Failed to load years.');
      }
    } catch (err) {
      setApiError('Error loading years: ' + err.message);
    }
  };

  const fetchClients = async (page = 1, limit = 20, searchBy = '', search = '', yearId = '') => {
    setLoading(true);
    setApiError('');
    try {
      const token = getAuthToken();
      const payload = { page, limit, searchBy: searchBy || '', search: search || '', year_id: yearId || currentYearId };
      const res = await fetch(URLS.GetClientSearch, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        setClients(data.data);
        setPagination(data.pagination);
      } else {
        setApiError(data.message || 'Failed to fetch clients.');
      }
    } catch (err) {
      setApiError('Error fetching clients: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // ---- OTP API functions (using URLS) ----
  const sendOtp = async (memberId, type = 'email') => {
    const url = type === 'email' ? URLS.SendEmailOtp : URLS.SendContactOtp;
    try {
      const token = getAuthToken();
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ member_id: memberId })
      });
      const data = await res.json();
      if (data.success) return true;
      else throw new Error(data.message || 'Failed to send OTP.');
    } catch (err) {
      throw err;
    }
  };

  const verifyOtp = async (memberId, otpCode, type = 'email') => {
    const url = type === 'email' ? URLS.VerifyEmailOtp : URLS.VerifyContactOtp;
    try {
      const token = getAuthToken();
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ member_id: memberId, otp: otpCode })
      });
      const data = await res.json();
      if (data.success) return true;
      else throw new Error(data.message || 'Invalid OTP.');
    } catch (err) {
      throw err;
    }
  };

  // ---- Payment API functions ----
  const fetchPaymentHistory = async (memberId) => {
    if (!memberId) return;
    setLoadingPaymentHistory(true);
    try {
      const token = getAuthToken();
      const res = await fetch(`${URLS.GetPayList}${memberId}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      if (data.success) setPaymentHistory(data.data || []);
    } catch (err) {
      console.error('Fetch payment history error:', err);
    } finally {
      setLoadingPaymentHistory(false);
    }
  };

  const handleAddPayment = async () => {
    if (!payAmount || parseFloat(payAmount) <= 0) {
      setPaymentError('Please enter a valid amount.');
      return;
    }
    if (!selectedMember?._id) {
      setPaymentError('Member ID missing.');
      return;
    }
    setPaymentError('');
    setPaymentLoading(true);
    setPaymentSuccess('');

    try {
      const token = getAuthToken();
      const res = await fetch(`${URLS.PayAmount}${selectedMember._id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ amount: parseFloat(payAmount) })
      });
      const data = await res.json();
      if (data.success) {
        setPaymentSuccess(data.message || 'Payment added successfully!');
        setPayAmount('');
        await fetchPaymentHistory(selectedMember._id);
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

  const handleResetPay = () => {
    setPayAmount('');
    setPaymentError('');
  };

  // ---- File Info API functions ----
  const fetchFileInfoHistory = async (memberId) => {
    if (!memberId) return;
    setLoadingFileInfo(true);
    try {
      const token = getAuthToken();
      const res = await fetch(`${URLS.GetFileInfo}${memberId}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.history)) {
        const sorted = data.history.sort((a, b) => new Date(b.createdAt || b.dateTime || 0) - new Date(a.createdAt || a.dateTime || 0));
        setStatusHistory(sorted);
      } else {
        setStatusHistory([]);
      }
    } catch (err) {
      console.warn('Fetch file info error:', err);
      setStatusHistory([]);
    } finally {
      setLoadingFileInfo(false);
    }
  };

  const handleCreateFileInfoStatus = async (e) => {
    e.preventDefault();
    const memberId = selectedMember?._id;
    if (!memberId) {
      setFileInfoErrorMsg('Member ID missing.');
      return;
    }
    // if (!commentsInput.trim()) {
    //   setFileInfoErrorMsg('Please enter comments.');
    //   return;
    // }
    setFileInfoErrorMsg('');
    setFileInfoSuccessMsg('');
    setIsSubmittingFileInfo(true);

    try {
      const token = getAuthToken();
      const statusCode = STATUS_CODE_MAP[statusInput] || statusInput;
      
      // Build payload based on what API expects
      const payload = {
        file_type: fileTypeInput,
        status: statusCode,
        comments: commentsInput.trim() || ''
      };

      console.log('📤 Submitting File Info:', { memberId, statusName: statusInput, statusCode, payload });

      const res = await fetch(`${URLS.CreateFileInfo}${memberId}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      console.log('📥 API Response Status:', res.status);
      const data = await res.json();
      console.log('📥 API Response Data:', data);
      
      if (res.ok && data.success) {
        setFileInfoSuccessMsg(data.message || 'Status updated successfully.');
        setCommentsInput('');
        await fetchFileInfoHistory(memberId);
        // Update quick status bar
        if (selectedMember) {
          setSelectedMember(prev => ({ ...prev, filestatus_name: statusInput, current_stage: statusInput }));
        }
        setTimeout(() => setFileInfoSuccessMsg(''), 3000);
      } else {
        const errorMsg = data.message || data.error || 'Failed to update status.';
        console.error('❌ API Error:', errorMsg, data);
        setFileInfoErrorMsg(errorMsg);
      }
    } catch (err) {
      console.error('❌ Create file info error:', err);
      setFileInfoErrorMsg('Network error. Please try again.');
    } finally {
      setIsSubmittingFileInfo(false);
    }
  };

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

  // ---- Upload handler ----
  const handleUploadDocument = async (e) => {
    e.preventDefault();
    const memberId = selectedMember?._id;
    if (!memberId) {
      setUploadError('Member ID missing.');
      return;
    }
    if (!uploadFile) {
      setUploadError('Please select a file.');
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
      formData.append('document_type_id', uploadDocTypeId);
      formData.append('document_name', uploadDocName.trim() || uploadFile.name);

      const res = await fetch(`${URLS.UploadDocuments}${memberId}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      const result = await res.json();
      if (res.ok && result.success) {
        setUploadSuccess(result.message || 'Document uploaded successfully.');
        await fetchAdminUploadedDocs(memberId);
        await fetchMemberProfile(memberId);
        setUploadFile(null);
        setUploadDocName('');
        setUploadDocTypeId('');
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

  // ---- Bank save handler (fixed) ----
  const handleSaveBankDetails = async (formData) => {
    const memberId = selectedMember?._id;
    if (!memberId) {
      throw new Error('Member ID missing.');
    }

    const hasBank = Boolean(
      profileData?.bankDetails &&
      Object.keys(profileData.bankDetails).length > 0 &&
      (profileData.bankDetails.account_number || profileData.bankDetails.bank_name)
    );

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
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${res.status}`);
      }

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.message || 'Failed to save bank details.');
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

    } catch (err) {
      console.error('Bank Details API error:', err);
      throw err;
    }
  };

  // ---- Fetch member profile ----
  const fetchMemberProfile = async (memberId) => {
    if (!memberId) return;
    setLoadingProfile(true);
    try {
      const token = getAuthToken();
      const res = await fetch(`${URLS.GetMemberView}${memberId}/profile`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const result = await res.json();
      if (result.success && result.data) {
        const processedData = {
          ...result.data,
          documents: Array.isArray(result.data.documents)
            ? result.data.documents.map(doc => ({
                ...doc,
                isAdminUploaded: doc.isAdminUploaded || doc.new_docs || doc.uploaded_by_admin || doc.admin_upload || false
              }))
            : []
        };
        setProfileData(processedData);
      } else {
        console.warn('Profile API returned success:false', result.message);
      }
    } catch (err) {
      console.error('Member profile fetch error:', err);
    } finally {
      setLoadingProfile(false);
    }
  };

  // ---- Fetch admin docs when member changes ----
  useEffect(() => {
    const memberId = selectedMember?._id || selectedMember?.sNo;
    if (memberId) {
      fetchAdminUploadedDocs(memberId);
    }
  }, [member]);
  
  // ---- Also fetch when upload tab becomes active ----
  useEffect(() => {
    if (activeDetailTab === 'upload') {
      const memberId = selectedMember?._id || selectedMember?.sNo;
      if (memberId) {
        fetchAdminUploadedDocs(memberId);
      }
    }
  }, [activeDetailTab]);

  // ---- OTP field click handler (immediate open) ----
  const handleFieldClick = async (fieldKey, label, requiresOtp = true, memberId = null, otpType = 'email') => {
    const isCurrentlyUnmasked = !!unmaskedFields[fieldKey];
    if (isCurrentlyUnmasked) {
      setUnmaskedFields(prev => ({ ...prev, [fieldKey]: false }));
      return;
    }
    if (requiresOtp) {
      if (!memberId) {
        console.warn('No memberId provided for OTP');
        return;
      }
      // Open modal immediately
      setOtpModalOpen(true);
      setOtpError('');
      setOtpSuccess('');
      setPendingFieldKey(fieldKey);
      setOtpFieldLabel(label);
      setOtpMemberId(memberId);
      setOtpType(otpType);
      setSendingOtp(true);

      // Send OTP in background
      try {
        await sendOtp(memberId, otpType);
        setOtpSuccess('Verification code sent to email.');
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
    try {
      const success = await verifyOtp(otpMemberId, code, otpType);
      if (success && pendingFieldKey) {
        setUnmaskedFields(prev => ({ ...prev, [pendingFieldKey]: true }));
        return true;
      }
      return false;
    } catch (err) {
      throw err;
    }
  };

  const handleOtpResend = async () => {
    if (!otpMemberId) throw new Error('No member selected.');
    await sendOtp(otpMemberId, otpType);
  };

  // ---- Handlers for table and navigation ----
  const handleYearChange = (e) => setSelectedYear('TY' + e.target.value);
  const handleSubmit = (e) => {
    e.preventDefault();
    // Require both search type and term
    if (!searchIdType || !searchTerm.trim()) {
      setApiError('Please select a search type and enter a search term.');
      return;
    }
    setApiError('');
    setSubmittedSearch({ term: searchTerm.trim(), idType: searchIdType });
    fetchClients(1, pagination.limit, searchIdType, searchTerm.trim(), currentYearId);
  };

  const handleResetSearch = () => {
    setSearchTerm('');
    setSearchIdType('');
    setSubmittedSearch({ term: '', idType: '' });
    setApiError('');
    if (currentYearId) {
      fetchClients(1, pagination.limit, '', '', currentYearId);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchClients(newPage, pagination.limit, submittedSearch.idType, submittedSearch.term, currentYearId);
    }
  };

  const getMaskedEmail = (email) => {
    if (!email) return '';
    const parts = email.split('@');
    return 'XXXXXXXXXX.' + (parts[parts.length - 1]?.split('.').pop() || '');
  };
  const getMaskedContact = () => 'XXXXXXXXXX';

  const handleSelectMember = (client) => {
    setSelectedMember(client);
    const dummyProfile = buildProfileFromClient(client);
    setProfileData(dummyProfile);
    setActiveDetailTab('personal');
    setStatusInput(client.filestatus_name || client.current_stage || 'E-Filing Accepted & Filing Complete');
    setFileTypeInput(client.file_type || 'E-Filing');
    setStatusHistory([]);
    setPaymentHistory([]);
    fetchMemberProfile(client._id);
    setTimeout(() => {
      setStatusHistory([
        {
          _id: '1',
          file_type: client.file_type || 'E-Filing',
          status: client.filestatus_name || client.current_stage,
          status_name: client.filestatus_name || client.current_stage,
          comments: 'Initial registration.',
          createdBy: 'System',
          createdAt: client.date_created
        }
      ]);
    }, 200);
  };

  const statusColor = (s) => {
    if (!s) return '#333';
    if (s.includes('Complete') || s.includes('Accepted')) return '#28a745';
    if (s.includes('Rejected')) return '#dc3545';
    if (s.includes('Pending')) return '#856404';
    return '#333';
  };

  // ---- Clear messages on tab change ----
  useEffect(() => {
    setFileInfoSuccessMsg('');
    setFileInfoErrorMsg('');
    setUploadSuccess('');
    setUploadError('');
    setPaymentSuccess('');
    setPaymentError('');
  }, [activeDetailTab]);

  // ---- Effects ----
  useEffect(() => { fetchYears(); }, []);
  useEffect(() => {
    if (years.length > 0 && currentYearId) {
      fetchClients(1, pagination.limit, submittedSearch.idType, submittedSearch.term, currentYearId);
    }
  }, [currentYearId, years]);

  // Auto-refresh when search term is cleared after a search
  useEffect(() => {
    if (!searchTerm.trim() && (submittedSearch.term || submittedSearch.idType)) {
      setSubmittedSearch({ term: '', idType: '' });
      setApiError('');
      if (currentYearId) {
        fetchClients(1, pagination.limit, '', '', currentYearId);
      }
    }
  }, [searchTerm, currentYearId]);
  useEffect(() => {
    if (selectedMember?._id && activeDetailTab === 'pay') {
      fetchPaymentHistory(selectedMember._id);
    }
  }, [selectedMember, activeDetailTab]);
  useEffect(() => {
    if (selectedMember?._id && activeDetailTab === 'fileInfo') {
      fetchFileInfoHistory(selectedMember._id);
    }
  }, [selectedMember, activeDetailTab]);

  // ---- Render ----
  return (
    <div className="content-card">
      {selectedMember ? (
        // ==================== DETAIL VIEW ====================
        <div className="detail-view-container" style={{ animation: 'fadeIn 0.2s ease-out' }}>
          <button className="detail-back-btn" onClick={() => { setSelectedMember(null); setActiveDetailTab('personal'); setProfileData(null); }}>
            <ChevronLeft size={16} style={{ display: 'inline', marginRight: '4px' }} /> Back
          </button>

          {/* Quick Info Bar */}
          <div style={{ marginBottom: '12px', padding: '10px 14px', background: '#f8f9fa', borderRadius: '4px', border: '1px solid #e5e7eb', fontSize: '13px' }}>
            <strong style={{ fontSize: '15px', color: '#0076a3' }}>
              {profileData?.personalInfo ? `${profileData.personalInfo.first_name || ''} ${profileData.personalInfo.last_name || ''}`.trim() : `${selectedMember.first_name || ''} ${selectedMember.last_name || ''}`.trim()}
            </strong>
            &nbsp;|&nbsp; File No: <strong>{selectedMember.file_no}</strong>
            &nbsp;|&nbsp; {selectedMember.file_type}
            &nbsp;|&nbsp; <span style={{ color: statusColor(selectedMember.filestatus_name || selectedMember.current_stage), fontWeight: 600 }}>{selectedMember.filestatus_name || selectedMember.current_stage}</span>
          </div>

          {/* 10-Tab Ribbon */}
          <div className="detail-tabs-row" style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-light)', paddingBottom: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
            {[
              { id: 'personal', label: 'Personal Info', icon: User },
              { id: 'spouse', label: 'Spouse Info', icon: Users },
              { id: 'dependent', label: 'Dependent Info', icon: UserCheck },
              { id: 'bank', label: 'Bank Details', icon: Landmark },
              { id: 'address', label: 'Address', icon: MapPin },
              { id: 'download', label: 'Download', icon: Download },
              { id: 'interview', label: 'Interview', icon: Clock },
              { id: 'pay', label: 'Pay', icon: CreditCard },
              { id: 'upload', label: 'Upload', icon: UploadCloud },
              { id: 'fileInfo', label: 'File Info', icon: FileText },
            ].map(tab => {
              const TabIcon = tab.icon;
              const isActive = activeDetailTab === tab.id;
              return (
                <button
                  key={tab.id}
                  className={`detail-tab-btn ${isActive ? 'active' : ''}`}
                  onClick={() => setActiveDetailTab(tab.id)}
                  style={{
                    padding: '8px 16px',
                    background: isActive ? '#0076a3' : '#000000',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '4px 4px 0 0',
                    cursor: 'pointer',
                    fontWeight: isActive ? '700' : '400',
                    fontSize: '13px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    transition: 'all 0.15s ease',
                    boxShadow: isActive ? '0 2px 4px rgba(0,118,163,0.2)' : 'none'
                  }}
                >
                  {TabIcon && <TabIcon size={13} />}
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Tab Panels */}
          <div className="detail-tab-panel" style={{ marginTop: '16px' }}>
            {/* ── PERSONAL INFO ── */}
            {activeDetailTab === 'personal' && (
              <div className="table-responsive">
                <table className="corporate-table detail-card-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                  <thead><tr><th colSpan="2" style={{ textAlign: 'left', padding: '12px 10px', borderBottom: '2px solid #ddd' }}><User size={16} style={{ marginRight: '6px' }} /> PERSONAL DETAILS</th></tr></thead>
                  <tbody>
                    {[
                      { label: 'FIRST NAME', value: profileData?.personalInfo?.first_name || selectedMember.first_name },
                      { label: 'MIDDLE NAME', value: profileData?.personalInfo?.middle_name || '' },
                      { label: 'LAST NAME', value: profileData?.personalInfo?.last_name || selectedMember.last_name },
                      { label: 'CONTACT NUMBER', value: profileData?.personalInfo?.contact_number || selectedMember.contact_number, masked: true, key: `${selectedMember._id}_contact`, isContact: true },
                      { label: 'ALTERNATE NUMBER', value: profileData?.personalInfo?.alternate_number || selectedMember.alter_number, masked: true, key: `${selectedMember._id}_alter_contact`, isContact: true },
                      { label: 'TIME ZONE', value: profileData?.personalInfo?.timezone || selectedMember.time_zone },
                      { label: 'SSN / TIN TYPE', value: profileData?.personalInfo?.ssn_tin || selectedMember.tin_type },
                      { label: 'DATE OF BIRTH', value: profileData?.personalInfo?.date_of_birth || '—' },
                      { label: 'OCCUPATION', value: profileData?.personalInfo?.occupation || '—' },
                      { label: 'GENDER', value: profileData?.personalInfo?.gender || '—' },
                      { label: 'VISA TYPE', value: profileData?.personalInfo?.visa_type || '—' },
                      { label: 'EMAIL', value: profileData?.personalInfo?.email || selectedMember.email, masked: true, key: `${selectedMember._id}_email`, isEmail: true },
                      { label: 'MAILING ADDRESS', value: profileData?.personalInfo?.mailing_address || '—' },
                      { label: 'CITY', value: profileData?.personalInfo?.city || '—' },
                      { label: 'STATE', value: profileData?.personalInfo?.state || '—' },
                      { label: 'ZIPCODE', value: profileData?.personalInfo?.zipcode || '—' },
                      { label: 'FILING STATUS', value: profileData?.personalInfo?.filing_status || selectedMember.filestatus_name },
                      { label: 'FIRST ENTRY DATE INTO USA', value: profileData?.personalInfo?.first_entry_date_into_usa ? formatDate(profileData.personalInfo.first_entry_date_into_usa) : '—' },
                      { label: 'REGISTRATION DATE', value: selectedMember.date_created ? formatDate(selectedMember.date_created) : '—' },
                      { label: 'LAST UPDATED', value: selectedMember.date_updated ? formatDate(selectedMember.date_updated) : '—' },
                    ].map((row, i) => {
                      const isMasked = row.masked;
                      const fieldKey = row.key || `field_${i}`;
                      const isUnmasked = !!unmaskedFields[fieldKey];
                      let displayValue = row.value || '—';
                      if (isMasked && !isUnmasked) {
                        if (row.isEmail) displayValue = getMaskedEmail(row.value);
                        else if (row.isContact) displayValue = getMaskedContact();
                        else displayValue = 'XXXXXXXXXX';
                      }
                      const otpType = row.isContact ? 'contact' : 'email';
                      return (
                        <tr key={i}>
                          <td style={{ width: '30%', fontWeight: '600', color: '#555', padding: '10px 10px', borderBottom: '1px solid #eee' }}>{row.label}</td>
                          <td style={{ padding: '10px 10px', borderBottom: '1px solid #eee' }}>
                            {isMasked ? (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span>{displayValue}</span>
                                <button
                                  className="email-toggle-eye-btn"
                                  onClick={() => handleFieldClick(fieldKey, row.label, true, selectedMember._id, otpType)}
                                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#0076a3' }}
                                  disabled={sendingOtp && pendingFieldKey === fieldKey}
                                >
                                  {sendingOtp && pendingFieldKey === fieldKey ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : (isUnmasked ? <EyeOff size={14} /> : <Eye size={14} />)}
                                </button>
                              </div>
                            ) : displayValue}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* ── SPOUSE INFO ── */}
            {activeDetailTab === 'spouse' && (
              <div className="table-responsive">
                {profileData?.spouseInfo && Object.keys(profileData.spouseInfo).length > 0 ? (
                  <table className="corporate-table detail-card-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                    <thead><tr><th colSpan="2" style={{ textAlign: 'left', padding: '12px 10px', borderBottom: '2px solid #ddd' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '7px' }}>
                        <span style={{ background: '#ede9fe', color: '#7c3aed', padding: '6px', borderRadius: '6px', display: 'inline-flex' }}><Users size={16} /></span> SPOUSE DETAILS
                      </span>
                    </th></tr></thead>
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
                      ].map(([l, v], i) => (
                        <tr key={i}>
                          <td style={{ width: '30%', fontWeight: '600', color: '#555', padding: '10px 10px', borderBottom: '1px solid #eee' }}>{l}</td>
                          <td style={{ padding: '10px 10px', borderBottom: '1px solid #eee' }}>{v || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div style={{ padding: '24px', textAlign: 'center', color: '#64748b', background: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                    <p style={{ margin: 0, fontWeight: '600', fontSize: '13px' }}>No spouse details submitted yet</p>
                    <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#94a3b8' }}>Member stage: <strong>{selectedMember.filestatus_name || selectedMember.current_stage || 'Basic Information Pending'}</strong></p>
                  </div>
                )}
              </div>
            )}

            {/* ── DEPENDENT INFO ── */}
            {activeDetailTab === 'dependent' && (
              <div style={{ border: '1px solid #e2e8f0', padding: '20px', borderRadius: '6px', background: '#fff' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid #f1f5f9' }}>
                  <div style={{ background: '#dcfce7', color: '#16a34a', padding: '9px', borderRadius: '8px', display: 'flex' }}><UserCheck size={20} /></div>
                  <div><h4 style={{ fontWeight: 'bold', margin: 0, fontSize: '15px', color: '#0f172a' }}>Dependent Information</h4><p style={{ margin: '2px 0 0', fontSize: '12px', color: '#64748b' }}>Dependent family members on tax return</p></div>
                </div>
                {(() => {
                  const deps = Array.isArray(profileData?.dependentInfo) ? profileData.dependentInfo : [];
                  return deps.length > 0 ? (
                    <div className="table-responsive">
                      <table className="corporate-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                        <thead><tr><th>S.NO</th><th>NAME</th><th>GENDER</th><th>RELATIONSHIP</th><th>DATE OF BIRTH</th><th>VISA TYPE</th></tr></thead>
                        <tbody>
                          {deps.map((dep, i) => (
                            <tr key={dep._id || i}>
                              <td>{i + 1}</td>
                              <td style={{ fontWeight: '600' }}>{`${dep.first_name || ''} ${dep.middle_name || ''} ${dep.last_name || ''}`.trim() || '—'}</td>
                              <td>{dep.gender || '—'}</td>
                              <td>{dep.relationship || '—'}</td>
                              <td>{dep.date_of_birth ? formatDate(dep.date_of_birth) : '—'}</td>
                              <td>{dep.visa_type || '—'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div style={{ padding: '24px', textAlign: 'center', color: '#64748b', background: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                      <p style={{ margin: 0, fontWeight: '600', fontSize: '13px' }}>No dependent details submitted yet</p>
                      <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#94a3b8' }}>Member has not listed any dependents.</p>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* ── BANK DETAILS ── */}
            {activeDetailTab === 'bank' && (
              <div style={{ border: '1px solid #e2e8f0', padding: '20px', borderRadius: '6px', background: '#fff' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '14px', borderBottom: '1px solid #f1f5f9' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ background: '#e0f2fe', color: '#0284c7', padding: '9px', borderRadius: '8px', display: 'flex' }}><Landmark size={20} /></div>
                    <div><h4 style={{ fontWeight: 'bold', margin: 0, fontSize: '15px', color: '#0f172a' }}>Bank Account Details</h4><p style={{ margin: '2px 0 0', fontSize: '12px', color: '#64748b' }}>Member tax refund and direct deposit information</p></div>
                  </div>
                  <button onClick={() => setBankModalOpen(true)} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '6px', background: '#0076a3', border: 'none', color: '#fff', fontSize: '13px', fontWeight: '600', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,118,163,0.2)' }}>
                    {profileData?.bankDetails && Object.keys(profileData.bankDetails).length > 0 ? <Edit3 size={15} /> : <Plus size={15} />}
                    {profileData?.bankDetails && Object.keys(profileData.bankDetails).length > 0 ? 'Edit Bank Details' : 'Add Bank Details'}
                  </button>
                </div>
                {profileData?.bankDetails && Object.keys(profileData.bankDetails).length > 0 ? (
                  <div className="table-responsive">
                    <table className="corporate-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                      <tbody>
                        <tr><td style={{ fontWeight: 'bold', width: '30%', color: '#555', padding: '10px 10px', borderBottom: '1px solid #eee' }}>Account Number</td>
                          <td style={{ padding: '10px 10px', borderBottom: '1px solid #eee', fontFamily: 'monospace' }}>{profileData.bankDetails.account_number || '—'}</td></tr>
                        <tr><td style={{ fontWeight: 'bold', width: '30%', color: '#555', padding: '10px 10px', borderBottom: '1px solid #eee' }}>Bank Name</td>
                          <td style={{ padding: '10px 10px', borderBottom: '1px solid #eee' }}>{profileData.bankDetails.bank_name || '—'}</td></tr>
                        <tr><td style={{ fontWeight: 'bold', width: '30%', color: '#555', padding: '10px 10px', borderBottom: '1px solid #eee' }}>Account Holder Name</td>
                          <td style={{ padding: '10px 10px', borderBottom: '1px solid #eee' }}>{profileData.bankDetails.account_holder_name || '—'}</td></tr>
                        <tr><td style={{ fontWeight: 'bold', width: '30%', color: '#555', padding: '10px 10px', borderBottom: '1px solid #eee' }}>Routing Number</td>
                          <td style={{ padding: '10px 10px', borderBottom: '1px solid #eee', fontFamily: 'monospace' }}>{profileData.bankDetails.routing_number || '—'}</td></tr>
                        <tr><td style={{ fontWeight: 'bold', width: '30%', color: '#555', padding: '10px 10px', borderBottom: '1px solid #eee' }}>Account Type</td>
                          <td style={{ padding: '10px 10px', borderBottom: '1px solid #eee' }}>
                            {profileData.bankDetails.account_type ? (
                              <span style={{ display: 'inline-block', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', background: profileData.bankDetails.account_type.toLowerCase().includes('checking') ? '#e0f2fe' : '#f0fdf4', color: profileData.bankDetails.account_type.toLowerCase().includes('checking') ? '#0369a1' : '#15803d' }}>
                                {profileData.bankDetails.account_type}
                              </span>
                            ) : '—'}
                          </td></tr>
                        {profileData.bankDetails.createdAt && (
                          <tr><td style={{ fontWeight: 'bold', width: '30%', color: '#555', padding: '10px 10px', borderBottom: '1px solid #eee' }}>Created At</td>
                            <td style={{ padding: '10px 10px', borderBottom: '1px solid #eee', fontSize: '12px', color: '#64748b' }}>{formatDate(profileData.bankDetails.createdAt)}</td></tr>
                        )}
                        {profileData.bankDetails.updatedAt && (
                          <tr><td style={{ fontWeight: 'bold', width: '30%', color: '#555', padding: '10px 10px', borderBottom: '1px solid #eee' }}>Updated At</td>
                            <td style={{ padding: '10px 10px', borderBottom: '1px solid #eee', fontSize: '12px', color: '#64748b' }}>{formatDate(profileData.bankDetails.updatedAt)}</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div style={{ padding: '36px 20px', textAlign: 'center', color: '#64748b', background: '#f8fafc', borderRadius: '8px', border: '1px dashed #cbd5e1' }}>
                    <div style={{ background: '#f1f5f9', width: '48px', height: '48px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}><Landmark size={24} color="#94a3b8" /></div>
                    <p style={{ margin: 0, fontWeight: '600', fontSize: '14px', color: '#334155' }}>No bank account details submitted yet</p>
                    <p style={{ margin: '6px 0 16px', fontSize: '12px', color: '#64748b' }}>Bank account information is required for direct deposit refund or tax settlements.</p>
                    <button onClick={() => setBankModalOpen(true)} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 18px', borderRadius: '6px', background: '#0076a3', border: 'none', color: '#fff', fontSize: '13px', fontWeight: '600', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,118,163,0.2)' }}>
                      <Plus size={15} /> Add Bank Details
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* ── ADDRESS ── */}
            {activeDetailTab === 'address' && (
              <div style={{ border: '1px solid #e2e8f0', padding: '20px', borderRadius: '6px', background: '#fff' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid #f1f5f9' }}>
                  <div style={{ background: '#fef9c3', color: '#ca8a04', padding: '9px', borderRadius: '8px', display: 'flex' }}><MapPin size={20} /></div>
                  <div><h4 style={{ fontWeight: 'bold', margin: 0, fontSize: '15px', color: '#0f172a' }}>Member Address Records</h4><p style={{ margin: '2px 0 0', fontSize: '12px', color: '#64748b' }}>State-wise address history for tax year</p></div>
                </div>
                {(() => {
                  const addrs = Array.isArray(profileData?.address) ? profileData.address : [];
                  return addrs.length > 0 ? (
                    <div className="table-responsive">
                      <table className="corporate-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                        <thead><tr><th>S.NO</th><th>PERSON</th><th>STATE</th><th>TAX YEAR</th><th>ADDRESS FROM</th><th>ADDRESS TO</th><th>CREATED AT</th></tr></thead>
                        <tbody>
                          {addrs.map((addr, i) => (
                            <tr key={addr._id || i}>
                              <td>{i + 1}</td>
                              <td style={{ fontWeight: '600' }}>{addr.person || 'Taxpayer'}</td>
                              <td>{addr.state?.name || '—'}</td>
                              <td>{addr.year?.name || '—'}</td>
                              <td>{addr.address_from ? formatDate(addr.address_from) : '—'}</td>
                              <td>{addr.address_to ? formatDate(addr.address_to) : '—'}</td>
                              <td style={{ fontSize: '12px', color: '#64748b' }}>{addr.createdAt ? formatDate(addr.createdAt) : '—'}</td>
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

            {/* ── DOWNLOAD ── */}
            {activeDetailTab === 'download' && (
              <div style={{ border: '1px solid #e2e8f0', padding: '20px', borderRadius: '6px', background: '#fff' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid #f1f5f9' }}>
                  <div style={{ background: '#e0f2fe', color: '#0284c7', padding: '9px', borderRadius: '8px', display: 'flex' }}><FileDown size={20} /></div>
                  <div><h4 style={{ fontWeight: 'bold', margin: 0, fontSize: '15px', color: '#0f172a' }}>Member Uploaded Documents</h4><p style={{ margin: '2px 0 0', fontSize: '12px', color: '#64748b' }}>Documents uploaded by the member/client</p></div>
                </div>
                {(() => {
                  const allDocs = profileData?.documents || [];
                  const memberDocs = allDocs.filter(doc => !(doc.isAdminUploaded || doc.new_docs));
                  return memberDocs.length > 0 ? (
                    <div className="table-responsive">
                      <table className="corporate-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                        <thead><tr><th>S.NO</th><th>DOCUMENT NAME</th><th>CATEGORY</th><th>FILE SIZE</th><th>UPLOADED DATE</th><th>ACTION</th></tr></thead>
                        <tbody>
                          {memberDocs.map((doc, i) => (
                            <tr key={doc._id || i}>
                              <td>{i + 1}</td>
                              <td style={{ fontWeight: '600' }}>{doc.document_name || doc.original_name || 'Document'}</td>
                              <td><span style={{ background: '#e0f2fe', color: '#0369a1', border: '1px solid #bae6fd', padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '600' }}>{doc.document_type?.name || 'Tax Document'}</span></td>
                              <td style={{ fontSize: '12px', color: '#64748b' }}>{doc.file_size ? `${(doc.file_size / 1024).toFixed(1)} KB` : '—'}</td>
                              <td style={{ fontSize: '12px', color: '#64748b' }}>{doc.createdAt ? formatDate(doc.createdAt) : '—'}</td>
                              <td>
                                <a href={doc.file_path ? (doc.file_path.startsWith('http') ? doc.file_path : `${URLS.ImageUrl}${doc.file_path}`) : '#'} target="_blank" rel="noopener noreferrer" style={{ padding: '5px 12px', fontSize: '12px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#0076a3', color: '#fff', borderRadius: '4px' }}>
                                  <Download size={13} /> Download
                                </a>
                              </td>
                            </tr>
                          ))}
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

            {/* ── INTERVIEW ── */}
            {activeDetailTab === 'interview' && (
              <div style={{ border: '1px solid #e2e8f0', padding: '20px', borderRadius: '6px', background: '#fff' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid #f1f5f9' }}>
                  <div style={{ background: '#fce7f3', color: '#be185d', padding: '9px', borderRadius: '8px', display: 'flex' }}><MessageSquare size={20} /></div>
                  <div><h4 style={{ fontWeight: 'bold', margin: 0, fontSize: '15px', color: '#0f172a' }}>Interview Scheduling Info</h4><p style={{ margin: '2px 0 0', fontSize: '12px', color: '#64748b' }}>Consultation date, time slot and status</p></div>
                </div>
                {profileData?.interview && Object.keys(profileData.interview).length > 0 ? (
                  <div className="table-responsive">
                    <table className="corporate-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                      <tbody>
                        <tr><td style={{ fontWeight: 'bold', width: '30%', color: '#555', padding: '10px 10px', borderBottom: '1px solid #eee' }}>Consultation Date</td>
                          <td style={{ padding: '10px 10px', borderBottom: '1px solid #eee' }}>{profileData.interview.consultation_date ? formatDate(profileData.interview.consultation_date) : '—'}</td></tr>
                        <tr><td style={{ fontWeight: 'bold', width: '30%', color: '#555', padding: '10px 10px', borderBottom: '1px solid #eee' }}>Time Slot</td>
                          <td style={{ padding: '10px 10px', borderBottom: '1px solid #eee' }}>{profileData.interview.time_slot?.slot || '—'}</td></tr>
                        <tr><td style={{ fontWeight: 'bold', width: '30%', color: '#555', padding: '10px 10px', borderBottom: '1px solid #eee' }}>Interview Status</td>
                          <td style={{ padding: '10px 10px', borderBottom: '1px solid #eee' }}>
                            {profileData.interview.status ? (
                              <span style={{ background: '#dcfce7', color: '#15803d', border: '1px solid #bbf7d0', padding: '4px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' }}>
                                {profileData.interview.status}
                              </span>
                            ) : '—'}
                          </td></tr>
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

            {/* ── PAY TAB ── */}
            {activeDetailTab === 'pay' && (
              <div style={{ border: '1px solid #e2e8f0', padding: '20px', borderRadius: '6px', background: '#fff' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid #f1f5f9' }}>
                  <div style={{ background: '#dcfce7', color: '#16a34a', padding: '9px', borderRadius: '8px', display: 'flex' }}><CreditCard size={20} /></div>
                  <div><h4 style={{ fontWeight: 'bold', margin: 0, fontSize: '15px', color: '#0f172a' }}>Billing & Invoices</h4><p style={{ margin: '2px 0 0', fontSize: '12px', color: '#64748b' }}>Payment history and invoice details</p></div>
                </div>

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
                      <input type="number" step="0.01" min="0.01" value={payAmount} onChange={e => setPayAmount(e.target.value)} placeholder="0.00" style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px', fontFamily: 'monospace', outline: 'none', boxSizing: 'border-box' }} />
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button onClick={handleAddPayment} disabled={paymentLoading} style={{ padding: '9px 24px', background: '#0076a3', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: '600', cursor: paymentLoading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '8px', opacity: paymentLoading ? 0.7 : 1, boxShadow: '0 2px 4px rgba(0,118,163,0.2)' }}>
                        {paymentLoading ? <Loader2 size={16} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} /> : <CreditCard size={16} />}
                        {paymentLoading ? 'Processing...' : 'Pay Now'}
                      </button>
                      <button onClick={handleResetPay} disabled={paymentLoading} style={{ padding: '9px 20px', background: '#e2e8f0', color: '#475569', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>Reset</button>
                    </div>
                  </div>
                </div>

                <div className="table-responsive" style={{ marginTop: '24px' }}>
                  <h5 style={{ fontWeight: 'bold', fontSize: '14px', margin: '0 0 12px 0', color: '#0f172a' }}>
                    Payment History {loadingPaymentHistory && <Loader2 size={14} style={{ animation: 'spin 1s linear infinite', marginLeft: '8px' }} />}
                  </h5>
                  {paymentHistory.length === 0 ? (
                    <p style={{ color: '#64748b', textAlign: 'center', padding: '20px' }}>No payments recorded yet.</p>
                  ) : (
                    <table className="corporate-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                      <thead><tr><th>Sl.No</th><th>Amount</th><th>Paid Amount</th><th>Year</th><th>Status</th><th>Payment Date</th></tr></thead>
                      <tbody>
                        {paymentHistory.map((p, idx) => (
                          <tr key={p._id}>
                            <td>{idx + 1}</td>
                            <td>${p.amount}</td>
                            <td>${p.paid_amount || 0}</td>
                            <td>{p.year_id?.name || p.year || '—'}</td>
                            <td>
                              <span style={{ padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: '600', background: p.status === 1 ? '#dcfce7' : '#fef3c7', color: p.status === 1 ? '#15803d' : '#92400e' }}>
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

            {/* ── UPLOAD ── */}
            {activeDetailTab === 'upload' && (
              <div style={{ border: '1px solid #e2e8f0', padding: '24px', borderRadius: '6px', background: '#fff' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px', paddingBottom: '14px', borderBottom: '1px solid #f1f5f9' }}>
                  <div style={{ background: '#fff7ed', color: '#ea580c', padding: '9px', borderRadius: '8px', display: 'flex' }}><UploadCloud size={20} /></div>
                  <div><h4 style={{ fontWeight: 'bold', margin: 0, fontSize: '15px', color: '#0f172a' }}>Admin Document Upload</h4><p style={{ margin: '2px 0 0', fontSize: '12px', color: '#64748b' }}>Upload documents as admin (these won't appear in member's document tab)</p></div>
                </div>

                {uploadSuccess && (
                  <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', color: '#047857', borderRadius: '8px', padding: '10px 14px', fontSize: '13px', display: 'flex', gap: '8px', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}><CheckCircle size={16} style={{ flexShrink: 0 }} /> {uploadSuccess}</div>
                    <button onClick={() => setUploadSuccess('')} style={{ background: 'none', border: 'none', color: '#047857', cursor: 'pointer', padding: '2px' }}><X size={14} /></button>
                  </div>
                )}
                {uploadError && (
                  <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', borderRadius: '8px', padding: '10px 14px', fontSize: '13px', marginBottom: '16px' }}>
                    ⚠️ {uploadError}
                  </div>
                )}

                <form onSubmit={handleUploadDocument} style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '650px', margin: '0 auto' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '5px' }}>Document Name <span style={{ color: '#dc2626' }}>*</span></label>
                      <input type="text" value={uploadDocName} onChange={e => setUploadDocName(e.target.value)} placeholder="e.g. Statement / Provisional PDF" required style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '5px' }}>Document Type <span style={{ color: '#dc2626' }}>*</span></label>
                      <select value={uploadDocTypeId} onChange={e => setUploadDocTypeId(e.target.value)} style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px', background: '#fff' }}>
                        <option value="">Select Document Type</option>
                        <option value="tax_summary">Tax Summary</option>
                        <option value="revised_tax_summary">Revised Tax Summary</option>
                        <option value="tax_review_copy">Tax Review Copy</option>
                        <option value="filed_return_for_records">Filed Return For Records</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '5px' }}>Select File <span style={{ color: '#dc2626' }}>*</span></label>
                    <input type="file" ref={fileInputRef} style={{ display: 'none' }} onChange={e => { if (e.target.files && e.target.files[0]) { const file = e.target.files[0]; setUploadFile(file); if (!uploadDocName) setUploadDocName(file.name.replace(/\.[^/.]+$/, "")); } }} />
                    <div style={{ border: uploadFile ? '2px dashed #0076a3' : '2px dashed #cbd5e1', padding: '30px 20px', borderRadius: '8px', background: uploadFile ? '#f0f9ff' : '#f8fafc', textAlign: 'center', cursor: 'pointer' }} onClick={() => fileInputRef.current?.click()} onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); if (e.dataTransfer.files && e.dataTransfer.files[0]) { const file = e.dataTransfer.files[0]; setUploadFile(file); if (!uploadDocName) setUploadDocName(file.name.replace(/\.[^/.]+$/, "")); } }}>
                      <UploadCloud size={36} color={uploadFile ? '#0076a3' : '#94a3b8'} style={{ marginBottom: '10px' }} />
                      {uploadFile ? (
                        <div>
                          <p style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: '#0076a3' }}>📄 {uploadFile.name}</p>
                          <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#64748b' }}>{(uploadFile.size / 1024).toFixed(1)} KB | {uploadFile.type || 'Document'}</p>
                          <button type="button" onClick={(e) => { e.stopPropagation(); setUploadFile(null); if (fileInputRef.current) fileInputRef.current.value = ''; }} style={{ marginTop: '8px', border: 'none', background: '#fee2e2', color: '#dc2626', padding: '4px 10px', borderRadius: '4px', fontSize: '11px', fontWeight: '600', cursor: 'pointer' }}>Remove file</button>
                        </div>
                      ) : (
                        <div>
                          <p style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: '#334155' }}>Drag & Drop file here, or <span style={{ color: '#0076a3', textDecoration: 'underline' }}>browse</span></p>
                          <span style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginTop: '4px' }}>Supported Formats: PDF, PNG, JPG, JPEG, TIFF (Max 10MB)</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                    <button type="submit" disabled={isUploading || !uploadFile} style={{ padding: '10px 24px', border: 'none', borderRadius: '6px', background: '#0076a3', color: '#fff', fontSize: '13px', fontWeight: '600', cursor: isUploading || !uploadFile ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '8px', opacity: isUploading || !uploadFile ? 0.6 : 1 }}>
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
                        <th>DOCUMENT NAME</th>
                        <th>FILE NAME</th>
                        <th>FILE SIZE</th>
                        <th>UPLOADED DATE</th>
                        <th>ACTION</th>
                      </tr>
                    </thead>
                    <tbody>
                      {adminUploadedDocs.map((doc, i) => {
                        const docName = doc.document_name || doc.original_name || doc.file_name || 'Document';
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
            {/* )} */}

            {/* ── FILE INFO ── */}
            {activeDetailTab === 'fileInfo' && (
              <div className="file-info-view" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <form onSubmit={handleCreateFileInfoStatus} style={{ border: '1px solid #e2e8f0', padding: '24px', borderRadius: '6px', background: '#fff' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px', paddingBottom: '14px', borderBottom: '1px solid #f1f5f9' }}>
                    <div style={{ background: '#f1f5f9', color: '#0076a3', padding: '9px', borderRadius: '8px', display: 'flex' }}><FileText size={20} /></div>
                    <div><h4 style={{ fontWeight: 'bold', margin: 0, fontSize: '15px', color: '#0f172a' }}>File Information & Workflow Status</h4><p style={{ margin: '2px 0 0', fontSize: '12px', color: '#64748b' }}>Update administrative filing status and record status notes</p></div>
                  </div>

                  {fileInfoSuccessMsg && (
                    <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', color: '#047857', borderRadius: '8px', padding: '10px 14px', fontSize: '13px', display: 'flex', gap: '8px', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}><CheckCircle size={16} style={{ flexShrink: 0 }} /> {fileInfoSuccessMsg}</div>
                      <button type="button" onClick={() => setFileInfoSuccessMsg('')} style={{ background: 'none', border: 'none', color: '#047857', cursor: 'pointer', padding: '2px' }}><X size={14} /></button>
                    </div>
                  )}
                  {fileInfoErrorMsg && (
                    <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', borderRadius: '8px', padding: '10px 14px', fontSize: '13px', marginBottom: '16px' }}>
                      ⚠️ {fileInfoErrorMsg}
                    </div>
                  )}

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#334155' }}>File No</label>
                      <input type="text" className="search-input-box" style={{ width: '100%', background: '#f8fafc', color: '#64748b', cursor: 'not-allowed', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px' }} value={selectedMember.file_no} disabled />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#334155' }}>Filing Type <span style={{ color: '#dc2626' }}>*</span></label>
                      <select className="search-input-box" style={{ width: '100%', background: '#fff', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px' }} value={fileTypeInput} onChange={e => setFileTypeInput(e.target.value)}>
                        <option value="E-Filing">E-Filing</option>
                        <option value="Paper Filing">Paper Filing</option>
                      </select>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#334155' }}>File Status <span style={{ color: '#dc2626' }}>*</span></label>
                      <select className="search-input-box" style={{ width: '100%', background: '#fff', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px' }} value={statusInput} onChange={e => setStatusInput(e.target.value)}>
                        {WORKFLOW_STATUSES.map((s, i) => (
                          <option key={i} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '18px' }}>
                    <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#334155' }}>Comments</label>
                    <textarea rows="4" className="search-input-box" style={{ width: '100%', height: 'auto', fontFamily: 'inherit', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px' }} placeholder="Enter administrative workflow update comments..." value={commentsInput} onChange={e => setCommentsInput(e.target.value)} />
                  </div>

                  <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                    <button type="button" className="btn btn-secondary" style={{ padding: '8px 20px', fontWeight: '600', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer', background: '#fff', color: '#475569' }} onClick={() => { setCommentsInput(''); setStatusInput(selectedMember.filestatus_name || selectedMember.current_stage || 'E-Filing Accepted & Filing Complete'); setFileTypeInput(selectedMember.file_type || 'E-Filing'); setFileInfoErrorMsg(''); }}>Reset</button>
                    <button type="submit" disabled={isSubmittingFileInfo} style={{ background: '#0076a3', padding: '8px 22px', border: 'none', fontWeight: '600', color: '#fff', borderRadius: '6px', cursor: isSubmittingFileInfo ? 'not-allowed' : 'pointer', opacity: isSubmittingFileInfo ? 0.6 : 1, display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {isSubmittingFileInfo ? <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> : null}
                      {isSubmittingFileInfo ? 'Submitting...' : 'Submit Update'}
                    </button>
                  </div>
                </form>

                <div style={{ border: '1px solid #e2e8f0', padding: '20px', borderRadius: '6px', background: '#fff', position: 'relative' }}>
                  {loadingFileInfo && (
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(255,255,255,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10, borderRadius: '6px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#0076a3', fontSize: '13px', fontWeight: '600' }}>
                        <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> Refreshing history...
                      </div>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                    <h4 style={{ fontWeight: 'bold', margin: 0, fontSize: '14px', color: '#0f172a' }}>Status History & Activity Log ({statusHistory.length})</h4>
                    <button onClick={() => selectedMember?._id && fetchFileInfoHistory(selectedMember._id)} disabled={loadingFileInfo} style={{ border: '1px solid #cbd5e1', background: '#fff', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: '500', color: '#475569', cursor: loadingFileInfo ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '6px', opacity: loadingFileInfo ? 0.5 : 1 }}>
                      <RefreshCw size={14} style={{ animation: loadingFileInfo ? 'spin 1s linear infinite' : 'none' }} /> Refresh
                    </button>
                  </div>
                  <div className="table-responsive">
                    <table className="corporate-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                      <thead><tr><th>S.No</th><th>Filing Type</th><th>Status</th><th>Comments</th><th>Created By</th><th>Date & Time</th></tr></thead>
                      <tbody>
                        {statusHistory.length > 0 ? (
                          statusHistory.map((c, i) => {
                            const MAX_COMMENT_LENGTH = 100;
                            const comment = c.comments || '—';
                            const isTruncated = comment.length > MAX_COMMENT_LENGTH;
                            
                            return (
                              <tr key={c._id || i}>
                                <td>{i + 1}</td>
                                <td style={{ fontWeight: '500' }}>{c.file_type || selectedMember.file_type || '—'}</td>
                                <td>
                                  <span style={{ background: c.status?.includes('EFA') || c.status_name?.includes('Complete') ? '#ecfdf5' : '#f0f9ff', color: c.status?.includes('EFA') || c.status_name?.includes('Complete') ? '#047857' : '#0369a1', border: '1px solid #bae6fd', padding: '3px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: '600', display: 'inline-block' }}>
                                    {c.status_name || c.status || '—'}
                                  </span>
                                </td>
                                <td style={{ color: '#334155', maxWidth: '350px' }}>
                                  {isTruncated ? (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '250px' }}>
                                        {comment.substring(0, MAX_COMMENT_LENGTH)}...
                                      </span>
                                      <button
                                        onClick={() => setCommentPopup({ text: comment })}
                                        style={{
                                          background: '#e0f2fe',
                                          border: '1px solid #bae6fd',
                                          color: '#0369a1',
                                          padding: '3px 8px',
                                          borderRadius: '4px',
                                          fontSize: '11px',
                                          fontWeight: '600',
                                          cursor: 'pointer',
                                          whiteSpace: 'nowrap'
                                        }}
                                      >
                                        View
                                      </button>
                                    </div>
                                  ) : (
                                    <span>{comment}</span>
                                  )}
                                </td>
                                <td style={{ fontSize: '12px', color: '#64748b' }}>{c.createdBy || 'Admin'}</td>
                                <td style={{ fontSize: '12px', color: '#64748b' }}>{c.createdAt ? formatDate(c.createdAt) : '—'}</td>
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
        // </div>
      ) : (
        // ==================== TABLE VIEW ====================
        <>
          <div className="header-section" style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: '12px', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0 }}>All registered members</h2>
          </div>

          {apiError && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', borderRadius: '8px', padding: '10px 14px', fontSize: '13px', marginBottom: '16px' }}>
              ⚠️ {apiError}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'flex-end', marginBottom: '24px', backgroundColor: '#f8f9fa', padding: '16px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', minWidth: '220px' }}>
              <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#555' }}>Search Term</label>
              <input type="text" placeholder="Search Term" className="search-input-box" style={{ width: '100%', padding: '9px 12px', border: '1px solid #ccc', borderRadius: '4px' }} value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', minWidth: '180px' }}>
              <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#555' }}>Search By</label>
              <select className="search-input-box" style={{ width: '100%', padding: '9px 12px', border: '1px solid #ccc', borderRadius: '4px', height: '38px' }} value={searchIdType} onChange={e => setSearchIdType(e.target.value)}>
                <option value="">Select</option>
                <option value="name">Name</option>
                <option value="file_no">File No</option>
                <option value="email">Email</option>
                <option value="mobile">Contact Number</option>
              </select>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', minWidth: '150px' }}>
              <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#555' }}>Financial Year</label>
              <select className="search-input-box" style={{ width: '100%', padding: '9px 12px', border: '1px solid #ccc', borderRadius: '4px', height: '38px' }} value={currentYearVal} onChange={handleYearChange}>
                {years.map(y => <option key={y._id} value={y.name}>{y.name}</option>)}
              </select>
            </div>
            <button type="submit" className="btn btn-primary" style={{ padding: '9px 24px', height: '38px', background: '#0076a3', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '600' }} disabled={loading || !searchIdType || !searchTerm.trim()}>
              {loading ? 'Loading...' : 'Submit'}
            </button>
            {(searchTerm || searchIdType || submittedSearch.term || submittedSearch.idType) && (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleResetSearch}
                style={{ padding: '9px 18px', height: '38px', background: '#fff', color: '#475569', border: '1px solid #cbd5e1', borderRadius: '4px', cursor: 'pointer', fontWeight: '600' }}
              >
                Reset
              </button>
            )}
          </form>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}><Loader2 size={36} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} /><p style={{ marginTop: '10px', color: '#555' }}>Loading members...</p></div>
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
                      <th style={{ padding: '10px 10px', borderBottom: '2px solid #ddd', textAlign: 'left' }}>File Status</th>
                      <th style={{ width: '80px', textAlign: 'center', padding: '10px 10px', borderBottom: '2px solid #ddd' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clients.length > 0 ? (
                      clients.map((client, index) => {
                        const rowNum = (pagination.currentPage - 1) * pagination.limit + index + 1;
                        const emailKey = `cs_${client._id}_email`;
                        return (
                          <tr key={client._id}>
                            <td style={{ padding: '10px 10px', borderBottom: '1px solid #eee' }}>{rowNum}</td>
                            <td style={{ padding: '10px 10px', borderBottom: '1px solid #eee', fontWeight: '500' }}>{`${client.first_name || ''} ${client.last_name || ''}`.trim()}</td>
                            <td style={{ padding: '10px 10px', borderBottom: '1px solid #eee' }}>{client.file_no}</td>
                            <td style={{ padding: '10px 10px', borderBottom: '1px solid #eee' }}>{client.file_type || '—'}</td>
                            <td style={{ padding: '10px 10px', borderBottom: '1px solid #eee' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span>{unmaskedFields[emailKey] ? client.email : getMaskedEmail(client.email)}</span>
                                <button type="button" className="email-toggle-eye-btn" onClick={() => handleFieldClick(emailKey, 'Email Address', true, client._id, 'email')} style={{ padding: '2px', display: 'inline-flex', color: '#0076a3', border: 'none', background: 'none', cursor: 'pointer' }} disabled={sendingOtp && pendingFieldKey === emailKey}>
                                  {sendingOtp && pendingFieldKey === emailKey ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Eye size={14} />}
                                </button>
                              </div>
                            </td>
                            <td style={{ padding: '10px 10px', borderBottom: '1px solid #eee' }}>
                              <span style={{ color: (client.filestatus_name || client.current_stage || '').includes('Complete') ? '#28a745' : (client.filestatus_name || client.current_stage || '').includes('Pending') ? '#856404' : '#212529', fontWeight: (client.filestatus_name || client.current_stage || '').includes('Complete') ? 'bold' : 'normal' }}>
                                {client.filestatus_name || client.current_stage || '—'}
                              </span>
                            </td>
                            <td style={{ textAlign: 'center', padding: '10px 10px', borderBottom: '1px solid #eee' }}>
                              <button type="button" className="btn" style={{ backgroundColor: '#5cb85c', color: '#ffffff', padding: '6px 12px', fontSize: '13px', borderRadius: '4px', border: 'none', cursor: 'pointer' }} onClick={() => handleSelectMember(client)}>View</button>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr><td colSpan="7" style={{ textAlign: 'center', padding: '30px', color: '#555' }}>No registered members found for the selected year and filters.</td></tr>
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

      {/* OTP Modal */}
      <OtpModal
        isOpen={otpModalOpen}
        onClose={() => { setOtpModalOpen(false); setOtpError(''); setOtpSuccess(''); }}
        onVerify={handleOtpVerify}
        onResend={handleOtpResend}
        fieldLabel={otpFieldLabel}
        initialError={otpError}
        initialSuccess={otpSuccess}
      />

      {/* Bank Modal */}
      <BankModal
        isOpen={bankModalOpen}
        onClose={() => setBankModalOpen(false)}
        onSave={handleSaveBankDetails}
        bankData={profileData?.bankDetails}
        memberName={profileData?.personalInfo ? `${profileData.personalInfo.first_name || ''} ${profileData.personalInfo.last_name || ''}`.trim() : selectedMember ? `${selectedMember.first_name || ''} ${selectedMember.last_name || ''}`.trim() : ''}
      />

      {/* Comment Popup Modal */}
      {commentPopup && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15,23,42,0.55)',
            backdropFilter: 'blur(3px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 99999,
            padding: '16px'
          }}
          onClick={() => setCommentPopup(null)}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '12px',
              width: '100%',
              maxWidth: '600px',
              boxShadow: '0 20px 50px rgba(0,0,0,0.25)',
              overflow: 'hidden',
              animation: 'fadeIn 0.2s ease-out'
            }}
            onClick={e => e.stopPropagation()}
          >
            <div
              style={{
                background: 'linear-gradient(135deg, #0076a3, #005f8a)',
                padding: '16px 20px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <MessageSquare size={20} color="#fff" />
                <h3 style={{ margin: 0, color: '#fff', fontWeight: '700', fontSize: '15px' }}>
                  Full Comment
                </h3>
              </div>
              <button
                onClick={() => setCommentPopup(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#fff',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  opacity: 0.9
                }}
              >
                <X size={18} />
              </button>
            </div>
            <div style={{ padding: '20px 24px', maxHeight: '400px', overflowY: 'auto' }}>
              <p
                style={{
                  margin: 0,
                  fontSize: '14px',
                  lineHeight: '1.6',
                  color: '#1e293b',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word'
                }}
              >
                {commentPopup.text}
              </p>
            </div>
            <div
              style={{
                padding: '12px 20px',
                borderTop: '1px solid #e2e8f0',
                display: 'flex',
                justifyContent: 'flex-end'
              }}
            >
              <button
                onClick={() => setCommentPopup(null)}
                style={{
                  padding: '8px 18px',
                  border: '1px solid #cbd5e1',
                  borderRadius: '6px',
                  background: '#fff',
                  color: '#475569',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}