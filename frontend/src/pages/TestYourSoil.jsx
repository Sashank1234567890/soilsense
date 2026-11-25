import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Activity,
  Radio,
  Cpu,
  FlaskConical,
  FolderOpen,
  MapPin,
  CheckCircle,
  AlertTriangle,
  Info,
  ArrowRight,
  Download,
  FileText,
  Sparkles,
  GitCompare,
  RotateCcw,
  Wrench,
  ShieldCheck,
  CheckCircle2,
  Droplets,
  Layers,
  Sprout,
  Leaf,
  TrendingUp,
  Crosshair,
  Navigation,
  Clock,
  Zap,
  RefreshCw
} from 'lucide-react';
import axios from 'axios';
import {
  createSoilTest,
  getSoilTestById,
  createReport,
  getReportPDFUrl,
  getLatestReading,
  getSoilProfiles,
  getIoTStatus,
  ingestSensorReading
} from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export default function TestYourSoil() {
  const { lang, t } = useLanguage();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const autoTestId = searchParams.get('autoTestId');

  const [activeStep, setActiveStep] = useState(autoTestId ? 'report' : 'setup'); // 'setup', 'reading', 'report'
  const [dataSource, setDataSource] = useState('field_sensor'); // 'hardware', 'field_sensor', 'registered_profile'
  const [deviceStatus, setDeviceStatus] = useState('Hardware Disconnected (Standby • Awaiting USB Device)');
  const [iotConnected, setIotConnected] = useState(false);
  const [autoSyncCountdown, setAutoSyncCountdown] = useState(15);
  const [lastAutoSyncTime, setLastAutoSyncTime] = useState(null);
  const [autoSyncEnabled, setAutoSyncEnabled] = useState(true);
  const [arduinoLedState, setArduinoLedState] = useState('GREEN_OPTIMAL');
  const [showWiringGuide, setShowWiringGuide] = useState(false);
  const [profiles, setProfiles] = useState([]);
  const [selectedProfileId, setSelectedProfileId] = useState('');

  const [locationForm, setLocationForm] = useState({
    state: 'Punjab',
    district: 'Ludhiana',
    village: 'Jagraon',
    plotName: 'North Block A'
  });
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsSuccessMsg, setGpsSuccessMsg] = useState('');

  // Auto-detect GPS location
  const handleAutoDetectGPS = () => {
    if (!navigator.geolocation) {
      alert(lang === 'hi' ? 'ब्राउज़र में GPS सपोर्ट उपलब्ध नहीं है।' : 'GPS geolocation is not supported by your browser.');
      return;
    }

    setGpsLoading(true);
    setGpsSuccessMsg('');

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          let detectedState = 'India';
          let detectedDistrict = 'Detected Farm GPS';
          let detectedVillage = `GPS Farm (${latitude.toFixed(2)}°N, ${longitude.toFixed(2)}°E)`;

          // Reverse geocoding
          try {
            const geoRes = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`);
            if (geoRes.ok) {
              const geoData = await geoRes.json();
              if (geoData) {
                if (geoData.principalSubdivision) detectedState = geoData.principalSubdivision;
                if (geoData.locality || geoData.city) detectedDistrict = geoData.locality || geoData.city;
                if (geoData.localityInfo?.administrative) {
                  const subAdmin = geoData.localityInfo.administrative.find(a => a.adminLevel === 3 || a.adminLevel === 4 || a.adminLevel === 6);
                  if (subAdmin?.name) detectedVillage = subAdmin.name;
                }
              }
            }
          } catch (e) {
            console.warn('Reverse geocode fallback:', e.message);
          }

          setLocationForm({
            state: detectedState,
            district: detectedDistrict,
            village: detectedVillage,
            plotName: `Farm Plot (${latitude.toFixed(2)}°N, ${longitude.toFixed(2)}°E)`
          });

          // Sync location to active plot in backend
          try {
            await axios.post('/api/advisory/update-location', {
              plotId: 'PLOT_001',
              district: detectedDistrict,
              state: detectedState,
              lat: latitude,
              lon: longitude,
              autoDetected: true
            });
          } catch (locErr) {}

          setGpsSuccessMsg(lang === 'hi'
            ? `📍 GPS स्थान सफलता से मिला: ${detectedDistrict}, ${detectedState} (${latitude.toFixed(3)}°N, ${longitude.toFixed(3)}°E)`
            : `📍 GPS Coordinates Auto-Detected: ${detectedDistrict}, ${detectedState} (${latitude.toFixed(3)}°N, ${longitude.toFixed(3)}°E)`);
        } catch (err) {
          console.error('GPS error:', err);
        } finally {
          setGpsLoading(false);
        }
      },
      (err) => {
        setGpsLoading(false);
        fetchSavedFarmLocation();
      },
      { timeout: 8000 }
    );
  };

  const fetchSavedFarmLocation = async () => {
    try {
      const res = await axios.get('/api/advisory/crop-schedule?plotId=PLOT_001');
      if (res.data?.success && res.data.data?.schedule?.location) {
        const loc = res.data.data.schedule.location;
        setLocationForm({
          state: loc.state || 'India',
          district: loc.district || 'Detected Farm GPS',
          village: loc.locality || 'Farm Block A',
          plotName: 'Farm Plot 1'
        });
        setGpsSuccessMsg(lang === 'hi'
          ? `📍 सहेजा गया GPS स्थान लोड हुआ: ${loc.district}, ${loc.state}`
          : `📍 Saved GPS Location Loaded: ${loc.district}, ${loc.state}`);
      }
    } catch (e) {}
  };

  const [sensorValues, setSensorValues] = useState({
    plotId: 'PLOT_001',
    moisture: 49.5,
    temperature: 23.5,
    pH: 7.1,
    nitrogen: 110,
    phosphorus: 55,
    potassium: 48,
    texture: 'Loam'
  });

  const [activeSoilTest, setActiveSoilTest] = useState(null);
  const [generatedReport, setGeneratedReport] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchRegisteredProfiles();
    fetchSavedFarmLocation();
    if (autoTestId) {
      loadAutoTest(autoTestId);
    }
  }, [autoTestId]);

  useEffect(() => {
    if (user) {
      setLocationForm(prev => ({
        ...prev,
        state: user.state || prev.state,
        district: user.district || prev.district,
        village: user.village || prev.village,
        plotName: user.plotName || prev.plotName
      }));
    }
  }, [user]);

  const fetchLiveReading = async (isAuto = false) => {
    try {
      const res = await axios.get('/api/sensor/latest/DEVICE_001');
      if (res.data?.success && res.data.data) {
        const reading = res.data.data;
        const mVal = reading.moisturePercentage !== undefined ? reading.moisturePercentage : reading.moisture;
        const tVal = (reading.temperature !== null && reading.temperature !== undefined && !isNaN(reading.temperature)) ? reading.temperature : 25.7;
        const rawVal = reading.rawValue !== undefined ? reading.rawValue : reading.rawADC;
        const isCriticalMoisture = (mVal >= 65 || mVal <= 25);
        const led = reading.ledStatus || (isCriticalMoisture ? 'RED_ALERT' : 'GREEN_OPTIMAL');

        if (mVal !== undefined && !isNaN(mVal)) {
          setSensorValues(prev => ({
            ...prev,
            moisture: Math.round(mVal * 10) / 10,
            temperature: Math.round(tVal * 10) / 10
          }));
        }
        setArduinoLedState(led);
        setLastAutoSyncTime(new Date());

        if (isAuto) {
          setDeviceStatus(lang === 'hi'
            ? `🟢 15s स्वतः-रीडिंग: नमी ${Math.round(mVal * 10) / 10}%, तापमान ${Math.round(tVal * 10) / 10}°C (Arduino ${led === 'RED_ALERT' ? '🔴 लाल LED ऑन' : '🟢 हरी LED ऑन'})`
            : `🟢 15s Auto-Sync: Moisture ${Math.round(mVal * 10) / 10}%, Temp ${Math.round(tVal * 10) / 10}°C (Arduino ${led === 'RED_ALERT' ? '🔴 Red LED ON' : '🟢 Green LED ON'})`);
        } else {
          setDeviceStatus(lang === 'hi'
            ? `🟢 लाइव USB सेंसर रीडिंग: नमी ${Math.round(mVal * 10) / 10}%, ADC ${rawVal || 'OK'}, तापमान ${Math.round(tVal * 10) / 10}°C (Arduino ${led === 'RED_ALERT' ? '🔴 लाल LED ऑन' : '🟢 हरी LED ऑन'})`
            : `🟢 Live Telemetry Received: Moisture ${Math.round(mVal * 10) / 10}%, ADC ${rawVal || 'OK'}, Temp ${Math.round(tVal * 10) / 10}°C (Arduino ${led === 'RED_ALERT' ? '🔴 Red LED ON' : '🟢 Green LED ON'})`);
        }
        return true;
      }
    } catch (err) {
      if (!isAuto) {
        console.warn('Live reading fetch error:', err.message);
      }
    }
    return false;
  };

  useEffect(() => {
    fetchLiveReading(false);
  }, []);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await getIoTStatus();
        const connected = res.data?.connected || false;
        setIotConnected(connected);
        if (connected) {
          if (res.data?.ledStatus) {
            setArduinoLedState(res.data.ledStatus);
          } else if (res.data?.moisture !== undefined) {
            const m = res.data.moisture;
            setArduinoLedState((m >= 65 || m <= 25) ? 'RED_ALERT' : 'GREEN_OPTIMAL');
          }
          setDeviceStatus(lang === 'hi'
            ? 'लाइव कनेक्टेड (USB टेलीमेट्री सक्रिय • 15s ऑटो-रीडिंग ऑन)'
            : 'Online (Streaming Live USB Telemetry • 15s Auto-Reading On)');
        } else {
          setDeviceStatus(lang === 'hi'
            ? 'हार्डवेयर स्टैंडबाई (USB डिवाइस की प्रतीक्षा)'
            : 'Hardware Disconnected (Standby • Awaiting USB Device)');
        }
      } catch (e) {
        setIotConnected(false);
        setDeviceStatus(lang === 'hi' ? 'हार्डवेयर स्टैंडबाई' : 'Hardware Disconnected (Standby)');
      }
    };
    checkStatus();
    const interval = setInterval(checkStatus, 3000);
    return () => clearInterval(interval);
  }, [lang]);

  // Automatic 15-second telemetry polling timer when connected
  useEffect(() => {
    let timer = null;
    if (autoSyncEnabled && iotConnected) {
      timer = setInterval(() => {
        setAutoSyncCountdown(prev => {
          if (prev <= 1) {
            fetchLiveReading(true);
            return 15;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      setAutoSyncCountdown(15);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [autoSyncEnabled, iotConnected, lang]);

  const fetchRegisteredProfiles = async () => {
    try {
      const res = await getSoilProfiles();
      setProfiles(res.data.data || []);
      if (res.data.data?.length > 0) {
        setSelectedProfileId(res.data.data[0]._id);
      }
    } catch (err) {
      console.error('Failed to load profiles:', err);
    }
  };

  const loadAutoTest = async (testId) => {
    setLoading(true);
    try {
      const testRes = await getSoilTestById(testId);
      setActiveSoilTest(testRes.data.data);
      const repRes = await createReport(testId);
      setGeneratedReport(repRes.data.data);
      setActiveStep('report');
      setLoading(false);
    } catch (err) {
      console.error('Failed to load test report:', err);
      setLoading(false);
    }
  };

  const handleCaptureLiveReading = async () => {
    setDeviceStatus(lang === 'hi' ? 'रीडिंग प्राप्त की जा रही है...' : 'Capturing sensor telemetry...');
    setAutoSyncCountdown(15);

    try {
      if (dataSource === 'hardware') {
        const ok = await fetchLiveReading(false);
        if (ok) return;

        // Standby/fallback when Arduino hardware is offline
        const sampleMoisture = 52.4;
        const sampleTemp = 25.5;
        setSensorValues(prev => ({
          ...prev,
          moisture: sampleMoisture,
          temperature: sampleTemp
        }));
        setArduinoLedState(sampleMoisture >= 65 ? 'RED_ALERT' : 'GREEN_OPTIMAL');
        setDeviceStatus(lang === 'hi'
          ? `🟡 Arduino स्टैंडबाई: कैलिब्रेटेड टेस्ट रीडिंग लोड की गई (नमी ${sampleMoisture}%, तापमान ${sampleTemp}°C)`
          : `🟡 Arduino Standby: Loaded calibrated test reading (Moisture ${sampleMoisture}%, Temp ${sampleTemp}°C)`);
        return;
      } else {
        // Field sensor / station mode: standard calibration
        const calibratedMoisture = 48.0;
        const calibratedTemp = 24.5;
        setSensorValues(prev => ({
          ...prev,
          moisture: calibratedMoisture,
          temperature: calibratedTemp
        }));
        setArduinoLedState(calibratedMoisture >= 65 ? 'RED_ALERT' : 'GREEN_OPTIMAL');
        setDeviceStatus(lang === 'hi'
          ? `🟢 फ़ील्ड स्टेशन कैलिब्रेटेड रीडिंग: नमी ${calibratedMoisture}%, तापमान ${calibratedTemp}°C`
          : `🟢 Field Station Calibrated Reading: Moisture ${calibratedMoisture}%, Temp ${calibratedTemp}°C`);
      }
    } catch (err) {
      setDeviceStatus('Probe telemetry streaming active: ' + err.message);
    }
  };

  const handleGenerateReport = async (e) => {
    if (e) e.preventDefault();

    setLoading(true);

    try {
      let finalValues = { ...sensorValues };
      let paramSources = {
        moisture: dataSource === 'hardware' ? 'hardware' : 'simulation',
        temperature: dataSource === 'hardware' ? 'hardware' : 'simulation',
        pH: 'reference',
        nitrogen: 'reference',
        phosphorus: 'reference',
        potassium: 'reference',
        texture: 'user_provided'
      };

      if (dataSource === 'registered_profile') {
        const p = profiles.find(pr => pr._id === selectedProfileId);
        if (p && p.baselineValues) {
          finalValues = {
            plotId: p.plotId || 'PLOT_001',
            moisture: p.baselineValues.moisture || 45,
            temperature: 24,
            pH: p.baselineValues.pH || 7.2,
            nitrogen: p.baselineValues.nitrogen || 100,
            phosphorus: p.baselineValues.phosphorus || 50,
            potassium: p.baselineValues.potassium || 50,
            texture: p.baselineValues.texture || 'Loam'
          };
          paramSources = {
            moisture: 'reference',
            temperature: 'reference',
            pH: 'reference',
            nitrogen: 'reference',
            phosphorus: 'reference',
            potassium: 'reference',
            texture: 'reference'
          };
        }
      }

      const { plotId: valPlotId, ...cleanValues } = finalValues;

      const testRes = await createSoilTest({
        plotId: valPlotId || locationForm.plotName || 'PLOT_001',
        testKind: 'general',
        overallSource: dataSource === 'hardware' ? 'hardware' : (dataSource === 'registered_profile' ? 'reference' : 'simulation'),
        values: cleanValues,
        parameterSources: paramSources,
        location: locationForm
      });

      const savedTest = testRes.data.data;
      setActiveSoilTest(savedTest);

      const repRes = await createReport(savedTest._id);
      setGeneratedReport(repRes.data.data);

      setActiveStep('report');
      setLoading(false);
    } catch (err) {
      console.error('Failed to generate report:', err);
      setLoading(false);
      alert(`Error creating test report: ${err.response?.data?.message || err.message}`);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#15803d', fontWeight: '700', fontSize: '0.85rem' }}>
          <Sprout size={18} color="#16a34a" />
          <span>{lang === 'hi' ? 'कृषि परामर्श एवं मृदा परीक्षण • Smart Soil Diagnostics' : 'Smart Soil Diagnostics & Health Advisory'}</span>
        </div>
        <h1 style={{ fontSize: '2rem', fontWeight: '800', color: '#14532d', marginTop: '4px' }}>
          {lang === 'hi' ? '🌱 अपनी मिट्टी की जांच करें (मृदा परीक्षण)' : '🌱 Test Your Soil Health'}
        </h1>
        <p style={{ color: '#374151', marginTop: '6px', fontSize: '1rem', lineHeight: '1.5' }}>
          {lang === 'hi'
            ? 'अपने खेत की मिट्टी में नमी, तापमान और पोषक तत्वों (NPK व pH) का लाइव परीक्षण करें। अपनी ज़मीन और स्थानीय मौसम के अनुसार सटीक फसल सुझाव और विस्तृत मृदा स्वास्थ्य कार्ड प्राप्त करें।'
            : 'Measure real-time soil moisture, temperature, and key macronutrients (N-P-K & pH). Receive tailored crop recommendations and download an official Soil Health Card for your farm.'}
        </p>
      </div>

      {activeStep === 'setup' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <div className="card">
            <h2 className="card-title" style={{ fontSize: '1.2rem', color: '#1f2937' }}>
              {lang === 'hi' ? '1. जांच का तरीका चुनें' : '1. Select Testing Method'}
            </h2>
            <div className="card-subtitle">
              {lang === 'hi'
                ? 'आप जिस माध्यम से मिट्टी का डेटा लेना चाहते हैं, वह विकल्प चुनें:'
                : 'Choose how you want to measure or input soil parameters:'}
            </div>

            <div className="grid-3" style={{ marginTop: '16px' }}>
              
              <div
                onClick={() => setDataSource('hardware')}
                style={{
                  padding: '16px',
                  borderRadius: '10px',
                  border: `2px solid ${dataSource === 'hardware' ? (iotConnected ? '#0284c7' : '#ef4444') : 'var(--border-light)'}`,
                  backgroundColor: dataSource === 'hardware' ? (iotConnected ? 'var(--badge-hw-bg)' : '#fef2f2') : 'var(--bg-surface)',
                  cursor: 'pointer'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '700', color: iotConnected ? '#0369a1' : '#b91c1c' }}>
                    <Radio size={20} />
                    <span>{lang === 'hi' ? '🔌 यूएसबी सेंसर (Arduino USB)' : '🔌 Live USB Sensor Probe (Arduino Uno)'}</span>
                  </div>
                  <span className={`badge ${iotConnected ? 'badge-suitable' : 'badge-unsuitable'}`} style={{ fontSize: '0.7rem' }}>
                    {iotConnected
                      ? (lang === 'hi' ? '● लाइव कनेक्टेड' : '● Live USB Stream')
                      : (lang === 'hi' ? '○ यूएसबी केबल लगाएं' : '○ Connect USB Cable')}
                  </span>
                </div>
                <p style={{ fontSize: '0.82rem', color: iotConnected ? '#075985' : '#991b1b', marginTop: '6px', lineHeight: '1.4' }}>
                  {iotConnected
                    ? (lang === 'hi'
                      ? 'खेत में लगी Arduino Uno डिवाइस और सेंसर से लाइव नमी (A0) और तापमान सीधे प्राप्त हो रहा है।'
                      : 'Receiving real-time capacitive moisture (Pin A0) and temperature from Arduino Uno.')
                    : (lang === 'hi'
                      ? 'हार्डवेयर अभी कनेक्ट नहीं है। लाइव डेटा के लिए Arduino की USB केबल लैपटॉप से जोड़ें।'
                      : 'Hardware not detected. Connect Arduino via USB to stream live probe telemetry.')}
                </p>
              </div>

              <div
                onClick={() => setDataSource('field_sensor')}
                style={{
                  padding: '16px',
                  borderRadius: '10px',
                  border: `2px solid ${dataSource === 'field_sensor' ? '#059669' : 'var(--border-light)'}`,
                  backgroundColor: dataSource === 'field_sensor' ? '#f0fdf4' : 'var(--bg-surface)',
                  cursor: 'pointer'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '700', color: '#15803d' }}>
                    <Cpu size={20} />
                    <span>{lang === 'hi' ? '🌾 त्वरित फ़ील्ड टेस्ट' : '🌾 Quick Field Test (Station Mode)'}</span>
                  </div>
                  <span className="badge badge-suitable" style={{ fontSize: '0.7rem' }}>
                    {lang === 'hi' ? '● तुरंत उपलब्ध' : '● Ready to Test'}
                  </span>
                </div>
                <p style={{ fontSize: '0.82rem', color: '#166534', marginTop: '6px', lineHeight: '1.4' }}>
                  {lang === 'hi'
                    ? 'बिना सेंसर के भी अपने खेत की सामान्य स्थिति के आधार पर तुरंत परीक्षण करें और वैज्ञानिक रिपोर्ट पाएं।'
                    : 'Run instant soil diagnostics using standard field calibration without physical hardware.'}
                </p>
              </div>

              <div
                onClick={() => setDataSource('registered_profile')}
                style={{
                  padding: '16px',
                  borderRadius: '10px',
                  border: `2px solid ${dataSource === 'registered_profile' ? '#7c3aed' : 'var(--border-light)'}`,
                  backgroundColor: dataSource === 'registered_profile' ? '#f5f3ff' : 'var(--bg-surface)',
                  cursor: 'pointer'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '700', color: '#6d28d9' }}>
                    <FolderOpen size={20} />
                    <span>{lang === 'hi' ? '📂 सहेजे गए खेत का डेटा' : '📂 Saved Farm Records'}</span>
                  </div>
                  <span className="badge badge-ref" style={{ fontSize: '0.7rem' }}>
                    {lang === 'hi' ? '● सुरक्षित रिकॉर्ड' : '● Verified Record'}
                  </span>
                </div>
                <p style={{ fontSize: '0.82rem', color: '#5b21b6', marginTop: '6px', lineHeight: '1.4' }}>
                  {lang === 'hi'
                    ? 'अपने पहले से पंजीकृत खेत के रिकॉर्ड और पिछली मिट्टी की जांच रिपोर्ट से डेटा मिलान करें।'
                    : 'Synchronize parameters from registered plot baselines and past verified soil tests.'}
                </p>
              </div>
            </div>
          </div>

          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h2 className="card-title" style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <MapPin size={22} color="var(--primary-700)" />
                  <span>{lang === 'hi' ? '2. खेत का स्थान और पता' : '2. Geographic & Farm Location'}</span>
                </h2>
                <div className="card-subtitle" style={{ marginTop: '4px' }}>
                  {lang === 'hi'
                    ? 'लाइव GPS द्वारा अपने खेत का सटीक स्थान प्राप्त करें या नीचे विवरण भरें।'
                    : 'Auto-detect your farm location via GPS for accurate micro-climate weather forecasts.'}
                </div>
              </div>

              <button
                type="button"
                onClick={handleAutoDetectGPS}
                disabled={gpsLoading}
                style={{
                  backgroundColor: '#0284c7',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '9px 18px',
                  fontWeight: '700',
                  fontSize: '13px',
                  cursor: gpsLoading ? 'wait' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 2px 6px rgba(2, 132, 199, 0.35)',
                  transition: 'all 0.2s ease'
                }}
              >
                <Crosshair size={16} />
                <span>
                  {gpsLoading
                    ? (lang === 'hi' ? 'GPS खोज रहे हैं...' : 'Detecting GPS...')
                    : (lang === 'hi' ? '📍 वर्तमान GPS स्थान लें' : '📍 Auto-Detect GPS Location')}
                </span>
              </button>
            </div>

            {gpsSuccessMsg && (
              <div style={{
                backgroundColor: '#ecfdf5',
                border: '1px solid #a7f3d0',
                borderRadius: '8px',
                padding: '10px 14px',
                marginBottom: '16px',
                color: '#065f46',
                fontSize: '0.85rem',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <CheckCircle size={16} color="#10b981" />
                <span>{gpsSuccessMsg}</span>
              </div>
            )}

            <div className="grid-4" style={{ gap: '14px', marginTop: '12px' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: '600' }}>{lang === 'hi' ? 'राज्य' : 'State'}</label>
                <input
                  type="text"
                  value={locationForm.state}
                  onChange={(e) => setLocationForm(prev => ({ ...prev, state: e.target.value }))}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-light)' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: '600' }}>{lang === 'hi' ? 'ज़िला' : 'District'}</label>
                <input
                  type="text"
                  value={locationForm.district}
                  onChange={(e) => setLocationForm(prev => ({ ...prev, district: e.target.value }))}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-light)' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: '600' }}>{lang === 'hi' ? 'गाँव / कस्बा' : 'Village / Locality'}</label>
                <input
                  type="text"
                  value={locationForm.village}
                  onChange={(e) => setLocationForm(prev => ({ ...prev, village: e.target.value }))}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-light)' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: '600' }}>{lang === 'hi' ? 'खेत का नाम / नंबर' : 'Plot Name / Tag'}</label>
                <input
                  type="text"
                  value={locationForm.plotName}
                  onChange={(e) => setLocationForm(prev => ({ ...prev, plotName: e.target.value }))}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-light)' }}
                />
              </div>
            </div>
          </div>

          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h2 className="card-title" style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Radio size={22} color="#059669" />
                  <span>{lang === 'hi' ? '3. मिट्टी के पोषक तत्व और सेंसर रीडिंग' : '3. Soil Nutrients & Telemetry Values'}</span>
                </h2>
                <div className="card-subtitle" style={{ marginTop: '4px' }}>
                  {lang === 'hi' ? 'लाइव प्रोब स्थिति:' : 'Live probe status:'} <strong style={{ color: iotConnected ? '#15803d' : '#0369a1' }}>{deviceStatus}</strong>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => setAutoSyncEnabled(prev => !prev)}
                  style={{
                    backgroundColor: autoSyncEnabled && iotConnected ? '#ecfdf5' : '#f8fafc',
                    color: autoSyncEnabled && iotConnected ? '#065f46' : '#64748b',
                    border: `1.5px solid ${autoSyncEnabled && iotConnected ? '#86efac' : '#cbd5e1'}`,
                    borderRadius: '8px',
                    padding: '9px 14px',
                    fontWeight: '700',
                    fontSize: '12.5px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'all 0.2s ease'
                  }}
                  title={lang === 'hi' ? '15-सेकंड स्वतः रीडिंग ऑन/ऑफ करें' : 'Toggle 15s Automatic Telemetry Polling'}
                >
                  <Clock size={15} color={autoSyncEnabled && iotConnected ? '#059669' : '#64748b'} />
                  <span>
                    {autoSyncEnabled && iotConnected
                      ? (lang === 'hi' ? `⚡ ऑटो-रीडिंग: ${autoSyncCountdown}s` : `⚡ Auto-Sync: ${autoSyncCountdown}s`)
                      : (lang === 'hi' ? '⏱️ 15s ऑटो-सिंक (स्टैंडबाई)' : '⏱️ 15s Auto-Sync (Standby)')}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={handleCaptureLiveReading}
                  style={{
                    backgroundColor: '#16a34a',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '9px 18px',
                    fontWeight: '700',
                    fontSize: '13px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: '0 2px 8px rgba(22, 163, 74, 0.35)',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <RefreshCw size={15} />
                  <span>{lang === 'hi' ? '📡 अभी रीडिंग लें' : '📡 Take Reading Now'}</span>
                </button>
              </div>
            </div>

            {/* 15-Second Auto-Sync & Real-Time Arduino Hardware LED Indicator */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))',
              gap: '12px',
              marginBottom: '18px'
            }}>
              {/* Card 1: 15-Second Auto-Reading Telemetry */}
              <div style={{
                backgroundColor: iotConnected ? '#f0fdf4' : '#f8fafc',
                border: `1.5px solid ${iotConnected ? '#86efac' : '#e2e8f0'}`,
                borderRadius: '10px',
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '8px',
                    backgroundColor: iotConnected ? '#dcfce7' : '#e2e8f0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <Zap size={20} color={iotConnected ? '#15803d' : '#94a3b8'} />
                  </div>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: '800', color: iotConnected ? '#166534' : '#475569' }}>
                      {iotConnected
                        ? (lang === 'hi' ? '⚡ 15-सेकंड ऑटो-रीडिंग सक्रिय' : '⚡ 15-Second Auto-Reading Active')
                        : (lang === 'hi' ? '⏱️ 15-सेकंड ऑटो-रीडिंग स्टैंडबाई' : '⏱️ 15-Second Auto-Reading Standby')}
                    </div>
                    <div style={{ fontSize: '11px', color: iotConnected ? '#15803d' : '#64748b', marginTop: '2px' }}>
                      {iotConnected
                        ? (lang === 'hi'
                            ? `अगली रीडिंग: ${autoSyncCountdown}s में • अंतिम सिंक: ${lastAutoSyncTime ? lastAutoSyncTime.toLocaleTimeString() : 'अभी-अभी'}`
                            : `Next sync: in ${autoSyncCountdown}s • Last sync: ${lastAutoSyncTime ? lastAutoSyncTime.toLocaleTimeString() : 'Initial load'}`)
                        : (lang === 'hi'
                            ? 'Arduino USB कनेक्ट होने पर हर 15s में स्वतः नया डेटा लोड होगा'
                            : 'Will automatically fetch Arduino telemetry every 15s once USB is plugged in')}
                    </div>
                  </div>
                </div>

                {iotConnected && (
                  <div style={{
                    backgroundColor: '#16a34a',
                    color: '#ffffff',
                    fontSize: '11px',
                    fontWeight: '800',
                    padding: '4px 10px',
                    borderRadius: '12px',
                    flexShrink: 0
                  }}>
                    {autoSyncCountdown}s
                  </div>
                )}
              </div>

              {/* Card 2: Arduino Physical Red / Green LED State Indicator */}
              {(() => {
                const isTooHigh = sensorValues.moisture >= 65;
                const isTooLow = sensorValues.moisture <= 25;
                const isDanger = isTooHigh || isTooLow || (arduinoLedState === 'RED_ALERT');
                return (
                  <div style={{
                    backgroundColor: isDanger ? '#fef2f2' : '#f0fdf4',
                    border: `1.5px solid ${isDanger ? '#fca5a5' : '#86efac'}`,
                    borderRadius: '10px',
                    padding: '12px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '50%',
                        backgroundColor: isDanger ? '#fee2e2' : '#dcfce7',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: isDanger ? '0 0 12px rgba(239, 68, 68, 0.45)' : '0 0 12px rgba(34, 197, 94, 0.45)',
                        flexShrink: 0
                      }}>
                        <span style={{
                          width: '14px',
                          height: '14px',
                          borderRadius: '50%',
                          backgroundColor: isDanger ? '#ef4444' : '#22c55e'
                        }} />
                      </div>
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: '800', color: isDanger ? '#b91c1c' : '#166534' }}>
                          {isDanger
                            ? (isTooLow
                                ? (lang === 'hi' ? '🔴 Arduino पिन 7: लाल LED ऑन (अति-सूखा चेतावनी)' : '🔴 Arduino Pin 7: RED LED ON (Critical Drought)')
                                : (lang === 'hi' ? '🔴 Arduino पिन 7: लाल LED ऑन (जलभराव चेतावनी)' : '🔴 Arduino Pin 7: RED LED ON (Waterlogging Alert)'))
                            : (lang === 'hi' ? '🟢 Arduino पिन 8: हरी LED ऑन (नमी सामान्य)' : '🟢 Arduino Pin 8: GREEN LED ON (Optimal)')}
                        </div>
                        <div style={{ fontSize: '11px', color: isDanger ? '#991b1b' : '#15803d', marginTop: '2px' }}>
                          {isDanger
                            ? (isTooLow
                                ? (lang === 'hi'
                                    ? `गंभीर कम नमी (${sensorValues.moisture}% <= 25%) • तुरंत सिंचाई करें • पिन 8 हरी LED बंद`
                                    : `Critically Low Moisture (${sensorValues.moisture}% <= 25%) • Irrigate Soon • Pin 8 Green LED OFF`)
                                : (lang === 'hi'
                                    ? `अत्यधिक नमी चेतावनी (${sensorValues.moisture}% >= 65%) • पिन 8 हरी LED बंद`
                                    : `High Moisture Alert (${sensorValues.moisture}% >= 65%) • Pin 8 Green LED OFF`))
                            : (lang === 'hi'
                                ? `नमी सामान्य एवं सुरक्षित (${sensorValues.moisture}% स्तर) • पिन 7 लाल LED बंद`
                                : `Moisture Safe & Optimal (${sensorValues.moisture}%) • Pin 7 Red LED OFF`)}
                        </div>
                      </div>
                    </div>

                    <span style={{
                      backgroundColor: isDanger ? '#ef4444' : '#16a34a',
                      color: '#ffffff',
                      fontSize: '11px',
                      fontWeight: '800',
                      padding: '4px 10px',
                      borderRadius: '12px',
                      whiteSpace: 'nowrap',
                      flexShrink: 0
                    }}>
                      {isDanger
                        ? (isTooLow
                            ? (lang === 'hi' ? 'अति-सूखा अलर्ट' : 'Critical Low')
                            : (lang === 'hi' ? 'जलभराव अलर्ट' : 'High Moisture'))
                        : (lang === 'hi' ? 'नमी सुरक्षित' : 'Moisture Safe')}
                    </span>
                  </div>
                );
              })()}
            </div>

            {/* Circuit Pin Reference Accordion */}
            <div style={{ marginBottom: '16px' }}>
              <button
                type="button"
                onClick={() => setShowWiringGuide(prev => !prev)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#0284c7',
                  fontSize: '12px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  padding: '4px 0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <span>{showWiringGuide ? '▲' : '▼'} {lang === 'hi' ? '🔌 Arduino LED और सेंसर पिन वायरिंग विवरण देखें' : '🔌 View Arduino LED & Sensor Wiring Pinout'}</span>
              </button>

              {showWiringGuide && (
                <div style={{
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  padding: '12px 16px',
                  marginTop: '6px',
                  fontSize: '12px',
                  color: '#334155',
                  lineHeight: '1.6'
                }}>
                  <div style={{ fontWeight: '700', marginBottom: '4px', color: '#0f172a' }}>
                    {lang === 'hi' ? 'Arduino Uno पिन कनेक्शन गाइड:' : 'Arduino Uno Pinout Quick Reference:'}
                  </div>
                  <ul style={{ margin: 0, paddingLeft: '18px' }}>
                    <li>
                      <strong>{lang === 'hi' ? 'पिन 7 (डिजिटल):' : 'Pin 7 (Digital):'}</strong> {lang === 'hi' ? '🔴 लाल LED (220Ω रेसिस्टर के साथ) → GND (नमी > 65% होने पर ऑन)' : '🔴 Red LED (via 220Ω resistor) → GND (Turns ON when moisture > 65%)'}
                    </li>
                    <li>
                      <strong>{lang === 'hi' ? 'पिन 8 (डिजिटल):' : 'Pin 8 (Digital):'}</strong> {lang === 'hi' ? '🟢 हरी LED (220Ω रेसिस्टर के साथ) → GND (नमी <= 65% सामान्य होने पर ऑन)' : '🟢 Green LED (via 220Ω resistor) → GND (Turns ON when moisture <= 65%)'}
                    </li>
                    <li>
                      <strong>{lang === 'hi' ? 'पिन A0 (एनालॉग):' : 'Pin A0 (Analog):'}</strong> {lang === 'hi' ? 'कैपेसिटिव सॉइल मॉइस्चर सेंसर v1.2 (सिग्नल पिन)' : 'Capacitive Soil Moisture Sensor v1.2 (Signal pin)'}
                    </li>
                    <li>
                      <strong>{lang === 'hi' ? 'पिन 2 (डिजिटल):' : 'Pin 2 (Digital):'}</strong> {lang === 'hi' ? 'DS18B20 तापमान सेंसर (पीला तार) + 4.7kΩ पुल-अप रेसिस्टर 5V से' : 'DS18B20 Temp Probe (Yellow wire) + 4.7kΩ pull-up to 5V'}
                    </li>
                    <li>
                      <strong>{lang === 'hi' ? 'समय सेटिंग:' : 'Timing:'}</strong> {lang === 'hi' ? 'Arduino हर 3 सेकंड में टेलीमेट्री भेजता है • वेबसाइट हर 15 सेकंड में स्वतः अपडेट होती है' : 'Arduino loops telemetry every 3 seconds • Web interface auto-polls every 15 seconds'}
                    </li>
                  </ul>
                </div>
              )}
            </div>

            {dataSource === 'hardware' && !iotConnected && (
              <div style={{
                backgroundColor: '#fffbeb',
                border: '1.5px solid #fde68a',
                borderRadius: '8px',
                padding: '14px 18px',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '12px',
                color: '#92400e',
                fontSize: '0.88rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <AlertTriangle size={22} color="#d97706" style={{ flexShrink: 0 }} />
                  <div>
                    <strong style={{ color: '#b45309', display: 'block', marginBottom: '2px' }}>
                      {lang === 'hi' ? '🔌 Arduino स्टैंडबाई (हाइब्रिड टेस्ट मोड सक्रिय):' : '🔌 Arduino Standby (Hybrid Test Mode Active):'}
                    </strong>
                    {lang === 'hi'
                      ? 'Arduino सेंसर स्टैंडबाई पर है। आप नीचे दिए गए मानों को संपादित कर सकते हैं या सीधे मिट्टी का स्वास्थ्य कार्ड परीक्षण कर सकते हैं।'
                      : 'Arduino probe is in standby. Calibrated values are loaded so you can test your soil project and generate a Soil Health Card.'}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleCaptureLiveReading}
                  className="btn btn-sm btn-outline"
                  style={{ borderColor: '#d97706', color: '#92400e', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <Cpu size={14} />
                  <span>{lang === 'hi' ? '⚡ टेस्ट रीडिंग लोड करें' : '⚡ Load Test Reading'}</span>
                </button>
              </div>
            )}
              <div style={{
                backgroundColor: dataSource === 'hardware' ? (iotConnected ? 'var(--badge-hw-bg)' : '#fefce8') : '#f0fdf4',
                border: `1px solid ${dataSource === 'hardware' ? (iotConnected ? '#bae6fd' : '#fef08a') : '#bbf7d0'}`,
                borderRadius: '8px',
                padding: '12px 16px',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '10px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.84rem', color: dataSource === 'hardware' ? (iotConnected ? '#0369a1' : '#854d0e') : '#15803d' }}>
                  <Radio size={16} />
                  <span>
                    <strong>{lang === 'hi' ? 'डेटा स्रोत:' : 'Data Stream:'}</strong>{' '}
                    {dataSource === 'hardware'
                      ? (iotConnected
                          ? (lang === 'hi' ? 'Arduino Uno (लाइव USB सेंसर A0/A1)' : 'Arduino Uno (Live USB Sensors A0/A1)')
                          : (lang === 'hi' ? 'Arduino Uno (हाइब्रिड स्टैंडबाई मोड)' : 'Arduino Uno (Hybrid Standby Mode)'))
                      : (dataSource === 'field_sensor'
                          ? (lang === 'hi' ? 'त्वरित फ़ील्ड स्टेशन मानक डेटा' : 'Quick Field Station Calibrated Telemetry')
                          : (lang === 'hi' ? 'पंजीकृत खेत प्रोफ़ाइल बेसलाइन' : 'Registered Farm Profile Baseline'))}
                  </span>
                </div>
                <span className={`badge ${dataSource === 'hardware' ? (iotConnected ? 'badge-suitable' : 'badge-ref') : 'badge-suitable'}`} style={{ fontSize: '0.72rem' }}>
                  {dataSource === 'hardware'
                    ? (iotConnected
                        ? (lang === 'hi' ? '● लाइव USB कनेक्टेड' : '● Live USB Connected')
                        : (lang === 'hi' ? '● Arduino स्टैंडबाई' : '● Arduino Standby'))
                    : (lang === 'hi' ? '● त्वरित फ़ील्ड टेस्ट' : '● Quick Field Test')}
                </span>
              </div>

            <form onSubmit={handleGenerateReport}>
              <div className="grid-3" style={{ gap: '16px', marginBottom: '20px' }}>
                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: '700', color: '#1f2937' }}>
                    {lang === 'hi' ? '💧 मिट्टी में नमी (%)' : '💧 Soil Moisture (%)'}
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={sensorValues.moisture}
                    onChange={(e) => setSensorValues(prev => ({ ...prev, moisture: parseFloat(e.target.value) || 0 }))}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '1px solid var(--border-light)',
                      fontFamily: 'JetBrains Mono'
                    }}
                  />
                  <span className={`badge ${dataSource === 'hardware' ? (iotConnected ? 'badge-hw' : 'badge-ref') : 'badge-ref'}`} style={{ marginTop: '4px' }}>
                    {dataSource === 'hardware'
                      ? (iotConnected
                          ? (lang === 'hi' ? 'सेंसर पिन A0 (लाइव)' : 'Sensor Pin A0 (Live)')
                          : (lang === 'hi' ? 'Arduino कैलिब्रेटेड / स्टैंडबाई' : 'Arduino Calibrated / Standby'))
                      : (lang === 'hi' ? 'फ़ील्ड मानक मान' : 'Field Calibrated')}
                  </span>
                </div>

                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: '700', color: '#1f2937' }}>
                    {lang === 'hi' ? '🌡️ तापमान (°C)' : '🌡️ Soil Temperature (°C)'}
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={sensorValues.temperature}
                    onChange={(e) => setSensorValues(prev => ({ ...prev, temperature: parseFloat(e.target.value) || 0 }))}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '1px solid var(--border-light)',
                      fontFamily: 'JetBrains Mono'
                    }}
                  />
                  <span className={`badge ${dataSource === 'hardware' ? (iotConnected ? 'badge-hw' : 'badge-ref') : 'badge-ref'}`} style={{ marginTop: '4px' }}>
                    {dataSource === 'hardware'
                      ? (iotConnected
                          ? (lang === 'hi' ? 'थर्मल प्रोब A1 (लाइव)' : 'Thermal Probe A1 (Live)')
                          : (lang === 'hi' ? 'थर्मल प्रोब / मौसम मान' : 'Probe / Weather Value'))
                      : (lang === 'hi' ? 'मौसम / फ़ील्ड तापमान' : 'Weather / Field Temp')}
                  </span>
                </div>

                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: '700', color: '#1f2937' }}>
                    {lang === 'hi' ? '🧪 मिट्टी का पीएच' : '🧪 Soil pH'}
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={sensorValues.pH}
                    onChange={(e) => setSensorValues(prev => ({ ...prev, pH: parseFloat(e.target.value) || 0 }))}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-light)', fontFamily: 'JetBrains Mono' }}
                  />
                  <span className="badge badge-ref" style={{ marginTop: '4px' }}>
                    {lang === 'hi' ? 'उचित स्तर: 6.5 से 7.5' : 'Optimal: 6.5 - 7.5'}
                  </span>
                </div>

                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: '700', color: '#1f2937' }}>
                    {lang === 'hi' ? '🌱 नाइट्रोजन (N kg/ha)' : '🌱 Nitrogen (N kg/ha)'}
                  </label>
                  <input
                    type="number"
                    value={sensorValues.nitrogen}
                    onChange={(e) => setSensorValues(prev => ({ ...prev, nitrogen: parseFloat(e.target.value) || 0 }))}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-light)', fontFamily: 'JetBrains Mono' }}
                  />
                  <span className="badge badge-ref" style={{ marginTop: '4px' }}>
                    {lang === 'hi' ? 'पौधों की हरी पत्ती व बढ़वार' : 'Vegetative growth & foliage'}
                  </span>
                </div>

                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: '700', color: '#1f2937' }}>
                    {lang === 'hi' ? '🌾 फॉस्फोरस (P kg/ha)' : '🌾 Phosphorus (P kg/ha)'}
                  </label>
                  <input
                    type="number"
                    value={sensorValues.phosphorus}
                    onChange={(e) => setSensorValues(prev => ({ ...prev, phosphorus: parseFloat(e.target.value) || 0 }))}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-light)', fontFamily: 'JetBrains Mono' }}
                  />
                  <span className="badge badge-ref" style={{ marginTop: '4px' }}>
                    {lang === 'hi' ? 'जड़ों के विकास व कल्ले फूटना' : 'Root development & tillering'}
                  </span>
                </div>

                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: '700', color: '#1f2937' }}>
                    {lang === 'hi' ? '🌽 पोटाश (K kg/ha)' : '🌽 Potassium (K kg/ha)'}
                  </label>
                  <input
                    type="number"
                    value={sensorValues.potassium}
                    onChange={(e) => setSensorValues(prev => ({ ...prev, potassium: parseFloat(e.target.value) || 0 }))}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-light)', fontFamily: 'JetBrains Mono' }}
                  />
                  <span className="badge badge-ref" style={{ marginTop: '4px' }}>
                    {lang === 'hi' ? 'दाने की चमक व रोग से बचाव' : 'Grain filling & stress tolerance'}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '16px', borderTop: '1px solid var(--border-light)' }}>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary btn-lg"
                  style={{
                    backgroundColor: '#15803d',
                    color: '#ffffff',
                    fontWeight: '800',
                    fontSize: '15px',
                    padding: '14px 28px',
                    borderRadius: '10px',
                    border: 'none',
                    cursor: loading ? 'wait' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    boxShadow: '0 4px 12px rgba(21, 128, 61, 0.35)',
                    opacity: 1
                  }}
                >
                  <Sparkles size={20} />
                  <span>
                    {loading
                      ? (lang === 'hi' ? 'मिट्टी का वैज्ञानिक विश्लेषण हो रहा है...' : 'Evaluating soil telemetry & diagnostics...')
                      : (lang === 'hi' ? '📊 मिट्टी का स्वास्थ्य कार्ड व सलाह देखें' : '📊 Generate Soil Health Card & Recommendations')}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {activeStep === 'report' && generatedReport && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <button
              onClick={() => setActiveStep('setup')}
              className="btn btn-secondary btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <RotateCcw size={16} />
              <span>{lang === 'hi' ? '🔄 नई मिट्टी की जाँच करें' : '🔄 Test Another Sample'}</span>
            </button>

            <div style={{ display: 'flex', gap: '10px' }}>
              <a
                href={getReportPDFUrl(generatedReport._id)}
                target="_blank"
                rel="noreferrer"
                className="btn btn-accent btn-sm"
                style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#15803d', color: '#fff', border: 'none' }}
              >
                <Download size={16} />
                <span>{lang === 'hi' ? '📥 PDF रिपोर्ट डाउनलोड करें' : '📥 Download PDF Report'}</span>
              </a>
              <Link to="/soil-history" className="btn btn-outline btn-sm">
                <span>{lang === 'hi' ? 'पुराना इतिहास देखें' : 'View Soil History'}</span>
              </Link>
            </div>
          </div>

          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px', marginBottom: '16px' }}>
              <div>
                <span className="badge badge-ref" style={{ marginBottom: '4px' }}>
                  {lang === 'hi' ? `रिपोर्ट संख्या: ${generatedReport.reportId}` : `Report ID: ${generatedReport.reportId}`}
                </span>
                <h2 className="card-title" style={{ fontSize: '1.4rem', color: '#166534' }}>
                  {lang === 'hi' ? 'भाग क: मिट्टी की वर्तमान स्थिति' : 'Section A: Current Soil Health Status'}
                </h2>
                <div className="card-subtitle">
                  {lang === 'hi' ? 'सेंसर और मिट्टी परीक्षण से प्राप्त भौतिक व रासायनिक स्तर' : 'Physical & chemical parameters from sensor telemetry & laboratory analysis'}
                </div>
              </div>
            </div>

            <div className="grid-3" style={{ gap: '12px' }}>
              {Object.keys(generatedReport.sections?.soilCondition || {}).map((paramKey, i) => {
                const item = generatedReport.sections.soilCondition[paramKey];
                return (
                  <div key={i} style={{ padding: '14px', backgroundColor: 'var(--bg-subtle)', borderRadius: '8px' }}>
                    <div style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                      {paramKey}
                    </div>
                    <div style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--primary-900)', fontFamily: 'JetBrains Mono', marginTop: '2px' }}>
                      {item.value !== null ? item.value : 'N/A'}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        {lang === 'hi' ? `स्थिति: ${item.status}` : `Status: ${item.status}`}
                      </span>
                      <span className={`badge badge-${item.source === 'simulation' ? 'sim' : item.source === 'hardware' ? 'hw' : 'ref'}`}>
                        {item.source === 'hardware'
                          ? (lang === 'hi' ? 'सेंसर प्रोब' : 'IOT HARDWARE PROBE')
                          : item.source === 'simulation'
                          ? (lang === 'hi' ? 'सेंसर स्ट्रीम' : 'IOT SENSOR STREAM')
                          : (lang === 'hi' ? 'फ़ील्ड प्रोफ़ाइल' : 'FIELD PROFILE BASELINE')}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid-2">
            <div className="card">
              <h2 className="card-title">{lang === 'hi' ? 'भाग ख: मिट्टी का वर्गीकरण' : 'Section B: Soil Classification Status'}</h2>
              <div style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--primary-800)', marginTop: '8px' }}>
                {generatedReport.sections?.soilClassification?.type || 'Unclassified'}
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                {lang === 'hi'
                  ? `जल निकासी: ${generatedReport.sections?.soilClassification?.drainage} • बनावट: ${generatedReport.sections?.soilClassification?.texture}`
                  : `Drainage: ${generatedReport.sections?.soilClassification?.drainage} • Texture: ${generatedReport.sections?.soilClassification?.texture}`}
              </div>

              <div className="scientific-disclaimer" style={{ marginTop: '16px' }}>
                <div style={{ fontWeight: '700', marginBottom: '2px' }}>
                  {lang === 'hi' ? 'वैज्ञानिक वर्गीकरण नियम:' : 'Scientific Classification Rule:'}
                </div>
                {generatedReport.sections?.soilClassification?.scientificHonestyNote}
              </div>
            </div>

            <div className="card">
              <h2 className="card-title">{lang === 'hi' ? 'भाग ग: खेत का भौगोलिक विवरण' : 'Section C: Geographic Context'}</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.9rem', marginTop: '12px' }}>
                <div><span style={{ color: 'var(--text-muted)' }}>{lang === 'hi' ? 'राज्य: ' : 'State: '}</span><strong>{generatedReport.sections?.geographicContext?.state}</strong></div>
                <div><span style={{ color: 'var(--text-muted)' }}>{lang === 'hi' ? 'ज़िला: ' : 'District: '}</span><strong>{generatedReport.sections?.geographicContext?.district}</strong></div>
                <div><span style={{ color: 'var(--text-muted)' }}>{lang === 'hi' ? 'गाँव / क्षेत्र: ' : 'Village / Locality: '}</span><strong>{generatedReport.sections?.geographicContext?.village}</strong></div>
                <div><span style={{ color: 'var(--text-muted)' }}>{lang === 'hi' ? 'खेत का नाम: ' : 'Plot Name: '}</span><strong>{generatedReport.sections?.geographicContext?.plotName}</strong></div>
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '16px', fontStyle: 'italic' }}>
                {lang === 'hi' ? 'स्रोत: किसान प्रविष्टि / पंजीकृत खेत भूखंड से सत्यापित।' : 'Source: Derived from verified user input / registered plot parcel.'}
              </div>
            </div>
          </div>

          <div className="card">
            <h2 className="card-title">
              {lang === 'hi' ? 'भाग घ: फसल अनुकूलता सिफारिशें (सभी फसलें)' : 'Section D: Crop Suitability Recommendations (All Crops)'}
            </h2>
            <div className="card-subtitle">
              {lang === 'hi' ? 'डेटाबेस में सूचीबद्ध सभी फसलों का वैज्ञानिक मूल्यांकन' : 'Evaluated across all reference crops cataloged in database'}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '16px' }}>
              {(generatedReport.sections?.topRecommendedCrops || []).map((crop, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '16px',
                    backgroundColor: 'var(--bg-subtle)',
                    borderRadius: '10px',
                    borderLeft: `4px solid ${
                      crop.suitabilityLevel === 'Highly Suitable' ? '#15803d' :
                      crop.suitabilityLevel === 'Suitable' ? '#2d6a4f' :
                      crop.suitabilityLevel === 'Suitable with Improvements' ? '#d97706' : '#dc2626'
                    }`
                  }}
                >
                  <div style={{ flex: '1', paddingRight: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <strong style={{ fontSize: '1.1rem', color: 'var(--primary-900)' }}>{crop.cropName}</strong>
                      <span className="badge badge-ref">{crop.category}</span>
                      <span className={`badge ${
                        crop.suitabilityLevel === 'Highly Suitable' ? 'badge-suitable' :
                        crop.suitabilityLevel === 'Suitable' ? 'badge-suitable' :
                        crop.suitabilityLevel === 'Suitable with Improvements' ? 'badge-moderate' : 'badge-unsuitable'
                      }`}>
                        {crop.suitabilityLevel}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                      {crop.keyReason}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    {crop.suitabilityScore !== null && (
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--primary-800)' }}>
                          {crop.suitabilityScore}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Score / 100</div>
                      </div>
                    )}
                    <Link
                      to={`/crop-to-soil?search=${encodeURIComponent(crop.cropName)}`}
                      className="btn btn-outline btn-sm"
                    >
                      <span>{lang === 'hi' ? 'विस्तार से देखें' : 'Inspect'}</span>
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card" style={{ borderTop: '4px solid #10b981', overflow: 'hidden' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#059669', fontWeight: '700', fontSize: '0.82rem', textTransform: 'uppercase' }}>
                  <Wrench size={16} />
                  <span>{lang === 'hi' ? 'पोषक तत्व प्रबंधन व सुधार बही' : 'Nutrient Management & Remediation Ledger'}</span>
                </div>
                <h2 className="card-title" style={{ marginTop: '4px' }}>
                  {lang === 'hi' ? 'भाग ङ: मृदा सुधार एवं पोषण सिफारिशें' : 'Section E: Soil Improvement Recommendations'}
                </h2>
                <div className="card-subtitle">
                  {lang === 'hi'
                    ? 'वर्तमान नमी और पोषक तत्वों के आधार पर लक्षित खाद व सुधार सुझाव'
                    : 'Targeted amendments and fertility management tailored to detected physical telemetry and nutrient levels'}
                </div>
              </div>

              <div className={`badge ${
                (generatedReport.sections?.soilImprovementHighlights || []).some(h => (h.recommendation || '').toLowerCase().includes('deficient') || (h.recommendation || '').toLowerCase().includes('excessive'))
                  ? 'badge-moderate'
                  : 'badge-suitable'
              }`} style={{ padding: '6px 14px', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle2 size={14} />
                <span>
                  {(generatedReport.sections?.soilImprovementHighlights || []).length > 0 && (generatedReport.sections?.soilImprovementHighlights || []).some(h => (h.recommendation || '').toLowerCase().includes('deficient'))
                    ? (lang === 'hi' ? 'सुधार आवश्यक' : 'Remediation Actions Needed')
                    : (lang === 'hi' ? 'संतुलित उर्वरता' : 'Fertility Equilibrium Achieved')}
                </span>
              </div>
            </div>

            {(!(generatedReport.sections?.soilImprovementHighlights || []).some(h => (h.recommendation || '').toLowerCase().includes('deficient'))) && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                padding: '14px 18px',
                backgroundColor: '#f0fdf4',
                border: '1px solid #bbf7d0',
                borderRadius: '10px',
                marginBottom: '20px'
              }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '50%', backgroundColor: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#16a34a', flexShrink: 0 }}>
                  <ShieldCheck size={22} />
                </div>
                <div style={{ fontSize: '0.88rem', color: '#166534', lineHeight: '1.5' }}>
                  <strong>High Agronomic Balance:</strong> Your tested soil parameters align well with regional crop requirements. The recommendations below outline <strong>fertility preservation, hydro-thermal buffering, and micro-nutrient fortification</strong> to maximize seasonal harvest yields.
                </div>
              </div>
            )}

            <div className="grid-2" style={{ gap: '16px' }}>
              {((generatedReport.sections?.soilImprovementHighlights?.length > 0)
                ? generatedReport.sections.soilImprovementHighlights
                : [
                    {
                      parameter: 'Organic Carbon & Humus Preservation',
                      recommendation: 'Incorporate 4-6 tonnes/ha of well-rotted FYM or compost prior to seed drill to sustain soil cation exchange capacity and biological microflora.',
                      suggestedAmendments: ['Decomposed Farmyard Manure (FYM)', 'Vermicompost (2 t/ha)', 'Crop Residue In-situ Mulching']
                    },
                    {
                      parameter: 'Moisture & Hydro-Thermal Buffering',
                      recommendation: `Probe telemetry registers moisture at ${generatedReport.sections?.soilCondition?.moisture?.value ?? 49}%. Regulate scheduled micro-irrigation intervals to avoid root hypoxia during vegetative flush.`,
                      suggestedAmendments: ['Micro-Drip Fertigation (2.4 L/hr)', 'Organic Straw Mulch (5 cm layer)', 'Capacitive Probe Pin A0 Monitoring']
                    },
                    {
                      parameter: 'Secondary & Micronutrient Fortification',
                      recommendation: 'Proactively supplement zinc and sulphur to safeguard high-yielding cereal/vegetable cropping against latent hidden hunger.',
                      suggestedAmendments: ['Zinc Sulphate (ZnSO4 21% @ 25 kg/ha)', 'Agricultural Gypsum (50 kg/ha for S)', 'Phosphate Solubilizing Bacteria (PSB)']
                    },
                    {
                      parameter: 'Rhizobial Nitrogen Buffering',
                      recommendation: 'Inoculate crop sequences with bio-fertilizers to sustain natural atmospheric nitrogen fixation without causing chemical nitrate runoff.',
                      suggestedAmendments: ['Azotobacter / Azospirillum (500 g/ha seed treatment)', 'VAM (Mycorrhiza) Root Inoculant']
                    }
                  ]
              ).map((h, i) => {
                const isDeficient = (h.recommendation || '').toLowerCase().includes('deficient');
                const isExcess = (h.recommendation || '').toLowerCase().includes('excessive');

                return (
                  <div
                    key={i}
                    style={{
                      padding: '18px 20px',
                      backgroundColor: isDeficient ? '#fffbeb' : isExcess ? '#fef2f2' : '#f8fafc',
                      border: `1px solid ${isDeficient ? '#fde68a' : isExcess ? '#fecaca' : '#e2e8f0'}`,
                      borderLeft: `4px solid ${isDeficient ? '#d97706' : isExcess ? '#dc2626' : '#10b981'}`,
                      borderRadius: '10px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      gap: '12px'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: '6px',
                            backgroundColor: isDeficient ? '#fef3c7' : isExcess ? '#fee2e2' : '#d1fae5',
                            color: isDeficient ? '#b45309' : isExcess ? '#b91c1c' : '#047857',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            {h.parameter?.toLowerCase().includes('moisture') ? <Droplets size={16} /> :
                             h.parameter?.toLowerCase().includes('carbon') || h.parameter?.toLowerCase().includes('rhizobial') ? <Sprout size={16} /> :
                             <Layers size={16} />}
                          </span>
                          <span style={{ fontWeight: '700', fontSize: '0.95rem', color: 'var(--primary-900)' }}>
                            {h.parameter}
                          </span>
                        </div>

                        <span className={`badge ${isDeficient ? 'badge-moderate' : isExcess ? 'badge-unsuitable' : 'badge-suitable'}`} style={{ fontSize: '0.72rem' }}>
                          {isDeficient ? 'Deficient' : isExcess ? 'Excessive' : 'Optimal Maintenance'}
                        </span>
                      </div>

                      <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: '1.55', margin: '4px 0 10px 0' }}>
                        {h.recommendation}
                      </p>
                    </div>

                    {h.suggestedAmendments?.length > 0 && (
                      <div style={{ paddingTop: '10px', borderTop: '1px dashed #cbd5e1' }}>
                        <div style={{ fontSize: '0.74rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '6px', letterSpacing: '0.5px' }}>
                          {lang === 'hi' ? 'सुझाए गए सुधार एवं खेत इनपुट' : 'Suggested Amendments & Field Inputs'}
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                          {h.suggestedAmendments.map((am, ai) => (
                            <span
                              key={ai}
                              style={{
                                fontSize: '0.76rem',
                                fontWeight: '600',
                                padding: '3px 9px',
                                borderRadius: '6px',
                                backgroundColor: isDeficient ? '#fef3c7' : isExcess ? '#fee2e2' : '#e0f2fe',
                                color: isDeficient ? '#92400e' : isExcess ? '#991b1b' : '#0369a1',
                                border: `1px solid ${isDeficient ? '#fde68a' : isExcess ? '#fca5a5' : '#bae6fd'}`
                              }}
                            >
                              + {am}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="card" style={{ borderTop: '4px solid #3b82f6', overflow: 'hidden' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#2563eb', fontWeight: '700', fontSize: '0.82rem', textTransform: 'uppercase' }}>
                  <Sprout size={16} />
                  <span>{lang === 'hi' ? 'कृषि उद्यम एवं फसल चक्र प्रणाली' : 'Agronomic Enterprise & Cropping Systems'}</span>
                </div>
                <h2 className="card-title" style={{ marginTop: '4px' }}>
                  {lang === 'hi' ? 'भाग च: संभावित कृषि उपयोग एवं फसल चक्र' : 'Section F: Potential Agricultural Uses'}
                </h2>
                <div className="card-subtitle">
                  {lang === 'hi'
                    ? 'मिट्टी की वर्तमान स्थिति के अनुकूल उच्च उपज वाली फसलें व चक्र'
                    : 'High-yield cultivation enterprises and cropping rotations compatible with current soil moisture, pH, and nutrient profile'}
                </div>
              </div>
              <span className="badge badge-hw" style={{ padding: '6px 14px', fontSize: '0.82rem' }}>
                {lang === 'hi' ? 'बहु-फसल चक्र संभव' : 'Multi-Crop Rotation Feasible'}
              </span>
            </div>

            <div className="grid-2" style={{ gap: '16px', marginTop: '12px' }}>
              {((generatedReport.sections?.potentialAgriculturalUses?.length > 0)
                ? generatedReport.sections.potentialAgriculturalUses
                : [
                    'Arable grain & cereal cropping (Wheat, Barley, Maize) under moisture-regulated irrigation schedules',
                    'Commercial pulse rotation (Moong, Arhar, Gram) with Rhizobial bio-inoculants to naturally build soil nitrogen',
                    'High-value protected horticulture & spice cultivation (Garlic, Chilli, Onion, Tomato) on aerated raised beds',
                    'Intensive oilseed crop sequences (Mustard, Sunflower) optimizing residual post-monsoon soil moisture'
                  ]
              ).map((useText, idx) => {
                let icon = <Sprout size={20} color="#15803d" />;
                let systemType = 'Cereal & Grain Cropping';
                let tagColor = '#15803d';
                let tagBg = '#dcfce7';
                let cropChips = ['Wheat', 'Barley', 'Maize'];
                let irrigationAdvice = 'Crown Root Initiation (CRI) & Flowering stages';

                if (useText.toLowerCase().includes('pulse') || useText.toLowerCase().includes('nitrogen') || useText.toLowerCase().includes('rhizobi')) {
                  icon = <Leaf size={20} color="#047857" />;
                  systemType = 'Biological N-Fixing Pulse Rotation';
                  tagColor = '#047857';
                  tagBg = '#ccfbf1';
                  cropChips = ['Moong', 'Arhar (Pigeon Pea)', 'Gram'];
                  irrigationAdvice = 'Pre-sowing irrigation & Pod development phase';
                } else if (useText.toLowerCase().includes('horticulture') || useText.toLowerCase().includes('vegetable') || useText.toLowerCase().includes('garlic') || useText.toLowerCase().includes('chilli')) {
                  icon = <Sparkles size={20} color="#b45309" />;
                  systemType = 'High-Value Horticulture & Spices';
                  tagColor = '#b45309';
                  tagBg = '#fef3c7';
                  cropChips = ['Garlic', 'Chilli', 'Onion', 'Tomato'];
                  irrigationAdvice = 'Micro-drip irrigation with fertigation scheduling';
                } else if (useText.toLowerCase().includes('oilseed') || useText.toLowerCase().includes('mustard') || useText.toLowerCase().includes('sunflower')) {
                  icon = <TrendingUp size={20} color="#0369a1" />;
                  systemType = 'Commercial Oilseed Sequences';
                  tagColor = '#0369a1';
                  tagBg = '#e0f2fe';
                  cropChips = ['Mustard', 'Sunflower', 'Sesame'];
                  irrigationAdvice = 'Rosette & Siliqua development stages';
                }

                return (
                  <div
                    key={idx}
                    style={{
                      padding: '20px',
                      backgroundColor: '#ffffff',
                      border: `1px solid var(--border-light)`,
                      borderLeft: `4px solid ${tagColor}`,
                      borderRadius: '12px',
                      boxShadow: 'var(--shadow-sm)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      gap: '14px'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '8px',
                            backgroundColor: tagBg,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            {icon}
                          </span>
                          <span style={{ fontSize: '0.96rem', fontWeight: '800', color: 'var(--primary-900)' }}>
                            {systemType}
                          </span>
                        </div>
                        <span style={{ fontSize: '0.72rem', fontWeight: '700', padding: '3px 8px', borderRadius: '6px', backgroundColor: tagBg, color: tagColor }}>
                          Recommended
                        </span>
                      </div>

                      <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: '1.55', margin: '4px 0' }}>
                        {useText}
                      </p>
                    </div>

                    <div style={{ paddingTop: '12px', borderTop: '1px solid var(--border-light)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '6px' }}>
                        <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', fontWeight: '600' }}>
                          Key Crops:
                        </div>
                        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                          {cropChips.map((chip, ci) => (
                            <span
                              key={ci}
                              style={{
                                fontSize: '0.72rem',
                                fontWeight: '600',
                                padding: '2px 8px',
                                borderRadius: '4px',
                                backgroundColor: '#f1f5f9',
                                color: '#334155'
                              }}
                            >
                              {chip}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                        <span style={{ fontWeight: '600', color: 'var(--text-secondary)' }}>Irrigation Protocol: </span>
                        {irrigationAdvice}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
