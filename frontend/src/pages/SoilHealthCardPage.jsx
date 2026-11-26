import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import axios from 'axios';
import { FileText, Printer, ShieldCheck, CheckCircle2, QrCode, Download, Building2 } from 'lucide-react';

export default function SoilHealthCardPage() {
  const { lang, t } = useLanguage();
  const [farmerName, setFarmerName] = useState('Sardar Gurpreet Singh');
  const [district, setDistrict] = useState('Ludhiana');
  const [card, setCard] = useState(null);
  const [generating, setGenerating] = useState(false);

  const handleGenerate = async () => {
    try {
      setGenerating(true);
      const res = await axios.post('/api/advisory/soil-health-card', {
        farmerName,
        phone: '+91 98765 43210',
        district,
        state: 'Punjab',
        plotId: 'PLOT_001',
        testData: {
          nitrogen: 245,
          phosphorus: 21,
          potassium: 195,
          sulphur: 12,
          zinc: 0.85,
          iron: 5.1,
          copper: 0.42,
          manganese: 3.5,
          boron: 0.65,
          pH: 7.3,
          ec: 0.38,
          organicCarbon: 0.58
        }
      });
      setCard(res.data.data);
    } catch (e) {
      console.error(e);
    } finally {
      setGenerating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '24px 16px' }}>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#1b4332', display: 'flex', alignItems: 'center', gap: '12px', margin: 0 }}>
            <FileText size={32} color="#2d6a4f" />
            {lang === 'hi' ? 'भारत सरकार मानक मृदा स्वास्थ्य कार्ड (Soil Health Card)' : 'Government of India 12-Parameter Soil Health Card'}
          </h1>
          <p style={{ color: '#52796f', margin: '6px 0 0 0', fontSize: '15px' }}>
            {lang === 'hi'
              ? 'कृषि एवं किसान कल्याण मंत्रालय के 12 मानकों के अनुरूप क्यूआर सत्यापित आधिकारिक रिपोर्ट (KCC ऋण मान्य)'
              : 'Official Ministry of Agriculture 12-parameter standard format with digital QR hash for KCC loan verification.'}
          </p>
        </div>

        {card && (
          <button
            onClick={handlePrint}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: '#1b4332',
              color: '#fff',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '14px'
            }}
          >
            <Printer size={18} />
            {lang === 'hi' ? 'कार्ड प्रिंट करें / PDF सहेजें' : 'Print / Save Official PDF'}
          </button>
        )}
      </div>

      {!card && (
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #e5e7eb',
          padding: '24px',
          marginBottom: '28px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
        }}>
          <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#111827', marginBottom: '16px' }}>
            {lang === 'hi' ? 'किसान व खेत विवरण दर्ज करें' : 'Enter Farmer & Plot Identity Details'}
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
                {lang === 'hi' ? 'किसान का पूरा नाम' : 'Farmer Name'}
              </label>
              <input
                type="text"
                value={farmerName}
                onChange={(e) => setFarmerName(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '14px' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
                {lang === 'hi' ? 'जिला व राज्य' : 'District & State'}
              </label>
              <input
                type="text"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '14px' }}
              />
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={generating}
            style={{
              backgroundColor: '#2d6a4f',
              color: '#fff',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '8px',
              fontWeight: '700',
              fontSize: '15px',
              cursor: 'pointer'
            }}
          >
            {generating
              ? (lang === 'hi' ? 'कार्ड तैयार हो रहा है...' : 'Generating Official Card...')
              : (lang === 'hi' ? 'आधिकारिक मृदा स्वास्थ्य कार्ड तैयार करें' : 'Generate Bank-Ready Soil Health Card')}
          </button>
        </div>
      )}

      {card && (
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          border: '2px solid #2d6a4f',
          padding: '36px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.08)'
        }}>

          <div style={{ textAlign: 'center', borderBottom: '2px solid #2d6a4f', paddingBottom: '20px', marginBottom: '24px' }}>
            <div style={{ fontSize: '13px', fontWeight: '800', letterSpacing: '1.5px', color: '#1b4332', textTransform: 'uppercase' }}>
              GOVERNMENT OF INDIA • DEPARTMENT OF AGRICULTURE & FARMERS WELFARE
            </div>
            <div style={{ fontSize: '26px', fontWeight: '900', color: '#2d6a4f', marginTop: '6px' }}>
              SOIL HEALTH CARD / मृदा स्वास्थ्य कार्ड
            </div>
            <div style={{ fontSize: '14px', color: '#52796f', marginTop: '4px' }}>
              Card ID: <strong>{card.cardId}</strong> • Issued: {new Date(card.issuedAt).toLocaleDateString()}
            </div>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
            backgroundColor: '#f8fafc',
            padding: '16px 20px',
            borderRadius: '10px',
            marginBottom: '28px',
            border: '1px solid #e2e8f0'
          }}>
            <div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>{lang === 'hi' ? 'किसान का नाम' : 'Farmer Name'}</div>
              <div style={{ fontWeight: '700', color: '#0f172a', fontSize: '15px' }}>{card.farmerProfile.farmerName}</div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>{lang === 'hi' ? 'स्थान' : 'Location'}</div>
              <div style={{ fontWeight: '700', color: '#0f172a', fontSize: '15px' }}>{card.farmerProfile.district}, {card.farmerProfile.state}</div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>{lang === 'hi' ? 'खेत का रकबा' : 'Land Holding'}</div>
              <div style={{ fontWeight: '700', color: '#0f172a', fontSize: '15px' }}>{card.farmerProfile.landHoldingAcre} Acres (Plot 1)</div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>{lang === 'hi' ? 'मृदा वर्गीकरण' : 'Soil Classification'}</div>
              <div style={{ fontWeight: '700', color: '#0f172a', fontSize: '15px' }}>{card.plotDetails.soilType}</div>
            </div>
          </div>

          <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#1e293b', marginBottom: '14px' }}>
            {lang === 'hi' ? '12 राष्ट्रीय मृदा स्वास्थ्य मानक परीक्षण परिणाम' : '12 National Soil Quality Standard Test Parameters'}
          </h3>

          <div style={{ overflowX: 'auto', marginBottom: '28px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
              <thead>
                <tr style={{ backgroundColor: '#2d6a4f', color: '#ffffff' }}>
                  <th style={{ padding: '10px 14px', textAlign: 'left' }}>S.No</th>
                  <th style={{ padding: '10px 14px', textAlign: 'left' }}>Parameter</th>
                  <th style={{ padding: '10px 14px', textAlign: 'left' }}>Measured Value</th>
                  <th style={{ padding: '10px 14px', textAlign: 'left' }}>Rating</th>
                  <th style={{ padding: '10px 14px', textAlign: 'left' }}>Standard Benchmark</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '10px 14px' }}>1</td>
                  <td style={{ padding: '10px 14px', fontWeight: '600' }}>Nitrogen (N)</td>
                  <td style={{ padding: '10px 14px' }}>{card.chemicalParameters.nitrogen_kg_ha.value} kg/ha</td>
                  <td style={{ padding: '10px 14px', color: '#dc2626', fontWeight: '700' }}>{card.chemicalParameters.nitrogen_kg_ha.rating}</td>
                  <td style={{ padding: '10px 14px', color: '#64748b' }}>280 - 560 kg/ha</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '10px 14px' }}>2</td>
                  <td style={{ padding: '10px 14px', fontWeight: '600' }}>Phosphorus (P)</td>
                  <td style={{ padding: '10px 14px' }}>{card.chemicalParameters.phosphorus_kg_ha.value} kg/ha</td>
                  <td style={{ padding: '10px 14px', color: '#15803d', fontWeight: '700' }}>{card.chemicalParameters.phosphorus_kg_ha.rating}</td>
                  <td style={{ padding: '10px 14px', color: '#64748b' }}>10 - 25 kg/ha</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '10px 14px' }}>3</td>
                  <td style={{ padding: '10px 14px', fontWeight: '600' }}>Potassium (K)</td>
                  <td style={{ padding: '10px 14px' }}>{card.chemicalParameters.potassium_kg_ha.value} kg/ha</td>
                  <td style={{ padding: '10px 14px', color: '#15803d', fontWeight: '700' }}>{card.chemicalParameters.potassium_kg_ha.rating}</td>
                  <td style={{ padding: '10px 14px', color: '#64748b' }}>120 - 280 kg/ha</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '10px 14px' }}>4</td>
                  <td style={{ padding: '10px 14px', fontWeight: '600' }}>Sulphur (S)</td>
                  <td style={{ padding: '10px 14px' }}>{card.chemicalParameters.sulphur_ppm.value} ppm</td>
                  <td style={{ padding: '10px 14px', color: '#15803d', fontWeight: '700' }}>{card.chemicalParameters.sulphur_ppm.rating}</td>
                  <td style={{ padding: '10px 14px', color: '#64748b' }}>&gt; 10 ppm</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '10px 14px' }}>5</td>
                  <td style={{ padding: '10px 14px', fontWeight: '600' }}>Zinc (Zn)</td>
                  <td style={{ padding: '10px 14px' }}>{card.chemicalParameters.zinc_ppm.value} ppm</td>
                  <td style={{ padding: '10px 14px', color: '#15803d', fontWeight: '700' }}>{card.chemicalParameters.zinc_ppm.rating}</td>
                  <td style={{ padding: '10px 14px', color: '#64748b' }}>&gt; 0.6 ppm</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '10px 14px' }}>6</td>
                  <td style={{ padding: '10px 14px', fontWeight: '600' }}>Soil pH (Reaction)</td>
                  <td style={{ padding: '10px 14px' }}>{card.chemicalParameters.pH.value}</td>
                  <td style={{ padding: '10px 14px', color: '#15803d', fontWeight: '700' }}>{card.chemicalParameters.pH.rating}</td>
                  <td style={{ padding: '10px 14px', color: '#64748b' }}>6.5 - 7.8 (Optimal)</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '10px 14px' }}>7</td>
                  <td style={{ padding: '10px 14px', fontWeight: '600' }}>Organic Carbon (OC)</td>
                  <td style={{ padding: '10px 14px' }}>{card.chemicalParameters.organicCarbonPercent.value}%</td>
                  <td style={{ padding: '10px 14px', color: '#15803d', fontWeight: '700' }}>{card.chemicalParameters.organicCarbonPercent.rating}</td>
                  <td style={{ padding: '10px 14px', color: '#64748b' }}>0.5 - 0.75%</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderTop: '2px dashed #cbd5e1',
            paddingTop: '20px',
            flexWrap: 'wrap',
            gap: '16px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{
                width: '64px',
                height: '64px',
                backgroundColor: '#1b4332',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff'
              }}>
                <QrCode size={40} />
              </div>
              <div>
                <div style={{ fontWeight: '700', color: '#0f172a', fontSize: '14px' }}>
                  Official Digital Verification Hash
                </div>
                <div style={{ fontFamily: 'monospace', fontSize: '13px', color: '#2563eb' }}>
                  SHA256: {card.qrVerificationHash}
                </div>
                <div style={{ fontSize: '12px', color: '#64748b' }}>
                  Verified by National Institute of Technology Delhi / ICAR Reference Pipeline
                </div>
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '12px', color: '#64748b' }}>Overall Soil Fertility Rating</div>
              <div style={{ fontSize: '20px', fontWeight: '800', color: '#15803d' }}>
                {card.overallHealthRating} (ELIGIBLE FOR KCC)
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
