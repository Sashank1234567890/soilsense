import React, { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle2, Calendar, Sparkles } from 'lucide-react';
import axios from 'axios';

const LOCAL_SEASON_META = {
  Wheat: {
    cropNameHi: 'गेहूं',
    optimalSowingMonths: [10, 11, 12],
    optimalHarvestMonths: [3, 4],
    sowingWindowHi: 'अक्टूबर अंत से दिसंबर (सर्वोत्तम: 1 से 20 नवंबर)',
    sowingWindowEn: 'Late October to December (Peak: 1st to 20th November)',
    harvestWindowHi: 'मार्च से अप्रैल',
    harvestWindowEn: 'March to April',
    seasonAdvisoryHi: 'गेहूं एक रबी की प्रमुख फसल है। इसे ठंडे मौसम (15-20°C) की आवश्यकता होती है।',
    seasonAdvisoryEn: 'Wheat is a premier cool-season Rabi crop requiring 15-20°C.',
    offSeasonReasonHi: 'गर्मी या मानसून में गेहूं बोने पर तापमान अधिक होने से बीज अंकुरित नहीं होगा और उपज शून्य रह जाएगी।',
    offSeasonReasonEn: 'High heat and monsoon humidity inhibit wheat germination, causing severe crop failure.'
  },
  Mustard: {
    cropNameHi: 'सरसों',
    optimalSowingMonths: [9, 10, 11],
    optimalHarvestMonths: [2, 3],
    sowingWindowHi: 'सितंबर अंत से नवंबर प्रथम सप्ताह (सर्वोत्तम: अक्टूबर)',
    sowingWindowEn: 'Late September to early November (Peak: October)',
    harvestWindowHi: 'फरवरी से मार्च',
    harvestWindowEn: 'February to March',
    seasonAdvisoryHi: 'सरसों को मध्यम ठंडे मौसम और कम नमी की आवश्यकता होती है।',
    seasonAdvisoryEn: 'Mustard requires moderate cool temperatures and low to moderate moisture.',
    offSeasonReasonHi: 'देर से (दिसंबर) या गर्मियों में बुवाई करने पर चेपा (एफिड) कीट का भारी प्रकोप होता है और दाना नहीं बनता।',
    offSeasonReasonEn: 'Late or warm season sowing leads to catastrophic aphid infestation and blank pods.'
  },
  Rice: {
    cropNameHi: 'बासमती धान',
    optimalSowingMonths: [5, 6, 7],
    optimalHarvestMonths: [10, 11],
    sowingWindowHi: 'मई (नर्सरी) से जुलाई (रोपाई) (सर्वोत्तम: जून)',
    sowingWindowEn: 'May (Nursery) to July (Transplanting) (Peak: June)',
    harvestWindowHi: 'अक्टूबर से नवंबर',
    harvestWindowEn: 'October to November',
    seasonAdvisoryHi: 'धान को प्रचुर वर्षा, उच्च आर्द्रता और 25-35°C तापमान की आवश्यकता होती है।',
    seasonAdvisoryEn: 'Rice thrives under monsoonal rains, standing water, and 25-35°C temperatures.',
    offSeasonReasonHi: 'सर्दियों (नवंबर-जनवरी) में धान लगाने पर कड़ाके की ठंड और पाले से पौधे बढ़ नहीं पाते और फसल नष्ट हो जाती है।',
    offSeasonReasonEn: 'Winter sowing leads to severe chilling injury, frost damage, and complete crop failure.'
  },
  Maize: {
    cropNameHi: 'मक्का',
    optimalSowingMonths: [6, 7, 1, 2],
    optimalHarvestMonths: [9, 10, 4, 5],
    sowingWindowHi: 'खरीफ: जून-जुलाई | बसंत: जनवरी-फरवरी',
    sowingWindowEn: 'Kharif: June-July | Spring: January-February',
    harvestWindowHi: 'खरीफ: सितंबर-अक्टूबर | बसंत: अप्रैल-मई',
    harvestWindowEn: 'Kharif: Sep-Oct | Spring: Apr-May',
    seasonAdvisoryHi: 'मक्का खरीफ व बसंत दोनों मौसमों में अच्छी पैदावार देती है। जल निकासी अच्छी होनी चाहिए।',
    seasonAdvisoryEn: 'Maize is versatile for both Kharif and Spring seasons in well-drained fertile soils.',
    offSeasonReasonHi: 'अत्यधिक कड़ाके की ठंड (दिसंबर) या भारी जलभराव में मक्का बोने पर बीज सड़ जाता है।',
    offSeasonReasonEn: 'Extreme winter freeze or heavy waterlogging causes seed decay and stunted cobs.'
  },
  Cotton: {
    cropNameHi: 'कपास',
    optimalSowingMonths: [4, 5, 6],
    optimalHarvestMonths: [10, 11, 12],
    sowingWindowHi: 'अप्रैल अंत से जून (सर्वोत्तम: 15 मई तक)',
    sowingWindowEn: 'Late April to June (Peak: Up to 15th May)',
    harvestWindowHi: 'अक्टूबर से दिसंबर (चुगाई)',
    harvestWindowEn: 'October to December (Picking phase)',
    seasonAdvisoryHi: 'कपास को लंबी धूप, गर्म मौसम (25-35°C) और गहरी जल निकासी वाली मिट्टी चाहिए।',
    seasonAdvisoryEn: 'Cotton requires warm sun, long frost-free periods, and deep fertile soils.',
    offSeasonReasonHi: 'सर्दियों या देर मानसून में कपास बोने पर पौधा वानस्पतिक रूप से बढ़ नहीं पाता और टिंडे नहीं बनते।',
    offSeasonReasonEn: 'Winter sowing prevents square and boll formation due to inadequate heat units.'
  }
};

const MONTH_NAMES_HI = ['', 'जनवरी', 'फरवरी', 'मार्च', 'अप्रैल', 'मई', 'जून', 'जुलाई', 'अगस्त', 'सितंबर', 'अक्टूबर', 'नवंबर', 'दिसंबर'];
const MONTH_NAMES_EN = ['', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const MONTHLY_SUGGESTED_CROPS = {
  1: { cropsHi: ['बसंत मक्का', 'गन्ना', 'सूरजमुखी', 'सब्जियां'], cropsEn: ['Spring Maize', 'Sugarcane', 'Sunflower', 'Vegetables'] },
  2: { cropsHi: ['गन्ना', 'बसंत मक्का', 'सूरजमुखी', 'जायद सब्जियां'], cropsEn: ['Sugarcane', 'Spring Maize', 'Sunflower', 'Zaid Vegetables'] },
  3: { cropsHi: ['जायद मूंग', 'उड़द', 'तरबूज व खरबूजा', 'सूरजमुखी'], cropsEn: ['Zaid Moong', 'Black Gram', 'Watermelon', 'Sunflower'] },
  4: { cropsHi: ['कपास (अगेती)', 'जायद चारा', 'मूंग'], cropsEn: ['Early Cotton', 'Fodder Crops', 'Green Gram'] },
  5: { cropsHi: ['कपास', 'धान (नर्सरी)', 'अरहर'], cropsEn: ['Cotton', 'Rice Nursery', 'Pigeon Pea'] },
  6: { cropsHi: ['धान (रोपाई)', 'मक्का', 'सोयाबीन', 'कपास', 'मूंगफली'], cropsEn: ['Basmati Rice', 'Maize', 'Soybean', 'Cotton', 'Groundnut'] },
  7: { cropsHi: ['धान (रोपाई)', 'मक्का', 'बाजरा', 'सोयाबीन'], cropsEn: ['Rice', 'Maize', 'Pearl Millet (Bajra)', 'Soybean'] },
  8: { cropsHi: ['तोरिया (अगेती सरसों)', 'अगेती आलू', 'चारा ज्वार'], cropsEn: ['Toria', 'Early Potato', 'Fodder Jowar'] },
  9: { cropsHi: ['तोरिया', 'अगेती आलू', 'शरदकालीन गन्ना', 'सरसों'], cropsEn: ['Toria', 'Early Potato', 'Sugarcane', 'Early Mustard'] },
  10: { cropsHi: ['सरसों (सर्वोत्तम)', 'आलू', 'चना', 'मटर व लहसुन'], cropsEn: ['Mustard (Peak)', 'Potato', 'Chickpea', 'Peas & Garlic'] },
  11: { cropsHi: ['गेहूं (सर्वोत्तम)', 'सरसों', 'चना', 'जौ', 'मटर'], cropsEn: ['Wheat (Peak)', 'Mustard', 'Chickpea', 'Barley', 'Late Peas'] },
  12: { cropsHi: ['गेहूं (देर से बोने वाली किस्में)', 'जौ'], cropsEn: ['Late Wheat Varieties', 'Barley'] }
};

export default function SeasonSuitabilityAdvisory({ cropName = 'Wheat', sowingDate = '', lang = 'hi' }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    const d = sowingDate ? new Date(sowingDate) : new Date();
    const sowMonth = d.getMonth() + 1;
    const meta = LOCAL_SEASON_META[cropName] || LOCAL_SEASON_META.Wheat;
    const isOptimal = meta.optimalSowingMonths.includes(sowMonth);
    const suggested = MONTHLY_SUGGESTED_CROPS[sowMonth] || { cropsHi: ['गेहूं', 'सरसों'], cropsEn: ['Wheat', 'Mustard'] };

    const localResult = {
      isOptimal,
      sowMonth,
      sowMonthNameHi: MONTH_NAMES_HI[sowMonth],
      sowMonthNameEn: MONTH_NAMES_EN[sowMonth],
      cropNameHi: meta.cropNameHi || cropName,
      sowingWindowHi: meta.sowingWindowHi,
      sowingWindowEn: meta.sowingWindowEn,
      harvestWindowHi: meta.harvestWindowHi,
      harvestWindowEn: meta.harvestWindowEn,
      seasonAdvisoryHi: meta.seasonAdvisoryHi,
      seasonAdvisoryEn: meta.seasonAdvisoryEn,
      offSeasonReasonHi: meta.offSeasonReasonHi,
      offSeasonReasonEn: meta.offSeasonReasonEn,
      suggestedCropsHi: suggested.cropsHi,
      suggestedCropsEn: suggested.cropsEn
    };
    setData(localResult);

    const dateStr = sowingDate || new Date().toISOString().split('T')[0];
    axios.get(`/api/advisory/season-check?cropName=${encodeURIComponent(cropName)}&sowingDate=${encodeURIComponent(dateStr)}`)
      .then(res => {
        if (res.data?.success && res.data?.data) {
          setData(res.data.data);
        }
      })
      .catch(() => {});
  }, [cropName, sowingDate]);

  if (!data) return null;

  const isOptimal = data.isOptimal;

  if (isOptimal) {
    return (
      <div style={{
        marginTop: '10px',
        padding: '12px 14px',
        borderRadius: '10px',
        backgroundColor: '#f0fdf4',
        border: '1px solid #86efac',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle2 size={18} color="#16a34a" />
          <span style={{ fontSize: '13px', fontWeight: '800', color: '#166534' }}>
            {lang === 'hi'
              ? `बुवाई का सर्वोत्तम अनुकूल समय (${data.sowMonthNameHi || ''} - इष्टतम सीज़न)`
              : `Optimal Sowing Window (${data.sowMonthNameEn || ''} - Ideal Season)`}
          </span>
        </div>
        <p style={{ margin: 0, fontSize: '12px', color: '#14532d', lineHeight: '1.5' }}>
          {lang === 'hi'
            ? `${data.cropNameHi || cropName} के लिए यह आदर्श मौसम है। बुवाई खिड़की: ${data.sowingWindowHi} | अपेक्षित कटाई: ${data.harvestWindowHi}।`
            : `Ideal weather conditions for ${cropName}. Recommended sowing: ${data.sowingWindowEn} | Harvest window: ${data.harvestWindowEn}.`}
        </p>
      </div>
    );
  }

  // Off-season warning
  return (
    <div style={{
      marginTop: '10px',
      padding: '12px 14px',
      borderRadius: '10px',
      backgroundColor: '#fef2f2',
      border: '1.5px solid #f87171',
      display: 'flex',
      flexDirection: 'column',
      gap: '8px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <AlertTriangle size={20} color="#dc2626" />
        <span style={{ fontSize: '13px', fontWeight: '800', color: '#991b1b' }}>
          {lang === 'hi'
            ? `सावधान किसान भाई: ${data.sowMonthNameHi || ''} का महीना ${data.cropNameHi || cropName} बोने का सही समय नहीं है!`
            : `Caution: ${data.sowMonthNameEn || ''} is NOT a good time to sow/harvest ${cropName}!`}
        </span>
      </div>

      <p style={{ margin: 0, fontSize: '12px', color: '#7f1d1d', lineHeight: '1.5' }}>
        {lang === 'hi'
          ? (data.offSeasonReasonHi || `${data.cropNameHi || cropName} इस मौसम में लगाने पर अंकुरण व उपज में भारी गिरावट आ सकती है।`)
          : (data.offSeasonReasonEn || `Growing ${cropName} during this period risks severe germination or yield loss.`)}
      </p>

      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '6px',
        alignItems: 'center',
        padding: '8px 10px',
        backgroundColor: '#ffffff',
        borderRadius: '6px',
        border: '1px solid #fecaca'
      }}>
        <Calendar size={14} color="#b91c1c" />
        <span style={{ fontSize: '11px', fontWeight: '700', color: '#991b1b' }}>
          {lang === 'hi'
            ? `${data.cropNameHi || cropName} बोने का सही समय:`
            : `Recommended sowing window:`}
        </span>
        <span style={{ fontSize: '11px', color: '#1e293b', fontWeight: '600' }}>
          {lang === 'hi'
            ? `${data.sowingWindowHi} (कटाई: ${data.harvestWindowHi})`
            : `${data.sowingWindowEn} (Harvest: ${data.harvestWindowEn})`}
        </span>
      </div>

      {data.suggestedCropsHi && data.suggestedCropsHi.length > 0 && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
          padding: '8px 10px',
          backgroundColor: '#eff6ff',
          borderRadius: '6px',
          border: '1px solid #bfdbfe'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Sparkles size={14} color="#2563eb" />
            <span style={{ fontSize: '11px', fontWeight: '800', color: '#1e40af' }}>
              {lang === 'hi'
                ? `इस महीने (${data.sowMonthNameHi}) में अनुशंसित फसलें (Recommended Crops):`
                : `Recommended crops for ${data.sowMonthNameEn}:`}
            </span>
          </div>
          <span style={{ fontSize: '12px', color: '#1e3a8a', fontWeight: '600' }}>
            {lang === 'hi' ? data.suggestedCropsHi.join(', ') : data.suggestedCropsEn.join(', ')}
          </span>
        </div>
      )}
    </div>
  );
}
