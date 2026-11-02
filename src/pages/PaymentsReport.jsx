import React, { useState } from 'react';

export default function PaymentsReport({ selectedYear }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [paymentType, setPaymentType] = useState('');
  const [submittedSearch, setSubmittedSearch] = useState({ term: '', from: '', to: '', type: '' });

  // Mock Payments Database
  const initialPayments = [
    { sNo: 1, name: 'Alice Cooper', transactionId: 'TXN102938', type: 'Credit Card', amount: '$150.00', status: 'Paid', year: '2025', date: '2026-03-05' },
    { sNo: 2, name: 'Bob Marley', transactionId: 'TXN928374', type: 'ACH', amount: '$120.00', status: 'Pending', year: '2025', date: '2026-04-12' },
    { sNo: 3, name: 'Dhruv Chauhan', transactionId: 'TXN100295', type: 'Zelle', amount: '$150.00', status: 'Paid', year: '2025', date: '2026-06-19' },
    { sNo: 4, name: 'Charlie Chaplin', transactionId: 'TXN738492', type: 'PayPal', amount: '$180.00', status: 'Paid', year: '2024', date: '2025-02-14' },
    { sNo: 5, name: 'Diana Ross', transactionId: 'TXN827491', type: 'Zelle', amount: '$150.00', status: 'Failed', year: '2023', date: '2024-03-10' },
    { sNo: 6, name: 'Amardeep Kumar', transactionId: 'TXN31010A', type: 'Credit Card', amount: '$150.00', status: 'Paid', year: '2023', date: '2024-02-23' },
    { sNo: 7, name: 'Elvis Presley', transactionId: 'TXN123456', type: 'Wire Transfer', amount: '$300.00', status: 'Paid', year: '2022', date: '2023-01-20' },
    { sNo: 8, name: 'Naresh Kumar', transactionId: 'TXN401889', type: 'PayPal', amount: '$150.00', status: 'Paid', year: '2021', date: '2022-03-16' }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmittedSearch({ term: searchTerm, from: dateFrom, to: dateTo, type: paymentType });
  };

  const numericYear = selectedYear ? selectedYear.replace('TY', '') : '2025';

  const filteredPayments = initialPayments.filter(payment => {
    const matchesYear = payment.year === numericYear;
    const matchesName = !submittedSearch.term || payment.name.toLowerCase().includes(submittedSearch.term.toLowerCase()) || payment.transactionId.includes(submittedSearch.term);
    const matchesType = !submittedSearch.type || payment.type === submittedSearch.type || (submittedSearch.type === 'Select Payment' ? true : false);
    
    let matchesDate = true;
    if (submittedSearch.from) {
      matchesDate = matchesDate && payment.date >= submittedSearch.from;
    }
    if (submittedSearch.to) {
      matchesDate = matchesDate && payment.date <= submittedSearch.to;
    }

    return matchesYear && matchesName && matchesType && matchesDate;
  });

  return (
    <div className="content-card">
      <div className="header-section" style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: '12px', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0 }}>Member Payment Report</h2>
      </div>

      {/* Filter Form Block */}
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'flex-end', marginBottom: '24px', backgroundColor: '#f8f9fa', padding: '16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', minWidth: '220px' }}>
          <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text-muted)' }}>Name</label>
          <input 
            type="text" 
            placeholder="Seacrch by Name or File Nu" 
            className="search-input-box" 
            style={{ width: '100%' }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', minWidth: '150px' }}>
          <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text-muted)' }}>Date From</label>
          <input 
            type="date" 
            className="date-picker-box" 
            style={{ width: '100%' }}
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', minWidth: '150px' }}>
          <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text-muted)' }}>Date To</label>
          <input 
            type="date" 
            className="date-picker-box" 
            style={{ width: '100%' }}
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', minWidth: '180px' }}>
          <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text-muted)' }}>Payment Type</label>
          <select 
            className="search-input-box" 
            style={{ width: '100%', height: '38px' }}
            value={paymentType}
            onChange={(e) => setPaymentType(e.target.value)}
          >
            <option value="">Select Payment</option>
            <option value="Credit Card">Credit Card</option>
            <option value="ACH">ACH</option>
            <option value="PayPal">PayPal</option>
            <option value="Zelle">Zelle</option>
            <option value="Wire Transfer">Wire Transfer</option>
          </select>
        </div>

        <button type="submit" className="btn btn-primary" style={{ padding: '8px 24px', height: '38px' }}>
          Submit
        </button>
      </form>

      {/* Report Table */}
      <div className="table-responsive">
        <table className="corporate-table">
          <thead>
            <tr>
              <th style={{ width: '60px' }}>S.No</th>
              <th>Name</th>
              <th>Transaction ID</th>
              <th>Type of Payment</th>
              <th>Amount</th>
              <th>Payment Status</th>
              <th style={{ width: '60px', textAlign: 'center' }}>?</th>
            </tr>
          </thead>
          <tbody>
            {filteredPayments.length > 0 ? (
              filteredPayments.map((payment, index) => (
                <tr key={payment.sNo}>
                  <td>{index + 1}</td>
                  <td style={{ fontWeight: '500' }}>{payment.name}</td>
                  <td>{payment.transactionId}</td>
                  <td>{payment.type}</td>
                  <td>{payment.amount}</td>
                  <td>
                    <span style={{ 
                      color: payment.status === 'Paid' ? 'var(--color-darkgreen-btn)' : 
                             payment.status === 'Pending' ? '#856404' : '#dc3545',
                      fontWeight: 'bold',
                      fontSize: '12px'
                    }}>
                      {payment.status}
                    </span>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <button 
                      type="button" 
                      className="btn-view-action" 
                      style={{ padding: '2px 8px', fontSize: '11px' }}
                      onClick={() => alert(`Details for Transaction ${payment.transactionId}:\nName: ${payment.name}\nAmount: ${payment.amount}\nStatus: ${payment.status}`)}
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                  No payment records found for year {numericYear}.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {filteredPayments.length > 0 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px' }}>
          <div className="pagination-row">
            <button className="page-link-btn active">1</button>
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            Showing 1 to {filteredPayments.length} of {filteredPayments.length} entries
          </div>
        </div>
      )}
    </div>
  );
}
