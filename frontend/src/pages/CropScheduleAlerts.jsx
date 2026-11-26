import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import SeasonSuitabilityAdvisory from '../components/SeasonSuitabilityAdvisory';
import { formatAlertMessage, formatAlertType } from '../utils/alertUtils';
import {
  Calendar,
  MapPin,
  Compass,
  AlertTriangle,
  Bell,
  CloudRain,
  CheckCircle,
  Siren,
  Volume2,
  Clock,
  Droplets,
  Check,
  RefreshCw,
  Scissors,
  Archive,
  History,
  ShieldCheck,
  Sliders,
  ChevronDown,
  Plus,
  Phone,
  Settings,
  ChevronUp,
  X,
  ArrowRight,
  Sprout,
  Radio,
  Sun,
  Cpu,
  Wifi,
  WifiOff,
  Thermometer,
  Trash2
} from 'lucide-react';

const CROP_NAME_MAP = {
  Wheat: { hi: 'गेहूं', en: 'Wheat' },
  Mustard: { hi: 'सरसों', en: 'Mustard' },
  Rice: { hi: 'बासमती धान', en: 'Rice (Basmati)' },
  Maize: { hi: 'मक्का', en: 'Maize' },
  Cotton: { hi: 'कपास', en: 'Cotton' }
};

const STAGE_TRANSLATIONS = {
  'Germination & Sowing (Basal)': {
    nameHi: 'बीज अंकुरण व शुरुआती बढ़वार (0-20 दिन)',
    descHi: 'बीज से नया नन्हा पौधा निकल रहा है और जड़ें पकड़ रहा है।',
    waterHi: 'हल्की नमी रखें (45-55%)'
  },
  'Crown Root Initiation (CRI / Vegetative)': {
    nameHi: 'कल्ले फूटना व जड़ें जमना (21-45 दिन) — पहली मुख्य सिंचाई',
    descHi: 'पौधे में नए कल्ले फूटने का सबसे महत्वपूर्ण समय। इस समय पानी की कमी न होने दें।',
    waterHi: 'भरपूर नमी अनिवार्य (50-60%)'
  },
  'Panicle / Heading (Flowering)': {
    nameHi: 'बाली निकलना व फूल आना (46-85 दिन) — दूसरी मुख्य सिंचाई',
    descHi: 'बालियों का विकास और परागण हो रहा है। दाने की संख्या इसी पर निर्भर करती है।',
    waterHi: 'संतुलित नमी (50-55%)'
  },
  'Grain Formation (Dough Stage)': {
    nameHi: 'दाना भराव (दूधिया अवस्था, 86-115 दिन)',
    descHi: 'बालियों के अंदर दूधिया रस भर रहा है और दाना मोटा हो रहा है। हल्का पानी दें।',
    waterHi: 'मध्यम नमी (40-45%)'
  },
  'Harvest Maturity (कटाई चरण)': {
    nameHi: 'फसल पकना व कटाई (116-135 दिन)',
    descHi: 'फसल सुनहरी पीली हो गई है। कटाई से 15 दिन पहले पानी पूरी तरह बंद रखें।',
    waterHi: 'सूखी मिट्टी (< 25%) — पानी बंद रखें'
  },
  'Harvest Maturity': {
    nameHi: 'फसल पकना व कटाई (116-135 दिन)',
    descHi: 'फसल सुनहरी पीली हो गई है। कटाई से 15 दिन पहले पानी पूरी तरह बंद रखें।',
    waterHi: 'सूखी मिट्टी (< 25%) — पानी बंद रखें'
  },
  'Pre-Sowing / Field Preparation': {
    nameHi: 'खेत की तैयारी व पलेवा (बुवाई से पहले)',
    descHi: 'खेत की गहरी जुताई और बीज बोने से पहले रौणी सिंचाई (पलेवा)।',
    waterHi: 'पलेवा (45-50% नमी)'
  },
  'Pre-Sowing / Field Preparation (खेत की तैयारी व पलेवा)': {
    nameHi: 'खेत की तैयारी व पलेवा (बुवाई से पहले)',
    descHi: 'खेत की गहरी जुताई और बीज बोने से पहले रौणी सिंचाई (पलेवा)।',
    waterHi: 'पलेवा (45-50% नमी)'
  }
};

const COMMON_DISTRICTS = [
  { district: 'Ludhiana', state: 'Punjab (Dry/Rabi)', lat: 30.9010, lon: 75.8573 },
  { district: 'Karnal', state: 'Haryana (Dry/Rabi)', lat: 29.6857, lon: 76.9905 },
  { district: 'Nashik', state: 'Maharashtra (Dry)', lat: 19.9975, lon: 73.7898 },
  { district: 'Varanasi', state: 'Uttar Pradesh (Dry)', lat: 25.3176, lon: 82.9739 },
  { district: 'Kota', state: 'Rajasthan (Dry)', lat: 25.2138, lon: 75.8648 },
  { district: 'Thanjavur', state: 'Tamil Nadu (Active Rain 🌧️)', lat: 10.7870, lon: 79.1378 },
  { district: 'Chennai', state: 'Tamil Nadu (Coastal Rain 🌧️)', lat: 13.0827, lon: 80.2707 },
  { district: 'Palakkad', state: 'Kerala (Rain Showers 🌧️)', lat: 10.7867, lon: 76.6548 },
  { district: 'Cherrapunji', state: 'Meghalaya (Rainy 🌧️)', lat: 25.2702, lon: 91.7323 },
  { district: 'Guntur', state: 'Andhra Pradesh', lat: 16.3067, lon: 80.4365 },
  { district: 'Indore', state: 'Madhya Pradesh', lat: 22.7196, lon: 75.8577 },
  { district: 'Anand', state: 'Gujarat', lat: 22.5645, lon: 72.9289 }
];

export default function CropScheduleAlerts() {
  const { lang, t, speak } = useLanguage();
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [allFarms, setAllFarms] = useState([]);

  const plotParam = searchParams.get('plotId');
  const activePlotId = allFarms.some(f => f.plotId === plotParam)
    ? plotParam
    : (allFarms.length > 0 ? allFarms[0]?.plotId : null);

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');
  const [currentMoisture, setCurrentMoisture] = useState(34);
  const [isLiveMode, setIsLiveMode] = useState(true);
  const [hardwareDetected, setHardwareDetected] = useState(false);
  const [locLoading, setLocLoading] = useState(false);
  const [locSuccess, setLocSuccess] = useState('');

  const [userDbAlerts, setUserDbAlerts] = useState([]);
  const [loadingDbAlerts, setLoadingDbAlerts] = useState(false);
  const [alertActionMsg, setAlertActionMsg] = useState('');

  const [cropName, setCropName] = useState('');
  const [variety, setVariety] = useState('');
  const [acreage, setAcreage] = useState(2.5);
  const [sowingDate, setSowingDate] = useState(new Date().toISOString().split('T')[0]);
  const [assignedDeviceId, setAssignedDeviceId] = useState('DEVICE_001');
  const [currentTemperature, setCurrentTemperature] = useState(null);
  const [tempSource, setTempSource] = useState('GPS');
  const [availableDevices, setAvailableDevices] = useState([
    { deviceId: 'DEVICE_001', name: 'डिवाइस 1: Arduino Uno (USB कनेक्टेड)', nameEn: 'Device 1: Arduino Uno (USB Connected)', online: true },
    { deviceId: 'NONE', name: 'कोई डिवाइस नहीं (केवल टाइमलाइन मोड)', nameEn: 'No Device (Timeline Tracking Only)', online: false }
  ]);
  const [showLocationModal, setShowLocationModal] = useState(false);

  const [showHarvestModal, setShowHarvestModal] = useState(false);
  const [harvestYield, setHarvestYield] = useState(22);
  const [harvestNotes, setHarvestNotes] = useState('');
  const [harvesting, setHarvesting] = useState(false);

  const [showAddFarmModal, setShowAddFarmModal] = useState(false);
  const [newFarmName, setNewFarmName] = useState('');
  const [newDistrict, setNewDistrict] = useState('Ludhiana');
  const [newState, setNewState] = useState('Punjab');
  const [newAcreage, setNewAcreage] = useState(2.5);
  const [newCropName, setNewCropName] = useState('');
  const [newVariety, setNewVariety] = useState('');
  const [newSowingDate, setNewSowingDate] = useState(new Date().toISOString().split('T')[0]);
  const [newAssignedDeviceId, setNewAssignedDeviceId] = useState('DEVICE_001');
  const [addingFarm, setAddingFarm] = useState(false);

  const [showNotifDrawer, setShowNotifDrawer] = useState(false);
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

  const fetchAllFarms = async () => {
    try {
      const res = await axios.get('/api/advisory/farms');
      if (res.data?.success) {
        const farms = res.data.data || [];
        setAllFarms(farms);
        const currentParam = searchParams.get('plotId');
        if (farms.length > 0) {
          if (!currentParam || !farms.some(f => f.plotId === currentParam)) {
            setSearchParams({ plotId: farms[0].plotId });
          }
        } else {
          setSearchParams({});
          setData(null);
        }
      }
    } catch (e) {
      console.error('Fetch farms list error:', e);
      setAllFarms([]);
      setData(null);
    }
  };

  const fetchUserDbAlerts = async () => {
    try {
      setLoadingDbAlerts(true);
      const res = await axios.get('/api/alerts');
      if (res.data?.success) {
        setUserDbAlerts(res.data.data || []);
      }
    } catch (e) {
      console.error('Fetch user alerts error:', e);
    } finally {
      setLoadingDbAlerts(false);
    }
  };

  const handleDeleteDbAlert = async (alertId) => {
    try {
      await axios.delete(`/api/alerts/${alertId}`);
      setUserDbAlerts(prev => prev.filter(a => a._id !== alertId));
      setAlertActionMsg(lang === 'hi' ? 'अलर्ट सफलतापूर्वक हटा दिया गया।' : 'Alert removed from your account.');
      setTimeout(() => setAlertActionMsg(''), 4000);
    } catch (e) {
      alert(lang === 'hi' ? 'अलर्ट हटाने में त्रुटि।' : 'Failed to delete alert.');
    }
  };

  const handleCreateTestAlert = async () => {
    try {
      const res = await axios.post('/api/alerts', {
        plotId: activePlotId || (allFarms[0]?.plotId) || 'PLOT_001',
        type: 'CRITICAL_MOISTURE_LOW',
        severity: 'high',
        message: lang === 'hi'
          ? `${cropName} (${activePlotId || 'खेत'}) के लिए मिट्टी की नमी अति-गंभीर (22%) — उपयोगकर्ता-विशिष्ट सुरक्षित अलर्ट`
          : `Critical Low Soil Moisture Alert (22%) for ${cropName} (${activePlotId || 'Farm'}) — Stored in MongoDB for your user ID`,
        value: currentMoisture,
        threshold: notifConfig.criticalThreshold || 24
      });
      if (res.data?.success) {
        await fetchUserDbAlerts();
        setAlertActionMsg(lang === 'hi' ? 'नया अलर्ट आपके खाते में सफलतापूर्वक जोड़ा गया।' : 'Test alert created and linked to your User ID.');
        setTimeout(() => setAlertActionMsg(''), 4000);
      }
    } catch (e) {
      alert(lang === 'hi' ? 'अलर्ट बनाने में त्रुटि।' : 'Failed to create alert.');
    }
  };

  useEffect(() => {
    setAllFarms([]);
    setData(null);
    setUserDbAlerts([]);
    fetchAllFarms();
    fetchUserDbAlerts();
  }, [user?._id, user?.email]);

  useEffect(() => {
    let active = true;
    const fetchLatestA0 = async () => {
      try {
        const deviceToPoll = (assignedDeviceId && assignedDeviceId !== 'NONE') ? assignedDeviceId : 'DEVICE_001';
        const res = await axios.get(`/api/sensor/latest/${deviceToPoll}`);
        if (res.data?.success && res.data.data) {
          if (active) {
            setHardwareDetected(true);
            const mVal = res.data.data.moisturePercentage !== undefined
              ? res.data.data.moisturePercentage
              : res.data.data.moisture;
            if (isLiveMode && mVal !== undefined && mVal !== null) {
              setCurrentMoisture(Math.round(mVal));
            }
            if (res.data.data.temperature !== null && res.data.data.temperature !== undefined && !isNaN(res.data.data.temperature)) {
              setCurrentTemperature(res.data.data.temperature);
              setTempSource('HARDWARE');
            } else if (data?.effectiveTemperature?.value || data?.weather?.temperatureCelsius) {
              setCurrentTemperature(data?.effectiveTemperature?.value || data?.weather?.temperatureCelsius);
              setTempSource('GPS');
            }
          }
        }
      } catch (e) {
        if (active) setHardwareDetected(false);
      }
    };

    fetchLatestA0();
    const interval = setInterval(fetchLatestA0, 3000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [isLiveMode, assignedDeviceId]);

  const fetchScheduleAndAlerts = async () => {
    if (!activePlotId || allFarms.length === 0) {
      setLoading(false);
      setData(null);
      return;
    }
    try {
      setLoading(true);
      const res = await axios.get(`/api/advisory/crop-schedule?plotId=${activePlotId}&currentMoisture=${currentMoisture}`);
      if (res.data?.success && res.data?.hasFarm && res.data?.data) {
        setData(res.data.data);
        const sched = res.data.data.schedule;
        if (res.data.data.assignedDeviceId) {
          setAssignedDeviceId(res.data.data.assignedDeviceId);
        } else if (sched?.assignedDeviceId) {
          setAssignedDeviceId(sched.assignedDeviceId);
        }
        if (res.data.data.availableDevices?.length > 0) {
          setAvailableDevices(res.data.data.availableDevices);
        }
        if (sched) {
          setCropName(sched.cropName || '');
          setVariety(sched.variety || '');
          setAcreage(sched.acreage || 2.5);
          if (sched.sowingDate) {
            setSowingDate(sched.sowingDate.split('T')[0]);
          }
          if (sched.notifications) {
            setNotifConfig(prev => ({ ...prev, ...sched.notifications }));
          }
        }
      } else {
        setData(null);
      }
    } catch (err) {
      console.error('Fetch schedule error:', err);
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScheduleAndAlerts();
  }, [activePlotId, currentMoisture]);

  const handleAutoDetectGPS = () => {
    if (!navigator.geolocation) {
      alert(lang === 'hi' ? 'ब्राउज़र में जीपीएस सपोर्ट नहीं है।' : 'Geolocation is not supported by your browser.');
      return;
    }
    setLocLoading(true);
    setLocSuccess('');
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const res = await axios.post('/api/advisory/update-location', {
            plotId: activePlotId,
            district: 'Detected Farm GPS',
            state: 'India',
            lat: latitude,
            lon: longitude,
            autoDetected: true
          });
          const rainMm = res.data?.data?.weather?.forecastRainNext24hMm !== undefined
            ? res.data.data.weather.forecastRainNext24hMm
            : 0;
          setLocSuccess(
            lang === 'hi'
              ? `जीपीएस अपडेट: ${latitude.toFixed(2)}°N, ${longitude.toFixed(2)}°E | 24h वर्षा पूर्वानुमान: ${rainMm} mm`
              : `GPS Updated: ${latitude.toFixed(2)}°N, ${longitude.toFixed(2)}°E | 24h Live Rain Forecast: ${rainMm} mm`
          );
          if (res.data?.data?.evaluation) {
            setData(res.data.data.evaluation);
          } else {
            await fetchScheduleAndAlerts();
          }
        } catch (e) {
          console.error(e);
        } finally {
          setLocLoading(false);
        }
      },
      (err) => {
        setLocLoading(false);
        alert(lang === 'hi' ? 'जीपीएस लोकेशन प्राप्त नहीं हो सकी। कृपया मैन्युअल रूप से जिला चुनें।' : 'Could not retrieve GPS coordinates. Please select district manually.');
      },
      { timeout: 8000 }
    );
  };

  const handleSelectDistrict = async (distObj) => {
    try {
      setLocLoading(true);
      const res = await axios.post('/api/advisory/update-location', {
        plotId: activePlotId,
        district: distObj.district,
        state: distObj.state,
        lat: distObj.lat,
        lon: distObj.lon,
        autoDetected: false
      });
      const rainMm = res.data?.data?.weather?.forecastRainNext24hMm !== undefined
        ? res.data.data.weather.forecastRainNext24hMm
        : 0;
      setLocSuccess(
        lang === 'hi'
          ? `स्थान अपडेट: ${distObj.district}, ${distObj.state} | लाइव वर्षा पूर्वानुमान: ${rainMm} mm`
          : `Location Updated: ${distObj.district}, ${distObj.state} | Live Rain Forecast: ${rainMm} mm`
      );
      setShowLocationModal(false);
      if (res.data?.data?.evaluation) {
        setData(res.data.data.evaluation);
      } else {
        await fetchScheduleAndAlerts();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLocLoading(false);
    }
  };

  const handleSaveSchedule = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccessMsg('');
    try {
      const res = await axios.post('/api/advisory/crop-schedule', {
        plotId: activePlotId,
        cropName,
        variety,
        sowingDate,
        acreage: +acreage,
        currentMoisture: +currentMoisture,
        assignedDeviceId
      });

      if (res.data?.success && res.data?.data) {
        setData(res.data.data);
        const dasMsg = res.data.data.isFuture
          ? (lang === 'hi' ? `योजनाबद्ध बुवाई: ${res.data.data.daysUntilSowing} दिन बाद` : `Planned Sowing: in ${res.data.data.daysUntilSowing} Days`)
          : (lang === 'hi' ? `बुवाई के ${res.data.data.das} दिन बाद (सक्रिय विकास)` : `Day ${res.data.data.das} After Sowing`);

        setSaveSuccessMsg(
          lang === 'hi'
            ? `फसल शेड्यूलर सफलतापूर्वक सुरक्षित हुआ! यह फसल कटाई तक सक्रिय रहेगा। (${dasMsg})`
            : `Crop schedule saved successfully! Tracking continuously until harvest. (${dasMsg})`
        );
        fetchAllFarms();
      }
    } catch (e) {
      console.error('Save failed:', e);
      alert(lang === 'hi' ? 'अपडेट करने में त्रुटि आई। कृपया पुनः प्रयास करें।' : 'Error updating schedule. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleHarvestSubmit = async (e) => {
    e.preventDefault();
    setHarvesting(true);
    try {
      const res = await axios.post('/api/advisory/crop-harvest', {
        plotId: activePlotId,
        actualYieldQuintals: +harvestYield,
        harvestNotes
      });
      if (res.data?.success && res.data?.data) {
        setData(res.data.data);
        setShowHarvestModal(false);
        setSaveSuccessMsg(
          lang === 'hi'
            ? 'फसल कटाई सफलतापूर्वक दर्ज हो गई और इतिहास में सुरक्षित कर ली गई है!'
            : 'Crop marked as harvested and permanently archived in history!'
        );
        fetchAllFarms();
      }
    } catch (err) {
      console.error('Harvest submit failed:', err);
      alert(lang === 'hi' ? 'कटाई दर्ज करने में त्रुटि आई।' : 'Error recording harvest.');
    } finally {
      setHarvesting(false);
    }
  };

  const handleSaveNotifications = async (e) => {
    e.preventDefault();
    setSavingNotif(true);
    try {
      const res = await axios.post('/api/advisory/farm-notifications', {
        plotId: activePlotId,
        notifications: notifConfig,
        assignedDeviceId
      });
      if (res.data?.success) {
        setShowNotifDrawer(false);
        setSaveSuccessMsg(
          lang === 'hi'
            ? `इस फसल (${cropDisplayName}) के लिए अलर्ट व नोटिफिकेशन नियम सुरक्षित हो गए!`
            : `Alert & notification rules saved for this crop (${cropDisplayName})!`
        );
        fetchScheduleAndAlerts();
        fetchAllFarms();
      }
    } catch (err) {
      console.error('Save notifications error:', err);
      alert(lang === 'hi' ? 'अलर्ट नियम सुरक्षित करने में त्रुटि आई।' : 'Error updating notification rules.');
    } finally {
      setSavingNotif(false);
    }
  };

  const handleAddFarmSubmit = async (e) => {
    e.preventDefault();
    if (!newCropName) {
      alert(lang === 'hi' ? 'कृपया इस खेत के लिए फसल का चयन करें (अनिवार्य)।' : 'Please select a dedicated crop for this farm (Mandatory).');
      return;
    }
    setAddingFarm(true);
    try {
      const res = await axios.post('/api/advisory/farms', {
        name: newFarmName,
        district: newDistrict,
        state: newState,
        acreage: +newAcreage,
        cropName: newCropName,
        variety: newVariety || `${newCropName} Certified Seed`,
        sowingDate: newSowingDate,
        assignedDeviceId: newAssignedDeviceId
      });
      if (res.data?.success && res.data?.data?.plot) {
        const createdPlotId = res.data.data.plot.plotId;
        setShowAddFarmModal(false);
        setNewFarmName('');
        setNewCropName('');
        setNewVariety('');
        await fetchAllFarms();
        setSearchParams({ plotId: createdPlotId });
        setSaveSuccessMsg(
          lang === 'hi'
            ? `नया खेत सफलता से जोड़ा गया (${createdPlotId}) और ${newCropName} फसल सेट हो गई!`
            : `New Farm (${createdPlotId}) successfully added with ${newCropName} crop!`
        );
      }
    } catch (err) {
      console.error('Add farm failed:', err);
      alert(lang === 'hi' ? 'खेत जोड़ने में त्रुटि आई।' : (err.response?.data?.error || 'Error adding farm.'));
    } finally {
      setAddingFarm(false);
    }
  };

  const alertData = data?.alert;
  const sched = data?.schedule || {};
  const hasLiveDevice = data?.hasLiveDevice !== false && assignedDeviceId !== 'NONE';
  const isHypoxia = hasLiveDevice && (alertData?.alertLevel === 'HYPOXIA_WARNING' || alertData?.alertLevel === 'WATERLOGGING_ALERT' || currentMoisture >= 65);
  const isCritical = hasLiveDevice && (alertData?.alertLevel === 'CRITICAL_HIGH_RISK' || currentMoisture <= 25);
  const isSooner = hasLiveDevice && alertData?.alertLevel === 'SOONER_NOTICE';
  const isRain = hasLiveDevice && alertData?.alertLevel === 'RAIN_SUPPRESSED';
  const isHarvest = alertData?.alertLevel === 'HARVEST_ALERT';
  const isTimelineOnly = !hasLiveDevice;

  const liters = data?.irrigation?.recommendedWaterVolumeLiters || 0;
  const pumpHours = liters > 0 ? (liters / 28000).toFixed(1) : '0';
  const lakhLiters = (liters / 100000).toFixed(2);
  const tankerCount = Math.round(liters / 10000);

  const handleVoiceNarration = () => {
    if (!data?.alert) return;
    const crop = cropDisplayName;
    const rain = data?.weather?.forecastRainNext24hMm || 0;

    let speech = '';
    if (lang === 'hi') {
      if (isTimelineOnly) {
        speech = `किसान भाई, आपके खेत में ${crop} की फसल लगी है। इस खेत से कोई लाइव डिवाइस कनेक्ट नहीं है, इसलिए लाइव नमी अलर्ट उपलब्ध नहीं हैं। वर्तमान में फसल ${getStageName(data?.currentStage)} में है। समय-सारणी अनुसार सामान्य देखभाल रखें।`;
      } else if (isHypoxia) {
        speech = `सावधान किसान भाई, खेत में नमी अत्यधिक बढ़कर ${currentMoisture} प्रतिशत हो गई है। फसल में जलभराव व जड़ सड़न का गंभीर खतरा है। मोटर बिल्कुल बंद रखें और खेत से अतिरिक्त पानी निकालने की व्यवस्था करें।`;
      } else if (rain >= 5) {
        speech = `किसान भाई, आपके खेत में ${crop} की फसल लगी है। अगले 24 घंटे में ${rain} मिलीमीटर बारिश का अनुमान है, इसलिए आज ट्यूबवेल मोटर बंद रखें और बिजली व पानी बचाएं।`;
      } else if (isCritical) {
        speech = `सावधान किसान भाई, खेत में नमी गिरकर ${currentMoisture} प्रतिशत रह गई है। ${crop} की फसल सूखने का खतरा है। तुरंत ट्यूबवेल चलाएं और लगभग ${pumpHours} घंटे पानी दें।`;
      } else if (isSooner) {
        speech = `राम राम किसान भाई, आपके ${crop} के खेत में मिट्टी की नमी ${currentMoisture} प्रतिशत है। अगले एक से दो दिन में लगभग ${pumpHours} घंटे सिंचाई की तैयारी करें। पानी देने का सही समय कल सुबह साढ़े पांच से साढ़े सात बजे का है।`;
      } else if (isHarvest) {
        speech = `बधाई हो किसान भाई, ${crop} की फसल पूरी तरह पककर तैयार है। कटाई की तैयारी करें और खेत को सूखा रखें।`;
      } else {
        speech = `किसान भाई, आपके खेत में ${crop} की नमी संतुलित है। आज पानी देने की कोई आवश्यकता नहीं है।`;
      }
    } else {
      if (isTimelineOnly) {
        speech = `Farmer friend, no live hardware device is connected to this farm. Real-time moisture alerts are unavailable. Crop is progressing on its calendar timeline at stage ${getStageName(data?.currentStage)}.`;
      } else if (isHypoxia) {
        speech = `Warning farmer friend, soil moisture is excessively high at ${currentMoisture} percent. Severe waterlogging and root rot danger. Keep all irrigation pumps off and ensure drainage channels are clear.`;
      } else {
        speech = `Farmer friend, for your ${crop} crop on ${activePlotId}, soil moisture is ${currentMoisture} percent. ${rain >= 5 ? `Rain is expected. Keep pump motor off.` : isCritical || isSooner ? `Recommended pump runtime is approximately ${pumpHours} hours. Best watering window is 5:30 to 7:30 AM.` : `Soil condition is optimal. No watering needed today.`}`;
      }
    }
    speak(speech);
  };

  const expectedHarvestStr = data?.expectedHarvestDate
    ? new Date(data.expectedHarvestDate).toLocaleDateString(lang === 'hi' ? 'hi-IN' : 'en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : '—';

  const cropDisplayName = lang === 'hi'
    ? (CROP_NAME_MAP[sched?.cropName]?.hi || (sched?.cropName === 'Wheat' ? 'गेहूं' : sched?.cropName === 'Mustard' ? 'सरसों' : sched?.cropName === 'Rice' ? 'बासमती धान' : sched?.cropName === 'Maize' ? 'मक्का' : sched?.cropName === 'Cotton' ? 'कपास' : sched?.cropName) || 'गेहूं')
    : (CROP_NAME_MAP[sched?.cropName]?.en || sched?.cropName || 'Wheat');

  const getStageName = (st) => {
    if (!st) return '';
    if (lang === 'hi') {
      return st.stageNameHi || STAGE_TRANSLATIONS[st.stageName]?.nameHi || st.stageName;
    }
    return st.stageName;
  };

  const getStageDesc = (st) => {
    if (!st) return '';
    if (lang === 'hi') {
      return st.descriptionHi || STAGE_TRANSLATIONS[st.stageName]?.descHi || st.description;
    }
    return st.description;
  };

  const getStageWater = (st) => {
    if (!st) return '';
    if (lang === 'hi') {
      return st.waterNeedHi || STAGE_TRANSLATIONS[st.stageName]?.waterHi || st.waterNeed;
    }
    return st.waterNeed;
  };

  const getLocationDisplay = () => {
    const dist = sched?.location?.district || 'Ludhiana';
    const st = sched?.location?.state || 'Punjab';
    if (lang === 'hi') {
      if (dist.includes('Detected') || dist.includes('GPS')) {
        return 'स्वतः-पहचाना गया खेत GPS, भारत';
      }
      if (dist === 'Ludhiana') return 'लुधियाना, पंजाब';
      if (dist === 'Bathinda') return 'बठिंडा, पंजाब';
      if (dist === 'Karnal') return 'करनाल, हरियाणा';
      if (dist === 'Hisar') return 'हिसार, हरियाणा';
      return `${dist}, ${st}`;
    }
    return `${dist}, ${st}`;
  };

  const displayAlertTitle = lang === 'hi'
    ? (alertData?.alertTitleHi || (
        isTimelineOnly ? `फसल समय-सीमा मोड (Timeline): ${getStageName(data?.currentStage)}` :
        isHypoxia ? 'अत्यधिक जलभराव एवं जड़ सड़न (ऑक्सीजन ह्रास) का गंभीर खतरा' :
        isCritical ? 'अति-गंभीर जल संकट: फसल मुरझाने का उच्च खतरा' :
        isSooner ? 'पूर्व सूचना: मृदा नमी स्तर धीरे-धीरे घट रहा है' :
        isRain ? 'वर्षा आगमन: बिजली व जल बचाने हेतु सिंचाई स्थगित' :
        isHarvest ? 'फसल पककर तैयार है — कटाई का उपयुक्त समय' :
        'मृदा नमी स्तर उत्तम एवं संतुलित'
      ))
    : (alertData?.alertTitle || alertData?.alertTitleEn || (isHypoxia ? 'WATERLOGGING & ROOT HYPOXIA DANGER' : 'Soil Moisture Level Healthy'));

  const displayAlertDescription = lang === 'hi'
    ? (alertData?.alertDescriptionHi || (
        isTimelineOnly ? `इस खेत से कोई लाइव Arduino सेंसर कनेक्ट नहीं है। आप लाइव नमी अलर्ट सेट नहीं कर सकते — केवल फसल समय-सीमा और विकास अवस्थाएं (दिन ${data?.das || 0} / ${sched?.totalDurationDays || 135}) ही ट्रैक की जा रही हैं।` :
        isHypoxia ? `मिट्टी की नमी लगातार ${currentMoisture}% पर अति-संतृप्त है। जड़ों के सूक्ष्म वायु छिद्र पानी में डूब चुके हैं, जिससे फंगस व जड़ सड़न का संकट है।` :
        isCritical ? `सेंसर नमी गिरकर ${currentMoisture}% रह गई है (क्रांतिक सीमा 24% से कम)। फसल को नुकसान से बचाने हेतु तत्काल पानी दें।` :
        isSooner ? `मिट्टी की नमी ${currentMoisture}% तक आ गई है (पूर्व सूचना सीमा 40% के निकट)। नमी दर ~0.3%/घंटे घट रही है। अगले 48 घंटों में बारिश की संभावना नहीं है।` :
        isRain ? `मिट्टी में नमी कम है, लेकिन आगामी बारिश से खेत सिंचित हो जाएगा। मोटर स्थगित रखें।` :
        isHarvest ? `फसल ने अपना विकास पूरा कर लिया है। सड़न रोकने हेतु खेत को सूखा रखें।` :
        `वर्तमान नमी (${currentMoisture}%) संतुलित स्तर में है।`
      ))
    : (alertData?.alertDescription || alertData?.alertDescriptionEn || (isHypoxia ? `Soil moisture is persistently saturated at ${currentMoisture}%. Capillary air pores are drowned, inviting Pythium damping-off root rot.` : `Current moisture (${currentMoisture}%) is well within the optimal range.`));

  const displayRecommendedAction = lang === 'hi'
    ? (alertData?.recommendedActionHi || (
        isTimelineOnly ? `फसल समय-सारणी के अनुसार ${getStageName(data?.currentStage)} के कृषि कार्य करें। लाइव अलर्ट चालू करने हेतु अलर्ट नियमों में डिवाइस चुनें।` :
        isHypoxia ? 'सिंचाई तुरंत रोकें। निचले खेत से खड़े पानी को नाली काटकर बाहर निकालें।' :
        isCritical ? 'सिंचाई पंप तत्काल चालू करें। प्रातः 5:30 से 7:30 बजे के बीच लगभग 14,000 लीटर/एकड़ जल दें।' :
        isSooner ? `अगले 24 से 36 घंटों में सिंचाई चक्र की योजना बनाएं। वर्तमान अवस्था: ${getStageName(data?.currentStage)}।` :
        isRain ? 'पंप मोटर बंद रखें। खेत की जल निकासी नालियों को खुला रखें।' :
        isHarvest ? 'कंबाइन या दरांती से कटाई की योजना बनाएं।' :
        'वर्तमान में सिंचाई की आवश्यकता नहीं है। दैनिक निगरानी जारी रखें।'
      ))
    : (alertData?.recommendedAction || alertData?.recommendedActionEn || (isHypoxia ? 'Halt all irrigation pumps immediately. Clear surface drain trenches.' : 'No irrigation required. Continue routine monitoring.'));

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px 16px' }}>

      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MapPin size={18} color="#16a34a" />
              <span style={{ fontSize: '15px', fontWeight: '800', color: '#166534', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {lang === 'hi' ? 'खेत एवं फसल चयन — इस फसल के अंदर जाएं:' : 'Farm & Dedicated Crop Switcher — Move Inside Crop:'}
              </span>
            </div>
            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
              {lang === 'hi'
                ? 'नियम: 1 खेत = 1 पूरी समर्पित फसल (संपूर्ण खेत में एक ही फसल, कोई मिश्रित खेती नहीं)'
                : 'Rule: 1 Farm = 1 Whole Dedicated Crop (Entire plot dedicated to single crop, no intercropping)'}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <Link
              to="/farm-management"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: '#ffffff',
                border: '1.5px solid #cbd5e1',
                color: '#334155',
                padding: '6px 12px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: '700',
                textDecoration: 'none'
              }}
            >
              <Sliders size={14} />
              <span>{lang === 'hi' ? 'सभी खेत प्रबंधित करें' : 'Manage All Farms'}</span>
            </Link>

            <button
              onClick={() => setShowAddFarmModal(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: '#ecfdf5',
                border: '1.5px solid #10b981',
                color: '#065f46',
                padding: '6px 12px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: '700',
                cursor: 'pointer'
              }}
            >
              <Plus size={14} />
              <span>{lang === 'hi' ? '+ नया खेत जोड़ें' : '+ Add Farm'}</span>
            </button>
          </div>
        </div>

        {allFarms.length === 0 ? (
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            border: '2px dashed #cbd5e1',
            padding: '50px 24px',
            textAlign: 'center',
            marginTop: '16px'
          }}>
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              backgroundColor: '#ecfdf5',
              color: '#10b981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px auto'
            }}>
              <Sprout size={32} />
            </div>
            <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a', marginBottom: '8px' }}>
              {lang === 'hi' ? 'कोई खेत या फसल पंजीकृत नहीं है' : 'No Farms or Crops Added Yet'}
            </h3>
            <p style={{ color: '#64748b', fontSize: '14px', maxWidth: '520px', margin: '0 auto 20px auto', lineHeight: '1.6' }}>
              {lang === 'hi'
                ? `नमस्ते ${user?.name || 'किसान साथी'}! आपके खाते में कोई डिफ़ॉल्ट फसल नहीं जोड़ी गई है। अपनी पसंद की फसल (जैसे गेहूं, धान, मक्का, सरसों, कपास) चुनने और उसकी सटीक सिंचाई ट्रैक करने के लिए नीचे दिए बटन से अपना खेत जोड़ें।`
                : `Welcome ${user?.name || 'Farmer'}! No default crops have been added to your account. Add your first farm below to select your dedicated crop and track precision irrigation.`}
            </p>
            <button
              onClick={() => setShowAddFarmModal(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 24px',
                borderRadius: '10px',
                backgroundColor: '#16a34a',
                color: '#ffffff',
                border: 'none',
                fontWeight: '800',
                fontSize: '15px',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(22, 163, 74, 0.25)'
              }}
            >
              <Plus size={18} />
              <span>{lang === 'hi' ? '+ अपना पहला खेत व फसल जोड़ें' : '+ Add Your First Farm & Crop'}</span>
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: '14px' }}>
            {allFarms.map((farm) => {
              const isSelected = farm.plotId === activePlotId;
              const cropHi = CROP_NAME_MAP[farm.currentCrop]?.hi || farm.currentCrop;
              const cropEn = CROP_NAME_MAP[farm.currentCrop]?.en || farm.currentCrop;
              const cropLabel = lang === 'hi' ? cropHi : cropEn;
              const farmDist = farm.location?.district || 'Farm';

              return (
                <div
                  key={farm.plotId}
                  onClick={() => setSearchParams({ plotId: farm.plotId })}
                  style={{
                    backgroundColor: isSelected ? '#f0fdf4' : '#ffffff',
                    border: isSelected ? '2.5px solid #16a34a' : '1.5px solid #e2e8f0',
                    borderRadius: '14px',
                    padding: '16px',
                    cursor: 'pointer',
                    boxShadow: isSelected ? '0 6px 16px rgba(22, 163, 74, 0.18)' : '0 1px 3px rgba(0,0,0,0.03)',
                    transition: 'all 0.18s ease',
                    position: 'relative'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: isSelected ? '#dcfce7' : '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Sprout size={20} color={isSelected ? '#166534' : '#475569'} /></div>
                      <div>
                        <div style={{ fontSize: '15px', fontWeight: '800', color: isSelected ? '#166534' : '#0f172a' }}>
                          {cropLabel} ({farm.variety || 'Certified'})
                        </div>
                        <div style={{ fontSize: '12px', color: '#64748b' }}>
                          {farmDist} • {farm.areaAcres || farm.acreage || 2.5} {lang === 'hi' ? 'एकड़' : 'Acres'}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                      <span style={{
                        fontSize: '11px',
                        color: isSelected ? '#166534' : '#64748b',
                        backgroundColor: isSelected ? '#dcfce7' : '#f1f5f9',
                        padding: '3px 8px',
                        borderRadius: '6px',
                        fontWeight: '800'
                      }}>
                        {farm.plotId}
                      </span>
                      <span style={{
                        fontSize: '10px',
                        fontWeight: '700',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        backgroundColor: farm.hasLiveDevice ? '#f0fdf4' : '#f1f5f9',
                        color: farm.hasLiveDevice ? '#15803d' : '#64748b',
                        border: `1px solid ${farm.hasLiveDevice ? '#bbf7d0' : '#cbd5e1'}`
                      }}>
                        {farm.hasLiveDevice
                          ? (farm.assignedDeviceId === 'DEVICE_001' ? 'डिवाइस 1' : farm.assignedDeviceId)
                          : (lang === 'hi' ? 'केवल टाइमलाइन' : 'Timeline Only')}
                      </span>
                      {farm.seasonSuitability && (
                        <span style={{
                          fontSize: '10px',
                          fontWeight: '800',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          backgroundColor: farm.seasonSuitability.isOptimal ? '#dcfce7' : '#fee2e2',
                          color: farm.seasonSuitability.isOptimal ? '#166534' : '#991b1b',
                          border: `1px solid ${farm.seasonSuitability.isOptimal ? '#86efac' : '#fca5a5'}`
                        }}>
                          {farm.seasonSuitability.isOptimal
                            ? (lang === 'hi' ? 'इष्टतम सीज़न' : 'Ideal Season')
                            : (lang === 'hi' ? 'असामयिक' : 'Off-Season')}
                        </span>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#475569', margin: '8px 0', borderTop: '1px solid #f1f5f9', paddingTop: '8px' }}>
                    <span>{lang === 'hi' ? 'अवस्था:' : 'Stage:'} <strong>{farm.currentStage?.stageName?.split('(')[0] || 'Vegetative'}</strong></span>
                    <span>Day {farm.das} / {farm.totalDurationDays || 135}</span>
                  </div>

                  <div style={{ marginTop: '10px' }}>
                    {isSelected ? (
                      <div style={{
                        backgroundColor: '#16a34a',
                        color: '#ffffff',
                        fontSize: '12px',
                        fontWeight: '800',
                        padding: '7px 12px',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                      }}>
                        <Check size={14} />
                        <span>{lang === 'hi' ? 'सक्रिय फसल (चयनित)' : 'Active Dedicated Crop'}</span>
                      </div>
                    ) : (
                      <div style={{
                        backgroundColor: '#f8fafc',
                        color: '#334155',
                        border: '1px solid #cbd5e1',
                        fontSize: '12px',
                        fontWeight: '700',
                        padding: '7px 12px',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                      }}>
                        <span>{lang === 'hi' ? 'इस फसल का प्रबंधन करें' : 'Manage this Crop'}</span>
                        <ArrowRight size={14} />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {allFarms.length > 0 && data && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#1b4332', display: 'flex', alignItems: 'center', gap: '12px', margin: 0, flexWrap: 'wrap' }}>
            <Calendar size={30} color="#2d6a4f" />
            <span>
              {lang === 'hi'
                ? `${cropDisplayName} शेड्यूलर एवं स्मार्ट चेतावनी प्रणाली`
                : `${cropDisplayName} Scheduler & Smart Alerts`}
            </span>
            <span style={{
              fontSize: '12px',
              fontWeight: '700',
              padding: '3px 10px',
              borderRadius: '20px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: hasLiveDevice ? '#ecfdf5' : '#f1f5f9',
              color: hasLiveDevice ? '#065f46' : '#475569',
              border: `1px solid ${hasLiveDevice ? '#10b981' : '#cbd5e1'}`
            }}>
              <Cpu size={14} color={hasLiveDevice ? '#059669' : '#64748b'} />
              {hasLiveDevice
                ? (lang === 'hi' ? `हार्डवेयर: ${assignedDeviceId === 'DEVICE_001' ? 'डिवाइस 1 (Arduino USB A0)' : assignedDeviceId}` : `Hardware: ${assignedDeviceId}`)
                : (lang === 'hi' ? 'कोई डिवाइस नहीं (केवल टाइमलाइन सक्रिय)' : 'No Hardware Device (Timeline Only)')}
            </span>
          </h1>
          <p style={{ color: '#4b5563', margin: '6px 0 0 0', fontSize: '14px' }}>
            {lang === 'hi'
              ? `${activePlotId} पर समर्पित ${cropDisplayName} फसल: बुवाई, जीवनचक्र विकास अवस्था, नमी स्तर व वर्षा पूर्वानुमान ट्रैकर`
              : `Dedicated ${cropDisplayName} crop on ${activePlotId}: Sowing, phenological stages, moisture, and rain forecasts.`}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setShowNotifDrawer(!showNotifDrawer)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#ffffff',
              border: '1.5px solid #0284c7',
              color: '#0369a1',
              padding: '9px 14px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '700',
              fontSize: '13px'
            }}
          >
            <Bell size={16} />
            <span>{lang === 'hi' ? 'इस फसल के अलर्ट नियम' : 'Alert Rules for this Crop'}</span>
            {showNotifDrawer ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>

          <button
            onClick={() => setShowHarvestModal(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#9a3412',
              color: '#fff',
              border: 'none',
              padding: '9px 14px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '700',
              fontSize: '13px'
            }}
          >
            <Scissors size={15} />
            {lang === 'hi' ? 'फसल कटाई दर्ज करें' : 'Mark Crop Harvested'}
          </button>

          <button
            onClick={handleVoiceNarration}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#2d6a4f',
              color: '#fff',
              border: 'none',
              padding: '9px 14px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '700',
              fontSize: '13px'
            }}
          >
            <Volume2 size={16} />
            {lang === 'hi' ? 'अलर्ट सुनें' : 'Listen Alert'}
          </button>
        </div>
      </div>

      {showNotifDrawer && (
        <div style={{
          backgroundColor: '#f8fafc',
          border: '1.5px solid #38bdf8',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '24px',
          boxShadow: '0 4px 12px rgba(2, 132, 199, 0.08)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Bell size={18} color="#0284c7" />
                <span>
                  {lang === 'hi'
                    ? `खेत ${activePlotId} (${cropDisplayName}) हेतु स्वचालित अलर्ट व नोटिफिकेशन नियम`
                    : `Automated Notification Rules for Farm ${activePlotId} (${cropDisplayName})`}
                </span>
              </h3>
              <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                {lang === 'hi'
                  ? 'इस विशिष्ट फसल की नमी आवश्यकता अनुसार अलार्म सीमाएं सेट करें'
                  : 'Customize warning thresholds tailored specifically for this crop.'}
              </div>
            </div>
            <button
              onClick={() => setShowNotifDrawer(false)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
            >
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleSaveNotifications} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px' }}>

            <div style={{
              gridColumn: '1 / -1',
              backgroundColor: '#ffffff',
              border: '1.5px solid #cbd5e1',
              borderRadius: '10px',
              padding: '14px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
                <label style={{ fontSize: '13px', fontWeight: '800', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Cpu size={16} color="#0284c7" />
                  <span>{lang === 'hi' ? 'हार्डवेयर डिवाइस चयन (Arduino IoT Node):' : 'Assigned Hardware Device (Arduino IoT Node):'}</span>
                </label>
                <span style={{
                  fontSize: '11px',
                  fontWeight: '700',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  backgroundColor: assignedDeviceId !== 'NONE' ? '#dcfce7' : '#fee2e2',
                  color: assignedDeviceId !== 'NONE' ? '#166534' : '#991b1b'
                }}>
                  {assignedDeviceId !== 'NONE'
                    ? (lang === 'hi' ? 'लाइव हार्डवेयर कनेक्टेड' : 'Live Hardware Connected')
                    : (lang === 'hi' ? 'डिवाइस अनुपलब्ध (केवल टाइमलाइन)' : 'Device Unavailable (Timeline Only)')}
                </span>
              </div>

              <select
                value={assignedDeviceId}
                onChange={(e) => setAssignedDeviceId(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: assignedDeviceId === 'NONE' ? '2px solid #f87171' : '1.5px solid #0284c7',
                  fontSize: '13px',
                  backgroundColor: '#ffffff',
                  fontWeight: '700',
                  color: '#0f172a'
                }}
              >
                <option value="DEVICE_001">{lang === 'hi' ? 'डिवाइस 1: Arduino Uno (USB कनेक्टेड)' : 'Device 1: Arduino Uno (USB Connected)'}</option>
                <option value="NONE">{lang === 'hi' ? 'कोई डिवाइस नहीं (केवल टाइमलाइन मोड)' : 'No Device (Timeline Tracking Only)'}</option>
              </select>

              {assignedDeviceId === 'NONE' ? (
                <div style={{
                  marginTop: '12px',
                  padding: '12px 14px',
                  borderRadius: '8px',
                  backgroundColor: '#fff1f2',
                  border: '1.5px solid #fca5a5',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px'
                }}>
                  <AlertTriangle size={20} color="#dc2626" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: '800', color: '#991b1b' }}>
                      {lang === 'hi' ? 'सावधान किसान भाई: इस खेत के लिए कोई लाइव डिवाइस कनेक्ट नहीं है!' : 'Notice: No Live Arduino Device Connected for this Farm!'}
                    </div>
                    <div style={{ fontSize: '12px', color: '#7f1d1d', marginTop: '4px', lineHeight: '1.5' }}>
                      {lang === 'hi'
                        ? 'चूंकि इस खेत पर कोई Arduino सेंसर नहीं है, इसलिए आप लाइव नमी अलर्ट (सायरन/पंपिंग) सेट नहीं कर सकते। इस खेत के लिए केवल फसल समय-सीमा (Timeline), बुवाई से कटाई की विकास अवस्थाएं (Phenological Stages) व सीज़न कैलेंडर ही ट्रैक किया जा सकता है।'
                        : 'Because no physical Arduino probe is assigned to this farm, you cannot set live soil moisture alerts. Only the crop timeline, phenological growth stages, and calendar reminders will be active.'}
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ marginTop: '8px', fontSize: '12px', color: '#15803d', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CheckCircle size={14} color="#16a34a" />
                  <span>
                    {lang === 'hi'
                      ? `लाइव टेलीमेट्री सक्रिय: यह खेत ${assignedDeviceId === 'DEVICE_001' ? 'डिवाइस 1' : assignedDeviceId} के ए/डी/सी नमी सेंसर से जुड़ा है।`
                      : `Live telemetry active: Farm is bound to ${assignedDeviceId} probe.`}
                  </span>
                </div>
              )}
            </div>

            <div style={{
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '12px',
              opacity: assignedDeviceId === 'NONE' ? 0.45 : 1,
              pointerEvents: assignedDeviceId === 'NONE' ? 'none' : 'auto',
              position: 'relative'
            }}>
              {assignedDeviceId === 'NONE' && (
                <div style={{ position: 'absolute', top: '8px', right: '8px', fontSize: '10px', fontWeight: '800', color: '#dc2626', backgroundColor: '#fee2e2', padding: '1px 6px', borderRadius: '4px' }}>
                  {lang === 'hi' ? 'लाइव डिवाइस आवश्यक' : 'Live Device Required'}
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <label style={{ fontSize: '12px', fontWeight: '700', color: '#991b1b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Siren size={14} />
                  <span>{lang === 'hi' ? 'अति-गंभीर सायरन सीमा' : 'Critical Siren Threshold'}</span>
                </label>
                <span style={{ fontWeight: '800', color: '#991b1b', fontSize: '13px' }}>&lt; {notifConfig.criticalThreshold}%</span>
              </div>
              <input
                type="range"
                min="15"
                max="30"
                disabled={assignedDeviceId === 'NONE'}
                value={notifConfig.criticalThreshold}
                onChange={(e) => setNotifConfig({ ...notifConfig, criticalThreshold: +e.target.value })}
                style={{ width: '100%', accentColor: '#dc2626', cursor: assignedDeviceId === 'NONE' ? 'not-allowed' : 'pointer' }}
              />
              <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>
                {lang === 'hi' ? 'इस सीमा से कम नमी होने पर आपातकालीन लाल सायरन' : 'Triggers urgent alarm if moisture dips below this value'}
              </div>
            </div>

            <div style={{
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '12px',
              opacity: assignedDeviceId === 'NONE' ? 0.45 : 1,
              pointerEvents: assignedDeviceId === 'NONE' ? 'none' : 'auto',
              position: 'relative'
            }}>
              {assignedDeviceId === 'NONE' && (
                <div style={{ position: 'absolute', top: '8px', right: '8px', fontSize: '10px', fontWeight: '800', color: '#dc2626', backgroundColor: '#fee2e2', padding: '1px 6px', borderRadius: '4px' }}>
                  {lang === 'hi' ? 'लाइव डिवाइस आवश्यक' : 'Live Device Required'}
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <label style={{ fontSize: '12px', fontWeight: '700', color: '#92400e', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Bell size={14} />
                  <span>{lang === 'hi' ? 'पूर्व सूचना सीमा (Sooner)' : 'Sooner Notice Threshold'}</span>
                </label>
                <span style={{ fontWeight: '800', color: '#92400e', fontSize: '13px' }}>&lt; {notifConfig.soonerThreshold}%</span>
              </div>
              <input
                type="range"
                min="30"
                max="50"
                disabled={assignedDeviceId === 'NONE'}
                value={notifConfig.soonerThreshold}
                onChange={(e) => setNotifConfig({ ...notifConfig, soonerThreshold: +e.target.value })}
                style={{ width: '100%', accentColor: '#d97706', cursor: assignedDeviceId === 'NONE' ? 'not-allowed' : 'pointer' }}
              />
              <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>
                {lang === 'hi' ? '24-36 घंटे पहले शांत पूर्व सूचना' : 'Early notice to plan irrigation in advance'}
              </div>
            </div>

            <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '12px',
                fontWeight: '600',
                color: '#334155',
                cursor: assignedDeviceId === 'NONE' ? 'not-allowed' : 'pointer',
                opacity: assignedDeviceId === 'NONE' ? 0.45 : 1
              }}>
                <input
                  type="checkbox"
                  disabled={assignedDeviceId === 'NONE'}
                  checked={notifConfig.rainDelay}
                  onChange={(e) => setNotifConfig({ ...notifConfig, rainDelay: e.target.checked })}
                  style={{ accentColor: '#2563eb' }}
                />
                <span>{lang === 'hi' ? 'वर्षा रोक गार्ड (>5मिमी पर स्वतः रोक)' : 'Rain Guard (Auto-defer if rain > 5mm)'}</span>
              </label>

              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '12px',
                fontWeight: '600',
                color: '#334155',
                cursor: assignedDeviceId === 'NONE' ? 'not-allowed' : 'pointer',
                opacity: assignedDeviceId === 'NONE' ? 0.45 : 1
              }}>
                <input
                  type="checkbox"
                  disabled={assignedDeviceId === 'NONE'}
                  checked={notifConfig.hypoxiaWarning}
                  onChange={(e) => setNotifConfig({ ...notifConfig, hypoxiaWarning: e.target.checked })}
                  style={{ accentColor: '#ea580c' }}
                />
                <span>{lang === 'hi' ? 'जलभराव व जड़ सड़न (>80% नमी)' : 'Root Hypoxia Alert (>80% moisture)'}</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: '600', color: '#334155', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={notifConfig.smsAlert}
                  onChange={(e) => setNotifConfig({ ...notifConfig, smsAlert: e.target.checked })}
                  style={{ accentColor: '#059669' }}
                />
                <Phone size={13} color="#059669" />
                <span>{lang === 'hi' ? 'मोबाइल SMS / WhatsApp सूचना' : 'Mobile SMS Notification'}</span>
              </label>
            </div>

            <div style={{ display: 'flex', alignItems: 'center' }}>
              <button
                type="submit"
                disabled={savingNotif}
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: assignedDeviceId === 'NONE' ? '#475569' : '#0284c7',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: '700',
                  fontSize: '13px',
                  cursor: 'pointer'
                }}
              >
                {savingNotif
                  ? (lang === 'hi' ? 'सुरक्षित हो रहा है...' : 'Saving...')
                  : assignedDeviceId === 'NONE'
                    ? (lang === 'hi' ? 'समय-सीमा नियम सुरक्षित करें (टाइमलाइन मोड)' : 'Save Timeline Rules (No Device)')
                    : (lang === 'hi' ? 'अलर्ट व डिवाइस नियम सुरक्षित करें' : 'Save Alert & Device Rules')}
              </button>
            </div>
          </form>
        </div>
      )}

      {saveSuccessMsg && (
        <div style={{
          backgroundColor: '#ecfdf5',
          border: '1.5px solid #10b981',
          borderRadius: '8px',
          padding: '12px 16px',
          marginBottom: '18px',
          color: '#065f46',
          fontWeight: '700',
          fontSize: '14px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <Check size={18} color="#059669" />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        border: '1px solid #e2e8f0',
        padding: '16px 20px',
        marginBottom: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '14px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            backgroundColor: '#ecfdf5',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#059669',
            flexShrink: 0
          }}>
            <MapPin size={22} />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#64748b', textTransform: 'uppercase', fontWeight: '700' }}>
              {lang === 'hi' ? 'खेत का स्थान (मौसम व वर्षा API हेतु)' : 'Farm Location for Rain & Weather API'}
            </div>
            <div style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
              <span>{getLocationDisplay()}</span>
              <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '500' }}>
                ({(sched?.location?.lat || 30.9).toFixed(2)}° N, {(sched?.location?.lon || 75.8).toFixed(2)}° E)
              </span>
            </div>
            {locSuccess && (
              <div style={{ fontSize: '12px', color: '#059669', fontWeight: '600', marginTop: '4px' }}>
                {locSuccess}
              </div>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button
            onClick={handleAutoDetectGPS}
            disabled={locLoading}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '7px 12px',
              borderRadius: '8px',
              border: '1px solid #10b981',
              backgroundColor: '#ecfdf5',
              color: '#047857',
              fontSize: '12px',
              fontWeight: '700',
              cursor: 'pointer'
            }}
          >
            <Compass size={15} />
            <span>{locLoading ? (lang === 'hi' ? 'खोज रहे हैं...' : 'Detecting...') : (lang === 'hi' ? 'GPS स्वतः-पहचानें' : 'Auto-Detect GPS')}</span>
          </button>

          <button
            onClick={() => setShowLocationModal(!showLocationModal)}
            style={{
              padding: '7px 12px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              backgroundColor: '#ffffff',
              color: '#334155',
              fontSize: '12px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            {lang === 'hi' ? 'स्थान बदलें' : 'Change Location'}
          </button>
        </div>
      </div>

      {showLocationModal && (
        <div style={{
          backgroundColor: '#f8fafc',
          border: '1.5px solid #cbd5e1',
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '20px'
        }}>
          <div style={{ fontWeight: '700', fontSize: '13px', marginBottom: '10px', color: '#334155' }}>
            {lang === 'hi' ? 'प्रमुख भारतीय कृषि जिलों में से चुनें:' : 'Select from Key Indian Agricultural Districts:'}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '8px' }}>
            {COMMON_DISTRICTS.map((d, i) => (
              <button
                key={i}
                onClick={() => handleSelectDistrict(d)}
                style={{
                  padding: '8px 10px',
                  borderRadius: '6px',
                  border: '1px solid #e2e8f0',
                  backgroundColor: '#ffffff',
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
              >
                <div style={{ fontWeight: '700', color: '#0f172a' }}>{d.district}</div>
                <div style={{ fontSize: '11px', color: '#64748b' }}>{d.state}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {data?.seasonSuitability && (
        <div style={{ marginBottom: '20px' }}>
          <SeasonSuitabilityAdvisory
            cropName={sched?.cropName || data.seasonSuitability.cropName}
            sowingDate={sched?.sowingDate}
            lang={lang}
          />
        </div>
      )}

      {alertData && (
        <div style={{
          backgroundColor: isTimelineOnly ? '#f8fafc' : (isCritical || isHypoxia) ? '#fef2f2' : isSooner ? '#fffbeb' : isRain ? '#eff6ff' : isHarvest ? '#fff7ed' : '#f0fdf4',
          border: `2px solid ${isTimelineOnly ? '#94a3b8' : (isCritical || isHypoxia) ? '#f87171' : isSooner ? '#fcd34d' : isRain ? '#93c5fd' : isHarvest ? '#fb923c' : '#86efac'}`,
          borderRadius: '14px',
          padding: '22px',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '16px'
        }}>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '10px',
            backgroundColor: isTimelineOnly ? '#475569' : (isCritical || isHypoxia) ? '#b91c1c' : isSooner ? '#b45309' : isRain ? '#1d4ed8' : isHarvest ? '#c2410c' : '#15803d',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            flexShrink: 0
          }}>
            {isTimelineOnly ? <Calendar size={24} /> : isHypoxia ? <AlertTriangle size={26} /> : isCritical ? <Siren size={26} /> : isSooner ? <Bell size={24} /> : isRain ? <CloudRain size={24} /> : isHarvest ? <Scissors size={24} /> : <CheckCircle size={24} />}
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px', flexWrap: 'wrap' }}>
              <span style={{
                backgroundColor: isTimelineOnly ? '#475569' : (isCritical || isHypoxia) ? '#b91c1c' : isSooner ? '#b45309' : isRain ? '#1d4ed8' : isHarvest ? '#c2410c' : '#15803d',
                color: '#fff',
                fontSize: '11px',
                fontWeight: '800',
                padding: '3px 10px',
                borderRadius: '20px',
                letterSpacing: '0.5px'
              }}>
                {isTimelineOnly
                  ? (lang === 'hi' ? 'केवल समय-सीमा मोड (डिवाइस रहित)' : 'TIMELINE ONLY MODE (NO DEVICE)')
                  : isHarvest
                    ? (lang === 'hi' ? 'फसल कटाई का समय' : 'HARVEST WINDOW')
                    : isHypoxia
                      ? (lang === 'hi' ? '⚠️ अत्यधिक नमी व जलभराव चेतावनी' : '⚠️ HIGH MOISTURE & WATERLOGGING ALERT')
                      : isCritical
                        ? (lang === 'hi' ? 'अति-गंभीर जल संकट चेतावनी' : 'CRITICAL HIGH RISK SIREN')
                        : isSooner
                          ? (lang === 'hi' ? 'पूर्व सूचना: नमी घट रही है' : 'SOONER ADVISORY NOTICE')
                          : isRain
                            ? (lang === 'hi' ? 'वर्षा रक्षा सक्रिय (मोटर स्थगित)' : 'RAIN GUARD ACTIVATED')
                            : (lang === 'hi' ? 'मृदा स्वास्थ्य इष्टतम' : 'OPTIMAL CONDITION')}
              </span>
              <span style={{ fontSize: '13px', color: '#64748b' }}>
                {isTimelineOnly
                  ? (lang === 'hi' ? 'कोई लाइव Arduino कनेक्ट नहीं' : 'No Live Arduino Connected')
                  : (lang === 'hi' ? `वर्तमान सेंसर नमी: ${currentMoisture}%` : `Current A0 Moisture: ${currentMoisture}%`)}
              </span>

              <span style={{
                fontSize: '12px',
                fontWeight: '700',
                backgroundColor: tempSource === 'HARDWARE' ? '#ecfdf5' : '#f0f9ff',
                color: tempSource === 'HARDWARE' ? '#047857' : '#0369a1',
                border: `1px solid ${tempSource === 'HARDWARE' ? '#a7f3d0' : '#bae6fd'}`,
                padding: '2px 8px',
                borderRadius: '6px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <Thermometer size={13} color={tempSource === 'HARDWARE' ? '#047857' : '#0284c7'} />
                <span>
                  {currentTemperature !== null && currentTemperature !== undefined
                    ? `${currentTemperature}°C (${tempSource === 'HARDWARE' ? (lang === 'hi' ? 'सेंसर प्रोब' : 'Hardware Probe') : (lang === 'hi' ? 'GPS स्थान मौसम' : 'GPS Location Weather')})`
                    : data?.effectiveTemperature
                    ? (lang === 'hi' ? data.effectiveTemperature.labelHi : data.effectiveTemperature.labelEn)
                    : `${data?.weather?.temperatureCelsius || 27.2}°C (${lang === 'hi' ? 'GPS स्थान मौसम' : 'GPS Location Weather'})`}
                </span>
              </span>
            </div>

            <h2 style={{ fontSize: '18px', fontWeight: '800', color: isTimelineOnly ? '#1e293b' : (isCritical || isHypoxia) ? '#991b1b' : isSooner ? '#92400e' : isRain ? '#1e40af' : isHarvest ? '#9a3412' : '#166534', margin: '6px 0 8px 0' }}>
              {displayAlertTitle}
            </h2>

            <p style={{ color: isTimelineOnly ? '#334155' : (isCritical || isHypoxia) ? '#7f1d1d' : isSooner ? '#78350f' : isRain ? '#1e3a8a' : isHarvest ? '#7c2d12' : '#14532d', fontSize: '14px', lineHeight: '1.6', margin: '0 0 12px 0' }}>
              {displayAlertDescription}
            </p>

            {isTimelineOnly && (
              <div style={{
                backgroundColor: '#fff7ed',
                border: '1.5px solid #fdba74',
                borderRadius: '8px',
                padding: '12px 14px',
                marginBottom: '14px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px',
                color: '#9a3412',
                fontSize: '13px',
                lineHeight: '1.5'
              }}>
                <WifiOff size={20} color="#ea580c" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <div style={{ fontWeight: '800', marginBottom: '2px' }}>
                    {lang === 'hi' ? 'लाइव डिवाइस चेतावनी: लाइव नमी अलर्ट सेट नहीं किए जा सकते' : 'Live Hardware Notice: Real-Time Alerts Disabled'}
                  </div>
                  <div>
                    {lang === 'hi'
                      ? 'इस खेत के लिए कोई लाइव डिवाइस (Arduino) कनेक्ट नहीं है। आप लाइव नमी अलर्ट सेट नहीं कर सकते — केवल फसल समय-सीमा एवं जीवनचक्र चरण (Crop Timeline & Growth Stages) ही ट्रैक किया जा सकता है। लाइव नमी अलर्ट सक्रिय करने हेतु ऊपर "अलर्ट नियम व डिवाइस चुनें" से डिवाइस असाइन करें।'
                      : 'No live Arduino device is assigned to this farm. You cannot set real-time moisture alerts — only crop timeline and growth stages are tracked. To activate live moisture alerts, assign an Arduino device in the Alert Rules drawer.'}
                  </div>
                </div>
              </div>
            )}

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '10px',
              marginTop: '12px',
              marginBottom: '14px'
            }}>

              <div style={{
                backgroundColor: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                padding: '10px 12px'
              }}>
                <div style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>
                  {lang === 'hi' ? '1. क्या पानी लगाना है?' : '1. Irrigate Now?'}
                </div>
                <div style={{
                  fontSize: '14px',
                  fontWeight: '800',
                  color: isTimelineOnly ? '#475569' : (isCritical || isHypoxia) ? '#dc2626' : isSooner ? '#d97706' : isRain ? '#2563eb' : '#16a34a',
                  marginTop: '4px'
                }}>
                  {isTimelineOnly ? (lang === 'hi' ? 'समय-सारणी अनुसार' : 'Timeline-guided')
                    : isHypoxia ? (lang === 'hi' ? '❌ बिल्कुल नहीं (अत्यधिक नमी >65%)' : '❌ NO (EXCESSIVE WATER >65%)')
                    : isCritical ? (lang === 'hi' ? 'हाँ, तुरंत पानी दें' : 'Yes, Urgent Today')
                    : isSooner ? (lang === 'hi' ? '1-2 दिन में पानी लगाएं' : 'Plan in 24-36 Hours')
                    : isRain ? (lang === 'hi' ? 'नहीं, बारिश आने वाली है' : 'No, Rain Forecasted')
                    : (lang === 'hi' ? 'नहीं, नमी पर्याप्त है' : 'No, Moisture Optimal')}
                </div>
              </div>

              <div style={{
                backgroundColor: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                padding: '10px 12px'
              }}>
                <div style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>
                  {lang === 'hi' ? '2. मोटर कितनी देर चलाएं?' : '2. Pump Run Time'}
                </div>
                <div style={{ fontSize: '14px', fontWeight: '800', color: isHypoxia ? '#dc2626' : '#0f172a', marginTop: '4px' }}>
                  {isTimelineOnly
                    ? (lang === 'hi' ? 'अवस्था अनुसार (अनुमानित)' : 'Stage Dependent')
                    : isHypoxia
                    ? (lang === 'hi' ? '🛑 मोटर बंद रखें (जलभराव)' : '🛑 Keep Pump OFF (Saturated)')
                    : isRain || (!isCritical && !isSooner)
                    ? (lang === 'hi' ? 'मोटर बंद रखें' : 'Keep Pump OFF')
                    : (lang === 'hi' ? `लगभग ${pumpHours} घंटे (5 HP पंप)` : `~${pumpHours} Hours (5 HP Pump)`)}
                </div>
              </div>

              <div style={{
                backgroundColor: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                padding: '10px 12px'
              }}>
                <div style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>
                  {lang === 'hi' ? '3. सही समय क्या है?' : '3. Best Time'}
                </div>
                <div style={{ fontSize: '14px', fontWeight: '800', color: '#4338ca', marginTop: '4px' }}>
                  {lang === 'hi' ? 'सुबह 5:30 से 7:30 बजे' : '05:30 AM – 07:30 AM'}
                </div>
              </div>

              <div style={{
                backgroundColor: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                padding: '10px 12px'
              }}>
                <div style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>
                  {lang === 'hi' ? '4. बारिश का अनुमान?' : '4. Rain Forecast'}
                </div>
                <div style={{
                  fontSize: '14px',
                  fontWeight: '800',
                  color: (data?.weather?.forecastRainNext24hMm || 0) >= 5 ? '#2563eb' : '#15803d',
                  marginTop: '4px'
                }}>
                  {(data?.weather?.forecastRainNext24hMm || 0) >= 5
                    ? (lang === 'hi' ? `${data.weather.forecastRainNext24hMm} मिमी बारिश (स्थगित)` : `${data.weather.forecastRainNext24hMm} mm Rain (Deferred)`)
                    : (lang === 'hi' ? `${data?.weather?.forecastRainNext24hMm || 0} मिमी (बारिश नहीं, साफ़ मौसम)` : `${data?.weather?.forecastRainNext24hMm || 0} mm (No Rain, Clear Sky)`)}
                </div>
              </div>
            </div>

            <div style={{
              backgroundColor: '#ffffff',
              padding: '14px 18px',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              fontSize: '13px',
              color: '#1e293b'
            }}>
              <div style={{ fontWeight: '800', color: '#0f172a', marginBottom: '8px', fontSize: '14px' }}>
                {lang === 'hi' ? 'किसान भाई के लिए आज के 3 कदम:' : 'Farmer Action Steps for Today:'}
              </div>
              <ul style={{ margin: 0, paddingLeft: '20px', lineHeight: '1.8' }}>
                <li>
                  <strong>{lang === 'hi' ? 'सिंचाई कदम:' : 'Irrigation Action:'}</strong>{' '}
                  {isTimelineOnly ? (lang === 'hi' ? `वर्तमान में फसल ${getStageName(data?.currentStage)} अवस्था में है। समय-सारणी के अनुसार ही सिंचाई चक्र का पालन करें।` : `Crop is currently in ${getStageName(data?.currentStage)}. Follow standard lifecycle irrigation schedule.`)
                    : isHypoxia ? (lang === 'hi' ? `सिंचाई मोटर तत्काल बंद रखें! मिट्टी में नमी अत्यधिक (${currentMoisture}%) है। जड़ों के सूक्ष्म वायु छिद्र पानी में डूब चुके हैं — खेत से अतिरिक्त पानी निकालने की व्यवस्था करें।` : `Halt all irrigation pumps immediately. Soil moisture is saturated at ${currentMoisture}%. Capillary air pores are drowned — open drainage channels to prevent root rot.`)
                    : isCritical ? (lang === 'hi' ? `आज ही ट्यूबवेल चलाएं और लगभग ${pumpHours} घंटे पानी लगाएं। पानी सुबह 5:30 से 7:30 बजे के बीच दें।` : `Turn on pump today and irrigate for ~${pumpHours} hours. Water during morning hours 5:30 - 7:30 AM.`)
                    : isSooner ? (lang === 'hi' ? `अगले 24 से 36 घंटों में लगभग ${pumpHours} घंटे सिंचाई की तैयारी रखें। वर्तमान अवस्था: ${getStageName(data?.currentStage)}।` : `Prepare to irrigate for ~${pumpHours} hours in next 24-36h. Stage: ${getStageName(data?.currentStage)}.`)
                    : isRain ? (lang === 'hi' ? `आगामी 24 घंटे में बारिश होने से खेत में प्राकृतिक पानी आ जाएगा। मोटर बंद रखें।` : `Rain forecasted. Keep pump motors off to avoid waterlogging and power waste.`)
                    : (lang === 'hi' ? `वर्तमान में मिट्टी में पर्याप्त नमी है। आज कोई पानी लगाने की आवश्यकता नहीं है।` : `Moisture is healthy and balanced. No watering needed today.`)}
                </li>
                <li>
                  <strong>{lang === 'hi' ? 'खाद व पोषण:' : 'Fertilizer Guidance:'}</strong>{' '}
                  {data?.currentStage?.stageName?.includes('Crown') || data?.currentStage?.stageName?.includes('Vegetative')
                    ? (lang === 'hi' ? 'यह कल्ले फूटने (CRI) की सबसे जरूरी अवस्था है। इस सिंचाई के साथ 35 किलोग्राम यूरिया प्रति एकड़ समान रूप से छिड़कें।' : 'CRI stage requires root phosphorus and top-dress urea (~35 kg/acre) during first irrigation.')
                    : data?.currentStage?.stageName?.includes('Panicle') || data?.currentStage?.stageName?.includes('Flowering')
                    ? (lang === 'hi' ? 'बालियां निकल रही हैं। पोटाश व हल्की यूरिया दें, मिट्टी में सूखा न पड़ने दें।' : 'Flowering stage: avoid dry soil, apply balanced potash and moderate nitrogen.')
                    : (lang === 'hi' ? 'फसल की सामान्य देखरेख रखें। खेत में खरपतवार न होने दें।' : 'Maintain routine crop monitoring and keep field weed-free.')}
                </li>
                <li>
                  <strong>{lang === 'hi' ? 'सावधानी:' : 'Field Precaution:'}</strong>{' '}
                  {isTimelineOnly ? (lang === 'hi' ? 'लाइव नमी अलर्ट व स्वचालित पंप सुरक्षा के लिए ऊपर दिए बटन से इस खेत को एक Arduino डिवाइस असाइन करें।' : 'Assign an Arduino device to this farm if live soil sensor alerts and automated pump control are desired.')
                    : isHypoxia ? (lang === 'hi' ? 'निचले खेत से खड़े पानी को नाली काटकर बाहर निकालें। जलभराव में खाद न डालें ताकि वह बहकर नष्ट न हो।' : 'Clear surface drain trenches immediately. Do not apply fertilizer while field is waterlogged to prevent leaching.')
                    : isRain ? (lang === 'hi' ? 'खेत की जल निकासी नालियों को खुला रखें ताकि पानी खड़ा न रहे।' : 'Clear drainage channels so water drains smoothly.')
                    : (lang === 'hi' ? 'दोपहर की तेज धूप में पानी न लगाएं, तेज धूप में पानी देने से जड़ें झुलस सकती हैं।' : 'Avoid watering during hot afternoon sun to prevent root thermal shock.')}
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* User-Specific Isolated MongoDB Alerts & Triggers */}
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '14px',
        border: '1.5px solid #e2e8f0',
        padding: '24px',
        marginBottom: '24px',
        boxShadow: '0 4px 14px rgba(0, 0, 0, 0.04)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ fontSize: '11px', fontWeight: '800', color: '#16a34a', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {lang === 'hi' ? 'उपयोगकर्ता-विशिष्ट अलर्ट व सूचनाएं (MongoDB स्टोरेज)' : 'USER-ISOLATED ALERTS & NOTIFICATIONS (MONGODB SCOPED)'}
            </div>
            <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#1e293b', margin: '4px 0 0 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Bell size={20} color="#16a34a" />
              <span>{lang === 'hi' ? `मेरे अलर्ट (${user?.name || user?.email || 'मेरा खाता'})` : `My Alerts (${user?.name || user?.email || 'My Account'})`}</span>
              <span style={{ fontSize: '12px', padding: '2px 8px', borderRadius: '12px', backgroundColor: '#dcfce7', color: '#15803d', fontWeight: '700' }}>
                {userDbAlerts.length} {lang === 'hi' ? 'सक्रिय' : 'Active'}
              </span>
            </h2>
            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
              {lang === 'hi'
                ? 'प्रत्येक उपयोगकर्ता के अलर्ट MongoDB में उनके User ID से सुरक्षित रूप से जुड़े होते हैं। कोई डमी या साझा अलर्ट नहीं।'
                : 'Every user has completely isolated alert storage in MongoDB tied to their User ID. Zero dummy or shared data.'}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={handleCreateTestAlert}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                borderRadius: '8px',
                backgroundColor: '#16a34a',
                color: '#ffffff',
                border: 'none',
                fontWeight: '700',
                fontSize: '13px',
                cursor: 'pointer'
              }}
            >
              <Plus size={16} />
              <span>{lang === 'hi' ? '+ नया अलर्ट जोड़ें' : '+ Add Test Alert'}</span>
            </button>
          </div>
        </div>

        {alertActionMsg && (
          <div style={{
            padding: '10px 14px',
            backgroundColor: '#dcfce7',
            border: '1px solid #86efac',
            borderRadius: '8px',
            color: '#15803d',
            fontSize: '13px',
            fontWeight: '600',
            marginBottom: '14px'
          }}>
            ✓ {alertActionMsg}
          </div>
        )}

        {loadingDbAlerts ? (
          <div style={{ padding: '20px', textAlign: 'center', color: '#64748b', fontSize: '13px' }}>
            {lang === 'hi' ? 'अलर्ट लोड हो रहे हैं...' : 'Loading user alerts from MongoDB...'}
          </div>
        ) : userDbAlerts.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {userDbAlerts.map(alt => (
              <div
                key={alt._id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px 16px',
                  backgroundColor: alt.severity === 'high' ? '#fef2f2' : '#fffbeb',
                  border: `1.5px solid ${alt.severity === 'high' ? '#fecaca' : '#fde68a'}`,
                  borderRadius: '10px',
                  gap: '14px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', flex: 1 }}>
                  <AlertTriangle
                    size={20}
                    color={alt.severity === 'high' ? '#dc2626' : '#d97706'}
                    style={{ flexShrink: 0, marginTop: '2px' }}
                  />
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: '700', fontSize: '14px', color: '#1f2937' }}>
                        {formatAlertType(alt.type, lang)}
                      </span>
                      <span style={{
                        fontSize: '11px',
                        padding: '1px 8px',
                        borderRadius: '10px',
                        fontWeight: '700',
                        backgroundColor: alt.severity === 'high' ? '#fee2e2' : '#fef3c7',
                        color: alt.severity === 'high' ? '#b91c1c' : '#92400e',
                        textTransform: 'uppercase'
                      }}>
                        {alt.severity}
                      </span>
                    </div>
                    <div style={{ fontSize: '13px', color: '#374151', marginTop: '3px' }}>
                      {formatAlertMessage(alt, lang)}
                    </div>
                    <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '4px' }}>
                      Plot: {alt.plotId || 'N/A'} • Device: {alt.deviceId || 'DEVICE_001'} • {new Date(alt.timestamp).toLocaleString()}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleDeleteDbAlert(alt._id)}
                  title={lang === 'hi' ? 'अलर्ट हटाएं' : 'Delete alert'}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '6px 12px',
                    backgroundColor: '#fee2e2',
                    border: '1px solid #fca5a5',
                    borderRadius: '6px',
                    color: '#dc2626',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: '700',
                    flexShrink: 0
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fecaca'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fee2e2'}
                >
                  <Trash2 size={15} />
                  <span>{lang === 'hi' ? 'हटाएं' : 'Delete'}</span>
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div style={{
            padding: '24px',
            textAlign: 'center',
            backgroundColor: '#f8fafc',
            border: '1px dashed #cbd5e1',
            borderRadius: '10px',
            color: '#64748b'
          }}>
            <div style={{ fontSize: '14px', fontWeight: '600', color: '#334155', marginBottom: '4px' }}>
              {lang === 'hi' ? 'कोई सक्रिय अलर्ट नहीं है' : 'No Active Alerts'}
            </div>
            <div style={{ fontSize: '12px' }}>
              {lang === 'hi'
                ? 'आपके खाते के लिए कोई डमी अलर्ट नहीं है। जब सेंसर थ्रेशोल्ड ट्रिगर होगा या आप नया अलर्ट सेट करेंगे, वह यहाँ दिखाई देगा।'
                : 'No dummy alerts are shown. Alerts triggered by your hardware or set by you will appear here.'}
            </div>
          </div>
        )}
      </div>

      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '14px',
        border: '1.5px solid #bae6fd',
        padding: '24px',
        marginBottom: '24px',
        boxShadow: '0 4px 14px rgba(2, 132, 199, 0.06)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ fontSize: '11px', fontWeight: '800', color: '#0284c7', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {lang === 'hi' ? 'स्मार्ट सिंचाई एवं सटीक जल बजट (लीटर में)' : 'SMART IRRIGATION & WATER BUDGETING (IN LITERS)'}
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#0c4a6e', margin: '4px 0 0 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Droplets size={24} color="#0284c7" />
              <span>{lang === 'hi' ? `सटीक जल गणना: ${cropDisplayName} (${sched?.acreage || 2.5} एकड़ खेत)` : `Water Budgeting: ${cropDisplayName} (${sched?.acreage || 2.5} Acres)`}</span>
            </h2>
            <div style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>
              {lang === 'hi'
                ? `सेंसर नमी (${currentMoisture}%) व मौसम पूर्वानुमान के आधार पर इस खेत हेतु आवश्यक पानी की मात्रा`
                : `Calculated water volume based on current sensor moisture (${currentMoisture}%) & weather forecasts`}
            </div>
          </div>

          <Link
            to={`/smart-irrigation?plotId=${activePlotId}`}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#f0f9ff',
              border: '1px solid #7dd3fc',
              color: '#0369a1',
              padding: '8px 14px',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: '700',
              textDecoration: 'none'
            }}
          >
            <span>{lang === 'hi' ? 'विस्तृत सिंचाई कंसोल खोलें' : 'Open Dedicated Irrigation Console'}</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        {isTimelineOnly && (
          <div style={{
            backgroundColor: '#f8fafc',
            border: '1.5px solid #cbd5e1',
            borderRadius: '10px',
            padding: '12px 16px',
            marginBottom: '18px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <WifiOff size={22} color="#64748b" style={{ flexShrink: 0 }} />
            <div>
              <div style={{ fontWeight: '800', color: '#334155', fontSize: '13px' }}>
                {lang === 'hi' ? 'लाइव डिवाइस अनुपलब्ध (केवल समय-सीमा मोड)' : 'Live Hardware Device Unavailable (Timeline Mode)'}
              </div>
              <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                {lang === 'hi'
                  ? 'इस खेत पर कोई Arduino सेंसर नहीं जुड़ा है। नीचे दिखाई गई जल गणना मानक सैद्धांतिक मूल्यों पर आधारित है। सजीव सेंसर नमी व स्वचालित जल बजट हेतु ऊपर अलर्ट नियमों से Arduino डिवाइस असाइन करें।'
                  : 'No Arduino telemetry node assigned. The water budgeting below uses standard theoretical baseline. For real-time sensor sync, connect an Arduino device in the Alert Rules drawer.'}
              </div>
            </div>
          </div>
        )}

        {data?.weather?.forecastRainNext24hMm >= 5 && (
          <div style={{
            backgroundColor: '#fef3c7',
            border: '1.5px solid #f59e0b',
            borderRadius: '10px',
            padding: '14px 18px',
            marginBottom: '18px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <CloudRain size={24} color="#d97706" style={{ flexShrink: 0 }} />
            <div>
              <div style={{ fontWeight: '800', color: '#92400e', fontSize: '14px' }}>
                {lang === 'hi'
                  ? `वर्षा पूर्वानुमान: ${data.weather.forecastRainNext24hMm} मिमी (अगले 24 घंटे) — सिंचाई स्वचालित रूप से स्थगित!`
                  : `Rain Forecasted: ${data.weather.forecastRainNext24hMm} mm (Next 24h) — Irrigation Automatically Deferred!`}
              </div>
              <div style={{ fontSize: '12px', color: '#78350f', marginTop: '2px' }}>
                {lang === 'hi'
                  ? 'प्राकृतिक वर्षा से खेत सिंचित हो जाएगा। ट्यूबवेल मोटर बंद रखकर बिजली व भूजल बचाएं।'
                  : 'Natural precipitation will replenish root moisture. Keep pump motor off to conserve water & power.'}
              </div>
            </div>
          </div>
        )}

        <div style={{
          backgroundColor: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '10px',
          padding: '16px',
          marginBottom: '20px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ fontSize: '13px', fontWeight: '700', color: '#334155' }}>
              {lang === 'hi' ? 'सेंसर नमी डेटा स्रोत व परीक्षण मोड:' : 'Sensor Telemetry Source & Test Mode:'}
            </div>

            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                type="button"
                onClick={() => setIsLiveMode(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: '700',
                  border: isLiveMode ? '1.5px solid #10b981' : '1px solid #cbd5e1',
                  backgroundColor: isLiveMode ? '#ecfdf5' : '#ffffff',
                  color: isLiveMode ? '#065f46' : '#64748b',
                  cursor: 'pointer'
                }}
              >
                <Radio size={13} color={isLiveMode ? '#059669' : '#94a3b8'} />
                <span>{lang === 'hi' ? 'सजीव हार्डवेयर (A0 ऑटो-सिंक)' : 'Live Hardware (A0 Auto-Sync)'}</span>
              </button>

              <button
                type="button"
                onClick={() => setIsLiveMode(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: '700',
                  border: !isLiveMode ? '1.5px solid #0284c7' : '1px solid #cbd5e1',
                  backgroundColor: !isLiveMode ? '#f0f9ff' : '#ffffff',
                  color: !isLiveMode ? '#0369a1' : '#64748b',
                  cursor: 'pointer'
                }}
              >
                <Sliders size={13} color={!isLiveMode ? '#0284c7' : '#94a3b8'} />
                <span>{lang === 'hi' ? 'मैन्युअल परीक्षण स्लाइडर' : 'Manual Slider (Simulator)'}</span>
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: '700', color: '#1e293b' }}>
              {lang === 'hi' ? 'मिट्टी की नमी स्तर (Capacitive Moisture A0):' : 'Soil Volumetric Moisture Level (A0):'}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '2px 8px',
                borderRadius: '12px',
                fontSize: '11px',
                fontWeight: '700',
                backgroundColor: currentMoisture >= 65 ? '#fee2e2' : '#dcfce7',
                color: currentMoisture >= 65 ? '#b91c1c' : '#15803d',
                border: `1px solid ${currentMoisture >= 65 ? '#fca5a5' : '#86efac'}`
              }}>
                <span style={{
                  width: '7px',
                  height: '7px',
                  borderRadius: '50%',
                  backgroundColor: currentMoisture >= 65 ? '#ef4444' : '#22c55e'
                }} />
                {currentMoisture >= 65
                  ? (lang === 'hi' ? 'Arduino Pin 7 🔴 लाल LED (>65%)' : 'Arduino Pin 7 🔴 Red LED (>65%)')
                  : (lang === 'hi' ? 'Arduino Pin 8 🟢 हरी LED (सामान्य)' : 'Arduino Pin 8 🟢 Green LED (Safe)')}
              </span>
              <span style={{ fontSize: '16px', fontWeight: '800', color: currentMoisture < 25 ? '#dc2626' : currentMoisture < 45 ? '#d97706' : currentMoisture >= 65 ? '#dc2626' : '#16a34a' }}>
                {currentMoisture}%
              </span>
            </div>
          </div>

          <input
            type="range"
            min="10"
            max="90"
            value={currentMoisture}
            disabled={isLiveMode && hardwareDetected}
            onChange={(e) => {
              setIsLiveMode(false);
              setCurrentMoisture(+e.target.value);
            }}
            style={{ width: '100%', cursor: isLiveMode && hardwareDetected ? 'not-allowed' : 'pointer' }}
          />

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#64748b', marginTop: '4px' }}>
            <span>10% ({lang === 'hi' ? 'सूखा' : 'Dry'})</span>
            <span>{data?.irrigation?.targetMoisture || 55}% ({lang === 'hi' ? 'इष्टतम लक्ष्य' : 'Optimal Target'})</span>
            <span>90% ({lang === 'hi' ? 'जलभराव' : 'Saturated'})</span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px' }}>

          <div style={{
            backgroundColor: '#f0fdf4',
            border: '1.5px solid #86efac',
            borderRadius: '12px',
            padding: '18px',
            position: 'relative'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: '12px', fontWeight: '700', color: '#166534', textTransform: 'uppercase' }}>
                  {lang === 'hi' ? 'आवश्यक कुल जल मात्रा' : 'Water Volume Required'}
                </div>
                <div style={{ fontSize: '26px', fontWeight: '900', color: '#14532d', margin: '8px 0 2px 0', letterSpacing: '-0.5px' }}>
                  {(liters).toLocaleString()} <span style={{ fontSize: '15px', fontWeight: '700' }}>{lang === 'hi' ? 'लीटर' : 'Liters'}</span>
                </div>
                <div style={{ fontSize: '13px', fontWeight: '800', color: '#15803d', marginBottom: '6px' }}>
                  {lang === 'hi' ? `लगभग ${lakhLiters} लाख लीटर (~${tankerCount} टैंकर पानी)` : `~${lakhLiters} Lakh Liters (~${tankerCount} Tankers)`}
                </div>
                <div style={{ fontSize: '12px', fontWeight: '700', color: '#166534', backgroundColor: '#dcfce7', padding: '4px 8px', borderRadius: '6px', display: 'inline-block' }}>
                  {lang === 'hi' ? `ट्यूबवेल समय: लगभग ${pumpHours} घंटे (5 HP मोटर @ 28,000 ली/घंटा)` : `Pump Run Time: ~${pumpHours} Hours (5 HP Pump)`}
                </div>
                <div style={{ fontSize: '11px', color: '#64748b', marginTop: '6px' }}>
                  {lang === 'hi'
                    ? `${sched?.acreage || 2.5} एकड़ खेत हेतु (${data?.irrigation?.recommendedWaterDepthMm || 0} मिमी जल गहराई)`
                    : `For ${sched?.acreage || 2.5} Acre Plot (${data?.irrigation?.recommendedWaterDepthMm || 0} mm water depth)`}
                </div>
              </div>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Droplets size={22} color="#16a34a" />
              </div>
            </div>
          </div>

          <div style={{
            backgroundColor: data?.irrigation?.urgency === 'CRITICAL' || data?.irrigation?.urgency === 'URGENT' ? '#fef2f2' : data?.irrigation?.urgency === 'MODERATE' ? '#fffbeb' : data?.irrigation?.urgency === 'RAIN_SUPPRESSED' ? '#eff6ff' : '#f0fdf4',
            border: `1.5px solid ${data?.irrigation?.urgency === 'CRITICAL' || data?.irrigation?.urgency === 'URGENT' ? '#fca5a5' : data?.irrigation?.urgency === 'MODERATE' ? '#fde68a' : data?.irrigation?.urgency === 'RAIN_SUPPRESSED' ? '#bfdbfe' : '#bbf7d0'}`,
            borderRadius: '12px',
            padding: '18px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: '12px', fontWeight: '700', color: '#475569', textTransform: 'uppercase' }}>
                  {lang === 'hi' ? 'सिंचाई आवश्यकता स्थिति' : 'Irrigation Urgency'}
                </div>
                <div style={{
                  fontSize: '20px',
                  fontWeight: '900',
                  color: data?.irrigation?.urgency === 'CRITICAL' || data?.irrigation?.urgency === 'URGENT' ? '#dc2626' : data?.irrigation?.urgency === 'MODERATE' ? '#d97706' : data?.irrigation?.urgency === 'RAIN_SUPPRESSED' ? '#2563eb' : '#16a34a',
                  margin: '8px 0 4px 0'
                }}>
                  {data?.irrigation?.urgency === 'CRITICAL' ? (lang === 'hi' ? 'तत्काल पानी दें (फसल सूख रही है)' : 'CRITICAL SIREN')
                    : data?.irrigation?.urgency === 'URGENT' ? (lang === 'hi' ? 'आज/कल में पानी लगाएं' : 'URGENT TODAY')
                    : data?.irrigation?.urgency === 'MODERATE' ? (lang === 'hi' ? '1-2 दिन में पानी दें (तैयारी रखें)' : 'MODERATE (PLAN SOON)')
                    : data?.irrigation?.urgency === 'RAIN_SUPPRESSED' ? (lang === 'hi' ? 'पानी न लगाएं (बारिश का अनुमान)' : 'RAIN DEFERRED')
                    : (lang === 'hi' ? 'पानी की जरूरत नहीं (नमी ठीक है)' : 'OPTIMAL MOISTURE')}
                </div>
                <div style={{ fontSize: '12px', color: '#475569' }}>
                  {lang === 'hi'
                    ? `लक्ष्य नमी: ${data?.irrigation?.targetMoisture || 55}% | वर्तमान: ${currentMoisture}%`
                    : `Target Moisture: ${data?.irrigation?.targetMoisture || 55}% | Current: ${currentMoisture}%`}
                </div>
              </div>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CheckCircle size={22} color={data?.irrigation?.urgency === 'CRITICAL' ? '#dc2626' : '#16a34a'} />
              </div>
            </div>
          </div>

          <div style={{
            backgroundColor: '#faf5ff',
            border: '1.5px solid #e9d5ff',
            borderRadius: '12px',
            padding: '18px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: '12px', fontWeight: '700', color: '#6b21a8', textTransform: 'uppercase' }}>
                  {lang === 'hi' ? 'सर्वोत्तम सिंचाई समय चक्र' : 'Optimal Watering Window'}
                </div>
                <div style={{ fontSize: '22px', fontWeight: '900', color: '#581c87', margin: '8px 0 4px 0' }}>
                  05:30 AM – 07:30 AM
                </div>
                <div style={{ fontSize: '12px', color: '#6b21a8' }}>
                  {lang === 'hi'
                    ? 'प्रातःकाल में जल देने से वाष्पीकरण हानि व सतही बहाव रुकता है'
                    : 'Dawn hours prevent solar evaporation loss & surface runoff'}
                </div>
              </div>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#f3e8ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Clock size={22} color="#7e22ce" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {data && (
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          padding: '24px',
          marginBottom: '24px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <div style={{ fontSize: '11px', fontWeight: '800', color: '#059669', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {lang === 'hi' ? 'समर्पित फसल जीवनचक्र ट्रैकर' : 'DEDICATED CROP LIFECYCLE TRACKER'}
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a', margin: '2px 0 0 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sprout size={22} color='#16a34a' />
                <span>{cropDisplayName} ({sched?.variety || 'PBW 725'}) • {sched?.acreage || 2.5} {lang === 'hi' ? 'एकड़' : 'Acres'}</span>
              </h3>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <div style={{
                backgroundColor: data.isFuture ? '#fef3c7' : '#ecfdf5',
                color: data.isFuture ? '#92400e' : '#065f46',
                border: `1px solid ${data.isFuture ? '#fcd34d' : '#a7f3d0'}`,
                padding: '6px 14px',
                borderRadius: '20px',
                fontWeight: '800',
                fontSize: '13px'
              }}>
                {data.isFuture
                  ? (lang === 'hi' ? `योजनाबद्ध: ${data.daysUntilSowing} दिन बाद बुवाई` : `Planned Sowing: In ${data.daysUntilSowing} Days`)
                  : (lang === 'hi' ? `बुवाई के ${data.das} दिन बाद (Day ${data.das})` : `Day ${data.das} After Sowing`)}
              </div>

              <div style={{
                backgroundColor: '#eff6ff',
                color: '#1e40af',
                border: '1px solid #bfdbfe',
                padding: '6px 14px',
                borderRadius: '20px',
                fontWeight: '800',
                fontSize: '13px'
              }}>
                {lang === 'hi' ? `कटाई की अनुमानित तिथि: ${expectedHarvestStr}` : `Expected Harvest: ${expectedHarvestStr}`}
              </div>
            </div>
          </div>

          <div style={{ margin: '16px 0 14px 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
              <span>
                {lang === 'hi' ? 'फसल विकास पूर्णता:' : 'Crop Lifecycle Completion:'} {data.lifecycleProgressPercent}%
              </span>
              <span>
                {lang === 'hi'
                  ? `कुल अवधि: ${data.totalDurationDays} दिन | कटाई में शेष: ${data.daysRemainingUntilHarvest} दिन`
                  : `Total Duration: ${data.totalDurationDays} Days | Remaining to Cut: ${data.daysRemainingUntilHarvest} Days`}
              </span>
            </div>
            <div style={{ width: '100%', height: '12px', backgroundColor: '#e2e8f0', borderRadius: '6px', overflow: 'hidden' }}>
              <div style={{
                width: `${data.lifecycleProgressPercent}%`,
                height: '100%',
                backgroundColor: data.lifecycleProgressPercent >= 90 ? '#ea580c' : '#16a34a',
                transition: 'width 0.4s ease'
              }}></div>
            </div>
          </div>

          {data.currentStage && (
            <div style={{
              backgroundColor: '#f8fafc',
              border: '1.5px solid #cbd5e1',
              borderRadius: '10px',
              padding: '14px 18px',
              marginTop: '16px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '12px'
            }}>
              <div>
                <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: '800' }}>
                  {lang === 'hi' ? 'वर्तमान सक्रिय विकास अवस्था:' : 'Current Active Growth Stage:'}
                </div>
                <div style={{ fontSize: '16px', fontWeight: '800', color: '#1e3a8a', marginTop: '2px' }}>
                  {getStageName(data.currentStage)}
                </div>
                <div style={{ fontSize: '13px', color: '#475569', marginTop: '4px' }}>
                  {getStageDesc(data.currentStage)} • <strong>{getStageWater(data.currentStage)}</strong>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowHarvestModal(true)}
                style={{
                  backgroundColor: '#ffffff',
                  border: '1.5px solid #9a3412',
                  color: '#9a3412',
                  padding: '8px 14px',
                  borderRadius: '6px',
                  fontWeight: '700',
                  fontSize: '12px',
                  cursor: 'pointer'
                }}
              >
                {lang === 'hi' ? 'कटाई पूर्ण दर्ज करें' : 'Record Harvest Cut'}
              </button>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px', marginTop: '16px' }}>
            {(sched?.growthStages || []).map((stage, idx) => {
              const isCurrent = data?.currentStage?.stageName === stage.stageName;
              return (
                <div
                  key={idx}
                  style={{
                    backgroundColor: isCurrent ? '#f0fdf4' : '#f8fafc',
                    border: isCurrent ? '2px solid #16a34a' : '1px solid #e2e8f0',
                    borderRadius: '8px',
                    padding: '12px 14px'
                  }}
                >
                  <div style={{ fontSize: '11px', fontWeight: '800', color: isCurrent ? '#15803d' : '#64748b', textTransform: 'uppercase' }}>
                    {lang === 'hi' ? `दिन ${stage.startDay} - ${stage.endDay}` : `Days ${stage.startDay} - ${stage.endDay}`} {isCurrent && (lang === 'hi' ? ' ● वर्तमान' : ' ● CURRENT')}
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a', marginTop: '4px' }}>
                    {getStageName(stage)}
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                    {getStageWater(stage)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        border: '1px solid #e2e8f0',
        padding: '24px',
        marginBottom: '24px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
      }}>
        <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a', marginBottom: '6px' }}>
          {lang === 'hi' ? 'फसल बुवाई व चेतावनी सीमाएं निर्धारित करें' : 'Configure Crop Sowing & Alert Thresholds'}
        </h3>
        <p style={{ color: '#64748b', fontSize: '13px', margin: '0 0 18px 0' }}>
          {lang === 'hi'
            ? 'यहाँ विवरण सुरक्षित करें। यह पूरे सीज़न में फसल कटाई तक वास्तविक समय में ट्रैक रहेगी।'
            : 'Save crop sowing parameters to track crop stages continuously until harvest.'}
        </p>

        <form onSubmit={handleSaveSchedule} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
              {lang === 'hi' ? 'फसल का प्रकार' : 'Crop Name'}
            </label>
            <select
              value={cropName}
              onChange={(e) => setCropName(e.target.value)}
              style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', backgroundColor: '#fff' }}
            >
              <option value="Wheat">{lang === 'hi' ? 'गेहूं (Wheat)' : 'Wheat'}</option>
              <option value="Mustard">{lang === 'hi' ? 'सरसों (Mustard)' : 'Mustard'}</option>
              <option value="Rice">{lang === 'hi' ? 'बासमती धान (Rice)' : 'Rice (Basmati)'}</option>
              <option value="Maize">{lang === 'hi' ? 'मक्का (Maize)' : 'Maize'}</option>
              <option value="Cotton">{lang === 'hi' ? 'कपास (Cotton)' : 'Cotton'}</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
              {lang === 'hi' ? 'किस्म / वैरायटी' : 'Crop Variety'}
            </label>
            <input
              type="text"
              value={variety}
              onChange={(e) => setVariety(e.target.value)}
              style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
              {lang === 'hi' ? 'बुवाई की तारीख (Sowing Date)' : 'Sowing Date'}
            </label>
            <input
              type="date"
              value={sowingDate}
              onChange={(e) => setSowingDate(e.target.value)}
              style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
              {lang === 'hi' ? 'खेत का रकबा (एकड़)' : 'Field Acreage'}
            </label>
            <input
              type="number"
              step="0.5"
              value={acreage}
              onChange={(e) => setAcreage(e.target.value)}
              style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
              {lang === 'hi' ? 'संबद्ध IoT डिवाइस (Arduino)' : 'Assigned IoT Device (Arduino)'}
            </label>
            <select
              value={assignedDeviceId}
              onChange={(e) => setAssignedDeviceId(e.target.value)}
              style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', backgroundColor: '#fff' }}
            >
              <option value="DEVICE_001">{lang === 'hi' ? 'डिवाइस 1 (Arduino Uno USB कनेक्टेड)' : 'Device 1 (Arduino Uno USB Connected)'}</option>
              <option value="NONE">{lang === 'hi' ? 'कोई डिवाइस नहीं (केवल समय-सीमा मोड)' : 'No Device (Timeline Tracking Only)'}</option>
            </select>
          </div>

          <div style={{ gridColumn: '1 / -1' }}>
            <SeasonSuitabilityAdvisory cropName={cropName} sowingDate={sowingDate} lang={lang} />
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button
              type="submit"
              disabled={saving}
              style={{
                backgroundColor: '#2d6a4f',
                color: '#fff',
                border: 'none',
                padding: '12px 20px',
                borderRadius: '8px',
                fontWeight: '700',
                fontSize: '14px',
                cursor: 'pointer',
                width: '100%',
                opacity: saving ? 0.7 : 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              {saving ? (
                <>
                  <RefreshCw size={16} className="animate-spin" />
                  <span>{lang === 'hi' ? 'सुरक्षित हो रहा है...' : 'Saving...'}</span>
                </>
              ) : (
                <span>{lang === 'hi' ? 'सुरक्षित करें व अलर्ट्स देखें' : 'Save & Recalculate'}</span>
              )}
            </button>
          </div>
        </form>
      </div>

      {data?.archivedHarvests && data.archivedHarvests.length > 0 && (
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          padding: '24px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
            <History size={20} color="#059669" />
            <h3 style={{ fontSize: '17px', fontWeight: '800', color: '#0f172a', margin: 0 }}>
              {lang === 'hi' ? 'खेत कटाई इतिहास (सीज़न रिकॉर्ड)' : 'Field Harvest History (Archived Records)'}
            </h3>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                  <th style={{ padding: '10px 12px', fontWeight: '700', color: '#475569' }}>{lang === 'hi' ? 'फसल व किस्म' : 'Crop & Variety'}</th>
                  <th style={{ padding: '10px 12px', fontWeight: '700', color: '#475569' }}>{lang === 'hi' ? 'बुवाई तिथि' : 'Sowing Date'}</th>
                  <th style={{ padding: '10px 12px', fontWeight: '700', color: '#475569' }}>{lang === 'hi' ? 'कटाई तिथि' : 'Harvest Date'}</th>
                  <th style={{ padding: '10px 12px', fontWeight: '700', color: '#475569' }}>{lang === 'hi' ? 'प्राप्त पैदावार' : 'Actual Yield'}</th>
                  <th style={{ padding: '10px 12px', fontWeight: '700', color: '#475569' }}>{lang === 'hi' ? 'स्थिति' : 'Status'}</th>
                </tr>
              </thead>
              <tbody>
                {data.archivedHarvests.map((h, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '10px 12px', fontWeight: '700', color: '#0f172a' }}>
                      {h.cropName} ({h.variety})
                    </td>
                    <td style={{ padding: '10px 12px', color: '#475569' }}>
                      {new Date(h.sowingDate).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '10px 12px', color: '#475569' }}>
                      {h.harvestedAt ? new Date(h.harvestedAt).toLocaleDateString() : '—'}
                    </td>
                    <td style={{ padding: '10px 12px', fontWeight: '700', color: '#166534' }}>
                      {h.actualYieldQuintals || 22} {lang === 'hi' ? 'क्विंटल/एकड़' : 'Qtl/Acre'}
                    </td>
                    <td style={{ padding: '10px 12px' }}>
                      <span style={{ backgroundColor: '#ecfdf5', color: '#065f46', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '700' }}>
                        {lang === 'hi' ? 'कटाई पूर्ण (Archived)' : 'Harvested (Archived)'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
        </>
      )}

      {showHarvestModal && (
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
            maxWidth: '460px',
            width: '100%',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <Scissors size={24} color="#9a3412" />
              <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                {lang === 'hi' ? 'फसल कटाई दर्ज करें' : 'Record Crop Harvest Cut'}
              </h3>
            </div>
            <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 16px 0' }}>
              {lang === 'hi'
                ? 'कटाई दर्ज करने पर वर्तमान फसल का पूरा रिकॉर्ड इतिहास में सुरक्षित हो जाएगा और नए सीज़न की योजना शुरू हो सकेगी।'
                : 'Recording harvest permanently archives the current season records into history and initiates a fresh crop cycle.'}
            </p>

            <form onSubmit={handleHarvestSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                  {lang === 'hi' ? 'प्राप्त अंतिम पैदावार (क्विंटल प्रति एकड़)' : 'Actual Realized Yield (Quintals/Acre)'}
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={harvestYield}
                  onChange={(e) => setHarvestYield(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                  {lang === 'hi' ? 'कटाई टिप्पणी / नोट्स' : 'Harvesting Notes / Observations'}
                </label>
                <textarea
                  rows="2"
                  value={harvestNotes}
                  onChange={(e) => setHarvestNotes(e.target.value)}
                  placeholder={lang === 'hi' ? 'उदा. दाना अच्छा पका, औसत पैदावार मिली' : 'e.g., Good grain filling, harvested in dry weather'}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowHarvestModal(false)}
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
                  disabled={harvesting}
                  style={{
                    flex: 2,
                    padding: '10px',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: '#9a3412',
                    color: '#ffffff',
                    fontWeight: '700',
                    cursor: 'pointer'
                  }}
                >
                  {harvesting ? (lang === 'hi' ? 'सुरक्षित हो रहा है...' : 'Saving...') : (lang === 'hi' ? 'कटाई दर्ज व सुरक्षित करें' : 'Record & Archive Season')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showAddFarmModal && (
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
            maxWidth: '480px',
            width: '100%',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <Plus size={24} color="#16a34a" />
              <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                {lang === 'hi' ? 'नया खेत व समर्पित फसल जोड़ें' : 'Add New Farm & Dedicated Crop'}
              </h3>
            </div>
            <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 16px 0' }}>
              {lang === 'hi'
                ? 'नया खेत पंजीकृत करें। पूरे खेत पर केवल एक समर्पित फसल की बुवाई दर्ज होगी।'
                : 'Register a new farm dedicated entirely to one single crop.'}
            </p>

            <form onSubmit={handleAddFarmSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                  {lang === 'hi' ? 'खेत का नाम (उदा. नहर वाला खेत)' : 'Farm Identifier / Name'}
                </label>
                <input
                  type="text"
                  required
                  value={newFarmName}
                  onChange={(e) => setNewFarmName(e.target.value)}
                  placeholder={lang === 'hi' ? 'उदा. नहर वाला खेत - ब्लॉक B' : 'e.g. Canal Road Plot'}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                    {lang === 'hi' ? 'जिला' : 'District'}
                  </label>
                  <input
                    type="text"
                    required
                    value={newDistrict}
                    onChange={(e) => setNewDistrict(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                    {lang === 'hi' ? 'क्षेत्रफल (एकड़)' : 'Acreage'}
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    value={newAcreage}
                    onChange={(e) => setNewAcreage(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                    {lang === 'hi' ? 'पूरे खेत की फसल (अनिवार्य)' : 'Dedicated Whole Crop (Mandatory)'}
                  </label>
                  <select
                    required
                    value={newCropName}
                    onChange={(e) => {
                      const sel = e.target.value;
                      setNewCropName(sel);
                      if (!newVariety || newVariety.endsWith('Certified Seed')) {
                        setNewVariety(sel ? `${sel} Certified Seed` : '');
                      }
                    }}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: newCropName ? '1px solid #cbd5e1' : '1.5px solid #059669', fontSize: '13px', backgroundColor: '#fff' }}
                  >
                    <option value="" disabled>{lang === 'hi' ? '-- फसल चुनें (अनिवार्य) --' : '-- Choose Crop (Required) --'}</option>
                    <option value="Wheat">{lang === 'hi' ? 'गेहूं (Wheat)' : 'Wheat'}</option>
                    <option value="Mustard">{lang === 'hi' ? 'सरसों (Mustard)' : 'Mustard'}</option>
                    <option value="Rice">{lang === 'hi' ? 'बासमती धान (Rice)' : 'Rice (Basmati)'}</option>
                    <option value="Maize">{lang === 'hi' ? 'मक्का (Maize)' : 'Maize'}</option>
                    <option value="Cotton">{lang === 'hi' ? 'कपास (Cotton)' : 'Cotton'}</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                    {lang === 'hi' ? 'किस्म' : 'Variety'}
                  </label>
                  <input
                    type="text"
                    placeholder={newCropName ? `${newCropName} Certified Seed` : 'e.g. PBW 725'}
                    value={newVariety}
                    onChange={(e) => setNewVariety(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                  {lang === 'hi' ? 'बुवाई तिथि' : 'Sowing Date'}
                </label>
                <input
                  type="date"
                  required
                  value={newSowingDate}
                  onChange={(e) => setNewSowingDate(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                  {lang === 'hi' ? 'संबद्ध IoT डिवाइस (Arduino)' : 'Assigned IoT Device (Arduino)'}
                </label>
                <select
                  value={newAssignedDeviceId}
                  onChange={(e) => setNewAssignedDeviceId(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', backgroundColor: '#fff' }}
                >
                  <option value="DEVICE_001">{lang === 'hi' ? 'डिवाइस 1 (Arduino Uno USB कनेक्टेड)' : 'Device 1 (Arduino Uno USB Connected)'}</option>
                  <option value="NONE">{lang === 'hi' ? 'कोई डिवाइस नहीं (केवल समय-सीमा मोड)' : 'No Device (Timeline Tracking Only)'}</option>
                </select>
                <div style={{ fontSize: '11px', color: newAssignedDeviceId === 'NONE' ? '#ea580c' : '#64748b', marginTop: '3px' }}>
                  {newAssignedDeviceId === 'NONE'
                    ? (lang === 'hi' ? '⚠️ कोई डिवाइस कनेक्ट नहीं: केवल फसल समय-सीमा व विकास चरण ट्रैक होंगे, लाइव नमी अलर्ट नहीं मिलेंगे।' : '⚠️ No device: only timeline & stages tracked, no live moisture alerts.')
                    : (lang === 'hi' ? 'सजीव नमी व स्वचालित मोटर चेतावनी सक्रिय रहेगी।' : 'Real-time telemetry and automated motor alerts active.')}
                </div>
              </div>

              {newCropName && <SeasonSuitabilityAdvisory cropName={newCropName} sowingDate={newSowingDate} lang={lang} />}

              <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
                <button
                  type="button"
                  onClick={() => setShowAddFarmModal(false)}
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
                  disabled={addingFarm}
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
                  {addingFarm ? (lang === 'hi' ? 'जोड़ा जा रहा है...' : 'Adding...') : (lang === 'hi' ? 'खेत जोड़ें व स्विच करें' : 'Add & Switch to Farm')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
