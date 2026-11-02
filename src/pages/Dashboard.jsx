import React, { useState } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  FileText, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Plus, 
  Trash2,
  Calendar,
  Users
} from 'lucide-react';

export default function Dashboard({ clients, documents, taxEstimatorData }) {
  const [tasks, setTasks] = useState([
    { id: 1, text: 'Collect W-2 from primary employer', completed: true },
    { id: 2, text: 'Upload 1099-NEC forms for self-employment income', completed: false },
    { id: 3, text: 'Calculate estimated Q2 state and federal tax', completed: false },
    { id: 4, text: 'Verify mortgage interest statement (Form 1098)', completed: true },
    { id: 5, text: 'Schedule tax filing review session', completed: false }
  ]);

  const [newTaskText, setNewTaskText] = useState('');

  const toggleTask = (id) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const addTask = (e) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;
    setTasks([...tasks, { id: Date.now(), text: newTaskText, completed: false }]);
    setNewTaskText('');
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  // Calculate stats
  const filedClientsCount = clients.filter(c => c.status === 'Filed').length;
  const inProgressClientsCount = clients.filter(c => c.status === 'In Progress' || c.status === 'Ready to File').length;
  const totalEstimatedLiability = taxEstimatorData ? taxEstimatorData.estimatedTax : 8420;
  const effectiveTaxRate = taxEstimatorData ? taxEstimatorData.effectiveRate : 12.8;
  const totalDeductions = taxEstimatorData ? taxEstimatorData.totalDeductions : 15000;

  // Bracket progress calculator helper (based on $65,000 default income if not specified)
  const currentIncome = taxEstimatorData ? taxEstimatorData.grossIncome : 65000;
  const standardBracketLimits = [11600, 47150, 100525, 191950, 243725, 609350];
  
  return (
    <div>
      <div className="header-section">
        <div>
          <h1 className="page-title">Tax Control Center</h1>
          <p className="page-subtitle">Welcome back, Administrator. Here is your tax compliance overview.</p>
        </div>
        <div className="header-actions">
          <div className="badge badge-success" style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981', display: 'inline-block' }}></span>
            System Live & Compliant (2026 Code)
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid-3">
        <div className="card kpi-card glow-blue">
          <div className="kpi-header">
            <span>EST. TAX LIABILITY</span>
            <div className="kpi-icon-wrapper blue">
              <DollarSign size={20} />
            </div>
          </div>
          <div className="kpi-value">${totalEstimatedLiability.toLocaleString()}</div>
          <div className="kpi-trend neutral">
            <TrendingUp size={14} />
            <span>Based on current income of ${currentIncome.toLocaleString()}</span>
          </div>
        </div>

        <div className="card kpi-card glow-emerald">
          <div className="kpi-header">
            <span>EFFECTIVE TAX RATE</span>
            <div className="kpi-icon-wrapper emerald">
              <TrendingDown size={20} />
            </div>
          </div>
          <div className="kpi-value">{effectiveTaxRate}%</div>
          <div className="kpi-trend up">
            <span>Deductions: ${totalDeductions.toLocaleString()} applied</span>
          </div>
        </div>

        <div className="card kpi-card">
          <div className="kpi-header">
            <span>PORTFOLIO STATUS</span>
            <div className="kpi-icon-wrapper purple">
              <Users size={20} />
            </div>
          </div>
          <div className="kpi-value">{filedClientsCount} / {clients.length}</div>
          <div className="kpi-trend neutral">
            <span>{inProgressClientsCount} active clients in preparation pipeline</span>
          </div>
        </div>
      </div>

      {/* Secondary layout splits */}
      <div className="grid-2-1">
        {/* Left Side: Bracket Visualizer & Deadlines */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Tax Bracket Progress Visualizer */}
          <div className="card">
            <h3 className="card-title">
              <span>Federal Tax Brackets Visualizer</span>
              <span className="badge badge-info">Single Filer</span>
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '24px' }}>
              Your gross income of <strong>${currentIncome.toLocaleString()}</strong> visualized across the standard federal income brackets.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Bracket Progress Bars */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
                  <span>10% Bracket ($0 to $11,600)</span>
                  <span style={{ color: 'var(--accent-success)' }}>
                    {currentIncome >= 11600 ? 'Fully Taxed ($1,160)' : `$${(currentIncome * 0.1).toFixed(0)} taxed`}
                  </span>
                </div>
                <div style={{ height: '8px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ 
                    height: '100%', 
                    width: `${Math.min(100, (currentIncome / 11600) * 100)}%`, 
                    background: 'linear-gradient(90deg, var(--accent-primary), var(--accent-success))',
                    borderRadius: '4px',
                    transition: 'width 0.5s ease-out'
                  }}></div>
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
                  <span>12% Bracket ($11,601 to $47,150)</span>
                  <span style={{ color: currentIncome > 11600 ? 'var(--accent-success)' : 'var(--text-muted)' }}>
                    {currentIncome >= 47150 ? 'Fully Taxed ($4,266)' : currentIncome > 11600 ? `$${((currentIncome - 11600) * 0.12).toFixed(0)} taxed` : '$0 taxed'}
                  </span>
                </div>
                <div style={{ height: '8px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ 
                    height: '100%', 
                    width: `${currentIncome <= 11600 ? 0 : Math.min(100, ((currentIncome - 11600) / (47150 - 11600)) * 100)}%`, 
                    background: 'linear-gradient(90deg, var(--accent-primary), var(--accent-success))',
                    borderRadius: '4px',
                    transition: 'width 0.5s ease-out'
                  }}></div>
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
                  <span>22% Bracket ($47,151 to $100,525)</span>
                  <span style={{ color: currentIncome > 47150 ? 'var(--accent-success)' : 'var(--text-muted)' }}>
                    {currentIncome >= 100525 ? 'Fully Taxed ($11,742)' : currentIncome > 47150 ? `$${((currentIncome - 47150) * 0.22).toFixed(0)} taxed` : '$0 taxed'}
                  </span>
                </div>
                <div style={{ height: '8px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ 
                    height: '100%', 
                    width: `${currentIncome <= 47150 ? 0 : Math.min(100, ((currentIncome - 47150) / (100525 - 47150)) * 100)}%`, 
                    background: 'linear-gradient(90deg, var(--accent-primary), var(--accent-success))',
                    borderRadius: '4px',
                    transition: 'width 0.5s ease-out'
                  }}></div>
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
                  <span>24%+ Brackets ($100,526+)</span>
                  <span style={{ color: currentIncome > 100525 ? 'var(--accent-primary)' : 'var(--text-muted)' }}>
                    {currentIncome > 100525 ? `$${((currentIncome - 100525) * 0.24).toFixed(0)} taxed` : '$0 taxed'}
                  </span>
                </div>
                <div style={{ height: '8px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ 
                    height: '100%', 
                    width: `${currentIncome <= 100525 ? 0 : Math.min(100, ((currentIncome - 100525) / 100000) * 100)}%`, 
                    background: 'linear-gradient(90deg, var(--accent-primary), var(--accent-purple))',
                    borderRadius: '4px',
                    transition: 'width 0.5s ease-out'
                  }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Upcoming Filing Deadlines */}
          <div className="card">
            <h3 className="card-title">
              <span>Filing Calendar & Deadlines</span>
              <Calendar size={18} style={{ color: 'var(--accent-primary)' }} />
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center', paddingBottom: '16px', borderBottom: '1px solid var(--border-color)' }}>
                <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--accent-error)', width: '50px', height: '50px', borderRadius: '10px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', flexShrink: 0 }}>
                  <span style={{ fontSize: '10px', textTransform: 'uppercase', lineHeight: 1 }}>Jun</span>
                  <span style={{ fontSize: '18px', lineHeight: 1 }}>15</span>
                </div>
                <div style={{ flexGrow: 1 }}>
                  <h4 style={{ fontSize: '14px', fontWeight: '600' }}>Q2 Estimated Tax Payment</h4>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Deadline for filing Q2 2026 estimated federal income tax payments.</p>
                </div>
                <span className="badge badge-danger">TODAY</span>
              </div>

              <div style={{ display: 'flex', gap: '16px', alignItems: 'center', paddingBottom: '16px', borderBottom: '1px solid var(--border-color)' }}>
                <div style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)', color: 'var(--accent-warning)', width: '50px', height: '50px', borderRadius: '10px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', flexShrink: 0 }}>
                  <span style={{ fontSize: '10px', textTransform: 'uppercase', lineHeight: 1 }}>Sep</span>
                  <span style={{ fontSize: '18px', lineHeight: 1 }}>15</span>
                </div>
                <div style={{ flexGrow: 1 }}>
                  <h4 style={{ fontSize: '14px', fontWeight: '600' }}>Q3 Estimated Tax Payment</h4>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Deadline for Q3 2026 estimated payments for self-employed and corporations.</p>
                </div>
                <span className="badge badge-warning">92 Days</span>
              </div>

              <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                <div style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', color: 'var(--accent-primary)', width: '50px', height: '50px', borderRadius: '10px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', flexShrink: 0 }}>
                  <span style={{ fontSize: '10px', textTransform: 'uppercase', lineHeight: 1 }}>Oct</span>
                  <span style={{ fontSize: '18px', lineHeight: 1 }}>15</span>
                </div>
                <div style={{ flexGrow: 1 }}>
                  <h4 style={{ fontSize: '14px', fontWeight: '600' }}>Extended Return Filing Deadline</h4>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Final extension deadline to file individual income tax returns for 2025 tax year.</p>
                </div>
                <span className="badge badge-info">122 Days</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Compliance Checklist */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <h3 className="card-title">
            <span>Compliance Checklist</span>
            <CheckCircle size={18} style={{ color: 'var(--accent-success)' }} />
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '20px' }}>
            Keep track of required forms and internal workflows for individual tax filing processes.
          </p>

          <form onSubmit={addTask} style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
            <input 
              type="text" 
              className="form-input" 
              placeholder="Add compliance item..." 
              value={newTaskText}
              onChange={(e) => setNewTaskText(e.target.value)}
              style={{ padding: '10px 14px' }}
            />
            <button type="submit" className="btn btn-primary btn-icon-only">
              <Plus size={18} />
            </button>
          </form>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flexGrow: 1 }}>
            {tasks.map(task => (
              <div 
                key={task.id} 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                  backgroundColor: task.completed ? 'rgba(255, 255, 255, 0.01)' : 'var(--bg-tertiary)',
                  border: '1px solid',
                  borderColor: task.completed ? 'transparent' : 'var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  transition: 'all var(--transition-fast)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', flexGrow: 1 }} onClick={() => toggleTask(task.id)}>
                  <div style={{ 
                    width: '20px', 
                    height: '20px', 
                    borderRadius: '6px', 
                    border: '2px solid',
                    borderColor: task.completed ? 'var(--accent-success)' : 'var(--text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: task.completed ? 'rgba(16, 185, 129, 0.1)' : 'transparent',
                    color: 'var(--accent-success)',
                    transition: 'all 0.15s ease'
                  }}>
                    {task.completed && <span style={{ fontSize: '12px', fontWeight: 'bold' }}>✓</span>}
                  </div>
                  <span style={{ 
                    fontSize: '13px', 
                    color: task.completed ? 'var(--text-muted)' : 'var(--text-primary)',
                    textDecoration: task.completed ? 'line-through' : 'none',
                    fontWeight: 500,
                    userSelect: 'none'
                  }}>
                    {task.text}
                  </span>
                </div>
                <button 
                  onClick={() => deleteTask(task.id)}
                  style={{ 
                    background: 'none', 
                    border: 'none', 
                    color: 'var(--text-muted)', 
                    cursor: 'pointer',
                    padding: '4px'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent-error)'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>

          <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-secondary)' }}>
            <span>Completed Items:</span>
            <span style={{ fontWeight: 'bold', color: 'var(--accent-success)' }}>
              {tasks.filter(t => t.completed).length} / {tasks.length} ({tasks.length ? Math.round((tasks.filter(t => t.completed).length / tasks.length) * 100) : 0}%)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
