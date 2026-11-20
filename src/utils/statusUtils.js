/* ─────────────────────────────────────────────────────────────
   File status mapping — single source of truth.

   The backend stores status codes (RGO, BIP, PP_EF, …) in
   member.filestatus and in status history rows, and returns a
   filestatus_name that is NOT always worded the same way as the
   admin UI (e.g. "Registered Only", "Client Review - E-Filing").
   The dropdown options, the history table and the submit payload
   all resolve through this file so the name shown is always the
   same one that is pushed.
───────────────────────────────────────────────────────────── */

/* Backend filestatus code → display name used across the admin UI */
export const CODE_TO_DISPLAY = {
  'RGO': 'Registered Users',
  'BIP': 'Information Pending',
  'SP': 'Scheduling Pending',
  'IP': 'Interview Pending',
  'DP': 'Documents Pending',
  'PP_I': 'Preparation - 1',
  'PP_II': 'Preparation - 2',
  'TR_S_I': 'Review & Summary 1',
  'TR_S_II': 'Review & Summary 2',
  'ITIN': 'ITIN Files',
  'RE_ES': 'Revised Estimate',
  'PP_EF': 'Payment Pending - Efiling',
  'PP_PF': 'Payment Pending - Paper filing',
  'FPR': 'Fee Payment Received - I',
  'FPR_II': 'Fee Payment Received - II',
  'CR_EF': 'Client Review - Efiling',
  'CR_PF': 'Client Review - Paper Filing',
  'EFP_I': 'Efiling Pending - 1',
  'EFP_II': 'Efiling Pending - 2',
  'EF_AA_I': 'E - Filed & Awaiting Acceptance - 1',
  'EF_AA_II': 'E - Filed & Awaiting Acceptance - 2',
  'EF_REJ': 'E - Filed & Rejected',
  'C_R': 'City Return',
  'EFA_FC': 'E-Filing Accepted & Filing Complete',
  'PF_P': 'Paper Filing Pending',
  'PF_D': 'Paper Filing Done',
  'CANC': 'Cancelled',
};

/* Workflow order used by the File Status dropdown */
const STATUS_ORDER = [
  'RGO',
  'BIP',
  'SP',
  'IP',
  'DP',
  'PP_I',
  'PP_II',
  'TR_S_I',
  'TR_S_II',
  'ITIN',
  'RE_ES',
  'PP_EF',
  'PP_PF',
  'FPR',
  'FPR_II',
  'CR_EF',
  'CR_PF',
  'EFP_I',
  'EFP_II',
  'EF_AA_I',
  'EF_AA_II',
  'EF_REJ',
  'C_R',
  'EFA_FC',
  'PF_P',
  'PF_D',
  'CANC',
];

/* Dropdown options are derived from CODE_TO_DISPLAY so every display
   name the history table can produce is always selectable. */
export const WORKFLOW_STATUSES = STATUS_ORDER.map(code => CODE_TO_DISPLAY[code]);

/* Labels the backend / older builds send for the same stage */
const DISPLAY_ALIASES = {
  'Registered Only': 'RGO',
  'Basic Information Pending': 'BIP',
  'Basic Info Pending': 'BIP',
  'Information Pending': 'BIP',
  'Preparation Pending - 1': 'PP_I',
  'Preparation Pending 1': 'PP_I',
  'Preparation Pending I': 'PP_I',
  'Preparation Pending - 2': 'PP_II',
  'Preparation Pending 2': 'PP_II',
  'Preparation Pending II': 'PP_II',
  'FPR_2': 'FPR_II',
  'E-Filed & Rejected': 'EF_REJ',
  'E-Filed and Rejected': 'EF_REJ',
};

/* Ignore case, extra spaces and hyphen/dash variants when comparing */
const normalize = value => String(value).toLowerCase().replace(/[^a-z0-9]/g, '');

const CODE_BY_KEY = Object.keys(CODE_TO_DISPLAY).reduce((acc, code) => {
  acc[normalize(code)] = code;
  return acc;
}, {});

const CODE_BY_NAME = Object.entries(CODE_TO_DISPLAY).reduce((acc, [code, name]) => {
  acc[normalize(name)] = code;
  return acc;
}, {});

Object.entries(DISPLAY_ALIASES).forEach(([label, code]) => {
  CODE_BY_NAME[normalize(label)] = code;
});

const resolveCode = value => {
  if (!value) return '';
  const key = normalize(value);
  if (!key) return '';
  return CODE_BY_KEY[key] || CODE_BY_NAME[key] || '';
};

/* Any status code or display label → backend code (passes unknown values through) */
export const toStatusCode = value => {
  if (!value) return '';
  return resolveCode(value) || String(value).trim();
};

/* Any status code or display label → canonical display name */
export const toDisplayStatus = (value, fallback = '') => {
  if (!value) return fallback;
  const code = resolveCode(value);
  return code ? CODE_TO_DISPLAY[code] : (String(value).trim() || fallback);
};
