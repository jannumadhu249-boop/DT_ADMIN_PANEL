import React, { useState, useEffect } from 'react';
import { Plus, Pencil, X, CheckCircle, Circle } from 'lucide-react';
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
      // { name: 'M Note', permissions: ['view'] },
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

// Build flat list of all module names for quick lookups
const ALL_MODULE_NAMES = MODULE_CONFIG.flatMap(cat => cat.modules.map(m => m.name));
const MODULE_PERMISSIONS_MAP = Object.fromEntries(
  MODULE_CONFIG.flatMap(cat => cat.modules.map(m => [m.name, m.permissions]))
);

// Helper to create a permission object (all flags false)
const createPermissionObject = (moduleName) => ({
  module: moduleName,
  view: false,
  create: false,
  edit: false,
  delete: false,
  all: false,
});

// Helper to initialise permissions from editData
const initPermissionsFromData = (permissionsArray) => {
  if (!Array.isArray(permissionsArray)) return [];
  // If it's an array of strings (old format), convert to objects with view only
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
  // Otherwise assume it's already objects with module and flags
  return permissionsArray.map(p => ({
    module: p.module,
    view: p.view || false,
    create: p.create || false,
    edit: p.edit || false,
    delete: p.delete || false,
    all: p.all || false,
  }));
};

export default function RoleAccessModal({ isOpen, onClose, onSave, editData }) {
  const isEdit = !!editData;

  const [form, setForm] = useState({
    roleName: '',
    permissions: [],
    isActive: true,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
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
    }
  }, [isOpen, editData]);

  if (!isOpen) return null;

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

  // Add or remove a module (toggle selection)
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

  // Select all actions for a module (only allowed ones)
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

  // Global Select All (all modules, all allowed actions)
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

  // Check if all modules are fully selected (all allowed actions checked)
  const isGlobalAllChecked = ALL_MODULE_NAMES.every(moduleName => {
    const allowed = MODULE_PERMISSIONS_MAP[moduleName] || [];
    const permObj = form.permissions.find(p => p.module === moduleName);
    return allowed.every(action => permObj?.[action] === true);
  });

  const selectAll = () => handleGlobalSelectAll(true);
  const clearAll = () => handleGlobalSelectAll(false);

  // ── Submit ──
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
        onClose();
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

  const primaryColor = '#0076a3';
  const headerBg = primaryColor;

  // ── Modal Styles ──
  const modalOverlayStyle = {
    position: 'fixed',
    inset: 0,
    background: 'rgba(15, 23, 42, 0.6)',
    backdropFilter: 'blur(6px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    padding: '20px',
    animation: 'fadeIn 0.25s ease-out',
  };

  const modalStyle = {
    background: '#ffffff',
    borderRadius: '20px',
    boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
    width: '95%',
    maxWidth: '1100px',
    maxHeight: '90vh',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    animation: 'slideUp 0.3s ease-out',
  };

  const headerStyle = {
    padding: '20px 24px',
    borderBottom: '1px solid rgba(255,255,255,0.15)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: headerBg,
    borderRadius: '20px 20px 0 0',
  };

  const bodyStyle = {
    padding: '24px',
    overflowY: 'auto',
    flex: 1,
  };

  const footerStyle = {
    padding: '16px 24px',
    borderTop: '1px solid #f1f5f9',
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    background: '#fafcff',
  };

  return (
    <div style={modalOverlayStyle} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={modalStyle}>
        {/* ── Header ── */}
        <div style={headerStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              background: '#ffffff',
              color: primaryColor,
              borderRadius: '10px',
              padding: '6px 10px',
              fontSize: '16px',
              fontWeight: '700',
              lineHeight: 1,
            }}>
              {isEdit ? '✎' : '+'}
            </div>
            <h3 style={{
              margin: 0,
              fontSize: '20px',
              fontWeight: '700',
              color: '#ffffff',
              letterSpacing: '-0.3px',
            }}>
              {isEdit ? 'Edit Role' : 'Create New Role'}
            </h3>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '8px',
              color: '#ffffff',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.35)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.2)'; }}
          >
            <X size={20} />
          </button>
        </div>

        {/* ── Body ── */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
          <div style={bodyStyle}>
            {error && (
              <div style={{
                background: '#fef2f2',
                border: '1px solid #fecaca',
                color: '#b91c1c',
                borderRadius: '8px',
                padding: '10px 14px',
                marginBottom: '16px',
                fontSize: '13px',
              }}>
                ⚠️ {error}
              </div>
            )}

            {/* ── Role Name & Status ── */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 200px',
              gap: '20px',
              marginBottom: '24px',
            }}>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: '700',
                  color: '#334155',
                  marginBottom: '6px',
                }}>
                  Role Name <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Super Admin, Staff, Manager"
                  value={form.roleName}
                  onChange={e => setForm(f => ({ ...f, roleName: e.target.value }))}
                  required
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    border: '1.5px solid #e2e8f0',
                    borderRadius: '10px',
                    fontSize: '14px',
                    outline: 'none',
                    transition: 'all 0.15s',
                    background: '#f8fafc',
                  }}
                  onFocus={e => { e.target.style.borderColor = primaryColor; e.target.style.background = '#fff'; e.target.style.boxShadow = `0 0 0 3px ${primaryColor}25`; }}
                  onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.background = '#f8fafc'; e.target.style.boxShadow = 'none'; }}
                />
              </div>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: '700',
                  color: '#334155',
                  marginBottom: '6px',
                }}>
                  Status
                </label>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  background: '#f8fafc',
                  padding: '8px 14px',
                  borderRadius: '10px',
                  border: '1.5px solid #e2e8f0',
                  height: '42px',
                }}>
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '13px',
                    fontWeight: '600',
                    color: form.isActive ? '#16a34a' : '#64748b',
                    cursor: 'pointer',
                  }}>
                    <input
                      type="checkbox"
                      checked={form.isActive}
                      onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))}
                      style={{ accentColor: primaryColor, width: '16px', height: '16px' }}
                    />
                    {form.isActive ? (
                      <><CheckCircle size={14} style={{ color: '#16a34a' }} /> Active</>
                    ) : (
                      <><Circle size={14} style={{ color: '#94a3b8' }} /> Inactive</>
                    )}
                  </label>
                </div>
              </div>
            </div>

            {/* ── Permissions Section ── */}
            <div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '12px',
              }}>
                <label style={{
                  fontSize: '14px',
                  fontWeight: '700',
                  color: '#0f172a',
                }}>
                  Module Permissions
                  <span style={{ fontWeight: '400', color: '#64748b', marginLeft: '6px' }}>
                    ({form.permissions.length} modules selected)
                  </span>
                </label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={selectAll}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: primaryColor,
                      fontWeight: '600',
                      fontSize: '13px',
                      cursor: 'pointer',
                      padding: '4px 8px',
                      borderRadius: '4px',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = '#f0f9ff'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    + Select All
                  </button>
                  <button
                    type="button"
                    onClick={clearAll}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#64748b',
                      fontWeight: '600',
                      fontSize: '13px',
                      cursor: 'pointer',
                      padding: '4px 8px',
                      borderRadius: '4px',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = '#f1f5f9'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    ✕ Clear
                  </button>
                </div>
              </div>

              {/* Scrollable list of groups */}
              <div style={{
                maxHeight: '450px',
                overflowY: 'auto',
                padding: '4px 2px',
              }}>
                {MODULE_CONFIG.map((group, idx) => (
                  <div key={idx} style={{ marginBottom: '20px' }}>
                    <h6 style={{
                      fontWeight: '700',
                      color: primaryColor,
                      borderBottom: '1px solid #e2e8f0',
                      paddingBottom: '6px',
                      marginBottom: '10px',
                      fontSize: '15px',
                    }}>
                      {group.category}
                    </h6>
                    <div style={{ paddingLeft: '8px' }}>
                      {group.modules.map(module => {
                        const permObj = form.permissions.find(p => p.module === module.name);
                        const isSelected = !!permObj;
                        const allowed = MODULE_PERMISSIONS_MAP[module.name] || [];
                        const allActionsChecked = allowed.every(action => permObj?.[action] === true);

                        return (
                          <div
                            key={module.name}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              padding: '6px 0',
                              borderBottom: '1px solid #f8fafc',
                            }}
                          >
                            {/* Left: selection checkbox + module name */}
                            <div style={{ minWidth: '250px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => toggleModuleSelection(module.name)}
                                style={{
                                  accentColor: primaryColor,
                                  cursor: 'pointer',
                                  width: '16px',
                                  height: '16px',
                                }}
                              />
                              <span style={{ fontWeight: isSelected ? '600' : '400', color: '#0f172a' }}>
                                {module.name}
                              </span>
                            </div>

                            {/* Right: action checkboxes */}
                            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
                              {/* "All" checkbox for module (only if more than one action) */}
                              {allowed.length > 1 && (
                                <label style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  fontWeight: '600',
                                  fontSize: '13px',
                                  color: primaryColor,
                                  cursor: isSelected ? 'pointer' : 'not-allowed',
                                  opacity: isSelected ? 1 : 0.5,
                                }}>
                                  <input
                                    type="checkbox"
                                    checked={allActionsChecked && isSelected}
                                    disabled={!isSelected}
                                    onChange={(e) => handleModuleSelectAll(module.name, allowed, e.target.checked)}
                                    style={{
                                      accentColor: primaryColor,
                                      cursor: isSelected ? 'pointer' : 'not-allowed',
                                    }}
                                  />
                                  All
                                </label>
                              )}
                              {allowed.map(action => (
                                <label
                                  key={action}
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    fontSize: '13px',
                                    fontWeight: '500',
                                    color: isSelected ? '#334155' : '#94a3b8',
                                    cursor: isSelected ? 'pointer' : 'not-allowed',
                                    opacity: isSelected ? 1 : 0.5,
                                  }}
                                >
                                  <input
                                    type="checkbox"
                                    checked={permObj?.[action] || false}
                                    disabled={!isSelected}
                                    onChange={() => togglePermissionFlag(module.name, action)}
                                    style={{
                                      accentColor: primaryColor,
                                      cursor: isSelected ? 'pointer' : 'not-allowed',
                                      width: '15px',
                                      height: '15px',
                                    }}
                                  />
                                  {action.charAt(0).toUpperCase() + action.slice(1)}
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
          </div>

          {/* ── Footer ── */}
          <div style={footerStyle}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '8px 20px',
                border: '1px solid #e2e8f0',
                borderRadius: '10px',
                background: '#fff',
                color: '#475569',
                fontWeight: '600',
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#f1f5f9'; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#fff'; }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              style={{
                padding: '8px 24px',
                border: 'none',
                borderRadius: '10px',
                background: primaryColor,
                color: '#fff',
                fontWeight: '600',
                fontSize: '14px',
                cursor: submitting ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                opacity: submitting ? 0.7 : 1,
                transition: 'all 0.15s',
                boxShadow: `0 4px 6px -1px ${primaryColor}40`,
              }}
              onMouseEnter={e => {
                if (!submitting) e.currentTarget.style.background = '#005f8a';
              }}
              onMouseLeave={e => {
                if (!submitting) e.currentTarget.style.background = primaryColor;
              }}
            >
              {submitting ? (
                <span className="ra-spinner" style={{
                  display: 'inline-block',
                  width: '18px',
                  height: '18px',
                  border: '2px solid #fff',
                  borderTopColor: 'transparent',
                  borderRadius: '50%',
                  animation: 'spin 0.8s linear infinite',
                }} />
              ) : (
                isEdit ? <Pencil size={16} /> : <Plus size={16} />
              )}
              {isEdit ? 'Update Role' : 'Create Role'}
            </button>
          </div>
        </form>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}