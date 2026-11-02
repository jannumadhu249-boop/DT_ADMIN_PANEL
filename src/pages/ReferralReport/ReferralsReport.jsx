import React, { useState, useEffect } from 'react';
import ReferralsReportView from '../ReferralReport/ReferralReportView';
import { URLS } from '../../url';

const getAuthToken = () => {
  const keys = ['authToken', 'token', 'adminToken', 'accessToken', 'jwt'];
  for (const key of keys) {
    const value = sessionStorage.getItem(key) || localStorage.getItem(key);
    if (value) return value;
  }
  throw new Error('Authentication token not found. Please log in.');
};

export default function ReferralsReport({ selectedYear, setSelectedYear }) {
  // ---------- Filter state ----------
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [page, setPage] = useState(1);
  const limit = 20;

  // ---------- Data states ----------
  const [referralsData, setReferralsData] = useState([]);
  const [pagination, setPagination] = useState({ currentPage: 1, limit: 20, totalRecords: 0, totalPages: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeYearId, setActiveYearId] = useState('');

  // ---------- OTP state ----------
  const [unmaskedFields, setUnmaskedFields] = useState({});
  const [verificationFieldKey, setVerificationFieldKey] = useState(null);
  const [verificationItemId, setVerificationItemId] = useState(null);
  const [verificationType, setVerificationType] = useState(null);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [timeLeft, setTimeLeft] = useState(30);
  const [isVerifying, setIsVerifying] = useState(false);
  const [success, setSuccess] = useState('');

  // ---------- View List Modal state ----------
  const [showViewListModal, setShowViewListModal] = useState(false);
  const [selectedReferrer, setSelectedReferrer] = useState(null);
  const [viewListLoading, setViewListLoading] = useState(false);

  // ---------- Derived numeric year ----------
  const numericYear = selectedYear ? selectedYear.replace('TY', '') : '2026';

  // Fetch active year ID matching selected numericYear
  useEffect(() => {
    let isMounted = true;
    const fetchYearId = async () => {
      try {
        const token = getAuthToken();
        const res = await fetch(URLS.GetYears, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        if (res.ok) {
          const result = await res.json();
          if (isMounted && result.success && Array.isArray(result.data)) {
            const found = result.data.find(y => String(y.name) === String(numericYear));
            if (found && found._id) {
              setActiveYearId(found._id);
            }
          }
        }
      } catch (err) {
        console.warn('Error fetching year ID in ReferralsReport:', err);
      }
    };
    fetchYearId();
    return () => { isMounted = false; };
  }, [numericYear]);

  // ---------- API calls ----------
  const fetchReferrals = async (pageNum = 1, searchEmail = searchTerm, from = dateFrom, to = dateTo, yr = numericYear) => {
    setLoading(true);
    setError('');
    try {
      const token = getAuthToken();
      const currentYearNum = yr || (selectedYear ? selectedYear.replace('TY', '') : '2026');

      // Scope date filter to the selected year if no custom dates were supplied
      const yearStartDate = currentYearNum ? `${currentYearNum}-01-01` : '';
      const yearEndDate = currentYearNum ? `${currentYearNum}-12-31` : '';
      const effFrom = from || yearStartDate;
      const effTo = to || yearEndDate;

      const body = {
        page: pageNum,
        limit,
        email: searchEmail || '',
        from_date: effFrom,
        to_date: effTo,
        year: currentYearNum,
        year_id: activeYearId || ''
      };

      const response = await fetch(URLS.GetReferalReport, {
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
        const rawMembers = Array.isArray(result.data) ? result.data : [];

        // Enrich each referrer with their referrals and latest referral date
        const membersWithDetails = await Promise.all(
          rawMembers.map(async (item) => {
            const memberId = item.member_id || item._id;
            try {
              const memRes = await fetch(`${URLS.ViewReferalMember}${memberId}`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${token}`
                }
              });
              if (memRes.ok) {
                const memData = await memRes.json();
                if (memData.success && Array.isArray(memData.data)) {
                  // Filter member's referrals to the current year
                  const refs = currentYearNum
                    ? memData.data.filter(r => !r.year?.name || String(r.year.name) === String(currentYearNum))
                    : memData.data;

                  const latestTime = refs.reduce((max, r) => {
                    const t = r.createdAt ? new Date(r.createdAt).getTime() : 0;
                    return t > max ? t : max;
                  }, 0);

                  return {
                    ...item,
                    memberId,
                    latestReferralDate: latestTime > 0 ? new Date(latestTime).toISOString() : null,
                    referralsCount: refs.length > 0 ? refs.length : (item.referrals_count || 0),
                    cachedRefs: refs,
                    summary: memData.summary || null
                  };
                }
              }
            } catch (e) {
              console.warn('Error fetching member referrals for sorting:', e);
            }
            return {
              ...item,
              memberId,
              latestReferralDate: null,
              referralsCount: item.referrals_count || 0,
              cachedRefs: [],
              summary: null
            };
          })
        );

        // Sort members: latest referral on top (DESC)
        membersWithDetails.sort((a, b) => {
          const timeA = a.latestReferralDate ? new Date(a.latestReferralDate).getTime() : 0;
          const timeB = b.latestReferralDate ? new Date(b.latestReferralDate).getTime() : 0;
          return timeB - timeA;
        });

        const mapped = membersWithDetails.map((item, idx) => ({
          sNo: (pageNum - 1) * limit + idx + 1,
          _id: item._id,
          memberId: item.memberId,
          name: item.name || '—',
          email: item.email || '—',
          referralsCount: item.referralsCount,
          dollarsEarned: item.dollars_earned || 0,
          balance: item.balance_amount || 0,
          latestReferralDate: item.latestReferralDate,
          cachedRefs: item.cachedRefs,
          summary: item.summary
        }));

        setReferralsData(mapped);
        setPagination(result.pagination || {
          currentPage: pageNum,
          limit,
          totalRecords: mapped.length,
          totalPages: Math.ceil(mapped.length / limit)
        });
      } else {
        setError(result.message || 'Failed to fetch referrals.');
      }
    } catch (err) {
      setError(err.message || 'Network error.');
    } finally {
      setLoading(false);
    }
  };

  const fetchMemberReferrals = async (memberId) => {
    setViewListLoading(true);
    try {
      const member = referralsData.find(r => r.memberId === memberId);
      let rawRefs = member?.cachedRefs;
      let summaryData = member?.summary;

      if (!rawRefs || rawRefs.length === 0) {
        const token = getAuthToken();
        const response = await fetch(`${URLS.ViewReferalMember}${memberId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          }
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const result = await response.json();
        if (result.success && Array.isArray(result.data)) {
          rawRefs = result.data;
          summaryData = result.summary;
        } else {
          throw new Error(result.message || 'Failed to fetch member referrals.');
        }
      }

      // Filter by selected year
      const yearFilteredRefs = numericYear
        ? rawRefs.filter(item => !item.year?.name || String(item.year.name) === String(numericYear))
        : rawRefs;

      // Sort latest referrals on top (DESC)
      const sortedRefs = [...yearFilteredRefs].sort((a, b) => {
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return timeB - timeA;
      });

      const referrer = {
        name: member?.name || '—',
        referralsCount: sortedRefs.length,
        dollarsEarned: summaryData?.totalAmount ?? (member?.dollarsEarned || 0),
        paidAmount: summaryData?.paidAmount ?? 0,
        balanceAmount: summaryData?.balanceAmount ?? (member?.balance || 0),
        referredMembers: sortedRefs.map(item => ({
          _id: item._id, // referral id
          name: item.friend_name || '—',
          email: item.friend_email || '—',
          mobile: item.friend_mobile || '—',
          year: item.year?.name || numericYear || '—',
          amount: item.amount || 0,
          paidAmount: item.paid_amount || 0,
          status: item.status || '—',
          createdAt: item.createdAt || '—'
        }))
      };
      setSelectedReferrer(referrer);
      setShowViewListModal(true);
    } catch (err) {
      setError(err.message || 'Network error.');
    } finally {
      setViewListLoading(false);
    }
  };

  // ---------- OTP helpers ----------
  const sendOtp = async (itemId, type) => {
    try {
      const token = getAuthToken();
      const url = type === 'member' ? URLS.SendEmailOtp : URLS.RefereeSendEmailOtp;
      const body = type === 'member' ? { member_id: itemId } : { referral_id: itemId };
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

  const handleFieldClick = (fieldKey, isCurrentlyUnmasked, itemId, type) => {
    if (isCurrentlyUnmasked) {
      setUnmaskedFields(prev => ({ ...prev, [fieldKey]: false }));
    } else {
      setVerificationFieldKey(fieldKey);
      setVerificationItemId(itemId);
      setVerificationType(type);
      sendOtp(itemId, type);
      setOtp(['', '', '', '', '', '']);
      setOtpError('');
      setSuccess('Verification code sent to your email.');
      setShowOtpModal(true);
    }
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
      const url = verificationType === 'member' ? URLS.VerifyEmailOtp : URLS.RefereeVerifyEmailOtp;
      const body = verificationType === 'member'
        ? { member_id: verificationItemId, otp: code }
        : { referral_id: verificationItemId, otp: code };
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
        setUnmaskedFields(prev => ({ ...prev, [verificationFieldKey]: true }));
        setSuccess('Verified successfully!');
        setTimeout(() => {
          setShowOtpModal(false);
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

  const handleResend = () => {
    if (timeLeft > 0) return;
    setTimeLeft(30);
    sendOtp(verificationItemId, verificationType);
    setOtp(['', '', '', '', '', '']);
    setSuccess('New verification code sent.');
  };

  // ---------- Timer effect ----------
  useEffect(() => {
    if (!showOtpModal) return;
    setOtp(['', '', '', '', '', '']);
    setTimeLeft(30);
    setOtpError('');
    setSuccess('Verification code sent to your email.');
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { clearInterval(timer); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [showOtpModal]);

  // ---------- Fetch on selectedYear change or activeYearId resolution ----------
  useEffect(() => {
    setPage(1);
    setDateFrom('');
    setDateTo('');
    setSearchTerm('');
    fetchReferrals(1, '', '', '', numericYear);
  }, [selectedYear, activeYearId]);

  // ---------- Handlers ----------
  const handleSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchReferrals(1, searchTerm, dateFrom, dateTo, numericYear);
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setDateFrom('');
    setDateTo('');
    setPage(1);
    fetchReferrals(1, '', '', '', numericYear);
  };

  const handleViewList = (referrer) => {
    fetchMemberReferrals(referrer.memberId);
  };

  const handleCloseViewList = () => {
    setShowViewListModal(false);
    setSelectedReferrer(null);
  };

  const getMaskedEmail = (email) => {
    if (!email) return '';
    const parts = email.split('@');
    return 'XXXXXXXXXX.' + (parts[parts.length - 1]?.split('.').pop() || '');
  };

  // Client-side search matching by name or email
  const displayedReferrals = searchTerm
    ? referralsData.filter(r =>
        (r.name && r.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (r.email && r.email.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    : referralsData;

  // ---------- Render ----------
  return (
    <ReferralsReportView
      // Filter
      searchTerm={searchTerm}
      setSearchTerm={setSearchTerm}
      dateFrom={dateFrom}
      setDateFrom={setDateFrom}
      dateTo={dateTo}
      setDateTo={setDateTo}
      handleSubmit={handleSubmit}
      handleResetFilters={handleResetFilters}
      // Data
      filteredReferrals={displayedReferrals}
      numericYear={numericYear}
      loading={loading}
      error={error}
      pagination={pagination}
      onPageChange={(newPage) => {
        setPage(newPage);
        fetchReferrals(newPage, searchTerm, dateFrom, dateTo, numericYear);
      }}
      // OTP
      showOtpModal={showOtpModal}
      setShowOtpModal={setShowOtpModal}
      otp={otp}
      otpError={otpError}
      timeLeft={timeLeft}
      isVerifying={isVerifying}
      success={success}
      handleOtpChange={setOtp}
      handleVerifyOtp={handleVerifyOtp}
      handleResend={handleResend}
      handleFieldClick={handleFieldClick}
      getMaskedEmail={getMaskedEmail}
      unmaskedFields={unmaskedFields}
      // View List
      showViewListModal={showViewListModal}
      selectedReferrer={selectedReferrer}
      handleViewList={handleViewList}
      handleCloseViewList={handleCloseViewList}
      viewListLoading={viewListLoading}
    />
  );
}