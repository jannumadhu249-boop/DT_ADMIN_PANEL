import React, { useState, useRef, useEffect } from 'react';
import {
  UploadCloud,
  FileText,
  FileSpreadsheet,
  FileCheck,
  Image as ImageIcon,
  CheckCircle,
  AlertCircle,
  X,
  Search,
  Trash2,
  Eye,
  Loader2,
  Calendar,
  FolderOpen,
  User,
  RotateCcw,
  ExternalLink
} from 'lucide-react';
import { URLS } from '../../url';
import './TaxOrganizer.css';

// Token helper
const getAuthToken = () => {
  const keys = ['authToken', 'token', 'adminToken', 'accessToken', 'jwt'];
  for (const key of keys) {
    const value = sessionStorage.getItem(key) || localStorage.getItem(key);
    if (value) return value;
  }
  return '';
};

const looksLikeFileRef = (value) => {
  if (typeof value !== 'string') return false;
  const s = value.trim();
  if (!s || s.length > 2000) return false;
  return (
    /^(https?:|blob:|data:)/i.test(s) ||
    /uploads?[\\/]/i.test(s) ||
    /[\\/]/.test(s) ||
    /\.(pdf|png|jpe?g|webp|gif|docx?|xlsx?|csv|zip)$/i.test(s)
  );
};

const extractDocFilePath = (doc) => {
  if (!doc || typeof doc !== 'object') return '';

  const preferredKeys = [
    'file_path', 'filePath', 'file_url', 'fileUrl', 'document_url', 'documentUrl',
    'document_path', 'documentPath', 'path', 'url', 'location', 'key', 's3_key', 's3Key',
  ];
  for (const key of preferredKeys) {
    const value = doc[key];
    if (typeof value === 'string' && value.trim()) {
      return value.trim().replace(/\\/g, '/');
    }
  }
  if (typeof doc.file === 'string' && doc.file.trim()) {
    return doc.file.trim().replace(/\\/g, '/');
  }
  if (typeof doc.document === 'string' && looksLikeFileRef(doc.document)) {
    return doc.document.trim().replace(/\\/g, '/');
  }

  const nested = doc.file && typeof doc.file === 'object' ? doc.file : null;
  if (nested) {
    const nestedPath = extractDocFilePath(nested);
    if (nestedPath) return nestedPath;
  }

  const stack = [doc];
  const seen = new Set();
  while (stack.length) {
    const current = stack.pop();
    if (!current || typeof current !== 'object' || seen.has(current)) continue;
    seen.add(current);
    for (const [key, value] of Object.entries(current)) {
      if (['original_name', 'document_name', 'name', 'client_name', 'uploaded_by'].includes(key)) continue;
      if (typeof value === 'string' && looksLikeFileRef(value) && (/[\\/]/.test(value) || /^(https?:|blob:|data:)/i.test(value) || /uploads?/i.test(value))) {
        return value.trim().replace(/\\/g, '/');
      }
      if (value && typeof value === 'object') stack.push(value);
    }
  }
  return '';
};

const resolveFileUrl = (filePath) => {
  if (!filePath) return '';
  let cleanUrl = String(filePath).replace(/\\/g, '/');
  if (cleanUrl.includes('#')) cleanUrl = cleanUrl.substring(0, cleanUrl.indexOf('#'));
  if (/^(https?:|blob:|data:)/i.test(cleanUrl)) return cleanUrl;
  const base = (URLS.ImageUrl || URLS.Base || '').replace(/\/+$/, '') + '/';
  return `${base}${cleanUrl.replace(/^\/+/, '')}`;
};

const getPreviewKind = (fileName = '', mimeType = '') => {
  const ext = fileName.split('.').pop()?.toLowerCase() || '';
  const mime = (mimeType || '').toLowerCase();
  if (mime.includes('pdf') || ext === 'pdf') return 'pdf';
  if (mime.startsWith('image/') || ['png', 'jpg', 'jpeg', 'webp', 'gif'].includes(ext)) return 'image';
  return 'other';
};

const isLikelyFileBlob = (blob, contentType = '') => {
  if (!blob || blob.size === 0) return false;
  const type = (contentType || blob.type || '').toLowerCase();
  if (type.includes('application/json') || type.includes('text/html') || type.includes('text/plain')) {
    return false;
  }
  return true;
};

const blobFromBase64OrBuffer = (payload) => {
  if (!payload) return null;
  if (payload?.type === 'Buffer' && Array.isArray(payload.data)) {
    return new Blob([new Uint8Array(payload.data)]);
  }
  const b64 =
    (typeof payload === 'string' && payload.length > 100 ? payload : null) ||
    payload?.base64 ||
    payload?.file_base64 ||
    payload?.content ||
    payload?.data;
  if (typeof b64 === 'string' && b64.length > 100) {
    try {
      const cleaned = b64.includes(',') ? b64.split(',').pop() : b64;
      const binary = atob(cleaned);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
      return new Blob([bytes]);
    } catch {
      return null;
    }
  }
  return null;
};

export default function TaxOrganizer() {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [yearsList, setYearsList] = useState([]);
  const [taxYear, setTaxYear] = useState(''); // This will store the year ID (_id)
  const [docCategory, setDocCategory] = useState('Full Tax Organizer');
  const [clientReference, setClientReference] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alert, setAlert] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [uploadedDocs, setUploadedDocs] = useState([]);
  const [viewingDoc, setViewingDoc] = useState(null);
  const [isLoadingDocs, setIsLoadingDocs] = useState(false);

  const fileInputRef = useRef(null);

  // Fetch uploaded Tax Organizer documents from backend
  const fetchUploadedDocs = async () => {
    setIsLoadingDocs(true);
    try {
      const token = getAuthToken();
      const response = await fetch(URLS.GetTaxOrganizer, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();
      
      if (response.ok && result.success && Array.isArray(result.data)) {
        // Transform backend data to match component format
        const transformedDocs = result.data.map((doc) => ({
          id: doc._id || doc.document_id || doc.id,
          name: doc.original_name || doc.document_name || doc.file_name || 'Unknown Document',
          category: 'Tax Organizer',
          taxYear: String(doc.year?.name || doc.year?.year_name || doc.year || 'N/A'),
          clientName: doc.client_name || 'General Client',
          size: formatFileSize(doc.file_size || 0),
          uploadedAt: doc.createdAt ? new Date(doc.createdAt).toISOString().replace('T', ' ').substring(0, 16) : 'N/A',
          uploadedBy: doc.uploaded_by || 'Admin',
          status: doc.deleted ? 'Deleted' : 'Uploaded',
          fileUrl: extractDocFilePath(doc),
          fileName: doc.file_name || doc.original_name || '',
          mimeType: doc.mime_type || '',
          raw: doc,
        }));
        setUploadedDocs(transformedDocs);
      } else {
        setUploadedDocs([]);
      }
    } catch (error) {
      console.error('Error fetching Tax Organizer documents:', error);
      setUploadedDocs([]);
      setAlert({
        type: 'error',
        message: 'Failed to load Tax Organizer documents. Please refresh the page.'
      });
    } finally {
      setIsLoadingDocs(false);
    }
  };

  // Fetch recent 5 years from backend API
  useEffect(() => {
    let isMounted = true;
    const fetchRecentFiveYears = async () => {
      try {
        const token = getAuthToken();
        const res = await fetch(URLS.GetLatestFiveYears, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        const result = await res.json();
        if (result && result.success && Array.isArray(result.data) && result.data.length > 0) {
          if (isMounted) {
            setYearsList(result.data);
            // Set the first year's ID as the default selected value
            const firstYearId = result.data[0]?._id;
            if (firstYearId) setTaxYear(firstYearId);
          }
        }
      } catch (err) {
        console.warn('Error loading recent 5 years for Tax Organizer:', err);
      }
    };

    fetchRecentFiveYears();
    return () => { isMounted = false; };
  }, []);

  // Fetch uploaded documents on mount
  useEffect(() => {
    fetchUploadedDocs();
  }, []);

  // Helper: File icon by extension
  const getFileIcon = (fileName, size = 20) => {
    const ext = fileName?.split('.').pop()?.toLowerCase() || '';
    if (['xlsx', 'xls', 'csv'].includes(ext)) {
      return <FileSpreadsheet size={size} color="#10b981" className="to-file-icon" />;
    }
    if (['png', 'jpg', 'jpeg', 'webp'].includes(ext)) {
      return <ImageIcon size={size} color="#8b5cf6" className="to-file-icon" />;
    }
    if (['pdf'].includes(ext)) {
      return <FileText size={size} color="#ef4444" className="to-file-icon" />;
    }
    return <FileText size={size} color="#0076a3" className="to-file-icon" />;
  };

  // Helper: Format file size
  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  // Drag and Drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFilesAdded(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFilesAdded(Array.from(e.target.files));
    }
  };

  // Add files to selection
  const handleFilesAdded = (newFiles) => {
    const allowedExtensions = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'csv', 'png', 'jpg', 'jpeg', 'zip'];
    const validFiles = [];
    const invalidNames = [];

    newFiles.forEach((file) => {
      const ext = file.name.split('.').pop().toLowerCase();
      if (allowedExtensions.includes(ext)) {
        const exists = selectedFiles.some(f => f.name === file.name && f.size === file.size);
        if (!exists) {
          validFiles.push(file);
        }
      } else {
        invalidNames.push(file.name);
      }
    });

    if (invalidNames.length > 0) {
      setAlert({
        type: 'error',
        message: `Unsupported file type for: ${invalidNames.join(', ')}. Supported types: PDF, Word, Excel, Images, ZIP.`
      });
    }

    if (validFiles.length > 0) {
      setSelectedFiles(prev => [...prev, ...validFiles]);
      if (invalidNames.length === 0) setAlert(null);
    }
  };

  const handleRemoveFile = (indexToRemove) => {
    setSelectedFiles(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleReset = () => {
    setSelectedFiles([]);
    if (yearsList.length > 0) {
      const firstYearId = yearsList[0]?._id;
      setTaxYear(firstYearId || '');
    } else {
      setTaxYear('');
    }
    setDocCategory('Full Tax Organizer');
    setClientReference('');
    setNotes('');
    if (fileInputRef.current) fileInputRef.current.value = '';
    setAlert(null);
  };

  // Submit Handler - Upload Tax Organizer Documents
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (selectedFiles.length === 0) {
      setAlert({
        type: 'error',
        message: 'Please select at least one document to upload.'
      });
      return;
    }

    setIsSubmitting(true);
    setAlert(null);

    try {
      const token = getAuthToken();
      
      // taxYear already contains the year ID (_id)
      const yearId = taxYear;

      if (!yearId) {
        throw new Error('Please select a tax year');
      }

      // Create FormData for multipart upload
      const formData = new FormData();
      
      // Append all selected files
      selectedFiles.forEach((file) => {
        formData.append('documents', file);
      });
      
      // Append year ID
      formData.append('year', yearId);

      const response = await fetch(URLS.UploadTaxOrganizer, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setAlert({
          type: 'success',
          message: `Successfully uploaded ${selectedFiles.length} Tax Organizer document(s)!`
        });

        // Refresh the uploaded documents list
        await fetchUploadedDocs();

        // Clear the form
        setSelectedFiles([]);
        setClientReference('');
        setNotes('');
        if (fileInputRef.current) fileInputRef.current.value = '';
      } else {
        throw new Error(result.message || 'Upload failed');
      }
    } catch (error) {
      console.error('Error uploading Tax Organizer documents:', error);
      setAlert({
        type: 'error',
        message: error.message || 'Failed to upload documents. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUploadedDoc = async (id) => {
    if (!window.confirm('Are you sure you want to delete this Tax Organizer document?')) {
      return;
    }

    try {
      const token = getAuthToken();
      const response = await fetch(URLS.DeleteTaxOrganizer + id, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setUploadedDocs(prev => prev.filter(doc => doc.id !== id));
        if (viewingDoc && viewingDoc.id === id) {
          closeViewModal();
        }
        setAlert({
          type: 'success',
          message: 'Tax organizer document removed successfully.'
        });
      } else {
        throw new Error(result.message || 'Delete failed');
      }
    } catch (error) {
      console.error('Error deleting Tax Organizer document:', error);
      setAlert({
        type: 'error',
        message: error.message || 'Failed to delete document. Please try again.'
      });
    }
  };

  const closeViewModal = () => {
    if (viewingDoc?.previewUrl?.startsWith('blob:')) {
      URL.revokeObjectURL(viewingDoc.previewUrl);
    }
    setViewingDoc(null);
  };

  // Resolve a viewable URL and open the preview modal (no download)
  const handleViewDoc = async (doc) => {
    const token = getAuthToken();
    const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};
    const kind = getPreviewKind(doc.name || doc.fileName, doc.mimeType);

    setViewingDoc({
      ...doc,
      previewUrl: null,
      previewKind: kind,
      previewLoading: true,
      previewError: null,
    });

    try {
      if (doc.fileObj) {
        const url = URL.createObjectURL(doc.fileObj);
        setViewingDoc((prev) => prev && {
          ...prev,
          previewUrl: url,
          previewKind: getPreviewKind(doc.name, doc.fileObj.type || doc.mimeType),
          previewLoading: false,
        });
        return;
      }

      let filePath = doc.fileUrl || '';
      let blobUrl = '';

      if (doc.id) {
        try {
          const detailRes = await fetch(`${URLS.GetByIdTaxOrganizer}${doc.id}`, {
            method: 'GET',
            headers: authHeaders,
          });
          if (detailRes.ok) {
            const contentType = (detailRes.headers.get('content-type') || '').toLowerCase();
            if (
              contentType.includes('application/pdf') ||
              contentType.includes('octet-stream') ||
              contentType.includes('image/') ||
              contentType.includes('msword') ||
              contentType.includes('spreadsheet') ||
              contentType.includes('officedocument')
            ) {
              const blob = await detailRes.blob();
              if (blob && blob.size > 0) {
                blobUrl = URL.createObjectURL(blob);
                setViewingDoc((prev) => prev && {
                  ...prev,
                  previewUrl: blobUrl,
                  previewKind: getPreviewKind(doc.name || doc.fileName, blob.type || contentType),
                  previewLoading: false,
                });
                return;
              }
            } else {
              const detailJson = await detailRes.json().catch(() => null);
              const detailDoc = detailJson?.data || detailJson?.document || detailJson;
              filePath = extractDocFilePath(detailDoc) || filePath;
            }
          }
        } catch (err) {
          console.warn('Tax Organizer GetById view lookup failed:', err);
        }
      }

      const storedName = doc.fileName || doc.name || '';
      const candidates = [
        filePath,
        storedName ? `uploads/tax-organizer/${storedName}` : '',
        storedName ? `uploads/documents/tax-organizer/${storedName}` : '',
        storedName ? `uploads/documents/${storedName}` : '',
        storedName ? `uploads/${storedName}` : '',
        storedName,
      ].filter(Boolean);

      for (const candidate of candidates) {
        const fullUrl = resolveFileUrl(candidate);
        if (!fullUrl) continue;
        try {
          const res = await fetch(fullUrl, { method: 'GET', headers: authHeaders });
          if (!res.ok) continue;
          const contentType = (res.headers.get('content-type') || '').toLowerCase();
          if (contentType.includes('application/json')) continue;
          const blob = await res.blob();
          if (!blob || blob.size === 0) continue;
          blobUrl = URL.createObjectURL(blob);
          setViewingDoc((prev) => prev && {
            ...prev,
            previewUrl: blobUrl,
            previewKind: getPreviewKind(doc.name || doc.fileName, blob.type || contentType),
            previewLoading: false,
          });
          return;
        } catch {
          // try next candidate
        }
      }

      if (filePath) {
        setViewingDoc((prev) => prev && {
          ...prev,
          previewUrl: resolveFileUrl(filePath),
          previewKind: kind,
          previewLoading: false,
        });
        return;
      }

      setViewingDoc((prev) => prev && {
        ...prev,
        previewLoading: false,
        previewError: 'Unable to load document preview. File path is not available.',
      });
    } catch (error) {
      console.error('Error viewing Tax Organizer document:', error);
      setViewingDoc((prev) => prev && {
        ...prev,
        previewLoading: false,
        previewError: error.message || 'Failed to load document preview.',
      });
    }
  };

  // Filter uploaded documents
  const filteredDocs = uploadedDocs.filter(doc =>
    doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.taxYear.includes(searchTerm)
  );

  // Helper to get year name from year ID
  const getYearName = (yearId) => {
    if (!yearId) return 'N/A';
    const year = yearsList.find(y => y._id === yearId);
    return year?.name || year?.year_name || yearId;
  };

  return (
    <div className="to-page-container">
      {/* ── Top Header Bar ── */}
      <div className="to-header-card">
        <div className="to-header-info">
          <div className="to-icon-box">
            <FolderOpen size={24} />
          </div>
          <div>
            <h2 className="to-title">Tax Organizer Documents</h2>
            <p className="to-subtitle">
              Upload and manage Tax Organizer questionnaires, worksheets, and client tax return packets.
            </p>
          </div>
        </div>

        <div className="to-header-badges">
          <span className="to-badge to-badge-highlight">
            <FileCheck size={14} /> Supported: PDF, Excel, Word, Images
          </span>
          <span className="to-badge">
            <Calendar size={14} /> Tax Year: {getYearName(taxYear)}
          </span>
        </div>
      </div>

      {/* ── Alert Banner ── */}
      {alert && (
        <div className={`to-alert ${alert.type === 'success' ? 'to-alert-success' : 'to-alert-error'}`}>
          <div className="to-alert-left">
            {alert.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
            <span>{alert.message}</span>
          </div>
          <button className="to-alert-close" onClick={() => setAlert(null)}>
            <X size={16} />
          </button>
        </div>
      )}

      {/* ── Document Upload Form Card ── */}
      <div className="to-upload-card">
        <div className="to-card-header">
          <h3>
            <UploadCloud size={20} color="#0076a3" />
            Upload Tax Organizer Documents
          </h3>
        </div>

        <form className="to-card-body" onSubmit={handleSubmit}>
          {/* Dropzone Area */}
          <div
            className={`to-dropzone ${isDragging ? 'dragging' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current && fileInputRef.current.click()}
          >
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: 'none' }}
              multiple
              accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.png,.jpg,.jpeg,.zip"
              onChange={handleFileInputChange}
            />
            <div className="to-dropzone-icon">
              <UploadCloud size={18} />
            </div>
            <div className="to-dropzone-title">
              Drop your Tax Organizer files here, or <span className="to-browse-text">Browse Files</span>
            </div>
            <div className="to-dropzone-hint">
              Accepts PDF, Excel (.xlsx, .xls), Word (.docx), CSV, Images & ZIP (Up to 25 MB each)
            </div>
          </div>

          {/* Metadata Form Fields */}
          <div className="to-form-grid">
            {/* <div className="to-form-group">
              <label className="to-form-label">
                <FolderOpen size={13} /> Document Category <span className="to-required">*</span>
              </label>
              <select
                className="to-select"
                value={docCategory}
                onChange={(e) => setDocCategory(e.target.value)}
              >
                <option value="Full Tax Organizer">Full Tax Organizer (Completed)</option>
                <option value="Income & Statements">Income & Wage Statements</option>
                <option value="Deductions & Expenses">Deductions & Credits Worksheet</option>
                <option value="Prior Year Return">Prior Year Tax Return</option>
                <option value="Business Organizer">Business Income & Expense Organizer</option>
                <option value="Other Supporting Doc">Other Supporting Document</option>
              </select>
            </div> */}

            <div className="to-form-group">
              <label className="to-form-label">
                <Calendar size={13} /> Tax Year <span className="to-required">*</span>
              </label>
              <select
                className="to-select"
                value={taxYear}
                onChange={(e) => setTaxYear(e.target.value)}
              >
                {yearsList.map((y) => {
                  const yrId = y?._id;
                  const yrName = y?.name || y?.year_name || y?.year || String(y);
                  return (
                    <option key={yrId} value={yrId}>
                      {yrName}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* <div className="to-form-group">
              <label className="to-form-label">
                <User size={13} /> Client Name / Reference ID
              </label>
              <input
                type="text"
                className="to-input"
                placeholder="e.g. John Doe (DT-10294)"
                value={clientReference}
                onChange={(e) => setClientReference(e.target.value)}
              />
            </div>

            <div className="to-form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="to-form-label">
                Notes / Additional Remarks
              </label>
              <textarea
                className="to-textarea"
                rows="2"
                placeholder="Add optional notes or instructions regarding this tax organizer upload..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div> */}
          </div>

          {/* Selected Files List Preview */}
          {selectedFiles.length > 0 && (
            <div className="to-selected-files-section">
              <div className="to-selected-header">
                <h4>
                  <FileCheck size={16} color="#0076a3" />
                  Selected Documents for Upload
                  <span className="to-files-count">{selectedFiles.length}</span>
                </h4>
                <button
                  type="button"
                  className="to-btn-reset"
                  style={{ padding: '4px 10px', fontSize: '0.78rem' }}
                  onClick={() => setSelectedFiles([])}
                >
                  Clear Selection
                </button>
              </div>

              <div className="to-files-grid">
                {selectedFiles.map((file, idx) => (
                  <div key={`${file.name}-${idx}`} className="to-file-item">
                    <div className="to-file-left">
                      {getFileIcon(file.name)}
                      <div className="to-file-details">
                        <div className="to-file-name" title={file.name}>
                          {file.name}
                        </div>
                        <div className="to-file-size">
                          {formatFileSize(file.size)} • Ready to upload
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="to-remove-btn"
                      title="Remove file"
                      onClick={() => handleRemoveFile(idx)}
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Submit & Reset Button Actions */}
          <div className="to-actions-footer">
            <button
              type="button"
              className="to-btn-reset"
              onClick={handleReset}
              disabled={isSubmitting}
            >
              <RotateCcw size={15} /> Reset Form
            </button>

            <button
              type="submit"
              className="to-btn-submit"
              disabled={selectedFiles.length === 0 || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="spinner" style={{ animation: 'spin 1s linear infinite' }} />
                  Uploading Documents...
                </>
              ) : (
                <>
                  <UploadCloud size={16} />
                  Submit {selectedFiles.length > 0 ? `(${selectedFiles.length})` : ''} Document{selectedFiles.length === 1 ? '' : 's'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* ── Uploaded Documents History Section ── */}
      <div className="to-history-card">
        <div className="to-card-header">
          <h3>
            <FileSpreadsheet size={18} color="#0076a3" />
            Uploaded Tax Organizer Repository
          </h3>
          <span className="to-badge">
            {uploadedDocs.length} Total Record{uploadedDocs.length === 1 ? '' : 's'}
          </span>
        </div>

        <div className="to-history-toolbar">
          <div className="to-search-box">
            <Search size={15} className="to-search-icon" />
            <input
              type="text"
              className="to-search-input"
              placeholder="Search by file name or tax year..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="to-history-meta">
            Showing {filteredDocs.length} of {uploadedDocs.length} documents
          </div>
        </div>

        <div className="to-table-responsive">
          {isLoadingDocs ? (
            <div className="to-empty-state">
              <Loader2 className="to-empty-icon spinner" style={{ animation: 'spin 1s linear infinite' }} />
              <p>Loading Tax Organizer documents...</p>
            </div>
          ) : filteredDocs.length === 0 ? (
            <div className="to-empty-state">
              <FolderOpen className="to-empty-icon" />
              <p>No tax organizer documents found matching your filter.</p>
            </div>
          ) : (
            <table className="to-table">
              <thead>
                <tr>
                  <th>Document Name</th>
                  {/* <th>Category</th> */}
                  <th>Tax Year</th>
                  {/* <th>Client / Account</th> */}
                  <th>Size</th>
                  <th>Uploaded Date</th>
                  {/* <th>Status</th> */}
                  <th style={{ textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDocs.map((doc) => (
                  <tr key={doc.id}>
                    <td>
                      <div className="to-doc-name-cell">
                        {getFileIcon(doc.name)}
                        <span title={doc.name}>{doc.name}</span>
                      </div>
                    </td>
                    {/* <td>
                      <span className="to-category-pill organizer">{doc.category}</span>
                    </td> */}
                    <td>
                      <span style={{ fontWeight: 600 }}>{doc.taxYear}</span>
                    </td>
                    {/* <td>{doc.clientName}</td> */}
                    <td style={{ color: '#64748b' }}>{doc.size}</td>
                    <td style={{ color: '#64748b', fontSize: '0.78rem' }}>{doc.uploadedAt}</td>
                    {/* <td>
                      <span className="to-status-pill">
                        <CheckCircle size={11} /> {doc.status}
                      </span>
                    </td> */}
                    <td>
                      <div className="to-actions-cell" style={{ justifyContent: 'center' }}>
                        {/* <button
                          className="to-icon-btn"
                          title="View Document"
                          onClick={() => handleViewDoc(doc)}
                        >
                          <Eye size={14} />
                        </button> */}
                        <button
                          className="to-icon-btn delete"
                          title="Delete Document"
                          onClick={() => handleDeleteUploadedDoc(doc.id)}
                        >
                          <Trash2 size={14} />
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

      {/* ── View Document Modal (preview only — no download) ── */}
      {viewingDoc && (
        <div className="to-modal-overlay" onClick={closeViewModal}>
          <div className="to-modal-container to-modal-container--preview" onClick={(e) => e.stopPropagation()}>
            <div className="to-modal-header">
              <div className="to-modal-title-group">
                <div className="to-modal-title-icon">
                  {getFileIcon(viewingDoc.name, 22)}
                </div>
                <div>
                  <h3 className="to-modal-title">Document Preview</h3>
                  <p className="to-modal-subtitle">{viewingDoc.name}</p>
                </div>
              </div>
              <button
                className="to-modal-close-btn"
                title="Close"
                onClick={closeViewModal}
              >
                <X size={18} />
              </button>
            </div>

            <div className="to-modal-body">
              <div className="to-meta-grid">
                <div className="to-meta-item">
                  <span className="to-meta-label">Document Name</span>
                  <span className="to-meta-value" title={viewingDoc.name}>
                    {viewingDoc.name}
                  </span>
                </div>
                <div className="to-meta-item">
                  <span className="to-meta-label">Tax Year</span>
                  <span className="to-meta-value">{viewingDoc.taxYear}</span>
                </div>
                <div className="to-meta-item">
                  <span className="to-meta-label">File Size</span>
                  <span className="to-meta-value">{viewingDoc.size}</span>
                </div>
                <div className="to-meta-item">
                  <span className="to-meta-label">Uploaded At</span>
                  <span className="to-meta-value">{viewingDoc.uploadedAt}</span>
                </div>
              </div>

              <div className="to-preview-box to-preview-box--viewer">
                {viewingDoc.previewLoading ? (
                  <div className="to-preview-fallback">
                    <Loader2 size={28} className="spinner" style={{ animation: 'spin 1s linear infinite' }} />
                    <p>Loading document preview...</p>
                  </div>
                ) : viewingDoc.previewError ? (
                  <div className="to-preview-fallback">
                    <AlertCircle size={28} color="#ef4444" />
                    <p>{viewingDoc.previewError}</p>
                  </div>
                ) : viewingDoc.previewUrl && viewingDoc.previewKind === 'pdf' ? (
                  <iframe
                    title={viewingDoc.name}
                    src={viewingDoc.previewUrl}
                    className="to-preview-frame"
                  />
                ) : viewingDoc.previewUrl && viewingDoc.previewKind === 'image' ? (
                  <img
                    src={viewingDoc.previewUrl}
                    alt={viewingDoc.name}
                    className="to-preview-image"
                  />
                ) : viewingDoc.previewUrl ? (
                  <div className="to-preview-fallback">
                    {getFileIcon(viewingDoc.name, 48)}
                    <p>Inline preview is not available for this file type.</p>
                    <button
                      type="button"
                      className="to-btn-reset"
                      style={{ padding: '8px 16px', fontSize: '0.82rem' }}
                      onClick={() => window.open(viewingDoc.previewUrl, '_blank', 'noopener,noreferrer')}
                    >
                      <ExternalLink size={14} /> Open in New Tab
                    </button>
                  </div>
                ) : (
                  <div className="to-preview-fallback">
                    {getFileIcon(viewingDoc.name, 48)}
                    <p>No preview available for this document.</p>
                  </div>
                )}
              </div>
            </div>

            <div className="to-modal-footer">
              <button
                type="button"
                className="to-btn-reset"
                onClick={closeViewModal}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
