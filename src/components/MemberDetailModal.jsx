import React, { useState, useEffect } from 'react';
import { X, Lock, Eye, EyeOff, User, Users, Landmark, FileText, Download, MessageSquare, Send, Calendar, CheckCircle2 } from 'lucide-react';
import { getMemberDetails, WORKFLOW_STATUSES } from '../data/mockMembers';
import OtpVerificationModal from './OtpVerificationModal';

export default function MemberDetailModal({ member, isOpen, onClose, onUpdateMemberStatus }) {
  const [activeTab, setActiveTab] = useState('personal');
  const [tabRefreshKey, setTabRefreshKey] = useState(0);
  const [tabLoading, setTabLoading] = useState(false);
  const [unmaskedFields, setUnmaskedFields] = useState({});
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [pendingFieldKey, setPendingFieldKey] = useState(null);
  const [pendingFieldName, setPendingFieldName] = useState('');

  // Simulate tab data reload on each tab switch or re-click
  useEffect(() => {
    if (!isOpen) return;
    setTabLoading(true);
    const t = setTimeout(() => setTabLoading(false), 250);
    return () => clearTimeout(t);
  }, [activeTab, tabRefreshKey, isOpen]);

  // Comment & Status Form
  const [commentText, setCommentText] = useState('');
  const [newStatus, setNewStatus] = useState(member ? member.status : 'Scheduling Pending');
  const [commentHistory, setCommentHistory] = useState([
    { status: 'Scheduling Pending', comments: 'vm sent - pallavi', dateTime: '06-15-2026 :: 23:26' },
    { status: 'Scheduling Pending', comments: 'call not answered - Nagasri', dateTime: '06-05-2026 :: 21:25' }
  ]);

  if (!isOpen || !member) return null;

  const details = getMemberDetails(member);

  const detailTabs = [
    { id: 'personal', label: 'Personal Info', icon: User },
    { id: 'spouse', label: 'Spouse Info', icon: Users },
    { id: 'dependent', label: 'Dependent Info', icon: Users },
    { id: 'bank', label: 'Bank Details', icon: Landmark },
    { id: 'comments', label: 'Comments & Status', icon: MessageSquare },
    { id: 'fileInfo', label: 'File Info', icon: FileText }
  ];

  const handleFieldUnmaskClick = (fieldKey, fieldName) => {
    if (unmaskedFields[fieldKey]) {
      setUnmaskedFields(prev => ({ ...prev, [fieldKey]: false }));
    } else {
      setPendingFieldKey(fieldKey);
      setPendingFieldName(fieldName);
      setShowOtpModal(true);
    }
  };

  const handleOtpSuccess = () => {
    if (pendingFieldKey) {
      setUnmaskedFields(prev => ({ ...prev, [pendingFieldKey]: true }));
    }
  };

  const handleAddComment = (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    const pad = (num) => String(num).padStart(2, '0');
    const now = new Date();
    const dateTimeStr = `${pad(now.getMonth() + 1)}-${pad(now.getDate())}-${now.getFullYear()} :: ${pad(now.getHours())}:${pad(now.getMinutes())}`;

    const newEntry = {
      status: newStatus,
      comments: commentText,
      dateTime: dateTimeStr
    };

    setCommentHistory([newEntry, ...commentHistory]);
    setCommentText('');

    if (onUpdateMemberStatus) {
      onUpdateMemberStatus(member.sNo, newStatus, dateTimeStr);
    }
  };

  return (
    <>
      <div style={styles.overlay}>
        <div style={styles.modalContainer}>
          {/* Header */}
          <div style={styles.header}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h2 style={styles.title}>{member.name}</h2>
                <span style={styles.fileBadge}>File #{member.fileNo}</span>
                <span style={styles.statusBadge}>{member.status}</span>
              </div>
              <p style={styles.subtext}>Registered on {member.regDate} | Type: {member.filingType}</p>
            </div>
            <button style={styles.closeBtn} onClick={onClose} aria-label="Close">
              <X size={20} />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div style={styles.tabsRow}>
            {detailTabs.map(tab => {
              const IconComp = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                  setActiveTab(tab.id);
                  setTabRefreshKey(prev => prev + 1);
                }}
                  style={{
                    ...styles.tabBtn,
                    borderBottom: isActive ? '3px solid #0076a3' : '3px solid transparent',
                    color: isActive ? '#0076a3' : '#64748b',
                    fontWeight: isActive ? '600' : '500'
                  }}
                >
                  <IconComp size={15} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Main Body View */}
          <div style={styles.bodyContent}>
            {tabLoading && (
              <div style={{ textAlign: 'center', padding: '12px', color: '#0076a3', fontSize: '12px', fontWeight: '600', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                <span style={{ display: 'inline-block', width: '14px', height: '14px', border: '2px solid #0076a3', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
                Refreshing...
              </div>
            )}
            {/* Personal Info Tab */}
            {!tabLoading && activeTab === 'personal' && (
              <div style={styles.grid2Col}>
                <FieldRow label="First Name" value={details.personal.firstName} />
                <FieldRow label="Last Name" value={details.personal.lastName} />
                <FieldRow 
                  label="SSN" 
                  value={unmaskedFields['ssn'] ? details.personal.ssn : 'XXX-XX-' + details.personal.ssn.slice(-4)} 
                  isMasked={!unmaskedFields['ssn']}
                  onUnmask={() => handleFieldUnmaskClick('ssn', 'Social Security Number')}
                />
                <FieldRow label="Date of Birth" value={details.personal.dob} />
                <FieldRow 
                  label="Email" 
                  value={unmaskedFields['email'] ? details.personal.email : 'XXXXXXXXXX.' + details.personal.email.split('.').pop()} 
                  isMasked={!unmaskedFields['email']}
                  onUnmask={() => handleFieldUnmaskClick('email', 'Email Address')}
                />
                <FieldRow label="Contact Number" value={details.personal.contactNumber} />
                <FieldRow label="Visa Type" value={details.personal.visaType} />
                <FieldRow label="Occupation" value={details.personal.occupation} />
                <FieldRow label="Address" value={`${details.personal.address}, ${details.personal.city}, ${details.personal.state} ${details.personal.zipcode}`} colSpan={2} />
              </div>
            )}

            {/* Spouse Info Tab */}
            {!tabLoading && activeTab === 'spouse' && (
              details.spouse.firstName ? (
                <div style={styles.grid2Col}>
                  <FieldRow label="Spouse First Name" value={details.spouse.firstName} />
                  <FieldRow label="Spouse Last Name" value={details.spouse.lastName} />
                  <FieldRow label="Spouse SSN/ITIN" value={details.spouse.ssn ? 'XXX-XX-' + details.spouse.ssn.slice(-4) : 'N/A'} />
                  <FieldRow label="Date of Birth" value={details.spouse.dob} />
                  <FieldRow label="Occupation" value={details.spouse.occupation} />
                  <FieldRow label="Visa Type" value={details.spouse.visaType} />
                </div>
              ) : (
                <div style={styles.emptyBox}>No spouse details reported for this member.</div>
              )
            )}

            {/* Dependents Tab */}
            {!tabLoading && activeTab === 'dependent' && (
              details.dependents.length > 0 ? (
                <table className="corporate-table" style={{ width: '100%' }}>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>SSN</th>
                      <th>Relationship</th>
                      <th>DOB</th>
                      <th>Visa Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {details.dependents.map((dep, i) => (
                      <tr key={i}>
                        <td>{dep.name}</td>
                        <td>XXX-XX-{dep.ssn.slice(-4)}</td>
                        <td>{dep.relationship}</td>
                        <td>{dep.dob}</td>
                        <td>{dep.visa}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div style={styles.emptyBox}>No dependent records found.</div>
              )
            )}

            {/* Bank Details Tab */}
            {!tabLoading && activeTab === 'bank' && (
              <div style={styles.grid2Col}>
                <FieldRow label="Bank Name" value={details.bank.bankName} />
                <FieldRow label="Account Type" value={details.bank.accountType} />
                <FieldRow 
                  label="Account Number" 
                  value={unmaskedFields['bankAcc'] ? details.bank.accountNumber : 'XXXXXX' + details.bank.accountNumber.slice(-4)} 
                  isMasked={!unmaskedFields['bankAcc']}
                  onUnmask={() => handleFieldUnmaskClick('bankAcc', 'Bank Account Number')}
                />
                <FieldRow label="Routing Number" value={details.bank.routingNumber} />
              </div>
            )}

            {/* File Info Tab */}
            {!tabLoading && activeTab === 'fileInfo' && (
              <div style={styles.grid2Col}>
                <FieldRow label="File Number" value={member.fileNo} />
                <FieldRow label="Filing Type" value={member.filingType} />
                <FieldRow label="Registration Date" value={member.regDate} />
                <FieldRow label="Current Status" value={member.status} />
                <FieldRow label="Last Status Date" value={member.statusDate} />
                <FieldRow label="Tax Year" value={`TY${member.year || '2025'}`} />
              </div>
            )}

            {/* Comments & Status Tab */}
            {!tabLoading && activeTab === 'comments' && (
              <div>
                <form onSubmit={handleAddComment} style={styles.commentForm}>
                  <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#1e293b' }}>Add Workflow Update / Comment</h4>
                  <div style={{ display: 'flex', gap: '12px', marginBottom: '10px' }}>
                    <div style={{ flex: 1 }}>
                      <label style={styles.fieldLabel}>Update Status To:</label>
                      <select 
                        value={newStatus} 
                        onChange={(e) => setNewStatus(e.target.value)}
                        style={styles.selectInput}
                      >
                        {WORKFLOW_STATUSES.map(st => (
                          <option key={st} value={st}>{st}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label style={styles.fieldLabel}>Comment / Notes:</label>
                    <textarea 
                      rows="3" 
                      value={commentText} 
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="Type internal staff notes here..."
                      style={styles.textareaInput}
                    />
                  </div>

                  <button type="submit" style={styles.addCommentBtn}>
                    <Send size={14} /> Submit Comment & Update Status
                  </button>
                </form>

                <h4 style={{ marginTop: '20px', marginBottom: '10px', fontSize: '14px', color: '#1e293b' }}>Comments History</h4>
                <div style={styles.commentList}>
                  {commentHistory.map((item, index) => (
                    <div key={index} style={styles.commentCard}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span style={{ fontSize: '12px', fontWeight: '600', color: '#0076a3' }}>{item.status}</span>
                        <span style={{ fontSize: '11px', color: '#94a3b8' }}>{item.dateTime}</span>
                      </div>
                      <p style={{ margin: 0, fontSize: '13px', color: '#334155' }}>{item.comments}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div style={styles.footer}>
            <button style={styles.closeModalBtn} onClick={onClose}>
              Close Window
            </button>
          </div>
        </div>
      </div>

      {/* OTP Verification Modal */}
      <OtpVerificationModal 
        isOpen={showOtpModal}
        onClose={() => setShowOtpModal(false)}
        onVerifySuccess={handleOtpSuccess}
        targetField={pendingFieldName}
      />
    </>
  );
}

function FieldRow({ label, value, isMasked, onUnmask, colSpan = 1 }) {
  return (
    <div style={{ gridColumn: `span ${colSpan}`, marginBottom: '12px' }}>
      <label style={styles.fieldLabel}>{label}</label>
      <div style={styles.fieldValueBox}>
        <span style={{ fontSize: '13px', fontWeight: '500', color: '#1e293b' }}>{value || '—'}</span>
        {onUnmask && (
          <button type="button" onClick={onUnmask} style={styles.unmaskBtn}>
            {isMasked ? <Eye size={14} /> : <EyeOff size={14} />}
            <span>{isMasked ? 'Unmask' : 'Hide'}</span>
          </button>
        )}
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    backdropFilter: 'blur(3px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9990,
    padding: '20px'
  },
  modalContainer: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    width: '100%',
    maxWidth: '780px',
    maxHeight: '90vh',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    overflow: 'hidden'
  },
  header: {
    padding: '18px 24px',
    backgroundColor: '#0076a3',
    color: '#ffffff',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start'
  },
  title: {
    margin: 0,
    fontSize: '18px',
    fontWeight: '700'
  },
  fileBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: '2px 8px',
    borderRadius: '4px',
    fontSize: '12px'
  },
  statusBadge: {
    backgroundColor: '#ffffff',
    color: '#0076a3',
    padding: '2px 8px',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: '600'
  },
  subtext: {
    margin: '4px 0 0 0',
    fontSize: '12px',
    opacity: 0.85
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    color: '#ffffff',
    cursor: 'pointer',
    opacity: 0.8
  },
  tabsRow: {
    display: 'flex',
    borderBottom: '1px solid #e2e8f0',
    backgroundColor: '#f8fafc',
    padding: '0 16px',
    overflowX: 'auto'
  },
  tabBtn: {
    background: 'none',
    border: 'none',
    padding: '12px 16px',
    cursor: 'pointer',
    fontSize: '13px',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    whiteSpace: 'nowrap'
  },
  bodyContent: {
    padding: '24px',
    overflowY: 'auto',
    flex: 1
  },
  grid2Col: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px'
  },
  fieldLabel: {
    display: 'block',
    fontSize: '11px',
    fontWeight: '600',
    color: '#64748b',
    textTransform: 'uppercase',
    marginBottom: '4px'
  },
  fieldValueBox: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 12px',
    backgroundColor: '#f1f5f9',
    borderRadius: '6px',
    border: '1px solid #e2e8f0'
  },
  unmaskBtn: {
    border: 'none',
    background: '#ffffff',
    color: '#0076a3',
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
  },
  emptyBox: {
    padding: '30px',
    textAlign: 'center',
    color: '#64748b',
    fontSize: '14px',
    backgroundColor: '#f8fafc',
    borderRadius: '8px'
  },
  commentForm: {
    backgroundColor: '#f8fafc',
    padding: '16px',
    borderRadius: '8px',
    border: '1px solid #e2e8f0'
  },
  selectInput: {
    width: '100%',
    padding: '8px 12px',
    borderRadius: '6px',
    border: '1px solid #cbd5e1',
    fontSize: '13px',
    backgroundColor: '#ffffff'
  },
  textareaInput: {
    width: '100%',
    padding: '10px 12px',
    borderRadius: '6px',
    border: '1px solid #cbd5e1',
    fontSize: '13px',
    resize: 'vertical'
  },
  addCommentBtn: {
    marginTop: '10px',
    padding: '8px 16px',
    backgroundColor: '#0076a3',
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  },
  commentList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  commentCard: {
    padding: '12px',
    backgroundColor: '#ffffff',
    borderRadius: '6px',
    border: '1px solid #e2e8f0'
  },
  footer: {
    padding: '12px 24px',
    borderTop: '1px solid #e2e8f0',
    display: 'flex',
    justifyContent: 'flex-end',
    backgroundColor: '#f8fafc'
  },
  closeModalBtn: {
    padding: '8px 18px',
    backgroundColor: '#475569',
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    fontSize: '13px',
    cursor: 'pointer'
  }
};
