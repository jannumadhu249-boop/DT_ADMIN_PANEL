import React, { useRef } from 'react';
import { Eye, Shield, X, CheckCircle, Clock, RefreshCw, Loader2, RotateCcw, Calendar } from 'lucide-react';
import { formatDate } from '../../utils/dateUtils';

const fmt = s => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

export default function ReferralsReportView({
  searchTerm, setSearchTerm,
  dateFrom, setDateFrom,
  dateTo, setDateTo,
  handleSubmit,
  handleResetFilters,
  filteredReferrals,
  numericYear,
  loading,
  error,
  pagination,
  onPageChange,
  showOtpModal, setShowOtpModal,
  otp, otpError, timeLeft, isVerifying, success,
  handleOtpChange,
  handleVerifyOtp,
  handleResend,
  handleFieldClick,
  getMaskedEmail,
  unmaskedFields,
  showViewListModal,
  selectedReferrer,
  handleViewList,
  handleCloseViewList,
  viewListLoading
}) {
  const refs = Array.from({ length: 6 }, () => useRef());

  const handleChange = (val, idx) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...otp];
    next[idx] = val;
    handleOtpChange(next);
    if (val && idx < 5) refs[idx + 1].current?.focus();
  };

  const handleKeyDown = (e, idx) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) refs[idx - 1].current?.focus();
  };

  return (
    <div className="content-card">
      <div className="header-section" style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: '12px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            Referred Friends Report {numericYear ? <span style={{ fontSize: '13px', background: '#e0f2fe', color: '#0369a1', padding: '3px 10px', borderRadius: '12px', fontWeight: '600' }}>TY{numericYear}</span> : null}
          </h2>
          <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--text-muted)' }}>
            Showing referral data for Tax Year {numericYear || '2026'} (Sorted by latest referral)
          </p>
        </div>
      </div>

      {/* Filter Form */}
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'flex-end', marginBottom: '24px', backgroundColor: '#f8f9fa', padding: '16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', minWidth: '200px' }}>
          <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text-muted)' }}>Search Name / Email</label>
          <input type="text" placeholder="Search by Name or Email" className="search-input-box" style={{ width: '100%' }} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', minWidth: '150px' }}>
          <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text-muted)' }}>Date From</label>
          <input type="date" className="date-picker-box" style={{ width: '100%' }} value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', minWidth: '150px' }}>
          <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text-muted)' }}>Date To</label>
          <input type="date" className="date-picker-box" style={{ width: '100%' }} value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button type="submit" className="btn btn-primary" style={{ padding: '8px 24px', height: '38px' }}>Submit</button>
          {handleResetFilters && (
            <button
              type="button"
              className="btn"
              style={{ padding: '8px 18px', height: '38px', backgroundColor: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', borderRadius: '4px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              onClick={handleResetFilters}
              title="Reset search and return to default year date range"
            >
              <RotateCcw size={14} />
              Reset
            </button>
          )}
        </div>
      </form>

      {/* ========== MAIN TABLE ========== */}
      <div className="table-responsive">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <Loader2 size={24} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
            <p>Loading referrals...</p>
          </div>
        ) : error ? (
          <div style={{ color: '#dc3545', padding: '1rem', textAlign: 'center' }}>{error}</div>
        ) : (
          <table className="corporate-table">
            <thead>
              <tr>
                <th style={{ width: '60px' }}>S.No</th>
                <th>Name/Email</th>
                <th style={{ width: '150px' }}>Referrals Count</th>
                <th style={{ width: '160px' }}>Dollars earned</th>
                {/* <th style={{ width: '160px' }}>Latest Referral</th> */}
                <th style={{ width: '100px', textAlign: 'center' }}>View List</th>
              </tr>
            </thead>
            <tbody>
              {filteredReferrals.length > 0 ? (
                filteredReferrals.map((ref) => {
                  const emailKey = `ref_${ref.memberId}_email`;
                  const isUnmasked = !!unmaskedFields[emailKey];
                  return (
                    <tr key={ref._id}>
                      <td>{ref.sNo}</td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <span style={{ fontWeight: '500' }}>{ref.name}</span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
                              {isUnmasked ? ref.email : getMaskedEmail(ref.email)}
                            </span>
                            <button
                              type="button"
                              className="email-toggle-eye-btn"
                              onClick={() => handleFieldClick(emailKey, isUnmasked, ref.memberId, 'member')}
                              style={{ padding: '2px', display: 'inline-flex', alignSelf: 'center', color: '#0076a3', border: 'none', background: 'none', cursor: 'pointer' }}
                            >
                              <Eye size={12} />
                            </button>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span style={{ fontWeight: '600' }}>{ref.referralsCount}</span>
                      </td>
                      <td>Total : ${ref.dollarsEarned}</td>
                      {/* <td style={{ fontSize: '12px', color: '#475569' }}>
                        {ref.latestReferralDate ? (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                            <Calendar size={13} color="#0076a3" />
                            {new Date(ref.latestReferralDate).toLocaleDateString(undefined, {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </span>
                        ) : (
                          '—'
                        )}
                      </td> */}
                      <td style={{ textAlign: 'center' }}>
                        <button
                          type="button"
                          className="btn"
                          style={{ backgroundColor: '#5cb85c', color: '#ffffff', padding: '4px 10px', fontSize: '12px', borderRadius: '4px' }}
                          onClick={() => handleViewList(ref)}
                        >
                          View List
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                    No referral records found for year {numericYear}.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {!loading && pagination.totalRecords > 0 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px' }}>
          <div className="pagination-row" style={{ display: 'flex', gap: '4px' }}>
            {[...Array(pagination.totalPages || 1)].map((_, i) => (
              <button
                key={i}
                className={`page-link-btn ${pagination.currentPage === i + 1 ? 'active' : ''}`}
                style={{
                  padding: '4px 10px',
                  border: '1px solid #ccc',
                  background: pagination.currentPage === i + 1 ? '#0076a3' : '#fff',
                  color: pagination.currentPage === i + 1 ? '#fff' : '#333',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
                onClick={() => onPageChange(i + 1)}
              >
                {i + 1}
              </button>
            ))}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            Showing {((pagination.currentPage - 1) * pagination.limit) + 1} to {Math.min(pagination.currentPage * pagination.limit, pagination.totalRecords)} of {pagination.totalRecords} entries
          </div>
        </div>
      )}

      {/* ========== OTP MODAL ========== */}
      {showOtpModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99999, padding: '16px' }}>
          <div style={{ background: '#fff', borderRadius: '14px', width: '100%', maxWidth: '440px', boxShadow: '0 25px 50px rgba(0,0,0,0.2)', overflow: 'hidden' }}>
            {/* Header */}
            <div style={{ background: 'linear-gradient(135deg, #0076a3, #005f8a)', padding: '18px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ background: 'rgba(255,255,255,0.2)', borderRadius: '8px', padding: '6px', display: 'flex' }}>
                  <Shield size={20} color="#fff" />
                </div>
                <div>
                  <p style={{ color: '#fff', fontWeight: '700', fontSize: '15px', margin: 0 }}>Email Verification Required</p>
                  <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '12px', margin: 0 }}>Unmask: Email Address</p>
                </div>
              </div>
              <button onClick={() => setShowOtpModal(false)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', opacity: 0.8 }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: '20px' }}>
              {success && (
                <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', color: '#047857', borderRadius: '8px', padding: '10px 14px', fontSize: '12px', display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '14px' }}>
                  <CheckCircle size={15} style={{ flexShrink: 0 }} />{success}
                </div>
              )}
              {otpError && (
                <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', borderRadius: '8px', padding: '10px 14px', fontSize: '12px', marginBottom: '14px' }}>
                  ⚠️ {otpError}
                </div>
              )}
              <p style={{ fontSize: '13px', color: '#475569', textAlign: 'center', marginBottom: '16px' }}>
                Enter the 6-digit security code sent to verify email viewing
              </p>

              <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '18px' }}>
                {otp.map((d, i) => (
                  <input
                    key={i}
                    ref={refs[i]}
                    type="text"
                    maxLength={1}
                    value={d}
                    onChange={e => handleChange(e.target.value, i)}
                    onKeyDown={e => handleKeyDown(e, i)}
                    onFocus={e => e.target.select()}
                    style={{
                      width: '44px', height: '50px', textAlign: 'center', fontSize: '22px', fontWeight: '700',
                      border: `2px solid ${d ? '#0076a3' : '#cbd5e1'}`,
                      borderRadius: '8px', outline: 'none',
                      boxShadow: d ? '0 0 0 3px rgba(0,118,163,0.15)' : 'none',
                      transition: 'all 0.15s'
                    }}
                  />
                ))}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px 14px', marginBottom: '4px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '600', color: timeLeft === 0 ? '#dc2626' : '#1e293b' }}>
                  <Clock size={15} color={timeLeft === 0 ? '#dc2626' : '#2563eb'} />
                  {timeLeft > 0 ? `Expires in ${fmt(timeLeft)}` : 'Code Expired'}
                </div>
                <button onClick={handleResend} disabled={timeLeft > 0} style={{ border: 'none', background: 'none', cursor: timeLeft > 0 ? 'not-allowed' : 'pointer', color: '#0076a3', fontSize: '12px', fontWeight: '600', opacity: timeLeft > 0 ? 0.45 : 1, display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <RefreshCw size={13} />
                  Resend Code
                </button>
              </div>
            </div>

            <div style={{ padding: '12px 20px 16px', borderTop: '1px solid #f1f5f9', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowOtpModal(false)} style={{ padding: '8px 16px', border: '1px solid #cbd5e1', borderRadius: '6px', background: '#fff', color: '#475569', fontSize: '13px', fontWeight: '500', cursor: 'pointer' }}>Cancel</button>
              <button
                onClick={handleVerifyOtp}
                disabled={isVerifying || otp.join('').length < 6}
                style={{ padding: '8px 18px', border: 'none', borderRadius: '6px', background: '#0076a3', color: '#fff', fontSize: '13px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', opacity: isVerifying || otp.join('').length < 6 ? 0.6 : 1 }}
              >
                {isVerifying ? <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> : null}
                {isVerifying ? 'Verifying...' : 'Verify & Reveal Email'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========== VIEW LIST MODAL ========== */}
      {showViewListModal && selectedReferrer && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '16px' }}>
          <div style={{ background: '#fff', borderRadius: '14px', width: '100%', maxWidth: '850px', boxShadow: '0 25px 50px rgba(0,0,0,0.2)', overflow: 'hidden' }}>
            <div style={{ background: 'linear-gradient(135deg, #0076a3, #005f8a)', padding: '18px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ color: '#fff', fontWeight: '700', fontSize: '16px', margin: 0 }}>
                  Referred Friends - {selectedReferrer.name}
                </p>
                <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '12px', margin: '3px 0 0' }}>
                  Total Referrals: {selectedReferrer.referralsCount} | Total Earned: ${selectedReferrer.dollarsEarned}
                </p>
              </div>
              <button onClick={handleCloseViewList} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', opacity: 0.85, padding: '4px' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: '20px' }}>
              {viewListLoading ? (
                <div style={{ textAlign: 'center', padding: '2rem' }}>
                  <Loader2 size={24} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
                  <p>Loading referrals...</p>
                </div>
              ) : (
                <>
                  <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                      <thead>
                        <tr style={{ background: '#f1f5f9', borderBottom: '1px solid #cbd5e1' }}>
                          <th style={{ padding: '12px', fontWeight: '700', textAlign: 'left', color: '#1e293b' }}>S.No</th>
                          <th style={{ padding: '12px', fontWeight: '700', textAlign: 'left', color: '#1e293b' }}>Name</th>
                          <th style={{ padding: '12px', fontWeight: '700', textAlign: 'left', color: '#1e293b' }}>Email</th>
                          <th style={{ padding: '12px', fontWeight: '700', textAlign: 'left', color: '#1e293b' }}>Mobile</th>
                          <th style={{ padding: '12px', fontWeight: '700', textAlign: 'left', color: '#1e293b' }}>Year</th>
                          <th style={{ padding: '12px', fontWeight: '700', textAlign: 'left', color: '#1e293b' }}>Referred Date</th>
                          <th style={{ padding: '12px', fontWeight: '700', textAlign: 'left', color: '#1e293b' }}>Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedReferrer.referredMembers && selectedReferrer.referredMembers.length > 0 ? (
                          selectedReferrer.referredMembers.map((member, idx) => {
                            const emailKey = `viewlist_${member._id}_email`;
                            const isUnmasked = !!unmaskedFields[emailKey];
                            return (
                              <tr key={member._id || idx} style={{ borderBottom: '1px solid #e2e8f0', background: idx % 2 === 1 ? '#f8fafc' : '#fff' }}>
                                <td style={{ padding: '12px', color: '#64748b' }}>{idx + 1}</td>
                                <td style={{ padding: '12px', color: '#334155', fontWeight: '500' }}>{member.name}</td>
                                <td style={{ padding: '12px', color: '#334155' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <span>{isUnmasked ? member.email : getMaskedEmail(member.email)}</span>
                                    <button
                                      type="button"
                                      className="email-toggle-eye-btn"
                                      onClick={() => handleFieldClick(emailKey, isUnmasked, member._id, 'referral')}
                                      style={{ padding: '2px', display: 'inline-flex', color: '#0076a3', border: 'none', background: 'none', cursor: 'pointer' }}
                                    >
                                      <Eye size={14} />
                                    </button>
                                  </div>
                                </td>
                                <td style={{ padding: '12px', color: '#334155' }}>{member.mobile}</td>
                                <td style={{ padding: '12px', color: '#334155' }}>{member.year}</td>
                                <td style={{ padding: '12px', color: '#334155' }}>
                                  {formatDate(member.createdAt)}
                                </td>
                                <td style={{ padding: '12px', color: '#334155' }}>${member.amount}</td>
                              </tr>
                            );
                          })
                        ) : (
                          <tr>
                            <td colSpan="7" style={{ textAlign: 'center', padding: '24px', color: '#64748b' }}>No referred members found.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Summary */}
                  <div style={{ marginTop: '16px', padding: '12px 16px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: '600', color: '#334155' }}>
                      <span>Total Amount</span>
                      <span>${selectedReferrer.dollarsEarned || 0}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: '600', color: '#334155', marginTop: '8px' }}>
                      <span>Paid Amount</span>
                      <span>${selectedReferrer.paidAmount || 0}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: '600', color: '#334155', marginTop: '8px' }}>
                      <span>Balance Amount</span>
                      <span>${selectedReferrer.balanceAmount || 0}</span>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div style={{ padding: '12px 20px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={handleCloseViewList} style={{ padding: '8px 20px', border: 'none', borderRadius: '6px', background: '#0076a3', color: '#fff', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}