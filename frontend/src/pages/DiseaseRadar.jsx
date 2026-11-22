import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import axios from 'axios';
import { ShieldCheck, AlertCircle, CheckCircle2, Droplets, Info, Volume2 } from 'lucide-react';

export default function DiseaseRadar() {
  const { lang, t, speak } = useLanguage();
  const [risk, setRisk] = useState(null);
  const [loading, setLoading] = useState(true);
  const [simulatedMoisture, setSimulatedMoisture] = useState(84);
  const [hardwareLive, setHardwareLive] = useState(false);

  useEffect(() => {
    let active = true;
    const checkLiveReading = async () => {
      try {
        const res = await axios.get('/api/sensor/latest/DEVICE_001');
        if (res.data?.success && res.data.data) {
          if (active) {
            const mVal = res.data.data.moisturePercentage !== undefined ? res.data.data.moisturePercentage : res.data.data.moisture;
            if (mVal !== undefined && !isNaN(mVal)) {
              setSimulatedMoisture(Math.round(mVal));
            }
            setHardwareLive(true);
          }
        }
      } catch (e) {
        if (active) setHardwareLive(false);
      }
    };
    checkLiveReading();
    const interval = setInterval(checkLiveReading, 3000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  const fetchRisk = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/advisory/disease-risk?plotId=PLOT_001&cropName=Wheat');
      setRisk(res.data.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRisk();
  }, []);

  const isHighRisk = simulatedMoisture >= 80;

  const handleVoice = () => {
    const text = isHighRisk
      ? (lang === 'hi'
        ? 'चेतावनी: खेत में जलभराव एवं ऑक्सीजन की कमी दर्ज की गई है। पाइथियम एवं जड़ सड़न का खतरा अधिक है। तत्काल सिंचाई रोकें तथा पंद्रह सेंटीमीटर गहरी नाली बनाकर जल निकासी करें।'
        : 'Warning: Soil hypoxia and waterlogging detected. Root rot and damping-off hazard is elevated. Immediately halt irrigation and create drainage trenches.')
      : (lang === 'hi'
        ? 'मृदा स्वास्थ्य सामान्य है। जड़ों में वायु एवं नमी का अनुपात पूर्णतः संतुलित है।'
        : 'Soil health is normal. Aeration and moisture levels are optimal.');
    speak(text);
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '24px 16px' }}>
      {/* Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#1b4332', display: 'flex', alignItems: 'center', gap: '12px', margin: 0 }}>
            <ShieldCheck size={30} color={isHighRisk ? '#c2410c' : '#2d6a4f'} />
            {lang === 'hi'
              ? 'मृदा ऑक्सीजन ह्रास (हाइपोक्सिया) एवं जड़ सड़न पूर्व चेतावनी राडार'
              : 'Soil Aeration, Hypoxia & Fungal Root-Rot Advisory Radar'}
          </h1>
          <p style={{ color: '#4b5563', margin: '6px 0 0 0', fontSize: '15px' }}>
            {lang === 'hi'
              ? 'अत्यधिक नमी व जलभराव से जड़ों में ऑक्सीजन की कमी तथा फफूंद जनित रोगों (पाइथियम / राइजोक्टोनिया) की स्वतः पहचान।'
              : 'Proactive detection of root zone oxygen depletion and fungal damping-off pathogens from prolonged saturation.'}
          </p>
        </div>

        <button
          onClick={handleVoice}
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
            fontWeight: '700',
            fontSize: '14px',
            boxShadow: '0 2px 6px rgba(45,106,79,0.2)'
          }}
        >
          <Volume2 size={18} />
          {lang === 'hi' ? 'सलाह सुनें' : 'Listen Advice'}
        </button>
      </div>

      {/* Moisture Gauge / Slider Card (Elegant Earthy Style) */}
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        padding: '22px',
        border: '1px solid #e2e8f0',
        marginBottom: '22px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <div>
            <span style={{ fontWeight: '700', color: '#1e293b', fontSize: '15px' }}>
              {lang === 'hi' ? 'सेंसर प्रोब नमी स्तर (A0 पिन):' : 'Capacitive Moisture Sensor Level (A0 Probe):'}
            </span>
            {hardwareLive && (
              <span style={{ marginLeft: '10px', fontSize: '12px', color: '#16a34a', fontWeight: '700' }}>
                ● {lang === 'hi' ? 'लाइव हार्डवेयर सक्रिय' : 'Live Hardware Streaming'}
              </span>
            )}
          </div>
          <span style={{
            fontSize: '20px',
            fontWeight: '900',
            color: isHighRisk ? '#c2410c' : '#15803d',
            backgroundColor: isHighRisk ? '#fff7ed' : '#f0fdf4',
            padding: '4px 14px',
            borderRadius: '8px',
            border: `1px solid ${isHighRisk ? '#ffedd5' : '#bbf7d0'}`
          }}>
            {simulatedMoisture}%
          </span>
        </div>

        <input
          type="range"
          min="15"
          max="95"
          value={simulatedMoisture}
          onChange={(e) => setSimulatedMoisture(+e.target.value)}
          style={{
            width: '100%',
            height: '6px',
            accentColor: isHighRisk ? '#c2410c' : '#2d6a4f',
            cursor: 'pointer'
          }}
        />

        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#64748b', marginTop: '6px' }}>
          <span>15% ({lang === 'hi' ? 'शुष्क / सूखा' : 'Dry'})</span>
          <span>50% ({lang === 'hi' ? 'इष्टतम' : 'Optimal'})</span>
          <span style={{ color: '#c2410c', fontWeight: '700' }}>
            80%+ ({lang === 'hi' ? 'अति-संतृप्त / जलभराव' : 'Saturated / Hypoxia Risk'})
          </span>
        </div>
      </div>

      {/* Elegant Warning Banner (Soft Earth Warmth, Zero Harsh Spikey Red) */}
      <div style={{
        backgroundColor: isHighRisk ? '#fffaf8' : '#f8fafc',
        border: `1.5px solid ${isHighRisk ? '#fed7aa' : '#bbf7d0'}`,
        borderRadius: '14px',
        padding: '24px',
        marginBottom: '22px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '18px',
        boxShadow: isHighRisk ? '0 2px 8px rgba(194,65,12,0.06)' : 'none'
      }}>
        <div style={{
          width: '46px',
          height: '46px',
          borderRadius: '10px',
          backgroundColor: isHighRisk ? '#fff7ed' : '#ecfdf5',
          border: `1px solid ${isHighRisk ? '#ffedd5' : '#a7f3d0'}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}>
          {isHighRisk ? (
            <AlertCircle size={26} color="#c2410c" />
          ) : (
            <CheckCircle2 size={26} color="#15803d" />
          )}
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px', flexWrap: 'wrap' }}>
            <span style={{
              backgroundColor: isHighRisk ? '#fff7ed' : '#ecfdf5',
              color: isHighRisk ? '#9a3412' : '#065f46',
              border: `1px solid ${isHighRisk ? '#fed7aa' : '#a7f3d0'}`,
              fontSize: '12px',
              fontWeight: '800',
              padding: '3px 10px',
              borderRadius: '6px',
              letterSpacing: '0.4px'
            }}>
              {isHighRisk
                ? (lang === 'hi' ? 'उच्च सतर्कता (हाइपोक्सिया)' : 'ELEVATED RISK')
                : (lang === 'hi' ? 'संतोषजनक (सामान्य स्थिति)' : 'NORMAL CONDITION')}
            </span>
            <span style={{ fontSize: '13px', color: '#64748b' }}>
              {lang === 'hi' ? 'प्लॉट 1 — गेहूं की फसल' : 'Plot 1 — Wheat Field'}
            </span>
          </div>

          <h2 style={{ fontSize: '19px', fontWeight: '800', color: isHighRisk ? '#7c2d12' : '#14532d', margin: '6px 0 8px 0' }}>
            {isHighRisk
              ? (lang === 'hi'
                ? 'मृदा ऑक्सीजन ह्रास — जड़ सड़न एवं अंकुर गलन (Damping-off) की संभावना'
                : 'Soil Hypoxia — Root Rot & Damping-Off Vulnerability')
              : (lang === 'hi'
                ? 'मृदा वातन सामान्य — जड़ सड़न का कोई जोखिम नहीं'
                : 'Soil Aeration Balanced — Zero Fungal Risk Detected')}
          </h2>

          <p style={{ color: isHighRisk ? '#7c2d12' : '#334155', fontSize: '14px', lineHeight: '1.6', margin: 0 }}>
            {isHighRisk
              ? (lang === 'hi'
                ? 'लगातार 80% से ऊपर नमी रहने से मिट्टी के सूक्ष्म छिद्रों में वायु (ऑक्सीजन) समाप्त हो जाती है। इससे पौधों की जड़ें घुटने लगती हैं और जलजनित फंगस (पाइथियम, राइजोक्टोनिया) सक्रिय हो जाते हैं।'
                : 'Sustained moisture > 80% depletes oxygen from soil capillary pores, impairing root respiration and creating conditions for opportunistic anaerobic root molds.')
              : (lang === 'hi'
                ? 'वर्तमान नमी स्तर पौधों की जड़ों के श्वसन और पोषण अवशोषण के लिए पूर्णतः संतुलित है।'
                : 'Moisture and aeration balance is optimal for healthy root respiration and nutrient uptake.')}
          </p>
        </div>
      </div>

      {/* Immediate Agronomic Action Plan (Clean Numbered Badges, Soft & Elegant) */}
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        border: '1px solid #e2e8f0',
        padding: '24px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
      }}>
        <h3 style={{ fontSize: '17px', fontWeight: '800', color: '#0f172a', marginBottom: '16px' }}>
          {lang === 'hi' ? 'अनुशंसित कृषि उपचारात्मक कदम (Action Plan)' : 'Recommended Agronomic Remedial Actions'}
        </h3>

        {isHighRisk ? (
          <div style={{ display: 'grid', gap: '12px' }}>
            {/* Step 1 */}
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '14px',
              padding: '14px 16px',
              backgroundColor: '#fffdfb',
              border: '1px solid #fed7aa',
              borderRadius: '8px'
            }}>
              <span style={{
                width: '26px',
                height: '26px',
                borderRadius: '50%',
                backgroundColor: '#ffedd5',
                color: '#9a3412',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '13px',
                fontWeight: '800',
                flexShrink: 0
              }}>1</span>
              <div style={{ fontSize: '14px', color: '#334155', lineHeight: '1.5' }}>
                <strong style={{ color: '#7c2d12' }}>{lang === 'hi' ? 'सिंचाई तुरंत स्थगित करें:' : 'Halt Irrigation Immediately:'}</strong>{' '}
                {lang === 'hi' ? 'पंप मोटर को तत्काल बंद करें। जब तक मिट्टी की ऊपरी सतह सूख न जाए, नया जल न दें।' : 'Shut down tube well pump motors. Avoid adding surface water until topsoil aerates.'}
              </div>
            </div>

            {/* Step 2 */}
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '14px',
              padding: '14px 16px',
              backgroundColor: '#fffdfb',
              border: '1px solid #fed7aa',
              borderRadius: '8px'
            }}>
              <span style={{
                width: '26px',
                height: '26px',
                borderRadius: '50%',
                backgroundColor: '#ffedd5',
                color: '#9a3412',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '13px',
                fontWeight: '800',
                flexShrink: 0
              }}>2</span>
              <div style={{ fontSize: '14px', color: '#334155', lineHeight: '1.5' }}>
                <strong style={{ color: '#7c2d12' }}>{lang === 'hi' ? '15 सेमी सतही जल निकासी नाली बनाएं:' : 'Evacuate Surface Ponding:'}</strong>{' '}
                {lang === 'hi' ? 'खेत के निचले हिस्से में 15 सेमी गहरी नाली काटकर रुके हुए पानी को बाहर निकालें ताकि जड़ों को ऑक्सीजन मिल सके।' : 'Excavate 15 cm deep border trenches along lower depressions to drain standing water and restore oxygen flow.'}
              </div>
            </div>

            {/* Step 3 */}
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '14px',
              padding: '14px 16px',
              backgroundColor: '#fffdfb',
              border: '1px solid #fed7aa',
              borderRadius: '8px'
            }}>
              <span style={{
                width: '26px',
                height: '26px',
                borderRadius: '50%',
                backgroundColor: '#ffedd5',
                color: '#9a3412',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '13px',
                fontWeight: '800',
                flexShrink: 0
              }}>3</span>
              <div style={{ fontSize: '14px', color: '#334155', lineHeight: '1.5' }}>
                <strong style={{ color: '#7c2d12' }}>{lang === 'hi' ? 'ट्राइकोडर्मा जैविक कवकनाशी उपचार:' : 'Biological Fungicide Treatment:'}</strong>{' '}
                {lang === 'hi' ? 'ट्राइकोडर्मा विरिडी / हार्जिएनम (2.5 किग्रा/एकड़) को गोबर खाद में मिलाकर जड़ क्षेत्र में डालें। यह हानिकारक फंगस को नष्ट करता है।' : 'Apply Trichoderma viride biological fungicide @ 2.5 kg/acre blended in well-rotted FYM to suppress opportunistic root pathogens.'}
              </div>
            </div>
          </div>
        ) : (
          <div style={{ color: '#15803d', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 16px', backgroundColor: '#f0fdf4', borderRadius: '8px' }}>
            <CheckCircle2 size={18} color="#15803d" />
            <span>{lang === 'hi' ? 'मृदा वातन सामान्य है। किसी विशेष रासायनिक या जल निकासी उपचार की आवश्यकता नहीं है।' : 'Soil aeration is balanced. No corrective treatments required at this time.'}</span>
          </div>
        )}
      </div>
    </div>
  );
}
