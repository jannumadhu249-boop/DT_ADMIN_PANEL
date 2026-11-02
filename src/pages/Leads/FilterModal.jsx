import React, { useState } from 'react';
import { X } from 'lucide-react';

export default function FilterModal({ filter, onClose, onApply }) {
  const [from, setFrom] = useState(filter.from || '');
  const [to, setTo]     = useState(filter.to || '');

  return (
    <div
      className="modal-overlay"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="leads-modal-dialog" style={{ width: 360, maxWidth: '90%' }}>
        <div className="leads-modal-header">
          <span className="leads-modal-title">Filter By Date</span>
          <button className="leads-modal-close" onClick={onClose}><X size={16} /></button>
        </div>
        <div className="leads-modal-body">
          <div className="leads-form-row" style={{ alignItems: 'flex-end' }}>
            <div className="leads-form-group">
              <label>From</label>
              <input className="leads-input" type="date" value={from} onChange={e => setFrom(e.target.value)} />
            </div>
            <div className="leads-form-group">
              <label>To</label>
              <input className="leads-input" type="date" value={to} onChange={e => setTo(e.target.value)} />
            </div>
          </div>

          <div className="leads-modal-footer">
            <button className="leads-btn-close-modal" onClick={onClose}>Close</button>
            <button
              className="leads-btn-save"
              onClick={() => onApply({ from, to })}
            >
              Filter
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
