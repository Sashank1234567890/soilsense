import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useLocation, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getIoTStatus } from '../services/api';
import {
  Home,
  LayoutDashboard,
  Layers,
  Sprout,
  Activity,
  Radio,
  History,
  GitCompare,
  Database,
  FileText,
  Terminal,
  Info,
  Plus,
  User,
  LogOut,
  ChevronDown,
  ShieldCheck,
  MapPin,
  Users,
  UserPlus,
  Check,
  LogIn,
  Droplets,
  ShieldAlert,
  TrendingUp,
  Map,
  Globe,
  Award,
  Calendar,
  Bell
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function Layout() {
  const { lang, toggleLanguage, t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, sessions, signOutAccount, switchDemo, switchToUser } = useAuth();
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [iotConnected, setIotConnected] = useState(false);

  const navItems = [
    { section: lang === 'hi' ? 'डैशबोर्ड व मुख्य' : 'Overview & Dashboard' },
    { path: '/', label: lang === 'hi' ? 'मुख्य पृष्ठ' : 'Home', icon: Home },
    { path: '/dashboard', label: lang === 'hi' ? 'डैशबोर्ड' : 'Dashboard', icon: LayoutDashboard },

    { section: lang === 'hi' ? 'खेत व फसल प्रबंधन' : 'Farm & Crop Management' },
    { path: '/farm-management', label: lang === 'hi' ? 'खेत एवं फसल प्रबंधन' : 'Farm & Crop Manager', icon: MapPin },
    { path: '/crop-schedule', label: lang === 'hi' ? 'फसल शेड्यूलर व अलर्ट्स' : 'Crop Scheduler & Alerts', icon: Calendar },
    { path: '/smart-irrigation', label: lang === 'hi' ? 'स्मार्ट सिंचाई व बारिश रोक' : 'Smart Irrigation & Rain Skip', icon: Droplets },
    { path: '/fertilizer-prescription', label: lang === 'hi' ? 'उर्वरक खुराक (ICAR मानक)' : 'Fertilizer Dosing (ICAR)', icon: Sprout },
    { path: '/disease-radar', label: lang === 'hi' ? 'जड़ सड़न व रोग राडार' : 'Disease & Hypoxia Radar', icon: ShieldAlert },
    { path: '/mandi-economics', label: lang === 'hi' ? 'मंडी भाव व शुद्ध लाभ' : 'Mandi Market ROI (₹/Acre)', icon: TrendingUp },
    { path: '/soil-health-card', label: lang === 'hi' ? 'मृदा स्वास्थ्य कार्ड (SHC)' : 'Govt Soil Health Card (SHC)', icon: Award },
    { path: '/farm-heatmap', label: lang === 'hi' ? '2D खेत नमी नक्शा' : '2D Farm Moisture Heatmap', icon: Map },

    { section: lang === 'hi' ? 'मृदा परीक्षण व मिलान' : 'Soil Testing & Analysis' },
    { path: '/soil-to-crop', label: lang === 'hi' ? 'मृदा से उपयुक्त फसल' : 'Soil to Crop', icon: Layers },
    { path: '/crop-to-soil', label: lang === 'hi' ? 'फसल से मृदा उपयुक्तता' : 'Crop to Soil', icon: Sprout },
    { path: '/test-your-soil', label: lang === 'hi' ? 'मृदा परीक्षण' : 'Test Your Soil', icon: Activity },

    { section: lang === 'hi' ? 'सेंसर व रिकॉर्ड' : 'Telemetry & Records' },
    { path: '/live-monitoring', label: lang === 'hi' ? 'सजीव सेंसर निगरानी' : 'Live Sensor Monitoring', icon: Radio },
    { path: '/soil-history', label: lang === 'hi' ? 'मृदा परीक्षण इतिहास' : 'Soil History', icon: History },
    { path: '/compare-soil', label: lang === 'hi' ? 'मृदा तुलना' : 'Compare Soil', icon: GitCompare },

    { section: lang === 'hi' ? 'संसाधन व रिपोर्ट' : 'Resources & Knowledge' },
    { path: '/soil-database', label: lang === 'hi' ? 'भारतीय मृदा भंडार' : 'Soil Database', icon: Database },
    { path: '/reports', label: lang === 'hi' ? 'विश्लेषण रिपोर्ट (PDF)' : 'Reports (PDF)', icon: FileText },
    { path: '/query-explorer', label: lang === 'hi' ? 'डेटा एक्सप्लोरर' : 'Data Explorer', icon: Terminal },
    { path: '/about', label: lang === 'hi' ? 'परियोजना परिचय' : 'About Platform', icon: Info }
  ];

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await getIoTStatus();
        setIotConnected(res.data.connected);
      } catch (e) {
        setIotConnected(false);
      }
    };
    checkStatus();
    const interval = setInterval(checkStatus, 4000);
    return () => clearInterval(interval);
  }, []);

  const getPageTitle = () => {
    const active = navItems.find(item => item.path === location.pathname);
    return active ? active.label : 'SoilSense Platform';
  };

  const handleSwitchRole = async (role) => {
    setUserDropdownOpen(false);
    await switchDemo(role);
  };

  const handleSwitchUser = async (emailOrId) => {
    setUserDropdownOpen(false);
    await switchToUser(emailOrId);
  };

  // Sign out current account:
  // If another account is logged in: automatically switch to that other account!
  // If no other account remains: redirect directly to sign in page.
  const handleSignOutCurrent = () => {
    setUserDropdownOpen(false);
    const res = signOutAccount(user?.email || user?._id);
    if (!res.remaining) {
      navigate('/login');
    }
  };

  // Sign out a specific inactive account from the logged-in accounts list
  const handleSignOutOther = (emailOrId) => {
    signOutAccount(emailOrId);
  };

  return (
    <div className="app-container">
      
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}><Sprout size={24} color="#10b981" /></div>
          <div>
            <div className="sidebar-brand">{lang === 'hi' ? 'मृदा-सेंस प्रो' : 'SoilSense Pro'}</div>
            <div className="sidebar-sub">{lang === 'hi' ? 'सटीक मृदा एवं फसल सलाहकार' : 'Precision Soil & Crop Platform'}</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item, idx) => {
            if (item.section) {
              return (
                <div key={idx} className="nav-section-title">
                  {item.section}
                </div>
              );
            }
            const IconComponent = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                end={item.path === '/'}
              >
                <IconComponent size={18} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <div>NIT Delhi • CSE 3rd Sem</div>
          <div style={{ color: 'var(--primary-400)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#4ade80' }}></span>
            <span>{lang === 'hi' ? 'सिस्टम सक्रिय (ऑनलाइन)' : 'System Online (Active)'}</span>
          </div>
        </div>
      </aside>

      <div className="main-content">
        <header className="top-bar">
          <h1 className="top-bar-title">{getPageTitle()}</h1>

          <div className="top-bar-actions" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                backgroundColor: '#f1f5f9',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                padding: '2px',
                gap: '2px'
              }}
            >
              <button
                type="button"
                onClick={() => lang !== 'hi' && toggleLanguage()}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '5px 10px',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: lang === 'hi' ? '#166534' : 'transparent',
                  color: lang === 'hi' ? '#ffffff' : '#64748b',
                  fontWeight: lang === 'hi' ? '700' : '600',
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                
                <span>हिन्दी</span>
              </button>
              <button
                type="button"
                onClick={() => lang !== 'en' && toggleLanguage()}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '5px 10px',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: lang === 'en' ? '#1e293b' : 'transparent',
                  color: lang === 'en' ? '#ffffff' : '#64748b',
                  fontWeight: lang === 'en' ? '700' : '600',
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                
                <span>English</span>
              </button>
            </div>

            {iotConnected ? (
              <div className="badge badge-suitable" style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#16a34a' }}></span>
                <span style={{ fontWeight: '700', fontSize: '0.78rem' }}>
                  {lang === 'hi' ? 'हार्डवेयर ऑनलाइन (A0 पिन सक्रिय)' : 'Hardware Online (Streaming A0/A1)'}
                </span>
              </div>
            ) : (
              <div className="badge badge-lab" style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#d97706' }}></span>
                <span style={{ fontWeight: '600', fontSize: '0.78rem' }}>
                  {lang === 'hi' ? 'हार्डवेयर स्टैंडबाई (USB प्रतीक्षारत)' : 'Hardware Standby (Awaiting USB)'}
                </span>
              </div>
            )}

            {user ? (
              <div style={{ position: 'relative' }}>
                <button
                  type="button"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-light)',
                    backgroundColor: 'var(--bg-surface)',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--primary-100)',
                    color: 'var(--primary-800)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: '800',
                    fontSize: '0.8rem'
                  }}>
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div style={{ textAlign: 'left', lineHeight: '1.2' }}>
                    <div style={{ fontSize: '0.84rem', fontWeight: '700', color: 'var(--primary-900)' }}>
                      {user?.name || (lang === 'hi' ? 'उपयोगकर्ता' : 'User')}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      {(user?.role === 'agronomist' ? (lang === 'hi' ? 'कृषि विशेषज्ञ' : 'Agronomist') : user?.role === 'student' ? (lang === 'hi' ? 'छात्र' : 'Student') : (lang === 'hi' ? 'किसान' : 'Farmer')).toUpperCase()} • {lang === 'hi' ? (user?.district === 'Ludhiana' ? 'लुधियाना' : user?.district || 'लुधियाना') : (user?.district || 'Ludhiana')}
                    </div>
                  </div>
                  <ChevronDown size={14} color="var(--text-muted)" />
                </button>

                {userDropdownOpen && (
                  <div style={{
                    position: 'absolute',
                    top: '105%',
                    right: 0,
                    width: '320px',
                    maxHeight: '480px',
                    overflowY: 'auto',
                    backgroundColor: '#ffffff',
                    border: '1px solid var(--border-light)',
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
                    padding: '12px',
                    zIndex: 100,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px'
                  }}>
                    
                    <div style={{
                      padding: '10px 12px',
                      backgroundColor: '#f0fdf4',
                      border: '1px solid #bbf7d0',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                          width: '34px',
                          height: '34px',
                          borderRadius: '50%',
                          backgroundColor: '#059669',
                          color: '#ffffff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: '800',
                          fontSize: '0.9rem'
                        }}>
                          {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <div>
                          <div style={{ fontSize: '0.85rem', fontWeight: '800', color: 'var(--primary-900)' }}>
                            {user?.name || (lang === 'hi' ? 'उपयोगकर्ता' : 'User')}
                          </div>
                          <div style={{ fontSize: '0.74rem', color: '#166534' }}>
                            {user?.email || ''}
                          </div>
                        </div>
                      </div>
                      <span style={{
                        fontSize: '0.68rem',
                        fontWeight: '700',
                        color: '#047857',
                        backgroundColor: '#d1fae5',
                        padding: '2px 8px',
                        borderRadius: '10px'
                      }}>
                        {lang === 'hi' ? 'सक्रिय' : 'Active'}
                      </span>
                    </div>

                    <div>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '4px 6px',
                        fontSize: '0.74rem',
                        color: 'var(--text-muted)',
                        fontWeight: '800',
                        letterSpacing: '0.5px'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Users size={12} />
                          <span>{lang === 'hi' ? 'अन्य लॉग-इन खाते' : 'OTHER LOGGED-IN ACCOUNTS'}</span>
                        </div>
                        <span style={{ backgroundColor: 'var(--bg-subtle)', padding: '1px 6px', borderRadius: '8px', fontSize: '0.7rem' }}>
                          {(sessions || []).filter(acc => (acc.email || '').toLowerCase() !== (user?.email || '').toLowerCase()).length}
                        </span>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '6px', maxHeight: '180px', overflowY: 'auto' }}>
                        {(sessions || []).filter(acc => (acc.email || '').toLowerCase() !== (user?.email || '').toLowerCase()).length > 0 ? (
                          (sessions || [])
                            .filter(acc => (acc.email || '').toLowerCase() !== (user?.email || '').toLowerCase())
                            .map((acc) => (
                              <div
                                key={acc._id || acc.email}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  padding: '8px 10px',
                                  borderRadius: '8px',
                                  border: '1px solid var(--border-light)',
                                  backgroundColor: '#ffffff',
                                  gap: '8px'
                                }}
                              >
                                <div
                                  onClick={() => handleSwitchUser(acc.email || acc._id)}
                                  style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', flex: 1, minWidth: 0 }}
                                >
                                  <div style={{
                                    width: '28px',
                                    height: '28px',
                                    borderRadius: '50%',
                                    backgroundColor: acc.role === 'agronomist' ? '#fed7aa' : acc.role === 'student' ? '#bfdbfe' : '#bbf7d0',
                                    color: acc.role === 'agronomist' ? '#9a3412' : acc.role === 'student' ? '#1d4ed8' : '#166534',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontWeight: '800',
                                    fontSize: '0.76rem',
                                    flexShrink: 0
                                  }}>
                                    {acc.name?.charAt(0).toUpperCase() || 'U'}
                                  </div>
                                  <div style={{ overflow: 'hidden' }}>
                                    <div style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--primary-900)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                                      {acc.name}
                                    </div>
                                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                                      {acc.email}
                                    </div>
                                  </div>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                                  <button
                                    type="button"
                                    onClick={() => handleSwitchUser(acc.email || acc._id)}
                                    style={{
                                      fontSize: '0.68rem',
                                      fontWeight: '700',
                                      color: 'var(--primary-800)',
                                      backgroundColor: '#dcfce7',
                                      padding: '3px 8px',
                                      borderRadius: '6px',
                                      border: 'none',
                                      cursor: 'pointer'
                                    }}
                                  >
                                    {lang === 'hi' ? 'स्विच करें →' : 'Switch →'}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleSignOutOther(acc.email || acc._id)}
                                    title={lang === 'hi' ? 'यह खाता लॉग-आउट करें' : 'Sign out this account'}
                                    style={{
                                      padding: '3px 6px',
                                      backgroundColor: '#f1f5f9',
                                      color: '#64748b',
                                      border: '1px solid #e2e8f0',
                                      borderRadius: '6px',
                                      cursor: 'pointer',
                                      fontSize: '0.68rem',
                                      fontWeight: '600'
                                    }}
                                  >
                                    {lang === 'hi' ? 'लॉग-आउट' : 'Sign out'}
                                  </button>
                                </div>
                              </div>
                            ))
                        ) : (
                          <div style={{ padding: '8px', fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                            {lang === 'hi' ? 'कोई अन्य खाता लॉग-इन नहीं है।' : 'No other accounts currently logged in.'}
                          </div>
                        )}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        onClick={() => { setUserDropdownOpen(false); navigate('/register'); }}
                        className="btn btn-outline btn-sm"
                        style={{
                          flex: 1,
                          fontSize: '0.76rem',
                          padding: '6px 8px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          borderColor: '#cbd5e1'
                        }}
                      >
                        <UserPlus size={13} />
                        <span>{lang === 'hi' ? '+ नया खाता जोड़ें' : '+ Add New ID'}</span>
                      </button>

                      <button
                        onClick={() => { setUserDropdownOpen(false); navigate('/login'); }}
                        className="btn btn-outline btn-sm"
                        style={{
                          flex: 1,
                          fontSize: '0.76rem',
                          padding: '6px 8px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          borderColor: '#cbd5e1'
                        }}
                      >
                        <LogIn size={13} />
                        <span>{lang === 'hi' ? 'अन्य में साइन-इन करें' : 'Sign In Another'}</span>
                      </button>
                    </div>

                    <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '8px' }}>
                      <div style={{ padding: '2px 6px 6px 6px', fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: '800' }}>
                        {lang === 'hi' ? 'त्वरित डेमो प्रोफाइल चयन' : 'ONE-CLICK DEMO EVALUATOR PROFILES'}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <button
                          onClick={() => handleSwitchRole('farmer')}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '6px 8px',
                            borderRadius: '6px',
                            border: 'none',
                            backgroundColor: user.email === 'farmer@soilsense.in' ? '#f0fdf4' : 'transparent',
                            color: user.email === 'farmer@soilsense.in' ? '#166534' : 'var(--text-primary)',
                            cursor: 'pointer',
                            textAlign: 'left',
                            fontSize: '0.78rem'
                          }}
                        >
                          
                          <div>
                            <strong>Ramesh Kumar</strong> <span style={{ color: 'var(--text-muted)' }}>({lang === 'hi' ? 'किसान • लुधियाना' : 'Farmer • Ludhiana'})</span>
                          </div>
                        </button>

                        <button
                          onClick={() => handleSwitchRole('agronomist')}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '6px 8px',
                            borderRadius: '6px',
                            border: 'none',
                            backgroundColor: user.email === 'agronomist@soilsense.in' ? '#fff7ed' : 'transparent',
                            color: user.email === 'agronomist@soilsense.in' ? '#9a3412' : 'var(--text-primary)',
                            cursor: 'pointer',
                            textAlign: 'left',
                            fontSize: '0.78rem'
                          }}
                        >
                          
                          <div>
                            <strong>Dr. Preeti Sharma</strong> <span style={{ color: 'var(--text-muted)' }}>({lang === 'hi' ? 'कृषि विशेषज्ञ • PAU' : 'Agronomist • PAU'})</span>
                          </div>
                        </button>

                        <button
                          onClick={() => handleSwitchRole('student')}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '6px 8px',
                            borderRadius: '6px',
                            border: 'none',
                            backgroundColor: user.email === 'student@nitdelhi.ac.in' ? '#eff6ff' : 'transparent',
                            color: user.email === 'student@nitdelhi.ac.in' ? '#1d4ed8' : 'var(--text-primary)',
                            cursor: 'pointer',
                            textAlign: 'left',
                            fontSize: '0.78rem'
                          }}
                        >
                          
                          <div>
                            <strong>Rahul Verma</strong> <span style={{ color: 'var(--text-muted)' }}>({lang === 'hi' ? 'NIT दिल्ली छात्र' : 'NIT Delhi Student'})</span>
                          </div>
                        </button>
                      </div>
                    </div>

                    <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '8px' }}>
                      <button
                        type="button"
                        onClick={handleSignOutCurrent}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          padding: '8px',
                          borderRadius: '6px',
                          border: '1px solid #fecaca',
                          backgroundColor: '#fef2f2',
                          color: '#dc2626',
                          cursor: 'pointer',
                          width: '100%',
                          fontSize: '0.8rem',
                          fontWeight: '700'
                        }}
                      >
                        <LogOut size={14} />
                        <span>{lang === 'hi' ? 'वर्तमान खाते से लॉग-आउट करें' : 'Sign Out of Current Account'}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="btn btn-secondary btn-sm">
                <User size={14} />
                <span>{lang === 'hi' ? 'साइन इन' : 'Sign In'}</span>
              </Link>
            )}

            <Link to="/test-your-soil" className="btn btn-primary btn-sm">
              <Plus size={14} />
              <span>{lang === 'hi' ? 'मृदा परीक्षण' : 'Test Soil'}</span>
            </Link>
          </div>
        </header>

        <main className="page-wrapper">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
