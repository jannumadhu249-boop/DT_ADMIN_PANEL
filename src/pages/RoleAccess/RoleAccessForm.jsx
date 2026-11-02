import React, { useState, useEffect } from 'react';
import { Plus, Pencil, ArrowLeft, Shield, CheckCircle, Circle, AlertTriangle } from 'lucide-react';
import { URLS } from '../../url';

const getToken = () => {
  const keys = ['adminToken', 'authToken', 'token', 'accessToken', 'jwt'];
  for (const key of keys) {
    const value = sessionStorage.getItem(key) || localStorage.getItem(key);
    if (value) return value;
  }
  return 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhZG1pbl9pZCI6IjZhNThiZDFjNzE1ZjE4ZTYxZDQxY2Y5MiIsImVtYWlsIjoiZGl2eWFwZW5keWFsYTA3MTdAZ21haWwuY29tIiwiYWRtaW5fc3RhZ2UiOiJzdXBlciIsImlhdCI6MTc4NDIwNDE1OCwiZXhwIjoxODE1NzQwMTU4fQ.1pjPlGU41H1G5ei3AfTEcaWk9O1eyRTG769xnpj5xts';
};

/* ── Module Configuration (grouped by category) ────── */
const MODULE_CONFIG = [
  { category: 'View Modules', modules: [{ name: 'All Registered', permissions: ['view'] }] },
  { category: 'Pre-Processing', modules: [
      { name: 'Registered Users', permissions: ['view'] },
      { name: 'Basic Information Pending', permissions: ['view'] },
      { name: 'Scheduling Pending', permissions: ['view'] },
      { name: 'Interview Pending', permissions: ['view'] },
      { name: 'Document', permissions: ['view'] },
    ]
  },
  { category: 'Preparation', modules: [
      { name: 'Preparation-1', permissions: ['view'] },
      { name: 'Preparation-2', permissions: ['view'] },
      { name: 'Review & Summary-1', permissions: ['view'] },
      { name: 'Review & Summary-2', permissions: ['view'] },
      { name: 'ITIN Files', permissions: ['view'] },
      { name: 'Revised Estimate', permissions: ['view'] },
    ]
  },
  { category: 'Payment', modules: [
      { name: 'Payment Pending - Efiling', permissions: ['view'] },
      { name: 'Payment Pending - Paper Filing', permissions: ['view'] },
      { name: 'Fee Payment Received -1', permissions: ['view'] },
      { name: 'Fee Payment Received -2', permissions: ['view'] },
    ]
  },
  { category: 'Client Review', modules: [
      { name: 'Client Review - Efiling', permissions: ['view'] },
      { name: 'Client Review - Paper Filing', permissions: ['view'] },
    ]
  },
  { category: 'Efiling', modules: [
      { name: 'Efiling Pending -1', permissions: ['view'] },
      { name: 'Efiling Pending -2', permissions: ['view'] },
      { name: 'E-filing & Awaiting Acceptance -1', permissions: ['view'] },
      { name: 'E-filing & Awaiting Acceptance -2', permissions: ['view'] },
      { name: 'Efiled & Rejected', permissions: ['view'] },
      { name: 'City Return', permissions: ['view'] },
      { name: 'E-filing Accepted & Complete', permissions: ['view'] },
    ]
  },
  { category: 'Paper Filing', modules: [
      { name: 'Paper Filing Pending', permissions: ['view'] },
      { name: 'Paper Filing Done', permissions: ['view'] },
    ]
  },
  { category: 'Other Views', modules: [
      { name: 'Cancelled', permissions: ['view'] },
      { name: 'Client Search', permissions: ['view'] },
      { name: 'Referrals', permissions: ['view'] },
      { name: 'Query List', permissions: ['view'] },
      { name: 'Client Stage', permissions: ['view'] },
      { name: 'Just Uploaded Docs', permissions: ['view'] },
      { name: 'Callback Requests', permissions: ['view'] },
      { name: 'Mailgun', permissions: ['view'] },
      { name: 'Send Mail', permissions: ['view'] },
    ]
  },
  { category: 'Edit/Update Modules', modules: [
      { name: 'Referee', permissions: ['view', 'edit'] },
    ]
  },
  { category: 'Full CRUD Modules', modules: [
      { name: 'Dashboard Content', permissions: ['view', 'create', 'edit', 'delete'] },
      { name: 'Leads', permissions: ['view', 'create', 'edit'] },
      { name: 'Notes', permissions: ['view', 'create', 'edit'] },
      { name: 'Staff', permissions: ['view', 'create', 'edit', 'delete'] },
      { name: 'Role Access', permissions: ['view', 'create', 'edit', 'delete'] },
    ]
  }
];

const ALL_MODULE_NAMES = MODULE_CONFIG.flatMap(cat => cat.modules.map(m => m.name));
const MODULE_PERMISSIONS_MAP = Object.fromEntries(
  MODULE_CONFIG.flatMap(cat => cat.modules.map(m => [m.name, m.permissions]))
);

const createPermissionObject = (moduleName) => ({
  module: moduleName,
  view: false,
  create: false,
  edit: false,
  delete: false,
  all: false,
});

const initPermissionsFromData = (permissionsArray) => {
  if (!Array.isArray(permissionsArray)) return [];
  if (permissionsArray.length > 0 && typeof permissionsArray[0] === 'string') {
    return permissionsArray.map(name => ({
      module: name,
      view: true,
      create: false,
      edit: false,
      delete: false,
      all: false,
    }));
  }
  return permissionsArray.map(p => ({
    module: p.module,
    view: p.view || false,
    create: p.create || false,
    edit: p.edit || false,
    delete: p.delete || false,
    all: p.all || false,
  }));
};

export default function RoleAccessForm({ editData, onSave, onCancel }) {
  const isEdit = !!editData;

  const [form, setForm] = useState({
    roleName: '',
    permissions: [],
    isActive: true,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (editData) {
      const perms = initPermissionsFromData(editData.permissions || []);
      setForm({
        roleName: editData.roleName || editData.name || '',
        permissions: perms,
        isActive: editData.isActive !== false,
      });
    } else {
      setForm({ roleName: '', permissions: [], isActive: true });
    }
    setError('');
  }, [editData]);

  // ── Permission toggles ──
  const togglePermissionFlag = (moduleName, flag) => {
    const allowed = MODULE_PERMISSIONS_MAP[moduleName] || [];
    if (!allowed.includes(flag)) return;
    setForm(f => ({
      ...f,
      permissions: f.permissions.map(p =>
        p.module === moduleName
          ? { ...p, [flag]: !p[flag], all: false } 
          : p
      ),
    }));
  };

  const toggleModuleSelection = (moduleName) => {
    const exists = form.permissions.some(p => p.module === moduleName);
    if (exists) {
      setForm(f => ({
        ...f,
        permissions: f.permissions.filter(p => p.module !== moduleName),
      }));
    } else {
      const newPerm = createPermissionObject(moduleName);
      setForm(f => ({
        ...f,
        permissions: [...f.permissions, newPerm],
      }));
    }
  };

  const handleModuleSelectAll = (moduleName, allowedActions, isChecked) => {
    setForm(f => ({
      ...f,
      permissions: f.permissions.map(p =>
        p.module === moduleName
          ? {
              ...p,
              ...Object.fromEntries(allowedActions.map(action => [action, isChecked])),
              all: isChecked,
            }
          : p
      ),
    }));
  };

  const handleGlobalSelectAll = (isChecked) => {
    if (isChecked) {
      const allPerms = ALL_MODULE_NAMES.map(moduleName => {
        const allowed = MODULE_PERMISSIONS_MAP[moduleName] || [];
        const obj = createPermissionObject(moduleName);
        allowed.forEach(action => { obj[action] = true; });
        obj.all = allowed.every(action => obj[action]);
        return obj;
      });
      setForm(f => ({ ...f, permissions: allPerms }));
    } else {
      setForm(f => ({ ...f, permissions: [] }));
    }
  };

  const selectAll = () => handleGlobalSelectAll(true);
  const clearAll = () => handleGlobalSelectAll(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.roleName.trim()) {
      setError('Role name is required.');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      const payload = {
        name: form.roleName.trim(),
        permissions: form.permissions.map(p => ({
          module: p.module,
          view: p.view || false,
          create: p.create || false,
          edit: p.edit || false,
          delete: p.delete || false,
          all: p.all || false,
        })),
        isActive: form.isActive,
      };
      const url = isEdit
        ? `${URLS.UpdateRole}${editData._id || editData.id}`
        : URLS.CreateRole;
      const method = isEdit ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${getToken()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (res.ok && json.success !== false) {
        onSave(json.data || json.result || json);
      } else {
        throw new Error(json.message || 'Request failed');
      }
    } catch (err) {
      setError(err.message || 'Something went wrong');
      onSave(null, err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="ra-page">
      {/* Navigation & Header */}
      <div className="ra-form-header-bar">
        <button type="button" className="ra-back-btn" onClick={onCancel}>
          <ArrowLeft size={16} /> Back to Role Access
        </button>
      </div>

      <div className="ra-table-card ra-form-card">
        {/* Header */}
        <div className="ra-card-header ra-form-card-header">
          <div className="ra-header-left">
            <h2>{isEdit ? `Edit Role: ${editData?.name || editData?.roleName || ''}` : 'Create New Role'}</h2>
            <p>Define role details and assign module permissions for staff access.</p>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="ra-form">
          {error && (
            <div className="ra-form-error">
              <AlertTriangle size={16} />
              <span>{error}</span>
            </div>
          )}

          {/* Role Name & Status inputs */}
          <div className="ra-form-grid">
            <div className="ra-form-group">
              <label className="ra-label">
                Role Name <span className="ra-required">*</span>
              </label>
              <input
                type="text"
                className="ra-input"
                placeholder="e.g. Super Admin, Staff, Manager"
                value={form.roleName}
                onChange={e => setForm(f => ({ ...f, roleName: e.target.value }))}
                required
              />
            </div>

            <div className="ra-form-group">
              <label className="ra-label">Status</label>
              <div className="ra-status-toggle">
                <label className={`ra-status-option ${form.isActive ? 'active' : ''}`}>
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))}
                  />
                  {form.isActive ? (
                    <><CheckCircle size={15} color="#16a34a" /> Active</>
                  ) : (
                    <><Circle size={15} color="#94a3b8" /> Inactive</>
                  )}
                </label>
              </div>
            </div>
          </div>

          {/* Module Permissions */}
          <div className="ra-permissions-section">
            <div className="ra-perm-header">
              <div>
                <h3 className="ra-perm-title">Module Permissions</h3>
                <span className="ra-perm-subtitle">
                  ({form.permissions.length} modules selected)
                </span>
              </div>
              <div className="ra-perm-actions">
                <button type="button" className="ra-btn-link" onClick={selectAll}>
                  + Select All
                </button>
                <button type="button" className="ra-btn-link-sec" onClick={clearAll}>
                  ✕ Clear
                </button>
              </div>
            </div>

            <div className="ra-modules-container">
              {MODULE_CONFIG.map((group, idx) => (
                <div key={idx} className="ra-module-group">
                  <h4 className="ra-group-title">{group.category}</h4>
                  <div className="ra-group-list">
                    {group.modules.map(module => {
                      const permObj = form.permissions.find(p => p.module === module.name);
                      const isSelected = !!permObj;
                      const allowed = MODULE_PERMISSIONS_MAP[module.name] || [];
                      const allActionsChecked = allowed.every(action => permObj?.[action] === true);

                      return (
                        <div key={module.name} className={`ra-module-row ${isSelected ? 'selected' : ''}`}>
                          <div className="ra-module-left">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleModuleSelection(module.name)}
                              className="ra-checkbox"
                            />
                            <span className="ra-module-name">{module.name}</span>
                          </div>

                          <div className="ra-module-right">
                            {allowed.length > 1 && (
                              <label className={`ra-action-label ${isSelected ? '' : 'disabled'}`}>
                                <input
                                  type="checkbox"
                                  checked={allActionsChecked && isSelected}
                                  disabled={!isSelected}
                                  onChange={(e) => handleModuleSelectAll(module.name, allowed, e.target.checked)}
                                  className="ra-checkbox"
                                />
                                <span className="ra-action-all">All</span>
                              </label>
                            )}
                            {allowed.map(action => (
                              <label key={action} className={`ra-action-label ${isSelected ? '' : 'disabled'}`}>
                                <input
                                  type="checkbox"
                                  checked={permObj?.[action] || false}
                                  disabled={!isSelected}
                                  onChange={() => togglePermissionFlag(module.name, action)}
                                  className="ra-checkbox"
                                />
                                <span>{action.charAt(0).toUpperCase() + action.slice(1)}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer Action Buttons */}
          <div className="ra-form-footer">
            <button type="button" className="ra-btn-cancel" onClick={onCancel}>
              Cancel
            </button>
            <button type="submit" className="ra-btn-submit" disabled={submitting}>
              {submitting ? (
                <span className="ra-spinner" />
              ) : isEdit ? (
                <Pencil size={15} />
              ) : (
                <Plus size={15} />
              )}
              {isEdit ? 'Update Role' : 'Create Role'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
