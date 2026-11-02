import React, { useState, useEffect } from 'react';
import { Calculator, Save, RefreshCw, Info, Check } from 'lucide-react';

export default function Estimator({ onSaveEstimate, currentEstimate }) {
  // Input states
  const [filingStatus, setFilingStatus] = useState(currentEstimate ? currentEstimate.filingStatus : 'Single');
  const [grossIncome, setGrossIncome] = useState(currentEstimate ? currentEstimate.grossIncome : 65000);
  const [preTaxDeductions, setPreTaxDeductions] = useState(currentEstimate ? currentEstimate.preTaxDeductions : 5000);
  const [deductionType, setDeductionType] = useState(currentEstimate ? currentEstimate.deductionType : 'Standard');
  const [itemizedDeductions, setItemizedDeductions] = useState(currentEstimate ? currentEstimate.itemizedDeductions : 0);
  const [taxCredits, setTaxCredits] = useState(currentEstimate ? currentEstimate.taxCredits : 2000); // e.g. Child Tax Credit

  // Calculated states
  const [calculations, setCalculations] = useState({
    standardDeduction: 15000,
    totalDeductions: 20000,
    taxableIncome: 45000,
    taxBeforeCredits: 5168,
    estimatedTax: 3168,
    effectiveRate: 4.9,
    takeHomePay: 56832,
    bracketBreakdown: []
  });

  const [savedSuccess, setSavedSuccess] = useState(false);

  // 2026 Bracket limits and rates
  const brackets = {
    Single: [
      { limit: 11600, rate: 0.10 },
      { limit: 47150, rate: 0.12 },
      { limit: 100525, rate: 0.22 },
      { limit: 191950, rate: 0.24 },
      { limit: 243725, rate: 0.32 },
      { limit: 609350, rate: 0.35 },
      { limit: Infinity, rate: 0.37 }
    ],
    MFJ: [
      { limit: 23200, rate: 0.10 },
      { limit: 94300, rate: 0.12 },
      { limit: 201050, rate: 0.22 },
      { limit: 383900, rate: 0.24 },
      { limit: 487450, rate: 0.32 },
      { limit: 731200, rate: 0.35 },
      { limit: Infinity, rate: 0.37 }
    ]
  };

  useEffect(() => {
    // 1. Calculate Standard Deduction for 2026
    const standardDeduction = filingStatus === 'Single' ? 15000 : 30000;
    
    // 2. Determine applied deduction
    const appliedDeduction = deductionType === 'Standard' ? standardDeduction : Number(itemizedDeductions);
    const totalDeductions = Number(preTaxDeductions) + appliedDeduction;

    // 3. Taxable Income
    const taxableIncome = Math.max(0, Number(grossIncome) - totalDeductions);

    // 4. Bracket Tax Calculations
    const currentBrackets = brackets[filingStatus];
    let remainingIncome = taxableIncome;
    let taxBeforeCredits = 0;
    let previousLimit = 0;
    const bracketBreakdown = [];

    for (let i = 0; i < currentBrackets.length; i++) {
      const { limit, rate } = currentBrackets[i];
      const bracketRange = limit - previousLimit;
      
      if (remainingIncome > 0) {
        const taxableInBracket = Math.min(remainingIncome, bracketRange);
        const taxInBracket = taxableInBracket * rate;
        taxBeforeCredits += taxInBracket;
        remainingIncome -= taxableInBracket;

        bracketBreakdown.push({
          bracketNum: i + 1,
          rate: rate * 100,
          range: limit === Infinity ? `${previousLimit.toLocaleString()}+` : `${previousLimit.toLocaleString()} to ${limit.toLocaleString()}`,
          taxableInBracket,
          taxInBracket
        });
      } else {
        break;
      }
      previousLimit = limit;
    }

    // 5. Apply non-refundable credits
    const estimatedTax = Math.max(0, taxBeforeCredits - Number(taxCredits));
    const effectiveRate = Number(grossIncome) > 0 ? ((estimatedTax / Number(grossIncome)) * 100).toFixed(1) : 0;
    const takeHomePay = Number(grossIncome) - estimatedTax;

    setCalculations({
      standardDeduction,
      totalDeductions,
      taxableIncome,
      taxBeforeCredits: Math.round(taxBeforeCredits),
      estimatedTax: Math.round(estimatedTax),
      effectiveRate,
      takeHomePay: Math.round(takeHomePay),
      bracketBreakdown
    });
  }, [filingStatus, grossIncome, preTaxDeductions, deductionType, itemizedDeductions, taxCredits]);

  const handleSave = () => {
    onSaveEstimate({
      filingStatus,
      grossIncome: Number(grossIncome),
      preTaxDeductions: Number(preTaxDeductions),
      deductionType,
      itemizedDeductions: Number(itemizedDeductions),
      taxCredits: Number(taxCredits),
      estimatedTax: calculations.estimatedTax,
      effectiveRate: calculations.effectiveRate,
      totalDeductions: calculations.totalDeductions
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const resetCalculator = () => {
    setFilingStatus('Single');
    setGrossIncome(65000);
    setPreTaxDeductions(5000);
    setDeductionType('Standard');
    setItemizedDeductions(0);
    setTaxCredits(2000);
  };

  return (
    <div>
      <div className="header-section">
        <div>
          <h1 className="page-title">Tax Liability Estimator</h1>
          <p className="page-subtitle">Configure income parameters and view real-time compliance mathematics.</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-secondary" onClick={resetCalculator}>
            <RefreshCw size={16} /> Reset
          </button>
          <button className="btn btn-primary" onClick={handleSave}>
            {savedSuccess ? <Check size={16} /> : <Save size={16} />}
            {savedSuccess ? 'Saved!' : 'Save Estimate'}
          </button>
        </div>
      </div>

      <div className="grid-2-1">
        {/* Left Side: Interactive Input Parameters */}
        <div className="card">
          <h3 className="card-title" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '16px', marginBottom: '24px' }}>
            <span>Parameters & Adjustments</span>
            <Calculator size={18} style={{ color: 'var(--accent-primary)' }} />
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Filing Status selection */}
            <div className="form-group">
              <label className="form-label">Filing Status</label>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button 
                  className={`btn ${filingStatus === 'Single' ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setFilingStatus('Single')}
                  style={{ flex: 1 }}
                >
                  Single Filer
                </button>
                <button 
                  className={`btn ${filingStatus === 'MFJ' ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setFilingStatus('MFJ')}
                  style={{ flex: 1 }}
                >
                  Married Filing Jointly
                </button>
              </div>
            </div>

            {/* Income Input */}
            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <label className="form-label" style={{ margin: 0 }}>Gross Annual Income ($)</label>
                <span style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--accent-primary)' }}>
                  ${Number(grossIncome).toLocaleString()}
                </span>
              </div>
              <input 
                type="range" 
                min="10000" 
                max="350000" 
                step="500"
                value={grossIncome} 
                onChange={(e) => setGrossIncome(e.target.value)}
                style={{ width: '100%', accentColor: 'var(--accent-primary)', cursor: 'pointer' }}
              />
              <input 
                type="number" 
                className="form-input" 
                value={grossIncome}
                onChange={(e) => setGrossIncome(Math.max(0, e.target.value))}
                style={{ marginTop: '8px' }}
              />
            </div>

            <div className="form-row">
              {/* Pre-tax Deductions (401k/HSA) */}
              <div className="form-group">
                <label className="form-label">Pre-Tax Deductions ($)</label>
                <input 
                  type="number" 
                  className="form-input" 
                  value={preTaxDeductions}
                  onChange={(e) => setPreTaxDeductions(Math.max(0, e.target.value))}
                  placeholder="401k, HSA, IRA contributions"
                />
              </div>

              {/* Tax Credits */}
              <div className="form-group">
                <label className="form-label">Tax Credits ($)</label>
                <input 
                  type="number" 
                  className="form-input" 
                  value={taxCredits}
                  onChange={(e) => setTaxCredits(Math.max(0, e.target.value))}
                  placeholder="Child credit, education, energy"
                />
              </div>
            </div>

            {/* Deductions: Standard vs Itemized */}
            <div className="form-group" style={{ backgroundColor: 'rgba(255, 255, 255, 0.02)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
              <label className="form-label">Deduction Type</label>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                <label style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px', padding: '10px', backgroundColor: deductionType === 'Standard' ? 'rgba(59, 130, 246, 0.08)' : 'transparent', border: '1px solid', borderColor: deductionType === 'Standard' ? 'var(--accent-primary)' : 'var(--border-color)', borderRadius: 'var(--radius-md)', cursor: 'pointer' }}>
                  <input 
                    type="radio" 
                    name="deductionType" 
                    checked={deductionType === 'Standard'}
                    onChange={() => setDeductionType('Standard')}
                    style={{ accentColor: 'var(--accent-primary)' }}
                  />
                  <div style={{ fontSize: '13px' }}>
                    <div style={{ fontWeight: 'bold' }}>Standard</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>${calculations.standardDeduction.toLocaleString()} (2026)</div>
                  </div>
                </label>

                <label style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px', padding: '10px', backgroundColor: deductionType === 'Itemized' ? 'rgba(59, 130, 246, 0.08)' : 'transparent', border: '1px solid', borderColor: deductionType === 'Itemized' ? 'var(--accent-primary)' : 'var(--border-color)', borderRadius: 'var(--radius-md)', cursor: 'pointer' }}>
                  <input 
                    type="radio" 
                    name="deductionType" 
                    checked={deductionType === 'Itemized'}
                    onChange={() => setDeductionType('Itemized')}
                    style={{ accentColor: 'var(--accent-primary)' }}
                  />
                  <div style={{ fontSize: '13px' }}>
                    <div style={{ fontWeight: 'bold' }}>Itemized</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Mortgage, local tax, charity</div>
                  </div>
                </label>
              </div>

              {deductionType === 'Itemized' && (
                <div style={{ animation: 'fadeIn 0.2s ease-in-out' }}>
                  <label className="form-label">Itemized Deduction Value ($)</label>
                  <input 
                    type="number" 
                    className="form-input" 
                    value={itemizedDeductions}
                    onChange={(e) => setItemizedDeductions(Math.max(0, e.target.value))}
                    placeholder="Enter total itemized amount"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Calculation Results & Visual Breakdown */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Quick Metrics */}
          <div className="card glow-emerald" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 className="card-title" style={{ margin: 0, fontSize: '16px', textTransform: 'uppercase', color: 'var(--text-secondary)', letterSpacing: '0.5px' }}>
              Final Breakdown
            </h3>
            
            <div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>ESTIMATED FEDERAL TAX</div>
              <div style={{ fontSize: '40px', fontWeight: 'bold', fontFamily: 'var(--font-heading)', color: 'var(--text-primary)', display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                ${calculations.estimatedTax.toLocaleString()}
              </div>
            </div>

            <div style={{ height: '1px', backgroundColor: 'var(--border-color)' }}></div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Effective Tax Rate:</span>
                <span style={{ fontWeight: 'bold', color: 'var(--accent-success)' }}>{calculations.effectiveRate}%</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Taxable Income:</span>
                <span style={{ fontWeight: 'bold' }}>${calculations.taxableIncome.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Estimated Take-home:</span>
                <span style={{ fontWeight: 'bold', color: 'var(--accent-primary)' }}>${calculations.takeHomePay.toLocaleString()}</span>
              </div>
            </div>

            {/* Mini Progress Visual of Income Split */}
            <div style={{ marginTop: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--text-muted)', marginBottom: '4px' }}>
                <span>Take-home: {((calculations.takeHomePay / grossIncome) * 100).toFixed(0)}%</span>
                <span>Tax: {((calculations.estimatedTax / grossIncome) * 100).toFixed(0)}%</span>
              </div>
              <div style={{ height: '12px', backgroundColor: 'rgba(239, 68, 68, 0.2)', borderRadius: '6px', overflow: 'hidden', display: 'flex' }}>
                <div style={{ 
                  height: '100%', 
                  width: `${(calculations.takeHomePay / grossIncome) * 100}%`, 
                  backgroundColor: 'var(--accent-success)',
                  transition: 'width 0.3s ease'
                }}></div>
                <div style={{ 
                  height: '100%', 
                  width: `${(calculations.estimatedTax / grossIncome) * 100}%`, 
                  backgroundColor: 'var(--accent-error)',
                  transition: 'width 0.3s ease'
                }}></div>
              </div>
            </div>
          </div>

          {/* Mathematical Step-by-Step Breakdown */}
          <div className="card">
            <h3 className="card-title">
              <span>Filing Computation Math</span>
              <Info size={16} style={{ color: 'var(--text-muted)' }} />
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '13px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed var(--border-color)', paddingBottom: '8px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>1. Gross Income:</span>
                <span style={{ fontFamily: 'var(--font-heading)' }}>${Number(grossIncome).toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed var(--border-color)', paddingBottom: '8px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>2. Pre-Tax Deductions:</span>
                <span style={{ color: 'var(--accent-error)' }}>-${Number(preTaxDeductions).toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed var(--border-color)', paddingBottom: '8px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>3. {deductionType} Deduction:</span>
                <span style={{ color: 'var(--accent-error)' }}>-${(deductionType === 'Standard' ? calculations.standardDeduction : Number(itemizedDeductions)).toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                <span>4. Taxable Income:</span>
                <span style={{ color: 'var(--accent-primary)' }}>${calculations.taxableIncome.toLocaleString()}</span>
              </div>

              {/* Bracket Calculations Details */}
              <div style={{ marginTop: '6px' }}>
                <div style={{ fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '8px', fontSize: '12px', textTransform: 'uppercase' }}>
                  Bracket Progression Calculations:
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', backgroundColor: 'rgba(255, 255, 255, 0.01)', padding: '10px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                  {calculations.bracketBreakdown.length === 0 ? (
                    <div style={{ color: 'var(--text-muted)', fontSize: '12px', textAlign: 'center' }}>No taxable income.</div>
                  ) : (
                    calculations.bracketBreakdown.map(b => (
                      <div key={b.bracketNum} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                        <span>
                          Bracket {b.bracketNum} ({b.rate}%): 
                          <span style={{ color: 'var(--text-muted)' }}> ${b.taxableInBracket.toFixed(0)} taxed</span>
                        </span>
                        <span style={{ fontWeight: '500' }}>+${b.taxInBracket.toFixed(0)}</span>
                      </div>
                    ))
                  )}
                  {calculations.bracketBreakdown.length > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '600', borderTop: '1px solid var(--border-color)', paddingTop: '6px', marginTop: '4px', fontSize: '12px' }}>
                      <span>Subtotal Tax:</span>
                      <span>${calculations.taxBeforeCredits.toLocaleString()}</span>
                    </div>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed var(--border-color)', paddingBottom: '8px', marginTop: '4px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>5. Non-refundable Credits:</span>
                <span style={{ color: 'var(--accent-success)' }}>-${Number(taxCredits).toLocaleString()}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '700', fontSize: '15px', paddingTop: '4px' }}>
                <span className="text-gradient">Total Estimated Tax:</span>
                <span style={{ color: 'var(--accent-success)' }}>${calculations.estimatedTax.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
