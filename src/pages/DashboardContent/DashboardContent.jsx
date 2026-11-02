import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, ImageOff, X, AlertTriangle, CheckCircle2, FileText, Search } from 'lucide-react';
import { URLS } from '../../url';
import DashboardContentModal, { FILE_STATUS_LIST } from './DashboardContentModal';
import './DashboardContent.css';

const getToken = () => {
  const keys = ['adminToken', 'authToken', 'token', 'accessToken', 'jwt'];
  for (const key of keys) {
    const value = sessionStorage.getItem(key) || localStorage.getItem(key);
    if (value) return value;
  }
  return 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhZG1pbl9pZCI6IjZhNThiZDFjNzE1ZjE4ZTYxZDQxY2Y5MiIsImVtYWlsIjoiZGl2eWFwZW5keWFsYTA3MTdAZ21haWwuY29tIiwiYWRtaW5fc3RhZ2UiOiJzdXBlciIsImlhdCI6MTc4NDIwNDE1OCwiZXhwIjoxODE1NzQwMTU4fQ.1pjPlGU41H1G5ei3AfTEcaWk9O1eyRTG769xnpj5xts';
};

/* ─── Toast ──────────────────────────────────────────── */
function Toast({ message, type, onHide }) {
  useEffect(() => {
    const t = setTimeout(onHide, 3000);
    return () => clearTimeout(t);
  }, [onHide]);

  return (
    <div className={`dc-toast ${type}`}>
      {type === 'success' ? <CheckCircle2 size={15} /> : <AlertTriangle size={15} />}
      {message}
    </div>
  );
}

/* ─── Delete Confirm Modal ───────────────────────────── */
function DeleteModal({ isOpen, onClose, onConfirm, description }) {
  const [deleting, setDeleting] = useState(false);
  if (!isOpen) return null;

  const handleConfirm = async () => {
    setDeleting(true);
    await onConfirm();
    setDeleting(false);
  };

  return (
    <div className="dc-modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="dc-modal dc-confirm-modal">
        <div className="dc-modal-header">
          <h3>Delete Content</h3>
          <button className="dc-modal-close" onClick={onClose}><X size={16} /></button>
        </div>
        <div className="dc-confirm-body">
          <div className="dc-confirm-icon"><AlertTriangle size={26} /></div>
          <h4>Are you sure?</h4>
          <p>Delete <strong>"{description || 'this item'}"</strong>? This action cannot be undone.</p>
        </div>
        <div className="dc-modal-footer">
          <button className="dc-btn-cancel" onClick={onClose}>Cancel</button>
          <button className="dc-btn-danger" onClick={handleConfirm} disabled={deleting}>
            {deleting ? <span className="dc-spinner" /> : <Trash2 size={14} />}
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Dashboard Content Component ─────────────────── */
export default function DashboardContent() {
  const [items, setItems]             = useState([]);
  const [loading, setLoading]         = useState(true);
  const [createOpen, setCreateOpen]   = useState(false);
  const [editItem, setEditItem]       = useState(null);
  const [deleteItem, setDeleteItem]   = useState(null);
  const [toast, setToast]             = useState(null);
  const [expandedRows, setExpandedRows] = useState({});

  // ── API pagination state ──
  const [pagination, setPagination] = useState({
    currentPage: 1,
    limit: 20,
    totalRecords: 0,
    totalPages: 0,
  });

  // ── Filter state ──
  const [searchTerm, setSearchTerm] = useState('');
  const [fileStatusFilter, setFileStatusFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // ── Fetch with server-side pagination ──
  const fetchList = async (page = 1, limit = 20, search = '', fileStatus = '', status = '') => {
    setLoading(true);
    try {
      const res = await fetch(URLS.GetDashboardContent, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${getToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          page,
          limit,
          search: search.trim(),
          file_status: fileStatus,
          status: status,
        }),
      });
      const json = await res.json();
      console.log('📦 Dashboard Content API response:', json);

      if (res.ok && json.success) {
        setItems(json.data || []);
        if (json.pagination) {
          setPagination(json.pagination);
        }
      } else {
        console.warn('API error:', json.message);
        setItems([]);
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  // ── Initial load ──
  useEffect(() => {
    fetchList(1, pagination.limit, searchTerm, fileStatusFilter, statusFilter);
  }, []); // run only once

  // ── When filters change, reset to page 1 ──
  useEffect(() => {
    fetchList(1, pagination.limit, searchTerm, fileStatusFilter, statusFilter);
  }, [searchTerm, fileStatusFilter, statusFilter]);

  // ── Pagination navigation ──
  const goToPage = (page) => {
    if (page >= 1 && page <= pagination.totalPages) {
      fetchList(page, pagination.limit, searchTerm, fileStatusFilter, statusFilter);
    }
  };

  const handleLimitChange = (e) => {
    const newLimit = parseInt(e.target.value);
    fetchList(1, newLimit, searchTerm, fileStatusFilter, statusFilter);
  };

  // ── Handlers ──
  const showToast = (msg, type = 'success') => setToast({ msg, type });

  const handleSave = (data, error) => {
    setCreateOpen(false);
    setEditItem(null);
    if (error) {
      showToast(error, 'error');
    } else {
      showToast(editItem ? 'Dashboard content updated successfully!' : 'Dashboard content created successfully!');
      fetchList(pagination.currentPage, pagination.limit, searchTerm, fileStatusFilter, statusFilter);
    }
  };

  const handleDelete = async () => {
    try {
      const res = await fetch(`${URLS.DeleteDashboardContent}${deleteItem._id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const json = await res.json();
      if (res.ok && json.success !== false) {
        showToast('Dashboard content deleted successfully!');
        // Refresh current page
        fetchList(pagination.currentPage, pagination.limit, searchTerm, fileStatusFilter, statusFilter);
      } else {
        showToast(json.message || 'Delete failed', 'error');
      }
    } catch (err) {
      showToast('Delete failed', 'error');
    } finally {
      setDeleteItem(null);
    }
  };

  const getStatusLabel = (code) => {
    const found = FILE_STATUS_LIST.find(s => s.code === code);
    return found ? found.label : code || '—';
  };

/* ─── Image Thumbnail with Fallback ─────────────────── */
function ImageThumb({ src, alt }) {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [src]);

  if (!src || hasError) {
    return (
      <div className="dc-thumb-placeholder" title="No banner image">
        <ImageOff size={15} />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt || 'Dashboard Banner'}
      className="dc-thumb"
      onError={() => {
        setHasError(true);
      }}
    />
  );
}

  const getImageSrc = (item) => {
    if (!item) return '';
    let imageName = item.banner_image || item.image || item.imageUrl || item.image_url || item.bannerImage || item.file_path || item.filePath || '';
    if (typeof imageName === 'object' && imageName !== null) {
      imageName = imageName.url || imageName.path || imageName.filename || imageName.file_path || '';
    }
    if (!imageName || typeof imageName !== 'string' || !imageName.trim()) return '';
    if (imageName.startsWith('http://') || imageName.startsWith('https://') || imageName.startsWith('blob:') || imageName.startsWith('data:')) {
      return imageName;
    }
    const clean = imageName.replace(/\\/g, '/').replace(/^\/+/, '');
    if (clean.startsWith('uploads/')) {
      const base = (URLS.ImageUrl || URLS.Base || '').replace(/\/+$/, '') + '/';
      return base + clean;
    }
    const dashboardBase = (URLS.DashboardImageUrl || `${(URLS.ImageUrl || URLS.Base || '').replace(/\/+$/, '')}/uploads/dashboard/`).replace(/\/+$/, '') + '/';
    return dashboardBase + clean;
  };

  const toggleExpand = (id) => {
    setExpandedRows(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // ── Pagination controls ──
  const renderPagination = () => {
    const { currentPage, totalPages, totalRecords } = pagination;
    if (totalPages <= 1) return null;
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
    return (
      <div className="dc-pagination-wrapper" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '12px 20px 8px 20px',
        flexWrap: 'wrap',
        borderTop: '1px solid #f1f5f9',
        gap: '10px',
      }}>
        <span style={{ fontSize: '13px', color: '#64748b' }}>
          Showing {items.length} of {totalRecords} records
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          <button
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
            style={{
              padding: '6px 14px',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              background: currentPage === 1 ? '#f8fafc' : '#ffffff',
              color: currentPage === 1 ? '#94a3b8' : '#334155',
              cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
              fontSize: '13px',
              fontWeight: '500',
              transition: 'all 0.15s',
              opacity: currentPage === 1 ? 0.6 : 1,
            }}
            onMouseEnter={(e) => {
              if (currentPage !== 1) e.currentTarget.style.background = '#f1f5f9';
            }}
            onMouseLeave={(e) => {
              if (currentPage !== 1) e.currentTarget.style.background = '#ffffff';
            }}
          >
            Previous
          </button>
          {pages.map(page => (
            <button
              key={page}
              onClick={() => goToPage(page)}
              style={{
                padding: '6px 14px',
                border: '1px solid',
                borderColor: currentPage === page ? '#0076a3' : '#e2e8f0',
                borderRadius: '8px',
                background: currentPage === page ? '#0076a3' : '#ffffff',
                color: currentPage === page ? '#ffffff' : '#334155',
                fontWeight: currentPage === page ? '600' : '500',
                cursor: 'pointer',
                fontSize: '13px',
                transition: 'all 0.15s',
                minWidth: '36px',
              }}
              onMouseEnter={(e) => {
                if (currentPage !== page) e.currentTarget.style.background = '#f1f5f9';
              }}
              onMouseLeave={(e) => {
                if (currentPage !== page) e.currentTarget.style.background = '#ffffff';
              }}
            >
              {page}
            </button>
          ))}
          <button
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            style={{
              padding: '6px 14px',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              background: currentPage === totalPages ? '#f8fafc' : '#ffffff',
              color: currentPage === totalPages ? '#94a3b8' : '#334155',
              cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
              fontSize: '13px',
              fontWeight: '500',
              transition: 'all 0.15s',
              opacity: currentPage === totalPages ? 0.6 : 1,
            }}
            onMouseEnter={(e) => {
              if (currentPage !== totalPages) e.currentTarget.style.background = '#f1f5f9';
            }}
            onMouseLeave={(e) => {
              if (currentPage !== totalPages) e.currentTarget.style.background = '#ffffff';
            }}
          >
            Next
          </button>
          <select
            value={pagination.limit}
            onChange={handleLimitChange}
            style={{
              padding: '6px 10px',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              fontSize: '13px',
              background: '#ffffff',
              color: '#334155',
              cursor: 'pointer',
              marginLeft: '8px',
            }}
          >
            <option value={5}>5 / page</option>
            <option value={10}>10 / page</option>
            <option value={20}>20 / page</option>
            <option value={50}>50 / page</option>
          </select>
        </div>
      </div>
    );
  };

  return (
    <div className="dc-page">
      <div className="dc-table-card">
        <div className="dc-card-header">
          <div className="dc-header-left">
            <h2>Dashboard Content</h2>
            <p>Manage dashboard entries with descriptions, file status, and banner images.</p>
          </div>
          <button className="dc-btn-create" onClick={() => setCreateOpen(true)}>
            <Plus size={15} /> Add Content
          </button>
        </div>

        {/* ── Filters ── */}
        <div style={{
          padding: '10px 20px 16px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          flexWrap: 'wrap',
        }}>
          <div style={{
            position: 'relative',
            flexShrink: 0,
            width: '350px',
          }}>
            <Search size={18} style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#94a3b8',
            }} />
            <input
              type="text"
              placeholder="Search by description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px 8px 38px',
                border: '1.5px solid #e2e8f0',
                borderRadius: '10px',
                fontSize: '14px',
                outline: 'none',
                transition: 'all 0.15s',
                background: '#f8fafc',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#0076a3';
                e.target.style.background = '#fff';
                e.target.style.boxShadow = '0 0 0 3px #0076a325';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e2e8f0';
                e.target.style.background = '#f8fafc';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          <select
            value={fileStatusFilter}
            onChange={(e) => setFileStatusFilter(e.target.value)}
            style={{
              padding: '8px 14px',
              border: '1.5px solid #e2e8f0',
              borderRadius: '10px',
              fontSize: '14px',
              background: '#f8fafc',
              color: '#334155',
              minWidth: '180px',
            }}
          >
            <option value="">All File Status</option>
            {FILE_STATUS_LIST.map(opt => (
              <option key={opt.code} value={opt.code}>{opt.label}</option>
            ))}
          </select>

          {/* <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: '8px 14px',
              border: '1.5px solid #e2e8f0',
              borderRadius: '10px',
              fontSize: '14px',
              background: '#f8fafc',
              color: '#334155',
              minWidth: '140px',
            }}
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select> */}
        </div>

        <div className="dc-table-wrap">
          {loading ? (
            <div className="dc-empty"><p>Loading dashboard contents...</p></div>
          ) : items.length === 0 ? (
            <div className="dc-empty">
              <FileText size={40} />
              <p>
                {searchTerm || fileStatusFilter || statusFilter
                  ? 'No results found for your filters.'
                  : 'No dashboard content records found. Click <strong>+ Add Content</strong> to create one.'}
              </p>
            </div>
          ) : (
            <>
              <table className="dc-table">
                <thead>
                  <tr>
                    <th>Sl.No</th>
                    <th>Image</th>
                    <th>Description</th>
                    <th>File Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, idx) => {
                    const description = item.page_title || item.desc || item.content || '';
                    const fileStatus = item.file_status || item.status || item.statusCode || '';
                    const imageSrc = getImageSrc(item);
                    const isExpanded = expandedRows[item._id] || false;
                    const displayText = isExpanded ? description : (description.length > 200 ? description.slice(0, 200) + '…' : description);
                    const isTruncated = description.length > 200;

                    return (
                      <tr key={item._id || idx}>
                        <td>{(pagination.currentPage - 1) * pagination.limit + idx + 1}</td>
                        <td>
                          <ImageThumb src={imageSrc} alt={description} />
                        </td>
                        <td>
                          <div
                            className="dc-desc-cell"
                            onClick={() => isTruncated && toggleExpand(item._id)}
                            style={{
                              cursor: isTruncated ? 'pointer' : 'default',
                              wordBreak: 'break-word',
                              whiteSpace: isExpanded ? 'normal' : 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                            title={!isExpanded ? description : ''}
                          >
                            {displayText}
                            {isTruncated && (
                              <span style={{
                                color: '#0076a3',
                                fontWeight: '600',
                                marginLeft: '4px',
                                fontSize: '12px',
                              }}>
                                {isExpanded ? ' (less)' : ' (more)'}
                              </span>
                            )}
                          </div>
                        </td>
                        <td>
                          <span className="dc-badge" style={{ background: '#e0f0f8', color: '#0076a3', fontWeight: 600 }}>
                            {getStatusLabel(fileStatus)}
                          </span>
                        </td>
                        <td>
                          <div className="dc-actions">
                            <button
                              className="dc-btn-icon dc-btn-edit"
                              title="Edit"
                              onClick={() => setEditItem(item)}
                            >
                              <Pencil size={13} />
                            </button>
                            <button
                              className="dc-btn-icon dc-btn-delete"
                              title="Delete"
                              onClick={() => setDeleteItem(item)}
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {renderPagination()}
            </>
          )}
        </div>
      </div>

      <DashboardContentModal
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        onSave={handleSave}
        editData={null}
      />
      <DashboardContentModal
        isOpen={!!editItem}
        onClose={() => setEditItem(null)}
        onSave={handleSave}
        editData={editItem}
      />
      <DeleteModal
        isOpen={!!deleteItem}
        onClose={() => setDeleteItem(null)}
        onConfirm={handleDelete}
        description={deleteItem?.page_title || deleteItem?.description || deleteItem?.desc || ''}
      />
      {toast && (
        <Toast
          message={toast.msg}
          type={toast.type}
          onHide={() => setToast(null)}
        />
      )}
    </div>
  );
}