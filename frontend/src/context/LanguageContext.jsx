import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export const translations = {
  en: {
    // Nav & Brand
    brandName: 'SoilSense Pro',
    brandTagline: 'Precision Soil Intelligence & Advisory',
    overview: 'Overview',
    home: 'Home',
    dashboard: 'Dashboard',
    primaryModules: 'Primary Modules',
    soilToCrop: 'Soil to Crop',
    cropToSoil: 'Crop to Soil',
    testYourSoil: 'Test Your Soil',
    advancedIntelligence: 'Agronomic Intelligence',
    smartIrrigation: 'Smart Irrigation',
    fertilizerPrescription: 'Fertilizer Prescription',
    diseaseRadar: 'Disease & Hypoxia Radar',
    mandiEconomics: 'Mandi Market ROI',
    soilHealthCard: 'Govt Soil Health Card',
    farmHeatmap: '2D Farm Moisture Map',
    telemetryAndTesting: 'Telemetry & Testing',
    liveMonitoring: 'Live Monitoring',
    soilHistory: 'Soil History',
    compareSoil: 'Compare Soil',
    knowledgeBase: 'Knowledge Base',
    soilDatabase: 'Soil Database',
    reports: 'PDF Reports',
    databaseExplorer: 'Database Explorer',
    aboutProject: 'About Project',

    // Dashboard & Metrics
    iotStatus: 'IoT Probe (Arduino A0)',
    online: 'ONLINE',
    offline: 'OFFLINE',
    currentMoisture: 'Current Soil Moisture',
    soilStatus: 'Soil Health Status',
    optimal: 'Optimal',
    criticallyDry: 'Critically Dry',
    underWatered: 'Under-Watered',
    saturated: 'Saturated',
    waterlogged: 'Waterlogged',
    thirstDepletion: 'Moisture Depletion Rate',
    hoursUntilWilting: 'Hours to Crop Water Stress',
    litersNeeded: 'Recommended Water Volume',
    rainDelay: 'Rain-Delay Suppression',
    rainDelayActive: 'ACTIVE (Rain Forecasted)',
    rainDelayInactive: 'INACTIVE (Dry Weather)',
    mandiProfitLead: 'Top Profit Crop',
    listenVoice: 'Listen Advisory',
    speaking: 'Playing Audio...',

    // Actions & Buttons
    testSoilNow: 'Start Soil Test',
    viewDetails: 'View Details',
    downloadSHC: 'Download Govt Soil Health Card (PDF)',
    calculateROI: 'Calculate Net Profit',
    switchPlot: 'Select Plot',
    wheatBlockA: 'Ludhiana Basin - Block A (Wheat)'
  },
  hi: {
    // Nav & Brand
    brandName: 'मृदा-सेंस प्रो (SoilSense Pro)',
    brandTagline: 'सटीक मृदा परीक्षण व कृषि सलाहकार प्रणाली',
    overview: 'सिंहावलोकन',
    home: 'मुख्य पृष्ठ (Home)',
    dashboard: 'डैशबोर्ड (Dashboard)',
    primaryModules: 'प्राथमिक मॉड्यूल',
    soilToCrop: 'मृदा से उपयुक्त फसल',
    cropToSoil: 'फसल से मृदा उपयुक्तता',
    testYourSoil: 'मृदा परीक्षण (Test Your Soil)',
    advancedIntelligence: 'उन्नत कृषि बुद्धिमत्ता',
    smartIrrigation: 'स्मार्ट सिंचाई व जल बचत',
    fertilizerPrescription: 'उर्वरक खुराक व खाद सलाह',
    diseaseRadar: 'जड़ सड़न व रोग पूर्व चेतावनी',
    mandiEconomics: 'मंडी भाव व शुद्ध लाभ (ROI)',
    soilHealthCard: 'सरकारी मृदा स्वास्थ्य कार्ड (SHC)',
    farmHeatmap: '2D खेत नमी नक्शा (Heatmap)',
    telemetryAndTesting: 'सेंसर व परीक्षण',
    liveMonitoring: 'सजीव सेंसर निगरानी',
    soilHistory: 'मृदा परीक्षण इतिहास',
    compareSoil: 'मृदा नमूनों की तुलना',
    knowledgeBase: 'ज्ञान भंडार',
    soilDatabase: 'भारतीय मृदा डेटाबेस',
    reports: 'विश्लेषण रिपोर्ट (PDF)',
    databaseExplorer: 'डेटाबेस एक्सप्लोरर',
    aboutProject: 'परियोजना परिचय (NIT Delhi)',

    // Dashboard & Metrics
    iotStatus: 'सेंसर प्रोब (Arduino Uno A0)',
    online: 'सक्रिय (Online)',
    offline: 'निष्क्रिय (Offline)',
    currentMoisture: 'मृदा में वर्तमान नमी',
    soilStatus: 'मृदा की स्थिति',
    optimal: 'इष्टतम (उत्तम)',
    criticallyDry: 'गंभीर रूप से सूखी',
    underWatered: 'कम पानी (सिंचाई आवश्यक)',
    saturated: 'अत्यधिक नम',
    waterlogged: 'जलभराव (खतरा)',
    thirstDepletion: 'नमी ह्रास दर (प्रति घंटा)',
    hoursUntilWilting: 'मुरझाने तक शेष समय',
    litersNeeded: 'अनुशंसित जल मात्रा',
    rainDelay: 'बारिश के कारण सिंचाई रोक',
    rainDelayActive: 'सक्रिय (बारिश का अनुमान - मोटर न चलाएं)',
    rainDelayInactive: 'सामान्य (मौसम शुष्क है)',
    mandiProfitLead: 'सर्वाधिक मुनाफा देने वाली फसल',
    listenVoice: 'सलाह सुनें (आवाज़ में)',
    speaking: 'ऑडियो चल रहा है...',

    // Actions & Buttons
    testSoilNow: 'मृदा परीक्षण शुरू करें',
    viewDetails: 'विस्तार से देखें',
    downloadSHC: 'सरकारी स्वास्थ्य कार्ड डाउनलोड करें (PDF)',
    calculateROI: 'शुद्ध मुनाफे की गणना करें',
    switchPlot: 'खेत / प्लॉट चुनें',
    wheatBlockA: 'लुधियाना ब्लॉक A (गेहूं की फसल)'
  }
};

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState(() => {
    return localStorage.getItem('soilsense_lang') || 'en';
  });

  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    localStorage.setItem('soilsense_lang', lang);
  }, [lang]);

  const toggleLanguage = () => {
    setLang(prev => (prev === 'en' ? 'hi' : 'en'));
  };

  const t = (key) => {
    return translations[lang]?.[key] || translations.en[key] || key;
  };

  const speak = (text) => {
    if (!('speechSynthesis' in window)) {
      alert('Text-to-speech is not supported in this browser.');
      return;
    }

    window.speechSynthesis.cancel();

    if (isSpeaking) {
      setIsSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang === 'hi' ? 'hi-IN' : 'en-IN';
    utterance.rate = 0.95;
    utterance.pitch = 1.0;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggleLanguage, t, speak, isSpeaking }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
