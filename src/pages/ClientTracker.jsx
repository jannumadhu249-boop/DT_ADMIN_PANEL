import React, { useState } from 'react';
import { Plus, ChevronLeft, ChevronRight, User, Mail, DollarSign, Filter, Trash2 } from 'lucide-react';

export default function ClientTracker({ clients, onUpdateClients }) {
  const [filterText, setFilterText] = useState('');
  const [filterForm, setFilterForm] = useState('All');
  
  // New Client Form States
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newFormType, setNewFormType] = useState('Form 1040 (W-2)');
  const [newEstTax, setNewEstTax] = useState('');
  const [newStatus, setNewStatus] = useState('Not Started');

  const statuses = ['Not Started', 'Documents Pending', 'Ready to File', 'Filed'];

  const moveStatus = (clientName, direction) => {
    const updated = clients.map(client => {
      if (client.name === clientName) {
        const currentIndex = statuses.indexOf(client.status);
        let nextIndex = currentIndex + direction;
        if (nextIndex >= 0 && nextIndex < statuses.length) {
          return { ...client, status: statuses[nextIndex] };
        }
      }
      return client;
    });
    onUpdateClients(updated);
  };

  const handleAddClient = (e) => {
    e.preventDefault();
    if (!newName.trim() || !newEmail.trim()) return;

    const newClient = {
      name: newName,
      email: newEmail,
      formType: newFormType,
      estTax: newEstTax ? Number(newEstTax) : 0,
      status: newStatus,
      updatedAt: new Date().toISOString().split('T')[0]
    };

    onUpdateClients([...clients, newClient]);
    
    // Reset form
    setNewName('');
    setNewEmail('');
    setNewFormType('Form 1040 (W-2)');
    setNewEstTax('');
    setNewStatus('Not Started');
    setShowAddForm(false);
  };

  const handleDeleteClient = (clientName) => {
    if (confirm(`Are you sure you want to remove ${clientName}?`)) {
      onUpdateClients(clients.filter(c => c.name !== clientName));
    }
  };

  // Filter clients
  const filteredClients = clients.filter(c => {
    const matchesText = c.name.toLowerCase().includes(filterText.toLowerCase()) || 
                        c.email.toLowerCase().includes(filterText.toLowerCase());
    const matchesForm = filterForm === 'All' || c.formType.includes(filterForm);
    return matchesText && matchesForm;
  });

  return (
    <div>
      <div className="header-section">
        <div>
          <h1 className="page-title">Client Portfolio Tracker</h1>
          <p className="page-subtitle">Manage filings, track workflow status, and process compliance pipelines.</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-primary" onClick={() => setShowAddForm(!showAddForm)}>
            <Plus size={16} /> {showAddForm ? 'Close Form' : 'Add New Profile'}
          </button>
        </div>
      </div>

      {/* Add Client Form (Collapsible Card) */}
      {showAddForm && (
        <div className="card" style={{ marginBottom: '24px', border: '1px solid var(--accent-primary)', animation: 'slideDown 0.25s ease-out' }}>
          <h3 className="card-title" style={{ marginBottom: '16px' }}>Register New Tax Profile</h3>
          <form onSubmit={handleAddClient}>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Client Name</label>
                <input 
                  type="text" 
                  className="form-input" 
                  required
                  placeholder="e.g. Alice Cooper"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input 
                  type="email" 
                  className="form-input" 
                  required
                  placeholder="e.g. alice@example.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Tax Form Type</label>
                <select 
                  className="form-select"
                  value={newFormType}
                  onChange={(e) => setNewFormType(e.target.value)}
                >
                  <option value="Form 1040 (W-2)">Form 1040 (W-2 - Personal)</option>
                  <option value="Form 1040 (1099-NEC)">Form 1040 (1099 - Independent Contractor)</option>
                  <option value="Schedule C (Sole Prop)">Schedule C (Sole Proprietorship)</option>
                  <option value="Form 1120-S (S-Corp)">Form 1120-S (S-Corporation)</option>
                  <option value="Form 1065 (Partnership)">Form 1065 (Partnership)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Est. Tax Liability / Refund ($)</label>
                <input 
                  type="number" 
                  className="form-input" 
                  placeholder="e.g. 4500 (use negative for refunds)"
                  value={newEstTax}
                  onChange={(e) => setNewEstTax(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Starting Filing Pipeline Status</label>
              <select 
                className="form-select"
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
              >
                {statuses.map(st => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '12px' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setShowAddForm(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary">Save Client Profile</button>
            </div>
          </form>
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="card" style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center', marginBottom: '24px', padding: '16px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '14px', fontWeight: 'bold' }}>
          <Filter size={16} /> Filters:
        </div>
        <input 
          type="text" 
          className="form-input" 
          placeholder="Search name or email..."
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
          style={{ flex: 1, minWidth: '200px', padding: '10px 14px' }}
        />
        <select 
          className="form-select"
          value={filterForm}
          onChange={(e) => setFilterForm(e.target.value)}
          style={{ width: 'auto', minWidth: '180px', padding: '10px 14px' }}
        >
          <option value="All">All Form Types</option>
          <option value="W-2">W-2 Filings</option>
          <option value="1099">1099 Contractor</option>
          <option value="Schedule C">Schedule C</option>
          <option value="1120-S">S-Corp</option>
          <option value="1065">Partnerships</option>
        </select>
        <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
          Showing <strong>{filteredClients.length}</strong> of <strong>{clients.length}</strong> clients
        </div>
      </div>

      {/* Kanban Board Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
        gap: '20px',
        alignItems: 'start'
      }}>
        {statuses.map(status => {
          const statusClients = filteredClients.filter(c => c.status === status);
          
          let badgeClass = 'badge-secondary';
          if (status === 'Not Started') badgeClass = 'badge-danger';
          if (status === 'Documents Pending') badgeClass = 'badge-warning';
          if (status === 'Ready to File') badgeClass = 'badge-info';
          if (status === 'Filed') badgeClass = 'badge-success';

          return (
            <div key={status} style={{ 
              backgroundColor: 'rgba(255,255,255,0.01)', 
              borderRadius: 'var(--radius-lg)', 
              border: '1px solid var(--border-color)',
              padding: '16px',
              minHeight: '400px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                borderBottom: '1px solid var(--border-color)',
                paddingBottom: '12px',
                marginBottom: '4px'
              }}>
                <span style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)' }}>{status}</span>
                <span className={`badge ${badgeClass}`}>{statusClients.length}</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', overflowY: 'auto' }}>
                {statusClients.length === 0 ? (
                  <div style={{ 
                    border: '1px dashed var(--border-color)', 
                    borderRadius: 'var(--radius-md)', 
                    padding: '24px 12px', 
                    textAlign: 'center', 
                    color: 'var(--text-muted)',
                    fontSize: '12px'
                  }}>
                    No clients in this stage
                  </div>
                ) : (
                  statusClients.map(client => (
                    <div key={client.name} className="card" style={{ 
                      padding: '16px', 
                      backgroundColor: 'var(--bg-tertiary)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <h4 style={{ fontSize: '14px', fontWeight: 'bold' }}>{client.name}</h4>
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{client.formType}</span>
                        </div>
                        <button 
                          onClick={() => handleDeleteClient(client.name)}
                          style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '2px' }}
                          onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent-error)'}
                          onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Mail size={12} /> {client.email}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '600', color: client.estTax >= 0 ? 'var(--text-primary)' : 'var(--accent-success)' }}>
                          <DollarSign size={12} /> 
                          {client.estTax >= 0 ? `Est. Tax: $${client.estTax.toLocaleString()}` : `Est. Refund: $${Math.abs(client.estTax).toLocaleString()}`}
                        </div>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px', paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                        <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Updated: {client.updatedAt}</span>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <button 
                            className="btn btn-secondary btn-icon-only" 
                            disabled={status === 'Not Started'}
                            onClick={() => moveStatus(client.name, -1)}
                            style={{ padding: '4px 6px', border: 'none', borderRadius: '4px' }}
                          >
                            <ChevronLeft size={14} />
                          </button>
                          <button 
                            className="btn btn-secondary btn-icon-only" 
                            disabled={status === 'Filed'}
                            onClick={() => moveStatus(client.name, 1)}
                            style={{ padding: '4px 6px', border: 'none', borderRadius: '4px' }}
                          >
                            <ChevronRight size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
