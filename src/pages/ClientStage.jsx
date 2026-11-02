import React, { useState, useEffect } from 'react';
import { URLS } from '../url';

const getAuthToken = () => {
  const keys = ['authToken', 'token', 'adminToken', 'accessToken', 'jwt'];
  for (const key of keys) {
    const value = sessionStorage.getItem(key) || localStorage.getItem(key);
    if (value) return value;
  }
  return;
};

export default function ClientStage() {
  // Filter states
  const [searchName, setSearchName] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedYearId, setSelectedYearId] = useState('');

  // API data states
  const [members, setMembers] = useState([]);
  const [years, setYears] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Pagination state
  const [pagination, setPagination] = useState({
    currentPage: 1,
    limit: 20,
    totalRecords: 0,
    totalPages: 1,
  });

  // Fetch years on mount
  useEffect(() => {
    const fetchYears = async () => {
      try {
        const token = getAuthToken();
        const res = await fetch(URLS.GetYears, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        const result = await res.json();
        if (result.success && Array.isArray(result.data)) {
          setYears(result.data);
        } else {
          console.warn('Failed to fetch years:', result.message);
        }
      } catch (err) {
        console.error('Error fetching years:', err);
      }
    };
    fetchYears();
  }, []);

  // Fetch member stages on filter change or page change
  const fetchMemberStages = async (page = 1) => {
    setLoading(true);
    setError('');
    try {
      const token = getAuthToken();
      const payload = {
        page,
        limit: pagination.limit,
        search: searchName.trim(),
        year_id: selectedYearId,
        date_from: dateFrom,
        date_to: dateTo,
      };

      const res = await fetch(URLS.GetClientStage, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (result.success) {
        setMembers(result.data || []);
        if (result.pagination) {
          setPagination(result.pagination);
        }
      } else {
        setError(result.message || 'Failed to fetch member stages.');
        setMembers([]);
      }
    } catch (err) {
      console.error('Fetch member stages error:', err);
      setError('Network error. Please try again.');
      setMembers([]);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch on mount
  useEffect(() => {
    fetchMemberStages(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle filter submission
  const handleSubmit = (e) => {
    e.preventDefault();
    fetchMemberStages(1);
  };

  // Handle reset
  const handleReset = () => {
    setSearchName('');
    setDateFrom('');
    setDateTo('');
    setSelectedYearId('');
    fetchMemberStages(1);
  };

  // Handle page change
  const goToPage = (page) => {
    if (page < 1 || page > pagination.totalPages) return;
    fetchMemberStages(page);
  };

  // Helper to get year label from ID
  const getYearLabel = (id) => {
    const year = years.find(y => y._id === id);
    return year ? year.name : 'All';
  };

  return (
    <div style={{ padding: '20px', background: '#fff', minHeight: '100vh' }}>
      <h2 style={{ fontSize: '20px', color: '#334155', fontWeight: '500', marginBottom: '20px' }}>
        Registered Member Stages
      </h2>

      {/* Search / Filter Bar */}
      <form onSubmit={handleSubmit} style={{ display: 'flex', alignItems: 'flex-end', gap: '16px', flexWrap: 'wrap', marginBottom: '24px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '12px', fontWeight: '600', color: '#334155' }}>Name</label>
          <input
            type="text"
            placeholder="Search by Name"
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            style={{
              padding: '6px 10px',
              border: '1px solid #cbd5e1',
              borderRadius: '4px',
              fontSize: '13px',
              width: '180px',
              outline: 'none',
            }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '12px', fontWeight: '600', color: '#334155' }}>Date From</label>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            style={{
              padding: '6px 10px',
              border: '1px solid #cbd5e1',
              borderRadius: '4px',
              fontSize: '13px',
              width: '160px',
              outline: 'none',
            }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '12px', fontWeight: '600', color: '#334155' }}>Date To</label>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            style={{
              padding: '6px 10px',
              border: '1px solid #cbd5e1',
              borderRadius: '4px',
              fontSize: '13px',
              width: '160px',
              outline: 'none',
            }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '12px', fontWeight: '600', color: '#334155' }}>Year</label>
          <select
            value={selectedYearId}
            onChange={(e) => setSelectedYearId(e.target.value)}
            style={{
              padding: '6px 10px',
              border: '1px solid #cbd5e1',
              borderRadius: '4px',
              fontSize: '13px',
              width: '120px',
              outline: 'none',
              background: '#fff',
            }}
          >
            <option value="">All</option>
            {years.map((year) => (
              <option key={year._id} value={year._id}>
                {year.name}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          style={{
            padding: '7px 20px',
            background: '#3182ce',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            fontSize: '13px',
            fontWeight: '600',
            cursor: 'pointer',
          }}
        >
          Submit
        </button>

        <button
          type="button"
          onClick={handleReset}
          style={{
            padding: '7px 20px',
            background: '#e2e8f0',
            color: '#475569',
            border: '1px solid #cbd5e1',
            borderRadius: '4px',
            fontSize: '13px',
            fontWeight: '600',
            cursor: 'pointer',
          }}
        >
          Reset
        </button>
      </form>

      {/* Error & Loading */}
      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', borderRadius: '6px', padding: '10px 14px', marginBottom: '16px' }}>
          ⚠️ {error}
        </div>
      )}

      {loading && (
        <div style={{ padding: '15px', textAlign: 'center', color: '#3182ce', fontSize: '13px', fontWeight: '600' }}>
          Loading member stages...
        </div>
      )}

      {/* Table */}
      <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '4px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: '#f1f5f9', borderBottom: '1px solid #cbd5e1', color: '#1e293b' }}>
              <th style={{ padding: '10px 12px', fontWeight: '700', borderRight: '1px solid #e2e8f0' }}>S.No</th>
              <th style={{ padding: '10px 12px', fontWeight: '700', borderRight: '1px solid #e2e8f0' }}>Name</th>
              <th style={{ padding: '10px 12px', fontWeight: '700', borderRight: '1px solid #e2e8f0' }}>File No</th>
              <th style={{ padding: '10px 12px', fontWeight: '700', borderRight: '1px solid #e2e8f0' }}>Login Year</th>
              <th style={{ padding: '10px 12px', fontWeight: '700', borderRight: '1px solid #e2e8f0' }}>Stage I</th>
              <th style={{ padding: '10px 12px', fontWeight: '700', borderRight: '1px solid #e2e8f0' }}>Stage II</th>
              {/* <th style={{ padding: '10px 12px', fontWeight: '700' }}>Admin</th> */}
            </tr>
          </thead>
          <tbody>
            {members.length === 0 && !loading ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
                  No member stages found.
                </td>
              </tr>
            ) : (
              members.map((m, idx) => (
                <tr
                  key={m._id || idx}
                  style={{
                    borderBottom: '1px solid #e2e8f0',
                    background: idx % 2 === 1 ? '#f8fafc' : '#fff',
                  }}
                >
                  <td style={{ padding: '10px 12px', color: '#64748b', borderRight: '1px solid #f1f5f9' }}>
                    {(pagination.currentPage - 1) * pagination.limit + idx + 1}
                  </td>
                  <td style={{ padding: '10px 12px', color: '#334155', borderRight: '1px solid #f1f5f9' }}>
                    {m.name || '—'}
                  </td>
                  <td style={{ padding: '10px 12px', color: '#334155', borderRight: '1px solid #f1f5f9' }}>
                    {m.file_no || '—'}
                  </td>
                  <td style={{ padding: '10px 12px', color: '#334155', borderRight: '1px solid #f1f5f9' }}>
                    {m.login_year || '—'}
                  </td>
                  <td style={{ padding: '10px 12px', color: '#334155', borderRight: '1px solid #f1f5f9' }}>
                    {m.stage1 || '—'}
                  </td>
                  <td style={{ padding: '10px 12px', color: '#334155', borderRight: '1px solid #f1f5f9' }}>
                    {m.stage2 || '—'}
                  </td>
                  {/* <td style={{ padding: '10px 12px', color: '#334155' }}>
                    {m.admin_name || '—'}
                  </td> */}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '16px', fontSize: '12px', flexWrap: 'wrap' }}>
          <button
            onClick={() => goToPage(1)}
            disabled={pagination.currentPage === 1}
            style={{
              padding: '4px 10px',
              border: '1px solid #cbd5e1',
              background: '#fff',
              cursor: pagination.currentPage === 1 ? 'not-allowed' : 'pointer',
              borderRadius: '2px',
              opacity: pagination.currentPage === 1 ? 0.5 : 1,
            }}
          >
            First
          </button>

          {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => goToPage(p)}
              style={{
                padding: '4px 10px',
                border: '1px solid #cbd5e1',
                background: pagination.currentPage === p ? '#e2e8f0' : '#fff',
                fontWeight: pagination.currentPage === p ? '700' : 'normal',
                cursor: 'pointer',
                borderRadius: '2px',
              }}
            >
              {p}
            </button>
          ))}

          <button
            onClick={() => goToPage(pagination.totalPages)}
            disabled={pagination.currentPage === pagination.totalPages}
            style={{
              padding: '4px 10px',
              border: '1px solid #cbd5e1',
              background: '#fff',
              cursor: pagination.currentPage === pagination.totalPages ? 'not-allowed' : 'pointer',
              borderRadius: '2px',
              opacity: pagination.currentPage === pagination.totalPages ? 0.5 : 1,
            }}
          >
            Last
          </button>

          <span style={{ marginLeft: '12px', color: '#64748b' }}>
            {pagination.totalRecords} entries
          </span>
        </div>
      )}
    </div>
  );
}