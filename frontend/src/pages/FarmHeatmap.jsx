import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Map, Layers, RefreshCw, Info, Droplets } from 'lucide-react';

export default function FarmHeatmap() {
  const { lang, t } = useLanguage();
  const [selectedZone, setSelectedZone] = useState(null);

  const [grid, setGrid] = useState([
    { id: 'Z1', row: 1, col: 1, moisture: 38, status: 'Optimal' },
    { id: 'Z2', row: 1, col: 2, moisture: 42, status: 'Optimal' },
    { id: 'Z3', row: 1, col: 3, moisture: 45, status: 'Optimal' },
    { id: 'Z4', row: 1, col: 4, moisture: 31, status: 'Dry' },

    { id: 'Z5', row: 2, col: 1, moisture: 52, status: 'Optimal' },
    { id: 'Z6', row: 2, col: 2, moisture: 55, status: 'Optimal' },
    { id: 'Z7', row: 2, col: 3, moisture: 58, status: 'Optimal' },
    { id: 'Z8', row: 2, col: 4, moisture: 35, status: 'Optimal' },

    { id: 'Z9', row: 3, col: 1, moisture: 65, status: 'Optimal' },
    { id: 'Z10', row: 3, col: 2, moisture: 68, status: 'Optimal' },
    { id: 'Z11', row: 3, col: 3, moisture: 78, status: 'Saturated' },
    { id: 'Z12', row: 3, col: 4, moisture: 84, status: 'Waterlogged' },

    { id: 'Z13', row: 4, col: 1, moisture: 48, status: 'Optimal' },
    { id: 'Z14', row: 4, col: 2, moisture: 50, status: 'Optimal' },
    { id: 'Z15', row: 4, col: 3, moisture: 82, status: 'Waterlogged' },
    { id: 'Z16', row: 4, col: 4, moisture: 86, status: 'Waterlogged' }
  ]);

  const getColor = (m) => {
    if (m < 35) return '#f87171';
    if (m <= 70) return '#4ade80';
    if (m <= 80) return '#60a5fa';
    return '#1e40af';
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '24px 16px' }}>

      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#1b4332', display: 'flex', alignItems: 'center', gap: '12px', margin: 0 }}>
          <Map size={32} color="#2d6a4f" />
          {lang === 'hi' ? '2D खेत नमी स्थानिक नक्शा (Moisture Contour Map)' : '2D Farm Spatial Moisture Contour Heatmap'}
        </h1>
        <p style={{ color: '#52796f', margin: '6px 0 0 0', fontSize: '15px' }}>
          {lang === 'hi'
            ? 'खेत के विभिन्न कोनों में नमी के फैलाव और जलभराव वाले निचले क्षेत्रों की 2D ग्रिड विजुअलाइजेशन'
            : '2D spatial visualization of farm moisture gradients across field depressions, slope runoff, and dry elevations.'}
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>

        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #e5e7eb',
          padding: '24px',
          boxShadow: '0 1px 4px rgba(0,0,0,0.06)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <span style={{ fontWeight: '700', fontSize: '16px', color: '#111827' }}>
              {lang === 'hi' ? 'प्लॉट 1 — 4x4 स्थानिक क्षेत्र ग्रिड' : 'Plot 1 — 4x4 Spatial Sampling Grid'}
            </span>
            <span style={{ fontSize: '13px', color: '#6b7280' }}>
              {lang === 'hi' ? 'क्लिक करके विवरण देखें' : 'Click zone to inspect'}
            </span>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '8px',
            backgroundColor: '#f1f5f9',
            padding: '12px',
            borderRadius: '10px'
          }}>
            {grid.map(zone => (
              <button
                key={zone.id}
                onClick={() => setSelectedZone(zone)}
                style={{
                  height: '80px',
                  backgroundColor: getColor(zone.moisture),
                  borderRadius: '8px',
                  border: selectedZone?.id === zone.id ? '3px solid #000' : 'none',
                  color: zone.moisture > 80 ? '#ffffff' : '#0f172a',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  fontWeight: '700',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                }}
              >
                <div style={{ fontSize: '13px', opacity: 0.9 }}>{zone.id}</div>
                <div style={{ fontSize: '18px', fontWeight: '800' }}>{zone.moisture}%</div>
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: '18px', fontSize: '12px', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '14px', height: '14px', backgroundColor: '#f87171', borderRadius: '3px' }} />
              <span>Dry (&lt;35%)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '14px', height: '14px', backgroundColor: '#4ade80', borderRadius: '3px' }} />
              <span>Optimal (35-70%)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '14px', height: '14px', backgroundColor: '#60a5fa', borderRadius: '3px' }} />
              <span>Saturated (70-80%)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '14px', height: '14px', backgroundColor: '#1e40af', borderRadius: '3px' }} />
              <span>Waterlogged (&gt;80%)</span>
            </div>
          </div>
        </div>

        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #e5e7eb',
          padding: '24px',
          boxShadow: '0 1px 4px rgba(0,0,0,0.06)'
        }}>
          <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#111827', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Droplets size={22} color="#2d6a4f" />
            {lang === 'hi' ? 'क्षेत्रीय विश्लेषण (Zone Inspector)' : 'Zone Detail Analysis'}
          </h2>

          {selectedZone ? (
            <div>
              <div style={{
                backgroundColor: getColor(selectedZone.moisture),
                padding: '16px',
                borderRadius: '8px',
                color: selectedZone.moisture > 80 ? '#fff' : '#000',
                marginBottom: '16px'
              }}>
                <div style={{ fontSize: '14px', opacity: 0.9 }}>{lang === 'hi' ? 'क्षेत्र संख्या' : 'Selected Zone'}: {selectedZone.id}</div>
                <div style={{ fontSize: '28px', fontWeight: '900' }}>{selectedZone.moisture}% Moisture</div>
                <div style={{ fontSize: '14px', fontWeight: '700', marginTop: '4px' }}>Status: {selectedZone.status}</div>
              </div>

              <div style={{ fontSize: '14px', lineHeight: '1.6', color: '#374151' }}>
                {selectedZone.moisture > 80 ? (
                  <p style={{ color: '#b91c1c' }}>
                    <strong>{lang === 'hi' ? 'चेतावनी:' : 'Warning:'}</strong> {lang === 'hi' ? 'यह क्षेत्र खेत का निचला गड्ढा है जहाँ पानी रुक रहा है। यहाँ जल निकासी नाली बनाएं अन्यथा जड़ें सड़ सकती हैं।' : 'This depression zone is exhibiting severe water pooling. Excavate border trenching immediately to prevent root asphyxiation.'}
                  </p>
                ) : selectedZone.moisture < 35 ? (
                  <p style={{ color: '#c2410c' }}>
                    <strong>{lang === 'hi' ? 'सिंचाई सलाह:' : 'Irrigation Advice:'}</strong> {lang === 'hi' ? 'यह क्षेत्र अपेक्षाकृत सूखा है। स्प्रिंकलर या ड्रिप से यहाँ अतिरिक्त 20 मिनट जल दें।' : 'Elevated patch showing moisture deficit. Provide additional targeted surface irrigation.'}
                  </p>
                ) : (
                  <p style={{ color: '#15803d' }}>
                    <strong>{lang === 'hi' ? 'संतोषजनक:' : 'Ideal Condition:'}</strong> {lang === 'hi' ? 'नमी का स्तर पौधे की जड़ के विकास के लिए पूर्णतः संतुलित है।' : 'Soil capillary moisture is balanced. Optimal transpiration and uptake.'}
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', color: '#6b7280', padding: '40px 0' }}>
              {lang === 'hi' ? 'नक्शे के किसी भी ब्लॉक पर क्लिक करके नमी और सलाह देखें' : 'Click any grid block on the map to inspect moisture status'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
