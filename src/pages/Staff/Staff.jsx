import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Users, X, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { URLS } from '../../url';
import { formatDate } from '../../utils/dateUtils';
import StaffModal from './StaffModal';
import './Staff.css';

/* ─── Token helper ─── */
const getToken = () => {
  const keys = ['adminToken', 'authToken', 'token', 'accessToken', 'jwt'];
  for (const key of keys) {
    const value = sessionStorage.getItem(key) || localStorage.getItem(key);
    if (value) return value;
  }
  return 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhZG1pbl9pZCI6IjZhNThiZDFjNzE1ZjE4ZTYxZDQxY2Y5MiIsImVtYWlsIjoiZGl2eWFwZW5keWFsYTA3MTdAZ21haWwuY29tIiwiYWRtaW5fc3RhZ2UiOiJzdXBlciIsImlhdCI6MTc4NDIwNDE1OCwiZXhwIjoxODE1NzQwMTU4fQ.1pjPlGU41H1G5ei3AfTEcaWk9O1eyRTG769xnpj5xts';
};

/* ── Initials helper ────────────────────────────────── */
const initials = (name = '') =>
  name.split(' ').slice(0, 2).map(w => w[0] || '').join('').toUpperCase();

/* ── Toast ───────────────────────────────────────────── */
function Toast({ message, type, onHide }) {
  useEffect(() => {
    const t = setTimeout(onHide, 3000);
    return () => clearTimeout(t);
  }, [onHide]);

  return (
    <div className={`st-toast ${type}`}>
      {type === 'success' ? <CheckCircle2 size={15} /> : <AlertTriangle size={15} />}
      {message}
    </div>
  );
}

/* ── Delete Confirm Modal ────────────────────────────── */
function DeleteModal({ isOpen, onClose, onConfirm, name }) {
  const [deleting, setDeleting] = useState(false);
  if (!isOpen) return null;

  const handleConfirm = async () => {
    setDeleting(true);
    await onConfirm();
    setDeleting(false);
  };

  return (
    <div className="st-modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="st-modal st-confirm-modal">
        <div className="st-modal-header">
          <h3>Remove Staff Member</h3>
          <button className="st-modal-close" onClick={onClose}><X size={16} /></button>
        </div>
        <div className="st-confirm-body">
          <div className="st-confirm-icon"><AlertTriangle size={26} /></div>
          <h4>Are you sure?</h4>
          <p>Remove <strong>"{name}"</strong> from staff? They will lose all access to this admin panel.</p>
        </div>
        <div className="st-modal-footer">
          <button className="st-btn-cancel" onClick={onClose}>Cancel</button>
          <button className="st-btn-danger" onClick={handleConfirm} disabled={deleting}>
            {deleting ? <span className="st-spinner" /> : <Trash2 size={14} />}
            Remove
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Main Staff Page Component ─────────────────────────── */
export default function Staff() {
  const [staff, setStaff]           = useState([]);
  const [roles, setRoles]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [editMember, setEditMember] = useState(null);
  const [deleteMember, setDeleteMember] = useState(null);
  const [toast, setToast]           = useState(null);

  /* ─── Fetch staff list with required body ─── */
  const fetchStaff = async () => {
    setLoading(true);
    try {
      const res = await fetch(URLS.GetStaff, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${getToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          page: 1,
          limit: 100,           // fetch a large batch; adjust as needed
          search: '',           // we'll filter client‑side
          admin_stage: '',
          role_id: ''
        })
      });

      const json = await res.json();

      if (res.ok && json.success !== false) {
        // The API may return data under different keys – try common ones
        const staffData = json.data || json.result || json.staff || [];
        setStaff(staffData);
      } else {
        console.error('Staff fetch error:', json);
        setStaff([]);
        showToast(json.message || 'Failed to load staff.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Network error while fetching staff.', 'error');
      setStaff([]);
    } finally {
      setLoading(false);
    }
  };

  /* ─── Fetch roles for dropdown ─── */
  const fetchRoles = async () => {
    try {
      const res = await fetch(URLS.GetActiveRoles, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${getToken()}`,
          'Content-Type': 'application/json'
        }
      });
      const json = await res.json();
      if (res.ok) {
        setRoles(json.data || json.result || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchStaff();
    fetchRoles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const showToast = (msg, type = 'success') => setToast({ msg, type });

  const handleSave = (data, error) => {
    setCreateOpen(false);
    setEditMember(null);
    if (error) {
      showToast(error, 'error');
    } else {
      showToast(editMember ? 'Staff member updated!' : 'Staff member added!');
      fetchStaff();
    }
  };

  const handleDelete = async () => {
    try {
      const res = await fetch(`${URLS.DeleteStaff}${deleteMember._id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${getToken()}`,
          'Content-Type': 'application/json'
        }
      });
      const json = await res.json();
      if (res.ok && json.success !== false) {
        showToast('Staff member removed!');
        setStaff(prev => prev.filter(s => s._id !== deleteMember._id));
      } else {
        showToast(json.message || 'Delete failed', 'error');
      }
    } catch {
      showToast('Delete failed', 'error');
    } finally {
      setDeleteMember(null);
    }
  };

  /* ─── Client‑side search filter ─── */
  const filtered = staff.filter(s => {
    const term = search.toLowerCase();
    return (
      (s.fullName || s.name || '').toLowerCase().includes(term) ||
      (s.email || '').toLowerCase().includes(term) ||
      (s.role?.roleName || '').toLowerCase().includes(term) ||
      (s.adminStage || '').toLowerCase().includes(term) ||
      (s.adminCode || '').toLowerCase().includes(term)
    );
  });

  /* ─── Role name resolver ─── */
const getRoleName = (member) => {
  if (typeof member.role === 'object' && member.role) {
    return member.role.roleName || member.role.name || '—';
  }
  const found = roles.find(r => r._id === member.role);
  return found ? (found.roleName || found.name) : member.role || '—';
};

  // Uses imported formatDate for MM/DD/YYYY format

  return (
    <div className="st-page">
      <div className="st-table-card">
        <div className="st-card-header">
          <div className="st-header-left">
            <h2>Staff Management</h2>
            <p>Add and manage staff accounts and their role assignments.</p>
          </div>
          <button className="st-btn-create" onClick={() => setCreateOpen(true)}>
            <Plus size={15} /> Add Staff
          </button>
        </div>

        <div className="st-search-bar">
          <input
            className="st-search-input"
            type="text"
            placeholder="Search by name, email, role, stage or code..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <div className="st-table-wrap">
          {loading ? (
            <div className="st-empty"><p>Loading...</p></div>
          ) : filtered.length === 0 ? (
            <div className="st-empty">
              <Users size={40} />
              <p>{search ? 'No staff match your search.' : 'No staff members yet. Click \u002B Add Staff to get started.'}</p>
            </div>
          ) : (
            <table className="st-table">
              <thead>
                <tr>
                  <th>Sl.No</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Role</th>
                  <th>Stage</th>
                  <th>Code</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((member, idx) => (
                  <tr key={member._id || idx}>
                    <td>{idx + 1}</td>
                    <td>
                      <div className="st-name-cell">
                        <div className="st-avatar">{initials(member.first_name + ' ' + member.last_name)}</div>
                        <div>
                          <strong>{member.first_name + ' ' + member.last_name}</strong>
                        </div>
                      </div>
                    </td>
                    <td>{member.email}</td>
                    <td>{member.contact_number || '—'}</td>
                    <td>
                      <span className="st-role-badge">{getRoleName(member)}</span>
                    </td>
                    <td>{member.admin_stage || '—'}</td>
                    <td>{member.admin_code || '—'}</td>
                    <td>
                      <span className={`st-badge ${member.isActive !== false ? 'st-badge-active' : 'st-badge-inactive'}`}>
                        {member.isActive !== false ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <div className="st-actions">
                        <button
                          className="st-btn-icon st-btn-edit"
                          title="Edit"
                          onClick={() => setEditMember(member)}
                        >
                          <Pencil size={13} />
                        </button>
                        <button
                          className="st-btn-icon st-btn-delete"
                          title="Remove"
                          onClick={() => setDeleteMember(member)}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modals */}
      <StaffModal
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        onSave={handleSave}
        editData={null}
        roles={roles}
      />
      <StaffModal
        isOpen={!!editMember}
        onClose={() => setEditMember(null)}
        onSave={handleSave}
        editData={editMember}
        roles={roles}
      />
      <DeleteModal
        isOpen={!!deleteMember}
        onClose={() => setDeleteMember(null)}
        onConfirm={handleDelete}
        name={deleteMember?.fullName || deleteMember?.name || ''}
      />

      {toast && <Toast message={toast.msg} type={toast.type} onHide={() => setToast(null)} />}
    </div>
  );
}