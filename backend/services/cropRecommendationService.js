const Crop = require('../models/Crop');
const SoilTest = require('../models/SoilTest');
const CropRecommendation = require('../models/CropRecommendation');

function evaluateParameter(paramName, measuredVal, reqs, weight, source) {
  if (measuredVal === undefined || measuredVal === null || isNaN(measuredVal)) {
    return {
      parameter: paramName,
      measuredValue: 'Not tested',
      requiredRange: `${reqs.optimalMin} - ${reqs.optimalMax}`,
      optimalRange: `${reqs.optimalMin} - ${reqs.optimalMax}`,
      status: 'Missing',
      deviationPercentage: 0,
      parameterWeight: weight,
      score: 0,
      isTested: false,
      source: source || 'missing'
    };
  }

  const { min, max, optimalMin, optimalMax } = reqs;
  let status = 'Optimal';
  let deviation = 0;
  let paramScore = 100;

  if (measuredVal >= optimalMin && measuredVal <= optimalMax) {
    status = 'Optimal';
    paramScore = 100;
  } else if (measuredVal >= min && measuredVal <= max) {
    status = 'Acceptable';
    if (measuredVal < optimalMin) {
      deviation = Math.round(((optimalMin - measuredVal) / (optimalMin - min || 1)) * 30);
      paramScore = 85 - deviation;
    } else {
      deviation = Math.round(((measuredVal - optimalMax) / (max - optimalMax || 1)) * 30);
      paramScore = 85 - deviation;
    }
  } else if (measuredVal < min) {
    status = 'Deficient';
    const under = min - measuredVal;
    deviation = Math.round((under / (min || 1)) * 100);
    paramScore = Math.max(10, 50 - Math.min(deviation, 40));
  } else {
    status = 'Excessive';
    const over = measuredVal - max;
    deviation = Math.round((over / (max || 1)) * 100);
    paramScore = Math.max(10, 50 - Math.min(deviation, 40));
  }

  return {
    parameter: paramName,
    measuredValue: measuredVal,
    requiredRange: `${min} - ${max} (Optimal: ${optimalMin} - ${optimalMax})`,
    optimalRange: `${optimalMin} - ${optimalMax}`,
    status,
    deviationPercentage: deviation,
    parameterWeight: weight,
    score: Math.max(0, Math.min(100, Math.round(paramScore))),
    isTested: true,
    source: source || 'measured'
  };
}

function evaluateCropAgainstSoil(crop, testValues, paramSources) {
  const req = crop.idealRequirements;
  const weights = crop.parameterWeights || {
    pH: 0.20,
    moisture: 0.25,
    temperature: 0.15,
    nitrogen: 0.15,
    phosphorus: 0.10,
    potassium: 0.05,
    texture: 0.05,
    drainage: 0.05
  };

  const comparisons = [];
  const matching = [];
  const deficient = [];
  const excessive = [];
  const missing = [];
  const suggestions = [];

  const phRes = evaluateParameter('pH', testValues.pH, req.pH, weights.pH, paramSources?.pH);
  comparisons.push(phRes);

  const moistRes = evaluateParameter('Moisture (%)', testValues.moisture, req.moisture, weights.moisture, paramSources?.moisture);
  comparisons.push(moistRes);

  const tempRes = evaluateParameter('Temperature (°C)', testValues.temperature, req.temperature, weights.temperature, paramSources?.temperature);
  comparisons.push(tempRes);

  const nRes = evaluateParameter('Nitrogen (N kg/ha)', testValues.nitrogen, req.nitrogen, weights.nitrogen, paramSources?.nitrogen);
  comparisons.push(nRes);

  const pRes = evaluateParameter('Phosphorus (P kg/ha)', testValues.phosphorus, req.phosphorus, weights.phosphorus, paramSources?.phosphorus);
  comparisons.push(pRes);

  const kRes = evaluateParameter('Potassium (K kg/ha)', testValues.potassium, req.potassium, weights.potassium, paramSources?.potassium);
  comparisons.push(kRes);

  if (testValues.texture) {
    const isTextureMatch = req.texture && req.texture.some(t =>
      t.toLowerCase().includes(testValues.texture.toLowerCase()) ||
      testValues.texture.toLowerCase().includes(t.toLowerCase())
    );
    comparisons.push({
      parameter: 'Soil Texture',
      measuredValue: testValues.texture,
      requiredRange: req.texture ? req.texture.join(', ') : 'Any friable arable soil',
      optimalRange: req.texture ? req.texture[0] : 'Loam',
      status: isTextureMatch ? 'Optimal' : 'Acceptable',
      deviationPercentage: isTextureMatch ? 0 : 25,
      parameterWeight: weights.texture || 0.05,
      score: isTextureMatch ? 100 : 65,
      isTested: true,
      source: paramSources?.texture || 'user_provided'
    });
  }

  let testedWeightsSum = 0;
  let weightedScoreSum = 0;
  let testedCount = 0;

  for (const c of comparisons) {
    if (c.status === 'Missing') {
      missing.push(c.parameter);
    } else {
      testedCount++;
      testedWeightsSum += c.parameterWeight;
      weightedScoreSum += c.score * c.parameterWeight;

      if (c.status === 'Optimal' || c.status === 'Acceptable') {
        matching.push(c.parameter);
      } else if (c.status === 'Deficient') {
        deficient.push(c.parameter);
        suggestions.push(`Supplement ${c.parameter} to reach optimal range (${c.optimalRange}).`);
      } else if (c.status === 'Excessive') {
        excessive.push(c.parameter);
        suggestions.push(`Mitigate excess ${c.parameter} (currently higher than maximum recommended ${c.requiredRange}).`);
      }
    }
  }

  const isDataSufficient = (testValues.moisture !== null && testValues.moisture !== undefined) &&
                           (testedCount >= 3 || (testedCount >= 2 && testValues.pH !== null && testValues.pH !== undefined));

  let finalScore = null;
  let suitabilityLevel = 'Insufficient Data';

  if (isDataSufficient && testedWeightsSum > 0) {
    finalScore = Math.round(weightedScoreSum / testedWeightsSum);

    if (deficient.includes('Moisture (%)') && testValues.moisture < (req.moisture.min - 15)) {
      finalScore = Math.min(finalScore, 45);
    }
    if (deficient.includes('pH') && testValues.pH < 5.0 && req.pH.min >= 6.0) {
      finalScore = Math.min(finalScore, 48);
    }

    if (finalScore >= 85) {
      suitabilityLevel = 'Highly Suitable';
    } else if (finalScore >= 70) {
      suitabilityLevel = 'Suitable';
    } else if (finalScore >= 50) {
      suitabilityLevel = 'Suitable with Improvements';
    } else {
      suitabilityLevel = 'Not Recommended';
    }
  }

  let explanation = '';
  if (!isDataSufficient) {
    explanation = `Insufficient laboratory or sensor data for a complete suitability evaluation. Only ${testedCount} parameter(s) tested. Missing: ${missing.join(', ')}. Comprehensive testing (pH and NPK) is required before final crop selection.`;
  } else if (suitabilityLevel === 'Highly Suitable') {
    explanation = `${crop.name} matches your soil environment exceptionally well (${finalScore}/100). Moisture (${testValues.moisture}%) and key tested parameters align with optimal physiological requirements.`;
  } else if (suitabilityLevel === 'Suitable') {
    explanation = `${crop.name} is well-suited (${finalScore}/100) under standard management. Minor adjustments to ${deficient.join(', ') || 'nutrients'} will maximize potential harvest yield.`;
  } else if (suitabilityLevel === 'Suitable with Improvements') {
    explanation = `${crop.name} can be cultivated with targeted soil amendments (${finalScore}/100). Key limiting factors: ${[...deficient, ...excessive].join(', ')}. Review the soil improvement plan prior to sowing.`;
  } else {
    explanation = `${crop.name} is currently Not Recommended (${finalScore}/100). Significant soil parameter divergence in ${[...deficient, ...excessive].join(', ')} creates agronomic risk and potential yield loss. Consider recommended alternative crops.`;
  }

  return {
    cropId: crop._id,
    cropName: crop.name,
    scientificName: crop.scientificName,
    category: crop.category,
    image: crop.image,
    suitabilityLevel,
    suitabilityScore: finalScore,
    parameterComparisons: comparisons,
    matchingParameters: matching,
    deficientParameters: deficient,
    excessiveParameters: excessive,
    missingParameters: missing,
    explanation,
    improvementSuggestions: suggestions,
    growingSeason: crop.growingSeasons,
    verifiedRegions: crop.suitableRegions
  };
}

async function evaluateCropSpecific(soilTestId, cropId) {
  const soilTest = await SoilTest.findById(soilTestId);
  if (!soilTest) {
    throw new Error(`Soil test with ID ${soilTestId} not found`);
  }

  const crop = await Crop.findById(cropId);
  if (!crop) {
    throw new Error(`Crop with ID ${cropId} not found`);
  }

  const evaluation = evaluateCropAgainstSoil(crop, soilTest.values, soilTest.parameterSources);

  const testedCount = 7 - evaluation.missingParameters.length;
  const completenessPercent = Math.round((testedCount / 7) * 100);
  const isSufficient = evaluation.suitabilityLevel !== 'Insufficient Data';

  let overallSuitability = 'Moderately Suitable';
  if (evaluation.suitabilityLevel === 'Highly Suitable') overallSuitability = 'Suitable';
  else if (evaluation.suitabilityLevel === 'Suitable') overallSuitability = 'Suitable';
  else if (evaluation.suitabilityLevel === 'Suitable with Improvements') overallSuitability = 'Moderately Suitable';
  else if (evaluation.suitabilityLevel === 'Not Recommended') overallSuitability = 'Not Suitable';
  else overallSuitability = 'Insufficient Data';

  const recommendation = await CropRecommendation.create({
    soilTestId: soilTest._id,
    selectedCropId: crop._id,
    evaluationType: 'crop_specific',
    dataCompletenessPercent: completenessPercent,
    isDataSufficient: isSufficient,
    overallSuitability,
    suitabilityScore: evaluation.suitabilityScore,
    recommendations: [evaluation]
  });

  soilTest.selectedCropId = crop._id;
  soilTest.selectedCropName = crop.name;
  await soilTest.save();

  return recommendation;
}

async function evaluateAllCrops(soilTestId) {
  const soilTest = await SoilTest.findById(soilTestId);
  if (!soilTest) {
    throw new Error(`Soil test with ID ${soilTestId} not found`);
  }

  const allCrops = await Crop.find({});
  const evaluations = allCrops.map(crop =>
    evaluateCropAgainstSoil(crop, soilTest.values, soilTest.parameterSources)
  );

  evaluations.sort((a, b) => {
    if (a.suitabilityScore === null) return 1;
    if (b.suitabilityScore === null) return -1;
    return b.suitabilityScore - a.suitabilityScore;
  });

  const missingParams = evaluations[0]?.missingParameters || [];
  const completenessPercent = Math.round(((7 - missingParams.length) / 7) * 100);
  const isSufficient = evaluations.some(e => e.suitabilityLevel !== 'Insufficient Data');

  const topScore = evaluations[0]?.suitabilityScore || 0;
  let overall = 'Moderately Suitable';
  if (topScore >= 80) overall = 'Suitable';
  else if (topScore < 50) overall = 'Not Suitable';

  const recommendation = await CropRecommendation.create({
    soilTestId: soilTest._id,
    evaluationType: 'all_crops',
    dataCompletenessPercent: completenessPercent,
    isDataSufficient: isSufficient,
    overallSuitability: isSufficient ? overall : 'Insufficient Data',
    suitabilityScore: topScore || null,
    recommendations: evaluations
  });

  return recommendation;
}

module.exports = {
  evaluateCropAgainstSoil,
  evaluateCropSpecific,
  evaluateAllCrops
};
