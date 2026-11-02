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
  Globe,
  User,
  RotateCcw,
  ShieldCheck,
  DollarSign,
  ExternalLink
} from 'lucide-react';
import { URLS } from '../../url';
import './FbarQuestionnaire.css';

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

  // Deep scan for path/url-like strings (skip plain display names)
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

export default function FbarQuestionnaire() {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [yearsList, setYearsList] = useState([]);
  const [reportingYear, setReportingYear] = useState('');
  const [docCategory, setDocCategory] = useState('Completed FBAR Questionnaire');
  const [balanceTier, setBalanceTier] = useState('$10,000 - $50,000');
  const [clientReference, setClientReference] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alert, setAlert] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [uploadedDocs, setUploadedDocs] = useState([]);
  const [viewingDoc, setViewingDoc] = useState(null);
  const [isLoadingDocs, setIsLoadingDocs] = useState(false);

  const fileInputRef = useRef(null);

  // Fetch uploaded FBAR documents from backend
  const fetchUploadedDocs = async () => {
    setIsLoadingDocs(true);
    try {
      const token = getAuthToken();
      const response = await fetch(URLS.GetFbarQuestionnaier, {
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
          name: doc.original_name || doc.document_name || doc.file_name || '',
          category: '',
          reportingYear: String(doc.year?.name || doc.year?.year_name || doc.year || ''),
          clientName: doc.client_name || '',
          balanceTier: doc.balance_tier || '',
          size: formatFileSize(doc.file_size || 0),
          uploadedAt: doc.createdAt ? new Date(doc.createdAt).toISOString().replace('T', ' ').substring(0, 16) : '',
          uploadedBy: doc.uploaded_by || '',
          status: doc.deleted ? '' : '',
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
      console.error('Error fetching FBAR documents:', error);
      setUploadedDocs([]);
      setAlert({
        type: 'error',
        message: 'Failed to load FBAR documents. Please refresh the page.'
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
            if (firstYearId) setReportingYear(firstYearId);
          }
        }
      } catch (err) {
        console.warn('Error loading recent 5 years for FBAR Questionnaire:', err);
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
      return <FileSpreadsheet size={size} color="#10b981" className="fbar-file-icon" />;
    }
    if (['png', 'jpg', 'jpeg', 'webp'].includes(ext)) {
      return <ImageIcon size={size} color="#8b5cf6" className="fbar-file-icon" />;
    }
    if (['pdf'].includes(ext)) {
      return <FileText size={size} color="#ef4444" className="fbar-file-icon" />;
    }
    return <FileText size={size} color="#0076a3" className="fbar-file-icon" />;
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
      setReportingYear(firstYearId || '');
    } else {
      setReportingYear('');
    }
    setDocCategory('Completed FBAR Questionnaire');
    setBalanceTier('$10,000 - $50,000');
    setClientReference('');
    setNotes('');
    if (fileInputRef.current) fileInputRef.current.value = '';
    setAlert(null);
  };

  // Submit Handler - Upload FBAR Documents
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (selectedFiles.length === 0) {
      setAlert({
        type: 'error',
        message: 'Please select at least one FBAR document to upload.'
      });
      return;
    }

    setIsSubmitting(true);
    setAlert(null);

    try {
      const token = getAuthToken();
      
      // reportingYear already contains the year ID (_id)
      const yearId = reportingYear;

      if (!yearId) {
        throw new Error('Please select a reporting year');
      }

      // Create FormData for multipart upload
      const formData = new FormData();
      
      // Append all selected files
      selectedFiles.forEach((file) => {
        formData.append('documents', file);
      });
      
      // Append year ID
      formData.append('year', yearId);

      const response = await fetch(URLS.UploadFbarQuestionnaier, {
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
          message: `Successfully uploaded ${selectedFiles.length} FBAR document(s)!`
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
      console.error('Error uploading FBAR documents:', error);
      setAlert({
        type: 'error',
        message: error.message || 'Failed to upload documents. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUploadedDoc = async (id) => {
    if (!window.confirm('Are you sure you want to delete this FBAR document?')) {
      return;
    }

    try {
      const token = getAuthToken();
      const response = await fetch(URLS.DeleteFbarQuestionnaier + id, {
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
          message: 'FBAR document removed successfully.'
        });
      } else {
        throw new Error(result.message || 'Delete failed');
      }
    } catch (error) {
      console.error('Error deleting FBAR document:', error);
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
          const detailRes = await fetch(`${URLS.GetByIdFbar}${doc.id}`, {
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
          console.warn('FBAR GetById view lookup failed:', err);
        }
      }

      const storedName = doc.fileName || doc.name || '';
      const candidates = [
        filePath,
        storedName ? `uploads/fbar/${storedName}` : '',
        storedName ? `uploads/documents/fbar/${storedName}` : '',
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

      // Last resort: open absolute URL directly in iframe if we at least have a path
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
      console.error('Error viewing FBAR document:', error);
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
    doc.reportingYear.includes(searchTerm)
  );

  // Helper to get year name from year ID
  const getYearName = (yearId) => {
    if (!yearId) return 'N/A';
    const year = yearsList.find(y => y._id === yearId);
    return year?.name || year?.year_name || yearId;
  };

  return (
    <div className="fbar-page-container">
      {/* ── Top Header Bar ── */}
      <div className="fbar-header-card">
        <div className="fbar-header-info">
          <div className="fbar-icon-box">
            <Globe size={24} />
          </div>
          <div>
            <h2 className="fbar-title">FBAR Questionnaire Documents</h2>
            <p className="fbar-subtitle">
              Upload and manage Foreign Bank and Financial Accounts (FBAR - FinCEN 114) questionnaires and disclosures.
            </p>
          </div>
        </div>

        <div className="fbar-header-badges">
          <span className="fbar-badge fbar-badge-highlight">
            <ShieldCheck size={14} /> FinCEN Form 114 Compliance
          </span>
          <span className="fbar-badge fbar-badge-info">
            <Calendar size={14} /> Reporting Year: {getYearName(reportingYear)}
          </span>
        </div>
      </div>

      {/* ── Alert Banner ── */}
      {alert && (
        <div className={`fbar-alert ${alert.type === 'success' ? 'fbar-alert-success' : 'fbar-alert-error'}`}>
          <div className="fbar-alert-left">
            {alert.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
            <span>{alert.message}</span>
          </div>
          <button className="fbar-alert-close" onClick={() => setAlert(null)}>
            <X size={16} />
          </button>
        </div>
      )}

      {/* ── Document Upload Form Card ── */}
      <div className="fbar-upload-card">
        <div className="fbar-card-header">
          <h3>
            <UploadCloud size={20} color="#0076a3" />
            Upload FBAR Documents
          </h3>
        </div>

        <form className="fbar-card-body" onSubmit={handleSubmit}>
          {/* Dropzone Area */}
          <div
            className={`fbar-dropzone ${isDragging ? 'dragging' : ''}`}
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
            <div className="fbar-dropzone-icon">
              <UploadCloud size={18} />
            </div>
            <div className="fbar-dropzone-title">
              Drop your FBAR Questionnaire files here, or <span className="fbar-browse-text">Browse Files</span>
            </div>
            <div className="fbar-dropzone-hint">
              Accepts PDF, Excel (.xlsx, .xls), Word (.docx), CSV, Images & ZIP (Up to 25 MB each)
            </div>
          </div>

          {/* Metadata Form Fields */}
          <div className="fbar-form-grid">
            {/* <div className="fbar-form-group">
              <label className="fbar-form-label">
                <FileCheck size={13} /> Document Category <span className="fbar-required">*</span>
              </label>
              <select
                className="fbar-select"
                value={docCategory}
                onChange={(e) => setDocCategory(e.target.value)}
              >
                <option value="Completed FBAR Questionnaire">Completed FBAR Questionnaire</option>
                <option value="Foreign Bank Statements">Foreign Bank Account Statements</option>
                <option value="FinCEN Form 114 Worksheet">FinCEN Form 114 Worksheet</option>
                <option value="Foreign Mutual Funds & Securities">Foreign Mutual Funds & Securities</option>
                <option value="Signatory Authority / Joint Accounts">Signatory Authority / Joint Accounts</option>
                <option value="Other Foreign Asset Disclosures">Other Foreign Asset Disclosures</option>
              </select>
            </div> */}

            <div className="fbar-form-group">
              <label className="fbar-form-label">
                <Calendar size={13} /> Reporting Year <span className="fbar-required">*</span>
              </label>
              <select
                className="fbar-select"
                value={reportingYear}
                onChange={(e) => setReportingYear(e.target.value)}
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

            {/* <div className="fbar-form-group">
              <label className="fbar-form-label">
                <User size={13} /> Client Name / Reference ID
              </label>
              <input
                type="text"
                className="fbar-input"
                placeholder="e.g. Priya Sharma (DT-20941)"
                value={clientReference}
                onChange={(e) => setClientReference(e.target.value)}
              />
            </div>

            <div className="fbar-form-group">
              <label className="fbar-form-label">
                <DollarSign size={13} /> Foreign Balance Tier
              </label>
              <select
                className="fbar-select"
                value={balanceTier}
                onChange={(e) => setBalanceTier(e.target.value)}
              >
                <option value="$10,000 - $50,000">$10,000 - $50,000</option>
                <option value="$50,000 - $100,000">$50,000 - $100,000</option>
                <option value="Above $100,000">Above $100,000</option>
                <option value="Unknown / Pending Verification">Unknown / Pending Verification</option>
              </select>
            </div>

            <div className="fbar-form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="fbar-form-label">
                Notes / Additional Remarks
              </label>
              <textarea
                className="fbar-textarea"
                rows="2"
                placeholder="Add optional notes or disclosures regarding foreign accounts and bank branches..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div> */}
          </div>

          {/* Selected Files List Preview */}
          {selectedFiles.length > 0 && (
            <div className="fbar-selected-files-section">
              <div className="fbar-selected-header">
                <h4>
                  <FileCheck size={16} color="#0076a3" />
                  Selected Documents for Upload
                  <span className="fbar-files-count">{selectedFiles.length}</span>
                </h4>
                <button
                  type="button"
                  className="fbar-btn-reset"
                  style={{ padding: '4px 10px', fontSize: '0.78rem' }}
                  onClick={() => setSelectedFiles([])}
                >
                  Clear Selection
                </button>
              </div>

              <div className="fbar-files-grid">
                {selectedFiles.map((file, idx) => (
                  <div key={`${file.name}-${idx}`} className="fbar-file-item">
                    <div className="fbar-file-left">
                      {getFileIcon(file.name)}
                      <div className="fbar-file-details">
                        <div className="fbar-file-name" title={file.name}>
                          {file.name}
                        </div>
                        <div className="fbar-file-size">
                          {formatFileSize(file.size)} • Ready to upload
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="fbar-remove-btn"
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
          <div className="fbar-actions-footer">
            <button
              type="button"
              className="fbar-btn-reset"
              onClick={handleReset}
              disabled={isSubmitting}
            >
              <RotateCcw size={15} /> Reset Form
            </button>

            <button
              type="submit"
              className="fbar-btn-submit"
              disabled={selectedFiles.length === 0 || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="spinner" style={{ animation: 'spin 1s linear infinite' }} />
                  Uploading FBAR Documents...
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
      <div className="fbar-history-card">
        <div className="fbar-card-header">
          <h3>
            <Globe size={18} color="#0076a3" />
            Uploaded FBAR Documents Repository
          </h3>
          <span className="fbar-badge">
            {uploadedDocs.length} Total Record{uploadedDocs.length === 1 ? '' : 's'}
          </span>
        </div>

        <div className="fbar-history-toolbar">
          <div className="fbar-search-box">
            <Search size={15} className="fbar-search-icon" />
            <input
              type="text"
              className="fbar-search-input"
              placeholder="Search by file name or reporting year..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="fbar-history-meta">
            Showing {filteredDocs.length} of {uploadedDocs.length} documents
          </div>
        </div>

        <div className="to-table-responsive">
          {isLoadingDocs ? (
            <div className="fbar-empty-state">
              <Loader2 className="fbar-empty-icon spinner" style={{ animation: 'spin 1s linear infinite' }} />
              <p>Loading FBAR documents...</p>
            </div>
          ) : filteredDocs.length === 0 ? (
            <div className="fbar-empty-state">
              <Globe className="fbar-empty-icon" />
              <p>No FBAR documents found matching your filter.</p>
            </div>
          ) : (
            <table className="fbar-table">
              <thead>
                <tr>
                  <th>Document Name</th>
                  {/* <th>Category</th> */}
                  <th>Reporting Year</th>
                  {/* <th>Client / Account</th> */}
                  {/* <th>Balance Tier</th> */}
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
                      <div className="fbar-doc-name-cell">
                        {getFileIcon(doc.name)}
                        <span title={doc.name}>{doc.name}</span>
                      </div>
                    </td>
                    {/* <td>
                      <span className="fbar-category-pill questionnaire">{doc.category}</span>
                    </td> */}
                    <td>
                      <span style={{ fontWeight: 600 }}>{doc.reportingYear}</span>
                    </td>
                    {/* <td>{doc.clientName}</td> */}
                    {/* <td style={{ color: '#475569', fontSize: '0.78rem' }}>{doc.balanceTier}</td> */}
                    <td style={{ color: '#64748b' }}>{doc.size}</td>
                    <td style={{ color: '#64748b', fontSize: '0.78rem' }}>{doc.uploadedAt}</td>
                    {/* <td>
                      <span className="fbar-status-pill">
                        <CheckCircle size={11} /> {doc.status}
                      </span>
                    </td> */}
                    <td>
                      <div className="fbar-actions-cell" style={{ justifyContent: 'center' }}>
                        {/* <button
                          className="fbar-icon-btn"
                          title="View Document"
                          onClick={() => handleViewDoc(doc)}
                        >
                          <Eye size={14} />
                        </button> */}
                        <button
                          className="fbar-icon-btn delete"
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
        <div className="fbar-modal-overlay" onClick={closeViewModal}>
          <div className="fbar-modal-container fbar-modal-container--preview" onClick={(e) => e.stopPropagation()}>
            <div className="fbar-modal-header">
              <div className="fbar-modal-title-group">
                <div className="fbar-modal-title-icon">
                  {getFileIcon(viewingDoc.name, 22)}
                </div>
                <div>
                  <h3 className="fbar-modal-title">FBAR Document Preview</h3>
                  <p className="fbar-modal-subtitle">{viewingDoc.name}</p>
                </div>
              </div>
              <button
                className="fbar-modal-close-btn"
                title="Close"
                onClick={closeViewModal}
              >
                <X size={18} />
              </button>
            </div>

            <div className="fbar-modal-body">
              <div className="fbar-meta-grid">
                <div className="fbar-meta-item">
                  <span className="fbar-meta-label">Document Name</span>
                  <span className="fbar-meta-value" title={viewingDoc.name}>
                    {viewingDoc.name}
                  </span>
                </div>
                <div className="fbar-meta-item">
                  <span className="fbar-meta-label">Reporting Year</span>
                  <span className="fbar-meta-value">{viewingDoc.reportingYear || 'N/A'}</span>
                </div>
                <div className="fbar-meta-item">
                  <span className="fbar-meta-label">File Size</span>
                  <span className="fbar-meta-value">{viewingDoc.size}</span>
                </div>
                <div className="fbar-meta-item">
                  <span className="fbar-meta-label">Uploaded At</span>
                  <span className="fbar-meta-value">{viewingDoc.uploadedAt}</span>
                </div>
              </div>

              <div className="fbar-preview-box fbar-preview-box--viewer">
                {viewingDoc.previewLoading ? (
                  <div className="fbar-preview-fallback">
                    <Loader2 size={28} className="spinner" style={{ animation: 'spin 1s linear infinite' }} />
                    <p>Loading document preview...</p>
                  </div>
                ) : viewingDoc.previewError ? (
                  <div className="fbar-preview-fallback">
                    <AlertCircle size={28} color="#ef4444" />
                    <p>{viewingDoc.previewError}</p>
                  </div>
                ) : viewingDoc.previewUrl && viewingDoc.previewKind === 'pdf' ? (
                  <iframe
                    title={viewingDoc.name}
                    src={viewingDoc.previewUrl}
                    className="fbar-preview-frame"
                  />
                ) : viewingDoc.previewUrl && viewingDoc.previewKind === 'image' ? (
                  <img
                    src={viewingDoc.previewUrl}
                    alt={viewingDoc.name}
                    className="fbar-preview-image"
                  />
                ) : viewingDoc.previewUrl ? (
                  <div className="fbar-preview-fallback">
                    {getFileIcon(viewingDoc.name, 48)}
                    <p>Inline preview is not available for this file type.</p>
                    <button
                      type="button"
                      className="fbar-btn-reset"
                      style={{ padding: '8px 16px', fontSize: '0.82rem' }}
                      onClick={() => window.open(viewingDoc.previewUrl, '_blank', 'noopener,noreferrer')}
                    >
                      <ExternalLink size={14} /> Open in New Tab
                    </button>
                  </div>
                ) : (
                  <div className="fbar-preview-fallback">
                    {getFileIcon(viewingDoc.name, 48)}
                    <p>No preview available for this document.</p>
                  </div>
                )}
              </div>
            </div>

            <div className="fbar-modal-footer">
              <button
                type="button"
                className="fbar-btn-reset"
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
