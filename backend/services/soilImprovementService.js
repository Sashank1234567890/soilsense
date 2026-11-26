const SoilTest = require('../models/SoilTest');
const Crop = require('../models/Crop');
const SoilImprovementPlan = require('../models/SoilImprovementPlan');
const { evaluateCropAgainstSoil } = require('./cropRecommendationService');

function analyzeParameterIssue(paramName, currentVal, reqRange, isDeficient) {
  let severity = 'Moderate';
  let suggestedAmendments = [];
  let managementAction = '';
  let isPractical = true;

  switch (paramName) {
    case 'pH':
      if (isDeficient) {
        severity = currentVal < 5.0 ? 'Severe' : 'Moderate';
        suggestedAmendments = [
          'Agricultural Ground Limestone (CaCO3) @ 2.5 - 5.0 tons/ha',
          'Dolomitic Limestone (CaMg(CO3)2) if soil is also magnesium-deficient',
          'Well-decomposed Farmyard Manure (FYM) to buffer soil acidity'
        ];
        managementAction = 'Incorporate lime into the top 15 cm of soil at least 4-6 weeks before sowing to allow chemical neutralization.';
        isPractical = true;
      } else {
        severity = currentVal > 8.5 ? 'Severe' : 'Moderate';
        suggestedAmendments = [
          'Agricultural Gypsum (CaSO4 · 2H2O) @ 3.0 - 6.0 tons/ha for sodic soils',
          'Elemental Sulfur @ 500 - 1000 kg/ha',
          'Green manuring with Dhaincha (Sesbania aculeata) to release carbonic acid'
        ];
        managementAction = 'Apply gypsum followed by continuous ponding and flushing of leached sodium salts through field drainage.';
        isPractical = currentVal <= 9.2;
      }
      break;

    case 'Moisture (%)':
      if (isDeficient) {
        severity = currentVal < 25 ? 'Severe' : 'Moderate';
        suggestedAmendments = [
          'Organic mulching (paddy straw, sugarcane trash, or dry leaves @ 5 tons/ha)',
          'Hydrogel / moisture retainer polymers in drought-prone zones',
          'Enrichment with Vermicompost to enhance soil water retention'
        ];
        managementAction = 'Schedule drip irrigation or micro-sprinkler cycles during critical physiological stages (e.g. flowering/tuberization).';
        isPractical = true;
      } else {
        severity = currentVal > 80 ? 'Severe' : 'Moderate';
        suggestedAmendments = [
          'Coarse organic matter / wood chips incorporation',
          'Deep rip subsoiling to break hardpan layers'
        ];
        managementAction = 'Construct Broad Bed and Furrow (BBF) systems or lateral drainage trenches to evacuate stagnant surface water.';
        isPractical = true;
      }
      break;

    case 'Nitrogen (N kg/ha)':
      severity = currentVal < 40 ? 'Severe' : 'Moderate';
      suggestedAmendments = [
        'Neem-coated Urea applied in split doses (50% basal, 25% vegetative, 25% flowering)',
        'Well-rotted Cow Dung / FYM @ 10-12 tons/ha',
        'Biofertilizers: Azotobacter / Azospirillum seed or soil inoculation'
      ];
      managementAction = 'Avoid single heavy urea broadcast on light soils to minimize nitrate leaching into groundwater.';
      isPractical = true;
      break;

    case 'Phosphorus (P kg/ha)':
      severity = currentVal < 25 ? 'Severe' : 'Moderate';
      suggestedAmendments = [
        'Single Super Phosphate (SSP) supplying both P and essential Sulfur (12% S)',
        'Rock Phosphate (for acidic soils)',
        'Phosphate Solubilizing Bacteria (PSB) biofertilizer to solubilize bound native P'
      ];
      managementAction = 'Place phosphatic fertilizers 5 cm below the seed at sowing (basal placement) to maximize root contact.';
      isPractical = true;
      break;

    case 'Potassium (K kg/ha)':
      severity = currentVal < 30 ? 'Severe' : 'Moderate';
      suggestedAmendments = [
        'Muriate of Potash (MOP / KCl - 60% K2O)',
        'Sulfate of Potash (SOP / K2SO4) for chloride-sensitive crops like potato and tomato',
        'Wood ash from farm residues (5-8% K2O)'
      ];
      managementAction = 'Apply K in two splits on sandy/light soils to curb leaching.';
      isPractical = true;
      break;

    default:
      suggestedAmendments = ['Standard balanced NPK and compost application'];
      managementAction = 'Monitor periodically through accredited regional soil testing laboratories.';
      isPractical = true;
  }

  return {
    parameter: paramName,
    currentValue: currentVal,
    targetRange: reqRange,
    severity,
    suggestedAmendments,
    managementAction,
    isPractical
  };
}

async function generateSoilImprovementPlan(soilTestId, targetCropId) {
  const soilTest = await SoilTest.findById(soilTestId);
  if (!soilTest) {
    throw new Error(`Soil test with ID ${soilTestId} not found`);
  }

  let targetCrop = null;
  if (targetCropId) {
    targetCrop = await Crop.findById(targetCropId);
  } else if (soilTest.selectedCropId) {
    targetCrop = await Crop.findById(soilTest.selectedCropId);
  }

  const values = soilTest.values;
  const deficiencies = [];
  const excesses = [];
  let isPractical = true;

  if (targetCrop) {
    const evalResult = evaluateCropAgainstSoil(targetCrop, values, soilTest.parameterSources);

    evalResult.parameterComparisons.forEach(param => {
      if (param.status === 'Deficient') {
        const item = analyzeParameterIssue(param.parameter, param.measuredValue, param.requiredRange, true);
        deficiencies.push(item);
        if (!item.isPractical) isPractical = false;
      } else if (param.status === 'Excessive') {
        const item = analyzeParameterIssue(param.parameter, param.measuredValue, param.requiredRange, false);
        excesses.push(item);
        if (!item.isPractical) isPractical = false;
      }
    });
  } else {

    if (values.pH !== undefined && values.pH !== null) {
      if (values.pH < 6.0) deficiencies.push(analyzeParameterIssue('pH', values.pH, '6.5 - 7.5', true));
      else if (values.pH > 8.2) excesses.push(analyzeParameterIssue('pH', values.pH, '6.5 - 7.5', false));
    }
    if (values.moisture !== undefined && values.moisture !== null) {
      if (values.moisture < 35) deficiencies.push(analyzeParameterIssue('Moisture (%)', values.moisture, '45 - 65', true));
      else if (values.moisture > 75) excesses.push(analyzeParameterIssue('Moisture (%)', values.moisture, '45 - 65', false));
    }
    if (values.nitrogen !== undefined && values.nitrogen < 70) {
      deficiencies.push(analyzeParameterIssue('Nitrogen (N kg/ha)', values.nitrogen, '80 - 140', true));
    }
    if (values.phosphorus !== undefined && values.phosphorus < 30) {
      deficiencies.push(analyzeParameterIssue('Phosphorus (P kg/ha)', values.phosphorus, '40 - 70', true));
    }
    if (values.potassium !== undefined && values.potassium < 30) {
      deficiencies.push(analyzeParameterIssue('Potassium (K kg/ha)', values.potassium, '40 - 80', true));
    }
  }

  const allCrops = await Crop.find({});
  const evaluatedAlternatives = [];
  for (const c of allCrops) {
    if (targetCrop && c._id.toString() === targetCrop._id.toString()) continue;
    const res = evaluateCropAgainstSoil(c, values, soilTest.parameterSources);
    if (res.suitabilityLevel !== 'Not Recommended' && res.suitabilityLevel !== 'Insufficient Data') {
      evaluatedAlternatives.push({
        cropId: c._id,
        cropName: c.name,
        category: c.category,
        suitabilityLevel: res.suitabilityLevel,
        suitabilityScore: res.suitabilityScore,
        reason: res.explanation
      });
    }
  }

  evaluatedAlternatives.sort((a, b) => (b.suitabilityScore || 0) - (a.suitabilityScore || 0));

  let practicalityExplanation = '';
  if (isPractical) {
    practicalityExplanation = deficiencies.length === 0 && excesses.length === 0
      ? 'Current soil parameters are balanced and within standard agronomic ranges. Maintain soil organic matter with regular crop residue recycling.'
      : `Soil improvement is practical and cost-effective within 1-2 crop cycles using standard agricultural amendments (${deficiencies.map(d => d.parameter).join(', ') || 'nutrients'}).`;
  } else {
    practicalityExplanation = `Direct cultivation of ${targetCrop?.name || 'this crop'} requires intensive chemical and structural soil remediation. Sowing alternative crops suited to your current soil conditions is strongly advised for superior return on investment.`;
  }

  const organicRecs = [
    'Apply 10-15 tons/ha of seasoned Farm Yard Manure (FYM) or 3-5 tons/ha of Vermicompost annually.',
    'Retain crop residues and stubbles on the soil surface to enhance microbial organic carbon pools.',
    'Incorporate leguminous green manure crops (Dhaincha or Sunhemp) every 2 years in crop rotation.'
  ];

  const drainageRecs = [
    'Ensure field gradient slope of 0.2% - 0.4% towards drainage ditches to avoid post-monsoon ponding.',
    'Form raised seedbeds or ridges for moisture-sensitive vegetables and tubers.',
    'Maintain farm perimeter contour bunds to check rainwater runoff and topsoil loss.'
  ];

  const fertilizerSchedule = [
    { stage: 'Basal / Field Preparation', fertilizerType: 'SSP + MOP + 50% Neem-Coated Urea', rate: 'As per soil test recommendation', method: 'Band placement 5 cm below seed level', timing: 'At final harrowing' },
    { stage: 'Vegetative Growth Stage', fertilizerType: '25% Nitrogen (Urea) Top Dressing', rate: '30-40 kg/ha', method: 'Broadcasting before irrigation', timing: '25-30 days after sowing' },
    { stage: 'Flowering / Tuberization', fertilizerType: 'Balance Nitrogen + 1% Foliar Micronutrient Spray', rate: 'Foliar spray or soil application', method: 'Spray during cool morning hours', timing: '45-55 days after sowing' }
  ];

  const plan = await SoilImprovementPlan.create({
    soilTestId: soilTest._id,
    targetCropId: targetCrop ? targetCrop._id : null,
    targetCropName: targetCrop ? targetCrop.name : 'General Soil Improvement',
    deficiencies,
    excesses,
    organicMatterRecommendations: organicRecs,
    drainageRecommendations: drainageRecs,
    fertilizerSchedule,
    isImprovementPractical: isPractical,
    practicalityExplanation,
    alternativeCrops: evaluatedAlternatives.slice(0, 4),
    retestingRequirements: 'Re-test soil moisture and pH in 30 days after amendment incorporation. Full chemical nutrient profiling recommended every 2 years.'
  });

  return plan;
}

module.exports = {
  generateSoilImprovementPlan,
  analyzeParameterIssue
};
