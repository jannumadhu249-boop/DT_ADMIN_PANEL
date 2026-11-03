import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Upload, X, Save } from 'lucide-react';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import {
  ClassicEditor,
  Essentials,
  Paragraph,
  Heading,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Alignment,
  Link,
  List,
  BlockQuote,
  Table,
  TableToolbar,
  TableProperties,
  TableCellProperties,
  Undo,
  FontFamily,
  FontSize,
  FontColor,
  FontBackgroundColor,
} from 'ckeditor5';
import 'ckeditor5/ckeditor5.css';
import { URLS } from '../../url';
import './DashboardContent.css';

const getToken = () => {
  const keys = ['adminToken', 'authToken', 'token', 'accessToken', 'jwt'];
  for (const key of keys) {
    const value = sessionStorage.getItem(key) || localStorage.getItem(key);
    if (value) return value;
  }
  return 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhZG1pbl9pZCI6IjZhNThiZDFjNzE1ZjE4ZTYxZDQxY2Y5MiIsImVtYWlsIjoiZGl2eWFwZW5keWFsYTA3MTdAZ21haWwuY29tIiwiYWRtaW5fc3RhZ2UiOiJzdXBlciIsImlhdCI6MTc4NDIwNDE1OCwiZXhwIjoxODE1NzQwMTU4fQ.1pjPlGU41H1G5ei3AfTEcaWk9O1eyRTG769xnpj5xts';
};

export const FILE_STATUS_LIST = [
  { code: 'RGO', label: 'Registered Users (RGO)' },
  { code: 'SP', label: 'Scheduling Pending (SP)' },
  { code: 'BIP', label: 'Information Pending (BIP)' },
  { code: 'IP', label: 'Interview Pending (IP)' },
  { code: 'DP', label: 'Documents Pending (DP)' },
  { code: 'PP_I', label: 'Preparation Pending - I (PP_I)' },
  { code: 'PP_II', label: 'Preparation Pending - II (PP_II)' },
  { code: 'TR_S_I', label: 'Review & Summary I (TR_S_I)' },
  { code: 'TR_S_II', label: 'Review & Summary II (TR_S_II)' },
  { code: 'ITIN', label: 'ITIN Files (ITIN)' },
  { code: 'RE_ES', label: 'Revised Estimate (RE_ES)' },
  { code: 'PP_EF', label: 'Payment Pending - Efiling (PP_EF)' },
  { code: 'PP_PF', label: 'Payment Pending - Paper filing (PP_PF)' },
  { code: 'FPR', label: 'Fee Payment Received - I (FPR)' },
  { code: 'FPR_II', label: 'Fee Payment Received - II (FPR_II)' },
  { code: 'CR_EF', label: 'Client Review - Efiling (CR_EF)' },
  { code: 'CR_PF', label: 'Client Review - Paper Filing (CR_PF)' },
  { code: 'EFP_I', label: 'Efiling Pending - I (EFP_I)' },
  { code: 'EFP_II', label: 'Efiling Pending - II (EFP_II)' },
  { code: 'EF_AA_I', label: 'E - Filed & Awaiting Acceptance - I (EF_AA_I)' },
  { code: 'EF_AA_II', label: 'E - Filed & Awaiting Acceptance - II (EF_AA_II)' },
  { code: 'EF_REJ', label: 'E - Filed & Rejected (EF_REJ)' },
  { code: 'C_R', label: 'City Return (C_R)' },
  { code: 'EFA_FC', label: 'E-Filing Accepted & Filing Complete (EFA_FC)' },
  { code: 'PF_P', label: 'Paper Filing Pending (PF_P)' },
  { code: 'PF_D', label: 'Paper Filing Done (PF_D)' },
  { code: 'CANC', label: 'Cancelled (CANC)' },
];

/* CKEditor 4 Fallback Component (uses window.CKEDITOR from index.html CDN) */
function CKEditor4Fallback({ value, onChange }) {
  const textareaId = useRef(`cke4_dc_${Math.random().toString(36).substring(2, 9)}`);

  useEffect(() => {
    const CKEDITOR = window.CKEDITOR;
    if (!CKEDITOR) return;

    if (CKEDITOR.instances[textareaId.current]) {
      CKEDITOR.instances[textareaId.current].destroy(true);
    }

    const editor = CKEDITOR.replace(textareaId.current, {
      height: 420,
      allowedContent: true,
      toolbar: [
        { name: 'document', items: ['Source', '-', 'Undo', 'Redo'] },
        { name: 'styles', items: ['Format', 'Font', 'FontSize'] },
        { name: 'basicstyles', items: ['Bold', 'Italic', 'Underline', 'Strike'] },
        { name: 'colors', items: ['TextColor', 'BGColor'] },
        { name: 'paragraph', items: ['NumberedList', 'BulletedList', '-', 'Outdent', 'Indent', '-', 'Blockquote', 'JustifyLeft', 'JustifyCenter', 'JustifyRight', 'JustifyBlock'] },
        { name: 'insert', items: ['Table', 'HorizontalRule', 'SpecialChar'] },
        { name: 'links', items: ['Link', 'Unlink'] },
        { name: 'tools', items: ['Maximize'] }
      ]
    });

    editor.setData(value || '');

    editor.on('change', () => {
      if (onChange) onChange(editor.getData());
    });

    return () => {
      if (CKEDITOR.instances[textareaId.current]) {
        CKEDITOR.instances[textareaId.current].destroy(true);
      }
    };
  }, []);

  return (
    <textarea
      id={textareaId.current}
      defaultValue={value}
      style={{ width: '100%', minHeight: '420px', display: 'none' }}
    />
  );
}

export default function DashboardContentForm({ editData, onBack, onSave }) {
  const isEdit = !!editData;
  
  const fileRef = useRef(null);
  const editorRef = useRef(null);
  const [editorReady, setEditorReady] = useState(false);
  const [useFallback, setUseFallback] = useState(false);

  const [fileStatus, setFileStatus] = useState('RGO');
  const [pageTitle, setPageTitle] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  console.log('📋 DashboardContentForm rendered, editData:', editData);
  console.log('📝 Current pageTitle:', pageTitle);

  const buildImageUrl = (imageName) => {
    if (!imageName) return '';
    if (typeof imageName === 'object' && imageName !== null) {
      imageName = imageName.url || imageName.path || imageName.filename || imageName.file_path || '';
    }
    if (typeof imageName !== 'string' || !imageName.trim()) return '';
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

  useEffect(() => {
    if (editData) {
      const initialText = editData.page_title || editData.desc || editData.content || editData.description || '';
      setFileStatus(editData.file_status || editData.status || editData.statusCode || 'SP');
      setPageTitle(initialText);
      setImage(null);
      const imgName = editData.banner_image || editData.image || editData.imageUrl || editData.image_url || editData.bannerImage || editData.file_path || editData.filePath || '';
      const preview = buildImageUrl(imgName);
      setImagePreview(preview);

      if (editorRef.current && editorRef.current.getData() !== initialText) {
        editorRef.current.setData(initialText);
      }
    }
  }, [editData]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImage(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const removeImage = () => {
    setImage(null);
    setImagePreview(null);
    if (fileRef.current) fileRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!pageTitle.trim()) {
      alert('Description is required.');
      return;
    }
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('file_status', fileStatus);
      formData.append('page_title', pageTitle.trim());
      if (image) {
        formData.append('image', image);
      }

      const baseUrl = isEdit ? URLS.UpdateDashboardContent.replace(/\/+$/, '') : URLS.CreateDashboardContent;
      const url = isEdit ? `${baseUrl}/${editData._id || editData.id}` : baseUrl;
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${getToken()}` },
        body: formData,
      });
      const json = await res.json();
      if (res.ok && json.success !== false) {
        onSave(json.data || json.result || json);
      } else {
        throw new Error(json.message || 'Request failed');
      }
    } catch (err) {
      console.error('Save error:', err);
      onSave(null, err.message || 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="dc-page">
      <div className="dc-table-card">
        {/* Header */}
        {/* Header */}
<div
  className="dc-card-header"
  style={{
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    width: '100%',
  }}
>
  <div className="dc-header-left">
    <h2>
      {isEdit ? 'Edit Dashboard Content' : 'Add Dashboard Content'}
    </h2>

    <p>
      Fill in the details below to{' '}
      {isEdit ? 'update' : 'create'} dashboard content.
    </p>
  </div>

  <button
    type="button"
    onClick={onBack}
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      background: 'transparent',
      border: '1px solid #0076a3',
      borderRadius: '6px',
      color: '#0076a3',
      fontSize: '14px',
      fontWeight: '600',
      cursor: 'pointer',
      padding: '9px 16px',
      flexShrink: 0,
    }}
  >
    <ArrowLeft size={17} />
    Back to List
  </button>
</div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="dc-form-page-body">
            {/* Left Column */}
            <div className="dc-form-left-col">
              <div className="dc-form-group">
                <label>File Status <span className="dc-required">*</span></label>
                <select
                  className="dc-select"
                  value={fileStatus}
                  onChange={e => setFileStatus(e.target.value)}
                  required
                >
                  {FILE_STATUS_LIST.map(opt => (
                    <option key={opt.code} value={opt.code}>{opt.label}</option>
                  ))}
                </select>
              </div>

              <div className="dc-form-group">
                <label>Banner Image</label>
                {imagePreview ? (
                  <div className="dc-image-preview">
                    <img 
                      src={imagePreview} 
                      alt="Banner Preview" 
                      onError={(e) => { e.currentTarget.style.display = 'none'; }} 
                    />
                    <button type="button" className="dc-preview-remove" onClick={removeImage}>
                      <X size={12} />
                    </button>
                  </div>
                ) : (
                  <div className="dc-upload-zone">
                    <input ref={fileRef} type="file" accept="image/*" onChange={handleImageChange} />
                    <div className="dc-upload-icon"><Upload size={24} /></div>
                    <p className="dc-upload-hint">
                      <span>Click to upload</span> or drag & drop<br />
                      PNG, JPG, WEBP (max 5 MB)
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - CKEditor */}
            <div className="dc-form-right-col">
              <div className="dc-form-group" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <label>Description <span className="dc-required">*</span></label>
                <div className="dc-editor-wrapper" style={{ flex: 1, minHeight: '500px', position: 'relative' }}>
                  {!useFallback ? (
                    <>
                      {!editorReady && (
                        <div style={{
                          position: 'absolute',
                          top: '50%',
                          left: '50%',
                          transform: 'translate(-50%, -50%)',
                          color: '#64748b',
                          fontSize: '14px',
                          pointerEvents: 'none',
                          zIndex: 1
                        }}>
                          Loading editor...
                        </div>
                      )}
                      <CKEditor
                        editor={ClassicEditor}
                        data={pageTitle}
                        onReady={(editor) => {
                          console.log('✅ CKEditor 5 is ready!', editor);
                          editorRef.current = editor;
                          setEditorReady(true);
                        }}
                        onChange={(event, editor) => {
                          const data = editor.getData();
                          setPageTitle(data);
                        }}
                        onError={(error) => {
                          console.warn('⚠️ CKEditor 5 error, falling back to CKEditor 4:', error);
                          setUseFallback(true);
                        }}
                        config={{
                          licenseKey: 'GPL',
                          plugins: [
                            Essentials,
                            Paragraph,
                            Heading,
                            Bold,
                            Italic,
                            Underline,
                            Strikethrough,
                            FontFamily,
                            FontSize,
                            FontColor,
                            FontBackgroundColor,
                            Alignment,
                            Link,
                            List,
                            BlockQuote,
                            Table,
                            TableToolbar,
                            TableProperties,
                            TableCellProperties,
                            Undo
                          ],
                          toolbar: {
                            items: [
                              'heading', '|',
                              'fontFamily', 'fontSize', '|',
                              'bold', 'italic', 'underline', 'strikethrough', '|',
                              'fontColor', 'fontBackgroundColor', '|',
                              'alignment', '|',
                              'numberedList', 'bulletedList', '|',
                              'link', 'blockQuote', 'insertTable', '|',
                              'undo', 'redo'
                            ],
                            shouldNotGroupWhenFull: true
                          },
                          fontFamily: {
                            options: [
                              'default',
                              'Arial, Helvetica, sans-serif',
                              'Courier New, Courier, monospace',
                              'Georgia, serif',
                              'Lucida Sans Unicode, Lucida Grande, sans-serif',
                              'Tahoma, Geneva, sans-serif',
                              'Times New Roman, Times, serif',
                              'Trebuchet MS, Helvetica, sans-serif',
                              'Verdana, Geneva, sans-serif'
                            ],
                            supportAllValues: true
                          },
                          fontSize: {
                            options: [
                              'tiny',
                              'small',
                              'default',
                              'big',
                              'huge'
                            ],
                            supportAllValues: true
                          },
                          fontColor: {
                            columns: 5,
                            documentColors: 10
                          },
                          fontBackgroundColor: {
                            columns: 5,
                            documentColors: 10
                          },
                          heading: {
                            options: [
                              { model: 'paragraph', title: 'Paragraph', class: 'ck-heading_paragraph' },
                              { model: 'heading1', view: 'h1', title: 'Heading 1', class: 'ck-heading_heading1' },
                              { model: 'heading2', view: 'h2', title: 'Heading 2', class: 'ck-heading_heading2' },
                              { model: 'heading3', view: 'h3', title: 'Heading 3', class: 'ck-heading_heading3' },
                              { model: 'heading4', view: 'h4', title: 'Heading 4', class: 'ck-heading_heading4' }
                            ]
                          },
                          alignment: {
                            options: ['left', 'center', 'right', 'justify']
                          },
                          table: {
                            contentToolbar: [
                              'tableColumn',
                              'tableRow',
                              'mergeTableCells',
                              'tableProperties',
                              'tableCellProperties'
                            ]
                          },
                          placeholder: 'Enter page title / description...',
                        }}
                      />
                    </>
                  ) : (
                    <CKEditor4Fallback
                      value={pageTitle}
                      onChange={(data) => setPageTitle(data)}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="dc-form-page-footer">
            <button 
              type="button" 
              className="dc-btn-cancel" 
              onClick={onBack}
              disabled={submitting}
            >
              Cancel
            </button>
            <button type="submit" className="dc-btn-submit" disabled={submitting}>
              {submitting ? <span className="dc-spinner" /> : <Save size={14} />}
              {isEdit ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
