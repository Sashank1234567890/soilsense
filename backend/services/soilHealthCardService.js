const crypto = require('crypto');
const SoilHealthCard = require('../models/SoilHealthCard');

function rateParameter(param, value) {
  switch (param) {
    case 'nitrogen':
      if (value < 280) return 'LOW';
      if (value <= 560) return 'MEDIUM';
      return 'HIGH';
    case 'phosphorus':
      if (value < 10) return 'LOW';
      if (value <= 25) return 'MEDIUM';
      return 'HIGH';
    case 'potassium':
      if (value < 120) return 'LOW';
      if (value <= 280) return 'MEDIUM';
      return 'HIGH';
    case 'sulphur':
      if (value < 10) return 'DEFICIENT';
      return 'SUFFICIENT';
    case 'zinc':
      if (value < 0.6) return 'DEFICIENT';
      return 'SUFFICIENT';
    case 'iron':
      if (value < 4.5) return 'DEFICIENT';
      return 'SUFFICIENT';
    case 'pH':
      if (value < 6.5) return 'ACIDIC';
      if (value <= 7.8) return 'OPTIMAL';
      return 'ALKALINE';
    case 'organicCarbon':
      if (value < 0.5) return 'LOW';
      if (value <= 0.75) return 'MEDIUM';
      return 'HIGH';
    default:
      return 'NORMAL';
  }
}

async function generateSoilHealthCard({ farmerName, phone, district = 'Ludhiana', state = 'Punjab', plotId = 'PLOT_001', testData = {} }) {
  const cardId = `SHC-GOI-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;

  const n = testData.nitrogen || 260;
  const p = testData.phosphorus || 22;
  const k = testData.potassium || 195;
  const s = testData.sulphur || 14;
  const zn = testData.zinc || 0.85;
  const fe = testData.iron || 5.2;
  const cu = testData.copper || 0.45;
  const mn = testData.manganese || 3.8;
  const b = testData.boron || 0.62;
  const ph = testData.pH || 7.2;
  const ec = testData.ec || 0.42;
  const oc = testData.organicCarbon || 0.62;

  const hashString = `${cardId}|${farmerName}|${district}|${ph}|${n}|${p}|${k}`;
  const qrVerificationHash = crypto.createHash('sha256').update(hashString).digest('hex').substring(0, 16);

  const card = await SoilHealthCard.create({
    cardId,
    farmerProfile: {
      farmerName: farmerName || 'Sardar Gurpreet Singh',
      phone: phone || '+91 98765 43210',
      district,
      state,
      landHoldingAcre: 2.5,
      preferredLanguage: 'hi'
    },
    plotDetails: {
      plotIdentifier: plotId,
      soilType: 'Indo-Gangetic Alluvial Soil'
    },
    chemicalParameters: {
      nitrogen_kg_ha: { value: n, rating: rateParameter('nitrogen', n) },
      phosphorus_kg_ha: { value: p, rating: rateParameter('phosphorus', p) },
      potassium_kg_ha: { value: k, rating: rateParameter('potassium', k) },
      sulphur_ppm: { value: s, rating: rateParameter('sulphur', s) },
      zinc_ppm: { value: zn, rating: rateParameter('zinc', zn) },
      iron_ppm: { value: fe, rating: rateParameter('iron', fe) },
      copper_ppm: { value: cu, rating: rateParameter('copper', cu) },
      manganese_ppm: { value: mn, rating: rateParameter('manganese', mn) },
      boron_ppm: { value: b, rating: rateParameter('boron', b) },
      pH: { value: ph, rating: rateParameter('pH', ph) },
      electricalConductivity_dS_m: { value: ec, rating: 'NORMAL (< 1.0)' },
      organicCarbonPercent: { value: oc, rating: rateParameter('organicCarbon', oc) }
    },
    overallHealthRating: (n < 280 || oc < 0.5) ? 'MODERATE' : 'GOOD',
    qrVerificationHash
  });

  return card;
}

module.exports = { generateSoilHealthCard };
