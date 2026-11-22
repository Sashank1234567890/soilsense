import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import {
  Droplets,
  CloudRain,
  Sun,
  Clock,
  AlertTriangle,
  CheckCircle,
  Volume2,
  Radio,
  Sliders,
  RefreshCw,
  MapPin,
  Sprout,
  ArrowRight,
  Check,
  Calendar
} from 'lucide-react';

const CROP_NAME_MAP = {
  Wheat: { hi: 'गेहूं', en: 'Wheat' },
  Mustard: { hi: 'सरसों', en: 'Mustard' },
  Rice: { hi: 'बासमती धान', en: 'Rice (Basmati)' },
  Maize: { hi: 'मक्का', en: 'Maize' },
  Cotton: { hi: 'कपास', en: 'Cotton' }
};

export default function SmartIrrigation() {
  const { lang, t, speak } = useLanguage();
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [allFarms, setAllFarms] = useState([]);

  const plotParam = searchParams.get('plotId');
  const activePlotId = allFarms.some(f => f.plotId === plotParam)
    ? plotParam
    : (allFarms[0]?.plotId || 'PLOT_001');

  const [loading, setLoading] = useState(true);
  const [advisory, setAdvisory] = useState(null);
  const [weather, setWeather] = useState(null);
  const [cropStage, setCropStage] = useState('VEGETATIVE');
  const [currentMoisture, setCurrentMoisture] = useState(34);
  const [dataSource, setDataSource] = useState('live'); // 'live' or 'manual'
  const [latestHardwareReading, setLatestHardwareReading] = useState(null);
  const [hardwareDetected, setHardwareDetected] = useState(false);

  useEffect(() => {
    const fetchFarms = async () => {
      try {
        const res = await axios.get('/api/advisory/farms');
        if (res.data?.success && res.data?.data) {
          const farms = res.data.data;
          setAllFarms(farms);
          const currentParam = searchParams.get('plotId');
          if (farms.length > 0 && !farms.some(f => f.plotId === currentParam)) {
            setSearchParams({ plotId: farms[0].plotId });
          }
        }
      } catch (e) {
        console.error('Fetch farms error:', e);
      }
    };
    fetchFarms();
  }, [user?._id, user?.email]);

  const activeFarm = allFarms.find(f => f.plotId === activePlotId) || allFarms[0] || {
    plotId: activePlotId,
    name: 'Field Plot 1',
    areaAcres: 2.5,
    currentCrop: 'Wheat',
    location: { district: 'Ludhiana', state: 'Punjab' }
  };

  const cropDisplayName = lang === 'hi'
    ? (CROP_NAME_MAP[activeFarm.currentCrop]?.hi || activeFarm.currentCrop)
    : (CROP_NAME_MAP[activeFarm.currentCrop]?.en || activeFarm.currentCrop);

  useEffect(() => {
    let isMounted = true;

    const checkLiveHardware = async () => {
      try {
        const res = await axios.get('/api/sensor/latest/DEVICE_001');
        if (res.data?.success && res.data.data) {
          if (isMounted) {
            const reading = res.data.data;
            const mVal = Number(reading.moisture ?? reading.moisturePercentage ?? reading.soilMoisture ?? 0);
            const adcVal = Number(reading.rawADC ?? reading.rawValue ?? 0);
            const normalizedReading = {
              ...reading,
              moisture: isNaN(mVal) ? 0 : mVal,
              rawADC: isNaN(adcVal) ? 0 : adcVal
            };
            setLatestHardwareReading(normalizedReading);
            setHardwareDetected(true);
            if (dataSource === 'live' && !isNaN(mVal) && mVal > 0) {
              setCurrentMoisture(Math.round(mVal));
            }
          }
        }
      } catch (err) {
        if (isMounted) {
          setHardwareDetected(false);
        }
      }
    };

    checkLiveHardware();
    const interval = setInterval(checkLiveHardware, 2500);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [dataSource]);

  const fetchAdvisory = async () => {
    try {
      setLoading(true);
      const farmCrop = activeFarm.currentCrop || 'Wheat';
      const farmAcres = activeFarm.areaAcres || 2.5;
      const lat = activeFarm.location?.coordinates?.latitude || activeFarm.location?.lat || '';
      const lon = activeFarm.location?.coordinates?.longitude || activeFarm.location?.lon || '';

      const [advRes, wtrRes] = await Promise.all([
        axios.get(`/api/advisory/irrigation?plotId=${activePlotId}&cropName=${farmCrop}&cropStage=${cropStage}&currentMoisture=${currentMoisture}&acreage=${farmAcres}`),
        axios.get(`/api/advisory/weather?plotId=${activePlotId}&lat=${lat}&lon=${lon}`)
      ]);
      setAdvisory(advRes.data?.data);
      setWeather(wtrRes.data?.data || advRes.data?.data?.weather);
    } catch (e) {
      console.error('Failed to load advisory:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdvisory();
  }, [activePlotId, activeFarm.currentCrop, activeFarm.areaAcres, cropStage, currentMoisture]);

  const handleVoicePlay = () => {
    if (!advisory) return;
    const farmName = activeFarm.name || activePlotId;
    const liters = advisory.recommendedWaterVolumeLiters || 0;
    const hours = liters > 0 ? (liters / 28000).toFixed(1) : '0';
    const text = lang === 'hi'
      ? `${farmName} में फसल ${cropDisplayName} की नमी ${advisory.currentMoisture} प्रतिशत है। ${advisory.rainSkipTriggered ? 'अगले 24 घंटे में बारिश का अनुमान है, इसलिए आज ट्यूबवेल बंद रखें।' : `अनुशंसित जल मात्रा लगभग ${hours} घंटे ट्यूबवेल चलाने के बराबर है। पानी सुबह साढ़े पांच से साढ़े सात के बीच लगाएं।`}`
      : `${farmName} ${cropDisplayName} soil moisture is ${advisory.currentMoisture} percent. ${advisory.rainSkipTriggered ? 'Rain forecasted. Keep pump motors off.' : `Recommended pump runtime is ~${hours} hours. Best watering window is 5:30 to 7:30 AM.`}`;
    speak(text);
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px 16px' }}>
      
      {allFarms.length > 0 && (
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MapPin size={18} color="#0284c7" />
              <span style={{ fontSize: '14px', fontWeight: '800', color: '#0369a1', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {lang === 'hi' ? 'खेत एवं समर्पित फसल चयन (1 खेत = 1 पूरी फसल):' : 'Select Farm & Dedicated Crop (1 Farm = 1 Whole Crop):'}
              </span>
            </div>
            <Link
              to={`/crop-schedule?plotId=${activePlotId}`}
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
                textDecoration: 'none'
              }}
            >
              <Calendar size={14} />
              <span>{lang === 'hi' ? 'इस फसल के शेड्यूलर व अलर्ट्स देखें' : 'View Crop Scheduler & Alerts'}</span>
            </Link>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
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
                    backgroundColor: isSelected ? '#f0f9ff' : '#ffffff',
                    border: isSelected ? '2px solid #0284c7' : '1px solid #cbd5e1',
                    borderRadius: '12px',
                    padding: '14px 16px',
                    cursor: 'pointer',
                    boxShadow: isSelected ? '0 4px 12px rgba(2, 132, 199, 0.15)' : '0 1px 3px rgba(0,0,0,0.03)',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '6px', backgroundColor: isSelected ? '#e0f2fe' : '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Sprout size={18} color={isSelected ? '#0284c7' : '#475569'} />
                      </div>
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: '800', color: isSelected ? '#0369a1' : '#0f172a' }}>
                          {cropLabel}
                        </div>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>
                          {farm.plotId} • {farmDist} ({farm.areaAcres || farm.acreage || 2.5} {lang === 'hi' ? 'एकड़' : 'Ac'})
                        </div>
                      </div>
                    </div>

                    {isSelected ? (
                      <span style={{
                        backgroundColor: '#0284c7',
                        color: '#ffffff',
                        fontSize: '11px',
                        fontWeight: '800',
                        padding: '2px 8px',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        <Check size={12} />
                        {lang === 'hi' ? 'सक्रिय' : 'Active'}
                      </span>
                    ) : (
                      <span style={{ fontSize: '11px', color: '#64748b', backgroundColor: '#f1f5f9', padding: '2px 6px', borderRadius: '4px', fontWeight: '600' }}>
                        Day {farm.das}
                      </span>
                    )}
                  </div>

                  <div style={{ fontSize: '11px', color: '#475569', marginTop: '6px', borderTop: '1px solid #e2e8f0', paddingTop: '6px', display: 'flex', justifyContent: 'space-between' }}>
                    <span>{farm.name}</span>
                    <span style={{ fontWeight: '700', color: '#0369a1' }}>
                      {isSelected ? (lang === 'hi' ? 'चयनित खेत' : 'Selected') : (lang === 'hi' ? 'क्लिक करके चुनें' : 'Click to select')}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#1b4332', display: 'flex', alignItems: 'center', gap: '12px', margin: 0 }}>
            <Droplets size={32} color="#2d6a4f" />
            {lang === 'hi' ? `${cropDisplayName} स्मार्ट सिंचाई एवं जल बजट` : `${cropDisplayName} Smart Irrigation & Water Budgeting`}
          </h1>
          <p style={{ color: '#52796f', margin: '6px 0 0 0', fontSize: '15px' }}>
            {lang === 'hi'
              ? `${activeFarm.name} (${activePlotId} • ${activeFarm.areaAcres || 2.5} एकड़) हेतु सेंसर प्रोब (A0) व वर्षा पूर्वानुमान आधारित सटीक जल प्रबंधन`
              : `Precise crop water budgeting fused with real-time A0 sensor telemetry & rain forecasts for ${activeFarm.name} (${activePlotId} • ${activeFarm.areaAcres || 2.5} Acres).`}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <Link
            to={`/crop-schedule?plotId=${activePlotId}`}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#ffffff',
              border: '1.5px solid #2d6a4f',
              color: '#2d6a4f',
              padding: '10px 16px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '700',
              fontSize: '14px',
              textDecoration: 'none'
            }}
          >
            <Calendar size={16} />
            <span>{lang === 'hi' ? 'फसल शेड्यूलर व अलर्ट्स' : 'Crop Scheduler & Alerts'}</span>
          </Link>

          <button
            onClick={handleVoicePlay}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: '#2d6a4f',
              color: '#fff',
              border: 'none',
              padding: '10px 18px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '14px',
              boxShadow: '0 2px 8px rgba(45,106,79,0.25)'
            }}
          >
            <Volume2 size={18} />
            {lang === 'hi' ? 'सलाह सुनें (आवाज़)' : 'Listen Voice Advisory'}
          </button>
        </div>
      </div>

      {weather && (
        <div style={{
          backgroundColor: weather.forecastRainNext24hMm >= 5 ? '#fef3c7' : '#e8f5e9',
          border: `1px solid ${weather.forecastRainNext24hMm >= 5 ? '#f59e0b' : '#a3e635'}`,
          borderRadius: '12px',
          padding: '16px 20px',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            {weather.forecastRainNext24hMm >= 5 ? (
              <CloudRain size={36} color="#d97706" />
            ) : (
              <Sun size={36} color="#15803d" />
            )}
            <div>
              <div style={{ fontWeight: '700', fontSize: '16px', color: '#1f2937' }}>
                {weather.location?.district || activeFarm.location?.district || 'Delhi'}, {weather.location?.state || activeFarm.location?.state || 'India'} — {weather.temperatureCelsius}°C
              </div>
              <div style={{ fontSize: '14px', color: '#4b5563', marginTop: '2px' }}>
                {weather.forecastRainNext24hMm >= 5 ? (
                  <span style={{ color: '#b45309', fontWeight: '700' }}>
                    {lang === 'hi'
                      ? `⚠️ बारिश का पूर्वानुमान: ${weather.forecastRainNext24hMm} मिमी (अगले 24 घंटे में) — सिंचाई रोक दी गई है!`
                      : `⚠️ Rain Forecasted: ${weather.forecastRainNext24hMm} mm (Next 24h) — Irrigation Automatically Deferred!`}
                  </span>
                ) : (
                  <span>
                    <strong style={{ color: '#15803d' }}>
                      {lang === 'hi'
                        ? `वर्षा पूर्वानुमान: ${weather.forecastRainNext24hMm || 0} मिमी (साफ़ आसमान / बारिश नहीं)`
                        : `24h Rain Forecast: ${weather.forecastRainNext24hMm || 0} mm (Clear Sky / No Rain)`}
                    </strong>
                    {' '}• {lang === 'hi'
                      ? `आर्द्रता: ${weather.humidityPercent}%, ET₀ वाष्पीकरण: ${weather.referenceEvapotranspirationET0} मिमी/दिन`
                      : `Humidity: ${weather.humidityPercent}%, ET₀ Evapotranspiration: ${weather.referenceEvapotranspirationET0} mm/day`}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div style={{ fontSize: '13px', color: '#6b7280' }}>
            {lang === 'hi' ? 'स्रोत: IMD / Open-Meteo लाइव API' : 'Source: IMD / Open-Meteo High-Resolution Live API'}
          </div>
        </div>
      )}

      <div style={{
        backgroundColor: '#ffffff',
        padding: '20px',
        borderRadius: '12px',
        border: '1px solid #e5e7eb',
        marginBottom: '24px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ fontWeight: '700', fontSize: '16px', color: '#111827' }}>
              {lang === 'hi' ? 'डेटा स्रोत एवं प्रोब मोड' : 'Sensor Telemetry Source & Mode'}
            </div>
            <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '2px' }}>
              {lang === 'hi'
                ? 'हार्डवेयर कनेक्ट करने पर डेटा स्वतः लाइव अपडेट होगा'
                : 'When physical Arduino A0 probe is plugged in, data updates automatically in real-time'}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setDataSource('live')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: '700',
                cursor: 'pointer',
                border: dataSource === 'live' ? '2px solid #16a34a' : '1px solid #d1d5db',
                backgroundColor: dataSource === 'live' ? '#f0fdf4' : '#ffffff',
                color: dataSource === 'live' ? '#166534' : '#4b5563'
              }}
            >
              <Radio size={16} color={dataSource === 'live' ? '#16a34a' : '#9ca3af'} />
              <span>{lang === 'hi' ? 'सजीव हार्डवेयर मोड (Auto-Sync)' : 'Live Hardware (Auto-Sync)'}</span>
            </button>

            <button
              onClick={() => setDataSource('manual')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: '700',
                cursor: 'pointer',
                border: dataSource === 'manual' ? '2px solid #2563eb' : '1px solid #d1d5db',
                backgroundColor: dataSource === 'manual' ? '#eff6ff' : '#ffffff',
                color: dataSource === 'manual' ? '#1d4ed8' : '#4b5563'
              }}
            >
              <Sliders size={16} color={dataSource === 'manual' ? '#2563eb' : '#9ca3af'} />
              <span>{lang === 'hi' ? 'मैनुअल स्लाइडर (Simulator)' : 'Manual Slider (Simulator)'}</span>
            </button>
          </div>
        </div>

        {dataSource === 'live' && (
          <div style={{
            padding: '12px 16px',
            borderRadius: '8px',
            backgroundColor: hardwareDetected ? '#ecfdf5' : '#fffbeb',
            border: `1px solid ${hardwareDetected ? '#a7f3d0' : '#fde68a'}`,
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '13px',
            flexWrap: 'wrap',
            gap: '8px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                backgroundColor: hardwareDetected ? '#10b981' : '#f59e0b',
                boxShadow: hardwareDetected ? '0 0 8px #10b981' : 'none'
              }} />
              <span style={{ fontWeight: '700', color: hardwareDetected ? '#065f46' : '#92400e' }}>
                {hardwareDetected
                  ? (lang === 'hi'
                      ? `हार्डवेयर लाइव है: Arduino Uno (Pin A0) — वर्तमान रीडिंग: ${latestHardwareReading?.moisture ?? '--'}%`
                      : `Live Hardware Active: Arduino Uno (Pin A0) — Telemetry: ${latestHardwareReading?.moisture ?? '--'}% (ADC: ${latestHardwareReading?.rawADC ?? '--'})`)
                  : (lang === 'hi' ? 'हार्डवेयर स्टैंडबाई: यूएसबी से मृदा नमी सेंसर कनेक्ट करें' : 'Hardware Standby: Connect Arduino USB Soil Moisture Sensor')}
              </span>
            </div>

            {latestHardwareReading && (
              <span style={{ color: '#047857', fontWeight: '500' }}>
                {lang === 'hi' ? 'अंतिम अपडेट: अभी-अभी' : `Last update: ${new Date(latestHardwareReading.timestamp).toLocaleTimeString()}`}
              </span>
            )}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
              {lang === 'hi' ? 'फसल की अवस्था (Crop Growth Stage)' : 'Crop Phenological Stage'}
            </label>
            <select
              value={cropStage}
              onChange={(e) => setCropStage(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '8px',
                border: '1px solid #d1d5db',
                fontSize: '14px'
              }}
            >
              <option value="GERMINATION">{lang === 'hi' ? 'अंकुरण (Germination / Basal)' : 'Germination / Sowing (Basal)'}</option>
              <option value="VEGETATIVE">{lang === 'hi' ? 'वानस्पतिक बढ़वार (Vegetative / CRI)' : 'Vegetative / Crown Root (CRI)'}</option>
              <option value="FLOWERING">{lang === 'hi' ? 'फूल / बाली आना (Flowering / Heading)' : 'Flowering / Panicle Heading'}</option>
              <option value="GRAIN_FORMATION">{lang === 'hi' ? 'दाना भराव (Grain Filling)' : 'Grain Formation / Dough'}</option>
              <option value="MATURITY">{lang === 'hi' ? 'परिपक्वता (Maturity / Harvest)' : 'Maturation / Harvesting'}</option>
            </select>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <label style={{ fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                {lang === 'hi' ? 'मृदा नमी (Soil Moisture %)' : 'Soil Moisture (%)'}
                {dataSource === 'live' && (
                  <span style={{ fontSize: '12px', color: '#16a34a', marginLeft: '6px', fontWeight: '700' }}>
                    ({lang === 'hi' ? 'हार्डवेयर से स्वतः अपडेट' : 'Auto-Syncing from A0'})
                  </span>
                )}
              </label>
              <span style={{ fontWeight: '800', color: '#2d6a4f', fontSize: '16px' }}>{isNaN(currentMoisture) ? 0 : currentMoisture}%</span>
            </div>
            <input
              type="range"
              min="10"
              max="90"
              value={isNaN(currentMoisture) ? 0 : currentMoisture}
              disabled={dataSource === 'live' && hardwareDetected}
              onChange={(e) => setCurrentMoisture(+e.target.value)}
              style={{
                width: '100%',
                accentColor: '#2d6a4f',
                cursor: (dataSource === 'live' && hardwareDetected) ? 'not-allowed' : 'pointer'
              }}
            />
            {dataSource === 'live' && hardwareDetected && (
              <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                {lang === 'hi' ? 'स्लाइडर लॉक है क्योंकि भौतिक सेंसर प्रोब से लाइव रीडिंग आ रही है' : 'Slider is locked because live readings are actively streaming from physical A0 probe'}
              </div>
            )}
          </div>
        </div>
      </div>

      {advisory && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
          
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            border: '1px solid #e5e7eb',
            padding: '24px',
            boxShadow: '0 1px 4px rgba(0,0,0,0.06)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontSize: '14px', fontWeight: '600', color: '#6b7280' }}>
                {lang === 'hi' ? 'आवश्यक जल की मात्रा' : 'Water Volume Required'}
              </span>
              <Droplets color="#0284c7" size={24} />
            </div>
            <div style={{ fontSize: '30px', fontWeight: '800', color: '#0369a1' }}>
              {Math.max(0, advisory.recommendedWaterVolumeLiters || 0).toLocaleString()} <span style={{ fontSize: '16px', fontWeight: '600' }}>{lang === 'hi' ? 'लीटर' : 'Liters'}</span>
            </div>
            <div style={{ fontSize: '13px', fontWeight: '800', color: '#059669', marginTop: '4px' }}>
              {lang === 'hi'
                ? `लगभग ${(Math.max(0, advisory.recommendedWaterVolumeLiters || 0) / 100000).toFixed(2)} लाख लीटर (~${Math.max(0, Math.round((advisory.recommendedWaterVolumeLiters || 0) / 10000))} टैंकर)`
                : `~${(Math.max(0, advisory.recommendedWaterVolumeLiters || 0) / 100000).toFixed(2)} Lakh Liters (~${Math.max(0, Math.round((advisory.recommendedWaterVolumeLiters || 0) / 10000))} Tankers)`}
            </div>
            <div style={{ fontSize: '12px', fontWeight: '700', color: '#166534', backgroundColor: '#dcfce7', padding: '4px 8px', borderRadius: '6px', display: 'inline-block', marginTop: '6px' }}>
              {lang === 'hi'
                ? `ट्यूबवेल समय: लगभग ${advisory.recommendedWaterVolumeLiters > 0 ? (advisory.recommendedWaterVolumeLiters / 28000).toFixed(1) : 0} घंटे (5 HP पंप @ 28,000 ली/घंटा)`
                : `Pump Run Time: ~${advisory.recommendedWaterVolumeLiters > 0 ? (advisory.recommendedWaterVolumeLiters / 28000).toFixed(1) : 0} Hours (5 HP Pump)`}
            </div>
            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '6px' }}>
              {lang === 'hi'
                ? `खेत का रकबा: ${activeFarm.areaAcres || 2.5} एकड़ (${advisory.recommendedWaterDepthMm} मिमी गहराई)`
                : `For ${activeFarm.areaAcres || 2.5} Acre Plot (${advisory.recommendedWaterDepthMm} mm water depth)`}
            </div>
          </div>

          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            border: '1px solid #e5e7eb',
            padding: '24px',
            boxShadow: '0 1px 4px rgba(0,0,0,0.06)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontSize: '14px', fontWeight: '600', color: '#6b7280' }}>
                {lang === 'hi' ? 'सिंचाई तत्परता (Urgency)' : 'Irrigation Urgency'}
              </span>
              {advisory.rainSkipTriggered ? (
                <AlertTriangle color="#d97706" size={24} />
              ) : (
                <CheckCircle color="#15803d" size={24} />
              )}
            </div>
            <div style={{
              fontSize: '24px',
              fontWeight: '800',
              color: advisory.rainSkipTriggered ? '#d97706' : (advisory.urgency === 'URGENT' || advisory.urgency === 'CRITICAL') ? '#dc2626' : '#15803d'
            }}>
              {advisory.rainSkipTriggered
                ? (lang === 'hi' ? 'बारिश के कारण स्थगित' : 'RAIN SUPPRESSED')
                : (advisory.urgency === 'MODERATE' ? (lang === 'hi' ? 'मध्यम (योजना बनाएं)' : 'MODERATE (PLAN SOON)') : advisory.urgency)}
            </div>
            <div style={{ fontSize: '14px', color: '#64748b', marginTop: '8px' }}>
              {advisory.rainSkipTriggered
                ? (lang === 'hi' ? `बारिश का अनुमान (${advisory.forecastRainNext24hMm ?? weather?.forecastRainNext24hMm} मिमी) — प्राकृतिक पानी मिलेगा, मोटर बंद रखें` : `Natural rain (${advisory.forecastRainNext24hMm ?? weather?.forecastRainNext24hMm} mm) incoming — conserve electricity & water`)
                : (lang === 'hi' ? `लक्ष्य नमी: ${advisory.targetMoisture}% | वर्तमान: ${advisory.currentMoisture}%` : `Target Moisture: ${advisory.targetMoisture}% | Current: ${advisory.currentMoisture}%`)}
            </div>
            <div style={{ marginTop: '8px', fontSize: '12px', fontWeight: '700', color: (advisory.forecastRainNext24hMm ?? weather?.forecastRainNext24hMm ?? 0) >= 5 ? '#b45309' : '#0369a1' }}>
              🌧️ {lang === 'hi'
                ? `वर्षा अनुमान: ${advisory.forecastRainNext24hMm ?? weather?.forecastRainNext24hMm ?? 0} मिमी (${(advisory.forecastRainNext24hMm ?? weather?.forecastRainNext24hMm ?? 0) >= 5 ? 'बारिश आएगी' : 'बारिश नहीं'})`
                : `Rain Forecast: ${advisory.forecastRainNext24hMm ?? weather?.forecastRainNext24hMm ?? 0} mm (${(advisory.forecastRainNext24hMm ?? weather?.forecastRainNext24hMm ?? 0) >= 5 ? 'Rain Expected' : 'No Rain'})`}
            </div>
          </div>

          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            border: '1px solid #e5e7eb',
            padding: '24px',
            boxShadow: '0 1px 4px rgba(0,0,0,0.06)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontSize: '14px', fontWeight: '600', color: '#6b7280' }}>
                {lang === 'hi' ? 'वर्षा पूर्वानुमान एवं मौसम' : 'Rain Forecast & Weather'}
              </span>
              <CloudRain color={(advisory.forecastRainNext24hMm ?? weather?.forecastRainNext24hMm ?? 0) >= 5 ? '#d97706' : '#0284c7'} size={24} />
            </div>
            <div style={{ fontSize: '28px', fontWeight: '800', color: (advisory.forecastRainNext24hMm ?? weather?.forecastRainNext24hMm ?? 0) >= 5 ? '#d97706' : '#0f172a' }}>
              {advisory.forecastRainNext24hMm ?? weather?.forecastRainNext24hMm ?? 0} <span style={{ fontSize: '16px', fontWeight: '600' }}>{lang === 'hi' ? 'मिमी' : 'mm'}</span>
            </div>
            <div style={{ fontSize: '13px', fontWeight: '700', color: (advisory.forecastRainNext24hMm ?? weather?.forecastRainNext24hMm ?? 0) >= 5 ? '#b45309' : '#16a34a', marginTop: '6px' }}>
              {lang === 'hi'
                ? ((advisory.forecastRainNext24hMm ?? weather?.forecastRainNext24hMm ?? 0) >= 5
                  ? `⚠️ बारिश की संभावना: ${weather?.precipitationProbabilityMax ?? 75}%`
                  : `☀️ साफ़ आसमान (बारिश की संभावना: ${weather?.precipitationProbabilityMax ?? 0}%)`)
                : ((advisory.forecastRainNext24hMm ?? weather?.forecastRainNext24hMm ?? 0) >= 5
                  ? `⚠️ Rain Probability: ${weather?.precipitationProbabilityMax ?? 75}%`
                  : `☀️ Clear Sky (Rain Probability: ${weather?.precipitationProbabilityMax ?? 0}%)`)}
            </div>
            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '6px' }}>
              {lang === 'hi'
                ? `क्षेत्र: ${weather?.location?.district || activeFarm.location?.district || 'दिल्ली'}, ${weather?.location?.state || activeFarm.location?.state || 'भारत'}`
                : `Area: ${weather?.location?.district || activeFarm.location?.district || 'Delhi'}, ${weather?.location?.state || activeFarm.location?.state || 'India'}`}
            </div>
          </div>

          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            border: '1px solid #e5e7eb',
            padding: '24px',
            boxShadow: '0 1px 4px rgba(0,0,0,0.06)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontSize: '14px', fontWeight: '600', color: '#6b7280' }}>
                {lang === 'hi' ? 'सर्वोत्तम सिंचाई समय' : 'Optimal Watering Window'}
              </span>
              <Clock color="#4f46e5" size={24} />
            </div>
            <div style={{ fontSize: '24px', fontWeight: '800', color: '#3730a3' }}>
              {advisory.optimalWindow.startTime} – {advisory.optimalWindow.endTime}
            </div>
            <div style={{ fontSize: '14px', color: '#64748b', marginTop: '8px' }}>
              {lang === 'hi'
                ? 'प्रातः काल में हवा और धूप मंद होने से वाष्पीकरण न्यूनतम रहता है'
                : 'Dawn hours prevent solar evaporation loss & surface runoff'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
