const CropSchedule = require('../models/CropSchedule');
const Plot = require('../models/Plot');
const Crop = require('../models/Crop');
const WeatherSnapshot = require('../models/WeatherSnapshot');
const SensorReading = require('../models/SensorReading');
const Alert = require('../models/Alert');

const MONTH_NAMES_HI = ['', 'जनवरी', 'फरवरी', 'मार्च', 'अप्रैल', 'मई', 'जून', 'जुलाई', 'अगस्त', 'सितंबर', 'अक्टूबर', 'नवंबर', 'दिसंबर'];
const MONTH_NAMES_EN = ['', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const MONTHLY_SUGGESTED_CROPS = {
  1: { cropsHi: ['बसंत मक्का', 'गन्ना', 'सूरजमुखी', 'सब्जियां (भिंडी/लौकी)'], cropsEn: ['Spring Maize', 'Sugarcane', 'Sunflower', 'Early Cucurbits'] },
  2: { cropsHi: ['गन्ना', 'बसंत मक्का', 'सूरजमुखी', 'सब्जियां'], cropsEn: ['Sugarcane', 'Spring Maize', 'Sunflower', 'Zaid Vegetables'] },
  3: { cropsHi: ['जायद मूंग', 'उड़द', 'तरबूज व खरबूजा', 'सूरजमुखी'], cropsEn: ['Zaid Moong', 'Black Gram', 'Watermelon & Muskmelon', 'Sunflower'] },
  4: { cropsHi: ['कपास (अगेती)', 'जायद चारा (ज्वार/बाजरा)', 'मूंग'], cropsEn: ['Early Cotton', 'Fodder Jowar/Bajra', 'Green Gram'] },
  5: { cropsHi: ['कपास', 'धान (नर्सरी बीज)', 'अरहर'], cropsEn: ['Cotton', 'Rice (Nursery Sowing)', 'Pigeon Pea (Arhar)'] },
  6: { cropsHi: ['धान (रोपाई)', 'मक्का', 'सोयाबीन', 'कपास', 'मूंगफली'], cropsEn: ['Basmati Rice (Transplanting)', 'Maize', 'Soybean', 'Cotton', 'Groundnut'] },
  7: { cropsHi: ['धान (रोपाई)', 'मक्का', 'बाजरा', 'सोयाबीन', 'ज्वार'], cropsEn: ['Rice (Transplanting)', 'Maize', 'Pearl Millet (Bajra)', 'Soybean'] },
  8: { cropsHi: ['तोरिया (अगेती सरसों)', 'अगेती आलू', 'चारा ज्वार'], cropsEn: ['Toria (Early Rapeseed)', 'Early Potato', 'Fodder Crops'] },
  9: { cropsHi: ['तोरिया', 'अगेती आलू', 'शरदकालीन गन्ना', 'सरसों (अगेती)'], cropsEn: ['Toria', 'Early Potato', 'Autumn Sugarcane', 'Early Mustard'] },
  10: { cropsHi: ['सरसों (उत्तम समय)', 'आलू', 'चना', 'लहसुन व मटर'], cropsEn: ['Mustard (Peak Optimal)', 'Potato', 'Chickpea (Gram)', 'Peas & Garlic'] },
  11: { cropsHi: ['गेहूं (उत्तम समय)', 'सरसों', 'चना', 'जौ', 'मटर'], cropsEn: ['Wheat (Peak Optimal)', 'Mustard', 'Chickpea', 'Barley', 'Late Peas'] },
  12: { cropsHi: ['गेहूं (देर से बुवाई वाली किस्म)', 'जौ'], cropsEn: ['Late Sown Wheat', 'Barley'] }
};

const AVAILABLE_DEVICES = [
  {
    deviceId: 'DEVICE_001',
    name: 'डिवाइस 1: Arduino Uno (USB कनेक्टेड)',
    nameEn: 'Device 1: Arduino Uno (USB Connected)',
    status: 'active',
    online: true,
    port: '/dev/tty.usbserial-1430'
  },
  {
    deviceId: 'NONE',
    name: 'कोई डिवाइस नहीं (केवल टाइमलाइन मोड)',
    nameEn: 'No Device (Timeline Tracking Only)',
    status: 'none',
    online: false,
    port: null
  }
];

const CROP_METADATA = {
  Wheat: {
    durationDays: 135,
    cropNameHi: 'गेहूं',
    seasonalCalendar: {
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
    stages: [
      {
        stageName: 'Germination & Sowing (Basal)',
        stageNameHi: 'अंकुरण व बुवाई (शुरुआती अवस्था)',
        startDay: 0,
        endDay: 20,
        description: 'Root establishment, high P requirement',
        descriptionHi: 'जड़ों की स्थापना, फास्फोरस की उच्च आवश्यकता',
        waterNeed: 'Moist seedbed (45-55%)',
        waterNeedHi: 'हल्की नमीयुक्त बीज शय्या (45-55%)'
      },
      {
        stageName: 'Crown Root Initiation (CRI / Vegetative)',
        stageNameHi: 'शीर्ष जड़ निर्माण (CRI / कल्ले फूटना)',
        startDay: 21,
        endDay: 45,
        description: 'Most critical stage for irrigation; tillering begins',
        descriptionHi: 'सिंचाई हेतु सर्वाधिक क्रांतिक अवस्था; कल्ले फूटने का समय',
        waterNeed: 'High (50-60%)',
        waterNeedHi: 'भरपूर नमी अनिवार्य (50-60%)'
      },
      {
        stageName: 'Panicle / Heading (Flowering)',
        stageNameHi: 'बाली निकलना व फूल आना (गभोटा)',
        startDay: 46,
        endDay: 85,
        description: 'Blossom & spike development',
        descriptionHi: 'बालियों का विकास एवं परागण प्रक्रिया',
        waterNeed: 'Optimal (50-55%)',
        waterNeedHi: 'संतुलित इष्टतम नमी (50-55%)'
      },
      {
        stageName: 'Grain Formation (Dough Stage)',
        stageNameHi: 'दाना भराव (दूधिया व पक्व अवस्था)',
        startDay: 86,
        endDay: 115,
        description: 'Milk & dough grain starch filling',
        descriptionHi: 'दाने में स्टार्च का भराव व दाना कठोर होना',
        waterNeed: 'Moderate (40-45%)',
        waterNeedHi: 'मध्यम नमी (40-45%)'
      },
      {
        stageName: 'Harvest Maturity (कटाई चरण)',
        stageNameHi: 'पूर्ण परिपक्वता (कटाई का उपयुक्त समय)',
        startDay: 116,
        endDay: 135,
        description: 'Golden ripening, crop ready for harvest/cutting',
        descriptionHi: 'सुनहरी फसल, कंबाइन/दरांती कटाई हेतु तैयार',
        waterNeed: 'Dry (< 25%)',
        waterNeedHi: 'सूखी मिट्टी (< 25%) - पानी बंद रखें'
      }
    ]
  },
  Mustard: {
    durationDays: 110,
    cropNameHi: 'सरसों',
    seasonalCalendar: {
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
    stages: [
      {
        stageName: 'Sowing & Emergence',
        stageNameHi: 'बुवाई व अंकुरण',
        startDay: 0,
        endDay: 25,
        description: 'Early root anchoring & cotyledon opening',
        descriptionHi: 'शुरुआती जड़ें जमना व पत्तियां निकलना',
        waterNeed: 'Moderate (35-45%)',
        waterNeedHi: 'मध्यम नमी (35-45%)'
      },
      {
        stageName: 'Rosette & Branching',
        stageNameHi: 'शाखाएं निकलना (रोसेट अवस्था)',
        startDay: 26,
        endDay: 50,
        description: 'Secondary branching formation',
        descriptionHi: 'पौधों में द्वितीयक शाखाओं का फैलाव',
        waterNeed: 'Optimal (40-50%)',
        waterNeedHi: 'इष्टतम नमी (40-50%)'
      },
      {
        stageName: 'Flowering & Siliqua',
        stageNameHi: 'फूल व फलियां (फलियां बनना)',
        startDay: 51,
        endDay: 85,
        description: 'Critical pod setting stage',
        descriptionHi: 'फूल खिलना व फलियों का विकास (क्रांतिक चरण)',
        waterNeed: 'High (45-55%)',
        waterNeedHi: 'पर्याप्त जल (45-55%)'
      },
      {
        stageName: 'Pod Filling & Maturity (कटाई चरण)',
        stageNameHi: 'दाना पकना व कटाई',
        startDay: 86,
        endDay: 110,
        description: 'Siliqua browning, pods dry and ready for cutting',
        descriptionHi: 'फलियां भूरी होकर पक चुकी हैं, कटाई का समय',
        waterNeed: 'Low (< 30%)',
        waterNeedHi: 'कम नमी (< 30%)'
      }
    ]
  },
  Rice: {
    durationDays: 125,
    cropNameHi: 'बासमती धान',
    seasonalCalendar: {
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
    stages: [
      {
        stageName: 'Nursery & Transplanting',
        stageNameHi: 'नर्सरी व रोपाई (पलेवा)',
        startDay: 0,
        endDay: 20,
        description: 'Seedling transfer to puddled field',
        descriptionHi: 'खेत में पौधों की रोपाई व प्रारंभिक जड़ पकड़ना',
        waterNeed: 'Standing water (60-70%)',
        waterNeedHi: 'खड़ा पानी (60-70%)'
      },
      {
        stageName: 'Active Tillering',
        stageNameHi: 'कल्ले फूटना (सक्रिय विकास)',
        startDay: 21,
        endDay: 50,
        description: 'Rapid stalk multiplication',
        descriptionHi: 'प्रति पौधे अधिक कल्ले बनना',
        waterNeed: 'High saturation (55-65%)',
        waterNeedHi: 'उच्च संतृप्ति (55-65%)'
      },
      {
        stageName: 'Panicle Initiation & Heading',
        stageNameHi: 'बाली निकलना व गभोटा',
        startDay: 51,
        endDay: 85,
        description: 'Grain head emergence',
        descriptionHi: 'फूल व बालियों का बाहर निकलना',
        waterNeed: 'Optimal continuous moisture (55-60%)',
        waterNeedHi: 'सतत इष्टतम नमी (55-60%)'
      },
      {
        stageName: 'Milking & Grain Dough',
        stageNameHi: 'दूधिया अवस्था व दाना सख्त होना',
        startDay: 86,
        endDay: 110,
        description: 'Kernel hardening',
        descriptionHi: 'चावल के दाने का भराव व कड़ा होना',
        waterNeed: 'Moderate (45-50%)',
        waterNeedHi: 'मध्यम नमी (45-50%)'
      },
      {
        stageName: 'Harvest Maturity (कटाई चरण)',
        stageNameHi: 'परिपक्वता व कटाई (खेत सुखाएं)',
        startDay: 111,
        endDay: 125,
        description: 'Water drained 10 days prior; crop golden and ready for cutting',
        descriptionHi: 'सुनहरी फसल, कटाई से 10 दिन पूर्व पानी निकासी पूर्ण',
        waterNeed: 'Dry (< 30%)',
        waterNeedHi: 'सूखा (< 30%)'
      }
    ]
  },
  Maize: {
    durationDays: 105,
    cropNameHi: 'मक्का',
    seasonalCalendar: {
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
    stages: [
      {
        stageName: 'Seedling & Emergence',
        stageNameHi: 'अंकुरण व छोटा पौधा',
        startDay: 0,
        endDay: 20,
        description: 'Primary root anchoring',
        descriptionHi: 'शुरुआती जड़ों का फैलाव',
        waterNeed: 'Moist (40-50%)',
        waterNeedHi: 'हल्की नमी (40-50%)'
      },
      {
        stageName: 'Knee-High Vegetative',
        stageNameHi: 'घुटने तक ऊंचाई (वानस्पतिक वृद्धि)',
        startDay: 21,
        endDay: 45,
        description: 'Rapid biomass expansion',
        descriptionHi: 'पौधे की तेजी से लंबाई बढ़ना',
        waterNeed: 'Moderate (45-55%)',
        waterNeedHi: 'मध्यम नमी (45-55%)'
      },
      {
        stageName: 'Tasseling & Silking',
        stageNameHi: 'नरमंजर व भुट्टे में बाल (सिल्किंग)',
        startDay: 46,
        endDay: 70,
        description: 'Pollination and kernel setup',
        descriptionHi: 'परागण एवं भुट्टे में दाना बनने की सर्वाधिक क्रांतिक अवस्था',
        waterNeed: 'Critical peak (55-65%)',
        waterNeedHi: 'उच्चतम क्रांतिक नमी (55-65%)'
      },
      {
        stageName: 'Grain Filling',
        stageNameHi: 'भुट्टे में दाना भराव',
        startDay: 71,
        endDay: 90,
        description: 'Cob starch accumulation',
        descriptionHi: 'दानों में स्टार्च जमना व आकार बढ़ना',
        waterNeed: 'Moderate (45-50%)',
        waterNeedHi: 'मध्यम नमी (45-50%)'
      },
      {
        stageName: 'Harvest Maturity (कटाई चरण)',
        stageNameHi: 'भुट्टा पकना व कटाई',
        startDay: 91,
        endDay: 105,
        description: 'Black layer formation, husks dry for harvesting',
        descriptionHi: 'काली परत बनना, छिलका सूखकर कटाई हेतु तैयार',
        waterNeed: 'Dry (< 28%)',
        waterNeedHi: 'सूखी मिट्टी (< 28%)'
      }
    ]
  },
  Cotton: {
    durationDays: 165,
    cropNameHi: 'कपास',
    seasonalCalendar: {
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
    },
    stages: [
      {
        stageName: 'Germination & Seedling',
        stageNameHi: 'अंकुरण व छोटा पौधा',
        startDay: 0,
        endDay: 30,
        description: 'Taproot elongation',
        descriptionHi: 'मूसला जड़ का गहराई में जाना',
        waterNeed: 'Moist (40-50%)',
        waterNeedHi: 'हल्की नमी (40-50%)'
      },
      {
        stageName: 'Vegetative & Square Formation',
        stageNameHi: 'शाखाएं व कली (स्क्वायर) बनना',
        startDay: 31,
        endDay: 65,
        description: 'Flower bud appearance',
        descriptionHi: 'फूल की कलियों का निर्माण',
        waterNeed: 'Moderate (45-55%)',
        waterNeedHi: 'मध्यम नमी (45-55%)'
      },
      {
        stageName: 'Flowering & Boll Development',
        stageNameHi: 'फूल खिलना व टिंडे बनना',
        startDay: 66,
        endDay: 105,
        description: 'Peak boll formation',
        descriptionHi: 'टिंडों का तेजी से विकास (क्रांतिक समय)',
        waterNeed: 'Critical peak (55-60%)',
        waterNeedHi: 'क्रांतिक नमी (55-60%)'
      },
      {
        stageName: 'Boll Opening & Defoliation',
        stageNameHi: 'टिंडे खिलना व रुई खुलना',
        startDay: 106,
        endDay: 140,
        description: 'Fiber elongation and lint burst',
        descriptionHi: 'सफेद रेशे का बाहर निकलना',
        waterNeed: 'Reduced (35-40%)',
        waterNeedHi: 'कम नमी (35-40%)'
      },
      {
        stageName: 'Harvest Picking (कटाई / तुड़ाई)',
        stageNameHi: 'कपास की चुगाई / तुड़ाई',
        startDay: 141,
        endDay: 165,
        description: 'White bolls fully open, ready for manual/mechanized picking',
        descriptionHi: 'टिंडे पूरी तरह खिल चुके हैं, चुगाई करें',
        waterNeed: 'Dry (< 25%)',
        waterNeedHi: 'सूखा (< 25%)'
      }
    ]
  }
};

function checkCropSeasonSuitability(cropName = 'Wheat', sowingDate = new Date()) {
  const d = new Date(sowingDate);
  const sowMonth = d.getMonth() + 1; // 1-12
  const meta = CROP_METADATA[cropName] || CROP_METADATA.Wheat;
  const cal = meta.seasonalCalendar || {
    optimalSowingMonths: [10, 11, 12],
    optimalHarvestMonths: [3, 4],
    sowingWindowHi: 'अक्टूबर से दिसंबर',
    sowingWindowEn: 'October to December',
    harvestWindowHi: 'मार्च से अप्रैल',
    harvestWindowEn: 'March to April',
    seasonAdvisoryHi: 'अनुकूल सीज़न में बुवाई करें।',
    seasonAdvisoryEn: 'Sow during favorable season.',
    offSeasonReasonHi: 'मौसम इस फसल के अनुकूल नहीं है।',
    offSeasonReasonEn: 'Weather conditions are unfavorable.'
  };

  const durationDays = meta.durationDays || 120;
  const harvestDate = new Date(d.getTime() + durationDays * 86400000);
  const harvestMonth = harvestDate.getMonth() + 1;

  const isOptimal = cal.optimalSowingMonths.includes(sowMonth);
  const sowMonthNameHi = MONTH_NAMES_HI[sowMonth] || 'वर्तमान माह';
  const sowMonthNameEn = MONTH_NAMES_EN[sowMonth] || 'Current Month';
  const harvestMonthNameHi = MONTH_NAMES_HI[harvestMonth] || 'कटाई माह';
  const harvestMonthNameEn = MONTH_NAMES_EN[harvestMonth] || 'Harvest Month';

  const suggested = MONTHLY_SUGGESTED_CROPS[sowMonth] || {
    cropsHi: ['गेहूं', 'सरसों'],
    cropsEn: ['Wheat', 'Mustard']
  };

  if (isOptimal) {
    return {
      isOptimal: true,
      status: 'OPTIMAL',
      cropName,
      cropNameHi: meta.cropNameHi || cropName,
      sowMonth,
      harvestMonth,
      sowMonthNameHi,
      sowMonthNameEn,
      harvestMonthNameHi,
      harvestMonthNameEn,
      badgeHi: 'बुवाई का सर्वोत्तम समय (इष्टतम सीज़न)',
      badgeEn: 'Optimal Sowing Window (Ideal Season)',
      alertLevel: 'SUCCESS',
      titleHi: `${sowMonthNameHi} का महीना ${meta.cropNameHi || cropName} की बुवाई के लिए सर्वोत्तम है!`,
      titleEn: `${sowMonthNameEn} is the optimal window to sow ${cropName}!`,
      descriptionHi: `${meta.cropNameHi || cropName} के लिए यह आदर्श मौसम है। ${cal.seasonAdvisoryHi} अपेक्षित कटाई ${harvestMonthNameHi} (${cal.harvestWindowHi}) में होगी।`,
      descriptionEn: `Weather conditions and temperature are ideal for ${cropName}. ${cal.seasonAdvisoryEn} Expected harvest in ${harvestMonthNameEn} (${cal.harvestWindowEn}).`,
      sowingWindowHi: cal.sowingWindowHi,
      sowingWindowEn: cal.sowingWindowEn,
      harvestWindowHi: cal.harvestWindowHi,
      harvestWindowEn: cal.harvestWindowEn,
      suggestedCropsHi: [],
      suggestedCropsEn: []
    };
  } else {
    return {
      isOptimal: false,
      status: 'OFF_SEASON',
      cropName,
      cropNameHi: meta.cropNameHi || cropName,
      sowMonth,
      harvestMonth,
      sowMonthNameHi,
      sowMonthNameEn,
      harvestMonthNameHi,
      harvestMonthNameEn,
      badgeHi: 'सावधान: गलत समय / असामयिक बुवाई चेतावनी',
      badgeEn: 'Caution: Off-Season Sowing Warning',
      alertLevel: 'WARNING',
      titleHi: `सावधान किसान भाई: ${sowMonthNameHi} का महीना ${meta.cropNameHi || cropName} बोने का सही समय नहीं है!`,
      titleEn: `Caution: ${sowMonthNameEn} is NOT a good time to sow/harvest ${cropName}!`,
      descriptionHi: `${cal.offSeasonReasonHi || 'इस महीने में जलवायु और तापमान इस फसल के अनुकूल नहीं है, जिससे भारी नुकसान या उपज में भारी गिरावट हो सकती है।'} ${meta.cropNameHi || cropName} बोने का सही समय: ${cal.sowingWindowHi} (कटाई: ${cal.harvestWindowHi}) है।`,
      descriptionEn: `${cal.offSeasonReasonEn || 'Climate and soil temperatures during this period are unfavorable, risking crop loss.'} Recommended sowing window: ${cal.sowingWindowEn} (Harvest: ${cal.harvestWindowEn}).`,
      sowingWindowHi: cal.sowingWindowHi,
      sowingWindowEn: cal.sowingWindowEn,
      harvestWindowHi: cal.harvestWindowHi,
      harvestWindowEn: cal.harvestWindowEn,
      suggestedCropsHi: suggested.cropsHi,
      suggestedCropsEn: suggested.cropsEn,
      alternativeAdviceHi: `इस महीने (${sowMonthNameHi}) में आप इन फसलों को प्राथमिकता दे सकते हैं: ${suggested.cropsHi.join(', ')}।`,
      alternativeAdviceEn: `For this month (${sowMonthNameEn}), recommended crops include: ${suggested.cropsEn.join(', ')}.`
    };
  }
}

async function getOrInitCropSchedule(plotId = 'PLOT_001') {
  let schedule = await CropSchedule.findOne({ plotId, status: 'ACTIVE' });
  const plot = await Plot.findOne({ plotId }).lean();
  const assignedDeviceId = plot?.assignedDeviceId || (plotId === 'PLOT_001' ? 'DEVICE_001' : 'NONE');

  if (!schedule) {
    const meta = CROP_METADATA.Wheat;
    const sowingDate = new Date(Date.now() - 24 * 24 * 60 * 60 * 1000); // 24 days ago
    const expectedHarvestDate = new Date(sowingDate.getTime() + meta.durationDays * 86400000);
    const seasonSuitability = checkCropSeasonSuitability(plot?.currentCrop || 'Wheat', sowingDate);

    schedule = await CropSchedule.create({
      plotId,
      assignedDeviceId,
      cropName: plot?.currentCrop || 'Wheat',
      variety: 'PBW 725 (High Yielding)',
      sowingDate,
      totalDurationDays: meta.durationDays,
      expectedHarvestDate,
      acreage: plot?.areaAcres || 2.5,
      location: {
        district: plot?.location?.district || 'Ludhiana',
        state: plot?.location?.state || 'Punjab',
        lat: plot?.location?.coordinates?.latitude || 30.9010,
        lon: plot?.location?.coordinates?.longitude || 75.8573,
        autoDetected: false
      },
      moistureThresholds: {
        optimal: 55,
        soonerNotice: 40,
        criticalWilting: 25
      },
      notifications: {
        enabled: true,
        criticalMoisture: assignedDeviceId !== 'NONE',
        criticalThreshold: 24,
        soonerMoisture: assignedDeviceId !== 'NONE',
        soonerThreshold: 40,
        rainDelay: true,
        hypoxiaWarning: assignedDeviceId !== 'NONE',
        stageTransition: true,
        voiceAlert: true,
        smsAlert: true,
        phoneNumber: '+91 98765 43210'
      },
      growthStages: meta.stages,
      seasonalCalendar: {
        ...(meta.seasonalCalendar || {}),
        isOptimalSeason: seasonSuitability.isOptimal
      },
      status: 'ACTIVE'
    });
  } else if (!schedule.assignedDeviceId) {
    schedule.assignedDeviceId = assignedDeviceId;
    await schedule.save();
  }
  return schedule;
}

async function evaluateCropAlerts({ plotId = 'PLOT_001', currentMoisture = null, locationOverride = null }) {
  const schedule = await getOrInitCropSchedule(plotId);

  if (locationOverride) {
    schedule.location = { ...schedule.location, ...locationOverride };
    await schedule.save();
  }

  const meta = CROP_METADATA[schedule.cropName] || CROP_METADATA.Wheat;
  const totalDurationDays = schedule.totalDurationDays || meta.durationDays;

  // Calculate Days After Sowing (DAS) accurately
  const now = new Date();
  const sowing = new Date(schedule.sowingDate);
  const todayDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const sowDate = new Date(sowing.getFullYear(), sowing.getMonth(), sowing.getDate());
  const diffTime = todayDate.getTime() - sowDate.getTime();
  const rawDas = Math.round(diffTime / (1000 * 60 * 60 * 24));

  const isFuture = rawDas < 0;
  const daysUntilSowing = Math.abs(rawDas);
  const das = Math.max(0, rawDas);

  // Expected Harvest Date
  const expectedHarvestDate = schedule.expectedHarvestDate || new Date(sowing.getTime() + totalDurationDays * 86400000);
  const daysRemainingUntilHarvest = Math.max(0, totalDurationDays - das);
  const lifecycleProgressPercent = Math.min(100, Math.round((das / totalDurationDays) * 100));
  const isHarvestReady = das >= (totalDurationDays - 5);

  // Growth stage selection
  const stages = schedule.growthStages?.length > 0 ? schedule.growthStages : meta.stages;
  
  let currentStage;
  if (isFuture) {
    currentStage = {
      stageName: 'Pre-Sowing / Field Preparation',
      stageNameHi: 'खेत की तैयारी व पलेवा (बुवाई पूर्व)',
      startDay: -daysUntilSowing,
      endDay: 0,
      description: `Planned Sowing in ${daysUntilSowing} Days. Field preparation & basal soil conditioning.`,
      descriptionHi: `योजनाबद्ध बुवाई ${daysUntilSowing} दिन बाद। खेत की गहरी जुताई व पलेवा।`,
      waterNeed: 'Pre-sowing Rauni irrigation ~45-50%',
      waterNeedHi: 'पलेवा (रौणी सिंचाई) 45-50% नमी'
    };
  } else {
    currentStage = stages.find(s => das >= s.startDay && das <= s.endDay) || stages[stages.length - 1];
  }

  // Weather lookup
  const weather = await WeatherSnapshot.findOne({ plotId }).sort({ recordedAt: -1 }).lean() || {
    forecastRainNext24hMm: 6.8,
    temperatureCelsius: 27.2,
    humidityPercent: 58,
    referenceEvapotranspirationET0: 4.1
  };

  const isRainForecasted = weather.forecastRainNext24hMm >= 5.0;
  const notif = schedule.notifications || {};
  const criticalWilting = notif.criticalThreshold || schedule.moistureThresholds.criticalWilting || 24;
  const soonerNotice = notif.soonerThreshold || schedule.moistureThresholds.soonerNotice || 40;
  const optimal = schedule.moistureThresholds.optimal || 55;

  const plot = await Plot.findOne({ plotId }).lean();
  const assignedDeviceId = schedule.assignedDeviceId || plot?.assignedDeviceId || (plotId === 'PLOT_001' ? 'DEVICE_001' : 'NONE');
  const hasLiveDevice = assignedDeviceId && assignedDeviceId !== 'NONE';

  // Automatically sync moisture from live hardware reading if device is connected
  if (hasLiveDevice) {
    const latestReading = await SensorReading.findOne({
      deviceId: assignedDeviceId
    }).sort({ timestamp: -1 }).lean();

    if (latestReading) {
      const hwMoisture = latestReading.moisturePercentage !== undefined
        ? latestReading.moisturePercentage
        : latestReading.moisture;
      if (hwMoisture !== undefined && !isNaN(hwMoisture) && (currentMoisture === null || currentMoisture === undefined)) {
        currentMoisture = Math.round(hwMoisture * 10) / 10;
      }
    }
  }

  if (currentMoisture === null || currentMoisture === undefined) {
    currentMoisture = 34;
  }

  const assignedDeviceMeta = AVAILABLE_DEVICES.find(d => d.deviceId === assignedDeviceId) || {
    deviceId: assignedDeviceId,
    name: assignedDeviceId,
    nameEn: assignedDeviceId,
    online: hasLiveDevice
  };

  let alertLevel = 'OPTIMAL';
  let alertTitleEn = '';
  let alertTitleHi = '';
  let alertDescriptionEn = '';
  let alertDescriptionHi = '';
  let urgency = 'NORMAL';
  let recommendedActionEn = '';
  let recommendedActionHi = '';
  let notificationTriggered = false;
  let notificationMessage = '';

  const activeStageHi = currentStage.stageNameHi || currentStage.stageName;

  if (!hasLiveDevice) {
    alertLevel = 'TIMELINE_ONLY';
    urgency = 'TIMELINE_STAGE';
    alertTitleEn = `Crop Timeline Mode: ${currentStage.stageName}`;
    alertTitleHi = `फसल समय-सीमा मोड (Timeline): ${activeStageHi}`;
    alertDescriptionEn = `No live Arduino hardware device is connected to this farm. Real-time soil moisture alerts cannot be set — only the crop timeline, phenological growth stages (Day ${das} of ${totalDurationDays}), and calendar reminders are being tracked.`;
    alertDescriptionHi = `इस खेत के लिए कोई लाइव डिवाइस (Arduino/सेंसर) कनेक्ट नहीं है। आप लाइव नमी अलर्ट सेट नहीं कर सकते — केवल फसल समय-सीमा, जीवनचक्र अवस्थाएं (बुवाई के ${das}/${totalDurationDays} दिन) व सीज़न कैलेंडर ही ट्रैक किया जा रहा है।`;
    recommendedActionEn = `Follow calendar-based timeline recommendations for ${currentStage.stageName}. To activate live moisture sirens and water volume alerts, select a connected Arduino device in Alert Rules.`;
    recommendedActionHi = `कैलेंडर अनुसार ${activeStageHi} के सामान्य कृषि कार्य करें। लाइव नमी सायरन व सटीक जल गणना हेतु अलर्ट नियमों में जाकर Arduino डिवाइस चुनें।`;
  } else if (isHarvestReady) {
    alertLevel = 'HARVEST_ALERT';
    urgency = 'HARVEST_WINDOW';
    alertTitleEn = 'CROP READY FOR HARVEST (कटाई का समय आ गया है)';
    alertTitleHi = 'फसल पककर तैयार है — कटाई का उपयुक्त समय';
    alertDescriptionEn = `The crop has completed ${das} of ${totalDurationDays} days and has reached full physiological maturity. Soil moisture should be kept dry (< 25%) to prevent rot.`;
    alertDescriptionHi = `फसल ने ${totalDurationDays} में से ${das} दिन पूरे कर लिए हैं और परिपक्व हो चुकी है। सड़न रोकने हेतु मिट्टी को सूखा (< 25%) रखें।`;
    recommendedActionEn = 'Plan combine or manual harvesting. Mark crop as harvested to archive season records in the database.';
    recommendedActionHi = 'कंबाइन या दरांती से कटाई की योजना बनाएं। डेटाबेस में सीज़न रिकॉर्ड सुरक्षित करने हेतु कटाई पूर्ण दर्ज करें।';
    if (notif.enabled && notif.stageTransition) {
      notificationTriggered = true;
      notificationMessage = `[कटाई अलर्ट] ${meta.cropNameHi || schedule.cropName} कटाई के लिए पूरी तरह तैयार है।`;
    }
  } else if (currentMoisture <= criticalWilting) {
    if (isRainForecasted && notif.rainDelay) {
      alertLevel = 'RAIN_SUPPRESSED';
      urgency = 'MODERATE';
      alertTitleEn = 'Rain Incoming: Pumping Delayed to Prevent Waste';
      alertTitleHi = 'वर्षा आगमन: बिजली व जल बचाने हेतु सिंचाई स्थगित';
      alertDescriptionEn = `Soil moisture is low (${currentMoisture}%), but ${weather.forecastRainNext24hMm} mm rainfall is forecasted in the next 24 hours. Natural rain will replenish the root zone.`;
      alertDescriptionHi = `मिट्टी की नमी कम (${currentMoisture}%) है, लेकिन अगले 24 घंटों में ${weather.forecastRainNext24hMm} मिमी वर्षा का अनुमान है। प्राकृतिक वर्षा से जड़ क्षेत्र सिंचित हो जाएगा।`;
      recommendedActionEn = 'Keep pump motor on standby. Monitor field drainage channels.';
      recommendedActionHi = 'पंप मोटर बंद रखें। खेत की जल निकासी नालियों को खुला रखें।';
    } else {
      alertLevel = 'CRITICAL_HIGH_RISK';
      urgency = 'CRITICAL_SIREN';
      alertTitleEn = 'CRITICAL WATER STRESS: High Wilting Risk Alert';
      alertTitleHi = 'अति-गंभीर जल संकट: फसल मुरझाने का उच्च खतरा';
      alertDescriptionEn = `Soil moisture has plummeted to ${currentMoisture}% (below critical wilting point of ${criticalWilting}%). Active stage is ${currentStage.stageName}. Immediate irrigation required to prevent crop loss.`;
      alertDescriptionHi = `सेंसर नमी गिरकर ${currentMoisture}% रह गई है (क्रांतिक सीमा ${criticalWilting}% से कम)। वर्तमान अवस्था: ${activeStageHi}। फसल को नष्ट होने से बचाने हेतु तत्काल पानी दें।`;
      recommendedActionEn = `Turn on irrigation pump immediately. Apply ~14,000 Liters/Acre between 5:30 AM - 7:30 AM.`;
      recommendedActionHi = `सिंचाई पंप तत्काल चालू करें। प्रातः 5:30 से 7:30 बजे के बीच लगभग 14,000 लीटर/एकड़ जल दें।`;
      if (notif.enabled && notif.criticalMoisture) {
        notificationTriggered = true;
        notificationMessage = `[अति-गंभीर सायरन] खेत ${plotId} पर नमी ${currentMoisture}% पर आ गई है। तुरंत पानी दें!`;
      }
    }
  } else if (currentMoisture <= soonerNotice) {
    if (isRainForecasted && notif.rainDelay) {
      alertLevel = 'RAIN_SUPPRESSED';
      urgency = 'LOW';
      alertTitleEn = 'Sooner Notice: Rain Will Replenish Soil Moisture';
      alertTitleHi = 'पूर्व सूचना: आने वाली बारिश से खेत सिंचित होगा';
      alertDescriptionEn = `Soil moisture is dropping (${currentMoisture}%), but upcoming rain (${weather.forecastRainNext24hMm} mm) will provide sufficient moisture without manual pumping.`;
      alertDescriptionHi = `मिट्टी की नमी घट रही है (${currentMoisture}%), लेकिन आगामी ${weather.forecastRainNext24hMm} मिमी बारिश बिना मोटर चलाए खेत को तर कर देगी।`;
      recommendedActionEn = 'Zero manual water required today. Conserve electricity.';
      recommendedActionHi = 'आज किसी कृत्रिम जल की आवश्यकता नहीं है। बिजली और पानी बचाएं।';
    } else {
      alertLevel = 'SOONER_NOTICE';
      urgency = 'EARLY_ADVISORY';
      alertTitleEn = 'SOONER NOTICE: Soil Moisture Depleting';
      alertTitleHi = 'पूर्व सूचना: मृदा नमी स्तर धीरे-धीरे घट रहा है';
      alertDescriptionEn = `Soil moisture has reached ${currentMoisture}% (approaching threshold of ${soonerNotice}%). Soil is depleting at ~0.3%/hour. No rain expected in next 48h.`;
      alertDescriptionHi = `मिट्टी की नमी ${currentMoisture}% तक आ गई है (पूर्व सूचना सीमा ${soonerNotice}% के निकट)। नमी दर ~0.3%/घंटे घट रही है। अगले 48 घंटों में बारिश की संभावना नहीं है।`;
      recommendedActionEn = `Plan next irrigation cycle in the next 24 to 36 hours. Current stage: ${currentStage.stageName}.`;
      recommendedActionHi = `अगले 24 से 36 घंटों में सिंचाई चक्र की योजना बनाएं। वर्तमान अवस्था: ${activeStageHi}।`;
      if (notif.enabled && notif.soonerMoisture) {
        notificationTriggered = true;
        notificationMessage = `[पूर्व सूचना] खेत ${plotId} पर नमी ${currentMoisture}% है। अगले 24-36 घंटों में पानी की योजना बनाएं।`;
      }
    }
  } else if (currentMoisture >= 80 && notif.hypoxiaWarning) {
    alertLevel = 'HYPOXIA_WARNING';
    urgency = 'HIGH';
    alertTitleEn = 'WATERLOGGING & ROOT HYPOXIA DANGER';
    alertTitleHi = 'अत्यधिक जलभराव एवं जड़ सड़न (ऑक्सीजन ह्रास) का गंभीर खतरा';
    alertDescriptionEn = `Soil moisture is persistently saturated at ${currentMoisture}%. Capillary air pores are drowned, inviting Pythium damping-off root rot.`;
    alertDescriptionHi = `मिट्टी की नमी लगातार ${currentMoisture}% पर अति-संतृप्त है। जड़ों के सूक्ष्म वायु छिद्र पानी में डूब चुके हैं, जिससे फंगस व जड़ सड़न का संकट है।`;
    recommendedActionEn = 'Halt all irrigation pumps immediately. Clear surface drain trenches.';
    recommendedActionHi = 'सिंचाई तुरंत रोकें। निचले खेत से खड़े पानी को नाली काटकर बाहर निकालें।';
    if (notif.enabled) {
      notificationTriggered = true;
      notificationMessage = `[जलभराव खतरा] खेत ${plotId} पर नमी ${currentMoisture}% है। जल निकासी करें!`;
    }
  } else {
    alertLevel = 'OPTIMAL';
    urgency = 'OPTIMAL';
    alertTitleEn = 'Soil Moisture Level Healthy';
    alertTitleHi = 'मृदा नमी स्तर उत्तम एवं संतुलित';
    alertDescriptionEn = `Current moisture (${currentMoisture}%) is well within the optimal range (${optimal}% target). Root zone respiration is normal.`;
    alertDescriptionHi = `वर्तमान नमी (${currentMoisture}%) संतुलित स्तर (लक्ष्य ${optimal}%) में है। पौधों की जड़ों को पर्याप्त ऑक्सीजन व पोषण मिल रहा है।`;
    recommendedActionEn = 'No irrigation required. Continue routine monitoring.';
    recommendedActionHi = 'वर्तमान में सिंचाई की आवश्यकता नहीं है। दैनिक निगरानी जारी रखें।';
  }

  // Also query past archived harvested crops for this plot
  const archivedHarvests = await CropSchedule.find({ plotId, status: 'HARVESTED' }).sort({ harvestedAt: -1 }).limit(5).lean();

  // Precise smart irrigation water budgeting (liters required based on acreage, crop target and current moisture)
  let waterDepthMm = 0;
  let irrigationUrgency = 'OPTIMAL';
  const rainSkipTriggered = isRainForecasted;

  if (!hasLiveDevice) {
    irrigationUrgency = 'TIMELINE_ONLY';
    waterDepthMm = 0;
  } else if (isRainForecasted && currentMoisture > criticalWilting) {
    irrigationUrgency = 'RAIN_SUPPRESSED';
    waterDepthMm = 0;
  } else if (currentMoisture < criticalWilting) {
    irrigationUrgency = 'CRITICAL';
    waterDepthMm = Math.max(15, (optimal - currentMoisture) * 0.8);
  } else if (currentMoisture < optimal - 10) {
    irrigationUrgency = 'URGENT';
    waterDepthMm = (optimal - currentMoisture) * 0.6;
  } else if (currentMoisture < optimal) {
    irrigationUrgency = 'MODERATE';
    waterDepthMm = (optimal - currentMoisture) * 0.4;
  } else {
    irrigationUrgency = 'OPTIMAL';
    waterDepthMm = 0;
  }

  const farmAcreage = schedule.acreage || 2.5;
  const recommendedWaterVolumeLiters = hasLiveDevice ? Math.round(waterDepthMm * 4047 * farmAcreage) : 0;
  const irrigation = {
    targetMoisture: optimal,
    currentMoisture: hasLiveDevice ? currentMoisture : null,
    hasLiveDevice,
    assignedDeviceId,
    recommendedWaterDepthMm: +waterDepthMm.toFixed(1),
    recommendedWaterVolumeLiters,
    farmAcreage,
    urgency: irrigationUrgency,
    optimalWindow: {
      startTime: '05:30 AM',
      endTime: '07:30 AM'
    },
    rainSkipTriggered
  };

  const seasonSuitability = checkCropSeasonSuitability(schedule.cropName, schedule.sowingDate);

  // Look up latest hardware reading to check if physical temperature sensor is active
  const latestHardware = hasLiveDevice ? await SensorReading.findOne({
    deviceId: assignedDeviceId,
    source: 'hardware'
  }).sort({ timestamp: -1 }).lean() : null;

  const hardwareTemp = latestHardware?.temperature;
  const hasHardwareTemp = hardwareTemp !== null && hardwareTemp !== undefined && !isNaN(hardwareTemp);
  const gpsTemp = (weather && weather.temperatureCelsius !== undefined) ? +weather.temperatureCelsius.toFixed(1) : 27.2;
  const effectiveTemperature = {
    value: hasHardwareTemp ? +hardwareTemp.toFixed(1) : gpsTemp,
    source: hasHardwareTemp ? 'HARDWARE_PROBE' : 'GPS_LOCATION',
    isGpsFallback: !hasHardwareTemp,
    labelHi: hasHardwareTemp ? `${(+hardwareTemp).toFixed(1)}°C (सेंसर प्रोब)` : `${gpsTemp}°C (GPS स्थान मौसम)`,
    labelEn: hasHardwareTemp ? `${(+hardwareTemp).toFixed(1)}°C (Hardware Probe)` : `${gpsTemp}°C (GPS Location Weather)`
  };

  const noLiveDeviceWarning = !hasLiveDevice ? {
    active: true,
    titleHi: 'कोई लाइव डिवाइस नहीं — केवल फसल समय-सीमा सक्रिय',
    titleEn: 'No Live Device Assigned — Crop Timeline Mode Only',
    messageHi: 'इस खेत के लिए कोई लाइव डिवाइस (Arduino/सेंसर) कनेक्ट नहीं है। आप लाइव नमी अलर्ट सेट नहीं कर सकते — केवल फसल समय-सीमा, जीवनचक्र अवस्थाएं व सीज़न कैलेंडर ही ट्रैक किया जा सकता है।',
    messageEn: 'No live Arduino device connected to this farm. You cannot set live sensor alerts — only the crop timeline, phenological growth stages, and calendar reminders will be active.'
  } : null;

  // Persist triggered alerts for this farm into Alert collection
  if (hasLiveDevice && notificationTriggered && alertLevel !== 'OPTIMAL' && alertLevel !== 'TIMELINE_ONLY') {
    const todayKey = new Date().toISOString().slice(0, 10);
    const dedupKey = `${plotId}_${alertLevel}_${todayKey}`;
    try {
      const existingAlert = await Alert.findOne({ deduplicationKey: dedupKey, resolved: false });
      if (!existingAlert) {
        const plotDoc = await Plot.findOne({ plotId }).select('owner').lean();
        const ownerId = plotDoc?.owner || null;
        await Alert.create({
          alertId: `ALT_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
          user: ownerId,
          userId: ownerId,
          deviceId: assignedDeviceId,
          plotId,
          type: alertLevel,
          severity: (alertLevel === 'CRITICAL_HIGH_RISK' || alertLevel === 'HYPOXIA_WARNING') ? 'high' : 'medium',
          message: alertDescriptionHi || alertDescriptionEn,
          value: currentMoisture,
          threshold: alertLevel === 'CRITICAL_HIGH_RISK' ? criticalWilting : (alertLevel === 'HYPOXIA_WARNING' ? 80 : soonerNotice),
          deduplicationKey: dedupKey,
          timestamp: new Date()
        });
      }
    } catch (err) {
      console.warn('[Alert Persistence Warn]:', err.message);
    }
  }

  return {
    schedule,
    hasLiveDevice,
    assignedDeviceId,
    assignedDeviceMeta,
    availableDevices: AVAILABLE_DEVICES,
    noLiveDeviceWarning,
    das,
    rawDas,
    isFuture,
    daysUntilSowing,
    totalDurationDays,
    expectedHarvestDate,
    daysRemainingUntilHarvest,
    lifecycleProgressPercent,
    isHarvestReady,
    currentStage,
    currentMoisture: hasLiveDevice ? currentMoisture : null,
    weather,
    effectiveTemperature,
    irrigation,
    seasonSuitability,
    archivedHarvests,
    alert: {
      hasLiveDevice,
      assignedDeviceId,
      assignedDeviceMeta,
      noLiveDeviceWarning,
      alertLevel,
      urgency,
      alertTitle: alertTitleEn,
      alertTitleHi,
      alertDescription: alertDescriptionEn,
      alertDescriptionHi,
      recommendedAction: recommendedActionEn,
      recommendedActionHi,
      isRainForecasted,
      rainExpectedMm: weather.forecastRainNext24hMm,
      notificationTriggered,
      notificationMessage,
      seasonSuitability
    }
  };
}

async function markCropAsHarvested({ plotId = 'PLOT_001', actualYieldQuintals = 22, harvestNotes = '' }) {
  const schedule = await getOrInitCropSchedule(plotId);
  schedule.status = 'HARVESTED';
  schedule.harvestedAt = new Date();
  schedule.actualYieldQuintals = actualYieldQuintals;
  schedule.harvestNotes = harvestNotes || 'Season successfully completed and archived.';
  await schedule.save();

  const meta = CROP_METADATA.Wheat;
  const newSowingDate = new Date();
  const newSchedule = await CropSchedule.create({
    plotId,
    cropName: 'Wheat',
    variety: 'PBW 725 (High Yielding)',
    sowingDate: newSowingDate,
    totalDurationDays: meta.durationDays,
    expectedHarvestDate: new Date(newSowingDate.getTime() + meta.durationDays * 86400000),
    acreage: schedule.acreage || 2.5,
    location: schedule.location,
    moistureThresholds: schedule.moistureThresholds,
    notifications: schedule.notifications,
    growthStages: meta.stages,
    status: 'ACTIVE'
  });

  return { archived: schedule, active: newSchedule };
}

async function getAllFarmsSummary(userId = null) {
  let query = { status: { $ne: 'deleted' } };
  if (userId) {
    query.owner = userId;
  }
  let plots = await Plot.find(query).sort({ plotId: 1 }).lean();

  // If a specific logged-in user has no plots yet, check user profile and auto-generate their plot
  if (userId && (!plots || plots.length === 0)) {
    const User = require('../models/User');
    const u = await User.findById(userId);
    if (u) {
      const allPlots = await Plot.find({}).lean();
      let maxNum = 1;
      allPlots.forEach(p => {
        const match = (p.plotId || '').match(/PLOT_?(\d+)/i);
        if (match) {
          const num = parseInt(match[1], 10);
          if (num > maxNum) maxNum = num;
        }
      });
      const newPlotId = `PLOT_${String(maxNum + 1).padStart(3, '0')}`;
      const userCrop = (u.role === 'agronomist' ? 'Mustard' : u.role === 'student' ? 'Maize' : 'Wheat');
      const defaultPlot = await Plot.create({
        plotId: newPlotId,
        name: u.plotName || `${u.name}'s Farm (${userCrop})`,
        owner: u._id,
        areaAcres: 2.5,
        assignedDeviceId: 'DEVICE_001',
        location: {
          state: u.state || 'Punjab',
          district: u.district || 'Ludhiana',
          locality: u.village || 'Farm Block A'
        },
        currentCrop: userCrop,
        status: 'active'
      });

      const meta = CROP_METADATA[userCrop] || CROP_METADATA.Wheat;
      const sow = new Date();
      await CropSchedule.create({
        plotId: newPlotId,
        assignedDeviceId: 'DEVICE_001',
        cropName: userCrop,
        variety: `${userCrop} Certified Seed`,
        sowingDate: sow,
        totalDurationDays: meta.durationDays,
        expectedHarvestDate: new Date(sow.getTime() + meta.durationDays * 86400000),
        acreage: 2.5,
        location: { district: u.district || 'Ludhiana', state: u.state || 'Punjab', lat: 30.9, lon: 75.8, autoDetected: false },
        moistureThresholds: { optimal: 55, soonerNotice: 40, criticalWilting: 25 },
        notifications: { enabled: true, criticalMoisture: true, soonerMoisture: true, rainDelay: true, voiceAlert: true, smsAlert: true, phoneNumber: u.phone || '+91 98765 43210' },
        growthStages: meta.stages,
        status: 'ACTIVE'
      });

      plots = [defaultPlot.toObject()];
    }
  }

  // If logged-in user still has no plots, keep plots as empty array (do NOT leak other users' plots!)
  if (userId && (!plots || plots.length === 0)) {
    plots = [];
  }

  // If unauthenticated guest (no userId), only show default demo plot PLOT_001
  if (!userId && (!plots || plots.length === 0)) {
    plots = await Plot.find({ plotId: 'PLOT_001', status: { $ne: 'deleted' } }).lean();
    if (!plots || plots.length === 0) {
      plots = await Plot.find({ status: { $ne: 'deleted' } }).limit(1).lean();
    }
  }

  const summaries = [];
  for (const p of plots) {
    try {
      const evaluated = await evaluateCropAlerts({ plotId: p.plotId });
      summaries.push({
        plotId: p.plotId,
        name: p.name,
        assignedDeviceId: evaluated.assignedDeviceId || p.assignedDeviceId || 'NONE',
        hasLiveDevice: evaluated.hasLiveDevice,
        assignedDeviceMeta: evaluated.assignedDeviceMeta,
        noLiveDeviceWarning: evaluated.noLiveDeviceWarning,
        areaAcres: p.areaAcres || evaluated.schedule?.acreage || 2.5,
        location: {
          district: p.location?.district || evaluated.schedule?.location?.district || 'Ludhiana',
          state: p.location?.state || evaluated.schedule?.location?.state || 'Punjab'
        },
        currentCrop: evaluated.schedule?.cropName || p.currentCrop || 'Wheat',
        variety: evaluated.schedule?.variety || 'Standard High Yield',
        sowingDate: evaluated.schedule?.sowingDate,
        das: evaluated.das,
        isFuture: evaluated.isFuture,
        totalDurationDays: evaluated.totalDurationDays,
        expectedHarvestDate: evaluated.expectedHarvestDate,
        daysRemainingUntilHarvest: evaluated.daysRemainingUntilHarvest,
        lifecycleProgressPercent: evaluated.lifecycleProgressPercent,
        currentStage: evaluated.currentStage,
        currentMoisture: evaluated.currentMoisture,
        effectiveTemperature: evaluated.effectiveTemperature,
        alert: evaluated.alert,
        irrigation: evaluated.irrigation,
        seasonSuitability: evaluated.seasonSuitability,
        notifications: evaluated.schedule?.notifications || { enabled: true }
      });
    } catch (e) {
      console.error(`Error summarizing plot ${p.plotId}:`, e);
    }
  }

  return summaries;
}

async function createNewFarm({ name, district = 'Ludhiana', state = 'Punjab', acreage = 2.5, cropName = 'Wheat', variety = 'PBW 725', sowingDate, soilType = 'Loamy', notifications, assignedDeviceId = 'DEVICE_001', owner = null }) {
  const allPlots = await Plot.find({}).lean();
  let maxNum = 1;
  allPlots.forEach(p => {
    const match = (p.plotId || '').match(/PLOT_?(\d+)/i);
    if (match) {
      const num = parseInt(match[1], 10);
      if (num > maxNum) maxNum = num;
    }
  });
  const newPlotId = `PLOT_${String(maxNum + 1).padStart(3, '0')}`;
  const device = assignedDeviceId || 'NONE';

  const plot = await Plot.create({
    plotId: newPlotId,
    name: name || `Farm ${newPlotId} (${cropName})`,
    owner: owner || null,
    areaAcres: +acreage || 2.5,
    assignedDeviceId: device,
    location: {
      state,
      district,
      locality: `${district} Ag Block`,
      coordinates: { latitude: 30.9, longitude: 75.8 }
    },
    currentCrop: cropName,
    status: 'active'
  });

  const meta = CROP_METADATA[cropName] || CROP_METADATA.Wheat;
  const sow = sowingDate ? new Date(sowingDate) : new Date();
  const expectedHarvestDate = new Date(sow.getTime() + meta.durationDays * 86400000);
  const suitability = checkCropSeasonSuitability(cropName, sow);

  const defaultNotifications = {
    enabled: true,
    criticalMoisture: device !== 'NONE',
    criticalThreshold: 24,
    soonerMoisture: device !== 'NONE',
    soonerThreshold: 40,
    rainDelay: true,
    hypoxiaWarning: device !== 'NONE',
    stageTransition: true,
    voiceAlert: true,
    smsAlert: true,
    phoneNumber: '+91 98765 43210',
    ...(notifications || {})
  };

  const schedule = await CropSchedule.create({
    plotId: newPlotId,
    assignedDeviceId: device,
    cropName,
    variety: variety || `${cropName} Certified Seed`,
    sowingDate: sow,
    totalDurationDays: meta.durationDays,
    expectedHarvestDate,
    acreage: +acreage || 2.5,
    location: { district, state, lat: 30.9, lon: 75.8, autoDetected: false },
    moistureThresholds: { optimal: 55, soonerNotice: 40, criticalWilting: 25 },
    notifications: defaultNotifications,
    growthStages: meta.stages,
    seasonalCalendar: {
      ...(meta.seasonalCalendar || {}),
      isOptimalSeason: suitability.isOptimal
    },
    status: 'ACTIVE'
  });

  await WeatherSnapshot.create({
    plotId: newPlotId,
    location: { district, state },
    temperatureCelsius: 27.0,
    humidityPercent: 55,
    forecastRainNext24hMm: 0,
    referenceEvapotranspirationET0: 4.1
  });

  return { plot, schedule };
}

async function updateFarmNotifications(plotId, notifications, assignedDeviceId) {
  const schedule = await getOrInitCropSchedule(plotId);
  schedule.notifications = {
    ...(schedule.notifications || {}),
    ...notifications
  };
  if (assignedDeviceId !== undefined) {
    schedule.assignedDeviceId = assignedDeviceId;
    await Plot.findOneAndUpdate({ plotId }, { assignedDeviceId });
  }
  await schedule.save();
  return {
    notifications: schedule.notifications,
    assignedDeviceId: schedule.assignedDeviceId,
    hasLiveDevice: schedule.assignedDeviceId !== 'NONE'
  };
}

async function deleteFarm(plotId) {
  if (plotId === 'PLOT_001') {
    throw new Error('Default benchmark farm (PLOT_001) cannot be deleted.');
  }
  await Plot.findOneAndUpdate({ plotId }, { status: 'deleted' });
  await CropSchedule.updateMany({ plotId }, { status: 'ARCHIVED' });
  return { success: true };
}

module.exports = {
  CROP_METADATA,
  AVAILABLE_DEVICES,
  checkCropSeasonSuitability,
  getOrInitCropSchedule,
  evaluateCropAlerts,
  markCropAsHarvested,
  getAllFarmsSummary,
  createNewFarm,
  updateFarmNotifications,
  deleteFarm
};
