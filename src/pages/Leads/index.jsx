import React, { useState, useEffect, useCallback } from 'react';
import { Eye, Edit2, Plus, Filter, ChevronLeft, ChevronRight, AlertTriangle, CheckCircle2, Users, Calendar } from 'lucide-react';
import { URLS } from '../../url';
import { formatDate } from '../../utils/dateUtils';
import CreateLeadModal from './CreateLeadModal';
import EditLeadModal from './EditLeadModal';
import FilterModal from './FilterModal';
import LeadDetailView from './LeadDetailView';
import TodayLeadsModal from './TodayLeadsModal';

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
  if (lower === 'pending')   return { bg: 'rgba(255,140,0,0.12)',  color: '#e07b00' };
  if (lower === 'in progress') return { bg: 'rgba(0,118,163,0.12)', color: '#0076a3' };
  return { bg: '#f0f0f0', color: '#555' };
};

const getIsoDateString = (date) => {
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

const isDateToday = (dateStr) => {
  if (!dateStr) return false;
  const todayStr = getIsoDateString(new Date());
  if (typeof dateStr === 'string' && dateStr.startsWith(todayStr)) return true;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return false;
  return getIsoDateString(d) === todayStr;
};

/* ─── Toast ─── */
function Toast({ message, type, onHide }) {
  useEffect(() => {
    const t = setTimeout(onHide, 3200);
    return () => clearTimeout(t);
  }, [onHide]);

  return (
    <div style={{
      position: 'fixed',
      top: '24px',
      left: '50%',
      transform: 'translateX(-50%)',
      background: '#1e293b',
      color: '#fff',
      padding: '12px 24px',
      borderRadius: '8px',
      fontSize: '0.85rem',
      fontWeight: 500,
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      boxShadow: '0 10px 30px rgba(0,0,0,0.25)',
      zIndex: 9999,
      borderLeft: type === 'success' ? '4px solid #10b981' : '4px solid #ef4444',
      animation: 'fadeIn 0.25s ease'
    }}>
      {type === 'success'
        ? <CheckCircle2 size={16} color="#10b981" />
        : <AlertTriangle size={16} color="#ef4444" />
      }
      {message}
    </div>
  );
}

/* ─── Main Leads Component ─── */
export default function Leads() {
  const [leads, setLeads]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [viewLead, setViewLead]     = useState(null);
  const [editLead, setEditLead]     = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [toast, setToast]           = useState(null);

  const [todayLeads, setTodayLeads] = useState([]);
  const [showTodayModal, setShowTodayModal] = useState(false);

  /* ── Pagination / Filtering state ── */
  const [searchTerm, setSearchTerm]   = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [perPage, setPerPage]         = useState(20);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [dateFilter, setDateFilter]   = useState({ from: '', to: '' });

  /* ── Fetch Leads from API ── */
  const fetchLeads = useCallback(async (page = currentPage) => {
    setLoading(true);
    try {
      const body = {
        page,
        limit: perPage,
        search: searchTerm,
        status: statusFilter === 'All' ? '' : statusFilter,
        from_date: dateFilter.from || '',
        to_date: dateFilter.to || '',
      };

      const res = await fetch(URLS.GetLeads, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const json = await res.json();
      if (res.ok && json.success !== false) {
        setLeads(json.data || []);
        setTotalRecords(json.pagination?.totalRecords || (json.data || []).length);
      } else {
        console.warn('Leads fetch notice:', json.message);
        setLeads([]);
      }
    } catch (err) {
      console.error('Fetch leads error:', err);
      setLeads([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, perPage, searchTerm, statusFilter, dateFilter]);

  /* ── Check Today's Leads on Initial Page Load ── */
  const checkTodayLeads = useCallback(async () => {
    try {
      const res = await fetch(URLS.GetLeads, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ page: 1, limit: 100 }),
      });
      const json = await res.json();
      if (res.ok && Array.isArray(json.data)) {
        const matched = json.data.filter(l =>
          isDateToday(l.followup_date || l.followUpDate) ||
          isDateToday(l.createdAt || l.date)
        );
        setTodayLeads(matched);
        // Automatically open popup if leads exist on today's date
        if (matched.length > 0) {
          setShowTodayModal(true);
        }
      }
    } catch (err) {
      console.error('Check today leads error:', err);
    }
  }, []);

  useEffect(() => {
    checkTodayLeads();
  }, [checkTodayLeads]);

  useEffect(() => {
    fetchLeads(currentPage);
  }, [currentPage, perPage, statusFilter, dateFilter]);

  /* debounced search */
  useEffect(() => {
    const t = setTimeout(() => { setCurrentPage(1); fetchLeads(1); }, 400);
    return () => clearTimeout(t);
  }, [searchTerm]);

  /* ── Toast helper ── */
  const showToast = (msg, type = 'success') => setToast({ msg, type });

  /* ── After Create ── */
  const handleCreate = (newLead) => {
    setShowCreate(false);
    if (newLead && newLead._id) {
      showToast('Lead added successfully!');
      fetchLeads(1);
      setCurrentPage(1);
      checkTodayLeads();
    } else {
      showToast('Failed to add lead.', 'error');
    }
  };

  /* ── After Edit ── */
  const handleEdit = (updated) => {
    setEditLead(null);
    if (updated) {
      showToast('Lead updated successfully!');
      fetchLeads(currentPage);
      checkTodayLeads();
    } else {
      showToast('Failed to update lead.', 'error');
    }
  };

  /* ── Apply date filter ── */
  const handleApplyFilter = (f) => {
    setDateFilter(f);
    setCurrentPage(1);
    setShowFilter(false);
  };

  /* ── Filter main table directly to today ── */
  const handleFilterToday = () => {
    const todayStr = getIsoDateString(new Date());
    setDateFilter({ from: todayStr, to: todayStr });
    setCurrentPage(1);
  };

  /* ── Pagination ── */
  const totalPages = Math.ceil(totalRecords / perPage) || 1;

  const pageNumbers = () => {
    const pages = [];
    const delta = 2;
    const range = [];
    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i);
    }
    if (totalPages <= 1) return [1];
    pages.push(1);
    if (range[0] > 2) pages.push('...');
    range.forEach(p => pages.push(p));
    if (range[range.length - 1] < totalPages - 1) pages.push('...');
    if (totalPages > 1) pages.push(totalPages);
    return pages;
  };

  /* ── Show detail view ── */
  if (viewLead) {
    return <LeadDetailView lead={viewLead} onBack={() => setViewLead(null)} />;
  }

  return (
    <div className="content-card" style={{ animation: 'fadeIn 0.2s ease-out' }}>
      <h2 className="view-title">Leads</h2>

      {/* Top controls row */}
      <div className="leads-controls-row">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button className="leads-btn-new" onClick={() => setShowCreate(true)}>
            <Plus size={15} /> New Lead
          </button>
          <button
            className={`leads-btn-today ${todayLeads.length > 0 ? 'has-leads' : ''}`}
            onClick={() => setShowTodayModal(true)}
            title="View today's leads"
          >
            <Calendar size={15} />
            <span>Today's Leads</span>
            {todayLeads.length > 0 && (
              <span className="leads-today-badge">{todayLeads.length}</span>
            )}
          </button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {(dateFilter.from || dateFilter.to) && (
            <button
              className="leads-btn-clear-filter"
              onClick={() => { setDateFilter({ from: '', to: '' }); setCurrentPage(1); }}
              title="Clear date filter"
            >
              Clear Filter
            </button>
          )}
          <button className="leads-btn-filter" onClick={() => setShowFilter(true)}>
            <Filter size={15} style={{ marginRight: 4 }} /> Filter
          </button>
        </div>
      </div>

      {/* Second controls row */}
      <div className="leads-sub-controls">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <select
            className="leads-status-filter"
            value={statusFilter}
            onChange={e => { setStatusFilter(e.target.value); setCurrentPage(1); }}
          >
            <option value="All">All Status</option>
            <option value="Completed">Completed</option>
            <option value="Pending">Pending</option>
            <option value="InProgress">In Progress</option>
          </select>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, justifyContent: 'flex-end' }}>
          <select
            className="leads-per-page"
            value={perPage}
            onChange={e => { setPerPage(Number(e.target.value)); setCurrentPage(1); }}
          >
            {[10, 25, 50, 100].map(v => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>
          <span style={{ fontSize: '13px', color: '#555' }}>entries per page</span>
          <span style={{ fontSize: '13px', color: '#555', marginLeft: '16px' }}>Search:</span>
          <input
            className="leads-search-box"
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search leads..."
          />
        </div>
      </div>

      {/* Table */}
      <div className="table-responsive">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#888' }}>
            <p>Loading leads...</p>
          </div>
        ) : leads.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#888' }}>
            <Users size={36} style={{ marginBottom: 10, opacity: 0.4 }} />
            <p>No leads found. Click <strong>+ New Lead</strong> to add one.</p>
          </div>
        ) : (
          <table className="corporate-table leads-table">
            <thead>
              <tr>
                <th>Sl.No</th>
                <th>Date</th>
                <th>Name</th>
                <th>Mobile</th>
                <th>E-mail</th>
                <th>Referred By</th>
                <th>Follow Up Date</th>
                <th>Description</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead, idx) => {
                const sc = statusColor(lead.status);
                return (
                  <tr key={lead._id || idx} className={idx % 2 === 0 ? 'leads-row-even' : 'leads-row-odd'}>
                    <td>{(currentPage - 1) * perPage + idx + 1}</td>
                    <td style={{ whiteSpace: 'nowrap' }}>
                      <span style={{ color: '#1a6eb5', fontWeight: 500 }}>
                        {formatDate(lead.createdAt || lead.date)}
                      </span>
                    </td>
                    <td>{lead.name}</td>
                    <td>{lead.mobile}</td>
                    <td>
                      <a href={`mailto:${lead.email}`} style={{ color: '#1a6eb5', textDecoration: 'none' }}>
                        {lead.email}
                      </a>
                    </td>
                    <td>{lead.referred_by || lead.referredBy || '—'}</td>
                    <td style={{ whiteSpace: 'nowrap' }}>
                      <span style={{ color: '#1a6eb5', fontWeight: 500 }}>
                        {formatDate(lead.followup_date || lead.followUpDate)}
                      </span>
                    </td>
                    <td style={{ maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {lead.description || '—'}
                    </td>
                    <td>
                      <span
                        className="leads-status-badge"
                        style={{ background: sc.bg, color: sc.color }}
                      >
                        {lead.status || 'Pending'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'nowrap' }}>
                        <button
                          className="leads-icon-btn leads-icon-view"
                          title="View"
                          onClick={() => setViewLead(lead)}
                          style={{ width: 36, height: 36, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          className="leads-icon-btn leads-icon-edit"
                          title="Edit"
                          onClick={() => setEditLead(lead)}
                          style={{ width: 36, height: 36, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
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
        )}
      </div>

      {/* Footer: entries info + pagination */}
      {!loading && leads.length > 0 && (
        <div className="leads-footer-row">
          <span className="leads-entries-info">
            Showing {(currentPage - 1) * perPage + 1} to{' '}
            {Math.min(currentPage * perPage, totalRecords)} of {totalRecords} entries
          </span>

          <div className="pagination-row">
            <button className="page-link-btn" onClick={() => setCurrentPage(1)} disabled={currentPage === 1}>«</button>
            <button className="page-link-btn" onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1}>
              <ChevronLeft size={13} />
            </button>

            {pageNumbers().map((p, i) =>
              p === '...' ? (
                <span key={`dots-${i}`} style={{ padding: '4px 6px', color: '#888', fontSize: '12px' }}>…</span>
              ) : (
                <button
                  key={p}
                  className={`page-link-btn ${currentPage === p ? 'active' : ''}`}
                  onClick={() => setCurrentPage(p)}
                >
                  {p}
                </button>
              )
            )}

            <button className="page-link-btn" onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages}>
              <ChevronRight size={13} />
            </button>
            <button className="page-link-btn" onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages}>»</button>
          </div>
        </div>
      )}

      {/* Modals */}
      {showTodayModal && todayLeads.length > 0 && (
        <TodayLeadsModal
          leads={todayLeads}
          onClose={() => setShowTodayModal(false)}
          onViewLead={(lead) => setViewLead(lead)}
          onEditLead={(lead) => setEditLead(lead)}
          onFilterToday={handleFilterToday}
        />
      )}
      {showCreate && (
        <CreateLeadModal onClose={() => setShowCreate(false)} onSave={handleCreate} />
      )}
      {editLead && (
        <EditLeadModal lead={editLead} onClose={() => setEditLead(null)} onSave={handleEdit} />
      )}
      {showFilter && (
        <FilterModal filter={dateFilter} onClose={() => setShowFilter(false)} onApply={handleApplyFilter} />
      )}

      {/* Top-center Toast */}
      {toast && (
        <Toast message={toast.msg} type={toast.type} onHide={() => setToast(null)} />
      )}
    </div>
  );
}
