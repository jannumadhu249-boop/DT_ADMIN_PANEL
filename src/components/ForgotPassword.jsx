import React, { useState, useRef, useEffect } from 'react';
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowLeft, 
  Send,
  Clock
} from 'lucide-react';
import '../styles/ForgotPassword.css';
import AuthAlert from '../pages/AuthAlert';
import { URLS } from '../url';

const EMAIL_NOT_FOUND_MESSAGE = "We couldn't find an account associated with this email address";
const OTP_VALIDITY_SECONDS = 300;
const RESEND_COOLDOWN_SECONDS = 60;

const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

const getForgotEmailErrorMessage = (data, status) => {
  const message = (data?.message || '').toLowerCase();
  if (
    status === 404 ||
    message.includes('not found') ||
    message.includes('no admin') ||
    message.includes('no account') ||
    message.includes('does not exist') ||
    message.includes("doesn't exist")
  ) {
    return EMAIL_NOT_FOUND_MESSAGE;
  }
  return data?.message || 'Failed to generate password recovery OTP.';
};

const getAlertMeta = (message) => {
  if (message === EMAIL_NOT_FOUND_MESSAGE) {
    return { type: 'warning', title: 'Account not found' };
  }
  if (message.includes('complete 6-digit') || message.includes('required') || message.includes('match') || message.includes('at least')) {
    return { type: 'warning', title: 'Check your input' };
  }
  if (message.includes('expired')) {
    return { type: 'warning', title: 'Code expired' };
  }
  if (message.includes('Incorrect verification')) {
    return { type: 'error', title: 'Invalid code' };
  }
  if (message.includes('Unable to connect')) {
    return { type: 'error', title: 'Connection error' };
  }
  return { type: 'error', title: 'Unable to proceed' };
};

export default function ForgotPassword({ onCancel, onSuccess }) {
  const [forgotStep, setForgotStep] = useState('email');
  const [forgotEmail, setForgotEmail] = useState('');
  const [userId, setUserId] = useState('');
  const [forgotOtpDigits, setForgotOtpDigits] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const forgotOtpRefs = useRef([]);

  const [errorMsg, setErrorMsg] = useState('');
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [isResendingOtp, setIsResendingOtp] = useState(false);
  const [otpTimeLeft, setOtpTimeLeft] = useState(OTP_VALIDITY_SECONDS);
  const [resendCooldown, setResendCooldown] = useState(RESEND_COOLDOWN_SECONDS);
  const [otpSessionKey, setOtpSessionKey] = useState(0);

  const isOtpExpired = forgotStep === 'otp' && otpTimeLeft === 0;
  const isFormBusy = isSendingOtp || isVerifyingOtp || isUpdatingPassword || isResendingOtp;

  useEffect(() => {
    if (forgotStep !== 'otp') return undefined;

    setOtpTimeLeft(OTP_VALIDITY_SECONDS);
    setResendCooldown(RESEND_COOLDOWN_SECONDS);

    const interval = setInterval(() => {
      setOtpTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(interval);
  }, [forgotStep, otpSessionKey]);

  useEffect(() => {
    if (isOtpExpired && !errorMsg) {
      setErrorMsg('Verification code has expired. Please request a new one.');
    }
  }, [isOtpExpired, errorMsg]);

  const resetOtpTimer = () => {
    setOtpSessionKey((prev) => prev + 1);
  };

  const handleDigitChange = (idx, value) => {
    const val = value.replace(/\D/g, '').slice(-1);
    const next = [...forgotOtpDigits];
    next[idx] = val;
    setForgotOtpDigits(next);
    if (val && idx < 5) {
      forgotOtpRefs.current[idx + 1]?.focus();
    }
  };

  const handleDigitKeyDown = (idx, e) => {
    if (e.key === 'Backspace' && !forgotOtpDigits[idx] && idx > 0) {
      forgotOtpRefs.current[idx - 1]?.focus();
    }
  };

  const handleDigitPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const next = [...forgotOtpDigits];
    pastedData.split('').forEach((char, i) => {
      next[i] = char;
    });
    setForgotOtpDigits(next);
    forgotOtpRefs.current[Math.min(pastedData.length, 5)]?.focus();
  };

  const requestForgotOtp = async ({ isResend = false } = {}) => {
    const res = await fetch(URLS.GenerateOtp, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: forgotEmail })
    });

    let data = {};
    const contentType = res.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await res.json();
    } else {
      const text = await res.text();
      throw new Error(text || `Request failed with status: ${res.status}`);
    }

    if (!res.ok || data.success === false) {
      throw new Error(getForgotEmailErrorMessage(data, res.status));
    }

    const uId = data.userId || data.data?.userId || data.data?._id;
    if (!uId) {
      throw new Error(EMAIL_NOT_FOUND_MESSAGE);
    }

    setUserId(uId);
    setForgotOtpDigits(['', '', '', '', '', '']);
    setForgotStep('otp');
    resetOtpTimer();

    if (isResend) {
      setErrorMsg('');
      forgotOtpRefs.current[0]?.focus();
    }
  };

  const handleSendForgotOtp = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!forgotEmail) {
      setErrorMsg('Registered Email is required.');
      return;
    }

    setIsSendingOtp(true);
    try {
      await requestForgotOtp();
    } catch (err) {
      setErrorMsg(err.message || 'Unable to connect to recovery server. Please try again.');
      console.error(err);
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleResendForgotOtp = async () => {
    if (resendCooldown > 0 || isResendingOtp || isFormBusy) return;

    setErrorMsg('');
    setIsResendingOtp(true);
    try {
      await requestForgotOtp({ isResend: true });
    } catch (err) {
      setErrorMsg(err.message || 'Unable to resend verification code. Please try again.');
      console.error(err);
    } finally {
      setIsResendingOtp(false);
    }
  };

  const handleVerifyForgotOtp = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    const enteredCode = forgotOtpDigits.join('');

    if (isOtpExpired) {
      setErrorMsg('Verification code has expired. Please request a new one.');
      return;
    }

    if (enteredCode.length < 6) {
      setErrorMsg('Please enter the complete 6-digit code.');
      return;
    }

    setIsVerifyingOtp(true);
    try {
      const res = await fetch(URLS.VerifyOtp, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: userId, otp: enteredCode })
      });
      const data = await res.json();

      if (!res.ok || data.success === false) {
        setErrorMsg(data.message || 'Incorrect verification code. Please try again.');
        return;
      }

      setForgotStep('reset');
      setErrorMsg('');
    } catch (err) {
      setErrorMsg('Unable to connect to verification server. Please try again.');
      console.error(err);
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const handleUpdatePasswordSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (newPassword.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    setIsUpdatingPassword(true);
    try {
      const res = await fetch(URLS.ResetPassword, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: userId, newPassword: newPassword, confirmPassword: confirmPassword })
      });
      const data = await res.json();

      if (!res.ok || data.success === false) {
        setErrorMsg(data.message || 'Failed to update administrative password.');
        return;
      }

      onSuccess('Password updated successfully! You can now log in.');
    } catch (err) {
      setErrorMsg('Unable to connect to password server. Please try again.');
      console.error(err);
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleCancelForgot = () => {
    setForgotStep('email');
    setForgotEmail('');
    setUserId('');
    setNewPassword('');
    setConfirmPassword('');
    setForgotOtpDigits(['', '', '', '', '', '']);
    setErrorMsg('');
    setOtpTimeLeft(OTP_VALIDITY_SECONDS);
    setResendCooldown(RESEND_COOLDOWN_SECONDS);
    onCancel();
  };

  const alertMeta = errorMsg ? getAlertMeta(errorMsg) : null;

  return (
    <div className="login-form-body">
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
        <button 
          type="button" 
          onClick={handleCancelForgot}
          disabled={isFormBusy}
          style={{ background: 'none', border: 'none', color: '#64748b', cursor: isFormBusy ? 'not-allowed' : 'pointer', padding: '4px', opacity: isFormBusy ? 0.5 : 1 }}
        >
          <ArrowLeft size={18} />
        </button>
        <h3 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0, color: '#1e293b' }}>
          Reset Password
        </h3>
      </div>

      {errorMsg && (
        <AuthAlert
          type={alertMeta.type}
          title={alertMeta.title}
          message={errorMsg}
        />
      )}

      <div className="forgot-step-indicator">
        <div className={`forgot-step-dot ${forgotStep === 'email' ? 'active' : ''} ${forgotStep !== 'email' ? 'done' : ''}`}>
          {forgotStep !== 'email' ? '✓' : '1'}
        </div>
        <div style={{ width: '24px', height: '2px', backgroundColor: forgotStep !== 'email' ? '#22c55e' : '#e2e8f0', alignSelf: 'center' }} />
        <div className={`forgot-step-dot ${forgotStep === 'otp' ? 'active' : ''} ${forgotStep === 'reset' ? 'done' : ''}`}>
          {forgotStep === 'reset' ? '✓' : '2'}
        </div>
        <div style={{ width: '24px', height: '2px', backgroundColor: forgotStep === 'reset' ? '#22c55e' : '#e2e8f0', alignSelf: 'center' }} />
        <div className={`forgot-step-dot ${forgotStep === 'reset' ? 'active' : ''}`}>
          3
        </div>
      </div>

      {forgotStep === 'email' && (
        <form onSubmit={handleSendForgotOtp} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 4px 0', lineHeight: 1.4 }}>
            Enter your registered admin email address and we'll send you a 6-digit OTP code to verify your identity.
          </p>
          <div className="login-form-group">
            <label className="login-label">Email Address</label>
            <div className="forgot-field-wrap">
              <span className="forgot-icon"><Mail size={16} /></span>
              <input 
                type="email" 
                className="forgot-input-adv" 
                placeholder="admin@example.com"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                disabled={isSendingOtp}
                required
              />
            </div>
          </div>
          <button type="submit" className="forgot-btn-primary" style={{ gap: '8px' }} disabled={isSendingOtp}>
            {isSendingOtp ? (
              <>
                <span className="auth-btn-spinner" aria-hidden="true" />
                Sending OTP...
              </>
            ) : (
              <>
                <Send size={15} /> Send OTP code
              </>
            )}
          </button>
        </form>
      )}

      {forgotStep === 'otp' && (
        <form onSubmit={handleVerifyForgotOtp} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 4px 0', lineHeight: 1.4 }}>
            Enter the verification code sent to <strong style={{ color: '#0076a3' }}>{forgotEmail}</strong>
          </p>

          <div className="forgot-otp-timer-wrap">
            <div className={`forgot-otp-timer${isOtpExpired ? ' expired' : ''}`}>
              <Clock size={14} />
              {isOtpExpired ? (
                <span>Code expired — request a new one below</span>
              ) : (
                <>
                  <span>Code expires in</span>
                  <strong>{formatTime(otpTimeLeft)}</strong>
                </>
              )}
            </div>
            <button
              type="button"
              className="forgot-resend-btn"
              onClick={handleResendForgotOtp}
              disabled={resendCooldown > 0 || isResendingOtp || isFormBusy}
            >
              {isResendingOtp ? (
                'Sending new code...'
              ) : resendCooldown > 0 ? (
                `Resend code in ${resendCooldown}s`
              ) : (
                'Resend verification code'
              )}
            </button>
          </div>

          <div className="login-form-group">
            <label className="login-label" style={{ textAlign: 'center', marginBottom: '8px' }}>6-Digit Verification Code</label>
            <div className="forgot-otp-digit-row" onPaste={handleDigitPaste}>
              {forgotOtpDigits.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => (forgotOtpRefs.current[i] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  className={`forgot-otp-digit-box ${digit ? 'filled' : ''}`}
                  value={digit}
                  onChange={(e) => handleDigitChange(i, e.target.value)}
                  onKeyDown={(e) => handleDigitKeyDown(i, e)}
                  disabled={isOtpExpired || isFormBusy}
                  required
                />
              ))}
            </div>
          </div>

          <button type="submit" className="forgot-btn-primary" disabled={isOtpExpired || isVerifyingOtp || isFormBusy}>
            {isVerifyingOtp ? (
              <>
                <span className="auth-btn-spinner" aria-hidden="true" />
                Verifying...
              </>
            ) : (
              'Verify OTP'
            )}
          </button>
        </form>
      )}

      {forgotStep === 'reset' && (
        <form onSubmit={handleUpdatePasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 4px 0', lineHeight: 1.4 }}>
            Configure your new login credentials
          </p>

          <div className="login-form-group">
            <label className="login-label">New Password</label>
            <div className="forgot-field-wrap">
              <span className="forgot-icon"><Lock size={16} /></span>
              <input 
                type={showNewPassword ? 'text' : 'password'}
                className="forgot-input-adv" 
                placeholder="Minimum 6 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                style={{ paddingRight: '44px' }}
                disabled={isUpdatingPassword}
                required
              />
              <button
                type="button"
                className="eye-btn"
                onClick={() => setShowNewPassword(!showNewPassword)}
                disabled={isUpdatingPassword}
              >
                {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="login-form-group">
            <label className="login-label">Confirm New Password</label>
            <div className="forgot-field-wrap">
              <span className="forgot-icon"><Lock size={16} /></span>
              <input 
                type={showConfirmPassword ? 'text' : 'password'}
                className="forgot-input-adv" 
                placeholder="Repeat new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                style={{ paddingRight: '44px' }}
                disabled={isUpdatingPassword}
                required
              />
              <button
                type="button"
                className="eye-btn"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={isUpdatingPassword}
              >
                {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button type="submit" className="forgot-btn-primary" disabled={isUpdatingPassword}>
            {isUpdatingPassword ? (
              <>
                <span className="auth-btn-spinner" aria-hidden="true" />
                Updating password...
              </>
            ) : (
              'Update Password'
            )}
          </button>
        </form>
      )}
    </div>
  );
}
