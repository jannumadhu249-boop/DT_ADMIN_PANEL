import React, { useState, useRef } from 'react';
import { 
  User, 
  Lock, 
  Eye, 
  EyeOff, 
  ShieldCheck 
} from 'lucide-react';
import logoLg from '../assets/logo-lg.png';
import ForgotPassword from './ForgotPassword';
// import Register from './Register';
import AuthAlert from '../pages/AuthAlert';
import { URLS } from '../url';
import { resolveStaffPermissions, decodeJwt } from '../utils/permissions';

export default function Login({ onLoginSuccess }) {
  // Tab states: 'login', 'forgot', or 'register'
  const [activeTab, setActiveTab] = useState('login');

  // Login form states
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Login OTP Modal states
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [loginOtpDigits, setLoginOtpDigits] = useState(['', '', '', '', '', '']);
  const loginOtpRefs = useRef([]);

  // Alert/Message states
  const [errorMsg, setErrorMsg] = useState('');
  const [infoMsg, setInfoMsg] = useState('');
  const [otpError, setOtpError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);

  // OTP focus helpers
  const handleDigitChange = (idx, value) => {
    const val = value.replace(/\D/g, '').slice(-1);
    const next = [...loginOtpDigits];
    next[idx] = val;
    setLoginOtpDigits(next);
    if (val && idx < 5) {
      loginOtpRefs.current[idx + 1]?.focus();
    }
  };

  const handleDigitKeyDown = (idx, e) => {
    if (e.key === 'Backspace' && !loginOtpDigits[idx] && idx > 0) {
      loginOtpRefs.current[idx - 1]?.focus();
    }
  };

  const handleDigitPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const next = [...loginOtpDigits];
    pastedData.split('').forEach((char, i) => {
      next[i] = char;
    });
    setLoginOtpDigits(next);
    loginOtpRefs.current[Math.min(pastedData.length, 5)]?.focus();
  };

  // Submit Login credentials -> Show OTP Modal
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setInfoMsg('');

    if (!username || !password) {
      setErrorMsg('Username/Email and Password are required.');
      return;
    }

    setIsLoggingIn(true);
    try {
      const res = await fetch(URLS.Login, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: username, adm_pswd: password })
      });
      
      let data = {};
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await res.json();
      } else {
        const text = await res.text();
        setErrorMsg(text || `Login request failed with status: ${res.status}`);
        return;
      }
      
      if (!res.ok || data.success === false) {
        setErrorMsg(data.message || 'Login failed. Please verify credentials.');
        return;
      }

      setLoginOtpDigits(['', '', '', '', '', '']);
      setShowOtpModal(true);
      setOtpError('');
    } catch (err) {
      setErrorMsg('Unable to connect to login server. Please try again.');
      console.error(err);
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Verify Login OTP
  const handleVerifyLoginOtp = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setOtpError('');
    const enteredCode = loginOtpDigits.join('');

    if (enteredCode.length < 6) {
      setErrorMsg('Please enter the complete 6-digit code.');
      return;
    }

    setIsVerifyingOtp(true);
    try {
      const res = await fetch(URLS.LoginVerification, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: username, otp: enteredCode })
      });

      let data = {};
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await res.json();
      } else {
        const text = await res.text();
        setErrorMsg(text || `Verification request failed with status: ${res.status}`);
        return;
      }

      if (!res.ok || data.success === false) {
        setOtpError(data.message || 'Incorrect verification code. Please try again.');
        return;
      }

      // Save token for authenticated requests
      const token = data.token || data.data?.token;
      if (token) {
        sessionStorage.setItem('adminToken', token);
      }

      // ── RBAC: decode JWT & extract admin stage ──
      const payload = token ? decodeJwt(token) : null;
      const rawStage = (
        data.data?.admin_stage || 
        data.data?.adminStage || 
        data.admin_stage || 
        data.data?.admin?.admin_stage || 
        payload?.admin_stage || 
        payload?.adminStage || 
        payload?.stage || 
        'staff'
      ).toLowerCase();

      const userEmail = (payload?.email || data.data?.email || data.email || username || '').toLowerCase();
      const isSuperAdminUser = (
        rawStage === 'super' || 
        rawStage === 'superadmin' || 
        userEmail === 'madhumoironix@gmail.com' ||
        userEmail === 'venkatbandarun@gmail.com'
      );

      const adminStage = isSuperAdminUser ? 'super' : (rawStage === 'admin' ? 'admin' : 'staff');
      sessionStorage.setItem('adminStage', adminStage);

      // Store basic admin info
      const adminInfo = {
        id: payload?.admin_id || payload?.adminId || payload?.id || '',
        email: userEmail,
        stage: adminStage,
      };
      sessionStorage.setItem('adminInfo', JSON.stringify(adminInfo));

      // Resolve & store permissions if not super admin
      let resolvedPerms = [];
      if (adminStage !== 'super') {
        resolvedPerms = (await resolveStaffPermissions(token, URLS.Base, data, payload)) || [];
      } else {
        sessionStorage.removeItem('adminPermissions');
      }

      setShowOtpModal(false);
      setInfoMsg('Authentication verified. Redirecting to dashboard...');
      setTimeout(() => {
        onLoginSuccess(resolvedPerms);
      }, 800);
    } catch (err) {
      setOtpError('Unable to connect to verification server. Please try again.');
      console.error(err);
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const handleForgotPasswordSuccess = (msg) => {
    setInfoMsg(msg);
    setActiveTab('login');
  };

  return (
    <div className="login-wrapper" style={{ backgroundImage: 'url("../src/assets/map-background.png")' }}>
      {/* Upper Logo Banner (Logo placement unchanged) */}
      <div className="login-logo-container">
        <div className="login-logo-box">
          <img
            src={logoLg}
            alt="Dollar Tax Filer"
            style={{
              height: '60px',
              width: 'auto',
              objectFit: 'contain',
            }}
          />
        </div>
        <h2 className="login-welcome-text">Welcome to Admin Login</h2>
      </div>

      {/* Main Login Card */}
      <div className="login-card" style={{ padding: '32px' }}>
        {errorMsg && (
          <AuthAlert
            type={errorMsg.includes('required') ? 'warning' : 'error'}
            title={errorMsg.includes('required') ? 'Missing information' : 'Login failed'}
            message={errorMsg}
          />
        )}

        {infoMsg && (
          <AuthAlert type="success" title="Authenticated" message={infoMsg} centered />
        )}

        {/* ── LOGIN TAB ── */}
        {activeTab === 'login' && (
          <form onSubmit={handleLoginSubmit} className="login-form-body">
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', margin: '0 0 4px 0', color: '#1e293b' }}>
              Sign In
            </h3>
            <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 16px 0' }}>
              Enter username and password to proceed
            </p>

            {/* Username/Email Input */}
            <div className="login-form-group">
              <label className="login-label">Email</label>
              <div className="auth-field-wrap">
                <span className="auth-icon"><User size={16} /></span>
                <input 
                  type="text" 
                  className="login-input-adv" 
                  placeholder="Ente Email"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={isLoggingIn}
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="login-form-group">
              <label className="login-label">Password</label>
              <div className="auth-field-wrap">
                <span className="auth-icon"><Lock size={16} /></span>
                <input 
                  type={showPassword ? 'text' : 'password'}
                  className="login-input-adv" 
                  placeholder="Enter Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ paddingRight: '44px' }}
                  disabled={isLoggingIn}
                  required
                />
                <button
                  type="button"
                  className="eye-btn"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Forgot Password Right Aligned Link Above Login Button */}
            <div className="forgot-password-container" style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
              {/* <button
                type="button"
                className="forgot-password-link-btn"
                onClick={() => {
                  setActiveTab('register');
                  setErrorMsg('');
                  setInfoMsg('');
                }}
              >
                Create Account
              </button> */}
              <button
                type="button"
                className="forgot-password-link-btn"
                onClick={() => {
                  setActiveTab('forgot');
                  setErrorMsg('');
                  setInfoMsg('');
                }}
              >
                Forgot Password?
              </button>
            </div>

            {/* Login Submit Button */}
            <button type="submit" className="otp-btn-verify" style={{ marginTop: '4px' }} disabled={isLoggingIn}>
              {isLoggingIn ? (
                <>
                  <span className="auth-btn-spinner" aria-hidden="true" />
                  Signing in...
                </>
              ) : (
                'Login'
              )}
            </button>
          </form>
        )}

        {/* ── FORGOT PASSWORD VIEW (Delegated to external component) ── */}
        {activeTab === 'forgot' && (
          <ForgotPassword 
            onCancel={() => {
              setActiveTab('login');
              setErrorMsg('');
              setInfoMsg('');
            }}
            onSuccess={handleForgotPasswordSuccess}
          />
        )}

        {activeTab === 'register' && (
          <Register
            onCancel={() => {
              setActiveTab('login');
              setErrorMsg('');
              setInfoMsg('');
            }}
            onSuccess={(msg) => {
              setInfoMsg(msg);
              setActiveTab('login');
            }}
          />
        )}
      </div>

      {/* ── OTP VERIFICATION DIALOG (Modal overlay on Login click) ── */}
      {showOtpModal && (
        <div className="otp-modal-overlay">
          <div className="otp-modal-card">
            <div className="otp-icon-wrap">
              <ShieldCheck size={32} />
            </div>

            <h3 className="otp-modal-title">Enter Verification Code</h3>
            <p className="otp-modal-desc">
              A 6-digit verification code has been sent to your email. Please enter it below to sign in.
            </p>

            <form onSubmit={handleVerifyLoginOtp}>
            {/* OTP error displayed here */}
              {otpError && (
                <AuthAlert
                  type="error"
                  title="Verification failed"
                  message={otpError}
                  centered
                />
              )}
              <div className="otp-digit-row" onPaste={handleDigitPaste}>
                {loginOtpDigits.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => (loginOtpRefs.current[i] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    className={`otp-digit-box ${digit ? 'filled' : ''}`}
                    value={digit}
                    onChange={(e) => handleDigitChange(i, e.target.value)}
                    onKeyDown={(e) => handleDigitKeyDown(i, e)}
                    required
                  />
                ))}
              </div>

              <div className="otp-modal-actions">
                <button type="submit" className="otp-btn-verify" disabled={isVerifyingOtp}>
                  {isVerifyingOtp ? (
                    <>
                      <span className="auth-btn-spinner" aria-hidden="true" />
                      Verifying...
                    </>
                  ) : (
                    'Verify & Sign In'
                  )}
                </button>
                <button type="button" className="otp-btn-verify">
                  Resend Otp
                </button>
                <button 
                  type="button" 
                  className="otp-btn-cancel" 
                  onClick={() => {
                    setShowOtpModal(false);
                    setOtpError('');
                    setErrorMsg('');
                  }}
                >
                  Go Back
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
