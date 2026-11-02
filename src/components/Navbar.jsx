import React, { useState, useEffect, useRef } from 'react';
import { User, Key, LogOut, ChevronDown } from 'lucide-react';
import logoLg from '../assets/logo-lg.png';
import { URLS } from '../url';
import { hasViewPermission } from '../utils/permissions';

export default function Navbar({
  activeTab,
  setActiveTab,
  isProfileOpen,
  toggleProfileDropdown,
  setIsProfileOpen,
  setIsChangePasswordOpen,
  selectedYear,
  setSelectedYear,
  userPermissions,
  onSelectNavbarYear,
}) {
  const canView = (filterKey) => {
    if (userPermissions?.isSuperAdmin) return true;
    return hasViewPermission(filterKey);
  };
  const [activeDropdown, setActiveDropdown] = useState(null);
  const navbarRef = useRef(null);

  // --- State for years fetched from API ---
  const [yearsOptions, setYearsOptions] = useState([]);
  const [isLoadingYears, setIsLoadingYears] = useState(false);
  const [yearsError, setYearsError] = useState('');

  // --- Profile State ---
  const [profileData, setProfileData] = useState(null);

  // --- Helper to get the token from any known key ---
  const getAuthToken = () => {
    const possibleKeys = [
      'authToken',
      'token',
      'adminToken',
      'accessToken',
      'jwt',
      'bearer',
    ];
    for (const key of possibleKeys) {
      const value =
        sessionStorage.getItem(key) || localStorage.getItem(key);
      if (value) return value;
    }
    return null;
  };

  // --- Fetch employee/admin profile on mount ---
  useEffect(() => {
    const controller = new AbortController();

    const fetchProfile = async () => {
      const token = getAuthToken();
      if (!token) return;

      try {
        const response = await fetch(URLS.GetProfile, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          signal: controller.signal,
        });

        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data) {
            setProfileData(result);
          }
        }
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.warn('Profile fetch error:', error);
        }
      }
    };

    fetchProfile();
    return () => controller.abort();
  }, []);

  // --- Helper to determine display name for profile trigger ---
  const getDisplayName = () => {
    if (userPermissions?.isSuperAdmin) {
      return 'Admin';
    }

    if (profileData?.data) {
      const stage = (profileData.data.admin_stage || '').toLowerCase();
      if (stage === 'super' || stage === 'superadmin' || profileData.userType === 'admin') {
        return 'Admin';
      }
      const fullName = `${profileData.data.first_name || ''} ${profileData.data.last_name || ''}`.trim();
      if (fullName) return fullName;
    }

    const storedStage = (sessionStorage.getItem('adminStage') || '').toLowerCase();
    if (storedStage === 'super' || storedStage === 'superadmin') {
      return 'Admin';
    }

    return 'Staff';
  };

  // --- Fetch years on mount ---
  useEffect(() => {
    const controller = new AbortController();

    const fetchYears = async () => {
      setIsLoadingYears(true);
      setYearsError('');

      const token = getAuthToken();
      if (!token) {
        setYearsError('Authentication token missing. Please log in again.');
        setIsLoadingYears(false);
        return;
      }

      try {
        const response = await fetch(URLS.GetYears, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          signal: controller.signal,
        });

        if (response.status === 401) {
          // Token expired – clear everything and show error
          sessionStorage.clear();
          localStorage.clear();
          setYearsError('Session expired. Please log in again.');
          setIsLoadingYears(false);
          return;
        }

        if (!response.ok) {
          throw new Error(`Unable to load years. (${response.status})`);
        }

        const result = await response.json();

        if (!result.success || !Array.isArray(result.data)) {
          throw new Error('Invalid years response received.');
        }

        const activeYears = result.data
          .filter((year) => year.status === 'active')
          .sort((a, b) => b.name - a.name);

        setYearsOptions(activeYears);
      } catch (error) {
        if (error.name !== 'AbortError') {
          setYearsError(error.message || 'Unable to load years.');
        }
      } finally {
        setIsLoadingYears(false);
      }
    };

    fetchYears();

    return () => controller.abort();
  }, []);

  // --- Close dropdowns on outside click ---
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (navbarRef.current && !navbarRef.current.contains(event.target)) {
        setActiveDropdown(null);
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [setIsProfileOpen]);

  // --- Handlers ---
  const handleLogout = () => {
    setIsProfileOpen(false);
    setActiveDropdown(null);
    if (confirm('Are you sure you want to log out of Admin Session?')) {
      sessionStorage.clear();
      localStorage.clear();
      window.location.reload();
    }
  };

  const toggleDropdown = (dropdownKey) => {
    setActiveDropdown((prev) => (prev === dropdownKey ? null : dropdownKey));
    setIsProfileOpen(false);
  };

  const handleProfileClick = () => {
    toggleProfileDropdown();
    setActiveDropdown(null);
  };

  const selectYearAndNavigate = (year, tab) => {
    const formattedYear = 'TY' + year.name;
    if (setSelectedYear) setSelectedYear(formattedYear);
    if (onSelectNavbarYear && tab === 'members') {
      onSelectNavbarYear(formattedYear);
    } else {
      setActiveTab(tab);
    }
    setActiveDropdown(null);
  };

  const handleSelectYear = (year) => selectYearAndNavigate(year, 'members');
  const handleSelectClientSearch = (year) =>
    selectYearAndNavigate(year, 'client-search');
  const handleSelectReferrals = (year) =>
    selectYearAndNavigate(year, 'referrals');
  const handleSelectPayments = (year) =>
    selectYearAndNavigate(year, 'payments');

  const renderYearsList = (onSelect) => {
    if (isLoadingYears) {
      return (
        <li className="navbar-dropdown-item">
          <span className="navbar-dropdown-btn">Loading years...</span>
        </li>
      );
    }

    if (yearsError) {
      return (
        <li className="navbar-dropdown-item">
          <span className="navbar-dropdown-btn" style={{ color: '#e74c3c' }}>
            {yearsError}
          </span>
        </li>
      );
    }

    if (yearsOptions.length === 0) {
      return (
        <li className="navbar-dropdown-item">
          <span className="navbar-dropdown-btn">No active years found.</span>
        </li>
      );
    }

    return yearsOptions.map((year) => (
      <li key={year._id} className="navbar-dropdown-item">
        <button className="navbar-dropdown-btn" onClick={() => onSelect(year)}>
          {year.name}
        </button>
      </li>
    ));
  };

  // --- Render ---
  return (
    <header className="top-navbar" ref={navbarRef}>
      {/* Left Side: Logo */}
      <div className="logo-container">
        <img
          src={logoLg}
          alt="Dollar Tax Filer"
          style={{ height: '60px', width: 'auto', objectFit: 'contain' }}
        />
      </div>

      {/* Center Navigation */}
      <nav>
        <ul className="navbar-nav">
          {/* Years Dropdown */}
          {canView('all-registered') && (
            <li className="navbar-dropdown-container">
              <button
                className={`navbar-link ${activeDropdown === 'years' ? 'active' : ''}`}
                onClick={() => toggleDropdown('years')}
              >
                <span>Years</span>
                <ChevronDown size={14} />
              </button>
              {activeDropdown === 'years' && (
                <ul className="navbar-dropdown-menu animate-fade-in">
                  {renderYearsList(handleSelectYear)}
                </ul>
              )}
            </li>
          )}

          {/* Client Stage */}
          {canView('client-stage') && (
            <li>
              <button
                className={`navbar-link ${activeTab === 'client-stage' ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab('client-stage');
                  setActiveDropdown(null);
                }}
              >
                Client Stage
              </button>
            </li>
          )}

          {/* Client Search */}
          {canView('client-search') && (
            <li className="navbar-dropdown-container">
              <button
                className={`navbar-link ${activeDropdown === 'clientSearch' ? 'active' : ''
                  } ${activeTab === 'client-search' ? 'active' : ''}`}
                onClick={() => toggleDropdown('clientSearch')}
              >
                <span>Client Search</span>
                <ChevronDown size={14} />
              </button>
              {activeDropdown === 'clientSearch' && (
                <ul className="navbar-dropdown-menu animate-fade-in">
                  {renderYearsList(handleSelectClientSearch)}
                </ul>
              )}
            </li>
          )}

          {/* Referrals */}
          {canView('referrals') && (
            <li className="navbar-dropdown-container">
              <button
                className={`navbar-link ${activeDropdown === 'referrals' ? 'active' : ''
                  } ${activeTab === 'referrals' ? 'active' : ''}`}
                onClick={() => toggleDropdown('referrals')}
              >
                <span>Referrals</span>
                <ChevronDown size={14} />
              </button>
              {activeDropdown === 'referrals' && (
                <ul className="navbar-dropdown-menu animate-fade-in">
                  {renderYearsList(handleSelectReferrals)}
                </ul>
              )}
            </li>
          )}

          {/* Referee */}
          {canView('referee') && (
            <li>
              <button
                className={`navbar-link ${activeTab === 'referee' ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab('referee');
                  setActiveDropdown(null);
                }}
              >
                Referee
              </button>
            </li>
          )}

          {/* M Note */}
          {(canView('notes') || canView('m-note')) && (
            <li>
              <button
                className={`navbar-link ${activeTab === 'm-note' ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab('m-note');
                  setActiveDropdown(null);
                }}
              >
                M Note
              </button>
            </li>
          )}

          {/* Payments */}
          {canView('payments') && (
            <li className="navbar-dropdown-container">
              <button
                className={`navbar-link ${activeDropdown === 'payments' ? 'active' : ''
                  } ${activeTab === 'payments' ? 'active' : ''}`}
                onClick={() => toggleDropdown('payments')}
              >
                <span>Payments</span>
                <ChevronDown size={14} />
              </button>
              {activeDropdown === 'payments' && (
                <ul className="navbar-dropdown-menu animate-fade-in">
                  {renderYearsList(handleSelectPayments)}
                </ul>
              )}
            </li>
          )}
        </ul>
      </nav>

      {/* Profile */}
      <div className="profile-dropdown-container">
        <button className="profile-trigger" onClick={handleProfileClick}>
          <User size={16} />
          <span>{getDisplayName()}</span>
          <ChevronDown size={14} />
        </button>
        {isProfileOpen && (
          <div className="profile-dropdown-menu">
            {profileData?.data?.email && (
              <div style={{ padding: '8px 12px', borderBottom: '1px solid #e2e8f0', fontSize: '12px', color: '#64748b' }}>
                <strong style={{ display: 'block', color: '#1e293b', fontWeight: '600' }}>{getDisplayName()}</strong>
                <span>{profileData.data.email}</span>
              </div>
            )}
            <button
              className="dropdown-item"
              onClick={() => {
                setIsProfileOpen(false);
                setIsChangePasswordOpen(true);
              }}
            >
              <Key size={14} />
              <span>Change Password</span>
            </button>
            <div className="dropdown-divider"></div>
            <button className="dropdown-item danger" onClick={handleLogout}>
              <LogOut size={14} />
              <span>Logout</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}