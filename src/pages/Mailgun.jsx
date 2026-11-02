import React, { useState, useEffect, useRef } from 'react';
import logoLogin from '../assets/logo-lg.png';
import { URLS } from '../url';
import { Send, CheckCircle, XCircle, X, Loader } from 'lucide-react';

/* ─────────────────────────────────────────────────────────────
   CKEditor 4 wrapper component
   – Uses window.CKEDITOR (loaded from CDN in index.html)
   – Full toolbar: Source, Bold, Italic, Underline, Font, Size,
     Colour, Align, Lists, Indent, Table, Image, Link, Print,
     Zoom, Undo/Redo, Styles, Smiley, SpecialChar, etc.
───────────────────────────────────────────────────────────── */

const EMAIL_TEMPLATE = `
<table cellpadding="0" cellspacing="0" style="width:460px;border-collapse:collapse;font-family:Arial,sans-serif;font-size:13px;margin:0 auto;">
  <tbody>
    <tr>
      <td colspan="2" style="background:#fff;border:1px solid #ccc;padding:6px 12px;font-size:12px;color:#333;">
        contact@dollartax.com &nbsp;
        <span style="color:#2a7a2a;font-weight:600;">&#127470;&#127475; +91 8466077444</span>
        &nbsp;&nbsp;
        <span style="color:#b22222;font-weight:600;">&#127482;&#127480; +1 970 370 7008 / +1 616 420 9090</span>
      </td>
    </tr>
    <tr>
      <td style="padding:8px 12px;border:1px solid #ccc;width:55%;">
        <table cellpadding="0" cellspacing="0"><tbody><tr>
          <td>
            <img src="${logoLogin}" alt="Dollar Tax Filer" style="width:120px;height:auto;display:block;" />
          </td>
        </tr></tbody></table>
      </td>
      <td style="padding:8px 12px;border:1px solid #ccc;text-align:right;vertical-align:middle;">
        <span style="display:inline-block;margin-left:4px;padding:3px 8px;border:1px solid #ccc;border-radius:2px;font-size:11px;color:#333;background:#f9f9f9;">Home</span>
        <span style="display:inline-block;margin-left:4px;padding:3px 8px;border:1px solid #ccc;border-radius:2px;font-size:11px;color:#333;background:#f9f9f9;">Login</span>
        <span style="display:inline-block;margin-left:4px;padding:3px 8px;border:1px solid #ccc;border-radius:2px;font-size:11px;color:#333;background:#f9f9f9;">Contact Us</span>
      </td>
    </tr>
    <tr>
      <td colspan="2" style="border:1px solid #ccc;padding:14px 16px;background:#fff;font-size:13px;color:#222;min-height:60px;">
        <p><strong>Greetings from Dollar Tax!!</strong></p>
        <p>&nbsp;</p>
      </td>
    </tr>
  </tbody>
</table>
`;

/* CKEditor 4 full toolbar config matching the screenshot */
const CK_TOOLBAR = [
  {
    name: 'document',
    items: ['Source', '-', 'Save', 'NewPage', 'Preview', 'Print', '-', 'Templates'],
  },
  {
    name: 'clipboard',
    items: ['Cut', 'Copy', 'Paste', 'PasteText', 'PasteFromWord', '-', 'Undo', 'Redo'],
  },
  {
    name: 'editing',
    items: ['Find', 'Replace', '-', 'SelectAll', '-', 'Scayt'],
  },
  {
    name: 'tools',
    items: ['Maximize', 'ShowBlocks', '-', 'About'],
  },
  '/',
  {
    name: 'basicstyles',
    items: ['Bold', 'Italic', 'Underline', 'Strike', 'Subscript', 'Superscript', '-', 'CopyFormatting', 'RemoveFormat'],
  },
  {
    name: 'paragraph',
    items: [
      'NumberedList', 'BulletedList', '-',
      'Outdent', 'Indent', '-',
      'Blockquote', 'CreateDiv', '-',
      'JustifyLeft', 'JustifyCenter', 'JustifyRight', 'JustifyBlock', '-',
      'BidiLtr', 'BidiRtl', 'Language',
    ],
  },
  { name: 'links', items: ['Link', 'Unlink', 'Anchor'] },
  {
    name: 'insert',
    items: ['Image', 'Flash', 'Table', 'HorizontalRule', 'Smiley', 'SpecialChar', 'PageBreak', 'Iframe'],
  },
  '/',
  { name: 'styles', items: ['Styles', 'Format', 'Font', 'FontSize'] },
  { name: 'colors', items: ['TextColor', 'BGColor'] },
  { name: 'tools2', items: ['Maximize'] },
];

/* React wrapper for CKEditor 4 */
function CKEditorField({ id, initialData, onChange }) {
  const mountedRef = useRef(false);

  useEffect(() => {
    // CKEditor 4 is loaded globally via CDN
    const CKEDITOR = window.CKEDITOR;
    if (!CKEDITOR) return;

    // Destroy any pre-existing instance
    if (CKEDITOR.instances[id]) {
      CKEDITOR.instances[id].destroy(true);
    }

    const editor = CKEDITOR.replace(id, {
      toolbar: CK_TOOLBAR,
      height: 260,
      removePlugins: '',
      allowedContent: true,
      extraPlugins: 'font,colorbutton,justify,print,find,showblocks,templates,scayt,language',
      font_names:
        'Arial/Arial, Helvetica, sans-serif;' +
        'Comic Sans MS/Comic Sans MS, cursive;' +
        'Courier New/Courier New, Courier, monospace;' +
        'Georgia/Georgia, serif;' +
        'Lucida Sans Unicode/Lucida Sans Unicode, Lucida Grande, sans-serif;' +
        'Tahoma/Tahoma, Geneva, sans-serif;' +
        'Times New Roman/Times New Roman, Times, serif;' +
        'Trebuchet MS/Trebuchet MS, Helvetica, sans-serif;' +
        'Verdana/Verdana, Geneva, sans-serif',
      fontSize_sizes:
        '8/8px;9/9px;10/10px;11/11px;12/12px;14/14px;16/16px;18/18px;' +
        '20/20px;22/22px;24/24px;26/26px;28/28px;36/36px;48/48px;72/72px',
    });

    editor.setData(initialData || '');

    editor.on('change', () => {
      if (onChange) onChange(editor.getData());
    });

    mountedRef.current = true;

    return () => {
      if (CKEDITOR.instances[id]) {
        CKEDITOR.instances[id].destroy(true);
      }
    };
  }, [id]);

  return (
    <textarea
      id={id}
      style={{ display: 'none' }}
      defaultValue={initialData}
    />
  );
}

/* ─────────────────────────────────────────────────────────────
   Main Mailgun Component
───────────────────────────────────────────────────────────── */
export default function Mailgun({ selectedYear = '' }) {
  const [excelFile, setExcelFile] = useState(null);
  const excelInputRef = useRef(null);
  const [subject, setSubject] = useState('');
  const [editorContent, setEditorContent] = useState(EMAIL_TEMPLATE);
  const [ckReady, setCkReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  /* Wait until CKEditor CDN script is fully loaded */
  useEffect(() => {
    const check = () => {
      if (window.CKEDITOR) {
        setCkReady(true);
      } else {
        setTimeout(check, 150);
      }
    };
    check();
  }, []);

  /* Auto-dismiss toast after 3 s */
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  const showToast = (type, text) => setToast({ type, text });

  const getToken = () => {
    for (const key of ['authToken', 'token', 'adminToken', 'accessToken', 'jwt']) {
      const v = sessionStorage.getItem(key) || localStorage.getItem(key);
      if (v) return v;
    }
    return '';
  };

  const resetForm = () => {
    setSubject('');
    setExcelFile(null);
    if (excelInputRef.current) excelInputRef.current.value = '';
    // Reset CKEditor content back to template
    const ck = window.CKEDITOR?.instances?.['mg-editor'];
    if (ck) ck.setData(EMAIL_TEMPLATE);
    setEditorContent(EMAIL_TEMPLATE);
  };

  const handleSend = async () => {
    if (!excelFile) {
      showToast('error', 'Please choose an Excel file before sending.');
      return;
    }
    if (!subject.trim()) {
      showToast('error', 'Please enter a Subject before sending.');
      return;
    }

    const body = window.CKEDITOR?.instances?.['mg-editor']?.getData() || editorContent;

    const formData = new FormData();
    formData.append('excel', excelFile);
    formData.append('subject', subject);
    formData.append('body', body);

    try {
      setLoading(true);
      const response = await fetch(URLS.SendMailGun, {
        method: 'POST',
        headers: { Authorization: `Bearer ${getToken()}` },
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        showToast('success', data?.message || 'Emails dispatched successfully via Mailgun!');
        resetForm();
      } else {
        showToast('error', data?.message || 'Failed to send emails. Please try again.');
      }
    } catch (err) {
      showToast('error', 'Network error. Could not reach the server.');
    } finally {
      setLoading(false);
    }
  };

  const yearLabel = selectedYear.replace('TY', '20');

  return (
    <div className="content-card" style={{ animation: 'fadeIn 0.2s ease-out', padding: '20px 24px' }}>
      {/* Page title */}
      <h2 className="view-title">
        Send Mail to All Register in {yearLabel} Tax Year
      </h2>

      {/* Toast notification */}
      {toast && (
        <div style={{
          position: 'fixed',
          top: '24px',
          right: '24px',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'flex-start',
          gap: '10px',
          backgroundColor: toast.type === 'success' ? '#f0fdf4' : '#fef2f2',
          border: `1px solid ${toast.type === 'success' ? '#bbf7d0' : '#fecaca'}`,
          borderLeft: `4px solid ${toast.type === 'success' ? '#16a34a' : '#dc2626'}`,
          borderRadius: '8px',
          padding: '14px 16px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
          maxWidth: '360px',
          animation: 'slideInRight 0.3s ease-out',
        }}>
          {toast.type === 'success'
            ? <CheckCircle size={18} color="#16a34a" style={{ flexShrink: 0, marginTop: '1px' }} />
            : <XCircle size={18} color="#dc2626" style={{ flexShrink: 0, marginTop: '1px' }} />
          }
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '13px', fontWeight: '700', color: toast.type === 'success' ? '#15803d' : '#b91c1c', marginBottom: '2px' }}>
              {toast.type === 'success' ? 'Mail Sent' : 'Error'}
            </div>
            <div style={{ fontSize: '12px', color: toast.type === 'success' ? '#166534' : '#991b1b', lineHeight: '1.4' }}>
              {toast.text}
            </div>
          </div>
          <button onClick={() => setToast(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0', color: '#94a3b8', flexShrink: 0 }}>
            <X size={14} />
          </button>
        </div>
      )}

      <style>{`
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(40px); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>

      {/* ── Choose Excel File ── */}
      <div style={{ marginBottom: '14px' }}>
        <label className="mg-label">Choose Excel File <span style={{ color: '#dc2626' }}>*</span></label>
        <div className="mg-file-wrapper">
          <span className="mg-file-text">
            {excelFile ? excelFile.name : 'No file chosen'}
          </span>
          <label className="mg-browse-btn">
            Browse...
            <input
              ref={excelInputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              style={{ display: 'none' }}
              onChange={e => setExcelFile(e.target.files[0] || null)}
            />
          </label>
        </div>
      </div>

      {/* ── Subject ── */}
      <div style={{ marginBottom: '14px' }}>
        <label className="mg-label">Subject</label>
        <input
          type="text"
          className="mg-full-input"
          value={subject}
          placeholder=""
          onChange={e => setSubject(e.target.value)}
        />
      </div>

      {/* ── Message / CKEditor ── */}
      <div style={{ marginBottom: '18px' }}>
        <label className="mg-label">Message</label>

        {!ckReady ? (
          /* Loading state while CDN script loads */
          <div
            style={{
              border: '1px solid #c8c8c8',
              borderRadius: '4px',
              padding: '24px',
              textAlign: 'center',
              color: '#888',
              fontSize: '13px',
              background: '#fafafa',
            }}
          >
            Loading editor…
          </div>
        ) : (
          <div className="mg-ck-wrapper">
            <CKEditorField
              id="mg-editor"
              initialData={EMAIL_TEMPLATE}
              onChange={setEditorContent}
            />
          </div>
        )}
      </div>

      {/* ── Send Mail button ── */}
      <button
        className="mg-send-btn"
        onClick={handleSend}
        disabled={loading}
        style={{ opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
      >
        {loading ? <Loader size={15} style={{ animation: 'spin 1s linear infinite' }} /> : <Send size={15} />}
        {loading ? 'Sending...' : 'Send Mail'}
      </button>
    </div>
  );
}
