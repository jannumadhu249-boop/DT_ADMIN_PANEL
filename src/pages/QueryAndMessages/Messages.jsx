import React, { useState, useEffect, useCallback } from 'react';
import { URLS } from '../../url';
import { formatDate } from '../../utils/dateUtils';

// Helper to get auth token – adjust based on your app's storage
const getAuthToken = () => {
  const keys = ['authToken', 'token', 'adminToken', 'accessToken', 'jwt'];
  for (const key of keys) {
    const value = sessionStorage.getItem(key) || localStorage.getItem(key);
    if (value) return value;
  }
  return 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhZG1pbl9pZCI6IjZhNThiZDFjNzE1ZjE4ZTYxZDQxY2Y5MiIsImVtYWlsIjoiZGl2eWFwZW5keWFsYTA3MTdAZ21haWwuY29tIiwiYWRtaW5fc3RhZ2UiOiJzdXBlciIsImlhdCI6MTc4NDIwNDE1OCwiZXhwIjoxODE1NzQwMTU4fQ.1pjPlGU41H1G5ei3AfTEcaWk9O1eyRTG769xnpj5xts';
};

export default function Messages() {
  const [searchEmail, setSearchEmail] = useState('');
  const [filterQuery, setFilterQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(10);

  // State for API data
  const [queries, setQueries] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Local replies (keyed by query _id)
  const [replies, setReplies] = useState({});

  // Fetch queries from API
  const fetchQueries = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(URLS.GetQueryMessages, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          page: currentPage,
          limit,
          search: filterQuery,
        }),
      });

      const result = await response.json();
      if (result.success) {
        setQueries(result.data);
        setTotalRecords(result.totalRecords);
      } else {
        setError('Failed to load queries.');
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError('An error occurred while fetching queries.');
    } finally {
      setLoading(false);
    }
  }, [currentPage, limit, filterQuery]);

  // Refresh on page, search, or limit change
  useEffect(() => {
    fetchQueries();
  }, [fetchQueries]);

  // Handle search submit
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setFilterQuery(searchEmail.trim());
    setCurrentPage(1);
  };

  // Handle reply change
  const handleReplyChange = (queryId, value) => {
    setReplies(prev => ({
      ...prev,
      [queryId]: value,
    }));
  };

  // Send reply API call
  const handleSendReply = async (queryId, firstName) => {
    const text = replies[queryId];
    if (!text || !text.trim()) {
      alert('Please enter a reply message before sending.');
      return;
    }

    try {
      const response = await fetch(`${URLS.ReplyQuery}${queryId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reply: text.trim() }),
      });

      const result = await response.json();
      if (result.success) {
        alert(`Reply sent successfully to ${firstName}!`);
        setReplies(prev => ({
          ...prev,
          [queryId]: '',
        }));
        fetchQueries();
      } else {
        alert('Failed to send reply. Please try again.');
      }
    } catch (err) {
      console.error('Reply error:', err);
      alert('An error occurred while sending the reply.');
    }
  };

  // Calculate total pages for pagination
  const totalPages = Math.ceil(totalRecords / limit);

  // Render page numbers
  const renderPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);
    if (end - start < maxVisible - 1) start = Math.max(1, end - maxVisible + 1);

    for (let i = start; i <= end; i++) {
      pages.push(
        <button
          key={i}
          className={`page-link-btn ${currentPage === i ? 'active' : ''}`}
          onClick={() => setCurrentPage(i)}
        >
          {i}
        </button>
      );
    }
    return pages;
  };

  return (
    <div className="content-card" style={{ animation: 'fadeIn 0.2s ease-out' }}>
      <div className="header-section" style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: '12px', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0, color: 'var(--text-dark)' }}>Message Requests</h2>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#333' }}>Email / Name</label>
          <input
            type="text"
            className="search-input-box"
            placeholder="Search by Email or Name"
            value={searchEmail}
            onChange={(e) => setSearchEmail(e.target.value)}
            style={{ width: '220px' }}
          />
        </div>
        <button
          type="submit"
          className="btn"
          style={{
            backgroundColor: '#1b62a5',
            color: '#fff',
            border: 'none',
            padding: '8px 16px',
            fontSize: '13px',
            fontWeight: '600',
            borderRadius: 'var(--radius-sm)',
            cursor: 'pointer',
          }}
        >
          Submit
        </button>
        {filterQuery && (
          <button
            type="button"
            className="btn"
            onClick={() => {
              setSearchEmail('');
              setFilterQuery('');
              setCurrentPage(1);
            }}
            style={{
              backgroundColor: '#6c757d',
              color: '#fff',
              border: 'none',
              padding: '8px 16px',
              fontSize: '13px',
              fontWeight: '600',
              borderRadius: 'var(--radius-sm)',
              cursor: 'pointer',
            }}
          >
            Clear
          </button>
        )}
      </form>

      {/* Table */}
      <div className="table-responsive">
        <table className="corporate-table">
          <thead>
            <tr>
              <th style={{ width: '60px' }}>S.No</th>
              <th style={{ width: '150px' }}>Name</th>
              <th style={{ width: '120px' }}>Mobile</th>
              <th style={{ width: '150px' }}>Messages</th>
              <th style={{ width: '150px' }}>Date Created</th>
              <th style={{ width: '280px' }}>Reply</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '24px' }}>
                  Loading...
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '24px', color: 'red' }}>
                  {error}
                </td>
              </tr>
            ) : queries.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                  No queries found.
                </td>
              </tr>
            ) : (
              queries.map((query, idx) => {
                const displayName = `${query.first_name || ''} ${query.last_name || ''}`.trim() || 'N/A';
                const displayMobile = query.mobile || query.member?.contact_number || 'N/A';
                const displayEmail = query.member?.email || '';
                // Use message as comments
                const comments = query.message || 'No comment';
                const createdAt = formatDate(query.createdAt);

                return (
                  <tr key={query._id}>
                    <td>{idx + 1 + (currentPage - 1) * limit}</td>
                    <td style={{ fontWeight: '500' }}>{displayName}</td>
                    <td>{displayMobile}</td>
                    <td style={{ width: '150px', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{comments}</td>
                    <td style={{ color: 'var(--text-muted)' }}>{createdAt}</td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <textarea
                          rows="2"
                          className="search-input-box"
                          placeholder="Please Enter Reply"
                          value={replies[query._id] || ''}
                          onChange={(e) => handleReplyChange(query._id, e.target.value)}
                          style={{ width: '100%', height: '54px', fontSize: '12px', fontFamily: 'inherit', resize: 'vertical', padding: '6px' }}
                        />
                        <button
                          type="button"
                          onClick={() => handleSendReply(query._id, displayName)}
                          style={{
                            backgroundColor: '#3ea94f',
                            color: '#fff',
                            border: 'none',
                            padding: '6px 12px',
                            fontSize: '12px',
                            fontWeight: '600',
                            borderRadius: 'var(--radius-sm)',
                            cursor: 'pointer',
                            alignSelf: 'flex-start',
                          }}
                        >
                          Send Reply
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
        <div className="pagination-row">
          <button
            className="page-link-btn"
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
          >
            First
          </button>
          <button
            className="page-link-btn"
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            &lt;
          </button>

          {renderPageNumbers()}

          <button
            className="page-link-btn"
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages || totalPages === 0}
          >
            &gt;
          </button>
          <button
            className="page-link-btn"
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages || totalPages === 0}
          >
            Last
          </button>
        </div>
        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
          Showing {(currentPage - 1) * limit + 1} to {Math.min(currentPage * limit, totalRecords)} of {totalRecords} entries
        </div>
      </div>
    </div>
  );
}