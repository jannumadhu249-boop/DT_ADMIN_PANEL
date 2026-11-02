import React, { useState, useEffect, useCallback } from 'react';
import { Search, Edit3, Plus, ChevronLeft, ChevronRight, Trash2, AlertTriangle, CheckCircle2, X, Loader2 } from 'lucide-react';
import CreateNoteModal from './CreateNoteModal';
import EditNoteModal from './EditNoteModal';
import { URLS } from '../../url';
import { formatDate } from '../../utils/dateUtils';

/* ─── Token helper ─── */
const getToken = () => {
  const keys = ['adminToken', 'authToken', 'token', 'accessToken', 'jwt'];
  for (const key of keys) {
    const value = sessionStorage.getItem(key) || localStorage.getItem(key);
    if (value) return value;
  }
  return '';
};

/* ─── Toast ─── */
function Toast({ message, type, onHide }) {
  useEffect(() => {
    const t = setTimeout(onHide, 3500);
    return () => clearTimeout(t);
  }, [onHide]);

  return (
    <div style={{
      position: 'fixed', top: '20px', right: '20px', zIndex: 9999,
      display: 'flex', alignItems: 'center', gap: '8px',
      padding: '12px 18px', borderRadius: '8px',
      boxShadow: '0 4px 16px rgba(0,0,0,0.15)', fontSize: '13px', fontWeight: '600',
      backgroundColor: type === 'success' ? '#ecfdf5' : '#fef2f2',
      border: `1px solid ${type === 'success' ? '#a7f3d0' : '#fecaca'}`,
      color: type === 'success' ? '#047857' : '#b91c1c',
    }}>
      {type === 'success' ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
      {message}
    </div>
  );
}

/* ─── Delete Confirm Modal ─── */
function DeleteModal({ isOpen, onClose, onConfirm, noteText }) {
  const [deleting, setDeleting] = useState(false);
  if (!isOpen) return null;

  const handleConfirm = async () => {
    setDeleting(true);
    await onConfirm();
    setDeleting(false);
  };

  return (
    <div
      style={{
        position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
        backgroundColor: 'rgba(0,0,0,0.45)', display: 'flex',
        justifyContent: 'center', alignItems: 'center', zIndex: 1100,
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div style={{
        backgroundColor: '#fff', borderRadius: '10px', width: '400px', maxWidth: '90%',
        boxShadow: '0 8px 32px rgba(0,0,0,0.18)', overflow: 'hidden',
      }}>
        <div style={{ padding: '14px 18px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#dc3545' }}>Delete Note</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888' }}>
            <X size={18} />
          </button>
        </div>
        <div style={{ padding: '24px 18px', textAlign: 'center' }}>
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>🗑️</div>
          <h4 style={{ margin: '0 0 8px', fontSize: '15px', color: '#111' }}>Are you sure?</h4>
          <p style={{ margin: 0, fontSize: '13px', color: '#666', lineHeight: '1.6' }}>
            Deleting: <strong>"{noteText?.slice(0, 60)}{noteText?.length > 60 ? '…' : ''}"</strong><br />
            This action <strong>cannot</strong> be undone.
          </p>
        </div>
        <div style={{ padding: '12px 18px', borderTop: '1px solid #eee', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
          <button onClick={onClose} disabled={deleting}
            style={{ backgroundColor: '#6c757d', color: '#fff', border: 'none', padding: '7px 16px', borderRadius: '5px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>
            Cancel
          </button>
          <button onClick={handleConfirm} disabled={deleting}
            style={{ backgroundColor: '#dc3545', color: '#fff', border: 'none', padding: '7px 16px', borderRadius: '5px', cursor: 'pointer', fontSize: '13px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}>
            {deleting ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Trash2 size={14} />}
            {deleting ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── API helpers ─── */
const apiFetchNotes = async ({ page, limit, search }) => {
  const token = getToken();
  const res = await fetch(URLS.GetNotes, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ page, limit: String(limit), search: search || '', status: '', from_date: '', to_date: '' }),
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
};

const apiCreateNote = async (payload) => {
  const token = getToken();
  const res = await fetch(URLS.CreateNotes, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });
  const json = await res.json();
  if (!res.ok || !json.success) throw new Error(json.message || 'Failed to create note');
  return json;
};

const apiUpdateNote = async (id, payload) => {
  const token = getToken();
  const res = await fetch(URLS.UpdateNotes + id, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });
  const json = await res.json();
  if (!res.ok || !json.success) throw new Error(json.message || 'Failed to update note');
  return json;
};

const apiDeleteNote = async (id) => {
  const token = getToken();
  const res = await fetch(URLS.DeleteNotes + id, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
  });
  const json = await res.json();
  if (!res.ok || !json.success) throw new Error(json.message || 'Failed to delete note');
  return json;
};

/* ─── Main Component ─── */
export default function Notes() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [perPage, setPerPage] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({ currentPage: 1, limit: 20, totalRecords: 0, totalPages: 1 });

  const [showCreate, setShowCreate] = useState(false);
  const [editNote, setEditNote] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [toast, setToast] = useState(null);
  
  // Today's notes popup
  const [todaysNotesPopup, setTodaysNotesPopup] = useState(false);
  const [todaysNotes, setTodaysNotes] = useState([]);

  const showToast = (message, type = 'success') => setToast({ message, type });
  const hideToast = useCallback(() => setToast(null), []);
  
  // Check for today's notes on component mount
  useEffect(() => {
    const checkTodaysNotes = () => {
      const today = new Date().toISOString().split('T')[0];
      const todayNotesList = notes.filter(note => {
        const noteDate = note.date ? note.date.split('T')[0] : '';
        return noteDate === today;
      });
      
      if (todayNotesList.length > 0) {
        setTodaysNotes(todayNotesList);
        setTodaysNotesPopup(true);
      }
    };
    
    if (!loading && notes.length > 0) {
      checkTodaysNotes();
    }
  }, [loading, notes]);

  /* ─── Fetch from API ─── */
  const loadNotes = useCallback(async (page, limit, search) => {
    setLoading(true);
    try {
      const json = await apiFetchNotes({ page, limit, search });
      if (json.success) {
        setNotes(json.data || []);
        if (json.pagination) setPagination(json.pagination);
      } else {
        setNotes([]);
        showToast(json.message || 'Failed to load notes.', 'error');
      }
    } catch (err) {
      console.error('Fetch notes error:', err);
      setNotes([]);
      showToast('Network error while fetching notes.', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  /* ─── Load on page / perPage change ─── */
  useEffect(() => {
    loadNotes(currentPage, perPage, searchTerm);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, perPage]);

  /* ─── Debounced search ─── */
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1);
      loadNotes(1, perPage, searchTerm);
    }, 450);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]);

  /* ─── Handlers ─── */
  const handlePerPageChange = (val) => {
    setPerPage(val);
    setCurrentPage(1);
  };

  const handleCreate = async (payload) => {
    try {
      await apiCreateNote(payload);
      showToast('Note created successfully.');
      setShowCreate(false);
      setCurrentPage(1);
      loadNotes(1, perPage, searchTerm);
    } catch (err) {
      showToast(err.message || 'Failed to create note.', 'error');
    }
  };

  const handleUpdate = async (id, payload) => {
    try {
      await apiUpdateNote(id, payload);
      showToast('Note updated successfully.');
      setEditNote(null);
      loadNotes(currentPage, perPage, searchTerm);
    } catch (err) {
      showToast(err.message || 'Failed to update note.', 'error');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await apiDeleteNote(deleteTarget._id);
      showToast('Note deleted successfully.');
      setDeleteTarget(null);
      const newTotal = (pagination.totalRecords || 1) - 1;
      const maxPage = Math.ceil(newTotal / perPage) || 1;
      const targetPage = currentPage > maxPage ? maxPage : currentPage;
      setCurrentPage(targetPage);
      loadNotes(targetPage, perPage, searchTerm);
    } catch (err) {
      showToast(err.message || 'Failed to delete note.', 'error');
      setDeleteTarget(null);
    }
  };

  /* ─── Pagination ─── */
  const totalPages = pagination.totalPages || 1;

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - 2);
    let end = Math.min(totalPages, currentPage + 2);
    if (end - start < maxVisible - 1) {
      if (start === 1) end = Math.min(totalPages, start + maxVisible - 1);
      else start = Math.max(1, end - maxVisible + 1);
    }
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  };

  return (
    <div className="content-card" style={{ animation: 'fadeIn 0.2s ease-out' }}>
      {toast && <Toast message={toast.message} type={toast.type} onHide={hideToast} />}

      <h2 className="view-title">Notes Dashboard</h2>

      {/* Controls */}
      <div style={{
        display: 'flex', flexWrap: 'wrap', gap: '12px',
        marginBottom: '16px', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <select
            className="search-input-box"
            style={{ width: '80px' }}
            value={perPage}
            onChange={e => handlePerPageChange(Number(e.target.value))}
          >
            {[10, 25, 50, 100].map(v => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>

          <div className="search-input-box" style={{ display: 'flex', alignItems: 'center', minWidth: '220px' }}>
            <Search size={14} style={{ marginRight: '4px', color: '#888', flexShrink: 0 }} />
            <input
              type="text"
              placeholder="Search employee or note…"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{ border: 'none', outline: 'none', flex: 1, background: 'transparent' }}
            />
          </div>
        </div>

        <button
          className="btn-view-action"
          style={{
            backgroundColor: 'var(--color-green-btn)', color: '#fff',
            display: 'flex', alignItems: 'center', gap: '4px',
            padding: '6px 14px', borderRadius: 'var(--radius-sm)',
            border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: '600',
          }}
          onClick={() => setShowCreate(true)}
        >
          <Plus size={14} /> New Note
        </button>
      </div>

      {/* Table */}
      <div className="table-responsive">
        <table className="corporate-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ width: '60px' }}>S.No</th>
              <th>Date</th>
              <th>Employee Name</th>
              <th>Notes</th>
              <th style={{ width: '110px' }}>Status</th>
              <th style={{ width: '90px', textAlign: 'center' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '48px', color: '#888' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                    <Loader2 size={26} style={{ animation: 'spin 1s linear infinite' }} />
                    <span style={{ fontSize: '13px' }}>Loading notes…</span>
                  </div>
                </td>
              </tr>
            ) : notes.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '48px', color: '#888', fontSize: '14px' }}>
                  No notes found.
                </td>
              </tr>
            ) : (
              notes.map((n, idx) => (
                <tr key={n._id}>
                  <td>{(currentPage - 1) * perPage + idx + 1}</td>
                  <td>{n.date ? formatDate(n.date) : '—'}</td>
                  <td>{n.employee_name || '—'}</td>
                  <td>{n.notes || '—'}</td>
                  <td>
                    <span
                      className="status-badge"
                      style={{
                        backgroundColor: n.status === 'Solved' ? 'rgba(40,167,69,0.15)' : 'rgba(255,193,7,0.15)',
                        color: n.status === 'Solved' ? '#28a745' : '#ffc107',
                        padding: '3px 10px',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '12px',
                        fontWeight: '600',
                        display: 'inline-block',
                      }}
                    >
                      {n.status || 'Pending'}
                    </span>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '4px' }}>
                      <button
                        type="button"
                        onClick={() => setEditNote(n)}
                        title="Edit"
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#3b82f6', padding: '4px 6px', borderRadius: '4px', transition: 'background 0.15s ease' }}
                        onMouseEnter={e => e.currentTarget.style.background = '#eff6ff'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <Edit3 size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(n)}
                        title="Delete"
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc3545', padding: '4px 6px', borderRadius: '4px', transition: 'background 0.15s ease' }}
                        onMouseEnter={e => e.currentTarget.style.background = '#fef2f2'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer: record count + pagination */}
      {!loading && notes.length > 0 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '14px', flexWrap: 'wrap', gap: '10px' }}>
          <span style={{ fontSize: '12px', color: '#888' }}>
            Showing {(currentPage - 1) * perPage + 1}–{Math.min(currentPage * perPage, pagination.totalRecords)} of {pagination.totalRecords} records
          </span>

          {totalPages > 1 && (
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
              <button
                className="btn-view-action"
                disabled={currentPage === 1}
                onClick={() => goToPage(currentPage - 1)}
                style={{
                  padding: '6px 12px',
                  backgroundColor: currentPage === 1 ? '#e5e7eb' : 'var(--color-green-btn)',
                  color: currentPage === 1 ? '#9ca3af' : '#fff',
                  border: 'none', borderRadius: 'var(--radius-sm)',
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                  fontSize: '13px', fontWeight: '500',
                }}
              >
                <ChevronLeft size={14} style={{ verticalAlign: 'middle' }} /> Prev
              </button>

              {getPageNumbers().map(p => (
                <button
                  key={p}
                  className="btn-view-action"
                  onClick={() => goToPage(p)}
                  style={{
                    padding: '6px 12px', minWidth: '36px',
                    backgroundColor: p === currentPage ? 'var(--color-green-btn)' : '#f3f4f6',
                    color: p === currentPage ? '#fff' : '#374151',
                    border: 'none', borderRadius: 'var(--radius-sm)',
                    cursor: 'pointer', fontSize: '13px',
                    fontWeight: p === currentPage ? '700' : '500',
                  }}
                >
                  {p}
                </button>
              ))}

              <button
                className="btn-view-action"
                disabled={currentPage === totalPages}
                onClick={() => goToPage(currentPage + 1)}
                style={{
                  padding: '6px 12px',
                  backgroundColor: currentPage === totalPages ? '#e5e7eb' : 'var(--color-green-btn)',
                  color: currentPage === totalPages ? '#9ca3af' : '#fff',
                  border: 'none', borderRadius: 'var(--radius-sm)',
                  cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                  fontSize: '13px', fontWeight: '500',
                }}
              >
                Next <ChevronRight size={14} style={{ verticalAlign: 'middle' }} />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      {showCreate && (
        <CreateNoteModal
          onClose={() => setShowCreate(false)}
          onSave={handleCreate}
        />
      )}
      {editNote && (
        <EditNoteModal
          note={editNote}
          onClose={() => setEditNote(null)}
          onUpdate={handleUpdate}
        />
      )}
      <DeleteModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        noteText={deleteTarget?.notes}
      />
      
      {/* Today's Notes Popup */}
      {todaysNotesPopup && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '16px' }}>
          <div style={{ background: '#fff', borderRadius: '14px', width: '100%', maxWidth: '600px', boxShadow: '0 25px 50px rgba(0,0,0,0.2)', overflow: 'hidden' }}>
            {/* Header */}
            <div style={{ background: 'linear-gradient(135deg, #0076a3, #005f8a)', padding: '18px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ background: 'rgba(255,255,255,0.2)', borderRadius: '8px', padding: '8px', display: 'flex' }}>
                  <CheckCircle2 size={20} color="#fff" />
                </div>
                <div>
                  <p style={{ color: '#fff', fontWeight: '700', fontSize: '16px', margin: 0 }}>
                    Today's Notes
                  </p>
                  <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px', margin: 0 }}>
                    {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                </div>
              </div>
              <button onClick={() => setTodaysNotesPopup(false)} type="button" style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', opacity: 0.85, padding: '4px' }}>
                <X size={20} />
              </button>
            </div>

            {/* Body */}
            <div style={{ padding: '20px', maxHeight: '400px', overflowY: 'auto' }}>
              <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '16px' }}>
                You have {todaysNotes.length} note{todaysNotes.length !== 1 ? 's' : ''} scheduled for today:
              </p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {todaysNotes.map((note, idx) => (
                  <div key={note._id || idx} style={{ 
                    padding: '14px', 
                    background: '#f8fafc', 
                    border: '1px solid #e2e8f0', 
                    borderRadius: '8px',
                    borderLeft: `4px solid ${note.status === 'Solved' ? '#28a745' : '#ffc107'}`
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
                      <div style={{ fontWeight: '600', fontSize: '14px', color: '#0f172a' }}>
                        {note.employee_name || 'No Employee Name'}
                      </div>
                      <span style={{
                        padding: '3px 8px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: '600',
                        backgroundColor: note.status === 'Solved' ? 'rgba(40,167,69,0.15)' : 'rgba(255,193,7,0.15)',
                        color: note.status === 'Solved' ? '#28a745' : '#ffc107'
                      }}>
                        {note.status || 'Pending'}
                      </span>
                    </div>
                    <div style={{ fontSize: '13px', color: '#475569', lineHeight: '1.5' }}>
                      {note.notes || 'No details provided'}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div style={{ padding: '12px 20px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end' }}>
              <button 
                onClick={() => setTodaysNotesPopup(false)} 
                style={{ 
                  padding: '8px 20px', 
                  border: 'none', 
                  borderRadius: '6px', 
                  background: '#0076a3', 
                  color: '#fff', 
                  fontSize: '13px', 
                  fontWeight: '600', 
                  cursor: 'pointer' 
                }}
              >
                Got it!
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
