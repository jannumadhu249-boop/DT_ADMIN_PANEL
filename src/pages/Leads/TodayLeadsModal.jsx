import React from 'react';
import { X, Calendar, Eye, Edit2, AlertCircle, Phone, Mail, Clock } from 'lucide-react';
import { formatDate } from '../../utils/dateUtils';

const statusColor = (s) => {
  const lower = (s || '').toLowerCase();
  if (lower === 'completed') return { bg: 'rgba(40,167,69,0.12)', color: '#28a745' };
  if (lower === 'pending')   return { bg: 'rgba(255,140,0,0.12)',  color: '#e07b00' };
  if (lower === 'in progress' || lower === 'inprogress') return { bg: 'rgba(0,118,163,0.12)', color: '#0076a3' };
  return { bg: '#f0f0f0', color: '#555' };
};

export default function TodayLeadsModal({
  leads = [],
  onClose,
  onViewLead,
  onEditLead,
  onFilterToday
}) {
  const today = new Date();
  const todayFormatted = formatDate(today);

  const getIsoDateString = (date) => {
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const isToday = (dateStr) => {
    if (!dateStr) return false;
    const todayStr = getIsoDateString(today);
    if (typeof dateStr === 'string' && dateStr.startsWith(todayStr)) return true;
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return false;
    return getIsoDateString(d) === todayStr;
  };

  return (
    <div
      className="modal-overlay"
      style={{
        zIndex: 9999,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(3px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        padding: '16px'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="leads-modal-dialog"
        style={{
          width: 880,
          maxWidth: '96%',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
          borderRadius: '12px',
          overflow: 'hidden',
          backgroundColor: '#ffffff',
          animation: 'slideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 24px',
            background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)',
            color: '#ffffff'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: '10px',
                background: 'rgba(255, 255, 255, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <Calendar size={22} color="#ffffff" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: '#ffffff' }}>
                  Today's Leads
                </h3>
                <span
                  style={{
                    background: '#10b981',
                    color: '#ffffff',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '12px'
                  }}
                >
                  {leads.length} {leads.length === 1 ? 'Lead' : 'Leads'}
                </span>
              </div>
              <p style={{ margin: '2px 0 0', fontSize: '0.82rem', color: 'rgba(255,255,255,0.85)' }}>
                Scheduled or received on {todayFormatted}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.15)',
              border: 'none',
              borderRadius: '8px',
              width: 32,
              height: 32,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#ffffff',
              transition: 'background 0.2s'
            }}
            title="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body / List */}
        <div style={{ padding: '20px 24px', overflowY: 'auto', flex: 1 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 14px',
              background: '#eff6ff',
              borderRadius: '8px',
              border: '1px solid #bfdbfe',
              color: '#1e40af',
              fontSize: '0.85rem',
              marginBottom: '16px'
            }}
          >
            <AlertCircle size={16} color="#2563eb" style={{ flexShrink: 0 }} />
            <span>
              Here are the leads requiring your attention today. You can view full details or edit them directly.
            </span>
          </div>

          <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left', color: '#475569' }}>
                  <th style={{ padding: '10px 12px', fontWeight: 600 }}>Sl.No</th>
                  <th style={{ padding: '10px 12px', fontWeight: 600 }}>Lead Name</th>
                  <th style={{ padding: '10px 12px', fontWeight: 600 }}>Contact</th>
                  <th style={{ padding: '10px 12px', fontWeight: 600 }}>Scheduled / Date</th>
                  <th style={{ padding: '10px 12px', fontWeight: 600 }}>Status</th>
                  <th style={{ padding: '10px 12px', fontWeight: 600 }}>Notes / Referred By</th>
                  <th style={{ padding: '10px 12px', fontWeight: 600, textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((lead, idx) => {
                  const sc = statusColor(lead.status);
                  const isFollowupToday = isToday(lead.followup_date || lead.followUpDate);
                  const isCreatedToday = isToday(lead.createdAt || lead.date);

                  return (
                    <tr
                      key={lead._id || idx}
                      style={{
                        borderBottom: idx === leads.length - 1 ? 'none' : '1px solid #f1f5f9',
                        background: idx % 2 === 0 ? '#ffffff' : '#fafafa'
                      }}
                    >
                      <td style={{ padding: '12px', color: '#64748b', fontWeight: 500 }}>
                        {idx + 1}
                      </td>

                      <td style={{ padding: '12px' }}>
                        <div style={{ fontWeight: 600, color: '#0f172a' }}>{lead.name}</div>
                        {isFollowupToday && (
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              fontSize: '0.72rem',
                              color: '#b45309',
                              background: '#fef3c7',
                              padding: '2px 6px',
                              borderRadius: '4px',
                              marginTop: '3px',
                              fontWeight: 600
                            }}
                          >
                            <Clock size={11} /> Follow-up Today
                          </span>
                        )}
                        {!isFollowupToday && isCreatedToday && (
                          <span
                            style={{
                              display: 'inline-block',
                              fontSize: '0.72rem',
                              color: '#047857',
                              background: '#d1fae5',
                              padding: '2px 6px',
                              borderRadius: '4px',
                              marginTop: '3px',
                              fontWeight: 600
                            }}
                          >
                            New Today
                          </span>
                        )}
                      </td>

                      <td style={{ padding: '12px' }}>
                        {lead.mobile && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#334155' }}>
                            <Phone size={12} color="#64748b" />
                            <span>{lead.mobile}</span>
                          </div>
                        )}
                        {lead.email && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#2563eb', marginTop: '2px' }}>
                            <Mail size={12} color="#64748b" />
                            <a href={`mailto:${lead.email}`} style={{ color: '#2563eb', textDecoration: 'none' }}>
                              {lead.email}
                            </a>
                          </div>
                        )}
                      </td>

                      <td style={{ padding: '12px', whiteSpace: 'nowrap' }}>
                        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                          Follow-up: <strong style={{ color: '#1e293b' }}>{formatDate(lead.followup_date || lead.followUpDate)}</strong>
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px' }}>
                          Added: {formatDate(lead.createdAt || lead.date)}
                        </div>
                      </td>

                      <td style={{ padding: '12px' }}>
                        <span
                          style={{
                            padding: '4px 8px',
                            borderRadius: '12px',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            background: sc.bg,
                            color: sc.color,
                            display: 'inline-block'
                          }}
                        >
                          {lead.status || 'Pending'}
                        </span>
                      </td>

                      <td style={{ padding: '12px', maxWidth: '180px' }}>
                        <div
                          style={{
                            fontSize: '0.82rem',
                            color: '#334155',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}
                          title={lead.description}
                        >
                          {lead.description || '—'}
                        </div>
                        {(lead.referred_by || lead.referredBy) && (
                          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>
                            Ref: {lead.referred_by || lead.referredBy}
                          </div>
                        )}
                      </td>

                      <td style={{ padding: '12px', textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                          <button
                            onClick={() => {
                              onClose();
                              onViewLead(lead);
                            }}
                            title="View Lead Details"
                            style={{
                              width: 32,
                              height: 32,
                              borderRadius: '6px',
                              background: '#eff6ff',
                              border: '1px solid #bfdbfe',
                              color: '#1d4ed8',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              transition: 'all 0.15s'
                            }}
                          >
                            <Eye size={15} />
                          </button>
                          <button
                            onClick={() => {
                              onClose();
                              onEditLead(lead);
                            }}
                            title="Edit Lead"
                            style={{
                              width: 32,
                              height: 32,
                              borderRadius: '6px',
                              background: '#fef3c7',
                              border: '1px solid #fde68a',
                              color: '#b45309',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              transition: 'all 0.15s'
                            }}
                          >
                            <Edit2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '14px 24px',
            borderTop: '1px solid #e2e8f0',
            background: '#f8fafc',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px'
          }}
        >
          <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
            Showing {leads.length} {leads.length === 1 ? 'lead' : 'leads'} for {todayFormatted}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {onFilterToday && (
              <button
                onClick={() => {
                  onClose();
                  onFilterToday();
                }}
                style={{
                  padding: '8px 16px',
                  borderRadius: '6px',
                  background: '#ffffff',
                  border: '1px solid #cbd5e1',
                  color: '#334155',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Filter Main Table to Today
              </button>
            )}
            <button
              onClick={onClose}
              style={{
                padding: '8px 20px',
                borderRadius: '6px',
                background: '#2563eb',
                border: 'none',
                color: '#ffffff',
                fontSize: '0.82rem',
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: '0 2px 4px rgba(37,99,235,0.2)'
              }}
            >
              Continue to Leads
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
