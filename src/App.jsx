import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Login from './components/Login';
import ChangePasswordModal from './pages/ChangePasswordModal';
import { isSuperAdmin, getAdminPermissions, hasViewPermission, getFirstPermittedTab, resolveStaffPermissions, decodeJwt } from './utils/permissions';
import { URLS } from './url';

// ──────────────────────────────────────────────────────────
//  Top-level pages
// ──────────────────────────────────────────────────────────
import Estimator from './pages/Estimator';
import ClientTracker from './pages/ClientTracker';
import DocumentHub from './pages/DocumentHub';
import CallbackRequests from './pages/CallbackRequests';
import QueryList from './pages/QueryAndMessages/QueryList';
import Messages from './pages/QueryAndMessages/Messages';
import Leads from './pages/Leads/index';
import SendMail from './pages/SendMail';
import MNote from './pages/MNote';
import Mailgun from './pages/Mailgun';
import ReferralsReport from './pages/ReferralReport/ReferralsReport';
import PaymentsReport from './pages/PaymentsReport';
import ClientSearch from './pages/ClientSearch';
import ClientStage from './pages/ClientStage';
import RefereeReport from './pages/RefereeReport';
import UplodedDocs from './pages/JustUploadedDocs/JustUploadedDocs';
import TaxOrganizer from './pages/TaxOrganizer/TaxOrganizer';
import FbarQuestionnaire from './pages/FbarQuestioner/FbarQuestionnaire';

// ──────────────────────────────────────────────────────────
//  Administration Pages
// ──────────────────────────────────────────────────────────
import DashboardContent from './pages/DashboardContent/DashboardContent';
import RoleAccess from './pages/RoleAccess/RoleAccess';
import Staff from './pages/Staff/Staff';

// ──────────────────────────────────────────────────────────
//  Modular Pages — API integrated with MemberTableLayout
// ──────────────────────────────────────────────────────────
import AllRegistered from './pages/AllRegistered';
import Cancelled from './pages/Cancelled';

// Processing folder
import RegisteredUsers from './pages/Processing/RegisteredUsers';
import InfoPending from './pages/Processing/InfoPending';
import SchedulingPending from './pages/Processing/SchedulingPending';
import InterviewPending from './pages/Processing/InterviewPending';
import DocumentPending from './pages/Processing/DocumentPending';

// Preparation folder
import Preparation1 from './pages/Preparation/Preparation1';
import Preparation2 from './pages/Preparation/Preparation2';
import ReviewSummary1 from './pages/Preparation/ReviewSummary1';
import ReviewSummary2 from './pages/Preparation/ReviewSummary2';
import ItinFiles from './pages/Preparation/ItinFiles';
import RevisedEstimate from './pages/Preparation/RevisedEstimate';

// Payment folder
import PaymentPendingEfiling from './pages/Payment/PaymentPendingEfiling';
import PaymentPendingPaperFiling from './pages/Payment/PaymentPendingPaperFiling';
import FeePaymentReceived1 from './pages/Payment/FeePaymentReceived1';
import FeePaymentReceived2 from './pages/Payment/FeePaymentReceived2';

// Client Review folder
import ClientReviewEfiling from './pages/ClientReview/ClientReviewEfiling';
import ClientReviewPaperFiling from './pages/ClientReview/ClientReviewPaperFiling';

// E-Filing folder
import EFilingPending1 from './pages/EFiling/EFilingPending1';
import EFilingPending2 from './pages/EFiling/EFilingPending2';
import EFiledAwaitingAcceptance1 from './pages/EFiling/EFiledAwaitingAcceptance1';
import EFiledAwaitingAcceptance2 from './pages/EFiling/EFiledAwaitingAcceptance2';
import EFiledRejected from './pages/EFiling/EFiledRejected';
import CityReturn from './pages/EFiling/CityReturn';
import EFilingAcceptedComplete from './pages/EFiling/EFilingAcceptedComplete';

// Paper Filing folder
import PaperFilingPending from './pages/PaperFiling/PaperFilingPending';
import PaperFilingDoneFolder from './pages/PaperFiling/PaperFilingDone';

// Notes Folder
import Notes from './pages/Notes/Notes';

/* ─────────────────────────────────────────────────────────────
   URL Path → Filter Key mapping (removed # for clean URLs)
───────────────────────────────────────────────────────────── */
const ROUTE_MAP = {
  'all-registered': '/all-registered',
  'registered-users': '/processing/registered-users',
  'info-pending': '/processing/info-pending',
  'scheduling-pending': '/processing/scheduling-pending',
  'interview-pending': '/processing/interview-pending',
  'docs-pending': '/processing/document-pending',
  'preparation-1': '/preparation/preparation-1',
  'preparation-2': '/preparation/preparation-2',
  'review-summary-1': '/preparation/review-summary-1',
  'review-summary-2': '/preparation/review-summary-2',
  'itin-files': '/preparation/itin-files',
  'revised-estimate': '/preparation/revised-estimate',
  'payment-pending-efiling': '/payment/pending-efiling',
  'payable-pending-paper-filing': '/payment/pending-paper-filing',
  'fee-payment-received-1': '/payment/fee-received-1',
  'fee-payment-received-2': '/payment/fee-received-2',
  'client-review-efiling': '/client-review/efiling',
  'client-review-paper-filing': '/client-review/paper-filing',
  'efiling-pending-1': '/efiling/pending-1',
  'efiling-pending-2': '/efiling/pending-2',
  'efiled-awaiting-1': '/efiling/awaiting-1',
  'efiled-awaiting-2': '/efiling/awaiting-2',
  'efiled-rejected': '/efiling/rejected',
  'city-return': '/efiling/city-return',
  'efiling-accepted-complete': '/efiling/accepted-complete',
  'paper-filing-pending': '/paper-filing/pending',
  'paper-filing-accepted-complete': '/paper-filing/done',
  'cancelled': '/cancelled',
  'query-list': '/query-list',
  'messages': '/messages',
  'call-back-requests': '/call-back-requests',
  'just-uploaded-docs': '/just-uploaded-docs',
  'send-mail': '/send-mail',
  'm-note': '/m-note',
  'mailgun': '/mailgun',
  'leads': '/leads',
  'notes': '/notes',
  'fbar-questionnaire': '/fbar-questionnaire',
  'tax-organizer': '/tax-organizer',
  'dashboard-content': '/settings/dashboard-content',
  'role-access': '/settings/role-access',
  'staff': '/settings/staff',
};

const TOP_LEVEL_TABS = [
  'client-stage',
  'referee',
  'client-search',
  'referrals',
  'payments',
  'm-note',
  'estimator',
  'pipeline',
  'documents',
];

const getInitialRoute = () => {
  if (typeof window === 'undefined') return { tab: 'members', status: 'all-registered' };
  const path = window.location.pathname;
  const topTab = TOP_LEVEL_TABS.find(tab => path === `/${tab}`);
  if (topTab) {
    return { tab: topTab, status: 'all-registered' };
  }
  const foundKey = Object.keys(ROUTE_MAP).find(k => ROUTE_MAP[k] === path);
  if (foundKey) {
    return { tab: 'members', status: foundKey };
  }
  return { tab: 'members', status: 'all-registered' };
};

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    // Check if admin token exists in sessionStorage or localStorage
    const token = sessionStorage.getItem('adminToken') || localStorage.getItem('adminToken');
    const isLoggedInFlag = sessionStorage.getItem('isLoggedIn') === 'true';
    return !!(token && isLoggedInFlag);
  });

  // RBAC: load stored permissions on mount (persists across refreshes)
  const [userPermissions, setUserPermissions] = useState(() => ({
    isSuperAdmin: isSuperAdmin(),
    permissions: getAdminPermissions() || [],
  }));

  // Resolve staff permissions on mount/refresh if missing
  useEffect(() => {
    if (!isLoggedIn) return;
    if (!isSuperAdmin()) {
      if (userPermissions.permissions && userPermissions.permissions.length > 0) {
        return;
      }
      const stored = getAdminPermissions();
      if (stored && stored.length > 0) {
        setUserPermissions({
          isSuperAdmin: false,
          permissions: stored,
        });
        return;
      }
      if (sessionStorage.getItem('adminPermissions') === null) {
        const token = sessionStorage.getItem('adminToken') || localStorage.getItem('adminToken');
        if (token) {
          const payload = decodeJwt(token);
          resolveStaffPermissions(token, URLS.Base, {}, payload).then(perms => {
            if (perms && perms.length > 0) {
              setUserPermissions({
                isSuperAdmin: false,
                permissions: perms,
              });
            }
          });
        }
      }
    }
  }, [isLoggedIn]);

  const [activeTab, setActiveTab] = useState(() => getInitialRoute().tab);
  const [selectedYear, setSelectedYear] = useState('');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);

  // Default on login: All Registered (or path-matched member status)
  const [selectedStatus, setSelectedStatus] = useState(() => getInitialRoute().status);
  const [refreshKey, setRefreshKey] = useState(0);

  // URL Path Sync (removed hash-based routing)
  useEffect(() => {
    if (!isLoggedIn) return;

    const updateFromPath = () => {
      const path = window.location.pathname;

      // 1. Check top-level non-member tabs (e.g. /referee, /client-stage, etc.)
      const topTab = TOP_LEVEL_TABS.find(tab => path === `/${tab}`);
      if (topTab) {
        setActiveTab(topTab);
        return;
      }

      // 2. Check member routes
      const foundKey = Object.keys(ROUTE_MAP).find(k => ROUTE_MAP[k] === path);
      if (foundKey) {
        setSelectedStatus(foundKey);
        setActiveTab('members');
      } else if (!path || path === '/') {
        window.history.pushState(null, '', '/all-registered');
        setSelectedStatus('all-registered');
        setActiveTab('members');
      }
    };

    updateFromPath();
    window.addEventListener('popstate', updateFromPath);
    return () => window.removeEventListener('popstate', updateFromPath);
  }, [isLoggedIn]);

  // Auto-redirect to first permitted tab if current view is restricted
  useEffect(() => {
    if (!isLoggedIn) return;

    const currentKey = activeTab === 'members' ? selectedStatus : activeTab;
    if (!hasViewPermission(currentKey)) {
      const firstTab = getFirstPermittedTab();
      if (ROUTE_MAP[firstTab]) {
        setSelectedStatus(firstTab);
        setActiveTab('members');
        window.history.pushState(null, '', ROUTE_MAP[firstTab]);
      } else {
        setActiveTab(firstTab);
        window.history.pushState(null, '', `/${firstTab}`);
      }
    }
  }, [isLoggedIn, userPermissions, selectedStatus, activeTab]);

  const handleFilterChange = (statusKey) => {
    sessionStorage.removeItem('selectedMemberView');
    setSelectedYear('');
    setSelectedStatus(statusKey);
    setActiveTab('members');
    setRefreshKey(prev => prev + 1);
    if (ROUTE_MAP[statusKey]) {
      window.history.pushState(null, '', ROUTE_MAP[statusKey]);
    }
  };

  const renderViewContent = () => {
    // Check permission for active view before rendering
    const currentKey = activeTab === 'members' ? selectedStatus : activeTab;
    if (!hasViewPermission(currentKey)) {
      return (
        <div style={{ padding: '60px 20px', textAlign: 'center', color: '#64748b' }}>
          <h3 style={{ color: '#ef4444', marginBottom: '10px', fontSize: '18px', fontWeight: '700' }}>
            Access Restricted
          </h3>
          <p style={{ fontSize: '14px', margin: 0 }}>
            You do not have permission to view this module.
          </p>
        </div>
      );
    }

    if (activeTab === 'members') {
      switch (selectedStatus) {
        // ── Default / All Registered — uses the navbar-selected year ──
        case 'all-registered':
          return <AllRegistered key={`all-reg-${refreshKey}`} selectedYear={selectedYear} refreshKey={refreshKey} />;

        // ── Processing Folder ──
        case 'registered-users':
          return <RegisteredUsers selectedYear={selectedYear} />;
        case 'info-pending':
          return <InfoPending selectedYear={selectedYear} />;
        case 'scheduling-pending':
          return <SchedulingPending selectedYear={selectedYear} />;
        case 'interview-pending':
          return <InterviewPending selectedYear={selectedYear} />;
        case 'docs-pending':
          return <DocumentPending selectedYear={selectedYear} />;

        // ── Preparation Folder ──
        case 'preparation-1':
          return <Preparation1 selectedYear={selectedYear} />;
        case 'preparation-2':
          return <Preparation2 selectedYear={selectedYear} />;
        case 'review-summary-1':
          return <ReviewSummary1 selectedYear={selectedYear} />;
        case 'review-summary-2':
          return <ReviewSummary2 selectedYear={selectedYear} />;
        case 'itin-files':
          return <ItinFiles selectedYear={selectedYear} />;
        case 'revised-estimate':
          return <RevisedEstimate selectedYear={selectedYear} />;

        // ── Payment Folder ──
        case 'payment-pending-efiling':
          return <PaymentPendingEfiling selectedYear={selectedYear} />;
        case 'payable-pending-paper-filing':
          return <PaymentPendingPaperFiling selectedYear={selectedYear} />;
        case 'fee-payment-received-1':
          return <FeePaymentReceived1 selectedYear={selectedYear} />;
        case 'fee-payment-received-2':
          return <FeePaymentReceived2 selectedYear={selectedYear} />;

        // ── Client Review Folder ──
        case 'client-review-efiling':
          return <ClientReviewEfiling selectedYear={selectedYear} />;
        case 'client-review-paper-filing':
          return <ClientReviewPaperFiling selectedYear={selectedYear} />;

        // ── E-Filing Folder ──
        case 'efiling-pending-1':
          return <EFilingPending1 selectedYear={selectedYear} />;
        case 'efiling-pending-2':
          return <EFilingPending2 selectedYear={selectedYear} />;
        case 'efiled-awaiting-1':
          return <EFiledAwaitingAcceptance1 selectedYear={selectedYear} />;
        case 'efiled-awaiting-2':
          return <EFiledAwaitingAcceptance2 selectedYear={selectedYear} />;
        case 'efiled-rejected':
          return <EFiledRejected selectedYear={selectedYear} />;
        case 'city-return':
          return <CityReturn selectedYear={selectedYear} />;
        case 'efiling-accepted-complete':
          return <EFilingAcceptedComplete selectedYear={selectedYear} />;

        // ── Paper Filing Folder ──
        case 'paper-filing-pending':
          return <PaperFilingPending selectedYear={selectedYear} />;
        case 'paper-filing-accepted-complete':
          return <PaperFilingDoneFolder selectedYear={selectedYear} />;

        // ── Other ──
        case 'cancelled':
          return <Cancelled selectedYear={selectedYear} />;
        case 'call-back-requests':
          return <CallbackRequests />;
        case 'query-list':
          return <QueryList />;
        case 'messages':
          return <Messages />;
        case 'send-mail':
          return <SendMail selectedYear={selectedYear} />;
        case 'mailgun':
          return <Mailgun selectedYear={selectedYear} />;
        case 'leads':
          return <Leads />;
        case 'notes':
          return <Notes />;
        case 'just-uploaded-docs':
          return <UplodedDocs />;
        case 'fbar-questionnaire':
          return <FbarQuestionnaire />;
        case 'tax-organizer':
          return <TaxOrganizer />;

        // ── Administration ──
        case 'dashboard-content':
          return <DashboardContent />;
        case 'role-access':
          return <RoleAccess />;
        case 'staff':
          return <Staff />;

        default:
          return <AllRegistered key={`all-reg-${refreshKey}`} selectedYear={selectedYear} refreshKey={refreshKey} />;
      }
    }

    // Non-member tabs
    switch (activeTab) {
      case 'client-stage':
        return <ClientStage />;
      case 'referee':
        return <RefereeReport />;
      case 'client-search':
        return <ClientSearch selectedYear={selectedYear} setSelectedYear={setSelectedYear} />;
      case 'referrals':
        return <ReferralsReport selectedYear={selectedYear} setSelectedYear={setSelectedYear} />;
      case 'payments':
        return <PaymentsReport selectedYear={selectedYear} setSelectedYear={setSelectedYear} />;
      case 'm-note':
        return <MNote />;
      case 'estimator':
        return <Estimator />;
      case 'pipeline':
        return <ClientTracker />;
      case 'documents':
        return <DocumentHub />;

      default:
        return <AllRegistered key={`all-reg-${refreshKey}`} selectedYear={selectedYear} refreshKey={refreshKey} />;
    }
  };

  if (!isLoggedIn) {
    return (
      <Login
        onLoginSuccess={(perms) => {
          setIsLoggedIn(true);
          sessionStorage.setItem('isLoggedIn', 'true');
          const superAdmin = isSuperAdmin();
          const loadedPerms = Array.isArray(perms) && perms.length > 0 ? perms : (getAdminPermissions() || []);
          setUserPermissions({
            isSuperAdmin: superAdmin,
            permissions: loadedPerms,
          });
          const firstTab = getFirstPermittedTab();
          if (ROUTE_MAP[firstTab]) {
            setSelectedStatus(firstTab);
            setActiveTab('members');
            window.history.pushState(null, '', ROUTE_MAP[firstTab]);
          } else {
            setActiveTab(firstTab);
            window.history.pushState(null, '', `/${firstTab}`);
          }
        }}
      />
    );
  }

  return (
    <div className="app-shell">
      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          if (tab === 'members') {
            sessionStorage.removeItem('selectedMemberView');
            setRefreshKey(prev => prev + 1);
          }
          setActiveTab(tab);
          if (tab !== 'members') {
            window.history.pushState(null, '', `/${tab}`);
          } else {
            window.history.pushState(null, '', ROUTE_MAP[selectedStatus] || '/all-registered');
          }
        }}
        isProfileOpen={isProfileOpen}
        toggleProfileDropdown={() => setIsProfileOpen(!isProfileOpen)}
        setIsProfileOpen={setIsProfileOpen}
        setIsChangePasswordOpen={setIsChangePasswordOpen}
        selectedYear={selectedYear}
        setSelectedYear={setSelectedYear}
        userPermissions={userPermissions}
        onSelectNavbarYear={(yearStr) => {
          sessionStorage.removeItem('selectedMemberView');
          setSelectedYear(yearStr);
          setSelectedStatus('all-registered');
          setActiveTab('members');
          setRefreshKey(prev => prev + 1);
          window.history.pushState(null, '', ROUTE_MAP['all-registered'] || '/all-registered');
        }}
      />
      <div className="shell-body">
        <Sidebar
          selectedYear={selectedYear}
          currentFilter={selectedStatus}
          onFilterChange={handleFilterChange}
          userPermissions={userPermissions}
          refreshKey={refreshKey}
        />
        <main className="main-viewport">
          {renderViewContent()}
        </main>
      </div>
      <ChangePasswordModal
        isOpen={isChangePasswordOpen}
        onClose={() => setIsChangePasswordOpen(false)}
      />
    </div>
  );
}
