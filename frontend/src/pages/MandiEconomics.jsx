import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import axios from 'axios';
import { TrendingUp, BarChart2, Check, ArrowRight } from 'lucide-react';

export default function MandiEconomics() {
  const { lang, t } = useLanguage();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedCrop, setSelectedCrop] = useState('Wheat');

  const fetchROI = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/advisory/market-roi?plotId=PLOT_001&cropName=${selectedCrop}`);
      setData(res.data.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchROI();
  }, [selectedCrop]);

  const cropNameTranslations = {
    Wheat: lang === 'hi' ? 'गेहूं (Wheat)' : 'Wheat',
    Mustard: lang === 'hi' ? 'सरसों (Mustard)' : 'Mustard',
    'Rice (Basmati)': lang === 'hi' ? 'बासमती धान (Rice)' : 'Rice (Basmati)',
    Maize: lang === 'hi' ? 'मक्का (Maize)' : 'Maize',
    'Gram (Chickpea)': lang === 'hi' ? 'चना (Chickpea)' : 'Gram (Chickpea)'
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px 16px' }}>

      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#1b4332', display: 'flex', alignItems: 'center', gap: '12px', margin: 0 }}>
          <TrendingUp size={30} color="#2d6a4f" />
          {lang === 'hi'
            ? 'e-NAM राष्ट्रीय कृषि बाजार: मंडी भाव व फसल शुद्ध लाभ (ROI) कैलकुलेटर'
            : 'e-NAM National Agriculture Market: Mandi Price & Crop Net Margin Calculator'}
        </h1>
        <p style={{ color: '#4b5563', margin: '8px 0 0 0', fontSize: '15px', lineHeight: '1.5' }}>
          {lang === 'hi'
            ? 'मृदा उपयुक्तता स्कोर को वास्तविक थोक मंडी दरों और परिचालन लागत से जोड़कर प्रति एकड़ शुद्ध लाभ की प्रामाणिक गणना।'
            : 'Fusing soil suitability indices with live APMC wholesale mandi rates and input operational costs to project Net Farm Margin (₹/Acre).'}
        </p>
      </div>

      {data?.current && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '18px', marginBottom: '26px' }}>

          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            padding: '22px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
          }}>
            <div style={{ fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {lang === 'hi' ? 'सक्रिय फसल व वर्तमान मंडी थोक भाव' : 'Active Crop & Benchmark Mandi Rate'}
            </div>
            <div style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a', marginTop: '6px' }}>
              {cropNameTranslations[data.current.cropName] || data.current.cropName}
            </div>
            <div style={{ fontSize: '20px', fontWeight: '700', color: '#2d6a4f', marginTop: '4px' }}>
              ₹{data.current.currentMandiPricePerQuintalInr.toLocaleString()} <span style={{ fontSize: '13px', fontWeight: '500', color: '#64748b' }}>{lang === 'hi' ? '/ क्विंटल' : '/ Quintal'}</span>
            </div>
            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '8px', borderTop: '1px solid #f1f5f9', paddingTop: '8px' }}>
              {lang === 'hi' ? 'स्रोत: Agmarknet / e-NAM पंजाब मंडी' : 'Source: Agmarknet / e-NAM Mandi Feed'}
            </div>
          </div>

          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            padding: '22px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
          }}>
            <div style={{ fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {lang === 'hi' ? 'अनुमानित कुल आय (राजस्व)' : 'Gross Estimated Revenue'}
            </div>
            <div style={{ fontSize: '26px', fontWeight: '800', color: '#1e3a8a', marginTop: '6px' }}>
              ₹{data.current.estimatedGrossRevenueInr.toLocaleString()}
            </div>
            <div style={{ fontSize: '13px', color: '#475569', marginTop: '4px' }}>
              {lang === 'hi' ? `पैदावार: ${data.current.estimatedYieldQuintalsPerAcre} क्विंटल प्रति एकड़` : `Estimated Yield: ${data.current.estimatedYieldQuintalsPerAcre} Qtl / Acre`}
            </div>
            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '8px', borderTop: '1px solid #f1f5f9', paddingTop: '8px' }}>
              {lang === 'hi' ? '1 एकड़ खेत मानक' : 'Standard 1-Acre Calculation'}
            </div>
          </div>

          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            padding: '22px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
          }}>
            <div style={{ fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {lang === 'hi' ? 'कुल परिचालन लागत (इनपुट खर्च)' : 'Total Input Operating Cost'}
            </div>
            <div style={{ fontSize: '26px', fontWeight: '800', color: '#334155', marginTop: '6px' }}>
              ₹{data.current.estimatedInputCosts.totalCostInr.toLocaleString()}
            </div>
            <div style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>
              {lang === 'hi' ? 'बीज, उर्वरक, सिंचाई, जुताई खर्च' : 'Certified Seeds + Fert + Water + Labor'}
            </div>
            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '8px', borderTop: '1px solid #f1f5f9', paddingTop: '8px' }}>
              {lang === 'hi' ? 'औसत उत्पादन लागत' : 'Average Production Cost'}
            </div>
          </div>

          <div style={{
            backgroundColor: '#f0fdf4',
            borderRadius: '12px',
            padding: '22px',
            border: '1.5px solid #86efac',
            boxShadow: '0 2px 6px rgba(22,163,74,0.08)'
          }}>
            <div style={{ fontSize: '12px', fontWeight: '800', color: '#166534', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {lang === 'hi' ? 'शुद्ध किसान मुनाफा (Net Profit)' : 'Projected Net Margin'}
            </div>
            <div style={{ fontSize: '28px', fontWeight: '900', color: '#15803d', marginTop: '6px' }}>
              +₹{data.current.projectedNetProfitInr.toLocaleString()}
            </div>
            <div style={{ fontSize: '13px', fontWeight: '700', color: '#15803d', marginTop: '4px' }}>
              {lang === 'hi' ? `शुद्ध लाभ दर (ROI): +${data.current.roiPercentage}%` : `Net Return on Investment: +${data.current.roiPercentage}%`}
            </div>
            <div style={{ fontSize: '12px', color: '#166534', marginTop: '8px', borderTop: '1px solid #bbf7d0', paddingTop: '8px' }}>
              {lang === 'hi' ? 'लागत घटाकर शेष बचत' : 'Revenue minus all input costs'}
            </div>
          </div>
        </div>
      )}

      {data?.comparison && (
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          padding: '24px',
          boxShadow: '0 1px 4px rgba(0,0,0,0.04)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#1e293b', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BarChart2 size={20} color="#2d6a4f" />
              {lang === 'hi' ? 'समान मृदा पर विभिन्न फसलों का तुलनात्मक वित्तीय विश्लेषण' : 'Comparative Crop Profitability on Same Soil Profile'}
            </h2>
            <span style={{ fontSize: '13px', color: '#64748b', backgroundColor: '#f1f5f9', padding: '4px 10px', borderRadius: '6px' }}>
              {lang === 'hi' ? 'मानक आधार: 1 एकड़ खेत' : 'Benchmark: 1-Acre Landholding'}
            </span>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                  <th style={{ padding: '14px 16px', fontWeight: '700', color: '#334155' }}>
                    {lang === 'hi' ? 'फसल का नाम' : 'Crop'}
                  </th>
                  <th style={{ padding: '14px 16px', fontWeight: '700', color: '#334155' }}>
                    {lang === 'hi' ? 'अनुमानित पैदावार' : 'Est. Yield'}
                  </th>
                  <th style={{ padding: '14px 16px', fontWeight: '700', color: '#334155' }}>
                    {lang === 'hi' ? 'मंडी थोक दर (₹)' : 'Mandi Rate'}
                  </th>
                  <th style={{ padding: '14px 16px', fontWeight: '700', color: '#1e3a8a' }}>
                    {lang === 'hi' ? 'कुल राजस्व' : 'Gross Revenue'}
                  </th>
                  <th style={{ padding: '14px 16px', fontWeight: '700', color: '#475569' }}>
                    {lang === 'hi' ? 'कुल लागत (खर्च)' : 'Total Cost'}
                  </th>
                  <th style={{ padding: '14px 16px', fontWeight: '800', color: '#15803d' }}>
                    {lang === 'hi' ? 'शुद्ध लाभ (मुनाफा)' : 'Net Profit'}
                  </th>
                  <th style={{ padding: '14px 16px', fontWeight: '700', color: '#0369a1' }}>
                    {lang === 'hi' ? 'लाभ दर (ROI)' : 'ROI %'}
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.comparison.map((c, i) => {
                  const isSelected = selectedCrop === c.cropName;
                  return (
                    <tr
                      key={i}
                      style={{
                        borderBottom: '1px solid #f1f5f9',
                        backgroundColor: isSelected ? '#f0fdf4' : 'transparent',
                        transition: 'background-color 0.15s ease'
                      }}
                    >
                      <td style={{ padding: '14px 16px', fontWeight: '700', color: '#0f172a' }}>
                        {cropNameTranslations[c.cropName] || c.cropName}
                      </td>
                      <td style={{ padding: '14px 16px', color: '#475569' }}>
                        {c.yieldQuintalAcre} {lang === 'hi' ? 'क्विंटल' : 'Qtl/Acre'}
                      </td>
                      <td style={{ padding: '14px 16px', color: '#0f172a', fontWeight: '600' }}>
                        ₹{c.mandiPriceQtl.toLocaleString()}
                      </td>
                      <td style={{ padding: '14px 16px', color: '#1e3a8a', fontWeight: '700' }}>
                        ₹{c.grossRevenueInr.toLocaleString()}
                      </td>

                      <td style={{ padding: '14px 16px', color: '#475569', fontWeight: '600' }}>
                        ₹{c.totalCostInr.toLocaleString()}
                      </td>
                      <td style={{ padding: '14px 16px', color: '#15803d', fontWeight: '800', fontSize: '15px' }}>
                        +₹{c.netProfitInr.toLocaleString()}
                      </td>
                      <td style={{ padding: '14px 16px', color: '#0369a1', fontWeight: '700' }}>
                        +{c.roiPct}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
