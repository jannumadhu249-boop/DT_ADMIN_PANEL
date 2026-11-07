import React from 'react';

/**
 * Reusable Pagination component adhering to the Dollar Tax Admin theme.
 * Exactly matches the styling and smart ellipsis behavior of MemberTableLayout.
 *
 * @param {number} currentPage - Currently active page (1-based)
 * @param {number} totalPages - Total number of pages
 * @param {number} totalRecords - Total records count across all pages
 * @param {number} limit - Items per page
 * @param {number} count - Number of items in current page list (optional fallback)
 * @param {function} onPageChange - Callback fired with next page number
 * @param {object} style - Optional container inline styles
 */
export default function Pagination({
  currentPage = 1,
  totalPages = 1,
  totalRecords = 0,
  limit = 20,
  count = 0,
  onPageChange,
  style = {}
}) {
  const current = Math.max(1, Number(currentPage) || 1);
  const total = Math.max(
    1,
    Number(totalPages) || (totalRecords > 0 ? Math.ceil(totalRecords / (limit || 20)) : 1)
  );

  // If no records and single page with no items, don't show pagination
  if (totalRecords === 0 && total <= 1 && count === 0) {
    return null;
  }

  const pages = [];
  pages.push(1);

  if (total <= 7) {
    for (let i = 2; i <= total; i++) {
      pages.push(i);
    }
  } else {
    if (current <= 3) {
      for (let i = 2; i <= 4; i++) pages.push(i);
      pages.push('...');
      pages.push(total);
    } else if (current >= total - 2) {
      pages.push('...');
      for (let i = total - 3; i <= total; i++) pages.push(i);
    } else {
      pages.push('...');
      pages.push(current - 1);
      pages.push(current);
      pages.push(current + 1);
      pages.push('...');
      pages.push(total);
    }
  }

  const effectiveTotal = totalRecords || (count > 0 ? (current - 1) * limit + count : 0);
  const from = (count > 0 || totalRecords > 0) ? (current - 1) * limit + 1 : 0;
  const to = Math.min(current * limit, effectiveTotal);

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: '16px',
        flexWrap: 'wrap',
        gap: '10px',
        ...style
      }}
    >
      <div className="pagination-row">
        {/* Previous Button */}
        {current > 1 && (
          <button
            type="button"
            className="page-link-btn"
            onClick={() => onPageChange && onPageChange(current - 1)}
          >
            &lt;
          </button>
        )}

        {/* Smart Page Numbers */}
        {pages.map((p, idx) =>
          p === '...' ? (
            <span
              key={`ellipsis-${idx}`}
              style={{ padding: '0 8px', color: 'var(--text-muted)' }}
            >
              ...
            </span>
          ) : (
            <button
              key={p}
              type="button"
              className={`page-link-btn ${current === p ? 'active' : ''}`}
              onClick={() => onPageChange && onPageChange(p)}
            >
              {p}
            </button>
          )
        )}

        {/* Next Button */}
        {current < total && (
          <button
            type="button"
            className="page-link-btn"
            onClick={() => onPageChange && onPageChange(Math.min(total, current + 1))}
          >
            &gt;
          </button>
        )}
      </div>

      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
        Showing {from} to {to} of {effectiveTotal} entries
      </div>
    </div>
  );
}

