import React, { useState } from 'react';
import { 
  FileText, 
  UploadCloud, 
  Download, 
  Trash2, 
  Search, 
  Filter, 
  Eye, 
  Check, 
  FileSpreadsheet, 
  Archive,
  Image as ImageIcon
} from 'lucide-react';

export default function DocumentHub({ documents, onUpdateDocuments }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  
  // simulated upload states
  const [isDragging, setIsDragging] = useState(false);
  const [uploadName, setUploadName] = useState('');
  const [uploadCategory, setUploadCategory] = useState('Income');
  const [showUploadForm, setShowUploadForm] = useState(false);

  const getFileIcon = (fileName) => {
    const ext = fileName.split('.').pop().toLowerCase();
    if (ext === 'xlsx' || ext === 'csv' || ext === 'xls') return <FileSpreadsheet size={20} style={{ color: '#10b981' }} />;
    if (ext === 'zip' || ext === 'rar') return <Archive size={20} style={{ color: '#f59e0b' }} />;
    if (ext === 'png' || ext === 'jpg' || ext === 'jpeg') return <ImageIcon size={20} style={{ color: '#8b5cf6' }} />;
    return <FileText size={20} style={{ color: '#3b82f6' }} />;
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    // Open the upload naming modal
    setUploadName('Dropped_Tax_Form_' + Math.floor(Math.random() * 100) + '.pdf');
    setShowUploadForm(true);
  };

  const handleSimulatedUpload = (e) => {
    e.preventDefault();
    if (!uploadName.trim()) return;

    // Standardize file name
    let cleanName = uploadName;
    if (!cleanName.includes('.')) {
      cleanName += '.pdf';
    }

    const sizes = ['1.2 MB', '4.5 MB', '720 KB', '2.8 MB', '15.4 KB'];
    const randomSize = sizes[Math.floor(Math.random() * sizes.length)];

    const newDoc = {
      name: cleanName,
      category: uploadCategory,
      size: randomSize,
      uploadedAt: new Date().toISOString().split('T')[0],
      url: '#'
    };

    onUpdateDocuments([newDoc, ...documents]);
    
    // Reset Form
    setUploadName('');
    setUploadCategory('Income');
    setShowUploadForm(false);
  };

  const handleDelete = (docName) => {
    onUpdateDocuments(documents.filter(d => d.name !== docName));
  };

  const handleDownload = (docName) => {
    alert(`Downloading "${docName}" (simulated execution secure sandbox)...`);
  };

  // Filter docs
  const filteredDocs = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || doc.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div>
      <div className="header-section">
        <div>
          <h1 className="page-title">Document Audit Hub</h1>
          <p className="page-subtitle">Secure filing repository for W-2s, 1099s, expense receipts, and identification.</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-primary" onClick={() => setShowUploadForm(!showUploadForm)}>
            <UploadCloud size={16} /> Simulate Document Upload
          </button>
        </div>
      </div>

      <div className="grid-2-1">
        
        {/* Left Panel: Files Registry */}
        <div className="card">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginBottom: '24px', alignItems: 'center' }}>
            <div style={{ position: 'relative', flexGrow: 1, minWidth: '200px' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '14px', color: 'var(--text-muted)' }} />
              <input 
                type="text" 
                className="form-input" 
                placeholder="Search audit records..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ paddingLeft: '38px' }}
              />
            </div>

            <select 
              className="form-select" 
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              style={{ width: 'auto', minWidth: '150px' }}
            >
              <option value="All">All Categories</option>
              <option value="Income">Income (W-2/1099)</option>
              <option value="Expense">Expenses & Deductions</option>
              <option value="ID & Corporate">ID & Corporate</option>
            </select>
          </div>

          <div className="table-container">
            {filteredDocs.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-muted)' }}>
                <FileText size={48} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
                <p>No audit documents match the filter criteria.</p>
              </div>
            ) : (
              <table className="premium-table">
                <thead>
                  <tr>
                    <th>Document Name</th>
                    <th>Category</th>
                    <th>Size</th>
                    <th>Uploaded Date</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDocs.map((doc, idx) => (
                    <tr key={doc.name + idx}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          {getFileIcon(doc.name)}
                          <span style={{ fontWeight: '500', color: 'var(--text-primary)' }}>{doc.name}</span>
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${
                          doc.category === 'Income' ? 'badge-info' : 
                          doc.category === 'Expense' ? 'badge-success' : 'badge-warning'
                        }`}>
                          {doc.category}
                        </span>
                      </td>
                      <td style={{ color: 'var(--text-secondary)' }}>{doc.size}</td>
                      <td style={{ color: 'var(--text-muted)', fontSize: '13px' }}>{doc.uploadedAt}</td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                          <button 
                            className="btn btn-secondary btn-icon-only" 
                            title="Download File" 
                            onClick={() => handleDownload(doc.name)}
                            style={{ padding: '6px' }}
                          >
                            <Download size={14} />
                          </button>
                          <button 
                            className="btn btn-secondary btn-icon-only" 
                            title="Delete File" 
                            onClick={() => handleDelete(doc.name)}
                            style={{ padding: '6px', color: 'var(--text-muted)' }}
                            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent-error)'}
                            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
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

        {/* Right Panel: Upload Box & Category Explainer */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Simulated File Upload Drag & Drop Box */}
          <div 
            className="card"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            style={{ 
              border: isDragging ? '2px dashed var(--accent-primary)' : '2px dashed var(--border-color)',
              backgroundColor: isDragging ? 'rgba(59, 130, 246, 0.04)' : 'var(--bg-card)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '40px 24px',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all var(--transition-fast)'
            }}
            onClick={() => setShowUploadForm(!showUploadForm)}
          >
            <UploadCloud size={48} style={{ color: isDragging ? 'var(--accent-primary)' : 'var(--text-muted)', marginBottom: '16px', transition: 'color 0.2s' }} />
            <h4 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '8px' }}>Simulate File Drag & Drop</h4>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', maxWidth: '220px', margin: '0 auto' }}>
              Drag PDFs, W2 statements, or receipts here to simulate document ingestion.
            </p>
          </div>

          {/* Upload Form Modal/Expandable */}
          {showUploadForm && (
            <div className="card" style={{ border: '1px solid var(--accent-primary)', animation: 'fadeIn 0.2s ease-in-out' }}>
              <h3 className="card-title" style={{ fontSize: '16px', marginBottom: '16px' }}>Metadata Configuration</h3>
              <form onSubmit={handleSimulatedUpload}>
                <div className="form-group">
                  <label className="form-label">File Name</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    required 
                    placeholder="e.g. 2025_W2_Employer.pdf"
                    value={uploadName}
                    onChange={(e) => setUploadName(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select 
                    className="form-select"
                    value={uploadCategory}
                    onChange={(e) => setUploadCategory(e.target.value)}
                  >
                    <option value="Income">Income (W-2/1099)</option>
                    <option value="Expense">Expenses & Deductions</option>
                    <option value="ID & Corporate">ID & Corporate</option>
                  </select>
                </div>

                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '16px' }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowUploadForm(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary">Simulate Upload</button>
                </div>
              </form>
            </div>
          )}

          {/* Compliance & Categorization Help */}
          <div className="card">
            <h3 className="card-title" style={{ fontSize: '16px' }}>Filing Classification Scheme</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px', color: 'var(--text-secondary)' }}>
              <div>
                <strong style={{ color: 'var(--text-primary)' }}>Income Documents</strong>
                <p style={{ fontSize: '12px', marginTop: '2px' }}>W-2 statements, 1099-NEC contractor forms, 1099-INT bank interest statements. Essential for gross income calculation.</p>
              </div>
              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '8px' }}>
                <strong style={{ color: 'var(--text-primary)' }}>Expenses & Deductions</strong>
                <p style={{ fontSize: '12px', marginTop: '2px' }}>Form 1098 Mortgage Interest, charitable donation letters, business vehicle logs, and healthcare receipts.</p>
              </div>
              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '8px' }}>
                <strong style={{ color: 'var(--text-primary)' }}>ID & Corporate Files</strong>
                <p style={{ fontSize: '12px', marginTop: '2px' }}>Driver's License copies, articles of organization, corporate bylaws, and prior-year tax returns.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
