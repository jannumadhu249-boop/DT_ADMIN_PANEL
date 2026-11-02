import { AlertCircle, CheckCircle2, Info, AlertTriangle } from 'lucide-react';

const ALERT_CONFIG = {
  error: { Icon: AlertCircle, defaultTitle: 'Something went wrong' },
  warning: { Icon: AlertTriangle, defaultTitle: 'Please note' },
  info: { Icon: Info, defaultTitle: 'Information' },
  success: { Icon: CheckCircle2, defaultTitle: 'Success' },
};

export default function AuthAlert({ type = 'error', message, title, centered = false }) {
  if (!message) return null;

  const { Icon, defaultTitle } = ALERT_CONFIG[type] || ALERT_CONFIG.error;

  return (
    <div
      className={`auth-alert auth-alert-${type}${centered ? ' auth-alert-centered' : ''}`}
      role="alert"
    >
      <div className="auth-alert-icon-wrap" aria-hidden="true">
        <Icon size={18} strokeWidth={2.25} />
      </div>
      <div className="auth-alert-body">
        <p className="auth-alert-title">{title || defaultTitle}</p>
        <p className="auth-alert-message">{message}</p>
      </div>
    </div>
  );
}
