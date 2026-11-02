import React, { useState } from 'react';
import { Send, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

export default function MNote() {
  const [emails, setEmails] = useState('');
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [message, setMessage] = useState(null);

  const handleSendEmails = async (e) => {
    e.preventDefault();
    if (!emails.trim()) {
      setMessage({ type: 'error', text: 'Please enter at least one email address in New E-mails field.' });
      return;
    }
    if (!subject.trim()) {
      setMessage({ type: 'error', text: 'Enter Mail Subject is required.' });
      return;
    }
    if (!content.trim()) {
      setMessage({ type: 'error', text: 'Enter Mail Content is required.' });
      return;
    }

    setIsSending(true);
    setMessage(null);

    setTimeout(() => {
      const emailList = emails.split(',').map(e => e.trim()).filter(Boolean);
      setIsSending(false);
      setMessage({
        type: 'success',
        text: `Emails successfully sent to ${emailList.length} client(s)!`
      });
      setEmails('');
      setSubject('');
      setContent('');
      setTimeout(() => setMessage(null), 4000);
    }, 900);
  };

  return (
    <div className="content-card" style={{ animation: 'fadeIn 0.2s ease-out', padding: '24px' }}>
      {/* Title */}
      <div style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '14px', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 'bold', margin: 0, color: '#0f172a' }}>
          Send Email to Clients
        </h2>
      </div>

      {/* Alert Banner */}
      {message && (
        <div style={{
          background: message.type === 'success' ? '#ecfdf5' : '#fef2f2',
          border: `1px solid ${message.type === 'success' ? '#a7f3d0' : '#fecaca'}`,
          color: message.type === 'success' ? '#047857' : '#b91c1c',
          borderRadius: '8px',
          padding: '12px 16px',
          fontSize: '13px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '20px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {message.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
            <span>{message.text}</span>
          </div>
          <button onClick={() => setMessage(null)} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', padding: '2px' }}>
            ✕
          </button>
        </div>
      )}

      {/* Form matching attached screenshot */}
      <form onSubmit={handleSendEmails} style={{ border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden', background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <tbody>
            {/* Row 1: New E-mails */}
            <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
              <td style={{ width: '220px', padding: '18px 20px', background: '#f8fafc', fontWeight: '600', fontSize: '13px', color: '#334155', verticalAlign: 'top' }}>
                New E-mails
              </td>
              <td style={{ padding: '18px 20px' }}>
                <textarea
                  rows="4"
                  value={emails}
                  onChange={e => setEmails(e.target.value)}
                  placeholder=""
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #cbd5e1',
                    borderRadius: '6px',
                    fontSize: '13px',
                    color: '#0f172a',
                    outline: 'none',
                    fontFamily: 'inherit',
                    boxSizing: 'border-box'
                  }}
                  onFocus={e => e.target.style.borderColor = '#0076a3'}
                  onBlur={e => e.target.style.borderColor = '#cbd5e1'}
                />
                <span style={{ fontSize: '12px', color: '#64748b', display: 'block', marginTop: '6px' }}>
                  Please divide each email with ',' coma operator.
                </span>
              </td>
            </tr>

            {/* Row 2: Enter Mail Subject */}
            <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
              <td style={{ padding: '18px 20px', background: '#f8fafc', fontWeight: '600', fontSize: '13px', color: '#334155', verticalAlign: 'middle' }}>
                Enter Mail Subject
              </td>
              <td style={{ padding: '18px 20px' }}>
                <input
                  type="text"
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  placeholder=""
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #cbd5e1',
                    borderRadius: '6px',
                    fontSize: '13px',
                    color: '#0f172a',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                  onFocus={e => e.target.style.borderColor = '#0076a3'}
                  onBlur={e => e.target.style.borderColor = '#cbd5e1'}
                />
              </td>
            </tr>

            {/* Row 3: Enter Mail Content */}
            <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
              <td style={{ padding: '18px 20px', background: '#f8fafc', fontWeight: '600', fontSize: '13px', color: '#334155', verticalAlign: 'top' }}>
                Enter Mail Content
              </td>
              <td style={{ padding: '18px 20px' }}>
                <textarea
                  rows="8"
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  placeholder=""
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #cbd5e1',
                    borderRadius: '6px',
                    fontSize: '13px',
                    color: '#0f172a',
                    outline: 'none',
                    fontFamily: 'inherit',
                    boxSizing: 'border-box'
                  }}
                  onFocus={e => e.target.style.borderColor = '#0076a3'}
                  onBlur={e => e.target.style.borderColor = '#cbd5e1'}
                />
              </td>
            </tr>

            {/* Row 4: Submit Button */}
            <tr>
              <td colSpan="2" style={{ padding: '16px 20px', background: '#f8fafc', textAlign: 'left' }}>
                <button
                  type="submit"
                  disabled={isSending}
                  style={{
                    backgroundColor: '#0076a3',
                    color: '#ffffff',
                    border: 'none',
                    padding: '9px 22px',
                    fontSize: '13px',
                    fontWeight: '600',
                    borderRadius: '6px',
                    cursor: isSending ? 'not-allowed' : 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: '0 2px 4px rgba(0,118,163,0.2)',
                    opacity: isSending ? 0.7 : 1
                  }}
                >
                  {isSending ? <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> : <Send size={15} />}
                  {isSending ? 'Sending Emails...' : 'Send Emails'}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </form>
    </div>
  );
}
