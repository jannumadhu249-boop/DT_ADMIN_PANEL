import React, { useState, useEffect } from 'react';
import { ShieldCheck, Clock, RefreshCw, X, Loader2, KeyRound } from 'lucide-react';

export default function OtpVerificationModal({ 
  isOpen, 
  onClose, 
  onVerifySuccess, 
  title = "Verification Required", 
  targetField = "Email Address" 
}) {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // 30-Second Timer Countdown Effect
  useEffect(() => {
    if (!isOpen) return;

    // Reset states on modal open
    setOtp(['', '', '', '', '', '']);
    setTimeLeft(30);
    setErrorMsg('');
    setSuccessMsg('Verification OTP code sent to your registered contact.');

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen]);

  if (!isOpen) return null;

  // Format time (mm:ss)
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleOtpChange = (element, index) => {
    if (isNaN(element.value)) return false;

    const newOtp = [...otp];
    newOtp[index] = element.value;
    setOtp(newOtp);

    // Auto focus next input box
    if (element.value !== '' && element.nextSibling) {
      element.nextSibling.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !otp[index] && e.target.previousSibling) {
      e.target.previousSibling.focus();
    }
  };

  const handleResendOtp = async () => {
    if (timeLeft > 0 || isResending) return;
    setIsResending(true);
    setErrorMsg('');
    setSuccessMsg('');

    // Simulate API delay with loader
    setTimeout(() => {
      setIsResending(false);
      setTimeLeft(30);
      setOtp(['', '', '', '', '', '']);
      setSuccessMsg('A new OTP has been dispatched to your email.');
    }, 1200);
  };

  const handleVerify = async (e) => {
    if (e) e.preventDefault();
    const enteredCode = otp.join('');
    if (enteredCode.length < 6) {
      setErrorMsg('Please enter complete 6-digit OTP code.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    // Simulate verification delay
    setTimeout(() => {
      setIsLoading(false);
      // Pass verification
      if (onVerifySuccess) {
        onVerifySuccess(enteredCode);
      }
      onClose();
    }, 1000);
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modalCard}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.headerTitleGroup}>
            <div style={styles.iconBadge}>
              <ShieldCheck size={22} color="#0076a3" />
            </div>
            <div>
              <h3 style={styles.title}>{title}</h3>
              <p style={styles.subtitle}>Unmasking sensitive field: <strong>{targetField}</strong></p>
            </div>
          </div>
          <button style={styles.closeBtn} onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div style={styles.body}>
          {successMsg && (
            <div style={styles.alertSuccess}>
              <KeyRound size={16} style={{ flexShrink: 0 }} />
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div style={styles.alertError}>
              <span>⚠️ {errorMsg}</span>
            </div>
          )}

          <p style={styles.instructionText}>
            Enter the 6-digit verification security code below to proceed.
          </p>

          {/* 6-Digit Code Inputs */}
          <div style={styles.otpInputContainer}>
            {otp.map((data, index) => (
              <input
                key={index}
                type="text"
                maxLength="1"
                value={data}
                disabled={isLoading}
                onChange={e => handleOtpChange(e.target, index)}
                onKeyDown={e => handleKeyDown(e, index)}
                onFocus={e => e.target.select()}
                style={{
                  ...styles.otpBox,
                  borderColor: data ? '#0076a3' : '#d1d5db',
                  boxShadow: data ? '0 0 0 3px rgba(0, 118, 163, 0.15)' : 'none'
                }}
              />
            ))}
          </div>

          {/* Countdown Timer & Resend Button */}
          <div style={styles.timerRow}>
            <div style={styles.timerBadge}>
              <Clock size={15} color={timeLeft === 0 ? '#dc2626' : '#2563eb'} />
              <span style={{ color: timeLeft === 0 ? '#dc2626' : '#1e293b', fontWeight: '600' }}>
                {timeLeft > 0 ? `Expires in ${formatTime(timeLeft)}` : 'OTP Expired'}
              </span>
            </div>

            <button
              type="button"
              onClick={handleResendOtp}
              disabled={timeLeft > 0 || isResending}
              style={{
                ...styles.resendBtn,
                opacity: timeLeft > 0 || isResending ? 0.5 : 1,
                cursor: timeLeft > 0 || isResending ? 'not-allowed' : 'pointer'
              }}
            >
              {isResending ? (
                <>
                  <Loader2 size={14} className="spin" style={styles.spinIcon} />
                  Sending...
                </>
              ) : (
                <>
                  <RefreshCw size={14} />
                  Resend OTP
                </>
              )}
            </button>
          </div>
        </div>

        {/* Footer Actions */}
        <div style={styles.footer}>
          <button style={styles.cancelBtn} onClick={onClose} disabled={isLoading}>
            Cancel
          </button>
          <button style={styles.submitBtn} onClick={handleVerify} disabled={isLoading || otp.join('').length < 6}>
            {isLoading ? (
              <>
                <Loader2 size={16} style={styles.spinIcon} />
                Verifying...
              </>
            ) : (
              'Verify & Unmask'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    padding: '16px'
  },
  modalCard: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    width: '100%',
    maxWidth: '440px',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    overflow: 'hidden',
    animation: 'fadeIn 0.2s ease-out'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 20px',
    borderBottom: '1px solid #f1f5f9',
    backgroundColor: '#f8fafc'
  },
  headerTitleGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  iconBadge: {
    width: '38px',
    height: '38px',
    borderRadius: '10px',
    backgroundColor: '#e0f2fe',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  title: {
    margin: 0,
    fontSize: '16px',
    fontWeight: '600',
    color: '#0f172a'
  },
  subtitle: {
    margin: 0,
    fontSize: '12px',
    color: '#64748b'
  },
  closeBtn: {
    border: 'none',
    background: 'none',
    cursor: 'pointer',
    color: '#94a3b8',
    padding: '4px',
    borderRadius: '6px'
  },
  body: {
    padding: '20px'
  },
  instructionText: {
    fontSize: '13px',
    color: '#475569',
    marginBottom: '16px',
    textAlign: 'center'
  },
  alertSuccess: {
    backgroundColor: '#ecfdf5',
    color: '#047857',
    padding: '10px 14px',
    borderRadius: '8px',
    fontSize: '12px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '14px',
    border: '1px solid #a7f3d0'
  },
  alertError: {
    backgroundColor: '#fef2f2',
    color: '#b91c1c',
    padding: '10px 14px',
    borderRadius: '8px',
    fontSize: '12px',
    marginBottom: '14px',
    border: '1px solid #fecaca'
  },
  otpInputContainer: {
    display: 'flex',
    justifyContent: 'center',
    gap: '8px',
    marginBottom: '20px'
  },
  otpBox: {
    width: '44px',
    height: '48px',
    fontSize: '20px',
    fontWeight: '700',
    textAlign: 'center',
    borderRadius: '8px',
    border: '1.5px solid #cbd5e1',
    outline: 'none',
    transition: 'all 0.15s ease'
  },
  timerRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: '10px 14px',
    borderRadius: '8px',
    border: '1px solid #e2e8f0'
  },
  timerBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '13px'
  },
  resendBtn: {
    border: 'none',
    background: 'none',
    color: '#0076a3',
    fontWeight: '600',
    fontSize: '12px',
    display: 'flex',
    alignItems: 'center',
    gap: '5px'
  },
  footer: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px',
    padding: '14px 20px',
    borderTop: '1px solid #f1f5f9',
    backgroundColor: '#ffffff'
  },
  cancelBtn: {
    padding: '8px 16px',
    borderRadius: '6px',
    border: '1px solid #cbd5e1',
    backgroundColor: '#ffffff',
    color: '#475569',
    fontSize: '13px',
    fontWeight: '500',
    cursor: 'pointer'
  },
  submitBtn: {
    padding: '8px 18px',
    borderRadius: '6px',
    border: 'none',
    backgroundColor: '#0076a3',
    color: '#ffffff',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  },
  spinIcon: {
    animation: 'spin 1s linear infinite'
  }
};
