/**
 * permissions.js
 * Utility for Role-Based Access Control (RBAC).
 *
 * Provides helper functions to check permissions, normalize module names,
 * resolve staff role permissions from backend APIs, and filter sidebar/navbar components.
 */

/* ─── String Normalizer ─────────────────────────────────── */
export function normalize(str) {
  if (!str || typeof str !== 'string') return '';
  return str.toLowerCase().replace(/[^a-z0-9]/g, '');
}

/* ─── Comprehensive Module Aliases ──────────────────────── */
export const ALIASES = {
  'allregistered': ['all-registered', 'allregistered'],
  'registeredusers': ['registered-users', 'registeredusers'],
  'basicinformationpending': ['info-pending', 'basicinformationpending', 'informationpending', 'infopending'],
  'informationpending': ['info-pending', 'basicinformationpending', 'informationpending', 'infopending'],
  'infopending': ['info-pending', 'basicinformationpending', 'informationpending', 'infopending'],
  'schedulingpending': ['scheduling-pending', 'schedulingpending'],
  'interviewpending': ['interview-pending', 'interviewpending'],
  'document': ['docs-pending', 'document', 'documentspending', 'docspending'],
  'documentspending': ['docs-pending', 'document', 'documentspending', 'docspending'],
  'preparation1': ['preparation-1', 'preparation1'],
  'preparation2': ['preparation-2', 'preparation2'],
  'reviewsummary1': ['review-summary-1', 'reviewsummary1', 'reviewandsummary1'],
  'reviewsummary2': ['review-summary-2', 'reviewsummary2', 'reviewandsummary2'],
  'itinfiles': ['itin-files', 'itinfiles'],
  'revisedestimate': ['revised-estimate', 'revisedestimate'],
  'paymentpendingefiling': ['payment-pending-efiling', 'paymentpendingefiling'],
  'paymentpendingpaperfiling': ['payable-pending-paper-filing', 'paymentpendingpaperfiling'],
  'feepaymentreceived1': ['fee-payment-received-1', 'feepaymentreceived1'],
  'feepaymentreceived2': ['fee-payment-received-2', 'feepaymentreceived2'],
  'clientreviewefiling': ['client-review-efiling', 'clientreviewefiling'],
  'clientreviewpaperfiling': ['client-review-paper-filing', 'clientreviewpaperfiling'],
  'efilingpending1': ['efiling-pending-1', 'efilingpending1'],
  'efilingpending2': ['efiling-pending-2', 'efilingpending2'],
  'efilingawaitingacceptance1': ['efiled-awaiting-1', 'efilingawaitingacceptance1', 'efiledawaiting1'],
  'efiledawaiting1': ['efiled-awaiting-1', 'efilingawaitingacceptance1', 'efiledawaiting1'],
  'efilingawaitingacceptance2': ['efiled-awaiting-2', 'efilingawaitingacceptance2', 'efiledawaiting2'],
  'efiledawaiting2': ['efiled-awaiting-2', 'efilingawaitingacceptance2', 'efiledawaiting2'],
  'efiledrejected': ['efiled-rejected', 'efiledrejected'],
  'cityreturn': ['city-return', 'cityreturn'],
  'efilingacceptedcomplete': ['efiling-accepted-complete', 'efilingacceptedcomplete'],
  'paperfilingpending': ['paper-filing-pending', 'paperfilingpending'],
  'paperfilingdone': ['paper-filing-accepted-complete', 'paperfilingdone'],
  'cancelled': ['cancelled'],
  'clientsearch': ['client-search', 'clientsearch'],
  'referrals': ['referrals'],
  'querylist': ['query-list', 'querylist'],
  'messages' : ['messages'],
  'clientstage': ['client-stage', 'clientstage'],
  'justuploadeddocs': ['just-uploaded-docs', 'justuploadeddocs'],
  'callbackrequests': ['call-back-requests', 'callbackrequests'],
  'sendmail': ['send-mail', 'sendmail'],
  'mailgun': ['mailgun'],
  'referee': ['referee'],
  'dashboardcontent': ['dashboard-content', 'dashboardcontent'],
  'leads': ['leads'],
  'notes': ['notes', 'mnote', 'm-note'],
  'mnote': ['notes', 'mnote', 'm-note'],
  'fbarquestionnaire': ['fbar-questionnaire', 'fbarquestionnaire', 'fbar'],
  'taxorganizer': ['tax-organizer', 'taxorganizer'],
  'staff': ['staff'],
  'roleaccess': ['role-access', 'roleaccess', 'rolesandpermissions'],
};

/* Module Name → Filter Key mapping */
export const MODULE_TO_FILTER = {
  'All Registered': 'all-registered',
  'Registered Users': 'registered-users',
  'Basic Information Pending': 'info-pending',
  'Information Pending': 'info-pending',
  'Scheduling Pending': 'scheduling-pending',
  'Interview Pending': 'interview-pending',
  'Document': 'docs-pending',
  'Documents Pending': 'docs-pending',
  'Preparation-1': 'preparation-1',
  'Preparation 1': 'preparation-1',
  'Preparation-2': 'preparation-2',
  'Preparation 2': 'preparation-2',
  'Review & Summary-1': 'review-summary-1',
  'Review & Summary 1': 'review-summary-1',
  'Review Summary 1': 'review-summary-1',
  'Review & Summary-2': 'review-summary-2',
  'Review & Summary 2': 'review-summary-2',
  'Review Summary 2': 'review-summary-2',
  'ITIN Files': 'itin-files',
  'Revised Estimate': 'revised-estimate',
  'Payment Pending - Efiling': 'payment-pending-efiling',
  'Payment Pending (EFiling)': 'payment-pending-efiling',
  'Payment Pending - Paper Filing': 'payable-pending-paper-filing',
  'Payment Pending (Paper Filing)': 'payable-pending-paper-filing',
  'Fee Payment Received -1': 'fee-payment-received-1',
  'Fee Payment Received 1': 'fee-payment-received-1',
  'Fee Payment Received -2': 'fee-payment-received-2',
  'Fee Payment Received 2': 'fee-payment-received-2',
  'Client Review - Efiling': 'client-review-efiling',
  'Client Review (EFiling)': 'client-review-efiling',
  'Client Review - Paper Filing': 'client-review-paper-filing',
  'Client Review (Paper Filing)': 'client-review-paper-filing',
  'Efiling Pending -1': 'efiling-pending-1',
  'EFiling Pending 1': 'efiling-pending-1',
  'Efiling Pending -2': 'efiling-pending-2',
  'EFiling Pending 2': 'efiling-pending-2',
  'E-filing & Awaiting Acceptance -1': 'efiled-awaiting-1',
  'EFiled Awaiting 1': 'efiled-awaiting-1',
  'E-filing & Awaiting Acceptance -2': 'efiled-awaiting-2',
  'EFiled Awaiting 2': 'efiled-awaiting-2',
  'Efiled & Rejected': 'efiled-rejected',
  'EFiled Rejected': 'efiled-rejected',
  'City Return': 'city-return',
  'E-filing Accepted & Complete': 'efiling-accepted-complete',
  'EFiling Accepted Complete': 'efiling-accepted-complete',
  'Paper Filing Pending': 'paper-filing-pending',
  'Paper Filing Done': 'paper-filing-accepted-complete',
  'Cancelled': 'cancelled',
  'Client Search': 'client-search',
  'Referrals': 'referrals',
  'Query List': 'query-list',
  'Messages' : 'messages',
  'Client Stage': 'client-stage',
  'Just Uploaded Docs': 'just-uploaded-docs',
  'Call Back Requests': 'call-back-requests',
  'Send Mail': 'send-mail',
  'Mailgun': 'mailgun',
  'Referee': 'referee',
  'Dashboard Content': 'dashboard-content',
  'Leads': 'leads',
  'Notes': 'notes',
  'M Note': 'm-note',
  'FBAR Questionnaire': 'fbar-questionnaire',
  'Tax Organizer': 'tax-organizer',
  'Staff': 'staff',
  'Role Access': 'role-access',
};

/* Reverse map */
export const FILTER_TO_MODULE = Object.fromEntries(
  Object.entries(MODULE_TO_FILTER).map(([mod, fk]) => [fk, mod])
);

/* Sequence of all known filter keys */
export const ALL_FILTER_KEYS = [
  'all-registered',
  'registered-users',
  'info-pending',
  'scheduling-pending',
  'interview-pending',
  'docs-pending',
  'preparation-1',
  'preparation-2',
  'review-summary-1',
  'review-summary-2',
  'itin-files',
  'revised-estimate',
  'payment-pending-efiling',
  'payable-pending-paper-filing',
  'fee-payment-received-1',
  'fee-payment-received-2',
  'client-review-efiling',
  'client-review-paper-filing',
  'efiling-pending-1',
  'efiling-pending-2',
  'efiled-awaiting-1',
  'efiled-awaiting-2',
  'efiled-rejected',
  'city-return',
  'efiling-accepted-complete',
  'paper-filing-pending',
  'paper-filing-accepted-complete',
  'cancelled',
  'query-list',
  'messages',
  'call-back-requests',
  'just-uploaded-docs',
  'send-mail',
  'mailgun',
  'leads',
  'notes',
  'dashboard-content',
  'staff',
  'role-access',
  'client-stage',
  'client-search',
  'referrals',
  'referee',
];

/* ─── JWT decoder ───────────────────────────────────────── */
export function decodeJwt(token) {
  try {
    const base64Payload = token.split('.')[1];
    const decoded = atob(base64Payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

/* ─── Token reader ──────────────────────────────────────── */
export function getToken() {
  const keys = ['adminToken', 'authToken', 'token', 'accessToken', 'jwt'];
  for (const key of keys) {
    const val = sessionStorage.getItem(key) || localStorage.getItem(key);
    if (val) return val;
  }
  return null;
}

/* ─── Super-admin check ─────────────────────────────────── */
export function isSuperAdmin() {
  const storedStage = (sessionStorage.getItem('adminStage') || localStorage.getItem('adminStage') || '').toLowerCase();
  if (storedStage === 'staff' || storedStage === 'stage1' || storedStage === 'stage2' || storedStage === 'employee') {
    return false;
  }
  if (storedStage === 'super' || storedStage === 'superadmin') return true;

  const storedInfo = sessionStorage.getItem('adminInfo') || localStorage.getItem('adminInfo');
  if (storedInfo) {
    try {
      const info = JSON.parse(storedInfo);
      const infoStage = (info?.stage || info?.admin_stage || '').toLowerCase();
      if (infoStage === 'staff' || infoStage === 'stage1' || infoStage === 'stage2' || infoStage === 'employee') {
        return false;
      }
      if (infoStage === 'super' || infoStage === 'superadmin' || info?.email?.toLowerCase() === 'madhumoironix@gmail.com') {
        return true;
      }
    } catch {}
  }

  const token = getToken();
  if (!token) return false;
  const payload = decodeJwt(token);
  if (!payload) return false;

  const email = (payload.email || payload.admin_email || '').toLowerCase();
  if (email === 'madhumoironix@gmail.com') return true;

  const rawRole = typeof payload.role === 'string' ? payload.role : (payload.role?.roleName || payload.role?.name || '');
  const stage = (payload.admin_stage || payload.adminStage || payload.stage || rawRole || '').toLowerCase();

  if (stage === 'staff' || stage === 'stage1' || stage === 'stage2' || stage === 'employee') {
    return false;
  }

  return stage === 'super' || stage === 'superadmin' || payload.isSuperAdmin === true;
}

/* ─── Permission getters ────────────────────────────────── */
export function getAdminPermissions() {
  const raw = sessionStorage.getItem('adminPermissions');
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/**
 * Robust view permission check with string normalization and alias lookup.
 */
export function hasViewPermission(filterKey) {
  if (isSuperAdmin()) return true;

  const permissions = getAdminPermissions();
  if (!permissions || !Array.isArray(permissions) || permissions.length === 0) {
    return false;
  }

  // Compound keys for Navbar
  if (filterKey === 'payments') {
    const paymentKeys = [
      'payment-pending-efiling',
      'payable-pending-paper-filing',
      'fee-payment-received-1',
      'fee-payment-received-2',
    ];
    return paymentKeys.some(k => hasViewPermission(k));
  }

  const normKey = normalize(filterKey);
  const targetModuleName = FILTER_TO_MODULE[filterKey] || filterKey;
  const normTarget = normalize(targetModuleName);

  const perm = permissions.find(p => {
    if (!p) return false;

    // String entry: e.g. ["Leads", "All Registered"]
    if (typeof p === 'string') {
      const normP = normalize(p);
      if (normP === normKey || normP === normTarget) return true;
      const aliases = ALIASES[normP] || [];
      return aliases.some(a => normalize(a) === normKey);
    }

    // Object entry: e.g. { module: "Leads", view: true }
    const modName = p.module || p.name || p.moduleName || p.module_name || p.title || '';
    const normP = normalize(modName);
    if (!normP) return false;

    if (normP === normKey || normP === normTarget) return true;
    const aliases = ALIASES[normP] || [];
    return aliases.some(a => normalize(a) === normKey);
  });

  if (!perm) return false;
  if (typeof perm === 'string') return true;

  return perm.view === true || perm.view === 1 || perm.view === 'true' || perm.all === true;
}

/**
 * Check specific action for a module by filter key.
 */
export function hasPermission(filterKey, action = 'view') {
  if (isSuperAdmin()) return true;

  const permissions = getAdminPermissions();
  if (!permissions || !Array.isArray(permissions) || permissions.length === 0) return false;

  const normKey = normalize(filterKey);
  const targetModuleName = FILTER_TO_MODULE[filterKey] || filterKey;
  const normTarget = normalize(targetModuleName);

  const perm = permissions.find(p => {
    if (!p) return false;
    if (typeof p === 'string') {
      const normP = normalize(p);
      if (normP === normKey || normP === normTarget) return true;
      const aliases = ALIASES[normP] || [];
      return aliases.some(a => normalize(a) === normKey);
    }
    const modName = p.module || p.name || p.moduleName || p.module_name || p.title || '';
    const normP = normalize(modName);
    if (!normP) return false;
    if (normP === normKey || normP === normTarget) return true;
    const aliases = ALIASES[normP] || [];
    return aliases.some(a => normalize(a) === normKey);
  });

  if (!perm) return false;
  if (typeof perm === 'string') return true;

  return perm[action] === true || perm[action] === 1 || perm[action] === 'true' || perm.all === true;
}

/**
 * Returns the first permitted tab/filter key for the logged-in user.
 */
export function getFirstPermittedTab() {
  if (isSuperAdmin()) return 'all-registered';
  for (const key of ALL_FILTER_KEYS) {
    if (hasViewPermission(key)) return key;
  }
  return 'all-registered';
}

/* ─── Fetch role permissions by role ID ──────────────────── */
export async function fetchAndStorePermissions(roleId, token, baseUrl) {
  if (!token) return null;
  const cleanBase = (baseUrl || '').replace(/\/+$/, '') + '/';

  // Strategy 1: getRoleById via POST / GET if roleId provided
  if (roleId) {
    try {
      const res = await fetch(`${cleanBase}v1/minimumTax/admin/role/getRoleById/${roleId}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });
      const json = await res.json();
      if (res.ok && json.success !== false) {
        const roleData = json.data || json.result || json;
        const permissions = roleData.permissions || roleData.role?.permissions || [];
        if (permissions.length > 0) {
          sessionStorage.setItem('adminPermissions', JSON.stringify(permissions));
          return permissions;
        }
      }
    } catch (e) {
      console.warn('POST getRoleById error:', e);
    }

    try {
      const res = await fetch(`${cleanBase}v1/minimumTax/admin/role/getRoleById/${roleId}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      const json = await res.json();
      if (res.ok && json.success !== false) {
        const roleData = json.data || json.result || json;
        const permissions = roleData.permissions || roleData.role?.permissions || [];
        if (permissions.length > 0) {
          sessionStorage.setItem('adminPermissions', JSON.stringify(permissions));
          return permissions;
        }
      }
    } catch (e) {
      console.warn('GET getRoleById error:', e);
    }
  }

  // Strategy 2: Call getRoles to fetch all active roles & find matching role
  try {
    const res = await fetch(`${cleanBase}v1/minimumTax/admin/role/getRoles`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    });
    const json = await res.json();
    if (res.ok && json.success !== false) {
      const rolesList = json.data || json.result || [];
      if (Array.isArray(rolesList) && rolesList.length > 0) {
        const matched = roleId ? rolesList.find(r => 
          (r._id === roleId || r.id === roleId || String(r._id) === String(roleId)) ||
          r.name === roleId || r.roleName === roleId
        ) : null;

        if (matched && matched.permissions) {
          sessionStorage.setItem('adminPermissions', JSON.stringify(matched.permissions));
          return matched.permissions;
        }
      }
    }
  } catch (e) {
    console.warn('getRoles fallback error:', e);
  }

  sessionStorage.setItem('adminPermissions', JSON.stringify([]));
  return [];
}

/* ─── Multi-strategy Staff Permission Resolver ────────────── */
export async function resolveStaffPermissions(token, baseUrl, loginResponseData = {}, jwtPayload = {}) {
  if (!token) return null;
  const cleanBase = (baseUrl || '').replace(/\/+$/, '') + '/';

  // 1. Direct permissions in login response or JWT
  const directPermissions = 
    loginResponseData?.data?.permissions ||
    loginResponseData?.data?.role?.permissions ||
    loginResponseData?.data?.admin?.role?.permissions ||
    loginResponseData?.permissions ||
    loginResponseData?.role?.permissions ||
    jwtPayload?.permissions ||
    jwtPayload?.role?.permissions;

  if (Array.isArray(directPermissions) && directPermissions.length > 0) {
    sessionStorage.setItem('adminPermissions', JSON.stringify(directPermissions));
    return directPermissions;
  }

  // 2. Extract roleId
  let roleId = 
    loginResponseData?.data?.role_id ||
    loginResponseData?.data?.roleId ||
    (typeof loginResponseData?.data?.role === 'string' ? loginResponseData?.data?.role : loginResponseData?.data?.role?._id) ||
    loginResponseData?.data?.admin?.role_id ||
    (typeof loginResponseData?.data?.admin?.role === 'string' ? loginResponseData?.data?.admin?.role : loginResponseData?.data?.admin?.role?._id) ||
    jwtPayload?.role_id ||
    jwtPayload?.roleId ||
    (typeof jwtPayload?.role === 'string' ? jwtPayload?.role : jwtPayload?.role?._id);

  // 3. Attempt getProfile to fetch exact employee role/permissions
  try {
    const profileRes = await fetch(`${cleanBase}v1/minimumTax/admin/auth/getProfile`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    });
    if (profileRes.ok) {
      const profileJson = await profileRes.json();
      if (profileJson.success && profileJson.data) {
        const pData = profileJson.data;
        if (Array.isArray(pData.permissions) && pData.permissions.length > 0) {
          sessionStorage.setItem('adminPermissions', JSON.stringify(pData.permissions));
          return pData.permissions;
        }
        if (Array.isArray(pData.role?.permissions) && pData.role.permissions.length > 0) {
          sessionStorage.setItem('adminPermissions', JSON.stringify(pData.role.permissions));
          return pData.role.permissions;
        }
        if (!roleId) {
          roleId = pData.role_id || pData.roleId || (typeof pData.role === 'string' ? pData.role : pData.role?._id);
        }
      }
    }
  } catch (e) {
    console.warn('Could not fetch profile for permissions:', e);
  }

  // 4. If roleId missing, attempt getStaffById
  const adminId = jwtPayload?.admin_id || jwtPayload?.adminId || jwtPayload?.id || jwtPayload?._id || loginResponseData?.data?.admin_id;
  if (!roleId && adminId) {
    try {
      const staffRes = await fetch(`${cleanBase}v1/minimumTax/admin/staff/getStaffById/${adminId}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      const staffJson = await staffRes.json();
      if (staffRes.ok && staffJson.data) {
        const staffMember = staffJson.data;
        roleId = staffMember.role_id || staffMember.role?._id || staffMember.role;
        if (Array.isArray(staffMember.role?.permissions) && staffMember.role.permissions.length > 0) {
          sessionStorage.setItem('adminPermissions', JSON.stringify(staffMember.role.permissions));
          return staffMember.role.permissions;
        }
      }
    } catch (e) {
      console.warn('Could not fetch staff by id:', e);
    }
  }

  // 5. Fetch permissions using roleId or getRoles
  return await fetchAndStorePermissions(roleId, token, baseUrl);
}

/**
 * Clears stored auth & permission data.
 */
export function clearPermissions() {
  sessionStorage.removeItem('adminPermissions');
  sessionStorage.removeItem('adminStage');
  sessionStorage.removeItem('adminInfo');
}
