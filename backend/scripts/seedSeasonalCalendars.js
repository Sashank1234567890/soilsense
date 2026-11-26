const mongoose = require('mongoose');
const Crop = require('../models/Crop');

const SEASON_DATA = {
  Wheat: {
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
  Rice: {
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
  Mustard: {
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
  Maize: {
    optimalSowingMonths: [6, 7, 1, 2],
    optimalHarvestMonths: [9, 10, 4, 5],
    sowingWindowHi: 'खरीफ: जून-जुलाई | बसंत: जनवरी-फरवरी',
    sowingWindowEn: 'Kharif: June-July | Spring: January-February',
    harvestWindowHi: 'खरीफ: सितंबर-अक्टूबर | बसंत: अप्रैल-मई',
    harvestWindowEn: 'Kharif: Sep-Oct | Spring: Apr-May',
    seasonAdvisoryHi: 'मक्का खरीफ व बसंत दोनों मौसमों में अच्छी पैदावार देती है। जल निकासी अच्छी होनी चाहिए।',
    seasonAdvisoryEn: 'Maize is versatile for both Kharif and Spring seasons in well-drained fertile soils.',
    offSeasonReasonHi: 'अत्यधिक कड़ाके की ठंड (दिसंबर) या जलभराव में मक्का बोने पर बीज सड़ जाता है।',
    offSeasonReasonEn: 'Extreme winter freeze or heavy waterlogging causes seed decay and stunted cobs.'
  },
  Cotton: {
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
  Sugarcane: {
    optimalSowingMonths: [2, 3, 9, 10],
    optimalHarvestMonths: [11, 12, 1, 2, 3],
    sowingWindowHi: 'बसंत: फरवरी-मार्च | शरद: सितंबर-अक्टूबर',
    sowingWindowEn: 'Spring: Feb-Mar | Autumn: Sep-Oct',
    harvestWindowHi: 'नवंबर से मार्च (10-12 माह बाद)',
    harvestWindowEn: 'November to March (10-12 months after planting)',
    seasonAdvisoryHi: 'गन्ना एक वार्षिक नकदी फसल है जिसे भारी जल व पोषक तत्वों की निरंतर जरूरत होती है।',
    seasonAdvisoryEn: 'Sugarcane is a long-duration perennial/annual crop needing continuous nutrients and irrigation.',
    offSeasonReasonHi: 'मई-जून की तेज लू या दिसंबर की अत्यधिक ठंड में बुवाई से जमाव बहुत कम रहता है।',
    offSeasonReasonEn: 'Peak summer heat or peak winter dormancy severely reduces cane bud germination.'
  },
  Potato: {
    optimalSowingMonths: [9, 10, 11],
    optimalHarvestMonths: [1, 2, 3],
    sowingWindowHi: 'अक्टूबर (सर्वोत्तम: 15 से 25 अक्टूबर)',
    sowingWindowEn: 'October (Peak: 15th to 25th October)',
    harvestWindowHi: 'जनवरी से मार्च',
    harvestWindowEn: 'January to March',
    seasonAdvisoryHi: 'आलू के कंद बनने हेतु 15-20°C दिन का और 10-12°C रात का तापमान आदर्श है।',
    seasonAdvisoryEn: 'Tuber formation in potato requires cool night temperatures (10-15°C).',
    offSeasonReasonHi: 'गर्मियों में आलू लगाने पर कंद नहीं बनते और झुलसा रोग से फसल नष्ट हो जाती है।',
    offSeasonReasonEn: 'High temperatures stop tuber initiation and cause severe blight decay.'
  },
  Tomato: {
    optimalSowingMonths: [6, 7, 10, 11, 1, 2],
    optimalHarvestMonths: [9, 10, 1, 2, 4, 5],
    sowingWindowHi: 'शरद: जून-जुलाई | रबी: अक्टूबर-नवंबर | बसंत: जनवरी-फरवरी',
    sowingWindowEn: 'Autumn: Jun-Jul | Rabi: Oct-Nov | Spring: Jan-Feb',
    harvestWindowHi: 'बुवाई के 70-90 दिन बाद निरंतर तुड़ाई',
    harvestWindowEn: 'Continuous picking 70-90 days after transplanting',
    seasonAdvisoryHi: 'टमाटर बहु-सीज़नी सब्जी है। पाला व भारी जलभराव से बचाना आवश्यक है।',
    seasonAdvisoryEn: 'Tomato can be grown across seasons but requires protection from frost and water stagnation.',
    offSeasonReasonHi: 'मई-जून की अत्यधिक गर्मी या दिसंबर के भीषण पाले में खुले खेत में फूल झड़ जाते हैं।',
    offSeasonReasonEn: 'Extreme summer heat (>38°C) or winter frost causes severe flower drop.'
  },
  Soybean: {
    optimalSowingMonths: [6, 7],
    optimalHarvestMonths: [9, 10],
    sowingWindowHi: 'मानसून आगमन पर (15 जून से 15 जुलाई)',
    sowingWindowEn: 'Onset of monsoon (15th June to 15th July)',
    harvestWindowHi: 'सितंबर अंत से अक्टूबर',
    harvestWindowEn: 'Late September to October',
    seasonAdvisoryHi: 'सोयाबीन प्रमुख खरीफ तिलहन व दलहन है। जल निकासी अच्छी होनी चाहिए।',
    seasonAdvisoryEn: 'Soybean is a major Kharif crop requiring moist well-drained soils.',
    offSeasonReasonHi: 'सर्दियों में तापमान 15°C से कम होने पर सोयाबीन का दाना नहीं पकता।',
    offSeasonReasonEn: 'Winter temperatures below 15°C stop pod filling and stunt development.'
  },
  Groundnut: {
    optimalSowingMonths: [5, 6, 7],
    optimalHarvestMonths: [9, 10, 11],
    sowingWindowHi: 'खरीफ: जून - जुलाई | ग्रीष्म: जनवरी - फरवरी',
    sowingWindowEn: 'Kharif: June - July | Summer: January - February',
    harvestWindowHi: 'अक्टूबर से नवंबर',
    harvestWindowEn: 'October to November',
    seasonAdvisoryHi: 'मूंगफली को हल्की बलुई दोमट मिट्टी और पर्याप्त धूप चाहिए ताकि पेग आसानी से जमीन में धंस सकें।',
    seasonAdvisoryEn: 'Groundnut needs light sandy-loam soils and sunshine for optimal peg penetration.',
    offSeasonReasonHi: 'सर्दियों में कड़ाके की ठंड में मूंगफली का अंकुरण नहीं होता।',
    offSeasonReasonEn: 'Cold winter soils inhibit groundnut germination and peg entry.'
  },
  Barley: {
    optimalSowingMonths: [10, 11, 12],
    optimalHarvestMonths: [3, 4],
    sowingWindowHi: 'अक्टूबर अंत से नवंबर (सर्वोत्तम: मध्य नवंबर)',
    sowingWindowEn: 'Late October to November (Peak: Mid-November)',
    harvestWindowHi: 'मार्च से अप्रैल',
    harvestWindowEn: 'March to April',
    seasonAdvisoryHi: 'जौ कम पानी और खारी/कम उपजाऊ जमीन में भी रबी में अच्छी उपज देता है।',
    seasonAdvisoryEn: 'Barley is a drought and salinity tolerant winter cereal for the Rabi season.',
    offSeasonReasonHi: 'गर्मियों में जौ की बुवाई करने पर बालियां नहीं बनतीं।',
    offSeasonReasonEn: 'Heat stress eliminates tillering and heading in barley.'
  },
  Chickpea: {
    optimalSowingMonths: [10, 11],
    optimalHarvestMonths: [3, 4],
    sowingWindowHi: 'अक्टूबर से नवंबर मध्य',
    sowingWindowEn: 'October to mid-November',
    harvestWindowHi: 'मार्च से अप्रैल',
    harvestWindowEn: 'March to April',
    seasonAdvisoryHi: 'चना प्रमुख रबी दलहन है जिसे कम पानी व सूखे मौसम की आवश्यकता होती है।',
    seasonAdvisoryEn: 'Chickpea is a premier Rabi pulse requiring low moisture and dry climate during podding.',
    offSeasonReasonHi: 'मानसून या भारी बारिश में चना बोने पर उकठा (विल्ट) रोग से पूरी फसल सूख जाती है।',
    offSeasonReasonEn: 'Excessive rain and warmth cause severe collar rot and Fusarium wilt.'
  }
};

async function seed() {
  await mongoose.connect('mongodb://127.0.0.1:27017/soilsense_pro_db');
  console.log('Connected to MongoDB');

  for (const [name, calendar] of Object.entries(SEASON_DATA)) {
    const res = await Crop.updateOne(
      { name: new RegExp(`^${name}$`, 'i') },
      { $set: { seasonalCalendar: calendar } }
    );
    console.log(`Updated ${name}: matched ${res.matchedCount}, modified ${res.modifiedCount}`);
  }

  const remainingCrops = await Crop.find({ 'seasonalCalendar.optimalSowingMonths': { $exists: false } });
  for (const crop of remainingCrops) {
    let optimalSowingMonths = [6, 7];
    let optimalHarvestMonths = [10, 11];
    let sowingWindowHi = 'जून - जुलाई (खरीफ)';
    let sowingWindowEn = 'June - July (Kharif)';
    let harvestWindowHi = 'अक्टूबर - नवंबर';
    let harvestWindowEn = 'October - November';

    if (crop.growingSeasons?.includes('Rabi')) {
      optimalSowingMonths = [10, 11, 12];
      optimalHarvestMonths = [3, 4];
      sowingWindowHi = 'अक्टूबर - नवंबर (रबी)';
      sowingWindowEn = 'October - November (Rabi)';
      harvestWindowHi = 'मार्च - अप्रैल';
      harvestWindowEn = 'March - April';
    } else if (crop.growingSeasons?.includes('Zaid')) {
      optimalSowingMonths = [2, 3, 4];
      optimalHarvestMonths = [5, 6];
      sowingWindowHi = 'फरवरी - अप्रैल (जायद)';
      sowingWindowEn = 'February - April (Zaid)';
      harvestWindowHi = 'मई - जून';
      harvestWindowEn = 'May - June';
    }

    await Crop.updateOne(
      { _id: crop._id },
      {
        $set: {
          seasonalCalendar: {
            optimalSowingMonths,
            optimalHarvestMonths,
            sowingWindowHi,
            sowingWindowEn,
            harvestWindowHi,
            harvestWindowEn,
            seasonAdvisoryHi: `${crop.name} की बुवाई उपयुक्त सीज़न में करें।`,
            seasonAdvisoryEn: `Sow ${crop.name} during its recommended seasonal window.`
          }
        }
      }
    );
    console.log(`Defaulted seasonal calendar for ${crop.name}`);
  }

  console.log('Seasonal calendar seeding complete!');
  process.exit(0);
}

seed().catch(e => {
  console.error(e);
  process.exit(1);
});
