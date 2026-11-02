import React, { useState, useEffect, useCallback } from 'react';
import { X, Plus, MessageSquare, AlertTriangle, CheckCircle2, Loader2 } from 'lucide-react';
import { URLS } from '../../url';
import { formatDate } from '../../utils/dateUtils';

/* ─── Token helper ─── */
const getAuthToken = () => {
  const keys = ['adminToken', 'authToken', 'token', 'accessToken', 'jwt'];
  for (const key of keys) {
    const value = sessionStorage.getItem(key) || localStorage.getItem(key);
    if (value) return value;
  }
  return 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhZG1pbl9pZCI6IjZhNThiZDFjNzE1ZjE4ZTYxZDQxY2Y5MiIsImVtYWlsIjoiZGl2eWFwZW5keWFsYTA3MTdAZ21haWwuY29tIiwiYWRtaW5fc3RhZ2UiOiJzdXBlciIsImlhdCI6MTc4NDIwNDE1OCwiZXhwIjoxODE1NzQwMTU4fQ.1pjPlGU41H1G5ei3AfTEcaWk9O1eyRTG769xnpj5xts';
};

/* ─── Helpers ─── */

const statusColor = (s) => {
  const lower = (s || '').toLowerCase();
  if (lower === 'completed') return { bg: 'rgba(40,167,69,0.12)', color: '#28a745' };
  if (lower === 'pending') return { bg: 'rgba(255,140,0,0.12)', color: '#e07b00' };
  if (lower === 'in progress') return { bg: 'rgba(0,118,163,0.12)', color: '#0076a3' };
  return { bg: '#f0f0f0', color: '#555' };
};

/* ─── Add Discussion Modal (with real API call) ─── */
function AddDiscussionModal({ leadId, onClose, onAdded }) {
  const [followupDate, setFollowupDate] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description.trim()) { setError('Description is required.'); return; }
    setError('');
    setSubmitting(true);

    try {
      const res = await fetch(`${URLS.CreateFollowUpLead}${leadId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          followup_date: followupDate || new Date().toISOString().split('T')[0],
          description: description.trim(),
        }),
      });

      const data = await res.json();
      if (res.ok && data.success !== false) {
        onAdded(data.data || { followup_date: followupDate, description: description.trim(), createdAt: new Date().toISOString() });
        onClose();
      } else {
        setError(data.message || 'Failed to add follow-up.');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
        zIndex: 9000, display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div style={{
        background: '#fff', borderRadius: '12px', width: '460px', maxWidth: '92%',
        boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '16px 20px', borderBottom: '1px solid #e9ecef',
          background: 'linear-gradient(135deg, #0076a3, #005f8a)', borderRadius: '12px 12px 0 0',
        }}>
          <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: 8 }}>
            <MessageSquare size={16} /> Add Discussion / Follow-Up
          </h4>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#fff', opacity: 0.8 }}>
            <X size={16} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: '20px' }}>
          {error && (
            <div style={{ padding: '9px 12px', background: '#fee2e2', color: '#b91c1c', borderRadius: '6px', fontSize: '0.8rem', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: 6 }}>
              <AlertTriangle size={14} /> {error}
            </div>
          )}

          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '5px' }}>
              Follow-Up Date
            </label>
            <input
              type="date"
              value={followupDate}
              onChange={e => setFollowupDate(e.target.value)}
              style={{
                width: '100%', padding: '9px 10px', border: '1px solid #d1d5db',
                borderRadius: '6px', fontSize: '0.88rem', outline: 'none',
                boxSizing: 'border-box', fontFamily: 'inherit',
              }}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '5px' }}>
              Description <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Enter discussion notes..."
              required
              style={{
                width: '100%', padding: '9px 10px', border: '1px solid #d1d5db',
                borderRadius: '6px', fontSize: '0.88rem', outline: 'none',
                resize: 'vertical', boxSizing: 'border-box', fontFamily: 'inherit',
              }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
            <button type="button" onClick={onClose} style={{
              padding: '8px 16px', border: '1px solid #d1d5db', borderRadius: '6px',
              background: '#fff', color: '#374151', fontSize: '0.85rem', cursor: 'pointer',
            }}>
              Cancel
            </button>
            <button type="submit" disabled={submitting} style={{
              padding: '8px 18px', border: 'none', borderRadius: '6px',
              background: '#0076a3', color: '#fff', fontSize: '0.85rem',
              fontWeight: 600, cursor: submitting ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', gap: '6px',
              opacity: submitting ? 0.7 : 1,
            }}>
              {submitting ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : null}
              {submitting ? 'Adding...' : 'Add Follow-Up'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ─── Lead Detail View ─── */
export default function LeadDetailView({ lead, onBack }) {
  const [activeTab, setActiveTab] = useState('general');
  const [showAddDiscussion, setShowAddDiscussion] = useState(false);
  const [discussions, setDiscussions] = useState([]);
  const [loadingDiscussions, setLoadingDiscussions] = useState(false);
  const [discussionError, setDiscussionError] = useState('');

  const sc = statusColor(lead.status);
  const leadId = lead._id || lead.id;

  /* ── Fetch Follow-Ups via API ── */
  const fetchFollowUps = useCallback(async () => {
    if (!leadId) return;
    setLoadingDiscussions(true);
    setDiscussionError('');
    try {
      const res = await fetch(`${URLS.GetFollowUpLead}${leadId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
          'Content-Type': 'application/json',
        },
      });
      const data = await res.json();
      if (res.ok && data.success !== false) {
        setDiscussions(data.data || []);
      } else {
        setDiscussionError(data.message || 'Failed to fetch follow-ups.');
      }
    } catch (err) {
      setDiscussionError('Network error loading discussions.');
    } finally {
      setLoadingDiscussions(false);
    }
  }, [leadId]);

  /* Fetch follow-ups when Discussion tab is activated */
  useEffect(() => {
    if (activeTab === 'discussion') {
      fetchFollowUps();
    }
  }, [activeTab, fetchFollowUps]);

  /* ── General tab rows ── */
  const GENERAL_ROWS = [
    { label: 'Name', value: lead.name },
    { label: 'Email', value: lead.email, isEmail: true },
    { label: 'Mobile', value: lead.mobile },
    // { label: 'Referred By',   value: lead.referred_by || lead.referredBy },
    { label: 'Follow-Up Date', value: formatDate(lead.followup_date || lead.followUpDate) },
    // { label: 'Created On',    value: formatDate(lead.createdAt || lead.date) },
    // { label: 'Status',        value: lead.status || 'Pending', isStatus: true },
    { label: 'Description', value: lead.description },
  ];

  return (
    <div className="content-card" style={{ animation: 'fadeIn 0.2s ease-out' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h2 className="view-title" style={{ margin: 0, borderBottom: 'none', paddingBottom: 0 }}>
          Lead Details
        </h2>
        <button className="detail-back-btn" onClick={onBack}>← Back</button>
      </div>

      {/* Tabs */}
      <div className="detail-tabs-row" style={{ marginBottom: 0 }}>
        <button
          className={`detail-tab-btn ${activeTab === 'general' ? 'active' : ''}`}
          onClick={() => setActiveTab('general')}
        >
          General
        </button>
        <button
          className={`detail-tab-btn ${activeTab === 'discussion' ? 'active' : ''}`}
          onClick={() => setActiveTab('discussion')}
        >
          Discussion
        </button>
      </div>

      {/* Tab Content */}
      <div style={{ border: '1px solid #dee2e6', borderTop: 'none', borderRadius: '0 0 8px 8px', overflow: 'hidden' }}>

        {/* ── General Tab — Table view ── */}
        {activeTab === 'general' && (
          <div className="table-responsive" style={{ margin: 0, border: 'none' }}>
            <table className="corporate-table" style={{ width: '100%', margin: 0 }}>
              <thead>
                <tr>
                  <th style={{ width: '200px' }}>Field</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                {GENERAL_ROWS.map(({ label, value, isEmail, isStatus }) => (
                  <tr key={label}>
                    <td style={{ fontWeight: 600, color: '#475569', background: '#f8fafc', width: '200px' }}>
                      {label}
                    </td>
                    <td>
                      {isStatus ? (
                        <span style={{
                          background: sc.bg, color: sc.color,
                          padding: '2px 10px', borderRadius: '20px',
                          fontSize: '0.8rem', fontWeight: 600,
                        }}>
                          {value || 'Pending'}
                        </span>
                      ) : isEmail ? (
                        <a href={`mailto:${value}`} style={{ color: '#1a6eb5', textDecoration: 'none' }}>{value || '—'}</a>
                      ) : (
                        <span style={{ color: '#1e293b' }}>{value || '—'}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ── Discussion Tab — fetched from API ── */}
        {activeTab === 'discussion' && (
          <div style={{ padding: '16px' }}>
            {/* Header row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569', display: 'flex', alignItems: 'center', gap: 5 }}>
                <MessageSquare size={14} />
                {loadingDiscussions ? 'Loading...' : `${discussions.length} Follow-Up${discussions.length !== 1 ? 's' : ''}`}
              </span>
              <button
                onClick={() => setShowAddDiscussion(true)}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '5px',
                  background: '#0076a3', color: '#fff', border: 'none',
                  borderRadius: '6px', padding: '7px 14px',
                  fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer',
                }}
              >
                <Plus size={13} /> Add Discussion
              </button>
            </div>

            {/* Error */}
            {discussionError && (
              <div style={{ padding: '9px 12px', background: '#fee2e2', color: '#b91c1c', borderRadius: '6px', fontSize: '0.8rem', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: 6 }}>
                <AlertTriangle size={14} /> {discussionError}
              </div>
            )}

            {/* Loading state */}
            {loadingDiscussions ? (
              <div style={{ textAlign: 'center', padding: '28px', color: '#94a3b8', fontSize: '0.88rem' }}>
                <Loader2 size={22} style={{ animation: 'spin 1s linear infinite', marginBottom: 8 }} />
                <p style={{ margin: 0 }}>Loading follow-ups...</p>
              </div>
            ) : discussions.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px', color: '#94a3b8', fontSize: '0.88rem' }}>
                <MessageSquare size={30} style={{ marginBottom: 8, opacity: 0.4 }} />
                <p style={{ margin: 0 }}>No follow-ups yet. Click <strong>Add Discussion</strong> to add one.</p>
              </div>
            ) : (
              <div className="table-responsive" style={{ margin: 0, border: 'none' }}>
                <table className="corporate-table" style={{ width: '100%', margin: 0 }}>
                  <thead>
                    <tr>
                      <th style={{ width: '50px' }}>Sl.No</th>
                      <th>Follow-Up Date</th>
                      <th>Description</th>
                      <th>Created On</th>
                    </tr>
                  </thead>
                  <tbody>
                    {discussions.map((d, idx) => (
                      <tr key={d._id || idx}>
                        <td>{idx + 1}</td>
                        <td>{formatDate(d.followup_date || d.followupDate) || '—'}</td>
                        <td style={{ maxWidth: '320px' }}>{d.description || '—'}</td>
                        <td>{formatDate(d.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add Follow-Up Modal */}
      {showAddDiscussion && (
        <AddDiscussionModal
          leadId={leadId}
          onClose={() => setShowAddDiscussion(false)}
          onAdded={(entry) => {
            setDiscussions(prev => [entry, ...prev]);
          }}
        />
      )}
    </div>
  );
}
