/**
 * Format and translate alert messages cleanly based on current language mode (English / Hindi).
 * Ensures that when English is active, no Hindi script is displayed, even for legacy records.
 */
export function formatAlertMessage(alt, currentLang = 'en') {
  if (!alt) return '';

  if (currentLang === 'hi') {
    if (alt.messageHi) return alt.messageHi;
    if (alt.message && /[\u0900-\u097F]/.test(alt.message)) return alt.message;
    // Fallback translation from English to Hindi
    if (alt.type === 'SOONER_NOTICE') {
      return `मिट्टी की नमी ${alt.value ?? 34}% तक आ गई है (पूर्व सूचना सीमा ${alt.threshold ?? 40}% के निकट)। अगले 48 घंटों में बारिश की संभावना नहीं है।`;
    }
    if (alt.type === 'CRITICAL_MOISTURE_LOW' || alt.type === 'CRITICAL_HIGH_RISK') {
      return `अति-गंभीर कम नमी (${alt.value ?? 22}%)। विल्टिंग बिंदु पहुंचा। तुरंत सिंचाई आवश्यक है।`;
    }
    if (alt.type === 'CRITICAL_MOISTURE_HIGH' || alt.type === 'HYPOXIA_WARNING') {
      return `जलभराव चेतावनी: मिट्टी की नमी संतृप्त (${alt.value ?? 80}%)। मोटर तुरंत बंद करें।`;
    }
    if (alt.type === 'RAIN_SUPPRESSION') {
      return `आगामी बारिश के कारण सिंचाई रोक दी गई है। प्राकृतिक वर्षा से खेत सिंचित होगा।`;
    }
    return alt.message || 'खेत चेतावनी अलर्ट दर्ज किया गया।';
  }

  // English mode
  if (alt.messageEn) return alt.messageEn;

  // If the stored message is in Hindi script, translate it dynamically to English
  if (/[\u0900-\u097F]/.test(alt.message || '')) {
    if (alt.type === 'SOONER_NOTICE') {
      return `Soil moisture is depleting (${alt.value ?? 34}%). Approaching threshold of ${alt.threshold ?? 40}%. No rain expected in next 48h.`;
    }
    if (alt.type === 'CRITICAL_MOISTURE_LOW' || alt.type === 'CRITICAL_HIGH_RISK') {
      return `Critical Low Soil Moisture (${alt.value ?? 22}%). Wilting point reached. Irrigation urgently required.`;
    }
    if (alt.type === 'CRITICAL_MOISTURE_HIGH' || alt.type === 'HYPOXIA_WARNING') {
      return `Root Hypoxia Warning: Soil moisture saturated (${alt.value ?? 80}%). Halt pumps and clear drainage trenches.`;
    }
    if (alt.type === 'RAIN_SUPPRESSION') {
      return `Natural rain forecasted. Irrigation deferred to conserve water & power.`;
    }
    return `Soil Moisture Alert (${alt.type?.replace(/_/g, ' ')}): Parameter threshold event recorded.`;
  }

  return alt.message || 'Farm advisory alert recorded.';
}

export function formatAlertType(type, currentLang = 'en') {
  if (!type) return '';
  if (currentLang === 'hi') {
    switch (type) {
      case 'SOONER_NOTICE': return 'पूर्व सूचना (नमी ह्रास)';
      case 'CRITICAL_MOISTURE_LOW':
      case 'CRITICAL_HIGH_RISK': return 'अति-गंभीर कम नमी';
      case 'CRITICAL_MOISTURE_HIGH':
      case 'HYPOXIA_WARNING': return 'अत्यधिक जलभराव खतरा';
      case 'RAIN_SUPPRESSION': return 'बारिश के कारण स्थगित';
      case 'CUSTOM_FARM_ALERT': return 'कस्टम खेत अलर्ट';
      default: return type.replace(/_/g, ' ');
    }
  }
  return type.replace(/_/g, ' ');
}
