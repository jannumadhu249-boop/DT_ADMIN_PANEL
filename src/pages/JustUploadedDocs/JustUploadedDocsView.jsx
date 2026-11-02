import React, { useState, useRef, useEffect } from 'react';
import {
  Eye, EyeOff, User, Users, UserCheck, Landmark, MapPin,
  FileDown, Clock, CreditCard, UploadCloud, Download,
  ChevronLeft, Loader2, Edit3, Plus, MessageSquare,
  RefreshCw, CheckCircle, X, Trash2, FileText, Shield
} from 'lucide-react';
import { URLS } from '../../url';
import { formatDate } from '../../utils/dateUtils';

const getAuthToken = () => {
  const keys = ['authToken', 'token', 'adminToken', 'accessToken', 'jwt'];
  for (const key of keys) {
    const value = sessionStorage.getItem(key) || localStorage.getItem(key);
    if (value) return value;
  }
  return 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhZG1pbl9pZCI6IjZhNThiZDFjNzE1ZjE4ZTYxZDQxY2Y5MiIsImVtYWlsIjoiZGl2eWFwZW5keWFsYTA3MTdAZ21haWwuY29tIiwiYWRtaW5fc3RhZ2UiOiJzdXBlciIsImlhdCI6MTc4NDIwNDE1OCwiZXhwIjoxODE1NzQwMTU4fQ.1pjPlGU41H1G5ei3AfTEcaWk9O1eyRTG769xnpj5xts';
};

// -------------------- Status Constants & Maps --------------------
export const WORKFLOW_STATUSES = [
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

export const STATUS_CODE_MAP = {
  'Registered Users': 'RGO',
  'Registered Only': 'RGO', // Alias for Registered Users
  'Scheduling Pending': 'SP',
  'Information Pending': 'BIP',
  'Basic Information Pending': 'BIP',
  'Interview Pending': 'IP',
  'Documents Pending': 'DP',
  'Preparation Pending - 1': 'PP_I',
  'Preparation - 1': 'PP_I',
  'Preparation Pending - 2': 'PP_II',
  'Preparation - 2': 'PP_II',
  'Review & Summary 1': 'TR_S_I',
  'Review & Summary 2': 'TR_S_II',
  'ITIN Files': 'ITIN',
  'Revised Estimate': 'RE_ES',
  'Payment Pending - Efiling': 'PP_EF',
  'Payment Pending - Paper filing': 'PP_PF',
  'Fee Payment Received - I': 'FPR',
  'Fee Payment Received - II': 'FPR_II',
  'Client Review - Efiling': 'CR_EF',
  'Client Review - Paper Filing': 'CR_PF',
  'Efiling Pending - 1': 'EFP_I',
  'Efiling Pending - 2': 'EFP_II',
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

export const CODE_TO_STATUS_NAME = {
  'RGO': 'Registered Users',
  'SP': 'Scheduling Pending',
  'BIP': 'Information Pending',
  'IP': 'Interview Pending',
  'DP': 'Documents Pending',
  'PP_I': 'Preparation Pending - 1',
  'PP_II': 'Preparation Pending - 2',
  'TR_S_I': 'Review & Summary 1',
  'TR_S_II': 'Review & Summary 2',
  'ITIN': 'ITIN Files',
  'RE_ES': 'Revised Estimate',
  'PP_EF': 'Payment Pending - Efiling',
  'PP_PF': 'Payment Pending - Paper filing',
  'FPR': 'Fee Payment Received - I',
  'FPR_II': 'Fee Payment Received - II',
  'CR_EF': 'Client Review - Efiling',
  'CR_PF': 'Client Review - Paper Filing',
  'EFP_I': 'Efiling Pending - 1',
  'EFP_II': 'Efiling Pending - 2',
  'EF_AA_I': 'E - Filed & Awaiting Acceptance - 1',
  'EF_AA_II': 'E - Filed & Awaiting Acceptance - 2',
  'EF_REJ': 'E - Filed & Rejected',
  'C_R': 'City Return',
  'EFA_FC': 'E-Filing Accepted & Filing Complete',
  'PF_P': 'Paper Filing Pending',
  'PF_D': 'Paper Filing Done',
  'CANC': 'Cancelled'
};

// -------------------- Parse helper --------------------
export const parseMemberDetailsResponse = (sectionsArray) => {
  let personalInfoSection = {};
  let spouseInfoSection = {};
  let dependentInfoSection = [];
  let bankDetailsSection = {};
  let downloadDocs = [];
  let interviewsSection = [];
  let paymentsSection = [];
  let uploadSection = {};
  let fileInfoSection = {};

  if (Array.isArray(sectionsArray)) {
    sectionsArray.forEach(sec => {
      const secName = (sec.section || '').trim();
      if (secName === 'Personal Info') {
        personalInfoSection = {
          member_id: sec.member_id,
          name: sec.name,
          file_no: sec.file_no,
          filing_type: sec.filing_type,
          file_status: sec.file_status,
          file_status_name: sec.file_status_name,
          ...(sec.personal_info || {})
        };
      } else if (secName === 'Spouse Info') {
        spouseInfoSection = sec.spouse_info || {};
      } else if (secName === 'Dependent Info') {
        dependentInfoSection = Array.isArray(sec.dependent_info) ? sec.dependent_info : [];
      } else if (secName === 'Bank Details') {
        bankDetailsSection = sec.bank_details || {};
      } else if (secName === 'Download') {
        downloadDocs = Array.isArray(sec.documents) ? sec.documents : [];
      } else if (secName === 'Interview') {
        interviewsSection = Array.isArray(sec.interviews) ? sec.interviews : (sec.interview ? [sec.interview] : []);
      } else if (secName === 'Pay') {
        paymentsSection = Array.isArray(sec.payments) ? sec.payments : [];
      } else if (secName === 'Upload') {
        uploadSection = {
          total_documents: sec.total_documents,
          user_documents_count: sec.user_documents_count,
          admin_documents_count: sec.admin_documents_count,
          documents: Array.isArray(sec.documents) ? sec.documents : []
        };
      } else if (secName === 'File Info') {
        fileInfoSection = {
          member_id: sec.member_id,
          name: sec.name,
          file_no: sec.file_no,
          filing_type: sec.filing_type,
          file_status: sec.file_status,
          file_status_name: sec.file_status_name,
          year: sec.year || {}
        };
      }
    });
  }

  return {
    personalInfo: personalInfoSection,
    spouseInfo: spouseInfoSection,
    dependentInfo: dependentInfoSection,
    bankDetails: bankDetailsSection,
    documents: downloadDocs,
    downloadDocuments: downloadDocs,
    interviews: interviewsSection,
    interview: interviewsSection[0] || {},
    payments: paymentsSection,
    uploadDetails: uploadSection,
    fileInfo: fileInfoSection
  };
};

// -------------------- OTP Modal --------------------
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
          <div style={{
            background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c',
            borderRadius: '8px', padding: '8px 12px', fontSize: '12px', marginBottom: '16px'
          }}>
            {error}
          </div>
        )}
        {success && (
          <div style={{
            background: '#ecfdf5', border: '1px solid #a7f3d0', color: '#047857',
            borderRadius: '8px', padding: '8px 12px', fontSize: '12px', marginBottom: '16px'
          }}>
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

// -------------------- Bank Modal --------------------
function BankModal({ isOpen, onClose, onSave, bankData, memberName }) {
  const [formData, setFormData] = useState({
    bank_name: '',
    account_number: '',
    account_holder_name: '',
    routing_number: '',
    account_type: 'Checking Account'
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (bankData && Object.keys(bankData).length > 0) {
      setFormData({
        bank_name: bankData.bank_name || '',
        account_number: bankData.account_number || '',
        account_holder_name: bankData.account_holder_name || bankData.account_holder || memberName || '',
        routing_number: bankData.routing_number || '',
        account_type: bankData.account_type || 'Checking Account'
      });
    } else {
      setFormData({
        bank_name: '',
        account_number: '',
        account_holder_name: memberName || '',
        routing_number: '',
        account_type: 'Checking Account'
      });
    }
    setError('');
  }, [bankData, memberName, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.bank_name.trim() || !formData.account_number.trim() || !formData.routing_number.trim()) {
      setError('Please fill in Bank Name, Account Number and Routing Number.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await onSave(formData);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save bank details.');
    } finally {
      setSaving(false);
    }
  };

  const isEdit = Boolean(bankData && (bankData.account_number || bankData.bank_name));

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(3px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px'
    }}>
      <div style={{
        background: '#ffffff', borderRadius: '16px', maxWidth: '520px', width: '100%',
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', border: '1px solid #e2e8f0',
        padding: '28px', position: 'relative'
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

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <div style={{
            width: '44px', height: '44px', borderRadius: '10px', background: '#e0f2fe',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0076a3'
          }}>
            <Landmark size={22} />
          </div>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', margin: 0 }}>
              {isEdit ? 'Edit Bank Account Details' : 'Add Bank Account Details'}
            </h3>
            <p style={{ fontSize: '12px', color: '#64748b', margin: '2px 0 0' }}>
              Direct deposit and refund settlement bank info
            </p>
          </div>
        </div>

        {error && (
          <div style={{
            background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c',
            borderRadius: '8px', padding: '10px 14px', fontSize: '13px', marginBottom: '16px'
          }}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
              Bank Name <span style={{ color: '#dc2626' }}>*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Chase, Wells Fargo, Bank of America"
              value={formData.bank_name}
              onChange={e => setFormData({ ...formData, bank_name: e.target.value })}
              style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
              Account Holder Name
            </label>
            <input
              type="text"
              placeholder="Account holder full name"
              value={formData.account_holder_name}
              onChange={e => setFormData({ ...formData, account_holder_name: e.target.value })}
              style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                Account Number <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Account number"
                value={formData.account_number}
                onChange={e => setFormData({ ...formData, account_number: e.target.value })}
                style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px', outline: 'none', fontFamily: 'monospace', boxSizing: 'border-box' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                Routing Number (9 digits) <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <input
                type="text"
                required
                maxLength={9}
                placeholder="9-digit routing"
                value={formData.routing_number}
                onChange={e => setFormData({ ...formData, routing_number: e.target.value })}
                style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px', outline: 'none', fontFamily: 'monospace', boxSizing: 'border-box' }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
              Account Type
            </label>
            <div style={{ display: 'flex', gap: '16px', marginTop: '6px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="account_type"
                  value="Checking Account"
                  checked={formData.account_type === 'Checking Account'}
                  onChange={e => setFormData({ ...formData, account_type: e.target.value })}
                />
                Checking Account
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="account_type"
                  value="Savings Account"
                  checked={formData.account_type === 'Savings Account'}
                  onChange={e => setFormData({ ...formData, account_type: e.target.value })}
                />
                Savings Account
              </label>
            </div>
          </div>

          <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #f1f5f9', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              style={{ padding: '8px 16px', border: '1px solid #cbd5e1', borderRadius: '6px', background: '#fff', color: '#475569', fontSize: '13px', fontWeight: '500', cursor: 'pointer' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              style={{
                padding: '8px 20px', border: 'none', borderRadius: '6px', background: '#0076a3', color: '#fff', fontSize: '13px', fontWeight: '600',
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', opacity: saving ? 0.7 : 1
              }}
            >
              {saving ? <Loader2 size={15} className="animate-spin" /> : null}
              {saving ? 'Saving...' : isEdit ? 'Update Details' : 'Save Details'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ==================== Main JustUploadedDocsView Component ====================
export default function JustUploadedDocsView({
  member,
  selectedYear,
  onBack,
  onStatusUpdated
}) {
  const [activeDetailTab, setActiveDetailTab] = useState('personal');
  const [profileData, setProfileData] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(false);

  // OTP state
  const [unmaskedFields, setUnmaskedFields] = useState({});
  const [otpModalOpen, setOtpModalOpen] = useState(false);
  const [pendingFieldKey, setPendingFieldKey] = useState(null);
  const [otpFieldLabel, setOtpFieldLabel] = useState('Email Address');
  const [otpMemberId, setOtpMemberId] = useState(null);
  const [otpType, setOtpType] = useState('email');
  const [otpError, setOtpError] = useState('');
  const [otpSuccess, setOtpSuccess] = useState('');
  const [sendingOtp, setSendingOtp] = useState(false);

  // File Info state
  const [statusHistory, setStatusHistory] = useState([]);
  const [loadingFileInfo, setLoadingFileInfo] = useState(false);
  const [fileTypeInput, setFileTypeInput] = useState(member?.filing_type || member?.file_type || 'E-Filing');
  const [statusInput, setStatusInput] = useState(
    member?.file_status_name || member?.filestatus_name || CODE_TO_STATUS_NAME[member?.file_status] || 'E-Filing Accepted & Filing Complete'
  );
  const [commentsInput, setCommentsInput] = useState('');
  const [commentPopup, setCommentPopup] = useState(null); // For viewing full comments
  const [isSubmittingFileInfo, setIsSubmittingFileInfo] = useState(false);
  const [fileInfoSuccessMsg, setFileInfoSuccessMsg] = useState('');
  const [fileInfoErrorMsg, setFileInfoErrorMsg] = useState('');

  // Upload state
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadDocName, setUploadDocName] = useState('');
  const [uploadDocTypeId, setUploadDocTypeId] = useState('');
  const [uploadYearId, setUploadYearId] = useState('');
  const [recentFiveYears, setRecentFiveYears] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState('');
  const fileInputRef = useRef(null);

  // Admin uploaded documents
  const [adminUploadedDocs, setAdminUploadedDocs] = useState([]);
  const [loadingAdminDocs, setLoadingAdminDocs] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Bank modal
  const [bankModalOpen, setBankModalOpen] = useState(false);

  // Payment state
  const [payAmount, setPayAmount] = useState('');
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState('');
  const [paymentError, setPaymentError] = useState('');
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [loadingPaymentHistory, setLoadingPaymentHistory] = useState(false);

  const memberId = member?.member_id || member?._id;

  // DEBUG: log member object to browser console to verify correct IDs
  // Remove this after confirming member_id resolves correctly
  React.useEffect(() => {
    console.log('[JustUploadedDocsView] member prop:', member);
    console.log('[JustUploadedDocsView] resolved memberId:', memberId);
  }, [member]);

  const markedDocIdsRef = useRef(new Set());

  // ---- Mark Document as Viewed ----
  const markDocumentsViewed = async (documents) => {
    if (!Array.isArray(documents) || documents.length === 0) return;
    const token = getAuthToken();
    for (const doc of documents) {
      const docId = typeof doc === 'string' ? doc : (doc._id || doc.id || doc.documentId || doc.document_id);
      if (!docId) continue;
      const strId = String(docId);
      if (markedDocIdsRef.current.has(strId)) continue;
      markedDocIdsRef.current.add(strId);

      let primarySource = doc.source;
      if (!primarySource) {
        primarySource = (doc.uploaded_by === 'Admin' || doc.isAdminUploaded || doc.uploaded_by_admin) ? 'Admin' : 'User';
      }

      try {
        const res = await fetch(URLS.MarkDocumentViewed, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ documentId: strId, source: primarySource })
        });
        if (res.status === 404) {
          const fallbackSource = primarySource === 'Admin' ? 'User' : 'Admin';
          await fetch(URLS.MarkDocumentViewed, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ documentId: strId, source: fallbackSource })
          });
        }
      } catch (err) {
        console.warn('markDocumentViewed error for doc', docId, err);
      }
    }
  };

  // Auto-mark uploaded documents as viewed as soon as member is received
  useEffect(() => {
    if (Array.isArray(member?.uploaded_documents) && member.uploaded_documents.length > 0) {
      markDocumentsViewed(member.uploaded_documents);
    }
  }, [member]);

  // ---- Fetch Profile ----
  const fetchMemberProfile = async (mId) => {
    if (!mId) return;
    setLoadingProfile(true);
    try {
      const token = getAuthToken();
      const res = await fetch(`${URLS.GetMemberView}${mId}/profile`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const result = await res.json();
      if (result.success && result.data) {
        let processedData;
        if (Array.isArray(result.data)) {
          processedData = parseMemberDetailsResponse(result.data);
        } else {
          processedData = {
            ...result.data,
            documents: Array.isArray(result.data.documents)
              ? result.data.documents.map(doc => ({
                  ...doc,
                  isAdminUploaded: doc.isAdminUploaded || doc.new_docs || doc.uploaded_by_admin || doc.admin_upload || false
                }))
              : (Array.isArray(member?.uploaded_documents) ? member.uploaded_documents : [])
          };
          if (!processedData.downloadDocuments) {
            processedData.downloadDocuments = processedData.documents;
          }
        }
        setProfileData(processedData);

        // Mark all uploaded documents as viewed by Admin
        const uploadedDocs = processedData.uploadDetails?.documents || [];
        const downloadDocs = processedData.downloadDocuments || processedData.documents || [];
        const memberJustDocs = Array.isArray(member?.uploaded_documents) ? member.uploaded_documents : [];
        const allDocs = [...uploadedDocs, ...downloadDocs, ...memberJustDocs];
        if (allDocs.length > 0) {
          markDocumentsViewed(allDocs);
        }

        // Sync file status from profileData if available
        const fi = processedData.fileInfo || processedData.personalInfo || {};
        const matchedStatusName = fi.file_status_name || fi.filestatus_name || CODE_TO_STATUS_NAME[fi.file_status] || fi.file_status || member?.file_status_name || member?.filestatus_name;
        if (matchedStatusName) {
          setStatusInput(matchedStatusName);
        }
        if (fi.filing_type || member?.filing_type) {
          setFileTypeInput(fi.filing_type || member?.filing_type);
        }
      }
    } catch (err) {
      console.error('Member profile fetch error:', err);
    } finally {
      setLoadingProfile(false);
    }
  };

  // ---- Fetch Recent 5 Years ----
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

  // ---- Fetch Admin Uploaded Docs ----
  const fetchAdminUploadedDocs = async (mId) => {
    if (!mId) return;
    setLoadingAdminDocs(true);
    try {
      const token = getAuthToken();
      const res = await fetch(`${URLS.GetUploadList}${mId}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      });
      const result = await res.json();
      if (result.success && Array.isArray(result.data)) {
        setAdminUploadedDocs(result.data);
      } else {
        setAdminUploadedDocs([]);
      }
    } catch (err) {
      console.warn('Fetch admin documents error:', err);
      setAdminUploadedDocs([]);
    } finally {
      setLoadingAdminDocs(false);
    }
  };

  // ---- Fetch Payment History ----
  const fetchPaymentHistory = async (mId) => {
    if (!mId) return;
    setLoadingPaymentHistory(true);
    try {
      const token = getAuthToken();
      const res = await fetch(`${URLS.GetPayList}${mId}`, {
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

  // ---- Fetch File Info History ----
  const fetchFileInfoHistory = async (mId) => {
    if (!mId) return;
    setLoadingFileInfo(true);
    try {
      const token = getAuthToken();
      const res = await fetch(`${URLS.GetFileInfo}${mId}`, {
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

  // ---- OTP Send & Verify ----
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
    const resolvedMemberId = mId || memberId;
    if (requiresOtp) {
      if (!resolvedMemberId) {
        console.warn('No memberId provided for OTP');
        return;
      }
      setOtpModalOpen(true);
      setOtpError('');
      setOtpSuccess('');
      setPendingFieldKey(fieldKey);
      setOtpFieldLabel(label);
      setOtpMemberId(resolvedMemberId);
      setOtpType(otpTypeParam);
      setSendingOtp(true);

      try {
        await sendOtp(resolvedMemberId, otpTypeParam);
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

  // ---- Payment Handler ----
  const handleAddPayment = async () => {
    if (!payAmount || parseFloat(payAmount) <= 0) {
      setPaymentError('Please enter a valid amount.');
      return;
    }
    if (!memberId) {
      setPaymentError('Member ID missing.');
      return;
    }
    setPaymentError('');
    setPaymentLoading(true);
    setPaymentSuccess('');

    try {
      const token = getAuthToken();
      const res = await fetch(`${URLS.PayAmount}${memberId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ amount: parseFloat(payAmount) })
      });
      const data = await res.json();
      if (data.success) {
        setPaymentSuccess(data.message || 'Payment added successfully!');
        setPayAmount('');
        await fetchPaymentHistory(memberId);
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

  // ---- File Info Handler ----
  const handleCreateFileInfoStatus = async (e) => {
    e.preventDefault();
    if (!memberId) {
      setFileInfoErrorMsg('Member ID missing.');
      return;
    }
    setFileInfoErrorMsg('');
    setFileInfoSuccessMsg('');
    setIsSubmittingFileInfo(true);

    try {
      const token = getAuthToken();
      const statusCode = STATUS_CODE_MAP[statusInput] || statusInput;
      const payload = { file_type: fileTypeInput, status: statusCode, comments: commentsInput.trim() || '' };

      const res = await fetch(`${URLS.CreateFileInfo}${memberId}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setFileInfoSuccessMsg(data.message || 'Status updated successfully.');
        setCommentsInput('');
        await fetchFileInfoHistory(memberId);

        // Update local state and notify parent
        const resolvedName = CODE_TO_STATUS_NAME[statusCode] || statusInput;
        setStatusInput(resolvedName);
        if (onStatusUpdated) {
          onStatusUpdated(memberId, resolvedName, fileTypeInput);
        }
        setTimeout(() => setFileInfoSuccessMsg(''), 3000);
      } else {
        setFileInfoErrorMsg(data.message || 'Failed to update status.');
      }
    } catch (err) {
      console.error('Create file info error:', err);
      setFileInfoErrorMsg('Network error. Please try again.');
    } finally {
      setIsSubmittingFileInfo(false);
    }
  };

  // ---- Upload Document Handler ----
  const handleUploadDocument = async (e) => {
    e.preventDefault();
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
      if (uploadYearId) formData.append('year_id', uploadYearId);

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
        setUploadYearId('');
        if (fileInputRef.current) fileInputRef.current.value = '';
        setTimeout(() => setUploadSuccess(''), 4000);
      } else {
        setUploadError(result.message || `Failed to upload document (${res.status})`);
      }
    } catch (err) {
      console.error('Upload document error:', err);
      setUploadError(err.message || 'Network error occurred during upload.');
    } finally {
      setIsUploading(false);
    }
  };

  // ---- Delete Document Handler ----
  const handleDeleteDoc = async (docId) => {
    if (!window.confirm('Are you sure you want to delete this document?')) return;
    setDeleteLoading(true);
    setUploadError('');
    setUploadSuccess('');

    try {
      const token = getAuthToken();
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
        setAdminUploadedDocs(prev => prev.filter(doc => (doc._id || doc.id) !== docId));
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

  // ---- Bank Details Save Handler ----
  const handleSaveBankDetails = async (formData) => {
    if (!memberId) throw new Error('Member ID missing.');
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
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${res.status}`);
    }

    const data = await res.json();
    if (!data.success) throw new Error(data.message || 'Failed to save bank details.');

    setProfileData(prev => ({
      ...prev,
      bankDetails: {
        ...(prev?.bankDetails || {}),
        ...formData,
        updatedAt: new Date().toISOString(),
        createdAt: prev?.bankDetails?.createdAt || new Date().toISOString(),
      }
    }));
  };

  // ---- Effects ----
  useEffect(() => {
    if (memberId) {
      fetchMemberProfile(memberId);
      fetchRecentFiveYears();
    }
  }, [memberId]);

  useEffect(() => {
    if (memberId && activeDetailTab === 'upload') fetchAdminUploadedDocs(memberId);
    if (memberId && activeDetailTab === 'pay') fetchPaymentHistory(memberId);
    if (memberId && activeDetailTab === 'fileInfo') fetchFileInfoHistory(memberId);
  }, [memberId, activeDetailTab]);

  useEffect(() => {
    setFileInfoSuccessMsg('');
    setFileInfoErrorMsg('');
    setUploadSuccess('');
    setUploadError('');
    setPaymentSuccess('');
    setPaymentError('');
  }, [activeDetailTab]);

  // Masking helpers
  const getMaskedEmail = (email) => {
    if (!email) return '—';
    const parts = email.split('@');
    if (parts.length < 2) return 'XXXXXXXXXX';
    const domainParts = parts[1].split('.');
    const ext = domainParts.length > 1 ? domainParts.pop() : 'com';
    return 'XXXXXXXXXX.' + ext;
  };
  const getMaskedContact = () => 'XXXXXXXXXX';

  const statusColor = (s) => {
    if (!s) return '#475569';
    if (s.includes('Complete') || s.includes('Accepted') || s === 'EFA_FC') return '#16a34a';
    if (s.includes('Rejected') || s === 'EF_REJ' || s.includes('Cancel')) return '#dc2626';
    if (s.includes('Pending') || s === 'IP' || s === 'SP' || s === 'BIP') return '#d97706';
    return '#2563eb';
  };

  const displayName = profileData?.personalInfo
    ? `${profileData.personalInfo.first_name || ''} ${profileData.personalInfo.last_name || ''}`.trim() || profileData.personalInfo.name
    : `${member?.first_name || ''} ${member?.last_name || ''}`.trim() || member?.name || 'Member';

  const currentFileStatusName = profileData?.personalInfo?.file_status_name ||
    profileData?.fileInfo?.file_status_name ||
    CODE_TO_STATUS_NAME[profileData?.fileInfo?.file_status] ||
    member?.file_status_name ||
    member?.filestatus_name ||
    member?.current_stage ||
    '—';

  return (
    <div className="detail-view-container" style={{ animation: 'fadeIn 0.2s ease-out' }}>
      {/* Back Button */}
      <button
        className="detail-back-btn"
        onClick={onBack}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          padding: '6px 14px',
          background: '#f1f5f9',
          border: '1px solid #cbd5e1',
          borderRadius: '4px',
          color: '#334155',
          fontSize: '13px',
          fontWeight: '600',
          cursor: 'pointer',
          marginBottom: '12px'
        }}
      >
        <ChevronLeft size={16} /> Back to Just Uploaded Docs
      </button>

      {/* Quick Info Bar */}
      <div style={{ marginBottom: '14px', padding: '10px 14px', background: '#f8f9fa', borderRadius: '4px', border: '1px solid #e5e7eb', fontSize: '13px' }}>
        <strong style={{ fontSize: '15px', color: '#0076a3' }}>{displayName}</strong>
        &nbsp;|&nbsp; File No: <strong>{member?.file_no || profileData?.personalInfo?.file_no || '—'}</strong>
        &nbsp;|&nbsp; {profileData?.personalInfo?.filing_type || member?.filing_type || member?.file_type || 'E-Filing'}
        &nbsp;|&nbsp; <span style={{ color: statusColor(currentFileStatusName), fontWeight: 600 }}>{currentFileStatusName}</span>
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
                  { label: 'FIRST NAME', value: profileData?.personalInfo?.first_name || member?.first_name || (profileData?.personalInfo?.name ? profileData.personalInfo.name.split(' ')[0] : '') },
                  { label: 'MIDDLE NAME', value: profileData?.personalInfo?.middle_name || '' },
                  { label: 'LAST NAME', value: profileData?.personalInfo?.last_name || member?.last_name || (profileData?.personalInfo?.name ? profileData.personalInfo.name.split(' ').slice(1).join(' ') : '') },
                  { label: 'CONTACT NUMBER', value: profileData?.personalInfo?.contact_number || member?.contact_number, masked: true, key: `${memberId}_contact`, isContact: true },
                  { label: 'ALTERNATE NUMBER', value: profileData?.personalInfo?.alternate_number || member?.alter_number, masked: true, key: `${memberId}_alter_contact`, isContact: true },
                  { label: 'TIME ZONE', value: profileData?.personalInfo?.time_zone || profileData?.personalInfo?.timezone || member?.time_zone },
                  { label: 'SSN / TIN TYPE', value: (profileData?.personalInfo?.ssn_tin ? `${profileData.personalInfo.tin_type || 'SSN'}: ${profileData.personalInfo.ssn_tin}` : (profileData?.personalInfo?.tin_type || member?.tin_type)) },
                  { label: 'DATE OF BIRTH', value: profileData?.personalInfo?.date_of_birth ? formatDate(profileData.personalInfo.date_of_birth) : '—' },
                  { label: 'OCCUPATION', value: profileData?.personalInfo?.occupation || '—' },
                  { label: 'GENDER', value: profileData?.personalInfo?.gender || '—' },
                  { label: 'VISA TYPE', value: profileData?.personalInfo?.visa_type || '—' },
                  { label: 'EMAIL', value: profileData?.personalInfo?.email || member?.email, masked: true, key: `${memberId}_email`, isEmail: true },
                  { label: 'MAILING ADDRESS', value: profileData?.personalInfo?.mailing_address || '—' },
                  { label: 'CITY', value: profileData?.personalInfo?.city || '—' },
                  { label: 'STATE', value: profileData?.personalInfo?.state || '—' },
                  { label: 'ZIPCODE', value: profileData?.personalInfo?.zipcode || '—' },
                  { label: 'FILING STATUS', value: profileData?.personalInfo?.filing_status || member?.file_status_name || member?.filestatus_name },
                  { label: 'FILING TYPE', value: profileData?.personalInfo?.filing_type || member?.filing_type || member?.file_type || '—' },
                  { label: 'DATE OF MARRIAGE', value: profileData?.personalInfo?.date_of_marriage ? formatDate(profileData.personalInfo.date_of_marriage) : (profileData?.personalInfo?.date_of_marriage || '—') },
                  { label: 'FIRST ENTRY DATE INTO USA', value: profileData?.personalInfo?.first_entry_date_into_usa ? formatDate(profileData.personalInfo.first_entry_date_into_usa) : '—' },
                  { label: 'REGISTRATION DATE', value: member?.date_created ? formatDate(member.date_created) : (member?.latestUpload ? formatDate(member.latestUpload) : '—') },
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
                  const otpTypeParam = row.isContact ? 'contact' : 'email';
                  return (
                    <tr key={i}>
                      <td style={{ width: '30%', fontWeight: '600', color: '#555', padding: '10px 10px', borderBottom: '1px solid #eee' }}>{row.label}</td>
                      <td style={{ padding: '10px 10px', borderBottom: '1px solid #eee' }}>
                        {isMasked ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span>{displayValue}</span>
                            <button
                              type="button"
                              className="email-toggle-eye-btn"
                              onClick={() => handleFieldClick(fieldKey, row.label, true, memberId, otpTypeParam)}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#0076a3', display: 'flex', alignItems: 'center' }}
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
                    ['SSN / ITIN', profileData.spouseInfo.ssn_itin || profileData.spouseInfo.ssn_tin],
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
                <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#94a3b8' }}>Member stage: <strong>{currentFileStatusName}</strong></p>
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
                      <td style={{ padding: '10px 10px', borderBottom: '1px solid #eee' }}>{profileData.bankDetails.account_holder_name || profileData.bankDetails.account_holder || '—'}</td></tr>
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
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={{ padding: '36px 20px', textAlign: 'center', color: '#64748b', background: '#f8fafc', borderRadius: '8px', border: '1px dashed #cbd5e1' }}>
                <div style={{ background: '#f1f5f9', width: '48px', height: '48px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}><Landmark size={24} color="#94a3b8" /></div>
                <p style={{ margin: 0, fontWeight: '600', fontSize: '14px', color: '#334155' }}>No bank account details submitted yet</p>
                <p style={{ margin: '6px 0 16px', fontSize: '12px', color: '#64748b' }}>Bank account information is required for direct deposit refund or tax settlements.</p>
                <button onClick={() => setBankModalOpen(true)} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 18px', borderRadius: '6px', background: '#0076a3', border: 'none', color: '#fff', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
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
              const addrs = Array.isArray(profileData?.personalInfo?.addresses) && profileData.personalInfo.addresses.length > 0
                ? profileData.personalInfo.addresses
                : (Array.isArray(profileData?.address) ? profileData.address : []);
              return addrs.length > 0 ? (
                <div className="table-responsive">
                  <table className="corporate-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                    <thead><tr><th>S.NO</th><th>PERSON</th><th>STATE</th><th>TAX YEAR</th><th>ADDRESS FROM</th><th>ADDRESS TO</th><th>CREATED AT</th></tr></thead>
                    <tbody>
                      {addrs.map((addr, i) => (
                        <tr key={addr._id || i}>
                          <td>{i + 1}</td>
                          <td style={{ fontWeight: '600' }}>{addr.person || 'Taxpayer'}</td>
                          <td>{addr.state?.name || addr.state || '—'}</td>
                          <td>{addr.year?.name || addr.year || '—'}</td>
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
                  <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#94a3b8' }}>
                    Mailing: {profileData?.personalInfo?.mailing_address || '—'} {profileData?.personalInfo?.city || ''} {profileData?.personalInfo?.state || ''} {profileData?.personalInfo?.zipcode || ''}
                  </p>
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
              const allDocs = profileData?.downloadDocuments || profileData?.documents || [];
              const memberDocs = allDocs.filter(doc => !(doc.isAdminUploaded || doc.uploaded_by === 'Admin' || doc.source === 'Admin'));
              const listToRender = memberDocs.length > 0 ? memberDocs : allDocs;
              return listToRender.length > 0 ? (
                <div className="table-responsive">
                  <table className="corporate-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                    <thead><tr><th>S.NO</th><th>DOCUMENT NAME</th><th>CATEGORY</th><th>FILE SIZE</th><th>UPLOADED DATE</th><th>ACTION</th></tr></thead>
                    <tbody>
                      {listToRender.map((doc, i) => (
                        <tr key={doc._id || i}>
                          <td>{i + 1}</td>
                          <td style={{ fontWeight: '600' }}>{doc.document_name || doc.original_name || doc.file_name || 'Document'}</td>
                          <td><span style={{ background: '#e0f2fe', color: '#0369a1', border: '1px solid #bae6fd', padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '600' }}>{typeof doc.document_type === 'string' ? doc.document_type : (doc.document_type?.name || 'Tax Document')}</span></td>
                          <td style={{ fontSize: '12px', color: '#64748b' }}>{doc.file_size ? `${(doc.file_size / 1024).toFixed(1)} KB` : '—'}</td>
                          <td style={{ fontSize: '12px', color: '#64748b' }}>{doc.createdAt ? formatDate(doc.createdAt) : '—'}</td>
                          <td style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                            <a href={doc.file_path ? (doc.file_path.startsWith('http') ? doc.file_path : `${URLS.ImageUrl}${doc.file_path}`) : '#'} target="_blank" rel="noopener noreferrer" style={{ padding: '5px 10px', fontSize: '12px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#0076a3', color: '#fff', borderRadius: '4px' }}>
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
            {(() => {
              const interviews = Array.isArray(profileData?.interviews) ? profileData.interviews : (profileData?.interview && Object.keys(profileData.interview).length > 0 ? [profileData.interview] : []);
              return interviews.length > 0 ? (
                <div className="table-responsive">
                  <table className="corporate-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                    <thead>
                      <tr>
                        <th>S.NO</th>
                        <th>CONSULTATION DATE</th>
                        <th>TIME SLOT</th>
                        <th>STATUS</th>
                        <th>BOOKED ON</th>
                      </tr>
                    </thead>
                    <tbody>
                      {interviews.map((item, idx) => (
                        <tr key={item._id || idx}>
                          <td>{idx + 1}</td>
                          <td style={{ fontWeight: '600' }}>
                            {item.consultation_date ? formatDate(item.consultation_date) : '—'}
                          </td>
                          <td>{typeof item.time_slot === 'string' ? item.time_slot : (item.time_slot?.slot || '—')}</td>
                          <td>
                            <span style={{ background: '#dcfce7', color: '#15803d', border: '1px solid #bbf7d0', padding: '4px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' }}>
                              {item.status || 'Scheduled'}
                            </span>
                          </td>
                          <td style={{ fontSize: '12px', color: '#64748b' }}>
                            {item.createdAt ? formatDate(item.createdAt) : '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div style={{ padding: '24px', textAlign: 'center', color: '#64748b', background: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                  <p style={{ margin: 0, fontWeight: '600', fontSize: '13px' }}>No interview scheduled yet</p>
                  <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#94a3b8' }}>Consultation details will appear once scheduled by the member or admin.</p>
                </div>
              );
            })()}
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
                    {paymentLoading ? <Loader2 size={16} className="animate-spin" /> : <CreditCard size={16} />}
                    {paymentLoading ? 'Processing...' : 'Pay Now'}
                  </button>
                  <button onClick={() => { setPayAmount(''); setPaymentError(''); }} disabled={paymentLoading} style={{ padding: '9px 20px', background: '#e2e8f0', color: '#475569', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>Reset</button>
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
                      <tr key={p._id || idx}>
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
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px' }}>
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
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '5px' }}>Tax Year</label>
                  <select value={uploadYearId} onChange={e => setUploadYearId(e.target.value)} style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px', background: '#fff' }}>
                    <option value="">Select Tax Year</option>
                    {(recentFiveYears.length > 0 ? recentFiveYears : []).map(y => (
                      <option key={y._id || y.name} value={y._id || y.name}>Tax Year {y.name || y.year_name || y}</option>
                    ))}
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
                                title="Delete Document"
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
                  <input type="text" className="search-input-box" style={{ width: '100%', background: '#f8fafc', color: '#64748b', cursor: 'not-allowed', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px' }} value={member?.file_no || profileData?.personalInfo?.file_no || '—'} disabled />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#334155' }}>Filing Type <span style={{ color: '#dc2626' }}>*</span></label>
                  <select className="search-input-box" style={{ width: '100%', background: '#fff', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px' }} value={fileTypeInput} onChange={e => setFileTypeInput(e.target.value)}>
                    <option value="E-Filing">E-Filing</option>
                    <option value="Paper-Filing">Paper Filing</option>
                  </select>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#334155' }}>File Status <span style={{ color: '#dc2626' }}>*</span></label>
                  <select
                    className="search-input-box"
                    style={{ width: '100%', background: '#fff', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px' }}
                    value={statusInput}
                    onChange={e => setStatusInput(e.target.value)}
                  >
                    {WORKFLOW_STATUSES.map((s, i) => (
                      <option key={i} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '18px' }}>
                <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#334155' }}>Comments</label>
                <textarea rows="4" className="search-input-box" style={{ width: '100%', height: 'auto', fontFamily: 'inherit', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px' }} placeholder="Enter administrative workflow update comments (optional)..." value={commentsInput} onChange={e => setCommentsInput(e.target.value)} />
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" style={{ padding: '8px 20px', fontWeight: '600', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer', background: '#fff', color: '#475569' }} onClick={() => { setCommentsInput(''); setFileInfoErrorMsg(''); }}>Reset</button>
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
                <button onClick={() => memberId && fetchFileInfoHistory(memberId)} disabled={loadingFileInfo} style={{ border: '1px solid #cbd5e1', background: '#fff', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: '500', color: '#475569', cursor: loadingFileInfo ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '6px', opacity: loadingFileInfo ? 0.5 : 1 }}>
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
                            <td style={{ fontWeight: '500' }}>{c.file_type || member?.filing_type || member?.file_type || '—'}</td>
                            <td>
                              <span style={{ background: c.status?.includes('EFA') || c.status_name?.includes('Complete') ? '#ecfdf5' : '#f0f9ff', color: c.status?.includes('EFA') || c.status_name?.includes('Complete') ? '#047857' : '#0369a1', border: '1px solid #bae6fd', padding: '3px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: '600', display: 'inline-block' }}>
                                {c.status_name || CODE_TO_STATUS_NAME[c.status] || c.status || '—'}
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
        memberName={displayName}
      />

      {/* Comment Popup Modal */}
      {commentPopup && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: 'rgba(15,23,42,0.65)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px'
        }}>
          <div style={{
            background: '#ffffff', borderRadius: '14px', maxWidth: '600px', width: '100%',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', overflow: 'hidden'
          }}>
            {/* Header */}
            <div style={{
              background: 'linear-gradient(135deg, #0076a3, #005f8a)',
              padding: '14px 18px',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ background: 'rgba(255,255,255,0.2)', borderRadius: '6px', padding: '5px', display: 'flex' }}>
                  <MessageSquare size={16} color="#fff" />
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
    </div>
  );
}
