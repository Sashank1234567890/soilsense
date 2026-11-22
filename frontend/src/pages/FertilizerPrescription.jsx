import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import axios from 'axios';
import { Sprout, ShieldAlert, Sparkles, Check, FileText, Calendar, Leaf } from 'lucide-react';

export default function FertilizerPrescription() {
  const { lang, t } = useLanguage();
  const [stage, setStage] = useState('VEGETATIVE');
  const [crop, setCrop] = useState('Wheat');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchPrescription = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/advisory/fertilizer?plotId=PLOT_001&cropName=${crop}&cropStage=${stage}`);
      setData(res.data.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrescription();
  }, [stage, crop]);

  const stagesList = [
    { key: 'BASAL', labelEn: 'Sowing / Basal', labelHi: 'बुवाई के समय (बेसल)' },
    { key: 'VEGETATIVE', labelEn: 'Vegetative (CRI)', labelHi: 'वानस्पतिक बढ़वार (CRI)' },
    { key: 'FLOWERING', labelEn: 'Flowering / Heading', labelHi: 'फूल व बाली अवस्था' },
    { key: 'MATURITY', labelEn: 'Maturation', labelHi: 'दाना पकने की अवस्था' }
  ];

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px 16px' }}>
      {/* Title */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#1b4332', display: 'flex', alignItems: 'center', gap: '12px', margin: 0 }}>
          <Sprout size={32} color="#2d6a4f" />
          {lang === 'hi' ? 'ICAR चरण-वार सटीक उर्वरक खुराक एवं खाद योजना' : 'ICAR Stage-Wise Precision Fertilizer & Organic Advisory'}
        </h1>
        <p style={{ color: '#52796f', margin: '6px 0 0 0', fontSize: '15px' }}>
          {lang === 'hi'
            ? 'फसल की आयु और आवश्यकता अनुसार यूरिया, डीएपी, एमओपी और जैविक नीम खली की वैज्ञानिक मात्रा'
            : 'Precision split dosing based on ICAR nutrient absorption curves with commercial & organic alternatives.'}
        </p>
      </div>

      {/* Stage Selector Timeline */}
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        padding: '20px',
        border: '1px solid #e5e7eb',
        marginBottom: '24px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
      }}>
        <div style={{ fontSize: '14px', fontWeight: '700', color: '#374151', marginBottom: '14px' }}>
          {lang === 'hi' ? 'फसल की वर्तमान विकास अवस्था चुनें:' : 'Select Current Crop Phenological Stage:'}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
          {stagesList.map(s => {
            const isSelected = stage === s.key;
            return (
              <button
                key={s.key}
                onClick={() => setStage(s.key)}
                style={{
                  padding: '14px 16px',
                  borderRadius: '10px',
                  border: isSelected ? '2px solid #2d6a4f' : '1px solid #e5e7eb',
                  backgroundColor: isSelected ? '#e8f5e9' : '#f9fafb',
                  color: isSelected ? '#1b4332' : '#374151',
                  fontWeight: isSelected ? '700' : '500',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ fontSize: '12px', color: isSelected ? '#2d6a4f' : '#6b7280', textTransform: 'uppercase', marginBottom: '4px' }}>
                  {s.key}
                </div>
                <div style={{ fontSize: '14px' }}>
                  {lang === 'hi' ? s.labelHi : s.labelEn}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Prescription Grid */}
      {data && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
          {/* Chemical Fertilizer Column */}
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            border: '1px solid #e5e7eb',
            padding: '24px',
            boxShadow: '0 1px 4px rgba(0,0,0,0.06)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <Sparkles color="#2563eb" size={24} />
              <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#1e3a8a', margin: 0 }}>
                {lang === 'hi' ? 'रासायनिक उर्वरक खुराक (प्रति एकड़)' : 'Commercial Chemical Fertilizer Dosage (Per Acre)'}
              </h2>
            </div>

            {data.chemicalDosage.map((item, idx) => (
              <div key={idx} style={{
                backgroundColor: '#eff6ff',
                border: '1px solid #bfdbfe',
                borderRadius: '8px',
                padding: '16px',
                marginBottom: '12px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ fontWeight: '700', color: '#1e40af', fontSize: '16px' }}>
                    {item.fertilizerName}
                  </div>
                  <span style={{
                    backgroundColor: '#1d4ed8',
                    color: '#fff',
                    padding: '4px 10px',
                    borderRadius: '20px',
                    fontSize: '14px',
                    fontWeight: '700'
                  }}>
                    {item.quantityKgPerAcre} kg / Acre
                  </span>
                </div>
                <div style={{ fontSize: '13px', color: '#1e3a8a', marginTop: '8px' }}>
                  <strong>{lang === 'hi' ? 'विधि:' : 'Application:'}</strong> {item.applicationMethod}
                </div>
                <div style={{ fontSize: '13px', color: '#1e3a8a', marginTop: '4px' }}>
                  <strong>{lang === 'hi' ? 'समय:' : 'Timing:'}</strong> {item.timing}
                </div>
              </div>
            ))}
          </div>

          {/* Organic Alternatives Column */}
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            border: '1px solid #e5e7eb',
            padding: '24px',
            boxShadow: '0 1px 4px rgba(0,0,0,0.06)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <Leaf color="#16a34a" size={24} />
              <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#14532d', margin: 0 }}>
                {lang === 'hi' ? 'जैविक व पर्यावरण-अनुकूल विकल्प' : 'Organic & Bio-Fertilizer Alternatives'}
              </h2>
            </div>

            {data.organicAlternatives.map((org, idx) => (
              <div key={idx} style={{
                backgroundColor: '#f0fdf4',
                border: '1px solid #bbf7d0',
                borderRadius: '8px',
                padding: '16px',
                marginBottom: '12px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ fontWeight: '700', color: '#166534', fontSize: '16px' }}>
                    {org.amendmentName}
                  </div>
                  <span style={{
                    backgroundColor: '#15803d',
                    color: '#fff',
                    padding: '4px 10px',
                    borderRadius: '20px',
                    fontSize: '14px',
                    fontWeight: '700'
                  }}>
                    {org.quantityKgPerAcre} kg / Acre
                  </span>
                </div>
                <div style={{ fontSize: '13px', color: '#14532d', marginTop: '8px' }}>
                  <strong>{lang === 'hi' ? 'मृदा स्वास्थ्य लाभ:' : 'Soil Health Benefit:'}</strong> {org.soilHealthBenefit}
                </div>
              </div>
            ))}

            <div style={{
              marginTop: '16px',
              padding: '12px',
              backgroundColor: '#fefce8',
              border: '1px solid #fef08a',
              borderRadius: '8px',
              fontSize: '13px',
              color: '#854d0e'
            }}>
              <strong>{lang === 'hi' ? 'नीम खली का विशेष लाभ:' : 'Neem Cake Agronomic Advantage:'}</strong> {lang === 'hi' ? 'यूरिया के साथ नीम खली मिलाने से नाइट्रोजन का रिसाव 25% घट जाता है और फसल लंबे समय तक हरी रहती है।' : 'Mixing Neem cake acts as a natural nitrification inhibitor, reducing expensive nitrogen volatilization and leaching by 25%.'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
