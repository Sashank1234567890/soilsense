import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import SeasonSuitabilityAdvisory from '../components/SeasonSuitabilityAdvisory';
import {
  MapPin,
  Plus,
  Bell,
  Calendar,
  Layers,
  Sprout,
  ShieldCheck,
  CheckCircle,
  AlertTriangle,
  Siren,
  Trash2,
  Settings,
  ArrowRight,
  RefreshCw,
  Phone,
  Volume2,
  Check,
  Compass,
  Droplets,
  Cpu,
  Wifi,
  WifiOff
} from 'lucide-react';

export default function FarmManagement() {
  const { lang, t, speak } = useLanguage();
  const navigate = useNavigate();

  const [farms, setFarms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showNotifModal, setShowNotifModal] = useState(false);
  const [selectedFarmForNotif, setSelectedFarmForNotif] = useState(null);
  const [successToast, setSuccessToast] = useState('');

  // Add Farm Form State
  const [name, setName] = useState('');
  const [district, setDistrict] = useState('Ludhiana');
  const [state, setState] = useState('Punjab');
  const [acreage, setAcreage] = useState(2.5);
  const [cropName, setCropName] = useState('Wheat');
  const [variety, setVariety] = useState('PBW 725');
  const [sowingDate, setSowingDate] = useState('2026-10-27');
  const [soilType, setSoilType] = useState('Loamy');
  const [assignedDeviceId, setAssignedDeviceId] = useState('DEVICE_001');
  const [submittingFarm, setSubmittingFarm] = useState(false);

  // Notification Config State
  const [selectedFarmDeviceId, setSelectedFarmDeviceId] = useState('DEVICE_001');
  const [notifConfig, setNotifConfig] = useState({
    enabled: true,
    criticalMoisture: true,
    criticalThreshold: 24,
    soonerMoisture: true,
    soonerThreshold: 40,
    rainDelay: true,
    hypoxiaWarning: true,
    stageTransition: true,
    voiceAlert: true,
    smsAlert: true,
    phoneNumber: '+91 98765 43210'
  });
  const [savingNotif, setSavingNotif] = useState(false);

  // Fetch all farms summary
  const fetchFarms = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const res = await axios.get('/api/advisory/farms');
      if (res.data?.success && res.data?.data) {
        setFarms(res.data.data);
      }
    } catch (err) {
      if (!silent) console.error('Fetch farms error:', err);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchFarms(false);
    // Real-time auto-synchronization: poll farms every 3 seconds so all farms assigned to Arduino update automatically
    const interval = setInterval(() => {
      fetchFarms(true);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Handle Add New Farm
  const handleAddFarmSubmit = async (e) => {
    e.preventDefault();
    setSubmittingFarm(true);
    try {
      const res = await axios.post('/api/advisory/farms', {
        name,
        district,
        state,
        acreage: +acreage,
        cropName,
        variety,
        sowingDate,
        soilType,
        assignedDeviceId
      });

      if (res.data?.success) {
        setShowAddModal(false);
        setName('');
        setSuccessToast(
          lang === 'hi'
            ? `नया खेत सफलता से जोड़ा गया! (${res.data.data?.plot?.plotId})`
            : `New Farm successfully added! (${res.data.data?.plot?.plotId})`
        );
        fetchFarms();
      }
    } catch (err) {
      console.error('Add farm failed:', err);
      alert(lang === 'hi' ? 'खेत जोड़ने में त्रुटि आई।' : 'Error creating farm.');
    } finally {
      setSubmittingFarm(false);
    }
  };

  // Open Notification Config Modal for specific farm
  const handleOpenNotifModal = (farm) => {
    setSelectedFarmForNotif(farm);
    setSelectedFarmDeviceId(farm.assignedDeviceId || (farm.hasLiveDevice === false ? 'NONE' : 'DEVICE_001'));
    const existing = farm.notifications || {};
    setNotifConfig({
      enabled: existing.enabled !== false,
      criticalMoisture: existing.criticalMoisture !== false,
      criticalThreshold: existing.criticalThreshold || 24,
      soonerMoisture: existing.soonerMoisture !== false,
      soonerThreshold: existing.soonerThreshold || 40,
      rainDelay: existing.rainDelay !== false,
      hypoxiaWarning: existing.hypoxiaWarning !== false,
      stageTransition: existing.stageTransition !== false,
      voiceAlert: existing.voiceAlert !== false,
      smsAlert: existing.smsAlert !== false,
      phoneNumber: existing.phoneNumber || '+91 98765 43210'
    });
    setShowNotifModal(true);
  };

  // Save Notification Config
  const handleSaveNotifications = async (e) => {
    e.preventDefault();
    if (!selectedFarmForNotif) return;
    setSavingNotif(true);
    try {
      const res = await axios.post('/api/advisory/farm-notifications', {
        plotId: selectedFarmForNotif.plotId,
        notifications: notifConfig,
        assignedDeviceId: selectedFarmDeviceId
      });
      if (res.data?.success) {
        setShowNotifModal(false);
        setSuccessToast(
          lang === 'hi'
            ? `${selectedFarmForNotif.name} के लिए अलर्ट व डिवाइस सेटिंग्स अपडेट हो गईं!`
            : `Alert notifications and device updated for ${selectedFarmForNotif.name}!`
        );
        fetchFarms();
      }
    } catch (err) {
      console.error('Save notifications error:', err);
      alert(lang === 'hi' ? 'अलर्ट अपडेट करने में त्रुटि आई।' : 'Error updating notification settings.');
    } finally {
      setSavingNotif(false);
    }
  };

  // Delete Farm
  const handleDeleteFarm = async (plotId) => {
    if (!window.confirm(lang === 'hi' ? 'क्या आप इस खेत को हटाना चाहते हैं?' : 'Are you sure you want to delete this farm?')) return;
    try {
      await axios.delete(`/api/advisory/farms/${plotId}`);
      setSuccessToast(lang === 'hi' ? 'खेत हटा दिया गया।' : 'Farm deleted.');
      fetchFarms();
    } catch (e) {
      alert(e.response?.data?.error || 'Error deleting farm');
    }
  };

  const totalAcres = farms.reduce((acc, f) => acc + (f.areaAcres || 0), 0);
  const activeCropsCount = new Set(farms.map(f => f.currentCrop)).size;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px 16px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#1b4332', display: 'flex', alignItems: 'center', gap: '12px', margin: 0 }}>
            <MapPin size={30} color="#2d6a4f" />
            {lang === 'hi' ? 'मल्टी-खेत व फसल प्रबंधन हब' : 'Multi-Farm & Crop Management Hub'}
          </h1>
          <p style={{ color: '#4b5563', margin: '6px 0 0 0', fontSize: '15px' }}>
            {lang === 'hi'
              ? 'किसान के कई खेतों (Plots) और विभिन्न फसलों का एक साथ प्रबंधन, बुवाई-कटाई निगरानी व कस्टमाइज़्ड अलर्ट सेटिंग्स'
              : 'Manage multiple agricultural plots, independent crop cycles, and custom real-time soil moisture and rain alerts.'}
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: '#16a34a',
            color: '#fff',
            border: 'none',
            padding: '10px 18px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: '700',
            fontSize: '14px',
            boxShadow: '0 2px 8px rgba(22,163,74,0.25)'
          }}
        >
          <Plus size={18} />
          {lang === 'hi' ? '+ नया खेत जोड़ें' : '+ Add New Farm'}
        </button>
      </div>

      {/* Success Toast */}
      {successToast && (
        <div style={{
          backgroundColor: '#ecfdf5',
          border: '1.5px solid #10b981',
          borderRadius: '8px',
          padding: '12px 16px',
          marginBottom: '20px',
          color: '#065f46',
          fontWeight: '700',
          fontSize: '14px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <Check size={18} color="#059669" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Farm Metrics Summary Bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '28px' }}>
        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '18px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>
            {lang === 'hi' ? 'कुल पंजीकृत खेत (Farms)' : 'Total Registered Farms'}
          </div>
          <div style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a', marginTop: '4px' }}>
            {farms.length} <span style={{ fontSize: '14px', fontWeight: '600', color: '#64748b' }}>{lang === 'hi' ? 'खेत' : 'Plots'}</span>
          </div>
        </div>

        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '18px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>
            {lang === 'hi' ? 'कुल जोत रकबा (Total Area)' : 'Total Cultivated Land'}
          </div>
          <div style={{ fontSize: '28px', fontWeight: '800', color: '#166534', marginTop: '4px' }}>
            {totalAcres.toFixed(1)} <span style={{ fontSize: '14px', fontWeight: '600', color: '#64748b' }}>{lang === 'hi' ? 'एकड़' : 'Acres'}</span>
          </div>
        </div>

        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '18px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>
            {lang === 'hi' ? 'विविध सक्रिय फसलें' : 'Diverse Crops Growing'}
          </div>
          <div style={{ fontSize: '28px', fontWeight: '800', color: '#2563eb', marginTop: '4px' }}>
            {activeCropsCount} <span style={{ fontSize: '14px', fontWeight: '600', color: '#64748b' }}>{lang === 'hi' ? 'प्रकार' : 'Varieties'}</span>
          </div>
        </div>

        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '18px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>
            {lang === 'hi' ? 'स्मार्ट अलर्ट स्थिति' : 'Smart Notification System'}
          </div>
          <div style={{ fontSize: '18px', fontWeight: '800', color: '#047857', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ShieldCheck size={20} color="#10b981" />
            <span>{lang === 'hi' ? '100% सक्रिय' : 'Active & Armed'}</span>
          </div>
        </div>
      </div>

      {/* Farms List Cards Grid */}
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '19px', fontWeight: '800', color: '#0f172a', marginBottom: '16px' }}>
          {lang === 'hi' ? 'खेत एवं सक्रिय फसल सूची' : 'Your Farms & Active Crops'}
        </h2>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
            <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 8px auto' }} />
            <div>{lang === 'hi' ? 'खेत लोड हो रहे हैं...' : 'Loading farms...'}</div>
          </div>
        ) : farms.length === 0 ? (
          <div style={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '32px', textAlign: 'center' }}>
            <p style={{ color: '#64748b', fontSize: '15px' }}>{lang === 'hi' ? 'कोई खेत नहीं मिला।' : 'No farms found.'}</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
            {farms.map((farm) => {
              const alertData = farm.alert;
              const isCrit = alertData?.alertLevel === 'CRITICAL_HIGH_RISK';
              const isSoon = alertData?.alertLevel === 'SOONER_NOTICE';
              const isRain = alertData?.alertLevel === 'RAIN_SUPPRESSED';
              const isHarv = alertData?.alertLevel === 'HARVEST_ALERT';

              return (
                <div
                  key={farm.plotId}
                  style={{
                    backgroundColor: '#ffffff',
                    border: '1.5px solid #e2e8f0',
                    borderRadius: '14px',
                    padding: '22px',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.04)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                  }}
                >
                  <div>
                    {/* Top Farm Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                      <div>
                        <span style={{
                          backgroundColor: '#f1f5f9',
                          color: '#475569',
                          fontSize: '11px',
                          fontWeight: '800',
                          padding: '2px 8px',
                          borderRadius: '6px'
                        }}>
                          {farm.plotId}
                        </span>
                        <h3 style={{ fontSize: '17px', fontWeight: '800', color: '#0f172a', margin: '6px 0 2px 0' }}>
                          {farm.name}
                        </h3>
                        <div style={{ fontSize: '13px', color: '#64748b' }}>
                          {farm.location?.district}, {farm.location?.state} • <strong>{farm.areaAcres} {lang === 'hi' ? 'एकड़' : 'Acres'}</strong>
                        </div>
                        <div style={{ marginTop: '6px', display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' }}>
                          <span style={{ backgroundColor: '#ecfdf5', color: '#166534', border: '1px solid #bbf7d0', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '700' }}>
                            {lang === 'hi' ? '100% समर्पित एकल फसल' : '100% Dedicated Single Crop'}
                          </span>
                          <span style={{
                            backgroundColor: farm.hasLiveDevice ? '#eff6ff' : '#f8fafc',
                            color: farm.hasLiveDevice ? '#1d4ed8' : '#64748b',
                            border: `1px solid ${farm.hasLiveDevice ? '#bfdbfe' : '#cbd5e1'}`,
                            padding: '2px 8px',
                            borderRadius: '4px',
                            fontSize: '11px',
                            fontWeight: '700',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}>
                            {farm.hasLiveDevice ? (
                              <>
                                <Cpu size={11} />
                                <span>{lang === 'hi' ? 'डिवाइस 1 (Arduino USB)' : 'Device 1 (Arduino USB)'}</span>
                              </>
                            ) : (
                              <>
                                <WifiOff size={11} />
                                <span>{lang === 'hi' ? 'केवल टाइमलाइन' : 'Timeline Only'}</span>
                              </>
                            )}
                          </span>
                          {farm.seasonSuitability && (
                            <span style={{
                              backgroundColor: farm.seasonSuitability.isOptimal ? '#dcfce7' : '#fee2e2',
                              color: farm.seasonSuitability.isOptimal ? '#166534' : '#991b1b',
                              border: `1px solid ${farm.seasonSuitability.isOptimal ? '#86efac' : '#fca5a5'}`,
                              padding: '2px 8px',
                              borderRadius: '4px',
                              fontSize: '11px',
                              fontWeight: '800'
                            }}>
                              {farm.seasonSuitability.isOptimal
                                ? (lang === 'hi' ? 'उत्तम सीज़न' : 'Ideal Season')
                                : (lang === 'hi' ? 'असामयिक चेतावनी' : 'Off-Season Warning')}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Notification Quick Status */}
                      <button
                        onClick={() => handleOpenNotifModal(farm)}
                        title={lang === 'hi' ? 'इस खेत के अलर्ट नियम सेट करें' : 'Configure notifications for this farm'}
                        style={{
                          backgroundColor: farm.notifications?.enabled ? '#ecfdf5' : '#f1f5f9',
                          border: `1px solid ${farm.notifications?.enabled ? '#a7f3d0' : '#cbd5e1'}`,
                          color: farm.notifications?.enabled ? '#047857' : '#64748b',
                          padding: '6px 10px',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          fontSize: '12px',
                          fontWeight: '700'
                        }}
                      >
                        <Bell size={14} />
                        <span>{farm.notifications?.enabled ? (lang === 'hi' ? 'अलर्ट चालू' : 'Alerts ON') : (lang === 'hi' ? 'अलर्ट बंद' : 'Alerts OFF')}</span>
                      </button>
                    </div>

                    {/* Crop & Lifecycle Strip */}
                    <div style={{
                      backgroundColor: '#f8fafc',
                      borderRadius: '10px',
                      padding: '12px 14px',
                      margin: '14px 0',
                      border: '1px solid #e2e8f0'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Sprout size={16} color="#16a34a" />
                          <strong style={{ fontSize: '14px', color: '#0f172a' }}>{farm.currentCrop}</strong>
                          <span style={{ fontSize: '12px', color: '#64748b' }}>({farm.variety})</span>
                        </div>
                        <span style={{
                          backgroundColor: '#ecfdf5',
                          color: '#065f46',
                          fontSize: '11px',
                          fontWeight: '800',
                          padding: '2px 8px',
                          borderRadius: '10px'
                        }}>
                          Day {farm.das} / {farm.totalDurationDays}
                        </span>
                      </div>

                      <div style={{ fontSize: '12px', color: '#475569', marginBottom: '8px' }}>
                        {lang === 'hi' ? 'अवस्था:' : 'Stage:'} <strong>{farm.currentStage?.stageName}</strong>
                      </div>

                      {/* Mini Progress Bar */}
                      <div style={{ width: '100%', height: '6px', backgroundColor: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{
                          width: `${farm.lifecycleProgressPercent || 20}%`,
                          height: '100%',
                          backgroundColor: '#16a34a'
                        }}></div>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#64748b', marginTop: '6px' }}>
                        <span>{lang === 'hi' ? 'कटाई शेष:' : 'Harvest in:'} <strong>{farm.daysRemainingUntilHarvest} {lang === 'hi' ? 'दिन' : 'days'}</strong></span>
                        <span>{new Date(farm.expectedHarvestDate).toLocaleDateString(lang === 'hi' ? 'hi-IN' : 'en-IN', { day: 'numeric', month: 'short' })}</span>
                      </div>
                    </div>

                    {/* Live Condition & Alert Badge */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      backgroundColor: !farm.hasLiveDevice ? '#f8fafc' : isCrit ? '#fef2f2' : isSoon ? '#fffbeb' : isRain ? '#eff6ff' : isHarv ? '#fff7ed' : '#f0fdf4',
                      border: `1px solid ${!farm.hasLiveDevice ? '#cbd5e1' : isCrit ? '#fca5a5' : isSoon ? '#fde68a' : isRain ? '#bfdbfe' : isHarv ? '#fdba74' : '#bbf7d0'}`,
                      marginBottom: '14px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {!farm.hasLiveDevice ? (
                          <>
                            <WifiOff size={16} color="#64748b" />
                            <span style={{ fontSize: '13px', fontWeight: '700', color: '#475569' }}>
                              {lang === 'hi' ? 'लाइव डिवाइस अनुपलब्ध' : 'No Live Device'}
                            </span>
                          </>
                        ) : (
                          <>
                            <Droplets size={16} color={isCrit ? '#dc2626' : isSoon ? '#d97706' : '#16a34a'} />
                            <span style={{ fontSize: '13px', fontWeight: '700', color: '#1f2937' }}>
                              {lang === 'hi' ? `नमी: ${farm.currentMoisture}%` : `Moisture: ${farm.currentMoisture}%`}
                            </span>
                          </>
                        )}
                      </div>

                      <span style={{
                        fontSize: '11px',
                        fontWeight: '800',
                        color: !farm.hasLiveDevice ? '#475569' : isCrit ? '#b91c1c' : isSoon ? '#b45309' : isRain ? '#1d4ed8' : isHarv ? '#c2410c' : '#15803d'
                      }}>
                        {!farm.hasLiveDevice ? (lang === 'hi' ? 'केवल समय-सीमा' : 'TIMELINE ONLY') : isCrit ? 'CRITICAL WILTING' : isSoon ? 'SOONER NOTICE' : isRain ? 'RAIN GUARD' : isHarv ? 'READY TO CUT' : 'OPTIMAL'}
                      </span>
                    </div>
                  </div>

                  {/* Card Bottom Actions */}
                  <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid #f1f5f9', paddingTop: '12px' }}>
                    <button
                      onClick={() => navigate(`/crop-schedule?plotId=${farm.plotId}`)}
                      style={{
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        padding: '8px 12px',
                        backgroundColor: '#1b4332',
                        color: '#fff',
                        borderRadius: '6px',
                        border: 'none',
                        fontSize: '12px',
                        fontWeight: '700',
                        cursor: 'pointer'
                      }}
                    >
                      <span>{lang === 'hi' ? 'इस फसल में जाएं (प्रबंधन)' : 'Enter & Manage Crop'}</span>
                      <ArrowRight size={14} />
                    </button>

                    <button
                      onClick={() => handleOpenNotifModal(farm)}
                      title={lang === 'hi' ? 'अलर्ट नियम बदलें' : 'Configure Notifications'}
                      style={{
                        padding: '8px 10px',
                        backgroundColor: '#f8fafc',
                        border: '1px solid #cbd5e1',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        color: '#475569'
                      }}
                    >
                      <Settings size={15} />
                    </button>

                    {farm.plotId !== 'PLOT_001' && (
                      <button
                        onClick={() => handleDeleteFarm(farm.plotId)}
                        title={lang === 'hi' ? 'खेत हटाएं' : 'Delete farm'}
                        style={{
                          padding: '8px 10px',
                          backgroundColor: '#fef2f2',
                          border: '1px solid #fecaca',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          color: '#dc2626'
                        }}
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* MODAL 1: ADD NEW FARM */}
      {showAddModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '16px'
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '14px',
            padding: '24px',
            maxWidth: '520px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              <Plus size={24} color="#16a34a" />
              <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                {lang === 'hi' ? 'नया खेत जोड़ें (Add New Farm / Plot)' : 'Add New Farm / Plot'}
              </h3>
            </div>
            <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 16px 0' }}>
              {lang === 'hi'
                ? 'नया खेत जोड़ें और उसकी मुख्य फसल निर्धारित करें। यह पूरे सीज़न में अलग से ट्रैक होगा।'
                : 'Register a new agricultural plot with primary crop. Records track continuously with independent alert rules.'}
            </p>

            <form onSubmit={handleAddFarmSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                  {lang === 'hi' ? 'खेत का नाम (Farm Name)' : 'Farm Name / Identifier'}
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={lang === 'hi' ? 'उदा. नहर वाला खेत - ब्लॉक B' : 'e.g., Canal Road Block B'}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                    {lang === 'hi' ? 'जिला (District)' : 'District'}
                  </label>
                  <input
                    type="text"
                    required
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                    {lang === 'hi' ? 'राज्य (State)' : 'State'}
                  </label>
                  <input
                    type="text"
                    required
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                    {lang === 'hi' ? 'क्षेत्रफल (Acreage)' : 'Acreage'}
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    value={acreage}
                    onChange={(e) => setAcreage(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                    {lang === 'hi' ? 'मृदा प्रकार (Soil Type)' : 'Soil Type'}
                  </label>
                  <select
                    value={soilType}
                    onChange={(e) => setSoilType(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', backgroundColor: '#fff' }}
                  >
                    <option value="Loamy">{lang === 'hi' ? 'दोमट (Loamy)' : 'Loamy'}</option>
                    <option value="Alluvial">{lang === 'hi' ? 'जलोढ़ (Alluvial)' : 'Alluvial'}</option>
                    <option value="Black">{lang === 'hi' ? 'काली (Black)' : 'Black'}</option>
                    <option value="Sandy">{lang === 'hi' ? 'बलुई (Sandy)' : 'Sandy'}</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                    {lang === 'hi' ? 'फसल का प्रकार' : 'Crop'}
                  </label>
                  <select
                    value={cropName}
                    onChange={(e) => setCropName(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', backgroundColor: '#fff' }}
                  >
                    <option value="Wheat">{lang === 'hi' ? 'गेहूं (Wheat)' : 'Wheat'}</option>
                    <option value="Mustard">{lang === 'hi' ? 'सरसों (Mustard)' : 'Mustard'}</option>
                    <option value="Rice">{lang === 'hi' ? 'बासमती धान (Rice)' : 'Rice (Basmati)'}</option>
                    <option value="Maize">{lang === 'hi' ? 'मक्का (Maize)' : 'Maize'}</option>
                    <option value="Cotton">{lang === 'hi' ? 'कपास (Cotton)' : 'Cotton'}</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                    {lang === 'hi' ? 'किस्म / वैरायटी' : 'Variety'}
                  </label>
                  <input
                    type="text"
                    value={variety}
                    onChange={(e) => setVariety(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                  {lang === 'hi' ? 'बुवाई तिथि (Sowing Date)' : 'Sowing Date'}
                </label>
                <input
                  type="date"
                  required
                  value={sowingDate}
                  onChange={(e) => setSowingDate(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                  {lang === 'hi' ? 'संबद्ध IoT डिवाइस (Arduino)' : 'Assigned IoT Device (Arduino)'}
                </label>
                <select
                  value={assignedDeviceId}
                  onChange={(e) => setAssignedDeviceId(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', backgroundColor: '#fff' }}
                >
                  <option value="DEVICE_001">{lang === 'hi' ? 'डिवाइस 1 (Arduino Uno USB कनेक्टेड)' : 'Device 1 (Arduino Uno USB Connected)'}</option>
                  <option value="NONE">{lang === 'hi' ? 'कोई डिवाइस नहीं (केवल समय-सीमा मोड)' : 'No Device (Timeline Tracking Only)'}</option>
                </select>
                <div style={{ fontSize: '11px', color: assignedDeviceId === 'NONE' ? '#ea580c' : '#64748b', marginTop: '3px' }}>
                  {assignedDeviceId === 'NONE'
                    ? (lang === 'hi' ? '⚠️ कोई डिवाइस कनेक्ट नहीं: केवल फसल समय-सीमा व विकास चरण ट्रैक होंगे, लाइव नमी अलर्ट नहीं मिलेंगे।' : '⚠️ No device: only timeline & stages tracked, no live moisture alerts.')
                    : (lang === 'hi' ? 'सजीव नमी व स्वचालित मोटर चेतावनी सक्रिय रहेगी।' : 'Real-time telemetry and automated motor alerts active.')}
                </div>
              </div>

              <SeasonSuitabilityAdvisory cropName={cropName} sowingDate={sowingDate} lang={lang} />

              <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  style={{
                    flex: 1,
                    padding: '10px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    backgroundColor: '#f8fafc',
                    color: '#475569',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  {lang === 'hi' ? 'रद्द करें' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={submittingFarm}
                  style={{
                    flex: 2,
                    padding: '10px',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: '#16a34a',
                    color: '#ffffff',
                    fontWeight: '700',
                    cursor: 'pointer'
                  }}
                >
                  {submittingFarm ? (lang === 'hi' ? 'जोड़ा जा रहा है...' : 'Adding...') : (lang === 'hi' ? 'खेत सुरक्षित करें' : 'Save Farm')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: CONFIGURE CROP NOTIFICATIONS */}
      {showNotifModal && selectedFarmForNotif && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '16px'
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '14px',
            padding: '24px',
            maxWidth: '520px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <Bell size={24} color="#059669" />
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                  {lang === 'hi' ? 'फसल अलर्ट व नोटिफिकेशन सेटिंग्स' : 'Crop Alert & Notification Rules'}
                </h3>
                <div style={{ fontSize: '12px', color: '#64748b' }}>
                  {selectedFarmForNotif.name} ({selectedFarmForNotif.currentCrop}) • {selectedFarmForNotif.plotId}
                </div>
              </div>
            </div>

            <form onSubmit={handleSaveNotifications} style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '16px' }}>
              {/* Hardware Device Selection */}
              <div style={{ backgroundColor: '#f0f9ff', border: '1.5px solid #bae6fd', borderRadius: '10px', padding: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                  <Cpu size={16} color="#0284c7" />
                  <label style={{ fontSize: '12px', fontWeight: '800', color: '#0369a1', textTransform: 'uppercase' }}>
                    {lang === 'hi' ? 'संबद्ध IoT हार्डवेयर डिवाइस (Arduino)' : 'Assigned IoT Hardware (Arduino)'}
                  </label>
                </div>
                <select
                  value={selectedFarmDeviceId}
                  onChange={(e) => setSelectedFarmDeviceId(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: '6px',
                    border: '1px solid #7dd3fc',
                    backgroundColor: '#ffffff',
                    fontSize: '13px',
                    fontWeight: '700',
                    color: '#0f172a'
                  }}
                >
                  <option value="DEVICE_001">{lang === 'hi' ? 'डिवाइस 1 (Arduino Uno USB कनेक्टेड)' : 'Device 1 (Arduino Uno USB Connected)'}</option>
                  <option value="NONE">{lang === 'hi' ? 'कोई डिवाइस नहीं (केवल समय-सीमा मोड)' : 'No Device (Timeline Tracking Only)'}</option>
                </select>

                {/* Warning when No Device selected */}
                {selectedFarmDeviceId === 'NONE' && (
                  <div style={{
                    backgroundColor: '#fff7ed',
                    border: '1.5px solid #fdba74',
                    borderRadius: '8px',
                    padding: '10px 12px',
                    marginTop: '10px',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '8px',
                    color: '#9a3412',
                    fontSize: '12px',
                    lineHeight: '1.5'
                  }}>
                    <WifiOff size={18} color="#ea580c" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <div>
                      <strong>{lang === 'hi' ? 'लाइव डिवाइस चेतावनी:' : 'No Device Notice:'}</strong>{' '}
                      {lang === 'hi'
                        ? 'इस खेत के लिए कोई लाइव डिवाइस कनेक्ट नहीं है। आप लाइव नमी अलर्ट सेट नहीं कर सकते — केवल फसल समय-सीमा एवं जीवनचक्र चरण (Crop Timeline & Growth Stages) ही ट्रैक किया जा सकता है।'
                        : 'No live Arduino device connected to this farm. You cannot set real-time moisture alerts — only crop timeline and lifecycle stages can be tracked.'}
                    </div>
                  </div>
                )}
              </div>

              {/* Master Toggle */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px',
                backgroundColor: notifConfig.enabled ? '#f0fdf4' : '#f8fafc',
                borderRadius: '8px',
                border: `1.5px solid ${notifConfig.enabled ? '#86efac' : '#cbd5e1'}`
              }}>
                <div>
                  <div style={{ fontWeight: '800', fontSize: '14px', color: '#0f172a' }}>
                    {lang === 'hi' ? 'इस खेत के लिए अलर्ट चालू रखें' : 'Enable Automated Alerts for this Farm'}
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>
                    {selectedFarmDeviceId === 'NONE'
                      ? (lang === 'hi' ? 'केवल समय-सीमा और अवस्था परिवर्तन सूचनाएं' : 'Timeline and crop stage transition alerts only')
                      : (lang === 'hi' ? 'नमी संकट और मौसम परिवर्तन पर त्वरित सूचना' : 'Real-time moisture stress and weather notifications')}
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={notifConfig.enabled}
                  onChange={(e) => setNotifConfig({ ...notifConfig, enabled: e.target.checked })}
                  style={{ width: '20px', height: '20px', accentColor: '#16a34a', cursor: 'pointer' }}
                />
              </div>

              {/* Threshold 1: Critical Wilting */}
              <div style={{
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '12px',
                opacity: selectedFarmDeviceId === 'NONE' ? 0.45 : 1
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label style={{ fontSize: '13px', fontWeight: '700', color: '#991b1b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Siren size={15} />
                    {lang === 'hi' ? 'अति-गंभीर जल संकट सायरन (Critical Siren)' : 'Critical Wilting Water Stress Alert'}
                  </label>
                  <span style={{ fontWeight: '800', color: '#991b1b' }}>&lt; {notifConfig.criticalThreshold}%</span>
                </div>
                <input
                  type="range"
                  min="15"
                  max="30"
                  disabled={selectedFarmDeviceId === 'NONE'}
                  value={notifConfig.criticalThreshold}
                  onChange={(e) => setNotifConfig({ ...notifConfig, criticalThreshold: +e.target.value })}
                  style={{ width: '100%', accentColor: '#dc2626', cursor: selectedFarmDeviceId === 'NONE' ? 'not-allowed' : 'pointer' }}
                />
                <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>
                  {selectedFarmDeviceId === 'NONE'
                    ? (lang === 'hi' ? '⚠️ लाइव डिवाइस न होने के कारण यह अलर्ट अक्षम है।' : '⚠️ Disabled without live Arduino device.')
                    : (lang === 'hi' ? 'नमी इस सीमा से कम होते ही तत्काल लाल सायरन और चेतावनी बजेगी' : 'Triggers urgent siren when capacitive probe dips below this threshold')}
                </div>
              </div>

              {/* Threshold 2: Sooner Notice */}
              <div style={{
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '12px',
                opacity: selectedFarmDeviceId === 'NONE' ? 0.45 : 1
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label style={{ fontSize: '13px', fontWeight: '700', color: '#92400e', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Bell size={15} />
                    {lang === 'hi' ? 'पूर्व सूचना सीमा (Sooner Early Notice)' : 'Sooner Depletion Advisory Threshold'}
                  </label>
                  <span style={{ fontWeight: '800', color: '#92400e' }}>&lt; {notifConfig.soonerThreshold}%</span>
                </div>
                <input
                  type="range"
                  min="30"
                  max="50"
                  disabled={selectedFarmDeviceId === 'NONE'}
                  value={notifConfig.soonerThreshold}
                  onChange={(e) => setNotifConfig({ ...notifConfig, soonerThreshold: +e.target.value })}
                  style={{ width: '100%', accentColor: '#d97706', cursor: selectedFarmDeviceId === 'NONE' ? 'not-allowed' : 'pointer' }}
                />
                <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>
                  {selectedFarmDeviceId === 'NONE'
                    ? (lang === 'hi' ? '⚠️ लाइव डिवाइस न होने के कारण यह अलर्ट अक्षम है।' : '⚠️ Disabled without live Arduino device.')
                    : (lang === 'hi' ? '24-36 घंटे पहले शांत सूचना देकर सिंचाई योजना बनाने में मदद करता है' : 'Early notice to plan irrigation 24-36 hours in advance')}
                </div>
              </div>

              {/* Toggles Group */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '13px',
                  color: '#334155',
                  cursor: selectedFarmDeviceId === 'NONE' ? 'not-allowed' : 'pointer',
                  opacity: selectedFarmDeviceId === 'NONE' ? 0.45 : 1
                }}>
                  <input
                    type="checkbox"
                    disabled={selectedFarmDeviceId === 'NONE'}
                    checked={notifConfig.rainDelay}
                    onChange={(e) => setNotifConfig({ ...notifConfig, rainDelay: e.target.checked })}
                    style={{ accentColor: '#2563eb' }}
                  />
                  <span>{lang === 'hi' ? 'बारिश होने पर सिंचाई रोक अलर्ट (Rain Guard Auto-Skip)' : 'Rain Guard: Auto-defer when rainfall forecasted > 5mm'}</span>
                </label>

                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '13px',
                  color: '#334155',
                  cursor: selectedFarmDeviceId === 'NONE' ? 'not-allowed' : 'pointer',
                  opacity: selectedFarmDeviceId === 'NONE' ? 0.45 : 1
                }}>
                  <input
                    type="checkbox"
                    disabled={selectedFarmDeviceId === 'NONE'}
                    checked={notifConfig.hypoxiaWarning}
                    onChange={(e) => setNotifConfig({ ...notifConfig, hypoxiaWarning: e.target.checked })}
                    style={{ accentColor: '#ea580c' }}
                  />
                  <span>{lang === 'hi' ? 'जलभराव व जड़ सड़न चेतावनी (Hypoxia Root-Rot > 80%)' : 'Root Hypoxia: Alert if moisture saturated > 80%'}</span>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#334155', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={notifConfig.stageTransition}
                    onChange={(e) => setNotifConfig({ ...notifConfig, stageTransition: e.target.checked })}
                    style={{ accentColor: '#16a34a' }}
                  />
                  <span>{lang === 'hi' ? 'फसल विकास अवस्था परिवर्तन व कटाई सूचना (समय-सारणी)' : 'Growth Phase Transition & Harvest Readiness Alert (Timeline)'}</span>
                </label>
              </div>

              {/* Channels (SMS & Voice) */}
              <div style={{ backgroundColor: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontWeight: '700', fontSize: '12px', color: '#475569', marginBottom: '8px', textTransform: 'uppercase' }}>
                  {lang === 'hi' ? 'अलर्ट डिलीवरी माध्यम (Channels)' : 'Notification Delivery Channels'}
                </div>

                <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', marginBottom: '8px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={notifConfig.voiceAlert}
                      onChange={(e) => setNotifConfig({ ...notifConfig, voiceAlert: e.target.checked })}
                      style={{ accentColor: '#059669' }}
                    />
                    <Volume2 size={15} color="#059669" />
                    <span>{lang === 'hi' ? 'ध्वनि/आवाज़ सायरन' : 'Audio Siren'}</span>
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={notifConfig.smsAlert}
                      onChange={(e) => setNotifConfig({ ...notifConfig, smsAlert: e.target.checked })}
                      style={{ accentColor: '#0284c7' }}
                    />
                    <Phone size={15} color="#0284c7" />
                    <span>{lang === 'hi' ? 'मोबाइल SMS सूचना' : 'SMS / WhatsApp'}</span>
                  </label>
                </div>

                {notifConfig.smsAlert && (
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#64748b', marginBottom: '4px' }}>
                      {lang === 'hi' ? 'मोबाइल नंबर (SMS हेतु)' : 'Mobile Phone Number for SMS'}
                    </label>
                    <input
                      type="text"
                      value={notifConfig.phoneNumber}
                      onChange={(e) => setNotifConfig({ ...notifConfig, phoneNumber: e.target.value })}
                      style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                    />
                  </div>
                )}
              </div>

              {/* Submit Buttons */}
              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowNotifModal(false)}
                  style={{
                    flex: 1,
                    padding: '10px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    backgroundColor: '#f8fafc',
                    color: '#475569',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  {lang === 'hi' ? 'रद्द करें' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={savingNotif}
                  style={{
                    flex: 2,
                    padding: '10px',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: '#059669',
                    color: '#ffffff',
                    fontWeight: '700',
                    cursor: 'pointer'
                  }}
                >
                  {savingNotif ? (lang === 'hi' ? 'सेव हो रहा है...' : 'Saving...') : (lang === 'hi' ? 'अलर्ट नियम सुरक्षित करें' : 'Save Alert Rules')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
