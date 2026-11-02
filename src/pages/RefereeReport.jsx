import React, { useState, useRef, useEffect } from 'react';
import { Eye, EyeOff, Shield, X, CheckCircle, Clock, RefreshCw, Loader2, Edit3 } from 'lucide-react';
import { URLS } from '../url';
import { formatDate } from '../utils/dateUtils';

// ---------- Helper: get auth token ----------
const getAuthToken = () => {
  const keys = ['authToken', 'token', 'adminToken', 'accessToken', 'jwt'];
  for (const key of keys) {
    const value = sessionStorage.getItem(key) || localStorage.getItem(key);
    if (value) return value;
  }
  throw new Error('Authentication token not found. Please log in.');
};

// Helper to format time (mm:ss)
const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

export default function RefereeReport() {
  // ---------- Filter state ----------
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const limit = 20;

  // ---------- Data states ----------
  const [referees, setReferees] = useState([]);
  const [pagination, setPagination] = useState({ currentPage: 1, limit: 20, totalRecords: 0, totalPages: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // ---------- Years dropdown ----------
  const [years, setYears] = useState([]);
  const [yearsLoading, setYearsLoading] = useState(false);

  // ---------- Edit Modal ----------
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingReferee, setEditingReferee] = useState(null);
  const [editDescription, setEditDescription] = useState('');
  const [editFollowUpDate, setEditFollowUpDate] = useState('');
  const [editStatus, setEditStatus] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  // ---------- OTP States ----------
  const [unmasked, setUnmasked] = useState({});
  const [otpModalOpen, setOtpModalOpen] = useState(false);
  const [pendingKey, setPendingKey] = useState(null);
  const [pendingLabel, setPendingLabel] = useState('');
  const [pendingItemId, setPendingItemId] = useState(null);
  const [pendingType, setPendingType] = useState(null);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isVerifying, setIsVerifying] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [success, setSuccess] = useState('');
  const refs = Array.from({ length: 6 }, () => useRef());

  // ---------- Today's Follow-ups Popup ----------
  const [todaysFollowupsPopup, setTodaysFollowupsPopup] = useState(false);
  const [todaysFollowups, setTodaysFollowups] = useState([]);

  // ---------- Fetch years ----------
  const fetchYears = async () => {
    setYearsLoading(true);
    try {
      const token = getAuthToken();
      const response = await fetch(URLS.GetYears, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const result = await response.json();
      if (result.success) {
        setYears(result.data || []);
        if (result.data.length > 0 && !selectedYear) {
          setSelectedYear(result.data[0]._id);
        }
      } else {
        console.error('Failed to fetch years:', result.message);
      }
    } catch (err) {
      console.error('Years fetch error:', err);
    } finally {
      setYearsLoading(false);
    }
  };

  // ---------- Fetch referees ----------
  const fetchReferees = async (pageNum = page, search = searchTerm, status = selectedStatus, yearId = selectedYear) => {
    setLoading(true);
    setError('');
    try {
      const token = getAuthToken();
      const body = {
        page: pageNum,
        limit,
        search: search || '',
        status: status || '',
        year_id: yearId || ''
      };
      const response = await fetch(URLS.GetRefereeReport, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const result = await response.json();
      if (result.success) {
        const mapped = result.data.map((item, idx) => ({
          _id: item._id,
          sNo: (pageNum - 1) * limit + idx + 1,
          name: item.friend_name || '—',
          email: item.friend_email || '—',
          mobile: item.friend_mobile || '—',
          refName: item.referred_by_name || '—',
          refEmail: item.referred_by_email || '—',
          followUpDate: item.follow_up_date || '',
          description: item.description || '',
          status: item.status || '',
          // extra fields for edit
          amount: item.amount || 0,
          paidAmount: item.paid_amount || 0,
          year: item.year || '',
          createdAt: item.createdAt || ''
        }));
        setReferees(mapped);
        setPagination(result.pagination || { currentPage: 1, limit: 20, totalRecords: 0, totalPages: 0 });
      } else {
        setError(result.message || 'Failed to fetch referee report.');
      }
    } catch (err) {
      if (err.message.includes('token')) {
        setError('Session expired. Please log in again.');
      } else {
        setError(err.message || 'Network error.');
      }
    } finally {
      setLoading(false);
    }
  };

  // ---------- Export ----------
  const handleExport = async () => {
    try {
      const token = getAuthToken();
      const body = {
        search: searchTerm || '',
        status: selectedStatus || '',
        year_id: selectedYear || ''
      };
      const response = await fetch(URLS.ExportRefereeReport, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const result = await response.json();
      if (result.success) {
        const data = result.data || [];
        if (data.length === 0) {
          alert('No data to export.');
          return;
        }
        const headers = ['Friend Name', 'Friend Email', 'Friend Mobile', 'Referred By Name', 'Referred By Email', 'Status', 'Amount', 'Paid Amount', 'Year', 'Created At'];
        const rows = data.map(item => [
          item.friend_name,
          item.friend_email,
          item.friend_mobile,
          item.referred_by_name,
          item.referred_by_email,
          item.status,
          item.amount,
          item.paid_amount,
          item.year,
          item.createdAt ? formatDate(item.createdAt, '') : ''
        ]);
        const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `referee_report_${new Date().toISOString().slice(0,10)}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
      } else {
        alert(result.message || 'Export failed.');
      }
    } catch (err) {
      alert(err.message || 'Export error.');
    }
  };

  // ---------- Edit handler (UPDATE with actual API) ----------
  const handleEditClick = (referee) => {
    setEditingReferee(referee);
    setEditDescription(referee.description || '');
    setEditFollowUpDate(referee.followUpDate || '');
    setEditStatus(referee.status || '');
    setSaveError('');
    setEditModalOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editingReferee) return;
    // Basic validation
    if (!editDescription.trim() && !editFollowUpDate && !editStatus) {
      setSaveError('At least one field must be updated.');
      return;
    }
    setIsSaving(true);
    setSaveError('');

    try {
      const token = getAuthToken();
      const url = `${URLS.UpdateRefereeReport}${editingReferee._id}`;

      // Build payload
      const payload = {};
      if (editDescription.trim()) payload.description = editDescription.trim();
      if (editFollowUpDate) payload.follow_up_date = editFollowUpDate;
      if (editStatus) payload.status = editStatus;

      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (response.ok && result.success) {
        // Update local list optimistically (or refetch)
        setReferees(prev =>
          prev.map(ref =>
            ref._id === editingReferee._id
              ? {
                  ...ref,
                  description: editDescription.trim() || ref.description,
                  followUpDate: editFollowUpDate || ref.followUpDate,
                  status: editStatus || ref.status
                }
              : ref
          )
        );
        setEditModalOpen(false);
        // Optionally, show a success toast/message
        alert(result.message || 'Referee details updated successfully.');
      } else {
        setSaveError(result.message || 'Failed to update referee details.');
      }
    } catch (err) {
      console.error('Update error:', err);
      setSaveError(err.message || 'Network error occurred.');
    } finally {
      setIsSaving(false);
    }
  };

  // ---------- OTP handlers ----------
  const sendOtp = async (itemId, type) => {
    try {
      const token = getAuthToken();
      const url = type === 'referee' ? URLS.SendEmailOtp : URLS.RefereeSendEmailOtp;
      const body = type === 'referee' ? { referral_id: itemId } : { member_id: itemId };
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });
      const result = await response.json();
      if (!result.success) {
        setOtpError(result.message || 'Failed to send OTP.');
      }
    } catch (err) {
      setOtpError(err.message || 'Network error sending OTP.');
    }
  };

  const handleEyeClick = (key, label, itemId, type) => {
    if (unmasked[key]) {
      setUnmasked((prev) => ({ ...prev, [key]: false }));
    } else {
      setPendingKey(key);
      setPendingLabel(label);
      setPendingItemId(itemId);
      setPendingType(type);
      setOtp(['', '', '', '', '', '']);
      setTimeLeft(30);
      setOtpError('');
      setSuccess('');
      sendOtp(itemId, type);
      setOtpModalOpen(true);
    }
  };

  const handleChange = (val, idx) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...otp];
    next[idx] = val;
    setOtp(next);
    if (val && idx < 5) refs[idx + 1].current?.focus();
  };

  const handleKeyDown = (e, idx) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) refs[idx - 1].current?.focus();
  };

  const handleResend = () => {
    if (timeLeft > 0) return;
    setTimeLeft(30);
    sendOtp(pendingItemId, pendingType);
    setOtp(['', '', '', '', '', '']);
    setSuccess('New verification code sent.');
  };

  const handleVerifyOtp = async () => {
    const code = otp.join('');
    if (code.length < 6) {
      setOtpError('Please enter the complete 6-digit code.');
      return;
    }
    setIsVerifying(true);
    setOtpError('');
    try {
      const token = getAuthToken();
      const url = pendingType === 'referee' ? URLS.VerifyEmailOtp : URLS.RefereeVerifyEmailOtp;
      const body = pendingType === 'referee'
        ? { referral_id: pendingItemId, otp: code }
        : { member_id: pendingItemId, otp: code };
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });
      const result = await response.json();
      if (result.success) {
        setUnmasked((prev) => ({ ...prev, [pendingKey]: true }));
        setSuccess('Verified successfully!');
        setTimeout(() => {
          setOtpModalOpen(false);
          setIsVerifying(false);
        }, 400);
      } else {
        setOtpError(result.message || 'Invalid OTP. Please try again.');
      }
    } catch (err) {
      setOtpError(err.message || 'Network error verifying OTP.');
    } finally {
      setIsVerifying(false);
    }
  };

  // ---------- Effects ----------
  useEffect(() => {
    fetchYears();
  }, []);

  useEffect(() => {
    if (selectedYear) {
      fetchReferees(1);
      setPage(1);
    }
  }, [searchTerm, selectedStatus, selectedYear]);

  // Check for today's follow-ups
  useEffect(() => {
    if (!loading && referees.length > 0) {
      const today = new Date().toISOString().split('T')[0];
      console.log('🔍 Checking for today\'s follow-ups:', { today, totalReferees: referees.length });
      
      const todaysList = referees.filter(ref => {
        const followUpDate = ref.followUpDate ? ref.followUpDate.split('T')[0] : '';
        console.log('📅 Referee:', ref.name, 'Follow-up:', followUpDate, 'Today:', today, 'Match:', followUpDate === today, 'Status:', ref.status);
        return followUpDate === today && ref.status !== 'Completed';
      });
      
      console.log('✅ Today\'s follow-ups found:', todaysList.length);
      
      if (todaysList.length > 0) {
        console.log('🎉 Showing popup with', todaysList.length, 'follow-ups');
        setTodaysFollowups(todaysList);
        setTodaysFollowupsPopup(true);
      } else {
        console.log('ℹ️ No follow-ups for today');
      }
    } else {
      console.log('⏳ Waiting for data:', { loading, refereesCount: referees.length });
    }
  }, [loading, referees]);

  // Timer for OTP
  useEffect(() => {
    if (!otpModalOpen) return;
    setOtp(['', '', '', '', '', '']);
    setTimeLeft(30);
    setOtpError('');
    setSuccess('');
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { clearInterval(timer); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [otpModalOpen]);

  // ---------- Handlers for UI ----------
  const handleSearch = (e) => {
    e.preventDefault();
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    fetchReferees(newPage);
  };

  // ---------- Render ----------
  return (
    <div style={{ padding: '20px', background: '#fff', minHeight: '100vh' }}>
      <h2 style={{ fontSize: '20px', color: '#334155', fontWeight: '500', marginBottom: '20px' }}>
        Referee Report
      </h2>

      {/* Controls Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '13px', fontWeight: '600', color: '#334155' }}>Status</span>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            style={{ padding: '6px 10px', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '13px', background: '#fff', outline: 'none' }}
          >
            <option value="">All Status</option>
            <option value="Not Registered">Not Registered</option>
            <option value="Pending">Pending</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>

          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            style={{ padding: '6px 10px', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '13px', background: '#fff', outline: 'none' }}
          >
            <option value="">Select year</option>
            {years.map((year) => (
              <option key={year._id} value={year._id}>{year.name}</option>
            ))}
          </select>

          <button
            onClick={handleExport}
            style={{ padding: '6px 14px', background: '#e2e8f0', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '13px', fontWeight: '500', color: '#334155', cursor: 'pointer' }}
          >
            Export to Excel
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <input
            type="text"
            placeholder="Search by name, email, mobile"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ padding: '6px 10px', border: '1px solid #cbd5e1', borderRadius: '4px 0 0 4px', fontSize: '13px', width: '220px', outline: 'none' }}
          />
          <button
            onClick={handleSearch}
            style={{ padding: '6px 16px', background: '#3182ce', color: '#fff', border: 'none', borderRadius: '0 4px 4px 0', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}
          >
            Search
          </button>
        </div>
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '4px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <Loader2 size={24} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
            <p>Loading referees...</p>
          </div>
        ) : error ? (
          <div style={{ color: '#dc3545', padding: '1rem', textAlign: 'center' }}>{error}</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#f1f5f9', borderBottom: '1px solid #cbd5e1', color: '#1e293b' }}>
                <th style={{ padding: '10px 12px', fontWeight: '700', borderRight: '1px solid #e2e8f0' }}>S.No</th>
                <th style={{ padding: '10px 12px', fontWeight: '700', borderRight: '1px solid #e2e8f0' }}>Name</th>
                <th style={{ padding: '10px 12px', fontWeight: '700', borderRight: '1px solid #e2e8f0' }}>Email</th>
                <th style={{ padding: '10px 12px', fontWeight: '700', borderRight: '1px solid #e2e8f0' }}>Mobile</th>
                <th style={{ padding: '10px 12px', fontWeight: '700', borderRight: '1px solid #e2e8f0' }}>Referred By Name</th>
                <th style={{ padding: '10px 12px', fontWeight: '700', borderRight: '1px solid #e2e8f0' }}>Referred By Email</th>
                <th style={{ padding: '10px 12px', fontWeight: '700', borderRight: '1px solid #e2e8f0' }}>Follow Up date</th>
                <th style={{ padding: '10px 12px', fontWeight: '700', borderRight: '1px solid #e2e8f0' }}>Description</th>
                <th style={{ padding: '10px 12px', fontWeight: '700', borderRight: '1px solid #e2e8f0' }}>Status</th>
                <th style={{ padding: '10px 12px', fontWeight: '700', textAlign: 'center' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {referees.length > 0 ? (
                referees.map((r, idx) => {
                  const emailKey = `ref_email_${r._id}`;
                  const refEmailKey = `ref_by_email_${r._id}`;
                  return (
                    <tr
                      key={r._id}
                      style={{ borderBottom: '1px solid #e2e8f0', background: idx % 2 === 1 ? '#f8fafc' : '#fff' }}
                    >
                      <td style={{ padding: '10px 12px', color: '#64748b', borderRight: '1px solid #f1f5f9' }}>{r.sNo}</td>
                      <td style={{ padding: '10px 12px', color: '#334155', borderRight: '1px solid #f1f5f9' }}>{r.name}</td>
                      <td style={{ padding: '10px 12px', borderRight: '1px solid #f1f5f9' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span>{unmasked[emailKey] ? r.email : 'XXXXXXXXXX.com'}</span>
                          <button
                            onClick={() => handleEyeClick(emailKey, `Email for ${r.name}`, r._id, 'referee')}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#0076a3', padding: 0 }}
                          >
                            {unmasked[emailKey] ? <EyeOff size={14} /> : <Eye size={14} />}
                          </button>
                        </div>
                      </td>
                      <td style={{ padding: '10px 12px', color: '#334155', borderRight: '1px solid #f1f5f9' }}>{r.mobile}</td>
                      <td style={{ padding: '10px 12px', color: '#334155', borderRight: '1px solid #f1f5f9' }}>{r.refName}</td>
                      <td style={{ padding: '10px 12px', borderRight: '1px solid #f1f5f9' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span>{unmasked[refEmailKey] ? r.refEmail : 'XXXXXXXXXX.com'}</span>
                          <button
                            onClick={() => handleEyeClick(refEmailKey, `Referred By Email for ${r.refName}`, r.memberId, 'referrer')}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#0076a3', padding: 0 }}
                          >
                            {unmasked[refEmailKey] ? <EyeOff size={14} /> : <Eye size={14} />}
                          </button>
                        </div>
                      </td>
                      <td style={{ padding: '10px 12px', color: '#64748b', borderRight: '1px solid #f1f5f9' }}>{r.followUpDate ? formatDate(r.followUpDate) : '—'}</td>
                      <td style={{ padding: '10px 12px', color: '#64748b', borderRight: '1px solid #f1f5f9' }}>{r.description || '—'}</td>
                      <td style={{ padding: '10px 12px', color: '#64748b', borderRight: '1px solid #f1f5f9' }}>
                        <span style={{
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '11px',
                          fontWeight: '600',
                          background: r.status === 'Completed' ? '#d1fae5' : r.status === 'Pending' ? '#fef3c7' : r.status === 'Cancelled' ? '#fee2e2' : 'transparent',
                          color: r.status === 'Completed' ? '#065f46' : r.status === 'Pending' ? '#92400e' : r.status === 'Cancelled' ? '#991b1b' : '#64748b'
                        }}>
                          {r.status || '—'}
                        </span>
                      </td>
                      <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                        <button
                          onClick={() => handleEditClick(r)}
                          style={{
                            background: '#0076a3',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '4px',
                            padding: '6px 10px',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '12px',
                            fontWeight: '500'
                          }}
                          title="Edit Referee Details"
                        >
                          <Edit3 size={14} />
                          Edit
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="10" style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                    No referee records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {!loading && pagination.totalRecords > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '16px', fontSize: '12px' }}>
          {[...Array(pagination.totalPages)].map((_, i) => (
            <button
              key={i}
              onClick={() => handlePageChange(i + 1)}
              style={{
                padding: '4px 8px',
                border: '1px solid #cbd5e1',
                background: pagination.currentPage === i + 1 ? '#e2e8f0' : '#fff',
                fontWeight: pagination.currentPage === i + 1 ? '700' : 'normal',
                cursor: 'pointer',
                borderRadius: '2px'
              }}
            >
              {i + 1}
            </button>
          ))}
          <button
            onClick={() => handlePageChange(pagination.currentPage + 1)}
            disabled={pagination.currentPage === pagination.totalPages}
            style={{ padding: '4px 8px', border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer', borderRadius: '2px' }}
          >
            &gt;
          </button>
          <button
            onClick={() => handlePageChange(pagination.totalPages)}
            disabled={pagination.currentPage === pagination.totalPages}
            style={{ padding: '4px 8px', border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer', borderRadius: '2px' }}
          >
            Last &gt;
          </button>
        </div>
      )}

      {/* ========== OTP MODAL ========== */}
      {otpModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99999, padding: '16px' }}>
          <div style={{ background: '#fff', borderRadius: '14px', width: '100%', maxWidth: '440px', boxShadow: '0 25px 50px rgba(0,0,0,0.2)', overflow: 'hidden' }}>
            <div style={{ background: 'linear-gradient(135deg, #0076a3, #005f8a)', padding: '18px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ background: 'rgba(255,255,255,0.2)', borderRadius: '8px', padding: '6px', display: 'flex' }}>
                  <Shield size={20} color="#fff" />
                </div>
                <div>
                  <p style={{ color: '#fff', fontWeight: '700', fontSize: '15px', margin: 0 }}>Email Verification Required</p>
                  <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '12px', margin: 0 }}>Unmask: {pendingLabel}</p>
                </div>
              </div>
              <button onClick={() => setOtpModalOpen(false)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', opacity: 0.8 }}>
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
              <button onClick={() => setOtpModalOpen(false)} style={{ padding: '8px 16px', border: '1px solid #cbd5e1', borderRadius: '6px', background: '#fff', color: '#475569', fontSize: '13px', fontWeight: '500', cursor: 'pointer' }}>
                Cancel
              </button>
              <button
                onClick={handleVerifyOtp}
                disabled={isVerifying || otp.join('').length < 6}
                style={{
                  padding: '8px 18px', border: 'none', borderRadius: '6px',
                  background: '#0076a3', color: '#fff', fontSize: '13px', fontWeight: '600',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
                  opacity: isVerifying || otp.join('').length < 6 ? 0.6 : 1
                }}
              >
                {isVerifying ? <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> : null}
                {isVerifying ? 'Verifying...' : 'Verify & Reveal Email'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========== EDIT MODAL ========== */}
      {editModalOpen && editingReferee && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '16px' }}>
          <div style={{ background: '#fff', borderRadius: '14px', width: '100%', maxWidth: '520px', boxShadow: '0 25px 50px rgba(0,0,0,0.2)', overflow: 'hidden' }}>
            <div style={{ background: 'linear-gradient(135deg, #0076a3, #005f8a)', padding: '18px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ background: 'rgba(255,255,255,0.2)', borderRadius: '8px', padding: '8px', display: 'flex' }}>
                  <Edit3 size={20} color="#fff" />
                </div>
                <div>
                  <p style={{ color: '#fff', fontWeight: '700', fontSize: '16px', margin: 0 }}>
                    Edit Referee Details
                  </p>
                  <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px', margin: 0 }}>
                    Update follow-up information for {editingReferee.name}
                  </p>
                </div>
              </div>
              <button onClick={() => setEditModalOpen(false)} type="button" style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', opacity: 0.85, padding: '4px' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: '20px' }}>
              {saveError && (
                <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', borderRadius: '8px', padding: '10px 14px', fontSize: '13px', marginBottom: '16px' }}>
                  ⚠️ {saveError}
                </div>
              )}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                    Description
                  </label>
                  <textarea
                    value={editDescription}
                    onChange={e => setEditDescription(e.target.value)}
                    placeholder="Enter description or notes"
                    rows={4}
                    style={{
                      width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '6px',
                      fontSize: '13px', color: '#0f172a', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit',
                      resize: 'vertical'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                    Follow Up Date
                  </label>
                  <input
                    type="date"
                    value={editFollowUpDate}
                    onChange={e => setEditFollowUpDate(e.target.value)}
                    style={{
                      width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '6px',
                      fontSize: '13px', color: '#0f172a', outline: 'none', boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                    Status
                  </label>
                  <select
                    value={editStatus}
                    onChange={e => setEditStatus(e.target.value)}
                    style={{
                      width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '6px',
                      fontSize: '13px', color: '#0f172a', outline: 'none', boxSizing: 'border-box', background: '#fff'
                    }}
                  >
                    <option value="">Select Status</option>
                    <option value="Not Registered">Not Registered</option>
                    <option value="Pending">Pending</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
            </div>

            <div style={{ padding: '12px 20px', borderTop: '1px solid #f1f5f9', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setEditModalOpen(false)}
                disabled={isSaving}
                style={{
                  padding: '9px 18px', border: '1px solid #cbd5e1', borderRadius: '6px',
                  background: '#fff', color: '#475569', fontSize: '13px', fontWeight: '500', cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveEdit}
                disabled={isSaving}
                style={{
                  padding: '9px 20px', border: 'none', borderRadius: '6px',
                  background: '#0076a3', color: '#fff', fontSize: '13px', fontWeight: '600',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
                  opacity: isSaving ? 0.7 : 1, boxShadow: '0 2px 4px rgba(0,118,163,0.2)'
                }}
              >
                {isSaving ? <Loader2 size={16} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} /> : null}
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========== TODAY'S FOLLOW-UPS POPUP ========== */}
      {todaysFollowupsPopup && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '16px' }}>
          <div style={{ background: '#fff', borderRadius: '14px', width: '100%', maxWidth: '600px', boxShadow: '0 25px 50px rgba(0,0,0,0.2)', overflow: 'hidden' }}>
            <div style={{ background: 'linear-gradient(135deg, #0076a3, #005f8a)', padding: '18px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ background: 'rgba(255,255,255,0.2)', borderRadius: '8px', padding: '8px', display: 'flex' }}>
                  <CheckCircle size={20} color="#fff" />
                </div>
                <div>
                  <p style={{ color: '#fff', fontWeight: '700', fontSize: '16px', margin: 0 }}>Today's Follow-ups</p>
                  <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px', margin: 0 }}>
                    {formatDate(new Date())}
                  </p>
                </div>
              </div>
              <button onClick={() => setTodaysFollowupsPopup(false)} type="button" style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', opacity: 0.85, padding: '4px' }}>
                <X size={20} />
              </button>
            </div>
            
            <div style={{ padding: '20px', maxHeight: '400px', overflowY: 'auto' }}>
              <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '16px' }}>
                You have {todaysFollowups.length} follow-up{todaysFollowups.length !== 1 ? 's' : ''} scheduled for today:
              </p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {todaysFollowups.map((ref, idx) => (
                  <div key={ref._id || idx} style={{ 
                    padding: '14px', 
                    background: '#f8fafc', 
                    border: '1px solid #e2e8f0', 
                    borderRadius: '8px',
                    borderLeft: `4px solid ${ref.status === 'Completed' ? '#28a745' : '#ffc107'}`
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
                      <div style={{ fontWeight: '600', fontSize: '14px', color: '#0f172a' }}>
                        {ref.name || 'No Name'}
                      </div>
                      <span style={{
                        padding: '3px 8px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: '600',
                        backgroundColor: ref.status === 'Completed' ? 'rgba(40,167,69,0.15)' : 'rgba(255,193,7,0.15)',
                        color: ref.status === 'Completed' ? '#28a745' : '#ffc107'
                      }}>
                        {ref.status || 'Pending'}
                      </span>
                    </div>
                    <div style={{ fontSize: '13px', color: '#475569', lineHeight: '1.5' }}>
                      {ref.description || 'No details provided'}
                    </div>
                    <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '6px' }}>
                      Contact: {ref.mobile}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ padding: '12px 20px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end' }}>
              <button 
                onClick={() => setTodaysFollowupsPopup(false)} 
                style={{ 
                  padding: '8px 20px', 
                  border: 'none', 
                  borderRadius: '6px', 
                  background: '#0076a3', 
                  color: '#fff', 
                  fontSize: '13px', 
                  fontWeight: '600', 
                  cursor: 'pointer' 
                }}
              >
                Got it!
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}