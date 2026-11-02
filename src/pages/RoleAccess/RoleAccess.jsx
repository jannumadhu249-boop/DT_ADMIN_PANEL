import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Shield, X, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { URLS } from '../../url';
import RoleAccessForm from './RoleAccessForm';
import './RoleAccess.css';

/* ─── Token helper ─── */
const getToken = () => {
  const keys = ['adminToken', 'authToken', 'token', 'accessToken', 'jwt'];
  for (const key of keys) {
    const value = sessionStorage.getItem(key) || localStorage.getItem(key);
    if (value) return value;
  }
  return 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhZG1pbl9pZCI6IjZhNThiZDFjNzE1ZjE4ZTYxZDQxY2Y5MiIsImVtYWlsIjoiZGl2eWFwZW5keWFsYTA3MTdAZ21haWwuY29tIiwiYWRtaW5fc3RhZ2UiOiJzdXBlciIsImlhdCI6MTc4NDIwNDE1OCwiZXhwIjoxODE1NzQwMTU4fQ.1pjPlGU41H1G5ei3AfTEcaWk9O1eyRTG769xnpj5xts';
};

/* ── Toast ───────────────────────────────────────────── */
function Toast({ message, type, onHide }) {
  useEffect(() => {
    const t = setTimeout(onHide, 3000);
    return () => clearTimeout(t);
  }, [onHide]);

  return (
    <div className={`ra-toast ${type}`}>
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
    <div className="ra-modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="ra-modal ra-confirm-modal">
        <div className="ra-modal-header">
          <h3>Delete Role</h3>
          <button className="ra-modal-close" onClick={onClose}><X size={16} /></button>
        </div>
        <div className="ra-confirm-body">
          <div className="ra-confirm-icon"><AlertTriangle size={26} /></div>
          <h4>Are you sure?</h4>
          <p>Delete role <strong>"{name}"</strong>? Staff assigned to this role may lose access.</p>
        </div>
        <div className="ra-modal-footer">
          <button className="ra-btn-cancel" onClick={onClose}>Cancel</button>
          <button className="ra-btn-danger" onClick={handleConfirm} disabled={deleting}>
            {deleting ? <span className="ra-spinner" /> : <Trash2 size={14} />}
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Main Role Access Page Component ──────────────────── */
export default function RoleAccess() {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewState, setViewState] = useState('list'); // 'list' | 'create' | 'edit'
  const [editRole, setEditRole] = useState(null);
  const [deleteRole, setDeleteRole] = useState(null);
  const [toast, setToast] = useState(null);

  /* Fetch */
  const fetchRoles = async () => {
    setLoading(true);
    try {
      const res = await fetch(URLS.GetRoles, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${getToken()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      });
      const json = await res.json();
      if (res.ok) setRoles(json.data || json.result || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRoles(); }, []);

  const showToast = (msg, type = 'success') => setToast({ msg, type });

  const handleSave = (data, error) => {
    if (error) {
      showToast(error, 'error');
    } else {
      showToast(viewState === 'edit' ? 'Role updated successfully!' : 'Role created successfully!');
      setViewState('list');
      setEditRole(null);
      fetchRoles();
    }
  };

  const handleCancelForm = () => {
    setViewState('list');
    setEditRole(null);
  };

  const handleDelete = async () => {
    try {
      const res = await fetch(`${URLS.DeleteRole}${deleteRole._id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const json = await res.json();
      if (res.ok && json.success !== false) {
        showToast('Role deleted successfully!');
        setRoles(prev => prev.filter(r => r._id !== deleteRole._id));
      } else {
        showToast(json.message || 'Delete failed', 'error');
      }
    } catch {
      showToast('Delete failed', 'error');
    } finally {
      setDeleteRole(null);
    }
  };

  if (viewState === 'create' || viewState === 'edit') {
    return (
      <RoleAccessForm
        editData={viewState === 'edit' ? editRole : null}
        onSave={handleSave}
        onCancel={handleCancelForm}
      />
    );
  }

  return (
    <div className="ra-page">
      {/* Table Card containing Header, Create Button, and Table inside */}
      <div className="ra-table-card">
        <div className="ra-card-header">
          <div className="ra-header-left">
            <h2>Role Access</h2>
            <p>Define roles and assign page-level permissions to control staff access.</p>
          </div>
          <button className="ra-btn-create" onClick={() => { setEditRole(null); setViewState('create'); }}>
            <Plus size={15} /> Create Role
          </button>
        </div>

        <div className="ra-table-wrap">
          {loading ? (
            <div className="ra-empty"><p>Loading...</p></div>
          ) : roles.length === 0 ? (
            <div className="ra-empty">
              <Shield size={40} />
              <p>No roles yet. Click <strong>+ Create Role</strong> to get started.</p>
            </div>
          ) : (
            <table className="ra-table">
              <thead>
                <tr>
                  <th>Sl.No</th>
                  <th>Role Name</th>
                  <th>Permissions</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {roles.map((role, idx) => (
                  <tr key={role._id || idx}>
                    <td>{idx + 1}</td>
                    <td><span className="ra-role-name">{role.name}</span></td>
                    <td>
                      <span className="ra-perm-badge">
                        {(role.permissions || []).length} pages assigned
                      </span>
                    </td>
                    <td>
                      <span className={`ra-badge ${role.isActive !== false ? 'ra-badge-active' : 'ra-badge-inactive'}`}>
                        {role.isActive !== false ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <div className="ra-actions">
                        <button
                          className="ra-btn-icon ra-btn-edit"
                          title="Edit"
                          onClick={() => { setEditRole(role); setViewState('edit'); }}
                        >
                          <Pencil size={13} />
                        </button>
                        <button
                          className="ra-btn-icon ra-btn-delete"
                          title="Delete"
                          onClick={() => setDeleteRole(role)}
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

      <DeleteModal isOpen={!!deleteRole} onClose={() => setDeleteRole(null)} onConfirm={handleDelete} name={deleteRole?.name || deleteRole?.roleName || ''} />

      {toast && <Toast message={toast.msg} type={toast.type} onHide={() => setToast(null)} />}
    </div>
  );
}

